import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface OrderActionsProps {
  pair: { base: string; quote: string };
}

export const OrderActions = ({ pair }: OrderActionsProps) => {
  const [orderType, setOrderType] = useState<"buy" | "sell">("buy");
  const [tradeType, setTradeType] = useState<"market" | "limit">("market");
  const [amount, setAmount] = useState("");

  const percentages = [25, 50, 75, 100];

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      {/* Balances */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-muted-foreground mb-1">{pair.base} Available</p>
          <p className="text-sm font-medium">0</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">{pair.quote} Available</p>
          <p className="text-sm font-medium">100.7195</p>
        </div>
      </div>

      {/* Buy/Sell Switch */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg">
        <Button
          variant={orderType === "buy" ? "default" : "ghost"}
          size="sm"
          onClick={() => setOrderType("buy")}
          className={orderType === "buy" ? "bg-green-600 hover:bg-green-700" : ""}
        >
          Buy
        </Button>
        <Button
          variant={orderType === "sell" ? "default" : "ghost"}
          size="sm"
          onClick={() => setOrderType("sell")}
          className={orderType === "sell" ? "bg-red-600 hover:bg-red-700" : ""}
        >
          Sell
        </Button>
      </div>

      {/* Market/Limit */}
      <div className="flex gap-2">
        <Button
          variant={tradeType === "market" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setTradeType("market")}
        >
          Market
        </Button>
        <Button
          variant={tradeType === "limit" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setTradeType("limit")}
        >
          Limit
        </Button>
      </div>

      {/* Amount Input */}
      <div className="space-y-2">
        <div className="relative">
          <Input
            type="text"
            placeholder="Enter Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="pr-16"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {pair.base}
          </span>
        </div>

        {/* Percentage Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {percentages.map((pct) => (
            <Button key={pct} variant="outline" size="sm" className="h-7 text-xs">
              {pct}%
            </Button>
          ))}
        </div>
      </div>

      {/* Total */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Total:</span>
        <span className="font-medium">0 {pair.quote}</span>
      </div>

      {/* Place Order Button */}
      <Button
        className={`w-full ${
          orderType === "buy"
            ? "bg-green-600 hover:bg-green-700"
            : "bg-red-600 hover:bg-red-700"
        }`}
        disabled={!amount}
      >
        Place Market Order
      </Button>
    </div>
  );
};
