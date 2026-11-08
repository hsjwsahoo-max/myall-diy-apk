import {
  ConnectedChainAccount,
  RealOnChainTransaction,
  TeeCapabilityStatus,
  TransferCustodyClassification,
  VerifiedTokenBalance,
  VerifiedTokenConfig,
  WalletEcosystem,
} from '../types/exchange';

// ============================================================================
// 1. MULTI-ECOSYSTEM NETWORK CONFIGURATIONS (7 EVM CHAINS, SOLANA, BITCOIN)
// ============================================================================

export interface EvmChainConfig {
  chainId: number;
  chainIdHex: string;
  name: string;
  shortName: string;
  nativeSymbol: string;
  decimals: number;
  rpcUrls: string[];
  explorerUrl: string;
}

export const EVM_CHAIN_CONFIGS: Record<number, EvmChainConfig> = {
  1: {
    chainId: 1,
    chainIdHex: '0x1',
    name: 'Ethereum Mainnet',
    shortName: 'Ethereum',
    nativeSymbol: 'ETH',
    decimals: 18,
    rpcUrls: ['https://ethereum-rpc.publicnode.com', 'https://rpc.ankr.com/eth'],
    explorerUrl: 'https://etherscan.io',
  },
  56: {
    chainId: 56,
    chainIdHex: '0x38',
    name: 'BNB Smart Chain',
    shortName: 'BSC',
    nativeSymbol: 'BNB',
    decimals: 18,
    rpcUrls: ['https://bsc-dataseed.binance.org', 'https://bsc-rpc.publicnode.com'],
    explorerUrl: 'https://bscscan.com',
  },
  42161: {
    chainId: 42161,
    chainIdHex: '0xa4b1',
    name: 'Arbitrum One',
    shortName: 'Arbitrum',
    nativeSymbol: 'ETH',
    decimals: 18,
    rpcUrls: ['https://arb1.arbitrum.io/rpc', 'https://arbitrum-one-rpc.publicnode.com'],
    explorerUrl: 'https://arbiscan.io',
  },
  8453: {
    chainId: 8453,
    chainIdHex: '0x2105',
    name: 'Base Mainnet',
    shortName: 'Base',
    nativeSymbol: 'ETH',
    decimals: 18,
    rpcUrls: ['https://mainnet.base.org', 'https://base-rpc.publicnode.com'],
    explorerUrl: 'https://basescan.org',
  },
  137: {
    chainId: 137,
    chainIdHex: '0x89',
    name: 'Polygon POS',
    shortName: 'Polygon',
    nativeSymbol: 'POL',
    decimals: 18,
    rpcUrls: ['https://polygon-rpc.com', 'https://polygon-bor-rpc.publicnode.com'],
    explorerUrl: 'https://polygonscan.com',
  },
  10: {
    chainId: 10,
    chainIdHex: '0xa',
    name: 'OP Mainnet',
    shortName: 'Optimism',
    nativeSymbol: 'ETH',
    decimals: 18,
    rpcUrls: ['https://mainnet.optimism.io', 'https://optimism-rpc.publicnode.com'],
    explorerUrl: 'https://optimistic.etherscan.io',
  },
  43114: {
    chainId: 43114,
    chainIdHex: '0xa86a',
    name: 'Avalanche C-Chain',
    shortName: 'Avalanche',
    nativeSymbol: 'AVAX',
    decimals: 18,
    rpcUrls: ['https://api.avax.network/ext/bc/C/rpc', 'https://avalanche-c-chain-rpc.publicnode.com'],
    explorerUrl: 'https://snowtrace.io',
  },
};

export const SOLANA_RPC_ENDPOINTS = [
  'https://solana-rpc.publicnode.com',
  'https://api.mainnet-beta.solana.com',
];

export const BITCOIN_MEMPOOL_API = 'https://mempool.space/api';

// ============================================================================
// 2. CANONICAL VERIFIED TOKEN REGISTRY (EXACT CONTRACT ADDRESSES & DECIMALS)
// ============================================================================

export const VERIFIED_TOKEN_REGISTRY: VerifiedTokenConfig[] = [
  // Ethereum Mainnet (Chain ID 1)
  {
    symbol: 'USDT',
    name: 'Tether USD (ERC-20)',
    ecosystem: 'EVM',
    chainId: 1,
    networkName: 'Ethereum Mainnet',
    contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    decimals: 6,
    explorerUrl: 'https://etherscan.io/token/0xdAC17F958D2ee523a2206206994597C13D831ec7',
  },
  {
    symbol: 'USDC',
    name: 'USD Coin (ERC-20)',
    ecosystem: 'EVM',
    chainId: 1,
    networkName: 'Ethereum Mainnet',
    contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    decimals: 6,
    explorerUrl: 'https://etherscan.io/token/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  },
  {
    symbol: 'DAI',
    name: 'Dai Stablecoin (ERC-20)',
    ecosystem: 'EVM',
    chainId: 1,
    networkName: 'Ethereum Mainnet',
    contractAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    decimals: 18,
    explorerUrl: 'https://etherscan.io/token/0x6B175474E89094C44Da98b954EedeAC495271d0F',
  },
  {
    symbol: 'WBTC',
    name: 'Wrapped BTC (ERC-20)',
    ecosystem: 'EVM',
    chainId: 1,
    networkName: 'Ethereum Mainnet',
    contractAddress: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    decimals: 8,
    explorerUrl: 'https://etherscan.io/token/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
  },

  // BNB Smart Chain (Chain ID 56) — Note: BEP-20 USDT & USDC use 18 decimals
  {
    symbol: 'USDT',
    name: 'Binance-Peg BSC-USD (BEP-20)',
    ecosystem: 'EVM',
    chainId: 56,
    networkName: 'BNB Smart Chain',
    contractAddress: '0x55d398326f99059fF775485246999027B3197955',
    decimals: 18,
    explorerUrl: 'https://bscscan.com/token/0x55d398326f99059fF775485246999027B3197955',
  },
  {
    symbol: 'USDC',
    name: 'Binance-Peg USD Coin (BEP-20)',
    ecosystem: 'EVM',
    chainId: 56,
    networkName: 'BNB Smart Chain',
    contractAddress: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    decimals: 18,
    explorerUrl: 'https://bscscan.com/token/0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
  },
  {
    symbol: 'ETH',
    name: 'Binance-Peg Ethereum (BEP-20)',
    ecosystem: 'EVM',
    chainId: 56,
    networkName: 'BNB Smart Chain',
    contractAddress: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
    decimals: 18,
    explorerUrl: 'https://bscscan.com/token/0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
  },

  // Arbitrum One (Chain ID 42161)
  {
    symbol: 'USDT',
    name: 'Tether USD (Arbitrum)',
    ecosystem: 'EVM',
    chainId: 42161,
    networkName: 'Arbitrum One',
    contractAddress: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    decimals: 6,
    explorerUrl: 'https://arbiscan.io/token/0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
  },
  {
    symbol: 'USDC',
    name: 'USD Coin (Native Arbitrum)',
    ecosystem: 'EVM',
    chainId: 42161,
    networkName: 'Arbitrum One',
    contractAddress: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    decimals: 6,
    explorerUrl: 'https://arbiscan.io/token/0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
  },
  {
    symbol: 'ARB',
    name: 'Arbitrum Governance Token',
    ecosystem: 'EVM',
    chainId: 42161,
    networkName: 'Arbitrum One',
    contractAddress: '0x912CE59144191C1204E64559FE8253a0e49E6548',
    decimals: 18,
    explorerUrl: 'https://arbiscan.io/token/0x912CE59144191C1204E64559FE8253a0e49E6548',
  },

  // Base Mainnet (Chain ID 8453)
  {
    symbol: 'USDC',
    name: 'USD Coin (Native Base)',
    ecosystem: 'EVM',
    chainId: 8453,
    networkName: 'Base Mainnet',
    contractAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    decimals: 6,
    explorerUrl: 'https://basescan.org/token/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  },
  {
    symbol: 'cbBTC',
    name: 'Coinbase Wrapped BTC (Base)',
    ecosystem: 'EVM',
    chainId: 8453,
    networkName: 'Base Mainnet',
    contractAddress: '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf',
    decimals: 8,
    explorerUrl: 'https://basescan.org/token/0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf',
  },

  // Polygon POS (Chain ID 137)
  {
    symbol: 'USDT',
    name: 'Tether USD (Polygon POS)',
    ecosystem: 'EVM',
    chainId: 137,
    networkName: 'Polygon POS',
    contractAddress: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    decimals: 6,
    explorerUrl: 'https://polygonscan.com/token/0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
  },
  {
    symbol: 'USDC',
    name: 'USD Coin (Native Polygon)',
    ecosystem: 'EVM',
    chainId: 137,
    networkName: 'Polygon POS',
    contractAddress: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
    decimals: 6,
    explorerUrl: 'https://polygonscan.com/token/0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
  },

  // OP Mainnet (Chain ID 10)
  {
    symbol: 'USDT',
    name: 'Tether USD (Optimism)',
    ecosystem: 'EVM',
    chainId: 10,
    networkName: 'OP Mainnet',
    contractAddress: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
    decimals: 6,
    explorerUrl: 'https://optimistic.etherscan.io/token/0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
  },
  {
    symbol: 'USDC',
    name: 'USD Coin (Native Optimism)',
    ecosystem: 'EVM',
    chainId: 10,
    networkName: 'OP Mainnet',
    contractAddress: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
    decimals: 6,
    explorerUrl: 'https://optimistic.etherscan.io/token/0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
  },
  {
    symbol: 'OP',
    name: 'Optimism Governance Token',
    ecosystem: 'EVM',
    chainId: 10,
    networkName: 'OP Mainnet',
    contractAddress: '0x4200000000000000000000000000000000000042',
    decimals: 18,
    explorerUrl: 'https://optimistic.etherscan.io/token/0x4200000000000000000000000000000000000042',
  },

  // Avalanche C-Chain (Chain ID 43114)
  {
    symbol: 'USDT',
    name: 'TetherToken (Avalanche C-Chain)',
    ecosystem: 'EVM',
    chainId: 43114,
    networkName: 'Avalanche C-Chain',
    contractAddress: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
    decimals: 6,
    explorerUrl: 'https://snowtrace.io/token/0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
  },
  {
    symbol: 'USDC',
    name: 'USD Coin (Avalanche C-Chain)',
    ecosystem: 'EVM',
    chainId: 43114,
    networkName: 'Avalanche C-Chain',
    contractAddress: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
    decimals: 6,
    explorerUrl: 'https://snowtrace.io/token/0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
  },

  // Solana Mainnet (SPL Tokens)
  {
    symbol: 'USDT',
    name: 'Tether USD (Solana SPL)',
    ecosystem: 'SOLANA',
    chainId: 'mainnet-beta',
    networkName: 'Solana Mainnet',
    contractAddress: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    decimals: 6,
    explorerUrl: 'https://solscan.io/token/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  },
  {
    symbol: 'USDC',
    name: 'USD Coin (Solana SPL)',
    ecosystem: 'SOLANA',
    chainId: 'mainnet-beta',
    networkName: 'Solana Mainnet',
    contractAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    decimals: 6,
    explorerUrl: 'https://solscan.io/token/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  },
];

// ============================================================================
// 3. WINDOW PROVIDER TYPE DECLARATIONS (EIP-1193, SOLANA, BITCOIN)
// ============================================================================

interface Eip1193Provider {
  isMetaMask?: boolean;
  isBinance?: boolean;
  isRabby?: boolean;
  isTrust?: boolean;
  isTrustWallet?: boolean;
  isCoinbaseWallet?: boolean;
  isOkxWallet?: boolean;
  isOKExWallet?: boolean;
  providers?: Eip1193Provider[];
  request: (args: { method: string; params?: unknown[] }) => Promise<any>;
  on?: (eventName: string, listener: (...args: any[]) => void) => void;
  removeListener?: (eventName: string, listener: (...args: any[]) => void) => void;
}

interface SolanaInjectedProvider {
  isPhantom?: boolean;
  isSolflare?: boolean;
  isBackpack?: boolean;
  publicKey?: { toString: () => string };
  connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString: () => string } }>;
  disconnect?: () => Promise<void>;
  signAndSendTransaction?: (transaction: unknown) => Promise<{ signature: string }>;
  on?: (eventName: string, listener: (...args: any[]) => void) => void;
  removeListener?: (eventName: string, listener: (...args: any[]) => void) => void;
}

interface BitcoinInjectedProvider {
  requestAccounts?: () => Promise<string[]>;
  getAccounts?: () => Promise<string[]>;
  sendBitcoin?: (toAddress: string, satoshis: number) => Promise<string>;
  connect?: () => Promise<{ address: string }>;
  request?: (method: string, params?: unknown) => Promise<any>;
  on?: (eventName: string, listener: (...args: any[]) => void) => void;
  removeListener?: (eventName: string, listener: (...args: any[]) => void) => void;
}

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
    BinanceChain?: Eip1193Provider;
    trustwallet?: Eip1193Provider;
    phantom?: {
      ethereum?: Eip1193Provider;
      solana?: SolanaInjectedProvider;
      bitcoin?: BitcoinInjectedProvider;
    };
    solflare?: SolanaInjectedProvider;
    backpack?: SolanaInjectedProvider;
    solana?: SolanaInjectedProvider;
    unisat?: BitcoinInjectedProvider;
    okxwallet?: {
      ethereum?: Eip1193Provider;
      bitcoin?: BitcoinInjectedProvider;
      solana?: SolanaInjectedProvider;
    } & Eip1193Provider;
    LeatherProvider?: BitcoinInjectedProvider;
    XverseProviders?: {
      BitcoinProvider?: BitcoinInjectedProvider;
    };
  }
}

