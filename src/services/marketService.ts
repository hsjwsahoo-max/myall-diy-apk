import {
  CandleData,
  ConnectionStatus,
  KlineInterval,
  MarketDataProvenance,
  MarketTicker,
  OrderBookData,
  OrderBookEntry,
  TradeExecution,
} from '../types/exchange';

export interface CoinMeta {
  symbol: string;
  binanceSymbol: string;
  invertPrice?: boolean;
  baseAsset: string;
  quoteAsset: string;
  name: string;
  circulatingSupply: number;
  category: MarketTicker['category'];
  leverageTag?: string;
  color: string;
  isNewListing?: boolean;
}

export const TRACKED_COINS: CoinMeta[] = [
  {
    symbol: 'USDTUSD',
    binanceSymbol: 'USDCUSDT',
    invertPrice: true,
    baseAsset: 'USDT',
    quoteAsset: 'USD',
    name: 'TetherUS',
    circulatingSupply: 138500000000,
    category: 'Stablecoin',
    color: '#26A17B',
  },
  { symbol: 'BTCUSDT', binanceSymbol: 'BTCUSDT', baseAsset: 'BTC', quoteAsset: 'USDT', name: 'Bitcoin', circulatingSupply: 19820000, category: 'Layer 1', leverageTag: '10x', color: '#F7931A' },
  { symbol: 'ETHUSDT', binanceSymbol: 'ETHUSDT', baseAsset: 'ETH', quoteAsset: 'USDT', name: 'Ethereum', circulatingSupply: 120500000, category: 'Layer 1', leverageTag: '10x', color: '#627EEA' },
  { symbol: 'BNBUSDT', binanceSymbol: 'BNBUSDT', baseAsset: 'BNB', quoteAsset: 'USDT', name: 'BNB', circulatingSupply: 144000000, category: 'Exchange', leverageTag: '10x', color: '#F3BA2F' },
  { symbol: 'SOLUSDT', binanceSymbol: 'SOLUSDT', baseAsset: 'SOL', quoteAsset: 'USDT', name: 'Solana', circulatingSupply: 488000000, category: 'Solana', leverageTag: '10x', color: '#14F195' },
  { symbol: 'USDCUSDT', binanceSymbol: 'USDCUSDT', baseAsset: 'USDC', quoteAsset: 'USDT', name: 'USD Coin', circulatingSupply: 56000000000, category: 'Stablecoin', color: '#2775CA' },
  { symbol: 'XRPUSDT', binanceSymbol: 'XRPUSDT', baseAsset: 'XRP', quoteAsset: 'USDT', name: 'XRP', circulatingSupply: 57800000000, category: 'Payments', leverageTag: '10x', color: '#23292F' },
  { symbol: 'DOGEUSDT', binanceSymbol: 'DOGEUSDT', baseAsset: 'DOGE', quoteAsset: 'USDT', name: 'Dogecoin', circulatingSupply: 148000000000, category: 'Meme', leverageTag: '5x', color: '#C2A633' },
  { symbol: 'TRUMPUSDT', binanceSymbol: 'TRUMPUSDT', baseAsset: 'TRUMP', quoteAsset: 'USDT', name: 'OFFICIAL TRUMP', circulatingSupply: 200000000, category: 'Meme', leverageTag: '5x', color: '#E84142', isNewListing: true },
  { symbol: 'ADAUSDT', binanceSymbol: 'ADAUSDT', baseAsset: 'ADA', quoteAsset: 'USDT', name: 'Cardano', circulatingSupply: 35900000000, category: 'Layer 1', leverageTag: '5x', color: '#0033AD' },
  { symbol: 'TRXUSDT', binanceSymbol: 'TRXUSDT', baseAsset: 'TRX', quoteAsset: 'USDT', name: 'TRON', circulatingSupply: 86100000000, category: 'Payments', leverageTag: '5x', color: '#FF0013' },
  { symbol: 'AVAXUSDT', binanceSymbol: 'AVAXUSDT', baseAsset: 'AVAX', quoteAsset: 'USDT', name: 'Avalanche', circulatingSupply: 412000000, category: 'Layer 1', leverageTag: '5x', color: '#E84142' },
  { symbol: 'LINKUSDT', binanceSymbol: 'LINKUSDT', baseAsset: 'LINK', quoteAsset: 'USDT', name: 'Chainlink', circulatingSupply: 638000000, category: 'DeFi', leverageTag: '5x', color: '#2A5ADA' },
  { symbol: 'SUIUSDT', binanceSymbol: 'SUIUSDT', baseAsset: 'SUI', quoteAsset: 'USDT', name: 'Sui', circulatingSupply: 3090000000, category: 'Layer 1', leverageTag: '5x', color: '#4DA2FF', isNewListing: true },
  { symbol: 'ZECUSDT', binanceSymbol: 'ZECUSDT', baseAsset: 'ZEC', quoteAsset: 'USDT', name: 'Zcash', circulatingSupply: 16300000, category: 'Payments', leverageTag: '5x', color: '#F4B728' },
  { symbol: 'UNIUSDT', binanceSymbol: 'UNIUSDT', baseAsset: 'UNI', quoteAsset: 'USDT', name: 'Uniswap', circulatingSupply: 600000000, category: 'DeFi', leverageTag: '5x', color: '#FF007A' },
  { symbol: 'AAVEUSDT', binanceSymbol: 'AAVEUSDT', baseAsset: 'AAVE', quoteAsset: 'USDT', name: 'Aave', circulatingSupply: 15000000, category: 'DeFi', leverageTag: '5x', color: '#B6509E' },
  { symbol: 'PEPEUSDT', binanceSymbol: 'PEPEUSDT', baseAsset: 'PEPE', quoteAsset: 'USDT', name: 'Pepe', circulatingSupply: 420690000000000, category: 'Meme', leverageTag: '5x', color: '#4C9540', isNewListing: true },
  { symbol: 'NEARUSDT', binanceSymbol: 'NEARUSDT', baseAsset: 'NEAR', quoteAsset: 'USDT', name: 'NEAR Protocol', circulatingSupply: 1180000000, category: 'AI', leverageTag: '5x', color: '#00EC97' },
  { symbol: 'RENDERUSDT', binanceSymbol: 'RENDERUSDT', baseAsset: 'RENDER', quoteAsset: 'USDT', name: 'Render', circulatingSupply: 517000000, category: 'AI', leverageTag: '5x', color: '#E91E63', isNewListing: true },
  { symbol: 'JUPUSDT', binanceSymbol: 'JUPUSDT', baseAsset: 'JUP', quoteAsset: 'USDT', name: 'Jupiter', circulatingSupply: 1350000000, category: 'Solana', leverageTag: '5x', color: '#19FB9B', isNewListing: true },
  { symbol: 'KMNOUSDT', binanceSymbol: 'KMNOUSDT', baseAsset: 'KMNO', quoteAsset: 'USDT', name: 'Kamino Finance', circulatingSupply: 1350000000, category: 'Solana', leverageTag: '5x', color: '#38BDF8', isNewListing: true },
];

