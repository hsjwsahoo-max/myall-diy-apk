import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { updateLiveFiatRates } from '../components/CoinIcon';
import { marketService, TRACKED_COINS } from '../services/marketService';
import {
  connectBitcoinWallet,
  connectEvmWallet,
  connectSolanaWallet,
  EVM_CHAIN_CONFIGS,
  fetchBitcoinBalanceViaMempool,
  fetchEvmGasPriceGwei,
  fetchEvmNativeBalanceViaRpc,
  fetchEvmVerifiedTokenBalances,
  fetchOnChainAddressHistory,
  fetchSolanaNativeBalanceViaRpc,
  fetchSolanaVerifiedTokenBalances,
  getGenuineTeeCapabilityStatus,
  recheckOnChainTransactionStatus,
  sendAndConfirmSelfCustodyNativeTransfer,
  subscribeToWalletProviderEvents,
  switchEvmNetwork,
} from '../services/walletProviderService';
import {
  AccountVerificationMode,
  AppMode,
  BackendCapabilities,
  CandleData,
  ConnectionStatus,
  EarnProduct,
  EarnSubscription,
  ExchangeNavTab,
  FuturesPosition,
  KlineInterval,
  LedgerTransaction,
  MarketTicker,
  OrderBookData,
  P2PMerchantListing,
  P2POrder,
  PriceAlert,
  RealOnChainTransaction,
  ServerAuditLogEntry,
  SpotOrder,
  StockTicker,
  TradeExecution,
  UserSettings,
  WalletAccountMeta,
  WalletAccountType,
  WalletEcosystem,
  WalletNavTab,
  WalletsState,
  Web3WalletState,
} from '../types/exchange';

export const DEFAULT_PREVIEW_USDT_BALANCE = 0;


export const WALLET_ACCOUNTS: WalletAccountMeta[] = [
  { id: 'spot', label: 'Spot Wallet', shortLabel: 'Spot', description: 'Primary spot trading wallet' },
  { id: 'usdm_futures', label: 'USDⓈ-M Futures', shortLabel: 'USDⓈ-M', description: 'USDT/USDC margined perpetuals' },
  { id: 'coinm_futures', label: 'COIN-M Futures', shortLabel: 'COIN-M', description: 'Coin-margined contracts' },
  { id: 'funding', label: 'Funding', shortLabel: 'Funding', description: 'P2P, Pay & Card transactions' },
  { id: 'cross_margin', label: 'Cross Margin', shortLabel: 'Cross Margin', description: 'Shared margin pool' },
  { id: 'isolated_margin', label: 'Isolated Margin', shortLabel: 'Isolated Margin', description: 'Pair-isolated margin' },
  { id: 'earn', label: 'Earn-Flexible Assets', shortLabel: 'Earn', description: 'Yield & staking products' },
  { id: 'options', label: 'Options', shortLabel: 'Options', description: 'Crypto & TradFi options' },
];

export const INITIAL_STOCKS: StockTicker[] = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc. Common Stock',
    lastPrice: 345.53,
    changePercent: -1.23,
    volumeUsd: 14950000000,
    sector: 'US Stocks',
    isPopular: true,
    dataProvenance: 'reference',
    feedSource: 'Reference Snapshot · External TradFi API Key Required for Live Quotes',
    referenceAsOf: 'Reference Close',
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    lastPrice: 184.04,
    changePercent: -8.22,
    volumeUsd: 37120000000,
    sector: 'US Stocks',
    isPopular: true,
    dataProvenance: 'reference',
    feedSource: 'Reference Snapshot · External TradFi API Key Required for Live Quotes',
    referenceAsOf: 'Reference Close',
  },
  {
    symbol: 'MU',
    name: 'Micron Technology, Inc.',
    lastPrice: 684.97,
    changePercent: -14.04,
    volumeUsd: 37740000000,
    sector: 'US Stocks',
    isPopular: true,
    dataProvenance: 'reference',
    feedSource: 'Reference Snapshot · External TradFi API Key Required for Live Quotes',
    referenceAsOf: 'Reference Close',
  },
  {
    symbol: 'AMD',
    name: 'Advanced Micro Devices',
    lastPrice: 418.78,
    changePercent: -14.32,
    volumeUsd: 20180000000,
    sector: 'US Stocks',
    isPopular: true,
    dataProvenance: 'reference',
    feedSource: 'Reference Snapshot · External TradFi API Key Required for Live Quotes',
    referenceAsOf: 'Reference Close',
  },
  {
    symbol: 'SNDK',
    name: 'SanDisk Corporation',
    lastPrice: 848.36,
    changePercent: -18.22,
    volumeUsd: 19530000000,
    sector: 'US Stocks',
    isNew: true,
    dataProvenance: 'reference',
    feedSource: 'Reference Snapshot · External TradFi API Key Required for Live Quotes',
    referenceAsOf: 'Reference Close',
  },
  {
    symbol: 'TSLA',
    name: 'Tesla, Inc. Common Stock',
    lastPrice: 343.68,
    changePercent: -10.77,
    volumeUsd: 19120000000,
    sector: 'US Stocks',
    isPopular: true,
    dataProvenance: 'reference',
    feedSource: 'Reference Snapshot · External TradFi API Key Required for Live Quotes',
    referenceAsOf: 'Reference Close',
  },
  {
    symbol: 'SPCX',
    name: 'Space Exploration Tech ETF',
    lastPrice: 126.5,
    changePercent: -6.92,
    volumeUsd: 15380000000,
    sector: 'ETFs',
    isNew: true,
    dataProvenance: 'reference',
    feedSource: 'Reference Snapshot · External TradFi API Key Required for Live Quotes',
    referenceAsOf: 'Reference Close',
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com, Inc.',
    lastPrice: 260.2,
    changePercent: -2.18,
    volumeUsd: 14900000000,
    sector: 'US Stocks',
    isPopular: true,
    dataProvenance: 'reference',
    feedSource: 'Reference Snapshot · External TradFi API Key Required for Live Quotes',
    referenceAsOf: 'Reference Close',
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    lastPrice: 537.22,
    changePercent: -3.34,
    volumeUsd: 13540000000,
    sector: 'US Stocks',
    isPopular: true,
    dataProvenance: 'reference',
    feedSource: 'Reference Snapshot · External TradFi API Key Required for Live Quotes',
    referenceAsOf: 'Reference Close',
  },
  {
    symbol: 'MSTR',
    name: 'Strategy Inc. (MicroStrategy)',
    lastPrice: 392.4,
    changePercent: 4.18,
    volumeUsd: 16420000000,
    sector: 'US Stocks',
    isPopular: true,
    dataProvenance: 'reference',
    feedSource: 'Reference Snapshot · External TradFi API Key Required for Live Quotes',
    referenceAsOf: 'Reference Close',
  },
  {
    symbol: 'HOOD',
    name: 'Robinhood Markets, Inc.',
    lastPrice: 58.64,
    changePercent: 3.45,
    volumeUsd: 6840000000,
    sector: 'US Stocks',
    isNew: true,
    dataProvenance: 'reference',
    feedSource: 'Reference Snapshot · External TradFi API Key Required for Live Quotes',
    referenceAsOf: 'Reference Close',
  },
  {
    symbol: 'PLTR',
    name: 'Palantir Technologies Inc.',
    lastPrice: 112.85,
    changePercent: 2.91,
    volumeUsd: 11250000000,
    sector: 'US Stocks',
    isPopular: true,
    dataProvenance: 'reference',
    feedSource: 'Reference Snapshot · External TradFi API Key Required for Live Quotes',
    referenceAsOf: 'Reference Close',
  },
  {
    symbol: 'SPY',
    name: 'SPDR S&P 500 ETF Trust',
    lastPrice: 598.4,
    changePercent: -0.64,
    volumeUsd: 28900000000,
    sector: 'ETFs',
    isPopular: true,
    dataProvenance: 'reference',
    feedSource: 'Reference Snapshot · External TradFi API Key Required for Live Quotes',
    referenceAsOf: 'Reference Close',
  },
  {
    symbol: 'QQQ',
    name: 'Invesco QQQ Trust Series 1',
    lastPrice: 521.15,
    changePercent: -1.12,
    volumeUsd: 22410000000,
    sector: 'ETFs',
    isPopular: true,
    dataProvenance: 'reference',
    feedSource: 'Reference Snapshot · External TradFi API Key Required for Live Quotes',
    referenceAsOf: 'Reference Close',
  },
  {
    symbol: 'GLD',
    name: 'SPDR Gold Shares ETF',
    lastPrice: 278.9,
    changePercent: 0.85,
    volumeUsd: 8920000000,
    sector: 'ETFs',
    isPopular: true,
    dataProvenance: 'reference',
    feedSource: 'Reference Snapshot · External TradFi API Key Required for Live Quotes',
    referenceAsOf: 'Reference Close',
  },
  {
    symbol: 'SLV',
    name: 'iShares Silver Trust ETF',
    lastPrice: 31.42,
    changePercent: 1.14,
    volumeUsd: 4180000000,
    sector: 'ETFs',
    isNew: true,
    dataProvenance: 'reference',
    feedSource: 'Reference Snapshot · External TradFi API Key Required for Live Quotes',
    referenceAsOf: 'Reference Close',
  },
];

export const EARN_PRODUCTS: EarnProduct[] = [
  { id: 'earn-usdt-flex', asset: 'USDT', name: 'TetherUS', type: 'Flexible', apr: 11.82, minAmount: 1, bonusTag: 'Tiered +8% Bonus' },
  { id: 'earn-usdc-flex', asset: 'USDC', name: 'USD Coin', type: 'Flexible', apr: 9.59, minAmount: 1, bonusTag: 'Hot' },
  { id: 'earn-bnb-lock30', asset: 'BNB', name: 'BNB Vault & Launchpool', type: 'Locked', durationDays: 30, apr: 14.25, minAmount: 0.05, bonusTag: 'Launchpool' },
  { id: 'earn-sol-lock60', asset: 'SOL', name: 'Solana Staking', type: 'Locked', durationDays: 60, apr: 16.4, minAmount: 0.1, bonusTag: 'High Yield' },
  { id: 'earn-eth-flex', asset: 'ETH', name: 'ETH Staking', type: 'Flexible', apr: 4.85, minAmount: 0.01 },
  { id: 'earn-xrp-flex', asset: 'XRP', name: 'XRP Super Earn', type: 'Flexible', apr: 55.11, minAmount: 10, bonusTag: 'Special Offer' },
  { id: 'earn-trx-lock14', asset: 'TRX', name: 'TRON Staking', type: 'Locked', durationDays: 14, apr: 22.25, minAmount: 50, bonusTag: 'Carnival' },
];

export const P2P_MERCHANTS: P2PMerchantListing[] = [
  {
    id: 'p2p-1',
    merchantName: 'ApexLiquidity_Pro',
    verified: true,
    completedOrders: 3428,
    completionRate: 99.6,
    side: 'BUY',
    asset: 'USDT',
    fiat: 'USD',
    price: 1.001,
    availableAsset: 28450,
    minFiat: 20,
    maxFiat: 15000,
    paymentMethods: ['Bank Transfer', 'Zelle', 'Wire Transfer'],
    timeLimitMins: 15,
  },
  {
    id: 'p2p-2',
    merchantName: 'GulfCryptoDesk_AED',
    verified: true,
    completedOrders: 1890,
    completionRate: 99.1,
    side: 'BUY',
    asset: 'USDT',
    fiat: 'AED',
    price: 3.675,
    availableAsset: 85000,
    minFiat: 100,
    maxFiat: 250000,
    paymentMethods: ['Bank Transfer', 'Aani Instant', 'Emirates NBD'],
    timeLimitMins: 15,
  },
  {
    id: 'p2p-3',
    merchantName: 'BharatPrime_Desk',
    verified: true,
    completedOrders: 5110,
    completionRate: 98.9,
    side: 'BUY',
    asset: 'USDT',
    fiat: 'INR',
    price: 94.49,
    availableAsset: 15400,
    minFiat: 500,
    maxFiat: 500000,
    paymentMethods: ['UPI', 'IMPS', 'Bank Transfer'],
    timeLimitMins: 15,
  },
  {
    id: 'p2p-4',
    merchantName: 'EuroSettlements_AG',
    verified: true,
    completedOrders: 2740,
    completionRate: 99.4,
    side: 'BUY',
    asset: 'USDT',
    fiat: 'EUR',
    price: 0.923,
    availableAsset: 42000,
    minFiat: 50,
    maxFiat: 50000,
    paymentMethods: ['SEPA Instant', 'Revolut', 'Bank Transfer'],
    timeLimitMins: 15,
  },
  {
    id: 'p2p-5',
    merchantName: 'VaultCashout_Global',
    verified: true,
    completedOrders: 4120,
    completionRate: 99.8,
    side: 'SELL',
    asset: 'USDT',
    fiat: 'USD',
    price: 0.999,
    availableAsset: 50000,
    minFiat: 20,
    maxFiat: 25000,
    paymentMethods: ['Bank Transfer', 'Zelle'],
    timeLimitMins: 15,
  },
  {
    id: 'p2p-6',
    merchantName: 'DubaiP2P_Express',
    verified: true,
    completedOrders: 2310,
    completionRate: 99.5,
    side: 'SELL',
    asset: 'USDT',
    fiat: 'AED',
    price: 3.671,
    availableAsset: 60000,
    minFiat: 100,
    maxFiat: 100000,
    paymentMethods: ['Bank Transfer', 'ADCB'],
    timeLimitMins: 15,
  },
  {
    id: 'p2p-7',
    merchantName: 'Mumbai_InstantPay',
    verified: true,
    completedOrders: 3915,
    completionRate: 99.2,
    side: 'SELL',
    asset: 'USDT',
    fiat: 'INR',
    price: 94.25,
    availableAsset: 18000,
    minFiat: 500,
    maxFiat: 200000,
    paymentMethods: ['UPI', 'IMPS'],
    timeLimitMins: 15,
  },
];

const STORAGE_KEY = 'nexustrade_ledger_v4';
const LEGACY_STORAGE_KEY = 'nexustrade_ledger_v3';

function createInitialWallets(startingUsdtBalance = DEFAULT_PREVIEW_USDT_BALANCE): WalletsState {
  const coreAssets = [
    { asset: 'USDT', name: 'TetherUS' },
    { asset: 'BTC', name: 'Bitcoin' },
    { asset: 'ETH', name: 'Ethereum' },
    { asset: 'BNB', name: 'BNB' },
    { asset: 'SOL', name: 'Solana' },
    { asset: 'USDC', name: 'USD Coin' },
    { asset: 'XRP', name: 'XRP' },
    { asset: 'TRX', name: 'TRON' },
    { asset: 'TRUMP', name: 'OFFICIAL TRUMP' },
  ];

  const makeEmptyAccount = () => {
    const map: Record<string, { asset: string; name: string; available: number; locked: number }> = {};
    for (const c of coreAssets) {
      map[c.asset] = { asset: c.asset, name: c.name, available: 0, locked: 0 };
    }
    return map;
  };

  const wallets: WalletsState = {
    spot: makeEmptyAccount(),
    funding: makeEmptyAccount(),
    usdm_futures: makeEmptyAccount(),
    coinm_futures: makeEmptyAccount(),
    earn: makeEmptyAccount(),
    cross_margin: makeEmptyAccount(),
    isolated_margin: makeEmptyAccount(),
    options: makeEmptyAccount(),
  };

  if (startingUsdtBalance > 0) {
    const lockedAmount = startingUsdtBalance >= 2000 ? 550 : 0;
    wallets.spot.USDT.available = Math.max(0, Number((startingUsdtBalance - lockedAmount).toFixed(2)));
    wallets.spot.USDT.locked = lockedAmount;
  }

  return wallets;
}

function createInitialSpotOrders(startingUsdtBalance = DEFAULT_PREVIEW_USDT_BALANCE): SpotOrder[] {
  if (startingUsdtBalance <= 0) return [];

  return [
    {
      id: 'ord-sample-locked-1',
      refId: 'ORD-88412095',
      symbol: 'BTCUSDT',
      baseAsset: 'BTC',
      quoteAsset: 'USDT',
      side: 'BUY',
      type: 'LIMIT',
      price: 68500,
      quantity: 0.008029,
      filledQuantity: 0,
      totalQuote: 550,
      status: 'OPEN',
      timestamp: Date.now() - 1000 * 60 * 145,
    },
  ];
}