export function getActiveEvmProvider(): Eip1193Provider | undefined {
  if (typeof window === 'undefined') return undefined;
  if (window.ethereum?.providers && Array.isArray(window.ethereum.providers)) {
    const preferred =
      window.ethereum.providers.find((p) => p.isMetaMask || p.isRabby || p.isTrust || p.isOkxWallet) ||
      window.ethereum.providers[0];
    if (preferred) return preferred;
  }
  return (
    window.ethereum ||
    window.okxwallet?.ethereum ||
    window.trustwallet ||
    window.BinanceChain ||
    window.phantom?.ethereum
  );
}

export function getActiveSolanaProvider(): SolanaInjectedProvider | undefined {
  if (typeof window === 'undefined') return undefined;
  return (
    window.phantom?.solana ||
    window.solflare ||
    window.backpack ||
    window.okxwallet?.solana ||
    window.solana
  );
}

// ============================================================================
// 4. PROVIDER DETECTION & MOBILE / WALLETCONNECT SUPPORT
// ============================================================================

export interface DetectedWalletCapabilities {
  hasEvmInjected: boolean;
  evmProviderName: string | null;
  detectedEvmProviders: string[];
  hasSolanaInjected: boolean;
  solanaProviderName: string | null;
  detectedSolanaProviders: string[];
  hasBitcoinInjected: boolean;
  bitcoinProviderName: string | null;
  detectedBitcoinProviders: string[];
  isMobileBrowser: boolean;
  walletConnectConfigured: boolean;
  walletConnectProjectId: string | null;
}

export function detectWalletCapabilities(): DetectedWalletCapabilities {
  if (typeof window === 'undefined') {
    return {
      hasEvmInjected: false,
      evmProviderName: null,
      detectedEvmProviders: [],
      hasSolanaInjected: false,
      solanaProviderName: null,
      detectedSolanaProviders: [],
      hasBitcoinInjected: false,
      bitcoinProviderName: null,
      detectedBitcoinProviders: [],
      isMobileBrowser: false,
      walletConnectConfigured: false,
      walletConnectProjectId: null,
    };
  }

  const eth = getActiveEvmProvider();
  const detectedEvmProviders: string[] = [];
  if (window.ethereum?.isMetaMask) detectedEvmProviders.push('MetaMask');
  if (window.ethereum?.isTrust || window.ethereum?.isTrustWallet || window.trustwallet) {
    detectedEvmProviders.push('Trust Wallet');
  }
  if (window.ethereum?.isOkxWallet || window.okxwallet) detectedEvmProviders.push('OKX Wallet');
  if (window.ethereum?.isRabby) detectedEvmProviders.push('Rabby Wallet');
  if (window.ethereum?.isCoinbaseWallet) detectedEvmProviders.push('Coinbase Wallet');
  if (window.ethereum?.isBinance || window.BinanceChain) detectedEvmProviders.push('Binance Web3 Wallet');
  if (eth && detectedEvmProviders.length === 0) detectedEvmProviders.push('EIP-1193 Extension');

  const evmProviderName = detectedEvmProviders[0] || null;

  const sol = getActiveSolanaProvider();
  const detectedSolanaProviders: string[] = [];
  if (window.phantom?.solana || sol?.isPhantom) detectedSolanaProviders.push('Phantom (Solana)');
  if (window.solflare || sol?.isSolflare) detectedSolanaProviders.push('Solflare');
  if (window.backpack || sol?.isBackpack) detectedSolanaProviders.push('Backpack');
  if (window.okxwallet?.solana) detectedSolanaProviders.push('OKX Solana');
  if (sol && detectedSolanaProviders.length === 0) detectedSolanaProviders.push('Solana Standard Wallet');

  const solanaProviderName = detectedSolanaProviders[0] || null;

  const btc =
    window.unisat ||
    window.okxwallet?.bitcoin ||
    window.phantom?.bitcoin ||
    window.LeatherProvider ||
    window.XverseProviders?.BitcoinProvider;
  const detectedBitcoinProviders: string[] = [];
  if (window.unisat) detectedBitcoinProviders.push('UniSat Wallet');
  if (window.XverseProviders?.BitcoinProvider) detectedBitcoinProviders.push('Xverse Wallet');
  if (window.LeatherProvider) detectedBitcoinProviders.push('Leather Wallet');
  if (window.okxwallet?.bitcoin) detectedBitcoinProviders.push('OKX Bitcoin');
  if (window.phantom?.bitcoin) detectedBitcoinProviders.push('Phantom Bitcoin');

  const bitcoinProviderName = detectedBitcoinProviders[0] || null;

  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const isMobileBrowser = /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(ua);

  const wcProjectId =
    (import.meta as any).env?.VITE_WALLETCONNECT_PROJECT_ID?.trim() || null;

  return {
    hasEvmInjected: Boolean(eth),
    evmProviderName,
    detectedEvmProviders,
    hasSolanaInjected: Boolean(sol),
    solanaProviderName,
    detectedSolanaProviders,
    hasBitcoinInjected: Boolean(btc),
    bitcoinProviderName,
    detectedBitcoinProviders,
    isMobileBrowser,
    walletConnectConfigured: Boolean(wcProjectId),
    walletConnectProjectId: wcProjectId,
  };
}

