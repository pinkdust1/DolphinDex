import { Trade } from "@/types/trading";

interface TradingRecentTradesProps {
  trades: Trade[];
  isLoading?: boolean;
}

export const TradingRecentTrades = ({ trades, isLoading }: TradingRecentTradesProps) => {
  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-lg overflow-hidden h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground text-sm animate-pulse">Loading trades...</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Recent Trades</h3>
        <span className="text-xs text-green-500 font-medium flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Live
        </span>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-4 gap-2 px-3 py-2 text-xs text-muted-foreground bg-muted/50 border-b border-border">
        <div>Price</div>
        <div className="text-center">Amount</div>
        <div className="text-center">Time</div>
        <div className="text-right">Side</div>
      </div>

      {/* Trades List */}
      <div className="overflow-y-auto max-h-[250px]">
        {trades.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            No recent trades
          </div>
        ) : (
          trades.map((trade) => (
            <div
              key={trade.id}
              className="grid grid-cols-4 gap-2 px-3 py-2 border-b border-border last:border-0 items-center hover:bg-accent/50 transition-colors text-xs"
            >
              <div className={`font-medium font-mono ${trade.side === "buy" ? "text-green-500" : "text-destructive"}`}>
                {trade.price.toFixed(6)}
              </div>
              <div className="text-center text-foreground font-mono">
                {trade.amount.toFixed(0)}
              </div>
              <div className="text-center text-muted-foreground font-mono">
                {new Date(trade.time).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </div>
              <div className="text-right">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    trade.side === "buy"
                      ? "bg-green-500/20 text-green-500"
                      : "bg-destructive/20 text-destructive"
                  }`}
                >
                  {trade.side}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