/**
 * Generates a realistic 6-month sample activity timeline covering:
 * - Internal transfers
 * - Simulated deposits
 * - Simulated withdrawals
 * - Simulated conversions
 * - Simulated spot trades
 * All clearly flagged with isSampleData: true and internal reference IDs (zero fake blockchain hashes).
 */
export function createSixMonthSampleTimeline(_baseNow = Date.now()): LedgerTransaction[] {
  return [];
}

/*

    // Current Month (Days 1 - 12 ago)
    {
      id: 'sample-tx-01',
      refId: 'TRF-90481201',
      type: 'transfer',
      asset: 'USDT',
      amount: 1500,
      fee: 0,
      fromAccount: 'usdm_futures',
      toAccount: 'spot',
      status: 'Completed',
      timestamp: baseNow - Math.floor(1.2 * dayMs),
      note: 'Internal Transfer from USDⓈ-M Futures to Spot Wallet',
    },
    {
      id: 'sample-tx-02',
      refId: 'SPT-90451982',
      type: 'spot_sell',
      asset: 'SOL',
      amount: 12.5,
      secondaryAsset: 'USDT',
      secondaryAmount: 2150,
      price: 172.0,
      fee: 2.15,
      fromAccount: 'spot',
      toAccount: 'spot',
      status: 'Completed',
      timestamp: baseNow - Math.floor(3.6 * dayMs),
      note: 'Spot LIMIT SELL 12.5 SOL @ 172.00 USDT',
    },
    {
      id: 'sample-tx-03',
      refId: 'CNV-90410344',
      type: 'convert',
      asset: 'BNB',
      amount: 1.8,
      secondaryAsset: 'USDT',
      secondaryAmount: 1242,
      price: 690.0,
      fee: 0,
      fromAccount: 'spot',
      toAccount: 'spot',
      status: 'Completed',
      timestamp: baseNow - Math.floor(6.4 * dayMs),
      note: 'Converted 1.8 BNB to 1,242.00 USDT (Zero Fee)',
    },
    {
      id: 'sample-tx-04',
      refId: 'WDR-90389120',
      type: 'withdraw',
      asset: 'USDT',
      amount: 450,
      fee: 1.0,
      fromAccount: 'spot',
      network: 'Tron (TRC20) · Demo Ledger',
      address: 'Demo External Recipient (Preview Record)',
      status: 'Completed',
      timestamp: baseNow - Math.floor(9.1 * dayMs),
      note: 'Demo Ledger Withdrawal Record (No Blockchain Broadcast)',
    },
    {
      id: 'sample-tx-05',
      refId: 'TRF-90328411',
      type: 'transfer',
      asset: 'USDT',
      amount: 2500,
      fee: 0,
      fromAccount: 'spot',
      toAccount: 'usdm_futures',
      status: 'Completed',
      timestamp: baseNow - Math.floor(12.5 * dayMs),
      note: 'Internal Transfer from Spot Wallet to USDⓈ-M Futures',
    },

    // Month -1 (Days 18 - 42 ago)
    {
      id: 'sample-tx-06',
      refId: 'DEP-89841209',
      type: 'deposit',
      asset: 'USDT',
      amount: 4200,
      fee: 0,
      toAccount: 'spot',
      network: 'Arbitrum One · Simulated',
      status: 'Completed',
      timestamp: baseNow - Math.floor(19.3 * dayMs),
      note: 'Simulated Deposit credited to Spot Wallet',
    },
    {
      id: 'sample-tx-07',
      refId: 'SPT-89762310',
      type: 'spot_buy',
      asset: 'SOL',
      amount: 12.5,
      secondaryAsset: 'USDT',
      secondaryAmount: 1975,
      price: 158.0,
      fee: 1.98,
      fromAccount: 'spot',
      toAccount: 'spot',
      status: 'Completed',
      timestamp: baseNow - Math.floor(24.8 * dayMs),
      note: 'Spot MARKET BUY 12.5 SOL @ 158.00 USDT',
    },
    {
      id: 'sample-tx-08',
      refId: 'CNV-89650192',
      type: 'convert',
      asset: 'USDT',
      amount: 1200,
      secondaryAsset: 'BNB',
      secondaryAmount: 1.8,
      price: 0.0015,
      fee: 0,
      fromAccount: 'spot',
      toAccount: 'spot',
      status: 'Completed',
      timestamp: baseNow - Math.floor(31.2 * dayMs),
      note: 'Converted 1,200.00 USDT to 1.8000 BNB (Zero Fee)',
    },
    {
      id: 'sample-tx-09',
      refId: 'TRF-89541088',
      type: 'transfer',
      asset: 'USDT',
      amount: 1800,
      fee: 0,
      fromAccount: 'earn',
      toAccount: 'spot',
      status: 'Completed',
      timestamp: baseNow - Math.floor(37.4 * dayMs),
      note: 'Internal Transfer from Earn-Flexible Assets to Spot Wallet',
    },
    {
      id: 'sample-tx-10',
      refId: 'WDR-89421904',
      type: 'withdraw',
      asset: 'USDT',
      amount: 600,
      fee: 0.19,
      fromAccount: 'spot',
      network: 'BNB Smart Chain (BEP20) · Demo Ledger',
      address: 'Demo External Recipient (Preview Record)',
      status: 'Completed',
      timestamp: baseNow - Math.floor(42.1 * dayMs),
      note: 'Demo Ledger Withdrawal Record (No Blockchain Broadcast)',
    },

    // Month -2 (Days 48 - 74 ago)
    {
      id: 'sample-tx-11',
      refId: 'SPT-88912045',
      type: 'spot_sell',
      asset: 'ETH',
      amount: 1.2,
      secondaryAsset: 'USDT',
      secondaryAmount: 3180,
      price: 2650.0,
      fee: 3.18,
      fromAccount: 'spot',
      toAccount: 'spot',
      status: 'Completed',
      timestamp: baseNow - Math.floor(49.5 * dayMs),
      note: 'Spot LIMIT SELL 1.2 ETH @ 2,650.00 USDT',
    },
    {
      id: 'sample-tx-12',
      refId: 'TRF-88834120',
      type: 'transfer',
      asset: 'USDT',
      amount: 1800,
      fee: 0,
      fromAccount: 'spot',
      toAccount: 'earn',
      status: 'Completed',
      timestamp: baseNow - Math.floor(56.2 * dayMs),
      note: 'Internal Transfer from Spot Wallet to Earn-Flexible Assets',
    },
    {
      id: 'sample-tx-13',
      refId: 'DEP-88719032',
      type: 'deposit',
      asset: 'USDT',
      amount: 3500,
      fee: 0,
      toAccount: 'spot',
      network: 'Tron (TRC20) · Simulated',
      status: 'Completed',
      timestamp: baseNow - Math.floor(63.7 * dayMs),
      note: 'Simulated Deposit credited to Spot Wallet',
    },
    {
      id: 'sample-tx-14',
      refId: 'CNV-88604911',
      type: 'convert',
      asset: 'USDC',
      amount: 1500,
      secondaryAsset: 'USDT',
      secondaryAmount: 1500.3,
      price: 1.0002,
      fee: 0,
      fromAccount: 'spot',
      toAccount: 'spot',
      status: 'Completed',
      timestamp: baseNow - Math.floor(71.4 * dayMs),
      note: 'Converted 1,500.00 USDC to 1,500.30 USDT (Zero Fee)',
    },

    // Month -3 (Days 79 - 104 ago)
    {
      id: 'sample-tx-15',
      refId: 'SPT-87950123',
      type: 'spot_buy',
      asset: 'ETH',
      amount: 1.2,
      secondaryAsset: 'USDT',
      secondaryAmount: 2940,
      price: 2450.0,
      fee: 2.94,
      fromAccount: 'spot',
      toAccount: 'spot',
      status: 'Completed',
      timestamp: baseNow - Math.floor(81.2 * dayMs),
      note: 'Spot LIMIT BUY 1.2 ETH @ 2,450.00 USDT',
    },
    {
      id: 'sample-tx-16',
      refId: 'TRF-87841920',
      type: 'transfer',
      asset: 'USDT',
      amount: 1200,
      fee: 0,
      fromAccount: 'funding',
      toAccount: 'spot',
      status: 'Completed',
      timestamp: baseNow - Math.floor(88.6 * dayMs),
      note: 'Internal Transfer from Funding to Spot Wallet',
    },
    {
      id: 'sample-tx-17',
      refId: 'WDR-87710294',
      type: 'withdraw',
      asset: 'USDT',
      amount: 320,
      fee: 1.0,
      fromAccount: 'spot',
      network: 'Solana (SPL) · Demo Ledger',
      address: 'Demo External Recipient (Preview Record)',
      status: 'Completed',
      timestamp: baseNow - Math.floor(95.3 * dayMs),
      note: 'Demo Ledger Withdrawal Record (No Blockchain Broadcast)',
    },
    {
      id: 'sample-tx-18',
      refId: 'TRF-87601928',
      type: 'transfer',
      asset: 'USDT',
      amount: 1200,
      fee: 0,
      fromAccount: 'spot',
      toAccount: 'funding',
      status: 'Completed',
      timestamp: baseNow - Math.floor(102.8 * dayMs),
      note: 'Internal Transfer from Spot Wallet to Funding',
    },

    // Month -4 (Days 110 - 138 ago)
    {
      id: 'sample-tx-19',
      refId: 'SPT-86910234',
      type: 'spot_sell',
      asset: 'BTC',
      amount: 0.05,
      secondaryAsset: 'USDT',
      secondaryAmount: 3425,
      price: 68500.0,
      fee: 3.42,
      fromAccount: 'spot',
      toAccount: 'spot',
      status: 'Completed',
      timestamp: baseNow - Math.floor(112.4 * dayMs),
      note: 'Spot MARKET SELL 0.05 BTC @ 68,500.00 USDT',
    },
    {
      id: 'sample-tx-20',
      refId: 'DEP-86820193',
      type: 'deposit',
      asset: 'USDT',
      amount: 4500,
      fee: 0,
      toAccount: 'spot',
      network: 'Ethereum (ERC20) · Simulated',
      status: 'Completed',
      timestamp: baseNow - Math.floor(121.7 * dayMs),
      note: 'Simulated Deposit credited to Spot Wallet',
    },
    {
      id: 'sample-tx-21',
      refId: 'CNV-86719022',
      type: 'convert',
      asset: 'USDT',
      amount: 3200,
      secondaryAsset: 'BTC',
      secondaryAmount: 0.05,
      price: 0.00001562,
      fee: 0,
      fromAccount: 'spot',
      toAccount: 'spot',
      status: 'Completed',
      timestamp: baseNow - Math.floor(129.5 * dayMs),
      note: 'Converted 3,200.00 USDT to 0.0500 BTC (Zero Fee)',
    },
    {
      id: 'sample-tx-22',
      refId: 'TRF-86604182',
      type: 'transfer',
      asset: 'USDT',
      amount: 900,
      fee: 0,
      fromAccount: 'usdm_futures',
      toAccount: 'spot',
      status: 'Completed',
      timestamp: baseNow - Math.floor(136.9 * dayMs),
      note: 'Internal Transfer from USDⓈ-M Futures to Spot Wallet',
    },

    // Month -5 (Days 144 - 175 ago)
    {
      id: 'sample-tx-23',
      refId: 'TRF-85920144',
      type: 'transfer',
      asset: 'USDT',
      amount: 900,
      fee: 0,
      fromAccount: 'spot',
      toAccount: 'usdm_futures',
      status: 'Completed',
      timestamp: baseNow - Math.floor(146.2 * dayMs),
      note: 'Internal Transfer from Spot Wallet to USDⓈ-M Futures',
    },
    {
      id: 'sample-tx-24',
      refId: 'WDR-85819023',
      type: 'withdraw',
      asset: 'USDT',
      amount: 280,
      fee: 1.0,
      fromAccount: 'spot',
      network: 'Tron (TRC20) · Demo Ledger',
      address: 'Demo External Recipient (Preview Record)',
      status: 'Completed',
      timestamp: baseNow - Math.floor(155.8 * dayMs),
      note: 'Demo Ledger Withdrawal Record (No Blockchain Broadcast)',
    },
    {
      id: 'sample-tx-25',
      refId: 'DEP-85701294',
      type: 'deposit',
      asset: 'USDT',
      amount: 6000,
      fee: 0,
      toAccount: 'spot',
      network: 'Tron (TRC20) · Simulated',
      status: 'Completed',
      timestamp: baseNow - Math.floor(168.4 * dayMs),
      note: 'Verified Statement Portfolio Deposit · Tron (TRC20)',
    },
    // Month -6 (May 2026: Days 178 - 196 ago)
    {
      id: 'sample-tx-26',
      refId: 'EARN-85519042',
      type: 'earn_subscribe',
      asset: 'USDT',
      amount: 1200,
      fee: 0,
      fromAccount: 'spot',
      toAccount: 'earn',
      status: 'Completed',
      timestamp: baseNow - Math.floor(182.3 * dayMs),
      note: 'Simple Earn Flexible USDT Subscription (11.82% APR Tiered)',
    },
    {
      id: 'sample-tx-27',
      refId: 'P2P-85402119',
      type: 'p2p_buy',
      asset: 'USDT',
      amount: 1200,
      secondaryAsset: 'USD',
      secondaryAmount: 1201.2,
      price: 1.001,
      fee: 0,
      toAccount: 'funding',
      status: 'Completed',
      timestamp: baseNow - Math.floor(194.6 * dayMs),
      note: 'P2P Express Settlement via ApexLiquidity_Pro (Credited to Funding Wallet)',
    },
    // Month -7 (April 2026: Days 205 - 224 ago)
    {
      id: 'sample-tx-28',
      refId: 'FUT-85210984',
      type: 'futures_close',
      asset: 'USDT',
      amount: 420,
      price: 64800,
      fee: 1.94,
      fromAccount: 'usdm_futures',
      toAccount: 'spot',
      status: 'Completed',
      timestamp: baseNow - Math.floor(211.5 * dayMs),
      note: 'USDⓈ-M BTCUSDT Perpetual Realized PnL Settlement (+420.00 USDT)',
    },
    // Month -8 (March 2026: Days 232 - 244 ago)
    {
      id: 'sample-tx-29',
      refId: 'DEP-85010012',
      type: 'deposit',
      asset: 'USDT',
      amount: 5500,
      fee: 0,
      toAccount: 'spot',
      network: 'Tron (TRC20) · Statement Verified',
      status: 'Completed',
      timestamp: baseNow - Math.floor(239.2 * dayMs),
      note: 'Initial Statement Verified Portfolio Deposit (NX-STMT-2026-16845)',
    },
  ];
*/


export function deduplicateTransactions(list: LedgerTransaction[]): LedgerTransaction[] {
  const seenIds = new Set<string>();
  const seenRefs = new Set<string>();
  const result: LedgerTransaction[] = [];

  for (const tx of list) {
    if (!tx || !tx.id || !tx.refId) continue;
    if (seenIds.has(tx.id) || seenRefs.has(tx.refId)) continue;
    seenIds.add(tx.id);
    seenRefs.add(tx.refId);
    result.push(tx);
  }

  return result.sort((a, b) => b.timestamp - a.timestamp);
}

function generateRefId(prefix = 'NX'): string {
  const rand = Math.floor(10000000 + Math.random() * 90000000);
  return `${prefix}-${rand}`;
}

interface InitialStorageBundle {
  wallets: WalletsState;
  transactions: LedgerTransaction[];
  spotOrders: SpotOrder[];
  futuresPositions: FuturesPosition[];
  earnSubscriptions: EarnSubscription[];
  p2pOrders: P2POrder[];
  settings: UserSettings;
  web3Wallet: Web3WalletState;
}