const REST_ENDPOINTS = [
  'https://data-api.binance.vision/api/v3',
  'https://api.binance.com/api/v3',
  'https://api1.binance.com/api/v3',
];

const WS_ENDPOINTS = [
  'wss://data-stream.binance.vision/ws',
  'wss://stream.binance.com:9443/ws',
];

async function fetchBinanceJson<T>(path: string): Promise<T> {
  let lastError: unknown;
  for (const base of REST_ENDPOINTS) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 7000);
      const res = await fetch(`${base}${path}`, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return (await res.json()) as T;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error('All market data REST endpoints unreachable');
}

export interface MarketFeedDiagnostics {
  status: ConnectionStatus;
  activeWsEndpoint: string;
  lastWsMessageAt: number | null;
  lastRestSyncAt: number | null;
  lastKrakenSyncAt: number | null;
  reconnectAttempts: number;
  liveSymbolCount: number;
}

export class MarketDataService {
  private tickerWs: WebSocket | null = null;
  private pairWs: WebSocket | null = null;
  private wsEndpointIndex = 0;
  private reconnectAttempts = 0;
  private tickerReconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pairReconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private restPollTimer: ReturnType<typeof setInterval> | null = null;
  private watchdogTimer: ReturnType<typeof setInterval> | null = null;
  private isDestroyed = false;

