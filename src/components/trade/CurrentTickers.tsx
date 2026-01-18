import { Settings } from "lucide-react";
import { Token } from "@/types/trading";

interface CurrentTickersProps {
  pair: { base: string; quote: string };
  token?: Token | null;
}

export const CurrentTickers = ({ pair, token }: CurrentTickersProps) => {
  const price = token?.price ?? 0.08443;
  const change24h = token?.change24h ?? 0.01;
  const volume24h = token?.volume24h ?? 130849.2656;
  const low24h = token?.low24h ?? 0.08335;
  const high24h = token?.high24h ?? 0.08702;
  
  // Calculate position on range bar (percentage)
  const range = high24h - low24h;
  const position = range > 0 ? ((price - low24h) / range) * 100 : 50;

  // Format price to show integer and decimal parts
  const priceStr = price.toFixed(5);
  const [intPart, decPart] = priceStr.split(".");

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6 flex-wrap">
          {/* Price */}
          <div className="flex items-center gap-2">
            <div>
              <p className="text-2xl font-medium text-foreground">
                {intPart}<span className="text-muted-foreground">.{decPart}</span>
              </p>
              <span className="text-sm text-muted-foreground">{pair.quote}</span>
            </div>
            <span className={`text-sm ${change24h >= 0 ? "text-green-500" : "text-red-500"}`}>
              {change24h >= 0 ? "+" : ""}{change24h.toFixed(2)}%
            </span>
          </div>

          {/* 24h Volume */}
          <div>
            <p className="text-xs text-muted-foreground mb-1">24h Volume:</p>
            <p className="text-sm font-medium">
              {Math.floor(volume24h).toLocaleString()}<span className="text-muted-foreground">.{(volume24h % 1).toFixed(4).slice(2)}</span>
            </p>
          </div>

          {/* 24h Range */}
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">24h Low:</p>
              <p className="text-sm font-medium">
                {Math.floor(low24h)}<span className="text-muted-foreground">.{low24h.toFixed(5).split(".")[1]}</span>
              </p>
            </div>
            
            <div className="relative w-32 h-1 bg-muted rounded-full">
              <div 
                className="absolute h-full bg-primary rounded-full transition-all duration-300" 
                style={{ left: 0, width: `${position}%` }}
              />
              <div 
                className="absolute w-2 h-2 bg-primary rounded-full -top-0.5 transition-all duration-300" 
                style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
              />
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">24h High:</p>
              <p className="text-sm font-medium">
                {Math.floor(high24h)}<span className="text-muted-foreground">.{high24h.toFixed(5).split(".")[1]}</span>
              </p>
            </div>
          </div>
        </div>

        <button className="hover:bg-accent p-2 rounded-md transition-colors">
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
