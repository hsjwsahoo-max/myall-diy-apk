import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Eye,
  History,
  Layers,
  PieChart,
  Settings,
  ShieldCheck,
  Sparkles,
  Wallet,
  X,
} from 'lucide-react';
import { FIAT_RATES, updateLiveFiatRates } from '../../components/CoinIcon';
import { marketService } from '../../services/marketService';
import { CandleData, ConnectionStatus, MarketTicker } from '../../types/exchange';

// ============================================================================
// 1. DEDICATED PREVIEW PORTFOLIO CONFIGURATION (SEPARATE FROM ON-CHAIN)
// ============================================================================
export const PREVIEW_PORTFOLIO_CONFIG = {
  asset: 'USDT',
  name: 'Tether USD',
  network: 'BNB Smart Chain (BEP20)',
  quantity: 11352.81,
  purchasePriceInr: 93.89,
  startingUsdtUsdPrice: 0.99847,
  startingPortfolioInrValue: 1066028.85,
  // Implied USD/INR rate for the illustrative starting snapshot: 1066028.85 / (11352.81 * 0.99847) = 94.043886
  startingImpliedUsdInrRate: 1066028.85 / (11352.81 * 0.99847),
  get purchaseCostBasisInr(): number {
    return Number((this.quantity * this.purchasePriceInr).toFixed(2)); // ₹10,65,915.33
  },
} as const;

// Legacy exports kept for compatibility with sub-components
export const PREVIEW_USDT_QTY = PREVIEW_PORTFOLIO_CONFIG.quantity;
export const PREVIEW_USDT_INR_PRICE = PREVIEW_PORTFOLIO_CONFIG.purchasePriceInr;

/**
 * Formats an INR value using the Indian numbering system (en-IN: ₹10,66,028.85).
 */
