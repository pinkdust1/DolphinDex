import { Star, X, RefreshCw, Plus } from "lucide-react";

interface TradingTabsProps {
  selectedPair: { base: string; quote: string };
  onPairChange: (pair: { base: string; quote: string }) => void;
}

export const TradingTabs = ({ selectedPair }: TradingTabsProps) => {
  return (
    <div className="flex items-center gap-2 bg-card border border-border rounded-lg p-2">
      <div className="flex items-center gap-3 bg-accent/50 px-4 py-2 rounded-md">
        <button className="hover:text-primary transition-colors">
          <Star className="w-4 h-4" />
        </button>
        
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1">
            <div className="w-5 h-5 rounded-full bg-primary z-10" />
            <div className="w-5 h-5 rounded-full bg-secondary" />
          </div>
          <span className="font-medium text-foreground">
            {selectedPair.base}/{selectedPair.quote}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button className="hover:text-primary transition-colors">
            <RefreshCw className="w-3 h-3" />
          </button>
          <button className="hover:text-destructive transition-colors">
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      <button className="flex items-center justify-center w-8 h-8 hover:bg-accent rounded-md transition-colors">
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};