export function getMobileWalletDeepLinks(targetUrl?: string): {
  id: string;
  name: string;
  ecosystem: WalletEcosystem;
  deepLinkUrl: string;
  description: string;
}[] {
  const currentUrl =
    targetUrl || (typeof window !== 'undefined' ? window.location.href : 'https://localhost:3000');
  const hostAndPath = currentUrl.replace(/^https?:\/\//, '');
  const encodedUrl = encodeURIComponent(currentUrl);

  return [
    {
      id: 'metamask_mobile',
      name: 'MetaMask Mobile',
      ecosystem: 'EVM',
      deepLinkUrl: `https://metamask.app.link/dapp/${hostAndPath}`,
      description: 'Open in MetaMask Mobile in-app EVM browser',
    },
    {
      id: 'trust_mobile',
      name: 'Trust Wallet Mobile',
      ecosystem: 'EVM',
      deepLinkUrl: `https://link.trustwallet.com/open_url?coin_id=60&url=${encodedUrl}`,
      description: 'Open in Trust Wallet Mobile multi-chain browser',
    },
    {
      id: 'okx_mobile',
      name: 'OKX Web3 Mobile (EVM / BTC / SOL)',
      ecosystem: 'BITCOIN',
      deepLinkUrl: `okx://wallet/dapp/details?dappUrl=${encodedUrl}`,
      description: 'Open in OKX Web3 Mobile multi-ecosystem wallet',
    },
    {
      id: 'phantom_mobile',
      name: 'Phantom Mobile (Solana & EVM)',
      ecosystem: 'SOLANA',
      deepLinkUrl: `https://phantom.app/ul/browse/${encodedUrl}?ref=${encodedUrl}`,
      description: 'Open in Phantom Mobile Solana & multi-chain browser',
    },
  ];
}

// ============================================================================
// 5. ADDRESS VALIDATION & TOKEN CONTRACT ANTI-SPOOFING GUARD
// ============================================================================

export function validateBlockchainAddress(
  ecosystem: WalletEcosystem,
  rawAddress: string
): { valid: boolean; normalized: string; reason?: string } {
  const trimmed = (rawAddress || '').trim();
  if (!trimmed) {
    return { valid: false, normalized: '', reason: 'Recipient address is required.' };
  }

  if (ecosystem === 'EVM') {
    if (!/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
      return {
        valid: false,
        normalized: trimmed,
        reason: 'Invalid EVM address format. Must be a 42-character hexadecimal address starting with 0x.',
      };
    }
    if (/^0x0{40}$/i.test(trimmed)) {
      return {
        valid: false,
        normalized: trimmed,
        reason: 'Burn / zero address (0x0000...0000) is blocked to prevent irreversible fund loss.',
      };
    }
    const matchingTokenContract = VERIFIED_TOKEN_REGISTRY.find(
      (t) => t.ecosystem === 'EVM' && t.contractAddress.toLowerCase() === trimmed.toLowerCase()
    );
    if (matchingTokenContract) {
      return {
        valid: false,
        normalized: trimmed,
        reason: `Address matches the ${matchingTokenContract.symbol} token smart contract (${matchingTokenContract.networkName}). Never send funds directly to a token contract address.`,
      };
    }
    return { valid: true, normalized: trimmed };
  }

  if (ecosystem === 'SOLANA') {
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(trimmed)) {
      return {
        valid: false,
        normalized: trimmed,
        reason: 'Invalid Solana address format. Must be a valid Base58 public key (32–44 characters).',
      };
    }
    const matchingMint = VERIFIED_TOKEN_REGISTRY.find(
      (t) => t.ecosystem === 'SOLANA' && t.contractAddress === trimmed
    );
    if (matchingMint) {
      return {
        valid: false,
        normalized: trimmed,
        reason: `Address is the ${matchingMint.symbol} SPL Token Mint address. Send to a recipient wallet address instead.`,
      };
    }
    return { valid: true, normalized: trimmed };
  }

  if (ecosystem === 'BITCOIN') {
    const isBech32 = /^bc1[ac-hj-np-z02-9]{11,71}$/i.test(trimmed);
    const isLegacyOrP2sh = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(trimmed);
    if (!isBech32 && !isLegacyOrP2sh) {
      return {
        valid: false,
        normalized: trimmed,
        reason:
          'Invalid Bitcoin Mainnet address. Must be Native SegWit/Taproot (bc1q... / bc1p...) or Legacy/P2SH (1... / 3...).',
      };
    }
    return { valid: true, normalized: trimmed };
  }

  return { valid: false, normalized: trimmed, reason: 'Unsupported blockchain ecosystem.' };
}

// ============================================================================
// 6. EVM RPC HELPERS: NATIVE BALANCE, GAS ESTIMATION, VERIFIED ERC-20 BALANCES
// ============================================================================

async function callEvmJsonRpc(
  chainId: number,
  method: string,
  params: unknown[]
): Promise<{ ok: boolean; result?: any; error?: string }> {
  const config = EVM_CHAIN_CONFIGS[chainId] || EVM_CHAIN_CONFIGS[1];

  // Try public RPC endpoints for the target chainId first so cross-chain queries always hit the right network
  for (const rpcUrl of config.rpcUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);
      const res = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method,
          params,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) continue;
      const data = await res.json();
      if (data?.error) {
        return { ok: false, error: data.error.message || 'RPC Error' };
      }
      if (data && 'result' in data) {
        return { ok: true, result: data.result };
      }
    } catch {
      continue;
    }
  }

  // Fallback to injected provider if on matching chain
  const eth = getActiveEvmProvider();
  if (eth) {
    try {
      const result = await eth.request({ method, params });
      return { ok: true, result };
    } catch (err: any) {
      return { ok: false, error: err?.message || 'Injected RPC failed' };
    }
  }

  return { ok: false, error: `All RPC endpoints for ${config.name} were unreachable.` };
}

export async function fetchEvmNativeBalanceViaRpc(
  address: string,
  chainId: number
): Promise<number | null> {
  const rpcRes = await callEvmJsonRpc(chainId, 'eth_getBalance', [address, 'latest']);
  if (rpcRes.ok && typeof rpcRes.result === 'string' && rpcRes.result.startsWith('0x')) {
    try {
      const wei = BigInt(rpcRes.result);
      return Number(wei) / 1e18;
    } catch {
      return null;
    }
  }
  return null;
}

