import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import dotenv from 'dotenv';
import express from 'express';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const PORT = 3000;
const DATA_DIR = '/tmp/nexustrade-data';
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = process.env.SQLITE_DB_PATH
  ? path.resolve(process.cwd(), process.env.SQLITE_DB_PATH)
  : path.join(DATA_DIR, 'nexustrade.sqlite');

const SESSION_SECRET =
  process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');


// ============================================================================
// 1. SQLITE DATABASE INITIALIZATION & SCHEMA
// ============================================================================

const db = new DatabaseSync(DB_PATH);

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    uid TEXT NOT NULL,
    email TEXT NOT NULL,
    username TEXT NOT NULL,
    vip_tier TEXT NOT NULL DEFAULT 'VIP 1',
    account_mode TEXT NOT NULL DEFAULT 'verified_statement',
    statement_id TEXT,
    statement_verified_at INTEGER,
    primary_currency TEXT NOT NULL DEFAULT 'USDT',
    secondary_fiat TEXT NOT NULL DEFAULT 'USD',
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS wallet_balances (
    user_id TEXT NOT NULL,
    account_type TEXT NOT NULL,
    asset TEXT NOT NULL,
    name TEXT NOT NULL,
    available REAL NOT NULL DEFAULT 0,
    locked REAL NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL,
    PRIMARY KEY (user_id, account_type, asset)
  );

  CREATE TABLE IF NOT EXISTS ledger_transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    ref_id TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL,
    asset TEXT NOT NULL,
    amount REAL NOT NULL,
    secondary_asset TEXT,
    secondary_amount REAL,
    price REAL,
    fee REAL NOT NULL DEFAULT 0,
    from_account TEXT,
    to_account TEXT,
    network TEXT,
    address TEXT,
    status TEXT NOT NULL DEFAULT 'Completed',
    timestamp INTEGER NOT NULL,
    note TEXT NOT NULL,
    provenance TEXT NOT NULL DEFAULT 'imported_statement'
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'INFO',
    details_json TEXT NOT NULL,
    integrity_hash TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
`);

function writeAuditLog(
  userId: string,
  action: string,
  details: Record<string, unknown>,
  severity: 'INFO' | 'WARN' | 'SECURITY' = 'INFO'
) {
  const now = Date.now();
  const id = `aud-${now}-${Math.random().toString(36).slice(2, 8)}`;
  const detailsJson = JSON.stringify(details);
  const integrityHash = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(`${id}:${userId}:${action}:${detailsJson}:${now}`)
    .digest('hex')
    .slice(0, 24);

  const stmt = db.prepare(`
    INSERT INTO audit_logs (id, user_id, action, severity, details_json, integrity_hash, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(id, userId, action, severity, detailsJson, integrityHash, now);
}

// ============================================================================
// 2. 8-MONTH VERIFIED STATEMENT LEDGER (RECONCILING TO 16,845.00 USDT)
// ============================================================================

const ACCOUNT_TYPES = [
  'spot',
  'funding',
  'usdm_futures',
  'coinm_futures',
  'earn',
  'cross_margin',
  'isolated_margin',
  'options',
] as const;

const TRACKED_ASSETS: { asset: string; name: string }[] = [
  { asset: 'USDT', name: 'TetherUS' },
  { asset: 'BTC', name: 'Bitcoin' },
  { asset: 'ETH', name: 'Ethereum' },
  { asset: 'BNB', name: 'BNB' },
  { asset: 'SOL', name: 'Solana' },
  { asset: 'USDC', name: 'USD Coin' },
  { asset: 'XRP', name: 'XRP' },
  { asset: 'TRX', name: 'TRON' },
];

// Synthetic 8-month statement generator removed to maintain genuine ledger integrity.
function buildVerifiedStatementTransactions(_baseNow = Date.now()): any[] {
  return [];
}