  private currentStatus: ConnectionStatus = 'connecting';
  private lastWsMessageAt: number | null = null;
  private lastRestSyncAt: number | null = null;
  private lastKrakenSyncAt: number | null = null;

  private activeSymbol = 'USDTUSD';
  private activeInterval: KlineInterval = '15m';

  private onTickersCallback?: (tickers: Record<string, MarketTicker>, timestamp: number) => void;
  private onStatusCallback?: (status: ConnectionStatus) => void;
  private onOrderBookCallback?: (book: OrderBookData) => void;
  private onTradeCallback?: (trade: TradeExecution) => void;
  private onCandleCallback?: (candle: CandleData) => void;

  private tickersMap: Record<string, MarketTicker> = {};

  private emitStatus(status: ConnectionStatus) {
    this.currentStatus = status;
    this.onStatusCallback?.(status);
  }

  public getFeedDiagnostics(): MarketFeedDiagnostics {
    return {
      status: this.currentStatus,
      activeWsEndpoint: WS_ENDPOINTS[this.wsEndpointIndex % WS_ENDPOINTS.length],
      lastWsMessageAt: this.lastWsMessageAt,
      lastRestSyncAt: this.lastRestSyncAt,
      lastKrakenSyncAt: this.lastKrakenSyncAt,
      reconnectAttempts: this.reconnectAttempts,
      liveSymbolCount: Object.values(this.tickersMap).filter((t) => t.lastPrice > 0).length,
    };
  }

  public getTickers(): Record<string, MarketTicker> {
    return this.tickersMap;
  }

  public start(callbacks: {
    onTickers: (tickers: Record<string, MarketTicker>, timestamp: number) => void;
    onStatus: (status: ConnectionStatus) => void;
    onOrderBook: (book: OrderBookData) => void;
    onTrade: (trade: TradeExecution) => void;
    onCandle: (candle: CandleData) => void;
  }) {
    this.isDestroyed = false;
    this.onTickersCallback = callbacks.onTickers;
    this.onStatusCallback = callbacks.onStatus;
    this.onOrderBookCallback = callbacks.onOrderBook;
    this.onTradeCallback = callbacks.onTrade;
    this.onCandleCallback = callbacks.onCandle;

    this.emitStatus('connecting');
    this.fetchInitialTickers();
    this.connectTickerStream();
    this.subscribeActivePair(this.activeSymbol, this.activeInterval);

    // Periodic REST sync fallback every 12s to guarantee fresh 24hr stats & Kraken USDT/USD direct check
    if (this.restPollTimer) clearInterval(this.restPollTimer);
    this.restPollTimer = setInterval(() => {
      this.fetchInitialTickers(true);
    }, 12000);

    // Watchdog every 5s to detect silent WebSocket stalls and enforce accurate dataProvenance
    if (this.watchdogTimer) clearInterval(this.watchdogTimer);
    this.watchdogTimer = setInterval(() => {
      if (this.isDestroyed) return;
      const now = Date.now();
      const wsSilenceMs = this.lastWsMessageAt ? now - this.lastWsMessageAt : Infinity;
      const restSilenceMs = this.lastRestSyncAt ? now - this.lastRestSyncAt : Infinity;

      if (this.tickerWs?.readyState === WebSocket.OPEN && wsSilenceMs > 18000) {
        // Silent WebSocket stall detected: switch to REST fallback & reconnect WebSocket
        this.emitStatus(restSilenceMs < 30000 ? 'rest_fallback' : 'stale');
        this.fetchInitialTickers(true);
        this.connectTickerStream();
      } else if (this.tickerWs?.readyState !== WebSocket.OPEN && restSilenceMs > 30000) {
        // Mark tickers as delayed if neither WS nor REST has updated in 30s
        let updatedAny = false;
        Object.keys(this.tickersMap).forEach((sym) => {
          const item = this.tickersMap[sym];
          if (item && item.dataProvenance !== 'delayed') {
            this.tickersMap[sym] = {
              ...item,
              dataProvenance: 'delayed',
              feedSource: 'Delayed Snapshot (Reconnecting...)',
            };
            updatedAny = true;
          }
        });
        if (updatedAny) {
          this.onTickersCallback?.({ ...this.tickersMap }, now);
        }
      }
    }, 5000);
  }