export async function fetchEvmGasPriceGwei(chainId: number): Promise<number | null> {
  const rpcRes = await callEvmJsonRpc(chainId, 'eth_gasPrice', []);
  if (rpcRes.ok && typeof rpcRes.result === 'string' && rpcRes.result.startsWith('0x')) {
    try {
      const wei = BigInt(rpcRes.result);
      return Number((Number(wei) / 1e9).toFixed(4));
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Queries verified ERC-20 token contracts on the specified EVM chain using
 * standard `balanceOf(address)` selector `0x70a08231`.
 * Never fabricates balances.
 */
export async function fetchEvmVerifiedTokenBalances(
  ownerAddress: string,
  chainId: number
): Promise<VerifiedTokenBalance[]> {
  const tokensForChain = VERIFIED_TOKEN_REGISTRY.filter(
    (t) => t.ecosystem === 'EVM' && Number(t.chainId) === Number(chainId)
  );
  if (tokensForChain.length === 0) return [];

  const cleanAddr = ownerAddress.trim().replace(/^0x/i, '').toLowerCase().padStart(64, '0');
  const callData = `0x70a08231${cleanAddr}`;

  const results = await Promise.all(
    tokensForChain.map(async (tokenCfg): Promise<VerifiedTokenBalance> => {
      const res = await callEvmJsonRpc(chainId, 'eth_call', [
        {
          to: tokenCfg.contractAddress,
          data: callData,
        },
        'latest',
      ]);

      if (res.ok && typeof res.result === 'string' && res.result.startsWith('0x')) {
        try {
          const rawHex = res.result === '0x' ? '0x0' : res.result;
          const rawUnits = BigInt(rawHex);
          const divisor = Math.pow(10, tokenCfg.decimals);
          const numericBal = Number(rawUnits) / divisor;
          return {
            symbol: tokenCfg.symbol,
            name: tokenCfg.name,
            ecosystem: 'EVM',
            chainId: tokenCfg.chainId,
            networkName: tokenCfg.networkName,
            contractAddress: tokenCfg.contractAddress,
            decimals: tokenCfg.decimals,
            balance: Number.isFinite(numericBal) ? numericBal : 0,
            status: 'synced',
            explorerUrl: tokenCfg.explorerUrl,
            lastSyncedAt: Date.now(),
          };
        } catch {
          return {
            symbol: tokenCfg.symbol,
            name: tokenCfg.name,
            ecosystem: 'EVM',
            chainId: tokenCfg.chainId,
            networkName: tokenCfg.networkName,
            contractAddress: tokenCfg.contractAddress,
            decimals: tokenCfg.decimals,
            balance: null,
            status: 'rpc_error',
            explorerUrl: tokenCfg.explorerUrl,
            lastSyncedAt: Date.now(),
          };
        }
      }

      return {
        symbol: tokenCfg.symbol,
        name: tokenCfg.name,
        ecosystem: 'EVM',
        chainId: tokenCfg.chainId,
        networkName: tokenCfg.networkName,
        contractAddress: tokenCfg.contractAddress,
        decimals: tokenCfg.decimals,
        balance: null,
        status: 'rpc_error',
        explorerUrl: tokenCfg.explorerUrl,
        lastSyncedAt: Date.now(),
      };
    })
  );

  return results;
}

/**
 * Inspects a custom ERC-20 token contract on-chain via eth_call (decimals & balanceOf)
 * and checks whether it is in the canonical verified registry.
 */
export async function inspectCustomErc20Contract(params: {
  ownerAddress: string;
  contractAddress: string;
  chainId: number;
}): Promise<{
  ok: boolean;
  message: string;
  isCanonicalVerified: boolean;
  decimals?: number;
  balance?: number;
  explorerUrl?: string;
}> {
  const { ownerAddress, contractAddress, chainId } = params;
  const trimmedContract = contractAddress.trim();
  if (!/^0x[a-fA-F0-9]{40}$/.test(trimmedContract)) {
    return {
      ok: false,
      message: 'Contract address must be a valid 42-character hexadecimal EVM address.',
      isCanonicalVerified: false,
    };
  }

  const chainCfg = EVM_CHAIN_CONFIGS[chainId] || EVM_CHAIN_CONFIGS[1];
  const canonicalMatch = VERIFIED_TOKEN_REGISTRY.find(
    (t) =>
      t.ecosystem === 'EVM' &&
      Number(t.chainId) === Number(chainId) &&
      t.contractAddress.toLowerCase() === trimmedContract.toLowerCase()
  );

  // Query decimals() -> 0x313ce567
  const decRes = await callEvmJsonRpc(chainId, 'eth_call', [
    { to: trimmedContract, data: '0x313ce567' },
    'latest',
  ]);
  if (!decRes.ok || typeof decRes.result !== 'string' || decRes.result === '0x') {
    return {
      ok: false,
      message: `No valid ERC-20 decimals() response at ${trimmedContract} on ${chainCfg.name}. Verify the network and contract address.`,
      isCanonicalVerified: false,
    };
  }

  let decimals = 18;
  try {
    decimals = Number(BigInt(decRes.result));
  } catch {
    decimals = 18;
  }

  let balance = 0;
  if (/^0x[a-fA-F0-9]{40}$/.test(ownerAddress)) {
    const cleanOwner = ownerAddress.replace(/^0x/i, '').toLowerCase().padStart(64, '0');
    const balRes = await callEvmJsonRpc(chainId, 'eth_call', [
      { to: trimmedContract, data: `0x70a08231${cleanOwner}` },
      'latest',
    ]);
    if (balRes.ok && typeof balRes.result === 'string' && balRes.result !== '0x') {
      try {
        balance = Number(BigInt(balRes.result)) / Math.pow(10, decimals);
      } catch {
        balance = 0;
      }
    }
  }

  return {
    ok: true,
    isCanonicalVerified: Boolean(canonicalMatch),
    decimals,
    balance,
    explorerUrl: `${chainCfg.explorerUrl}/token/${trimmedContract}`,
    message: canonicalMatch
      ? `Verified canonical ${canonicalMatch.symbol} contract on ${chainCfg.name} (${decimals} decimals).`
      : `Unverified custom ERC-20 contract on ${chainCfg.name} (${decimals} decimals). Warning: Anyone can deploy a token with the same symbol; verify the contract on ${chainCfg.explorerUrl} before interacting.`,
  };
}

// ============================================================================
// 7. EVM WALLET CONNECTION & CHAIN SWITCHING
// ============================================================================

export async function connectEvmWallet(): Promise<{
  ok: boolean;
  message: string;
  account?: ConnectedChainAccount;
}> {
  if (typeof window === 'undefined') {
    return { ok: false, message: 'Browser window environment is unavailable.' };
  }

  const eth = getActiveEvmProvider();
  if (!eth) {
    return {
      ok: false,
      message:
        'No EIP-1193 EVM wallet extension detected (MetaMask, Trust Wallet, OKX, Rabby, or Binance Wallet). On mobile, use the Mobile Wallet / WalletConnect pairing options.',
    };
  }

  try {
    const accounts: string[] = await eth.request({ method: 'eth_requestAccounts' });
    if (!Array.isArray(accounts) || accounts.length === 0 || !accounts[0]) {
      return { ok: false, message: 'Wallet connection was rejected or returned no accounts.' };
    }

    const address = accounts[0];
    const chainIdHex: string = await eth.request({ method: 'eth_chainId' });
    const chainId = parseInt(chainIdHex, 16) || 1;
    const chainConfig = EVM_CHAIN_CONFIGS[chainId] || {
      chainId,
      chainIdHex,
      name: `EVM Chain #${chainId}`,
      shortName: `Chain ${chainId}`,
      nativeSymbol: 'ETH',
      decimals: 18,
      rpcUrls: ['https://ethereum-rpc.publicnode.com'],
      explorerUrl: 'https://etherscan.io',
    };

    const caps = detectWalletCapabilities();
    const [nativeBalance, gasPriceGwei, tokenBalances] = await Promise.all([
      fetchEvmNativeBalanceViaRpc(address, chainId),
      fetchEvmGasPriceGwei(chainId),
      fetchEvmVerifiedTokenBalances(address, chainId),
    ]);

    const account: ConnectedChainAccount = {
      ecosystem: 'EVM',
      address,
      providerName: caps.evmProviderName || 'EIP-1193 Wallet',
      connectionMethod: 'eip1193_injected',
      chainId,
      networkName: chainConfig.name,
      nativeSymbol: chainConfig.nativeSymbol,
      nativeBalance,
      balanceStatus: nativeBalance !== null ? 'synced' : 'rpc_error',
      rpcError: nativeBalance === null ? 'Could not reach RPC for native balance' : null,
      gasPriceGwei,
      tokenBalances,
      lastSyncedAt: Date.now(),
    };

    return {
      ok: true,
      message: `Connected ${account.providerName} on ${chainConfig.name}`,
      account,
    };
  } catch (err: any) {
    const isRejected = err?.code === 4001 || /reject|denied|cancel/i.test(err?.message || '');
    return {
      ok: false,
      message: isRejected
        ? 'Connection request was rejected by the user in the EVM wallet.'
        : err?.message || 'EVM wallet authorization failed.',
    };
  }
}

export async function switchEvmNetwork(targetChainId: number): Promise<{
  ok: boolean;
  message: string;
}> {
  const eth = getActiveEvmProvider();
  if (!eth) {
    return { ok: false, message: 'No connected EIP-1193 provider found to switch networks.' };
  }
  const config = EVM_CHAIN_CONFIGS[targetChainId];
  if (!config) {
    return { ok: false, message: `Unsupported EVM chain ID #${targetChainId}.` };
  }

  try {
    await eth.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: config.chainIdHex }],
    });
    return { ok: true, message: `Switched wallet network to ${config.name}` };
  } catch (switchErr: any) {
    // Error code 4902 indicates the chain has not been added to the wallet yet
    if (switchErr?.code === 4902 || /unrecognized chain|addEthereumChain/i.test(switchErr?.message || '')) {
      try {
        await eth.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: config.chainIdHex,
              chainName: config.name,
              nativeCurrency: {
                name: config.nativeSymbol,
                symbol: config.nativeSymbol,
                decimals: config.decimals,
              },
              rpcUrls: config.rpcUrls,
              blockExplorerUrls: [config.explorerUrl],
            },
          ],
        });
        return { ok: true, message: `Added and switched to ${config.name}` };
      } catch (addErr: any) {
        return {
          ok: false,
          message: addErr?.message || `Failed to add ${config.name} in wallet.`,
        };
      }
    }

    return {
      ok: false,
      message: switchErr?.message || `Failed to switch wallet to ${config.name}.`,
    };
  }
}

// ============================================================================
// 8. SOLANA WALLET INTEGRATION (SOLANA WALLET STANDARD + SPL TOKEN RPC)
// ============================================================================

