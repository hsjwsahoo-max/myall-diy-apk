import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { CandleData, KlineInterval } from '../types/exchange';
import { Maximize2, Minimize2, RotateCcw, SlidersHorizontal } from 'lucide-react';

interface CandlestickChartProps {
  symbol?: string;
  candles?: CandleData[];
  klines?: CandleData[];
  interval: KlineInterval;
  onIntervalChange: (interval: KlineInterval) => void;
  isLoading?: boolean;
  loading?: boolean;
  height?: number;
  compact?: boolean;
}

const INTERVALS: KlineInterval[] = ['1m', '5m', '15m', '1h', '4h', '1d', '1w'];

function computeMA(bars: CandleData[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  let sum = 0;
  for (let i = 0; i < bars.length; i++) {
    sum += bars[i].close;
    if (i >= period) {
      sum -= bars[i - period].close;
    }
    if (i >= period - 1) {
      result.push(sum / period);
    } else {
      result.push(null);
    }
  }
  return result;
}

export const CandlestickChart: React.FC<CandlestickChartProps> = ({
  candles,
  klines,
  interval,
  onIntervalChange,
  isLoading = false,
  loading = false,
  height = 250,
  compact = false,
}) => {
  const data = useMemo(() => candles ?? klines ?? [], [candles, klines]);
  const isBusy = isLoading || loading;

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 360, height });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showMA, setShowMA] = useState(true);
  const [showVol, setShowVol] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lineMode, setLineMode] = useState(false);

  // Pan and Zoom state
  const [visibleCount, setVisibleCount] = useState(52);
  const [panOffset, setPanOffset] = useState(0);
  const dragStartRef = useRef<{ x: number; startOffset: number } | null>(null);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        if (rect.width > 0) {
          setDimensions({
            width: Math.floor(rect.width),
            height: isFullscreen ? Math.min(window.innerHeight - 140, 440) : height,
          });
        }
      }
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    if (containerRef.current) observer.observe(containerRef.current);
    window.addEventListener('resize', updateSize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, [height, isFullscreen]);

  const ma7 = useMemo(() => computeMA(data, 7), [data]);
  const ma25 = useMemo(() => computeMA(data, 25), [data]);
  const ma99 = useMemo(() => computeMA(data, 99), [data]);

  const sliceBounds = useMemo(() => {
    const total = data.length;
    if (total === 0) return { start: 0, end: 0 };
    const count = Math.min(Math.max(18, visibleCount), total);
    const maxOffset = Math.max(0, total - count);
    const clampedOffset = Math.min(Math.max(0, panOffset), maxOffset);
    const end = total - clampedOffset;
    const start = Math.max(0, end - count);
    return { start, end };
  }, [data.length, visibleCount, panOffset]);

  const visibleKlines = useMemo(
    () => data.slice(sliceBounds.start, sliceBounds.end),
    [data, sliceBounds]
  );

  const activeBarIndex = hoveredIndex !== null ? hoveredIndex : data.length - 1;
  const activeBar = data[activeBarIndex] || null;
  const activeMa7 = ma7[activeBarIndex] ?? null;
  const activeMa25 = ma25[activeBarIndex] ?? null;
  const activeMa99 = ma99[activeBarIndex] ?? null;

  const formatChartPrice = useCallback((p: number) => {
    if (p >= 1000)
      return p.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    if (p >= 1) return p.toFixed(2);
    if (p >= 0.01) return p.toFixed(4);
    return p.toFixed(6);
  }, []);

  // Draw Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = dimensions.width;
    const h = dimensions.height;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    // Clear background (#181A20 primary exchange dark)
    ctx.fillStyle = '#181A20';
    ctx.fillRect(0, 0, w, h);

    if (visibleKlines.length === 0) {
      ctx.fillStyle = '#848E9C';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        isBusy ? 'Loading live market klines...' : 'No chart data available',
        w / 2,
        h / 2
      );
      return;
    }

    const rightAxisWidth = compact ? 54 : 62;
    const bottomAxisHeight = compact ? 16 : 20;
    const topPadding = compact ? 10 : 20;
    const chartW = w - rightAxisWidth;
    const totalChartH = h - bottomAxisHeight - topPadding;
    const priceChartH = showVol ? totalChartH * 0.77 : totalChartH * 0.94;
    const volChartTop = topPadding + priceChartH + 4;
    const volChartH = showVol ? totalChartH - priceChartH - 4 : 0;

    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let maxVol = 0;

    visibleKlines.forEach((b, idx) => {
      const globalIdx = sliceBounds.start + idx;
      if (b.low < minPrice) minPrice = b.low;
      if (b.high > maxPrice) maxPrice = b.high;
      if (b.volume > maxVol) maxVol = b.volume;
      if (showMA) {
        const m7 = ma7[globalIdx];
        const m25 = ma25[globalIdx];
        const m99 = ma99[globalIdx];
        if (m7 !== null) {
          if (m7 < minPrice) minPrice = m7;
          if (m7 > maxPrice) maxPrice = m7;
        }
        if (m25 !== null) {
          if (m25 < minPrice) minPrice = m25;
          if (m25 > maxPrice) maxPrice = m25;
        }
        if (m99 !== null) {
          if (m99 < minPrice) minPrice = m99;
          if (m99 > maxPrice) maxPrice = m99;
        }
      }
    });

    const priceRange = Math.max(maxPrice - minPrice, maxPrice * 0.0005, 1e-8);
    const paddedMin = minPrice - priceRange * 0.06;
    const paddedMax = maxPrice + priceRange * 0.06;
    const paddedRange = paddedMax - paddedMin;

    const priceToY = (p: number) =>
      topPadding + priceChartH - ((p - paddedMin) / paddedRange) * priceChartH;

    // Subtle Grid lines
    ctx.strokeStyle = '#1E2329';
    ctx.lineWidth = 1;
    const gridRows = 4;
    for (let i = 0; i <= gridRows; i++) {
      const y = Math.floor(topPadding + (priceChartH / gridRows) * i) + 0.5;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartW, y);
      ctx.stroke();

      const priceVal = paddedMax - (paddedRange / gridRows) * i;
      ctx.fillStyle = '#5E6673';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(formatChartPrice(priceVal), chartW + 4, y + 3);
    }

    const vCols = 4;
    for (let i = 1; i < vCols; i++) {
      const x = Math.floor((chartW / vCols) * i) + 0.5;
      ctx.beginPath();
      ctx.moveTo(x, topPadding);
      ctx.lineTo(x, h - bottomAxisHeight);
      ctx.stroke();
    }

    const barSpacing = chartW / visibleKlines.length;
    const candleWidth = Math.max(2, Math.min(12, barSpacing * 0.72));

    if (lineMode) {
      ctx.strokeStyle = '#F0B90B';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      visibleKlines.forEach((bar, i) => {
        const cx = (i + 0.5) * barSpacing;
        const cy = priceToY(bar.close);
        if (i === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      });
      ctx.stroke();

      const grad = ctx.createLinearGradient(0, topPadding, 0, topPadding + priceChartH);
      grad.addColorStop(0, 'rgba(240, 185, 11, 0.18)');
      grad.addColorStop(1, 'rgba(240, 185, 11, 0.0)');
      ctx.fillStyle = grad;
      ctx.lineTo((visibleKlines.length - 0.5) * barSpacing, topPadding + priceChartH);
      ctx.lineTo(0.5 * barSpacing, topPadding + priceChartH);
      ctx.closePath();
      ctx.fill();
    } else {
      visibleKlines.forEach((bar, i) => {
        const cx = (i + 0.5) * barSpacing;
        const isBull = bar.close >= bar.open;
        const color = isBull ? '#0ECB81' : '#F6465D';

        const highY = priceToY(bar.high);
        const lowY = priceToY(bar.low);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx, highY);
        ctx.lineTo(cx, lowY);
        ctx.stroke();

        const openY = priceToY(bar.open);
        const closeY = priceToY(bar.close);
        const bodyTop = Math.min(openY, closeY);
        const bodyHeight = Math.max(1.5, Math.abs(closeY - openY));

        ctx.fillStyle = color;
        ctx.fillRect(cx - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
      });
    }

    if (showVol && maxVol > 0) {
      visibleKlines.forEach((bar, i) => {
        const cx = (i + 0.5) * barSpacing;
        const isBull = bar.close >= bar.open;
        const vH = (bar.volume / maxVol) * volChartH;
        const vY = volChartTop + volChartH - vH;
        ctx.fillStyle = isBull ? 'rgba(14, 203, 129, 0.32)' : 'rgba(246, 70, 93, 0.32)';
        ctx.fillRect(cx - candleWidth / 2, vY, candleWidth, Math.max(1, vH));
      });
    }

    if (showMA && !lineMode) {
      const drawMALine = (maArr: (number | null)[], strokeColor: string) => {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.15;
        ctx.beginPath();
        let started = false;
        visibleKlines.forEach((_, i) => {
          const val = maArr[sliceBounds.start + i];
          if (val !== null && val !== undefined) {
            const cx = (i + 0.5) * barSpacing;
            const cy = priceToY(val);
            if (!started) {
              ctx.moveTo(cx, cy);
              started = true;
            } else {
              ctx.lineTo(cx, cy);
            }
          }
        });
        ctx.stroke();
      };

      drawMALine(ma7, '#F0B90B');
      drawMALine(ma25, '#E841A3');
      drawMALine(ma99, '#7B61FF');
    }

    const latestBar = data[data.length - 1];
    if (latestBar) {
      const lastY = Math.max(
        topPadding + 8,
        Math.min(topPadding + priceChartH - 8, priceToY(latestBar.close))
      );
      const isBull = latestBar.close >= latestBar.open;
      const badgeColor = isBull ? '#0ECB81' : '#F6465D';

      ctx.save();
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = badgeColor;
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(0, lastY);
      ctx.lineTo(chartW, lastY);
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = badgeColor;
      ctx.fillRect(chartW + 1, lastY - 8, rightAxisWidth - 2, 16);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 9.5px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(formatChartPrice(latestBar.close), chartW + 4, lastY + 3);
    }

    ctx.fillStyle = '#5E6673';
    ctx.font = '9.5px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    const step = Math.max(1, Math.floor(visibleKlines.length / 4));
    for (let i = step; i < visibleKlines.length; i += step) {
      const b = visibleKlines[i];
      const cx = (i + 0.5) * barSpacing;
      const tsMs = b.time > 1e11 ? b.time : b.time * 1000;
      const d = new Date(tsMs);
      const label =
        interval === '1d' || interval === '1w'
          ? `${(d.getMonth() + 1).toString().padStart(2, '0')}-${d
              .getDate()
              .toString()
              .padStart(2, '0')}`
          : `${d.getHours().toString().padStart(2, '0')}:${d
              .getMinutes()
              .toString()
              .padStart(2, '0')}`;
      ctx.fillText(label, cx, h - 5);
    }

    if (
      hoveredIndex !== null &&
      hoveredIndex >= sliceBounds.start &&
      hoveredIndex < sliceBounds.end
    ) {
      const localIdx = hoveredIndex - sliceBounds.start;
      const b = visibleKlines[localIdx];
      if (b) {
        const cx = (localIdx + 0.5) * barSpacing;
        const cy = priceToY(b.close);

        ctx.save();
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = '#848E9C';
        ctx.lineWidth = 0.8;

        ctx.beginPath();
        ctx.moveTo(cx, topPadding);
        ctx.lineTo(cx, h - bottomAxisHeight);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, cy);
        ctx.lineTo(chartW, cy);
        ctx.stroke();
        ctx.restore();
      }
    }
  }, [
    dimensions,
    visibleKlines,
    data,
    ma7,
    ma25,
    ma99,
    showMA,
    showVol,
    lineMode,
    hoveredIndex,
    sliceBounds,
    isBusy,
    compact,
    interval,
    formatChartPrice,
  ]);

  const handlePointerMove = (clientX: number) => {
    if (!canvasRef.current || visibleKlines.length === 0) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const rightAxisWidth = compact ? 54 : 62;
    const chartW = dimensions.width - rightAxisWidth;

    if (dragStartRef.current) {
      const dx = clientX - dragStartRef.current.x;
      const barSpacing = chartW / visibleKlines.length;
      const barDelta = Math.round(dx / Math.max(2, barSpacing));
      const maxOffset = Math.max(0, data.length - visibleCount);
      setPanOffset(
        Math.min(maxOffset, Math.max(0, dragStartRef.current.startOffset + barDelta))
      );
      return;
    }

    if (x < 0 || x > chartW) {
      setHoveredIndex(null);
      return;
    }
    const localIdx = Math.min(
      visibleKlines.length - 1,
      Math.max(0, Math.floor((x / chartW) * visibleKlines.length))
    );
    setHoveredIndex(sliceBounds.start + localIdx);
  };

  return (
    <div
      ref={containerRef}
      className={`w-full bg-[#181A20] select-none ${
        isFullscreen ? 'fixed inset-0 z-50 flex flex-col p-2 bg-[#181A20]' : 'relative'
      }`}
    >
      {/* Interval & Indicator Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#2B3139]/60 text-[11px]">
        <div className="flex items-center gap-0.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setLineMode(true)}
            className={`px-2 py-0.5 rounded font-medium transition-colors ${
              lineMode
                ? 'text-[#EAECEF] bg-[#2B3139] font-semibold'
                : 'text-[#848E9C] hover:text-[#EAECEF]'
            }`}
          >
            Time
          </button>
          {INTERVALS.map((intv) => (
            <button
              type="button"
              key={intv}
              onClick={() => {
                setLineMode(false);
                onIntervalChange(intv);
                setPanOffset(0);
              }}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                !lineMode && interval === intv
                  ? 'text-[#EAECEF] bg-[#2B3139] font-semibold'
                  : 'text-[#848E9C] hover:text-[#EAECEF]'
              }`}
            >
              {intv}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 pl-2">
          <button
            type="button"
            onClick={() => setShowMA((v) => !v)}
            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
              showMA ? 'text-[#F0B90B] bg-[#F0B90B]/10' : 'text-[#848E9C]'
            }`}
          >
            MA
          </button>
          <button
            type="button"
            onClick={() => setShowVol((v) => !v)}
            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
              showVol ? 'text-[#0ECB81] bg-[#0ECB81]/10' : 'text-[#848E9C]'
            }`}
          >
            VOL
          </button>
          <button
            type="button"
            onClick={() => {
              setVisibleCount((c) => (c > 32 ? 32 : c === 32 ? 75 : 52));
              setPanOffset(0);
            }}
            className="p-1 text-[#848E9C] hover:text-[#EAECEF]"
            title="Toggle Zoom"
          >
            <SlidersHorizontal size={12} />
          </button>
          {panOffset > 0 && (
            <button
              type="button"
              onClick={() => setPanOffset(0)}
              className="p-1 text-[#F0B90B] hover:text-[#EAECEF]"
              title="Reset to latest"
            >
              <RotateCcw size={12} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsFullscreen((v) => !v)}
            className="p-1 text-[#848E9C] hover:text-[#EAECEF]"
            title="Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>
        </div>
      </div>

      {/* OHLC + MA readout strip */}
      {!compact && activeBar && (
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 px-3 py-1 text-[10px] font-mono tabular-nums text-[#848E9C] bg-[#181A20]/95">
          <span>
            O <b className="text-[#EAECEF] font-normal">{formatChartPrice(activeBar.open)}</b>
          </span>
          <span>
            H <b className="text-[#EAECEF] font-normal">{formatChartPrice(activeBar.high)}</b>
          </span>
          <span>
            L <b className="text-[#EAECEF] font-normal">{formatChartPrice(activeBar.low)}</b>
          </span>
          <span>
            C{' '}
            <b
              className={`font-normal ${
                activeBar.close >= activeBar.open ? 'text-[#0ECB81]' : 'text-[#F6465D]'
              }`}
            >
              {formatChartPrice(activeBar.close)}
            </b>
          </span>
          {showMA && activeMa7 !== null && (
            <span className="text-[#F0B90B]">MA(7): {formatChartPrice(activeMa7)}</span>
          )}
          {showMA && activeMa25 !== null && (
            <span className="text-[#E841A3]">MA(25): {formatChartPrice(activeMa25)}</span>
          )}
          {showMA && activeMa99 !== null && (
            <span className="text-[#7B61FF]">MA(99): {formatChartPrice(activeMa99)}</span>
          )}
        </div>
      )}

      {/* Canvas Container */}
      <div
        className="relative w-full touch-pan-y"
        style={{ height: `${dimensions.height}px` }}
        onMouseDown={(e) => {
          dragStartRef.current = { x: e.clientX, startOffset: panOffset };
        }}
        onMouseMove={(e) => handlePointerMove(e.clientX)}
        onMouseUp={() => {
          dragStartRef.current = null;
        }}
        onMouseLeave={() => {
          dragStartRef.current = null;
          setHoveredIndex(null);
        }}
        onTouchStart={(e) => {
          if (e.touches.length === 1) {
            handlePointerMove(e.touches[0].clientX);
          }
        }}
        onTouchMove={(e) => {
          if (e.touches.length === 1) {
            handlePointerMove(e.touches[0].clientX);
          }
        }}
        onTouchEnd={() => setHoveredIndex(null)}
      >
        <canvas ref={canvasRef} className="block w-full h-full cursor-crosshair" />
      </div>
    </div>
  );
};
