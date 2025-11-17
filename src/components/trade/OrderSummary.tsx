import { useState } from "react";
import { X } from "lucide-react";

export const OrderSummary = () => {
  const [activeTab, setActiveTab] = useState<"open" | "history">("open");

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-border">
        <div className="flex">
          <button
            onClick={() => setActiveTab("open")}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "open"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Open Orders
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "history"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Order History
          </button>
        </div>
        <button className="mr-3 hover:bg-accent p-1 rounded-md transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Headers */}
      <div className="grid grid-cols-6 gap-4 px-4 py-2 text-xs text-muted-foreground bg-muted/50">
        <div>Side</div>
        <div>Price</div>
        <div>Volume</div>
        <div>Total</div>
        <div></div>
        <div></div>
      </div>

      {/* Content */}
      <div className="min-h-[200px] flex items-center justify-center p-4">
        <p className="text-sm text-muted-foreground">No {activeTab === "open" ? "open orders" : "order history"}</p>
      </div>
    </div>
  );
};
