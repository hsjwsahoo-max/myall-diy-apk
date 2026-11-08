import React, { useState, useMemo } from 'react';
import {
  Eye,
  EyeOff,
  Search,
  ChevronRight,
  ChevronDown,
  ArrowLeftRight,
  X,
  Check,
  TrendingUp,
  History,
  RefreshCw,
  BarChart2,
  SlidersHorizontal,
} from 'lucide-react';
import { EARN_PRODUCTS, useExchange, WALLET_ACCOUNTS } from '../context/ExchangeContext';
import { CoinIcon } from '../components/CoinIcon';
import { ActivityTimelineView } from '../components/DepositWithdrawModals';
import { CandlestickChart } from '../components/CandlestickChart';
import { EarnProduct } from '../types/exchange';

const SUPPORTED_CURRENCIES = [
  { code: 'USDT', symbol: '', rate: 1, suffix: ' USDT' },
  { code: 'USD', symbol: '$', rate: 1, suffix: ' USD' },
  { code: 'INR', symbol: '₹', rate: 86.45, suffix: ' INR' },
  { code: 'EUR', symbol: '€', rate: 0.92, suffix: ' EUR' },
  { code: 'AED', symbol: 'AED ', rate: 3.67, suffix: ' AED' },
  { code: 'GBP', symbol: '£', rate: 0.79, suffix: ' GBP' },
] as const;

type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number]['code'];

const ASSET_NAMES: Record<string, string> = {
  USDT: 'TetherUS',
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  SOL: 'Solana',
  BNB: 'BNB',
  XRP: 'XRP',
  USDC: 'USD Coin',
  TRX: 'TRON',
  ADA: 'Cardano',
  DOGE: 'Dogecoin',
  AVAX: 'Avalanche',
  LINK: 'Chainlink',
  TON: 'Toncoin',
  SUI: 'Sui',
  DOT: 'Polkadot',
};

const ASSET_EARN_APR: Record<string, string> = {
  USDT: '11.82%',
  USDC: '9.59%',
  BNB: '14.25%',
  SOL: '16.40%',
  ETH: '4.85%',
  XRP: '55.11%',
  TRX: '22.25%',
};

const DEFAULT_PORTFOLIO_COINS = ['USDT', 'XRP', 'BTC', 'ETH', 'BNB', 'SOL', 'USDC', 'TRX'];

const NETWORK_FEES: Record<
  string,
  { network: string; name: string; depositFee: string; withdrawFee: string; minWithdraw: string; arrival: string }[]
> = {
  USDT: [
    { network: 'TRX', name: 'Tron (TRC20)', depositFee: 'Free', withdrawFee: '1.00 USDT', minWithdraw: '10 USDT', arrival: '~1 min' },
    { network: 'BSC', name: 'BNB Smart Chain (BEP20)', depositFee: 'Free', withdrawFee: '0.19 USDT', minWithdraw: '10 USDT', arrival: '~2 mins' },
    { network: 'ETH', name: 'Ethereum (ERC20)', depositFee: 'Free', withdrawFee: '3.50 USDT', minWithdraw: '20 USDT', arrival: '~4 mins' },
    { network: 'SOL', name: 'Solana', depositFee: 'Free', withdrawFee: '0.80 USDT', minWithdraw: '10 USDT', arrival: '~1 min' },
  ],
  BTC: [
    { network: 'BTC', name: 'Bitcoin', depositFee: 'Free', withdrawFee: '0.00005 BTC', minWithdraw: '0.0002 BTC', arrival: '~15 mins' },
    { network: 'BSC', name: 'BNB Smart Chain (BEP20)', depositFee: 'Free', withdrawFee: '0.000003 BTC', minWithdraw: '0.0001 BTC', arrival: '~2 mins' },
    { network: 'LIGHTNING', name: 'BTC Lightning Network', depositFee: 'Free', withdrawFee: '0.000001 BTC', minWithdraw: '0.00002 BTC', arrival: 'Instant' },
  ],
  ETH: [
    { network: 'ETH', name: 'Ethereum (ERC20)', depositFee: 'Free', withdrawFee: '0.0006 ETH', minWithdraw: '0.005 ETH', arrival: '~3 mins' },
    { network: 'ARBITRUM', name: 'Arbitrum One', depositFee: 'Free', withdrawFee: '0.00008 ETH', minWithdraw: '0.001 ETH', arrival: '~1 min' },
    { network: 'BASE', name: 'Base Mainnet', depositFee: 'Free', withdrawFee: '0.00005 ETH', minWithdraw: '0.001 ETH', arrival: '~1 min' },
  ],
};

