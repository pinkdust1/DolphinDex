import { useState } from "react";
import { X, Check, Loader2 } from "lucide-react";

interface Transaction {
  id: string;
  status: "signing" | "submitting" | "confirmed";
  type: string;
  amount: string;
  timestamp: Date;
}

export const TransactionQueue = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [transactions] = useState<Transaction[]>([
    // Example transactions - remove in production
    // {
    //   id: "1",
    //   status: "signing",
    //   type: "Buy SOLO",
    //   amount: "100 XRP",
    //   timestamp: new Date(),
    // },
  ]);

  if (!isVisible) return null;

  const signingTxs = transactions.filter((tx) => tx.status === "signing");
  const submittingTxs = transactions.filter((tx) => tx.status === "submitting");
  const confirmedTxs = transactions.filter((tx) => tx.status === "confirmed");

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-card border border-border rounded-lg shadow-lg animate-fade-in z-50">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <span className="text-sm font-medium">Transaction Queue</span>
        <button
          onClick={() => setIsVisible(false)}
          className="hover:bg-accent p-1 rounded-md transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4">
        <div className="flex gap-3">
          {/* Status indicators */}
          <div className="flex flex-col items-center gap-2">
            {/* Signing */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                signingTxs.length > 0
                  ? "bg-primary/20"
                  : "bg-muted"
              }`}
            >
              {signingTxs.length > 0 ? (
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
              ) : (
                <div className="w-4 h-4 rounded-full bg-muted-foreground" />
              )}
            </div>
            <div className="w-0.5 h-8 bg-border" />

            {/* Submitting */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                submittingTxs.length > 0
                  ? "bg-primary/20"
                  : "bg-muted"
              }`}
            >
              {submittingTxs.length > 0 ? (
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
              ) : (
                <div className="w-4 h-4 rounded-full bg-muted-foreground" />
              )}
            </div>
            <div className="w-0.5 h-8 bg-border" />

            {/* Confirmed */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                confirmedTxs.length > 0
                  ? "bg-green-500/20"
                  : "bg-muted"
              }`}
            >
              {confirmedTxs.length > 0 ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <div className="w-4 h-4 rounded-full bg-muted-foreground" />
              )}
            </div>
          </div>

          {/* Transaction lists */}
          <div className="flex-1 space-y-6">
            {/* Signing */}
            <div>
              <p className="text-sm font-medium mb-2">Signing</p>
              {signingTxs.length > 0 ? (
                <div className="space-y-2">
                  {signingTxs.map((tx) => (
                    <div
                      key={tx.id}
                      className="text-xs p-2 rounded bg-muted/50"
                    >
                      <div className="font-medium">{tx.type}</div>
                      <div className="text-muted-foreground">{tx.amount}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">
                  No pending transactions
                </div>
              )}
            </div>

            {/* Submitting */}
            <div>
              <p className="text-sm font-medium mb-2">Submitting</p>
              {submittingTxs.length > 0 ? (
                <div className="space-y-2">
                  {submittingTxs.map((tx) => (
                    <div
                      key={tx.id}
                      className="text-xs p-2 rounded bg-muted/50"
                    >
                      <div className="font-medium">{tx.type}</div>
                      <div className="text-muted-foreground">{tx.amount}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">
                  No pending transactions
                </div>
              )}
            </div>

            {/* Confirmed */}
            <div>
              <p className="text-sm font-medium mb-2">Confirmed</p>
              {confirmedTxs.length > 0 ? (
                <div className="space-y-2">
                  {confirmedTxs.map((tx) => (
                    <div
                      key={tx.id}
                      className="text-xs p-2 rounded bg-green-500/10"
                    >
                      <div className="font-medium text-green-500">{tx.type}</div>
                      <div className="text-muted-foreground">{tx.amount}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">
                  No transactions
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