  public stop() {
    this.isDestroyed = true;
    if (this.tickerReconnectTimer) clearTimeout(this.tickerReconnectTimer);
    if (this.pairReconnectTimer) clearTimeout(this.pairReconnectTimer);
    if (this.restPollTimer) clearInterval(this.restPollTimer);
    if (this.watchdogTimer) clearInterval(this.watchdogTimer);
    if (this.tickerWs) {
      this.tickerWs.onclose = null;
      this.tickerWs.close();
      this.tickerWs = null;
    }
    if (this.pairWs) {
      this.pairWs.onclose = null;
      this.pairWs.close();
      this.pairWs = null;
    }
  }

  private applyRawBinanceTicker(
    binanceSym: string,
    raw: {
      lastPrice: number;
      priceChange: number;
      priceChangePercent: number;
      high24h: number;
      low24h: number;
      volume24h: number;
      quoteVolume24h: number;
    },
    now: number,
    provenance: MarketDataProvenance = 'live_ws'
  ) {
    if (!Number.isFinite(raw.lastPrice) || raw.lastPrice <= 0) return;

    const matchingMetas = TRACKED_COINS.filter((c) => c.binanceSymbol === binanceSym);
    for (const meta of matchingMetas) {
      if (meta.invertPrice) {
        // If Kraken's direct USDT/USD feed synced within the last 35s, do not overwrite USDTUSD with USDCUSDT's volume/price
        if (
          meta.symbol === 'USDTUSD' &&
          this.lastKrakenSyncAt &&
          now - this.lastKrakenSyncAt < 35000 &&
          this.tickersMap['USDTUSD']?.lastPrice > 0
        ) {
          continue;
        }

        const safeLast = Number((1 / raw.lastPrice).toFixed(5));
        const safeHigh = raw.low24h > 0 ? Number((1 / raw.low24h).toFixed(5)) : safeLast;
        const safeLow = raw.high24h > 0 ? Number((1 / raw.high24h).toFixed(5)) : safeLast;
        const changePct = Number((-raw.priceChangePercent).toFixed(3));
        const changeAbs = Number((safeLast * (changePct / 100)).toFixed(5));
        const prevPrice = this.tickersMap[meta.symbol]?.lastPrice;
        const flash =
          prevPrice && safeLast !== prevPrice ? (safeLast > prevPrice ? 'up' : 'down') : null;

        this.tickersMap[meta.symbol] = {
          symbol: meta.symbol,
          baseAsset: meta.baseAsset,
          quoteAsset: meta.quoteAsset,
          name: meta.name,
          lastPrice: safeLast,
          priceChange: changeAbs,
          priceChangePercent: changePct,
          high24h: Math.max(safeHigh, safeLast),
          low24h: Math.min(safeLow, safeLast),
          volume24h: raw.quoteVolume24h,
          quoteVolume24h: raw.quoteVolume24h,
          marketCap: safeLast * meta.circulatingSupply,
          category: meta.category,
          leverageTag: meta.leverageTag,
          lastUpdated: now,
          flash,
          dataProvenance: provenance,
          feedSource:
            provenance === 'live_ws'
              ? 'Binance Live WS (USDC/USDT Inverse)'
              : 'Binance REST (USDC/USDT Inverse)',
          isNewListing: meta.isNewListing,
        };
      } else {
        const prevPrice = this.tickersMap[meta.symbol]?.lastPrice;
        const flash =
          prevPrice && raw.lastPrice !== prevPrice
            ? raw.lastPrice > prevPrice
              ? 'up'
              : 'down'
            : null;

        this.tickersMap[meta.symbol] = {
          symbol: meta.symbol,
          baseAsset: meta.baseAsset,
          quoteAsset: meta.quoteAsset,
          name: meta.name,
          lastPrice: raw.lastPrice,
          priceChange: raw.priceChange,
          priceChangePercent: raw.priceChangePercent,
          high24h: raw.high24h,
          low24h: raw.low24h,
          volume24h: raw.volume24h,
          quoteVolume24h: raw.quoteVolume24h,
          marketCap: raw.lastPrice * meta.circulatingSupply,
          category: meta.category,
          leverageTag: meta.leverageTag,
          lastUpdated: now,
          flash,
          dataProvenance: provenance,
          feedSource: provenance === 'live_ws' ? 'Binance Live WS' : 'Binance REST API',
          isNewListing: meta.isNewListing,
        };
      }
    }
  }