export function formatInrValue(inrAmount: number, decimals = 2): string {
  const safe = Number.isFinite(inrAmount) ? inrAmount : 0;
  return `₹${safe.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export function formatUsdValue(usdAmount: number, decimals = 2): string {
  const safe = Number.isFinite(usdAmount) ? usdAmount : 0;
  return `$${safe.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export function formatQuantity(qty: number, decimals = 2): string {
  const safe = Number.isFinite(qty) ? qty : 0;
  return safe.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatTimestamp(ts: number | null): string {
  if (!ts || !Number.isFinite(ts)) return 'Awaiting sync';
  try {
    return new Date(ts).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch {
    return 'Just now';
  }
}

// ============================================================================
// 2. LIVE MARKET PRICING & HISTORICAL VALUATION HOOK
// ============================================================================
export type WalletValuationSourceMode = 'preview_portfolio' | 'verified_onchain';

export interface LivePortfolioValuation {
  // Active Mode
  activeMode: WalletValuationSourceMode;
  isPreviewMode: boolean;

  // Underlying Quotes & Provenance
  usdtUsdPrice: number;
  usdInrRate: number;
  inrPerUsdt: number;
  usdt24hChangePct: number;
  isUsdtQuoteLive: boolean;
  isFxQuoteLive: boolean;
  isStaleOrOffline: boolean;
  usdtFeedSource: string;
  fxFeedSource: string;
  lastUpdatedAt: number | null;

  // A. Preview Portfolio Figures (11,352.81 USDT — Never mixed with On-Chain)
  previewQuantityUsdt: number;
  previewPurchasePriceInr: number;
  previewCostBasisInr: number;
  previewStartingUsdtUsd: number;
  previewStartingInrValue: number;
  previewLiveUsdValue: number;
  previewLiveInrValue: number;
  previewPnlInrVsPurchase: number;
  previewPnlPctVsPurchase: number;

  // B. Verified On-Chain Figures (Genuine RPC Only — Never includes Preview)
  verifiedUsdtQuantity: number;
  verifiedTotalUsdValue: number;
  verifiedTotalInrValue: number;

  // C. Exchange Account Figures (Spot + Funding USDT — Separate)
  exchangeSpotUsdtQuantity: number;
  exchangeSpotInrValue: number;

  // Currently Displayed Portfolio Figures (based on activeMode)
  displayedUsdtQuantity: number;
  displayedUsdValue: number;
  displayedInrValue: number;
  displayedChangePct: number;
  displayedChangeInr: number;

  // Historical Chart Series (1D / 7D / 30D)
  chartPoints: { time: number; usdtUsd: number; inrValue: number; x: number; y: number }[];
  chartHighInr: number;
  chartLowInr: number;
  chartStartInr: number;
  chartEndInr: number;
  chartDeltaInr: number;
  chartDeltaPct: number;
  chartSvgLinePath: string;
  chartSvgAreaPath: string;
  isChartHistoricalLive: boolean;
  chartProvenanceLabel: string;
  isLoadingChart: boolean;
}

export function useLiveWalletPortfolioValuation(params: {
  usdtTicker: MarketTicker;
  connectionStatus: ConnectionStatus;
  lastUpdated: number | null;
  fxProvenance: { source: string; updatedAt: number; provenance: string };
  activeMode: WalletValuationSourceMode;
  timeframe: '1D' | '7D' | '30D';
  verifiedUsdtQuantity: number;
  verifiedTotalUsdValue: number;
  exchangeSpotUsdtQuantity: number;
}): LivePortfolioValuation {
  const {
    usdtTicker,
    connectionStatus,
    lastUpdated,
    fxProvenance,
    activeMode,
    timeframe,
    verifiedUsdtQuantity,
    verifiedTotalUsdValue,
    exchangeSpotUsdtQuantity,
  } = params;

  // Stabilized USDT/USD quote to prevent unnecessary rapid sub-second visual flickering
  const [stableUsdtUsd, setStableUsdtUsd] = useState<number>(() =>
    usdtTicker?.lastPrice && usdtTicker.lastPrice > 0.9 && usdtTicker.lastPrice < 1.1
      ? Number(usdtTicker.lastPrice.toFixed(5))
      : PREVIEW_PORTFOLIO_CONFIG.startingUsdtUsdPrice
  );
  const [stableUsdtChangePct, setStableUsdtChangePct] = useState<number>(() =>
    Number.isFinite(usdtTicker?.priceChangePercent) ? usdtTicker.priceChangePercent : -0.02
  );
  const [stableQuoteTimestamp, setStableQuoteTimestamp] = useState<number | null>(
    usdtTicker?.lastUpdated || lastUpdated || null
  );
  const lastPriceUpdateRef = useRef<number>(0);

  // Live USD/INR FX state (with direct fallback fetch if server cache hasn't synced yet)
  const [liveUsdInrRate, setLiveUsdInrRate] = useState<number>(() => FIAT_RATES.INR.rate || 86.48);
  const [fxLiveStatus, setFxLiveStatus] = useState<{
    isLive: boolean;
    source: string;
    updatedAt: number | null;
  }>({
    isLive: fxProvenance.provenance === 'live_fx_api',
    source: fxProvenance.source || 'ExchangeRate-API (USD/INR)',
    updatedAt: fxProvenance.updatedAt || null,
  });

  // Update stabilized USDT/USD price at most once every 1.2s AND only when 5-decimal price changes
  useEffect(() => {
    const rawPrice = usdtTicker?.lastPrice;
    if (!rawPrice || rawPrice <= 0.9 || rawPrice >= 1.1) return;

    const rounded = Number(rawPrice.toFixed(5));
    const now = Date.now();
    const elapsed = now - lastPriceUpdateRef.current;

    if (rounded !== stableUsdtUsd && elapsed >= 1200) {
      lastPriceUpdateRef.current = now;
      setStableUsdtUsd(rounded);
      setStableUsdtChangePct(
        Number.isFinite(usdtTicker.priceChangePercent)
          ? Number(usdtTicker.priceChangePercent.toFixed(3))
          : 0
      );
      setStableQuoteTimestamp(usdtTicker.lastUpdated || now);
    } else if (stableQuoteTimestamp === null && usdtTicker.lastUpdated) {
      lastPriceUpdateRef.current = now;
      setStableUsdtUsd(rounded);
      setStableUsdtChangePct(
        Number.isFinite(usdtTicker.priceChangePercent)
          ? Number(usdtTicker.priceChangePercent.toFixed(3))
          : 0
      );
      setStableQuoteTimestamp(usdtTicker.lastUpdated);
    }
  }, [
    usdtTicker?.lastPrice,
    usdtTicker?.priceChangePercent,
    usdtTicker?.lastUpdated,
    stableUsdtUsd,
    stableQuoteTimestamp,
  ]);

  // Sync USD/INR rate from ExchangeContext + direct client-side verification fetch if needed
  useEffect(() => {
    if (FIAT_RATES.INR.rate > 0) {
      setLiveUsdInrRate(FIAT_RATES.INR.rate);
    }
    if (fxProvenance.provenance === 'live_fx_api') {
      setFxLiveStatus({
        isLive: true,
        source: fxProvenance.source,
        updatedAt: fxProvenance.updatedAt,
      });
      return;
    }

    let cancelled = false;
    fetch('https://open.er-api.com/v6/latest/USD')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data?.rates?.INR) return;
        const rate = Number(data.rates.INR);
        if (Number.isFinite(rate) && rate > 50 && rate < 150) {
          updateLiveFiatRates({
            INR: rate,
            EUR: Number(data.rates.EUR) || FIAT_RATES.EUR.rate,
            AED: Number(data.rates.AED) || FIAT_RATES.AED.rate,
            GBP: Number(data.rates.GBP) || FIAT_RATES.GBP.rate,
          });
          setLiveUsdInrRate(rate);
          setFxLiveStatus({
            isLive: true,
            source: 'ExchangeRate-API Live USD/INR',
            updatedAt: Date.now(),
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFxLiveStatus((prev) => ({
            ...prev,
            isLive: false,
            source: 'Reference FX Rate (Live FX API Unreachable)',
          }));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [fxProvenance]);

  // Fetch Real Historical USDT/USD Candles for 1D, 7D, 30D
  const [historicalCandles, setHistoricalCandles] = useState<CandleData[]>([]);
  const [isChartHistoricalLive, setIsChartHistoricalLive] = useState<boolean>(false);
  const [isLoadingChart, setIsLoadingChart] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoadingChart(true);

    const intervalMap = {
      '1D': { interval: '1h' as const, limit: 24 },
      '7D': { interval: '4h' as const, limit: 42 },
      '30D': { interval: '1d' as const, limit: 30 },
    };
    const cfg = intervalMap[timeframe];

    marketService
      .fetchHistoricalCandles('USDTUSD', cfg.interval, cfg.limit)
      .then((candles) => {
        if (cancelled) return;
        if (Array.isArray(candles) && candles.length >= 4) {
          setHistoricalCandles(candles);
          setIsChartHistoricalLive(true);
        } else {
          setHistoricalCandles([]);
          setIsChartHistoricalLive(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHistoricalCandles([]);
          setIsChartHistoricalLive(false);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingChart(false);
      });

    return () => {
      cancelled = true;
    };
  }, [timeframe]);

  // Determine Live vs Stale status
  const isUsdtQuoteLive = Boolean(
    usdtTicker &&
      usdtTicker.lastPrice > 0.9 &&
      usdtTicker.dataProvenance !== 'unavailable' &&
      usdtTicker.dataProvenance !== 'delayed' &&
      connectionStatus !== 'error' &&
      connectionStatus !== 'stale'
  );
  const isFxQuoteLive = fxLiveStatus.isLive;
  const isStaleOrOffline = !isUsdtQuoteLive || !isFxQuoteLive;

  // Displayed USDT/INR price fixed at ₹93.89 per user specification:
  // "Display the INR price as ₹93.89. The price ₹93.89 must be treated as the displayed USDT/INR price, not as a purchase-price or cost-basis label."
  const inrPerUsdt = 93.89;
  const effectiveUsdInrRate = stableUsdtUsd > 0 ? inrPerUsdt / stableUsdtUsd : liveUsdInrRate;

  // A. Portfolio Holdings (11,352.81 USDT)
  const previewQuantityUsdt = PREVIEW_PORTFOLIO_CONFIG.quantity;
  const previewLiveUsdValue = previewQuantityUsdt * stableUsdtUsd;
  const previewLiveInrValue = Number((previewQuantityUsdt * inrPerUsdt).toFixed(2)); // ₹10,65,915.33
  const previewCostBasisInr = PREVIEW_PORTFOLIO_CONFIG.purchaseCostBasisInr;
  const previewPnlInrVsPurchase = previewLiveInrValue - previewCostBasisInr;
  const previewPnlPctVsPurchase =
    previewCostBasisInr > 0 ? (previewPnlInrVsPurchase / previewCostBasisInr) * 100 : 0;

  // B. Verified On-Chain Wallet (Strictly separate)
  const verifiedTotalInrValue = verifiedTotalUsdValue * effectiveUsdInrRate;

  // C. Exchange Spot Wallet (Strictly separate)
  const exchangeSpotInrValue = exchangeSpotUsdtQuantity * inrPerUsdt;

  // Active Display Selection
  const isPreviewMode = activeMode === 'preview_portfolio';
  const displayedUsdtQuantity = isPreviewMode ? previewQuantityUsdt : verifiedUsdtQuantity;
  const displayedUsdValue = isPreviewMode ? previewLiveUsdValue : verifiedTotalUsdValue;
  const displayedInrValue = isPreviewMode ? previewLiveInrValue : verifiedTotalInrValue;

  // Build Smooth Interactive Chart Series & SVG Paths for 1D, 7D, 30D
  const chartData = useMemo(() => {
    const qty = displayedUsdtQuantity;
    if (qty <= 0) {
      return {
        points: [],
        highInr: 0,
        lowInr: 0,
        startInr: 0,
        endInr: 0,
        deltaInr: 0,
        deltaPct: 0,
        linePath: 'M 0 74 L 360 74',
        areaPath: 'M 0 74 L 360 74 L 360 84 L 0 84 Z',
        provenanceLabel: 'Zero Holding Balance',
      };
    }

    const now = Date.now();
    // Distinct smooth curves per timeframe (1D, 7D, 30D) inspired by the Binance Wallet reference
    const multipliers =
      timeframe === '1D'
        ? [
            0.99962, 0.99964, 0.99963, 0.99965, 0.99966, 0.99964, 0.99967, 0.99969, 0.99968,
            0.99971, 0.99974, 0.99978, 0.99983, 0.99989, 0.99995, 1.0,
          ]
        : timeframe === '7D'
        ? [
            0.9984, 0.99855, 0.9987, 0.99862, 0.99885, 0.99905, 0.99895, 0.99918, 0.99932,
            0.99925, 0.99948, 0.99962, 0.99958, 0.99978, 0.99991, 1.0,
          ]
        : [
            0.9968, 0.9971, 0.9974, 0.99725, 0.99765, 0.99795, 0.9982, 0.9981, 0.99845,
            0.99875, 0.9989, 0.99915, 0.99935, 0.9996, 0.99982, 1.0,
          ];

    const stepMs =
      timeframe === '1D'
        ? (24 * 3600_000) / (multipliers.length - 1)
        : timeframe === '7D'
        ? (7 * 24 * 3600_000) / (multipliers.length - 1)
        : (30 * 24 * 3600_000) / (multipliers.length - 1);

    let rawPoints: { time: number; usdtUsd: number; inrValue: number }[] = [];

    if (isChartHistoricalLive && historicalCandles.length >= 6) {
      const baseRate = inrPerUsdt / stableUsdtUsd;
      rawPoints = historicalCandles.map((c) => ({
        time: c.time,
        usdtUsd: c.close,
        inrValue: Number((qty * c.close * baseRate).toFixed(2)),
      }));
      rawPoints[rawPoints.length - 1] = {
        time: now,
        usdtUsd: stableUsdtUsd,
        inrValue: displayedInrValue,
      };
    } else {
      rawPoints = multipliers.map((m, idx) => ({
        time: Math.round(now - (multipliers.length - 1 - idx) * stepMs),
        usdtUsd: Number((stableUsdtUsd * m).toFixed(5)),
        inrValue: Number((displayedInrValue * m).toFixed(2)),
      }));
      rawPoints[rawPoints.length - 1] = {
        time: now,
        usdtUsd: stableUsdtUsd,
        inrValue: displayedInrValue,
      };
    }

    const values = rawPoints.map((p) => p.inrValue);
    const highInr = Math.max(...values);
    const lowInr = Math.min(...values);
    const startInr = values[0] ?? displayedInrValue;
    const endInr = values[values.length - 1] ?? displayedInrValue;
    const deltaInr = Number((endInr - startInr).toFixed(2));
    const deltaPct = startInr > 0 ? (deltaInr / startInr) * 100 : 0;

    // Normalize into SVG coordinates (width 360, height 88, top pad 12, bottom pad 74)
    const width = 360;
    const minY = 12;
    const maxY = 72;
    const span = Math.max(highInr - lowInr, 0.01);

    const points = rawPoints.map((pt, i) => {
      const x = (i / Math.max(1, rawPoints.length - 1)) * width;
      const norm = (pt.inrValue - lowInr) / span;
      const y = maxY - norm * (maxY - minY);
      return {
        ...pt,
        x: Number(x.toFixed(1)),
        y: Number(y.toFixed(1)),
      };
    });

    let linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const midX = Number(((prev.x + curr.x) / 2).toFixed(1));
      linePath += ` C ${midX} ${prev.y}, ${midX} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    const areaPath = `${linePath} L ${width} 84 L 0 84 Z`;

    return {
      points,
      highInr,
      lowInr,
      startInr,
      endInr,
      deltaInr,
      deltaPct,
      linePath,
      areaPath,
      provenanceLabel: `${timeframe} Portfolio Valuation`,
    };
  }, [
    displayedUsdtQuantity,
    displayedInrValue,
    isChartHistoricalLive,
    historicalCandles,
    stableUsdtUsd,
    timeframe,
  ]);

  return {
    activeMode,
    isPreviewMode,
    usdtUsdPrice: stableUsdtUsd,
    usdInrRate: effectiveUsdInrRate,
    inrPerUsdt,
    usdt24hChangePct: stableUsdtChangePct,
    isUsdtQuoteLive,
    isFxQuoteLive,
    isStaleOrOffline,
    usdtFeedSource: usdtTicker?.feedSource || 'Market Quote',
    fxFeedSource: fxLiveStatus.source,
    lastUpdatedAt: stableQuoteTimestamp || fxLiveStatus.updatedAt,

    previewQuantityUsdt,
    previewPurchasePriceInr: PREVIEW_PORTFOLIO_CONFIG.purchasePriceInr,
    previewCostBasisInr,
    previewStartingUsdtUsd: PREVIEW_PORTFOLIO_CONFIG.startingUsdtUsdPrice,
    previewStartingInrValue: PREVIEW_PORTFOLIO_CONFIG.startingPortfolioInrValue,
    previewLiveUsdValue,
    previewLiveInrValue,
    previewPnlInrVsPurchase,
    previewPnlPctVsPurchase,

    verifiedUsdtQuantity,
    verifiedTotalUsdValue,
    verifiedTotalInrValue,

    exchangeSpotUsdtQuantity,
    exchangeSpotInrValue,

    displayedUsdtQuantity,
    displayedUsdValue,
    displayedInrValue,
    displayedChangePct: chartData.deltaPct,
    displayedChangeInr: chartData.deltaInr,

    chartPoints: chartData.points,
    chartHighInr: chartData.highInr,
    chartLowInr: chartData.lowInr,
    chartStartInr: chartData.startInr,
    chartEndInr: chartData.endInr,
    chartDeltaInr: chartData.deltaInr,
    chartDeltaPct: chartData.deltaPct,
    chartSvgLinePath: chartData.linePath,
    chartSvgAreaPath: chartData.areaPath,
    isChartHistoricalLive,
    chartProvenanceLabel: chartData.provenanceLabel,
    isLoadingChart,
  };
}

// ============================================================================
// 2B. SIX-MONTH TRANSACTION TIMELINE (PRESERVES UNDERLYING DATA MODEL)
// ============================================================================
export interface PreviewHistoryTimelineEntry {
  id: string;
  isPreviewSample: true;
  type: 'Receive' | 'Send';
  asset: 'USDT';
  amount: number;
  dateStr: string; // YYYY-MM-DD
  timeStr: string; // HH:MM:SS
  monthKey: '2026-11' | '2026-10' | '2026-09' | '2026-08' | '2026-07' | '2026-06';
  monthLabel: string;
  networkLabel: 'BNB Smart Chain' | 'Ethereum' | 'Solana' | 'opBNB';
  chainBadge: 'BSC' | 'ETH' | 'SOL' | 'opBNB';
  badgeColor: string;
  sampleStatus: string;
  previewIndicator: string;
  explanation: string;
}

export const PREVIEW_HISTORY_MONTH_OPTIONS = [
  { key: 'ALL', label: 'All Dates' },
  { key: '2026-11', label: '2026-11' },
  { key: '2026-10', label: '2026-10' },
  { key: '2026-09', label: '2026-09' },
  { key: '2026-08', label: '2026-08' },
  { key: '2026-07', label: '2026-07' },
  { key: '2026-06', label: '2026-06' },
] as const;

export const PREVIEW_SIX_MONTH_USDT_TIMELINE: PreviewHistoryTimelineEntry[] = [
  // November 2026
  {
    id: 'sample-usdt-2026-11-06',
    isPreviewSample: true,
    type: 'Receive',
    asset: 'USDT',
    amount: 1420.5,
    dateStr: '2026-11-06',
    timeStr: '16:42:18',
    monthKey: '2026-11',
    monthLabel: 'November 2026',
    networkLabel: 'BNB Smart Chain',
    chainBadge: 'BSC',
    badgeColor: '#F0B90B',
    sampleStatus: 'Completed',
    previewIndicator: 'Completed',
    explanation: 'USDT received from external wallet on BNB Smart Chain (BEP20).',
  },
  {
    id: 'sample-usdt-2026-11-04',
    isPreviewSample: true,
    type: 'Send',
    asset: 'USDT',
    amount: 350.0,
    dateStr: '2026-11-04',
    timeStr: '14:18:32',
    monthKey: '2026-11',
    monthLabel: 'November 2026',
    networkLabel: 'BNB Smart Chain',
    chainBadge: 'BSC',
    badgeColor: '#F0B90B',
    sampleStatus: 'Completed',
    previewIndicator: 'Completed',
    explanation: 'USDT sent to external wallet on BNB Smart Chain (BEP20).',
  },
  {
    id: 'sample-usdt-2026-11-01',
    isPreviewSample: true,
    type: 'Receive',
    asset: 'USDT',
    amount: 865.25,
    dateStr: '2026-11-01',
    timeStr: '11:15:04',
    monthKey: '2026-11',
    monthLabel: 'November 2026',
    networkLabel: 'BNB Smart Chain',
    chainBadge: 'BSC',
    badgeColor: '#F0B90B',
    sampleStatus: 'Completed',
    previewIndicator: 'Completed',
    explanation: 'USDT received on BNB Smart Chain (BEP20).',
  },

  // October 2026
  {
    id: 'sample-usdt-2026-10-24',
    isPreviewSample: true,
    type: 'Receive',
    asset: 'USDT',
    amount: 1190.8,
    dateStr: '2026-10-24',
    timeStr: '19:08:51',
    monthKey: '2026-10',
    monthLabel: 'October 2026',
    networkLabel: 'BNB Smart Chain',
    chainBadge: 'BSC',
    badgeColor: '#F0B90B',
    sampleStatus: 'Completed',
    previewIndicator: 'Completed',
    explanation: 'USDT received on BNB Smart Chain (BEP20).',
  },
  {
    id: 'sample-usdt-2026-10-18',
    isPreviewSample: true,
    type: 'Send',
    asset: 'USDT',
    amount: 600.0,
    dateStr: '2026-10-18',
    timeStr: '15:22:10',
    monthKey: '2026-10',
    monthLabel: 'October 2026',
    networkLabel: 'Ethereum',
    chainBadge: 'ETH',
    badgeColor: '#627EEA',
    sampleStatus: 'Completed',
    previewIndicator: 'Completed',
    explanation: 'USDT sent to external wallet on Ethereum (ERC20).',
  },
  {
    id: 'sample-usdt-2026-10-09',
    isPreviewSample: true,
    type: 'Receive',
    asset: 'USDT',
    amount: 640.15,
    dateStr: '2026-10-09',
    timeStr: '09:34:27',
    monthKey: '2026-10',
    monthLabel: 'October 2026',
    networkLabel: 'Ethereum',
    chainBadge: 'ETH',
    badgeColor: '#627EEA',
    sampleStatus: 'Completed',
    previewIndicator: 'Completed',
    explanation: 'USDT received on Ethereum (ERC20).',
  },
  {
    id: 'sample-usdt-2026-10-03',
    isPreviewSample: true,
    type: 'Send',
    asset: 'USDT',
    amount: 250.0,
    dateStr: '2026-10-03',
    timeStr: '12:45:00',
    monthKey: '2026-10',
    monthLabel: 'October 2026',
    networkLabel: 'BNB Smart Chain',
    chainBadge: 'BSC',
    badgeColor: '#F0B90B',
    sampleStatus: 'Completed',
    previewIndicator: 'Completed',
    explanation: 'USDT sent on BNB Smart Chain (BEP20).',
  },

  // September 2026
  {
    id: 'sample-usdt-2026-09-27',
    isPreviewSample: true,
    type: 'Receive',
    asset: 'USDT',
    amount: 1580.4,
    dateStr: '2026-09-27',
    timeStr: '14:50:12',
    monthKey: '2026-09',
    monthLabel: 'September 2026',
    networkLabel: 'BNB Smart Chain',
    chainBadge: 'BSC',
    badgeColor: '#F0B90B',
    sampleStatus: 'Completed',
    previewIndicator: 'Completed',
    explanation: 'USDT received on BNB Smart Chain (BEP20).',
  },
  {
    id: 'sample-usdt-2026-09-19',
    isPreviewSample: true,
    type: 'Send',
    asset: 'USDT',
    amount: 450.0,
    dateStr: '2026-09-19',
    timeStr: '18:30:45',
    monthKey: '2026-09',
    monthLabel: 'September 2026',
    networkLabel: 'Solana',
    chainBadge: 'SOL',
    badgeColor: '#14F195',
    sampleStatus: 'Completed',
    previewIndicator: 'Completed',
    explanation: 'USDT sent to external wallet on Solana (SPL).',
  },
  {
    id: 'sample-usdt-2026-09-12',
    isPreviewSample: true,
    type: 'Receive',
    asset: 'USDT',
    amount: 725.6,
    dateStr: '2026-09-12',
    timeStr: '10:21:39',
    monthKey: '2026-09',
    monthLabel: 'September 2026',
    networkLabel: 'Solana',
    chainBadge: 'SOL',
    badgeColor: '#14F195',
    sampleStatus: 'Completed',
    previewIndicator: 'Completed',
    explanation: 'USDT received on Solana (SPL).',
  },
  {
    id: 'sample-usdt-2026-09-05',
    isPreviewSample: true,
    type: 'Send',
    asset: 'USDT',
    amount: 500.0,
    dateStr: '2026-09-05',
    timeStr: '16:10:20',
    monthKey: '2026-09',
    monthLabel: 'September 2026',
    networkLabel: 'BNB Smart Chain',
    chainBadge: 'BSC',
    badgeColor: '#F0B90B',
    sampleStatus: 'Completed',
    previewIndicator: 'Completed',
    explanation: 'USDT sent on BNB Smart Chain (BEP20).',
  },

  // August 2026
  {
    id: 'sample-usdt-2026-08-29',
    isPreviewSample: true,
    type: 'Receive',
    asset: 'USDT',
    amount: 1110.35,
    dateStr: '2026-08-29',
    timeStr: '17:19:44',
    monthKey: '2026-08',
    monthLabel: 'August 2026',
    networkLabel: 'BNB Smart Chain',
    chainBadge: 'BSC',
    badgeColor: '#F0B90B',
    sampleStatus: 'Completed',
    previewIndicator: 'Completed',
    explanation: 'USDT received on BNB Smart Chain (BEP20).',
  },
  {
    id: 'sample-usdt-2026-08-21',
    isPreviewSample: true,
    type: 'Send',
    asset: 'USDT',
    amount: 380.0,
    dateStr: '2026-08-21',
    timeStr: '11:40:15',
    monthKey: '2026-08',
    monthLabel: 'August 2026',
    networkLabel: 'opBNB',
    chainBadge: 'opBNB',
    badgeColor: '#F0B90B',
    sampleStatus: 'Completed',
    previewIndicator: 'Completed',
    explanation: 'USDT sent on opBNB network.',
  },
  {
    id: 'sample-usdt-2026-08-14',
    isPreviewSample: true,
    type: 'Receive',
    asset: 'USDT',
    amount: 945.9,
    dateStr: '2026-08-14',
    timeStr: '13:05:22',
    monthKey: '2026-08',
    monthLabel: 'August 2026',
    networkLabel: 'opBNB',
    chainBadge: 'opBNB',
    badgeColor: '#F0B90B',
    sampleStatus: 'Completed',
    previewIndicator: 'Completed',
    explanation: 'USDT received on opBNB network.',
  },
  {
    id: 'sample-usdt-2026-08-08',
    isPreviewSample: true,
    type: 'Send',
    asset: 'USDT',
    amount: 720.0,
    dateStr: '2026-08-08',
    timeStr: '09:15:30',
    monthKey: '2026-08',
    monthLabel: 'August 2026',
    networkLabel: 'BNB Smart Chain',
    chainBadge: 'BSC',
    badgeColor: '#F0B90B',
    sampleStatus: 'Completed',
    previewIndicator: 'Completed',
    explanation: 'USDT sent on BNB Smart Chain (BEP20).',
  },

  // July 2026
  {
    id: 'sample-usdt-2026-07-22',
    isPreviewSample: true,
    type: 'Receive',
    asset: 'USDT',
    amount: 1285.1,
    dateStr: '2026-07-22',
    timeStr: '20:41:09',
    monthKey: '2026-07',
    monthLabel: 'July 2026',
    networkLabel: 'BNB Smart Chain',
    chainBadge: 'BSC',
    badgeColor: '#F0B90B',
    sampleStatus: 'Completed',
    previewIndicator: 'Completed',
    explanation: 'USDT received on BNB Smart Chain (BEP20).',
  },
  {
    id: 'sample-usdt-2026-07-14',
    isPreviewSample: true,
    type: 'Send',
    asset: 'USDT',
    amount: 400.0,
    dateStr: '2026-07-14',
    timeStr: '16:05:50',
    monthKey: '2026-07',
    monthLabel: 'July 2026',
    networkLabel: 'Ethereum',
    chainBadge: 'ETH',
    badgeColor: '#627EEA',
    sampleStatus: 'Completed',
    previewIndicator: 'Completed',
    explanation: 'USDT sent to external wallet on Ethereum (ERC20).',
  },
  {
    id: 'sample-usdt-2026-07-05',
    isPreviewSample: true,
    type: 'Receive',
    asset: 'USDT',
    amount: 540.76,
    dateStr: '2026-07-05',
    timeStr: '08:12:55',
    monthKey: '2026-07',
    monthLabel: 'July 2026',
    networkLabel: 'Ethereum',
    chainBadge: 'ETH',
    badgeColor: '#627EEA',
    sampleStatus: 'Completed',
    previewIndicator: 'Completed',
    explanation: 'USDT received on Ethereum (ERC20).',
  },
  {
    id: 'sample-usdt-2026-07-01',
    isPreviewSample: true,
    type: 'Send',
    asset: 'USDT',
    amount: 300.0,
    dateStr: '2026-07-01',
    timeStr: '13:20:10',
    monthKey: '2026-07',
    monthLabel: 'July 2026',
    networkLabel: 'BNB Smart Chain',
    chainBadge: 'BSC',
    badgeColor: '#F0B90B',
    sampleStatus: 'Completed',
    previewIndicator: 'Completed',
    explanation: 'USDT sent on BNB Smart Chain (BEP20).',
  },

  // June 2026
  {
    id: 'sample-usdt-2026-06-25',
    isPreviewSample: true,
    type: 'Send',
    asset: 'USDT',
    amount: 200.0,
    dateStr: '2026-06-25',
    timeStr: '17:35:40',
    monthKey: '2026-06',
    monthLabel: 'June 2026',
    networkLabel: 'BNB Smart Chain',
    chainBadge: 'BSC',
    badgeColor: '#F0B90B',
    sampleStatus: 'Completed',
    previewIndicator: 'Completed',
    explanation: 'USDT sent on BNB Smart Chain (BEP20).',
  },
  {
    id: 'sample-usdt-2026-06-19',
    isPreviewSample: true,
    type: 'Receive',
    asset: 'USDT',
    amount: 618.0,
    dateStr: '2026-06-19',
    timeStr: '15:27:31',
    monthKey: '2026-06',
    monthLabel: 'June 2026',
    networkLabel: 'BNB Smart Chain',
    chainBadge: 'BSC',
    badgeColor: '#F0B90B',
    sampleStatus: 'Completed',
    previewIndicator: 'Completed',
    explanation: 'USDT received on BNB Smart Chain (BEP20).',
  },
  {
    id: 'sample-usdt-2026-06-10',
    isPreviewSample: true,
    type: 'Send',
    asset: 'USDT',
    amount: 150.0,
    dateStr: '2026-06-10',
    timeStr: '11:50:18',
    monthKey: '2026-06',
    monthLabel: 'June 2026',
    networkLabel: 'BNB Smart Chain',
    chainBadge: 'BSC',
    badgeColor: '#F0B90B',
    sampleStatus: 'Completed',
    previewIndicator: 'Completed',
    explanation: 'USDT sent on BNB Smart Chain (BEP20).',
  },
  {
    id: 'sample-usdt-2026-06-03',
    isPreviewSample: true,
    type: 'Receive',
    asset: 'USDT',
    amount: 430.0,
    dateStr: '2026-06-03',
    timeStr: '12:04:16',
    monthKey: '2026-06',
    monthLabel: 'June 2026',
    networkLabel: 'BNB Smart Chain',
    chainBadge: 'BSC',
    badgeColor: '#F0B90B',
    sampleStatus: 'Completed',
    previewIndicator: 'Completed',
    explanation: 'USDT received on BNB Smart Chain (BEP20).',
  },
];

// ============================================================================
// 3. REFERENCE ON-CHAIN DISCOVERY CATALOG & PROMO SLIDES
// ============================================================================
export interface ReferenceOnChainToken {
  symbol: string;
  name: string;
  chain: string;
  chainBadge: 'BSC' | 'SOL' | 'ETH' | 'ARB' | 'BASE';
  badgeColor: string;
  address: string;
  priceInr: string;
  priceUsd: number;
  change24h: number;
  volInr: string;
  mcapInr: string;
  category: 'Trending' | 'Alpha' | 'Stocks' | 'Perps' | 'Memes';
  multiplier: string | null;
}

export const REFERENCE_WALLET_TOKENS: ReferenceOnChainToken[] = [
  {
    symbol: 'FLOAT',
    name: 'Float Protocol',
    chain: 'Solana',
    chainBadge: 'SOL',
    badgeColor: '#9945FF',
    address: 'So11111111111111111111111111111111111111112',
    priceInr: '₹1.16458',
    priceUsd: 0.0124,
    change24h: 5.47,
    volInr: '₹122.39M',
    mcapInr: '₹1.03B',
    category: 'Trending',
    multiplier: null,
  },
  {
    symbol: 'GTA6',
    name: 'GTA6 Meme Index',
    chain: 'Solana',
    chainBadge: 'SOL',
    badgeColor: '#9945FF',
    address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    priceInr: '₹1.10918',
    priceUsd: 0.0118,
    change24h: -13.87,
    volInr: '₹29.61M',
    mcapInr: '₹1.08B',
    category: 'Trending',
    multiplier: null,
  },
  {
    symbol: 'STONK',
    name: 'BNB Stonks Index',
    chain: 'BNB Smart Chain',
    chainBadge: 'BSC',
    badgeColor: '#F0B90B',
    address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    priceInr: '₹6.72484',
    priceUsd: 0.0716,
    change24h: 7.22,
    volInr: '₹141.21M',
    mcapInr: '₹5.24B',
    category: 'Stocks',
    multiplier: '10x',
  },
  {
    symbol: 'PONS',
    name: 'Pons Alpha',
    chain: 'Solana',
    chainBadge: 'SOL',
    badgeColor: '#9945FF',
    address: '2zMMhcVQEXDtdE6vsFS7S7D5oUodfJHE8vd1gnBouauv',
    priceInr: '₹16.05',
    priceUsd: 0.1709,
    change24h: -3.28,
    volInr: '₹44.54M',
    mcapInr: '₹10.79B',
    category: 'Alpha',
    multiplier: '20x',
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    chain: 'Solana',
    chainBadge: 'SOL',
    badgeColor: '#14F195',
    address: 'So11111111111111111111111111111111111111112',
    priceInr: '₹8,372.99',
    priceUsd: 89.16,
    change24h: 0.16,
    volInr: '₹72.86M',
    mcapInr: '₹2.56B',
    category: 'Trending',
    multiplier: null,
  },
  {
    symbol: 'HYPE',
    name: 'Hyperliquid Perp',
    chain: 'Arbitrum One',
    chainBadge: 'ARB',
    badgeColor: '#28A0F0',
    address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    priceInr: '₹2,334.10',
    priceUsd: 24.85,
    change24h: 14.42,
    volInr: '₹412.50M',
    mcapInr: '₹8.30B',
    category: 'Perps',
    multiplier: '20x',
  },
  {
    symbol: 'AKE',
    name: 'AKE Alpha Protocol',
    chain: 'Base',
    chainBadge: 'BASE',
    badgeColor: '#0052FF',
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    priceInr: '₹3.927',
    priceUsd: 0.04182,
    change24h: 64.18,
    volInr: '₹19.40M',
    mcapInr: '₹41.80M',
    category: 'Alpha',
    multiplier: null,
  },
];

export const REFERENCE_LOW_VALUE_ASSETS = [
  {
    key: 'low-bnb-native',
    symbol: 'BNB',
    name: 'BNB',
    chainBadge: 'BSC',
    isNative: true,
    apyTag: 'Up to 1.57% APY',
    priceInr: '₹65,406.13',
    change24h: 0.11,
    balance: 0,
    valueInr: '₹0',
  },
  {
    key: 'low-eth-bsc',
    symbol: 'ETH',
    name: 'Ethereum (BSC)',
    chainBadge: 'BSC',
    isNative: false,
    apyTag: 'Up to 3.28% APY',
    priceInr: '₹209,510.02',
    change24h: -0.38,
    balance: 0,
    valueInr: '₹0',
  },
  {
    key: 'low-eth-native',
    symbol: 'ETH',
    name: 'Ethereum',
    chainBadge: 'ETH',
    isNative: true,
    apyTag: 'Up to 0.67% APY',
    priceInr: '₹210,055.91',
    change24h: -0.12,
    balance: 0,
    valueInr: '₹0',
  },
  {
    key: 'low-sol-native',
    symbol: 'SOL',
    name: 'Solana',
    chainBadge: 'SOL',
    isNative: true,
    apyTag: 'Up to 5.09% APY',
    priceInr: '₹8,376.46',
    change24h: -1.61,
    balance: 0,
    valueInr: '₹0',
  },
  {
    key: 'low-usdc-bsc',
    symbol: 'USDC',
    name: 'USD Coin',
    chainBadge: 'BSC',
    isNative: false,
    apyTag: 'Up to 20.06% APY',
    priceInr: '₹93.89',
    change24h: 0.02,
    balance: 0,
    valueInr: '₹0',
  },
];

export const REFERENCE_PROMO_SLIDES = [
  {
    id: 'safu-security',
    title: 'Staying SAFU in NexusTrade Wallet',
    cta: 'Learn How Now!',
    badgeType: 'shield' as const,
  },
  {
    id: 'agent-id',
    title: 'Claim your unique Agent ID! First come, first served',
    cta: 'Claim now',
    badgeType: 'ai' as const,
  },
  {
    id: 'tron-s3',
    title: 'Grab a share of $2M rewards in TRON Carnival Season 3',
    cta: 'Join Now',
    badgeType: 'tron' as const,
  },
  {
    id: 'kamino-usdc',
    title: 'Subscribe USDC to share $150k rewards with Kamino',
    cta: 'Join Now',
    badgeType: 'kamino' as const,
  },
];

export const KeylessWalletAvatar: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'sm' }) => {
  const dim = size === 'md' ? 'w-7 h-7 rounded-lg' : 'w-5 h-5 rounded-md';
  return (
    <span
      className={`${dim} bg-[#1E2C3A] text-[#3B82F6] inline-flex items-center justify-center shrink-0`}
    >
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
        <path d="M13.13 22.19L11.5 18.36C13.07 17.78 14.54 17 15.9 16.09L13.13 22.19M5.64 12.5L1.81 10.87L7.91 8.1C7 9.46 6.22 10.93 5.64 12.5M21.61 2.39C21.61 2.39 16.66 .269 11 5.93C8.81 8.12 7.5 10.53 6.65 12.64C6.37 13.39 6.56 14.21 7.11 14.77L9.24 16.89C9.79 17.45 10.61 17.63 11.36 17.35C13.5 16.53 15.88 15.19 18.07 13C23.73 7.34 21.61 2.39 21.61 2.39M14.54 9.46C13.76 8.68 13.76 7.42 14.54 6.64C15.32 5.86 16.58 5.86 17.36 6.64C18.14 7.42 18.14 8.68 17.36 9.46C16.58 10.24 15.32 10.24 14.54 9.46Z" />
      </svg>
    </span>
  );
};

export const KeylessCheckBadge: React.FC = () => (
  <span
    className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-[#0ECB81]/15 text-[#0ECB81] shrink-0"
    title="Keyless MPC Security"
  >
    <svg viewBox="0 0 20 20" className="w-4 h-4 fill-current">
      <path d="M11.2 1.8L4.5 10.6h4.6l-.9 7.6 6.8-8.8h-4.6l.8-7.6z" />
      <circle cx="14.8" cy="14.8" r="4.2" fill="#181A20" />
      <circle cx="14.8" cy="14.8" r="3.4" fill="#0ECB81" />
      <path
        d="M13.3 14.8l1 1 2.1-2.1"
        fill="none"
        stroke="#181A20"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
);

interface FloatingDiamondProps {
  onNavigateSubScreen: (
    sub:
      | 'main'
      | 'usdt_detail'
      | 'portfolio'
      | 'send'
      | 'receive'
      | 'history'
      | 'approvals'
      | 'settings'
      | 'my_wallets'
      | 'networks'
  ) => void;
  onNavigateTab: (tab: 'home' | 'markets' | 'trade' | 'discover' | 'assets') => void;
  activeValuationMode: WalletValuationSourceMode;
  onSelectValuationMode: (mode: WalletValuationSourceMode) => void;
  isWalletActive: boolean;
  valuation: LivePortfolioValuation;
}

export const WalletFloatingDiamond: React.FC<FloatingDiamondProps> = ({
  onNavigateSubScreen,
  onNavigateTab,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Persistent Floating Yellow Diamond Shortcut (Reference 00:11 - 01:39) */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="NexusTrade Wallet Quick Hub"
        style={{
          right: '10px',
          bottom: 'calc(88px + env(safe-area-inset-bottom, 0px))',
        }}
        className="fixed z-[45] w-[30px] h-[30px] rotate-45 rounded-[7px] bg-gradient-to-br from-[#FCD535] via-[#F0B90B] to-[#D99B00] shadow-[0_4px_14px_rgba(240,185,11,0.38)] border border-[#FFF5CC]/45 flex items-center justify-center active:scale-90 hover:scale-105 transition-transform duration-150 cursor-pointer"
      >
        <div className="-rotate-45 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#181A20]">
            <path d="M12 2L15.2 8.8L22 12L15.2 15.2L12 22L8.8 15.2L2 12L8.8 8.8L12 2ZM12 9.2L9.2 12L12 14.8L14.8 12L12 9.2Z" />
          </svg>
        </div>
      </button>

      {/* Clean Quick Shortcut Sheet (Matches Reference 01:11 - 01:17 without developer clutter) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-[2px] flex items-end justify-center"
          onClick={() => setIsOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[430px] bg-[#1E2329] rounded-t-3xl border-t border-[#2B3139] p-5 pb-8 space-y-4 animate-in slide-in-from-bottom duration-200 max-h-[85vh] overflow-y-auto"
          >
            <div className="w-9 h-1 rounded-full bg-[#474D57] mx-auto -mt-1 mb-1" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rotate-45 rounded-md bg-[#FCD535] flex items-center justify-center">
                  <Sparkles size={13} className="-rotate-45 text-[#181A20]" />
                </div>
                <h3 className="text-[16px] font-bold text-[#EAECEF]">NexusTrade Shortcuts</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full bg-[#2B3139] text-[#848E9C] hover:text-[#EAECEF]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2">
              {[
                {
                  label: 'How do I deposit to NexusTrade?',
                  icon: <ArrowDownLeft size={15} className="text-[#0ECB81]" />,
                  action: () => {
                    onNavigateTab('assets');
                    onNavigateSubScreen('receive');
                    setIsOpen(false);
                  },
                },
                {
                  label: "What are today's crypto market opportunities?",
                  icon: <Sparkles size={15} className="text-[#F0B90B]" />,
                  action: () => {
                    onNavigateTab('markets');
                    onNavigateSubScreen('main');
                    setIsOpen(false);
                  },
                },
                {
                  label: 'View USDT holdings & Simple Yield APY',
                  icon: <CheckCircle2 size={15} className="text-[#0ECB81]" />,
                  action: () => {
                    onNavigateTab('assets');
                    onNavigateSubScreen('usdt_detail');
                    setIsOpen(false);
                  },
                },
                {
                  label: 'Inspect recent wallet transaction history',
                  icon: <History size={15} className="text-[#EAECEF]" />,
                  action: () => {
                    onNavigateTab('assets');
                    onNavigateSubScreen('history');
                    setIsOpen(false);
                  },
                },
                {
                  label: 'Manage token approvals & wallet security',
                  icon: <ShieldCheck size={15} className="text-[#F0B90B]" />,
                  action: () => {
                    onNavigateTab('assets');
                    onNavigateSubScreen('approvals');
                    setIsOpen(false);
                  },
                },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.action}
                  className="w-full px-3.5 py-3 rounded-xl bg-[#202630] hover:bg-[#2B3139] flex items-center justify-between text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span className="text-[13px] font-medium text-[#EAECEF]">{item.label}</span>
                  </div>
                  <ChevronRight size={14} className="text-[#848E9C] shrink-0" />
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1 overflow-x-auto no-scrollbar">
              {[
                {
                  label: 'Trade',
                  icon: <ArrowLeftRight size={13} />,
                  action: () => {
                    onNavigateTab('trade');
                    onNavigateSubScreen('main');
                    setIsOpen(false);
                  },
                },
                {
                  label: 'Portfolio',
                  icon: <PieChart size={13} />,
                  action: () => {
                    onNavigateTab('assets');
                    onNavigateSubScreen('portfolio');
                    setIsOpen(false);
                  },
                },
                {
                  label: 'Wallets',
                  icon: <Wallet size={13} />,
                  action: () => {
                    onNavigateTab('assets');
                    onNavigateSubScreen('my_wallets');
                    setIsOpen(false);
                  },
                },
                {
                  label: 'Settings',
                  icon: <Settings size={13} />,
                  action: () => {
                    onNavigateTab('assets');
                    onNavigateSubScreen('settings');
                    setIsOpen(false);
                  },
                },
              ].map((pill) => (
                <button
                  key={pill.label}
                  type="button"
                  onClick={pill.action}
                  className="px-3 py-1.5 rounded-lg bg-[#202630] hover:bg-[#2B3139] text-[12px] font-medium text-[#EAECEF] flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  {pill.icon}
                  <span>{pill.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
