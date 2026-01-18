import { Maximize2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TradingChart } from "./TradingChart";
import { OHLCData, TimeInterval } from "@/types/trading";

interface ChartWrapperProps {
  pair: { base: string; quote: string };
  ohlcData?: OHLCData[];
  interval?: TimeInterval;
  onIntervalChange?: (interval: TimeInterval) => void;
}

const intervals: TimeInterval[] = ["1m", "5m", "15m", "30m", "1h", "4h", "1d"];
const intervalLabels: Record<TimeInterval, string> = {
  "1m": "1m",
  "5m": "5m",
  "15m": "15m",
  "30m": "30m",
  "1h": "1h",
  "4h": "4h",
  "1d": "1D",
};

export const ChartWrapper = ({ pair, ohlcData = [], interval = "1h", onIntervalChange }: ChartWrapperProps) => {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          {intervals.map((int) => (
            <Button
              key={int}
              variant={interval === int ? "default" : "ghost"}
              size="sm"
              onClick={() => onIntervalChange?.(int)}
              className="h-7"
            >
              {intervalLabels[int]}
            </Button>
          ))}
          <Button variant="ghost" size="sm" className="h-7">
            Technical Ind
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <button className="hover:bg-accent p-2 rounded-md transition-colors">
            <Save className="w-4 h-4" />
          </button>
          <button className="hover:bg-accent p-2 rounded-md transition-colors">
            <Maximize2 className="w-4 h-4" />
          </button>
          <button className="hover:bg-accent p-2 rounded-md transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative w-full h-[500px] bg-background/50">
        {ohlcData.length > 0 ? (
          <TradingChart data={ohlcData} interval={interval} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">
              Chart for {pair.base}/{pair.quote} - {interval}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