  public async fetchInitialTickers(isBackgroundPoll = false) {
    try {
      const uniqueBinanceSymbols = Array.from(new Set(TRACKED_COINS.map((c) => c.binanceSymbol)));
      const symbolsParam = encodeURIComponent(JSON.stringify(uniqueBinanceSymbols));
      const data = await fetchBinanceJson<any[]>(`/ticker/24hr?symbols=${symbolsParam}`);
      const now = Date.now();
      this.lastRestSyncAt = now;
      const isWsOpen = this.tickerWs?.readyState === WebSocket.OPEN;
      const provenance: MarketDataProvenance = isWsOpen ? 'live_ws' : 'live_rest';

      for (const item of data) {
        this.applyRawBinanceTicker(
          item.symbol,
          {
            lastPrice: parseFloat(item.lastPrice),
            priceChange: parseFloat(item.priceChange),
            priceChangePercent: parseFloat(item.priceChangePercent),
            high24h: parseFloat(item.highPrice),
            low24h: parseFloat(item.lowPrice),
            volume24h: parseFloat(item.volume),
            quoteVolume24h: parseFloat(item.quoteVolume),
          },
          now,
          provenance
        );
      }

      // Direct Kraken USDTZUSD public ticker for accurate USDT/USD spot pricing & volume
      try {
        const krakenRes = await fetch('https://api.kraken.com/0/public/Ticker?pair=USDTZUSD');
        if (krakenRes.ok) {
          const kj = await krakenRes.json();
          const pairData = kj?.result?.USDTZUSD;
          if (pairData && pairData.c?.[0]) {
            const kLast = parseFloat(pairData.c[0]);
            const kOpen = parseFloat(pairData.o || pairData.c[0]);
            const kHigh = parseFloat(pairData.h?.[1] || pairData.c[0]);
            const kLow = parseFloat(pairData.l?.[1] || pairData.c[0]);
            const kVol = parseFloat(pairData.v?.[1] || '0');
            if (kLast > 0.95 && kLast < 1.05) {
              this.lastKrakenSyncAt = now;
              const kChange = kLast - kOpen;
              const kChangePct = kOpen > 0 ? (kChange / kOpen) * 100 : 0;
              const usdtMeta = TRACKED_COINS.find((c) => c.symbol === 'USDTUSD')!;
              const prevPrice = this.tickersMap['USDTUSD']?.lastPrice;
              this.tickersMap['USDTUSD'] = {
                symbol: 'USDTUSD',
                baseAsset: 'USDT',
                quoteAsset: 'USD',
                name: 'TetherUS',
                lastPrice: kLast,
                priceChange: Number(kChange.toFixed(5)),
                priceChangePercent: Number(kChangePct.toFixed(3)),
                high24h: kHigh,
                low24h: kLow,
                volume24h: kVol,
                quoteVolume24h: kVol * kLast,
                marketCap: kLast * usdtMeta.circulatingSupply,
                category: 'Stablecoin',
                lastUpdated: now,
                flash: prevPrice && kLast !== prevPrice ? (kLast > prevPrice ? 'up' : 'down') : null,
                dataProvenance: isWsOpen ? 'live_ws' : 'live_rest',
                feedSource: 'Kraken Direct USDT/USD Live REST',
              };
            }
          }
        }
      } catch {
        // Binance USDCUSDT inverse fallback already applied above
      }

      this.onTickersCallback?.({ ...this.tickersMap }, now);
      if (this.tickerWs?.readyState !== WebSocket.OPEN) {
        this.emitStatus('rest_fallback');
      }
    } catch {
      if (!isBackgroundPoll && Object.keys(this.tickersMap).length === 0) {
        this.emitStatus('error');
      } else if (this.tickerWs?.readyState !== WebSocket.OPEN) {
        this.emitStatus('stale');
      }
    }
  }

