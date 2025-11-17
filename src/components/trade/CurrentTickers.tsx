import { Settings } from "lucide-react";

interface CurrentTickersProps {
  pair: { base: string; quote: string };
}

export const CurrentTickers = ({ pair }: CurrentTickersProps) => {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6 flex-wrap">
          {/* Price */}
          <div className="flex items-center gap-2">
            <div>
              <p className="text-2xl font-medium text-foreground">
                0<span className="text-muted-foreground">.08443</span>
              </p>
              <span className="text-sm text-muted-foreground">{pair.quote}</span>
            </div>
            <span className="text-sm text-green-500">+0.01%</span>
          </div>

          {/* 24h Volume */}
          <div>
            <p className="text-xs text-muted-foreground mb-1">24h Volume:</p>
            <p className="text-sm font-medium">
              130,849<span className="text-muted-foreground">.2656</span>
            </p>
          </div>

          {/* 24h Range */}
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">24h Low:</p>
              <p className="text-sm font-medium">
                0<span className="text-muted-foreground">.08335</span>
              </p>
            </div>
            
            <div className="relative w-32 h-1 bg-muted rounded-full">
              <div 
                className="absolute h-full bg-primary rounded-full transition-all duration-300" 
                style={{ left: 0, width: '29.38%' }}
              />
              <div 
                className="absolute w-2 h-2 bg-primary rounded-full -top-0.5 transition-all duration-300" 
                style={{ left: '29.38%', transform: 'translateX(-50%)' }}
              />
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">24h High:</p>
              <p className="text-sm font-medium">
                0<span className="text-muted-foreground">.08702</span>
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
