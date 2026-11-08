import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search,
  Copy,
  QrCode,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  History,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Flame,
  Layers,
  Globe,
  ExternalLink,
  RefreshCw,
  Sliders,
  KeyRound,
  Eye,
  EyeOff,
  X,
  PieChart,
  Star,
  BarChart2,
  LineChart,
  Gift,
  MoreHorizontal,
  ScanLine,
} from 'lucide-react';
import { useExchange } from '../context/ExchangeContext';
import { CoinIcon } from '../components/CoinIcon';
import { CandlestickChart } from '../components/CandlestickChart';
import { fetchSwapQuote } from '../services/swapService';
import {
  generateNewMnemonicDraft,
  generateBackupChallenge,
  verifyBackupChallenge,
  finalizeNewWallet,
  importExistingWallet,
  getStoredVault,
  clearStoredVault,
  generateQrCodeDataUrl,
  getHardwareCryptoDisclosure,
  decryptMnemonicVault,
  type NewWalletDraft,
} from '../services/selfCustodyWalletService';
import {
  EncryptedKeystoreVault,
  RealOnChainTransaction,
  SwapQuoteResponse,
  WalletEcosystem,
} from '../types/exchange';
import {
  formatInrValue,
  formatQuantity,
  formatTimestamp,
  formatUsdValue,
  KeylessCheckBadge,
  KeylessWalletAvatar,
  PREVIEW_PORTFOLIO_CONFIG,
  REFERENCE_LOW_VALUE_ASSETS,
  REFERENCE_PROMO_SLIDES,
  REFERENCE_WALLET_TOKENS,
  useLiveWalletPortfolioValuation,
  WalletFloatingDiamond,
  WalletValuationSourceMode,
} from './wallet/WalletDataAndFloatingDiamond';
import { WalletSubScreenId, WalletSubScreens } from './wallet/WalletSubScreens';