export async function callSolanaJsonRpc(
  method: string,
  params: unknown[]
): Promise<{ ok: boolean; result?: any; error?: string }> {
  for (const rpcUrl of SOLANA_RPC_ENDPOINTS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);
      const res = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method,
          params,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) continue;
      const data = await res.json();
      if (data?.error) {
        return { ok: false, error: data.error.message || 'Solana RPC Error' };
      }
      if (data && 'result' in data) {
        return { ok: true, result: data.result };
      }
    } catch {
      continue;
    }
  }
  return { ok: false, error: 'All Solana RPC endpoints were unreachable.' };
}

export async function fetchSolanaNativeBalanceViaRpc(address: string): Promise<number | null> {
  const res = await callSolanaJsonRpc('getBalance', [address, { commitment: 'confirmed' }]);
  const lamports = res.result?.value;
  if (res.ok && typeof lamports === 'number') {
    return lamports / 1e9;
  }
  return null;
}

export async function fetchSolanaVerifiedTokenBalances(
  ownerAddress: string
): Promise<VerifiedTokenBalance[]> {
  const solTokens = VERIFIED_TOKEN_REGISTRY.filter((t) => t.ecosystem === 'SOLANA');
  const results = await Promise.all(
    solTokens.map(async (tokenCfg): Promise<VerifiedTokenBalance> => {
      for (const rpcUrl of SOLANA_RPC_ENDPOINTS) {
        try {
          const res = await fetch(rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 1,
              method: 'getTokenAccountsByOwner',
              params: [
                ownerAddress,
                { mint: tokenCfg.contractAddress },
                { encoding: 'jsonParsed', commitment: 'confirmed' },
              ],
            }),
          });
          if (!res.ok) continue;
          const data = await res.json();
          const accounts = data?.result?.value;
          if (Array.isArray(accounts)) {
            let totalUiAmount = 0;
            for (const acc of accounts) {
              const uiAmt =
                acc?.account?.data?.parsed?.info?.tokenAmount?.uiAmount ?? 0;
              totalUiAmount += Number(uiAmt) || 0;
            }
            return {
              symbol: tokenCfg.symbol,
              name: tokenCfg.name,
              ecosystem: 'SOLANA',
              chainId: 'mainnet-beta',
              networkName: 'Solana Mainnet',
              contractAddress: tokenCfg.contractAddress,
              decimals: tokenCfg.decimals,
              balance: totalUiAmount,
              status: 'synced',
              explorerUrl: tokenCfg.explorerUrl,
              lastSyncedAt: Date.now(),
            };
          }
        } catch {
          continue;
        }
      }
      return {
        symbol: tokenCfg.symbol,
        name: tokenCfg.name,
        ecosystem: 'SOLANA',
        chainId: 'mainnet-beta',
        networkName: 'Solana Mainnet',
        contractAddress: tokenCfg.contractAddress,
        decimals: tokenCfg.decimals,
        balance: null,
        status: 'rpc_error',
        explorerUrl: tokenCfg.explorerUrl,
        lastSyncedAt: Date.now(),
      };
    })
  );
  return results;
}

export async function connectSolanaWallet(): Promise<{
  ok: boolean;
  message: string;
  account?: ConnectedChainAccount;
}> {
  if (typeof window === 'undefined') {
    return { ok: false, message: 'Browser environment unavailable.' };
  }

  const provider = getActiveSolanaProvider();
  if (!provider || typeof provider.connect !== 'function') {
    return {
      ok: false,
      message:
        'No Solana wallet provider detected (Phantom, Solflare, Backpack, or OKX Solana). Note: EIP-1193 is for EVM networks only; install a Solana wallet extension or open in Phantom Mobile.',
    };
  }

  try {
    const resp = await provider.connect();
    const pubKeyObj = resp?.publicKey || provider.publicKey;
    const address = pubKeyObj?.toString?.();
    if (!address) {
      return { ok: false, message: 'Solana wallet did not return a public key.' };
    }

    const caps = detectWalletCapabilities();
    const [nativeBalance, tokenBalances] = await Promise.all([
      fetchSolanaNativeBalanceViaRpc(address),
      fetchSolanaVerifiedTokenBalances(address),
    ]);

    const account: ConnectedChainAccount = {
      ecosystem: 'SOLANA',
      address,
      providerName: caps.solanaProviderName || 'Solana Wallet',
      connectionMethod: 'solana_injected',
      chainId: 'mainnet-beta',
      networkName: 'Solana Mainnet',
      nativeSymbol: 'SOL',
      nativeBalance,
      balanceStatus: nativeBalance !== null ? 'synced' : 'rpc_error',
      rpcError: nativeBalance === null ? 'Solana RPC endpoint rate-limited or unreachable' : null,
      tokenBalances,
      lastSyncedAt: Date.now(),
    };

    return {
      ok: true,
      message: `Connected ${account.providerName} (${address.slice(0, 6)}...${address.slice(-4)})`,
      account,
    };
  } catch (err: any) {
    return {
      ok: false,
      message: err?.message || 'Solana wallet connection was rejected by the user.',
    };
  }
}

// ============================================================================
// 9. BITCOIN WALLET INTEGRATION (UNISAT / XVERSE / LEATHER / OKX + MEMPOOL API)
// ============================================================================

export async function fetchBitcoinBalanceViaMempool(address: string): Promise<{
  confirmedBtc: number;
  unconfirmedBtc: number;
} | null> {
  try {
    const res = await fetch(`${BITCOIN_MEMPOOL_API}/address/${encodeURIComponent(address)}`);
    if (!res.ok) return null;
    const data = await res.json();
    const chainFunded = Number(data?.chain_stats?.funded_txo_sum || 0);
    const chainSpent = Number(data?.chain_stats?.spent_txo_sum || 0);
    const mempoolFunded = Number(data?.mempool_stats?.funded_txo_sum || 0);
    const mempoolSpent = Number(data?.mempool_stats?.spent_txo_sum || 0);

    const confirmedSats = Math.max(0, chainFunded - chainSpent);
    const unconfirmedSats = mempoolFunded - mempoolSpent;

    return {
      confirmedBtc: confirmedSats / 1e8,
      unconfirmedBtc: unconfirmedSats / 1e8,
    };
  } catch {
    return null;
  }
}

export async function fetchBitcoinRecommendedFees(): Promise<{
  fastestFee: number;
  halfHourFee: number;
  hourFee: number;
} | null> {
  try {
    const res = await fetch(`${BITCOIN_MEMPOOL_API}/v1/fees/recommended`);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      fastestFee: Number(data?.fastestFee || 12),
      halfHourFee: Number(data?.halfHourFee || 8),
      hourFee: Number(data?.hourFee || 5),
    };
  } catch {
    return null;
  }
}

export async function connectBitcoinWallet(): Promise<{
  ok: boolean;
  message: string;
  account?: ConnectedChainAccount;
}> {
  if (typeof window === 'undefined') {
    return { ok: false, message: 'Browser environment unavailable.' };
  }

  const unisatOrOkx = window.unisat || window.okxwallet?.bitcoin || window.phantom?.bitcoin;
  const leather = window.LeatherProvider;
  const xverse = window.XverseProviders?.BitcoinProvider;

  if (!unisatOrOkx && !leather && !xverse) {
    return {
      ok: false,
      message:
        'No Bitcoin wallet provider detected (UniSat, Xverse, Leather, or OKX Bitcoin). Note: EIP-1193 is for EVM networks only; install a Bitcoin wallet extension to connect a genuine BTC UTXO account.',
    };
  }

  try {
    let address = '';
    if (unisatOrOkx?.requestAccounts) {
      const accounts = await unisatOrOkx.requestAccounts();
      address = accounts?.[0] || '';
    } else if (unisatOrOkx?.connect) {
      const res = await unisatOrOkx.connect();
      address = res?.address || '';
    } else if (leather?.request) {
      const resp = await leather.request('getAddresses');
      const btcEntry = resp?.result?.addresses?.find(
        (a: any) => a.symbol === 'BTC' || a.type === 'p2wpkh'
      );
      address = btcEntry?.address || '';
    } else if (xverse?.request) {
      const resp = await xverse.request('getAccounts', {
        purposes: ['payment'],
      });
      address = resp?.result?.[0]?.address || '';
    }

    if (!address) {
      return { ok: false, message: 'Bitcoin wallet did not return a valid address.' };
    }

    const caps = detectWalletCapabilities();
    const balInfo = await fetchBitcoinBalanceViaMempool(address);

    const account: ConnectedChainAccount = {
      ecosystem: 'BITCOIN',
      address,
      providerName: caps.bitcoinProviderName || 'Bitcoin Wallet',
      connectionMethod: 'bitcoin_injected',
      chainId: 'bitcoin-mainnet',
      networkName: 'Bitcoin Mainnet',
      nativeSymbol: 'BTC',
      nativeBalance: balInfo ? balInfo.confirmedBtc : null,
      unconfirmedBalance: balInfo ? balInfo.unconfirmedBtc : 0,
      balanceStatus: balInfo ? 'synced' : 'rpc_error',
      rpcError: balInfo ? null : 'Mempool.space indexer temporarily unreachable',
      tokenBalances: [],
      lastSyncedAt: Date.now(),
    };

    return {
      ok: true,
      message: `Connected ${account.providerName} (${address.slice(0, 6)}...${address.slice(-4)})`,
      account,
    };
  } catch (err: any) {
    return {
      ok: false,
      message: err?.message || 'Bitcoin wallet connection was declined by the user.',
    };
  }
}