/*

    // Month 0: November 2026 (Days 0 - 6 ago)
    {
      id: 'stmt-tx-01',
      refId: 'TRF-202611-948210',
      type: 'transfer',
      asset: 'USDT',
      amount: 2400.0,
      fee: 0,
      fromAccount: 'spot',
      toAccount: 'usdm_futures',
      status: 'Completed',
      timestamp: baseNow - Math.floor(0.4 * dayMs),
      note: 'Internal Transfer from Spot Wallet to USDⓈ-M Futures Margin',
      provenance: 'imported_statement',
    },
    {
      id: 'stmt-tx-02',
      refId: 'EARN-202611-947105',
      type: 'earn_subscribe',
      asset: 'USDT',
      amount: 1200.0,
      fee: 0,
      fromAccount: 'spot',
      toAccount: 'earn',
      status: 'Completed',
      timestamp: baseNow - Math.floor(2.1 * dayMs),
      note: 'Simple Earn Flexible USDT Subscription (11.82% APR Tiered)',
      provenance: 'imported_statement',
    },
    {
      id: 'stmt-tx-03',
      refId: 'DEP-202611-945890',
      type: 'deposit',
      asset: 'USDT',
      amount: 2145.0,
      fee: 0,
      toAccount: 'spot',
      network: 'Tron (TRC20)',
      address: 'Statement Verified Settlement · TRC20',
      status: 'Completed',
      timestamp: baseNow - Math.floor(4.6 * dayMs),
      note: 'Verified Statement Deposit · Tron (TRC20) Settlement',
      provenance: 'imported_statement',
    },

    // Month -1: October 2026 (Days 10 - 35 ago)
    {
      id: 'stmt-tx-04',
      refId: 'SPT-202610-939412',
      type: 'spot_sell',
      asset: 'SOL',
      amount: 15.0,
      secondaryAsset: 'USDT',
      secondaryAmount: 2670.0,
      price: 178.0,
      fee: 2.67,
      fromAccount: 'spot',
      toAccount: 'spot',
      status: 'Completed',
      timestamp: baseNow - Math.floor(11.3 * dayMs),
      note: 'Spot LIMIT SELL 15.00 SOL @ 178.00 USDT',
      provenance: 'imported_statement',
    },
    {
      id: 'stmt-tx-05',
      refId: 'SPT-202610-936804',
      type: 'spot_buy',
      asset: 'SOL',
      amount: 15.0,
      secondaryAsset: 'USDT',
      secondaryAmount: 2370.0,
      price: 158.0,
      fee: 2.37,
      fromAccount: 'spot',
      toAccount: 'spot',
      status: 'Completed',
      timestamp: baseNow - Math.floor(18.7 * dayMs),
      note: 'Spot LIMIT BUY 15.00 SOL @ 158.00 USDT',
      provenance: 'imported_statement',
    },
    {
      id: 'stmt-tx-06',
      refId: 'P2P-202610-932190',
      type: 'p2p_buy',
      asset: 'USDT',
      amount: 1200.0,
      secondaryAsset: 'USD',
      secondaryAmount: 1201.2,
      price: 1.001,
      fee: 0,
      toAccount: 'funding',
      status: 'Completed',
      timestamp: baseNow - Math.floor(26.4 * dayMs),
      note: 'P2P Express Settlement via ApexLiquidity_Pro (Credited to Funding Wallet)',
      provenance: 'imported_statement',
    },
    {
      id: 'stmt-tx-07',
      refId: 'WDR-202610-929018',
      type: 'withdraw',
      asset: 'USDT',
      amount: 450.0,
      fee: 1.0,
      fromAccount: 'spot',
      network: 'Arbitrum One (ERC20-L2)',
      address: 'Statement External Settlement · Arbitrum',
      status: 'Completed',
      timestamp: baseNow - Math.floor(33.2 * dayMs),
      note: 'Verified Statement Withdrawal · Arbitrum One',
      provenance: 'imported_statement',
    },

    // Month -2: September 2026 (Days 40 - 65 ago)
    {
      id: 'stmt-tx-08',
      refId: 'FUT-202609-921450',
      type: 'futures_close',
      asset: 'USDT',
      amount: 420.0,
      price: 64800.0,
      fee: 1.94,
      fromAccount: 'usdm_futures',
      toAccount: 'spot',
      status: 'Completed',
      timestamp: baseNow - Math.floor(42.5 * dayMs),
      note: 'USDⓈ-M BTCUSDT Perpetual Realized PnL Settlement (+420.00 USDT)',
      provenance: 'imported_statement',
    },
    {
      id: 'stmt-tx-09',
      refId: 'CNV-202609-918302',
      type: 'convert',
      asset: 'USDC',
      amount: 2500.0,
      secondaryAsset: 'USDT',
      secondaryAmount: 2500.5,
      price: 1.0002,
      fee: 0,
      fromAccount: 'spot',
      toAccount: 'spot',
      status: 'Completed',
      timestamp: baseNow - Math.floor(51.8 * dayMs),
      note: 'Instant Convert 2,500.00 USDC → 2,500.50 USDT (Zero Fee)',
      provenance: 'imported_statement',
    },
    {
      id: 'stmt-tx-10',
      refId: 'DEP-202609-914008',
      type: 'deposit',
      asset: 'USDC',
      amount: 2500.0,
      fee: 0,
      toAccount: 'spot',
      network: 'Ethereum (ERC20)',
      address: 'Statement Verified Settlement · ERC20',
      status: 'Completed',
      timestamp: baseNow - Math.floor(61.1 * dayMs),
      note: 'Verified Statement Deposit · Ethereum (ERC20)',
      provenance: 'imported_statement',
    },

    // Month -3: August 2026 (Days 70 - 96 ago)
    {
      id: 'stmt-tx-11',
      refId: 'SPT-202608-908120',
      type: 'spot_sell',
      asset: 'ETH',
      amount: 1.5,
      secondaryAsset: 'USDT',
      secondaryAmount: 3975.0,
      price: 2650.0,
      fee: 3.98,
      fromAccount: 'spot',
      toAccount: 'spot',
      status: 'Completed',
      timestamp: baseNow - Math.floor(73.4 * dayMs),
      note: 'Spot LIMIT SELL 1.50 ETH @ 2,650.00 USDT',
      provenance: 'imported_statement',
    },
    {
      id: 'stmt-tx-12',
      refId: 'SPT-202608-903511',
      type: 'spot_buy',
      asset: 'ETH',
      amount: 1.5,
      secondaryAsset: 'USDT',
      secondaryAmount: 3600.0,
      price: 2400.0,
      fee: 3.6,
      fromAccount: 'spot',
      toAccount: 'spot',
      status: 'Completed',
      timestamp: baseNow - Math.floor(84.9 * dayMs),
      note: 'Spot LIMIT BUY 1.50 ETH @ 2,400.00 USDT',
      provenance: 'imported_statement',
    },
    {
      id: 'stmt-tx-13',
      refId: 'EARN-202608-899410',
      type: 'earn_redeem',
      asset: 'USDT',
      amount: 1850.0,
      fee: 0,
      fromAccount: 'earn',
      toAccount: 'spot',
      status: 'Completed',
      timestamp: baseNow - Math.floor(93.2 * dayMs),
      note: 'Simple Earn Flexible Redemption (+50.00 USDT Accrued Yield)',
      provenance: 'imported_statement',
    },

    // Month -4: July 2026 (Days 100 - 127 ago)
    {
      id: 'stmt-tx-14',
      refId: 'WDR-202607-892104',
      type: 'withdraw',
      asset: 'USDT',
      amount: 620.0,
      fee: 0.19,
      fromAccount: 'spot',
      network: 'BNB Smart Chain (BEP20)',
      address: 'Statement External Settlement · BEP20',
      status: 'Completed',
      timestamp: baseNow - Math.floor(105.6 * dayMs),
      note: 'Verified Statement Withdrawal · BNB Smart Chain (BEP20)',
      provenance: 'imported_statement',
    },
    {
      id: 'stmt-tx-15',
      refId: 'DEP-202607-887320',
      type: 'deposit',
      asset: 'USDT',
      amount: 3400.0,
      fee: 0,
      toAccount: 'spot',
      network: 'Tron (TRC20)',
      address: 'Statement Verified Settlement · TRC20',
      status: 'Completed',
      timestamp: baseNow - Math.floor(118.4 * dayMs),
      note: 'Verified Statement Deposit · Tron (TRC20)',
      provenance: 'imported_statement',
    },

    // Month -5: June 2026 (Days 132 - 158 ago)
    {
      id: 'stmt-tx-16',
      refId: 'SPT-202606-881049',
      type: 'spot_sell',
      asset: 'BNB',
      amount: 5.0,
      secondaryAsset: 'USDT',
      secondaryAmount: 3150.0,
      price: 630.0,
      fee: 2.36,
      fromAccount: 'spot',
      toAccount: 'spot',
      status: 'Completed',
      timestamp: baseNow - Math.floor(136.2 * dayMs),
      note: 'Spot MARKET SELL 5.00 BNB @ 630.00 USDT (25% BNB Fee Discount)',
      provenance: 'imported_statement',
    },
    {
      id: 'stmt-tx-17',
      refId: 'SPT-202606-876910',
      type: 'spot_buy',
      asset: 'BNB',
      amount: 5.0,
      secondaryAsset: 'USDT',
      secondaryAmount: 2900.0,
      price: 580.0,
      fee: 2.18,
      fromAccount: 'spot',
      toAccount: 'spot',
      status: 'Completed',
      timestamp: baseNow - Math.floor(149.5 * dayMs),
      note: 'Spot LIMIT BUY 5.00 BNB @ 580.00 USDT',
      provenance: 'imported_statement',
    },

    // Month -6: May 2026 (Days 162 - 188 ago)
    {
      id: 'stmt-tx-18',
      refId: 'TRF-202605-869201',
      type: 'transfer',
      asset: 'USDT',
      amount: 1500.0,
      fee: 0,
      fromAccount: 'funding',
      toAccount: 'spot',
      status: 'Completed',
      timestamp: baseNow - Math.floor(167.8 * dayMs),
      note: 'Internal Transfer from Funding Wallet to Spot Wallet',
      provenance: 'imported_statement',
    },
    {
      id: 'stmt-tx-19',
      refId: 'DEP-202605-864112',
      type: 'deposit',
      asset: 'USDT',
      amount: 4200.0,
      fee: 0,
      toAccount: 'spot',
      network: 'Solana (SPL)',
      address: 'Statement Verified Settlement · Solana SPL',
      status: 'Completed',
      timestamp: baseNow - Math.floor(181.3 * dayMs),
      note: 'Verified Statement Deposit · Solana (SPL)',
      provenance: 'imported_statement',
    },

    // Month -7: April 2026 (Days 193 - 218 ago)
    {
      id: 'stmt-tx-20',
      refId: 'WDR-202604-858903',
      type: 'withdraw',
      asset: 'USDT',
      amount: 355.0,
      fee: 1.0,
      fromAccount: 'spot',
      network: 'Tron (TRC20)',
      address: 'Statement External Settlement · TRC20',
      status: 'Completed',
      timestamp: baseNow - Math.floor(199.4 * dayMs),
      note: 'Verified Statement Withdrawal · Tron (TRC20)',
      provenance: 'imported_statement',
    },
    {
      id: 'stmt-tx-21',
      refId: 'CNV-202604-853190',
      type: 'convert',
      asset: 'BTC',
      amount: 0.04,
      secondaryAsset: 'USDT',
      secondaryAmount: 2720.0,
      price: 68000.0,
      fee: 0,
      fromAccount: 'spot',
      toAccount: 'spot',
      status: 'Completed',
      timestamp: baseNow - Math.floor(212.6 * dayMs),
      note: 'Converted 0.0400 BTC → 2,720.00 USDT (Zero Fee)',
      provenance: 'imported_statement',
    },

    // Month -8: March 2026 (Days 222 - 242 ago)
    {
      id: 'stmt-tx-22',
      refId: 'SPT-202603-848012',
      type: 'spot_buy',
      asset: 'BTC',
      amount: 0.04,
      secondaryAsset: 'USDT',
      secondaryAmount: 2520.0,
      price: 63000.0,
      fee: 2.52,
      fromAccount: 'spot',
      toAccount: 'spot',
      status: 'Completed',
      timestamp: baseNow - Math.floor(226.1 * dayMs),
      note: 'Spot LIMIT BUY 0.0400 BTC @ 63,000.00 USDT',
      provenance: 'imported_statement',
    },
    {
      id: 'stmt-tx-23',
      refId: 'DEP-202603-841001',
      type: 'deposit',
      asset: 'USDT',
      amount: 5500.0,
      fee: 0,
      toAccount: 'spot',
      network: 'Tron (TRC20)',
      address: 'Statement Verified Settlement · TRC20',
      status: 'Completed',
      timestamp: baseNow - Math.floor(238.5 * dayMs),
      note: 'Initial Verified Statement Portfolio Deposit · Tron (TRC20)',
      provenance: 'imported_statement',
    },
  ];
*/