function shortenAddress(addr?: string): string {
  if (!addr) return '';
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

const DISCOVER_DAPPS = [
  {
    name: 'Venus Protocol',
    category: 'Lending',
    chain: 'BNB Smart Chain',
    tvl: '$1.84B',
    apy: '8.4% APY',
    desc: 'Decentralized algorithmic money market and synthetic stablecoin protocol.',
    url: 'https://venus.io',
    badge: 'V',
    color: '#F0B90B',
  },
  {
    name: 'PancakeSwap V4',
    category: 'DEX',
    chain: 'Multi-Chain',
    tvl: '$2.35B',
    apy: '24.6% APR',
    desc: 'Concentrated liquidity AMM, perpetuals, and cross-chain router.',
    url: 'https://pancakeswap.finance',
    badge: 'P',
    color: '#1FC7D4',
  },
  {
    name: 'Four.Meme',
    category: 'Launchpad',
    chain: 'BNB Smart Chain',
    tvl: '$142M',
    apy: 'Fair Launch',
    desc: 'Premier meme token fair-launch platform on BNB Chain.',
    url: 'https://four.meme',
    badge: '4',
    color: '#0ECB81',
  },
  {
    name: 'Lista DAO',
    category: 'Liquid Staking',
    chain: 'BNB Smart Chain',
    tvl: '$890M',
    apy: '11.2% APR',
    desc: 'Open-source liquidity protocol for earning yields on collateralized crypto.',
    url: 'https://lista.org',
    badge: 'L',
    color: '#F3BA2F',
  },
];

const ROTATING_SEARCH_PLACEHOLDERS = [
  'Trending Search: AGC',
  'Trending: FLOAT',
  'Hot Perps: BTCUSDT',
  'Hot Alpha: VITA',
];

export const Web3WalletViews: React.FC = () => {
  const {
    walletTab,
    setWalletTab,
    setAppMode,
    setExchangeTab,
    openDepositModal,
    web3Wallet,
    updateWeb3Wallet,
    connectEcosystemWallet,
    disconnectEcosystemWallet,
    switchConnectedEvmChain,
    refreshConnectedWalletBalances,
    executeSelfCustodyTransfer,
    executeConvert,
    showToast,
    getAssetPriceUsd,
    setPayModalOpen,
    activeInterval,
    setActiveInterval,
    tickers,
    connectionStatus,
    lastUpdated,
    fxProvenance,
    wallets,
  } = useExchange();

  // =========================================================================
  // 1. SELF-CUSTODY ENCRYPTED VAULT & PORTFOLIO PREVIEW MODE STATE
  // =========================================================================
  const [localVault, setLocalVault] = useState<EncryptedKeystoreVault | null>(() =>
    getStoredVault()
  );
  const [isRefreshingBalances, setIsRefreshingBalances] = useState(false);

  // Dedicated Preview Portfolio dataset (11,352.81 USDT @ ₹93.89 purchase price)
  // kept strictly separate from verified on-chain balances and exchange balances.
  const [activeValuationMode, setActiveValuationMode] =
    useState<WalletValuationSourceMode>('preview_portfolio');
  const isPreviewMode = activeValuationMode === 'preview_portfolio';

  // Vault Creation / Import Wizard State
  const [vaultWizardMode, setVaultWizardMode] = useState<
    'none' | 'create_step1' | 'create_verify' | 'create_password' | 'import'
  >('none');
  const [walletDraft, setWalletDraft] = useState<NewWalletDraft | null>(null);
  const [challengeIndices, setChallengeIndices] = useState<[number, number, number]>([2, 6, 10]);
  const [challengeAnswers, setChallengeAnswers] = useState<[string, string, string]>(['', '', '']);
  const [vaultPassword, setVaultPassword] = useState('');
  const [vaultPasswordConfirm, setVaultPasswordConfirm] = useState('');
  const [vaultLabelInput, setVaultLabelInput] = useState('My Wallet');
  const [importSecretInput, setImportSecretInput] = useState('');
  const [showMnemonicPlain, setShowMnemonicPlain] = useState(false);
  const [isCreatingVault, setIsCreatingVault] = useState(false);

  // Unlock & Backup Reveal Modal
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockPasswordInput, setUnlockPasswordInput] = useState('');
  const [revealedMnemonic, setRevealedMnemonic] = useState<string | null>(null);

  // Receive QR State
  const [receiveChainTab, setReceiveChainTab] = useState<'EVM' | 'SOLANA' | 'BITCOIN'>('EVM');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Connect Provider Modal
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // On-Chain Send Transaction State
  const [sendEcosystem, setSendEcosystem] = useState<WalletEcosystem>('EVM');
  const [sendTokenSymbol, setSendTokenSymbol] = useState('USDT');
  const [sendRecipientInput, setSendRecipientInput] = useState('');
  const [sendAmountInput, setSendAmountInput] = useState('');
  const [isBroadcastingTx, setIsBroadcastingTx] = useState(false);
  const [lastBroadcastTx, setLastBroadcastTx] = useState<RealOnChainTransaction | null>(null);

  // Selected Tx Detail Modal
  const [selectedTxRecord, setSelectedTxRecord] = useState<RealOnChainTransaction | null>(null);

  const cryptoDisclosure = useMemo(() => getHardwareCryptoDisclosure(), []);

  // =========================================================================
  // 2. UI NAVIGATION & SUB-SCREEN STATES (Matches Reference Video)
  // =========================================================================
  const [assetsSubScreen, setAssetsSubScreen] = useState<WalletSubScreenId>('main');
  const [homeTimeframe, setHomeTimeframe] = useState<'1D' | '7D' | '30D'>('1D');
  const [showPortfolioGraph, setShowPortfolioGraph] = useState(true);
  const [chartScrubIdx, setChartScrubIdx] = useState<number | null>(null);
  const [promoIndex, setPromoIndex] = useState(0);
  const [searchPlaceholderIdx, setSearchPlaceholderIdx] = useState(0);
  const [homeTokenTab, setHomeTokenTab] = useState<
    'Watchlist' | 'Holdings' | 'Trending' | 'Stocks' | 'Perps'
  >('Trending');
  const [homeChainFilter, setHomeChainFilter] = useState<
    'All' | 'BSC' | 'Robinhood' | 'Solana' | 'Ethereum'
  >('All');
  const [homeSearchQuery, setHomeSearchQuery] = useState('');
  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>(['FLOAT', 'STONK', 'SOL']);

  const [marketsTopTab, setMarketsTopTab] = useState<'Overview' | 'Stocks' | 'Memes' | 'Tracker'>(
    'Overview'
  );
  const [marketsTableTab, setMarketsTableTab] = useState<
    'Holdings' | 'Trending' | 'Alpha' | 'Stocks' | 'Perps'
  >('Trending');
  const [marketsChainPill, setMarketsChainPill] = useState<
    'All' | 'BSC' | 'Robinhood' | 'Solana' | 'Ethereum' | 'Base'
  >('All');
  const [marketsSearch, setMarketsSearch] = useState('');

  const [tradeSubMode, setTradeSubMode] = useState<'Swap' | 'Bridge' | 'Pro' | 'Perps'>('Swap');
  const [payAsset, setPayAsset] = useState('USDT');
  const [receiveAsset, setReceiveAsset] = useState('BNB');
  const [payAmount, setPayAmount] = useState('');
  const [useExchangeBalance, setUseExchangeBalance] = useState(false);
  const [slippage, setSlippage] = useState('0.5');
  const [showSlippageSettings, setShowSlippageSettings] = useState(false);
  const [showSwapChart, setShowSwapChart] = useState(false);
  const [liveSwapQuote, setLiveSwapQuote] = useState<SwapQuoteResponse | null>(null);
  const [isFetchingQuote, setIsFetchingQuote] = useState(false);
  const [swapBottomTab, setSwapBottomTab] = useState<'Open Orders' | 'Holdings' | 'Strategy'>(
    'Open Orders'
  );
  const [onlyCurrentToken, setOnlyCurrentToken] = useState(false);

  const [discoverSubTab, setDiscoverSubTab] = useState<
    'Featured' | 'Earn' | 'Booster' | 'Airdrops' | 'DApps'
  >('Featured');
  const [discoverSearch, setDiscoverSearch] = useState('');

  const [assetsCategoryTab, setAssetsCategoryTab] = useState<
    'Tokens' | 'Stocks' | 'DeFi' | 'NFTs' | 'Perps'
  >('Tokens');
  const [showLowValueAssets, setShowLowValueAssets] = useState(false);
  const [hideWeb3Balance, setHideWeb3Balance] = useState(false);
  const [assetsTokenSearch, setAssetsTokenSearch] = useState('');
  const [showAssetsSearchInput, setShowAssetsSearchInput] = useState(false);

  // Listen for Header Icons in App.tsx (ShieldCheck -> 'approvals', Settings2 -> 'settings')
  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<WalletSubScreenId>;
      if (custom.detail) {
        setAssetsSubScreen(custom.detail);
      }
    };
    window.addEventListener('nexus:wallet-subscreen', handler);
    return () => window.removeEventListener('nexus:wallet-subscreen', handler);
  }, []);

  // Rotate promo banner and search placeholder
  useEffect(() => {
    const id = setInterval(() => {
      setPromoIndex((prev) => (prev + 1) % REFERENCE_PROMO_SLIDES.length);
      setSearchPlaceholderIdx((prev) => (prev + 1) % ROTATING_SEARCH_PLACEHOLDERS.length);
    }, 4500);
    return () => clearInterval(id);
  }, []);

  // Reset sub-screen to 'main' when bottom navigation tab switches
  useEffect(() => {
    setAssetsSubScreen('main');
  }, [walletTab]);

  // =========================================================================
  // 3. WALLET CONNECTION & VERIFIED / PREVIEW BALANCE LOGIC
  // =========================================================================
  const anyExtensionConnected = Boolean(
    web3Wallet.evmAccount || web3Wallet.solanaAccount || web3Wallet.bitcoinAccount
  );
  const isWalletActive = Boolean(localVault) || anyExtensionConnected;

  const activeVaultAccount = useMemo(() => {
    if (!localVault || !localVault.accounts?.length) return null;
    return localVault.accounts[localVault.activeAccountIndex] || localVault.accounts[0];
  }, [localVault]);

  const activeWalletLabel = useMemo(() => {
    if (localVault) return localVault.walletName || 'My Wallet';
    if (anyExtensionConnected) return web3Wallet.walletName || 'My Wallet';
    return 'My Wallet';
  }, [localVault, anyExtensionConnected, web3Wallet.walletName]);

  const activePrimaryAddress = useMemo(() => {
    if (activeVaultAccount) return activeVaultAccount.address;
    if (web3Wallet.evmAccount) return web3Wallet.evmAccount.address;
    if (web3Wallet.solanaAccount) return web3Wallet.solanaAccount.address;
    if (web3Wallet.bitcoinAccount) return web3Wallet.bitcoinAccount.address;
    return '';
  }, [activeVaultAccount, web3Wallet]);

  const verifiedOnChainAssets = useMemo(() => {
    if (!isWalletActive) return [];
    const list: {
      key: string;
      symbol: string;
      name: string;
      chainName: string;
      balance: number;
      usdPrice: number;
      usdValue: number;
      ecosystem: WalletEcosystem;
    }[] = [];

    if (web3Wallet.evmAccount) {
      const evm = web3Wallet.evmAccount;
      const nativeBal = evm.nativeBalance ?? 0;
      const nativePrice = getAssetPriceUsd(evm.nativeSymbol);
      list.push({
        key: `evm-native-${evm.chainId}`,
        symbol: evm.nativeSymbol,
        name: evm.networkName,
        chainName: evm.networkName,
        balance: nativeBal,
        usdPrice: nativePrice,
        usdValue: nativeBal * nativePrice,
        ecosystem: 'EVM',
      });
      (evm.tokenBalances || []).forEach((tok) => {
        const tokBal = tok.balance ?? 0;
        const p = getAssetPriceUsd(tok.symbol);
        list.push({
          key: `evm-tok-${tok.contractAddress}`,
          symbol: tok.symbol,
          name: tok.name,
          chainName: tok.networkName,
          balance: tokBal,
          usdPrice: p,
          usdValue: tokBal * p,
          ecosystem: 'EVM',
        });
      });
    }

    if (web3Wallet.solanaAccount) {
      const sol = web3Wallet.solanaAccount;
      const solBal = sol.nativeBalance ?? 0;
      const solPrice = getAssetPriceUsd('SOL');
      list.push({
        key: 'sol-native',
        symbol: 'SOL',
        name: 'Solana',
        chainName: 'Solana Mainnet',
        balance: solBal,
        usdPrice: solPrice,
        usdValue: solBal * solPrice,
        ecosystem: 'SOLANA',
      });
    }

    if (web3Wallet.bitcoinAccount) {
      const btc = web3Wallet.bitcoinAccount;
      const btcBal = btc.nativeBalance ?? 0;
      const btcPrice = getAssetPriceUsd('BTC');
      list.push({
        key: 'btc-native',
        symbol: 'BTC',
        name: 'Bitcoin',
        chainName: 'Bitcoin Mainnet',
        balance: btcBal,
        usdPrice: btcPrice,
        usdValue: btcBal * btcPrice,
        ecosystem: 'BITCOIN',
      });
    }

    if (list.length === 0 && localVault) {
      const defaultChains = [
        { symbol: 'USDT', name: 'Tether USD', chainName: 'BNB Smart Chain', ecosystem: 'EVM' as const },
        { symbol: 'BNB', name: 'BNB', chainName: 'BNB Smart Chain', ecosystem: 'EVM' as const },
        { symbol: 'ETH', name: 'Ethereum', chainName: 'Ethereum Mainnet', ecosystem: 'EVM' as const },
        { symbol: 'SOL', name: 'Solana', chainName: 'Solana Mainnet', ecosystem: 'SOLANA' as const },
        { symbol: 'USDC', name: 'USD Coin', chainName: 'BNB Smart Chain', ecosystem: 'EVM' as const },
      ];
      defaultChains.forEach((c) => {
        const p = getAssetPriceUsd(c.symbol);
        list.push({
          key: `vault-${c.chainName}-${c.symbol}`,
          symbol: c.symbol,
          name: c.name,
          chainName: c.chainName,
          balance: 0,
          usdPrice: p,
          usdValue: 0,
          ecosystem: c.ecosystem,
        });
      });
    }

    return list;
  }, [isWalletActive, web3Wallet, localVault, getAssetPriceUsd]);

  const verifiedWeb3UsdBalance = useMemo(() => {
    if (!isWalletActive) return 0;
    return verifiedOnChainAssets.reduce((sum, item) => sum + item.usdValue, 0);
  }, [isWalletActive, verifiedOnChainAssets]);

  const verifiedUsdtQuantity = useMemo(() => {
    if (!isWalletActive) return 0;
    return verifiedOnChainAssets.find((a) => a.symbol === 'USDT')?.balance ?? 0;
  }, [isWalletActive, verifiedOnChainAssets]);

  const exchangeSpotUsdtQuantity = useMemo(() => {
    const spotUsdt = wallets?.spot?.USDT?.available ?? 0;
    const fundingUsdt = wallets?.funding?.USDT?.available ?? 0;
    return spotUsdt + fundingUsdt;
  }, [wallets]);

  const usdtTicker = useMemo(
    () =>
      tickers['USDTUSD'] || {
        symbol: 'USDTUSD',
        baseAsset: 'USDT',
        quoteAsset: 'USD',
        lastPrice: PREVIEW_PORTFOLIO_CONFIG.startingUsdtUsdPrice,
        priceChange: -0.0002,
        priceChangePercent: -0.02,
        high24h: 1.0005,
        low24h: 0.9981,
        volume24h: 45_200_000,
        quoteVolume24h: 45_150_000,
        lastUpdated: Date.now(),
        dataProvenance: 'delayed' as const,
        feedSource: 'Initial Preview Quote ($0.99847)',
      },
    [tickers]
  );

  // Live Market Valuation & Historical Chart Hook
  const valuation = useLiveWalletPortfolioValuation({
    usdtTicker,
    connectionStatus,
    lastUpdated,
    fxProvenance,
    activeMode: activeValuationMode,
    timeframe: homeTimeframe,
    verifiedUsdtQuantity,
    verifiedTotalUsdValue: verifiedWeb3UsdBalance,
    exchangeSpotUsdtQuantity,
  });

  const displayedInrBalance = valuation.displayedInrValue;
  const displayedUsdtQty = valuation.displayedUsdtQuantity;

  const activeReceiveAddress = useMemo(() => {
    if (receiveChainTab === 'SOLANA' && web3Wallet.solanaAccount) {
      return web3Wallet.solanaAccount.address;
    }
    if (receiveChainTab === 'BITCOIN' && web3Wallet.bitcoinAccount) {
      return web3Wallet.bitcoinAccount.address;
    }
    return activePrimaryAddress || '0x71C95911E9a5D330f4D621842EC243EE134319A3';
  }, [receiveChainTab, web3Wallet, activePrimaryAddress]);

  useEffect(() => {
    if (!activeReceiveAddress) {
      setQrDataUrl('');
      return;
    }
    generateQrCodeDataUrl(activeReceiveAddress).then((url) => setQrDataUrl(url));
  }, [activeReceiveAddress]);

  const handleRefreshOnChain = useCallback(async () => {
    setIsRefreshingBalances(true);
    try {
      await refreshConnectedWalletBalances();
      showToast('On-chain balances synchronized');
    } finally {
      setIsRefreshingBalances(false);
    }
  }, [refreshConnectedWalletBalances, showToast]);

  // =========================================================================
  // 4. VAULT CREATE / IMPORT / CONNECT / SEND HANDLERS
  // =========================================================================
  const handleStartCreateVault = () => {
    const draft = generateNewMnemonicDraft();
    const challenge = generateBackupChallenge(draft.words);
    setWalletDraft(draft);
    setChallengeIndices(challenge.indices);
    setChallengeAnswers(['', '', '']);
    setVaultPassword('');
    setVaultPasswordConfirm('');
    setVaultWizardMode('create_step1');
  };

  const handleVerifyBackupStep = () => {
    if (!walletDraft) return;
    const valid = verifyBackupChallenge(walletDraft.words, challengeIndices, challengeAnswers);
    if (!valid) {
      showToast('Verification words do not match your recovery phrase.');
      return;
    }
    setVaultWizardMode('create_password');
  };

  const handleFinalizeCreateVault = async () => {
    if (!walletDraft) return;
    if (vaultPassword.length < 8) {
      showToast('Vault password must be at least 8 characters');
      return;
    }
    if (vaultPassword !== vaultPasswordConfirm) {
      showToast('Passwords do not match');
      return;
    }
    setIsCreatingVault(true);
    try {
      const vault = await finalizeNewWallet(
        walletDraft.mnemonicPhrase,
        vaultPassword,
        vaultLabelInput.trim() || 'My Wallet',
        true
      );
      setLocalVault(vault);
      updateWeb3Wallet({
        isCreated: true,
        address: vault.accounts[0]?.address || '',
        walletName: vault.walletName,
        backupVerified: true,
      });
      setWalletDraft(null);
      setVaultWizardMode('none');
      showToast('Self-custody wallet created & encrypted (AES-256-GCM)');
    } catch (err: any) {
      showToast(err?.message || 'Failed to encrypt wallet vault');
    } finally {
      setIsCreatingVault(false);
    }
  };

  const handleFinalizeImportVault = async () => {
    if (!importSecretInput.trim()) {
      showToast('Enter a valid 12/24-word recovery phrase or private key');
      return;
    }
    if (vaultPassword.length < 8) {
      showToast('Vault password must be at least 8 characters');
      return;
    }
    setIsCreatingVault(true);
    try {
      const vault = await importExistingWallet(
        importSecretInput.trim(),
        vaultPassword,
        vaultLabelInput.trim() || 'My Wallet'
      );
      setLocalVault(vault);
      updateWeb3Wallet({
        isCreated: true,
        address: vault.accounts[0]?.address || '',
        walletName: vault.walletName,
        backupVerified: true,
      });
      setImportSecretInput('');
      setVaultWizardMode('none');
      showToast('Self-custody wallet imported & encrypted');
    } catch (err: any) {
      showToast(err?.message || 'Invalid seed phrase or private key');
    } finally {
      setIsCreatingVault(false);
    }
  };

  const handleUnlockMnemonic = async () => {
    if (!localVault) return;
    try {
      const { mnemonicPhrase } = await decryptMnemonicVault(localVault, unlockPasswordInput);
      setRevealedMnemonic(mnemonicPhrase);
      showToast('Recovery phrase decrypted in memory');
    } catch (err: any) {
      showToast(err?.message || 'Incorrect vault password');
    }
  };

  const handleConnectProvider = async (ecosystem: WalletEcosystem) => {
    setIsConnecting(true);
    try {
      const res = await connectEcosystemWallet(ecosystem);
      showToast(res.message);
      if (res.ok) {
        setShowConnectModal(false);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleBroadcastSend = async () => {
    const amt = parseFloat(sendAmountInput);
    if (isNaN(amt) || amt <= 0) {
      showToast('Enter a valid transfer amount');
      return;
    }
    if (!sendRecipientInput.trim()) {
      showToast('Enter a valid recipient address');
      return;
    }
    setIsBroadcastingTx(true);
    setLastBroadcastTx(null);
    try {
      const res = await executeSelfCustodyTransfer({
        ecosystem: sendEcosystem,
        toAddress: sendRecipientInput.trim(),
        amount: amt,
        tokenSymbol: sendTokenSymbol,
      });
      showToast(res.message);
      if (res.ok && res.txRecord) {
        setLastBroadcastTx(res.txRecord);
        setSendAmountInput('');
      }
    } finally {
      setIsBroadcastingTx(false);
    }
  };

  // Live DEX Swap Quote Fetching
  const payPrice = getAssetPriceUsd(payAsset);
  const receivePrice = getAssetPriceUsd(receiveAsset);
  const conversionRate = receivePrice > 0 ? (payPrice / receivePrice) * 0.998 : 1;
  const numPay = parseFloat(payAmount);
  const fallbackReceiveAmount =
    !isNaN(numPay) && numPay > 0 ? (numPay * conversionRate).toFixed(6) : '';
  const estimatedReceive = liveSwapQuote ? String(liveSwapQuote.toAmount) : fallbackReceiveAmount;

  useEffect(() => {
    if (walletTab !== 'trade') return;
    if (isNaN(numPay) || numPay <= 0 || payAsset === receiveAsset) {
      setLiveSwapQuote(null);
      return;
    }
    let cancelled = false;
    setIsFetchingQuote(true);
    fetchSwapQuote(
      {
        fromToken: payAsset,
        toToken: receiveAsset,
        fromAmount: numPay,
        network: payAsset === 'SOL' ? 'Solana' : 'BNB Smart Chain',
        slippageTolerancePercent: parseFloat(slippage || '0.5'),
      },
      getAssetPriceUsd
    )
      .then((q) => {
        if (!cancelled) setLiveSwapQuote(q);
      })
      .catch(() => {
        if (!cancelled) setLiveSwapQuote(null);
      })
      .finally(() => {
        if (!cancelled) setIsFetchingQuote(false);
      });
    return () => {
      cancelled = true;
    };
  }, [walletTab, numPay, payAsset, receiveAsset, slippage, getAssetPriceUsd]);

  const handleExecuteWeb3Swap = async () => {
    if (isNaN(numPay) || numPay <= 0) {
      showToast('Enter a valid swap amount');
      return;
    }
    // CRITICAL REQUIREMENT 4:
    // Never allow a preview holding (11,352.81 USDT) to be used in real Swap transactions.
    if (useExchangeBalance) {
      const res = executeConvert({
        fromAsset: payAsset,
        toAsset: receiveAsset,
        fromAmount: numPay,
        walletType: 'spot',
      });
      showToast(res.message);
      if (res.ok) setPayAmount('');
      return;
    }
    if (!isWalletActive) {
      showToast(
        'Preview holdings (11,352.81 USDT) cannot be used in real Swaps. Connect a verified wallet or enable "Use Exchange Balance".'
      );
      setAssetsSubScreen('my_wallets');
      return;
    }
    const matchingAsset = verifiedOnChainAssets.find((b) => b.symbol === payAsset);
    if (!matchingAsset || matchingAsset.balance < numPay) {
      showToast(
        `Insufficient verified on-chain ${payAsset} balance (${formatQuantity(
          matchingAsset?.balance ?? 0
        )} ${payAsset}). Preview holdings cannot be swapped.`
      );
      return;
    }
    const res = await executeSelfCustodyTransfer({
      ecosystem: matchingAsset.ecosystem,
      toAddress: activePrimaryAddress,
      amount: numPay,
      tokenSymbol: payAsset,
    });
    showToast(res.message);
  };

  // Filtered Token Lists for Home & Markets
  const filteredHomeTokens = useMemo(() => {
    return REFERENCE_WALLET_TOKENS.filter((tok) => {
      if (homeSearchQuery) {
        const q = homeSearchQuery.toLowerCase();
        if (!tok.symbol.toLowerCase().includes(q) && !tok.name.toLowerCase().includes(q))
          return false;
      }
      if (homeTokenTab === 'Watchlist' && !watchlistSymbols.includes(tok.symbol)) return false;
      if (homeTokenTab === 'Stocks' && tok.category !== 'Stocks') return false;
      if (homeTokenTab === 'Perps' && tok.category !== 'Perps') return false;
      if (homeChainFilter !== 'All') {
        if (homeChainFilter === 'BSC' && tok.chainBadge !== 'BSC') return false;
        if (homeChainFilter === 'Solana' && tok.chainBadge !== 'SOL') return false;
        if (homeChainFilter === 'Ethereum' && tok.chainBadge !== 'ETH') return false;
        if (homeChainFilter === 'Robinhood' && tok.category !== 'Stocks') return false;
      }
      return true;
    });
  }, [homeSearchQuery, homeTokenTab, homeChainFilter, watchlistSymbols]);

  const filteredMarketsTokens = useMemo(() => {
    return REFERENCE_WALLET_TOKENS.filter((tok) => {
      if (marketsSearch) {
        const q = marketsSearch.toLowerCase();
        if (!tok.symbol.toLowerCase().includes(q) && !tok.name.toLowerCase().includes(q))
          return false;
      }
      if (marketsTableTab === 'Alpha' && tok.category !== 'Alpha') return false;
      if (marketsTableTab === 'Stocks' && tok.category !== 'Stocks') return false;
      if (marketsTableTab === 'Perps' && tok.category !== 'Perps') return false;
      if (marketsChainPill !== 'All') {
        if (marketsChainPill === 'BSC' && tok.chainBadge !== 'BSC') return false;
        if (marketsChainPill === 'Solana' && tok.chainBadge !== 'SOL') return false;
        if (marketsChainPill === 'Ethereum' && tok.chainBadge !== 'ETH') return false;
        if (marketsChainPill === 'Base' && tok.chainBadge !== 'BASE') return false;
      }
      return true;
    });
  }, [marketsSearch, marketsTableTab, marketsChainPill]);

  const toggleWatchlist = (sym: string) => {
    setWatchlistSymbols((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  // =========================================================================
  // SHARED MODALS (VAULT CREATE/IMPORT WIZARD, UNLOCK, CONNECT, TX DETAIL)
  // =========================================================================
  const renderSharedOverlays = () => (
    <>
      {/* Persistent Floating Yellow Diamond Shortcut (Matches Reference 00:11 - 01:39) */}
      <WalletFloatingDiamond
        onNavigateSubScreen={(sub) => setAssetsSubScreen(sub)}
        onNavigateTab={(tab) => setWalletTab(tab)}
        activeValuationMode={activeValuationMode}
        onSelectValuationMode={(mode) => {
          setActiveValuationMode(mode);
          showToast(
            mode === 'preview_portfolio'
              ? 'Switched to Preview Portfolio Dataset (11,352.81 USDT)'
              : 'Switched to Verified On-Chain Balance Mode'
          );
        }}
        isWalletActive={isWalletActive}
        valuation={valuation}
      />

      {/* Full-Screen Sub-Views (USDT Detail, Portfolio, Send, Receive, History, Approvals, Settings, My Wallets, Networks) */}
      {assetsSubScreen !== 'main' && (
        <WalletSubScreens
          subScreen={assetsSubScreen}
          setSubScreen={setAssetsSubScreen}
          isWalletActive={isWalletActive}
          activeValuationMode={activeValuationMode}
          onSelectValuationMode={setActiveValuationMode}
          valuation={valuation}
          hideBalance={hideWeb3Balance}
          setHideBalance={setHideWeb3Balance}
          activeWalletLabel={activeWalletLabel}
          activePrimaryAddress={activePrimaryAddress}
          verifiedWeb3UsdBalance={verifiedWeb3UsdBalance}
          verifiedOnChainAssets={verifiedOnChainAssets}
          realOnChainTxs={web3Wallet.realOnChainTxs || []}
          localVault={localVault}
          qrDataUrl={qrDataUrl}
          receiveChainTab={receiveChainTab}
          setReceiveChainTab={setReceiveChainTab}
          activeReceiveAddress={activeReceiveAddress}
          sendEcosystem={sendEcosystem}
          setSendEcosystem={setSendEcosystem}
          sendTokenSymbol={sendTokenSymbol}
          setSendTokenSymbol={setSendTokenSymbol}
          sendRecipientInput={sendRecipientInput}
          setSendRecipientInput={setSendRecipientInput}
          sendAmountInput={sendAmountInput}
          setSendAmountInput={setSendAmountInput}
          isBroadcastingTx={isBroadcastingTx}
          lastBroadcastTx={lastBroadcastTx}
          onBroadcastSend={handleBroadcastSend}
          onStartCreateVault={handleStartCreateVault}
          onStartImportVault={() => setVaultWizardMode('import')}
          onOpenConnectModal={() => setShowConnectModal(true)}
          onOpenUnlockModal={() => setShowUnlockModal(true)}
          onRemoveVault={() => {
            clearStoredVault();
            setLocalVault(null);
            disconnectEcosystemWallet();
            showToast('Removed local encrypted vault');
          }}
          onSelectTxRecord={(tx) => setSelectedTxRecord(tx)}
          onSwitchToExchangeDeposit={(asset) => {
            setAssetsSubScreen('main');
            setAppMode('exchange');
            openDepositModal(asset || 'USDT');
          }}
          onSwitchToExchangeAssets={() => {
            setAssetsSubScreen('main');
            setAppMode('exchange');
            setExchangeTab('assets');
          }}
          onNavigateWalletTab={(tab) => setWalletTab(tab)}
          onSwitchEvmChain={(chainId) => switchConnectedEvmChain(chainId)}
          onRefreshOnChain={handleRefreshOnChain}
          isRefreshingBalances={isRefreshingBalances}
          showToast={showToast}
          cryptoDisclosure={cryptoDisclosure}
        />
      )}

      {/* 1. Self-Custody Vault Creation & Import Wizard Modal */}
      {vaultWizardMode !== 'none' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E2329] rounded-2xl w-full max-w-[400px] p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <KeyRound size={18} className="text-[#F0B90B]" />
                <h3 className="text-[16px] font-bold text-[#EAECEF]">
                  {vaultWizardMode === 'create_step1'
                    ? 'Backup Secret Recovery Phrase'
                    : vaultWizardMode === 'create_verify'
                    ? 'Verify Recovery Phrase'
                    : vaultWizardMode === 'create_password'
                    ? 'Encrypt Self-Custody Vault'
                    : 'Import Seed Phrase or Private Key'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setVaultWizardMode('none');
                  setWalletDraft(null);
                }}
                className="text-[#848E9C] hover:text-[#EAECEF]"
              >
                <X size={18} />
              </button>
            </div>

            {vaultWizardMode === 'create_step1' && walletDraft && (
              <div className="space-y-4">
                <div className="bg-[#F0B90B]/10 rounded-xl p-3 text-[12px] text-[#EAECEF] leading-relaxed">
                  Write down these 12 words in exact order. NexusTrade never transmits your phrase to any server.
                </div>
                <div className="grid grid-cols-3 gap-2 bg-[#181A20] rounded-xl p-3">
                  {walletDraft.words.map((word, idx) => (
                    <div
                      key={idx}
                      className="bg-[#202630] rounded-lg px-2.5 py-1.5 flex items-center gap-1.5"
                    >
                      <span className="text-[10px] text-[#848E9C] font-mono">{idx + 1}.</span>
                      <span className="text-[12px] font-bold text-[#EAECEF] font-mono">
                        {showMnemonicPlain ? word : '•••••'}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowMnemonicPlain(!showMnemonicPlain)}
                    className="text-[12px] font-semibold text-[#848E9C] hover:text-[#EAECEF] flex items-center gap-1.5"
                  >
                    {showMnemonicPlain ? <EyeOff size={14} /> : <Eye size={14} />}
                    {showMnemonicPlain ? 'Hide Words' : 'Reveal Words'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(walletDraft.mnemonicPhrase);
                      showToast('Recovery phrase copied to clipboard');
                    }}
                    className="text-[12px] font-semibold text-[#F0B90B] flex items-center gap-1"
                  >
                    <Copy size={13} /> Copy Phrase
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setVaultWizardMode('create_verify')}
                  className="w-full h-11 bg-[#FCD535] text-[#181A20] font-bold rounded-xl text-[14px]"
                >
                  I Have Written It Down → Verify
                </button>
              </div>
            )}

            {vaultWizardMode === 'create_verify' && walletDraft && (
              <div className="space-y-3.5">
                <p className="text-[12px] text-[#848E9C]">
                  Confirm the requested words from your 12-word recovery phrase:
                </p>
                {challengeIndices.map((wordIndex, i) => (
                  <div key={wordIndex}>
                    <label className="text-[11px] font-semibold text-[#848E9C] block mb-1">
                      Word #{wordIndex + 1}
                    </label>
                    <input
                      type="text"
                      value={challengeAnswers[i]}
                      onChange={(e) => {
                        const next = [...challengeAnswers] as [string, string, string];
                        next[i] = e.target.value;
                        setChallengeAnswers(next);
                      }}
                      placeholder={`Enter word #${wordIndex + 1}`}
                      className="w-full h-10 bg-[#181A20] rounded-xl px-3 text-[13px] text-[#EAECEF] font-mono focus:outline-none"
                    />
                  </div>
                ))}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setVaultWizardMode('create_step1')}
                    className="text-[12px] text-[#848E9C] hover:text-[#EAECEF]"
                  >
                    ← View Phrase Again
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setChallengeAnswers([
                        walletDraft.words[challengeIndices[0]] || '',
                        walletDraft.words[challengeIndices[1]] || '',
                        walletDraft.words[challengeIndices[2]] || '',
                      ])
                    }
                    className="text-[11px] font-semibold text-[#F0B90B] hover:underline"
                  >
                    Auto-fill Verification
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleVerifyBackupStep}
                  className="w-full h-11 bg-[#FCD535] text-[#181A20] font-bold rounded-xl text-[14px]"
                >
                  Verify &amp; Continue
                </button>
              </div>
            )}

            {vaultWizardMode === 'create_password' && (
              <div className="space-y-3.5">
                <div>
                  <label className="text-[11px] text-[#848E9C] block mb-1">Wallet Name</label>
                  <input
                    type="text"
                    value={vaultLabelInput}
                    onChange={(e) => setVaultLabelInput(e.target.value)}
                    className="w-full h-10 bg-[#181A20] rounded-xl px-3 text-[13px] text-[#EAECEF]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#848E9C] block mb-1">
                    Encryption Password (min 8 chars)
                  </label>
                  <input
                    type="password"
                    value={vaultPassword}
                    onChange={(e) => setVaultPassword(e.target.value)}
                    placeholder="Enter strong password"
                    className="w-full h-10 bg-[#181A20] rounded-xl px-3 text-[13px] text-[#EAECEF]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#848E9C] block mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={vaultPasswordConfirm}
                    onChange={(e) => setVaultPasswordConfirm(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full h-10 bg-[#181A20] rounded-xl px-3 text-[13px] text-[#EAECEF]"
                  />
                </div>
                <button
                  type="button"
                  disabled={isCreatingVault}
                  onClick={handleFinalizeCreateVault}
                  className="w-full h-11 bg-[#FCD535] text-[#181A20] font-bold rounded-xl text-[14px]"
                >
                  {isCreatingVault ? 'Encrypting Vault...' : 'Create Encrypted Wallet'}
                </button>
              </div>
            )}

            {vaultWizardMode === 'import' && (
              <div className="space-y-3.5">
                <div>
                  <label className="text-[11px] text-[#848E9C] block mb-1">Wallet Name</label>
                  <input
                    type="text"
                    value={vaultLabelInput}
                    onChange={(e) => setVaultLabelInput(e.target.value)}
                    className="w-full h-10 bg-[#181A20] rounded-xl px-3 text-[13px] text-[#EAECEF]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#848E9C] block mb-1">
                    BIP-39 Seed Phrase (12/24 words) or 0x Private Key
                  </label>
                  <textarea
                    rows={3}
                    value={importSecretInput}
                    onChange={(e) => setImportSecretInput(e.target.value)}
                    placeholder="Enter 12/24 words or 64-character hex private key..."
                    className="w-full bg-[#181A20] rounded-xl p-3 text-[12px] text-[#EAECEF] font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#848E9C] block mb-1">
                    New Vault Password (min 8 chars)
                  </label>
                  <input
                    type="password"
                    value={vaultPassword}
                    onChange={(e) => setVaultPassword(e.target.value)}
                    placeholder="Password to encrypt locally"
                    className="w-full h-10 bg-[#181A20] rounded-xl px-3 text-[13px] text-[#EAECEF]"
                  />
                </div>
                <button
                  type="button"
                  disabled={isCreatingVault}
                  onClick={handleFinalizeImportVault}
                  className="w-full h-11 bg-[#FCD535] text-[#181A20] font-bold rounded-xl text-[14px]"
                >
                  {isCreatingVault ? 'Importing & Encrypting...' : 'Import Self-Custody Wallet'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Unlock & Backup Seed Phrase Modal */}
      {showUnlockModal && localVault && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E2329] rounded-2xl w-full max-w-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-[#EAECEF]">Export Recovery Phrase</h3>
              <button
                type="button"
                onClick={() => {
                  setShowUnlockModal(false);
                  setRevealedMnemonic(null);
                  setUnlockPasswordInput('');
                }}
                className="text-[#848E9C] hover:text-[#EAECEF]"
              >
                <X size={18} />
              </button>
            </div>
            {!revealedMnemonic ? (
              <div className="space-y-3">
                <p className="text-[12px] text-[#848E9C]">
                  Enter your vault encryption password to decrypt your recovery phrase.
                </p>
                <input
                  type="password"
                  value={unlockPasswordInput}
                  onChange={(e) => setUnlockPasswordInput(e.target.value)}
                  placeholder="Vault password"
                  className="w-full h-10 bg-[#181A20] rounded-xl px-3 text-[13px] text-[#EAECEF]"
                />
                <button
                  type="button"
                  onClick={handleUnlockMnemonic}
                  className="w-full h-10 bg-[#FCD535] text-[#181A20] font-bold rounded-xl text-[13px]"
                >
                  Decrypt Phrase
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-[#181A20] font-mono text-[12px] text-[#EAECEF] leading-relaxed break-words">
                  {revealedMnemonic}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(revealedMnemonic);
                    showToast('Copied recovery phrase');
                  }}
                  className="w-full h-9 bg-[#2B3139] text-[#EAECEF] font-semibold rounded-xl text-[12px] flex items-center justify-center gap-1.5"
                >
                  <Copy size={13} /> Copy to Clipboard
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Connect External Provider Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E2329] rounded-2xl w-full max-w-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-[#EAECEF]">Connect Browser Wallet</h3>
              <button
                type="button"
                onClick={() => setShowConnectModal(false)}
                className="text-[#848E9C] hover:text-[#EAECEF]"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-2">
              {(
                [
                  {
                    type: 'EVM' as const,
                    title: 'MetaMask / Rabby (EVM)',
                    sub: 'BNB Smart Chain, Ethereum, Arbitrum, Base',
                  },
                  {
                    type: 'SOLANA' as const,
                    title: 'Phantom / Solflare',
                    sub: 'Solana Mainnet SPL',
                  },
                  {
                    type: 'BITCOIN' as const,
                    title: 'Unisat / Xverse',
                    sub: 'Bitcoin Native SegWit',
                  },
                ]
              ).map((prov) => (
                <button
                  key={prov.type}
                  type="button"
                  disabled={isConnecting}
                  onClick={() => handleConnectProvider(prov.type)}
                  className="w-full p-3.5 rounded-xl bg-[#202630] hover:bg-[#2B3139] flex items-center justify-between text-left transition-colors"
                >
                  <div>
                    <div className="text-[13px] font-semibold text-[#EAECEF]">{prov.title}</div>
                    <div className="text-[11px] text-[#848E9C]">{prov.sub}</div>
                  </div>
                  <ChevronRight size={15} className="text-[#848E9C]" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. On-Chain Transaction Detail Modal */}
      {selectedTxRecord && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E2329] rounded-2xl w-full max-w-sm p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-[#EAECEF]">Transaction Details</h3>
              <button
                type="button"
                onClick={() => setSelectedTxRecord(null)}
                className="text-[#848E9C] hover:text-[#EAECEF]"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-2.5 text-[12px] bg-[#181A20] p-4 rounded-xl">
              <div className="flex justify-between">
                <span className="text-[#848E9C]">Status</span>
                <span className="font-semibold text-[#0ECB81]">{selectedTxRecord.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#848E9C]">Network</span>
                <span className="font-semibold text-[#EAECEF]">{selectedTxRecord.networkName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#848E9C]">Amount</span>
                <span className="font-bold text-[#0ECB81] tabular-nums">
                  +{selectedTxRecord.amount} {selectedTxRecord.asset}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#848E9C]">From</span>
                <span className="font-mono text-[#EAECEF]">
                  {shortenAddress(selectedTxRecord.fromAddress)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#848E9C]">To</span>
                <span className="font-mono text-[#EAECEF]">
                  {shortenAddress(selectedTxRecord.toAddress)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#848E9C]">Tx Hash</span>
                <span className="font-mono text-[#F0B90B]">
                  {shortenAddress(selectedTxRecord.txHash)}
                </span>
              </div>
            </div>
            <a
              href={selectedTxRecord.explorerUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full h-10 bg-[#FCD535] text-[#181A20] font-bold rounded-xl text-[13px] flex items-center justify-center gap-1.5"
            >
              View on Block Explorer <ExternalLink size={14} />
            </a>
          </div>
        </div>
      )}
    </>
  );

  // =========================================================================
  // TAB 1: WALLET HOME (Matches 00:00 - 00:19, 01:01, 01:27 - 01:29 of Reference)
  // =========================================================================
  if (walletTab === 'home') {
    const activePromo = REFERENCE_PROMO_SLIDES[promoIndex];
    const pts = valuation.chartPoints;
    const activeScrubPt =
      chartScrubIdx !== null && pts[chartScrubIdx] ? pts[chartScrubIdx] : null;
    const startVal = pts[0]?.inrValue ?? displayedInrBalance;
    const activeDisplayInr = activeScrubPt ? activeScrubPt.inrValue : displayedInrBalance;
    const activeDeltaInr = activeScrubPt
      ? Number((activeScrubPt.inrValue - startVal).toFixed(2))
      : valuation.chartDeltaInr;
    const activeDeltaPct =
      activeScrubPt && startVal > 0
        ? ((activeScrubPt.inrValue - startVal) / startVal) * 100
        : valuation.chartDeltaPct;

    const handleScrubClientX = (clientX: number, rect: DOMRect) => {
      if (!pts.length || rect.width <= 0) return;
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const idx = Math.round(ratio * (pts.length - 1));
      setChartScrubIdx(idx);
    };

    return (
      <div className="flex flex-col flex-1 bg-[#181A20] min-h-full pb-24 select-none">
        {renderSharedOverlays()}

        {/* B. Search Bar: Search placeholder on left + Search icon on right (Matches 00:00 - 00:10) */}
        <div className="px-4 pt-2 pb-1.5">
          <div className="relative flex items-center">
            <input
              type="text"
              value={homeSearchQuery}
              onChange={(e) => setHomeSearchQuery(e.target.value)}
              placeholder={ROTATING_SEARCH_PLACEHOLDERS[searchPlaceholderIdx]}
              className="w-full h-9 bg-[#202630] rounded-xl pl-3.5 pr-10 text-[13px] text-[#EAECEF] placeholder-[#848E9C] focus:outline-none"
            />
            <div className="absolute right-3 flex items-center text-[#848E9C]">
              <Search size={16} className="pointer-events-none" />
            </div>
          </div>
        </div>

        {/* C. Portfolio Header: [Rocket] My Wallet > [Copy] ... [Keyless Lightning Check Badge] */}
        <div className="px-4 pt-2 pb-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setAssetsSubScreen('my_wallets')}
                className="flex items-center gap-1.5 text-[13px] font-medium text-[#EAECEF] hover:text-[#F0B90B] transition-colors cursor-pointer"
              >
                <KeylessWalletAvatar size="sm" />
                <span>{activeWalletLabel}</span>
                <ChevronRight size={14} className="text-[#848E9C]" />
              </button>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(activeReceiveAddress);
                  showToast('Wallet address copied to clipboard');
                }}
                className="text-[#848E9C] hover:text-[#EAECEF] p-1"
                title="Copy Address"
              >
                <Copy size={13} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setAssetsSubScreen('my_wallets')}
              className="cursor-pointer"
              title="Keyless MPC Security"
            >
              <KeylessCheckBadge />
            </button>
          </div>

          <div className="flex items-center justify-between mt-1">
            <div>
              <div className="text-[30px] leading-[36px] font-bold text-[#EAECEF] tabular-nums tracking-[-0.02em]">
                {hideWeb3Balance ? '******' : formatInrValue(activeDisplayInr)}
              </div>
              <div className="text-[12px] tabular-nums mt-0.5 flex items-center gap-1.5">
                <span className="text-[#848E9C] font-medium">{homeTimeframe}</span>
                <span
                  className={
                    activeDeltaInr >= 0
                      ? 'text-[#0ECB81] font-medium'
                      : 'text-[#F6465D] font-medium'
                  }
                >
                  {activeDeltaInr >= 0 ? '+' : ''}
                  {hideWeb3Balance ? '****' : formatInrValue(activeDeltaInr)} (
                  {activeDeltaPct >= 0 ? '+' : ''}
                  {activeDeltaPct.toFixed(2)}%)
                </span>
                <span className="text-[8px] text-[#848E9C]">
                  {activeDeltaInr >= 0 ? '▲' : '▼'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowPortfolioGraph((prev) => !prev)}
                className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                  showPortfolioGraph
                    ? 'bg-[#202630] text-[#F0B90B] hover:bg-[#2B3139]'
                    : 'bg-[#202630] text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B3139]'
                }`}
                title={showPortfolioGraph ? 'Hide portfolio graph' : 'Show portfolio graph'}
                aria-label={showPortfolioGraph ? 'Hide portfolio graph' : 'Show portfolio graph'}
              >
                <LineChart size={17} />
              </button>

              <button
                type="button"
                onClick={() => setAssetsSubScreen('receive')}
                className="h-8 px-4 rounded-lg bg-[#FCD535] hover:bg-[#F0B90B] text-[#181A20] font-semibold text-[13px] transition-colors cursor-pointer shrink-0"
              >
                Receive
              </button>
            </div>
          </div>
        </div>

        {/* D. Interactive Smooth Yellow Portfolio Graph + 1D, 7D, 30D Selectors (Collapsible) */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            showPortfolioGraph
              ? 'max-h-[220px] opacity-100 px-4 pt-1 pb-2'
              : 'max-h-0 opacity-0 px-4 py-0 pointer-events-none'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] text-[#848E9C] tabular-nums mb-0.5 h-4">
            <span>
              {activeScrubPt
                ? new Date(activeScrubPt.time).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : ''}
            </span>
            <span>{hideWeb3Balance ? '****' : formatInrValue(valuation.chartHighInr)}</span>
          </div>

          <div
            className="relative h-[116px] w-full touch-none cursor-crosshair"
            onPointerDown={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              handleScrubClientX(e.clientX, rect);
            }}
            onPointerMove={(e) => {
              if (e.buttons === 1 || e.pointerType === 'touch' || chartScrubIdx !== null) {
                const rect = e.currentTarget.getBoundingClientRect();
                handleScrubClientX(e.clientX, rect);
              }
            }}
            onPointerUp={() => setChartScrubIdx(null)}
            onPointerLeave={() => setChartScrubIdx(null)}
            onTouchMove={(e) => {
              if (e.touches[0]) {
                const rect = e.currentTarget.getBoundingClientRect();
                handleScrubClientX(e.touches[0].clientX, rect);
              }
            }}
            onTouchEnd={() => setChartScrubIdx(null)}
          >
            <svg viewBox="0 0 360 88" className="w-full h-[96px]" preserveAspectRatio="none">
              <defs>
                <linearGradient id="ntWalletChartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F0B90B" stopOpacity="0.20" />
                  <stop offset="100%" stopColor="#F0B90B" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Subtle bottom reference baseline */}
              <line x1="0" y1="78" x2="360" y2="78" stroke="#2B3139" strokeWidth="1" />

              {displayedInrBalance > 0 ? (
                <>
                  <path d={valuation.chartSvgAreaPath} fill="url(#ntWalletChartGrad)" />
                  <path
                    d={valuation.chartSvgLinePath}
                    fill="none"
                    stroke="#F0B90B"
                    strokeWidth="2.1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {activeScrubPt && (
                    <>
                      <line
                        x1={activeScrubPt.x}
                        y1="6"
                        x2={activeScrubPt.x}
                        y2="78"
                        stroke="#848E9C"
                        strokeWidth="1"
                        strokeDasharray="3 3"
                      />
                      <circle
                        cx={activeScrubPt.x}
                        cy={activeScrubPt.y}
                        r="4"
                        fill="#F0B90B"
                        stroke="#181A20"
                        strokeWidth="2"
                      />
                    </>
                  )}
                </>
              ) : (
                <path
                  d="M 0 74 L 360 74"
                  fill="none"
                  stroke="#F0B90B"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              )}
            </svg>

            <div className="flex items-center justify-start text-[11px] text-[#848E9C] tabular-nums mt-0.5">
              <span>
                {hideWeb3Balance
                  ? '****'
                  : displayedInrBalance > 0
                  ? formatInrValue(valuation.chartLowInr)
                  : '₹0'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-8 mt-1.5">
            {(['1D', '7D', '30D'] as const).map((tf) => {
              const active = homeTimeframe === tf;
              return (
                <button
                  key={tf}
                  type="button"
                  onClick={() => {
                    setChartScrubIdx(null);
                    setHomeTimeframe(tf);
                  }}
                  className={`px-3 py-1 rounded-md text-[12px] transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#202630] text-[#EAECEF] font-bold'
                      : 'text-[#848E9C] hover:text-[#EAECEF] font-medium'
                  }`}
                >
                  {tf}
                </button>
              );
            })}
          </div>
        </div>

        {/* E. Five Shortcut Items: Alpha | Stocks | DeFi | Referral | More (2-Tone White + Yellow SVGs matching frame_002.jpg) */}
        <div className="grid grid-cols-5 gap-2 px-4 py-2.5">
          {[
            {
              label: 'Alpha',
              svg: (
                <svg viewBox="0 0 24 24" className="w-[22px] h-[22px]" fill="none">
                  <path
                    d="M12 4a6.5 6.5 0 1 0 5.8 9.4"
                    stroke="#EAECEF"
                    strokeWidth="2.1"
                    strokeLinecap="round"
                  />
                  <circle cx="12" cy="10.5" r="2.3" fill="#EAECEF" />
                  <path
                    d="M18 4.5l1.1 2.3 2.4 1.1-2.4 1.1L18 11.3l-1.1-2.3-2.4-1.1 2.4-1.1L18 4.5z"
                    fill="#F0B90B"
                  />
                </svg>
              ),
              onClick: () => {
                setWalletTab('markets');
                setMarketsTableTab('Alpha');
              },
            },
            {
              label: 'Stocks',
              svg: (
                <svg viewBox="0 0 24 24" className="w-[22px] h-[22px]" fill="none">
                  <rect x="5" y="9" width="3.2" height="8" rx="1" fill="#EAECEF" />
                  <line
                    x1="6.6"
                    y1="6"
                    x2="6.6"
                    y2="19"
                    stroke="#EAECEF"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <rect x="10.4" y="6.5" width="3.2" height="7.5" rx="1" fill="#EAECEF" />
                  <line
                    x1="12"
                    y1="4.5"
                    x2="12"
                    y2="16.5"
                    stroke="#EAECEF"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <rect x="15.8" y="8" width="3.2" height="8.5" rx="1" fill="#F0B90B" />
                  <line
                    x1="17.4"
                    y1="5.5"
                    x2="17.4"
                    y2="18.5"
                    stroke="#F0B90B"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              ),
              onClick: () => {
                setWalletTab('markets');
                setMarketsTopTab('Stocks');
              },
            },
            {
              label: 'DeFi',
              svg: (
                <svg viewBox="0 0 24 24" className="w-[22px] h-[22px]" fill="none">
                  <circle cx="12" cy="8.5" r="4" stroke="#EAECEF" strokeWidth="2" />
                  <path
                    d="M12 6.8v3.4M10.5 8.5h3"
                    stroke="#F0B90B"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M5 15.5c1.8 0 3.2 2 5.8 2h5.2c1.2 0 2-.8 2-1.8 0-.9-.7-1.6-1.7-1.6h-3.8"
                    stroke="#EAECEF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ),
              onClick: () => {
                setWalletTab('discover');
                setDiscoverSubTab('Earn');
              },
            },
            {
              label: 'Referral',
              svg: (
                <svg viewBox="0 0 24 24" className="w-[22px] h-[22px]" fill="none">
                  <rect
                    x="4.5"
                    y="10"
                    width="15"
                    height="9.5"
                    rx="2"
                    stroke="#EAECEF"
                    strokeWidth="2"
                  />
                  <path d="M3.5 7.5h17v2.8h-17z" fill="#EAECEF" />
                  <rect x="10.8" y="7.5" width="2.4" height="12" fill="#F0B90B" />
                  <path
                    d="M12 7.5C10 5 7.5 5.2 7.5 6.8c0 1.1 2 1.2 4.5.7zm0 0c2-2.5 4.5-2.3 4.5-.7 0 1.1-2 1.2-4.5.7z"
                    stroke="#F0B90B"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              ),
              onClick: () => showToast('Referral Program: Invite friends & earn 30% rebate'),
            },
            {
              label: 'More',
              svg: (
                <svg viewBox="0 0 24 24" className="w-[22px] h-[22px]" fill="none">
                  <circle cx="6" cy="12" r="2" fill="#EAECEF" />
                  <circle cx="12" cy="12" r="2" fill="#EAECEF" />
                  <circle cx="18" cy="12" r="2" fill="#F0B90B" />
                </svg>
              ),
              onClick: () => setAssetsSubScreen('settings'),
            },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={item.onClick}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-[52px] h-[52px] rounded-2xl bg-[#202630] hover:bg-[#2B3139] flex items-center justify-center relative transition-colors">
                {item.svg}
              </div>
              <span className="text-[12px] text-[#EAECEF] font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        {/* F. Promotional Carousel (Warm Olive-Dark Gradient matching frame_002.jpg & frame_016.jpg) */}
        <div className="px-4 py-1.5">
          <div
            onClick={() => setWalletTab('discover')}
            className="p-4 rounded-2xl bg-gradient-to-r from-[#282A24] via-[#2E3024] to-[#3A3B28] border border-[#3E402E]/60 min-h-[86px] flex items-center justify-between cursor-pointer transition-opacity hover:opacity-95 relative overflow-hidden"
          >
            <div className="pr-3 flex-1">
              <div className="text-[14px] font-bold text-[#EAECEF] leading-snug">
                {activePromo.title}
              </div>
              <div className="text-[13px] font-bold text-[#F0B90B] mt-1 inline-flex items-center gap-0.5">
                <span>{activePromo.cta}</span>
              </div>
            </div>

            <div className="w-16 h-13 rounded-xl bg-[#181A20]/55 border border-[#F0B90B]/30 flex items-center justify-center shrink-0">
              {activePromo.badgeType === 'ai' ? (
                <div className="px-2.5 py-1 rounded-lg bg-[#FCD535] text-[#181A20] font-extrabold text-[14px] -rotate-6 shadow-sm">
                  .ai
                </div>
              ) : activePromo.badgeType === 'shield' ? (
                <ShieldCheck size={26} className="text-[#F0B90B]" />
              ) : (
                <Flame size={26} className="text-[#F0B90B]" />
              )}
            </div>

            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1">
              {REFERENCE_PROMO_SLIDES.map((s, idx) => (
                <span
                  key={s.id}
                  className={`h-1 rounded-full transition-all ${
                    idx === promoIndex ? 'w-3 bg-[#EAECEF]' : 'w-1 bg-[#848E9C]/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* G. Two-Column Cards: Tracker & Earn (Matches 00:00 - 00:19) */}
        <div className="grid grid-cols-2 gap-2.5 px-4 py-2">
          <div
            onClick={() => {
              setWalletTab('markets');
              setMarketsTopTab('Tracker');
            }}
            className="p-3.5 rounded-2xl bg-[#202630] hover:bg-[#2B3139]/80 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between text-[13px] text-[#848E9C] mb-2.5">
              <span>Tracker</span>
              <ChevronRight size={14} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <CoinIcon asset="ETH" size="md" />
                <div className="min-w-0">
                  <div className="text-[15px] font-bold text-[#EAECEF] truncate">WOJAK</div>
                  <div className="text-[11px] text-[#848E9C] truncate">2 Traders Calls</div>
                </div>
              </div>
              <div className="w-6 h-6 rounded-full bg-[#2B3139] flex items-center justify-center text-[10px] font-bold text-[#F0B90B] shrink-0">
                W
              </div>
            </div>
          </div>

          <div
            onClick={() => {
              setWalletTab('discover');
              setDiscoverSubTab('Earn');
            }}
            className="p-3.5 rounded-2xl bg-[#202630] hover:bg-[#2B3139]/80 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between text-[13px] text-[#848E9C] mb-2.5">
              <span>Earn</span>
              <ChevronRight size={14} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[17px] font-bold text-[#EAECEF] tabular-nums">22.01%</div>
                <div className="text-[11px] text-[#848E9C]">APY</div>
              </div>
              <div className="flex flex-col items-center">
                <CoinIcon asset="TRX" size="md" />
                <span className="text-[10px] text-[#848E9C] mt-0.5">TRX</span>
              </div>
            </div>
          </div>
        </div>

        {/* H. Token Section inside rounded container: [Star] | Holdings | Trending | Stocks | Perps (Matches frame_016.jpg) */}
        <div className="mx-3 mt-1.5 pt-3 pb-3 rounded-t-3xl bg-[#1E2329]">
          <div className="flex items-center gap-5 px-3.5 overflow-x-auto no-scrollbar pb-2">
            <button
              type="button"
              onClick={() => setHomeTokenTab('Watchlist')}
              className={`text-[14px] flex items-center ${
                homeTokenTab === 'Watchlist' ? 'text-[#F0B90B]' : 'text-[#848E9C]'
              }`}
            >
              <Star size={16} className={homeTokenTab === 'Watchlist' ? 'fill-[#F0B90B]' : ''} />
            </button>
            {(['Holdings', 'Trending', 'Stocks', 'Perps'] as const).map((tab) => {
              const active = homeTokenTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setHomeTokenTab(tab)}
                  className={`text-[16px] whitespace-nowrap transition-colors cursor-pointer ${
                    active ? 'font-bold text-[#EAECEF]' : 'font-medium text-[#848E9C]'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Chain Filter Bar: All | BSC | Robinhood | Solana | Ethereum | 1h v */}
          <div className="flex items-center justify-between px-3.5 py-2 gap-2 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5">
              {(['All', 'BSC', 'Robinhood', 'Solana', 'Ethereum'] as const).map((ch) => {
                const active = homeChainFilter === ch;
                return (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setHomeChainFilter(ch)}
                    className={`px-2.5 py-1 rounded-lg text-[12px] whitespace-nowrap transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#2B3139] text-[#EAECEF] font-semibold'
                        : 'text-[#848E9C] hover:text-[#EAECEF] font-medium'
                    }`}
                  >
                    {ch}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => showToast('Sorted by 1h on-chain volume')}
              className="px-2.5 py-1 rounded-lg bg-[#2B3139] text-[12px] font-semibold text-[#EAECEF] flex items-center gap-1 shrink-0"
            >
              <span>1h</span>
              <ChevronDown size={13} className="text-[#848E9C]" />
            </button>
          </div>

          {/* Token Rows */}
          {homeTokenTab === 'Holdings' ? (
            <div className="px-3.5 pt-1">
              {displayedUsdtQty > 0 ? (
                <div
                  onClick={() => setAssetsSubScreen('usdt_detail')}
                  className="py-3 flex items-center justify-between cursor-pointer hover:bg-[#202630]/50 rounded-xl px-1 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <CoinIcon asset="USDT" size="lg" />
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#F0B90B] border-2 border-[#1E2329] flex items-center justify-center text-[7px] font-extrabold text-[#181A20]">
                        B
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[15px] font-bold text-[#EAECEF]">USDT</span>
                        <span className="px-1.5 py-0.5 rounded bg-[#2D2618] text-[#F0B90B] text-[10px] font-semibold">
                          Up to 10.98% APY
                        </span>
                      </div>
                      <div className="text-[12px] text-[#848E9C] tabular-nums mt-0.5 flex items-center gap-1.5">
                        <span>₹93.89</span>
                        <span
                          className={
                            valuation.usdt24hChangePct >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                          }
                        >
                          {valuation.usdt24hChangePct >= 0 ? '+' : ''}
                          {valuation.usdt24hChangePct.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right tabular-nums">
                    <div className="text-[15px] font-bold text-[#EAECEF]">
                      {hideWeb3Balance ? '******' : formatQuantity(displayedUsdtQty)}
                    </div>
                    <div className="text-[12px] text-[#848E9C] mt-0.5">
                      {hideWeb3Balance ? '******' : formatInrValue(displayedInrBalance)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center text-[13px] text-[#848E9C]">
                  No token holdings yet
                </div>
              )}
            </div>
          ) : (
            <div className="px-4 pt-1 space-y-1">
              {filteredHomeTokens.map((tok) => {
                const isUp = tok.change24h >= 0;
                return (
                  <div
                    key={tok.symbol}
                    onClick={() => {
                      setPayAsset('USDT');
                      setReceiveAsset(tok.symbol === 'SOL' ? 'SOL' : 'BNB');
                      setWalletTab('trade');
                    }}
                    className="py-2.5 flex items-center justify-between hover:bg-[#202630]/50 rounded-xl px-1 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <CoinIcon asset={tok.symbol} size="lg" />
                        <span
                          className="absolute -bottom-0.5 -right-0.5 px-1 rounded text-[8px] font-extrabold text-[#181A20]"
                          style={{ backgroundColor: tok.badgeColor }}
                        >
                          {tok.chainBadge}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[15px] font-bold text-[#EAECEF] truncate">
                            {tok.symbol}
                          </span>
                          {tok.multiplier && (
                            <span className="px-1.5 py-0.5 rounded bg-[#2D2618] text-[#F0B90B] text-[10px] font-bold">
                              {tok.multiplier}
                            </span>
                          )}
                        </div>
                        <div className="text-[12px] text-[#848E9C] tabular-nums flex items-center gap-2 mt-0.5">
                          <span>{tok.volInr}</span>
                          <span>{tok.mcapInr}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right tabular-nums shrink-0">
                      <div className="text-[15px] font-bold text-[#EAECEF]">{tok.priceInr}</div>
                      <div
                        className={`text-[12px] font-semibold mt-0.5 ${
                          isUp ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                        }`}
                      >
                        {isUp ? '+' : ''}
                        {tok.change24h.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="py-3 text-center">
                <button
                  type="button"
                  onClick={() => setWalletTab('markets')}
                  className="text-[12px] font-medium text-[#848E9C] hover:text-[#EAECEF]"
                >
                  View more
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // TAB 2: WALLET MARKETS (Matches 00:47 - 00:49 of Reference)
  // =========================================================================
  if (walletTab === 'markets') {
    return (
      <div className="flex flex-col flex-1 bg-[#181A20] min-h-full pb-24 select-none">
        {renderSharedOverlays()}

        <div className="flex items-center gap-6 px-4 pt-2.5 pb-2 border-b border-[#2B3139]">
          {(['Overview', 'Stocks', 'Memes', 'Tracker'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setMarketsTopTab(tab)}
              className={`text-[16px] font-bold pb-1.5 relative transition-colors ${
                marketsTopTab === tab ? 'text-[#EAECEF]' : 'text-[#848E9C]'
              }`}
            >
              {tab}
              {marketsTopTab === tab && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-[2.5px] bg-[#F0B90B] rounded-full" />
              )}
            </button>
          ))}
        </div>

        <div className="px-4 py-2.5 flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={14} className="text-[#848E9C] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={marketsSearch}
              onChange={(e) => setMarketsSearch(e.target.value)}
              placeholder="Top Search: AGC"
              className="w-full h-9 bg-[#202630] rounded-xl pl-9 pr-3 text-[12px] text-[#EAECEF] placeholder-[#848E9C] focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => showToast(`${watchlistSymbols.length} tokens in Watchlist`)}
            className="w-9 h-9 rounded-xl bg-[#202630] flex items-center justify-center text-[#F0B90B]"
          >
            <Star size={15} className="fill-[#F0B90B]" />
          </button>
        </div>

        <div className="flex items-center gap-5 px-4 pt-1 pb-2 border-b border-[#2B3139]">
          {(['Holdings', 'Trending', 'Alpha', 'Stocks', 'Perps'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setMarketsTableTab(t)}
              className={`text-[14px] font-semibold relative pb-1 ${
                marketsTableTab === t ? 'text-[#EAECEF]' : 'text-[#848E9C]'
              }`}
            >
              {t}
              {marketsTableTab === t && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#F0B90B] rounded-full" />
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 px-4 py-2.5 overflow-x-auto no-scrollbar">
          {(['All', 'BSC', 'Robinhood', 'Solana', 'Ethereum', 'Base'] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setMarketsChainPill(c)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap ${
                marketsChainPill === c
                  ? 'bg-[#2B3139] text-[#EAECEF]'
                  : 'bg-[#202630] text-[#848E9C]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="px-4 space-y-1">
          {filteredMarketsTokens.map((tok) => {
            const isUp = tok.change24h >= 0;
            return (
              <div
                key={tok.symbol}
                onClick={() => {
                  setPayAsset('USDT');
                  setReceiveAsset(tok.symbol === 'SOL' ? 'SOL' : 'BNB');
                  setWalletTab('trade');
                }}
                className="py-2.5 flex items-center justify-between hover:bg-[#202630]/50 rounded-xl px-1 cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWatchlist(tok.symbol);
                    }}
                    className="text-[#848E9C] hover:text-[#F0B90B]"
                  >
                    <Star
                      size={13}
                      className={
                        watchlistSymbols.includes(tok.symbol)
                          ? 'fill-[#F0B90B] text-[#F0B90B]'
                          : ''
                      }
                    />
                  </button>
                  <div className="relative">
                    <CoinIcon asset={tok.symbol} size="md" />
                    <span
                      className="absolute -bottom-0.5 -right-0.5 px-1 rounded text-[8px] font-bold text-[#181A20]"
                      style={{ backgroundColor: tok.badgeColor }}
                    >
                      {tok.chainBadge}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[14px] font-bold text-[#EAECEF]">{tok.symbol}</span>
                      {tok.multiplier && (
                        <span className="px-1.5 py-0.5 rounded bg-[#2D2618] text-[#F0B90B] text-[10px] font-bold">
                          {tok.multiplier}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#848E9C] tabular-nums">
                      {tok.volInr} · {tok.mcapInr}
                    </div>
                  </div>
                </div>

                <div className="text-right tabular-nums">
                  <div className="text-[14px] font-bold text-[#EAECEF]">{tok.priceInr}</div>
                  <div
                    className={`text-[12px] font-semibold ${
                      isUp ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                    }`}
                  >
                    {isUp ? '+' : ''}
                    {tok.change24h.toFixed(2)}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // =========================================================================
  // TAB 3: WALLET TRADE / SWAP (Matches 00:55 - 01:00 + Blocks Preview Holdings)
  // =========================================================================
  if (walletTab === 'trade') {
    // CRITICAL REQUIREMENT 4:
    // Never allow a preview holding (11,352.81 USDT) to be used in real Swap transactions.
    // Spendable balance is either Exchange Spot balance (when toggle ON) or Verified On-Chain balance.
    const verifiedSpendableForPay = isWalletActive
      ? verifiedOnChainAssets.find((a) => a.symbol === payAsset)?.balance ?? 0
      : 0;
    const exchangeSpendableForPay = wallets?.spot?.[payAsset]?.available ?? 0;
    const payBal = useExchangeBalance ? exchangeSpendableForPay : verifiedSpendableForPay;

    return (
      <div className="flex flex-col flex-1 bg-[#181A20] min-h-full pb-24 select-none">
        {renderSharedOverlays()}

        {/* Top Bar: Swap | Bridge | Pro | Perps + Chart & Settings icons */}
        <div className="flex items-center justify-between px-4 pt-2.5 pb-2">
          <div className="flex items-center gap-5">
            {(['Swap', 'Bridge', 'Pro', 'Perps'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setTradeSubMode(m)}
                className={`text-[17px] transition-colors cursor-pointer ${
                  tradeSubMode === m
                    ? 'font-bold text-[#EAECEF]'
                    : 'font-medium text-[#848E9C] hover:text-[#EAECEF]'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-[#848E9C]">
            <button
              type="button"
              onClick={() => setShowSwapChart(!showSwapChart)}
              className="p-1.5 hover:text-[#EAECEF]"
            >
              <BarChart2 size={17} />
            </button>
            <button
              type="button"
              onClick={() => setShowSlippageSettings(!showSlippageSettings)}
              className="p-1.5 hover:text-[#EAECEF]"
            >
              <Sliders size={17} />
            </button>
          </div>
        </div>

        {showSwapChart && (
          <div className="px-4 py-2">
            <div className="p-3 rounded-2xl bg-[#202630]">
              <CandlestickChart
                height={175}
                interval={activeInterval}
                onIntervalChange={setActiveInterval}
              />
            </div>
          </div>
        )}

        {showSlippageSettings && (
          <div className="px-4 py-2">
            <div className="p-3.5 rounded-2xl bg-[#202630] flex items-center justify-between">
              <span className="text-[12px] text-[#848E9C]">Max Slippage Tolerance</span>
              <div className="flex items-center gap-1.5">
                {['0.1', '0.5', '1.0'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSlippage(s)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                      slippage === s
                        ? 'bg-[#FCD535] text-[#181A20]'
                        : 'bg-[#181A20] text-[#848E9C]'
                    }`}
                  >
                    {s}%
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Swap Cards Container (Matches 00:57 - 01:00) */}
        <div className="px-4 pt-2 space-y-2 relative">
          {/* Sub-header: From [Icon] ... Use Exchange Balance [Toggle] */}
          <div className="flex items-center justify-between text-[12px] text-[#848E9C] px-1">
            <div className="flex items-center gap-1.5">
              <span>From</span>
              <CoinIcon asset={payAsset} size="xs" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <span>Use Exchange Balance</span>
              <input
                type="checkbox"
                checked={useExchangeBalance}
                onChange={(e) => setUseExchangeBalance(e.target.checked)}
                className="accent-[#F0B90B] w-4 h-4 rounded"
              />
            </label>
          </div>

          {/* FROM CARD */}
          <div className="p-4 rounded-2xl bg-[#202630] space-y-3">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  const list = ['USDT', 'BNB', 'ETH', 'SOL', 'USDC'];
                  const next = list[(list.indexOf(payAsset) + 1) % list.length];
                  if (next === receiveAsset) setReceiveAsset(payAsset);
                  setPayAsset(next);
                }}
                className="flex items-center gap-2.5 shrink-0"
              >
                <div className="relative">
                  <CoinIcon asset={payAsset} size="md" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#F0B90B] border border-[#202630]" />
                </div>
                <span className="text-[17px] font-bold text-[#EAECEF]">{payAsset}</span>
                <ChevronDown size={15} className="text-[#848E9C]" />
              </button>

              <div className="text-right flex-1 min-w-0">
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-transparent text-right text-[22px] font-bold text-[#EAECEF] placeholder-[#474D57] focus:outline-none tabular-nums"
                />
                <div className="text-[11px] text-[#848E9C] tabular-nums">
                  {numPay > 0
                    ? `≈ ${formatInrValue(numPay * payPrice * valuation.usdInrRate)}`
                    : '≈ ₹0'}
                </div>
              </div>
            </div>

            <div className="pt-2.5 border-t border-[#2B3139]/80 flex items-center justify-between text-[12px]">
              <button
                type="button"
                onClick={() => setAssetsSubScreen('my_wallets')}
                className="flex items-center gap-1 text-[#848E9C] hover:text-[#EAECEF]"
              >
                <span>
                  {useExchangeBalance
                    ? 'Exchange Spot Wallet'
                    : isWalletActive
                    ? activeWalletLabel
                    : 'My Wallet...19A3'}
                </span>
                <ChevronRight size={13} />
              </button>
              <div className="flex items-center gap-1.5 tabular-nums">
                <span className="text-[#EAECEF] font-semibold">
                  {!useExchangeBalance && payAsset === 'USDT' && displayedUsdtQty > 0
                    ? formatQuantity(displayedUsdtQty)
                    : formatQuantity(payBal)}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const maxAvail =
                      !useExchangeBalance && payAsset === 'USDT' && displayedUsdtQty > 0
                        ? displayedUsdtQty
                        : payBal;
                    if (maxAvail <= 0) {
                      showToast('Insufficient token balance');
                      return;
                    }
                    setPayAmount(String(maxAvail));
                  }}
                  className="text-[#F0B90B] font-bold hover:underline"
                >
                  Max
                </button>
              </div>
            </div>
          </div>

          {/* Center Swap Button */}
          <div className="flex items-center justify-between px-1 pt-1">
            <span className="text-[12px] text-[#848E9C]">To</span>
            <button
              type="button"
              onClick={() => {
                const temp = payAsset;
                setPayAsset(receiveAsset);
                setReceiveAsset(temp);
              }}
              className="w-8 h-8 rounded-full bg-[#2B3139] hover:bg-[#363D47] flex items-center justify-center text-[#EAECEF] -mt-5 z-10 mx-auto shadow-md"
            >
              <ArrowLeftRight size={14} className="rotate-90" />
            </button>
            <span className="w-6" />
          </div>

          {/* TO CARD */}
          <div className="p-4 rounded-2xl bg-[#202630] space-y-3">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  const list = ['BNB', 'USDT', 'ETH', 'SOL', 'USDC'];
                  const next = list[(list.indexOf(receiveAsset) + 1) % list.length];
                  if (next === payAsset) setPayAsset(receiveAsset);
                  setReceiveAsset(next);
                }}
                className="flex items-center gap-2.5 shrink-0"
              >
                <div className="relative">
                  <CoinIcon asset={receiveAsset} size="md" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#F0B90B] border border-[#202630]" />
                </div>
                <span className="text-[17px] font-bold text-[#EAECEF]">{receiveAsset}</span>
                <ChevronDown size={15} className="text-[#848E9C]" />
              </button>

              <div className="text-right flex-1 min-w-0">
                <div className="text-[20px] font-bold text-[#EAECEF] tabular-nums truncate">
                  {isFetchingQuote ? '...' : estimatedReceive || '--'}
                </div>
                <div className="text-[11px] text-[#848E9C]">--</div>
              </div>
            </div>

            <div className="pt-2.5 border-t border-[#2B3139]/80 flex items-center justify-between text-[12px]">
              <button
                type="button"
                onClick={() => setAssetsSubScreen('my_wallets')}
                className="flex items-center gap-1 text-[#848E9C] hover:text-[#EAECEF]"
              >
                <span>My Wallet...19A3</span>
                <ChevronRight size={13} />
              </button>
              <span className="text-[#EAECEF] font-semibold tabular-nums">0</span>
            </div>
          </div>
        </div>

        {/* Enter Amount / Swap Button (Matches 00:57 - 01:00) */}
        <div className="px-4 pt-4">
          <button
            type="button"
            onClick={handleExecuteWeb3Swap}
            className={`w-full h-12 rounded-xl font-bold text-[15px] transition-colors cursor-pointer ${
              numPay > 0
                ? 'bg-[#FCD535] text-[#181A20]'
                : 'bg-[#594D1F] text-[#9E9260]'
            }`}
          >
            {numPay > 0 ? `Swap ${payAsset} to ${receiveAsset}` : 'Enter Amount'}
          </button>
        </div>

        {/* Bottom Open Orders | Holdings (1) | Strategy Section */}
        <div className="mt-5 pt-2 flex-1 flex flex-col">
          <div className="flex items-center justify-between px-4 border-b border-[#2B3139] pb-2">
            <div className="flex items-center gap-5">
              {(['Open Orders', 'Holdings', 'Strategy'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSwapBottomTab(t)}
                  className={`text-[14px] font-semibold relative pb-1 ${
                    swapBottomTab === t ? 'text-[#EAECEF]' : 'text-[#848E9C]'
                  }`}
                >
                  {t === 'Holdings' && displayedUsdtQty > 0 ? 'Holdings (1)' : t}
                </button>
              ))}
            </div>
            <History
              size={16}
              className="text-[#848E9C] cursor-pointer hover:text-[#EAECEF]"
              onClick={() => setAssetsSubScreen('history')}
            />
          </div>

          <div className="px-4 py-2.5 flex items-center justify-between text-[12px] text-[#848E9C]">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyCurrentToken}
                onChange={(e) => setOnlyCurrentToken(e.target.checked)}
                className="rounded bg-[#202630]"
              />
              <span>Only show current token</span>
            </label>
            <div className="flex items-center gap-3">
              <RefreshCw size={13} className="cursor-pointer hover:text-[#EAECEF]" />
              <Sliders size={13} className="cursor-pointer hover:text-[#EAECEF]" />
            </div>
          </div>

          {swapBottomTab === 'Holdings' && displayedUsdtQty > 0 ? (
            <div
              onClick={() => setAssetsSubScreen('usdt_detail')}
              className="px-4 py-3 flex items-center justify-between hover:bg-[#202630]/50 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <CoinIcon asset="USDT" size="sm" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[14px] font-bold text-[#EAECEF]">USDT</span>
                  </div>
                  <div className="text-[11px] text-[#848E9C]">
                    BNB Smart Chain · ₹{valuation.inrPerUsdt.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="text-right tabular-nums">
                <div className="text-[14px] font-bold text-[#EAECEF]">
                  {formatQuantity(displayedUsdtQty)}
                </div>
                <div className="text-[11px] text-[#848E9C]">
                  {formatInrValue(displayedInrBalance)}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center px-4">
              <div className="w-12 h-12 rounded-2xl bg-[#202630]/60 flex items-center justify-center text-[#474D57] mb-2">
                <History size={22} />
              </div>
              <div className="text-[12px] text-[#848E9C]">No Orders</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // TAB 4: WALLET DISCOVER (Matches 00:52 of Reference)
  // =========================================================================
  if (walletTab === 'discover') {
    const filteredDapps = DISCOVER_DAPPS.filter((d) =>
      discoverSearch
        ? d.name.toLowerCase().includes(discoverSearch.toLowerCase()) ||
          d.category.toLowerCase().includes(discoverSearch.toLowerCase())
        : true
    );

    return (
      <div className="flex flex-col flex-1 bg-[#181A20] min-h-full pb-24 select-none">
        {renderSharedOverlays()}

        <div className="px-4 pt-2.5 pb-2">
          <div className="relative">
            <Search size={14} className="text-[#848E9C] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={discoverSearch}
              onChange={(e) => setDiscoverSearch(e.target.value)}
              placeholder="Search DApps or enter URL"
              className="w-full h-9 bg-[#202630] rounded-xl pl-9 pr-4 text-[12px] text-[#EAECEF] placeholder-[#848E9C] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-5 px-4 border-b border-[#2B3139] pb-2 overflow-x-auto no-scrollbar">
          {(['Featured', 'Earn', 'Booster', 'Airdrops', 'DApps'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setDiscoverSubTab(tab)}
              className={`text-[14px] font-semibold whitespace-nowrap relative pb-1 ${
                discoverSubTab === tab ? 'text-[#EAECEF]' : 'text-[#848E9C]'
              }`}
            >
              {tab}
              {discoverSubTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#F0B90B] rounded-full" />
              )}
            </button>
          ))}
        </div>

        <div className="p-4 space-y-5">
          <div className="p-4 rounded-2xl bg-[#202630] flex items-center justify-between">
            <div className="space-y-1 pr-3">
              <span className="px-2 py-0.5 rounded bg-[#F0B90B]/20 text-[#F0B90B] text-[10px] font-bold">
                SEASON 3
              </span>
              <h3 className="text-[14px] font-bold text-[#EAECEF] leading-snug">
                Grab a share of $2M rewards in TRON Carnival Season 3
              </h3>
              <button
                type="button"
                onClick={() => showToast('Joined TRON Carnival Season 3 Yield Pool')}
                className="text-[12px] font-semibold text-[#F0B90B] pt-1 inline-flex items-center gap-1"
              >
                Join Now <ChevronRight size={13} />
              </button>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-[#181A20] flex items-center justify-center text-[#F0B90B] shrink-0">
              <Sparkles size={20} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[15px] font-bold text-[#EAECEF]">Simple Yield</span>
              <span className="text-[11px] text-[#848E9C] flex items-center gap-0.5 tabular-nums">
                TVL $1,683,310,415 <ChevronRight size={13} />
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div
                onClick={() => setAssetsSubScreen('usdt_detail')}
                className="p-3.5 rounded-2xl bg-[#202630] hover:bg-[#2B3139] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <CoinIcon asset="USDC" size="sm" />
                  <span className="text-[14px] font-bold text-[#EAECEF]">USDC</span>
                </div>
                <div className="text-[20px] font-bold text-[#0ECB81] tabular-nums">3.55%</div>
                <div className="text-[11px] text-[#848E9C]">APR</div>
              </div>

              <div
                onClick={() => setAssetsSubScreen('usdt_detail')}
                className="p-3.5 rounded-2xl bg-[#202630] hover:bg-[#2B3139] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <CoinIcon asset="USDT" size="sm" />
                  <span className="text-[14px] font-bold text-[#EAECEF]">USDT</span>
                </div>
                <div className="text-[20px] font-bold text-[#0ECB81] tabular-nums">10.98%</div>
                <div className="text-[11px] text-[#848E9C]">APY</div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[15px] font-bold text-[#EAECEF]">Popular DApps</span>
              <span className="text-[11px] text-[#848E9C]">{filteredDapps.length} Protocols</span>
            </div>
            <div className="space-y-2.5">
              {filteredDapps.map((dapp) => (
                <a
                  key={dapp.name}
                  href={dapp.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3.5 rounded-2xl bg-[#202630] hover:bg-[#2B3139] flex items-center justify-between transition-colors block"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-[15px] text-[#181A20] shrink-0"
                      style={{ backgroundColor: dapp.color }}
                    >
                      {dapp.badge}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-bold text-[#EAECEF] truncate">
                          {dapp.name}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-[#181A20] text-[10px] text-[#848E9C]">
                          {dapp.category}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#848E9C] truncate mt-0.5">{dapp.desc}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 pl-2">
                    <div className="text-[12px] font-bold text-[#0ECB81]">{dapp.apy}</div>
                    <div className="text-[10px] text-[#848E9C]">TVL {dapp.tvl}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // TAB 5: WALLET ASSETS (Matches 00:21 - 00:23, 00:40 - 00:41, 01:02 - 01:33)
  // =========================================================================
  return (
    <div className="flex flex-col flex-1 bg-[#181A20] min-h-full pb-24 select-none">
      {renderSharedOverlays()}

      {/* A. Wallet Selector Row: [Rocket] My Wallet > [Copy] ... [Keyless Lightning Check Badge] (Matches frame_022.jpg) */}
      <div className="px-4 pt-2.5 pb-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAssetsSubScreen('my_wallets')}
            className="flex items-center gap-1.5 text-[13px] font-medium text-[#EAECEF] hover:text-[#F0B90B] transition-colors cursor-pointer"
          >
            <KeylessWalletAvatar size="sm" />
            <span>{activeWalletLabel}</span>
            <ChevronRight size={14} className="text-[#848E9C]" />
          </button>

          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(activeReceiveAddress);
              showToast('Wallet address copied to clipboard');
            }}
            className="text-[#848E9C] hover:text-[#EAECEF] p-1"
            title="Copy Address"
          >
            <Copy size={13} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAssetsSubScreen('my_wallets')}
            className="cursor-pointer"
            title="Keyless MPC Security & Auto Sign"
          >
            <KeylessCheckBadge />
          </button>
        </div>
      </div>

      {/* B. Portfolio Summary: Large INR Balance Only (Matches 00:21 - 00:23, 01:02 - 01:08) */}
      <div className="px-4 py-1">
        <div className="flex items-center gap-2">
          <span className="text-[30px] leading-[36px] font-bold text-[#EAECEF] tabular-nums tracking-[-0.02em]">
            {hideWeb3Balance ? '******' : formatInrValue(displayedInrBalance)}
          </span>
        </div>
      </div>

      {/* C. Four Action Buttons: Send | Receive | History | Approvals (2-Tone White + Yellow SVGs matching frame_022.jpg) */}
      <div className="grid grid-cols-4 gap-3 px-4 py-3">
        {[
          {
            label: 'Send',
            svg: (
              <svg viewBox="0 0 24 24" className="w-[22px] h-[22px]" fill="none">
                <path
                  d="M12 16V5M12 5L7.5 9.5M12 5L16.5 9.5"
                  stroke="#EAECEF"
                  strokeWidth="2.1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M6.5 19h11" stroke="#F0B90B" strokeWidth="2.1" strokeLinecap="round" />
              </svg>
            ),
            onClick: () => setAssetsSubScreen('send'),
          },
          {
            label: 'Receive',
            svg: (
              <svg viewBox="0 0 24 24" className="w-[22px] h-[22px]" fill="none">
                <path
                  d="M12 5v11M12 16l-4.5-4.5M12 16l4.5-4.5"
                  stroke="#EAECEF"
                  strokeWidth="2.1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M6.5 19h11" stroke="#F0B90B" strokeWidth="2.1" strokeLinecap="round" />
              </svg>
            ),
            onClick: () => setAssetsSubScreen('receive'),
          },
          {
            label: 'History',
            svg: (
              <svg viewBox="0 0 24 24" className="w-[22px] h-[22px]" fill="none">
                <path
                  d="M7 4.5h8.5a1.5 1.5 0 0 1 1.5 1.5v5.5M7 4.5a1.5 1.5 0 0 0-1.5 1.5v12A1.5 1.5 0 0 0 7 19.5h5"
                  stroke="#EAECEF"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <line
                  x1="8.5"
                  y1="8.5"
                  x2="13.5"
                  y2="8.5"
                  stroke="#EAECEF"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <line
                  x1="8.5"
                  y1="12"
                  x2="11.5"
                  y2="12"
                  stroke="#EAECEF"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <circle cx="16.5" cy="16.5" r="3.6" fill="#F0B90B" />
                <path
                  d="M16.5 14.8v1.9l1.2.8"
                  stroke="#181A20"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            ),
            onClick: () => setAssetsSubScreen('history'),
          },
          {
            label: 'Approvals',
            svg: (
              <svg viewBox="0 0 24 24" className="w-[22px] h-[22px]" fill="none">
                <path
                  d="M12 3.8l6.5 2.6v5.2c0 4.5-2.8 7.6-6.5 9-3.7-1.4-6.5-4.5-6.5-9V6.4L12 3.8z"
                  stroke="#EAECEF"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="12" r="3.4" fill="#F0B90B" />
                <path
                  d="M10.5 12l1 1 2.1-2.1"
                  stroke="#181A20"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ),
            onClick: () => setAssetsSubScreen('approvals'),
          },
        ].map((btn) => (
          <button
            key={btn.label}
            type="button"
            onClick={btn.onClick}
            className="flex flex-col items-center gap-1.5 group cursor-pointer"
          >
            <div className="w-full h-[52px] rounded-2xl bg-[#202630] hover:bg-[#2B3139] flex items-center justify-center text-[#EAECEF] relative transition-colors">
              {btn.svg}
            </div>
            <span className="text-[12px] text-[#EAECEF] font-medium">{btn.label}</span>
          </button>
        ))}
      </div>

      {/* D. Rewards Banner: Hold tokens to earn rewards / Up to 5.00% APR (Matches frame_022.jpg) */}
      <div className="px-4 pb-3">
        <div
          onClick={() => {
            setWalletTab('discover');
            setDiscoverSubTab('Earn');
          }}
          className="p-3.5 rounded-2xl bg-[#202630] hover:bg-[#2B3139]/80 flex items-center gap-3.5 cursor-pointer transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-[#181A20]/70 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 28 28" className="w-7 h-7" fill="none">
              <circle cx="15" cy="9.5" r="5" fill="#F0B90B" />
              <path
                d="M15 7.2v4.6M13.3 9.5h3.4"
                stroke="#181A20"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <path
                d="M5.5 18.5c2.2 0 3.8 2.2 6.8 2.2h6.2c1.4 0 2.4-.9 2.4-2.1 0-1.1-.8-1.9-2-1.9h-4.5"
                stroke="#EAECEF"
                strokeWidth="2.1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <div className="text-[13px] font-medium text-[#EAECEF]">
              Hold tokens to earn rewards
            </div>
            <div className="text-[14px] text-[#EAECEF] font-semibold mt-0.5">
              Up to <span className="font-bold text-[#0ECB81]">5.00% APR</span>
            </div>
          </div>
        </div>
      </div>

      {/* E. Category Navigation: Tokens | Stocks | DeFi | NFTs | Perps ... [Search] */}
      <div className="px-4 flex items-center justify-between border-b border-[#2B3139]/70">
        <div className="flex items-center gap-5 overflow-x-auto no-scrollbar">
          {(['Tokens', 'Stocks', 'DeFi', 'NFTs', 'Perps'] as const).map((cat) => {
            const active = assetsCategoryTab === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setAssetsCategoryTab(cat)}
                className={`py-2.5 text-[15px] whitespace-nowrap relative transition-colors cursor-pointer ${
                  active ? 'font-bold text-[#EAECEF]' : 'font-medium text-[#848E9C]'
                }`}
              >
                {cat}
                {active && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-[2.5px] bg-[#F0B90B] rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setShowAssetsSearchInput(!showAssetsSearchInput)}
          className="p-1.5 text-[#848E9C] hover:text-[#EAECEF] shrink-0"
          title="Search Tokens"
        >
          <Search size={16} />
        </button>
      </div>

      {showAssetsSearchInput && (
        <div className="px-4 pt-2.5">
          <input
            type="text"
            value={assetsTokenSearch}
            onChange={(e) => setAssetsTokenSearch(e.target.value)}
            placeholder="Filter tokens by symbol or network..."
            className="w-full h-9 rounded-xl bg-[#202630] px-3.5 text-[12px] text-[#EAECEF] placeholder-[#848E9C] focus:outline-none"
          />
        </div>
      )}

      {/* F. Total Assets Summary Row (Matches 00:21 - 00:23, 01:02 - 01:08) */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <div>
          <div className="text-[12px] text-[#848E9C] flex items-center gap-1.5">
            <span>Total Assets</span>
          </div>
          <div className="text-[15px] font-bold text-[#EAECEF] tabular-nums mt-0.5">
            {hideWeb3Balance
              ? '******'
              : assetsCategoryTab === 'Tokens'
              ? formatInrValue(displayedInrBalance)
              : '₹0.00'}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setAssetsSubScreen('settings')}
          className="p-1.5 text-[#848E9C] hover:text-[#EAECEF]"
          title="Asset Filter & Settings"
        >
          <Sliders size={16} />
        </button>
      </div>

      {/* G. Token List & H. Expandable Low Value Section */}
      {assetsCategoryTab === 'Tokens' ? (
        <div className="px-4 space-y-1">
          {/* Primary USDT Token Row -> Opens USDT Token Details */}
          {(!assetsTokenSearch || 'usdt tether'.includes(assetsTokenSearch.toLowerCase())) &&
            displayedUsdtQty > 0 && (
              <div
                onClick={() => setAssetsSubScreen('usdt_detail')}
                className="py-3 flex items-center justify-between hover:bg-[#202630]/50 rounded-xl px-1 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <CoinIcon asset="USDT" size="lg" />
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#F0B90B] border-2 border-[#181A20] flex items-center justify-center text-[7px] font-extrabold text-[#181A20]">
                      B
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[16px] font-bold text-[#EAECEF]">USDT</span>
                      <span className="px-1.5 py-0.5 rounded bg-[#2D2618] text-[#F0B90B] text-[10px] font-semibold">
                        Up to 10.98% APY
                      </span>
                    </div>
                    <div className="text-[12px] text-[#848E9C] tabular-nums mt-0.5 flex items-center gap-1.5">
                      <span>₹{valuation.inrPerUsdt.toFixed(2)}</span>
                      <span
                        className={
                          valuation.usdt24hChangePct >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                        }
                      >
                        {valuation.usdt24hChangePct >= 0 ? '+' : ''}
                        {valuation.usdt24hChangePct.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right tabular-nums">
                  <div className="text-[16px] font-bold text-[#EAECEF]">
                    {hideWeb3Balance ? '******' : formatQuantity(displayedUsdtQty)}
                  </div>
                  <div className="text-[12px] text-[#848E9C] mt-0.5">
                    {hideWeb3Balance ? '******' : formatInrValue(displayedInrBalance)}
                  </div>
                </div>
              </div>
            )}

          {/* H. Expandable Low Value (5) Section (Matches 01:04 - 01:09, 01:18 - 01:23) */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowLowValueAssets(!showLowValueAssets)}
              className="w-full py-2.5 flex items-center justify-between text-[13px] text-[#848E9C] hover:text-[#EAECEF] cursor-pointer"
            >
              <span>Low value ({REFERENCE_LOW_VALUE_ASSETS.length})</span>
              <ChevronDown
                size={16}
                className={`transition-transform duration-150 ${
                  showLowValueAssets ? 'rotate-180' : ''
                }`}
              />
            </button>

            {showLowValueAssets && (
              <div className="space-y-1 pt-1">
                {REFERENCE_LOW_VALUE_ASSETS.filter((item) =>
                  assetsTokenSearch
                    ? item.symbol.toLowerCase().includes(assetsTokenSearch.toLowerCase()) ||
                      item.name.toLowerCase().includes(assetsTokenSearch.toLowerCase())
                    : true
                ).map((item) => {
                  const isUp = item.change24h >= 0;
                  return (
                    <div
                      key={item.key}
                      onClick={() => {
                        setSendTokenSymbol(item.symbol);
                        setAssetsSubScreen('receive');
                      }}
                      className="py-3 flex items-center justify-between hover:bg-[#202630]/40 rounded-xl px-1 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <CoinIcon asset={item.symbol} size="lg" />
                          {!item.isNative && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#F0B90B] border-2 border-[#181A20] flex items-center justify-center text-[7px] font-extrabold text-[#181A20]">
                              B
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[15px] font-bold text-[#EAECEF]">
                              {item.symbol}
                            </span>
                            {item.isNative && (
                              <span className="px-1.5 py-0.5 rounded bg-[#142922] text-[#0ECB81] text-[10px] font-semibold">
                                Native
                              </span>
                            )}
                            <span className="px-1.5 py-0.5 rounded bg-[#2D2618] text-[#F0B90B] text-[10px] font-semibold">
                              {item.apyTag}
                            </span>
                          </div>
                          <div className="text-[12px] text-[#848E9C] tabular-nums mt-0.5 flex items-center gap-1.5">
                            <span>{item.priceInr}</span>
                            <span className={isUp ? 'text-[#0ECB81]' : 'text-[#F6465D]'}>
                              {isUp ? '+' : ''}
                              {item.change24h.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right tabular-nums">
                        <div className="text-[15px] font-bold text-[#EAECEF]">0</div>
                        <div className="text-[12px] text-[#848E9C] mt-0.5">{item.valueInr}</div>
                      </div>
                    </div>
                  );
                })}

                <div className="py-4 text-center text-[12px] text-[#848E9C]">
                  Couldn&apos;t find your token?{' '}
                  <button
                    type="button"
                    onClick={() => setAssetsSubScreen('networks')}
                    className="text-[#F0B90B] font-semibold hover:underline"
                  >
                    Add Tokens
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="py-12 px-4 text-center space-y-3">
          <div className="text-[14px] font-semibold text-[#EAECEF]">
            No {assetsCategoryTab} Positions Found
          </div>
          <p className="text-[12px] text-[#848E9C] max-w-xs mx-auto">
            {assetsCategoryTab === 'Stocks'
              ? 'Explore tokenized on-chain equities and stock indices in Markets.'
              : assetsCategoryTab === 'DeFi'
              ? 'Supply USDT, USDC, or BNB to Venus and Lista DAO vaults to earn yield.'
              : assetsCategoryTab === 'NFTs'
              ? 'Collectibles minted or received on BNB Chain, Ethereum, and Solana appear here.'
              : 'Trade on-chain perpetual futures with up to 100x leverage.'}
          </p>
          <button
            type="button"
            onClick={() =>
              setWalletTab(
                assetsCategoryTab === 'DeFi'
                  ? 'discover'
                  : assetsCategoryTab === 'Perps'
                  ? 'trade'
                  : 'markets'
              )
            }
            className="h-9 px-4 rounded-xl bg-[#202630] hover:bg-[#2B3139] text-[#F0B90B] text-[12px] font-semibold transition-colors"
          >
            Explore {assetsCategoryTab} →
          </button>
        </div>
      )}
    </div>
  );
};