// ============================================================================
// 10. WALLET PROVIDER EVENT SUBSCRIPTIONS (ACCOUNTS, CHAIN, DISCONNECT)
// ============================================================================

export function subscribeToWalletProviderEvents(handlers: {
  onEvmAccountsChanged?: (accounts: string[]) => void;
  onEvmChainChanged?: (newChainId: number) => void;
  onEvmDisconnect?: () => void;
  onSolanaAccountChanged?: (newAddress: string | null) => void;
  onBitcoinAccountsChanged?: (accounts: string[]) => void;
}): () => void {
  const cleanups: Array<() => void> = [];

  const eth = getActiveEvmProvider();
  if (eth && typeof eth.on === 'function') {
    const handleAccounts = (accounts: string[]) => {
      handlers.onEvmAccountsChanged?.(Array.isArray(accounts) ? accounts : []);
    };
    const handleChain = (chainIdHex: string | number) => {
      const parsed =
        typeof chainIdHex === 'string'
          ? parseInt(chainIdHex, 16) || Number(chainIdHex)
          : Number(chainIdHex);
      if (parsed > 0) {
        handlers.onEvmChainChanged?.(parsed);
      }
    };
    const handleDisconnect = () => {
      handlers.onEvmDisconnect?.();
    };

    eth.on('accountsChanged', handleAccounts);
    eth.on('chainChanged', handleChain);
    eth.on('disconnect', handleDisconnect);

    cleanups.push(() => {
      eth.removeListener?.('accountsChanged', handleAccounts);
      eth.removeListener?.('chainChanged', handleChain);
      eth.removeListener?.('disconnect', handleDisconnect);
    });
  }

  const sol = getActiveSolanaProvider();
  if (sol && typeof sol.on === 'function') {
    const handleSolAccount = (pubKey: any) => {
      const addr = pubKey?.toString?.() || null;
      handlers.onSolanaAccountChanged?.(addr);
    };
    const handleSolDisconnect = () => {
      handlers.onSolanaAccountChanged?.(null);
    };
    sol.on('accountChanged', handleSolAccount);
    sol.on('disconnect', handleSolDisconnect);
    cleanups.push(() => {
      sol.removeListener?.('accountChanged', handleSolAccount);
      sol.removeListener?.('disconnect', handleSolDisconnect);
    });
  }

  const unisat = typeof window !== 'undefined' ? window.unisat : undefined;
  if (unisat && typeof unisat.on === 'function') {
    const handleBtcAccounts = (accounts: string[]) => {
      handlers.onBitcoinAccountsChanged?.(Array.isArray(accounts) ? accounts : []);
    };
    unisat.on('accountsChanged', handleBtcAccounts);
    cleanups.push(() => {
      unisat.removeListener?.('accountsChanged', handleBtcAccounts);
    });
  }

  return () => {
    for (const fn of cleanups) {
      try {
        fn();
      } catch {
        // ignore cleanup error
      }
    }
  };
}

// ============================================================================
// 11. REAL SELF-CUSTODY TRANSACTION AUTHORIZATION & RECEIPT VERIFICATION
// ============================================================================

function encodeErc20TransferCallData(toAddress: string, rawAmountUnits: bigint): string {
  // transfer(address,uint256) selector = 0xa9059cbb
  const cleanRecipient = toAddress.trim().replace(/^0x/i, '').toLowerCase().padStart(64, '0');
  const hexAmount = rawAmountUnits.toString(16).padStart(64, '0');
  return `0xa9059cbb${cleanRecipient}${hexAmount}`;
}

/**
 * Executes a genuine self-custody native OR verified ERC-20 transfer from the user's
 * connected EVM or Bitcoin wallet and checks the blockchain for actual confirmation.
 * Never fabricates transaction hashes or simulated confirmations.
 */
