import React, { useState, useMemo } from 'react';
import {
  ChevronDown,
  ArrowUpDown,
  BarChart2,
  History,
  CheckCircle2,
  Search,
  Star,
  X,
  ShieldCheck,
  Clock,
  Sparkles,
  Flame,
  Info,
  Plus,
  Minus,
  MoreHorizontal,
  Bot,
  Megaphone,
  FileText,
  Delete,
} from 'lucide-react';
import { useExchange, P2P_MERCHANTS } from '../context/ExchangeContext';
import { P2PMerchantListing } from '../types/exchange';
import { CandlestickChart } from '../components/CandlestickChart';
import { CoinIcon, formatPrice } from '../components/CoinIcon';

const TRADE_TABS: Array<{
  id: 'convert' | 'spot' | 'stocks' | 'p2p' | 'alpha';
  label: string;
}> = [
  { id: 'convert', label: 'Convert' },
  { id: 'spot', label: 'Spot' },
  { id: 'stocks', label: 'Stocks' },
  { id: 'p2p', label: 'P2P' },
  { id: 'alpha', label: 'Alpha' },
];

const ALPHA_PROJECTS = [
  {
    symbol: 'MONAD',
    name: 'Monad Parallel EVM',
    chain: 'Monad L1',
    price: 1.482,
    change: 34.6,
    mcap: '$148.2M',
    fdv: '$1.48B',
    liquidity: '$18.4M',
    aiScore: 96,
  },
  {
    symbol: 'BERA',
    name: 'Berachain Liquidity',
    chain: 'Berachain',
    price: 7.84,
    change: 18.2,
    mcap: '$392.0M',
    fdv: '$1.96B',
    liquidity: '$32.1M',
    aiScore: 93,
  },
  {
    symbol: 'KAITO',
    name: 'Kaito AI InfoFi',
    chain: 'Base',
    price: 1.92,
    change: 42.8,
    mcap: '$215.4M',
    fdv: '$960M',
    liquidity: '$14.9M',
    aiScore: 95,
  },
  {
    symbol: 'HYPER',
    name: 'Hyperliquid Eco Index',
    chain: 'HyperEVM',
    price: 24.6,
    change: 12.4,
    mcap: '$820.0M',
    fdv: '$2.46B',
    liquidity: '$54.0M',
    aiScore: 97,
  },
  {
    symbol: 'VIRTUAL',
    name: 'Virtuals AI Agents',
    chain: 'Base',
    price: 2.38,
    change: -4.2,
    mcap: '$476.0M',
    fdv: '$1.19B',
    liquidity: '$21.7M',
    aiScore: 89,
  },
];