  public connectTickerStream() {
    if (this.isDestroyed) return;
    if (this.tickerReconnectTimer) {
      clearTimeout(this.tickerReconnectTimer);
      this.tickerReconnectTimer = null;
    }
    if (this.tickerWs) {
      this.tickerWs.onclose = null;
      this.tickerWs.onerror = null;
      this.tickerWs.close();
      this.tickerWs = null;
    }

    const uniqueBinanceSymbols = Array.from(new Set(TRACKED_COINS.map((c) => c.binanceSymbol)));
    const streams = uniqueBinanceSymbols.map((s) => `${s.toLowerCase()}@ticker`).join('/');
    const wsBase = WS_ENDPOINTS[this.wsEndpointIndex % WS_ENDPOINTS.length];
    const url = `${wsBase.replace('/ws', '/stream')}?streams=${streams}`;

    try {
      const ws = new WebSocket(url);
      this.tickerWs = ws;

      ws.onopen = () => {
        if (this.isDestroyed) return;
        this.reconnectAttempts = 0;
        this.lastWsMessageAt = Date.now();
        this.emitStatus('connected');
      };

      ws.onmessage = (event) => {
        if (this.isDestroyed) return;
        try {
          const payload = JSON.parse(event.data);
          const d = payload.data || payload;
          if (!d || !d.s) return;

          const now = Date.now();
          this.lastWsMessageAt = now;
          if (this.currentStatus !== 'connected') {
            this.emitStatus('connected');
          }

          this.applyRawBinanceTicker(
            d.s,
            {
              lastPrice: parseFloat(d.c),
              priceChange: parseFloat(d.p),
              priceChangePercent: parseFloat(d.P),
              high24h: parseFloat(d.h),
              low24h: parseFloat(d.l),
              volume24h: parseFloat(d.v),
              quoteVolume24h: parseFloat(d.q),
            },
            now,
            'live_ws'
          );

          this.onTickersCallback?.({ ...this.tickersMap }, now);
        } catch {
          // ignore malformed frame
        }
      };

      ws.onerror = () => {
        if (this.isDestroyed) return;
        this.wsEndpointIndex = (this.wsEndpointIndex + 1) % WS_ENDPOINTS.length;
      };

      ws.onclose = () => {
        if (this.isDestroyed) return;
        this.reconnectAttempts += 1;
        this.emitStatus(this.lastRestSyncAt ? 'rest_fallback' : 'reconnecting');
        const backoffMs = Math.min(12000, 1500 * Math.pow(1.6, Math.min(5, this.reconnectAttempts)));
        this.tickerReconnectTimer = setTimeout(() => this.connectTickerStream(), backoffMs);
      };
    } catch {
      this.reconnectAttempts += 1;
      this.emitStatus('rest_fallback');
      this.tickerReconnectTimer = setTimeout(() => this.connectTickerStream(), 4000);
    }
  }

  public async subscribeActivePair(symbol: string, interval: KlineInterval) {
    this.activeSymbol = symbol;
    this.activeInterval = interval;

    if (this.pairReconnectTimer) clearTimeout(this.pairReconnectTimer);
    if (this.pairWs) {
      this.pairWs.onclose = null;
      this.pairWs.close();
      this.pairWs = null;
    }

    this.fetchOrderBookSnapshot(symbol);
    this.fetchRecentTradesSnapshot(symbol);
    this.connectPairStream(symbol, interval);
  }

  private getMetaForSymbol(symbol: string): CoinMeta {
    return (
      TRACKED_COINS.find((c) => c.symbol === symbol) || {
        symbol,
        binanceSymbol: symbol === 'USDTUSD' ? 'USDCUSDT' : symbol,
        invertPrice: symbol === 'USDTUSD',
        baseAsset: symbol.replace(/USDT$|USD$/, ''),
        quoteAsset: 'USDT',
        name: symbol,
        circulatingSupply: 1000000,
        category: 'Layer 1',
        color: '#FCD535',
      }
    );
  }

