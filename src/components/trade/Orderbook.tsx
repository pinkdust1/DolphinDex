import { X } from "lucide-react";

interface OrderbookProps {
  pair: { base: string; quote: string };
}

export const Orderbook = ({ pair }: OrderbookProps) => {
  const mockOrders = [
    { price: 0.08443, volume: 261, total: 22.03563 },
    { price: 0.08442, volume: 150, total: 12.663 },
    { price: 0.08441, volume: 300, total: 25.323 },
    { price: 0.08440, volume: 200, total: 16.88 },
    { price: 0.08439, volume: 180, total: 15.1902 },
  ];

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
        {mockOrders.map((order, idx) => (
          <div
            key={idx}
            className="relative grid grid-cols-3 gap-2 px-3 py-1.5 text-xs hover:bg-accent/50 cursor-pointer"
          >
            <div className="absolute inset-0 bg-green-500/10" style={{ width: '30%' }} />
            <div className="relative text-green-500 font-medium">
              {order.price.toFixed(5)}
            </div>
            <div className="relative text-right">{order.volume}</div>
            <div className="relative text-right text-muted-foreground">
              {order.total.toFixed(5)}
            </div>
          </div>
        ))}
        
        {/* Spread */}
        <div className="px-3 py-2 text-center text-xs font-medium border-y border-border bg-muted/30">
          Spread: 0.00001
        </div>

        {mockOrders.reverse().map((order, idx) => (
          <div
            key={idx}
            className="relative grid grid-cols-3 gap-2 px-3 py-1.5 text-xs hover:bg-accent/50 cursor-pointer"
          >
            <div className="absolute inset-0 bg-red-500/10" style={{ width: '25%' }} />
            <div className="relative text-red-500 font-medium">
              {(order.price - 0.00002).toFixed(5)}
            </div>
            <div className="relative text-right">{order.volume}</div>
            <div className="relative text-right text-muted-foreground">
              {order.total.toFixed(5)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
