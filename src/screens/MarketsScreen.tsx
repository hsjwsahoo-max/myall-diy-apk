import React, { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Bell,
  ChevronRight,
  Clock,
  Edit3,
  Flame,
  MoreHorizontal,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  TrendingUp,
  Zap,
} from 'lucide-react';
import {
  CoinIcon,
  formatCompactNumber,
  formatFiat,
  formatPrice,
} from '../components/CoinIcon';
import { NTButton, NTCard, NTSearchBar, NTTabs } from '../components/ui/DesignSystem';
import { useExchange } from '../context/ExchangeContext';

export const MarketsScreen: React.FC = () => {
  const {
    tickerList,
    tickers,
    stocks,
    favorites,
    toggleFavorite,
    setFavoritesList,
    settings,
    setActiveSymbol,
    setCoinDetailSymbol,
    setExchangeTab,
    setTradeSubTab,
    setFuturesSubTab,
    priceAlerts,
    addPriceAlert,
    removePriceAlert,
    isRefreshingMarket,
    refreshMarketData,
    showToast,
  } = useExchange();

  const [topTab, setTopTab] = useState<
    'for_you' | 'favorites' | 'crypto' | 'tradfi' | 'alpha' | 'data'
  >('for_you');
  const [cryptoSubTab, setCryptoSubTab] = useState<
    'for_you' | 'spot' | 'usdm' | 'coinm' | 'options'
  >('spot');
  const [tradFiSubTab, setTradFiSubTab] = useState<'stocks' | 'spot' | 'usdm' | 'options'>(
    'stocks'
  );
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [tradFiFilter, setTradFiFilter] = useState<
    'All' | 'Popular' | 'US Stocks' | 'ETFs' | 'New'
  >('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'volume' | 'price' | 'change' | 'mcap'>('volume');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [tradFiSortBy, setTradFiSortBy] = useState<'volume' | 'price' | 'change'>('volume');
  const [tradFiSortAsc, setTradFiSortAsc] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState<boolean>(false);
  const [isEditFavoritesOpen, setIsEditFavoritesOpen] = useState<boolean>(false);
  const [favSearchQuery, setFavSearchQuery] = useState<string>('');
  const [alertSym, setAlertSym] = useState('BTCUSDT');
  const [alertPrice, setAlertPrice] = useState('82000');

  const categories = [
    'All',
    'Layer 1',
    'Solana',
    'DeFi',
    'Meme',
    'AI',
    'Payments',
    'Stablecoin',
  ];

  const liveValidCoins = useMemo(
    () => tickerList.filter((c) => c.lastPrice > 0 && c.dataProvenance !== 'unavailable'),
    [tickerList]
  );

  const hotListCoins = useMemo(() => {
    const priority = ['BNBUSDT', 'BTCUSDT', 'SOLUSDT', 'ETHUSDT', 'XRPUSDT', 'TRUMPUSDT'];
    const found = priority
      .map((sym) => liveValidCoins.find((c) => c.symbol === sym))
      .filter((c): c is NonNullable<typeof c> => Boolean(c));
    return found.length >= 3 ? found.slice(0, 3) : [...liveValidCoins].slice(0, 3);
  }, [liveValidCoins]);

  const newListingCoins = useMemo(() => {
    const flagged = liveValidCoins.filter((c) => c.isNewListing);
    return (flagged.length >= 3 ? flagged : liveValidCoins).slice(0, 3);
  }, [liveValidCoins]);

  const topGainerCoins = useMemo(
    () =>
      [...liveValidCoins]
        .sort((a, b) => b.priceChangePercent - a.priceChangePercent)
        .slice(0, 3),
    [liveValidCoins]
  );

  const topVolumeCoins = useMemo(
    () => [...liveValidCoins].sort((a, b) => b.quoteVolume24h - a.quoteVolume24h).slice(0, 3),
    [liveValidCoins]
  );

  const filteredAndSortedCoins = useMemo(() => {
    let list = [...tickerList];

    if (topTab === 'favorites') {
      list = list.filter((c) => favorites.includes(c.symbol));
    } else if (topTab === 'alpha') {
      list = list.filter((c) => ['Meme', 'AI', 'Solana'].includes(c.category));
    } else if (categoryFilter !== 'All') {
      list = list.filter((c) => c.category === categoryFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.baseAsset.toLowerCase().includes(q) ||
          c.quoteAsset.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          c.symbol.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      let diff = 0;
      if (sortBy === 'volume') diff = b.quoteVolume24h - a.quoteVolume24h;
      if (sortBy === 'price') diff = b.lastPrice - a.lastPrice;
      if (sortBy === 'change') diff = b.priceChangePercent - a.priceChangePercent;
      if (sortBy === 'mcap') diff = b.marketCap - a.marketCap;
      return sortAsc ? -diff : diff;
    });

    return list;
  }, [tickerList, topTab, favorites, categoryFilter, searchQuery, sortBy, sortAsc]);

  const filteredAndSortedStocks = useMemo(() => {
    let list = [...stocks];
    if (tradFiFilter === 'Popular') {
      list = list.filter((s) => s.isPopular);
    } else if (tradFiFilter === 'US Stocks') {
      list = list.filter((s) => s.sector === 'US Stocks');
    } else if (tradFiFilter === 'ETFs') {
      list = list.filter((s) => s.sector === 'ETFs');
    } else if (tradFiFilter === 'New') {
      list = list.filter((s) => s.isNew);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.symbol.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          s.sector.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      let diff = 0;
      if (tradFiSortBy === 'volume') diff = b.volumeUsd - a.volumeUsd;
      if (tradFiSortBy === 'price') diff = b.lastPrice - a.lastPrice;
      if (tradFiSortBy === 'change') diff = b.changePercent - a.changePercent;
      return tradFiSortAsc ? -diff : diff;
    });

    return list;
  }, [stocks, tradFiFilter, searchQuery, tradFiSortBy, tradFiSortAsc]);

  const handleSortClick = (field: 'volume' | 'price' | 'change' | 'mcap') => {
    if (sortBy === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(field);
      setSortAsc(false);
    }
  };

  const handleTradFiSortClick = (field: 'volume' | 'price' | 'change') => {
    if (tradFiSortBy === field) {
      setTradFiSortAsc(!tradFiSortAsc);
    } else {
      setTradFiSortBy(field);
      setTradFiSortAsc(false);
    }
  };

  const moveFavoriteOrder = (symbol: string, direction: 'up' | 'down') => {
    const idx = favorites.indexOf(symbol);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= favorites.length) return;
    const next = [...favorites];
    const [removed] = next.splice(idx, 1);
    next.splice(targetIdx, 0, removed);
    setFavoritesList(next);
  };

  const renderForYouDashboard = () => {
    const trackerCoin =
      tickers.TRUMPUSDT ||
      liveValidCoins.find((c) => c.priceChangePercent < 0) ||
      liveValidCoins[0];
    const bnbCoin = tickers.BNBUSDT || liveValidCoins[1];
    const btcCoin = tickers.BTCUSDT || liveValidCoins[2];
    const trackerChg = trackerCoin?.priceChangePercent ?? -5.09;
    const trackerUp = trackerChg >= 0;

    return (
      <div className="space-y-4 pt-1">
        {/* 1. Smart Tracker - Mine Card (Matches Reference 00:13) */}
        <NTCard
          variant="default"
          padding="md"
          onClick={() => {
            if (trackerCoin) {
              setActiveSymbol(trackerCoin.symbol);
              setCoinDetailSymbol(trackerCoin.symbol);
            }
          }}
          className="space-y-3 cursor-pointer hover:bg-[#202630]/80 transition-colors"
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#EAECEF] text-[14px]">Smart Tracker - Mine</span>
            <span className="text-[#848E9C] flex items-center gap-0.5 tabular-nums">
              <span>Triggered</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <CoinIcon asset={trackerCoin?.baseAsset || 'TRUMP'} size="md" />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[15px] font-bold text-[#EAECEF]">
                    {trackerCoin?.baseAsset || 'TRUMP'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs mt-0.5 tabular-nums">
                  <span className="text-[#848E9C]">{trackerUp ? 'Breakout' : 'Pullback'}</span>
                  <span className={`font-bold ${trackerUp ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>
                    {trackerUp ? '+' : ''}
                    {trackerChg.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Mini Sparkline with Event Dot */}
            <div className="w-24 h-10 shrink-0">
              <svg viewBox="0 0 96 36" className="w-full h-full overflow-visible">
                <path
                  d={
                    trackerUp
                      ? 'M 2,28 Q 24,24 44,12 T 92,6'
                      : 'M 2,18 Q 28,6 48,14 T 92,30'
                  }
                  fill="none"
                  stroke={trackerUp ? '#0ECB81' : '#F6465D'}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="46" cy="13" r="3" fill="#F0B90B" />
              </svg>
            </div>
          </div>

          <div className="rounded-xl bg-[#202630] px-3 py-2 flex items-center justify-between gap-2 text-xs text-[#848E9C]">
            <div className="flex items-center gap-1.5 min-w-0">
              <Zap className="w-3.5 h-3.5 text-[#F0B90B] shrink-0" />
              <span className="truncate">
                The price moved notably on 24h volume of $
                {formatCompactNumber(trackerCoin?.quoteVolume24h || 42500000)}
              </span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          </div>
        </NTCard>

        {/* 2. Master Trades > 3-Column Strip (Matches Reference 00:13) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setTopTab('tradfi')}
              className="nt-heading-section flex items-center gap-0.5"
            >
              <span>Master Trades</span>
              <ChevronRight className="w-4 h-4 text-[#848E9C]" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              {
                manager: 'John Rogers Ho...',
                rows: [
                  { sym: stocks[0]?.symbol || 'NVDA', chg: stocks[0]?.changePercent },
                  { sym: stocks[1]?.symbol || 'MU', chg: stocks[1]?.changePercent },
                ],
              },
              {
                manager: 'Prem Watsa Hol...',
                rows: [
                  { sym: stocks[2]?.symbol || 'AMD', chg: stocks[2]?.changePercent },
                  { sym: stocks[3]?.symbol || 'AAPL', chg: stocks[3]?.changePercent },
                ],
              },
              {
                manager: 'Peltz Hold...',
                rows: [
                  { sym: stocks[4]?.symbol || 'TSLA', chg: stocks[4]?.changePercent ?? 2.7 },
                  { sym: stocks[5]?.symbol || 'MSFT', chg: stocks[5]?.changePercent },
                ],
              },
            ].map((fund) => (
              <NTCard
                key={fund.manager}
                variant="default"
                padding="sm"
                onClick={() => setTopTab('tradfi')}
                className="space-y-2 cursor-pointer hover:bg-[#202630]/80 transition-colors"
              >
                <div className="text-xs font-bold text-[#EAECEF] truncate">{fund.manager}</div>
                <div className="space-y-1.5">
                  {fund.rows.map((r) => (
                    <div
                      key={r.sym}
                      className="flex items-center justify-between text-[11px] tabular-nums"
                    >
                      <span className="text-[#848E9C] font-medium truncate">{r.sym}</span>
                      <span
                        className={`font-semibold ${
                          r.chg === undefined
                            ? 'text-[#848E9C]'
                            : r.chg >= 0
                            ? 'text-[#0ECB81]'
                            : 'text-[#F6465D]'
                        }`}
                      >
                        {r.chg === undefined
                          ? '--'
                          : `${r.chg >= 0 ? '+' : ''}${r.chg.toFixed(2)}%`}
                      </span>
                    </div>
                  ))}
                </div>
              </NTCard>
            ))}
          </div>
        </div>

        {/* 3. Indices > Card with Inflow/Outflow Bar & 3-Column Live Ticker Strip (Matches 00:13) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setTopTab('crypto')}
              className="nt-heading-section flex items-center gap-0.5"
            >
              <span>Indices</span>
              <ChevronRight className="w-4 h-4 text-[#848E9C]" />
            </button>
          </div>

          <NTCard variant="default" padding="md" className="space-y-3">
            <div className="flex items-center gap-2">
              <CoinIcon asset={trackerCoin?.baseAsset || 'TRUMP'} size="xs" />
              <span className="text-sm font-bold text-[#EAECEF]">
                {trackerCoin?.baseAsset || 'TRUMP'}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#2B3139] text-[#848E9C] text-[10px] font-semibold">
                FLAT
              </span>
            </div>

            {/* Dual Green/Red Inflow/Outflow Progress Bar */}
            <div className="space-y-1.5">
              <div className="h-1.5 w-full rounded-full overflow-hidden flex gap-0.5 bg-[#202630]">
                <div className="h-full w-[51%] bg-[#0ECB81] rounded-l-full" />
                <div className="h-full w-[49%] bg-[#F6465D] rounded-r-full" />
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#848E9C] tabular-nums">
                <span>Inflow: 5.56M {trackerCoin?.baseAsset || 'TRUMP'}</span>
                <span>Outflow: 5.48M {trackerCoin?.baseAsset || 'TRUMP'}</span>
              </div>
            </div>

            {/* 3-Column Live Ticker Strip */}
            <div className="pt-3 border-t border-[#2B3139]/60 grid grid-cols-3 gap-2 tabular-nums">
              {[trackerCoin, bnbCoin, btcCoin].filter(Boolean).map((coin) => {
                const c = coin!;
                const isUp = c.priceChangePercent >= 0;
                return (
                  <button
                    key={c.symbol}
                    type="button"
                    onClick={() => {
                      setActiveSymbol(c.symbol);
                      setCoinDetailSymbol(c.symbol);
                    }}
                    className="text-left hover:opacity-85 transition-opacity"
                  >
                    <div className="text-xs font-bold text-[#EAECEF] truncate">{c.baseAsset}</div>
                    <div className="flex items-baseline gap-1 mt-0.5 flex-wrap">
                      <span className="text-xs text-[#848E9C]">{formatPrice(c.lastPrice)}</span>
                      <span
                        className={`text-[11px] font-semibold ${
                          isUp ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                        }`}
                      >
                        {isUp ? '+' : ''}
                        {c.priceChangePercent.toFixed(2)}%
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </NTCard>
        </div>

        {/* 4. Live Market Intelligence 2x2 Grid (Hot Lists, New Listings, Top Gainers, Top Volume) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {[
            {
              title: 'Hot Lists',
              icon: <Flame className="w-3.5 h-3.5 text-[#F0B90B]" />,
              items: hotListCoins,
              metricMode: 'change' as const,
            },
            {
              title: 'New Listings',
              icon: <Sparkles className="w-3.5 h-3.5 text-[#FCD535]" />,
              items: newListingCoins,
              metricMode: 'change' as const,
            },
            {
              title: 'Top Gainers',
              icon: <TrendingUp className="w-3.5 h-3.5 text-[#0ECB81]" />,
              items: topGainerCoins,
              metricMode: 'change' as const,
            },
            {
              title: 'Top Volume',
              icon: <ArrowUpDown className="w-3.5 h-3.5 text-[#F0B90B]" />,
              items: topVolumeCoins,
              metricMode: 'volume' as const,
            },
          ].map((card) => (
            <NTCard key={card.title} variant="default" padding="sm" className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#EAECEF]">
                <span className="flex items-center gap-1.5">
                  {card.icon}
                  {card.title}
                </span>
                <span className="text-[10px] font-normal text-[#848E9C]">24h</span>
              </div>

              <div className="space-y-1.5">
                {card.items.map((c, idx) => (
                  <button
                    key={c.symbol}
                    type="button"
                    onClick={() => {
                      setActiveSymbol(c.symbol);
                      setCoinDetailSymbol(c.symbol);
                    }}
                    className="w-full flex items-center justify-between py-1 px-1.5 rounded-lg hover:bg-[#202630] text-left transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] tabular-nums font-bold text-[#848E9C] w-3">
                        {idx + 1}
                      </span>
                      <CoinIcon asset={c.baseAsset} size="xs" />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-[#EAECEF]">{c.baseAsset}</span>
                        <span className="text-[10px] text-[#848E9C]">/{c.quoteAsset}</span>
                      </div>
                    </div>
                    <div className="text-right tabular-nums">
                      <div className="text-xs font-semibold text-[#EAECEF]">
                        ${formatPrice(c.lastPrice)}
                      </div>
                      {card.metricMode === 'volume' ? (
                        <div className="text-[10px] text-[#848E9C]">
                          Vol ${formatCompactNumber(c.quoteVolume24h)}
                        </div>
                      ) : (
                        <div
                          className={`text-[10px] font-bold ${
                            c.priceChangePercent >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                          }`}
                        >
                          {c.priceChangePercent >= 0 ? '+' : ''}
                          {c.priceChangePercent.toFixed(2)}%
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </NTCard>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3 pb-4 relative max-w-full overflow-x-hidden">
      {/* 1. Reference Search Bar + 3-Dot Menu (Matches 00:13) */}
      <div className="flex items-center gap-2">
        <NTSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search coins and trends"
          className="flex-1"
        />
        <button
          type="button"
          onClick={() => refreshMarketData()}
          disabled={isRefreshingMarket}
          className="w-9 h-9 rounded-xl bg-[#202630] hover:bg-[#2B3139] flex items-center justify-center text-[#848E9C] hover:text-[#EAECEF] shrink-0 transition-colors disabled:opacity-60"
          aria-label="Refresh Market Prices"
          title="Refresh Market Prices"
        >
          <RefreshCw
            className={`w-4 h-4 ${isRefreshingMarket ? 'animate-spin text-[#F0B90B]' : ''}`}
          />
        </button>
        <button
          type="button"
          onClick={() => setIsMenuOpen((v) => !v)}
          className="w-9 h-9 rounded-xl bg-[#202630] hover:bg-[#2B3139] flex items-center justify-center text-[#848E9C] hover:text-[#EAECEF] shrink-0 transition-colors"
          aria-label="Markets Menu"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div className="absolute right-0 top-11 z-30 w-60 rounded-2xl bg-[#202630] border border-[#2B3139] shadow-2xl p-1.5 space-y-1">
          <button
            type="button"
            disabled={isRefreshingMarket}
            onClick={() => {
              setIsMenuOpen(false);
              refreshMarketData();
            }}
            className="w-full px-3 py-2.5 rounded-xl hover:bg-[#2B3139] flex items-center gap-2.5 text-xs font-semibold text-[#EAECEF] text-left"
          >
            <RefreshCw
              className={`w-4 h-4 text-[#FCD535] ${isRefreshingMarket ? 'animate-spin' : ''}`}
            />
            Refresh Live Market Prices
          </button>
          <button
            type="button"
            onClick={() => {
              setIsMenuOpen(false);
              setIsEditFavoritesOpen(true);
            }}
            className="w-full px-3 py-2.5 rounded-xl hover:bg-[#2B3139] flex items-center gap-2.5 text-xs font-semibold text-[#EAECEF] text-left"
          >
            <Edit3 className="w-4 h-4 text-[#FCD535]" />
            Edit Favorites ({favorites.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setIsMenuOpen(false);
              setIsAlertsModalOpen(true);
            }}
            className="w-full px-3 py-2.5 rounded-xl hover:bg-[#2B3139] flex items-center gap-2.5 text-xs font-semibold text-[#EAECEF] text-left"
          >
            <Bell className="w-4 h-4 text-[#FCD535]" />
            Price Alerts ({priceAlerts.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setIsMenuOpen(false);
              showToast('Chart timezone synced to UTC+0 (24h rolling)');
            }}
            className="w-full px-3 py-2.5 rounded-xl hover:bg-[#2B3139] flex items-center gap-2.5 text-xs font-semibold text-[#EAECEF] text-left"
          >
            <Clock className="w-4 h-4 text-[#848E9C]" />
            Change(%) &amp; Chart Timezone
          </button>
        </div>
      )}

      {/* 2. Primary Category Tabs: For You | Favorites | Crypto | TradFi | Alpha | Data (Matches 00:13) */}
      <div className="flex items-center gap-5 overflow-x-auto no-scrollbar py-0.5">
        {[
          { id: 'for_you', label: 'For You' },
          { id: 'favorites', label: 'Favorites' },
          { id: 'crypto', label: 'Crypto' },
          { id: 'tradfi', label: 'TradFi' },
          { id: 'alpha', label: 'Alpha' },
          { id: 'data', label: 'Square' },
        ].map((t) => {
          const active = topTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTopTab(t.id as any)}
              className={`py-1 whitespace-nowrap shrink-0 transition-colors ${
                active
                  ? 'text-[16px] font-bold text-[#EAECEF]'
                  : 'text-[14px] font-medium text-[#848E9C] hover:text-[#EAECEF]'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Top-Level "For You" View */}
      {topTab === 'for_you' && !searchQuery.trim() && renderForYouDashboard()}
      {topTab === 'for_you' && searchQuery.trim() && (
        <div className="divide-y divide-[#2B3139]/40">
          {filteredAndSortedCoins.map((coin) => {
            const isFav = favorites.includes(coin.symbol);
            const isAvailable = coin.lastPrice > 0 && coin.dataProvenance !== 'unavailable';
            return (
              <div
                key={coin.symbol}
                onClick={() => {
                  setActiveSymbol(coin.symbol);
                  setCoinDetailSymbol(coin.symbol);
                }}
                className="py-2.5 grid grid-cols-12 items-center hover:bg-[#1E2329] px-1 rounded-xl cursor-pointer transition-colors"
              >
                <div className="col-span-6 flex items-center gap-2.5 min-w-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(coin.symbol);
                    }}
                    className="text-[#848E9C] hover:text-[#FCD535] shrink-0"
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${isFav ? 'fill-[#FCD535] text-[#FCD535]' : ''}`}
                    />
                  </button>
                  <CoinIcon asset={coin.baseAsset} size="sm" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold text-[#EAECEF]">{coin.baseAsset}</span>
                      <span className="text-[11px] text-[#848E9C]">/{coin.quoteAsset}</span>
                    </div>
                    <div className="text-[11px] tabular-nums text-[#848E9C] truncate">
                      {isAvailable ? `$${formatCompactNumber(coin.quoteVolume24h)}` : 'Syncing'}
                    </div>
                  </div>
                </div>
                <div className="col-span-3 text-right tabular-nums">
                  <div className="text-sm font-semibold text-[#EAECEF]">
                    {isAvailable ? formatPrice(coin.lastPrice) : '--'}
                  </div>
                  <div className="text-[11px] text-[#848E9C]">
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
      )}

      {/* =========================================================
          TRADFI VIEW (Stocks | Spot | USDⓈ-M | Options)
         ========================================================= */}
      {topTab === 'tradfi' && (
        <div className="space-y-3">
          <div className="border-b border-[#2B3139]/60">
            <NTTabs
              variant="underline"
              activeId={tradFiSubTab}
              onChange={(id) => {
                setTradFiSubTab(id);
                if (id === 'options') {
                  setExchangeTab('futures');
                  setFuturesSubTab('options');
                }
              }}
              items={[
                { id: 'stocks', label: 'Stocks' },
                { id: 'spot', label: 'Spot' },
                { id: 'usdm', label: 'USDⓈ-M' },
                { id: 'options', label: 'Options' },
              ]}
            />
          </div>

          <NTTabs
            variant="pill"
            activeId={tradFiFilter}
            onChange={(id) => setTradFiFilter(id)}
            items={[
              { id: 'All', label: 'All' },
              { id: 'Popular', label: 'Popular' },
              { id: 'US Stocks', label: 'US Stocks' },
              { id: 'ETFs', label: 'ETFs' },
              { id: 'New', label: 'New' },
            ]}
          />

          {/* Sortable Column Headers */}
          <div className="grid grid-cols-12 text-[11px] text-[#848E9C] px-1">
            <div className="col-span-6">
              <button
                type="button"
                onClick={() => handleTradFiSortClick('volume')}
                className="flex items-center gap-1 hover:text-[#EAECEF]"
              >
                <span>Name / Vol</span>
                <ArrowUpDown className="w-3 h-3" />
              </button>
            </div>
            <div className="col-span-3 flex justify-end">
              <button
                type="button"
                onClick={() => handleTradFiSortClick('price')}
                className="flex items-center gap-1 hover:text-[#EAECEF]"
              >
                <span>Last Price</span>
                <ArrowUpDown className="w-3 h-3" />
              </button>
            </div>
            <div className="col-span-3 flex justify-end">
              <button
                type="button"
                onClick={() => handleTradFiSortClick('change')}
                className="flex items-center gap-1 hover:text-[#EAECEF]"
              >
                <span>Change(%)</span>
                <ArrowUpDown className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Stock / TradFi Spot / TradFi Perp Rows */}
          <div className="divide-y divide-[#2B3139]/40">
            {filteredAndSortedStocks.map((st) => (
              <button
                key={st.symbol}
                type="button"
                onClick={() => {
                  if (tradFiSubTab === 'usdm') {
                    setExchangeTab('futures');
                    setFuturesSubTab('usdm');
                  } else {
                    setExchangeTab('trade');
                    setTradeSubTab('stocks');
                  }
                }}
                className="w-full py-2.5 grid grid-cols-12 items-center text-left hover:bg-[#1E2329] px-1 rounded-xl transition-colors"
              >
                <div className="col-span-6 flex items-center gap-2.5 min-w-0">
                  <CoinIcon asset={st.symbol} size="sm" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[14px] font-bold text-[#EAECEF]">
                        {tradFiSubTab === 'spot'
                          ? `${st.symbol}/USDT`
                          : tradFiSubTab === 'usdm'
                          ? `${st.symbol}USDT`
                          : st.symbol}
                      </span>
                      {tradFiSubTab === 'usdm' ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2B3139] text-[#F0B90B] font-mono font-semibold">
                          Perp 20x
                        </span>
                      ) : (
                        st.sector === 'ETFs' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2B3139] text-[#848E9C] font-medium">
                            ETF
                          </span>
                        )
                      )}
                    </div>
                    <div className="text-[11px] tabular-nums text-[#848E9C] truncate">
                      {st.name} · ${formatCompactNumber(st.volumeUsd)}
                    </div>
                  </div>
                </div>
                <div className="col-span-3 text-right tabular-nums">
                  <div className="text-[14px] font-semibold text-[#EAECEF]">
                    {st.lastPrice.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-[#848E9C]">
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
        </div>
      )}

      {/* =========================================================
          SQUARE / MARKET ANALYTICS TAB
         ========================================================= */}
      {topTab === 'data' && (
        <div className="space-y-3 pt-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <NTCard variant="default" padding="md" className="space-y-2">
              <div className="text-xs font-bold text-[#848E9C]">24h Top Gainers</div>
              {topGainerCoins.map((c) => (
                <button
                  key={c.symbol}
                  type="button"
                  onClick={() => {
                    setActiveSymbol(c.symbol);
                    setCoinDetailSymbol(c.symbol);
                  }}
                  className="w-full flex items-center justify-between py-1.5 hover:opacity-85 text-left"
                >
                  <div className="flex items-center gap-2">
                    <CoinIcon asset={c.baseAsset} size="sm" />
                    <span className="text-xs font-bold text-[#EAECEF]">
                      {c.baseAsset}/{c.quoteAsset}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 tabular-nums text-xs">
                    <span className="text-[#EAECEF]">${formatPrice(c.lastPrice)}</span>
                    <span className="font-bold text-[#2EBD85]">
                      +{c.priceChangePercent.toFixed(2)}%
                    </span>
                  </div>
                </button>
              ))}
            </NTCard>

            <NTCard variant="default" padding="md" className="space-y-2">
              <div className="text-xs font-bold text-[#848E9C]">24h Highest Volume (USDT)</div>
              {topVolumeCoins.map((c) => (
                <button
                  key={c.symbol}
                  type="button"
                  onClick={() => {
                    setActiveSymbol(c.symbol);
                    setCoinDetailSymbol(c.symbol);
                  }}
                  className="w-full flex items-center justify-between py-1.5 hover:opacity-85 text-left"
                >
                  <div className="flex items-center gap-2">
                    <CoinIcon asset={c.baseAsset} size="sm" />
                    <span className="text-xs font-bold text-[#EAECEF]">
                      {c.baseAsset}/{c.quoteAsset}
                    </span>
                  </div>
                  <span className="text-xs tabular-nums font-bold text-[#EAECEF]">
                    ${formatCompactNumber(c.quoteVolume24h)}
                  </span>
                </button>
              ))}
            </NTCard>
          </div>
        </div>
      )}

      {/* =========================================================
          CRYPTO / FAVORITES / ALPHA MARKET LIST
         ========================================================= */}
      {(topTab === 'crypto' || topTab === 'favorites' || topTab === 'alpha') && (
        <div className="space-y-2.5">
          {/* Subtabs: Spot | USDⓈ-M | COIN-M | Options */}
          <div className="border-b border-[#2B3139]/60">
            <NTTabs
              variant="underline"
              activeId={cryptoSubTab}
              onChange={(id) => {
                setCryptoSubTab(id);
                if (id === 'options') {
                  setExchangeTab('futures');
                  setFuturesSubTab('options');
                }
              }}
              items={[
                { id: 'spot', label: 'Spot' },
                { id: 'usdm', label: 'USDⓈ-M' },
                { id: 'coinm', label: 'COIN-M' },
                { id: 'options', label: 'Options' },
                { id: 'for_you', label: 'Overview' },
              ]}
              rightSlot={
                topTab === 'favorites' ? (
                  <button
                    type="button"
                    onClick={() => setIsEditFavoritesOpen(true)}
                    className="text-xs font-semibold text-[#F0B90B] flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                ) : undefined
              }
            />
          </div>

          {cryptoSubTab === 'for_you' && !searchQuery.trim() ? (
            renderForYouDashboard()
          ) : (
            <>
              {/* Category Filter Pills */}
              {topTab === 'crypto' && (
                <NTTabs
                  variant="pill"
                  activeId={categoryFilter}
                  onChange={(id) => setCategoryFilter(id)}
                  items={categories.map((c) => ({ id: c, label: c }))}
                />
              )}

              {/* Sortable Column Headers */}
              <div className="grid grid-cols-12 text-[11px] text-[#848E9C] px-1 pt-0.5">
                <div className="col-span-6 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSortClick('volume')}
                    className="flex items-center gap-1 hover:text-[#EAECEF]"
                  >
                    <span>Name / Vol</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </div>
                <div className="col-span-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleSortClick('price')}
                    className="flex items-center gap-1 hover:text-[#EAECEF]"
                  >
                    <span>Last Price</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </div>
                <div className="col-span-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleSortClick('change')}
                    className="flex items-center gap-1 hover:text-[#EAECEF]"
                  >
                    <span>24h Chg%</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Coin Rows */}
              <div className="divide-y divide-[#2B3139]/40">
                {filteredAndSortedCoins.map((coin) => {
                  const isFav = favorites.includes(coin.symbol);
                  const isAvailable = coin.lastPrice > 0 && coin.dataProvenance !== 'unavailable';
                  return (
                    <div
                      key={coin.symbol}
                      onClick={() => {
                        setActiveSymbol(coin.symbol);
                        setCoinDetailSymbol(coin.symbol);
                      }}
                      className="py-2.5 grid grid-cols-12 items-center hover:bg-[#1E2329] px-1 rounded-xl cursor-pointer transition-colors"
                    >
                      <div className="col-span-6 flex items-center gap-2 min-w-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(coin.symbol);
                          }}
                          className="p-0.5 text-[#848E9C] hover:text-[#F0B90B] shrink-0"
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
                            <span className="text-[11px] text-[#848E9C]">
                              {cryptoSubTab === 'usdm' && coin.quoteAsset === 'USDT'
                                ? 'Perp'
                                : cryptoSubTab === 'coinm'
                                ? 'USD CM'
                                : `/${coin.quoteAsset}`}
                            </span>
                            {coin.leverageTag && (
                              <span className="px-1 py-0.5 rounded bg-[#2B3139] text-[9px] font-semibold text-[#F0B90B]">
                                {coin.leverageTag}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] tabular-nums text-[#848E9C] truncate">
                            {isAvailable
                              ? `$${formatCompactNumber(coin.quoteVolume24h)}`
                              : 'Syncing...'}
                          </div>
                        </div>
                      </div>

                      <div className="col-span-3 text-right tabular-nums">
                        <div
                          className={`text-[14px] font-semibold transition-colors ${
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
                          {isAvailable ? formatFiat(coin.lastPrice, settings.fiat) : '—'}
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
                            ? '—'
                            : `${coin.priceChangePercent >= 0 ? '+' : ''}${coin.priceChangePercent.toFixed(2)}%`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* =========================================================
          EDIT FAVORITES WATCHLIST MODAL
         ========================================================= */}
      {isEditFavoritesOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center"
          onClick={() => setIsEditFavoritesOpen(false)}
        >
          <div
            className="w-full max-w-[430px] bg-[#1E2329] rounded-t-3xl sm:rounded-3xl border-t sm:border border-[#2B3139] p-5 space-y-4 max-h-[82vh] flex flex-col pb-safe-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-[#474D57] rounded-full mx-auto -mt-1 sm:hidden" />
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-bold text-[#EAECEF]">Edit Favorites Watchlist</h3>
                <p className="text-[11px] text-[#848E9C]">
                  Star, unstar, or reorder trading pairs across Home &amp; Markets
                </p>
              </div>
              <NTButton
                variant="primary"
                size="xs"
                onClick={() => setIsEditFavoritesOpen(false)}
              >
                Done
              </NTButton>
            </div>

            <div className="flex items-center gap-2 bg-[#202630] border border-[#2B3139] focus-within:border-[#F0B90B] rounded-xl px-3 h-9">
              <Search className="w-3.5 h-3.5 text-[#848E9C]" />
              <input
                type="text"
                value={favSearchQuery}
                onChange={(e) => setFavSearchQuery(e.target.value)}
                placeholder="Filter pairs to add or remove..."
                className="w-full bg-transparent text-xs text-[#EAECEF] placeholder-[#848E9C] focus:outline-none"
              />
            </div>

            <div className="overflow-y-auto overscroll-contain space-y-1.5 flex-1 pr-1">
              {tickerList
                .filter(
                  (t) =>
                    !favSearchQuery.trim() ||
                    t.baseAsset.toLowerCase().includes(favSearchQuery.toLowerCase()) ||
                    t.name.toLowerCase().includes(favSearchQuery.toLowerCase())
                )
                .map((coin) => {
                  const isFav = favorites.includes(coin.symbol);
                  const favIdx = favorites.indexOf(coin.symbol);
                  return (
                    <div
                      key={coin.symbol}
                      className="p-2.5 rounded-xl bg-[#202630] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => toggleFavorite(coin.symbol)}
                          className="p-1 text-[#848E9C] hover:text-[#F0B90B]"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              isFav ? 'fill-[#F0B90B] text-[#F0B90B]' : ''
                            }`}
                          />
                        </button>
                        <CoinIcon asset={coin.baseAsset} size="sm" />
                        <div>
                          <div className="text-xs font-bold text-[#EAECEF]">
                            {coin.baseAsset}/{coin.quoteAsset}
                          </div>
                          <div className="text-[10px] text-[#848E9C]">{coin.name}</div>
                        </div>
                      </div>

                      {isFav && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={favIdx <= 0}
                            onClick={() => moveFavoriteOrder(coin.symbol, 'up')}
                            className="p-1.5 rounded-lg bg-[#2B3139] text-[#EAECEF] disabled:opacity-30"
                            title="Move up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={favIdx === -1 || favIdx >= favorites.length - 1}
                            onClick={() => moveFavoriteOrder(coin.symbol, 'down')}
                            className="p-1.5 rounded-lg bg-[#2B3139] text-[#EAECEF] disabled:opacity-30"
                            title="Move down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Price Alerts Modal */}
      {isAlertsModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center"
          onClick={() => setIsAlertsModalOpen(false)}
        >
          <div
            className="w-full max-w-[430px] bg-[#1E2329] rounded-t-3xl sm:rounded-3xl border-t sm:border border-[#2B3139] p-5 space-y-4 pb-safe-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-[#474D57] rounded-full mx-auto -mt-1 sm:hidden" />
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-[#EAECEF]">Price Alerts</h3>
              <button
                type="button"
                onClick={() => setIsAlertsModalOpen(false)}
                className="px-2.5 py-1 rounded-lg bg-[#202630] text-xs font-semibold text-[#848E9C] hover:text-[#EAECEF]"
              >
                Close
              </button>
            </div>

            <div className="flex gap-2">
              <select
                value={alertSym}
                onChange={(e) => setAlertSym(e.target.value)}
                className="h-10 px-3 rounded-xl bg-[#202630] border border-[#2B3139] text-xs font-bold text-[#EAECEF] focus:outline-none focus:border-[#F0B90B]"
              >
                {tickerList.map((t) => (
                  <option key={t.symbol} value={t.symbol}>
                    {t.baseAsset}/{t.quoteAsset}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={alertPrice}
                onChange={(e) => setAlertPrice(e.target.value)}
                placeholder="Target Price"
                className="flex-1 h-10 px-3 rounded-xl bg-[#202630] border border-[#2B3139] focus:border-[#F0B90B] text-xs tabular-nums text-[#EAECEF] focus:outline-none"
              />
              <NTButton
                variant="primary"
                size="md"
                onClick={() => {
                  const p = parseFloat(alertPrice);
                  if (p > 0) {
                    addPriceAlert(alertSym, p, 'ABOVE');
                  }
                }}
              >
                Add
              </NTButton>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto overscroll-contain">
              {priceAlerts.map((al) => (
                <div
                  key={al.id}
                  className="p-3 rounded-xl bg-[#202630] flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-[#EAECEF]">{al.symbol}</span>{' '}
                    <span className="tabular-nums text-[#F0B90B]">
                      {al.condition} ${al.targetPrice}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePriceAlert(al.id)}
                    className="text-[#F6465D] font-semibold"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
