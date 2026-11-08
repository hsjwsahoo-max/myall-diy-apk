import React from 'react';
import { TRACKED_COINS } from '../services/marketService';
import {
  MarketDataProvenance,
  SupportedFiat,
  SupportedNetworkInfo,
} from '../types/exchange';

const ASSET_COLORS: Record<string, string> = {
  USDT: '#26A17B',
  USDC: '#2775CA',
  BTC: '#F7931A',
  ETH: '#627EEA',
  BNB: '#F3BA2F',
  SOL: '#14F195',
  XRP: '#23292F',
  DOGE: '#C2A633',
  TRUMP: '#E84142',
  ADA: '#0033AD',
  TRX: '#FF0013',
  AVAX: '#E84142',
  LINK: '#2A5ADA',
  SUI: '#4DA2FF',
  ZEC: '#F4B728',
  UNI: '#FF007A',
  AAVE: '#B6509E',
  PEPE: '#4C9540',
  NEAR: '#00EC97',
  RENDER: '#E91E63',
  JUP: '#19FB9B',
  KMNO: '#38BDF8',
  AAPL: '#555555',
  NVDA: '#76B900',
  MU: '#0072CE',
  TSLA: '#CC0000',
  MSFT: '#00A4EF',
  AMZN: '#FF9900',
  AMD: '#ED1C24',
  SNDK: '#E11D48',
  SPCX: '#6366F1',
  MSTR: '#D97706',
  GOOGL: '#4285F4',
  META: '#0668E1',
  HOOD: '#10B981',
  INTC: '#0068B5',
  PLTR: '#334155',
  ASML: '#0F172A',
  GLD: '#EAB308',
  SLV: '#94A3B8',
  SPY: '#16A34A',
  QQQ: '#2563EB',
  IAU: '#CA8A04',
  GDX: '#B45309',
};

export const USDT_SUPPORTED_NETWORKS: SupportedNetworkInfo[] = [
  {
    id: 'TRC20',
    name: 'Tron (TRC20)',
    standard: 'TRC-20',
    confirmations: '1 confirmation',
    estimatedArrival: '≈ 1 min',
    minDeposit: '1.00 USDT',
    withdrawFee: '1.00 USDT',
    status: 'Active',
  },
  {
    id: 'ERC20',
    name: 'Ethereum (ERC20)',
    standard: 'ERC-20',
    confirmations: '6 confirmations',
    estimatedArrival: '≈ 2 mins',
    minDeposit: '1.00 USDT',
    withdrawFee: '3.20 USDT',
    status: 'Active',
  },
  {
    id: 'BEP20',
    name: 'BNB Smart Chain (BEP20)',
    standard: 'BEP-20',
    confirmations: '15 confirmations',
    estimatedArrival: '≈ 1 min',
    minDeposit: '0.01 USDT',
    withdrawFee: '0.19 USDT',
    status: 'Active',
  },
  {
    id: 'SOL',
    name: 'Solana (SPL)',
    standard: 'SPL',
    confirmations: '32 confirmations',
    estimatedArrival: '≈ 30 secs',
    minDeposit: '0.10 USDT',
    withdrawFee: '0.80 USDT',
    status: 'Active',
  },
  {
    id: 'ARBITRUM',
    name: 'Arbitrum One',
    standard: 'ERC-20 (L2)',
    confirmations: '12 confirmations',
    estimatedArrival: '≈ 1 min',
    minDeposit: '0.10 USDT',
    withdrawFee: '0.15 USDT',
    status: 'Active',
  },
  {
    id: 'POLYGON',
    name: 'Polygon POS',
    standard: 'ERC-20 (POS)',
    confirmations: '30 confirmations',
    estimatedArrival: '≈ 2 mins',
    minDeposit: '0.10 USDT',
    withdrawFee: '0.15 USDT',
    status: 'Active',
  },
];

export const FIAT_RATES: Record<SupportedFiat, { symbol: string; rate: number; locale: string }> = {
  USD: { symbol: '$', rate: 1, locale: 'en-US' },
  INR: { symbol: '₹', rate: 86.48, locale: 'en-IN' },
  AED: { symbol: 'AED ', rate: 3.6725, locale: 'en-US' },
  EUR: { symbol: '€', rate: 0.924, locale: 'en-US' },
  GBP: { symbol: '£', rate: 0.789, locale: 'en-US' },
};

