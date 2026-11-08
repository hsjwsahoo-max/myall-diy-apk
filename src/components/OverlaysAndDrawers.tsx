import React, { useState } from 'react';
import {
  Archive,
  ArrowDownLeft,
  ArrowLeft,
  ArrowRightLeft,
  ArrowUpRight,
  Award,
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  Gift,
  Globe,
  Headphones,
  Lock,
  Pin,
  Plus,
  QrCode,
  Rocket,
  Send,
  Settings,
  Shield,
  Smartphone,
  Sparkles,
  Star,
  Sun,
  TrendingUp,
  UserCheck,
} from 'lucide-react';
import { useExchange } from '../context/ExchangeContext';
import { PortfolioDenomination, SupportedFiat } from '../types/exchange';
import { CandlestickChart } from './CandlestickChart';
import { CoinIcon, formatCompactNumber, formatFiat, formatPrice } from './CoinIcon';
import { NTButton, NTCard, NTTabs } from './ui/DesignSystem';

export const OverlaysAndDrawers: React.FC = () => {
  const {
    coinDetailSymbol,
    setCoinDetailSymbol,
    tickers,
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
    setExchangeTab,
    setTradeSubTab,
    isProfileDrawerOpen,
    setProfileDrawerOpen,
    isMessagesModalOpen,
    setMessagesModalOpen,
    isPayModalOpen,
    setPayModalOpen,
    settings,
    updateSettings,
    resetDemoLedger,
    accountMode,
    switchAccountVerificationMode,
    syncReadOnlyExchangeApi,
    backendCapabilities,
    serverAuditLogs,
    getTotalPortfolioUsdt,
    openTransferModal,
    openDepositModal,
    transactions,
    priceAlerts,
    setSelectedTxDetail,
    setHistoryModalOpen,
    showToast,
  } = useExchange();

  const [detailTab, setDetailTab] = useState<'orderbook' | 'trades' | 'info'>('orderbook');
  const [msgTab, setMsgTab] = useState<'chat' | 'square' | 'notifications'>('chat');
  const [chatFilter, setChatFilter] = useState<'all' | 'unread'>('all');
  const [activeChatChannel, setActiveChatChannel] = useState<'support' | 'p2p' | 'archived'>('support');
  const [hasUnreadP2P, setHasUnreadP2P] = useState<boolean>(true);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [checkedInDay, setCheckedInDay] = useState(6);
  const [supportInput, setSupportInput] = useState('');
  const [showPayQrCard, setShowPayQrCard] = useState(false);
  const [customInitialBalanceInput, setCustomInitialBalanceInput] = useState<string>(
    String(settings.initialPreviewBalanceUsdt || 0)
  );
  const [preserveUserTxsOnReset, setPreserveUserTxsOnReset] = useState<boolean>(true);
  const [supportMessages, setSupportMessages] = useState([
    {
      id: 'm1',
      sender: 'Nexus Support',
      text: 'Welcome to NexusTrade! Your portfolio and Web3 self-custody wallet are active. You can create an encrypted self-custody wallet or deposit funds to begin trading.',
      time: '12:00',
    },
  ]);

  const activeCoinTicker = coinDetailSymbol ? tickers[coinDetailSymbol] : null;
  const formattedDetailPair = coinDetailSymbol
    ? coinDetailSymbol === 'USDTUSD'
      ? 'USDT/USD'
      : coinDetailSymbol.replace(/USDT$/, '/USDT')
    : '';
  const detailBaseAsset = coinDetailSymbol
    ? coinDetailSymbol === 'USDTUSD'
      ? 'USDT'
      : coinDetailSymbol.replace(/USDT$/, '')
    : '';

  const handleSendSupportMessage = () => {
    if (!supportInput.trim()) return;
    const userText = supportInput.trim();
    setSupportInput('');
    setSupportMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, sender: 'You', text: userText, time: 'Now' },
      {
        id: `s-${Date.now() + 1}`,
        sender: 'Nexus Support',
        text: 'Your internal ledger supports instant zero-fee transfers between Spot, Funding, USDⓈ-M Futures, COIN-M Futures, and Earn.',
        time: 'Now',
      },
    ]);
  };

  return (
    <>
      {/* =====================================================================
          1. INDIVIDUAL COIN DETAIL FULL-SCREEN MODAL
          ===================================================================== */}
      {coinDetailSymbol && (
        <div className="fixed inset-0 z-50 bg-[#181A20] text-[#EAECEF] flex flex-col pt-safe-top pb-safe-bottom">
          {/* Header */}
          <div className="max-w-2xl w-full mx-auto flex items-center justify-between px-4 h-12 border-b border-[#2B3139]/70 shrink-0">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setCoinDetailSymbol(null)}
                className="w-8 h-8 -ml-1.5 rounded-lg flex items-center justify-center text-[#EAECEF] hover:bg-[#202630] transition-colors"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <CoinIcon asset={detailBaseAsset} size="sm" />
              <div>
                <div className="text-[14px] font-bold flex items-center gap-1.5 text-[#EAECEF]">
                  {formattedDetailPair}
                  {activeCoinTicker?.leverageTag && (
                    <span className="px-1.5 py-0.5 rounded bg-[#2B3139] text-[10px] font-mono text-[#F0B90B]">
                      {activeCoinTicker.leverageTag}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-[#848E9C]">
                  {activeCoinTicker?.name || 'Spot Market'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => toggleFavorite(coinDetailSymbol)}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#202630] transition-colors"
              aria-label="Toggle favorite"
            >
              <Star
                className={`w-5 h-5 ${
                  favorites.includes(coinDetailSymbol)
                    ? 'fill-[#F0B90B] text-[#F0B90B]'
                    : 'text-[#848E9C]'
                }`}
              />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="max-w-2xl w-full mx-auto flex-1 overflow-y-auto overscroll-contain pb-24">
            {/* Price & 24h High/Low Stats */}
            <div className="p-4 flex items-center justify-between gap-4">
              <div>
                <div
                  className={`text-2xl font-mono font-bold tabular-nums ${
                    (activeCoinTicker?.priceChangePercent || 0) >= 0
                      ? 'text-[#2EBD85]'
                      : 'text-[#F6465D]'
                  }`}
                >
                  {formatPrice(activeCoinTicker?.lastPrice || 0)}
                </div>
                <div className="flex items-center gap-2 text-xs tabular-nums mt-0.5">
                  <span className="text-[#848E9C]">
                    ≈ {formatFiat(activeCoinTicker?.lastPrice || 0, settings.fiat)}
                  </span>
                  <span
                    className={
                      (activeCoinTicker?.priceChangePercent || 0) >= 0
                        ? 'text-[#2EBD85] font-semibold'
                        : 'text-[#F6465D] font-semibold'
                    }
                  >
                    {(activeCoinTicker?.priceChangePercent || 0) >= 0 ? '+' : ''}
                    {(activeCoinTicker?.priceChangePercent || 0).toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] tabular-nums">
                <div>
                  <div className="text-[#848E9C]">24h High</div>
                  <div className="text-[#EAECEF] font-semibold">
                    {formatPrice(activeCoinTicker?.high24h || 0)}
                  </div>
                </div>
                <div>
                  <div className="text-[#848E9C]">24h Vol(USDT)</div>
                  <div className="text-[#EAECEF] font-semibold">
                    {formatCompactNumber(activeCoinTicker?.quoteVolume24h || 0)}
                  </div>
                </div>
                <div>
                  <div className="text-[#848E9C]">24h Low</div>
                  <div className="text-[#EAECEF] font-semibold">
                    {formatPrice(activeCoinTicker?.low24h || 0)}
                  </div>
                </div>
                <div>
                  <div className="text-[#848E9C]">Mkt Cap</div>
                  <div className="text-[#EAECEF] font-semibold">
                    ${formatCompactNumber(activeCoinTicker?.marketCap || 0)}
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Candlestick Chart */}
            <CandlestickChart
              symbol={activeSymbol}
              interval={activeInterval}
              onIntervalChange={setActiveInterval}
              candles={candles}
              isLoading={isLoadingCandles}
              height={300}
            />

            {/* Order Book / Recent Trades / Info Tabs */}
            <div className="px-4 border-b border-[#2B3139]/60">
              <NTTabs
                variant="underline"
                activeId={detailTab}
                onChange={(id) => setDetailTab(id)}
                items={[
                  { id: 'orderbook', label: 'Order Book' },
                  { id: 'trades', label: 'Trades' },
                  { id: 'info', label: 'Info' },
                ]}
              />
            </div>

            {detailTab === 'orderbook' && (
              <div className="p-4 grid grid-cols-2 gap-4 text-xs tabular-nums">
                <div>
                  <div className="flex justify-between text-[11px] text-[#848E9C] mb-1.5">
                    <span>Bid Qty</span>
                    <span>Bid Price</span>
                  </div>
                  <div className="space-y-1">
                    {orderBook.bids.slice(0, 10).map((b, idx) => (
                      <div key={idx} className="flex justify-between relative py-0.5">
                        <span className="text-[#EAECEF]">{b.quantity.toFixed(4)}</span>
                        <span className="text-[#2EBD85] font-semibold">
                          {formatPrice(b.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-[#848E9C] mb-1.5">
                    <span>Ask Price</span>
                    <span>Ask Qty</span>
                  </div>
                  <div className="space-y-1">
                    {orderBook.asks.slice(0, 10).map((a, idx) => (
                      <div key={idx} className="flex justify-between relative py-0.5">
                        <span className="text-[#F6465D] font-semibold">
                          {formatPrice(a.price)}
                        </span>
                        <span className="text-[#EAECEF]">{a.quantity.toFixed(4)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {detailTab === 'trades' && (
              <div className="p-4 text-xs tabular-nums space-y-1.5">
                <div className="grid grid-cols-3 text-[11px] text-[#848E9C] pb-1">
                  <span>Price (USDT)</span>
                  <span className="text-right">Amount</span>
                  <span className="text-right">Time</span>
                </div>
                {recentTrades.slice(0, 15).map((tr) => (
                  <div key={tr.id} className="grid grid-cols-3 py-0.5">
                    <span className={tr.isBuyerMaker ? 'text-[#F6465D]' : 'text-[#2EBD85]'}>
                      {formatPrice(tr.price)}
                    </span>
                    <span className="text-right text-[#EAECEF]">{tr.quantity.toFixed(4)}</span>
                    <span className="text-right text-[#848E9C]">
                      {new Date(tr.time).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {detailTab === 'info' && (
              <div className="p-4 space-y-2.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-[#2B3139]/60">
                  <span className="text-[#848E9C]">Asset Name</span>
                  <span className="font-semibold text-[#EAECEF]">{activeCoinTicker?.name}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#2B3139]/60">
                  <span className="text-[#848E9C]">Category</span>
                  <span className="font-semibold text-[#EAECEF]">{activeCoinTicker?.category}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#2B3139]/60">
                  <span className="text-[#848E9C]">Market Cap</span>
                  <span className="tabular-nums font-semibold text-[#EAECEF]">
                    ${formatCompactNumber(activeCoinTicker?.marketCap || 0)}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-[#848E9C]">Market Feed</span>
                  <span className="text-[#2EBD85] font-medium">Real-Time Liquidity Stream</span>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Buy / Sell Footer */}
          <div className="fixed bottom-0 left-0 right-0 bg-[#1E2329] border-t border-[#2B3139]/70 p-3 pb-safe-bottom">
            <div className="max-w-2xl mx-auto flex items-center gap-3">
              <NTButton
                variant="up"
                size="lg"
                fullWidth
                onClick={() => {
                  const targetPair =
                    coinDetailSymbol === 'USDTUSD' ? 'BTCUSDT' : coinDetailSymbol;
                  setActiveSymbol(targetPair);
                  setCoinDetailSymbol(null);
                  setExchangeTab('trade');
                  setTradeSubTab(coinDetailSymbol === 'USDTUSD' ? 'convert' : 'spot');
                }}
              >
                Buy {detailBaseAsset}
              </NTButton>
              <NTButton
                variant="down"
                size="lg"
                fullWidth
                onClick={() => {
                  const targetPair =
                    coinDetailSymbol === 'USDTUSD' ? 'BTCUSDT' : coinDetailSymbol;
                  setActiveSymbol(targetPair);
                  setCoinDetailSymbol(null);
                  setExchangeTab('trade');
                  setTradeSubTab(coinDetailSymbol === 'USDTUSD' ? 'convert' : 'spot');
                }}
              >
                Sell {detailBaseAsset}
              </NTButton>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          2. PROFILE, MY TASKS & ACCOUNT SETTINGS SCREEN (Matches 01:32 - 01:33)
          ===================================================================== */}
      {isProfileDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-[#181A20] text-[#EAECEF] flex flex-col overflow-y-auto overscroll-contain pt-safe-top pb-safe-bottom">
          {/* Reference Top Bar: Back Arrow (left), Settings + Sun/Theme (right) */}
          <div className="max-w-[430px] w-full mx-auto px-4 h-12 flex items-center justify-between sticky top-0 bg-[#181A20]/95 backdrop-blur-md z-10 border-b border-[#2B3139]/50 shrink-0">
            <button
              type="button"
              onClick={() => setProfileDrawerOpen(false)}
              className="w-8 h-8 -ml-1.5 rounded-lg flex items-center justify-center text-[#EAECEF] hover:bg-[#202630] transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-[15px] font-bold text-[#EAECEF]">Account Center</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowAdvancedSettings((prev) => !prev)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  showAdvancedSettings
                    ? 'bg-[#2B3139] text-[#F0B90B]'
                    : 'text-[#EAECEF] hover:bg-[#202630]'
                }`}
                title="Preferences & Sandbox Controls"
              >
                <Settings className="w-[18px] h-[18px]" />
              </button>
              <button
                type="button"
                onClick={() => {
                  const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
                  updateSettings({ theme: nextTheme });
                  showToast(`Theme preference set to ${nextTheme}`);
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#EAECEF] hover:bg-[#202630] transition-colors"
                title="Appearance"
              >
                <Sun className="w-[18px] h-[18px]" />
              </button>
            </div>
          </div>

          <div className="max-w-[430px] w-full mx-auto px-4 pt-3 pb-12 space-y-3.5">
            {/* User Header Row (01:32): Avatar + UID + Username + Verified/Regular Pills */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setShowAdvancedSettings((prev) => !prev)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setShowAdvancedSettings((prev) => !prev);
                }
              }}
              className="flex items-center justify-between py-1.5 px-2 -mx-2 rounded-2xl hover:bg-[#202630]/50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2B3139] to-[#202630] border border-[#2B3139] flex items-center justify-center text-[#F0B90B] shadow-md relative">
                  <Award className="w-8 h-8 text-[#F0B90B]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-[#848E9C] tabular-nums">
                    <span>UID: {settings.uid}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard?.writeText(settings.uid);
                        showToast('UID copied to clipboard');
                      }}
                      className="text-[#848E9C] hover:text-[#EAECEF] p-0.5"
                      aria-label="Copy UID"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-[17px] font-bold text-[#EAECEF] leading-snug">
                    {settings.username}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="px-2 py-0.5 rounded bg-[#2EBD85]/15 text-[#2EBD85] text-[11px] font-semibold">
                      Verified
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#202630] text-[#EAECEF] text-[11px] font-medium">
                      {settings.vipTier || 'Regular'}
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight
                className={`w-5 h-5 text-[#848E9C] transition-transform ${
                  showAdvancedSettings ? 'rotate-90 text-[#F0B90B]' : ''
                }`}
              />
            </div>

            {/* Support Row (01:32): Headset + Nexus Support + Get Support Button */}
            <NTCard variant="elevated" padding="sm" className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Headphones className="w-4 h-4 text-[#F0B90B]" />
                <span className="text-[13px] font-semibold text-[#EAECEF]">Nexus Support</span>
              </div>
              <NTButton
                variant="secondary"
                size="xs"
                onClick={() => {
                  setProfileDrawerOpen(false);
                  setMessagesModalOpen(true);
                }}
              >
                Get Support
              </NTButton>
            </NTCard>

            {/* 2-Column Referral & Promo Bento (01:32) */}
            <div className="grid grid-cols-2 gap-2.5">
              <NTCard
                variant="default"
                padding="sm"
                onClick={() => {
                  navigator.clipboard?.writeText(`https://nexustrade.app/ref/${settings.uid}`);
                  showToast(`Referral link copied (ID: ${settings.uid})`);
                }}
                className="flex flex-col justify-between min-h-[104px] cursor-pointer hover:bg-[#202630] transition-colors"
              >
                <div className="text-[11px] text-[#848E9C]">Refer&amp;Earn Together</div>
                <div className="flex items-end justify-between gap-2 mt-2">
                  <div className="text-xs font-bold text-[#EAECEF] leading-snug">
                    Unlock Up to 400 USDC Monthly
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#202630] flex items-center justify-center text-[#2EBD85] shrink-0">
                    <Gift className="w-4 h-4" />
                  </div>
                </div>
              </NTCard>

              <NTCard
                variant="default"
                padding="sm"
                onClick={() => {
                  setProfileDrawerOpen(false);
                  setExchangeTab('trade');
                  setTradeSubTab('spot');
                }}
                className="flex flex-col justify-between min-h-[104px] cursor-pointer hover:bg-[#202630] transition-colors"
              >
                <div className="flex items-center justify-between text-[11px] text-[#848E9C]">
                  <span>For You</span>
                  <span className="tabular-nums">1/4</span>
                </div>
                <div className="flex items-end justify-between gap-2 mt-2">
                  <div className="text-xs font-bold text-[#EAECEF] leading-snug">
                    Referral Rush 2026: Share $550,000 in USDT
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#202630] flex items-center justify-center text-[#F0B90B] shrink-0">
                    <Rocket className="w-4 h-4" />
                  </div>
                </div>
              </NTCard>
            </div>

            {/* My Tasks Card (Matches 01:32 - 01:33) */}
            <NTCard variant="default" padding="md" className="space-y-3">
              <div>
                <h3 className="text-[15px] font-bold text-[#EAECEF]">My Tasks</h3>
                <button
                  type="button"
                  onClick={() => {
                    setProfileDrawerOpen(false);
                    setExchangeTab('trade');
                    setTradeSubTab('spot');
                  }}
                  className="flex items-center justify-between text-xs mt-1 w-full text-left group"
                >
                  <span className="text-[#EAECEF] font-medium flex items-center gap-0.5 group-hover:text-[#F0B90B] transition-colors">
                    Unlock rewards worth <span className="text-[#F0B90B] font-bold">27 PTS</span> today
                    <ChevronRight className="w-3.5 h-3.5 text-[#848E9C]" />
                  </span>
                </button>
                <div className="text-[11px] text-[#848E9C] tabular-nums mt-0.5">
                  End Time <span className="bg-[#202630] px-1 py-0.5 rounded text-[#EAECEF]">03H</span> :{' '}
                  <span className="bg-[#202630] px-1 py-0.5 rounded text-[#EAECEF]">56M</span>
                </div>
              </div>

              {/* 7-Day Check-In Stepper */}
              <div className="grid grid-cols-7 gap-1.5">
                {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                  const isToday = day === checkedInDay;
                  const isPast = day < checkedInDay;
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        setCheckedInDay(day);
                        showToast(`Day ${day} check-in recorded`);
                      }}
                      className={`rounded-lg py-2 flex flex-col items-center justify-center gap-1 transition-all ${
                        isToday
                          ? 'bg-[#F0B90B] text-[#181A20] font-bold'
                          : 'bg-[#202630] text-[#848E9C]'
                      }`}
                    >
                      <span className="text-[10px] font-bold tabular-nums">
                        {day === 7 ? '🎁' : '+1'}
                      </span>
                      {isPast ? (
                        <Check className="w-3 h-3 text-[#2EBD85]" />
                      ) : (
                        <span className="text-[10px] tabular-nums">{day}</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Task 1: Daily Spot trading >= $10 */}
              <div className="rounded-xl bg-[#202630] p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="px-1.5 py-0.5 rounded bg-[#2D2618] text-[#F0B90B] text-[10px] font-bold shrink-0">
                    2 PTS
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-[#EAECEF] truncate">
                      Daily Spot trading ≥ $10
                    </div>
                    <div className="text-[11px] text-[#848E9C] tabular-nums mt-0.5">
                      0 / <span className="text-[#F0B90B]">10</span> USDT
                    </div>
                  </div>
                </div>
                <NTButton
                  variant="primary"
                  size="xs"
                  onClick={() => {
                    setProfileDrawerOpen(false);
                    setExchangeTab('trade');
                    setTradeSubTab('spot');
                  }}
                >
                  Go
                </NTButton>
              </div>

              {/* Task 2: Complete daily Convert trading */}
              <div className="rounded-xl bg-[#202630] p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-[#EAECEF] leading-snug">
                    Complete daily Convert trading to earn big point rewards!
                  </span>
                  <NTButton
                    variant="secondary"
                    size="xs"
                    onClick={() => {
                      setProfileDrawerOpen(false);
                      setExchangeTab('trade');
                      setTradeSubTab('convert');
                    }}
                  >
                    Convert
                  </NTButton>
                </div>
                <div className="pt-1">
                  <div className="h-1.5 w-full rounded-full bg-[#2B3139] overflow-hidden">
                    <div className="h-full w-1/6 bg-[#F0B90B] rounded-full" />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#848E9C] tabular-nums mt-1.5">
                    <span>0 USDT</span>
                    <span>10 (1 PTS)</span>
                    <span>50 (2 PTS)</span>
                  </div>
                </div>
              </div>
            </NTCard>

            {/* Bottom 2-Column Copy Trading Cards (01:32) */}
            <div className="grid grid-cols-2 gap-2.5">
              <NTCard
                variant="default"
                padding="sm"
                className="flex items-center justify-between cursor-pointer hover:bg-[#202630]"
                onClick={() => {
                  setProfileDrawerOpen(false);
                  setExchangeTab('trade');
                  setTradeSubTab('spot');
                }}
              >
                <span className="text-[13px] font-bold text-[#EAECEF]">Spot Copy</span>
                <Sparkles className="w-4 h-4 text-[#F0B90B]" />
              </NTCard>
              <NTCard
                variant="default"
                padding="sm"
                className="flex items-center justify-between cursor-pointer hover:bg-[#202630]"
                onClick={() => {
                  setProfileDrawerOpen(false);
                  setExchangeTab('futures');
                }}
              >
                <span className="text-[13px] font-bold text-[#EAECEF]">Futures Copy</span>
                <TrendingUp className="w-4 h-4 text-[#2EBD85]" />
              </NTCard>
            </div>

            {/* Collapsible Preferences, Currency & Sandbox State Controls (Preserves all existing controls) */}
            <NTCard variant="default" padding="md" className="space-y-3">
              <button
                type="button"
                onClick={() => setShowAdvancedSettings((prev) => !prev)}
                className="w-full flex items-center justify-between text-left"
              >
                <div>
                  <div className="text-xs font-bold text-[#EAECEF]">
                    Preferences, Currency &amp; Portfolio Ledger Controls
                  </div>
                  <div className="text-[11px] text-[#848E9C]">
                    Fiat ({settings.fiat}) · Account Mode · Custom Starting Balance
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-[#848E9C] transition-transform ${
                    showAdvancedSettings ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {showAdvancedSettings && (
                <div className="pt-3 border-t border-[#2B3139]/60 space-y-4">
                  {/* Primary Denomination */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#EAECEF]">
                      <Globe className="w-3.5 h-3.5 text-[#F0B90B]" />
                      <span>Primary Portfolio Valuation</span>
                    </div>
                    <div className="grid grid-cols-6 gap-1.5">
                      {(['USDT', 'USD', 'INR', 'EUR', 'AED', 'GBP'] as PortfolioDenomination[]).map(
                        (denom) => (
                          <button
                            key={denom}
                            type="button"
                            onClick={() =>
                              updateSettings({
                                primaryDenomination: denom,
                                fiat: denom === 'USDT' ? settings.fiat : (denom as SupportedFiat),
                              })
                            }
                            className={`py-1.5 rounded-lg text-xs font-bold tabular-nums ${
                              (settings.primaryDenomination || 'USDT') === denom
                                ? 'bg-[#F0B90B] text-[#181A20]'
                                : 'bg-[#202630] text-[#848E9C]'
                            }`}
                          >
                            {denom}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Secondary Fiat */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#2B3139]/60">
                    <span className="text-xs text-[#848E9C]">Secondary Fiat Reference</span>
                    <div className="flex items-center gap-1">
                      {(['INR', 'USD', 'EUR', 'AED', 'GBP'] as SupportedFiat[]).map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => updateSettings({ fiat: f })}
                          className={`px-2 py-1 rounded text-xs font-bold tabular-nums ${
                            settings.fiat === f
                              ? 'bg-[#2B3139] text-[#EAECEF]'
                              : 'bg-[#202630] text-[#848E9C]'
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2FA & Anti-Phishing */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#2B3139]/60">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[#2EBD85]" />
                      <span className="text-xs font-semibold text-[#EAECEF]">
                        2FA &amp; Passkey Biometrics
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        updateSettings({ twoFactorEnabled: !settings.twoFactorEnabled })
                      }
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        settings.twoFactorEnabled
                          ? 'bg-[#2EBD85]/15 text-[#2EBD85]'
                          : 'bg-[#202630] text-[#848E9C]'
                      }`}
                    >
                      {settings.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#2B3139]/60">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-[#848E9C]" />
                      <span className="text-xs font-semibold text-[#EAECEF]">
                        Anti-Phishing Code
                      </span>
                    </div>
                    <span className="text-xs font-mono text-[#F0B90B]">
                      {settings.antiPhishingCode}
                    </span>
                  </div>

                  {/* Account Balance Verification Mode */}
                  <div className="pt-2 border-t border-[#2B3139]/60 space-y-2.5">
                    <div className="text-xs font-semibold text-[#EAECEF]">
                      Portfolio Balance State
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => switchAccountVerificationMode('verified_statement')}
                        className={`py-2 px-2 rounded-xl text-[11px] font-semibold tabular-nums ${
                          accountMode === 'verified_statement'
                            ? 'bg-[#2EBD85]/15 text-[#2EBD85] ring-1 ring-[#2EBD85]'
                            : 'bg-[#202630] text-[#848E9C]'
                        }`}
                      >
                        Funded (16,845)
                      </button>
                      <button
                        type="button"
                        onClick={() => switchAccountVerificationMode('unverified_empty')}
                        className={`py-2 px-2 rounded-xl text-[11px] font-semibold tabular-nums ${
                          accountMode === 'unverified_empty'
                            ? 'bg-[#F0B90B]/15 text-[#F0B90B] ring-1 ring-[#F0B90B]'
                            : 'bg-[#202630] text-[#848E9C]'
                        }`}
                      >
                        Empty (0.00)
                      </button>
                      <button
                        type="button"
                        onClick={() => syncReadOnlyExchangeApi()}
                        className="py-2 px-2 rounded-xl text-[11px] font-semibold bg-[#202630] text-[#EAECEF] hover:bg-[#2B3139]"
                      >
                        Sync API
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex items-center bg-[#202630] border border-[#2B3139] focus-within:border-[#F0B90B] rounded-xl px-3 h-9">
                        <input
                          type="number"
                          min="0"
                          step="100"
                          value={customInitialBalanceInput}
                          onChange={(e) => setCustomInitialBalanceInput(e.target.value)}
                          className="w-full bg-transparent text-xs font-mono tabular-nums font-bold text-[#EAECEF] focus:outline-none"
                        />
                        <span className="text-xs font-bold text-[#848E9C] ml-2">USDT</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCustomInitialBalanceInput('1000')}
                        className="px-2.5 h-9 rounded-xl bg-[#202630] text-xs font-mono tabular-nums text-[#EAECEF] hover:bg-[#2B3139]"
                      >
                        1,000
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomInitialBalanceInput('0')}
                        className="px-2.5 h-9 rounded-xl bg-[#202630] text-xs font-mono tabular-nums text-[#EAECEF] hover:bg-[#2B3139]"
                      >
                        0
                      </button>
                    </div>

                    <label className="flex items-center gap-2 text-xs text-[#848E9C] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preserveUserTxsOnReset}
                        onChange={(e) => setPreserveUserTxsOnReset(e.target.checked)}
                        className="rounded accent-[#F0B90B]"
                      />
                      <span>Preserve user transactions when updating balance</span>
                    </label>

                    <NTButton
                      variant="primary"
                      size="sm"
                      fullWidth
                      onClick={() => {
                        const targetUsdt = parseFloat(customInitialBalanceInput);
                        resetDemoLedger(
                          Number.isFinite(targetUsdt) ? targetUsdt : 0,
                          preserveUserTxsOnReset
                        );
                        setProfileDrawerOpen(false);
                      }}
                    >
                      Apply Balance ({formatPrice(parseFloat(customInitialBalanceInput) || 0, 2)} USDT)
                    </NTButton>
                  </div>

                  {/* Backend Status & Audit Log Summary */}
                  {backendCapabilities && (
                    <div className="pt-2 border-t border-[#2B3139]/60 text-[11px] text-[#848E9C] flex items-center justify-between">
                      <span>SQLite Ledger Persistence</span>
                      <span className="text-[#2EBD85] font-semibold flex items-center gap-1 tabular-nums">
                        <CheckCircle2 className="w-3 h-3" />
                        {backendCapabilities.sqlitePersistence ? 'Active' : 'Local'} (
                        {serverAuditLogs.length} logs)
                      </span>
                    </div>
                  )}
                </div>
              )}
            </NTCard>
          </div>
        </div>
      )}

      {/* =====================================================================
          3. MESSAGE / CHAT / NOTIFICATIONS SCREEN (Matches 01:41 - 01:44)
          ===================================================================== */}
      {isMessagesModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#181A20] text-[#EAECEF] flex flex-col pt-safe-top pb-safe-bottom">
          {/* Reference Header: Back Arrow | Message | Clear + Plus */}
          <div className="max-w-[430px] w-full mx-auto px-4 h-12 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={() => setMessagesModalOpen(false)}
              className="w-8 h-8 -ml-1.5 rounded-lg flex items-center justify-center text-[#EAECEF] hover:bg-[#202630] transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-[16px] font-bold text-[#EAECEF]">Message</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setHasUnreadP2P(false);
                  showToast('All unread messages marked as read');
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#202630]"
                title="Mark all as read"
              >
                <Sparkles className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setMsgTab('chat');
                  setActiveChatChannel('support');
                  showToast('Connected to Nexus Concierge Support');
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#202630]"
                title="New support conversation"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Primary Tabs: Chat | Square | Notifications (with yellow dot) */}
          <div className="max-w-[430px] w-full mx-auto px-4 border-b border-[#2B3139]/70 shrink-0">
            <NTTabs
              variant="underline"
              activeId={msgTab}
              onChange={(id) => setMsgTab(id)}
              items={[
                { id: 'chat', label: 'Chat', dot: hasUnreadP2P },
                { id: 'square', label: 'Square' },
                { id: 'notifications', label: 'Notifications', dot: transactions.length > 0 },
              ]}
            />
          </div>

          {/* TAB 1: CHAT */}
          {msgTab === 'chat' && (
            <>
              <div className="max-w-[430px] w-full mx-auto px-4 pt-3 pb-1 flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setChatFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    chatFilter === 'all'
                      ? 'bg-[#2B3139] text-[#EAECEF]'
                      : 'text-[#848E9C] hover:text-[#EAECEF]'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setChatFilter('unread')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    chatFilter === 'unread'
                      ? 'bg-[#2B3139] text-[#EAECEF]'
                      : 'text-[#848E9C] hover:text-[#EAECEF]'
                  }`}
                >
                  <span>Unread</span>
                  {hasUnreadP2P && (
                    <span className="px-1.5 py-0.2 rounded-full bg-[#F0B90B] text-[#181A20] text-[10px] font-bold tabular-nums">
                      1
                    </span>
                  )}
                </button>
              </div>

              <div className="max-w-[430px] w-full mx-auto flex-1 overflow-y-auto overscroll-contain px-4 py-2 space-y-4">
                <div className="divide-y divide-[#2B3139]/50">
                  {/* Row 1: Nexus Support */}
                  {chatFilter === 'all' && (
                    <button
                      type="button"
                      onClick={() => setActiveChatChannel('support')}
                      className={`w-full py-3 px-2 -mx-2 rounded-xl flex items-center justify-between gap-3 text-left transition-colors ${
                        activeChatChannel === 'support' ? 'bg-[#202630]/70' : 'hover:bg-[#202630]/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-[#202630] text-[#F0B90B] flex items-center justify-center shrink-0">
                          <Headphones className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[14px] font-bold text-[#EAECEF] truncate">
                            Nexus Support
                          </div>
                          <div className="text-[12px] text-[#848E9C] truncate mt-0.5">
                            {supportMessages[supportMessages.length - 1]?.text || 'Get Support'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0 flex flex-col items-end gap-1">
                        <span className="text-[11px] text-[#848E9C] tabular-nums">04/21</span>
                        <Pin className="w-3.5 h-3.5 text-[#848E9C] rotate-45" />
                      </div>
                    </button>
                  )}

                  {/* Row 2: P2P Message */}
                  {(chatFilter === 'all' || hasUnreadP2P) && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveChatChannel('p2p');
                        setHasUnreadP2P(false);
                      }}
                      className={`w-full py-3 px-2 -mx-2 rounded-xl flex items-center justify-between gap-3 text-left transition-colors ${
                        activeChatChannel === 'p2p' ? 'bg-[#202630]/70' : 'hover:bg-[#202630]/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-[#202630] text-[#F0B90B] flex items-center justify-center shrink-0 relative">
                          <UserCheck className="w-5 h-5" />
                          {hasUnreadP2P && (
                            <span className="w-2.5 h-2.5 rounded-full bg-[#F0B90B] border-2 border-[#181A20] absolute -top-0.5 -right-0.5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[14px] font-bold text-[#EAECEF] truncate">
                            P2P Message
                          </div>
                          <div className="text-[12px] text-[#848E9C] truncate mt-0.5">
                            <span className="text-[#F0B90B] font-medium">[New]</span> Chat as{' '}
                            {settings.username}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[11px] text-[#848E9C] tabular-nums">01:33</span>
                      </div>
                    </button>
                  )}

                  {/* Row 3: Archived Messages */}
                  {chatFilter === 'all' && (
                    <button
                      type="button"
                      onClick={() => setActiveChatChannel('archived')}
                      className={`w-full py-3 px-2 -mx-2 rounded-xl flex items-center justify-between gap-3 text-left transition-colors ${
                        activeChatChannel === 'archived'
                          ? 'bg-[#202630]/70'
                          : 'hover:bg-[#202630]/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-[#202630] text-[#848E9C] flex items-center justify-center shrink-0">
                          <Archive className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[14px] font-bold text-[#EAECEF] truncate">
                            Archived Messages
                          </div>
                          <div className="text-[11px] text-[#848E9C] truncate mt-0.5">
                            Resolved tickets &amp; completed P2P chats
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#848E9C]" />
                    </button>
                  )}

                  {chatFilter === 'unread' && !hasUnreadP2P && (
                    <div className="py-8 text-center text-xs text-[#848E9C]">
                      No unread chat messages.
                    </div>
                  )}
                </div>

                {/* Active Channel Thread */}
                {activeChatChannel === 'support' && (
                  <NTCard variant="default" padding="md" className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#EAECEF]">Nexus Concierge Desk</span>
                      <span className="text-[10px] text-[#2EBD85] font-semibold">Online</span>
                    </div>
                    <div className="space-y-2 max-h-56 overflow-y-auto overscroll-contain">
                      {supportMessages.map((m) => (
                        <div
                          key={m.id}
                          className={`p-3 rounded-xl text-xs ${
                            m.sender === 'You'
                              ? 'bg-[#F0B90B] text-[#181A20] ml-8 font-medium'
                              : 'bg-[#202630] text-[#EAECEF] mr-8'
                          }`}
                        >
                          <div className="font-bold mb-0.5">{m.sender}</div>
                          <div>{m.text}</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        value={supportInput}
                        onChange={(e) => setSupportInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSendSupportMessage();
                          }
                        }}
                        placeholder="Ask about transfers, futures, or funds..."
                        className="flex-1 h-10 px-3 rounded-xl bg-[#202630] border border-[#2B3139] focus:border-[#F0B90B] text-xs text-[#EAECEF] placeholder-[#848E9C] focus:outline-none"
                      />
                      <NTButton variant="primary" size="md" onClick={handleSendSupportMessage}>
                        Send
                      </NTButton>
                    </div>
                  </NTCard>
                )}

                {activeChatChannel === 'p2p' && (
                  <NTCard variant="default" padding="md" className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#EAECEF]">P2P Order Desk</span>
                      <NTButton
                        variant="secondary"
                        size="xs"
                        onClick={() => {
                          setMessagesModalOpen(false);
                          setExchangeTab('trade');
                          setTradeSubTab('p2p');
                        }}
                      >
                        Open P2P Market
                      </NTButton>
                    </div>
                    <p className="text-xs text-[#848E9C] leading-relaxed">
                      Signed in as <strong className="text-[#EAECEF]">{settings.username}</strong>.
                      Active merchant chats appear here automatically when you open a P2P Buy or
                      Sell order.
                    </p>
                  </NTCard>
                )}

                {activeChatChannel === 'archived' && (
                  <NTCard variant="default" padding="md" className="space-y-2">
                    <div className="text-xs font-bold text-[#EAECEF]">Archived Conversations</div>
                    <p className="text-xs text-[#848E9C]">
                      No archived tickets in your current session.
                    </p>
                  </NTCard>
                )}
              </div>
            </>
          )}

          {/* TAB 2: SQUARE (Market Pulse & Community Feed) */}
          {msgTab === 'square' && (
            <div className="max-w-[430px] w-full mx-auto flex-1 overflow-y-auto overscroll-contain p-4 space-y-3">
              {(['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT'] as const).map((sym) => {
                const tk = tickers[sym];
                const pct = tk?.priceChangePercent || 0;
                return (
                  <NTCard key={sym} variant="default" padding="md" className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CoinIcon asset={tk?.baseAsset || sym.replace('USDT', '')} size="sm" />
                        <div>
                          <div className="text-xs font-bold text-[#EAECEF]">
                            Nexus Square · {tk?.baseAsset || sym.replace('USDT', '')} Market Pulse
                          </div>
                          <div className="text-[10px] text-[#848E9C]">Real-Time Spot Feed</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveSymbol(sym);
                          setMessagesModalOpen(false);
                          setExchangeTab('trade');
                          setTradeSubTab('spot');
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono tabular-nums font-bold ${
                          pct >= 0
                            ? 'bg-[#2EBD85]/15 text-[#2EBD85]'
                            : 'bg-[#F6465D]/15 text-[#F6465D]'
                        }`}
                      >
                        {tk?.baseAsset}/USDT {pct >= 0 ? '+' : ''}
                        {pct.toFixed(2)}%
                      </button>
                    </div>
                    <p className="text-xs text-[#EAECEF] leading-relaxed">
                      {tk?.baseAsset} is trading at{' '}
                      <span className="font-mono tabular-nums font-bold">
                        ${formatPrice(tk?.lastPrice || 0)}
                      </span>{' '}
                      with 24h range ${formatPrice(tk?.low24h || 0)} – $
                      {formatPrice(tk?.high24h || 0)} and 24h volume{' '}
                      {formatCompactNumber(tk?.quoteVolume24h || 0)} USDT.
                    </p>
                  </NTCard>
                );
              })}
            </div>
          )}

          {/* TAB 3: NOTIFICATIONS (Ledger & Price Alert Notifications) */}
          {msgTab === 'notifications' && (
            <div className="max-w-[430px] w-full mx-auto flex-1 overflow-y-auto overscroll-contain p-4 space-y-2.5">
              {priceAlerts.length > 0 && (
                <NTCard variant="default" padding="sm" className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#F0B90B]">
                    <Bell className="w-3.5 h-3.5" />
                    <span>Active Price Alerts ({priceAlerts.length})</span>
                  </div>
                  {priceAlerts.map((al) => (
                    <div
                      key={al.id}
                      className="flex items-center justify-between text-xs py-1 border-t border-[#2B3139]/60"
                    >
                      <span className="font-semibold text-[#EAECEF]">{al.symbol}</span>
                      <span className="font-mono tabular-nums text-[#848E9C]">
                        {al.condition} ${formatPrice(al.targetPrice)}
                      </span>
                    </div>
                  ))}
                </NTCard>
              )}

              {transactions.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#848E9C]">
                  No transaction notifications yet.
                </div>
              ) : (
                transactions.slice(0, 12).map((tx) => (
                  <button
                    key={tx.id}
                    type="button"
                    onClick={() => {
                      setMessagesModalOpen(false);
                      setSelectedTxDetail(tx);
                    }}
                    className="w-full p-3 rounded-2xl bg-[#1E2329] border border-[#2B3139]/80 hover:border-[#474D57] flex items-start justify-between gap-3 text-left transition-colors"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-[#202630] flex items-center justify-center shrink-0 mt-0.5">
                        {tx.type === 'transfer' ? (
                          <ArrowRightLeft className="w-4 h-4 text-[#F0B90B]" />
                        ) : tx.type === 'withdraw' ? (
                          <ArrowUpRight className="w-4 h-4 text-[#F6465D]" />
                        ) : (
                          <ArrowDownLeft className="w-4 h-4 text-[#2EBD85]" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#EAECEF] truncate">{tx.note}</div>
                        <div className="text-[11px] font-mono tabular-nums text-[#848E9C] mt-0.5">
                          {formatPrice(tx.amount, tx.asset === 'USDT' ? 2 : 4)} {tx.asset} ·{' '}
                          {tx.refId}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono tabular-nums text-[#848E9C] shrink-0">
                      {new Date(tx.timestamp).toLocaleDateString([], {
                        month: 'short',
                        day: '2-digit',
                      })}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          4. NEXUS PAY SCREEN
          ===================================================================== */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#181A20] text-[#EAECEF] flex flex-col pt-safe-top pb-safe-bottom">
          <div className="max-w-[430px] w-full mx-auto px-4 h-12 flex items-center justify-between border-b border-[#2B3139]/70 shrink-0">
            <button
              type="button"
              onClick={() => setPayModalOpen(false)}
              className="w-8 h-8 -ml-1.5 rounded-lg flex items-center justify-center text-[#EAECEF] hover:bg-[#202630] transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-[16px] font-bold text-[#EAECEF]">Nexus Pay</span>
            <button
              type="button"
              onClick={() => setShowPayQrCard((prev) => !prev)}
              className={`w-8 h-8 -mr-1.5 rounded-lg flex items-center justify-center transition-colors ${
                showPayQrCard
                  ? 'bg-[#2B3139] text-[#F0B90B]'
                  : 'text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#202630]'
              }`}
              aria-label="Toggle Nexus Pay ID"
            >
              <QrCode className="w-5 h-5" />
            </button>
          </div>

          <div className="max-w-[430px] w-full mx-auto p-4 space-y-4 overflow-y-auto overscroll-contain flex-1">
            {showPayQrCard && (
              <NTCard variant="default" padding="md" className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-[#848E9C]">Nexus Pay ID</div>
                  <div className="text-sm font-mono tabular-nums font-bold text-[#EAECEF] mt-0.5">
                    PAY-{settings.uid}
                  </div>
                </div>
                <NTButton
                  variant="secondary"
                  size="xs"
                  onClick={() => {
                    navigator.clipboard?.writeText(`PAY-${settings.uid}`);
                    showToast(`Nexus Pay ID PAY-${settings.uid} copied`);
                  }}
                >
                  Copy Pay ID
                </NTButton>
              </NTCard>
            )}

            <div className="grid grid-cols-2 gap-3">
              <NTCard variant="elevated" padding="md">
                <div className="text-xs font-medium text-[#848E9C]">
                  Crypto Balance ({settings.fiat})
                </div>
                <div className="text-xl font-bold tabular-nums text-[#EAECEF] mt-1.5">
                  {formatFiat(getTotalPortfolioUsdt(), settings.fiat)}
                </div>
              </NTCard>
              <NTCard variant="elevated" padding="md">
                <div className="text-xs font-medium text-[#848E9C]">
                  Funding Available (USDT)
                </div>
                <div className="text-xl font-bold font-mono tabular-nums text-[#EAECEF] mt-1.5">
                  {formatPrice(getTotalPortfolioUsdt(), 2)}
                </div>
              </NTCard>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setPayModalOpen(false);
                  openTransferModal({ from: 'spot', to: 'funding', asset: 'USDT' });
                }}
                className="p-3 rounded-xl bg-[#202630] border border-[#2B3139] hover:border-[#F0B90B] flex items-center justify-center gap-2 text-xs font-semibold text-[#EAECEF] transition-colors"
              >
                <Send className="w-4 h-4 text-[#F0B90B]" /> Send
              </button>
              <button
                type="button"
                onClick={() => {
                  setPayModalOpen(false);
                  openDepositModal('USDT');
                }}
                className="p-3 rounded-xl bg-[#202630] border border-[#2B3139] hover:border-[#2EBD85] flex items-center justify-center gap-2 text-xs font-semibold text-[#EAECEF] transition-colors"
              >
                <ArrowUpRight className="w-4 h-4 text-[#2EBD85]" /> Receive
              </button>
              <button
                type="button"
                onClick={() => {
                  setPayModalOpen(false);
                  setExchangeTab('trade');
                  setTradeSubTab('convert');
                }}
                className="p-3 rounded-xl bg-[#202630] border border-[#2B3139] hover:border-[#F0B90B] flex items-center justify-center gap-2 text-xs font-semibold text-[#EAECEF] transition-colors"
              >
                <TrendingUp className="w-4 h-4 text-[#F0B90B]" /> Convert
              </button>
            </div>

            <div className="pt-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#EAECEF]">Recent Pay &amp; Transfer Activity</span>
                <button
                  type="button"
                  onClick={() => {
                    setPayModalOpen(false);
                    setHistoryModalOpen(true);
                  }}
                  className="text-[11px] font-semibold text-[#F0B90B] hover:underline"
                >
                  View All
                </button>
              </div>
              {transactions.slice(0, 4).map((tx) => (
                <button
                  key={tx.id}
                  type="button"
                  onClick={() => {
                    setPayModalOpen(false);
                    setSelectedTxDetail(tx);
                  }}
                  className="w-full p-3 rounded-xl bg-[#1E2329] border border-[#2B3139]/70 hover:border-[#474D57] flex items-center justify-between text-left transition-colors"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-[#EAECEF] truncate">{tx.note}</div>
                    <div className="text-[10px] font-mono tabular-nums text-[#848E9C] mt-0.5">
                      {tx.refId}
                    </div>
                  </div>
                  <div className="text-xs font-mono tabular-nums font-bold text-[#EAECEF] shrink-0 ml-2">
                    {formatPrice(tx.amount, tx.asset === 'USDT' ? 2 : 4)} {tx.asset}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
