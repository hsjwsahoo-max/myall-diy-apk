export type AppMode = 'exchange' | 'wallet';

export type ExchangeNavTab = 'home' | 'markets' | 'trade' | 'futures' | 'assets';
export type WalletNavTab = 'home' | 'markets' | 'trade' | 'discover' | 'assets';

export type KlineInterval = '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w';

export type ConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'rest_fallback' | 'stale' | 'error';

export type WalletAccountType =
  | 'spot'
  | 'funding'
  | 'usdm_futures'
  | 'coinm_futures'
  | 'earn'
  | 'cross_margin'
  | 'isolated_margin'
  | 'options';

export interface WalletAccountMeta {
  id: WalletAccountType;
  label: string;
  shortLabel: string;
  description: string;
}

export interface SupportedNetworkInfo {
  id: string;
  name: string;
  standard: string;
  confirmations: string;
  estimatedArrival: string;
  minDeposit: string;
  withdrawFee: string;
  status: 'Active' | 'Congested';
}

export type MarketDataProvenance =
  | 'live_ws'
  | 'live_rest'
  | 'delayed'
  | 'reference'
  | 'unavailable';

export interface MarketTicker {
  symbol: string; // e.g., USDTUSD, BTCUSDT
  baseAsset: string; // e.g., USDT, BTC
  quoteAsset: string; // e.g., USD, USDT
  name: string; // e.g., TetherUS, Bitcoin
  lastPrice: number;
  priceChange: number;
  priceChangePercent: number;
  high24h: number;
  low24h: number;
  volume24h: number; // Base volume
  quoteVolume24h: number; // Quote volume
  marketCap: number;
  category: 'Stablecoin' | 'Layer 1' | 'DeFi' | 'Meme' | 'AI' | 'Solana' | 'Payments' | 'Exchange';
  leverageTag?: string; // e.g., "10x", "5x"
  lastUpdated: number;
  flash?: 'up' | 'down' | null;
  dataProvenance?: MarketDataProvenance;
  feedSource?: string;
  isNewListing?: boolean;
}

export interface StockTicker {
  symbol: string;
  name: string;
  lastPrice: number;
  changePercent: number;
  volumeUsd: number;
  sector: 'US Stocks' | 'ETFs';
  isPopular?: boolean;
  isNew?: boolean;
  dataProvenance: MarketDataProvenance;
  feedSource: string;
  referenceAsOf?: string;
}

export interface OrderBookEntry {
  price: number;
  quantity: number;
  total: number;
}

export interface OrderBookData {
  symbol: string;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  lastUpdated: number;
}

export interface TradeExecution {
  id: string;
  price: number;
  quantity: number;
  time: number;
  isBuyerMaker: boolean;
}

