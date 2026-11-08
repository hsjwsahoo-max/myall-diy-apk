/**
 * NexusTrade Self-Custody Web3 Wallet Service
 *
 * Implements genuine non-custodial wallet creation, BIP-39 mnemonic generation,
 * standard BIP-44 key derivation, PBKDF2 + AES-256-GCM password encryption,
 * multi-account management, word-challenge backup verification, and QR code rendering.
 *
 * ZERO-LEAK SECURITY POLICY:
 * - Plaintext mnemonics and private keys are NEVER stored in localStorage/IndexedDB.
 * - Sensitive keys exist only in transient memory during an unlocked session.
 * - Locking immediately wipes keys from RAM.
 * - No keys or seed phrases are ever transmitted to any server or LLM.
 */

import { ethers } from 'ethers';
import QRCode from 'qrcode';
import { DerivedWalletAccount, EncryptedKeystoreVault } from '../types/exchange';

const VAULT_STORAGE_KEY = 'nexustrade_web3_vault_v1';
const PBKDF2_ITERATIONS = 100_000;

// Transient unlocked session stored in RAM ONLY (never persisted unencrypted)
interface TransientSession {
  mnemonicPhrase: string;
  rootWallet: ethers.HDNodeWallet;
  walletName: string;
  backupVerified: boolean;
  activeAccountIndex: number;
  accounts: DerivedWalletAccount[];
}

let transientSession: TransientSession | null = null;

// ============================================================================
// 1. CRYPTOGRAPHIC HELPERS (Web Crypto API AES-256-GCM + PBKDF2)
// ============================================================================

function arrayBufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToArrayBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(Math.ceil(hex.length / 2));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes.buffer;
}

async function deriveAesKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptMnemonicVault(
  mnemonicPhrase: string,
  password: string,
  walletName: string,
  backupVerified: boolean,
  accounts: DerivedWalletAccount[],
  activeAccountIndex = 0
): Promise<EncryptedKeystoreVault> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveAesKey(password, salt);

  const payload = JSON.stringify({
    mnemonicPhrase: mnemonicPhrase.trim(),
    savedAt: Date.now(),
  });

  const encoder = new TextEncoder();
  const ciphertextBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as BufferSource,
    },
    key,
    encoder.encode(payload)
  );

  const vault: EncryptedKeystoreVault = {
    version: 1,
    id: `vault-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
    walletName,
    backupVerified,
    activeAccountIndex,
    accounts,
    crypto: {
      cipher: 'aes-256-gcm',
      ciphertext: arrayBufferToHex(ciphertextBuffer),
      iv: arrayBufferToHex(iv.buffer),
      salt: arrayBufferToHex(salt.buffer),
      iterations: PBKDF2_ITERATIONS,
    },
  };

  return vault;
}

export async function decryptMnemonicVault(
  vault: EncryptedKeystoreVault,
  password: string
): Promise<{ mnemonicPhrase: string }> {
  const salt = new Uint8Array(hexToArrayBuffer(vault.crypto.salt));
  const iv = new Uint8Array(hexToArrayBuffer(vault.crypto.iv));
  const ciphertext = hexToArrayBuffer(vault.crypto.ciphertext);

  const key = await deriveAesKey(password, salt);

  try {
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as BufferSource,
      },
      key,
      ciphertext
    );

    const decoder = new TextDecoder();
    const payload = JSON.parse(decoder.decode(decryptedBuffer)) as { mnemonicPhrase: string };
    return payload;
  } catch {
    throw new Error('Incorrect wallet password. Failed to decrypt self-custody vault.');
  }
}

// ============================================================================
// 2. VAULT STORAGE & PERSISTENCE
// ============================================================================

export function getStoredVault(): EncryptedKeystoreVault | null {
  try {
    const raw = localStorage.getItem(VAULT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.version === 1 && parsed?.crypto?.ciphertext) {
      return parsed as EncryptedKeystoreVault;
    }
  } catch {
    // Corrupted or invalid
  }
  return null;
}

export function saveStoredVault(vault: EncryptedKeystoreVault): void {
  localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(vault));
}

export function clearStoredVault(): void {
  localStorage.removeItem(VAULT_STORAGE_KEY);
  lockWallet();
}

// ============================================================================
// 3. ACCOUNT DERIVATION (BIP-44: m/44'/60'/0'/0/i)
// ============================================================================

export function deriveAccountFromMnemonic(
  mnemonicPhrase: string,
  accountIndex: number,
  customName?: string
): DerivedWalletAccount {
  const path = `m/44'/60'/0'/0/${accountIndex}`;
  const hdNode = ethers.HDNodeWallet.fromPhrase(mnemonicPhrase.trim(), undefined, path);
  return {
    index: accountIndex,
    name: customName || `Account ${accountIndex + 1}`,
    address: hdNode.address,
    path,
  };
}

