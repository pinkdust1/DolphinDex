import { OrderBookData } from "@/types/trading";

interface TradingOrderBookProps {
  data: OrderBookData | null;
  isLoading?: boolean;
}

const formatPrice = (n: number) => {
  const abs = Math.abs(n);
  if (!isFinite(n)) return "-";
  if (abs === 0) return "0";
  if (abs >= 1) return n.toFixed(4);
  if (abs >= 0.01) return n.toFixed(6);
  if (abs >= 0.0001) return n.toFixed(8);
  return n.toExponential(3);
};

const formatSize = (n: number) => {
  if (!isFinite(n)) return "-";
  const abs = Math.abs(n);
  if (abs >= 1000) return n.toFixed(0);
  if (abs >= 1) return n.toFixed(2);
  return n.toFixed(6);
};

export const TradingOrderBook = ({ data, isLoading }: TradingOrderBookProps) => {
  // Safely extract arrays with fallbacks
  const asks = data?.asks ?? [];
  const bids = data?.bids ?? [];
  const spread = data?.spread ?? 0;

  if (isLoading || !data) {
    return (
      <div className="bg-card border border-border rounded-lg overflow-hidden h-full min-h-[400px] flex items-center justify-center">
        <p className="text-muted-foreground text-sm animate-pulse">Loading Order Book...</p>
      </div>
    );
  }

  const maxAmount = Math.max(
    ...asks.map(a => a.amount),
    ...bids.map(b => b.amount),
    1
  );

  const midPrice = asks.length > 0 && bids.length > 0
    ? (asks[asks.length - 1].price + bids[0].price) / 2
    : 0;

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden flex flex-col h-full min-h-[400px]">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Order Book</h3>
        <span className="text-xs text-muted-foreground">XRP Pair</span>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-2 gap-4 px-3 py-2 text-xs text-muted-foreground bg-muted/50 border-b border-border">
        <div>Price</div>
        <div className="text-right">Size</div>
      </div>

      {/* Order Rows */}
      <div className="flex-1 overflow-y-auto">
        {/* ASKS (Sells) - Reversed */}
        <div className="flex flex-col-reverse">
          {asks.slice(-12).map((ask, i) => (
            <div
              key={`ask-${i}`}
              className="relative group py-1 px-3 flex items-center justify-between text-xs hover:bg-accent/50 cursor-pointer transition-colors"
            >
              <div
                className="absolute right-0 top-0 bottom-0 bg-destructive/10 transition-all group-hover:bg-destructive/20"
                style={{ width: `${(ask.amount / maxAmount) * 100}%` }}
              />
              <span className="relative z-10 text-destructive font-medium font-mono">
                {formatPrice(ask.price)}
              </span>
              <span className="relative z-10 text-muted-foreground font-mono">
                {formatSize(ask.amount)}
              </span>
            </div>
          ))}
        </div>

        {/* Spread */}
        <div className="py-3 my-1 bg-muted/50 flex flex-col items-center justify-center border-y border-border">
          <div className="text-lg font-bold text-foreground font-mono">
            {formatPrice(midPrice)}
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <span>Spread:</span>
            <span className="font-mono">{formatPrice(spread)}</span>
          </div>
        </div>

        {/* BIDS (Buys) */}
        <div>
          {bids.slice(0, 12).map((bid, i) => (
            <div
              key={`bid-${i}`}
              className="relative group py-1 px-3 flex items-center justify-between text-xs hover:bg-accent/50 cursor-pointer transition-colors"
            >
              <div
                className="absolute left-0 top-0 bottom-0 bg-green-500/10 transition-all group-hover:bg-green-500/20"
                style={{ width: `${(bid.amount / maxAmount) * 100}%` }}
              />
              <span className="relative z-10 text-green-500 font-medium font-mono">
                {formatPrice(bid.price)}
              </span>
              <span className="relative z-10 text-muted-foreground font-mono">
                {formatSize(bid.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