  private connectPairStream(symbol: string, interval: KlineInterval) {
    if (this.isDestroyed) return;
    const meta = this.getMetaForSymbol(symbol);
    const symLower = meta.binanceSymbol.toLowerCase();
    const wsBase = WS_ENDPOINTS[this.wsEndpointIndex % WS_ENDPOINTS.length];
    const streams = `${symLower}@depth20@100ms/${symLower}@trade/${symLower}@kline_${interval}`;
    const url = `${wsBase.replace('/ws', '/stream')}?streams=${streams}`;

    try {
      const ws = new WebSocket(url);
      this.pairWs = ws;

      ws.onmessage = (event) => {
        if (this.isDestroyed) return;
        try {
          const msg = JSON.parse(event.data);
          const streamName: string = msg.stream || '';
          const d = msg.data;
          if (!d) return;

          if (streamName.includes('@depth20')) {
            const rawBids: [string, string][] = d.bids || [];
            const rawAsks: [string, string][] = d.asks || [];
            const bids = meta.invertPrice
              ? this.parseInvertedDepthSide(rawAsks)
              : this.parseDepthSide(rawBids);
            const asks = meta.invertPrice
              ? this.parseInvertedDepthSide(rawBids)
              : this.parseDepthSide(rawAsks);
            this.onOrderBookCallback?.({
              symbol,
              bids,
              asks,
              lastUpdated: Date.now(),
            });
          } else if (streamName.includes('@trade')) {
            const rawPrice = parseFloat(d.p);
            const price =
              meta.invertPrice && rawPrice > 0 ? Number((1 / rawPrice).toFixed(5)) : rawPrice;
            this.onTradeCallback?.({
              id: String(d.t),
              price,
              quantity: parseFloat(d.q),
              time: d.T || Date.now(),
              isBuyerMaker: meta.invertPrice ? !d.m : Boolean(d.m),
            });
          } else if (streamName.includes('@kline_')) {
            const k = d.k;
            if (k) {
              const o = parseFloat(k.o);
              const h = parseFloat(k.h);
              const l = parseFloat(k.l);
              const c = parseFloat(k.c);
              if (meta.invertPrice && o > 0 && h > 0 && l > 0 && c > 0) {
                this.onCandleCallback?.({
                  time: k.t,
                  open: Number((1 / o).toFixed(5)),
                  high: Number((1 / l).toFixed(5)),
                  low: Number((1 / h).toFixed(5)),
                  close: Number((1 / c).toFixed(5)),
                  volume: parseFloat(k.q || k.v),
                });
              } else {
                this.onCandleCallback?.({
                  time: k.t,
                  open: o,
                  high: h,
                  low: l,
                  close: c,
                  volume: parseFloat(k.v),
                });
              }
            }
          }
        } catch {
          // ignore frame parse errors
        }
      };

      ws.onclose = () => {
        if (this.isDestroyed) return;
        this.pairReconnectTimer = setTimeout(
          () => this.connectPairStream(this.activeSymbol, this.activeInterval),
          3000
        );
      };
    } catch {
      // Fallback handled by REST snapshot
    }
  }

  private parseDepthSide(raw: [string, string][]): OrderBookEntry[] {
    let runningTotal = 0;
    return raw.slice(0, 15).map(([pStr, qStr]) => {
      const price = parseFloat(pStr);
      const quantity = parseFloat(qStr);
      runningTotal += quantity;
      return { price, quantity, total: runningTotal };
    });
  }

  private parseInvertedDepthSide(raw: [string, string][]): OrderBookEntry[] {
    let runningTotal = 0;
    return raw.slice(0, 15).map(([pStr, qStr]) => {
      const rawP = parseFloat(pStr);
      const price = rawP > 0 ? Number((1 / rawP).toFixed(5)) : 1.0;
      const quantity = parseFloat(qStr);
      runningTotal += quantity;
      return { price, quantity, total: runningTotal };
    });
  }

