import { useEffect, useRef } from "react";
import { createChart, IChartApi, CandlestickData, Time, CrosshairMode, ColorType, CandlestickSeries } from "lightweight-charts";
import { useTheme } from "next-themes";
import { OHLCData, TimeInterval } from "@/types/trading";

interface TradingChartProps {
  data: OHLCData[];
  interval: TimeInterval;
}

export const TradingChart = ({ data, interval }: TradingChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const seriesRef = useRef<any>(null);
  const { resolvedTheme } = useTheme();

  const isDark = resolvedTheme === "dark";

  const formatLocalTime = (unixSeconds: number) => {
    const dt = new Date(unixSeconds * 1000);
    return new Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    }).format(dt);
  };

  const formatLocalDate = (unixSeconds: number) => {
    const dt = new Date(unixSeconds * 1000);
    return new Intl.DateTimeFormat(undefined, {
      month: "2-digit",
      day: "2-digit",
    }).format(dt);
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight || 400,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: isDark ? "hsl(0, 0%, 65%)" : "hsl(0, 0%, 45%)",
        fontSize: 11,
        fontFamily: "Inter, sans-serif",
      },
      grid: {
        vertLines: { color: isDark ? "hsl(0, 0%, 20%)" : "hsl(0, 0%, 90%)" },
        horzLines: { color: isDark ? "hsl(0, 0%, 20%)" : "hsl(0, 0%, 90%)" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: isDark ? "hsl(0, 0%, 20%)" : "hsl(0, 0%, 90%)",
      },
      timeScale: {
        borderColor: isDark ? "hsl(0, 0%, 20%)" : "hsl(0, 0%, 90%)",
        timeVisible: true,
        rightOffset: 12,
        barSpacing: 6,
        tickMarkFormatter: (time: Time) => {
          if (typeof time === "number") {
            if (interval === "4h" || interval === "1d") return formatLocalDate(time);
            return formatLocalTime(time);
          }
          return String(time);
        },
      },
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#10b981",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#10b981",
      wickDownColor: "#ef4444",
    });

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [isDark]);

  useEffect(() => {
    if (!seriesRef.current) return;
    
    const chartData: CandlestickData<Time>[] = (data || []).map(d => ({
      time: d.time as Time,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));
    
    seriesRef.current.setData(chartData);
  }, [data]);

  // Update chart colors when theme changes
  useEffect(() => {
    if (!chartRef.current) return;
    
    chartRef.current.applyOptions({
      layout: {
        textColor: isDark ? "hsl(0, 0%, 65%)" : "hsl(0, 0%, 45%)",
      },
      grid: {
        vertLines: { color: isDark ? "hsl(0, 0%, 20%)" : "hsl(0, 0%, 90%)" },
        horzLines: { color: isDark ? "hsl(0, 0%, 20%)" : "hsl(0, 0%, 90%)" },
      },
      rightPriceScale: {
        borderColor: isDark ? "hsl(0, 0%, 20%)" : "hsl(0, 0%, 90%)",
      },
      timeScale: {
        borderColor: isDark ? "hsl(0, 0%, 20%)" : "hsl(0, 0%, 90%)",
      },
    });
  }, [isDark]);

  return <div ref={containerRef} className="w-full h-full" />;
};
