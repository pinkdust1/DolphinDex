import { X } from "lucide-react";
import { OrderBookData } from "@/types/trading";

interface OrderbookProps {
  pair: { base: string; quote: string };
  orderBook?: OrderBookData | null;
}

const formatPrice = (n: number): string => {
  if (n < 0.001) return n.toFixed(8);
  if (n < 1) return n.toFixed(5);
  if (n < 100) return n.toFixed(4);
  return n.toFixed(2);
};

const formatVolume = (n: number): string => {
  if (n >= 1000000) return (n / 1000000).toFixed(2) + "M";
  if (n >= 1000) return (n / 1000).toFixed(2) + "K";
  return n.toFixed(0);
};

export const Orderbook = ({ pair, orderBook }: OrderbookProps) => {
  const asks = orderBook?.asks ?? [];
  const bids = orderBook?.bids ?? [];

  // Calculate spread
  const bestBid = bids[0]?.price ?? 0;
  const bestAsk = asks[asks.length - 1]?.price ?? 0;
  const spread = bestAsk > 0 && bestBid > 0 ? (bestAsk - bestBid).toFixed(5) : "0.00001";

  // Get max volume for bar sizing
  const allVolumes = [...asks, ...bids].map(o => o.amount);
  const maxVolume = Math.max(...allVolumes, 1);

  // Show top 5 asks (reversed for display) and top 5 bids
  const displayAsks = asks.slice(0, 5).reverse();
  const displayBids = bids.slice(0, 5);

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Orderbook</span>
        </div>
        <button className="hover:bg-accent p-1 rounded-md transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-3 gap-2 px-3 py-2 text-xs text-muted-foreground bg-muted/50">
        <div>Price</div>
        <div className="text-right">Volume</div>
        <div className="text-right">Total</div>
      </div>

      {/* Order Rows */}
      <div className="max-h-[400px] overflow-y-auto">
        {/* Asks (Sells) - Red */}
        {displayAsks.map((order, idx) => {
          const barWidth = (order.amount / maxVolume) * 100;
          const total = order.price * order.amount;
          return (
            <div
              key={`ask-${idx}`}
              className="relative grid grid-cols-3 gap-2 px-3 py-1.5 text-xs hover:bg-accent/50 cursor-pointer"
            >
              <div 
                className="absolute inset-0 bg-green-500/10" 
                style={{ width: `${barWidth}%` }} 
              />
              <div className="relative text-green-500 font-medium">
                {formatPrice(order.price)}
              </div>
              <div className="relative text-right">{formatVolume(order.amount)}</div>
              <div className="relative text-right text-muted-foreground">
                {formatPrice(total)}
              </div>
            </div>
          );
        })}
        
        {/* Spread */}
        <div className="px-3 py-2 text-center text-xs font-medium border-y border-border bg-muted/30">
          Spread: {spread}
        </div>

        {/* Bids (Buys) - Green shows as red on sell side */}
        {displayBids.map((order, idx) => {
          const barWidth = (order.amount / maxVolume) * 100;
          const total = order.price * order.amount;
          return (
            <div
              key={`bid-${idx}`}
              className="relative grid grid-cols-3 gap-2 px-3 py-1.5 text-xs hover:bg-accent/50 cursor-pointer"
            >
              <div 
                className="absolute inset-0 bg-red-500/10" 
                style={{ width: `${barWidth}%` }} 
              />
              <div className="relative text-red-500 font-medium">
                {formatPrice(order.price)}
              </div>
              <div className="relative text-right">{formatVolume(order.amount)}</div>
              <div className="relative text-right text-muted-foreground">
                {formatPrice(total)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