export async function sendAndConfirmSelfCustodyNativeTransfer(params: {
  ecosystem: WalletEcosystem;
  fromAddress: string;
  toAddress: string;
  amount: number;
  chainId?: number;
  tokenContract?: string;
  tokenSymbol?: string;
  tokenDecimals?: number;
  onStatusUpdate?: (status: RealOnChainTransaction['status'], txHash?: string) => void;
}): Promise<{
  ok: boolean;
  message: string;
  txRecord?: RealOnChainTransaction;
}> {
  const {
    ecosystem,
    fromAddress,
    toAddress,
    amount,
    chainId = 1,
    tokenContract,
    tokenSymbol,
    tokenDecimals = 18,
    onStatusUpdate,
  } = params;

  const addrCheck = validateBlockchainAddress(ecosystem, toAddress);
  if (!addrCheck.valid) {
    return { ok: false, message: addrCheck.reason || 'Invalid recipient address.' };
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, message: 'Transfer amount must be greater than zero.' };
  }

  if (ecosystem === 'EVM') {
    const eth = getActiveEvmProvider();
    if (!eth) {
      return {
        ok: false,
        message: 'No connected EIP-1193 EVM wallet available to authorize transaction.',
      };
    }

    const chainConfig = EVM_CHAIN_CONFIGS[chainId] || EVM_CHAIN_CONFIGS[1];

    // Verify wallet is currently on the expected chainId
    try {
      const currentChainHex: string = await eth.request({ method: 'eth_chainId' });
      const currentChainId = parseInt(currentChainHex, 16) || 1;
      if (currentChainId !== chainId) {
        return {
          ok: false,
          message: `Wallet network mismatch: wallet is on Chain #${currentChainId}, but transfer is configured for ${chainConfig.name} (#${chainId}). Switch network first.`,
        };
      }
    } catch {
      // proceed if chainId check unsupported
    }

    const isTokenTransfer = Boolean(tokenContract && /^0x[a-fA-F0-9]{40}$/.test(tokenContract));
    const assetLabel = isTokenTransfer ? tokenSymbol || 'ERC20' : chainConfig.nativeSymbol;

    try {
      onStatusUpdate?.('Awaiting Signature');

      let txParams: Record<string, string>;
      if (isTokenTransfer && tokenContract) {
        const rawUnits = BigInt(Math.round(amount * Math.pow(10, tokenDecimals)));
        const data = encodeErc20TransferCallData(addrCheck.normalized, rawUnits);
        txParams = {
          from: fromAddress,
          to: tokenContract,
          value: '0x0',
          data,
        };
      } else {
        const weiBigInt = BigInt(Math.round(amount * 1e18));
        const valueHex = `0x${weiBigInt.toString(16)}`;
        txParams = {
          from: fromAddress,
          to: addrCheck.normalized,
          value: valueHex,
        };
      }

      const txHash: string = await eth.request({
        method: 'eth_sendTransaction',
        params: [txParams],
      });

      if (!txHash || typeof txHash !== 'string' || !txHash.startsWith('0x')) {
        return { ok: false, message: 'No valid transaction hash returned by wallet provider.' };
      }

      onStatusUpdate?.('Broadcasted (Pending Confirmation)', txHash);

      // Poll eth_getTransactionReceipt for real network confirmation
      let confirmed = false;
      let failed = false;
      let blockNumber: number | undefined;
      let gasUsed: string | undefined;

      for (let attempt = 0; attempt < 20; attempt++) {
        await new Promise((r) => setTimeout(r, 2500));
        const receipt = await eth.request({
          method: 'eth_getTransactionReceipt',
          params: [txHash],
        });
        if (receipt && receipt.blockNumber) {
          blockNumber = parseInt(receipt.blockNumber, 16) || undefined;
          if (receipt.gasUsed) {
            gasUsed = String(parseInt(receipt.gasUsed, 16));
          }
          if (receipt.status === '0x1' || receipt.status === 1) {
            confirmed = true;
          } else {
            failed = true;
          }
          break;
        }
      }

      const finalStatus: RealOnChainTransaction['status'] = failed
        ? 'Failed'
        : confirmed
        ? 'Confirmed On-Chain'
        : 'Broadcasted (Pending Confirmation)';

      const txRecord: RealOnChainTransaction = {
        id: `onchain-${Date.now()}`,
        txHash,
        ecosystem: 'EVM',
        chainId,
        networkName: chainConfig.name,
        fromAddress,
        toAddress: addrCheck.normalized,
        asset: assetLabel,
        amount,
        isTokenTransfer,
        tokenContract: isTokenTransfer ? tokenContract : undefined,
        status: finalStatus,
        confirmations: confirmed ? 1 : 0,
        blockNumber,
        gasUsed,
        explorerUrl: `${chainConfig.explorerUrl}/tx/${txHash}`,
        timestamp: Date.now(),
      };

      return {
        ok: !failed,
        message: confirmed
          ? `Confirmed on ${chainConfig.name} (Block #${blockNumber || 'latest'})`
          : failed
          ? `Transaction reverted on ${chainConfig.name}`
          : `Broadcasted (${txHash.slice(0, 10)}...); awaiting block inclusion on ${chainConfig.name}.`,
        txRecord,
      };
    } catch (err: any) {
      const isUserRejected =
        err?.code === 4001 || /reject|denied|cancel|declined/i.test(err?.message || '');
      return {
        ok: false,
        message: isUserRejected
          ? 'Transaction signature was rejected by the user in wallet.'
          : err?.message || 'EVM transaction failed before broadcast.',
      };
    }
  }

  if (ecosystem === 'BITCOIN') {
    const btcProvider = window.unisat || window.okxwallet?.bitcoin || window.phantom?.bitcoin;
    if (!btcProvider || typeof btcProvider.sendBitcoin !== 'function') {
      return {
        ok: false,
        message: 'Connected Bitcoin wallet provider does not expose sendBitcoin.',
      };
    }

    try {
      onStatusUpdate?.('Awaiting Signature');
      const satoshis = Math.round(amount * 1e8);
      if (satoshis < 546) {
        return {
          ok: false,
          message: 'Amount is below the Bitcoin network dust threshold (546 satoshis).',
        };
      }

      const txid = await btcProvider.sendBitcoin(addrCheck.normalized, satoshis);
      if (!txid || typeof txid !== 'string') {
        return { ok: false, message: 'Bitcoin wallet did not return a transaction ID.' };
      }

      onStatusUpdate?.('Broadcasted (Pending Confirmation)', txid);

      // Query real mempool.space status
      let confirmed = false;
      let blockHeight: number | undefined;
      try {
        const statusRes = await fetch(`${BITCOIN_MEMPOOL_API}/tx/${encodeURIComponent(txid)}/status`);
        if (statusRes.ok) {
          const statusJson = await statusRes.json();
          confirmed = Boolean(statusJson?.confirmed);
          blockHeight = statusJson?.block_height ? Number(statusJson.block_height) : undefined;
        }
      } catch {
        // Remains Broadcasted (Pending Confirmation) in mempool
      }

      const txRecord: RealOnChainTransaction = {
        id: `onchain-btc-${Date.now()}`,
        txHash: txid,
        ecosystem: 'BITCOIN',
        chainId: 'bitcoin-mainnet',
        networkName: 'Bitcoin Mainnet',
        fromAddress,
        toAddress: addrCheck.normalized,
        asset: 'BTC',
        amount,
        status: confirmed ? 'Confirmed On-Chain' : 'Broadcasted (Pending Confirmation)',
        confirmations: confirmed ? 1 : 0,
        blockNumber: blockHeight,
        explorerUrl: `https://mempool.space/tx/${txid}`,
        timestamp: Date.now(),
      };

      return {
        ok: true,
        message: confirmed
          ? `Bitcoin transaction confirmed (${txid.slice(0, 10)}...)`
          : `Broadcasted to Bitcoin mempool (${txid.slice(0, 10)}...); awaiting block confirmation.`,
        txRecord,
      };
    } catch (err: any) {
      return {
        ok: false,
        message: err?.message || 'Bitcoin transaction signing was cancelled by the user.',
      };
    }
  }

  if (ecosystem === 'SOLANA') {
    const solProvider =
      (window as any).phantom?.solana ||
      (window as any).solflare ||
      (window as any).okxwallet?.solana ||
      (window as any).solana;

    if (!solProvider || typeof solProvider.signAndSendTransaction !== 'function') {
      return {
        ok: false,
        message: 'No connected Solana Wallet Standard provider exposing signAndSendTransaction.',
      };
    }

    if (tokenContract) {
      return {
        ok: false,
        message:
          'SPL Token transfer requires Associated Token Account (ATA) instruction derivation. Select native SOL for direct SystemProgram outbound transfer.',
      };
    }

    try {
      onStatusUpdate?.('Awaiting Signature');

      // 1. Fetch recent blockhash from Solana Mainnet RPC
      const bhRes = await callSolanaJsonRpc('getLatestBlockhash', [{ commitment: 'finalized' }]);
      const recentBlockhash = bhRes.ok ? bhRes.result?.value?.blockhash : null;
      if (!recentBlockhash || typeof recentBlockhash !== 'string') {
        return {
          ok: false,
          message: 'Failed to retrieve recent blockhash from Solana Mainnet RPC.',
        };
      }

      // 2. Construct canonical Solana Legacy Message for SystemProgram.transfer (Instruction Index 2)
      const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
      const decodeBase58 = (input: string): Uint8Array => {
        const bytes: number[] = [0];
        for (let i = 0; i < input.length; i++) {
          const charIndex = BASE58_ALPHABET.indexOf(input[i]);
          if (charIndex < 0) throw new Error('Invalid Base58 character');
          let carry = charIndex;
          for (let j = 0; j < bytes.length; j++) {
            carry += bytes[j] * 58;
            bytes[j] = carry & 0xff;
            carry >>= 8;
          }
          while (carry > 0) {
            bytes.push(carry & 0xff);
            carry >>= 8;
          }
        }
        for (let i = 0; i < input.length && input[i] === '1'; i++) {
          bytes.push(0);
        }
        return new Uint8Array(bytes.reverse());
      };

      const fromPubkeyBytes = decodeBase58(fromAddress.trim());
      const toPubkeyBytes = decodeBase58(addrCheck.normalized);
      const blockhashBytes = decodeBase58(recentBlockhash);
      const systemProgramBytes = new Uint8Array(32); // 11111111111111111111111111111111 is 32 zero bytes

      if (fromPubkeyBytes.length !== 32 || toPubkeyBytes.length !== 32 || blockhashBytes.length !== 32) {
        return { ok: false, message: 'Invalid 32-byte Solana public key or blockhash length.' };
      }

      const lamportsBig = BigInt(Math.round(amount * 1e9));
      if (lamportsBig <= 0n) {
        return { ok: false, message: 'Transfer amount in lamports must be positive.' };
      }

      // SystemProgram.transfer instruction data: u32 LE (2) + u64 LE (lamports) = 12 bytes
      const ixData = new Uint8Array(12);
      const view = new DataView(ixData.buffer);
      view.setUint32(0, 2, true);
      view.setBigUint64(4, lamportsBig, true);

      // Message layout:
      // Header: [1 required sig, 0 readonly signed, 1 readonly unsigned (SystemProgram)]
      // Account keys count: 3 -> [fromPubkey, toPubkey, SystemProgram]
      // Recent blockhash: 32 bytes
      // Instructions count: 1 -> [programIdIndex: 2, accountsCount: 2, accounts: [0, 1], dataLen: 12, data: ixData]
      const messageBytes = new Uint8Array(3 + 1 + 96 + 32 + 1 + 1 + 1 + 2 + 1 + 12);
      let offset = 0;
      messageBytes.set([1, 0, 1], offset);
      offset += 3;
      messageBytes[offset++] = 3; // 3 account keys
      messageBytes.set(fromPubkeyBytes, offset);
      offset += 32;
      messageBytes.set(toPubkeyBytes, offset);
      offset += 32;
      messageBytes.set(systemProgramBytes, offset);
      offset += 32;
      messageBytes.set(blockhashBytes, offset);
      offset += 32;
      messageBytes[offset++] = 1; // 1 instruction
      messageBytes[offset++] = 2; // programIdIndex = 2 (SystemProgram)
      messageBytes[offset++] = 2; // 2 account indices
      messageBytes[offset++] = 0; // from account index
      messageBytes[offset++] = 1; // to account index
      messageBytes[offset++] = 12; // instruction data length
      messageBytes.set(ixData, offset);

      // Wire Transaction format: [1 empty 64-byte signature slot] + messageBytes
      const wireTxBytes = new Uint8Array(1 + 64 + messageBytes.length);
      wireTxBytes[0] = 1; // 1 signature
      wireTxBytes.set(messageBytes, 65);

      const sigResult = await solProvider.signAndSendTransaction({
        serialize: () => wireTxBytes,
        serializeMessage: () => messageBytes,
      });

      const signature: string =
        typeof sigResult === 'string' ? sigResult : sigResult?.signature || '';

      if (!signature) {
        return { ok: false, message: 'Solana wallet did not return a transaction signature.' };
      }

      onStatusUpdate?.('Broadcasted (Pending Confirmation)', signature);

      // Poll Solana RPC getSignatureStatuses for confirmation
      let confirmed = false;
      let failed = false;
      let slotNumber: number | undefined;

      for (let attempt = 0; attempt < 15; attempt++) {
        await new Promise((r) => setTimeout(r, 2000));
        const statusRpc = await callSolanaJsonRpc('getSignatureStatuses', [
          [signature],
          { searchTransactionHistory: true },
        ]);
        const info = statusRpc.ok ? statusRpc.result?.value?.[0] : null;
        if (info) {
          slotNumber = Number(info.slot) || undefined;
          if (info.err) {
            failed = true;
            break;
          }
          if (info.confirmationStatus === 'confirmed' || info.confirmationStatus === 'finalized') {
            confirmed = true;
            break;
          }
        }
      }

      const txRecord: RealOnChainTransaction = {
        id: `onchain-sol-${Date.now()}`,
        txHash: signature,
        ecosystem: 'SOLANA',
        chainId: 'mainnet-beta',
        networkName: 'Solana Mainnet',
        fromAddress,
        toAddress: addrCheck.normalized,
        asset: 'SOL',
        amount,
        status: failed
          ? 'Failed'
          : confirmed
          ? 'Confirmed On-Chain'
          : 'Broadcasted (Pending Confirmation)',
        confirmations: confirmed ? 1 : 0,
        blockNumber: slotNumber,
        explorerUrl: `https://solscan.io/tx/${signature}`,
        timestamp: Date.now(),
      };

      return {
        ok: !failed,
        message: confirmed
          ? `Solana transaction confirmed (Slot #${slotNumber || 'latest'})`
          : failed
          ? 'Solana transaction failed on-chain.'
          : `Broadcasted to Solana Mainnet (${signature.slice(0, 10)}...); awaiting confirmation.`,
        txRecord,
      };
    } catch (err: any) {
      return {
        ok: false,
        message: err?.message || 'Solana transaction signing was cancelled or rejected by wallet.',
      };
    }
  }

  return {
    ok: false,
    message: 'Unsupported wallet ecosystem.',
  };
}

