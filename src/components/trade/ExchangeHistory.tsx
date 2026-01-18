import { X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trade } from "@/types/trading";

interface ExchangeHistoryProps {
  trades?: Trade[];
}

export const ExchangeHistory = ({ trades = [] }: ExchangeHistoryProps) => {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <Tabs defaultValue="open-orders" className="w-full">
          <div className="flex items-center justify-between">
            <TabsList className="bg-transparent h-auto p-0 gap-4">
              <TabsTrigger 
                value="open-orders" 
                className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-foreground text-muted-foreground px-0 py-1 font-medium"
              >
                Open Orders
              </TabsTrigger>
              <TabsTrigger 
                value="order-history"
                className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-foreground text-muted-foreground px-0 py-1 font-medium"
              >
                Order History
              </TabsTrigger>
            </TabsList>
            <button className="hover:bg-accent p-1 rounded-md transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </Tabs>
      </div>

      <div className="grid grid-cols-4 gap-2 px-3 py-2 text-xs text-muted-foreground bg-muted/50">
        <div>Side</div>
        <div>Price</div>
        <div className="text-right">Volume</div>
        <div className="text-right">Total</div>
      </div>

      <div className="min-h-[150px] max-h-[300px] overflow-y-auto">
        {trades.length === 0 ? (
          <div className="flex items-center justify-center h-[150px] text-sm text-muted-foreground">
            No open orders
          </div>
        ) : (
          trades.slice(0, 10).map((trade, idx) => (
            <div key={idx} className="grid grid-cols-4 gap-2 px-3 py-1.5 text-xs hover:bg-accent/50">
              <div className={trade.side === "buy" ? "text-green-500" : "text-red-500"}>
                {trade.side.toUpperCase()}
              </div>
              <div>{trade.price.toFixed(5)}</div>
              <div className="text-right">{trade.amount.toFixed(5)}</div>
              <div className="text-right text-muted-foreground">
                {(trade.price * trade.amount).toFixed(5)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
