import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpRight } from "lucide-react";

interface LiquidityFormProps {
  token1: {
    symbol: string;
    logo: string;
    available: string;
  };
  token2: {
    symbol: string;
    logo: string;
    available: string;
  };
}

type DepositMode = "single" | "double";
type ActionType = "deposit" | "withdraw";

export const LiquidityForm = ({ token1, token2 }: LiquidityFormProps) => {
  const [action, setAction] = useState<ActionType>("deposit");
  const [mode, setMode] = useState<DepositMode>("single");
  const [amount1, setAmount1] = useState("");
  const [amount2, setAmount2] = useState("");

  return (
    <div className="bg-card border border-border rounded-lg p-6 h-fit">
      {/* Action Tabs */}
      <div className="flex gap-2 mb-6 bg-secondary/50 rounded-lg p-1">
        <button
          onClick={() => setAction("deposit")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            action === "deposit"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Deposit
        </button>
        <button
          onClick={() => setAction("withdraw")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            action === "withdraw"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Withdraw
        </button>
      </div>

      {/* Token Selection */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode("single")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
            mode === "single"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-secondary border-border hover:bg-accent"
          }`}
        >
          <img src={token1.logo} alt={token1.symbol} className="w-5 h-5 rounded-full" />
          <span className="text-sm font-medium">{token1.symbol}</span>
        </button>

        <button
          onClick={() => setMode("single")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-secondary border-border hover:bg-accent transition-colors"
        >
          <img src={token2.logo} alt={token2.symbol} className="w-5 h-5 rounded-full" />
          <span className="text-sm font-medium">{token2.symbol}</span>
        </button>

        <button
          onClick={() => setMode("double")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-secondary border-border hover:bg-accent transition-colors"
        >
          <div className="flex items-center -space-x-2">
            <img
              src={token1.logo}
              alt={token1.symbol}
              className="w-5 h-5 rounded-full border-2 border-background"
            />
            <img
              src={token2.logo}
              alt={token2.symbol}
              className="w-4 h-4 rounded-full"
            />
          </div>
          <div className="flex items-center gap-1 text-sm font-medium">
            <span>{token1.symbol}</span>
            <span className="text-muted-foreground">+</span>
            <span>{token2.symbol}</span>
          </div>
        </button>
      </div>

      {/* Amount Inputs */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Amount
          </label>
          <div className="relative">
            <Input
              type="text"
              inputMode="numeric"
              placeholder="0.00"
              value={amount1}
              onChange={(e) => setAmount1(e.target.value)}
              className="pr-32"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-end gap-1">
              <div className="flex items-center gap-2">
                <img
                  src={token1.logo}
                  alt={token1.symbol}
                  className="w-5 h-5 rounded-full"
                />
                <span className="text-sm font-medium">{token1.symbol}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>Available</span>
                <span className="font-medium">{token1.available}</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="relative">
            <Input
              type="text"
              inputMode="numeric"
              placeholder="0.00"
              value={amount2}
              onChange={(e) => setAmount2(e.target.value)}
              disabled
              className="pr-32 disabled:opacity-50"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-end gap-1">
              <div className="flex items-center gap-2">
                <img
                  src={token2.logo}
                  alt={token2.symbol}
                  className="w-5 h-5 rounded-full"
                />
                <span className="text-sm font-medium">{token2.symbol}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>Available</span>
                <span className="font-medium">--</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
          <span className="text-sm text-muted-foreground">Amount Redeem:</span>
          <div className="flex items-center gap-2">
            <svg
              width="20"
              height="20"
              viewBox="0 0 25 24"
              fill="none"
              className="opacity-50"
            >
              <circle opacity="0.1" cx="12.664" cy="12" r="12" fill="url(#paint0_linear)" />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M11.9915 3.00861V3.00049H11.9976L11.9915 3.00861ZM11.9915 3.00861L5.92417 11.0603C5.75785 11.2812 5.66797 11.55 5.66797 11.8264C5.66797 12.5294 6.23777 13.0992 6.94085 13.0992H10.7175L11.9915 11.4005L7.79149 11.4005L11.9915 5.80049V3.00861ZM11.2772 14.2194L7.09152 19.8006H9.21448L12.1262 15.9181H17.456C18.7034 15.9181 19.7148 14.9068 19.7148 13.6594C19.7148 12.412 18.7034 11.4006 17.456 11.4006H13.3912L12.1172 13.0994H17.456C17.7651 13.0994 18.016 13.35 18.016 13.6594C18.016 13.8139 17.9533 13.9539 17.8519 14.0553C17.7506 14.1566 17.6106 14.2194 17.456 14.2194H11.2772Z"
                fill="currentColor"
              />
            </svg>
            <span className="font-medium text-foreground">0</span>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <Button disabled className="w-full gap-2" variant="secondary">
        <ArrowUpRight className="w-4 h-4" />
        Confirm {action === "deposit" ? "Deposit" : "Withdraw"}
      </Button>
    </div>
  );
};