export function updateLiveFiatRates(newRates: Partial<Record<SupportedFiat, number>>) {
  (Object.keys(newRates) as SupportedFiat[]).forEach((code) => {
    const val = Number(newRates[code]);
    if (FIAT_RATES[code] && Number.isFinite(val) && val > 0) {
      FIAT_RATES[code].rate = val;
    }
  });
}

export function formatPrice(price: number, decimals?: number, locale = 'en-US'): string {
  if (!Number.isFinite(price)) return '0.00';
  if (decimals !== undefined) {
    return price.toLocaleString(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }
  if (price >= 1000) {
    return price.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  if (price >= 0.98 && price <= 1.02) {
    return price.toLocaleString(locale, { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  }
  if (price >= 1) {
    return price.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  }
  if (price >= 0.01) {
    return price.toLocaleString(locale, { minimumFractionDigits: 4, maximumFractionDigits: 5 });
  }
  return price.toLocaleString(locale, { minimumFractionDigits: 6, maximumFractionDigits: 8 });
}

export function formatCompactNumber(num: number): string {
  if (!Number.isFinite(num)) return '0.00';
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`;
  return num.toFixed(2);
}

/**
 * Formats a USD value (already multiplied by live USDT/USD price when applicable) into the user's display currency.
 * Automatically uses Indian numbering system (en-IN: 15,91,684.05) when INR is selected.
 */
export function formatFiat(usdAmount: number, fiat: SupportedFiat): string {
  const info = FIAT_RATES[fiat] || FIAT_RATES.USD;
  const converted = (Number.isFinite(usdAmount) ? usdAmount : 0) * info.rate;
  const locale = fiat === 'INR' ? 'en-IN' : info.locale || 'en-US';
  return `${info.symbol}${converted.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Formats a USDT portfolio amount into any selected primary denomination (USDT, USD, INR, EUR, AED, GBP)
 * together with its secondary equivalent string.
 */
export function formatPortfolioValuation(
  usdtAmount: number,
  liveUsdtUsdPrice: number,
  primaryDenom: 'USDT' | SupportedFiat = 'USDT',
  secondaryFiat: SupportedFiat = 'USD'
): {
  primaryFormatted: string;
  primaryNumberOnly: string;
  primaryUnit: string;
  secondaryFormatted: string;
} {
  const safeUsdt = Number.isFinite(usdtAmount) ? usdtAmount : 0;
  const safeUsdtRate = Number.isFinite(liveUsdtUsdPrice) && liveUsdtUsdPrice > 0 ? liveUsdtUsdPrice : 1;
  const usdValue = safeUsdt * safeUsdtRate;

  if (primaryDenom === 'USDT') {
    const numStr = safeUsdt.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return {
      primaryFormatted: `${numStr} USDT`,
      primaryNumberOnly: numStr,
      primaryUnit: 'USDT',
      secondaryFormatted: formatFiat(usdValue, secondaryFiat),
    };
  }

  const fiatInfo = FIAT_RATES[primaryDenom] || FIAT_RATES.USD;
  const convertedPrimary = usdValue * fiatInfo.rate;
  const locale = primaryDenom === 'INR' ? 'en-IN' : 'en-US';
  const primaryNumStr = convertedPrimary.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // When primary is a fiat currency, secondary shows exact USDT equivalent (or USD if different)
  const secondaryStr = `${safeUsdt.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} USDT`;

  return {
    primaryFormatted: `${fiatInfo.symbol}${primaryNumStr}`,
    primaryNumberOnly: `${fiatInfo.symbol}${primaryNumStr}`,
    primaryUnit: primaryDenom,
    secondaryFormatted: secondaryStr,
  };
}

export const CoinIcon: React.FC<{ asset: string; size?: 'xs' | 'sm' | 'md' | 'lg' }> = ({
  asset,
  size = 'md',
}) => {
  const cleanAsset =
    asset === 'USDTUSD'
      ? 'USDT'
      : asset.replace(/USDT$/, '') || asset;
  const tracked = TRACKED_COINS.find((c) => c.baseAsset === cleanAsset);
  const bg = ASSET_COLORS[cleanAsset] || tracked?.color || '#FCD535';

  const sizeClass =
    size === 'xs'
      ? 'w-4 h-4 text-[9px]'
      : size === 'sm'
      ? 'w-5 h-5 text-[10px]'
      : size === 'lg'
      ? 'w-9 h-9 text-sm'
      : 'w-7 h-7 text-xs';

  // Official-style Tether (₮) emblem for USDT
  if (cleanAsset === 'USDT') {
    return (
      <div
        className={`${sizeClass} rounded-full flex items-center justify-center shrink-0 shadow-xs select-none relative overflow-hidden`}
        style={{ backgroundColor: '#26A17B' }}
        title="TetherUS (USDT)"
      >
        <svg
          viewBox="0 0 32 32"
          className="w-[72%] h-[72%] fill-white"
          aria-hidden="true"
        >
          <path d="M17.922 17.383v-.002c-.11.008-.677.042-1.942.042-1.01 0-1.721-.03-1.971-.042v.003c-3.888-.171-6.79-.848-6.79-1.658 0-.809 2.902-1.486 6.79-1.66v2.644c.254.018.982.061 1.988.061 1.207 0 1.812-.05 1.925-.06v-2.643c3.88.173 6.775.85 6.775 1.658 0 .81-2.895 1.485-6.775 1.657m0-3.59v-2.366h5.414V7.819H8.595v3.608h5.414v2.365c-4.4.202-7.709 1.074-7.709 2.118 0 1.044 3.309 1.915 7.709 2.118v7.582h3.913v-7.584c4.393-.202 7.694-1.073 7.694-2.116 0-1.043-3.301-1.914-7.694-2.117" />
        </svg>
      </div>
    );
  }

  if (cleanAsset === 'BTC') {
    return (
      <div
        className={`${sizeClass} rounded-full flex items-center justify-center font-extrabold text-white shrink-0 shadow-xs select-none`}
        style={{ backgroundColor: '#F7931A' }}
        aria-hidden="true"
      >
        ₿
      </div>
    );
  }

  if (cleanAsset === 'ETH') {
    return (
      <div
        className={`${sizeClass} rounded-full flex items-center justify-center font-extrabold text-white shrink-0 shadow-xs select-none`}
        style={{ backgroundColor: '#627EEA' }}
        aria-hidden="true"
      >
        Ξ
      </div>
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center font-bold text-white shrink-0 shadow-xs select-none`}
      style={{ backgroundColor: bg }}
      aria-hidden="true"
    >
      {cleanAsset.slice(0, 3)}
    </div>
  );
};

export const MarketProvenanceBadge: React.FC<{
  provenance?: MarketDataProvenance;
  source?: string;
  compact?: boolean;
}> = ({ provenance = 'unavailable', source, compact = false }) => {
  const meta: Record<
    MarketDataProvenance,
    { label: string; shortLabel: string; className: string }
  > = {
    live_ws: {
      label: 'LIVE WS',
      shortLabel: 'LIVE',
      className: 'bg-[#0ECB81]/15 text-[#0ECB81] border-[#0ECB81]/30',
    },
    live_rest: {
      label: 'LIVE REST',
      shortLabel: 'REST',
      className: 'bg-[#FCD535]/15 text-[#FCD535] border-[#FCD535]/30',
    },
    delayed: {
      label: 'DELAYED',
      shortLabel: 'DELAYED',
      className: 'bg-[#F0B90B]/15 text-[#F0B90B] border-[#F0B90B]/30',
    },
    reference: {
      label: 'REFERENCE DATA',
      shortLabel: 'REF',
      className: 'bg-slate-200 dark:bg-[#2B3139] text-slate-600 dark:text-[#848E9C] border-slate-300 dark:border-[#474D57]',
    },
    unavailable: {
      label: 'UNAVAILABLE',
      shortLabel: 'SYNCING',
      className: 'bg-[#F6465D]/15 text-[#F6465D] border-[#F6465D]/30',
    },
  };

  const current = meta[provenance] || meta.unavailable;
  return (
    <span
      title={source || current.label}
      className={`inline-flex items-center px-1.5 py-0.5 rounded border font-mono text-[9px] font-bold tracking-tight shrink-0 ${current.className}`}
    >
      {compact ? current.shortLabel : current.label}
    </span>
  );
};