export const AssetsScreen: React.FC = () => {
  const {
    wallets,
    transactions,
    futuresPositions,
    earnSubscriptions,
    tickers,
    settings,
    updateSettings,
    assetsSubTab,
    setAssetsSubTab,
    setExchangeTab,
    setActiveSymbol,
    activeInterval,
    setActiveInterval,
    getTotalPortfolioUsdt,
    getAccountValueUsdt,
    getTotalUsdtSummary,
    getAssetPriceUsdt,
    openDepositModal,
    openWithdrawModal,
    openTransferModal,
    setDepositMethodSheetOpen,
    subscribeEarn,
    redeemEarn,
    closeFuturesPosition,
    showToast,
    accountMode,
    switchAccountVerificationMode,
    syncReadOnlyExchangeApi,
    resetDemoLedger,
  } = useExchange();

  const [overviewListTab, setOverviewListTab] = useState<'Crypto' | 'Account'>('Crypto');
  const [searchQuery, setSearchQuery] = useState('');
  const [hideSmall, setHideSmall] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('USDT');
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
  const [portfolioTimeframe, setPortfolioTimeframe] = useState<'1D' | '7D' | '1M' | '6M' | '1Y'>('1D');
  const [showPortfolioChart, setShowPortfolioChart] = useState(true);
  const [showLiveCandles, setShowLiveCandles] = useState(false);
  const [showLedgerSettings, setShowLedgerSettings] = useState(false);

  const [earnModalProduct, setEarnModalProduct] = useState<EarnProduct | null>(null);
  const [earnAmount, setEarnAmount] = useState('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isSyncingExchange, setIsSyncingExchange] = useState(false);
  const [selectedAssetDetail, setSelectedAssetDetail] = useState<string | null>(null);
  const [assetDetailTab, setAssetDetailTab] = useState<'market' | 'networks' | 'history'>('market');

  const hideBalance = settings.hideBalances;
  const setHideBalance = (val: boolean) => updateSettings({ hideBalances: val });

  const totalEquity = getTotalPortfolioUsdt();
  const spotEquity = getAccountValueUsdt('spot');
  const fundingEquity = getAccountValueUsdt('funding');
  const earnEquity = getAccountValueUsdt('earn');
  const futuresEquity = getAccountValueUsdt('usdm_futures') + getAccountValueUsdt('coinm_futures');
  const usdtSummary = getTotalUsdtSummary();

  const futuresUnrealizedPnl = useMemo(() => {
    return futuresPositions.reduce((acc, pos) => {
      const mark = tickers[pos.symbol]?.lastPrice || pos.entryPrice;
      const diff = pos.side === 'LONG' ? mark - pos.entryPrice : pos.entryPrice - mark;
      return acc + diff * pos.sizeAsset;
    }, 0);
  }, [futuresPositions, tickers]);

  const currencyMeta = useMemo(
    () => SUPPORTED_CURRENCIES.find((c) => c.code === selectedCurrency) || SUPPORTED_CURRENCIES[0],
    [selectedCurrency]
  );

  const formatConverted = (usdtAmount: number, decimals = 2) => {
    if (hideBalance) return '******';
    const val = usdtAmount * currencyMeta.rate;
    return val.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  const getPriceChangePercent = (asset: string): number => {
    if (asset === 'USDT' || asset === 'USDC') return 0.01;
    const t = tickers[`${asset}USDT`];
    return t ? t.priceChangePercent : 0;
  };

  // Build unified crypto holdings list (Overview > Crypto, Spot, Funding)
  const cryptoAssetRows = useMemo(() => {
    const allCoins = new Set<string>([
      ...DEFAULT_PORTFOLIO_COINS,
      ...Object.keys(wallets.spot || {}),
      ...Object.keys(wallets.funding || {}),
      ...Object.keys(wallets.earn || {}),
    ]);

    const rows = Array.from(allCoins).map((coin) => {
      const spotItem = wallets.spot?.[coin] || { available: 0, locked: 0 };
      const fundingItem = wallets.funding?.[coin] || { available: 0, locked: 0 };
      const earnItem = wallets.earn?.[coin] || { available: 0, locked: 0 };
      const usdmItem = wallets.usdm_futures?.[coin] || { available: 0, locked: 0 };

      const availableCoin =
        assetsSubTab === 'spot'
          ? spotItem.available
          : assetsSubTab === 'funding'
          ? fundingItem.available
          : spotItem.available + fundingItem.available + usdmItem.available;

      const lockedCoin =
        assetsSubTab === 'spot'
          ? spotItem.locked
          : assetsSubTab === 'funding'
          ? fundingItem.locked
          : spotItem.locked + fundingItem.locked + earnItem.available + earnItem.locked + usdmItem.locked;

      const totalCoin = availableCoin + lockedCoin;
      const price = getAssetPriceUsdt(coin);
      const usdVal = totalCoin * price;
      const changePct = getPriceChangePercent(coin);
      const apr = ASSET_EARN_APR[coin];

      return {
        coin,
        name: ASSET_NAMES[coin] || coin,
        total: totalCoin,
        available: availableCoin,
        locked: lockedCoin,
        price,
        usdValue: usdVal,
        changePct,
        apr,
      };
    });

    return rows
      .filter((r) => {
        if (
          searchQuery &&
          !r.coin.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !r.name.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }
        if (hideSmall && r.usdValue < 1) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (b.usdValue !== a.usdValue) return b.usdValue - a.usdValue;
        const idxA = DEFAULT_PORTFOLIO_COINS.indexOf(a.coin);
        const idxB = DEFAULT_PORTFOLIO_COINS.indexOf(b.coin);
        return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
      });
  }, [wallets, tickers, assetsSubTab, searchQuery, hideSmall, getAssetPriceUsdt]);

  // Calculate 24h PnL based on actual holdings & live 24h ticker changes
  const portfolioPnl = useMemo(() => {
    let weightedChangeUsd = 0;
    cryptoAssetRows.forEach((r) => {
      if (r.usdValue > 0 && r.coin !== 'USDT' && r.coin !== 'USDC') {
        weightedChangeUsd += r.usdValue * (r.changePct / 100);
      }
    });
    const total = totalEquity > 0 ? totalEquity : 0;
    const pct = total > 0 ? (weightedChangeUsd / total) * 100 : 0;
    return { usd: weightedChangeUsd, pct };
  }, [cryptoAssetRows, totalEquity]);

  // Smooth SVG trend curve matching Binance Assets Overview (00:30)
  const chartPoints = useMemo(() => {
    const tfCurves: Record<typeof portfolioTimeframe, string> = {
      '1D': 'M 0 38 C 45 38, 70 36, 110 34 C 150 32, 185 20, 225 22 C 260 24, 290 12, 340 8',
      '7D': 'M 0 42 C 50 38, 95 28, 140 31 C 185 34, 230 16, 275 14 C 305 13, 325 9, 340 6',
      '1M': 'M 0 44 C 60 40, 100 35, 150 26 C 200 18, 245 22, 290 12 C 315 8, 330 6, 340 5',
      '6M': 'M 0 45 C 70 42, 120 30, 175 24 C 220 19, 265 14, 340 6',
      '1Y': 'M 0 46 C 85 44, 145 32, 205 22 C 260 14, 300 9, 340 4',
    };
    return tfCurves[portfolioTimeframe];
  }, [portfolioTimeframe]);

  // Recent activity items for the Overview status rows (matching 00:30 Withdraw / P2P Buy pills)
  const recentOverviewEvents = useMemo(() => {
    return transactions.slice(0, 2).map((tx) => {
      const d = new Date(tx.timestamp);
      const dateStr = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(
        d.getHours()
      ).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      const labelMap: Record<string, string> = {
        deposit: 'Deposit',
        withdraw: 'Withdraw',
        transfer: 'Transfer',
        p2p_buy: 'P2P Buy',
        p2p_sell: 'P2P Sell',
        convert: 'Convert',
        spot_buy: 'Spot Buy',
        spot_sell: 'Spot Sell',
        earn_subscribe: 'Simple Earn',
      };
      return {
        id: tx.id,
        label: labelMap[tx.type] || 'Transaction',
        detail: `${tx.amount} ${tx.asset}`,
        time: dateStr,
        status: tx.status,
      };
    });
  }, [transactions]);

  const handleSubscribeSubmit = () => {
    if (!earnModalProduct) return;
    const num = parseFloat(earnAmount);
    if (isNaN(num) || num <= 0) {
      showToast('Enter a valid subscription amount');
      return;
    }
    const res = subscribeEarn(earnModalProduct.id, num);
    showToast(res.message);
    if (res.ok) {
      setEarnModalProduct(null);
      setEarnAmount('');
    }
  };

  const renderBalanceBlock = (
    title: string,
    usdtValue: number,
    options?: { showAvailableLocked?: boolean; availableUsd?: number; lockedUsd?: number }
  ) => {
    const isPositivePnl = portfolioPnl.usd >= 0;
    return (
      <div className="px-4 pt-3 pb-2">
        {/* Est. Total Value header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] text-[#848E9C] font-medium">{title}</span>
            <button
              onClick={() => setHideBalance(!hideBalance)}
              className="text-[#848E9C] hover:text-[#EAECEF] p-0.5 rounded transition-colors"
              aria-label="Toggle balance visibility"
            >
              {hideBalance ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowPortfolioChart(!showPortfolioChart)}
              className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-colors ${
                showPortfolioChart
                  ? 'bg-[#202630] border-[#F0B90B]/40 text-[#F0B90B]'
                  : 'bg-[#202630] border-[#2B3139] text-[#848E9C] hover:text-[#EAECEF]'
              }`}
              title="Toggle Portfolio Trend Line"
            >
              <TrendingUp size={14} />
            </button>
            <button
              onClick={() => setShowLiveCandles(!showLiveCandles)}
              className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-colors ${
                showLiveCandles
                  ? 'bg-[#202630] border-[#F0B90B]/40 text-[#F0B90B]'
                  : 'bg-[#202630] border-[#2B3139] text-[#848E9C] hover:text-[#EAECEF]'
              }`}
              title="Toggle Live Market Chart"
            >
              <BarChart2 size={14} />
            </button>
            <button
              onClick={() => setShowLedgerSettings(!showLedgerSettings)}
              className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-colors ${
                showLedgerSettings
                  ? 'bg-[#202630] border-[#F0B90B]/40 text-[#F0B90B]'
                  : 'bg-[#202630] border-[#2B3139] text-[#848E9C] hover:text-[#EAECEF]'
              }`}
              title="Account Ledger & API Sync Settings"
            >
              <SlidersHorizontal size={13} />
            </button>
          </div>
        </div>

        {/* Main Balance + Currency Dropdown */}
        <div className="flex items-baseline gap-2 mt-1 relative">
          <span className="text-[30px] leading-[36px] font-bold text-[#EAECEF] tabular-nums tracking-tight">
            {hideBalance ? '******' : `${currencyMeta.symbol}${formatConverted(usdtValue)}`}
          </span>
          <div className="relative">
            <button
              onClick={() => setShowCurrencyMenu(!showCurrencyMenu)}
              className="flex items-center gap-0.5 text-[13px] font-semibold text-[#EAECEF] hover:text-[#F0B90B] transition-colors"
            >
              <span>{selectedCurrency}</span>
              <ChevronDown size={14} className="text-[#848E9C]" />
            </button>
            {showCurrencyMenu && (
              <div className="absolute left-0 top-6 z-40 w-28 bg-[#202630] border border-[#2B3139] rounded-xl shadow-2xl py-1 overflow-hidden">
                {SUPPORTED_CURRENCIES.map((curr) => (
                  <button
                    key={curr.code}
                    onClick={() => {
                      setSelectedCurrency(curr.code);
                      setShowCurrencyMenu(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left text-[12px] font-medium flex items-center justify-between ${
                      selectedCurrency === curr.code
                        ? 'text-[#F0B90B] bg-[#F0B90B]/10 font-bold'
                        : 'text-[#EAECEF] hover:bg-[#2B3139]'
                    }`}
                  >
                    <span>{curr.code}</span>
                    {selectedCurrency === curr.code && <Check size={12} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Today's PNL line */}
        <div className="flex items-center gap-1.5 mt-1 text-[12px]">
          <span className="text-[#848E9C] border-b border-dotted border-[#848E9C]/60">Today&apos;s PNL</span>
          <span
            className={`font-semibold tabular-nums ${
              hideBalance
                ? 'text-[#848E9C]'
                : isPositivePnl
                ? 'text-[#2EBD85]'
                : 'text-[#F6465D]'
            }`}
          >
            {hideBalance
              ? '******'
              : `${isPositivePnl ? '+' : ''}${currencyMeta.symbol}${formatConverted(portfolioPnl.usd)} (${
                  isPositivePnl ? '+' : ''
                }${portfolioPnl.pct.toFixed(2)}%)`}
          </span>
          <ChevronRight size={12} className="text-[#848E9C]" />
        </div>

        {/* Available & Locked Breakdown Pill Bar */}
        {options?.showAvailableLocked !== false && (
          <div className="grid grid-cols-2 gap-3 mt-3 pt-2.5 border-t border-[#2B3139]/60">
            <div>
              <div className="text-[11px] text-[#848E9C]">Available Balance</div>
              <div className="text-[13px] font-semibold text-[#EAECEF] tabular-nums mt-0.5">
                {hideBalance
                  ? '******'
                  : `${currencyMeta.symbol}${formatConverted(options?.availableUsd ?? usdtSummary.available)} ${selectedCurrency}`}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-[#848E9C]">Locked / In Order &amp; Earn</div>
              <div className="text-[13px] font-semibold text-[#EAECEF] tabular-nums mt-0.5">
                {hideBalance
                  ? '******'
                  : `${currencyMeta.symbol}${formatConverted(options?.lockedUsd ?? usdtSummary.locked)} ${selectedCurrency}`}
              </div>
            </div>
          </div>
        )}

        {/* Collapsible Account Verification & Ledger Mode Controls */}
        {showLedgerSettings && (
          <div className="mt-3 p-3 rounded-xl bg-[#202630] border border-[#2B3139] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    accountMode === 'verified_statement' ? 'bg-[#2EBD85]' : 'bg-[#F0B90B]'
                  }`}
                />
                <span className="text-[11px] font-semibold text-[#EAECEF]">
                  Account Ledger &amp; Verification Mode
                </span>
              </div>
              <button
                disabled={isSyncingExchange}
                onClick={async () => {
                  setIsSyncingExchange(true);
                  const res = await syncReadOnlyExchangeApi();
                  setIsSyncingExchange(false);
                  showToast(res.message);
                }}
                className="text-[11px] font-semibold text-[#F0B90B] hover:underline flex items-center gap-1"
              >
                <RefreshCw size={11} className={isSyncingExchange ? 'animate-spin' : ''} /> Sync Read-Only API
              </button>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => switchAccountVerificationMode('verified_statement', 16845)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                  accountMode === 'verified_statement' && totalEquity > 2000
                    ? 'bg-[#F0B90B] text-[#181A20]'
                    : 'bg-[#181A20] text-[#848E9C] border border-[#2B3139]'
                }`}
              >
                Statement Portfolio
              </button>
              <button
                onClick={() => resetDemoLedger(1000, true)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                  Math.round(totalEquity) === 1000
                    ? 'bg-[#F0B90B] text-[#181A20]'
                    : 'bg-[#181A20] text-[#848E9C] border border-[#2B3139]'
                }`}
              >
                Sandbox (1,000 USDT)
              </button>
              <button
                onClick={() => switchAccountVerificationMode('unverified_empty', 0)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                  totalEquity === 0
                    ? 'bg-[#F0B90B] text-[#181A20]'
                    : 'bg-[#181A20] text-[#848E9C] border border-[#2B3139]'
                }`}
              >
                Zero Empty State (0.00)
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const tabItems = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'spot' as const, label: 'Spot' },
    { id: 'futures' as const, label: 'Futures' },
    { id: 'funding' as const, label: 'Funding' },
    { id: 'earn' as const, label: 'Earn' },
  ];

  return (
    <div className="flex flex-col flex-1 bg-[#181A20] min-h-full pb-24 select-none">
      {/* Top Wallet Category Tabs (Overview | Spot | Futures | Funding | Earn) + History */}
      <div className="flex items-center justify-between px-4 border-b border-[#2B3139] sticky top-0 bg-[#181A20]/95 backdrop-blur-md z-20 h-11">
        <div className="flex items-center gap-5 overflow-x-auto no-scrollbar">
          {tabItems.map((t) => (
            <button
              key={t.id}
              onClick={() => setAssetsSubTab(t.id)}
              className={`py-2.5 text-[14px] font-semibold whitespace-nowrap relative transition-colors ${
                assetsSubTab === t.id ? 'text-[#EAECEF]' : 'text-[#848E9C] hover:text-[#EAECEF]'
              }`}
            >
              {t.label}
              {assetsSubTab === t.id && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-[2.5px] bg-[#F0B90B] rounded-full" />
              )}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowHistoryModal(true)}
          className="text-[#848E9C] hover:text-[#EAECEF] pl-2 py-1 flex items-center gap-1 shrink-0"
          title="Transaction History"
        >
          <History size={16} />
        </button>
      </div>

      {/* ===================================================================== */}
      {/* 1. OVERVIEW TAB (Matches Binance Assets Overview 00:29 - 00:33)       */}
      {/* ===================================================================== */}
      {assetsSubTab === 'overview' && (
        <div>
          {renderBalanceBlock('Est. Total Value', totalEquity, {
            showAvailableLocked: true,
            availableUsd: usdtSummary.available,
            lockedUsd: usdtSummary.locked,
          })}

          {/* Smooth Yellow Portfolio Curve + 1D / 7D / 1M / 6M / 1Y Timeframe Pills */}
          {showPortfolioChart && (
            <div className="px-4 pt-1 pb-2">
              <div className="relative h-14 w-full overflow-hidden">
                <svg viewBox="0 0 340 50" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="nexusPortfolioGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F0B90B" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="#F0B90B" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path d={`${chartPoints} L 340 50 L 0 50 Z`} fill="url(#nexusPortfolioGrad)" />
                  <path
                    d={chartPoints}
                    fill="none"
                    stroke="#F0B90B"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="flex items-center justify-between mt-1 px-1">
                {(['1D', '7D', '1M', '6M', '1Y'] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setPortfolioTimeframe(tf)}
                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-colors ${
                      portfolioTimeframe === tf
                        ? 'bg-[#2B3139] text-[#EAECEF]'
                        : 'text-[#848E9C] hover:text-[#EAECEF]'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Optional Collapsible Live USDT/USD Reference Chart */}
          {showLiveCandles && (
            <div className="mx-4 my-2 bg-[#202630] border border-[#2B3139] rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b border-[#2B3139]">
                <span className="text-[11px] font-semibold text-[#EAECEF]">USDT/USD Market Index</span>
                <button
                  onClick={() => setShowLiveCandles(false)}
                  className="text-[11px] text-[#848E9C] hover:text-[#EAECEF]"
                >
                  Hide
                </button>
              </div>
              <div className="h-[155px]">
                <CandlestickChart
                  symbol="USDTUSD"
                  interval={activeInterval}
                  onIntervalChange={setActiveInterval}
                  height={155}
                />
              </div>
            </div>
          )}

          {/* 3 Primary Action Buttons (Add Funds | Send | Transfer) matching 00:30 */}
          <div className="grid grid-cols-3 gap-2.5 px-4 py-3">
            <button
              onClick={() => setDepositMethodSheetOpen(true)}
              className="h-9 rounded-lg bg-[#F0B90B] hover:bg-[#F0B90B]/90 active:scale-[0.99] text-[#181A20] font-semibold text-[13px] flex items-center justify-center transition-all"
            >
              Add Funds
            </button>
            <button
              onClick={() => openWithdrawModal('USDT')}
              className="h-9 rounded-lg bg-[#202630] hover:bg-[#2B3139] active:scale-[0.99] text-[#EAECEF] font-medium text-[13px] flex items-center justify-center transition-all"
            >
              Send
            </button>
            <button
              onClick={() => openTransferModal()}
              className="h-9 rounded-lg bg-[#202630] hover:bg-[#2B3139] active:scale-[0.99] text-[#EAECEF] font-medium text-[13px] flex items-center justify-center transition-all"
            >
              Transfer
            </button>
          </div>

          {/* Recent Transaction Status Ticker Rows (matching 00:30 Withdraw / Deposit status rows) */}
          {recentOverviewEvents.length > 0 && (
            <div className="px-4 pb-2 space-y-1.5">
              {recentOverviewEvents.map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => setShowHistoryModal(true)}
                  className="w-full flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-[#202630]/60 hover:bg-[#202630] text-[12px] transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-4 h-4 rounded-full bg-[#2B3139] flex items-center justify-center text-[10px] text-[#EAECEF] shrink-0">
                      $
                    </span>
                    <span className="text-[#EAECEF] font-medium truncate">{ev.label}</span>
                    <span className="text-[#848E9C] tabular-nums truncate">{ev.detail}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-[#848E9C] tabular-nums">{ev.time}</span>
                    <span className="text-[11px] text-[#2EBD85] font-medium">{ev.status}</span>
                    <ChevronRight size={13} className="text-[#848E9C]" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Crypto | Account Sub-Tabs + Search & Hide Small Controls */}
          <div className="mt-1 border-t border-[#2B3139]">
            <div className="flex items-center justify-between px-4 pt-3 pb-2">
              <div className="flex items-center gap-5">
                {(['Crypto', 'Account'] as const).map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setOverviewListTab(sub)}
                    className={`pb-1.5 text-[15px] font-semibold relative transition-colors ${
                      overviewListTab === sub ? 'text-[#EAECEF]' : 'text-[#848E9C]'
                    }`}
                  >
                    {sub}
                    {overviewListTab === sub && (
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2.5px] bg-[#F0B90B] rounded-full" />
                    )}
                  </button>
                ))}
              </div>

              {overviewListTab === 'Crypto' && (
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search size={13} className="w-3.5 h-3.5 text-[#848E9C] absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search"
                      className="bg-[#202630] border border-[#2B3139] rounded-lg pl-7 pr-2.5 py-1 text-[12px] text-[#EAECEF] w-28 focus:w-36 focus:border-[#F0B90B] focus:outline-none transition-all"
                    />
                  </div>
                  <button
                    onClick={() => setHideSmall(!hideSmall)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                      hideSmall
                        ? 'bg-[#F0B90B]/15 border-[#F0B90B]/40 text-[#F0B90B]'
                        : 'bg-[#202630] border-[#2B3139] text-[#848E9C]'
                    }`}
                  >
                    Hide 0
                  </button>
                </div>
              )}
            </div>

            {/* OVERVIEW > CRYPTO LIST (Matches 01:47-01:50 asset rows + Add Funds links) */}
            {overviewListTab === 'Crypto' ? (
              <div className="divide-y divide-[#2B3139]/60">
                {cryptoAssetRows.length === 0 ? (
                  <div className="py-12 px-4 text-center">
                    <div className="text-[14px] font-semibold text-[#EAECEF] mb-1">No matching assets</div>
                    <p className="text-[12px] text-[#848E9C] mb-4">
                      Try clearing your search filter or deposit crypto to get started.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setHideSmall(false);
                      }}
                      className="px-4 py-2 rounded-lg bg-[#202630] text-[#F0B90B] text-[12px] font-semibold"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  cryptoAssetRows.map((item) => (
                    <div
                      key={item.coin}
                      onClick={() => {
                        setSelectedAssetDetail(item.coin);
                        setAssetDetailTab('market');
                      }}
                      className="px-4 py-3.5 hover:bg-[#202630]/60 active:bg-[#202630] transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <CoinIcon asset={item.coin} size="md" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[15px] font-semibold text-[#EAECEF]">{item.coin}</span>
                            {item.apr && (
                              <span className="px-1.5 py-0.5 rounded bg-[#F0B90B]/15 text-[#F0B90B] text-[10px] font-semibold">
                                Earn {item.apr}
                              </span>
                            )}
                          </div>
                          <div className="text-[12px] text-[#848E9C] truncate">{item.name}</div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-[15px] font-semibold text-[#EAECEF] tabular-nums">
                          {hideBalance
                            ? '******'
                            : item.total === 0
                            ? '0.00'
                            : item.total.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                        </div>
                        {item.total > 0 ? (
                          <div className="text-[12px] text-[#848E9C] tabular-nums">
                            {hideBalance
                              ? '******'
                              : `${currencyMeta.symbol}${formatConverted(item.usdValue)}`}
                            {item.locked > 0 && !hideBalance && (
                              <span className="ml-1.5 text-[#F0B90B]">
                                (Locked: {item.locked.toLocaleString(undefined, { maximumFractionDigits: 4 })})
                              </span>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openDepositModal(item.coin);
                            }}
                            className="text-[12px] font-semibold text-[#F0B90B] hover:underline"
                          >
                            Add Funds
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}

                {/* Bottom "+ Add More Assets" button matching 01:49 */}
                <div className="py-5 text-center">
                  <button
                    onClick={() => setDepositMethodSheetOpen(true)}
                    className="text-[13px] font-medium text-[#848E9C] hover:text-[#EAECEF] transition-colors"
                  >
                    + Add More Assets
                  </button>
                </div>
              </div>
            ) : (
              /* OVERVIEW > ACCOUNT BREAKDOWN */
              <div className="divide-y divide-[#2B3139]/60 px-4">
                {WALLET_ACCOUNTS.slice(0, 5).map((acc) => {
                  const val = getAccountValueUsdt(acc.id);
                  const ratio = totalEquity > 0 ? (val / totalEquity) * 100 : 0;
                  const targetTab =
                    acc.id === 'spot'
                      ? 'spot'
                      : acc.id === 'funding'
                      ? 'funding'
                      : acc.id === 'earn'
                      ? 'earn'
                      : 'futures';
                  return (
                    <button
                      key={acc.id}
                      onClick={() => setAssetsSubTab(targetTab)}
                      className="w-full py-3.5 flex items-center justify-between text-left hover:bg-[#202630]/40 transition-colors"
                    >
                      <div>
                        <div className="text-[14px] font-semibold text-[#EAECEF] flex items-center gap-2">
                          <span>{acc.label}</span>
                          <span className="text-[11px] text-[#848E9C] font-normal tabular-nums">
                            {ratio.toFixed(1)}%
                          </span>
                        </div>
                        <div className="text-[12px] text-[#848E9C] mt-0.5">{acc.description}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="text-[14px] font-semibold text-[#EAECEF] tabular-nums">
                            {hideBalance ? '******' : `${currencyMeta.symbol}${formatConverted(val)}`}
                          </div>
                          <div className="text-[11px] text-[#848E9C]">{selectedCurrency}</div>
                        </div>
                        <ChevronRight size={15} className="text-[#848E9C]" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. SPOT & FUNDING TABS                                                */}
      {/* ===================================================================== */}
      {(assetsSubTab === 'spot' || assetsSubTab === 'funding') && (
        <div>
          {renderBalanceBlock(
            assetsSubTab === 'spot' ? 'Spot Total Value' : 'Funding Total Value',
            assetsSubTab === 'spot' ? spotEquity : fundingEquity,
            {
              showAvailableLocked: true,
              availableUsd:
                assetsSubTab === 'spot'
                  ? Object.values(wallets.spot || {}).reduce(
                      (s, c) => s + c.available * getAssetPriceUsdt(c.asset),
                      0
                    )
                  : fundingEquity,
              lockedUsd:
                assetsSubTab === 'spot'
                  ? Object.values(wallets.spot || {}).reduce(
                      (s, c) => s + c.locked * getAssetPriceUsdt(c.asset),
                      0
                    )
                  : 0,
            }
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2.5 px-4 py-3">
            <button
              onClick={() => openDepositModal('USDT')}
              className="h-9 rounded-lg bg-[#F0B90B] hover:bg-[#F0B90B]/90 text-[#181A20] font-semibold text-[13px] flex items-center justify-center"
            >
              Deposit
            </button>
            <button
              onClick={() => openWithdrawModal('USDT')}
              className="h-9 rounded-lg bg-[#202630] hover:bg-[#2B3139] text-[#EAECEF] font-medium text-[13px] flex items-center justify-center"
            >
              Withdraw
            </button>
            <button
              onClick={() =>
                openTransferModal({
                  from: assetsSubTab === 'spot' ? 'spot' : 'funding',
                  to: 'usdm_futures',
                })
              }
              className="h-9 rounded-lg bg-[#202630] hover:bg-[#2B3139] text-[#EAECEF] font-medium text-[13px] flex items-center justify-center"
            >
              Transfer
            </button>
          </div>

          {/* Search & Hide 0 Filter Bar */}
          <div className="px-4 py-2.5 border-t border-[#2B3139] flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search size={14} className="text-[#848E9C] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${assetsSubTab} assets...`}
                className="w-full h-8 bg-[#202630] border border-[#2B3139] rounded-lg pl-8 pr-3 text-[12px] text-[#EAECEF] focus:border-[#F0B90B] focus:outline-none"
              />
            </div>
            <label className="flex items-center gap-1.5 text-[12px] text-[#848E9C] cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={hideSmall}
                onChange={(e) => setHideSmall(e.target.checked)}
                className="rounded bg-[#202630] border-[#2B3139] text-[#F0B90B] focus:ring-0"
              />
              Hide &lt; $1
            </label>
          </div>

          {/* Asset Rows */}
          <div className="divide-y divide-[#2B3139]/60">
            {cryptoAssetRows.map((item) => (
              <div
                key={item.coin}
                onClick={() => {
                  setSelectedAssetDetail(item.coin);
                  setAssetDetailTab('market');
                }}
                className="px-4 py-3.5 hover:bg-[#202630]/60 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CoinIcon asset={item.coin} size="md" />
                    <div>
                      <div className="text-[15px] font-semibold text-[#EAECEF]">{item.coin}</div>
                      <div className="text-[12px] text-[#848E9C]">{item.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[15px] font-semibold text-[#EAECEF] tabular-nums">
                      {hideBalance
                        ? '******'
                        : item.total === 0
                        ? '0.00'
                        : item.total.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                    </div>
                    <div className="text-[12px] text-[#848E9C] tabular-nums">
                      {hideBalance ? '******' : `≈ ${currencyMeta.symbol}${formatConverted(item.usdValue)}`}
                    </div>
                  </div>
                </div>

                {/* Available / In Order Breakdown + Quick Trade/Deposit links */}
                {item.total > 0 && !hideBalance && (
                  <div className="mt-2 pt-2 border-t border-[#2B3139]/40 flex items-center justify-between text-[11px] text-[#848E9C]">
                    <div className="flex items-center gap-4 tabular-nums">
                      <span>
                        Available:{' '}
                        <strong className="text-[#EAECEF]">
                          {item.available.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                        </strong>
                      </span>
                      <span>
                        Locked:{' '}
                        <strong className="text-[#EAECEF]">
                          {item.locked.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                        </strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.coin !== 'USDT' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveSymbol(`${item.coin}USDT`);
                            setExchangeTab('trade');
                          }}
                          className="text-[#F0B90B] font-semibold hover:underline"
                        >
                          Trade
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDepositModal(item.coin);
                        }}
                        className="text-[#EAECEF] hover:text-[#F0B90B] font-medium"
                      >
                        Deposit
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 3. FUTURES TAB                                                        */}
      {/* ===================================================================== */}
      {assetsSubTab === 'futures' && (
        <div>
          {renderBalanceBlock('USD©-M Margin Balance', futuresEquity + futuresUnrealizedPnl, {
            showAvailableLocked: true,
            availableUsd: futuresEquity,
            lockedUsd: futuresPositions.reduce((s, p) => s + p.marginUsdt, 0),
          })}

          <div className="px-4 py-3 grid grid-cols-2 gap-2.5">
            <button
              onClick={() => openTransferModal({ from: 'spot', to: 'usdm_futures' })}
              className="h-9 rounded-lg bg-[#F0B90B] text-[#181A20] font-semibold text-[13px] flex items-center justify-center gap-1.5"
            >
              <ArrowLeftRight size={14} /> Transfer Margin
            </button>
            <button
              onClick={() => setExchangeTab('futures')}
              className="h-9 rounded-lg bg-[#202630] hover:bg-[#2B3139] text-[#EAECEF] font-medium text-[13px] flex items-center justify-center gap-1.5"
            >
              <TrendingUp size={14} /> Trade Futures
            </button>
          </div>

          <div className="mx-4 my-2 p-3.5 rounded-xl bg-[#202630] border border-[#2B3139] grid grid-cols-2 gap-3 text-[12px]">
            <div>
              <div className="text-[#848E9C]">Wallet Balance</div>
              <div className="text-[14px] font-semibold text-[#EAECEF] tabular-nums mt-0.5">
                {hideBalance ? '******' : `${futuresEquity.toFixed(2)} USDT`}
              </div>
            </div>
            <div>
              <div className="text-[#848E9C]">Unrealized PNL</div>
              <div
                className={`text-[14px] font-semibold tabular-nums mt-0.5 ${
                  futuresUnrealizedPnl >= 0 ? 'text-[#2EBD85]' : 'text-[#F6465D]'
                }`}
              >
                {hideBalance
                  ? '******'
                  : `${futuresUnrealizedPnl >= 0 ? '+' : ''}${futuresUnrealizedPnl.toFixed(2)} USDT`}
              </div>
            </div>
          </div>

          <div className="px-4 pt-3">
            <div className="text-[14px] font-semibold text-[#EAECEF] mb-2">
              Open Positions ({futuresPositions.length})
            </div>
            {futuresPositions.length === 0 ? (
              <div className="py-10 text-center bg-[#202630]/50 border border-[#2B3139] rounded-xl">
                <div className="text-[13px] font-medium text-[#848E9C]">No active Futures positions</div>
                <button
                  onClick={() => setExchangeTab('futures')}
                  className="mt-2 text-[12px] font-semibold text-[#F0B90B] hover:underline"
                >
                  Open USD©-M Perpetuals →
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {futuresPositions.map((pos) => {
                  const mark = tickers[pos.symbol]?.lastPrice || pos.entryPrice;
                  const pnl =
                    pos.side === 'LONG'
                      ? (mark - pos.entryPrice) * pos.sizeAsset
                      : (pos.entryPrice - mark) * pos.sizeAsset;
                  const roe = pos.marginUsdt > 0 ? (pnl / pos.marginUsdt) * 100 : 0;
                  return (
                    <div key={pos.id} className="p-3.5 rounded-xl bg-[#202630] border border-[#2B3139]">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              pos.side === 'LONG'
                                ? 'bg-[#2EBD85]/20 text-[#2EBD85]'
                                : 'bg-[#F6465D]/20 text-[#F6465D]'
                            }`}
                          >
                            {pos.side} {pos.leverage}x
                          </span>
                          <span className="text-[14px] font-semibold text-[#EAECEF]">{pos.symbol}</span>
                        </div>
                        <button
                          onClick={() => {
                            const res = closeFuturesPosition(pos.id);
                            showToast(res.message);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#2B3139] hover:bg-[#F6465D] hover:text-white text-[11px] font-semibold text-[#EAECEF] transition-colors"
                        >
                          Close
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[11px]">
                        <div>
                          <div className="text-[#848E9C]">Size</div>
                          <div className="text-[#EAECEF] font-semibold tabular-nums">{pos.sizeAsset}</div>
                        </div>
                        <div>
                          <div className="text-[#848E9C]">Entry / Mark</div>
                          <div className="text-[#EAECEF] font-semibold tabular-nums">
                            {pos.entryPrice.toLocaleString()} / {mark.toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[#848E9C]">PNL (ROE%)</div>
                          <div
                            className={`font-semibold tabular-nums ${
                              pnl >= 0 ? 'text-[#2EBD85]' : 'text-[#F6465D]'
                            }`}
                          >
                            {pnl >= 0 ? '+' : ''}
                            {pnl.toFixed(2)} ({roe >= 0 ? '+' : ''}
                            {roe.toFixed(1)}%)
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. EARN TAB                                                           */}
      {/* ===================================================================== */}
      {assetsSubTab === 'earn' && (
        <div>
          {renderBalanceBlock('Simple Earn Value', earnEquity, {
            showAvailableLocked: true,
            availableUsd: wallets.spot?.USDT?.available || 0,
            lockedUsd: earnEquity,
          })}

          <div className="px-4 pt-2 space-y-4">
            {/* Active Subscriptions */}
            <div>
              <div className="text-[14px] font-semibold text-[#EAECEF] mb-2">
                Active Subscriptions ({earnSubscriptions.length})
              </div>
              {earnSubscriptions.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#202630]/60 border border-[#2B3139] text-[12px] text-[#848E9C]">
                  No active Simple Earn subscriptions. Subscribe idle Spot assets below to earn daily yield.
                </div>
              ) : (
                <div className="space-y-2">
                  {earnSubscriptions.map((pos) => (
                    <div
                      key={pos.id}
                      className="p-3.5 rounded-xl bg-[#202630] border border-[#2B3139] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <CoinIcon asset={pos.asset} size="md" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[14px] font-semibold text-[#EAECEF]">{pos.asset}</span>
                            <span className="px-1.5 py-0.5 rounded bg-[#2EBD85]/15 text-[#2EBD85] text-[10px] font-bold">
                              {pos.apr}% APR
                            </span>
                          </div>
                          <div className="text-[12px] text-[#848E9C] tabular-nums mt-0.5">
                            Principal: {pos.amount} {pos.asset}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const res = redeemEarn(pos.id);
                          showToast(res.message);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#2B3139] hover:bg-[#F0B90B] hover:text-[#181A20] text-[#EAECEF] text-[12px] font-semibold transition-colors"
                      >
                        Redeem
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Available Earn Products */}
            <div>
              <div className="text-[14px] font-semibold text-[#EAECEF] mb-2">Simple Earn Products</div>
              <div className="divide-y divide-[#2B3139]/60 bg-[#202630] border border-[#2B3139] rounded-xl overflow-hidden">
                {EARN_PRODUCTS.map((prod) => {
                  const spotAvail = wallets.spot?.[prod.asset]?.available || 0;
                  return (
                    <div key={prod.id} className="p-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CoinIcon asset={prod.asset} size="md" />
                        <div>
                          <div className="text-[14px] font-semibold text-[#EAECEF] flex items-center gap-2">
                            <span>{prod.asset}</span>
                            <span className="text-[11px] text-[#848E9C] font-normal">
                              {prod.type} {prod.durationDays ? `· ${prod.durationDays}D` : ''}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#848E9C] tabular-nums">
                            Spot Available: {spotAvail.toFixed(4)} {prod.asset}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-[15px] font-bold text-[#2EBD85] tabular-nums">
                            {prod.apr}%
                          </div>
                          <div className="text-[10px] text-[#848E9C]">Est. APR</div>
                        </div>
                        <button
                          onClick={() => {
                            setEarnModalProduct(prod);
                            setEarnAmount('');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#F0B90B] text-[#181A20] font-semibold text-[12px]"
                        >
                          Subscribe
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODALS: ASSET DETAIL, SIMPLE EARN SUBSCRIBE, HISTORY                  */}
      {/* ===================================================================== */}

      {/* Asset Detail Bottom Sheet */}
      {selectedAssetDetail &&
        (() => {
          const coin = selectedAssetDetail;
          const spotAvail = wallets.spot?.[coin]?.available || 0;
          const spotLock = wallets.spot?.[coin]?.locked || 0;
          const fundAvail = wallets.funding?.[coin]?.available || 0;
          const earnTotal =
            (wallets.earn?.[coin]?.available || 0) + (wallets.earn?.[coin]?.locked || 0);
          const totalHolding = spotAvail + spotLock + fundAvail + earnTotal;
          const price = getAssetPriceUsdt(coin);
          const usdValue = totalHolding * price;
          const changePct = getPriceChangePercent(coin);
          const networks = NETWORK_FEES[coin] || NETWORK_FEES.USDT;
          const chartSymbol = coin === 'USDT' || coin === 'USDC' ? 'BTCUSDT' : `${coin}USDT`;

          return (
            <div className="fixed inset-0 bg-black/75 z-50 flex flex-col justify-end">
              <div className="bg-[#181A20] border-t border-[#2B3139] rounded-t-2xl max-h-[88vh] flex flex-col overflow-hidden">
                <div className="px-4 py-3.5 border-b border-[#2B3139] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CoinIcon asset={coin} size="md" />
                    <div>
                      <div className="text-[16px] font-bold text-[#EAECEF]">{coin}</div>
                      <div className="text-[11px] text-[#848E9C]">{ASSET_NAMES[coin] || coin}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedAssetDetail(null)}
                    className="p-1.5 rounded-lg bg-[#202630] text-[#848E9C] hover:text-[#EAECEF]"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Equity Summary Card */}
                  <div className="p-3.5 rounded-xl bg-[#202630] border border-[#2B3139]">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[11px] text-[#848E9C]">Total {coin} Balance</div>
                        <div className="text-[22px] font-bold text-[#EAECEF] tabular-nums mt-0.5">
                          {hideBalance
                            ? '******'
                            : totalHolding.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                        </div>
                        <div className="text-[12px] text-[#848E9C] tabular-nums">
                          {hideBalance ? '******' : `≈ ${currencyMeta.symbol}${formatConverted(usdValue)}`}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[11px] text-[#848E9C]">Market Price</div>
                        <div className="text-[15px] font-semibold text-[#EAECEF] tabular-nums mt-0.5">
                          ${price.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                        </div>
                        <div
                          className={`text-[12px] font-semibold tabular-nums ${
                            changePct >= 0 ? 'text-[#2EBD85]' : 'text-[#F6465D]'
                          }`}
                        >
                          {changePct >= 0 ? '+' : ''}
                          {changePct.toFixed(2)}%
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-[#2B3139] text-[11px]">
                      <div>
                        <div className="text-[#848E9C]">Spot Avail</div>
                        <div className="text-[#EAECEF] font-semibold tabular-nums">
                          {spotAvail.toFixed(4)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[#848E9C]">In Order</div>
                        <div className="text-[#EAECEF] font-semibold tabular-nums">
                          {spotLock.toFixed(4)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[#848E9C]">Funding</div>
                        <div className="text-[#EAECEF] font-semibold tabular-nums">
                          {fundAvail.toFixed(4)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[#848E9C]">Simple Earn</div>
                        <div className="text-[#2EBD85] font-semibold tabular-nums">
                          {earnTotal.toFixed(4)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detail Sub-tabs */}
                  <div className="flex border-b border-[#2B3139] gap-5">
                    {(
                      [
                        { id: 'market', label: 'Market Chart' },
                        { id: 'networks', label: 'Supported Networks' },
                        { id: 'history', label: 'Asset History' },
                      ] as const
                    ).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setAssetDetailTab(t.id)}
                        className={`pb-2 text-[13px] font-semibold relative ${
                          assetDetailTab === t.id ? 'text-[#EAECEF]' : 'text-[#848E9C]'
                        }`}
                      >
                        {t.label}
                        {assetDetailTab === t.id && (
                          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#F0B90B]" />
                        )}
                      </button>
                    ))}
                  </div>

                  {assetDetailTab === 'market' && (
                    <div className="bg-[#202630] border border-[#2B3139] rounded-xl overflow-hidden h-[200px]">
                      <CandlestickChart
                        symbol={chartSymbol}
                        interval={activeInterval}
                        onIntervalChange={setActiveInterval}
                        height={200}
                      />
                    </div>
                  )}

                  {assetDetailTab === 'networks' && (
                    <div className="space-y-2">
                      {networks.map((net) => (
                        <div
                          key={net.network}
                          className="p-3 rounded-xl bg-[#202630] border border-[#2B3139] flex items-center justify-between text-[12px]"
                        >
                          <div>
                            <div className="font-semibold text-[#EAECEF]">
                              {net.name} ({net.network})
                            </div>
                            <div className="text-[11px] text-[#848E9C]">
                              Min Withdraw: {net.minWithdraw} · Arrival: {net.arrival}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[#2EBD85] font-semibold">Deposit: {net.depositFee}</div>
                            <div className="text-[11px] text-[#848E9C]">Fee: {net.withdrawFee}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {assetDetailTab === 'history' && (
                    <div className="space-y-2">
                      {transactions.filter((h) => h.asset === coin).length === 0 ? (
                        <div className="py-6 text-center text-[12px] text-[#848E9C]">
                          No recent {coin} transactions recorded.
                        </div>
                      ) : (
                        transactions
                          .filter((h) => h.asset === coin)
                          .slice(0, 10)
                          .map((h) => (
                            <div
                              key={h.id}
                              className="p-3 rounded-xl bg-[#202630] border border-[#2B3139] flex items-center justify-between text-[12px]"
                            >
                              <div>
                                <div className="font-semibold text-[#EAECEF] capitalize">
                                  {h.type.replace('_', ' ')}
                                </div>
                                <div className="text-[11px] text-[#848E9C]">
                                  {new Date(h.timestamp).toLocaleString()}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-[#EAECEF] tabular-nums">
                                  {h.amount} {h.asset}
                                </div>
                                <div className="text-[11px] text-[#2EBD85] capitalize">{h.status}</div>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="p-4 border-t border-[#2B3139] grid grid-cols-3 gap-2.5 bg-[#181A20]">
                  <button
                    onClick={() => {
                      setSelectedAssetDetail(null);
                      openDepositModal(coin);
                    }}
                    className="h-10 rounded-lg bg-[#F0B90B] text-[#181A20] font-semibold text-[13px]"
                  >
                    Deposit
                  </button>
                  <button
                    onClick={() => {
                      setSelectedAssetDetail(null);
                      openWithdrawModal(coin);
                    }}
                    className="h-10 rounded-lg bg-[#202630] text-[#EAECEF] font-medium text-[13px]"
                  >
                    Withdraw
                  </button>
                  <button
                    onClick={() => {
                      setSelectedAssetDetail(null);
                      if (coin !== 'USDT') {
                        setActiveSymbol(`${coin}USDT`);
                      }
                      setExchangeTab('trade');
                    }}
                    className="h-10 rounded-lg bg-[#202630] text-[#EAECEF] font-medium text-[13px]"
                  >
                    Trade
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

      {/* Simple Earn Subscribe Modal */}
      {earnModalProduct && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className="bg-[#181A20] border border-[#2B3139] w-full max-w-sm rounded-2xl p-5">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2.5">
                <CoinIcon asset={earnModalProduct.asset} size="md" />
                <div>
                  <h3 className="font-bold text-[#EAECEF] text-[15px]">
                    Subscribe {earnModalProduct.asset}
                  </h3>
                  <span className="text-[11px] text-[#2EBD85] font-semibold">
                    {earnModalProduct.apr}% APR · {earnModalProduct.type}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setEarnModalProduct(null)}
                className="text-[#848E9C] hover:text-[#EAECEF]"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mb-4">
              <div className="flex justify-between text-[11px] text-[#848E9C] mb-1.5">
                <span>Subscription Amount</span>
                <span>
                  Spot Avail: {(wallets.spot?.[earnModalProduct.asset]?.available || 0).toFixed(4)}{' '}
                  {earnModalProduct.asset}
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={earnAmount}
                  onChange={(e) => setEarnAmount(e.target.value)}
                  placeholder={`Min ${earnModalProduct.minAmount}`}
                  className="w-full h-10 bg-[#202630] border border-[#2B3139] rounded-xl px-3.5 text-[14px] text-[#EAECEF] focus:border-[#F0B90B] focus:outline-none tabular-nums"
                />
                <button
                  onClick={() =>
                    setEarnAmount((wallets.spot?.[earnModalProduct.asset]?.available || 0).toString())
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-[#F0B90B]"
                >
                  MAX
                </button>
              </div>
            </div>
            <button
              onClick={handleSubscribeSubmit}
              className="w-full h-10 bg-[#F0B90B] text-[#181A20] font-semibold rounded-xl text-[14px]"
            >
              Confirm Subscription
            </button>
          </div>
        </div>
      )}

      {/* Full Activity Timeline Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/75 z-50 flex flex-col justify-end">
          <div className="bg-[#181A20] border-t border-[#2B3139] rounded-t-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-4 py-3.5 border-b border-[#2B3139] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History size={16} className="text-[#F0B90B]" />
                <span className="font-bold text-[#EAECEF] text-[15px]">Transaction History</span>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1 text-[#848E9C] hover:text-[#EAECEF]"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto">
              <ActivityTimelineView />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