  public async fetchOrderBookSnapshot(symbol: string): Promise<OrderBookData | null> {
    try {
      const meta = this.getMetaForSymbol(symbol);
      const data = await fetchBinanceJson<{ bids: [string, string][]; asks: [string, string][] }>(
        `/depth?symbol=${meta.binanceSymbol}&limit=15`
      );
      const book: OrderBookData = {
        symbol,
        bids: meta.invertPrice
          ? this.parseInvertedDepthSide(data.asks || [])
          : this.parseDepthSide(data.bids || []),
        asks: meta.invertPrice
          ? this.parseInvertedDepthSide(data.bids || [])
          : this.parseDepthSide(data.asks || []),
        lastUpdated: Date.now(),
      };
      this.onOrderBookCallback?.(book);
      return book;
    } catch {
      return null;
    }
  }

  public async fetchRecentTradesSnapshot(symbol: string): Promise<TradeExecution[]> {
    try {
      const meta = this.getMetaForSymbol(symbol);
      const data = await fetchBinanceJson<any[]>(`/trades?symbol=${meta.binanceSymbol}&limit=25`);
      const trades: TradeExecution[] = data
        .map((t) => {
          const rawP = parseFloat(t.price);
          return {
            id: String(t.id),
            price: meta.invertPrice && rawP > 0 ? Number((1 / rawP).toFixed(5)) : rawP,
            quantity: parseFloat(t.qty),
            time: t.time,
            isBuyerMaker: meta.invertPrice ? !t.isBuyerMaker : Boolean(t.isBuyerMaker),
          };
        })
        .reverse();
      trades.slice(0, 15).reverse().forEach((tr) => this.onTradeCallback?.(tr));
      return trades;
    } catch {
      return [];
    }
  }

  public async fetchHistoricalCandles(
    symbol: string,
    interval: KlineInterval,
    limit = 120
  ): Promise<CandleData[]> {
    const meta = this.getMetaForSymbol(symbol);

    // If USDTUSD, try Kraken's direct USDTZUSD OHLC endpoint first, fallback to inverted Binance USDCUSDT klines
    if (symbol === 'USDTUSD') {
      try {
        const krakenIntervalMap: Record<KlineInterval, number> = {
          '1m': 1,
          '5m': 5,
          '15m': 15,
          '1h': 60,
          '4h': 240,
          '1d': 1440,
          '1w': 10080,
        };
        const res = await fetch(
          `https://api.kraken.com/0/public/OHLC?pair=USDTZUSD&interval=${krakenIntervalMap[interval]}`
        );
        if (res.ok) {
          const json = await res.json();
          const rows: any[] = json?.result?.USDTZUSD;
          if (Array.isArray(rows) && rows.length > 10) {
            return rows.slice(-limit).map((r) => ({
              time: Number(r[0]) * 1000,
              open: parseFloat(r[1]),
              high: parseFloat(r[2]),
              low: parseFloat(r[3]),
              close: parseFloat(r[4]),
              volume: parseFloat(r[6]),
            }));
          }
        }
      } catch {
        // Fallback to Binance USDCUSDT below
      }
    }

    const raw = await fetchBinanceJson<any[]>(
      `/klines?symbol=${meta.binanceSymbol}&interval=${interval}&limit=${limit}`
    );
    return raw.map((k) => {
      const o = parseFloat(k[1]);
      const h = parseFloat(k[2]);
      const l = parseFloat(k[3]);
      const c = parseFloat(k[4]);
      if (meta.invertPrice && o > 0 && h > 0 && l > 0 && c > 0) {
        return {
          time: Number(k[0]),
          open: Number((1 / o).toFixed(5)),
          high: Number((1 / l).toFixed(5)),
          low: Number((1 / h).toFixed(5)),
          close: Number((1 / c).toFixed(5)),
          volume: parseFloat(k[7] || k[5]),
        };
      }
      return {
        time: Number(k[0]),
        open: o,
        high: h,
        low: l,
        close: c,
        volume: parseFloat(k[5]),
      };
    });
  }
}

export const marketService = new MarketDataService();