export interface CandleData {
  time: number; // unix ms open time
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface AssetBalance {
  asset: string;
  name: string;
  available: number;
  locked: number;
}

export type WalletsState = Record<WalletAccountType, Record<string, AssetBalance>>;

export type LedgerTxType =
  | 'transfer'
  | 'deposit'
  | 'withdraw'
  | 'convert'
  | 'spot_buy'
  | 'spot_sell'
  | 'futures_open'
  | 'futures_close'
  | 'earn_subscribe'
  | 'earn_redeem'
  | 'p2p_buy'
  | 'p2p_sell';

export interface LedgerTransaction {
  id: string;
  refId: string;
  type: LedgerTxType;
  asset: string;
  amount: number;
  secondaryAsset?: string;
  secondaryAmount?: number;
  price?: number;
  fee: number;
  fromAccount?: WalletAccountType;
  toAccount?: WalletAccountType;
  network?: string;
  address?: string;
  status: 'Completed' | 'Pending' | 'Cancelled';
  timestamp: number;
  note: string;
  isDemo: boolean;
  isSampleData?: boolean;
  importedVerified?: boolean;
}

export interface SpotOrder {
  id: string;
  refId: string;
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  side: 'BUY' | 'SELL';
  type: 'LIMIT' | 'MARKET' | 'STOP_LIMIT';
  price: number;
  stopPrice?: number;
  quantity: number;
  filledQuantity: number;
  totalQuote: number;
  feeQuote?: number;
  status: 'OPEN' | 'FILLED' | 'CANCELLED';
  timestamp: number;
  isDemo?: boolean;
}

export interface FuturesPosition {
  id: string;
  symbol: string;
  contractType: 'USDM' | 'COINM';
  side: 'LONG' | 'SHORT';
  marginMode: 'Cross' | 'Isolated';
  leverage: number;
  sizeAsset: number;
  notionalUsdt: number;
  marginUsdt: number;
  maintenanceMarginUsdt?: number;
  openFeeUsdt?: number;
  orderType?: 'MARKET' | 'LIMIT';
  entryPrice: number;
  liquidationPrice: number;
  takeProfit?: number;
  stopLoss?: number;
  timestamp: number;
  isDemo?: boolean;
}

export interface EarnProduct {
  id: string;
  asset: string;
  name: string;
  type: 'Flexible' | 'Locked';
  durationDays?: number;
  apr: number;
  minAmount: number;
  bonusTag?: string;
}

export interface EarnSubscription {
  id: string;
  productId: string;
  asset: string;
  type: 'Flexible' | 'Locked';
  durationDays?: number;
  amount: number;
  apr: number;
  accruedReward: number;
  subscribedAt: number;
}

export interface P2PMerchantListing {
  id: string;
  merchantName: string;
  verified: boolean;
  completedOrders: number;
  completionRate: number;
  side: 'BUY' | 'SELL';
  asset: 'USDT' | 'USDC' | 'BTC' | 'ETH' | 'BNB';
  fiat: 'USD' | 'INR' | 'AED' | 'EUR';
  price: number;
  availableAsset: number;
  minFiat: number;
  maxFiat: number;
  paymentMethods: string[];
  timeLimitMins: number;
}

export interface P2POrder {
  id: string;
  refId: string;
  merchantName: string;
  side: 'BUY' | 'SELL';
  asset: string;
  fiat: string;
  price: number;
  fiatAmount: number;
  cryptoAmount: number;
  paymentMethod: string;
  status: 'Pending Payment' | 'Released' | 'Cancelled';
  createdAt: number;
}

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'ABOVE' | 'BELOW';
  active: boolean;
  createdAt: number;
}

export type PortfolioDenomination = 'USDT' | 'USD' | 'INR' | 'EUR' | 'AED' | 'GBP';

export type SupportedFiat = 'USD' | 'INR' | 'AED' | 'EUR' | 'GBP';

export type AccountVerificationMode =
  | 'verified_statement'
  | 'unverified_empty'
  | 'readonly_exchange_api';

export interface ServerAuditLogEntry {
  id: string;
  action: string;
  severity: string;
  details: Record<string, unknown>;
  integrityHash: string;
  createdAt: number;
}

export interface BackendCapabilities {
  sqlitePersistence: boolean;
  dbPath: string;
  readonlyExchangeApiConfigured: boolean;
  liveOrderExecutionConfigured: boolean;
  custodialWithdrawalConfigured: boolean;
  walletConnectProjectIdConfigured: boolean;
}

export interface UserSettings {
  uid: string;
  username: string;
  vipTier: string;
  verified: boolean;
  fiat: SupportedFiat;
  primaryDenomination?: PortfolioDenomination;
  theme: 'dark' | 'light';
  hideBalances: boolean;
  bnbFeeDiscount: boolean;
  notificationsEnabled: boolean;
  twoFactorEnabled: boolean;
  passkeyEnabled: boolean;
  antiPhishingCode: string;
  initialPreviewBalanceUsdt: number;
  portfolioInitializedAt?: number;
  accountMode?: AccountVerificationMode;
  statementId?: string | null;
}

export type WalletEcosystem = 'EVM' | 'SOLANA' | 'BITCOIN';

export type WalletConnectionMethod =
  | 'unconnected'
  | 'demo_preview'
  | 'eip1193_injected'
  | 'solana_injected'
  | 'bitcoin_injected'
  | 'walletconnect_mobile';

export type TransferCustodyClassification =
  | 'EXCHANGE_INTERNAL_LEDGER'
  | 'DEMO_EXCHANGE_TO_WALLET_LEDGER'
  | 'CUSTODIAL_EXCHANGE_WITHDRAWAL'
  | 'SELF_CUSTODY_BLOCKCHAIN_TRANSFER';

