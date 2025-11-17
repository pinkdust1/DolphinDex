import { X } from "lucide-react";

export const ExchangeHistory = () => {
  const mockHistory = [
    { price: 0.08511, volume: 54.7724, time: "23:47:42", type: "sell" },
    { price: 0.08523, volume: 141.65615, time: "23:47:42", type: "sell" },
    { price: 0.08515, volume: 98.234, time: "23:47:41", type: "buy" },
    { price: 0.08509, volume: 67.123, time: "23:47:40", type: "buy" },
  ];

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <span className="text-sm font-medium">Exchange History</span>
        <button className="hover:bg-accent p-1 rounded-md transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 px-3 py-2 text-xs text-muted-foreground bg-muted/50">
        <div>Price</div>
        <div className="text-right">Volume</div>
        <div className="text-right">Time</div>
      </div>

      <div className="max-h-[300px] overflow-y-auto">
        {mockHistory.map((item, idx) => (
          <div key={idx} className="grid grid-cols-3 gap-2 px-3 py-1.5 text-xs hover:bg-accent/50">
            <div className={item.type === "buy" ? "text-green-500" : "text-red-500"}>
              {item.price.toFixed(5)}
            </div>
            <div className="text-right">{item.volume.toFixed(5)}</div>
            <div className="text-right text-muted-foreground">{item.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