/**
 * Re-queries the live blockchain RPC or Bitcoin Mempool API to verify the latest
 * confirmation status and block height of a previously broadcasted transaction.
 */
export async function recheckOnChainTransactionStatus(
  tx: RealOnChainTransaction
): Promise<RealOnChainTransaction> {
  if (!tx.txHash || !tx.txHash.trim()) return tx;

  if (tx.ecosystem === 'EVM') {
    const chainId = typeof tx.chainId === 'number' ? tx.chainId : 1;
    const [receiptRes, blockNumRes] = await Promise.all([
      callEvmJsonRpc(chainId, 'eth_getTransactionReceipt', [tx.txHash]),
      callEvmJsonRpc(chainId, 'eth_blockNumber', []),
    ]);

    if (receiptRes.ok && receiptRes.result && receiptRes.result.blockNumber) {
      const receipt = receiptRes.result;
      const txBlock = parseInt(receipt.blockNumber, 16) || 0;
      const headBlock =
        blockNumRes.ok && typeof blockNumRes.result === 'string'
          ? parseInt(blockNumRes.result, 16) || txBlock
          : txBlock;
      const confirmations = Math.max(1, headBlock - txBlock + 1);
      const succeeded = receipt.status === '0x1' || receipt.status === 1;

      return {
        ...tx,
        status: succeeded ? 'Confirmed On-Chain' : 'Failed',
        confirmations: succeeded ? confirmations : 0,
        blockNumber: txBlock || tx.blockNumber,
        gasUsed: receipt.gasUsed ? String(parseInt(receipt.gasUsed, 16)) : tx.gasUsed,
      };
    }
    return tx;
  }

  if (tx.ecosystem === 'SOLANA') {
    try {
      const statusRpc = await callSolanaJsonRpc('getSignatureStatuses', [
        [tx.txHash],
        { searchTransactionHistory: true },
      ]);
      const info = statusRpc.ok ? statusRpc.result?.value?.[0] : null;
      if (info) {
        const failed = Boolean(info.err);
        const confirmed =
          !failed &&
          (info.confirmationStatus === 'confirmed' || info.confirmationStatus === 'finalized');
        return {
          ...tx,
          status: failed
            ? 'Failed'
            : confirmed
            ? 'Confirmed On-Chain'
            : 'Broadcasted (Pending Confirmation)',
          confirmations:
            info.confirmationStatus === 'finalized'
              ? 32
              : Number(info.confirmations) || (confirmed ? 1 : 0),
          blockNumber: Number(info.slot) || tx.blockNumber,
        };
      }
    } catch {
      return tx;
    }
    return tx;
  }

  if (tx.ecosystem === 'BITCOIN') {
    try {
      const [statusRes, tipRes] = await Promise.all([
        fetch(`${BITCOIN_MEMPOOL_API}/tx/${encodeURIComponent(tx.txHash)}/status`),
        fetch(`${BITCOIN_MEMPOOL_API}/blocks/tip/height`),
      ]);
      if (statusRes.ok) {
        const statusJson = await statusRes.json();
        const confirmed = Boolean(statusJson?.confirmed);
        const blockHeight = Number(statusJson?.block_height || 0);
        const tipHeight = tipRes.ok ? Number(await tipRes.text()) || blockHeight : blockHeight;
        const confirmations =
          confirmed && blockHeight > 0 ? Math.max(1, tipHeight - blockHeight + 1) : 0;

        return {
          ...tx,
          status: confirmed ? 'Confirmed On-Chain' : 'Broadcasted (Pending Confirmation)',
          confirmations,
          blockNumber: blockHeight || tx.blockNumber,
        };
      }
    } catch {
      return tx;
    }
  }

  return tx;
}

/**
 * Fetches genuine historical on-chain transactions for a connected wallet address
 * via the server-side blockchain explorer/RPC proxy (/api/blockchain/tx-history).
 */
export async function fetchOnChainAddressHistory(params: {
  ecosystem: WalletEcosystem;
  address: string;
  chainId?: number | string;
}): Promise<{ ok: boolean; transactions: RealOnChainTransaction[]; source: string }> {
  try {
    const qs = new URLSearchParams({
      ecosystem: params.ecosystem,
      address: params.address,
      chainId: String(params.chainId ?? 1),
    });
    const res = await fetch(`/api/blockchain/tx-history?${qs.toString()}`);
    if (!res.ok) {
      return { ok: false, transactions: [], source: `Explorer HTTP ${res.status}` };
    }
    const data = await res.json();
    return {
      ok: Boolean(data.ok),
      transactions: Array.isArray(data.transactions) ? data.transactions : [],
      source: String(data.source || 'Public Blockchain Explorer'),
    };
  } catch {
    return { ok: false, transactions: [], source: 'Offline / Explorer unreachable' };
  }
}

// ============================================================================
// 12. HONEST TEE / SECURE AUTO SIGN CAPABILITY DISCLOSURE
// ============================================================================

export function getGenuineTeeCapabilityStatus(): TeeCapabilityStatus {
  return {
    supported: false,
    enabled: false,
    statusLabel: 'Unavailable in Standard Web Browser',
    detail:
      'Secure Auto Sign requires a verified hardware Trusted Execution Environment (TEE) enclave session and custodial MPC policy attestation. Hardware TEE verification is never simulated in the browser.',
  };
}

// ============================================================================
// 13. CUSTODY & TRANSFER CLASSIFICATION GUARD
// ============================================================================

export function describeTransferCustodyBoundary(classification: TransferCustodyClassification): {
  title: string;
  badge: string;
  explanation: string;
  requiresSelfCustodySignature: boolean;
  requiresExchangeCustodyBackend: boolean;
} {
  switch (classification) {
    case 'EXCHANGE_INTERNAL_LEDGER':
      return {
        title: 'Exchange Internal Sub-Account Transfer',
        badge: 'INTERNAL OFF-CHAIN LEDGER',
        explanation:
          'Moves balances instantaneously between your internal exchange accounts (Spot, Funding, Futures, Margin, Earn) with zero blockchain gas fees.',
        requiresSelfCustodySignature: false,
        requiresExchangeCustodyBackend: false,
      };
    case 'DEMO_EXCHANGE_TO_WALLET_LEDGER':
      return {
        title: 'Demo Exchange ↔ Demo Wallet Transfer',
        badge: 'DEMO LEDGER ONLY',
        explanation:
          'Updates only the isolated Demo Preview Ledger for UI testing. Does not broadcast to any blockchain network or generate a transaction hash.',
        requiresSelfCustodySignature: false,
        requiresExchangeCustodyBackend: false,
      };
    case 'CUSTODIAL_EXCHANGE_WITHDRAWAL':
      return {
        title: 'Centralized Exchange Custodial Withdrawal',
        badge: 'REQUIRES EXCHANGE WITHDRAWAL API',
        explanation:
          'Withdrawing assets from a centralized exchange to an external or Web3 address is initiated by the exchange custodian. A self-custody wallet (EIP-1193, Solana, or Bitcoin) cannot authorize a withdrawal from a centralized exchange; an authenticated Exchange Withdrawal API backend is required.',
        requiresSelfCustodySignature: false,
        requiresExchangeCustodyBackend: true,
      };
    case 'SELF_CUSTODY_BLOCKCHAIN_TRANSFER':
      return {
        title: 'Self-Custody On-Chain Blockchain Transfer',
        badge: 'WALLET SIGNATURE + NETWORK CONFIRMATION',
        explanation:
          'Sending assets from your connected non-custodial wallet requires explicit cryptographic authorization in your EVM, Solana, or Bitcoin wallet and actual blockchain network confirmation.',
        requiresSelfCustodySignature: true,
        requiresExchangeCustodyBackend: false,
      };
  }
}