export interface VerifiedTokenConfig {
  symbol: string;
  name: string;
  ecosystem: WalletEcosystem;
  chainId: number | string;
  networkName: string;
  contractAddress: string;
  decimals: number;
  explorerUrl: string;
}

export interface VerifiedTokenBalance {
  symbol: string;
  name: string;
  ecosystem: WalletEcosystem;
  chainId: number | string;
  networkName: string;
  contractAddress: string;
  decimals: number;
  balance: number | null;
  status: 'loading' | 'synced' | 'rpc_error';
  explorerUrl: string;
  lastSyncedAt: number | null;
}

export interface ConnectedChainAccount {
  ecosystem: WalletEcosystem;
  address: string;
  providerName: string;
  connectionMethod: WalletConnectionMethod;
  chainId?: number | string;
  networkName: string;
  nativeSymbol: string;
  nativeBalance: number | null;
  unconfirmedBalance?: number;
  balanceStatus?: 'loading' | 'synced' | 'rpc_error';
  rpcError?: string | null;
  gasPriceGwei?: number | null;
  tokenBalances?: VerifiedTokenBalance[];
  lastSyncedAt: number | null;
}

export interface RealOnChainTransaction {
  id: string;
  txHash: string;
  ecosystem: WalletEcosystem;
  chainId?: number | string;
  networkName: string;
  fromAddress: string;
  toAddress: string;
  asset: string;
  amount: number;
  isTokenTransfer?: boolean;
  tokenContract?: string;
  status:
    | 'Awaiting Signature'
    | 'Broadcasted (Pending Confirmation)'
    | 'Confirmed On-Chain'
    | 'Failed'
    | 'Rejected';
  confirmations: number;
  blockNumber?: number;
  gasUsed?: string;
  errorMessage?: string;
  explorerUrl?: string;
  timestamp: number;
}

export interface TeeCapabilityStatus {
  supported: boolean;
  enabled: boolean;
  statusLabel: string;
  detail: string;
}

export interface DerivedWalletAccount {
  index: number;
  name: string;
  address: string;
  path: string;
}

export interface EncryptedKeystoreVault {
  version: 1;
  id: string;
  createdAt: number;
  walletName: string;
  backupVerified: boolean;
  activeAccountIndex: number;
  accounts: DerivedWalletAccount[];
  crypto: {
    cipher: 'aes-256-gcm';
    ciphertext: string;
    iv: string;
    salt: string;
    iterations: number;
  };
}

export interface SwapQuoteRequest {
  fromToken: string;
  toToken: string;
  fromAmount: number;
  slippageTolerancePercent: number;
  network: string;
}

export interface SwapQuoteResponse {
  fromToken: string;
  toToken: string;
  fromAmount: number;
  toAmount: number;
  exchangeRate: number;
  priceImpactPercent: number;
  estimatedNetworkFeeUsd: number;
  estimatedNetworkFeeInr: number;
  route: string[];
  providerName: string;
  isConfigured: boolean;
  requiresApiKeyMessage?: string;
  minReceived: number;
}

export interface DAppConnectionSession {
  id: string;
  name: string;
  url: string;
  icon: string;
  connectedAt: number;
  accounts: string[];
  chainId: number | string;
  permissions: string[];
}

export interface Web3WalletState {
  isCreated: boolean;
  address: string;
  walletName: string;
  disclaimerAccepted: boolean;
  backupVerified: boolean;
  isLocked?: boolean;
  hasStoredVault?: boolean;
  activeAccountIndex?: number;
  accounts?: DerivedWalletAccount[];
  mode?: 'unconnected' | 'demo_preview' | 'connected_self_custody';
  activeEcosystem?: WalletEcosystem;
  evmAccount?: ConnectedChainAccount | null;
  solanaAccount?: ConnectedChainAccount | null;
  bitcoinAccount?: ConnectedChainAccount | null;
  demoWeb3Balances?: Record<string, number>;
  realOnChainTxs?: RealOnChainTransaction[];
  teeStatus?: TeeCapabilityStatus;
}