export const TradeScreen: React.FC = () => {
  const {
    tradeSubTab,
    setTradeSubTab,
    tickers,
    tickerList,
    stocks,
    activeSymbol,
    setActiveSymbol,
    activeInterval,
    setActiveInterval,
    candles,
    isLoadingCandles,
    orderBook,
    wallets,
    transactions,
    spotOrders,
    p2pOrders,
    favorites,
    toggleFavorite,
    placeSpotOrder,
    cancelSpotOrder,
    executeConvert,
    createP2POrder,
    completeP2POrder,
    cancelP2POrder,
    openTransferModal,
    openDepositModal,
    getAssetPriceUsd,
    setProfileDrawerOpen,
  } = useExchange();

  // Spot State
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'LIMIT' | 'MARKET' | 'STOP_LIMIT'>('LIMIT');
  const [showOrderTypeSheet, setShowOrderTypeSheet] = useState(false);
  const [marginEnabled, setMarginEnabled] = useState(false);
  const [slippageEnabled, setSlippageEnabled] = useState(false);
  const [priceInput, setPriceInput] = useState('');
  const [stopPriceInput, setStopPriceInput] = useState('');
  const [qtyInput, setQtyInput] = useState('');
  const [sliderPct, setSliderPct] = useState(0);
  const [bottomTab, setBottomTab] = useState<'open' | 'holdings' | 'history' | 'trades'>('open');
  const [showSpotChart, setShowSpotChart] = useState(false); // Collapsed by default to match reference 00:17
  const [showPairPicker, setShowPairPicker] = useState(false);
  const [pairSearch, setPairSearch] = useState('');
  const [obMode, setObMode] = useState<'both' | 'bids' | 'asks'>('both');
  const [tickSize, setTickSize] = useState('0.01');
  const [showHotCampaign, setShowHotCampaign] = useState(true);
  const [orderFeedback, setOrderFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Convert State
  const [convertSubTab, setConvertSubTab] = useState<'Instant' | 'SIP' | 'Limit'>('Instant');
  const [fromAsset, setFromAsset] = useState('USDT');
  const [toAsset, setToAsset] = useState('BTC');
  const [fromAmount, setFromAmount] = useState('');
  const [convertFeedback, setConvertFeedback] = useState<string | null>(null);
  const [showConvertPreview, setShowConvertPreview] = useState(false);
  const [showAssetPicker, setShowAssetPicker] = useState<'from' | 'to' | null>(null);

  // Stocks State
  const [selectedStockSymbol, setSelectedStockSymbol] = useState('AAPL');
  const [stockSide, setStockSide] = useState<'BUY' | 'SELL'>('BUY');
  const [stockOrderType, setStockOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [stockLimitPrice, setStockLimitPrice] = useState('345.53');
  const [stockSharesInput, setStockSharesInput] = useState('');
  const [stockSliderPct, setStockSliderPct] = useState(0);
  const [stockBottomTab, setStockBottomTab] = useState<'open' | 'positions' | 'recurring'>('open');
  const [showStockPicker, setShowStockPicker] = useState(false);
  const [showStockRewardBanner, setShowStockRewardBanner] = useState(true);
  const [stockPositions, setStockPositions] = useState<
    Record<string, { shares: number; avgPrice: number }>
  >({});
  const [stockOrdersHistory, setStockOrdersHistory] = useState<
    Array<{
      id: string;
      symbol: string;
      side: 'BUY' | 'SELL';
      shares: number;
      price: number;
      total: number;
      time: number;
    }>
  >([]);

  // P2P State
  const [p2pNavMode, setP2pNavMode] = useState<'Express' | 'P2P' | 'Block'>('Express');
  const [p2pExpressInput, setP2pExpressInput] = useState('0');
  const [p2pSide, setP2pSide] = useState<'BUY' | 'SELL'>('BUY');
  const [p2pCrypto, setP2pCrypto] = useState<'USDT' | 'USDC' | 'BTC' | 'ETH' | 'BNB'>('USDT');
  const [p2pFiat, setP2pFiat] = useState<'USD' | 'INR' | 'AED' | 'EUR'>('INR');
  const [p2pPaymentFilter, setP2pPaymentFilter] = useState('All');
  const [p2pAmountFilter, setP2pAmountFilter] = useState('');
  const [p2pSubView, setP2pSubView] = useState<'market' | 'orders'>('market');
  const [selectedP2POffer, setSelectedP2POffer] = useState<P2PMerchantListing | null>(null);
  const [p2pFiatInput, setP2pFiatInput] = useState('');

  // Alpha State
  const [alphaFilter, setAlphaFilter] = useState<'All' | 'Monad L1' | 'Base' | 'HyperEVM'>('All');
  const [selectedAlpha, setSelectedAlpha] = useState<(typeof ALPHA_PROJECTS)[0] | null>(null);
  const [alphaBuyUsdt, setAlphaBuyUsdt] = useState('');
  const [alphaHoldings, setAlphaHoldings] = useState<
    Record<string, { amount: number; avgPrice: number }>
  >({});

  // Resolve current Spot Pair
  const currentTicker = useMemo(() => {
    return (
      tickers[activeSymbol] ||
      tickers['BTCUSDT'] || {
        symbol: 'BTCUSDT',
        baseAsset: 'BTC',
        quoteAsset: 'USDT',
        name: 'Bitcoin',
        lastPrice: 75798.46,
        priceChange: 645.2,
        priceChangePercent: 0.86,
        high24h: 76450.0,
        low24h: 74890.0,
        volume24h: 18420,
        quoteVolume24h: 1395000000,
        marketCap: 1500000000000,
        category: 'Layer 1' as const,
        lastUpdated: Date.now(),
      }
    );
  }, [tickers, activeSymbol]);

  const livePrice = currentTicker.lastPrice || 75798.46;
  const priceChangePct = currentTicker.priceChangePercent || 0;
  const isPositive = priceChangePct >= 0;

  const spotWallet = wallets.spot || {};
  const baseBalance = spotWallet[currentTicker.baseAsset]?.available || 0;
  const quoteBalance = spotWallet[currentTicker.quoteAsset]?.available || 0;
  const usdtFree = spotWallet['USDT']?.available || 0;

  const displayPriceValue =
    priceInput !== ''
      ? priceInput
      : livePrice >= 100
      ? livePrice.toFixed(2)
      : livePrice >= 1
      ? livePrice.toFixed(2)
      : livePrice.toFixed(4);

  const effectiveOrderPrice =
    orderType === 'MARKET' ? livePrice : parseFloat(displayPriceValue) || livePrice;
  const parsedQty = parseFloat(qtyInput) || 0;
  const orderTotalQuote = parsedQty * effectiveOrderPrice;
  const maxBuyBase = effectiveOrderPrice > 0 ? quoteBalance / effectiveOrderPrice : 0;
  const estFeeQuote = orderTotalQuote * 0.001;

  const stepPrice = (dir: 1 | -1) => {
    const current = parseFloat(displayPriceValue) || livePrice;
    const step = parseFloat(tickSize) || (livePrice >= 100 ? 1 : 0.01);
    const next = Math.max(step, current + dir * step);
    setPriceInput(next.toFixed(step < 0.01 ? 4 : 2));
  };

  const stepQty = (dir: 1 | -1) => {
    const current = parseFloat(qtyInput) || 0;
    const step = livePrice >= 1000 ? 0.001 : livePrice >= 10 ? 0.1 : 1;
    const next = Math.max(0, current + dir * step);
    setQtyInput(next > 0 ? next.toFixed(livePrice >= 1000 ? 4 : 2) : '');
  };

  const handleSliderSelect = (pct: number) => {
    setSliderPct(pct);
    if (side === 'BUY') {
      const usableQuote = (quoteBalance * (pct / 100)) / 1.001;
      const calcQty = effectiveOrderPrice > 0 ? usableQuote / effectiveOrderPrice : 0;
      setQtyInput(calcQty > 0 ? calcQty.toFixed(livePrice >= 100 ? 5 : 2) : '');
    } else {
      const calcQty = baseBalance * (pct / 100);
      setQtyInput(calcQty > 0 ? calcQty.toFixed(livePrice >= 100 ? 5 : 2) : '');
    }
  };

  const handleSubmitOrder = () => {
    const res = placeSpotOrder({
      symbol: currentTicker.symbol,
      side,
      type: orderType,
      price: effectiveOrderPrice,
      stopPrice:
        orderType === 'STOP_LIMIT'
          ? parseFloat(stopPriceInput) || livePrice * 0.99
          : undefined,
      quantity: parsedQty,
    });
    setOrderFeedback({ type: res.ok ? 'success' : 'error', text: res.message });
    if (res.ok) {
      setQtyInput('');
      setSliderPct(0);
    }
    setTimeout(() => setOrderFeedback(null), 3200);
  };

  // Convert calculations
  const fromUsdPrice = getAssetPriceUsd(fromAsset) || 1;
  const toUsdPrice = getAssetPriceUsd(toAsset) || 1;
  const convertRate = toUsdPrice > 0 ? fromUsdPrice / toUsdPrice : 0;
  const parsedFromAmt = parseFloat(fromAmount) || 0;
  const estimatedToAmt = parsedFromAmt * convertRate * 0.9995;
  const fromAssetFree = spotWallet[fromAsset]?.available || 0;
  const toAssetFree = spotWallet[toAsset]?.available || 0;

  const convertHistory = useMemo(
    () => transactions.filter((t) => t.type === 'convert'),
    [transactions]
  );

  const spotTradesHistory = useMemo(
    () => transactions.filter((t) => t.type === 'spot_buy' || t.type === 'spot_sell'),
    [transactions]
  );

  const handleConfirmConvert = () => {
    const res = executeConvert({
      fromAsset,
      toAsset,
      fromAmount: parsedFromAmt,
      walletType: 'spot',
    });
    setConvertFeedback(res.message);
    setShowConvertPreview(false);
    if (res.ok) {
      setFromAmount('');
    }
    setTimeout(() => setConvertFeedback(null), 3500);
  };

  // Stocks calculations
  const selectedStock = useMemo(
    () => stocks.find((s) => s.symbol === selectedStockSymbol) || stocks[0],
    [stocks, selectedStockSymbol]
  );
  const currentStockHolding = stockPositions[selectedStock.symbol]?.shares || 0;
  const effectiveStockPrice =
    stockOrderType === 'MARKET'
      ? selectedStock.lastPrice
      : parseFloat(stockLimitPrice) || selectedStock.lastPrice;
  const parsedStockShares = parseFloat(stockSharesInput) || 0;
  const estimatedStockCost = parsedStockShares * effectiveStockPrice;

  const handleStockTrade = () => {
    if (parsedStockShares <= 0) {
      setOrderFeedback({
        type: 'error',
        text: 'Enter valid share quantity (min 0.01531407 shares).',
      });
      setTimeout(() => setOrderFeedback(null), 3000);
      return;
    }

    if (stockSide === 'BUY') {
      if (estimatedStockCost > usdtFree) {
        setOrderFeedback({
          type: 'error',
          text: `Insufficient USDC/USDT balance. Required: $${estimatedStockCost.toFixed(2)}`,
        });
        setTimeout(() => setOrderFeedback(null), 3000);
        return;
      }
      setStockPositions((prev) => {
        const existing = prev[selectedStock.symbol] || {
          shares: 0,
          avgPrice: selectedStock.lastPrice,
        };
        const totalShares = existing.shares + parsedStockShares;
        const newAvg =
          (existing.shares * existing.avgPrice + estimatedStockCost) / totalShares;
        return {
          ...prev,
          [selectedStock.symbol]: { shares: totalShares, avgPrice: newAvg },
        };
      });
      setStockOrdersHistory((prev) => [
        {
          id: `STK-${Date.now().toString().slice(-5)}`,
          symbol: selectedStock.symbol,
          side: 'BUY',
          shares: parsedStockShares,
          price: effectiveStockPrice,
          total: estimatedStockCost,
          time: Date.now(),
        },
        ...prev,
      ]);
      setOrderFeedback({
        type: 'success',
        text: `Bought ${parsedStockShares.toFixed(4)} ${selectedStock.symbol} @ $${effectiveStockPrice.toFixed(2)}`,
      });
      setStockSharesInput('');
      setStockSliderPct(0);
    } else {
      if (parsedStockShares > currentStockHolding) {
        setOrderFeedback({
          type: 'error',
          text: `Insufficient ${selectedStock.symbol} shares (${currentStockHolding.toFixed(4)} available).`,
        });
        setTimeout(() => setOrderFeedback(null), 3000);
        return;
      }
      setStockPositions((prev) => {
        const existing = prev[selectedStock.symbol];
        const rem = Math.max(0, existing.shares - parsedStockShares);
        const next = { ...prev };
        if (rem <= 0.0001) delete next[selectedStock.symbol];
        else next[selectedStock.symbol] = { ...existing, shares: rem };
        return next;
      });
      setStockOrdersHistory((prev) => [
        {
          id: `STK-${Date.now().toString().slice(-5)}`,
          symbol: selectedStock.symbol,
          side: 'SELL',
          shares: parsedStockShares,
          price: effectiveStockPrice,
          total: estimatedStockCost,
          time: Date.now(),
        },
        ...prev,
      ]);
      setOrderFeedback({
        type: 'success',
        text: `Sold ${parsedStockShares.toFixed(4)} ${selectedStock.symbol} for $${estimatedStockCost.toFixed(2)}`,
      });
      setStockSharesInput('');
      setStockSliderPct(0);
    }
    setTimeout(() => setOrderFeedback(null), 3200);
  };

  // Filtered P2P Merchants
  const filteredP2POffers = useMemo(() => {
    return P2P_MERCHANTS.filter((o) => {
      if (o.side !== p2pSide) return false;
      if (o.asset !== p2pCrypto) return false;
      if (o.fiat !== p2pFiat) return false;
      if (p2pPaymentFilter !== 'All' && !o.paymentMethods.includes(p2pPaymentFilter))
        return false;
      const amt = parseFloat(p2pAmountFilter);
      if (!isNaN(amt) && amt > 0) {
        if (amt < o.minFiat || amt > o.maxFiat) return false;
      }
      return true;
    });
  }, [p2pSide, p2pCrypto, p2pFiat, p2pPaymentFilter, p2pAmountFilter]);

  const handleExpressKey = (key: string) => {
    setP2pExpressInput((prev) => {
      if (key === 'BACK') {
        return prev.length <= 1 ? '0' : prev.slice(0, -1);
      }
      if (key === '.') {
        return prev.includes('.') ? prev : `${prev}.`;
      }
      if (prev === '0') return key;
      if (prev.length >= 9) return prev;
      return `${prev}${key}`;
    });
  };

  // Filtered Alpha projects
  const filteredAlpha = useMemo(() => {
    if (alphaFilter === 'All') return ALPHA_PROJECTS;
    return ALPHA_PROJECTS.filter((a) => a.chain === alphaFilter);
  }, [alphaFilter]);

  const handleAlphaSwap = () => {
    if (!selectedAlpha) return;
    const usdtAmt = parseFloat(alphaBuyUsdt) || 0;
    if (usdtAmt < 5) {
      setOrderFeedback({ type: 'error', text: 'Minimum Alpha allocation is 5 USDT.' });
      setTimeout(() => setOrderFeedback(null), 3000);
      return;
    }
    if (usdtAmt > usdtFree) {
      setOrderFeedback({ type: 'error', text: 'Insufficient USDT balance in Spot wallet.' });
      setTimeout(() => setOrderFeedback(null), 3000);
      return;
    }
    const tokensReceived = (usdtAmt * 0.995) / selectedAlpha.price;
    setAlphaHoldings((prev) => {
      const existing = prev[selectedAlpha.symbol] || {
        amount: 0,
        avgPrice: selectedAlpha.price,
      };
      const newTotal = existing.amount + tokensReceived;
      const newAvg =
        (existing.amount * existing.avgPrice + usdtAmt) / newTotal;
      return {
        ...prev,
        [selectedAlpha.symbol]: { amount: newTotal, avgPrice: newAvg },
      };
    });
    setOrderFeedback({
      type: 'success',
      text: `Swapped ${usdtAmt.toFixed(2)} USDT → ${tokensReceived.toFixed(2)} ${selectedAlpha.symbol}`,
    });
    setAlphaBuyUsdt('');
    setSelectedAlpha(null);
    setTimeout(() => setOrderFeedback(null), 3200);
  };

  // OrderBook Buy/Sell Pressure Ratio
  const { bidRatioPct, askRatioPct } = useMemo(() => {
    const bidSum = orderBook.bids.slice(0, 6).reduce((acc, b) => acc + b.quantity, 0);
    const askSum = orderBook.asks.slice(0, 6).reduce((acc, a) => acc + a.quantity, 0);
    const total = bidSum + askSum;
    if (total <= 0) return { bidRatioPct: 51.8, askRatioPct: 48.2 };
    const bPct = Math.min(96, Math.max(4, (bidSum / total) * 100));
    return { bidRatioPct: bPct, askRatioPct: 100 - bPct };
  }, [orderBook]);

  const openSpotOrders = useMemo(
    () => spotOrders.filter((o) => o.status === 'OPEN'),
    [spotOrders]
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#181A20] text-[#EAECEF] pb-24">
      {/* Top Mode Navigation Bar (Convert | Spot | Stocks | P2P | Alpha + Hamburger) */}
      <div className="sticky top-11 z-20 bg-[#181A20]/95 backdrop-blur-md border-b border-[#2B3139]/60 px-4 pt-2 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-5 overflow-x-auto no-scrollbar">
          {TRADE_TABS.map((tab) => {
            const active = tradeSubTab === tab.id;
            return (
              <button
                type="button"
                key={tab.id}
                onClick={() => setTradeSubTab(tab.id)}
                className={`relative pb-1 text-[17px] tracking-tight transition-colors whitespace-nowrap ${
                  active
                    ? 'text-[#EAECEF] font-bold'
                    : 'text-[#848E9C] font-medium hover:text-[#EAECEF]'
                }`}
              >
                {tab.label}
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
          className="p-1.5 text-[#848E9C] hover:text-[#EAECEF] shrink-0"
          aria-label="More features"
        >
          <div className="flex flex-col gap-[3px] items-end">
            <span className="w-4 h-[2px] bg-[#EAECEF] rounded-full" />
            <span className="w-4 h-[2px] bg-[#EAECEF] rounded-full" />
            <span className="w-3 h-[2px] bg-[#EAECEF] rounded-full" />
          </div>
        </button>
      </div>

      {/* Global Toast Notification */}
      {orderFeedback && (
        <div
          className={`mx-4 mt-2 px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between border ${
            orderFeedback.type === 'success'
              ? 'bg-[#0ECB81]/15 border-[#0ECB81]/40 text-[#0ECB81]'
              : 'bg-[#F6465D]/15 border-[#F6465D]/40 text-[#F6465D]'
          }`}
        >
          <span>{orderFeedback.text}</span>
          <button
            type="button"
            onClick={() => setOrderFeedback(null)}
            className="ml-2 opacity-70"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* ===================================================================
          1. CONVERT TAB (Matches 00:14–00:16 Reference)
         =================================================================== */}
      {tradeSubTab === 'convert' && (
        <div className="px-4 pt-2.5 space-y-3">
          {/* Promo Strip: Explore SIP From $0.1 and Zero Fees */}
          <div
            onClick={() => setConvertSubTab('SIP')}
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#202630]/80 border border-[#2B3139]/60 cursor-pointer hover:border-[#F0B90B]/40 transition-colors"
          >
            <div className="flex items-center gap-2 text-xs text-[#EAECEF]">
              <Sparkles size={13} className="text-[#F0B90B] shrink-0" />
              <span>Explore SIP From $0.1 and Zero Fees</span>
            </div>
            <ChevronDown size={14} className="text-[#848E9C] -rotate-90" />
          </div>

          {/* Sub-mode pills (Instant | SIP | Limit) + Right Icons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {(['Instant', 'SIP', 'Limit'] as const).map((sub) => (
                <button
                  type="button"
                  key={sub}
                  onClick={() => setConvertSubTab(sub)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                    convertSubTab === sub
                      ? 'bg-[#2B3139] text-[#EAECEF]'
                      : 'text-[#848E9C] hover:text-[#EAECEF]'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 text-[#848E9C]">
              <button
                type="button"
                onClick={() => setTradeSubTab('spot')}
                className="hover:text-[#EAECEF]"
                title="View Chart"
              >
                <BarChart2 size={16} />
              </button>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('convert-history-block');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hover:text-[#EAECEF]"
                title="Convert History"
              >
                <FileText size={15} />
              </button>
            </div>
          </div>

          {convertFeedback && (
            <div className="p-2.5 rounded-lg bg-[#0ECB81]/15 border border-[#0ECB81]/40 text-[#0ECB81] text-xs font-medium flex items-center gap-2">
              <CheckCircle2 size={15} /> {convertFeedback}
            </div>
          )}

          {/* From / To Swap Cards */}
          <div className="relative space-y-2">
            {/* FROM CARD */}
            <div className="bg-[#202630] rounded-2xl p-4 border border-[#2B3139]/60">
              <div className="flex items-center justify-between text-xs text-[#848E9C] mb-3">
                <span>From</span>
                <button
                  type="button"
                  onClick={() =>
                    setFromAmount(fromAssetFree > 0 ? fromAssetFree.toString() : '')
                  }
                  className="hover:text-[#EAECEF] flex items-center gap-1 tabular-nums"
                >
                  Available:{' '}
                  <span className="text-[#EAECEF] font-mono">
                    {fromAssetFree.toFixed(4)}
                  </span>{' '}
                  {fromAsset}
                  <span className="text-[#F0B90B] font-semibold ml-1">Max</span>
                </button>
              </div>
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setShowAssetPicker('from')}
                  className="flex items-center gap-2 bg-[#2B3139] hover:bg-[#363C45] px-3 py-2 rounded-full shrink-0 transition-colors"
                >
                  <CoinIcon asset={fromAsset} size="sm" />
                  <span className="font-bold text-[15px] text-[#EAECEF]">{fromAsset}</span>
                  <ChevronDown size={14} className="text-[#848E9C]" />
                </button>
                <div className="flex-1 text-right">
                  <input
                    type="number"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                    placeholder="> 0.01"
                    className="w-full bg-transparent text-right text-2xl font-bold font-mono tabular-nums text-[#EAECEF] focus:outline-none placeholder-[#474D57]"
                  />
                  <div className="text-[11px] text-[#848E9C] font-mono tabular-nums mt-0.5">
                    {parsedFromAmt > 0
                      ? `≈ $${(parsedFromAmt * fromUsdPrice).toFixed(2)}`
                      : '0.01 - 2,600,000'}
                  </div>
                </div>
              </div>
            </div>

            {/* Center Swap Direction Button */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <button
                type="button"
                onClick={() => {
                  const prevFrom = fromAsset;
                  setFromAsset(toAsset);
                  setToAsset(prevFrom);
                }}
                className="w-9 h-9 rounded-xl bg-[#2B3139] border-4 border-[#181A20] flex items-center justify-center text-[#EAECEF] hover:text-[#F0B90B] transition-transform active:rotate-180 shadow-md"
              >
                <ArrowUpDown size={15} />
              </button>
            </div>

            {/* TO CARD */}
            <div className="bg-[#202630] rounded-2xl p-4 border border-[#2B3139]/60">
              <div className="flex items-center justify-between text-xs text-[#848E9C] mb-3">
                <span>To</span>
                <span className="font-mono tabular-nums">
                  Available: {toAssetFree.toFixed(4)} {toAsset}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setShowAssetPicker('to')}
                  className="flex items-center gap-2 bg-[#2B3139] hover:bg-[#363C45] px-3 py-2 rounded-full shrink-0 transition-colors"
                >
                  <CoinIcon asset={toAsset} size="sm" />
                  <span className="font-bold text-[15px] text-[#EAECEF]">{toAsset}</span>
                  <ChevronDown size={14} className="text-[#848E9C]" />
                </button>
                <div className="flex-1 text-right">
                  <div
                    className={`text-2xl font-bold font-mono tabular-nums ${
                      estimatedToAmt > 0 ? 'text-[#EAECEF]' : 'text-[#474D57]'
                    }`}
                  >
                    {estimatedToAmt > 0
                      ? estimatedToAmt >= 1
                        ? estimatedToAmt.toFixed(4)
                        : estimatedToAmt.toFixed(6)
                      : '> 0.00000013'}
                  </div>
                  <div className="text-[11px] text-[#848E9C] font-mono tabular-nums mt-0.5">
                    1 {fromAsset} ≈{' '}
                    {convertRate >= 1 ? convertRate.toFixed(4) : convertRate.toFixed(8)}{' '}
                    {toAsset}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {convertSubTab === 'SIP' && (
            <div className="bg-[#202630] rounded-xl p-3 border border-[#2B3139]/60 flex items-center justify-between text-xs">
              <span className="text-[#848E9C]">Recurring Frequency</span>
              <span className="text-[#EAECEF] font-semibold">Weekly · Zero Fee</span>
            </div>
          )}

          {/* Preview CTA Button */}
          <button
            type="button"
            onClick={() => {
              if (parsedFromAmt > 0) setShowConvertPreview(true);
            }}
            disabled={parsedFromAmt <= 0}
            className={`w-full h-12 rounded-xl font-bold text-[15px] transition-colors ${
              parsedFromAmt > 0
                ? 'bg-[#FCD535] hover:bg-[#F0B90B] text-[#181A20]'
                : 'bg-[#655A24] text-[#181A20]/70 cursor-not-allowed'
            }`}
          >
            Preview
          </button>

          {/* Recent Convert History */}
          <div id="convert-history-block" className="pt-3">
            <div className="flex items-center justify-between text-xs font-semibold text-[#848E9C] mb-2">
              <span className="flex items-center gap-1.5">
                <History size={13} /> Recent Conversions
              </span>
              <span>Zero Fee</span>
            </div>
            {convertHistory.length === 0 ? (
              <div className="text-center py-6 text-xs text-[#848E9C] bg-[#202630]/50 rounded-xl border border-[#2B3139]/50">
                No recent conversions yet
              </div>
            ) : (
              <div className="space-y-1.5">
                {convertHistory.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#202630] rounded-xl px-3 py-2.5 flex items-center justify-between text-xs border border-[#2B3139]/50"
                  >
                    <div>
                      <div className="font-bold text-[#EAECEF]">
                        {item.amount} {item.asset} → {(item.secondaryAmount || 0).toFixed(6)}{' '}
                        {item.secondaryAsset}
                      </div>
                      <div className="text-[10px] text-[#848E9C] mt-0.5">{item.note}</div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#0ECB81]/15 text-[#0ECB81] font-semibold">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================
          2. SPOT TAB (Matches 00:17 Reference Layout)
         =================================================================== */}
      {tradeSubTab === 'spot' && (
        <div className="flex flex-col">
          {/* Dismissible Hot Campaign Strip */}
          {showHotCampaign && (
            <div className="mx-4 mt-1.5 px-3 py-1.5 rounded-lg bg-[#202630] border border-[#2B3139]/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 truncate">
                <Flame size={13} className="text-[#F0B90B] shrink-0" />
                <span className="font-semibold text-[#EAECEF]">Hot Campaign</span>
                <span className="text-[#848E9C] truncate">
                  — Trade {currentTicker.baseAsset} & Share 50,000 USDT Rewards
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowHotCampaign(false)}
                className="text-[#848E9C] hover:text-[#EAECEF] pl-2"
              >
                <X size={13} />
              </button>
            </div>
          )}

          {/* Pair Selector Header Bar (Matches 00:17: BTC/USDT ▾ +0.86% | Chart | Bot | ...) */}
          <div className="px-4 py-2.5 flex items-center justify-between border-b border-[#2B3139]/60">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowPairPicker(true)}
                className="flex items-center gap-1 text-left group"
              >
                <span className="text-[18px] font-bold tracking-tight text-[#EAECEF] group-hover:text-[#F0B90B] transition-colors">
                  {currentTicker.baseAsset}/{currentTicker.quoteAsset}
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

            <div className="flex items-center gap-3 text-[#848E9C]">
              <button
                type="button"
                onClick={() => toggleFavorite(currentTicker.symbol)}
                className="hover:text-[#F0B90B]"
                title="Favorite Pair"
              >
                <Star
                  size={16}
                  className={
                    favorites.includes(currentTicker.symbol)
                      ? 'fill-[#F0B90B] text-[#F0B90B]'
                      : ''
                  }
                />
              </button>
              <button
                type="button"
                onClick={() => setShowSpotChart((v) => !v)}
                className={`p-1 rounded transition-colors ${
                  showSpotChart
                    ? 'text-[#F0B90B] bg-[#F0B90B]/10'
                    : 'hover:text-[#EAECEF]'
                }`}
                title="Toggle Candlestick Chart"
              >
                <BarChart2 size={17} />
              </button>
              <button
                type="button"
                onClick={() => setTradeSubTab('alpha')}
                className="hover:text-[#EAECEF]"
                title="Trading Bots & Signals"
              >
                <Bot size={17} />
              </button>
              <button
                type="button"
                onClick={() => setProfileDrawerOpen(true)}
                className="hover:text-[#EAECEF]"
                title="More Options"
              >
                <MoreHorizontal size={17} />
              </button>
            </div>
          </div>

          {/* Collapsible Candlestick Chart Panel */}
          {showSpotChart && (
            <div className="border-b border-[#2B3139]">
              <div className="px-4 py-1.5 flex items-center justify-between text-[11px] bg-[#181A20] border-b border-[#2B3139]/50 font-mono tabular-nums">
                <div className="flex items-center gap-3">
                  <span className="text-[#848E9C]">
                    24h High{' '}
                    <b className="text-[#EAECEF] font-normal">
                      {formatPrice(currentTicker.high24h || livePrice * 1.02)}
                    </b>
                  </span>
                  <span className="text-[#848E9C]">
                    24h Low{' '}
                    <b className="text-[#EAECEF] font-normal">
                      {formatPrice(currentTicker.low24h || livePrice * 0.98)}
                    </b>
                  </span>
                </div>
                <span className="text-[#848E9C]">
                  Vol{' '}
                  <b className="text-[#EAECEF] font-normal">
                    {((currentTicker.quoteVolume24h || 42500000) / 1e6).toFixed(2)}M
                  </b>
                </span>
              </div>
              <CandlestickChart
                symbol={currentTicker.symbol}
                candles={candles}
                interval={activeInterval}
                onIntervalChange={setActiveInterval}
                isLoading={isLoadingCandles}
                height={220}
              />
            </div>
          )}

          {/* 2-Column Split: Left Order Form (56%) + Right Live Order Book (44%) */}
          <div className="grid grid-cols-12 px-4 pt-3 pb-3 gap-3 border-b border-[#2B3139]/80">
            {/* LEFT COLUMN: Spot Order Entry Ticket (col-span-7) */}
            <div className="col-span-7 flex flex-col justify-between space-y-2.5">
              {/* Top Row: Buy / Sell Segmented Pill + Margin Toggle */}
              <div className="flex items-center gap-1.5">
                <div className="flex-1 grid grid-cols-2 bg-[#202630] p-0.5 rounded-lg border border-[#2B3139]">
                  <button
                    type="button"
                    onClick={() => setSide('BUY')}
                    className={`h-7 rounded-md text-xs font-bold transition-colors ${
                      side === 'BUY'
                        ? 'bg-[#0ECB81] text-[#FFFFFF]'
                        : 'text-[#848E9C] hover:text-[#EAECEF]'
                    }`}
                  >
                    Buy
                  </button>
                  <button
                    type="button"
                    onClick={() => setSide('SELL')}
                    className={`h-7 rounded-md text-xs font-bold transition-colors ${
                      side === 'SELL'
                        ? 'bg-[#F6465D] text-[#FFFFFF]'
                        : 'text-[#848E9C] hover:text-[#EAECEF]'
                    }`}
                  >
                    Sell
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setMarginEnabled((v) => !v)}
                  className={`px-2 h-8 rounded-lg border text-[10px] font-semibold flex items-center gap-1 shrink-0 transition-colors ${
                    marginEnabled
                      ? 'bg-[#F0B90B]/15 border-[#F0B90B]/50 text-[#F0B90B]'
                      : 'bg-[#202630] border-[#2B3139] text-[#848E9C]'
                  }`}
                >
                  Margin
                </button>
              </div>

              {/* Order Type Selector Dropdown (Limit | Market | Stop-Limit) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowOrderTypeSheet((v) => !v)}
                  className="w-full h-8 px-2.5 rounded-lg bg-[#202630] border border-[#2B3139] flex items-center justify-between text-xs font-semibold text-[#EAECEF]"
                >
                  <span className="flex items-center gap-1">
                    <Info size={12} className="text-[#848E9C]" />
                    {orderType === 'LIMIT'
                      ? 'Limit'
                      : orderType === 'MARKET'
                      ? 'Market'
                      : 'Stop-Limit'}
                  </span>
                  <ChevronDown size={13} className="text-[#848E9C]" />
                </button>
                {showOrderTypeSheet && (
                  <div className="absolute left-0 right-0 top-9 z-20 bg-[#2B3139] border border-[#363C45] rounded-lg shadow-xl py-1 text-xs">
                    {(
                      [
                        { id: 'LIMIT', label: 'Limit' },
                        { id: 'MARKET', label: 'Market' },
                        { id: 'STOP_LIMIT', label: 'Stop-Limit' },
                      ] as const
                    ).map((opt) => (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => {
                          setOrderType(opt.id);
                          setShowOrderTypeSheet(false);
                        }}
                        className={`w-full px-3 py-1.5 text-left font-medium hover:bg-[#363C45] flex items-center justify-between ${
                          orderType === opt.id
                            ? 'text-[#F0B90B] font-bold'
                            : 'text-[#EAECEF]'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {orderType === opt.id && <CheckCircle2 size={12} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Optional Stop Price Input */}
              {orderType === 'STOP_LIMIT' && (
                <div className="h-9 bg-[#202630] border border-[#2B3139] rounded-lg flex items-center justify-between px-2">
                  <span className="text-[10px] text-[#848E9C]">Stop</span>
                  <input
                    type="number"
                    value={stopPriceInput}
                    onChange={(e) => setStopPriceInput(e.target.value)}
                    placeholder={(livePrice * 0.99).toFixed(2)}
                    className="w-24 bg-transparent text-center text-xs font-mono font-bold tabular-nums text-[#EAECEF] focus:outline-none"
                  />
                  <span className="text-[10px] text-[#848E9C]">
                    {currentTicker.quoteAsset}
                  </span>
                </div>
              )}

              {/* Price Input with [-] [+] Steppers */}
              {orderType !== 'MARKET' ? (
                <div className="h-9 bg-[#202630] border border-[#2B3139] focus-within:border-[#F0B90B] rounded-lg flex items-center justify-between px-1.5">
                  <button
                    type="button"
                    onClick={() => stepPrice(-1)}
                    className="w-6 h-6 rounded flex items-center justify-center text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B3139]"
                  >
                    <Minus size={13} />
                  </button>
                  <div className="flex flex-col items-center flex-1 min-w-0">
                    <span className="text-[9px] text-[#848E9C] leading-none">
                      Price ({currentTicker.quoteAsset})
                    </span>
                    <input
                      type="number"
                      value={displayPriceValue}
                      onChange={(e) => setPriceInput(e.target.value)}
                      className="w-full bg-transparent text-center text-xs font-mono font-bold tabular-nums text-[#EAECEF] focus:outline-none leading-tight"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => stepPrice(1)}
                    className="w-6 h-6 rounded flex items-center justify-center text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B3139]"
                  >
                    <Plus size={13} />
                  </button>
                </div>
              ) : (
                <div className="h-9 bg-[#202630]/60 border border-[#2B3139] rounded-lg flex items-center justify-center text-xs text-[#848E9C] font-medium">
                  Market Price
                </div>
              )}

              {/* Amount Input with [-] [+] Steppers */}
              <div className="h-9 bg-[#202630] border border-[#2B3139] focus-within:border-[#F0B90B] rounded-lg flex items-center justify-between px-1.5">
                <button
                  type="button"
                  onClick={() => stepQty(-1)}
                  className="w-6 h-6 rounded flex items-center justify-center text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B3139]"
                >
                  <Minus size={13} />
                </button>
                <div className="flex flex-col items-center flex-1 min-w-0">
                  <span className="text-[9px] text-[#848E9C] leading-none">
                    Amount ({currentTicker.baseAsset})
                  </span>
                  <input
                    type="number"
                    value={qtyInput}
                    onChange={(e) => {
                      setQtyInput(e.target.value);
                      setSliderPct(0);
                    }}
                    placeholder="0.00"
                    className="w-full bg-transparent text-center text-xs font-mono font-bold tabular-nums text-[#EAECEF] focus:outline-none leading-tight placeholder-[#474D57]"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => stepQty(1)}
                  className="w-6 h-6 rounded flex items-center justify-center text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B3139]"
                >
                  <Plus size={13} />
                </button>
              </div>

              {/* 4-Node Diamond Percentage Slider (25% 50% 75% 100%) */}
              <div className="px-1 pt-0.5">
                <div className="relative flex items-center justify-between">
                  <div className="absolute left-0 right-0 h-[2px] bg-[#2B3139]" />
                  <div
                    className={`absolute left-0 h-[2px] transition-all ${
                      side === 'BUY' ? 'bg-[#0ECB81]' : 'bg-[#F6465D]'
                    }`}
                    style={{ width: `${sliderPct}%` }}
                  />
                  {[0, 25, 50, 75, 100].map((pct) => {
                    const active = sliderPct >= pct && pct > 0;
                    return (
                      <button
                        type="button"
                        key={pct}
                        onClick={() => handleSliderSelect(pct)}
                        className="relative z-10 flex flex-col items-center group"
                      >
                        <span
                          className={`w-2.5 h-2.5 rotate-45 border transition-colors ${
                            active
                              ? side === 'BUY'
                                ? 'bg-[#0ECB81] border-[#0ECB81]'
                                : 'bg-[#F6465D] border-[#F6465D]'
                              : 'bg-[#181A20] border-[#474D57] group-hover:border-[#848E9C]'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                <div className="flex justify-between text-[9px] text-[#848E9C] font-mono mt-1">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Total Quote Box */}
              <div className="h-8 bg-[#202630] border border-[#2B3139] rounded-lg px-2.5 flex items-center justify-between text-[11px]">
                <span className="text-[#848E9C]">Total ({currentTicker.quoteAsset})</span>
                <span className="font-mono font-semibold tabular-nums text-[#EAECEF]">
                  {orderTotalQuote > 0 ? orderTotalQuote.toFixed(2) : '0.00'}
                </span>
              </div>

              {/* Slippage Tolerance Checkbox + Pre-Trade Info */}
              <div className="space-y-1 text-[11px]">
                <label className="flex items-center gap-1.5 text-[#848E9C] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={slippageEnabled}
                    onChange={(e) => setSlippageEnabled(e.target.checked)}
                    className="w-3.5 h-3.5 rounded accent-[#F0B90B] bg-[#202630] border-[#2B3139]"
                  />
                  <span>Slippage Tolerance</span>
                </label>

                <div className="flex items-center justify-between text-[#848E9C]">
                  <span>Avbl</span>
                  <button
                    type="button"
                    onClick={() =>
                      openTransferModal({
                        from: 'funding',
                        to: 'spot',
                        asset: currentTicker.quoteAsset,
                      })
                    }
                    className="font-mono tabular-nums text-[#EAECEF] flex items-center gap-1 hover:text-[#F0B90B]"
                  >
                    {side === 'BUY'
                      ? `${quoteBalance.toFixed(2)} ${currentTicker.quoteAsset}`
                      : `${baseBalance.toFixed(5)} ${currentTicker.baseAsset}`}
                    <Plus size={11} className="text-[#F0B90B]" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-[#848E9C]">
                  <span>{side === 'BUY' ? 'Max Buy' : 'Max Sell'}</span>
                  <span className="font-mono tabular-nums text-[#EAECEF]">
                    {side === 'BUY'
                      ? `${maxBuyBase.toFixed(5)} ${currentTicker.baseAsset}`
                      : `${(baseBalance * livePrice).toFixed(2)} ${currentTicker.quoteAsset}`}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[#848E9C]">
                  <span>Est. Fee</span>
                  <span className="font-mono tabular-nums text-[#EAECEF]">
                    {estFeeQuote > 0
                      ? `${estFeeQuote.toFixed(4)} ${currentTicker.quoteAsset}`
                      : '--'}
                  </span>
                </div>
              </div>

              {/* Primary Buy / Sell Action Button */}
              <button
                type="button"
                onClick={handleSubmitOrder}
                className={`w-full h-10 rounded-lg font-bold text-sm transition-opacity active:opacity-90 text-white shadow-sm ${
                  side === 'BUY'
                    ? 'bg-[#0ECB81] hover:bg-[#0ECB81]/90'
                    : 'bg-[#F6465D] hover:bg-[#F6465D]/90'
                }`}
              >
                {side === 'BUY'
                  ? `Buy ${currentTicker.baseAsset}`
                  : `Sell ${currentTicker.baseAsset}`}
              </button>
            </div>

            {/* RIGHT COLUMN: Live Order Book (col-span-5) */}
            <div className="col-span-5 flex flex-col justify-between">
              {/* Column Header */}
              <div className="flex items-center justify-between text-[10px] text-[#848E9C] pb-1">
                <div className="leading-tight">
                  <div>Price</div>
                  <div>({currentTicker.quoteAsset})</div>
                </div>
                <div className="text-right leading-tight">
                  <div>Amount</div>
                  <div>({currentTicker.baseAsset})</div>
                </div>
              </div>

              {/* Asks (Sells - Red) */}
              {obMode !== 'bids' && (
                <div className="space-y-[2px]">
                  {(() => {
                    const asksSlice = orderBook.asks
                      .slice(0, obMode === 'asks' ? 10 : 5)
                      .reverse();
                    const maxAsk = Math.max(
                      ...asksSlice.map((a) => a.quantity),
                      0.0001
                    );
                    return asksSlice.map((ask, idx) => {
                      const depthPct = Math.min(100, (ask.quantity / maxAsk) * 100);
                      return (
                        <button
                          type="button"
                          key={`ask-${idx}`}
                          onClick={() =>
                            setPriceInput(
                              ask.price >= 100
                                ? ask.price.toFixed(2)
                                : ask.price.toFixed(4)
                            )
                          }
                          className="relative w-full h-[20px] flex items-center justify-between px-1 text-[11px] font-mono tabular-nums overflow-hidden rounded-xs hover:bg-[#2B3139]/40"
                        >
                          <div
                            className="absolute right-0 top-0 bottom-0 bg-[#F6465D]/15 pointer-events-none"
                            style={{ width: `${depthPct}%` }}
                          />
                          <span className="relative z-10 text-[#F6465D]">
                            {formatPrice(ask.price)}
                          </span>
                          <span className="relative z-10 text-[#EAECEF]">
                            {ask.quantity >= 10
                              ? ask.quantity.toFixed(2)
                              : ask.quantity.toFixed(4)}
                          </span>
                        </button>
                      );
                    });
                  })()}
                </div>
              )}

              {/* Central Live Price Readout + Fiat Subtext */}
              <div className="my-1.5 py-1 border-y border-[#2B3139]/50">
                <div
                  className={`text-[15px] font-bold font-mono tabular-nums leading-tight ${
                    isPositive ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                  }`}
                >
                  {formatPrice(livePrice)}
                </div>
                <div className="text-[10px] text-[#848E9C] font-mono tabular-nums">
                  ≈ ₹{(livePrice * 86.45).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </div>
              </div>

              {/* Bids (Buys - Green) */}
              {obMode !== 'asks' && (
                <div className="space-y-[2px]">
                  {(() => {
                    const bidsSlice = orderBook.bids.slice(
                      0,
                      obMode === 'bids' ? 10 : 5
                    );
                    const maxBid = Math.max(
                      ...bidsSlice.map((b) => b.quantity),
                      0.0001
                    );
                    return bidsSlice.map((bid, idx) => {
                      const depthPct = Math.min(100, (bid.quantity / maxBid) * 100);
                      return (
                        <button
                          type="button"
                          key={`bid-${idx}`}
                          onClick={() =>
                            setPriceInput(
                              bid.price >= 100
                                ? bid.price.toFixed(2)
                                : bid.price.toFixed(4)
                            )
                          }
                          className="relative w-full h-[20px] flex items-center justify-between px-1 text-[11px] font-mono tabular-nums overflow-hidden rounded-xs hover:bg-[#2B3139]/40"
                        >
                          <div
                            className="absolute right-0 top-0 bottom-0 bg-[#0ECB81]/15 pointer-events-none"
                            style={{ width: `${depthPct}%` }}
                          />
                          <span className="relative z-10 text-[#0ECB81]">
                            {formatPrice(bid.price)}
                          </span>
                          <span className="relative z-10 text-[#EAECEF]">
                            {bid.quantity >= 10
                              ? bid.quantity.toFixed(2)
                              : bid.quantity.toFixed(4)}
                          </span>
                        </button>
                      );
                    });
                  })()}
                </div>
              )}

              {/* Order Book Buy/Sell Pressure Ratio Bar (Matches 00:17) */}
              <div className="mt-1.5">
                <div className="flex items-center justify-between text-[9px] font-mono tabular-nums mb-0.5">
                  <span className="text-[#0ECB81]">B {bidRatioPct.toFixed(1)}%</span>
                  <span className="text-[#F6465D]">{askRatioPct.toFixed(1)}% S</span>
                </div>
                <div className="w-full h-1 rounded-full overflow-hidden flex bg-[#2B3139]">
                  <div
                    className="h-full bg-[#0ECB81]"
                    style={{ width: `${bidRatioPct}%` }}
                  />
                  <div
                    className="h-full bg-[#F6465D]"
                    style={{ width: `${askRatioPct}%` }}
                  />
                </div>
              </div>

              {/* Bottom Controls: Tick Size Dropdown + OrderBook View Mode */}
              <div className="flex items-center justify-between pt-1.5 gap-1">
                <div className="relative flex-1">
                  <select
                    value={tickSize}
                    onChange={(e) => setTickSize(e.target.value)}
                    className="w-full h-6 bg-[#202630] border border-[#2B3139] rounded px-1.5 text-[10px] font-mono text-[#EAECEF] focus:outline-none"
                  >
                    <option value="0.01">0.01</option>
                    <option value="0.1">0.1</option>
                    <option value="1">1</option>
                    <option value="10">10</option>
                  </select>
                </div>
                <div className="flex items-center gap-0.5 bg-[#202630] p-0.5 rounded border border-[#2B3139]">
                  <button
                    type="button"
                    onClick={() => setObMode('both')}
                    className={`px-1 py-0.5 rounded text-[9px] font-bold ${
                      obMode === 'both' ? 'bg-[#2B3139] text-[#F0B90B]' : 'text-[#848E9C]'
                    }`}
                  >
                    B/S
                  </button>
                  <button
                    type="button"
                    onClick={() => setObMode('bids')}
                    className={`px-1 py-0.5 rounded text-[9px] font-bold ${
                      obMode === 'bids' ? 'bg-[#2B3139] text-[#0ECB81]' : 'text-[#848E9C]'
                    }`}
                  >
                    B
                  </button>
                  <button
                    type="button"
                    onClick={() => setObMode('asks')}
                    className={`px-1 py-0.5 rounded text-[9px] font-bold ${
                      obMode === 'asks' ? 'bg-[#2B3139] text-[#F6465D]' : 'text-[#848E9C]'
                    }`}
                  >
                    S
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Orders & Holdings Tabs (Matches 00:17: Open Orders (0) | Holdings | Order History | Trades) */}
          <div className="px-4 pt-1">
            <div className="flex items-center justify-between border-b border-[#2B3139]">
              <div className="flex items-center gap-5 overflow-x-auto no-scrollbar">
                {[
                  {
                    id: 'open',
                    label: `Open Orders (${openSpotOrders.length})`,
                  },
                  { id: 'holdings', label: 'Holdings' },
                  { id: 'history', label: 'Order History' },
                  { id: 'trades', label: 'Trades' },
                ].map((t) => (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => setBottomTab(t.id as typeof bottomTab)}
                    className={`pb-2.5 pt-2 text-xs font-semibold relative whitespace-nowrap transition-colors ${
                      bottomTab === t.id
                        ? 'text-[#EAECEF]'
                        : 'text-[#848E9C] hover:text-[#EAECEF]'
                    }`}
                  >
                    {t.label}
                    {bottomTab === t.id && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#F0B90B] rounded-full" />
                    )}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setBottomTab('history')}
                className="text-[#848E9C] hover:text-[#EAECEF] pl-2"
                title="All Orders"
              >
                <FileText size={14} />
              </button>
            </div>

            {/* Tab Content */}
            <div className="py-3">
              {bottomTab === 'open' && (
                <>
                  {/* Reference 00:17 Wallet Funding Card when quote balance is low */}
                  {quoteBalance < 1 && openSpotOrders.length === 0 ? (
                    <div className="bg-[#202630]/60 border border-[#2B3139] rounded-xl p-4 text-center space-y-2 my-1">
                      <div className="text-xs font-semibold text-[#EAECEF]">
                        Available Funds: {quoteBalance.toFixed(2)} {currentTicker.quoteAsset}
                      </div>
                      <div className="text-[11px] text-[#848E9C]">
                        Transfer funds to your Spot wallet to trade
                      </div>
                      <div className="pt-1 flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => openDepositModal(currentTicker.quoteAsset)}
                          className="px-4 py-1.5 rounded-lg bg-[#FCD535] text-[#181A20] text-xs font-bold hover:bg-[#F0B90B]"
                        >
                          Add Funds
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            openTransferModal({
                              from: 'funding',
                              to: 'spot',
                              asset: currentTicker.quoteAsset,
                            })
                          }
                          className="px-4 py-1.5 rounded-lg bg-[#2B3139] text-[#EAECEF] text-xs font-semibold hover:bg-[#363C45]"
                        >
                          Transfer
                        </button>
                      </div>
                    </div>
                  ) : openSpotOrders.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[#848E9C]">
                      No open limit orders
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {openSpotOrders.map((ord) => (
                        <div
                          key={ord.id}
                          className="bg-[#202630] rounded-xl p-3 border border-[#2B3139] flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-bold ${
                                  ord.side === 'BUY' ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                                }`}
                              >
                                {ord.side}
                              </span>
                              <span className="font-bold text-[#EAECEF]">{ord.symbol}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2B3139] text-[#848E9C]">
                                {ord.type}
                              </span>
                            </div>
                            <div className="text-[11px] text-[#848E9C] font-mono tabular-nums mt-1">
                              Price: {ord.price.toFixed(2)} · Qty: {ord.quantity}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => cancelSpotOrder(ord.id)}
                            className="px-2.5 py-1 rounded-lg bg-[#2B3139] text-[#EAECEF] text-[11px] font-semibold hover:bg-[#F6465D] hover:text-white transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {bottomTab === 'holdings' && (
                <div className="space-y-2">
                  {Object.values(spotWallet)
                    .filter((b) => b.available + b.locked > 0)
                    .map((bal) => {
                      const usdVal =
                        (bal.available + bal.locked) * (getAssetPriceUsd(bal.asset) || 1);
                      return (
                        <div
                          key={bal.asset}
                          className="bg-[#202630] rounded-xl px-3 py-2.5 border border-[#2B3139]/60 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <CoinIcon asset={bal.asset} size="sm" />
                            <div>
                              <div className="font-bold text-[#EAECEF]">{bal.asset}</div>
                              <div className="text-[10px] text-[#848E9C]">
                                Avbl: {bal.available.toFixed(4)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right font-mono tabular-nums">
                            <div className="font-bold text-[#EAECEF]">
                              {(bal.available + bal.locked).toFixed(4)}
                            </div>
                            <div className="text-[10px] text-[#848E9C]">
                              ≈ ${usdVal.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              {bottomTab === 'history' && (
                <div className="space-y-2">
                  {spotOrders.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[#848E9C]">
                      No order history
                    </div>
                  ) : (
                    spotOrders.slice(0, 12).map((ord) => (
                      <div
                        key={ord.id}
                        className="bg-[#202630] rounded-xl p-3 border border-[#2B3139]/60 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-bold ${
                                ord.side === 'BUY' ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                              }`}
                            >
                              {ord.side}
                            </span>
                            <span className="font-bold text-[#EAECEF]">{ord.symbol}</span>
                            <span className="text-[10px] text-[#848E9C]">{ord.type}</span>
                          </div>
                          <div className="text-[11px] text-[#848E9C] font-mono tabular-nums mt-0.5">
                            Price: {ord.price.toFixed(2)} · Qty: {ord.filledQuantity}/
                            {ord.quantity}
                          </div>
                        </div>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                            ord.status === 'FILLED'
                              ? 'bg-[#0ECB81]/15 text-[#0ECB81]'
                              : ord.status === 'CANCELLED'
                              ? 'bg-[#2B3139] text-[#848E9C]'
                              : 'bg-[#F0B90B]/15 text-[#F0B90B]'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {bottomTab === 'trades' && (
                <div className="space-y-2">
                  {spotTradesHistory.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[#848E9C]">
                      No executed trades
                    </div>
                  ) : (
                    spotTradesHistory.slice(0, 12).map((tr) => (
                      <div
                        key={tr.id}
                        className="bg-[#202630] rounded-xl p-3 border border-[#2B3139]/60 flex items-center justify-between text-xs font-mono tabular-nums"
                      >
                        <div>
                          <div className="flex items-center gap-2 font-sans">
                            <span
                              className={`font-bold ${
                                tr.type === 'spot_buy' ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                              }`}
                            >
                              {tr.type === 'spot_buy' ? 'BUY' : 'SELL'}
                            </span>
                            <span className="font-bold text-[#EAECEF]">{tr.asset}</span>
                          </div>
                          <div className="text-[11px] text-[#848E9C] mt-0.5">
                            {tr.amount} @ ${(tr.price || 0).toFixed(2)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-[#EAECEF]">
                            ${(tr.secondaryAmount || 0).toFixed(2)}
                          </div>
                          <div className="text-[10px] text-[#848E9C]">
                            Fee: ${tr.fee.toFixed(4)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          3. STOCKS TAB (Matches 00:18–00:19 & 00:23 Reference)
         =================================================================== */}
      {tradeSubTab === 'stocks' && (
        <div className="px-4 pt-2.5 space-y-3">
          {/* Stock Symbol Header (AAPL ▾ | Mid Closed $345.53 -1.23% | Icons) */}
          <div className="flex items-center justify-between pb-2 border-b border-[#2B3139]/60">
            <div>
              <button
                type="button"
                onClick={() => setShowStockPicker(true)}
                className="flex items-center gap-1.5 text-left"
              >
                <span className="text-lg font-bold text-[#EAECEF]">
                  {selectedStock.symbol}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2B3139] text-[#848E9C] font-medium">
                  Stock Token
                </span>
                <ChevronDown size={15} className="text-[#848E9C]" />
              </button>
              <div className="flex items-center gap-2 text-xs font-mono tabular-nums mt-0.5">
                <span className="text-[#848E9C]">Mid Closed</span>
                <span className="text-[#EAECEF] font-bold">
                  ${selectedStock.lastPrice.toFixed(2)}
                </span>
                <span
                  className={
                    selectedStock.changePercent >= 0
                      ? 'text-[#0ECB81]'
                      : 'text-[#F6465D]'
                  }
                >
                  {selectedStock.changePercent >= 0 ? '+' : ''}
                  {selectedStock.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-[#848E9C]">
              <button
                type="button"
                onClick={() => setShowStockPicker(true)}
                className="hover:text-[#EAECEF]"
                title="Stock Directory"
              >
                <BarChart2 size={17} />
              </button>
              <button type="button" className="hover:text-[#EAECEF]" title="Announcements">
                <Megaphone size={16} />
              </button>
              <button
                type="button"
                onClick={() => setProfileDrawerOpen(true)}
                className="hover:text-[#EAECEF]"
              >
                <MoreHorizontal size={17} />
              </button>
            </div>
          </div>

          {/* Buy / Sell + Order Type Row */}
          <div className="grid grid-cols-12 gap-2.5">
            <div className="col-span-6 grid grid-cols-2 bg-[#202630] p-0.5 rounded-lg border border-[#2B3139]">
              <button
                type="button"
                onClick={() => setStockSide('BUY')}
                className={`h-8 rounded-md text-xs font-bold transition-colors ${
                  stockSide === 'BUY'
                    ? 'bg-[#0ECB81] text-white'
                    : 'text-[#848E9C] hover:text-[#EAECEF]'
                }`}
              >
                Buy
              </button>
              <button
                type="button"
                onClick={() => setStockSide('SELL')}
                className={`h-8 rounded-md text-xs font-bold transition-colors ${
                  stockSide === 'SELL'
                    ? 'bg-[#F6465D] text-white'
                    : 'text-[#848E9C] hover:text-[#EAECEF]'
                }`}
              >
                Sell
              </button>
            </div>
            <div className="col-span-6">
              <button
                type="button"
                onClick={() =>
                  setStockOrderType((t) => (t === 'MARKET' ? 'LIMIT' : 'MARKET'))
                }
                className="w-full h-9 px-3 rounded-lg bg-[#202630] border border-[#2B3139] flex items-center justify-between text-xs font-semibold text-[#EAECEF]"
              >
                <span>{stockOrderType === 'MARKET' ? 'Market' : 'Limit'}</span>
                <ChevronDown size={14} className="text-[#848E9C]" />
              </button>
            </div>
          </div>

          {stockOrderType === 'LIMIT' && (
            <div className="h-10 bg-[#202630] border border-[#2B3139] rounded-xl px-3 flex items-center justify-between text-xs">
              <span className="text-[#848E9C]">Limit Price (USDC)</span>
              <input
                type="number"
                value={stockLimitPrice}
                onChange={(e) => setStockLimitPrice(e.target.value)}
                className="bg-transparent text-right font-mono font-bold text-[#EAECEF] focus:outline-none"
              />
            </div>
          )}

          {/* Shares Input Box */}
          <div className="bg-[#202630] border border-[#2B3139] focus-within:border-[#F0B90B] rounded-xl p-3 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-[#EAECEF]">Shares</div>
              <div className="text-[10px] text-[#848E9C] font-mono">Min 0.01531407</div>
            </div>
            <input
              type="number"
              value={stockSharesInput}
              onChange={(e) => setStockSharesInput(e.target.value)}
              placeholder="0.00"
              className="w-36 bg-transparent text-right text-base font-mono font-bold tabular-nums text-[#EAECEF] focus:outline-none placeholder-[#474D57]"
            />
          </div>

          {/* 5-Dot Slider */}
          <div className="px-1">
            <div className="relative flex items-center justify-between">
              <div className="absolute left-0 right-0 h-[2px] bg-[#2B3139]" />
              <div
                className="absolute left-0 h-[2px] bg-[#0ECB81]"
                style={{ width: `${stockSliderPct}%` }}
              />
              {[0, 25, 50, 75, 100].map((pct) => (
                <button
                  type="button"
                  key={pct}
                  onClick={() => {
                    setStockSliderPct(pct);
                    if (stockSide === 'BUY') {
                      const maxShares =
                        effectiveStockPrice > 0
                          ? (usdtFree * (pct / 100)) / effectiveStockPrice
                          : 0;
                      setStockSharesInput(maxShares > 0 ? maxShares.toFixed(4) : '');
                    } else {
                      const s = currentStockHolding * (pct / 100);
                      setStockSharesInput(s > 0 ? s.toFixed(4) : '');
                    }
                  }}
                  className={`relative z-10 w-2.5 h-2.5 rounded-full border ${
                    stockSliderPct >= pct && pct > 0
                      ? 'bg-[#0ECB81] border-[#0ECB81]'
                      : 'bg-[#181A20] border-[#474D57]'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Pre-trade summary lines */}
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between text-[#848E9C]">
              <span>Available</span>
              <span className="font-mono tabular-nums text-[#EAECEF]">
                {stockSide === 'BUY'
                  ? `${usdtFree.toFixed(2)} USDC / USDT`
                  : `${currentStockHolding.toFixed(4)} ${selectedStock.symbol}`}
              </span>
            </div>
            <div className="flex items-center justify-between text-[#848E9C]">
              <span>Receive to</span>
              <span className="font-semibold text-[#EAECEF]">USDC Spot Wallet</span>
            </div>
            <div className="flex items-center justify-between text-[#848E9C]">
              <span>Estimated Total</span>
              <span className="font-mono tabular-nums text-[#EAECEF]">
                ${estimatedStockCost.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Preview / Submit Button */}
          <button
            type="button"
            onClick={handleStockTrade}
            className={`w-full h-11 rounded-xl font-bold text-sm transition-colors ${
              parsedStockShares > 0
                ? stockSide === 'BUY'
                  ? 'bg-[#0ECB81] text-white'
                  : 'bg-[#F6465D] text-white'
                : 'bg-[#655A24] text-[#181A20]/80'
            }`}
          >
            Preview {stockSide === 'BUY' ? 'Buy' : 'Sell'} {selectedStock.symbol}
          </button>

          {/* Dismissible 12,000 USDC Welcome Rewards Banner (Matches 00:18) */}
          {showStockRewardBanner && (
            <div className="bg-[#202630] border border-[#2B3139] rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#F0B90B]/15 flex items-center justify-center text-[#F0B90B] shrink-0">
                  <Sparkles size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#EAECEF]">
                    Complete Your 1st Stock Token Trade
                  </div>
                  <div className="text-[11px] text-[#848E9C]">
                    Share 12,000 USDC in Welcome Rewards!
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowStockRewardBanner(false)}
                className="text-[#848E9C] hover:text-[#EAECEF] p-1"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Bottom Tabs: Open Orders (0) | Positions (N) | Recurring (0) */}
          <div className="pt-1">
            <div className="flex items-center gap-5 border-b border-[#2B3139]">
              {[
                { id: 'open', label: `Open Orders (${stockOrdersHistory.length})` },
                {
                  id: 'positions',
                  label: `Positions (${Object.keys(stockPositions).length})`,
                },
                { id: 'recurring', label: 'Recurring (0)' },
              ].map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setStockBottomTab(t.id as typeof stockBottomTab)}
                  className={`pb-2 text-xs font-semibold relative ${
                    stockBottomTab === t.id ? 'text-[#EAECEF]' : 'text-[#848E9C]'
                  }`}
                >
                  {t.label}
                  {stockBottomTab === t.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#F0B90B]" />
                  )}
                </button>
              ))}
            </div>

            <div className="py-4">
              {stockBottomTab === 'open' && stockOrdersHistory.length === 0 && (
                <div className="py-6 text-center space-y-2">
                  <div className="text-xs font-semibold text-[#EAECEF]">No Open Orders</div>
                  <div className="text-[11px] text-[#848E9C]">
                    Invest in top U.S. equities 24/7 with fractional USDC settlement
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowStockPicker(true)}
                    className="mt-1 px-4 py-1.5 rounded-lg bg-[#FCD535] text-[#181A20] text-xs font-bold"
                  >
                    Explore
                  </button>
                </div>
              )}

              {stockBottomTab === 'open' && stockOrdersHistory.length > 0 && (
                <div className="space-y-2">
                  {stockOrdersHistory.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-[#202630] rounded-xl p-3 border border-[#2B3139] flex items-center justify-between text-xs"
                    >
                      <div>
                        <span
                          className={`font-bold mr-2 ${
                            ord.side === 'BUY' ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                          }`}
                        >
                          {ord.side}
                        </span>
                        <span className="font-bold text-[#EAECEF]">{ord.symbol}</span>
                        <div className="text-[11px] text-[#848E9C] font-mono mt-0.5">
                          {ord.shares.toFixed(4)} shares @ ${ord.price.toFixed(2)}
                        </div>
                      </div>
                      <span className="font-mono font-bold text-[#EAECEF]">
                        ${ord.total.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {stockBottomTab === 'positions' && (
                <div className="space-y-2">
                  {Object.keys(stockPositions).length === 0 ? (
                    <div className="py-6 text-center text-xs text-[#848E9C]">
                      No stock positions held
                    </div>
                  ) : (
                    Object.entries(stockPositions).map(([sym, pos]) => {
                      const stk = stocks.find((s) => s.symbol === sym) || stocks[0];
                      const mktVal = pos.shares * stk.lastPrice;
                      const pnl = mktVal - pos.shares * pos.avgPrice;
                      return (
                        <div
                          key={sym}
                          onClick={() => setSelectedStockSymbol(sym)}
                          className="bg-[#202630] rounded-xl p-3 border border-[#2B3139] flex items-center justify-between text-xs cursor-pointer"
                        >
                          <div>
                            <div className="font-bold text-[#EAECEF]">{sym}</div>
                            <div className="text-[11px] text-[#848E9C] font-mono">
                              {pos.shares.toFixed(4)} Shares · Avg ${pos.avgPrice.toFixed(2)}
                            </div>
                          </div>
                          <div className="text-right font-mono tabular-nums">
                            <div className="font-bold text-[#EAECEF]">
                              ${mktVal.toFixed(2)}
                            </div>
                            <div
                              className={`text-[11px] ${
                                pnl >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                              }`}
                            >
                              {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {stockBottomTab === 'recurring' && (
                <div className="py-6 text-center text-xs text-[#848E9C]">
                  No recurring stock plans active
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          4. P2P TAB (Matches 00:20–00:22 Reference: Express Numpad + P2P Market)
         =================================================================== */}
      {tradeSubTab === 'p2p' && (
        <div className="px-4 pt-2 space-y-3">
          {/* Sub-Header: Express | P2P | Block Trade + Fiat Selector */}
          <div className="flex items-center justify-between border-b border-[#2B3139]/60 pb-2">
            <div className="flex items-center gap-4">
              {(['Express', 'P2P', 'Block'] as const).map((mode) => (
                <button
                  type="button"
                  key={mode}
                  onClick={() => setP2pNavMode(mode)}
                  className={`text-sm font-bold transition-colors ${
                    p2pNavMode === mode ? 'text-[#EAECEF]' : 'text-[#848E9C]'
                  }`}
                >
                  {mode === 'Block' ? 'Block Trade' : mode}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setP2pSubView((v) => (v === 'market' ? 'orders' : 'market'))
                }
                className="px-2 py-1 rounded bg-[#202630] border border-[#2B3139] text-[11px] font-semibold text-[#EAECEF] flex items-center gap-1"
              >
                <Clock size={12} className="text-[#F0B90B]" />
                Orders ({p2pOrders.length})
              </button>
              <select
                value={p2pFiat}
                onChange={(e) => setP2pFiat(e.target.value as typeof p2pFiat)}
                className="bg-[#202630] border border-[#2B3139] rounded px-2 py-1 text-xs font-bold text-[#EAECEF] focus:outline-none"
              >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="AED">AED</option>
              </select>
            </div>
          </div>

          {/* EXPRESS NUMPAD VIEW (Matches 00:20–00:22 Reference) */}
          {p2pNavMode === 'Express' && p2pSubView === 'market' && (
            <div className="flex flex-col justify-between space-y-3 pt-1">
              {/* Top Row: Buy / Sell Toggle + Asset APR Pill */}
              <div className="flex items-center justify-between">
                <div className="inline-flex bg-[#202630] p-0.5 rounded-full border border-[#2B3139]">
                  <button
                    type="button"
                    onClick={() => setP2pSide('BUY')}
                    className={`px-4 py-1 rounded-full text-xs font-bold transition-colors ${
                      p2pSide === 'BUY'
                        ? 'bg-[#2B3139] text-[#EAECEF]'
                        : 'text-[#848E9C]'
                    }`}
                  >
                    Buy
                  </button>
                  <button
                    type="button"
                    onClick={() => setP2pSide('SELL')}
                    className={`px-4 py-1 rounded-full text-xs font-bold transition-colors ${
                      p2pSide === 'SELL'
                        ? 'bg-[#2B3139] text-[#EAECEF]'
                        : 'text-[#848E9C]'
                    }`}
                  >
                    Sell
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setP2pCrypto((c) =>
                      c === 'USDT' ? 'BTC' : c === 'BTC' ? 'ETH' : 'USDT'
                    )
                  }
                  className="flex items-center gap-1.5 bg-[#202630] border border-[#2B3139] px-3 py-1.5 rounded-full text-xs font-semibold"
                >
                  <CoinIcon asset={p2pCrypto} size="sm" />
                  <span className="text-[#EAECEF] font-bold">{p2pCrypto}</span>
                  <span className="text-[10px] text-[#0ECB81] font-mono">11.56% APR</span>
                  <ChevronDown size={13} className="text-[#848E9C]" />
                </button>
              </div>

              {/* Large Central Fiat Amount Display */}
              <div className="py-5 text-center space-y-1">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-4xl font-bold font-mono tabular-nums text-[#EAECEF]">
                    {p2pExpressInput}
                  </span>
                  <span className="text-base font-bold text-[#848E9C] flex items-center gap-0.5">
                    {p2pFiat} <ChevronDown size={14} />
                  </span>
                </div>
                <div className="text-xs text-[#848E9C] font-mono tabular-nums flex items-center justify-center gap-1.5">
                  <ArrowUpDown size={11} />
                  <span>
                    ≈{' '}
                    {(
                      (parseFloat(p2pExpressInput) || 0) /
                      (p2pFiat === 'INR' ? 89.25 : 1.002)
                    ).toFixed(2)}{' '}
                    {p2pCrypto}
                  </span>
                </div>
              </div>

              {/* Payment Method Selector Card + Quick Amount Pills */}
              <div className="space-y-2.5">
                <div
                  onClick={() => setP2pNavMode('P2P')}
                  className="bg-[#202630] border border-[#2B3139] rounded-xl px-3.5 py-2.5 flex items-center justify-between cursor-pointer hover:border-[#F0B90B]/40"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full bg-[#F0B90B]" />
                    <span className="text-[#848E9C]">Pay with</span>
                    <span className="font-bold text-[#EAECEF]">Lightning UPI / IMPS</span>
                  </div>
                  <ChevronDown size={14} className="text-[#848E9C] -rotate-90" />
                </div>

                {/* Quick Preset Amount Pills (Matches 00:20: ₹400 | ₹2K | ₹10K | ₹20K) */}
                <div className="grid grid-cols-4 gap-2">
                  {(p2pFiat === 'INR'
                    ? [
                        { label: '₹400', val: '400' },
                        { label: '₹2K', val: '2000' },
                        { label: '₹10K', val: '10000' },
                        { label: '₹20K', val: '20000' },
                      ]
                    : [
                        { label: '$50', val: '50' },
                        { label: '$200', val: '200' },
                        { label: '$500', val: '500' },
                        { label: '$1,000', val: '1000' },
                      ]
                  ).map((p) => (
                    <button
                      type="button"
                      key={p.label}
                      onClick={() => setP2pExpressInput(p.val)}
                      className="h-8 rounded-lg bg-[#202630] border border-[#2B3139] hover:border-[#F0B90B] text-xs font-mono font-semibold text-[#EAECEF]"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Select Payment Method CTA */}
              <button
                type="button"
                onClick={() => {
                  const matchedOffer = filteredP2POffers[0] || P2P_MERCHANTS[0];
                  if (matchedOffer) {
                    setSelectedP2POffer(matchedOffer);
                    setP2pFiatInput(
                      parseFloat(p2pExpressInput) > 0
                        ? p2pExpressInput
                        : matchedOffer.minFiat.toString()
                    );
                  }
                }}
                className="w-full h-11 rounded-xl bg-[#FCD535] hover:bg-[#F0B90B] text-[#181A20] font-bold text-sm transition-colors"
              >
                Select Payment Method
              </button>

              {/* 3x4 Numeric Keypad (Matches 00:20–00:22) */}
              <div className="grid grid-cols-3 gap-1 pt-1 select-none">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'BACK'].map(
                  (k) => (
                    <button
                      type="button"
                      key={k}
                      onClick={() => handleExpressKey(k)}
                      className="h-11 rounded-xl bg-[#202630]/60 hover:bg-[#2B3139] active:bg-[#363C45] flex items-center justify-center text-lg font-semibold font-mono text-[#EAECEF] transition-colors"
                    >
                      {k === 'BACK' ? <Delete size={18} className="text-[#848E9C]" /> : k}
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* STANDARD P2P MERCHANT LIST VIEW */}
          {p2pNavMode !== 'Express' && p2pSubView === 'market' && (
            <div className="space-y-3">
              {/* Buy / Sell + Crypto Selector Row */}
              <div className="flex items-center justify-between">
                <div className="inline-flex bg-[#202630] p-0.5 rounded-lg border border-[#2B3139]">
                  <button
                    type="button"
                    onClick={() => setP2pSide('BUY')}
                    className={`px-3.5 py-1 rounded-md text-xs font-bold ${
                      p2pSide === 'BUY' ? 'bg-[#0ECB81] text-white' : 'text-[#848E9C]'
                    }`}
                  >
                    Buy
                  </button>
                  <button
                    type="button"
                    onClick={() => setP2pSide('SELL')}
                    className={`px-3.5 py-1 rounded-md text-xs font-bold ${
                      p2pSide === 'SELL' ? 'bg-[#F6465D] text-white' : 'text-[#848E9C]'
                    }`}
                  >
                    Sell
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {(['USDT', 'USDC', 'BTC', 'ETH'] as const).map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setP2pCrypto(c)}
                      className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                        p2pCrypto === c
                          ? 'bg-[#2B3139] text-[#F0B90B]'
                          : 'text-[#848E9C]'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter Bar */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    value={p2pAmountFilter}
                    onChange={(e) => setP2pAmountFilter(e.target.value)}
                    placeholder={`Enter ${p2pFiat} amount`}
                    className="w-full h-8 bg-[#202630] border border-[#2B3139] rounded-lg px-2.5 text-xs font-mono text-[#EAECEF] focus:outline-none"
                  />
                </div>
                <select
                  value={p2pPaymentFilter}
                  onChange={(e) => setP2pPaymentFilter(e.target.value)}
                  className="h-8 bg-[#202630] border border-[#2B3139] rounded-lg px-2 text-xs text-[#EAECEF] focus:outline-none"
                >
                  <option value="All">All Payments</option>
                  <option value="UPI">UPI</option>
                  <option value="IMPS">IMPS</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              {/* Merchant Cards */}
              <div className="space-y-2.5">
                {filteredP2POffers.map((offer) => (
                  <div
                    key={offer.id}
                    className="bg-[#202630] rounded-xl p-3.5 border border-[#2B3139]/80 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#F0B90B]/20 text-[#F0B90B] font-bold text-xs flex items-center justify-center">
                          {offer.merchantName.charAt(0)}
                        </div>
                        <span className="font-bold text-xs text-[#EAECEF]">
                          {offer.merchantName}
                        </span>
                        {offer.verified && (
                          <ShieldCheck size={13} className="text-[#F0B90B]" />
                        )}
                      </div>
                      <span className="text-[11px] text-[#848E9C] font-mono">
                        {offer.completedOrders} orders · {offer.completionRate}%
                      </span>
                    </div>

                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-lg font-bold font-mono tabular-nums text-[#EAECEF]">
                          {offer.price.toFixed(2)}{' '}
                          <span className="text-xs font-normal text-[#848E9C]">
                            {offer.fiat}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#848E9C] font-mono tabular-nums mt-0.5">
                          Available: {offer.availableAsset.toFixed(2)} {offer.asset}
                        </div>
                        <div className="text-[11px] text-[#848E9C] font-mono tabular-nums">
                          Limit: {offer.minFiat.toLocaleString()} -{' '}
                          {offer.maxFiat.toLocaleString()} {offer.fiat}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedP2POffer(offer);
                          setP2pFiatInput(offer.minFiat.toString());
                        }}
                        className={`px-5 py-2 rounded-lg text-xs font-bold text-white ${
                          p2pSide === 'BUY' ? 'bg-[#0ECB81]' : 'bg-[#F6465D]'
                        }`}
                      >
                        {p2pSide === 'BUY' ? `Buy ${offer.asset}` : `Sell ${offer.asset}`}
                      </button>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-[#2B3139]/60">
                      {offer.paymentMethods.map((pm) => (
                        <span
                          key={pm}
                          className="text-[10px] px-2 py-0.5 rounded bg-[#2B3139] text-[#EAECEF]"
                        >
                          {pm}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* P2P ESCROW ORDERS SUB-VIEW */}
          {p2pSubView === 'orders' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#EAECEF]">
                  My P2P Escrow Orders
                </span>
                <button
                  type="button"
                  onClick={() => setP2pSubView('market')}
                  className="text-xs text-[#F0B90B] font-semibold"
                >
                  Back to P2P
                </button>
              </div>
              {p2pOrders.length === 0 ? (
                <div className="py-10 text-center text-xs text-[#848E9C] bg-[#202630]/50 rounded-xl border border-[#2B3139]">
                  No P2P escrow orders yet
                </div>
              ) : (
                p2pOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-[#202630] rounded-xl p-3.5 border border-[#2B3139] space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span
                          className={`font-bold mr-1.5 ${
                            ord.side === 'BUY' ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                          }`}
                        >
                          {ord.side} {ord.asset}
                        </span>
                        <span className="text-[#848E9C]">with {ord.merchantName}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-[#2B3139] text-[10px] font-semibold">
                        {ord.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between font-mono tabular-nums text-[#848E9C]">
                      <span>
                        Fiat: {ord.fiatAmount.toFixed(2)} {ord.fiat}
                      </span>
                      <span className="text-[#EAECEF] font-bold">
                        {ord.cryptoAmount.toFixed(4)} {ord.asset}
                      </span>
                    </div>
                    {ord.status === 'Pending Payment' && (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => completeP2POrder(ord.id)}
                          className="flex-1 py-1.5 rounded-lg bg-[#0ECB81] text-white font-bold"
                        >
                          Transferred, Notify Seller
                        </button>
                        <button
                          type="button"
                          onClick={() => cancelP2POrder(ord.id)}
                          className="px-3 py-1.5 rounded-lg bg-[#2B3139] text-[#EAECEF]"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================
          5. ALPHA TAB (Web3 Early Ecosystem Discovery)
         =================================================================== */}
      {tradeSubTab === 'alpha' && (
        <div className="px-4 pt-2.5 space-y-3">
          <div className="bg-gradient-to-r from-[#202630] to-[#2B3139] rounded-xl p-3.5 border border-[#F0B90B]/30 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#F0B90B]">
                <Sparkles size={14} /> NexusTrade Alpha Spotlight
              </div>
              <div className="text-xs text-[#EAECEF] mt-0.5">
                On-chain early liquidity access with zero gas abstraction
              </div>
            </div>
            <div className="text-right font-mono text-xs">
              <div className="text-[#848E9C] text-[10px]">Spot USDT</div>
              <div className="font-bold text-[#EAECEF]">${usdtFree.toFixed(2)}</div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {(['All', 'Monad L1', 'Base', 'HyperEVM'] as const).map((chain) => (
              <button
                type="button"
                key={chain}
                onClick={() => setAlphaFilter(chain)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                  alphaFilter === chain
                    ? 'bg-[#F0B90B] text-[#181A20]'
                    : 'bg-[#202630] text-[#848E9C]'
                }`}
              >
                {chain}
              </button>
            ))}
          </div>

          <div className="space-y-2.5">
            {filteredAlpha.map((proj) => {
              const held = alphaHoldings[proj.symbol]?.amount || 0;
              return (
                <div
                  key={proj.symbol}
                  className="bg-[#202630] rounded-xl p-3.5 border border-[#2B3139] flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CoinIcon asset={proj.symbol} size="sm" />
                      <span className="font-bold text-sm text-[#EAECEF]">
                        {proj.symbol}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2B3139] text-[#F0B90B] font-semibold">
                        {proj.chain}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#0ECB81]/15 text-[#0ECB81] font-mono">
                        AI {proj.aiScore}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#848E9C]">
                      MCap {proj.mcap} · Liq {proj.liquidity}
                      {held > 0 && (
                        <span className="text-[#F0B90B] ml-2 font-mono">
                          Held: {held.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right font-mono tabular-nums">
                      <div className="text-sm font-bold text-[#EAECEF]">
                        ${proj.price.toFixed(3)}
                      </div>
                      <div
                        className={`text-[11px] font-semibold ${
                          proj.change >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                        }`}
                      >
                        {proj.change >= 0 ? '+' : ''}
                        {proj.change.toFixed(1)}%
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedAlpha(proj)}
                      className="px-3 py-1.5 rounded-lg bg-[#FCD535] text-[#181A20] text-xs font-bold hover:bg-[#F0B90B]"
                    >
                      Buy
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================
          MODALS & BOTTOM SHEETS
         =================================================================== */}

      {/* Pair Picker Sheet */}
      {showPairPicker && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end justify-center"
          onClick={() => setShowPairPicker(false)}
        >
          <div
            className="w-full max-w-[430px] bg-[#1E2329] rounded-t-3xl border-t border-[#2B3139] p-4 max-h-[82vh] flex flex-col pb-safe-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-[#474D57] rounded-full mx-auto mb-2.5" />
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-[15px] text-[#EAECEF]">Select Spot Market</span>
              <button
                type="button"
                onClick={() => setShowPairPicker(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#202630]"
                aria-label="Close pair picker"
              >
                <X size={16} />
              </button>
            </div>
            <div className="relative mb-3">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#848E9C]"
              />
              <input
                type="text"
                value={pairSearch}
                onChange={(e) => setPairSearch(e.target.value)}
                placeholder="Search coin pair..."
                className="w-full h-9 bg-[#202630] border border-[#2B3139] focus:border-[#F0B90B] rounded-xl pl-8 pr-3 text-xs text-[#EAECEF] focus:outline-none"
              />
            </div>
            <div className="overflow-y-auto overscroll-contain space-y-1 flex-1">
              {tickerList
                .filter((s) =>
                  s.symbol.toLowerCase().includes(pairSearch.toLowerCase())
                )
                .map((s) => {
                  const pct = s.priceChangePercent || 0;
                  return (
                    <button
                      type="button"
                      key={s.symbol}
                      onClick={() => {
                        setActiveSymbol(s.symbol);
                        setPriceInput('');
                        setShowPairPicker(false);
                      }}
                      className="w-full px-3 py-2.5 rounded-xl hover:bg-[#2B3139] flex items-center justify-between text-xs transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <CoinIcon asset={s.baseAsset} size="sm" />
                        <span className="font-bold text-[#EAECEF]">
                          {s.baseAsset}
                          <span className="text-[#848E9C] font-normal">
                            /{s.quoteAsset}
                          </span>
                        </span>
                      </div>
                      <div className="text-right font-mono tabular-nums">
                        <div className="font-bold text-[#EAECEF]">
                          {formatPrice(s.lastPrice || 0)}
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
        </div>
      )}

      {/* Convert Asset Picker Modal */}
      {showAssetPicker && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end justify-center"
          onClick={() => setShowAssetPicker(null)}
        >
          <div
            className="w-full max-w-[430px] bg-[#1E2329] rounded-t-3xl border-t border-[#2B3139] p-4 max-h-[75vh] flex flex-col pb-safe-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-[#474D57] rounded-full mx-auto mb-2.5" />
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-[15px] text-[#EAECEF]">
                Select {showAssetPicker === 'from' ? 'From' : 'To'} Asset
              </span>
              <button
                type="button"
                onClick={() => setShowAssetPicker(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#202630]"
                aria-label="Close asset picker"
              >
                <X size={16} />
              </button>
            </div>
            <div className="overflow-y-auto overscroll-contain space-y-1">
              {Object.values(spotWallet).map((b) => (
                <button
                  type="button"
                  key={b.asset}
                  onClick={() => {
                    if (showAssetPicker === 'from') setFromAsset(b.asset);
                    else setToAsset(b.asset);
                    setShowAssetPicker(null);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl hover:bg-[#2B3139] flex items-center justify-between text-xs transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <CoinIcon asset={b.asset} size="sm" />
                    <span className="font-bold text-[#EAECEF]">{b.asset}</span>
                  </div>
                  <span className="font-mono tabular-nums text-[#848E9C]">
                    {b.available.toFixed(4)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Convert Preview Confirmation Sheet */}
      {showConvertPreview && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end justify-center"
          onClick={() => setShowConvertPreview(false)}
        >
          <div
            className="w-full max-w-[430px] bg-[#1E2329] rounded-t-3xl border-t border-[#2B3139] p-5 space-y-3.5 pb-safe-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-[#474D57] rounded-full mx-auto -mt-1" />
            <div className="flex items-center justify-between">
              <span className="font-bold text-[15px] text-[#EAECEF]">Confirm Conversion</span>
              <button
                type="button"
                onClick={() => setShowConvertPreview(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#202630]"
                aria-label="Close convert preview"
              >
                <X size={16} />
              </button>
            </div>
            <div className="bg-[#202630] border border-[#2B3139] rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#848E9C]">Pay</span>
                <span className="font-mono tabular-nums font-bold text-[#EAECEF]">
                  {parsedFromAmt} {fromAsset}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#848E9C]">Receive</span>
                <span className="font-mono tabular-nums font-bold text-[#2EBD85]">
                  {estimatedToAmt.toFixed(6)} {toAsset}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#848E9C]">Fee</span>
                <span className="text-[#2EBD85] font-semibold">Zero Fee</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleConfirmConvert}
              className="w-full h-11 rounded-xl bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] font-bold text-sm transition-colors"
            >
              Confirm Convert
            </button>
          </div>
        </div>
      )}

      {/* Stock Picker Sheet */}
      {showStockPicker && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end justify-center"
          onClick={() => setShowStockPicker(false)}
        >
          <div
            className="w-full max-w-[430px] bg-[#1E2329] rounded-t-3xl border-t border-[#2B3139] p-4 max-h-[78vh] flex flex-col pb-safe-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-[#474D57] rounded-full mx-auto mb-2.5" />
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-[15px] text-[#EAECEF]">Select Stock Token</span>
              <button
                type="button"
                onClick={() => setShowStockPicker(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#202630]"
                aria-label="Close stock picker"
              >
                <X size={16} />
              </button>
            </div>
            <div className="overflow-y-auto overscroll-contain space-y-1.5">
              {stocks.map((stk) => (
                <button
                  type="button"
                  key={stk.symbol}
                  onClick={() => {
                    setSelectedStockSymbol(stk.symbol);
                    setStockLimitPrice(stk.lastPrice.toFixed(2));
                    setShowStockPicker(false);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl hover:bg-[#2B3139] flex items-center justify-between text-xs transition-colors"
                >
                  <div className="text-left">
                    <div className="font-bold text-[#EAECEF]">{stk.symbol}</div>
                    <div className="text-[11px] text-[#848E9C]">{stk.name}</div>
                  </div>
                  <div className="text-right font-mono tabular-nums">
                    <div className="font-bold text-[#EAECEF]">
                      ${stk.lastPrice.toFixed(2)}
                    </div>
                    <div
                      className={`text-[11px] ${
                        stk.changePercent >= 0 ? 'text-[#2EBD85]' : 'text-[#F6465D]'
                      }`}
                    >
                      {stk.changePercent >= 0 ? '+' : ''}
                      {stk.changePercent.toFixed(2)}%
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* P2P Offer Order Modal */}
      {selectedP2POffer && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end justify-center"
          onClick={() => setSelectedP2POffer(null)}
        >
          <div
            className="w-full max-w-[430px] bg-[#1E2329] rounded-t-3xl border-t border-[#2B3139] p-5 space-y-3.5 pb-safe-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-[#474D57] rounded-full mx-auto -mt-1" />
            <div className="flex items-center justify-between">
              <span className="font-bold text-[15px] text-[#EAECEF]">
                {p2pSide} {selectedP2POffer.asset} via {selectedP2POffer.merchantName}
              </span>
              <button
                type="button"
                onClick={() => setSelectedP2POffer(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#202630]"
                aria-label="Close P2P offer modal"
              >
                <X size={16} />
              </button>
            </div>
            <div className="bg-[#202630] border border-[#2B3139] rounded-xl p-3.5 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#848E9C]">Unit Price</span>
                <span className="font-mono tabular-nums font-bold text-[#EAECEF]">
                  {selectedP2POffer.price.toFixed(2)} {selectedP2POffer.fiat}
                </span>
              </div>
              <div>
                <label className="text-[#848E9C] block mb-1.5">
                  Amount ({selectedP2POffer.fiat})
                </label>
                <input
                  type="number"
                  value={p2pFiatInput}
                  onChange={(e) => setP2pFiatInput(e.target.value)}
                  className="w-full h-10 bg-[#181A20] border border-[#2B3139] focus:border-[#F0B90B] rounded-xl px-3 font-mono tabular-nums font-bold text-[#EAECEF] focus:outline-none"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                const amt = parseFloat(p2pFiatInput) || 0;
                const res = createP2POrder({
                  listingId: selectedP2POffer.id,
                  fiatAmount: amt,
                  paymentMethod: selectedP2POffer.paymentMethods[0] || 'UPI',
                });
                setOrderFeedback({
                  type: res.ok ? 'success' : 'error',
                  text: res.message,
                });
                if (res.ok) {
                  setSelectedP2POffer(null);
                  setP2pSubView('orders');
                }
                setTimeout(() => setOrderFeedback(null), 3200);
              }}
              className={`w-full h-11 rounded-xl font-bold text-sm text-white ${
                p2pSide === 'BUY' ? 'bg-[#2EBD85]' : 'bg-[#F6465D]'
              }`}
            >
              Confirm P2P {p2pSide}
            </button>
          </div>
        </div>
      )}

      {/* Alpha Swap Sheet */}
      {selectedAlpha && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end justify-center"
          onClick={() => setSelectedAlpha(null)}
        >
          <div
            className="w-full max-w-[430px] bg-[#1E2329] rounded-t-3xl border-t border-[#2B3139] p-5 space-y-3.5 pb-safe-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-[#474D57] rounded-full mx-auto -mt-1" />
            <div className="flex items-center justify-between">
              <span className="font-bold text-[15px] text-[#EAECEF]">
                Buy {selectedAlpha.symbol} ({selectedAlpha.chain})
              </span>
              <button
                type="button"
                onClick={() => setSelectedAlpha(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#202630]"
                aria-label="Close alpha swap sheet"
              >
                <X size={16} />
              </button>
            </div>
            <div className="bg-[#202630] border border-[#2B3139] rounded-xl p-3.5 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#848E9C]">Live Price</span>
                <span className="font-mono tabular-nums font-bold text-[#EAECEF]">
                  ${selectedAlpha.price.toFixed(4)}
                </span>
              </div>
              <input
                type="number"
                value={alphaBuyUsdt}
                onChange={(e) => setAlphaBuyUsdt(e.target.value)}
                placeholder="Enter USDT amount (min 5)"
                className="w-full h-10 bg-[#181A20] border border-[#2B3139] focus:border-[#F0B90B] rounded-xl px-3 font-mono tabular-nums font-bold text-[#EAECEF] focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleAlphaSwap}
              className="w-full h-11 rounded-xl bg-[#F0B90B] hover:bg-[#FCD535] text-[#181A20] font-bold text-sm transition-colors"
            >
              Confirm Alpha Swap
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