function loadOrMigrateLedger(): InitialStorageBundle {
  const defaultSettings: UserSettings = {
    uid: '1088492015',
    username: 'Nexus Trader',
    vipTier: 'Standard',
    verified: false,
    fiat: 'INR',
    primaryDenomination: 'INR',
    theme: 'dark',
    hideBalances: false,
    bnbFeeDiscount: true,
    notificationsEnabled: true,
    twoFactorEnabled: false,
    passkeyEnabled: false,
    antiPhishingCode: '',
    initialPreviewBalanceUsdt: 0,
    portfolioInitializedAt: Date.now(),
    accountMode: 'unverified_empty',
    statementId: null,
  };

  const defaultWeb3: Web3WalletState = {
    isCreated: false,
    address: '',
    walletName: 'Unconnected Wallet',
    disclaimerAccepted: false,
    backupVerified: false,
    mode: 'unconnected',
    activeEcosystem: 'EVM',
    evmAccount: null,
    solanaAccount: null,
    bitcoinAccount: null,
    demoWeb3Balances: {
      USDT: 0,
      BNB: 0,
      ETH: 0,
      SOL: 0,
      BTC: 0,
      USDC: 0,
    },
    realOnChainTxs: [],
    teeStatus: getGenuineTeeCapabilityStatus(),
  };

  try {
    const rawV3 = localStorage.getItem(STORAGE_KEY);
    if (rawV3) {
      const parsed = JSON.parse(rawV3);
      if (parsed && parsed.wallets) {
        const isLegacyMock =
          parsed.settings?.uid === '1061155439' ||
          parsed.settings?.statementId === 'NX-STMT-2026-16845' ||
          parsed.settings?.username === 'User-a11dd';

        const mergedSettings: UserSettings = {
          ...defaultSettings,
          ...(parsed.settings || {}),
          initialPreviewBalanceUsdt: isLegacyMock
            ? 0
            : parsed.settings?.initialPreviewBalanceUsdt ?? 0,
          accountMode: isLegacyMock ? 'unverified_empty' : (parsed.settings?.accountMode || 'unverified_empty'),
          statementId: isLegacyMock ? null : parsed.settings?.statementId || null,
          fiat: parsed.settings?.fiat || 'INR',
          primaryDenomination: parsed.settings?.primaryDenomination || 'INR',
        };

        let rawTxs = Array.isArray(parsed.transactions)
          ? deduplicateTransactions(parsed.transactions)
          : [];

        if (isLegacyMock) {
          rawTxs = rawTxs.filter(
            (t) =>
              !t.isSampleData &&
              !String(t.id).startsWith('stmt-tx-') &&
              !String(t.id).startsWith('sample-tx-') &&
              (t as any).provenance !== 'imported_statement'
          );
        }

        const sanitizedTxs = rawTxs.map((t) => {
          if (t.address && t.address.includes('SIMULATED_')) {
            return { ...t, address: 'Demo External Recipient (Preview Record)' };
          }
          return t;
        });

        const activeWallets = isLegacyMock && parsed.wallets?.spot?.USDT?.available === 11495
          ? createInitialWallets(0)
          : parsed.wallets;

        const storedWeb3: Web3WalletState = parsed.web3Wallet
          ? {
              ...defaultWeb3,
              ...parsed.web3Wallet,
              teeStatus: getGenuineTeeCapabilityStatus(),
            }
          : defaultWeb3;

        // Sanitize any legacy hardcoded placeholder address from cached localStorage
        if (
          !storedWeb3.evmAccount &&
          !storedWeb3.solanaAccount &&
          !storedWeb3.bitcoinAccount &&
          storedWeb3.mode !== 'demo_preview'
        ) {
          storedWeb3.address = '';
          storedWeb3.isCreated = false;
          storedWeb3.mode = 'unconnected';
          storedWeb3.walletName = 'Unconnected Wallet';
        }

        return {
          wallets: activeWallets,
          transactions: sanitizedTxs,
          spotOrders: Array.isArray(parsed.spotOrders) ? parsed.spotOrders : [],
          futuresPositions: Array.isArray(parsed.futuresPositions) ? parsed.futuresPositions : [],
          earnSubscriptions: Array.isArray(parsed.earnSubscriptions)
            ? parsed.earnSubscriptions
            : [],
          p2pOrders: Array.isArray(parsed.p2pOrders) ? parsed.p2pOrders : [],
          settings: mergedSettings,
          web3Wallet: storedWeb3,
        };
      }
    }

    return {
      wallets: createInitialWallets(0),
      transactions: [],
      spotOrders: [],
      futuresPositions: [],
      earnSubscriptions: [],
      p2pOrders: [],
      settings: defaultSettings,
      web3Wallet: defaultWeb3,
    };
  } catch {
    return {
      wallets: createInitialWallets(0),
      transactions: [],
      spotOrders: [],
      futuresPositions: [],
      earnSubscriptions: [],
      p2pOrders: [],
      settings: defaultSettings,
      web3Wallet: defaultWeb3,
    };
  }
}

interface ExchangeContextValue {
  // Navigation & UI Mode
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  exchangeTab: ExchangeNavTab;
  setExchangeTab: (tab: ExchangeNavTab) => void;
  walletTab: WalletNavTab;
  setWalletTab: (tab: WalletNavTab) => void;
  assetsSubTab: 'overview' | 'spot' | 'futures' | 'funding' | 'earn';
  setAssetsSubTab: (tab: 'overview' | 'spot' | 'futures' | 'funding' | 'earn') => void;
  tradeSubTab: 'convert' | 'spot' | 'stocks' | 'p2p' | 'alpha';
  setTradeSubTab: (tab: 'convert' | 'spot' | 'stocks' | 'p2p' | 'alpha') => void;
  futuresSubTab: 'usdm' | 'coinm' | 'options' | 'smart_money';
  setFuturesSubTab: (tab: 'usdm' | 'coinm' | 'options' | 'smart_money') => void;

  // System 1: Public Live Market Data
  tickers: Record<string, MarketTicker>;
  tickerList: MarketTicker[];
  usdtTicker: MarketTicker;
  stocks: StockTicker[];
  connectionStatus: ConnectionStatus;
  lastUpdated: number | null;
  activeSymbol: string;
  setActiveSymbol: (sym: string) => void;
  activeInterval: KlineInterval;
  setActiveInterval: (interval: KlineInterval) => void;
  candles: CandleData[];
  isLoadingCandles: boolean;
  orderBook: OrderBookData;
  recentTrades: TradeExecution[];
  favorites: string[];
  toggleFavorite: (symbol: string) => void;
  setFavoritesList: (symbols: string[]) => void;
  getLiveUsdtUsdPrice: () => number;
  getAssetPriceUsdt: (asset: string) => number;
  getAssetPriceUsd: (asset: string) => number;
  isRefreshingMarket: boolean;
  refreshMarketData: (silent?: boolean) => Promise<void>;

  // System 2: User Account & Portfolio Ledger
  wallets: WalletsState;
  transactions: LedgerTransaction[];
  spotOrders: SpotOrder[];
  futuresPositions: FuturesPosition[];
  earnSubscriptions: EarnSubscription[];
  p2pOrders: P2POrder[];
  priceAlerts: PriceAlert[];
  settings: UserSettings;
  web3Wallet: Web3WalletState;
  getAccountValueUsdt: (account: WalletAccountType) => number;
  getAccountValueUsd: (account: WalletAccountType) => number;
  getTotalPortfolioUsdt: () => number;
  getTotalPortfolioUsd: () => number;
  getTotalUsdtSummary: () => {
    available: number;
    locked: number;
    total: number;
    usdValue: number;
  };

  // System 3: Simulated Trading & Transaction Execution
  executeTransfer: (params: {
    fromAccount: WalletAccountType;
    toAccount: WalletAccountType;
    asset: string;
    amount: number;
  }) => { ok: boolean; message: string; tx?: LedgerTransaction };
  requestDeposit: (params: {
    asset: string;
    network: string;
    amount: number;
    toAccount?: WalletAccountType;
  }) => { ok: boolean; message: string; tx?: LedgerTransaction };
  requestWithdraw: (params: {
    asset: string;
    network: string;
    address: string;
    amount: number;
    fromAccount?: WalletAccountType;
  }) => { ok: boolean; message: string; tx?: LedgerTransaction };
  executeConvert: (params: {
    fromAsset: string;
    toAsset: string;
    fromAmount: number;
    walletType?: WalletAccountType;
  }) => { ok: boolean; message: string; receivedAmount?: number; rate?: number; tx?: LedgerTransaction };
  placeSpotOrder: (params: {
    symbol: string;
    side: 'BUY' | 'SELL';
    type: 'LIMIT' | 'MARKET' | 'STOP_LIMIT';
    price: number;
    stopPrice?: number;
    quantity: number;
  }) => { ok: boolean; message: string };
  cancelSpotOrder: (orderId: string) => void;
  openFuturesPosition: (params: {
    symbol: string;
    contractType: 'USDM' | 'COINM';
    side: 'LONG' | 'SHORT';
    marginMode: 'Cross' | 'Isolated';
    leverage: number;
    marginUsdt: number;
    orderType?: 'MARKET' | 'LIMIT';
    limitPrice?: number;
    takeProfit?: number;
    stopLoss?: number;
  }) => { ok: boolean; message: string };
  closeFuturesPosition: (positionId: string) => { ok: boolean; message: string };
  updatePositionTpSl: (positionId: string, takeProfit?: number, stopLoss?: number) => void;
  subscribeEarn: (productId: string, amount: number) => { ok: boolean; message: string };
  redeemEarn: (subscriptionId: string) => { ok: boolean; message: string };
  createP2POrder: (params: {
    listingId: string;
    fiatAmount: number;
    paymentMethod: string;
  }) => { ok: boolean; message: string; order?: P2POrder };
  completeP2POrder: (orderId: string) => { ok: boolean; message: string };
  cancelP2POrder: (orderId: string) => void;
  addPriceAlert: (symbol: string, targetPrice: number, condition: 'ABOVE' | 'BELOW') => void;
  removePriceAlert: (id: string) => void;
  updateSettings: (partial: Partial<UserSettings>) => void;
  updateWeb3Wallet: (partial: Partial<Web3WalletState>) => void;
  connectEcosystemWallet: (
    ecosystem: WalletEcosystem
  ) => Promise<{ ok: boolean; message: string }>;
  disconnectEcosystemWallet: (ecosystem?: WalletEcosystem) => void;
  switchConnectedEvmChain: (targetChainId: number) => Promise<{ ok: boolean; message: string }>;
  enableDemoWeb3Preview: () => void;
  refreshConnectedWalletBalances: () => Promise<void>;
  executeDemoExchangeToWalletTransfer: (params: {
    fromAccount: 'spot' | 'funding';
    asset: string;
    network: string;
    amount: number;
  }) => { ok: boolean; message: string; tx?: LedgerTransaction };
  executeSelfCustodyTransfer: (params: {
    ecosystem: WalletEcosystem;
    toAddress: string;
    amount: number;
    tokenContract?: string;
    tokenSymbol?: string;
    tokenDecimals?: number;
  }) => Promise<{ ok: boolean; message: string; txRecord?: RealOnChainTransaction }>;
  reverifyOnChainTransaction: (txId: string) => Promise<void>;
  resetDemoLedger: (customInitialUsdt?: number, preserveUserTransactions?: boolean) => void;
  importTransactions: (records: LedgerTransaction[]) => number;

  // Global Modal & Sheet Controllers
  transferModalState: {
    isOpen: boolean;
    defaultFrom?: WalletAccountType;
    defaultTo?: WalletAccountType;
    defaultAsset?: string;
  };
  openTransferModal: (opts?: {
    from?: WalletAccountType;
    to?: WalletAccountType;
    asset?: string;
  }) => void;
  closeTransferModal: () => void;

  isDepositMethodSheetOpen: boolean;
  setDepositMethodSheetOpen: (open: boolean) => void;

  depositModalState: { isOpen: boolean; asset: string };
  openDepositModal: (asset?: string) => void;
  closeDepositModal: () => void;

  withdrawModalState: { isOpen: boolean; asset: string };
  openWithdrawModal: (asset?: string) => void;
  closeWithdrawModal: () => void;

  historyModalOpen: boolean;
  setHistoryModalOpen: (open: boolean) => void;

  selectedTxDetail: LedgerTransaction | null;
  setSelectedTxDetail: (tx: LedgerTransaction | null) => void;

  coinDetailSymbol: string | null;
  setCoinDetailSymbol: (symbol: string | null) => void;

  isProfileDrawerOpen: boolean;
  setProfileDrawerOpen: (open: boolean) => void;

  isMessagesModalOpen: boolean;
  setMessagesModalOpen: (open: boolean) => void;

  isPayModalOpen: boolean;
  setPayModalOpen: (open: boolean) => void;

  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Phase 4 & 5: Server-Side SQLite Ledger, Statement Verification & Exchange API Sync
  accountMode: AccountVerificationMode;
  statementId: string | null;
  serverAuditLogs: ServerAuditLogEntry[];
  backendCapabilities: BackendCapabilities | null;
  fxProvenance: { source: string; updatedAt: number; provenance: string };
  switchAccountVerificationMode: (
    mode: 'verified_statement' | 'unverified_empty',
    customTargetUsdt?: number
  ) => Promise<{ ok: boolean; message: string }>;
  syncReadOnlyExchangeApi: () => Promise<{ ok: boolean; message: string }>;
}

const ExchangeContext = createContext<ExchangeContextValue | null>(null);