// ============================================================================
// 4. WALLET CREATION & INITIALIZATION FLOWS
// ============================================================================

export interface NewWalletDraft {
  mnemonicPhrase: string;
  words: string[];
  accounts: DerivedWalletAccount[];
}

/**
 * Generates an authentic 12-word BIP-39 mnemonic phrase using browser cryptographically secure entropy.
 */
export function generateNewMnemonicDraft(): NewWalletDraft {
  const randomWallet = ethers.Wallet.createRandom();
  const phrase = randomWallet.mnemonic ? randomWallet.mnemonic.phrase : '';
  const words = phrase.split(' ');
  const defaultAccount = deriveAccountFromMnemonic(phrase, 0, 'Main Account');

  return {
    mnemonicPhrase: phrase,
    words,
    accounts: [defaultAccount],
  };
}

/**
 * Creates 3 random word challenges (e.g. Word #3, Word #7, Word #11) for backup verification.
 */
export function generateBackupChallenge(words: string[]): {
  indices: [number, number, number];
  labels: [string, string, string];
} {
  const availableIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  // Shuffle deterministically or randomly
  for (let i = availableIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [availableIndices[i], availableIndices[j]] = [availableIndices[j], availableIndices[i]];
  }
  const chosen = availableIndices.slice(0, 3).sort((a, b) => a - b) as [number, number, number];
  return {
    indices: chosen,
    labels: [`Word #${chosen[0] + 1}`, `Word #${chosen[1] + 1}`, `Word #${chosen[2] + 1}`],
  };
}

/**
 * Validates the user's answers to the backup challenge.
 */
export function verifyBackupChallenge(
  words: string[],
  challengeIndices: [number, number, number],
  answers: [string, string, string]
): boolean {
  return (
    words[challengeIndices[0]].toLowerCase().trim() === answers[0].toLowerCase().trim() &&
    words[challengeIndices[1]].toLowerCase().trim() === answers[1].toLowerCase().trim() &&
    words[challengeIndices[2]].toLowerCase().trim() === answers[2].toLowerCase().trim()
  );
}

/**
 * Finalizes creation of a new wallet after password entry and backup verification.
 * Persists encrypted keystore to storage and unlocks the active session.
 */
export async function finalizeNewWallet(
  mnemonicPhrase: string,
  password: string,
  walletName = 'Nexus Self-Custody Wallet',
  backupVerified = true
): Promise<EncryptedKeystoreVault> {
  const defaultAccount = deriveAccountFromMnemonic(mnemonicPhrase, 0, 'Main Account');
  const accounts = [defaultAccount];

  const vault = await encryptMnemonicVault(
    mnemonicPhrase,
    password,
    walletName,
    backupVerified,
    accounts,
    0
  );

  saveStoredVault(vault);

  // Set transient unlocked session in memory
  const path = `m/44'/60'/0'/0/0`;
  const rootWallet = ethers.HDNodeWallet.fromPhrase(mnemonicPhrase.trim(), undefined, path);

  transientSession = {
    mnemonicPhrase: mnemonicPhrase.trim(),
    rootWallet,
    walletName,
    backupVerified,
    activeAccountIndex: 0,
    accounts,
  };

  return vault;
}

