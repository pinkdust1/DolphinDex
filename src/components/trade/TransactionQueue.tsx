import { X } from "lucide-react";

export const TransactionQueue = () => {
  return (
    <div className="fixed bottom-4 right-4 w-80 bg-card border border-border rounded-lg shadow-lg">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <span className="text-sm font-medium">Transaction Queue</span>
        <button className="hover:bg-accent p-1 rounded-md transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4">
        <div className="flex gap-3">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-primary" />
            </div>
            <div className="w-0.5 h-8 bg-border" />
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-muted-foreground" />
            </div>
            <div className="w-0.5 h-8 bg-border" />
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-muted-foreground" />
            </div>
          </div>

          <div className="flex-1 space-y-6">
            <div>
              <p className="text-sm font-medium mb-2">Signing</p>
              <div className="text-xs text-muted-foreground">No pending transactions</div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Submitting</p>
              <div className="text-xs text-muted-foreground">No pending transactions</div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Confirmed</p>
              <div className="text-xs text-muted-foreground">No transactions</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
