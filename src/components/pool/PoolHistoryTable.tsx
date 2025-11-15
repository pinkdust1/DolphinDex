import { useState } from "react";
import { ExternalLink, ArrowRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Transaction {
  activity: "swap" | "deposit" | "withdraw";
  fromAmount: string;
  fromCurrency: string;
  toAmount: string;
  toCurrency: string;
  account: string;
  time: string;
  txHash: string;
}

interface PoolHistoryTableProps {
  transactions: Transaction[];
}

export const PoolHistoryTable = ({ transactions }: PoolHistoryTableProps) => {
  const [activeTab, setActiveTab] = useState<"pool" | "my">("pool");

  const formatAmount = (amount: string) => {
    const [whole, decimal] = amount.split(".");
    return (
      <>
        <span className="text-foreground">{whole}</span>
        {decimal && <span className="text-muted-foreground">.{decimal}</span>}
      </>
    );
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("pool")}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
            activeTab === "pool"
              ? "text-foreground border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Pool History
        </button>
        <button
          onClick={() => setActiveTab("my")}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
            activeTab === "my"
              ? "text-foreground border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          My History
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[15%]">Activity</TableHead>
              <TableHead className="w-[35%]">Amount</TableHead>
              <TableHead className="w-[30%]">Account</TableHead>
              <TableHead className="text-right w-[20%]">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <svg
                      width="21"
                      height="18"
                      viewBox="0 0 19 18"
                      fill="none"
                      className="text-muted-foreground"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M3.72516 11.6641C3.74533 11.7647 3.79514 11.8575 3.86858 11.9304L6.58479 14.6278C6.63294 14.6769 6.69045 14.7162 6.7541 14.7433C6.81843 14.7708 6.88769 14.7853 6.95782 14.7859C7.02795 14.7865 7.09746 14.7732 7.16228 14.7469C7.22709 14.7206 7.28586 14.6817 7.3352 14.6327C7.38453 14.5838 7.42345 14.5256 7.44978 14.4617C7.4761 14.3979 7.48932 14.3295 7.48872 14.2606C7.48812 14.1917 7.47371 14.1235 7.44628 14.0601C7.41909 13.9973 7.37963 13.9402 7.33008 13.8924L7.3274 13.8897L5.50875 12.0836L14.76 12.0836C14.9001 12.0836 15.0342 12.0283 15.1327 11.9305C15.2313 11.8326 15.2863 11.7004 15.2863 11.5628C15.2863 11.4252 15.2313 11.293 15.1327 11.1951C15.0342 11.0973 14.9001 11.042 14.76 11.042L4.24113 11.042C4.13667 11.042 4.03472 11.0728 3.94817 11.1303C3.86164 11.1878 3.79448 11.2692 3.75489 11.3642C3.71531 11.4591 3.70499 11.5634 3.72516 11.6641ZM11.6706 4.09674L13.4924 5.9059H4.24115C4.10099 5.9059 3.96694 5.9612 3.86837 6.05907C3.76986 6.15689 3.71484 6.28917 3.71484 6.42673C3.71484 6.56429 3.76986 6.69657 3.86837 6.79439C3.96692 6.89224 4.10095 6.94754 4.24108 6.94756L14.76 6.94749C14.8644 6.94744 14.9664 6.91665 15.0529 6.85921C15.1394 6.80178 15.2066 6.72035 15.2462 6.62543C15.2858 6.53053 15.2961 6.42621 15.276 6.32557C15.2559 6.22503 15.2061 6.13221 15.1327 6.05922L12.4185 3.3638L12.417 3.36237C12.318 3.26681 12.1846 3.21348 12.0458 3.21447C11.907 3.21547 11.7745 3.27068 11.6768 3.36763C11.5792 3.46453 11.5243 3.59529 11.5233 3.73155C11.5223 3.86717 11.5754 3.99865 11.6706 4.09674Z"
                        fill="currentColor"
                      />
                    </svg>
                    <span className="text-sm text-foreground capitalize">
                      {tx.activity}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-medium">
                        {formatAmount(tx.fromAmount)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {tx.fromCurrency}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-medium">
                        {formatAmount(tx.toAmount)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {tx.toCurrency}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-mono text-muted-foreground">
                    {tx.account}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-sm text-muted-foreground">
                      {tx.time}
                    </span>
                    <button
                      onClick={() =>
                        window.open(
                          `https://livenet.xrpl.org/transactions/${tx.txHash}`,
                          "_blank"
                        )
                      }
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
