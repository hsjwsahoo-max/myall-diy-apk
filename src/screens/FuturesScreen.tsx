import React, { useState, useMemo } from 'react';
import {
  ChevronDown,
  BarChart2,
  SlidersHorizontal,
  X,
  Plus,
  Minus,
  MoreHorizontal,
  Calculator,
  Bot,
  Sparkles,
  Award,
} from 'lucide-react';
import { useExchange } from '../context/ExchangeContext';
import { CandlestickChart } from '../components/CandlestickChart';
import { CoinIcon, formatPrice } from '../components/CoinIcon';

const FUTURES_TABS: Array<{
  id: 'usdm' | 'coinm' | 'options' | 'smart_money';
  label: string;
}> = [
  { id: 'usdm', label: 'USDⓈ-M' },
  { id: 'coinm', label: 'COIN-M' },
  { id: 'options', label: 'Options' },
  { id: 'smart_money', label: 'Smart Money' },
];

const PERP_CONTRACTS = [
  { symbol: 'BTCUSDT', base: 'BTC', quote: 'USDT', maxLev: 125, maintMarginRate: 0.004 },
  { symbol: 'ETHUSDT', base: 'ETH', quote: 'USDT', maxLev: 100, maintMarginRate: 0.005 },
  { symbol: 'SOLUSDT', base: 'SOL', quote: 'USDT', maxLev: 75, maintMarginRate: 0.008 },
  { symbol: 'BNBUSDT', base: 'BNB', quote: 'USDT', maxLev: 75, maintMarginRate: 0.006 },
  { symbol: 'XRPUSDT', base: 'XRP', quote: 'USDT', maxLev: 50, maintMarginRate: 0.01 },
  { symbol: 'DOGEUSDT', base: 'DOGE', quote: 'USDT', maxLev: 50, maintMarginRate: 0.01 },
];

// Black-Scholes European Option Pricing helper
function normCDF(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x) / Math.sqrt(2.0);
  const t = 1.0 / (1.0 + p * absX);
  const y =
    1.0 -
    ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
  return 0.5 * (1.0 + sign * y);
}

function computeBlackScholes(
  S: number,
  K: number,
  T: number,
  r: number,
  sigma: number
) {
  const safeT = Math.max(T, 1 / 365);
  const sqrtT = Math.sqrt(safeT);
  const d1 =
    (Math.log(S / K) + (r + 0.5 * sigma * sigma) * safeT) / (sigma * sqrtT);
  const d2 = d1 - sigma * sqrtT;

  const callPrice = Math.max(
    0.5,
    S * normCDF(d1) - K * Math.exp(-r * safeT) * normCDF(d2)
  );
  const putPrice = Math.max(
    0.5,
    K * Math.exp(-r * safeT) * normCDF(-d2) - S * normCDF(-d1)
  );
  const callDelta = normCDF(d1);
  const putDelta = callDelta - 1;

  return {
    callMark: callPrice,
    putMark: putPrice,
    callDelta,
    putDelta,
  };
}

const SMART_TRADERS = [
  {
    id: 'tr-1',
    name: 'QuantumAlpha_Perp',
    badge: 'Lead Strategist',
    roi30d: 184.6,
    pnl30d: 142850,
    winRate: 78.4,
    mdd: 6.2,
    aum: '$2.48M',
    copiers: 842,
    maxCopiers: 1000,
    activePair: 'BTCUSDT 20x Long',
  },
  {
    id: 'tr-2',
    name: 'DeltaNeutral_Lab',
    badge: 'Institutional',
    roi30d: 64.2,
    pnl30d: 98400,
    winRate: 89.1,
    mdd: 2.8,
    aum: '$4.15M',
    copiers: 960,
    maxCopiers: 1000,
    activePair: 'ETHUSDT 10x Short',
  },
  {
    id: 'tr-3',
    name: 'SolanaMomentum',
    badge: 'Top Sharpe',
    roi30d: 248.9,
    pnl30d: 76200,
    winRate: 71.5,
    mdd: 11.4,
    aum: '$980K',
    copiers: 615,
    maxCopiers: 800,
    activePair: 'SOLUSDT 25x Long',
  },
];