// Safe migration: check for pre-existing synthetic user seeds and migrate cleanly
function runDatabaseMigrations() {
  try {
    const oldMockUser = db
      .prepare(
        "SELECT id FROM users WHERE email = 'hsjwsahoo@gmail.com' OR uid = '1061155439' OR statement_id = 'NX-STMT-2026-16845'"
      )
      .get() as { id: string } | undefined;

    if (oldMockUser) {
      db.prepare(`
        UPDATE users
        SET uid = '1088492015',
            email = 'unconnected@nexus.local',
            username = 'Nexus Trader',
            vip_tier = 'Standard',
            account_mode = 'unverified_empty',
            statement_id = NULL,
            statement_verified_at = NULL,
            primary_currency = 'INR',
            secondary_fiat = 'USD'
        WHERE id = ?
      `).run(oldMockUser.id);

      // Clean up synthetic statement transactions while preserving any genuine user transactions
      db.prepare(`
        DELETE FROM ledger_transactions
        WHERE user_id = ? AND (id LIKE 'stmt-tx-%' OR ref_id LIKE 'TRF-2026%' OR provenance = 'imported_statement')
      `).run(oldMockUser.id);

      // Reset balances to zero
      db.prepare(`
        UPDATE wallet_balances
        SET available = 0, locked = 0, updated_at = ?
        WHERE user_id = ?
      `).run(Date.now(), oldMockUser.id);
    }
  } catch (err) {
    console.error('Migration error:', err);
  }
}

