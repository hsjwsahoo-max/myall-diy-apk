import React, { useMemo, useState } from 'react';
import {
  ArrowUpDown,
  BookOpen,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Eye,
  EyeOff,
  FileText,
  Flame,
  RefreshCw,
  ScanLine,
  Star,
} from 'lucide-react';
import {
  CoinIcon,
  formatCompactNumber,
  formatFiat,
  formatPortfolioValuation,
  formatPrice,
} from '../components/CoinIcon';
import { NTButton, NTCard, NTSearchBar, NTTabs } from '../components/ui/DesignSystem';
import { EARN_PRODUCTS, useExchange } from '../context/ExchangeContext';
import { PortfolioDenomination, SupportedFiat } from '../types/exchange';

export const HomeScreen: React.FC = () => {
  const {
    tickerList,
    tickers,
    stocks,
    favorites,
    toggleFavorite,
    settings,
    updateSettings,
    getTotalPortfolioUsdt,
    getTotalUsdtSummary,
    getLiveUsdtUsdPrice,
    getAssetPriceUsdt,
    wallets,
    executeConvert,
    setDepositMethodSheetOpen,
    openDepositModal,
    openWithdrawModal,
    openTransferModal,
    setHistoryModalOpen,
    setProfileDrawerOpen,
    setPayModalOpen,
    setActiveSymbol,
    setCoinDetailSymbol,
    setExchangeTab,
    setTradeSubTab,
    setAssetsSubTab,
    isRefreshingMarket,
    refreshMarketData,
    showToast,
  } = useExchange();

  const [marketSubTab, setMarketSubTab] = useState<
    'favorites' | 'hot' | 'new' | 'gainers' | 'losers' | 'turnover' | 'stocks'
  >('hot');
  const [searchQuery, setSearchQuery] = useState('');
  const [convertFrom, setConvertFrom] = useState('USDT');
  const [convertTo, setConvertTo] = useState('BTC');
  const [convertAmount, setConvertAmount] = useState('');
  const [expandTrendChart, setExpandTrendChart] = useState(false);
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
  const [feedTab, setFeedTab] = useState<
    'discover' | 'following' | 'stocks' | 'leaderboard' | 'announcements' | 'news'
  >('discover');

  const totalPortfolioUsdt = getTotalPortfolioUsdt();
  const liveUsdtPrice = getLiveUsdtUsdPrice();
  const usdtSummary = getTotalUsdtSummary();
  const activeDenom: PortfolioDenomination = settings.primaryDenomination || 'USDT';
  const portfolioValuation = formatPortfolioValuation(
    totalPortfolioUsdt,
    liveUsdtPrice,
    activeDenom,
    settings.fiat
  );

  const bnbTicker = tickers.BNBUSDT;
  const btcTicker = tickers.BTCUSDT;
  const ethTicker = tickers.ETHUSDT;
  const solTicker = tickers.SOLUSDT;

  const fromAvailable = wallets.spot[convertFrom]?.available || 0;
  const fromPrice = getAssetPriceUsdt(convertFrom);
  const toPrice = getAssetPriceUsdt(convertTo);
  const parsedConvertAmt = parseFloat(convertAmount) || 0;
  const estimatedConvertOut =
    fromPrice > 0 && toPrice > 0 ? (parsedConvertAmt * fromPrice) / toPrice : 0;

  const displayedCoins = useMemo(() => {
    let list = [...tickerList];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.baseAsset.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          c.symbol.toLowerCase().includes(q)
      );
    }

    switch (marketSubTab) {
      case 'favorites':
        return list.filter((c) => favorites.includes(c.symbol));
      case 'new':
        return list.filter((c) => c.isNewListing).slice(0, 6);
      case 'gainers':
        return [...list].sort((a, b) => b.priceChangePercent - a.priceChangePercent).slice(0, 6);
      case 'losers':
        return [...list].sort((a, b) => a.priceChangePercent - b.priceChangePercent).slice(0, 6);
      case 'turnover':
        return [...list].sort((a, b) => b.quoteVolume24h - a.quoteVolume24h).slice(0, 6);
      case 'hot':
      default: {
        const hotOrder = [
          'BNBUSDT',
          'BTCUSDT',
          'ETHUSDT',
          'SOLUSDT',
          'XRPUSDT',
          'DOGEUSDT',
          'TRUMPUSDT',
          'SUIUSDT',
        ];
        return list
          .sort((a, b) => {
            const idxA = hotOrder.indexOf(a.symbol);
            const idxB = hotOrder.indexOf(b.symbol);
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
            return b.quoteVolume24h - a.quoteVolume24h;
          })
          .slice(0, 6);
      }
    }
  }, [tickerList, marketSubTab, favorites, searchQuery]);

  const handleOpenCoin = (symbol: string) => {
    setActiveSymbol(symbol);
    setCoinDetailSymbol(symbol);
  };

  const bnbUp = (bnbTicker?.priceChangePercent || 0) >= 0;

  return (
    <div className="space-y-3 pb-4 max-w-full overflow-x-hidden">
      {/* 1. Reference Search Bar (Matches 00:05, 00:08, 01:30: Flame/Search left + QR Scan right) */}
      <NTSearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder={
          btcTicker?.lastPrice
            ? `BTC is trending now · $${formatPrice(btcTicker.lastPrice, 0)}`
            : 'BTC is trending now'
        }
        leftIcon={<Flame className="w-4 h-4 text-[#F0B90B] shrink-0" />}
        rightAction={
          <button
            type="button"
            onClick={() => setPayModalOpen(true)}
            className="p-1 text-[#848E9C] hover:text-[#EAECEF] transition-colors"
            aria-label="Scan QR"
            title="Scan QR"
          >
            <ScanLine className="w-4 h-4" />
          </button>
        }
      />

      {/* 2. Portfolio Balance Header — Compact & Always Accessible in Empty or Funded Mode */}
      <div className="pt-0.5 space-y-2 relative">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-xs text-[#848E9C]">
              <button
                type="button"
                onClick={() => setShowCurrencyMenu((v) => !v)}
                className="inline-flex items-center gap-1 hover:text-[#EAECEF] transition-colors truncate"
              >
                <span className="truncate">Est. Total Value ({activeDenom})</span>
                <ChevronDown className="w-3 h-3 shrink-0" />
              </button>
              <button
                type="button"
                onClick={() => updateSettings({ hideBalances: !settings.hideBalances })}
                className="p-0.5 hover:text-[#EAECEF] shrink-0"
                aria-label="Toggle balance visibility"
              >
                {settings.hideBalances ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            <div
              onClick={() => updateSettings({ hideBalances: !settings.hideBalances })}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  updateSettings({ hideBalances: !settings.hideBalances });
                }
              }}
              title={settings.hideBalances ? 'Show Balance' : 'Hide Balance'}
              className="flex items-baseline gap-1.5 mt-0.5 flex-wrap cursor-pointer"
            >
              <span className="nt-balance-hero">
                {settings.hideBalances ? '******' : portfolioValuation.primaryNumberOnly}
              </span>
              <span className="text-xs text-[#848E9C] tabular-nums">
                ≈ {settings.hideBalances ? '****' : portfolioValuation.secondaryFormatted}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => refreshMarketData()}
              disabled={isRefreshingMarket}
              className="w-9 h-9 rounded-lg bg-[#202630] hover:bg-[#2B3139] text-[#EAECEF] flex items-center justify-center transition-colors disabled:opacity-60"
              title="Refresh Market & Portfolio Data"
              aria-label="Refresh Market & Portfolio Data"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshingMarket ? 'animate-spin text-[#F0B90B]' : ''}`}
              />
            </button>
            <button
              type="button"
              onClick={() => setHistoryModalOpen(true)}
              className="w-9 h-9 rounded-lg bg-[#202630] hover:bg-[#2B3139] text-[#EAECEF] flex items-center justify-center transition-colors"
              title="Transaction History"
              aria-label="Transaction History"
            >
              <FileText className="w-4 h-4" />
            </button>
            <NTButton
              variant="primary"
              size="sm"
              onClick={() => setDepositMethodSheetOpen(true)}
            >
              Add Funds
            </NTButton>
          </div>
        </div>

        {showCurrencyMenu && (
          <NTCard variant="default" padding="sm" className="border border-[#2B3139] space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#EAECEF]">Portfolio Denomination</span>
              <button
                type="button"
                onClick={() => setShowCurrencyMenu(false)}
                className="text-[#848E9C] hover:text-[#EAECEF] text-[11px]"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              {(['USDT', 'USD', 'INR', 'EUR', 'AED', 'GBP'] as PortfolioDenomination[]).map(
                (denom) => (
                  <button
                    key={denom}
                    type="button"
                    onClick={() => {
                      if (denom === 'USDT') {
                        updateSettings({ primaryDenomination: 'USDT' });
                      } else {
                        updateSettings({
                          primaryDenomination: denom,
                          fiat: denom as SupportedFiat,
                        });
                      }
                      setShowCurrencyMenu(false);
                      showToast(`Denomination set to ${denom}`);
                    }}
                    className={`py-1.5 rounded-lg text-xs font-bold tabular-nums ${
                      activeDenom === denom
                        ? 'bg-[#F0B90B] text-[#181A20]'
                        : 'bg-[#202630] text-[#EAECEF]'
                    }`}
                  >
                    {denom}
                  </button>
                )
              )}
            </div>
          </NTCard>
        )}

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setExpandTrendChart((v) => !v)}
            className="inline-flex items-center gap-1 text-[11px] text-[#848E9C] hover:text-[#EAECEF]"
          >
            <span>{expandTrendChart ? 'Hide quick actions' : 'Quick wallet actions'}</span>
            {expandTrendChart ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
          <span className="text-[11px] text-[#848E9C] tabular-nums">
            Spot Avbl: {settings.hideBalances ? '****' : `${formatPrice(usdtSummary.available, 2)} USDT`}
          </span>
        </div>

        {expandTrendChart && (
          <div className="grid grid-cols-4 gap-2 text-xs font-semibold pt-0.5">
            <button
              type="button"
              onClick={() => openDepositModal('USDT')}
              className="py-2 rounded-xl bg-[#202630] hover:bg-[#2B3139] text-[#EAECEF] text-center"
            >
              Deposit
            </button>
            <button
              type="button"
              onClick={() => openWithdrawModal('USDT')}
              className="py-2 rounded-xl bg-[#202630] hover:bg-[#2B3139] text-[#EAECEF] text-center"
            >
              Withdraw
            </button>
            <button
              type="button"
              onClick={() =>
                openTransferModal({
                  from: 'spot',
                  to: 'usdm_futures',
                  asset: 'USDT',
                })
              }
              className="py-2 rounded-xl bg-[#202630] hover:bg-[#2B3139] text-[#EAECEF] text-center"
            >
              Transfer
            </button>
            <button
              type="button"
              onClick={() => setProfileDrawerOpen(true)}
              className="py-2 rounded-xl bg-[#202630] hover:bg-[#2B3139] text-[#EAECEF] text-center"
            >
              More
            </button>
          </div>
        )}
      </div>

      {/* 3. Onboarding Tasks 3/3 Card — Exact Reference Layout (00:00 - 00:09) */}
      <NTCard variant="default" padding="md">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-[#848E9C] font-medium">
            <span>Onboarding Tasks</span>
            <span className="tabular-nums text-[#EAECEF] font-semibold">3/3</span>
          </div>
          <div className="flex items-center gap-1 w-16">
            <div className="h-1 flex-1 rounded-full bg-[#F0B90B]" />
            <div className="h-1 flex-1 rounded-full bg-[#F0B90B]" />
            <div className="h-1 flex-1 rounded-full bg-[#F0B90B]" />
          </div>
        </div>

        <h2 className="text-[18px] font-bold text-[#EAECEF] mt-1.5 mb-3 leading-snug">
          Start Your First Trade
        </h2>

        <NTButton
          variant="primary"
          size="md"
          fullWidth
          onClick={() => {
            setExchangeTab('trade');
            setTradeSubTab('spot');
          }}
        >
          Trade
        </NTButton>

        <div className="border-t border-[#2B3139]/65 my-3" />

        {/* Bottom Beginner's Guide Row (00:00) */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#2EBD85]/15 flex items-center justify-center text-[#2EBD85] shrink-0">
              <BookOpen className="w-4 h-4 text-[#F0B90B]" />
            </div>
            <span className="text-xs font-medium text-[#EAECEF] leading-snug line-clamp-2">
              Spot Trading Explained: A Beginner&apos;s Guide
            </span>
          </div>
          <NTButton
            variant="secondary"
            size="xs"
            onClick={() => {
              setExchangeTab('trade');
              setTradeSubTab('spot');
            }}
          >
            Go
          </NTButton>
        </div>
      </NTCard>

      {/* 4. Unified Flat Convert Card — Exact Reference Layout (00:00 - 00:04, 00:10) */}
      <NTCard variant="default" padding="md">
        <button
          type="button"
          onClick={() => {
            setExchangeTab('trade');
            setTradeSubTab('convert');
          }}
          className="flex items-center gap-0.5 text-[15px] font-bold text-[#EAECEF] mb-3 hover:opacity-90"
        >
          <span>Convert</span>
          <ChevronRight className="w-4 h-4 text-[#848E9C]" />
        </button>

        {/* Flat From Section */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#848E9C]">
            <span>From</span>
            <button
              type="button"
              onClick={() =>
                setConvertAmount(fromAvailable > 0 ? String(fromAvailable) : '100')
              }
              className="hover:text-[#EAECEF] tabular-nums"
            >
              Available {formatPrice(fromAvailable, 0)} {convertFrom}
            </button>
          </div>
          <div className="flex items-center justify-between gap-2 py-0.5">
            <div className="flex items-center gap-2 shrink-0">
              <CoinIcon asset={convertFrom} size="sm" />
              <select
                value={convertFrom}
                onChange={(e) => setConvertFrom(e.target.value)}
                className="bg-transparent text-[15px] font-bold text-[#EAECEF] focus:outline-none cursor-pointer"
              >
                {['USDT', 'BTC', 'ETH', 'BNB', 'SOL', 'USDC'].map((a) => (
                  <option key={a} value={a} className="bg-[#181A20] text-[#EAECEF]">
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <input
              type="number"
              min="0"
              step="any"
              value={convertAmount}
              onChange={(e) => setConvertAmount(e.target.value)}
              placeholder="> 0.01"
              className="w-full min-w-0 text-right bg-transparent text-[17px] font-bold tabular-nums text-[#EAECEF] placeholder-[#474D57] focus:outline-none"
            />
          </div>
        </div>

        {/* Hairline Divider with Center Overlapping Swap Button */}
        <div className="relative my-3 flex items-center justify-center">
          <div className="w-full border-t border-[#2B3139]/70" />
          <button
            type="button"
            onClick={() => {
              const prevFrom = convertFrom;
              setConvertFrom(convertTo);
              setConvertTo(prevFrom);
            }}
            className="absolute w-7 h-7 rounded-lg bg-[#202630] hover:bg-[#2B3139] border border-[#2B3139] flex items-center justify-center text-[#848E9C] hover:text-[#EAECEF] transition-colors"
            aria-label="Swap convert assets"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Flat To Section */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#848E9C]">
            <span>To</span>
            {parsedConvertAmt > 0 && toPrice > 0 && (
              <span className="tabular-nums">
                1 {convertTo} ≈ ${formatPrice(toPrice, 2)}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between gap-2 py-0.5">
            <div className="flex items-center gap-2 shrink-0">
              <CoinIcon asset={convertTo} size="sm" />
              <select
                value={convertTo}
                onChange={(e) => setConvertTo(e.target.value)}
                className="bg-transparent text-[15px] font-bold text-[#EAECEF] focus:outline-none cursor-pointer"
              >
                {['BTC', 'ETH', 'BNB', 'SOL', 'USDT', 'USDC'].map((a) => (
                  <option key={a} value={a} className="bg-[#181A20] text-[#EAECEF]">
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <div
              className={`text-[17px] font-bold tabular-nums truncate ${
                estimatedConvertOut > 0 ? 'text-[#EAECEF]' : 'text-[#474D57]'
              }`}
            >
              {estimatedConvertOut > 0 ? formatPrice(estimatedConvertOut, 6) : '> 0.00000013'}
            </div>
          </div>
        </div>

        <NTButton
          variant="secondary"
          size="md"
          fullWidth
          className="mt-3.5"
          onClick={() => {
            if (parsedConvertAmt <= 0) {
              setExchangeTab('trade');
              setTradeSubTab('convert');
              return;
            }
            const res = executeConvert({
              fromAsset: convertFrom,
              toAsset: convertTo,
              fromAmount: parsedConvertAmt,
              walletType: 'spot',
            });
            if (!res.ok) showToast(res.message);
          }}
        >
          Convert
        </NTButton>
      </NTCard>

      {/* 5. 2-Column Bento Grid: Earn & BNB Sparkline (Matches 00:00 - 00:04, 00:11) */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Left Card: Earn > */}
        <NTCard
          variant="default"
          padding="sm"
          onClick={() => {
            setExchangeTab('assets');
            setAssetsSubTab('earn');
          }}
          className="flex flex-col justify-between cursor-pointer hover:bg-[#202630]/80 transition-colors min-h-[132px]"
        >
          <div className="flex items-center gap-0.5 text-[15px] font-bold text-[#EAECEF]">
            <span>Earn</span>
            <ChevronRight className="w-4 h-4 text-[#848E9C]" />
          </div>

          <div className="space-y-2.5 mt-2.5">
            {EARN_PRODUCTS.slice(0, 2).map((ep) => (
              <div key={ep.id} className="flex items-center gap-2">
                <CoinIcon asset={ep.asset} size="sm" />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#EAECEF] leading-tight">{ep.asset}</div>
                  <div className="text-[11px] text-[#848E9C] tabular-nums leading-tight mt-0.5">
                    APR <span className="text-[#2EBD85] font-semibold">{ep.apr}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </NTCard>

        {/* Right Card: BNB Live Price + Change Below Price + Sparkline (Matches 00:00) */}
        <NTCard
          variant="default"
          padding="sm"
          onClick={() => handleOpenCoin('BNBUSDT')}
          className="flex flex-col justify-between cursor-pointer hover:bg-[#202630]/80 transition-colors overflow-hidden relative min-h-[132px]"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <CoinIcon asset="BNB" size="xs" />
                <span className="text-[14px] font-bold text-[#EAECEF]">BNB</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#848E9C] -ml-0.5" />
              </div>
            </div>

            <div
              className={`text-[19px] font-bold tabular-nums leading-tight mt-1.5 transition-colors duration-300 ${
                bnbTicker?.flash === 'up'
                  ? 'text-[#2EBD85]'
                  : bnbTicker?.flash === 'down'
                  ? 'text-[#F6465D]'
                  : 'text-[#EAECEF]'
              }`}
            >
              {bnbTicker?.lastPrice ? formatPrice(bnbTicker.lastPrice, 2) : '--'}
            </div>

            <div
              className={`text-xs font-semibold tabular-nums mt-0.5 flex items-center gap-0.5 ${
                bnbUp ? 'text-[#2EBD85]' : 'text-[#F6465D]'
              }`}
            >
              <span>{bnbUp ? '▲' : '▼'}</span>
              <span>{Math.abs(bnbTicker?.priceChangePercent || 0).toFixed(2)}%</span>
            </div>
          </div>

          {/* Smooth SVG Sparkline Area Chart */}
          <div className="h-9 w-full mt-1 -mx-1">
            <svg
              viewBox="0 0 120 34"
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="bnbSparkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={bnbUp ? '#2EBD85' : '#F6465D'}
                    stopOpacity="0.28"
                  />
                  <stop
                    offset="100%"
                    stopColor={bnbUp ? '#2EBD85' : '#F6465D'}
                    stopOpacity="0.0"
                  />
                </linearGradient>
              </defs>
              <path
                d="M 0,26 Q 24,23 42,17 T 84,13 T 120,5 L 120,34 L 0,34 Z"
                fill="url(#bnbSparkGrad)"
              />
              <path
                d="M 0,26 Q 24,23 42,17 T 84,13 T 120,5"
                fill="none"
                stroke={bnbUp ? '#2EBD85' : '#F6465D'}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </NTCard>
      </div>

      {/* 6. Stocks Card (NVDA, MU, AMD with 12-Column Grid Alignment — Matches 00:01 - 00:03) */}
      <NTCard variant="default" padding="md">
        <div className="grid grid-cols-12 items-center mb-2">
          <div className="col-span-6">
            <button
              type="button"
              onClick={() => {
                setExchangeTab('trade');
                setTradeSubTab('stocks');
              }}
              className="text-[15px] font-bold text-[#EAECEF] hover:opacity-90 flex items-center gap-0.5"
            >
              <span>Stocks</span>
              <ChevronRight className="w-4 h-4 text-[#848E9C]" />
            </button>
          </div>
          <div className="col-span-3 text-right text-xs text-[#848E9C]">Last Price</div>
          <div className="col-span-3 text-right text-xs text-[#848E9C]">Change(%)</div>
        </div>

        <div className="divide-y divide-[#2B3139]/40">
          {stocks.slice(0, 3).map((st) => (
            <button
              key={st.symbol}
              type="button"
              onClick={() => {
                setExchangeTab('trade');
                setTradeSubTab('stocks');
              }}
              className="w-full py-2.5 grid grid-cols-12 items-center text-left hover:bg-[#202630]/50 rounded-xl px-1 -mx-1 transition-colors"
            >
              <div className="col-span-6 flex items-center gap-2.5 min-w-0">
                <CoinIcon asset={st.symbol} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-bold text-[#EAECEF] truncate">{st.symbol}</div>
                  <div className="text-[11px] text-[#848E9C] truncate mt-0.5">{st.name}</div>
                </div>
              </div>

              <div className="col-span-3 text-right tabular-nums">
                <div className="text-[14px] font-semibold text-[#EAECEF]">
                  {st.lastPrice.toFixed(2)}
                </div>
                <div className="text-[11px] text-[#848E9C] truncate mt-0.5">
                  {formatFiat(st.lastPrice, settings.fiat)}
                </div>
              </div>

              <div className="col-span-3 flex justify-end">
                <span
                  className={`nt-pct-pill ${
                    st.changePercent >= 0 ? 'nt-pct-pill-up' : 'nt-pct-pill-down'
                  }`}
                >
                  {st.changePercent >= 0 ? '+' : ''}
                  {st.changePercent.toFixed(2)}%
                </span>
              </div>
            </button>
          ))}
        </div>
      </NTCard>

      {/* 7. Social / Market Pulse Feed & Watchlist Tabs (Flat Section — Not Boxed in a Card, Matches 00:02 & 00:11) */}
      <div className="pt-1 space-y-3">
        <div className="border-b border-[#2B3139]/60">
          <NTTabs
            variant="underline"
            activeId={feedTab}
            onChange={(id) => setFeedTab(id)}
            items={[
              { id: 'discover', label: 'Discover' },
              { id: 'following', label: 'Following' },
              { id: 'stocks', label: 'Stocks' },
              { id: 'leaderboard', label: 'Leaderboard' },
              { id: 'announcements', label: 'Announcements' },
              { id: 'news', label: 'News' },
            ]}
          />
        </div>

        {/* Compact Quick Watchlist Strip (Favorites | Hot | New | Gainers | Losers | 24h Vol) */}
        <div className="space-y-2">
          <NTTabs
            variant="pill"
            activeId={marketSubTab}
            onChange={(id) => setMarketSubTab(id)}
            items={[
              { id: 'favorites', label: 'Favorites' },
              { id: 'hot', label: 'Hot' },
              { id: 'new', label: 'New' },
              { id: 'gainers', label: 'Gainers' },
              { id: 'losers', label: 'Losers' },
              { id: 'turnover', label: '24h Vol' },
            ]}
          />

          <div className="divide-y divide-[#2B3139]/40">
            {displayedCoins.map((coin) => {
              const isFav = favorites.includes(coin.symbol);
              const isAvailable = coin.lastPrice > 0 && coin.dataProvenance !== 'unavailable';
              return (
                <div
                  key={coin.symbol}
                  onClick={() => handleOpenCoin(coin.symbol)}
                  className="py-2.5 grid grid-cols-12 items-center hover:bg-[#1E2329] rounded-xl px-1.5 -mx-1.5 cursor-pointer transition-colors"
                >
                  <div className="col-span-6 flex items-center gap-2.5 min-w-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(coin.symbol);
                      }}
                      className="text-[#848E9C] hover:text-[#F0B90B] shrink-0"
                      aria-label={`Favorite ${coin.baseAsset}`}
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          isFav ? 'fill-[#F0B90B] text-[#F0B90B]' : ''
                        }`}
                      />
                    </button>
                    <CoinIcon asset={coin.baseAsset} size="sm" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-[14px] font-bold text-[#EAECEF]">
                          {coin.baseAsset}
                        </span>
                        <span className="text-[11px] text-[#848E9C]">/{coin.quoteAsset}</span>
                      </div>
                      <div className="text-[11px] tabular-nums text-[#848E9C] truncate">
                        {isAvailable
                          ? `Vol $${formatCompactNumber(coin.quoteVolume24h)}`
                          : 'Syncing'}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-3 text-right tabular-nums">
                    <div
                      className={`text-[14px] font-semibold ${
                        coin.flash === 'up'
                          ? 'text-[#2EBD85]'
                          : coin.flash === 'down'
                          ? 'text-[#F6465D]'
                          : 'text-[#EAECEF]'
                      }`}
                    >
                      {isAvailable ? formatPrice(coin.lastPrice) : '--'}
                    </div>
                    <div className="text-[11px] text-[#848E9C] truncate">
                      {isAvailable ? formatFiat(coin.lastPrice, settings.fiat) : '--'}
                    </div>
                  </div>

                  <div className="col-span-3 flex justify-end">
                    <span
                      className={`nt-pct-pill ${
                        !isAvailable
                          ? 'nt-pct-pill-flat'
                          : coin.priceChangePercent >= 0
                          ? 'nt-pct-pill-up'
                          : 'nt-pct-pill-down'
                      }`}
                    >
                      {!isAvailable
                        ? '--'
                        : `${coin.priceChangePercent >= 0 ? '+' : ''}${coin.priceChangePercent.toFixed(2)}%`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Context-Aware Feed Content based on feedTab */}
        <div className="divide-y divide-[#2B3139]/60 pt-1">
          {(feedTab === 'discover'
            ? [
                {
                  author: 'Crypto Master 786',
                  handle: 'Nov 7 · Verified Pulse',
                  title: `Live ${btcTicker?.baseAsset || 'BTC'} Order Flow & Institutional Liquidity Update`,
                  body: `Spot ${btcTicker?.baseAsset || 'BTC'}/USDT is trading at $${
                    btcTicker?.lastPrice ? formatPrice(btcTicker.lastPrice) : '--'
                  } (${
                    (btcTicker?.priceChangePercent || 0) >= 0 ? '+' : ''
                  }${(btcTicker?.priceChangePercent || 0).toFixed(2)}%) alongside ETH at $${
                    ethTicker?.lastPrice ? formatPrice(ethTicker.lastPrice) : '--'
                  } and SOL at $${solTicker?.lastPrice ? formatPrice(solTicker.lastPrice) : '--'}.`,
                  tag: 'BTCUSDT',
                  change: btcTicker?.priceChangePercent || 0,
                  symbol: 'BTCUSDT',
                },
                {
                  author: 'Nexus Macro Desk',
                  handle: '1h · Derivatives Analytics',
                  title: 'Implied Volatility & Perpetual Funding Rate Monitor',
                  body: 'Inspect live USDⓈ-M and COIN-M perpetuals or explore the Options chain with real-time underlying spot feeds.',
                  tag: 'ETHUSDT',
                  change: ethTicker?.priceChangePercent || 0,
                  symbol: 'ETHUSDT',
                },
              ]
            : feedTab === 'following'
            ? favorites.slice(0, 3).map((sym) => {
                const tk = tickers[sym] || btcTicker;
                return {
                  author: `${tk?.baseAsset || 'BTC'} Ecosystem Desk`,
                  handle: 'Following · Watchlist Alert',
                  title: `${tk?.name || 'Bitcoin'} (${tk?.baseAsset}/USDT) 24h Range & Depth`,
                  body: `24h High $${formatPrice(tk?.high24h || 0)} · 24h Low $${formatPrice(
                    tk?.low24h || 0
                  )} · 24h Volume $${formatCompactNumber(tk?.quoteVolume24h || 0)}.`,
                  tag: tk?.symbol || 'BTCUSDT',
                  change: tk?.priceChangePercent || 0,
                  symbol: tk?.symbol || 'BTCUSDT',
                };
              })
            : feedTab === 'stocks'
            ? stocks.slice(0, 3).map((st) => ({
                author: `${st.symbol} Equity Research`,
                handle: `${st.sector} · Tokenized Stock`,
                title: `${st.name} (${st.symbol}) Trading at $${st.lastPrice.toFixed(2)}`,
                body: `Sector: ${st.sector} · 24h Volume $${formatCompactNumber(
                  st.volumeUsd
                )}. Trade fractional shares 24/7 with USDT settlement.`,
                tag: st.symbol,
                change: st.changePercent,
                symbol: 'BTCUSDT',
              }))
            : feedTab === 'leaderboard'
            ? [...tickerList]
                .sort((a, b) => b.priceChangePercent - a.priceChangePercent)
                .slice(0, 3)
                .map((tk, i) => ({
                  author: `Rank #${i + 1} · ${tk.baseAsset}/USDT`,
                  handle: `${tk.category} · Top 24h Mover`,
                  title: `${tk.name} leads 24h performance at $${formatPrice(tk.lastPrice)}`,
                  body: `24h Quote Volume: $${formatCompactNumber(
                    tk.quoteVolume24h
                  )} USDT · Market Cap $${formatCompactNumber(tk.marketCap)}.`,
                  tag: tk.symbol,
                  change: tk.priceChangePercent,
                  symbol: tk.symbol,
                }))
            : feedTab === 'announcements'
            ? [
                {
                  author: 'NexusTrade Official',
                  handle: 'System Announcement · Verified',
                  title: 'Zero-Fee Instant Convert & Multi-Chain Self-Custody Vault Active',
                  body: 'Instant conversions across USDT, BTC, ETH, BNB, SOL, and USDC settle with zero trading fee on your internal ledger.',
                  tag: 'BNBUSDT',
                  change: bnbTicker?.priceChangePercent || 0,
                  symbol: 'BNBUSDT',
                },
                {
                  author: 'Nexus Derivatives Notice',
                  handle: 'Futures & Options · Update',
                  title: 'USDⓈ-M, COIN-M & European Options Chain Live Pricing',
                  body: 'Real-time Black-Scholes Greeks and multi-asset margin transfers are enabled across all supported contracts.',
                  tag: 'SOLUSDT',
                  change: solTicker?.priceChangePercent || 0,
                  symbol: 'SOLUSDT',
                },
              ]
            : [
                {
                  author: 'Nexus Market Wire',
                  handle: 'Live Flash · Global Markets',
                  title: `Total Crypto & Tokenized Equity Liquidity Stream Active`,
                  body: `BTC ($${formatPrice(btcTicker?.lastPrice || 0)}), ETH ($${formatPrice(
                    ethTicker?.lastPrice || 0
                  )}), and BNB ($${formatPrice(
                    bnbTicker?.lastPrice || 0
                  )}) streaming live tick updates.`,
                  tag: 'BTCUSDT',
                  change: btcTicker?.priceChangePercent || 0,
                  symbol: 'BTCUSDT',
                },
              ]
          ).map((post, idx) => (
            <div
              key={idx}
              onClick={() => {
                if (feedTab === 'stocks') {
                  setExchangeTab('trade');
                  setTradeSubTab('stocks');
                } else {
                  handleOpenCoin(post.symbol);
                }
              }}
              className="py-3.5 space-y-2 cursor-pointer hover:opacity-95 transition-opacity"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#202630] flex items-center justify-center text-xs font-bold text-[#F0B90B]">
                    {post.author[0]}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#EAECEF]">{post.author}</div>
                    <div className="text-[11px] text-[#848E9C]">{post.handle}</div>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold tabular-nums ${
                    post.change >= 0
                      ? 'bg-[#2EBD85]/15 text-[#2EBD85]'
                      : 'bg-[#F6465D]/15 text-[#F6465D]'
                  }`}
                >
                  {post.tag} {post.change >= 0 ? '+' : ''}
                  {post.change.toFixed(2)}%
                </span>
              </div>
              <div className="text-sm font-bold text-[#EAECEF] leading-snug">{post.title}</div>
              <p className="text-xs text-[#848E9C] leading-relaxed">{post.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