export const FuturesScreen: React.FC = () => {
  const {
    futuresSubTab,
    setFuturesSubTab,
    tickers,
    activeSymbol,
    setActiveSymbol,
    activeInterval,
    setActiveInterval,
    candles,
    isLoadingCandles,
    orderBook,
    wallets,
    transactions,
    futuresPositions,
    openFuturesPosition,
    closeFuturesPosition,
    updatePositionTpSl,
    openTransferModal,
    setProfileDrawerOpen,
  } = useExchange();

  // Perpetual Terminal State
  const [marginMode, setMarginMode] = useState<'Cross' | 'Isolated'>('Cross');
  const [leverage, setLeverage] = useState<number>(20);
  const [showLeverageSheet, setShowLeverageSheet] = useState(false);
  const [showContractPicker, setShowContractPicker] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('LIMIT');
  const [priceInput, setPriceInput] = useState('');
  const [marginInput, setMarginInput] = useState('');
  const [sliderPct, setSliderPct] = useState(0);
  const [tpslEnabled, setTpslEnabled] = useState(false);
  const [tpInput, setTpInput] = useState('');
  const [slInput, setSlInput] = useState('');
  const [reduceOnly, setReduceOnly] = useState(false);
  const [bottomTab, setBottomTab] = useState<'positions' | 'orders' | 'risk'>('positions');
  const [editingTpSlPosId, setEditingTpSlPosId] = useState<string | null>(null);
  const [editTpVal, setEditTpVal] = useState('');
  const [editSlVal, setEditSlVal] = useState('');
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Options State (Matches 00:25–00:28 Reference)
  const [optionsUnderlying, setOptionsUnderlying] = useState<'ETH' | 'BTC' | 'SOL'>('ETH');
  const [optionsExpiryIdx, setOptionsExpiryIdx] = useState(0);
  const [optionsCallPutFilter, setOptionsCallPutFilter] = useState<'All' | 'Call' | 'Put'>('All');
  const [showStockOptionsPromo, setShowStockOptionsPromo] = useState(true);
  const [optionsActivated, setOptionsActivated] = useState(false);
  const [selectedOptionLeg, setSelectedOptionLeg] = useState<{
    strike: number;
    type: 'CALL' | 'PUT';
    ask: number;
    bid: number;
    iv: number;
    delta: number;
  } | null>(null);
  const [optionContractsQty, setOptionContractsQty] = useState('1');

  // Smart Money State
  const [selectedTrader, setSelectedTrader] = useState<(typeof SMART_TRADERS)[0] | null>(null);
  const [copyMarginInput, setCopyMarginInput] = useState('100');
  const [activeCopyAllocations, setActiveCopyAllocations] = useState<
    Record<string, number>
  >({});

  const currentContract = useMemo(() => {
    return (
      PERP_CONTRACTS.find((c) => c.symbol === activeSymbol) || PERP_CONTRACTS[0]
    );
  }, [activeSymbol]);

  const liveTicker = tickers[currentContract.symbol];
  const markPrice = liveTicker?.lastPrice || 75798.46;
  const indexPrice = markPrice * 0.9998;
  const priceChangePct = liveTicker?.priceChangePercent || 0;
  const isPositive = priceChangePct >= 0;

  const isCoinM = futuresSubTab === 'coinm';
  const displayContractLabel = isCoinM
    ? `${currentContract.base}USD CM`
    : `${currentContract.symbol} Perp`;

  const usdmWallet = wallets.usdm_futures || {};
  const coinmWallet = wallets.coinm_futures || {};

  const usdtBalance = usdmWallet['USDT']?.available || 0;
  const coinCollateralBalance = coinmWallet[currentContract.base]?.available || 0;

  const availableMarginUsdt = isCoinM
    ? coinCollateralBalance * markPrice
    : usdtBalance;

  const effectiveEntryPrice =
    orderType === 'MARKET' ? markPrice : parseFloat(priceInput) || markPrice;
  const parsedMarginUsdt = parseFloat(marginInput) || 0;
  const notionalUsdt = parsedMarginUsdt * leverage;
  const sizeBase = effectiveEntryPrice > 0 ? notionalUsdt / effectiveEntryPrice : 0;

  const estLongLiq =
    effectiveEntryPrice * (1 - 1 / leverage + currentContract.maintMarginRate);
  const estShortLiq =
    effectiveEntryPrice * (1 + 1 / leverage - currentContract.maintMarginRate);

  const futuresTxHistory = useMemo(
    () =>
      transactions.filter(
        (t) => t.type === 'futures_open' || t.type === 'futures_close'
      ),
    [transactions]
  );

  const handleOpenPerp = (side: 'LONG' | 'SHORT') => {
    const res = openFuturesPosition({
      symbol: currentContract.symbol,
      contractType: isCoinM ? 'COINM' : 'USDM',
      side,
      leverage,
      marginMode,
      marginUsdt: parsedMarginUsdt,
      orderType,
      limitPrice: orderType === 'LIMIT' ? effectiveEntryPrice : undefined,
      takeProfit:
        tpslEnabled && parseFloat(tpInput) > 0 ? parseFloat(tpInput) : undefined,
      stopLoss:
        tpslEnabled && parseFloat(slInput) > 0 ? parseFloat(slInput) : undefined,
    });
    setFeedback({ type: res.ok ? 'success' : 'error', text: res.message });
    if (res.ok) {
      setMarginInput('');
      setSliderPct(0);
    }
    setTimeout(() => setFeedback(null), 3200);
  };

  // Options Chain Data (Matches 00:25–00:28 Reference: 5-column Ask/IV | Bid/IV | Strike | Ask/IV | Bid/IV)
  const EXPIRIES = [
    { label: '11-08 (11h:57m)', days: 1 },
    { label: '11-09', days: 2 },
    { label: '11-10', days: 3 },
    { label: '11-13', days: 6 },
    { label: '11-20', days: 13 },
  ];

  const underlyingSpot = useMemo(() => {
    const t = tickers[`${optionsUnderlying}USDT`];
    if (t?.lastPrice) return t.lastPrice;
    if (optionsUnderlying === 'ETH') return 1995.14;
    if (optionsUnderlying === 'BTC') return 75798.46;
    return 178.4;
  }, [tickers, optionsUnderlying]);

  const optionsRows = useMemo(() => {
    const step =
      optionsUnderlying === 'BTC' ? 500 : optionsUnderlying === 'ETH' ? 25 : 5;
    const center = Math.round(underlyingSpot / step) * step;
    const days = EXPIRIES[optionsExpiryIdx]?.days || 1;
    const T = days / 365;
    const rows = [];

    for (let i = -5; i <= 5; i++) {
      const strike = center + i * step;
      const moneyness = Math.abs(strike - underlyingSpot) / underlyingSpot;
      const baseIv = 0.56 + moneyness * 0.45;
      const bs = computeBlackScholes(underlyingSpot, strike, T, 0.045, baseIv);

      const callBid = Math.max(0.1, bs.callMark * 0.985);
      const callAsk = bs.callMark * 1.015;
      const putBid = Math.max(0.1, bs.putMark * 0.985);
      const putAsk = bs.putMark * 1.015;
      const callIvPct = baseIv * 100;
      const putIvPct = (baseIv + 0.018) * 100;

      rows.push({
        strike,
        callAsk,
        callBid,
        callIvPct,
        callDelta: bs.callDelta,
        putAsk,
        putBid,
        putIvPct,
        putDelta: bs.putDelta,
        isAtm: i === 0,
      });
    }
    return rows;
  }, [underlyingSpot, optionsUnderlying, optionsExpiryIdx]);

  return (
    <div className="flex flex-col min-h-screen bg-[#181A20] text-[#EAECEF] pb-24">
      {/* Top Mode Bar: USDⓈ-M | COIN-M | Options | Smart Money */}
      <div className="sticky top-11 z-20 bg-[#181A20]/95 backdrop-blur-md border-b border-[#2B3139]/60 px-4 pt-2 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-5 overflow-x-auto no-scrollbar">
          {FUTURES_TABS.map((m) => {
            const active = futuresSubTab === m.id;
            return (
              <button
                type="button"
                key={m.id}
                onClick={() => setFuturesSubTab(m.id)}
                className={`relative pb-1 text-[16px] tracking-tight transition-colors whitespace-nowrap ${
                  active
                    ? 'text-[#EAECEF] font-bold'
                    : 'text-[#848E9C] font-medium hover:text-[#EAECEF]'
                }`}
              >
                {m.label}
                {active && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[3px] rounded-full bg-[#F0B90B]" />
                )}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setProfileDrawerOpen(true)}
          className="p-1 text-[#848E9C] hover:text-[#EAECEF]"
        >
          <MoreHorizontal size={17} />
        </button>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`mx-4 mt-2 px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between border ${
            feedback.type === 'success'
              ? 'bg-[#0ECB81]/15 border-[#0ECB81]/40 text-[#0ECB81]'
              : 'bg-[#F6465D]/15 border-[#F6465D]/40 text-[#F6465D]'
          }`}
        >
          <span>{feedback.text}</span>
          <button type="button" onClick={() => setFeedback(null)}>
            <X size={13} />
          </button>
        </div>
      )}

      {/* ===================================================================
          1. USDⓈ-M & COIN-M PERPETUAL FUTURES TERMINAL
         =================================================================== */}
      {(futuresSubTab === 'usdm' || futuresSubTab === 'coinm') && (
        <div className="flex flex-col">
          {/* Contract Header + Margin Mode + Leverage + Funding Rate */}
          <div className="px-4 py-2.5 border-b border-[#2B3139]/60 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowContractPicker(true)}
                  className="flex items-center gap-1 text-left group"
                >
                  <span className="text-[18px] font-bold tracking-tight text-[#EAECEF] group-hover:text-[#F0B90B]">
                    {displayContractLabel}
                  </span>
                  <ChevronDown size={15} className="text-[#848E9C]" />
                </button>
                <span
                  className={`px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold tabular-nums ${
                    isPositive
                      ? 'bg-[#0ECB81]/15 text-[#0ECB81]'
                      : 'bg-[#F6465D]/15 text-[#F6465D]'
                  }`}
                >
                  {isPositive ? '+' : ''}
                  {priceChangePct.toFixed(2)}%
                </span>
              </div>

              <div className="flex items-center gap-2.5 text-[#848E9C]">
                <button
                  type="button"
                  onClick={() => setShowChart((v) => !v)}
                  className={`p-1 rounded ${
                    showChart
                      ? 'text-[#F0B90B] bg-[#F0B90B]/10'
                      : 'hover:text-[#EAECEF]'
                  }`}
                  title="Toggle Chart"
                >
                  <BarChart2 size={17} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowLeverageSheet(true)}
                  className="hover:text-[#EAECEF]"
                  title="Leverage & Calculator"
                >
                  <Calculator size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setFuturesSubTab('smart_money')}
                  className="hover:text-[#EAECEF]"
                  title="Copy Trading"
                >
                  <Bot size={17} />
                </button>
              </div>
            </div>

            {/* Second Row: Cross/Isolated Pill + Leverage Pill + Funding / Countdown */}
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setMarginMode((m) => (m === 'Cross' ? 'Isolated' : 'Cross'))
                  }
                  className="px-2.5 py-0.5 rounded bg-[#202630] border border-[#2B3139] font-semibold text-[#EAECEF] hover:border-[#F0B90B]"
                >
                  {marginMode}
                </button>
                <button
                  type="button"
                  onClick={() => setShowLeverageSheet(true)}
                  className="px-2.5 py-0.5 rounded bg-[#202630] border border-[#2B3139] font-mono font-bold text-[#F0B90B] hover:border-[#F0B90B] flex items-center gap-0.5"
                >
                  {leverage}x <ChevronDown size={11} />
                </button>
                <span className="px-1.5 py-0.5 rounded bg-[#202630] text-[10px] text-[#848E9C]">
                  {isCoinM ? 'Inverse' : 'Multi-Assets'}
                </span>
              </div>

              <div className="text-right font-mono tabular-nums text-[10px] text-[#848E9C]">
                <span>Funding / Countdown </span>
                <span className="text-[#EAECEF]">0.0100% / 03:41:18</span>
              </div>
            </div>
          </div>

          {/* Collapsible Candlestick Chart */}
          {showChart && (
            <div className="border-b border-[#2B3139]">
              <CandlestickChart
                symbol={currentContract.symbol}
                candles={candles}
                interval={activeInterval}
                onIntervalChange={setActiveInterval}
                isLoading={isLoadingCandles}
                height={215}
              />
            </div>
          )}

          {/* 2-Column Split: Left Futures Order Entry (col-span-7) + Right Live Order Book (col-span-5) */}
          <div className="grid grid-cols-12 px-4 pt-3 pb-3 gap-3 border-b border-[#2B3139]/80">
            {/* LEFT COLUMN: Perpetual Order Form */}
            <div className="col-span-7 flex flex-col justify-between space-y-2.5">
              {/* Available Margin Row */}
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#848E9C]">Avbl</span>
                <button
                  type="button"
                  onClick={() =>
                    openTransferModal({
                      from: 'spot',
                      to: isCoinM ? 'coinm_futures' : 'usdm_futures',
                      asset: isCoinM ? currentContract.base : 'USDT',
                    })
                  }
                  className="font-mono tabular-nums text-[#EAECEF] flex items-center gap-1 hover:text-[#F0B90B]"
                >
                  {isCoinM
                    ? `${coinCollateralBalance.toFixed(4)} ${currentContract.base}`
                    : `${usdtBalance.toFixed(2)} USDT`}
                  <Plus size={11} className="text-[#F0B90B]" />
                </button>
              </div>

              {/* Order Type Toggle (Limit | Market) */}
              <div className="grid grid-cols-2 bg-[#202630] p-0.5 rounded-lg border border-[#2B3139]">
                <button
                  type="button"
                  onClick={() => setOrderType('LIMIT')}
                  className={`h-7 rounded-md text-xs font-semibold ${
                    orderType === 'LIMIT'
                      ? 'bg-[#2B3139] text-[#EAECEF]'
                      : 'text-[#848E9C]'
                  }`}
                >
                  Limit
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('MARKET')}
                  className={`h-7 rounded-md text-xs font-semibold ${
                    orderType === 'MARKET'
                      ? 'bg-[#2B3139] text-[#EAECEF]'
                      : 'text-[#848E9C]'
                  }`}
                >
                  Market
                </button>
              </div>

              {/* Price Input with [-] [+] */}
              {orderType === 'LIMIT' ? (
                <div className="h-9 bg-[#202630] border border-[#2B3139] focus-within:border-[#F0B90B] rounded-lg flex items-center justify-between px-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const cur = parseFloat(priceInput) || markPrice;
                      setPriceInput(Math.max(0.01, cur - 1).toFixed(2));
                    }}
                    className="w-6 h-6 rounded flex items-center justify-center text-[#848E9C] hover:text-[#EAECEF]"
                  >
                    <Minus size={13} />
                  </button>
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-[9px] text-[#848E9C] leading-none">
                      Price (USDT)
                    </span>
                    <input
                      type="number"
                      value={priceInput || markPrice.toFixed(2)}
                      onChange={(e) => setPriceInput(e.target.value)}
                      className="w-full bg-transparent text-center text-xs font-mono font-bold tabular-nums text-[#EAECEF] focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const cur = parseFloat(priceInput) || markPrice;
                      setPriceInput((cur + 1).toFixed(2));
                    }}
                    className="w-6 h-6 rounded flex items-center justify-center text-[#848E9C] hover:text-[#EAECEF]"
                  >
                    <Plus size={13} />
                  </button>
                </div>
              ) : (
                <div className="h-9 bg-[#202630]/60 border border-[#2B3139] rounded-lg flex items-center justify-center text-xs text-[#848E9C] font-medium">
                  Market Price (≈ {formatPrice(markPrice)})
                </div>
              )}

              {/* Margin Cost Input with [-] [+] */}
              <div className="h-9 bg-[#202630] border border-[#2B3139] focus-within:border-[#F0B90B] rounded-lg flex items-center justify-between px-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const cur = parseFloat(marginInput) || 0;
                    setMarginInput(Math.max(0, cur - 10).toString());
                  }}
                  className="w-6 h-6 rounded flex items-center justify-center text-[#848E9C] hover:text-[#EAECEF]"
                >
                  <Minus size={13} />
                </button>
                <div className="flex flex-col items-center flex-1">
                  <span className="text-[9px] text-[#848E9C] leading-none">
                    Margin (USDT)
                  </span>
                  <input
                    type="number"
                    value={marginInput}
                    onChange={(e) => {
                      setMarginInput(e.target.value);
                      setSliderPct(0);
                    }}
                    placeholder="Min 5 USDT"
                    className="w-full bg-transparent text-center text-xs font-mono font-bold tabular-nums text-[#EAECEF] focus:outline-none placeholder-[#474D57]"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const cur = parseFloat(marginInput) || 0;
                    setMarginInput((cur + 10).toString());
                  }}
                  className="w-6 h-6 rounded flex items-center justify-center text-[#848E9C] hover:text-[#EAECEF]"
                >
                  <Plus size={13} />
                </button>
              </div>

              {/* 4-Node Diamond Slider */}
              <div className="px-1 pt-0.5">
                <div className="relative flex items-center justify-between">
                  <div className="absolute left-0 right-0 h-[2px] bg-[#2B3139]" />
                  <div
                    className="absolute left-0 h-[2px] bg-[#F0B90B]"
                    style={{ width: `${sliderPct}%` }}
                  />
                  {[0, 25, 50, 75, 100].map((pct) => (
                    <button
                      type="button"
                      key={pct}
                      onClick={() => {
                        setSliderPct(pct);
                        const calc = (
                          availableMarginUsdt *
                          (pct / 100) *
                          0.98
                        ).toFixed(2);
                        setMarginInput(parseFloat(calc) > 0 ? calc : '');
                      }}
                      className="relative z-10 flex flex-col items-center"
                    >
                      <span
                        className={`w-2.5 h-2.5 rotate-45 border ${
                          sliderPct >= pct && pct > 0
                            ? 'bg-[#F0B90B] border-[#F0B90B]'
                            : 'bg-[#181A20] border-[#474D57]'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* TP/SL & Reduce-Only Checkboxes */}
              <div className="flex items-center justify-between text-[11px] text-[#848E9C]">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tpslEnabled}
                    onChange={(e) => setTpslEnabled(e.target.checked)}
                    className="w-3.5 h-3.5 rounded accent-[#F0B90B]"
                  />
                  <span>TP/SL</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reduceOnly}
                    onChange={(e) => setReduceOnly(e.target.checked)}
                    className="w-3.5 h-3.5 rounded accent-[#F0B90B]"
                  />
                  <span>Reduce-Only</span>
                </label>
              </div>

              {tpslEnabled && (
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="number"
                    value={tpInput}
                    onChange={(e) => setTpInput(e.target.value)}
                    placeholder="Take Profit"
                    className="h-7 bg-[#202630] border border-[#2B3139] rounded px-2 text-[11px] font-mono text-[#0ECB81] focus:outline-none"
                  />
                  <input
                    type="number"
                    value={slInput}
                    onChange={(e) => setSlInput(e.target.value)}
                    placeholder="Stop Loss"
                    className="h-7 bg-[#202630] border border-[#2B3139] rounded px-2 text-[11px] font-mono text-[#F6465D] focus:outline-none"
                  />
                </div>
              )}

              {/* Pre-Trade Notional & Liq Readout */}
              <div className="space-y-0.5 text-[10px] text-[#848E9C] font-mono tabular-nums">
                <div className="flex justify-between">
                  <span>Size ({currentContract.base})</span>
                  <span className="text-[#EAECEF]">{sizeBase.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Liq (Long / Short)</span>
                  <span className="text-[#EAECEF]">
                    {parsedMarginUsdt > 0
                      ? `${formatPrice(estLongLiq)} / ${formatPrice(estShortLiq)}`
                      : '-- / --'}
                  </span>
                </div>
              </div>

              {/* Dual Action Buttons: Buy / Long & Sell / Short */}
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => handleOpenPerp('LONG')}
                  className="h-9 rounded-lg bg-[#0ECB81] hover:bg-[#0ECB81]/90 text-white font-bold text-xs transition-opacity"
                >
                  Buy / Long
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenPerp('SHORT')}
                  className="h-9 rounded-lg bg-[#F6465D] hover:bg-[#F6465D]/90 text-white font-bold text-xs transition-opacity"
                >
                  Sell / Short
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: Live Futures Order Book */}
            <div className="col-span-5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[10px] text-[#848E9C] pb-1">
                <div>Price (USDT)</div>
                <div className="text-right">Size ({currentContract.base})</div>
              </div>

              {/* Asks */}
              <div className="space-y-[2px]">
                {(() => {
                  const asksSlice = orderBook.asks.slice(0, 6).reverse();
                  const maxAsk = Math.max(
                    ...asksSlice.map((a) => a.quantity),
                    0.0001
                  );
                  return asksSlice.map((ask, i) => {
                    const pct = Math.min(100, (ask.quantity / maxAsk) * 100);
                    return (
                      <button
                        type="button"
                        key={`f-ask-${i}`}
                        onClick={() => setPriceInput(ask.price.toFixed(2))}
                        className="relative w-full h-[20px] flex items-center justify-between px-1 text-[11px] font-mono tabular-nums overflow-hidden rounded-xs"
                      >
                        <div
                          className="absolute right-0 top-0 bottom-0 bg-[#F6465D]/15"
                          style={{ width: `${pct}%` }}
                        />
                        <span className="relative z-10 text-[#F6465D]">
                          {formatPrice(ask.price)}
                        </span>
                        <span className="relative z-10 text-[#EAECEF]">
                          {ask.quantity.toFixed(3)}
                        </span>
                      </button>
                    );
                  });
                })()}
              </div>

              {/* Mark & Index Price Center Strip */}
              <div className="my-1.5 py-1 border-y border-[#2B3139]/60">
                <div
                  className={`text-[15px] font-bold font-mono tabular-nums leading-tight ${
                    isPositive ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                  }`}
                >
                  {formatPrice(markPrice)}
                </div>
                <div className="text-[10px] text-[#848E9C] font-mono tabular-nums flex items-center gap-1">
                  <span>Mark {formatPrice(indexPrice)}</span>
                </div>
              </div>

              {/* Bids */}
              <div className="space-y-[2px]">
                {(() => {
                  const bidsSlice = orderBook.bids.slice(0, 6);
                  const maxBid = Math.max(
                    ...bidsSlice.map((b) => b.quantity),
                    0.0001
                  );
                  return bidsSlice.map((bid, i) => {
                    const pct = Math.min(100, (bid.quantity / maxBid) * 100);
                    return (
                      <button
                        type="button"
                        key={`f-bid-${i}`}
                        onClick={() => setPriceInput(bid.price.toFixed(2))}
                        className="relative w-full h-[20px] flex items-center justify-between px-1 text-[11px] font-mono tabular-nums overflow-hidden rounded-xs"
                      >
                        <div
                          className="absolute right-0 top-0 bottom-0 bg-[#0ECB81]/15"
                          style={{ width: `${pct}%` }}
                        />
                        <span className="relative z-10 text-[#0ECB81]">
                          {formatPrice(bid.price)}
                        </span>
                        <span className="relative z-10 text-[#EAECEF]">
                          {bid.quantity.toFixed(3)}
                        </span>
                      </button>
                    );
                  });
                })()}
              </div>
            </div>
          </div>

          {/* Bottom Positions & Risk Tabs */}
          <div className="px-4 pt-1">
            <div className="flex items-center justify-between border-b border-[#2B3139]">
              <div className="flex items-center gap-5">
                {[
                  {
                    id: 'positions',
                    label: `Positions (${futuresPositions.length})`,
                  },
                  {
                    id: 'orders',
                    label: `Order History (${futuresTxHistory.length})`,
                  },
                  { id: 'risk', label: 'Margin & Risk' },
                ].map((t) => (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => setBottomTab(t.id as typeof bottomTab)}
                    className={`pb-2.5 pt-2 text-xs font-semibold relative ${
                      bottomTab === t.id ? 'text-[#EAECEF]' : 'text-[#848E9C]'
                    }`}
                  >
                    {t.label}
                    {bottomTab === t.id && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#F0B90B]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="py-3">
              {bottomTab === 'positions' && (
                <>
                  {futuresPositions.length === 0 ? (
                    <div className="py-8 text-center space-y-2">
                      <div className="text-xs font-semibold text-[#EAECEF]">
                        No Open Futures Positions
                      </div>
                      <div className="text-[11px] text-[#848E9C]">
                        Open a Long or Short perpetual position above to track live PnL & ROE%
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {futuresPositions.map((pos) => {
                        const posMark = tickers[pos.symbol]?.lastPrice || pos.entryPrice;
                        const priceDiff =
                          pos.side === 'LONG'
                            ? posMark - pos.entryPrice
                            : pos.entryPrice - posMark;
                        const unrealizedPnl = priceDiff * pos.sizeAsset;
                        const roePercent =
                          pos.marginUsdt > 0 ? (unrealizedPnl / pos.marginUsdt) * 100 : 0;
                        const isPnlPos = unrealizedPnl >= 0;

                        return (
                          <div
                            key={pos.id}
                            className="bg-[#202630] rounded-xl p-3.5 border border-[#2B3139] space-y-2.5 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold text-white ${
                                    pos.side === 'LONG' ? 'bg-[#0ECB81]' : 'bg-[#F6465D]'
                                  }`}
                                >
                                  {pos.side === 'LONG' ? 'Long' : 'Short'}
                                </span>
                                <span className="font-bold text-sm text-[#EAECEF]">
                                  {pos.symbol} Perp
                                </span>
                                <span className="text-[11px] px-1.5 py-0.5 rounded bg-[#2B3139] text-[#F0B90B] font-mono">
                                  {pos.marginMode} {pos.leverage}x
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => closeFuturesPosition(pos.id)}
                                className="px-2.5 py-1 rounded-lg bg-[#2B3139] hover:bg-[#F6465D] hover:text-white text-[11px] font-semibold transition-colors"
                              >
                                Close Position
                              </button>
                            </div>

                            <div className="flex items-end justify-between font-mono tabular-nums">
                              <div>
                                <div className="text-[10px] text-[#848E9C] font-sans">
                                  Unrealized PNL (USDT)
                                </div>
                                <div
                                  className={`text-base font-bold ${
                                    isPnlPos ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                                  }`}
                                >
                                  {isPnlPos ? '+' : ''}
                                  {unrealizedPnl.toFixed(2)}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-[10px] text-[#848E9C] font-sans">ROE</div>
                                <div
                                  className={`text-base font-bold ${
                                    isPnlPos ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                                  }`}
                                >
                                  {isPnlPos ? '+' : ''}
                                  {roePercent.toFixed(2)}%
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 pt-1.5 border-t border-[#2B3139]/60 font-mono tabular-nums text-[11px]">
                              <div>
                                <div className="text-[10px] text-[#848E9C] font-sans">
                                  Size / Margin
                                </div>
                                <div className="text-[#EAECEF]">
                                  {pos.sizeAsset.toFixed(4)} / ${pos.marginUsdt.toFixed(2)}
                                </div>
                              </div>
                              <div>
                                <div className="text-[10px] text-[#848E9C] font-sans">
                                  Entry / Mark
                                </div>
                                <div className="text-[#EAECEF]">
                                  {formatPrice(pos.entryPrice)} / {formatPrice(posMark)}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-[10px] text-[#848E9C] font-sans">
                                  Liq. Price
                                </div>
                                <div className="text-[#F0B90B]">
                                  {formatPrice(pos.liquidationPrice)}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-1 text-[11px] text-[#848E9C]">
                              <span>
                                TP/SL:{' '}
                                <b className="text-[#0ECB81] font-mono">
                                  {pos.takeProfit ? formatPrice(pos.takeProfit) : '--'}
                                </b>{' '}
                                /{' '}
                                <b className="text-[#F6465D] font-mono">
                                  {pos.stopLoss ? formatPrice(pos.stopLoss) : '--'}
                                </b>
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingTpSlPosId(pos.id);
                                  setEditTpVal(pos.takeProfit ? pos.takeProfit.toString() : '');
                                  setEditSlVal(pos.stopLoss ? pos.stopLoss.toString() : '');
                                }}
                                className="text-[#F0B90B] font-semibold"
                              >
                                Edit TP/SL
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {bottomTab === 'orders' && (
                <div className="space-y-2">
                  {futuresTxHistory.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[#848E9C]">
                      No futures order history
                    </div>
                  ) : (
                    futuresTxHistory.slice(0, 15).map((tx) => (
                      <div
                        key={tx.id}
                        className="bg-[#202630] rounded-xl p-3 border border-[#2B3139] flex items-center justify-between text-xs font-mono tabular-nums"
                      >
                        <div>
                          <div className="font-sans font-bold text-[#EAECEF]">
                            {tx.type === 'futures_open' ? 'OPEN POSITION' : 'CLOSE POSITION'}
                          </div>
                          <div className="text-[11px] text-[#848E9C] font-sans mt-0.5">
                            {tx.note}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[#EAECEF]">
                            {tx.amount.toFixed(2)} {tx.asset}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {bottomTab === 'risk' && (
                <div className="bg-[#202630] rounded-xl p-3.5 border border-[#2B3139] space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#848E9C]">Margin Ratio</span>
                    <span className="font-mono font-bold text-[#0ECB81]">1.84% (Low Risk)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#848E9C]">Maintenance Margin</span>
                    <span className="font-mono text-[#EAECEF]">
                      $
                      {futuresPositions
                        .reduce((acc, p) => acc + p.marginUsdt * 0.05, 0)
                        .toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#848E9C]">Wallet Balance</span>
                    <span className="font-mono text-[#EAECEF]">${usdtBalance.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          2. OPTIONS TAB (Matches 00:25–00:28 Reference: 5-Column T-Chain + Sticky Activate CTA)
         =================================================================== */}
      {futuresSubTab === 'options' && (
        <div className="flex flex-col flex-1 pb-24">
          {/* Top Underlying Selector ([ETH icon] ETH ▾) + Expiry Countdown Tabs */}
          <div className="px-4 pt-2.5 pb-2 border-b border-[#2B3139]/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CoinIcon asset={optionsUnderlying} size="sm" />
                <select
                  value={optionsUnderlying}
                  onChange={(e) =>
                    setOptionsUnderlying(e.target.value as typeof optionsUnderlying)
                  }
                  className="bg-transparent text-base font-bold text-[#EAECEF] focus:outline-none cursor-pointer"
                >
                  <option value="ETH" className="bg-[#1E2329]">
                    ETH
                  </option>
                  <option value="BTC" className="bg-[#1E2329]">
                    BTC
                  </option>
                  <option value="SOL" className="bg-[#1E2329]">
                    SOL
                  </option>
                </select>
                <span className="text-xs font-mono tabular-nums text-[#0ECB81]">
                  ${formatPrice(underlyingSpot)}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[#848E9C]">
                <span className="text-[11px] font-mono">ATM IV: 56.4%</span>
              </div>
            </div>

            {/* Expiry Date Strip (Matches 00:26: 11-08 (11h:57m) | 11-09 | 11-10 | 11-13) */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {EXPIRIES.map((exp, idx) => (
                <button
                  type="button"
                  key={exp.label}
                  onClick={() => setOptionsExpiryIdx(idx)}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono whitespace-nowrap transition-colors ${
                    optionsExpiryIdx === idx
                      ? 'bg-[#2B3139] text-[#EAECEF] font-bold'
                      : 'text-[#848E9C] hover:text-[#EAECEF]'
                  }`}
                >
                  {exp.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dismissible Promo Banner: Trade U.S. Stock Options (Matches 00:26) */}
          {showStockOptionsPromo && (
            <div className="mx-4 mt-2.5 p-3 rounded-xl bg-[#202630] border border-[#2B3139] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#F0B90B]/15 text-[#F0B90B] flex items-center justify-center shrink-0">
                  <Sparkles size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#EAECEF]">
                    Trade U.S. Stock Options
                  </div>
                  <div className="text-[11px] text-[#848E9C]">
                    Now on NexusTrade · Low Entry, High Leverage
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowStockOptionsPromo(false)}
                className="text-[#848E9C] hover:text-[#EAECEF] p-1"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Filter Pills Row: All | Call | Put + Right Utility Icons */}
          <div className="px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {(['All', 'Call', 'Put'] as const).map((f) => (
                <button
                  type="button"
                  key={f}
                  onClick={() => setOptionsCallPutFilter(f)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold ${
                    optionsCallPutFilter === f
                      ? 'bg-[#2B3139] text-[#EAECEF]'
                      : 'text-[#848E9C]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 text-xs text-[#848E9C]">
              <span>markPrice / IV</span>
              <SlidersHorizontal size={14} />
            </div>
          </div>

          {/* 5-Column Options T-Chain Table (Matches 00:26: Ask/IV | Bid/IV | Strike | Ask/IV | Bid/IV) */}
          <div className="px-2">
            {/* Call / Put Super Header */}
            <div className="grid grid-cols-11 text-[11px] font-bold px-2 py-1 border-b border-[#2B3139]/60">
              <div className="col-span-5 text-[#0ECB81]">Call</div>
              <div className="col-span-1 text-center text-[#848E9C]" />
              <div className="col-span-5 text-right text-[#F6465D]">Put</div>
            </div>

            {/* 5-Column Sub-Header */}
            <div className="grid grid-cols-11 text-[10px] text-[#848E9C] px-2 py-1.5 border-b border-[#2B3139]">
              <div className="col-span-2 text-left">Ask / IV</div>
              <div className="col-span-3 text-right pr-2">Bid / IV</div>
              <div className="col-span-1 text-center font-semibold text-[#EAECEF]">
                Strike
              </div>
              <div className="col-span-3 text-left pl-2">Ask / IV</div>
              <div className="col-span-2 text-right">Bid / IV</div>
            </div>

            {/* T-Chain Rows */}
            <div className="divide-y divide-[#2B3139]/40">
              {optionsRows.map((row) => (
                <React.Fragment key={row.strike}>
                  {row.isAtm && (
                    <div className="py-1 bg-[#202630] text-center text-[10px] font-mono text-[#F0B90B] border-y border-[#F0B90B]/30">
                      {optionsUnderlying}USDT Spot Index: {formatPrice(underlyingSpot)}
                    </div>
                  )}
                  <div className="grid grid-cols-11 items-center py-2 px-2 font-mono tabular-nums text-[11px] hover:bg-[#202630]/70 transition-colors">
                    {/* Call Ask / IV */}
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedOptionLeg({
                          strike: row.strike,
                          type: 'CALL',
                          ask: row.callAsk,
                          bid: row.callBid,
                          iv: row.callIvPct,
                          delta: row.callDelta,
                        })
                      }
                      className={`col-span-2 text-left ${
                        optionsCallPutFilter === 'Put'
                          ? 'opacity-30 pointer-events-none'
                          : ''
                      }`}
                    >
                      <div className="text-[#EAECEF] font-semibold">
                        {row.callAsk.toFixed(1)}
                      </div>
                      <div className="text-[9px] text-[#848E9C]">
                        {row.callIvPct.toFixed(1)}%
                      </div>
                    </button>

                    {/* Call Bid / IV */}
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedOptionLeg({
                          strike: row.strike,
                          type: 'CALL',
                          ask: row.callAsk,
                          bid: row.callBid,
                          iv: row.callIvPct,
                          delta: row.callDelta,
                        })
                      }
                      className={`col-span-3 text-right pr-2 ${
                        optionsCallPutFilter === 'Put'
                          ? 'opacity-30 pointer-events-none'
                          : ''
                      }`}
                    >
                      <div className="text-[#0ECB81] font-semibold">
                        {row.callBid.toFixed(1)}
                      </div>
                      <div className="text-[9px] text-[#848E9C]">
                        Δ {row.callDelta.toFixed(2)}
                      </div>
                    </button>

                    {/* Center Strike Column */}
                    <div className="col-span-1 text-center font-bold text-[#EAECEF] bg-[#202630] py-1.5 rounded text-[10px]">
                      {row.strike}
                    </div>

                    {/* Put Ask / IV */}
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedOptionLeg({
                          strike: row.strike,
                          type: 'PUT',
                          ask: row.putAsk,
                          bid: row.putBid,
                          iv: row.putIvPct,
                          delta: row.putDelta,
                        })
                      }
                      className={`col-span-3 text-left pl-2 ${
                        optionsCallPutFilter === 'Call'
                          ? 'opacity-30 pointer-events-none'
                          : ''
                      }`}
                    >
                      <div className="text-[#EAECEF] font-semibold">
                        {row.putAsk.toFixed(1)}
                      </div>
                      <div className="text-[9px] text-[#848E9C]">
                        {row.putIvPct.toFixed(1)}%
                      </div>
                    </button>

                    {/* Put Bid / IV */}
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedOptionLeg({
                          strike: row.strike,
                          type: 'PUT',
                          ask: row.putAsk,
                          bid: row.putBid,
                          iv: row.putIvPct,
                          delta: row.putDelta,
                        })
                      }
                      className={`col-span-2 text-right ${
                        optionsCallPutFilter === 'Call'
                          ? 'opacity-30 pointer-events-none'
                          : ''
                      }`}
                    >
                      <div className="text-[#F6465D] font-semibold">
                        {row.putBid.toFixed(1)}
                      </div>
                      <div className="text-[9px] text-[#848E9C]">
                        Δ {row.putDelta.toFixed(2)}
                      </div>
                    </button>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Sticky Bottom Activate Options Account Footer Card (Matches 00:26–00:28) */}
          {!optionsActivated && (
            <div className="mx-4 mt-4 p-3.5 rounded-2xl bg-[#202630] border border-[#2B3139] space-y-2.5 shadow-lg">
              <div className="text-xs text-[#EAECEF]">
                Wanna hedge risks? Activate your Options Account and trade on the go!
              </div>
              <button
                type="button"
                onClick={() => {
                  setOptionsActivated(true);
                  setFeedback({
                    type: 'success',
                    text: 'Options trading account activated. Tap any strike to trade.',
                  });
                  setTimeout(() => setFeedback(null), 3000);
                }}
                className="w-full h-10 rounded-xl bg-[#FCD535] hover:bg-[#F0B90B] text-[#181A20] font-bold text-xs transition-colors"
              >
                Activate Options Account
              </button>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================
          3. SMART MONEY / COPY TRADING LEADERBOARD
         =================================================================== */}
      {futuresSubTab === 'smart_money' && (
        <div className="px-4 pt-3 space-y-3">
          <div className="bg-gradient-to-r from-[#202630] to-[#2B3139] rounded-xl p-3.5 border border-[#2B3139] flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#F0B90B]">
                <Award size={14} /> Smart Money Copy Trading
              </div>
              <div className="text-[11px] text-[#848E9C] mt-0.5">
                Mirror verified perpetual lead traders with automatic risk guardrails
              </div>
            </div>
            <div className="text-right font-mono text-xs">
              <div className="text-[10px] text-[#848E9C]">Allocated</div>
              <div className="font-bold text-[#EAECEF]">
                $
                {Object.values(activeCopyAllocations)
                  .reduce((a, b) => a + b, 0)
                  .toFixed(0)}
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            {SMART_TRADERS.map((tr) => {
              const allocated = activeCopyAllocations[tr.id] || 0;
              return (
                <div
                  key={tr.id}
                  className="bg-[#202630] rounded-xl p-3.5 border border-[#2B3139] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#F0B90B]/20 text-[#F0B90B] font-bold text-xs flex items-center justify-center">
                        {tr.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-[#EAECEF]">{tr.name}</div>
                        <div className="text-[10px] text-[#848E9C] flex items-center gap-1.5">
                          <span className="text-[#F0B90B]">{tr.badge}</span>
                          <span>·</span>
                          <span>
                            {tr.copiers}/{tr.maxCopiers} copiers
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedTrader(tr)}
                      className="px-4 py-1.5 rounded-lg bg-[#FCD535] hover:bg-[#F0B90B] text-[#181A20] text-xs font-bold"
                    >
                      {allocated > 0 ? `Copying ($${allocated})` : 'Copy'}
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#2B3139]/60 font-mono tabular-nums text-xs">
                    <div>
                      <div className="text-[10px] text-[#848E9C] font-sans">30D ROI</div>
                      <div className="font-bold text-[#0ECB81]">+{tr.roi30d.toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#848E9C] font-sans">Win Rate</div>
                      <div className="font-bold text-[#EAECEF]">{tr.winRate}%</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-[#848E9C] font-sans">AUM</div>
                      <div className="font-bold text-[#EAECEF]">{tr.aum}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================
          SHEETS & MODALS
         =================================================================== */}

      {/* Contract Selector Sheet */}
      {showContractPicker && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end justify-center"
          onClick={() => setShowContractPicker(false)}
        >
          <div
            className="w-full max-w-[430px] bg-[#1E2329] rounded-t-3xl border-t border-[#2B3139] p-4 space-y-2 pb-safe-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-[#474D57] rounded-full mx-auto mb-1" />
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-[15px] text-[#EAECEF]">
                Select Futures Contract
              </span>
              <button
                type="button"
                onClick={() => setShowContractPicker(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#202630]"
                aria-label="Close contract picker"
              >
                <X size={16} />
              </button>
            </div>
            {PERP_CONTRACTS.map((c) => {
              const t = tickers[c.symbol];
              const pct = t?.priceChangePercent || 0;
              return (
                <button
                  type="button"
                  key={c.symbol}
                  onClick={() => {
                    setActiveSymbol(c.symbol);
                    setPriceInput('');
                    setShowContractPicker(false);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl hover:bg-[#2B3139] flex items-center justify-between text-xs transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <CoinIcon asset={c.base} size="sm" />
                    <span className="font-bold text-[#EAECEF]">{c.symbol} Perp</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2B3139] text-[#F0B90B] font-mono">
                      Up to {c.maxLev}x
                    </span>
                  </div>
                  <div className="text-right font-mono tabular-nums">
                    <div className="font-bold text-[#EAECEF]">
                      {formatPrice(t?.lastPrice || 0)}
                    </div>
                    <div
                      className={`text-[10px] ${
                        pct >= 0 ? 'text-[#2EBD85]' : 'text-[#F6465D]'
                      }`}
                    >
                      {pct >= 0 ? '+' : ''}
                      {pct.toFixed(2)}%
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Leverage Adjuster Sheet */}
      {showLeverageSheet && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end justify-center"
          onClick={() => setShowLeverageSheet(false)}
        >
          <div
            className="w-full max-w-[430px] bg-[#1E2329] rounded-t-3xl border-t border-[#2B3139] p-5 space-y-4 pb-safe-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-[#474D57] rounded-full mx-auto -mt-1" />
            <div className="flex items-center justify-between">
              <span className="font-bold text-[15px] text-[#EAECEF]">Adjust Leverage</span>
              <button
                type="button"
                onClick={() => setShowLeverageSheet(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#202630]"
                aria-label="Close leverage sheet"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex items-center justify-between bg-[#202630] border border-[#2B3139] rounded-xl p-3">
              <button
                type="button"
                onClick={() => setLeverage((l) => Math.max(1, l - 1))}
                className="w-8 h-8 rounded-lg bg-[#2B3139] flex items-center justify-center text-[#EAECEF] hover:bg-[#363C45]"
              >
                <Minus size={15} />
              </button>
              <span className="text-2xl font-bold font-mono tabular-nums text-[#F0B90B]">
                {leverage}x
              </span>
              <button
                type="button"
                onClick={() =>
                  setLeverage((l) => Math.min(currentContract.maxLev, l + 1))
                }
                className="w-8 h-8 rounded-lg bg-[#2B3139] flex items-center justify-center text-[#EAECEF] hover:bg-[#363C45]"
              >
                <Plus size={15} />
              </button>
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              {[5, 10, 20, 50, 75, 125]
                .filter((v) => v <= currentContract.maxLev)
                .map((v) => (
                  <button
                    type="button"
                    key={v}
                    onClick={() => setLeverage(v)}
                    className={`py-1.5 rounded-lg text-xs font-mono tabular-nums font-bold ${
                      leverage === v
                        ? 'bg-[#F0B90B] text-[#181A20]'
                        : 'bg-[#202630] text-[#848E9C]'
                    }`}
                  >
                    {v}x
                  </button>
                ))}
            </div>
            <button
              type="button"
              onClick={() => setShowLeverageSheet(false)}
              className="w-full h-11 rounded-xl bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] font-bold text-sm transition-colors"
            >
              Confirm ({leverage}x)
            </button>
          </div>
        </div>
      )}

      {/* Edit Position TP/SL Modal */}
      {editingTpSlPosId && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end justify-center"
          onClick={() => setEditingTpSlPosId(null)}
        >
          <div
            className="w-full max-w-[430px] bg-[#1E2329] rounded-t-3xl border-t border-[#2B3139] p-5 space-y-3.5 pb-safe-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-[#474D57] rounded-full mx-auto -mt-1" />
            <div className="flex items-center justify-between">
              <span className="font-bold text-[15px] text-[#EAECEF]">Position TP / SL</span>
              <button
                type="button"
                onClick={() => setEditingTpSlPosId(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#202630]"
                aria-label="Close TP/SL modal"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-2.5 text-xs">
              <div>
                <label className="text-[#848E9C] block mb-1">
                  Take Profit Price (USDT)
                </label>
                <input
                  type="number"
                  value={editTpVal}
                  onChange={(e) => setEditTpVal(e.target.value)}
                  className="w-full h-10 bg-[#202630] border border-[#2B3139] focus:border-[#F0B90B] rounded-xl px-3 font-mono tabular-nums text-[#2EBD85] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[#848E9C] block mb-1">
                  Stop Loss Price (USDT)
                </label>
                <input
                  type="number"
                  value={editSlVal}
                  onChange={(e) => setEditSlVal(e.target.value)}
                  className="w-full h-10 bg-[#202630] border border-[#2B3139] focus:border-[#F0B90B] rounded-xl px-3 font-mono tabular-nums text-[#F6465D] focus:outline-none"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                updatePositionTpSl(
                  editingTpSlPosId,
                  parseFloat(editTpVal) > 0 ? parseFloat(editTpVal) : undefined,
                  parseFloat(editSlVal) > 0 ? parseFloat(editSlVal) : undefined
                );
                setEditingTpSlPosId(null);
              }}
              className="w-full h-11 rounded-xl bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] font-bold text-xs transition-colors"
            >
              Save TP/SL
            </button>
          </div>
        </div>
      )}

      {/* Option Contract Order Sheet */}
      {selectedOptionLeg && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end justify-center"
          onClick={() => setSelectedOptionLeg(null)}
        >
          <div
            className="w-full max-w-[430px] bg-[#1E2329] rounded-t-3xl border-t border-[#2B3139] p-5 space-y-3.5 pb-safe-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-[#474D57] rounded-full mx-auto -mt-1" />
            <div className="flex items-center justify-between">
              <span className="font-bold text-[15px] text-[#EAECEF]">
                {optionsUnderlying}-{EXPIRIES[optionsExpiryIdx]?.label.split(' ')[0]}-
                {selectedOptionLeg.strike}-
                {selectedOptionLeg.type === 'CALL' ? 'C' : 'P'}
              </span>
              <button
                type="button"
                onClick={() => setSelectedOptionLeg(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#202630]"
                aria-label="Close option order sheet"
              >
                <X size={16} />
              </button>
            </div>
            <div className="bg-[#202630] border border-[#2B3139] rounded-xl p-3.5 space-y-1.5 text-xs font-mono tabular-nums">
              <div className="flex justify-between">
                <span className="text-[#848E9C] font-sans">Ask / Bid Premium</span>
                <span className="text-[#EAECEF] font-bold">
                  ${selectedOptionLeg.ask.toFixed(2)} / $
                  {selectedOptionLeg.bid.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#848E9C] font-sans">
                  Implied Volatility / Delta
                </span>
                <span className="text-[#F0B90B]">
                  {selectedOptionLeg.iv.toFixed(1)}% / Δ{' '}
                  {selectedOptionLeg.delta.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#848E9C] font-sans">Breakeven Price</span>
                <span className="text-[#2EBD85]">
                  $
                  {(selectedOptionLeg.type === 'CALL'
                    ? selectedOptionLeg.strike + selectedOptionLeg.ask
                    : selectedOptionLeg.strike - selectedOptionLeg.ask
                  ).toFixed(2)}
                </span>
              </div>
              <div className="pt-1.5">
                <label className="text-[#848E9C] font-sans block mb-1">
                  Contracts ({optionsUnderlying})
                </label>
                <input
                  type="number"
                  value={optionContractsQty}
                  onChange={(e) => setOptionContractsQty(e.target.value)}
                  className="w-full h-10 bg-[#181A20] border border-[#2B3139] focus:border-[#F0B90B] rounded-xl px-3 font-mono tabular-nums font-bold text-[#EAECEF] focus:outline-none"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                const qty = parseFloat(optionContractsQty) || 1;
                const totalPremium = qty * selectedOptionLeg.ask;
                setFeedback({
                  type: 'success',
                  text: `Submitted ${qty}x ${optionsUnderlying} ${selectedOptionLeg.strike} ${selectedOptionLeg.type} order (Premium $${totalPremium.toFixed(2)})`,
                });
                setSelectedOptionLeg(null);
                setTimeout(() => setFeedback(null), 3200);
              }}
              className={`w-full h-11 rounded-xl font-bold text-xs text-white ${
                selectedOptionLeg.type === 'CALL' ? 'bg-[#2EBD85]' : 'bg-[#F6465D]'
              }`}
            >
              Buy {selectedOptionLeg.type} Option
            </button>
          </div>
        </div>
      )}

      {/* Copy Trader Allocation Sheet */}
      {selectedTrader && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end justify-center"
          onClick={() => setSelectedTrader(null)}
        >
          <div
            className="w-full max-w-[430px] bg-[#1E2329] rounded-t-3xl border-t border-[#2B3139] p-5 space-y-3.5 pb-safe-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-[#474D57] rounded-full mx-auto -mt-1" />
            <div className="flex items-center justify-between">
              <span className="font-bold text-[15px] text-[#EAECEF]">
                Copy {selectedTrader.name}
              </span>
              <button
                type="button"
                onClick={() => setSelectedTrader(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#202630]"
                aria-label="Close copy allocation sheet"
              >
                <X size={16} />
              </button>
            </div>
            <div className="bg-[#202630] border border-[#2B3139] rounded-xl p-3.5 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#848E9C]">30D ROI / Win Rate</span>
                <span className="font-mono tabular-nums font-bold text-[#2EBD85]">
                  +{selectedTrader.roi30d}% / {selectedTrader.winRate}%
                </span>
              </div>
              <input
                type="number"
                value={copyMarginInput}
                onChange={(e) => setCopyMarginInput(e.target.value)}
                placeholder="Copy Margin (USDT)"
                className="w-full h-10 bg-[#181A20] border border-[#2B3139] focus:border-[#F0B90B] rounded-xl px-3 font-mono tabular-nums font-bold text-[#EAECEF] focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                const amt = parseFloat(copyMarginInput) || 100;
                setActiveCopyAllocations((prev) => ({
                  ...prev,
                  [selectedTrader.id]: amt,
                }));
                setFeedback({
                  type: 'success',
                  text: `Allocated ${amt} USDT to ${selectedTrader.name}`,
                });
                setSelectedTrader(null);
                setTimeout(() => setFeedback(null), 3000);
              }}
              className="w-full h-11 rounded-xl bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] font-bold text-xs transition-colors"
            >
              Confirm Copy Allocation
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