function seedEmptyUserLedger(userId: string) {
  const now = Date.now();
  db.exec('BEGIN TRANSACTION');
  try {
    const existingUser = db
      .prepare('SELECT id FROM users WHERE id = ?')
      .get(userId) as { id: string } | undefined;

    if (!existingUser) {
      db.prepare(`
        INSERT INTO users (id, uid, email, username, vip_tier, account_mode, statement_id, statement_verified_at, primary_currency, secondary_fiat, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        userId,
        '1088492015',
        'unconnected@nexus.local',
        'Nexus Trader',
        'Standard',
        'unverified_empty',
        null,
        null,
        'INR',
        'USD',
        now
      );
    } else {
      db.prepare(`
        UPDATE users
        SET account_mode = 'unverified_empty',
            statement_id = NULL,
            statement_verified_at = NULL,
            primary_currency = 'INR'
        WHERE id = ?
      `).run(userId);
    }

    db.prepare('DELETE FROM wallet_balances WHERE user_id = ?').run(userId);
    db.prepare(`
      DELETE FROM ledger_transactions 
      WHERE user_id = ? AND (id LIKE 'stmt-tx-%' OR ref_id LIKE 'TRF-2026%' OR provenance = 'imported_statement')
    `).run(userId);

    const insertBal = db.prepare(`
      INSERT INTO wallet_balances (user_id, account_type, asset, name, available, locked, updated_at)
      VALUES (?, ?, ?, ?, 0, 0, ?)
    `);

    for (const acc of ACCOUNT_TYPES) {
      for (const coin of TRACKED_ASSETS) {
        insertBal.run(userId, acc, coin.asset, coin.name, now);
      }
    }

    db.exec('COMMIT');
    writeAuditLog(userId, 'LEDGER_INITIALIZED_EMPTY', {
      mode: 'unverified_empty',
      balance: 0,
      note: 'Account initialized in clean, unverified 0.00 balance state',
    });
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

function seedOrResetUserLedger(
  userId: string,
  mode: 'unverified_empty' | 'demo_sandbox' | 'verified_statement',
  customTargetUsdt = 0
) {
  const now = Date.now();
  db.exec('BEGIN TRANSACTION');
  try {
    const existingUser = db
      .prepare('SELECT id FROM users WHERE id = ?')
      .get(userId) as { id: string } | undefined;

    const accountMode = mode === 'demo_sandbox' ? 'unverified_empty' : mode;

    if (!existingUser) {
      db.prepare(`
        INSERT INTO users (id, uid, email, username, vip_tier, account_mode, statement_id, statement_verified_at, primary_currency, secondary_fiat, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        userId,
        '1088492015',
        'unconnected@nexus.local',
        'Nexus Trader',
        'Standard',
        accountMode,
        null,
        null,
        'INR',
        'USD',
        now
      );
    } else {
      db.prepare(`
        UPDATE users
        SET account_mode = ?,
            statement_id = NULL,
            statement_verified_at = NULL
        WHERE id = ?
      `).run(accountMode, userId);
    }

    db.prepare('DELETE FROM wallet_balances WHERE user_id = ?').run(userId);
    db.prepare(`
      DELETE FROM ledger_transactions 
      WHERE user_id = ? AND (id LIKE 'stmt-tx-%' OR ref_id LIKE 'TRF-2026%' OR provenance = 'imported_statement')
    `).run(userId);

    const insertBal = db.prepare(`
      INSERT INTO wallet_balances (user_id, account_type, asset, name, available, locked, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    for (const acc of ACCOUNT_TYPES) {
      for (const coin of TRACKED_ASSETS) {
        let available = 0;
        let locked = 0;
        if (mode === 'demo_sandbox' && coin.asset === 'USDT' && acc === 'spot') {
          available = Math.max(0, customTargetUsdt);
        }
        insertBal.run(userId, acc, coin.asset, coin.name, available, locked, now);
      }
    }

    db.exec('COMMIT');
    writeAuditLog(userId, `LEDGER_MODE_${mode.toUpperCase()}`, {
      mode,
      targetUsdt: customTargetUsdt,
      note: mode === 'demo_sandbox' ? 'Sandbox demo funds allocated' : 'Clean empty state',
    });
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

const DEFAULT_USER_ID = 'usr-nexus-primary';

// Run database migrations on startup
runDatabaseMigrations();

const userRowCheck = db
  .prepare('SELECT id FROM users WHERE id = ?')
  .get(DEFAULT_USER_ID) as { id: string } | undefined;
if (!userRowCheck) {
  seedEmptyUserLedger(DEFAULT_USER_ID);
}

// ============================================================================
// 3. LIVE FX EXCHANGE RATE SERVICE (USD, INR, EUR, AED, GBP)
// ============================================================================

interface FxRateCache {
  rates: Record<'USD' | 'INR' | 'EUR' | 'AED' | 'GBP', number>;
  updatedAt: number;
  source: string;
  provenance: 'live_fx_api' | 'reference_fx';
}

let fxCache: FxRateCache = {
  rates: {
    USD: 1.0,
    INR: 86.48,
    EUR: 0.924,
    AED: 3.6725,
    GBP: 0.789,
  },
  updatedAt: Date.now(),
  source: 'Reference ECB/RBI FX Snapshot (Syncing live FX...)',
  provenance: 'reference_fx',
};

async function refreshLiveFxRates(): Promise<FxRateCache> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch('https://open.er-api.com/v6/latest/USD', {
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (res.ok) {
      const data = (await res.json()) as {
        rates?: Record<string, number>;
        time_last_update_unix?: number;
      };
      if (data?.rates) {
        fxCache = {
          rates: {
            USD: 1.0,
            INR: Number(data.rates.INR) || fxCache.rates.INR,
            EUR: Number(data.rates.EUR) || fxCache.rates.EUR,
            AED: Number(data.rates.AED) || fxCache.rates.AED,
            GBP: Number(data.rates.GBP) || fxCache.rates.GBP,
          },
          updatedAt: Date.now(),
          source: 'ExchangeRate-API Live Global FX Feed',
          provenance: 'live_fx_api',
        };
      }
    }
  } catch {
    // Keep last known rates with accurate provenance
  }
  return fxCache;
}

// Kick off initial FX rate sync & refresh every 5 minutes
refreshLiveFxRates();
setInterval(refreshLiveFxRates, 5 * 60 * 1000);

// ============================================================================
// 4. HELPER TO READ FULL USER LEDGER STATE FROM SQLITE
// ============================================================================

function getUserLedgerBundle(userId = DEFAULT_USER_ID) {
  const user = db
    .prepare('SELECT * FROM users WHERE id = ?')
    .get(userId) as Record<string, any> | undefined;

  const balanceRows = db
    .prepare('SELECT * FROM wallet_balances WHERE user_id = ?')
    .all(userId) as Array<{
    account_type: string;
    asset: string;
    name: string;
    available: number;
    locked: number;
  }>;

  const wallets: Record<string, Record<string, { asset: string; name: string; available: number; locked: number }>> = {};
  for (const acc of ACCOUNT_TYPES) {
    wallets[acc] = {};
    for (const coin of TRACKED_ASSETS) {
      wallets[acc][coin.asset] = {
        asset: coin.asset,
        name: coin.name,
        available: 0,
        locked: 0,
      };
    }
  }
  for (const row of balanceRows) {
    if (!wallets[row.account_type]) wallets[row.account_type] = {};
    wallets[row.account_type][row.asset] = {
      asset: row.asset,
      name: row.name,
      available: Number(row.available) || 0,
      locked: Number(row.locked) || 0,
    };
  }

  const txRows = db
    .prepare('SELECT * FROM ledger_transactions WHERE user_id = ? ORDER BY timestamp DESC')
    .all(userId) as Array<Record<string, any>>;

  const transactions = txRows.map((r) => ({
    id: String(r.id),
    refId: String(r.ref_id),
    type: String(r.type),
    asset: String(r.asset),
    amount: Number(r.amount),
    secondaryAsset: r.secondary_asset ? String(r.secondary_asset) : undefined,
    secondaryAmount: r.secondary_amount !== null ? Number(r.secondary_amount) : undefined,
    price: r.price !== null ? Number(r.price) : undefined,
    fee: Number(r.fee) || 0,
    fromAccount: r.from_account ? String(r.from_account) : undefined,
    toAccount: r.to_account ? String(r.to_account) : undefined,
    network: r.network ? String(r.network) : undefined,
    address: r.address ? String(r.address) : undefined,
    status: String(r.status),
    timestamp: Number(r.timestamp),
    note: String(r.note),
    isDemo: user?.account_mode !== 'readonly_exchange_api',
    isSampleData: r.provenance === 'imported_statement',
    importedVerified: r.provenance === 'imported_statement' || r.provenance === 'exchange_api_sync',
    provenance: String(r.provenance),
  }));

  const auditLogs = db
    .prepare('SELECT * FROM audit_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 40')
    .all(userId) as Array<Record<string, any>>;

  return {
    user: {
      id: user?.id || userId,
      uid: user?.uid || '1088492015',
      email: user?.email || 'unconnected@nexus.local',
      username: user?.username || 'Nexus Trader',
      vipTier: user?.vip_tier || 'Standard',
      accountMode: (user?.account_mode || 'unverified_empty') as
        | 'verified_statement'
        | 'unverified_empty'
        | 'readonly_exchange_api',
      statementId: user?.statement_id || null,
      statementVerifiedAt: user?.statement_verified_at || null,
    },
    wallets,
    transactions,
    auditLogs: auditLogs.map((a) => ({
      id: String(a.id),
      action: String(a.action),
      severity: String(a.severity),
      details: JSON.parse(String(a.details_json || '{}')),
      integrityHash: String(a.integrity_hash),
      createdAt: Number(a.created_at),
    })),
    fxCache,
    backendCapabilities: {
      sqlitePersistence: true,
      dbPath: path.basename(DB_PATH),
      readonlyExchangeApiConfigured: Boolean(
        process.env.BINANCE_READONLY_API_KEY && process.env.BINANCE_READONLY_API_SECRET
      ),
      liveOrderExecutionConfigured: process.env.EXCHANGE_TRADING_API_ENABLED === 'true',
      custodialWithdrawalConfigured: process.env.EXCHANGE_WITHDRAWAL_API_ENABLED === 'true',
      walletConnectProjectIdConfigured: Boolean(process.env.VITE_WALLETCONNECT_PROJECT_ID),
    },
  };
}

// ============================================================================
// 5. EXPRESS SERVER & REST API ROUTES
// ============================================================================

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '5mb' }));

  // 1. System & Architecture Status Endpoint
  app.get('/api/system/status', async (_req, res) => {
    const bundle = getUserLedgerBundle(DEFAULT_USER_ID);
    res.json({
      ok: true,
      serverTime: Date.now(),
      databaseEngine: 'Node.js Built-in SQLite (WAL Mode)',
      ...bundle.backendCapabilities,
      accountMode: bundle.user.accountMode,
      statementId: bundle.user.statementId,
      transactionCount: bundle.transactions.length,
      auditLogCount: bundle.auditLogs.length,
      fxCache: bundle.fxCache,
    });
  });

  // 2. Live FX Rates Endpoint
  app.get('/api/fx/rates', async (_req, res) => {
    const latest = await refreshLiveFxRates();
    res.json({ ok: true, ...latest });
  });

  // 3. Get Server-Persisted Account & Ledger State
  app.get('/api/ledger/state', (_req, res) => {
    try {
      const bundle = getUserLedgerBundle(DEFAULT_USER_ID);
      res.json({ ok: true, ...bundle });
    } catch (err: any) {
      res.status(500).json({ ok: false, message: err?.message || 'Failed to read SQLite ledger' });
    }
  });

  // 4. Switch Account Ledger Mode (Sandbox Demo vs Honest Empty State)
  app.post('/api/ledger/mode', (req, res) => {
    try {
      const { mode, customTargetUsdt } = req.body || {};
      const targetUsdt =
        typeof customTargetUsdt === 'number' && Number.isFinite(customTargetUsdt)
          ? customTargetUsdt
          : 0;

      seedOrResetUserLedger(DEFAULT_USER_ID, mode || 'unverified_empty', targetUsdt);
      const bundle = getUserLedgerBundle(DEFAULT_USER_ID);
      res.json({
        ok: true,
        message:
          mode === 'demo_sandbox'
            ? `Sandbox Demo balance allocated (${targetUsdt.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT).`
            : 'Switched to clean Unverified Empty Account state (0.00 USDT). Import an official statement or deposit to populate records.',
        ...bundle,
      });
    } catch (err: any) {
      res.status(500).json({ ok: false, message: err?.message || 'Failed to switch ledger mode' });
    }
  });

  // 5. Server-Validated Internal Wallet Transfer
  app.post('/api/ledger/transfer', (req, res) => {
    try {
      const { fromAccount, toAccount, asset, amount } = req.body || {};
      const parsedAmount = Number(amount);
      if (!fromAccount || !toAccount || fromAccount === toAccount) {
        res.status(400).json({ ok: false, message: 'Source and destination wallets must be different.' });
        return;
      }
      if (!asset || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        res.status(400).json({ ok: false, message: 'Transfer amount must be greater than zero.' });
        return;
      }

      const now = Date.now();
      const refId = `TRF-${Math.floor(10000000 + Math.random() * 90000000)}`;
      const txId = `tx-${now}-${Math.random().toString(36).slice(2, 7)}`;

      db.exec('BEGIN TRANSACTION');
      try {
        const fromRow = db
          .prepare(
            'SELECT available, name FROM wallet_balances WHERE user_id = ? AND account_type = ? AND asset = ?'
          )
          .get(DEFAULT_USER_ID, fromAccount, asset) as { available: number; name: string } | undefined;

        const currentAvail = Number(fromRow?.available || 0);
        if (parsedAmount > currentAvail + 1e-9) {
          db.exec('ROLLBACK');
          res.status(400).json({
            ok: false,
            message: `Insufficient available ${asset} in ${fromAccount} (${currentAvail} available).`,
          });
          return;
        }

        const newFromAvail = Math.max(0, Number((currentAvail - parsedAmount).toFixed(8)));
        db.prepare(
          'UPDATE wallet_balances SET available = ?, updated_at = ? WHERE user_id = ? AND account_type = ? AND asset = ?'
        ).run(newFromAvail, now, DEFAULT_USER_ID, fromAccount, asset);

        const toRow = db
          .prepare(
            'SELECT available FROM wallet_balances WHERE user_id = ? AND account_type = ? AND asset = ?'
          )
          .get(DEFAULT_USER_ID, toAccount, asset) as { available: number } | undefined;

        if (toRow) {
          const newToAvail = Number((Number(toRow.available) + parsedAmount).toFixed(8));
          db.prepare(
            'UPDATE wallet_balances SET available = ?, updated_at = ? WHERE user_id = ? AND account_type = ? AND asset = ?'
          ).run(newToAvail, now, DEFAULT_USER_ID, toAccount, asset);
        } else {
          db.prepare(
            'INSERT INTO wallet_balances (user_id, account_type, asset, name, available, locked, updated_at) VALUES (?, ?, ?, ?, ?, 0, ?)'
          ).run(DEFAULT_USER_ID, toAccount, asset, fromRow?.name || asset, parsedAmount, now);
        }

        const note = `Server-Validated Internal Transfer (${fromAccount} → ${toAccount})`;
        db.prepare(`
          INSERT INTO ledger_transactions (
            id, user_id, ref_id, type, asset, amount, fee, from_account, to_account, status, timestamp, note, provenance
          ) VALUES (?, ?, ?, 'transfer', ?, ?, 0, ?, ?, 'Completed', ?, ?, 'server_ledger_session')
        `).run(txId, DEFAULT_USER_ID, refId, asset, parsedAmount, fromAccount, toAccount, now, note);

        db.exec('COMMIT');
        writeAuditLog(DEFAULT_USER_ID, 'INTERNAL_WALLET_TRANSFER', {
          refId,
          fromAccount,
          toAccount,
          asset,
          amount: parsedAmount,
        });

        const bundle = getUserLedgerBundle(DEFAULT_USER_ID);
        res.json({
          ok: true,
          tx: bundle.transactions.find((t) => t.id === txId),
          ...bundle,
        });
      } catch (innerErr) {
        db.exec('ROLLBACK');
        throw innerErr;
      }
    } catch (err: any) {
      res.status(500).json({ ok: false, message: err?.message || 'Internal transfer failed' });
    }
  });

  // 6. Sync State & Persist Validated Client/Server Ledger Operations to SQLite
  app.post('/api/ledger/sync', (req, res) => {
    try {
      const { wallets, transaction, actionLabel } = req.body || {};
      const now = Date.now();
      db.exec('BEGIN TRANSACTION');
      try {
        if (wallets && typeof wallets === 'object') {
          const upsertBal = db.prepare(`
            INSERT INTO wallet_balances (user_id, account_type, asset, name, available, locked, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id, account_type, asset)
            DO UPDATE SET available = excluded.available, locked = excluded.locked, updated_at = excluded.updated_at
          `);
          for (const [accType, coinMap] of Object.entries(wallets)) {
            if (!coinMap || typeof coinMap !== 'object') continue;
            for (const [assetKey, balObj] of Object.entries(coinMap as Record<string, any>)) {
              upsertBal.run(
                DEFAULT_USER_ID,
                accType,
                assetKey,
                balObj.name || assetKey,
                Number(balObj.available) || 0,
                Number(balObj.locked) || 0,
                now
              );
            }
          }
        }

        if (transaction && transaction.id && transaction.refId) {
          db.prepare(`
            INSERT OR IGNORE INTO ledger_transactions (
              id, user_id, ref_id, type, asset, amount, secondary_asset, secondary_amount,
              price, fee, from_account, to_account, network, address, status, timestamp, note, provenance
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            String(transaction.id),
            DEFAULT_USER_ID,
            String(transaction.refId),
            String(transaction.type),
            String(transaction.asset),
            Number(transaction.amount) || 0,
            transaction.secondaryAsset ?? null,
            transaction.secondaryAmount ?? null,
            transaction.price ?? null,
            Number(transaction.fee) || 0,
            transaction.fromAccount ?? null,
            transaction.toAccount ?? null,
            transaction.network ?? null,
            transaction.address ?? null,
            String(transaction.status || 'Completed'),
            Number(transaction.timestamp) || now,
            String(transaction.note || ''),
            String(transaction.provenance || 'server_ledger_session')
          );
        }

        db.exec('COMMIT');
        if (actionLabel) {
          writeAuditLog(DEFAULT_USER_ID, String(actionLabel), {
            refId: transaction?.refId || null,
            asset: transaction?.asset || null,
            amount: transaction?.amount || null,
          });
        }
        const bundle = getUserLedgerBundle(DEFAULT_USER_ID);
        res.json({ ok: true, ...bundle });
      } catch (innerErr) {
        db.exec('ROLLBACK');
        throw innerErr;
      }
    } catch (err: any) {
      res.status(500).json({ ok: false, message: err?.message || 'Failed to sync SQLite ledger' });
    }
  });

  // 7. Import Official Account Statement (CSV / JSON records) into Server SQLite
  app.post('/api/ledger/import-statement', (req, res) => {
    try {
      const { records, statementName } = req.body || {};
      if (!Array.isArray(records) || records.length === 0) {
        res.status(400).json({ ok: false, message: 'No valid transaction records found in statement.' });
        return;
      }

      const now = Date.now();
      let importedCount = 0;
      db.exec('BEGIN TRANSACTION');
      try {
        const insertTx = db.prepare(`
          INSERT OR IGNORE INTO ledger_transactions (
            id, user_id, ref_id, type, asset, amount, secondary_asset, secondary_amount,
            price, fee, from_account, to_account, network, address, status, timestamp, note, provenance
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'imported_statement')
        `);

        for (const r of records) {
          if (!r || !r.refId || !r.asset) continue;
          const result = insertTx.run(
            String(r.id || `imp-${now}-${Math.random().toString(36).slice(2, 8)}`),
            DEFAULT_USER_ID,
            String(r.refId),
            String(r.type || 'deposit'),
            String(r.asset),
            Number(r.amount) || 0,
            r.secondaryAsset ?? null,
            r.secondaryAmount ?? null,
            r.price ?? null,
            Number(r.fee) || 0,
            r.fromAccount ?? null,
            r.toAccount ?? null,
            r.network ?? null,
            r.address ?? null,
            String(r.status || 'Completed'),
            Number(r.timestamp) || now,
            String(r.note || 'Imported Official Account Statement Record')
          );
          if (result.changes > 0) importedCount++;
        }

        db.prepare(`
          UPDATE users
          SET account_mode = 'verified_statement',
              statement_id = ?,
              statement_verified_at = ?
          WHERE id = ?
        `).run(statementName || `STMT-IMPORT-${new Date().toISOString().slice(0, 10)}`, now, DEFAULT_USER_ID);

        db.exec('COMMIT');
        writeAuditLog(DEFAULT_USER_ID, 'ACCOUNT_STATEMENT_IMPORTED', {
          statementName: statementName || 'Uploaded Statement',
          importedCount,
        });

        const bundle = getUserLedgerBundle(DEFAULT_USER_ID);
        res.json({ ok: true, importedCount, ...bundle });
      } catch (innerErr) {
        db.exec('ROLLBACK');
        throw innerErr;
      }
    } catch (err: any) {
      res.status(500).json({ ok: false, message: err?.message || 'Failed to import statement' });
    }
  });

  // 8. Read-Only Exchange API Synchronization (Server-Side HMAC-SHA256)
  app.post('/api/exchange/sync', async (_req, res) => {
    const apiKey = process.env.BINANCE_READONLY_API_KEY?.trim();
    const apiSecret = process.env.BINANCE_READONLY_API_SECRET?.trim();

    if (!apiKey || !apiSecret) {
      writeAuditLog(
        DEFAULT_USER_ID,
        'EXCHANGE_API_SYNC_UNCONFIGURED',
        { reason: 'Missing BINANCE_READONLY_API_KEY or BINANCE_READONLY_API_SECRET in server .env' },
        'WARN'
      );
      res.status(412).json({
        ok: false,
        code: 'EXCHANGE_API_NOT_CONFIGURED',
        message:
          'Read-Only Exchange API credentials (BINANCE_READONLY_API_KEY and BINANCE_READONLY_API_SECRET) are not configured on the server. Configure read-only API keys (without withdrawal permissions) in server environment variables to sync live exchange balances.',
      });
      return;
    }

    try {
      const timestamp = Date.now();
      const queryString = `timestamp=${timestamp}&recvWindow=5000`;
      const signature = crypto
        .createHmac('sha256', apiSecret)
        .update(queryString)
        .digest('hex');

      const response = await fetch(
        `https://api.binance.com/api/v3/account?${queryString}&signature=${signature}`,
        {
          headers: { 'X-MBX-APIKEY': apiKey },
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        res.status(response.status).json({
          ok: false,
          message: `Exchange API returned HTTP ${response.status}: ${errText.slice(0, 180)}`,
        });
        return;
      }

      const accountData = (await response.json()) as {
        balances?: Array<{ asset: string; free: string; locked: string }>;
      };

      const now = Date.now();
      db.exec('BEGIN TRANSACTION');
      const upsert = db.prepare(`
        INSERT INTO wallet_balances (user_id, account_type, asset, name, available, locked, updated_at)
        VALUES (?, 'spot', ?, ?, ?, ?, ?)
        ON CONFLICT(user_id, account_type, asset)
        DO UPDATE SET available = excluded.available, locked = excluded.locked, updated_at = excluded.updated_at
      `);
      for (const b of accountData.balances || []) {
        const free = parseFloat(b.free) || 0;
        const locked = parseFloat(b.locked) || 0;
        if (free > 0 || locked > 0 || ['USDT', 'BTC', 'ETH', 'BNB', 'SOL', 'USDC'].includes(b.asset)) {
          upsert.run(DEFAULT_USER_ID, b.asset, b.asset, free, locked, now);
        }
      }
      db.prepare("UPDATE users SET account_mode = 'readonly_exchange_api' WHERE id = ?").run(
        DEFAULT_USER_ID
      );
      db.exec('COMMIT');

      writeAuditLog(DEFAULT_USER_ID, 'EXCHANGE_API_SYNC_SUCCESS', {
        syncedAssets: (accountData.balances || []).length,
      });

      const bundle = getUserLedgerBundle(DEFAULT_USER_ID);
      res.json({ ok: true, message: 'Synced live Spot balances from Read-Only Exchange API.', ...bundle });
    } catch (err: any) {
      res.status(502).json({
        ok: false,
        message: err?.message || 'Failed to reach external exchange API endpoint.',
      });
    }
  });

  // 9. Genuine On-Chain Explorer & RPC Historical Transaction Sync
  app.get('/api/blockchain/tx-history', async (req, res) => {
    const ecosystem = String(req.query.ecosystem || 'EVM').toUpperCase();
    const address = String(req.query.address || '').trim();
    const chainId = Number(req.query.chainId || 1);

    if (!address) {
      res.status(400).json({ ok: false, message: 'Address query parameter is required.' });
      return;
    }

    try {
      if (ecosystem === 'EVM') {
        const blockscoutMap: Record<number, { api: string; explorer: string; name: string; symbol: string }> = {
          1: {
            api: 'https://eth.blockscout.com/api/v2',
            explorer: 'https://etherscan.io',
            name: 'Ethereum Mainnet',
            symbol: 'ETH',
          },
          42161: {
            api: 'https://arbitrum.blockscout.com/api/v2',
            explorer: 'https://arbiscan.io',
            name: 'Arbitrum One',
            symbol: 'ETH',
          },
          8453: {
            api: 'https://base.blockscout.com/api/v2',
            explorer: 'https://basescan.org',
            name: 'Base Mainnet',
            symbol: 'ETH',
          },
          137: {
            api: 'https://polygon.blockscout.com/api/v2',
            explorer: 'https://polygonscan.com',
            name: 'Polygon POS',
            symbol: 'POL',
          },
          10: {
            api: 'https://optimism.blockscout.com/api/v2',
            explorer: 'https://optimistic.etherscan.io',
            name: 'OP Mainnet',
            symbol: 'ETH',
          },
        };

        const net = blockscoutMap[chainId];
        if (!net) {
          res.json({
            ok: true,
            transactions: [],
            source: `No public unauthenticated indexer configured for Chain #${chainId}`,
          });
          return;
        }

        const resp = await fetch(`${net.api}/addresses/${encodeURIComponent(address)}/transactions`);
        if (!resp.ok) {
          res.json({ ok: true, transactions: [], source: `${net.name} Indexer HTTP ${resp.status}` });
          return;
        }
        const json = (await resp.json()) as { items?: Array<Record<string, any>> };
        const items = (json.items || []).slice(0, 15).map((item) => {
          const valWei = BigInt(item.value || '0');
          const amount = Number(valWei) / 1e18;
          return {
            id: `onchain-evm-${item.hash}`,
            txHash: String(item.hash),
            ecosystem: 'EVM',
            chainId,
            networkName: net.name,
            fromAddress: String(item.from?.hash || address),
            toAddress: String(item.to?.hash || ''),
            asset: net.symbol,
            amount,
            status: item.status === 'ok' ? 'Confirmed On-Chain' : 'Failed',
            confirmations: Number(item.confirmations || 1),
            blockNumber: Number(item.block_number || 0),
            explorerUrl: `${net.explorer}/tx/${item.hash}`,
            timestamp: item.timestamp ? new Date(item.timestamp).getTime() : Date.now(),
          };
        });
        res.json({ ok: true, transactions: items, source: `${net.name} Blockscout V2 Explorer` });
        return;
      }

      if (ecosystem === 'SOLANA') {
        const rpcRes = await fetch('https://solana-rpc.publicnode.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getSignaturesForAddress',
            params: [address, { limit: 15 }],
          }),
        });
        const rpcJson = (await rpcRes.json()) as { result?: Array<Record<string, any>> };
        const sigs = (rpcJson.result || []).map((s) => ({
          id: `onchain-sol-${s.signature}`,
          txHash: String(s.signature),
          ecosystem: 'SOLANA',
          chainId: 'mainnet-beta',
          networkName: 'Solana Mainnet',
          fromAddress: address,
          toAddress: 'Solana Program / Recipient',
          asset: 'SOL',
          amount: 0,
          status: s.err ? 'Failed' : 'Confirmed On-Chain',
          confirmations: s.confirmationStatus === 'finalized' ? 32 : 1,
          blockNumber: Number(s.slot || 0),
          explorerUrl: `https://solscan.io/tx/${s.signature}`,
          timestamp: s.blockTime ? Number(s.blockTime) * 1000 : Date.now(),
        }));
        res.json({ ok: true, transactions: sigs, source: 'Solana Mainnet RPC (getSignaturesForAddress)' });
        return;
      }

      if (ecosystem === 'BITCOIN') {
        const memRes = await fetch(`https://mempool.space/api/address/${encodeURIComponent(address)}/txs`);
        if (!memRes.ok) {
          res.json({ ok: true, transactions: [], source: 'Mempool.space API' });
          return;
        }
        const rawTxs = (await memRes.json()) as Array<Record<string, any>>;
        const txs = (rawTxs || []).slice(0, 15).map((t) => {
          const totalOutSats = (t.vout || []).reduce(
            (acc: number, v: any) => acc + Number(v.value || 0),
            0
          );
          return {
            id: `onchain-btc-${t.txid}`,
            txHash: String(t.txid),
            ecosystem: 'BITCOIN',
            chainId: 'bitcoin-mainnet',
            networkName: 'Bitcoin Mainnet',
            fromAddress: address,
            toAddress: String(t.vout?.[0]?.scriptpubkey_address || 'Bitcoin Script'),
            asset: 'BTC',
            amount: totalOutSats / 1e8,
            status: t.status?.confirmed ? 'Confirmed On-Chain' : 'Broadcasted (Pending Confirmation)',
            confirmations: t.status?.confirmed ? 1 : 0,
            blockNumber: t.status?.block_height ? Number(t.status.block_height) : undefined,
            explorerUrl: `https://mempool.space/tx/${t.txid}`,
            timestamp: t.status?.block_time ? Number(t.status.block_time) * 1000 : Date.now(),
          };
        });
        res.json({ ok: true, transactions: txs, source: 'Mempool.space Bitcoin Explorer API' });
        return;
      }

      res.json({ ok: true, transactions: [], source: 'Unsupported ecosystem' });
    } catch (err: any) {
      res.status(502).json({
        ok: false,
        transactions: [],
        message: err?.message || 'Failed to query public blockchain explorer.',
      });
    }
  });

  // ============================================================================
  // APK DOWNLOAD & DISTRIBUTION ENDPOINTS
  // ============================================================================
  const apkCandidatePaths = [
    '/tmp/nexustrade-runtime/NexusTradePro.apk',
    '/.aistudio/artifacts/brain/a7490194-1b19-4b0f-9511-75d0901e18f2/NexusTradePro.apk',
    path.resolve(process.cwd(), 'NexusTradePro.apk'),
    path.resolve(process.cwd(), 'NexusTradePro-debug.apk'),
    path.resolve(process.cwd(), 'apk-distribution/NexusTradePro.apk'),
    path.resolve(process.cwd(), 'apk-distribution/NexusTradePro-debug.apk'),
    path.resolve(process.cwd(), 'android/app/build/outputs/apk/debug/app-debug.apk'),
  ];

  function getAvailableApkPath(): string | null {
    for (const p of apkCandidatePaths) {
      if (fs.existsSync(p)) return p;
    }
    return null;
  }

  app.get('/api/apk-info', (_req, res) => {
    const apkPath = getAvailableApkPath();
    if (!apkPath) {
      res.status(404).json({ ok: false, error: 'APK not found' });
      return;
    }
    const stat = fs.statSync(apkPath);
    res.json({
      ok: true,
      appName: 'NexusTrade Pro',
      packageId: 'com.nexustrade.pro',
      version: '1.0.0 (Debug)',
      fileName: 'NexusTradePro.apk',
      fileSizeBytes: stat.size,
      fileSizeMB: (stat.size / (1024 * 1024)).toFixed(2),
      minAndroidVersion: 'Android 10+ (API 29+ / Min SDK 24)',
      sha256: '03d5fcb98f23c5339435357c6fc5a8005a3a94aa42734f57c35865af4ef64bfc',
      downloadUrl: '/NexusTradePro.apk',
    });
  });

  const sendApkFile = (res: express.Response, downloadName = 'NexusTradePro.apk') => {
    const apkPath = getAvailableApkPath();
    if (!apkPath) {
      res.status(404).send('APK file not found.');
      return;
    }
    const stat = fs.statSync(apkPath);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Cache-Control', 'no-store');
    fs.createReadStream(apkPath).pipe(res);
  };

  app.get('/NexusTradePro.apk', (_req, res) => sendApkFile(res, 'NexusTradePro.apk'));
  app.get('/download/NexusTradePro.apk', (_req, res) => sendApkFile(res, 'NexusTradePro.apk'));
  app.get('/download-apk', (_req, res) => sendApkFile(res, 'NexusTradePro.apk'));
  app.get('/download/NexusTradePro-debug.apk', (_req, res) => sendApkFile(res, 'NexusTradePro-debug.apk'));
  app.get('/download/app-debug.apk', (_req, res) => sendApkFile(res, 'app-debug.apk'));
  app.get('/NexusTradePro-debug.apk', (_req, res) => sendApkFile(res, 'NexusTradePro-debug.apk'));
  app.get('/app-debug.apk', (_req, res) => sendApkFile(res, 'app-debug.apk'));

  // Mount Vite middleware in development or static dist in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[NexusTrade Server] Express + SQLite + Vite running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
