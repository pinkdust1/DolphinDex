import { X, Wallet } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trade } from "@/types/trading";

interface UserOrder {
  id: string;
  side: 'buy' | 'sell';
  price: number;
  amount: number;
  filled: number;
  status: 'open' | 'partial' | 'filled' | 'cancelled';
  createdAt: number;
}

interface ExchangeHistoryProps {
  trades?: Trade[];
  userOrders?: UserOrder[];
  orderHistory?: UserOrder[];
  isWalletConnected?: boolean;
}

export const ExchangeHistory = ({ 
  trades = [], 
  userOrders = [], 
  orderHistory = [],
  isWalletConnected = false 
}: ExchangeHistoryProps) => {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <Tabs defaultValue="open-orders" className="w-full">
        <div className="flex items-center justify-between p-3 border-b border-border">
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
            <TabsTrigger 
              value="recent-trades"
              className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-foreground text-muted-foreground px-0 py-1 font-medium"
            >
              Recent Trades
            </TabsTrigger>
          </TabsList>
          <button className="hover:bg-accent p-1 rounded-md transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Open Orders - User specific */}
        <TabsContent value="open-orders" className="m-0">
          <div className="grid grid-cols-5 gap-2 px-3 py-2 text-xs text-muted-foreground bg-muted/50">
            <div>Side</div>
            <div>Price</div>
            <div className="text-right">Amount</div>
            <div className="text-right">Filled</div>
            <div className="text-right">Status</div>
          </div>
          <div className="min-h-[150px] max-h-[300px] overflow-y-auto">
            {!isWalletConnected ? (
              <div className="flex flex-col items-center justify-center h-[150px] text-sm text-muted-foreground gap-2">
                <Wallet className="w-8 h-8 opacity-50" />
                <span>Connect wallet to view your orders</span>
              </div>
            ) : userOrders.length === 0 ? (
              <div className="flex items-center justify-center h-[150px] text-sm text-muted-foreground">
                No open orders
              </div>
            ) : (
              userOrders.map((order) => (
                <div key={order.id} className="grid grid-cols-5 gap-2 px-3 py-1.5 text-xs hover:bg-accent/50">
                  <div className={order.side === "buy" ? "text-green-500" : "text-red-500"}>
                    {order.side.toUpperCase()}
                  </div>
                  <div>{order.price.toFixed(5)}</div>
                  <div className="text-right">{order.amount.toFixed(5)}</div>
                  <div className="text-right">{order.filled.toFixed(5)}</div>
                  <div className="text-right capitalize text-muted-foreground">
                    {order.status}
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* Order History - User specific */}
        <TabsContent value="order-history" className="m-0">
          <div className="grid grid-cols-5 gap-2 px-3 py-2 text-xs text-muted-foreground bg-muted/50">
            <div>Side</div>
            <div>Price</div>
            <div className="text-right">Amount</div>
            <div className="text-right">Filled</div>
            <div className="text-right">Status</div>
          </div>
          <div className="min-h-[150px] max-h-[300px] overflow-y-auto">
            {!isWalletConnected ? (
              <div className="flex flex-col items-center justify-center h-[150px] text-sm text-muted-foreground gap-2">
                <Wallet className="w-8 h-8 opacity-50" />
                <span>Connect wallet to view order history</span>
              </div>
            ) : orderHistory.length === 0 ? (
              <div className="flex items-center justify-center h-[150px] text-sm text-muted-foreground">
                No order history
              </div>
            ) : (
              orderHistory.map((order) => (
                <div key={order.id} className="grid grid-cols-5 gap-2 px-3 py-1.5 text-xs hover:bg-accent/50">
                  <div className={order.side === "buy" ? "text-green-500" : "text-red-500"}>
                    {order.side.toUpperCase()}
                  </div>
                  <div>{order.price.toFixed(5)}</div>
                  <div className="text-right">{order.amount.toFixed(5)}</div>
                  <div className="text-right">{order.filled.toFixed(5)}</div>
                  <div className="text-right capitalize text-muted-foreground">
                    {order.status}
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* Recent Trades - Public market data */}
        <TabsContent value="recent-trades" className="m-0">
          <div className="grid grid-cols-4 gap-2 px-3 py-2 text-xs text-muted-foreground bg-muted/50">
            <div>Side</div>
            <div>Price</div>
            <div className="text-right">Volume</div>
            <div className="text-right">Total</div>
          </div>
          <div className="min-h-[150px] max-h-[300px] overflow-y-auto">
            {trades.length === 0 ? (
              <div className="flex items-center justify-center h-[150px] text-sm text-muted-foreground">
                No recent trades
              </div>
            ) : (
              trades.slice(0, 20).map((trade, idx) => (
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
        </TabsContent>
      </Tabs>
    </div>
  );
};