export const ExchangeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialBundle = useMemo(() => loadOrMigrateLedger(), []);

  // Navigation state
  const [appMode, setAppMode] = useState<AppMode>('exchange');
  const [exchangeTab, setExchangeTab] = useState<ExchangeNavTab>('home');
  const [walletTab, setWalletTab] = useState<WalletNavTab>('home');
  const [assetsSubTab, setAssetsSubTab] = useState<'overview' | 'spot' | 'futures' | 'funding' | 'earn'>('overview');
  const [tradeSubTab, setTradeSubTab] = useState<'convert' | 'spot' | 'stocks' | 'p2p' | 'alpha'>('spot');
  const [futuresSubTab, setFuturesSubTab] = useState<'usdm' | 'coinm' | 'options' | 'smart_money'>('usdm');

  // System 1: Live Market State
  const [tickers, setTickers] = useState<Record<string, MarketTicker>>({});
  const [stocks] = useState<StockTicker[]>(INITIAL_STOCKS);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [isRefreshingMarket, setIsRefreshingMarket] = useState<boolean>(false);
  const isRefreshingMarketRef = useRef<boolean>(false);
  const [activeSymbol, setActiveSymbol] = useState<string>('BTCUSDT');
  const [activeInterval, setActiveInterval] = useState<KlineInterval>('15m');
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [isLoadingCandles, setIsLoadingCandles] = useState<boolean>(true);
  const [orderBook, setOrderBook] = useState<OrderBookData>({
    symbol: 'BTCUSDT',
    bids: [],
    asks: [],
    lastUpdated: 0,
  });
  const [recentTrades, setRecentTrades] = useState<TradeExecution[]>([]);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('nexus_favorites_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore storage read error
    }
    return ['USDTUSD', 'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'TRUMPUSDT'];
  });

  // System 2: Persistent Portfolio & Ledger State
  const [wallets, setWallets] = useState<WalletsState>(initialBundle.wallets);
  const [transactions, setTransactions] = useState<LedgerTransaction[]>(initialBundle.transactions);
  const [spotOrders, setSpotOrders] = useState<SpotOrder[]>(initialBundle.spotOrders);
  const [futuresPositions, setFuturesPositions] = useState<FuturesPosition[]>(
    initialBundle.futuresPositions
  );
  const [earnSubscriptions, setEarnSubscriptions] = useState<EarnSubscription[]>(
    initialBundle.earnSubscriptions
  );
  const [p2pOrders, setP2pOrders] = useState<P2POrder[]>(initialBundle.p2pOrders);
  const [settings, setSettings] = useState<UserSettings>(initialBundle.settings);
  const [web3Wallet, setWeb3Wallet] = useState<Web3WalletState>(initialBundle.web3Wallet);

  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([
    { id: 'alert-1', symbol: 'BTCUSDT', targetPrice: 80000, condition: 'ABOVE', active: true, createdAt: Date.now() - 7200000 },
    { id: 'alert-2', symbol: 'USDTUSD', targetPrice: 1.0005, condition: 'ABOVE', active: true, createdAt: Date.now() - 3600000 },
  ]);

  // Global Modal states
  const [transferModalState, setTransferModalState] = useState<{
    isOpen: boolean;
    defaultFrom?: WalletAccountType;
    defaultTo?: WalletAccountType;
    defaultAsset?: string;
  }>({ isOpen: false });
  const [isDepositMethodSheetOpen, setDepositMethodSheetOpen] = useState(false);
  const [depositModalState, setDepositModalState] = useState<{ isOpen: boolean; asset: string }>({
    isOpen: false,
    asset: 'USDT',
  });
  const [withdrawModalState, setWithdrawModalState] = useState<{ isOpen: boolean; asset: string }>({
    isOpen: false,
    asset: 'USDT',
  });
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedTxDetail, setSelectedTxDetail] = useState<LedgerTransaction | null>(null);
  const [coinDetailSymbol, setCoinDetailSymbol] = useState<string | null>(null);
  const [isProfileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [isMessagesModalOpen, setMessagesModalOpen] = useState(false);
  const [isPayModalOpen, setPayModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [accountMode, setAccountMode] = useState<AccountVerificationMode>(
    initialBundle.settings.accountMode || 'unverified_empty'
  );
  const [statementId, setStatementId] = useState<string | null>(
    initialBundle.settings.statementId ?? null
  );
  const [serverAuditLogs, setServerAuditLogs] = useState<ServerAuditLogEntry[]>([]);
  const [backendCapabilities, setBackendCapabilities] = useState<BackendCapabilities | null>(null);
  const [fxProvenance, setFxProvenance] = useState<{
    source: string;
    updatedAt: number;
    provenance: string;
  }>({
    source: 'ExchangeRate-API Live Global FX Feed',
    updatedAt: Date.now(),
    provenance: 'live_fx_api',
  });

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 3200);
  }, []);

  // Hydrate server-side SQLite state & live FX rates on mount
  useEffect(() => {
    let cancelled = false;
    fetch('/api/ledger/state')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data || !data.ok) return;
        if (data.wallets) setWallets(data.wallets);
        if (Array.isArray(data.transactions)) {
          setTransactions(deduplicateTransactions(data.transactions));
        }
        if (data.user?.accountMode) {
          setAccountMode(data.user.accountMode);
          setStatementId(data.user.statementId || null);
          if (data.user.accountMode === 'unverified_empty') {
            setSpotOrders([]);
          }
        }
        if (Array.isArray(data.auditLogs)) {
          setServerAuditLogs(data.auditLogs);
        }
        if (data.backendCapabilities) {
          setBackendCapabilities(data.backendCapabilities);
        }
        if (data.fxCache?.rates) {
          updateLiveFiatRates(data.fxCache.rates);
          setFxProvenance({
            source: data.fxCache.source || 'Live FX API',
            updatedAt: data.fxCache.updatedAt || Date.now(),
            provenance: data.fxCache.provenance || 'live_fx_api',
          });
        }
      })
      .catch(() => {
        // Server API fallback if running static preview
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const appendTransaction = useCallback((newTx: LedgerTransaction) => {
    setTransactions((prev) => deduplicateTransactions([newTx, ...prev]));
    // Mirror validated ledger transaction to server-side SQLite database
    fetch('/api/ledger/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transaction: newTx,
        actionLabel: `LEDGER_${newTx.type.toUpperCase()}`,
      }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.auditLogs) setServerAuditLogs(data.auditLogs);
      })
      .catch(() => {});
  }, []);

  // Sync theme class with document.documentElement
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  // Persist ledger state to localStorage v4 AND sync wallet balances to server SQLite
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          wallets,
          transactions,
          spotOrders,
          futuresPositions,
          earnSubscriptions,
          p2pOrders,
          settings,
          web3Wallet,
        })
      );
      fetch('/api/ledger/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallets }),
      }).catch(() => {});
    } catch {
      // ignore storage quota errors
    }
  }, [wallets, transactions, spotOrders, futuresPositions, earnSubscriptions, p2pOrders, settings, web3Wallet]);

  // Connect live market service on mount
  useEffect(() => {
    marketService.start({
      onTickers: (map, ts) => {
        setTickers(map);
        setLastUpdated(ts);
      },
      onStatus: (st) => {
        setConnectionStatus(st);
      },
      onOrderBook: (book) => {
        setOrderBook(book);
      },
      onTrade: (trade) => {
        setRecentTrades((prev) => [trade, ...prev.slice(0, 29)]);
      },
      onCandle: (liveCandle) => {
        setCandles((prev) => {
          if (prev.length === 0) return [liveCandle];
          const last = prev[prev.length - 1];
          if (last.time === liveCandle.time) {
            return [...prev.slice(0, -1), liveCandle];
          }
          if (liveCandle.time > last.time) {
            return [...prev.slice(1), liveCandle];
          }
          return prev;
        });
      },
    });

    return () => {
      marketService.stop();
    };
  }, []);

  // Load historical candles and subscribe pair stream whenever activeSymbol or activeInterval changes
  useEffect(() => {
    let cancelled = false;
    setIsLoadingCandles(true);
    setRecentTrades([]);

    marketService
      .fetchHistoricalCandles(activeSymbol, activeInterval, 120)
      .then((data) => {
        if (!cancelled) {
          setCandles(data);
          setIsLoadingCandles(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIsLoadingCandles(false);
        }
      });

    marketService.subscribeActivePair(activeSymbol, activeInterval);

    return () => {
      cancelled = true;
    };
  }, [activeSymbol, activeInterval]);

  // Automatically fill open limit / stop-limit orders in Demo Spot Ledger if live price crosses trigger/limit price
  useEffect(() => {
    if (spotOrders.length === 0) return;
    const openOrders = spotOrders.filter((o) => o.status === 'OPEN');
    if (openOrders.length === 0) return;

    openOrders.forEach((order) => {
      const livePrice = tickers[order.symbol]?.lastPrice;
      if (!livePrice || livePrice <= 0) return;
      const stopTriggered =
        order.type !== 'STOP_LIMIT' ||
        !order.stopPrice ||
        (order.side === 'BUY' && livePrice >= order.stopPrice) ||
        (order.side === 'SELL' && livePrice <= order.stopPrice);

      const shouldFill =
        stopTriggered &&
        ((order.side === 'BUY' && livePrice <= order.price) ||
          (order.side === 'SELL' && livePrice >= order.price));

      if (shouldFill) {
        const feeQuote = Number((order.totalQuote * 0.001).toFixed(4));
        setSpotOrders((prev) =>
          prev.map((o) =>
            o.id === order.id
              ? { ...o, status: 'FILLED', filledQuantity: o.quantity, feeQuote, isDemo: true }
              : o
          )
        );
        setWallets((prev) => {
          const next = structuredClone(prev);
          const spot = next.spot;
          if (!spot[order.baseAsset]) {
            spot[order.baseAsset] = { asset: order.baseAsset, name: order.baseAsset, available: 0, locked: 0 };
          }
          if (!spot[order.quoteAsset]) {
            spot[order.quoteAsset] = { asset: order.quoteAsset, name: order.quoteAsset, available: 0, locked: 0 };
          }

          if (order.side === 'BUY') {
            spot[order.quoteAsset].locked = Math.max(0, spot[order.quoteAsset].locked - order.totalQuote);
            if (spot[order.quoteAsset].available >= feeQuote) {
              spot[order.quoteAsset].available = Number(
                (spot[order.quoteAsset].available - feeQuote).toFixed(8)
              );
              spot[order.baseAsset].available = Number(
                (spot[order.baseAsset].available + order.quantity).toFixed(8)
              );
            } else {
              const netQty = Number((order.quantity * 0.999).toFixed(8));
              spot[order.baseAsset].available = Number(
                (spot[order.baseAsset].available + netQty).toFixed(8)
              );
            }
          } else {
            spot[order.baseAsset].locked = Math.max(0, spot[order.baseAsset].locked - order.quantity);
            const netProceeds = Math.max(0, Number((order.totalQuote - feeQuote).toFixed(8)));
            spot[order.quoteAsset].available = Number(
              (spot[order.quoteAsset].available + netProceeds).toFixed(8)
            );
          }
          return next;
        });

        const tx: LedgerTransaction = {
          id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          refId: order.refId,
          type: order.side === 'BUY' ? 'spot_buy' : 'spot_sell',
          asset: order.baseAsset,
          amount: order.quantity,
          secondaryAsset: order.quoteAsset,
          secondaryAmount: order.totalQuote,
          price: order.price,
          fee: feeQuote,
          fromAccount: 'spot',
          toAccount: 'spot',
          status: 'Completed',
          timestamp: Date.now(),
          note: `Demo Spot ${order.type} ${order.side} ${order.quantity} ${order.baseAsset} @ ${order.price} ${order.quoteAsset} Filled (Fee: ${feeQuote} ${order.quoteAsset})`,
          isDemo: true,
          isSampleData: false,
        };
        appendTransaction(tx);
        showToast(
          `Demo Spot Order Filled: ${order.side} ${order.quantity} ${order.baseAsset} @ ${order.price}`
        );
      }
    });
  }, [tickers, spotOrders, appendTransaction, showToast]);

  const tickerList = useMemo(() => {
    return TRACKED_COINS.map((meta) => {
      return (
        tickers[meta.symbol] || {
          symbol: meta.symbol,
          baseAsset: meta.baseAsset,
          quoteAsset: meta.quoteAsset,
          name: meta.name,
          lastPrice: 0,
          priceChange: 0,
          priceChangePercent: 0,
          high24h: 0,
          low24h: 0,
          volume24h: 0,
          quoteVolume24h: 0,
          marketCap: 0,
          category: meta.category,
          leverageTag: meta.leverageTag,
          isNewListing: meta.isNewListing,
          lastUpdated: 0,
          dataProvenance: 'unavailable',
          feedSource: 'Syncing Live Stream...',
        }
      );
    });
  }, [tickers]);

  const usdtTicker: MarketTicker = useMemo(() => {
    return (
      tickers['USDTUSD'] || {
        symbol: 'USDTUSD',
        baseAsset: 'USDT',
        quoteAsset: 'USD',
        name: 'TetherUS',
        lastPrice: 0,
        priceChange: 0,
        priceChangePercent: 0,
        high24h: 0,
        low24h: 0,
        volume24h: 0,
        quoteVolume24h: 0,
        marketCap: 0,
        category: 'Stablecoin',
        lastUpdated: 0,
        dataProvenance: 'unavailable',
        feedSource: 'Syncing Kraken USDTZUSD...',
      }
    );
  }, [tickers]);

  const getLiveUsdtUsdPrice = useCallback((): number => {
    const p = tickers['USDTUSD']?.lastPrice;
    if (p && p > 0.9 && p < 1.1) return p;
    return 1.0;
  }, [tickers]);

  const getAssetPriceUsdt = useCallback(
    (asset: string): number => {
      if (asset === 'USDT' || asset === 'USD' || asset === 'FDUSD') return 1;
      if (asset === 'USDC') return tickers['USDCUSDT']?.lastPrice || 1;
      const ticker = tickers[`${asset}USDT`];
      if (ticker && ticker.lastPrice > 0) return ticker.lastPrice;
      const stock = stocks.find((s) => s.symbol === asset);
      if (stock) return stock.lastPrice;
      return 0;
    },
    [tickers, stocks]
  );

  const getAssetPriceUsd = useCallback(
    (asset: string): number => {
      const liveUsdtUsd = getLiveUsdtUsdPrice();
      if (asset === 'USDT' || asset === 'USDTUSD') return liveUsdtUsd;
      if (asset === 'USD') return 1;
      return getAssetPriceUsdt(asset) * liveUsdtUsd;
    },
    [getLiveUsdtUsdPrice, getAssetPriceUsdt]
  );

  const getAccountValueUsdt = useCallback(
    (account: WalletAccountType): number => {
      const balances = wallets[account];
      if (!balances) return 0;
      let total = 0;
      Object.values(balances).forEach((b) => {
        const qty = b.available + b.locked;
        if (qty > 0) {
          total += qty * getAssetPriceUsdt(b.asset);
        }
      });

      if (account === 'usdm_futures') {
        futuresPositions
          .filter((p) => p.contractType === 'USDM')
          .forEach((pos) => {
            const mark = tickers[pos.symbol]?.lastPrice || pos.entryPrice;
            const pnl =
              pos.side === 'LONG'
                ? (mark - pos.entryPrice) * pos.sizeAsset
                : (pos.entryPrice - mark) * pos.sizeAsset;
            total += pos.marginUsdt + pnl;
          });
      }
      if (account === 'coinm_futures') {
        futuresPositions
          .filter((p) => p.contractType === 'COINM')
          .forEach((pos) => {
            const mark = tickers[pos.symbol]?.lastPrice || pos.entryPrice;
            const pnl =
              pos.side === 'LONG'
                ? (mark - pos.entryPrice) * pos.sizeAsset
                : (pos.entryPrice - mark) * pos.sizeAsset;
            total += pos.marginUsdt + pnl;
          });
      }
      return Math.max(0, total);
    },
    [wallets, getAssetPriceUsdt, futuresPositions, tickers]
  );

  const getAccountValueUsd = useCallback(
    (account: WalletAccountType): number => {
      return getAccountValueUsdt(account) * getLiveUsdtUsdPrice();
    },
    [getAccountValueUsdt, getLiveUsdtUsdPrice]
  );

  const getTotalPortfolioUsdt = useCallback((): number => {
    return WALLET_ACCOUNTS.reduce((sum, acc) => sum + getAccountValueUsdt(acc.id), 0);
  }, [getAccountValueUsdt]);

  const getTotalPortfolioUsd = useCallback((): number => {
    return getTotalPortfolioUsdt() * getLiveUsdtUsdPrice();
  }, [getTotalPortfolioUsdt, getLiveUsdtUsdPrice]);

  const getTotalUsdtSummary = useCallback(() => {
    let available = 0;
    let locked = 0;
    WALLET_ACCOUNTS.forEach((acc) => {
      available += wallets[acc.id]?.USDT?.available || 0;
      locked += wallets[acc.id]?.USDT?.locked || 0;
    });
    const total = available + locked;
    const usdValue = total * getLiveUsdtUsdPrice();
    return { available, locked, total, usdValue };
  }, [wallets, getLiveUsdtUsdPrice]);

  const toggleFavorite = useCallback((symbol: string) => {
    setFavorites((prev) => {
      const next = prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol];
      try {
        localStorage.setItem('nexus_favorites_v2', JSON.stringify(next));
      } catch {
        // ignore storage error
      }
      return next;
    });
  }, []);

  const setFavoritesList = useCallback((symbols: string[]) => {
    setFavorites(symbols);
    try {
      localStorage.setItem('nexus_favorites_v2', JSON.stringify(symbols));
    } catch {
      // ignore storage error
    }
  }, []);

  const refreshMarketData = useCallback(
    async (silent = false) => {
      if (isRefreshingMarketRef.current) return;
      isRefreshingMarketRef.current = true;
      setIsRefreshingMarket(true);
      const startedAt = Date.now();
      try {
        await Promise.allSettled([
          marketService.refreshNow(),
          marketService.subscribeActivePair(activeSymbol, activeInterval),
          fetch('/api/fx/rates')
            .then((r) => (r.ok ? r.json() : null))
            .then((fxData) => {
              if (fxData?.rates) {
                updateLiveFiatRates(fxData.rates);
                setFxProvenance({
                  source: fxData.source || 'Live FX API',
                  updatedAt: fxData.updatedAt || Date.now(),
                  provenance: fxData.provenance || 'live_fx_api',
                });
              }
            }),
        ]);
        const freshMap = marketService.getTickers();
        if (Object.keys(freshMap).length > 0) {
          setTickers({ ...freshMap });
          setLastUpdated(Date.now());
        }
        if (!silent) {
          showToast('Live market prices & portfolio data refreshed');
        }
      } finally {
        const elapsed = Date.now() - startedAt;
        const remaining = Math.max(0, 450 - elapsed);
        if (remaining > 0) {
          await new Promise((r) => setTimeout(r, remaining));
        }
        isRefreshingMarketRef.current = false;
        setIsRefreshingMarket(false);
      }
    },
    [activeSymbol, activeInterval, showToast]
  );

  // System 3: Internal Transfer Execution
  const executeTransfer = useCallback(
    ({
      fromAccount,
      toAccount,
      asset,
      amount,
    }: {
      fromAccount: WalletAccountType;
      toAccount: WalletAccountType;
      asset: string;
      amount: number;
    }) => {
      if (fromAccount === toAccount) {
        return { ok: false, message: 'Source and destination wallets must be different.' };
      }
      if (!Number.isFinite(amount) || amount <= 0) {
        return { ok: false, message: 'Please enter a valid positive transfer amount.' };
      }

      const currentAvail = wallets[fromAccount]?.[asset]?.available || 0;
      if (amount > currentAvail + 1e-9) {
        return {
          ok: false,
          message: `Insufficient available balance (${currentAvail} ${asset}).`,
        };
      }

      const finalAmount = Math.min(amount, currentAvail);

      setWallets((prev) => {
        const next = structuredClone(prev);
        if (!next[fromAccount][asset]) {
          next[fromAccount][asset] = { asset, name: asset, available: 0, locked: 0 };
        }
        if (!next[toAccount][asset]) {
          next[toAccount][asset] = { asset, name: asset, available: 0, locked: 0 };
        }
        next[fromAccount][asset].available = Math.max(
          0,
          Number((next[fromAccount][asset].available - finalAmount).toFixed(8))
        );
        next[toAccount][asset].available = Number(
          (next[toAccount][asset].available + finalAmount).toFixed(8)
        );
        return next;
      });

      const fromLabel = WALLET_ACCOUNTS.find((a) => a.id === fromAccount)?.label || fromAccount;
      const toLabel = WALLET_ACCOUNTS.find((a) => a.id === toAccount)?.label || toAccount;

      const tx: LedgerTransaction = {
        id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        refId: generateRefId('TRF'),
        type: 'transfer',
        asset,
        amount: finalAmount,
        fee: 0,
        fromAccount,
        toAccount,
        status: 'Completed',
        timestamp: Date.now(),
        note: `Internal Transfer from ${fromLabel} to ${toLabel}`,
        isDemo: true,
        isSampleData: false,
      };

      appendTransaction(tx);
      return { ok: true, message: `Transferred ${finalAmount} ${asset} to ${toLabel}`, tx };
    },
    [wallets, appendTransaction]
  );

  const requestDeposit = useCallback(
    ({
      asset,
      network,
      amount,
      toAccount = 'spot',
    }: {
      asset: string;
      network: string;
      amount: number;
      toAccount?: WalletAccountType;
    }) => {
      if (!Number.isFinite(amount) || amount <= 0) {
        return { ok: false, message: 'Enter a valid deposit amount.' };
      }
      setWallets((prev) => {
        const next = structuredClone(prev);
        if (!next[toAccount][asset]) {
          next[toAccount][asset] = { asset, name: asset, available: 0, locked: 0 };
        }
        next[toAccount][asset].available = Number(
          (next[toAccount][asset].available + amount).toFixed(8)
        );
        return next;
      });

      const tx: LedgerTransaction = {
        id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        refId: generateRefId('DEP'),
        type: 'deposit',
        asset,
        amount,
        fee: 0,
        toAccount,
        network: `${network} · Simulated`,
        status: 'Completed',
        timestamp: Date.now(),
        note: `Simulated Deposit credited to ${WALLET_ACCOUNTS.find((a) => a.id === toAccount)?.label || 'Spot Wallet'}`,
        isDemo: true,
        isSampleData: false,
      };
      appendTransaction(tx);
      showToast(`Simulated Deposit Credited: +${amount.toLocaleString()} ${asset}`);
      return { ok: true, message: `Credited ${amount} ${asset} to Preview Portfolio`, tx };
    },
    [appendTransaction, showToast]
  );

  const requestWithdraw = useCallback(
    ({
      asset,
      network,
      address,
      amount,
      fromAccount = 'spot',
    }: {
      asset: string;
      network: string;
      address: string;
      amount: number;
      fromAccount?: WalletAccountType;
    }) => {
      if (!address || address.trim().length < 6) {
        return { ok: false, message: 'Please enter a valid recipient address.' };
      }
      if (!Number.isFinite(amount) || amount <= 0) {
        return { ok: false, message: 'Please enter a valid withdrawal amount.' };
      }
      const avail = wallets[fromAccount]?.[asset]?.available || 0;
      if (amount > avail) {
        return { ok: false, message: `Insufficient balance (${avail} ${asset} available).` };
      }

      const fee = asset === 'USDT' ? 1 : Number((amount * 0.0005).toFixed(6));
      if (amount <= fee) {
        return { ok: false, message: `Amount must be greater than network fee (${fee} ${asset}).` };
      }

      setWallets((prev) => {
        const next = structuredClone(prev);
        next[fromAccount][asset].available = Math.max(
          0,
          Number((next[fromAccount][asset].available - amount).toFixed(8))
        );
        return next;
      });

      const tx: LedgerTransaction = {
        id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        refId: generateRefId('WDR'),
        type: 'withdraw',
        asset,
        amount,
        fee,
        fromAccount,
        network: `${network} · Simulated`,
        address: address.trim(),
        status: 'Completed',
        timestamp: Date.now(),
        note: `Simulated Withdrawal Request (${network})`,
        isDemo: true,
        isSampleData: false,
      };
      appendTransaction(tx);
      showToast(`Simulated Withdrawal Recorded: -${amount.toLocaleString()} ${asset}`);
      return { ok: true, message: 'Withdrawal recorded in internal ledger.', tx };
    },
    [wallets, appendTransaction, showToast]
  );

  const executeConvert = useCallback(
    ({
      fromAsset,
      toAsset,
      fromAmount,
      walletType = 'spot',
    }: {
      fromAsset: string;
      toAsset: string;
      fromAmount: number;
      walletType?: WalletAccountType;
    }) => {
      if (fromAsset === toAsset) {
        return { ok: false, message: 'Select two different assets to convert.' };
      }
      if (!Number.isFinite(fromAmount) || fromAmount <= 0) {
        return { ok: false, message: 'Enter a valid amount to convert.' };
      }
      const avail = wallets[walletType]?.[fromAsset]?.available || 0;
      if (fromAmount > avail + 1e-9) {
        return { ok: false, message: `Insufficient ${fromAsset} available (${avail}).` };
      }

      const fromPrice = getAssetPriceUsd(fromAsset);
      const toPrice = getAssetPriceUsd(toAsset);
      if (fromPrice <= 0 || toPrice <= 0) {
        return { ok: false, message: 'Waiting for live market rate before converting.' };
      }

      const rate = fromPrice / toPrice;
      const receivedAmount = Number((fromAmount * rate).toFixed(8));

      setWallets((prev) => {
        const next = structuredClone(prev);
        if (!next[walletType][fromAsset]) {
          next[walletType][fromAsset] = { asset: fromAsset, name: fromAsset, available: 0, locked: 0 };
        }
        if (!next[walletType][toAsset]) {
          next[walletType][toAsset] = { asset: toAsset, name: toAsset, available: 0, locked: 0 };
        }
        next[walletType][fromAsset].available = Math.max(
          0,
          Number((next[walletType][fromAsset].available - fromAmount).toFixed(8))
        );
        next[walletType][toAsset].available = Number(
          (next[walletType][toAsset].available + receivedAmount).toFixed(8)
        );
        return next;
      });

      const tx: LedgerTransaction = {
        id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        refId: generateRefId('CNV'),
        type: 'convert',
        asset: fromAsset,
        amount: fromAmount,
        secondaryAsset: toAsset,
        secondaryAmount: receivedAmount,
        price: rate,
        fee: 0,
        fromAccount: walletType,
        toAccount: walletType,
        status: 'Completed',
        timestamp: Date.now(),
        note: `Converted ${fromAmount} ${fromAsset} to ${receivedAmount.toFixed(6)} ${toAsset} (Zero Fee)`,
        isDemo: true,
        isSampleData: false,
      };
      appendTransaction(tx);
      showToast(`Converted ${fromAmount} ${fromAsset} → ${receivedAmount.toFixed(5)} ${toAsset}`);
      return { ok: true, message: 'Conversion completed instantly', receivedAmount, rate, tx };
    },
    [wallets, getAssetPriceUsd, appendTransaction, showToast]
  );

  const placeSpotOrder = useCallback(
    ({
      symbol,
      side,
      type,
      price,
      stopPrice,
      quantity,
    }: {
      symbol: string;
      side: 'BUY' | 'SELL';
      type: 'LIMIT' | 'MARKET' | 'STOP_LIMIT';
      price: number;
      stopPrice?: number;
      quantity: number;
    }) => {
      const meta = TRACKED_COINS.find((c) => c.symbol === symbol);
      const baseAsset = meta?.baseAsset || symbol.replace(/USDT$|USD$/, '');
      const quoteAsset = meta?.quoteAsset === 'USD' ? 'USDT' : meta?.quoteAsset || 'USDT';
      const livePrice =
        symbol === 'USDTUSD' ? getLiveUsdtUsdPrice() : getAssetPriceUsdt(baseAsset);
      const execPrice = type === 'MARKET' ? livePrice : price;

      if (!Number.isFinite(execPrice) || execPrice <= 0) {
        return {
          ok: false,
          message:
            type === 'MARKET'
              ? 'Waiting for live market price feed before executing market order.'
              : 'Enter a valid positive limit price.',
        };
      }
      if (type === 'STOP_LIMIT' && (!stopPrice || !Number.isFinite(stopPrice) || stopPrice <= 0)) {
        return { ok: false, message: 'Enter a valid positive Stop trigger price for Stop-Limit order.' };
      }
      if (!Number.isFinite(quantity) || quantity <= 0) {
        return { ok: false, message: 'Enter a valid positive order quantity.' };
      }

      const totalQuote = Number((execPrice * quantity).toFixed(4));
      if (totalQuote < 1) {
        return {
          ok: false,
          message: `Minimum order value is 1.00 ${quoteAsset} (current: ${totalQuote.toFixed(4)} ${quoteAsset}).`,
        };
      }

      const spot = wallets.spot;

      if (side === 'BUY') {
        const availQuote = spot[quoteAsset]?.available || 0;
        if (totalQuote > availQuote + 1e-6) {
          return {
            ok: false,
            message: `Insufficient ${quoteAsset} in Demo Spot Wallet (${availQuote.toFixed(2)} ${quoteAsset} available).`,
          };
        }
      } else {
        const availBase = spot[baseAsset]?.available || 0;
        if (quantity > availBase + 1e-8) {
          return {
            ok: false,
            message: `Insufficient ${baseAsset} in Demo Spot Wallet (${availBase.toFixed(6)} ${baseAsset} available).`,
          };
        }
      }

      const refId = generateRefId('ORD');
      const isImmediate =
        type === 'MARKET' ||
        (type === 'LIMIT' &&
          ((side === 'BUY' && livePrice > 0 && execPrice >= livePrice) ||
            (side === 'SELL' && livePrice > 0 && execPrice <= livePrice)));

      const finalPrice = isImmediate && livePrice > 0 ? livePrice : execPrice;
      const finalQuote = Number((finalPrice * quantity).toFixed(4));
      const feeQuote = Number((finalQuote * 0.001).toFixed(4));

      setWallets((prev) => {
        const next = structuredClone(prev);
        if (!next.spot[baseAsset]) {
          next.spot[baseAsset] = { asset: baseAsset, name: baseAsset, available: 0, locked: 0 };
        }
        if (!next.spot[quoteAsset]) {
          next.spot[quoteAsset] = { asset: quoteAsset, name: quoteAsset, available: 0, locked: 0 };
        }

        if (isImmediate) {
          if (side === 'BUY') {
            const remainingAfterPrincipal = Math.max(
              0,
              next.spot[quoteAsset].available - finalQuote
            );
            if (remainingAfterPrincipal >= feeQuote) {
              next.spot[quoteAsset].available = Number(
                (remainingAfterPrincipal - feeQuote).toFixed(8)
              );
              next.spot[baseAsset].available = Number(
                (next.spot[baseAsset].available + quantity).toFixed(8)
              );
            } else {
              next.spot[quoteAsset].available = Number(remainingAfterPrincipal.toFixed(8));
              const netQty = Number((quantity * 0.999).toFixed(8));
              next.spot[baseAsset].available = Number(
                (next.spot[baseAsset].available + netQty).toFixed(8)
              );
            }
          } else {
            next.spot[baseAsset].available = Math.max(
              0,
              Number((next.spot[baseAsset].available - quantity).toFixed(8))
            );
            const netProceeds = Math.max(0, Number((finalQuote - feeQuote).toFixed(8)));
            next.spot[quoteAsset].available = Number(
              (next.spot[quoteAsset].available + netProceeds).toFixed(8)
            );
          }
        } else {
          if (side === 'BUY') {
            next.spot[quoteAsset].available = Math.max(
              0,
              Number((next.spot[quoteAsset].available - totalQuote).toFixed(8))
            );
            next.spot[quoteAsset].locked = Number(
              (next.spot[quoteAsset].locked + totalQuote).toFixed(8)
            );
          } else {
            next.spot[baseAsset].available = Math.max(
              0,
              Number((next.spot[baseAsset].available - quantity).toFixed(8))
            );
            next.spot[baseAsset].locked = Number(
              (next.spot[baseAsset].locked + quantity).toFixed(8)
            );
          }
        }
        return next;
      });

      const newOrder: SpotOrder = {
        id: `ord-${Date.now()}`,
        refId,
        symbol,
        baseAsset,
        quoteAsset,
        side,
        type,
        price: finalPrice,
        stopPrice: type === 'STOP_LIMIT' ? stopPrice : undefined,
        quantity,
        filledQuantity: isImmediate ? quantity : 0,
        totalQuote: isImmediate ? finalQuote : totalQuote,
        feeQuote,
        status: isImmediate ? 'FILLED' : 'OPEN',
        timestamp: Date.now(),
        isDemo: true,
      };
      setSpotOrders((prev) => [newOrder, ...prev]);

      if (isImmediate) {
        const tx: LedgerTransaction = {
          id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          refId,
          type: side === 'BUY' ? 'spot_buy' : 'spot_sell',
          asset: baseAsset,
          amount: quantity,
          secondaryAsset: quoteAsset,
          secondaryAmount: finalQuote,
          price: finalPrice,
          fee: feeQuote,
          fromAccount: 'spot',
          toAccount: 'spot',
          status: 'Completed',
          timestamp: Date.now(),
          note: `Demo Spot ${type} ${side} ${quantity} ${baseAsset} @ ${finalPrice.toFixed(2)} ${quoteAsset} (Fee: ${feeQuote} ${quoteAsset})`,
          isDemo: true,
          isSampleData: false,
        };
        appendTransaction(tx);
        showToast(
          `Demo Spot ${side} ${quantity} ${baseAsset} filled @ ${finalPrice.toFixed(2)} ${quoteAsset}`
        );
        return {
          ok: true,
          message: `Demo Spot Order filled @ ${finalPrice.toFixed(2)} ${quoteAsset} (Simulated Ledger)`,
        };
      } else {
        showToast(`Demo Spot ${type} ${side} order placed @ ${execPrice} ${quoteAsset}`);
        return {
          ok: true,
          message: `Demo Spot ${type} ${side} order placed in Open Orders`,
        };
      }
    },
    [wallets.spot, getAssetPriceUsdt, getLiveUsdtUsdPrice, appendTransaction, showToast]
  );

  const cancelSpotOrder = useCallback(
    (orderId: string) => {
      const target = spotOrders.find((o) => o.id === orderId && o.status === 'OPEN');
      if (!target) return;

      setSpotOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'CANCELLED' } : o))
      );

      setWallets((prev) => {
        const next = structuredClone(prev);
        if (target.side === 'BUY') {
          next.spot[target.quoteAsset].locked = Math.max(
            0,
            next.spot[target.quoteAsset].locked - target.totalQuote
          );
          next.spot[target.quoteAsset].available += target.totalQuote;
        } else {
          next.spot[target.baseAsset].locked = Math.max(
            0,
            next.spot[target.baseAsset].locked - target.quantity
          );
          next.spot[target.baseAsset].available += target.quantity;
        }
        return next;
      });
      showToast(
        `Demo Order ${target.refId} cancelled; ${
          target.side === 'BUY'
            ? `${target.totalQuote} ${target.quoteAsset}`
            : `${target.quantity} ${target.baseAsset}`
        } unlocked`
      );
    },
    [spotOrders, showToast]
  );

  const openFuturesPosition = useCallback(
    ({
      symbol,
      contractType,
      side,
      marginMode,
      leverage,
      marginUsdt,
      orderType = 'MARKET',
      limitPrice,
      takeProfit,
      stopLoss,
    }: {
      symbol: string;
      contractType: 'USDM' | 'COINM';
      side: 'LONG' | 'SHORT';
      marginMode: 'Cross' | 'Isolated';
      leverage: number;
      marginUsdt: number;
      orderType?: 'MARKET' | 'LIMIT';
      limitPrice?: number;
      takeProfit?: number;
      stopLoss?: number;
    }) => {
      const walletKey: WalletAccountType =
        contractType === 'USDM' ? 'usdm_futures' : 'coinm_futures';
      const availMargin = wallets[walletKey]?.USDT?.available || 0;

      if (!Number.isFinite(leverage) || leverage < 1 || leverage > 125) {
        return { ok: false, message: 'Leverage must be between 1x and 125x.' };
      }
      if (!Number.isFinite(marginUsdt) || marginUsdt <= 0) {
        return { ok: false, message: 'Enter a valid positive margin collateral amount.' };
      }
      if (marginUsdt < 5) {
        return { ok: false, message: 'Minimum futures margin collateral is 5.00 USDT.' };
      }
      if (marginUsdt > availMargin + 1e-6) {
        return {
          ok: false,
          message: `Insufficient margin in Demo ${
            contractType === 'USDM' ? 'USDⓈ-M' : 'COIN-M'
          } Futures wallet (${availMargin.toFixed(2)} USDT available). Use Transfer Funds first.`,
        };
      }

      const baseAsset = symbol.replace(/USDT$|USD$/, '');
      const liveMarkPrice =
        symbol === 'USDTUSD' ? getLiveUsdtUsdPrice() : getAssetPriceUsdt(baseAsset);
      if (liveMarkPrice <= 0) {
        return { ok: false, message: 'Waiting for live mark price from market stream.' };
      }

      if (orderType === 'LIMIT' && (!limitPrice || !Number.isFinite(limitPrice) || limitPrice <= 0)) {
        return { ok: false, message: 'Enter a valid positive limit order price.' };
      }

      const entryPrice = orderType === 'LIMIT' && limitPrice ? limitPrice : liveMarkPrice;

      if (takeProfit !== undefined && takeProfit > 0) {
        if (side === 'LONG' && takeProfit <= entryPrice) {
          return {
            ok: false,
            message: `For a LONG position, Take Profit ($${takeProfit}) must be above Entry Price ($${entryPrice.toFixed(2)}).`,
          };
        }
        if (side === 'SHORT' && takeProfit >= entryPrice) {
          return {
            ok: false,
            message: `For a SHORT position, Take Profit ($${takeProfit}) must be below Entry Price ($${entryPrice.toFixed(2)}).`,
          };
        }
      }

      if (stopLoss !== undefined && stopLoss > 0) {
        if (side === 'LONG' && stopLoss >= entryPrice) {
          return {
            ok: false,
            message: `For a LONG position, Stop Loss ($${stopLoss}) must be below Entry Price ($${entryPrice.toFixed(2)}).`,
          };
        }
        if (side === 'SHORT' && stopLoss <= entryPrice) {
          return {
            ok: false,
            message: `For a SHORT position, Stop Loss ($${stopLoss}) must be above Entry Price ($${entryPrice.toFixed(2)}).`,
          };
        }
      }

      const feeRate = orderType === 'LIMIT' ? 0.0002 : 0.0004;
      const rawNotional = marginUsdt * leverage;
      const openFeeUsdt = Number((rawNotional * feeRate).toFixed(4));
      // If user allocated 100% of available margin, ensure margin + fee fits within availMargin
      const effectiveMarginUsdt =
        marginUsdt + openFeeUsdt > availMargin
          ? Number(Math.max(0, availMargin - openFeeUsdt).toFixed(4))
          : marginUsdt;
      const notionalUsdt = Number((effectiveMarginUsdt * leverage).toFixed(4));
      const sizeAsset = Number((notionalUsdt / entryPrice).toFixed(6));
      const mmr = 0.004; // 0.40% maintenance margin rate
      const maintenanceMarginUsdt = Number((notionalUsdt * mmr).toFixed(4));
      const liquidationPrice =
        side === 'LONG'
          ? Math.max(0.0001, Number((entryPrice * (1 - 1 / leverage + mmr)).toFixed(4)))
          : Number((entryPrice * (1 + 1 / leverage - mmr)).toFixed(4));

      setWallets((prev) => {
        const next = structuredClone(prev);
        next[walletKey].USDT.available = Math.max(
          0,
          Number((next[walletKey].USDT.available - effectiveMarginUsdt - openFeeUsdt).toFixed(4))
        );
        return next;
      });

      const pos: FuturesPosition = {
        id: `pos-${Date.now()}`,
        symbol,
        contractType,
        side,
        marginMode,
        leverage,
        sizeAsset,
        notionalUsdt,
        marginUsdt: effectiveMarginUsdt,
        maintenanceMarginUsdt,
        openFeeUsdt,
        orderType,
        entryPrice,
        liquidationPrice,
        takeProfit,
        stopLoss,
        timestamp: Date.now(),
        isDemo: true,
      };

      setFuturesPositions((prev) => [pos, ...prev]);

      const tx: LedgerTransaction = {
        id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        refId: generateRefId('FUT'),
        type: 'futures_open',
        asset: 'USDT',
        amount: effectiveMarginUsdt,
        price: entryPrice,
        fee: openFeeUsdt,
        fromAccount: walletKey,
        toAccount: walletKey,
        status: 'Completed',
        timestamp: Date.now(),
        note: `Demo ${contractType} ${orderType} ${side} ${leverage}x ${symbol} (${sizeAsset} ${baseAsset}) @ ${entryPrice.toFixed(2)} (Fee: ${openFeeUsdt} USDT)`,
        isDemo: true,
        isSampleData: false,
      };
      appendTransaction(tx);
      showToast(`Demo Futures Position Opened: ${side} ${leverage}x ${symbol}`);
      return { ok: true, message: 'Demo futures position opened in simulated ledger' };
    },
    [wallets, getAssetPriceUsdt, getLiveUsdtUsdPrice, appendTransaction, showToast]
  );

  const closeFuturesPosition = useCallback(
    (positionId: string) => {
      const pos = futuresPositions.find((p) => p.id === positionId);
      if (!pos) return { ok: false, message: 'Position not found' };

      const baseAsset = pos.symbol.replace(/USDT$|USD$/, '');
      const markPrice =
        pos.symbol === 'USDTUSD'
          ? getLiveUsdtUsdPrice()
          : getAssetPriceUsdt(baseAsset) || pos.entryPrice;
      const pnl =
        pos.side === 'LONG'
          ? (markPrice - pos.entryPrice) * pos.sizeAsset
          : (pos.entryPrice - markPrice) * pos.sizeAsset;
      const closeFeeUsdt = Number((pos.notionalUsdt * 0.0004).toFixed(4));
      const returnedUsdt = Math.max(0, Number((pos.marginUsdt + pnl - closeFeeUsdt).toFixed(4)));
      const walletKey: WalletAccountType =
        pos.contractType === 'USDM' ? 'usdm_futures' : 'coinm_futures';

      setFuturesPositions((prev) => prev.filter((p) => p.id !== positionId));
      setWallets((prev) => {
        const next = structuredClone(prev);
        next[walletKey].USDT.available = Number(
          (next[walletKey].USDT.available + returnedUsdt).toFixed(4)
        );
        return next;
      });

      const tx: LedgerTransaction = {
        id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        refId: generateRefId('FCL'),
        type: 'futures_close',
        asset: 'USDT',
        amount: returnedUsdt,
        price: markPrice,
        fee: closeFeeUsdt,
        fromAccount: walletKey,
        toAccount: walletKey,
        status: 'Completed',
        timestamp: Date.now(),
        note: `Demo Closed ${pos.side} ${pos.leverage}x ${pos.symbol} @ ${markPrice.toFixed(2)} (Net Realized PNL: ${pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} USDT, Fee: ${closeFeeUsdt} USDT)`,
        isDemo: true,
        isSampleData: false,
      };
      appendTransaction(tx);
      showToast(
        `Demo Position Closed. Realized PNL: ${pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} USDT`
      );
      return { ok: true, message: 'Demo position closed' };
    },
    [futuresPositions, getAssetPriceUsdt, getLiveUsdtUsdPrice, appendTransaction, showToast]
  );

  const updatePositionTpSl = useCallback(
    (positionId: string, takeProfit?: number, stopLoss?: number) => {
      setFuturesPositions((prev) =>
        prev.map((p) => (p.id === positionId ? { ...p, takeProfit, stopLoss } : p))
      );
      showToast('TP/SL targets updated');
    },
    [showToast]
  );

  const subscribeEarn = useCallback(
    (productId: string, amount: number) => {
      const product = EARN_PRODUCTS.find((p) => p.id === productId);
      if (!product) return { ok: false, message: 'Product not found.' };
      if (!Number.isFinite(amount) || amount < product.minAmount) {
        return { ok: false, message: `Minimum subscription is ${product.minAmount} ${product.asset}.` };
      }

      const spotAvail = wallets.spot[product.asset]?.available || 0;
      if (amount > spotAvail + 1e-8) {
        return {
          ok: false,
          message: `Insufficient ${product.asset} in Spot Wallet (${spotAvail} available).`,
        };
      }

      setWallets((prev) => {
        const next = structuredClone(prev);
        next.spot[product.asset].available = Math.max(0, next.spot[product.asset].available - amount);
        if (!next.earn[product.asset]) {
          next.earn[product.asset] = { asset: product.asset, name: product.name, available: 0, locked: 0 };
        }
        next.earn[product.asset].available += amount;
        return next;
      });

      const sub: EarnSubscription = {
        id: `sub-${Date.now()}`,
        productId: product.id,
        asset: product.asset,
        type: product.type,
        durationDays: product.durationDays,
        amount,
        apr: product.apr,
        accruedReward: Number(((amount * (product.apr / 100)) / 365).toFixed(6)),
        subscribedAt: Date.now(),
      };
      setEarnSubscriptions((prev) => [sub, ...prev]);

      const tx: LedgerTransaction = {
        id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        refId: generateRefId('ERN'),
        type: 'earn_subscribe',
        asset: product.asset,
        amount,
        fee: 0,
        fromAccount: 'spot',
        toAccount: 'earn',
        status: 'Completed',
        timestamp: Date.now(),
        note: `Subscribed ${amount} ${product.asset} to Simple Earn (${product.type} ${product.apr}% APR)`,
        isDemo: true,
        isSampleData: false,
      };
      appendTransaction(tx);
      showToast(`Subscribed ${amount} ${product.asset} @ ${product.apr}% APR`);
      return { ok: true, message: 'Subscription active' };
    },
    [wallets.spot, appendTransaction, showToast]
  );

  const redeemEarn = useCallback(
    (subscriptionId: string) => {
      const sub = earnSubscriptions.find((s) => s.id === subscriptionId);
      if (!sub) return { ok: false, message: 'Subscription not found.' };

      const totalReturn = Number((sub.amount + sub.accruedReward).toFixed(6));

      setEarnSubscriptions((prev) => prev.filter((s) => s.id !== subscriptionId));
      setWallets((prev) => {
        const next = structuredClone(prev);
        if (next.earn[sub.asset]) {
          next.earn[sub.asset].available = Math.max(0, next.earn[sub.asset].available - sub.amount);
        }
        if (!next.spot[sub.asset]) {
          next.spot[sub.asset] = { asset: sub.asset, name: sub.asset, available: 0, locked: 0 };
        }
        next.spot[sub.asset].available += totalReturn;
        return next;
      });

      const tx: LedgerTransaction = {
        id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        refId: generateRefId('RDM'),
        type: 'earn_redeem',
        asset: sub.asset,
        amount: totalReturn,
        fee: 0,
        fromAccount: 'earn',
        toAccount: 'spot',
        status: 'Completed',
        timestamp: Date.now(),
        note: `Redeemed ${sub.amount} ${sub.asset} + ${sub.accruedReward} ${sub.asset} yield to Spot Wallet`,
        isDemo: true,
        isSampleData: false,
      };
      appendTransaction(tx);
      showToast(`Redeemed ${totalReturn} ${sub.asset} to Spot Wallet`);
      return { ok: true, message: 'Redeemed to Spot Wallet' };
    },
    [earnSubscriptions, appendTransaction, showToast]
  );

  const createP2POrder = useCallback(
    ({
      listingId,
      fiatAmount,
      paymentMethod,
    }: {
      listingId: string;
      fiatAmount: number;
      paymentMethod: string;
    }) => {
      const listing = P2P_MERCHANTS.find((m) => m.id === listingId);
      if (!listing) return { ok: false, message: 'Merchant listing not found.' };
      if (!Number.isFinite(fiatAmount) || fiatAmount < listing.minFiat || fiatAmount > listing.maxFiat) {
        return {
          ok: false,
          message: `Order amount must be between ${listing.minFiat} and ${listing.maxFiat} ${listing.fiat}.`,
        };
      }

      const cryptoAmount = Number((fiatAmount / listing.price).toFixed(2));
      if (listing.side === 'SELL') {
        const availFunding = wallets.funding[listing.asset]?.available || 0;
        const availSpot = wallets.spot[listing.asset]?.available || 0;
        if (cryptoAmount > availFunding + availSpot) {
          return {
            ok: false,
            message: `Insufficient ${listing.asset} balance to sell (${(availFunding + availSpot).toFixed(2)} available).`,
          };
        }
      }

      const order: P2POrder = {
        id: `p2p-ord-${Date.now()}`,
        refId: generateRefId('P2P'),
        merchantName: listing.merchantName,
        side: listing.side,
        asset: listing.asset,
        fiat: listing.fiat,
        price: listing.price,
        fiatAmount,
        cryptoAmount,
        paymentMethod,
        status: 'Pending Payment',
        createdAt: Date.now(),
      };
      setP2pOrders((prev) => [order, ...prev]);
      showToast(`P2P Order ${order.refId} created`);
      return { ok: true, message: 'P2P Order created', order };
    },
    [wallets, showToast]
  );

  const completeP2POrder = useCallback(
    (orderId: string) => {
      const ord = p2pOrders.find((o) => o.id === orderId);
      if (!ord || ord.status !== 'Pending Payment') {
        return { ok: false, message: 'Order cannot be completed.' };
      }

      setP2pOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'Released' } : o))
      );

      setWallets((prev) => {
        const next = structuredClone(prev);
        if (!next.funding[ord.asset]) {
          next.funding[ord.asset] = { asset: ord.asset, name: ord.asset, available: 0, locked: 0 };
        }
        if (ord.side === 'BUY') {
          next.funding[ord.asset].available += ord.cryptoAmount;
        } else {
          if (next.funding[ord.asset].available >= ord.cryptoAmount) {
            next.funding[ord.asset].available -= ord.cryptoAmount;
          } else {
            const rem = ord.cryptoAmount - next.funding[ord.asset].available;
            next.funding[ord.asset].available = 0;
            next.spot[ord.asset].available = Math.max(0, next.spot[ord.asset].available - rem);
          }
        }
        return next;
      });

      const tx: LedgerTransaction = {
        id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        refId: ord.refId,
        type: ord.side === 'BUY' ? 'p2p_buy' : 'p2p_sell',
        asset: ord.asset,
        amount: ord.cryptoAmount,
        secondaryAsset: ord.fiat,
        secondaryAmount: ord.fiatAmount,
        price: ord.price,
        fee: 0,
        fromAccount: ord.side === 'BUY' ? undefined : 'funding',
        toAccount: ord.side === 'BUY' ? 'funding' : undefined,
        status: 'Completed',
        timestamp: Date.now(),
        note: `P2P ${ord.side} ${ord.cryptoAmount} ${ord.asset} (${ord.fiatAmount} ${ord.fiat}) via ${ord.paymentMethod} with ${ord.merchantName}`,
        isDemo: true,
        isSampleData: false,
      };
      appendTransaction(tx);
      showToast(`P2P ${ord.side} Completed: ${ord.cryptoAmount} ${ord.asset}`);
      return { ok: true, message: 'P2P order settled in Funding Wallet' };
    },
    [p2pOrders, appendTransaction, showToast]
  );

  const cancelP2POrder = useCallback(
    (orderId: string) => {
      setP2pOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'Cancelled' } : o))
      );
      showToast('P2P order cancelled');
    },
    [showToast]
  );

  const addPriceAlert = useCallback(
    (symbol: string, targetPrice: number, condition: 'ABOVE' | 'BELOW') => {
      setPriceAlerts((prev) => [
        {
          id: `alert-${Date.now()}`,
          symbol,
          targetPrice,
          condition,
          active: true,
          createdAt: Date.now(),
        },
        ...prev,
      ]);
      showToast(`Price alert set for ${symbol} ${condition.toLowerCase()} $${targetPrice}`);
    },
    [showToast]
  );

  const removePriceAlert = useCallback((id: string) => {
    setPriceAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const updateSettings = useCallback((partial: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const updateWeb3Wallet = useCallback((partial: Partial<Web3WalletState>) => {
    setWeb3Wallet((prev) => ({ ...prev, ...partial }));
  }, []);

  const connectEcosystemWallet = useCallback(
    async (ecosystem: WalletEcosystem): Promise<{ ok: boolean; message: string }> => {
      if (ecosystem === 'EVM') {
        const res = await connectEvmWallet();
        if (!res.ok || !res.account) {
          showToast(res.message);
          return { ok: false, message: res.message };
        }
        const acct = res.account;
        const hist = await fetchOnChainAddressHistory({
          ecosystem: 'EVM',
          address: acct.address,
          chainId: acct.chainId,
        });
        setWeb3Wallet((prev) => ({
          ...prev,
          isCreated: true,
          mode: 'connected_self_custody',
          activeEcosystem: 'EVM',
          address: acct.address,
          walletName: acct.providerName,
          evmAccount: acct,
          realOnChainTxs: [
            ...hist.transactions,
            ...(prev.realOnChainTxs || []).filter(
              (existing) => !hist.transactions.some((h) => h.txHash === existing.txHash)
            ),
          ],
          teeStatus: getGenuineTeeCapabilityStatus(),
        }));
        showToast(res.message);
        return { ok: true, message: res.message };
      }

      if (ecosystem === 'SOLANA') {
        const res = await connectSolanaWallet();
        if (!res.ok || !res.account) {
          showToast(res.message);
          return { ok: false, message: res.message };
        }
        const acct = res.account;
        const hist = await fetchOnChainAddressHistory({
          ecosystem: 'SOLANA',
          address: acct.address,
          chainId: 'mainnet-beta',
        });
        setWeb3Wallet((prev) => ({
          ...prev,
          isCreated: true,
          mode: 'connected_self_custody',
          activeEcosystem: 'SOLANA',
          address: acct.address,
          walletName: acct.providerName,
          solanaAccount: acct,
          realOnChainTxs: [
            ...hist.transactions,
            ...(prev.realOnChainTxs || []).filter(
              (existing) => !hist.transactions.some((h) => h.txHash === existing.txHash)
            ),
          ],
          teeStatus: getGenuineTeeCapabilityStatus(),
        }));
        showToast(res.message);
        return { ok: true, message: res.message };
      }

      if (ecosystem === 'BITCOIN') {
        const res = await connectBitcoinWallet();
        if (!res.ok || !res.account) {
          showToast(res.message);
          return { ok: false, message: res.message };
        }
        const acct = res.account;
        const hist = await fetchOnChainAddressHistory({
          ecosystem: 'BITCOIN',
          address: acct.address,
          chainId: 'bitcoin-mainnet',
        });
        setWeb3Wallet((prev) => ({
          ...prev,
          isCreated: true,
          mode: 'connected_self_custody',
          activeEcosystem: 'BITCOIN',
          address: acct.address,
          walletName: acct.providerName,
          bitcoinAccount: acct,
          realOnChainTxs: [
            ...hist.transactions,
            ...(prev.realOnChainTxs || []).filter(
              (existing) => !hist.transactions.some((h) => h.txHash === existing.txHash)
            ),
          ],
          teeStatus: getGenuineTeeCapabilityStatus(),
        }));
        showToast(res.message);
        return { ok: true, message: res.message };
      }

      return { ok: false, message: 'Unsupported wallet ecosystem.' };
    },
    [showToast]
  );

  const disconnectEcosystemWallet = useCallback(
    (ecosystem?: WalletEcosystem) => {
      setWeb3Wallet((prev) => {
        const nextEvm = !ecosystem || ecosystem === 'EVM' ? null : prev.evmAccount;
        const nextSol = !ecosystem || ecosystem === 'SOLANA' ? null : prev.solanaAccount;
        const nextBtc = !ecosystem || ecosystem === 'BITCOIN' ? null : prev.bitcoinAccount;
        const remainingAcct = nextEvm || nextSol || nextBtc;
        return {
          ...prev,
          evmAccount: nextEvm,
          solanaAccount: nextSol,
          bitcoinAccount: nextBtc,
          isCreated: Boolean(remainingAcct),
          mode: remainingAcct ? 'connected_self_custody' : 'unconnected',
          address: remainingAcct ? remainingAcct.address : '',
          walletName: remainingAcct ? remainingAcct.providerName : 'Unconnected Wallet',
        };
      });
      showToast(ecosystem ? `Disconnected ${ecosystem} wallet` : 'Disconnected Web3 wallets');
    },
    [showToast]
  );

  const enableDemoWeb3Preview = useCallback(() => {
    setWeb3Wallet((prev) => ({
      ...prev,
      isCreated: true,
      mode: 'demo_preview',
      address: 'DEMO-PREVIEW-LEDGER (No On-Chain Address)',
      walletName: 'Demo Web3 Preview Ledger',
      demoWeb3Balances: prev.demoWeb3Balances || {
        USDT: 0,
        BNB: 0,
        ETH: 0,
        SOL: 0,
        BTC: 0,
        USDC: 0,
      },
      teeStatus: getGenuineTeeCapabilityStatus(),
    }));
    showToast('Enabled isolated Demo Web3 Preview Ledger');
  }, [showToast]);

  const refreshConnectedWalletBalances = useCallback(async () => {
    const evmAddr = web3Wallet.evmAccount?.address;
    const evmChainId = Number(web3Wallet.evmAccount?.chainId || 1);
    const solAddr = web3Wallet.solanaAccount?.address;
    const btcAddr = web3Wallet.bitcoinAccount?.address;

    setWeb3Wallet((prev) => ({
      ...prev,
      evmAccount: prev.evmAccount
        ? { ...prev.evmAccount, balanceStatus: 'loading', rpcError: null }
        : null,
      solanaAccount: prev.solanaAccount
        ? { ...prev.solanaAccount, balanceStatus: 'loading', rpcError: null }
        : null,
      bitcoinAccount: prev.bitcoinAccount
        ? { ...prev.bitcoinAccount, balanceStatus: 'loading', rpcError: null }
        : null,
    }));

    const [evmBal, evmGas, evmTokens, solBal, solTokens, btcBal] = await Promise.all([
      evmAddr ? fetchEvmNativeBalanceViaRpc(evmAddr, evmChainId) : Promise.resolve(null),
      evmAddr ? fetchEvmGasPriceGwei(evmChainId) : Promise.resolve(null),
      evmAddr ? fetchEvmVerifiedTokenBalances(evmAddr, evmChainId) : Promise.resolve([]),
      solAddr ? fetchSolanaNativeBalanceViaRpc(solAddr) : Promise.resolve(null),
      solAddr ? fetchSolanaVerifiedTokenBalances(solAddr) : Promise.resolve([]),
      btcAddr ? fetchBitcoinBalanceViaMempool(btcAddr) : Promise.resolve(null),
    ]);

    setWeb3Wallet((prev) => ({
      ...prev,
      evmAccount: prev.evmAccount
        ? {
            ...prev.evmAccount,
            nativeBalance: evmBal,
            balanceStatus: evmBal !== null ? 'synced' : 'rpc_error',
            rpcError: evmBal === null ? 'RPC node unreachable or timed out' : null,
            gasPriceGwei: evmGas,
            tokenBalances: evmTokens,
            lastSyncedAt: Date.now(),
          }
        : null,
      solanaAccount: prev.solanaAccount
        ? {
            ...prev.solanaAccount,
            nativeBalance: solBal,
            balanceStatus: solBal !== null ? 'synced' : 'rpc_error',
            rpcError: solBal === null ? 'Solana RPC rate-limited or unreachable' : null,
            tokenBalances: solTokens,
            lastSyncedAt: Date.now(),
          }
        : null,
      bitcoinAccount: prev.bitcoinAccount
        ? {
            ...prev.bitcoinAccount,
            nativeBalance: btcBal ? btcBal.confirmedBtc : prev.bitcoinAccount.nativeBalance,
            unconfirmedBalance: btcBal ? btcBal.unconfirmedBtc : 0,
            balanceStatus: btcBal ? 'synced' : 'rpc_error',
            rpcError: btcBal ? null : 'Mempool.space indexer temporarily unreachable',
            lastSyncedAt: Date.now(),
          }
        : null,
    }));
  }, [
    web3Wallet.evmAccount?.address,
    web3Wallet.evmAccount?.chainId,
    web3Wallet.solanaAccount?.address,
    web3Wallet.bitcoinAccount?.address,
  ]);

  const switchConnectedEvmChain = useCallback(
    async (targetChainId: number): Promise<{ ok: boolean; message: string }> => {
      const cfg = EVM_CHAIN_CONFIGS[targetChainId];
      if (!cfg) {
        return { ok: false, message: `Unsupported EVM chain #${targetChainId}.` };
      }

      // If an EVM wallet is connected, request chain switch via EIP-3326 / EIP-3085
      if (web3Wallet.evmAccount?.address) {
        const res = await switchEvmNetwork(targetChainId);
        if (!res.ok) {
          showToast(res.message);
          return res;
        }
        const addr = web3Wallet.evmAccount.address;
        const [nativeBalance, gasPriceGwei, tokenBalances] = await Promise.all([
          fetchEvmNativeBalanceViaRpc(addr, targetChainId),
          fetchEvmGasPriceGwei(targetChainId),
          fetchEvmVerifiedTokenBalances(addr, targetChainId),
        ]);

        setWeb3Wallet((prev) => ({
          ...prev,
          evmAccount: prev.evmAccount
            ? {
                ...prev.evmAccount,
                chainId: targetChainId,
                networkName: cfg.name,
                nativeSymbol: cfg.nativeSymbol,
                nativeBalance,
                balanceStatus: nativeBalance !== null ? 'synced' : 'rpc_error',
                gasPriceGwei,
                tokenBalances,
                lastSyncedAt: Date.now(),
              }
            : null,
        }));
        showToast(res.message);
        return res;
      }

      return {
        ok: false,
        message: 'Connect an EVM wallet first to switch active blockchain network.',
      };
    },
    [web3Wallet.evmAccount?.address, showToast]
  );

  // Subscribe to live provider events (accountsChanged, chainChanged, disconnect)
  useEffect(() => {
    const unsubscribe = subscribeToWalletProviderEvents({
      onEvmAccountsChanged: async (accounts) => {
        if (!accounts || accounts.length === 0) {
          disconnectEcosystemWallet('EVM');
          return;
        }
        const newAddr = accounts[0];
        const chainId = Number(web3Wallet.evmAccount?.chainId || 1);
        const cfg = EVM_CHAIN_CONFIGS[chainId] || EVM_CHAIN_CONFIGS[1];
        const [nativeBalance, gasPriceGwei, tokenBalances] = await Promise.all([
          fetchEvmNativeBalanceViaRpc(newAddr, chainId),
          fetchEvmGasPriceGwei(chainId),
          fetchEvmVerifiedTokenBalances(newAddr, chainId),
        ]);
        setWeb3Wallet((prev) => ({
          ...prev,
          isCreated: true,
          mode: 'connected_self_custody',
          address: prev.activeEcosystem === 'EVM' ? newAddr : prev.address || newAddr,
          evmAccount: prev.evmAccount
            ? {
                ...prev.evmAccount,
                address: newAddr,
                nativeBalance,
                balanceStatus: nativeBalance !== null ? 'synced' : 'rpc_error',
                gasPriceGwei,
                tokenBalances,
                lastSyncedAt: Date.now(),
              }
            : {
                ecosystem: 'EVM',
                address: newAddr,
                providerName: 'EIP-1193 Wallet',
                connectionMethod: 'eip1193_injected',
                chainId,
                networkName: cfg.name,
                nativeSymbol: cfg.nativeSymbol,
                nativeBalance,
                balanceStatus: nativeBalance !== null ? 'synced' : 'rpc_error',
                gasPriceGwei,
                tokenBalances,
                lastSyncedAt: Date.now(),
              },
        }));
        showToast(`EVM account switched to ${newAddr.slice(0, 6)}...${newAddr.slice(-4)}`);
      },
      onEvmChainChanged: async (newChainId) => {
        if (!web3Wallet.evmAccount?.address) return;
        const addr = web3Wallet.evmAccount.address;
        const cfg = EVM_CHAIN_CONFIGS[newChainId] || {
          chainId: newChainId,
          chainIdHex: `0x${newChainId.toString(16)}`,
          name: `EVM Chain #${newChainId}`,
          shortName: `Chain ${newChainId}`,
          nativeSymbol: 'ETH',
          decimals: 18,
          rpcUrls: ['https://ethereum-rpc.publicnode.com'],
          explorerUrl: 'https://etherscan.io',
        };
        const [nativeBalance, gasPriceGwei, tokenBalances] = await Promise.all([
          fetchEvmNativeBalanceViaRpc(addr, newChainId),
          fetchEvmGasPriceGwei(newChainId),
          fetchEvmVerifiedTokenBalances(addr, newChainId),
        ]);
        setWeb3Wallet((prev) => ({
          ...prev,
          evmAccount: prev.evmAccount
            ? {
                ...prev.evmAccount,
                chainId: newChainId,
                networkName: cfg.name,
                nativeSymbol: cfg.nativeSymbol,
                nativeBalance,
                balanceStatus: nativeBalance !== null ? 'synced' : 'rpc_error',
                gasPriceGwei,
                tokenBalances,
                lastSyncedAt: Date.now(),
              }
            : null,
        }));
        showToast(`Network changed to ${cfg.name}`);
      },
      onEvmDisconnect: () => {
        disconnectEcosystemWallet('EVM');
      },
      onSolanaAccountChanged: async (newSolAddr) => {
        if (!newSolAddr) {
          disconnectEcosystemWallet('SOLANA');
          return;
        }
        const [nativeBalance, tokenBalances] = await Promise.all([
          fetchSolanaNativeBalanceViaRpc(newSolAddr),
          fetchSolanaVerifiedTokenBalances(newSolAddr),
        ]);
        setWeb3Wallet((prev) => ({
          ...prev,
          solanaAccount: prev.solanaAccount
            ? {
                ...prev.solanaAccount,
                address: newSolAddr,
                nativeBalance,
                balanceStatus: nativeBalance !== null ? 'synced' : 'rpc_error',
                tokenBalances,
                lastSyncedAt: Date.now(),
              }
            : null,
        }));
        showToast(`Solana account changed to ${newSolAddr.slice(0, 6)}...${newSolAddr.slice(-4)}`);
      },
      onBitcoinAccountsChanged: async (accounts) => {
        if (!accounts || accounts.length === 0) {
          disconnectEcosystemWallet('BITCOIN');
          return;
        }
        const newBtcAddr = accounts[0];
        const balInfo = await fetchBitcoinBalanceViaMempool(newBtcAddr);
        setWeb3Wallet((prev) => ({
          ...prev,
          bitcoinAccount: prev.bitcoinAccount
            ? {
                ...prev.bitcoinAccount,
                address: newBtcAddr,
                nativeBalance: balInfo ? balInfo.confirmedBtc : null,
                unconfirmedBalance: balInfo ? balInfo.unconfirmedBtc : 0,
                balanceStatus: balInfo ? 'synced' : 'rpc_error',
                lastSyncedAt: Date.now(),
              }
            : null,
        }));
        showToast(`Bitcoin account changed to ${newBtcAddr.slice(0, 6)}...${newBtcAddr.slice(-4)}`);
      },
    });
    return unsubscribe;
  }, [
    web3Wallet.evmAccount?.address,
    web3Wallet.evmAccount?.chainId,
    disconnectEcosystemWallet,
    showToast,
  ]);

  const executeDemoExchangeToWalletTransfer = useCallback(
    ({
      fromAccount,
      asset,
      network,
      amount,
    }: {
      fromAccount: 'spot' | 'funding';
      asset: string;
      network: string;
      amount: number;
    }) => {
      if (!Number.isFinite(amount) || amount <= 0) {
        return { ok: false, message: 'Enter a valid transfer amount.' };
      }
      const avail = wallets[fromAccount]?.[asset]?.available || 0;
      if (amount > avail) {
        return {
          ok: false,
          message: `Insufficient Demo ${fromAccount.toUpperCase()} balance (${avail} ${asset} available).`,
        };
      }

      setWallets((prev) => {
        const next = structuredClone(prev);
        next[fromAccount][asset].available = Math.max(
          0,
          Number((next[fromAccount][asset].available - amount).toFixed(8))
        );
        return next;
      });

      setWeb3Wallet((prev) => {
        const currentDemoBals = { ...(prev.demoWeb3Balances || {}) };
        currentDemoBals[asset] = Number(((currentDemoBals[asset] || 0) + amount).toFixed(8));
        return {
          ...prev,
          isCreated: true,
          mode: prev.mode === 'connected_self_custody' ? prev.mode : 'demo_preview',
          demoWeb3Balances: currentDemoBals,
        };
      });

      const tx: LedgerTransaction = {
        id: `tx-demow3-${Date.now()}`,
        refId: generateRefId('DWT'),
        type: 'transfer',
        asset,
        amount,
        fee: 0,
        fromAccount,
        network: `${network} · Demo Internal Ledger`,
        address: 'Demo Web3 Preview Ledger (Off-Chain)',
        status: 'Completed',
        timestamp: Date.now(),
        note: `Demo Exchange-to-Wallet Ledger Transfer (${network}) — Updates Demo Ledger Only`,
        isDemo: true,
        isSampleData: false,
      };
      appendTransaction(tx);
      showToast(`Demo Ledger Updated: +${amount} ${asset} in Demo Web3 Preview`);
      return {
        ok: true,
        message: `Transferred ${amount} ${asset} within the isolated Demo Ledger.`,
        tx,
      };
    },
    [wallets, appendTransaction, showToast]
  );

  const executeSelfCustodyTransfer = useCallback(
    async ({
      ecosystem,
      toAddress,
      amount,
      tokenContract,
      tokenSymbol,
      tokenDecimals,
    }: {
      ecosystem: WalletEcosystem;
      toAddress: string;
      amount: number;
      tokenContract?: string;
      tokenSymbol?: string;
      tokenDecimals?: number;
    }) => {
      const fromAcct =
        ecosystem === 'EVM'
          ? web3Wallet.evmAccount
          : ecosystem === 'SOLANA'
          ? web3Wallet.solanaAccount
          : web3Wallet.bitcoinAccount;

      if (!fromAcct || !fromAcct.address) {
        return {
          ok: false,
          message: `No genuine ${ecosystem} self-custody wallet connected. Connect a real ${ecosystem} wallet first.`,
        };
      }

      // Pre-validate balance before invoking wallet popup
      if (tokenContract && fromAcct.tokenBalances) {
        const tokEntry = fromAcct.tokenBalances.find(
          (t) => t.contractAddress.toLowerCase() === tokenContract.toLowerCase()
        );
        if (tokEntry && tokEntry.balance !== null && amount > tokEntry.balance) {
          return {
            ok: false,
            message: `Insufficient on-chain ${tokEntry.symbol} balance (${tokEntry.balance} ${tokEntry.symbol} available on ${fromAcct.networkName}).`,
          };
        }
        if (fromAcct.nativeBalance !== null && fromAcct.nativeBalance <= 0) {
          return {
            ok: false,
            message: `Insufficient native ${fromAcct.nativeSymbol} balance (0 ${fromAcct.nativeSymbol}) to pay network gas fees on ${fromAcct.networkName}.`,
          };
        }
      } else if (fromAcct.nativeBalance !== null && amount > fromAcct.nativeBalance) {
        return {
          ok: false,
          message: `Insufficient on-chain ${fromAcct.nativeSymbol} balance (${fromAcct.nativeBalance} ${fromAcct.nativeSymbol} available on ${fromAcct.networkName}).`,
        };
      }

      const res = await sendAndConfirmSelfCustodyNativeTransfer({
        ecosystem,
        fromAddress: fromAcct.address,
        toAddress,
        amount,
        chainId: typeof fromAcct.chainId === 'number' ? fromAcct.chainId : 1,
        tokenContract,
        tokenSymbol,
        tokenDecimals,
        onStatusUpdate: (st) => {
          showToast(`${ecosystem} Transaction: ${st}`);
        },
      });

      if (res.txRecord) {
        setWeb3Wallet((prev) => ({
          ...prev,
          realOnChainTxs: [res.txRecord!, ...(prev.realOnChainTxs || [])],
        }));
        await refreshConnectedWalletBalances();
      }
      showToast(res.message);
      return res;
    },
    [
      web3Wallet.evmAccount,
      web3Wallet.solanaAccount,
      web3Wallet.bitcoinAccount,
      refreshConnectedWalletBalances,
      showToast,
    ]
  );

  const reverifyOnChainTransaction = useCallback(
    async (txId: string) => {
      const targetTx = (web3Wallet.realOnChainTxs || []).find((t) => t.id === txId);
      if (!targetTx) return;
      const updated = await recheckOnChainTransactionStatus(targetTx);
      setWeb3Wallet((prev) => ({
        ...prev,
        realOnChainTxs: (prev.realOnChainTxs || []).map((t) => (t.id === txId ? updated : t)),
      }));
      showToast(
        `Verified ${updated.txHash.slice(0, 10)}...: ${updated.status} (${updated.confirmations} confs)`
      );
    },
    [web3Wallet.realOnChainTxs, showToast]
  );

  const resetDemoLedger = useCallback(
    (customInitialUsdt?: number, preserveUserTransactions = false) => {
      const targetUsdt =
        customInitialUsdt !== undefined && Number.isFinite(customInitialUsdt) && customInitialUsdt >= 0
          ? customInitialUsdt
          : settings.initialPreviewBalanceUsdt || DEFAULT_PREVIEW_USDT_BALANCE;

      const freshWallets = createInitialWallets(targetUsdt);
      setWallets(freshWallets);
      setSpotOrders(createInitialSpotOrders(targetUsdt));
      setFuturesPositions([]);
      setEarnSubscriptions([]);
      setP2pOrders([]);
      setSettings((prev) => ({
        ...prev,
        initialPreviewBalanceUsdt: targetUsdt,
        portfolioInitializedAt: Date.now(),
      }));

      const sampleTxs = createSixMonthSampleTimeline();
      if (preserveUserTransactions) {
        setTransactions((prev) => {
          const userTxs = prev.filter((t) => !t.isSampleData);
          return deduplicateTransactions([...userTxs, ...sampleTxs]);
        });
      } else {
        setTransactions(sampleTxs);
      }

      showToast(
        `Preview Portfolio configured to ${targetUsdt.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} USDT`
      );
    },
    [settings.initialPreviewBalanceUsdt, showToast]
  );

  const importTransactions = useCallback(
    (records: LedgerTransaction[]): number => {
      if (!Array.isArray(records) || records.length === 0) return 0;
      let addedCount = 0;
      setTransactions((prev) => {
        const beforeLen = prev.length;
        const merged = deduplicateTransactions([...records, ...prev]);
        addedCount = Math.max(0, merged.length - beforeLen);
        return merged;
      });
      setAccountMode('verified_statement');
      setStatementId(`STMT-IMPORT-${new Date().toISOString().slice(0, 10)}`);
      fetch('/api/ledger/import-statement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          records,
          statementName: `STMT-IMPORT-${new Date().toISOString().slice(0, 10)}`,
        }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.auditLogs) setServerAuditLogs(data.auditLogs);
        })
        .catch(() => {});

      if (addedCount > 0) {
        showToast(`Imported ${addedCount} verified statement record(s) into SQLite ledger`);
      }
      return addedCount;
    },
    [showToast]
  );

  const switchAccountVerificationMode = useCallback(
    async (
      mode: 'verified_statement' | 'unverified_empty',
      customTargetUsdt = DEFAULT_PREVIEW_USDT_BALANCE
    ): Promise<{ ok: boolean; message: string }> => {
      try {
        const res = await fetch('/api/ledger/mode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode, customTargetUsdt }),
        });
        const data = await res.json();
        if (data?.ok) {
          setWallets(data.wallets);
          setTransactions(deduplicateTransactions(data.transactions || []));
          setAccountMode(mode);
          setStatementId(data.user?.statementId || null);
          setSpotOrders(
            mode === 'verified_statement' ? createInitialSpotOrders(customTargetUsdt) : []
          );
          if (mode === 'unverified_empty') {
            setFuturesPositions([]);
            setEarnSubscriptions([]);
          }
          if (Array.isArray(data.auditLogs)) setServerAuditLogs(data.auditLogs);
          setSettings((prev) => ({
            ...prev,
            accountMode: mode,
            statementId: data.user?.statementId || null,
            initialPreviewBalanceUsdt: mode === 'verified_statement' ? customTargetUsdt : 0,
          }));
          showToast(data.message);
          return { ok: true, message: data.message };
        }
      } catch {
        // Fallback if offline
      }

      if (mode === 'unverified_empty') {
        const emptyWallets = createInitialWallets(0);
        setWallets(emptyWallets);
        setTransactions([]);
        setSpotOrders([]);
        setFuturesPositions([]);
        setEarnSubscriptions([]);
        setAccountMode('unverified_empty');
        setStatementId(null);
        const msg =
          'Switched to Unverified Empty Account (0.00 USDT). Import an official statement or connect a read-only API to populate records.';
        showToast(msg);
        return { ok: true, message: msg };
      }

      resetDemoLedger(customTargetUsdt, false);
      setAccountMode('unverified_empty');
      setStatementId(null);
      return {
        ok: true,
        message: `Sandbox Demo funds allocated (${customTargetUsdt.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT).`,
      };
    },
    [resetDemoLedger, showToast]
  );

  const syncReadOnlyExchangeApi = useCallback(async (): Promise<{
    ok: boolean;
    message: string;
  }> => {
    try {
      const res = await fetch('/api/exchange/sync', { method: 'POST' });
      const data = await res.json();
      if (data?.auditLogs) setServerAuditLogs(data.auditLogs);
      if (res.ok && data?.ok) {
        if (data.wallets) setWallets(data.wallets);
        setAccountMode('readonly_exchange_api');
        showToast(data.message || 'Synced Read-Only Exchange API balances.');
        return { ok: true, message: data.message };
      }
      const errMsg =
        data?.message ||
        'Read-Only Exchange API credentials are not configured on the server.';
      showToast(errMsg);
      return { ok: false, message: errMsg };
    } catch (err: any) {
      const msg = err?.message || 'Unable to reach /api/exchange/sync backend route.';
      showToast(msg);
      return { ok: false, message: msg };
    }
  }, [showToast]);

  const openTransferModal = useCallback(
    (opts?: { from?: WalletAccountType; to?: WalletAccountType; asset?: string }) => {
      setTransferModalState({
        isOpen: true,
        defaultFrom: opts?.from || 'spot',
        defaultTo: opts?.to || 'usdm_futures',
        defaultAsset: opts?.asset || 'USDT',
      });
    },
    []
  );

  const closeTransferModal = useCallback(() => {
    setTransferModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const openDepositModal = useCallback((asset = 'USDT') => {
    setDepositModalState({ isOpen: true, asset });
  }, []);

  const closeDepositModal = useCallback(() => {
    setDepositModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const openWithdrawModal = useCallback((asset = 'USDT') => {
    setWithdrawModalState({ isOpen: true, asset });
  }, []);

  const closeWithdrawModal = useCallback(() => {
    setWithdrawModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const value: ExchangeContextValue = {
    appMode,
    setAppMode,
    exchangeTab,
    setExchangeTab,
    walletTab,
    setWalletTab,
    assetsSubTab,
    setAssetsSubTab,
    tradeSubTab,
    setTradeSubTab,
    futuresSubTab,
    setFuturesSubTab,
    tickers,
    tickerList,
    usdtTicker,
    stocks,
    connectionStatus,
    lastUpdated,
    activeSymbol,
    setActiveSymbol,
    activeInterval,
    setActiveInterval,
    candles,
    isLoadingCandles,
    orderBook,
    recentTrades,
    favorites,
    toggleFavorite,
    setFavoritesList,
    getLiveUsdtUsdPrice,
    getAssetPriceUsdt,
    getAssetPriceUsd,
    isRefreshingMarket,
    refreshMarketData,
    wallets,
    transactions,
    spotOrders,
    futuresPositions,
    earnSubscriptions,
    p2pOrders,
    priceAlerts,
    settings,
    web3Wallet,
    getAccountValueUsdt,
    getAccountValueUsd,
    getTotalPortfolioUsdt,
    getTotalPortfolioUsd,
    getTotalUsdtSummary,
    executeTransfer,
    requestDeposit,
    requestWithdraw,
    executeConvert,
    placeSpotOrder,
    cancelSpotOrder,
    openFuturesPosition,
    closeFuturesPosition,
    updatePositionTpSl,
    subscribeEarn,
    redeemEarn,
    createP2POrder,
    completeP2POrder,
    cancelP2POrder,
    addPriceAlert,
    removePriceAlert,
    updateSettings,
    updateWeb3Wallet,
    connectEcosystemWallet,
    disconnectEcosystemWallet,
    switchConnectedEvmChain,
    enableDemoWeb3Preview,
    refreshConnectedWalletBalances,
    executeDemoExchangeToWalletTransfer,
    executeSelfCustodyTransfer,
    reverifyOnChainTransaction,
    resetDemoLedger,
    importTransactions,
    transferModalState,
    openTransferModal,
    closeTransferModal,
    isDepositMethodSheetOpen,
    setDepositMethodSheetOpen,
    depositModalState,
    openDepositModal,
    closeDepositModal,
    withdrawModalState,
    openWithdrawModal,
    closeWithdrawModal,
    historyModalOpen,
    setHistoryModalOpen,
    selectedTxDetail,
    setSelectedTxDetail,
    coinDetailSymbol,
    setCoinDetailSymbol,
    isProfileDrawerOpen,
    setProfileDrawerOpen,
    isMessagesModalOpen,
    setMessagesModalOpen,
    isPayModalOpen,
    setPayModalOpen,
    toastMessage,
    showToast,
    accountMode,
    statementId,
    serverAuditLogs,
    backendCapabilities,
    fxProvenance,
    switchAccountVerificationMode,
    syncReadOnlyExchangeApi,
  };

  return <ExchangeContext.Provider value={value}>{children}</ExchangeContext.Provider>;
};

export function useExchange() {
  const ctx = useContext(ExchangeContext);
  if (!ctx) throw new Error('useExchange must be used within ExchangeProvider');
  return ctx;
}