/**
 * Imports an existing wallet via 12/24-word seed phrase or private key.
 */
export async function importExistingWallet(
  importInput: string,
  password: string,
  walletName = 'Imported Wallet'
): Promise<EncryptedKeystoreVault> {
  const cleanInput = importInput.trim();

  let mnemonicPhrase = '';
  let accounts: DerivedWalletAccount[] = [];

  // Check if it's a valid BIP-39 mnemonic phrase
  if (ethers.Mnemonic.isValidMnemonic(cleanInput)) {
    mnemonicPhrase = cleanInput;
    const defaultAccount = deriveAccountFromMnemonic(cleanInput, 0, 'Account 1');
    accounts = [defaultAccount];
  } else if (/^(0x)?[0-9a-fA-F]{64}$/.test(cleanInput)) {
    // Raw private key import: derive single wallet address
    const formattedKey = cleanInput.startsWith('0x') ? cleanInput : `0x${cleanInput}`;
    const directWallet = new ethers.Wallet(formattedKey);
    // For single private keys, we treat the private key as the secret
    mnemonicPhrase = `pk:${formattedKey}`;
    accounts = [
      {
        index: 0,
        name: 'Imported Key',
        address: directWallet.address,
        path: 'direct_private_key',
      },
    ];
  } else {
    throw new Error('Invalid seed phrase or private key format. Please verify and try again.');
  }

  const vault = await encryptMnemonicVault(mnemonicPhrase, password, walletName, true, accounts, 0);
  saveStoredVault(vault);

  // Load into memory
  if (mnemonicPhrase.startsWith('pk:')) {
    const pk = mnemonicPhrase.replace('pk:', '');
    const w = new ethers.Wallet(pk);
    // Create compatible HD representation wrapper
    transientSession = {
      mnemonicPhrase,
      rootWallet: w as any,
      walletName,
      backupVerified: true,
      activeAccountIndex: 0,
      accounts,
    };
  } else {
    const rootWallet = ethers.HDNodeWallet.fromPhrase(
      mnemonicPhrase,
      undefined,
      `m/44'/60'/0'/0/0`
    );
    transientSession = {
      mnemonicPhrase,
      rootWallet,
      walletName,
      backupVerified: true,
      activeAccountIndex: 0,
      accounts,
    };
  }

  return vault;
}

// ============================================================================
// 5. UNLOCK, LOCK & SESSION SECURITY
// ============================================================================

export async function unlockWallet(
  password: string
): Promise<{
  walletName: string;
  backupVerified: boolean;
  activeAccount: DerivedWalletAccount;
  accounts: DerivedWalletAccount[];
}> {
  const vault = getStoredVault();
  if (!vault) {
    throw new Error('No local self-custody wallet vault found on this device.');
  }

  const { mnemonicPhrase } = await decryptMnemonicVault(vault, password);

  let rootWallet: any;
  if (mnemonicPhrase.startsWith('pk:')) {
    rootWallet = new ethers.Wallet(mnemonicPhrase.replace('pk:', ''));
  } else {
    const activeAcc = vault.accounts[vault.activeAccountIndex] || vault.accounts[0];
    rootWallet = ethers.HDNodeWallet.fromPhrase(
      mnemonicPhrase,
      undefined,
      activeAcc.path || `m/44'/60'/0'/0/0`
    );
  }

  transientSession = {
    mnemonicPhrase,
    rootWallet,
    walletName: vault.walletName,
    backupVerified: vault.backupVerified,
    activeAccountIndex: vault.activeAccountIndex,
    accounts: vault.accounts,
  };

  return {
    walletName: vault.walletName,
    backupVerified: vault.backupVerified,
    activeAccount: vault.accounts[vault.activeAccountIndex] || vault.accounts[0],
    accounts: vault.accounts,
  };
}

/**
 * Locks the wallet immediately, wiping all decrypted material from RAM.
 */
export function lockWallet(): void {
  transientSession = null;
}

export function isWalletUnlocked(): boolean {
  return transientSession !== null;
}

export function hasLocalVault(): boolean {
  return getStoredVault() !== null;
}

export function getActiveSessionDetails(): {
  walletName: string;
  backupVerified: boolean;
  activeAccountIndex: number;
  activeAccount: DerivedWalletAccount | null;
  accounts: DerivedWalletAccount[];
} | null {
  if (!transientSession) return null;
  return {
    walletName: transientSession.walletName,
    backupVerified: transientSession.backupVerified,
    activeAccountIndex: transientSession.activeAccountIndex,
    activeAccount: transientSession.accounts[transientSession.activeAccountIndex] || null,
    accounts: transientSession.accounts,
  };
}

// ============================================================================
// 6. MULTI-ACCOUNT MANAGEMENT
// ============================================================================

export async function createAdditionalAccount(customName?: string): Promise<DerivedWalletAccount> {
  if (!transientSession) {
    throw new Error('Wallet is locked. Unlock to create additional accounts.');
  }
  if (transientSession.mnemonicPhrase.startsWith('pk:')) {
    throw new Error('Additional accounts cannot be derived from a single imported private key.');
  }

  const nextIndex = transientSession.accounts.length;
  const newAccount = deriveAccountFromMnemonic(
    transientSession.mnemonicPhrase,
    nextIndex,
    customName || `Account ${nextIndex + 1}`
  );

  const updatedAccounts = [...transientSession.accounts, newAccount];
  transientSession.accounts = updatedAccounts;
  transientSession.activeAccountIndex = nextIndex;

  // Update stored vault metadata
  const vault = getStoredVault();
  if (vault) {
    vault.accounts = updatedAccounts;
    vault.activeAccountIndex = nextIndex;
    saveStoredVault(vault);
  }

  return newAccount;
}

export function switchActiveAccount(index: number): DerivedWalletAccount {
  if (!transientSession) {
    throw new Error('Wallet is locked. Unlock to switch accounts.');
  }
  if (index < 0 || index >= transientSession.accounts.length) {
    throw new Error('Invalid account index.');
  }

  transientSession.activeAccountIndex = index;
  const activeAccount = transientSession.accounts[index];

  if (!transientSession.mnemonicPhrase.startsWith('pk:')) {
    transientSession.rootWallet = ethers.HDNodeWallet.fromPhrase(
      transientSession.mnemonicPhrase,
      undefined,
      activeAccount.path
    );
  }

  const vault = getStoredVault();
  if (vault) {
    vault.activeAccountIndex = index;
    saveStoredVault(vault);
  }

  return activeAccount;
}

export function renameAccount(index: number, newName: string): void {
  if (!transientSession) return;
  if (index >= 0 && index < transientSession.accounts.length) {
    transientSession.accounts[index].name = newName.trim();
    const vault = getStoredVault();
    if (vault && vault.accounts[index]) {
      vault.accounts[index].name = newName.trim();
      saveStoredVault(vault);
    }
  }
}

// ============================================================================
// 7. QR CODE GENERATION (Instant Base64 SVG/PNG Data URL)
// ============================================================================

export async function generateQrCodeDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 240,
      margin: 2,
      color: {
        dark: '#0B0E11',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    });
  } catch (err) {
    console.error('Failed to generate QR code:', err);
    return '';
  }
}

// ============================================================================
// 8. TEE & CRYPTO CAPABILITY DISCLOSURE
// ============================================================================

export function getHardwareCryptoDisclosure() {
  const hasSubtle = typeof window !== 'undefined' && Boolean(window.crypto?.subtle);
  return {
    hasSubtle,
    cipher: 'AES-256-GCM',
    kdf: 'PBKDF2-SHA256 (100,000 rounds)',
    entropySource: 'Web Crypto API crypto.getRandomValues',
    securityType: 'Self-Custody Encrypted Vault (Client-Side Standard)',
    disclosureText:
      'Private keys are encrypted locally using AES-256-GCM with 100,000 PBKDF2 iterations. Decrypted keys exist solely in memory during an active unlocked session and are cleared when locked. Keys never touch NexusTrade servers.',
  };
}
