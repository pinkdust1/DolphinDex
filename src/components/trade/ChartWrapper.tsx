import { useState } from "react";
import { Maximize2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChartWrapperProps {
  pair: { base: string; quote: string };
}

export const ChartWrapper = ({ pair }: ChartWrapperProps) => {
  const [interval, setInterval] = useState("1W");
  const intervals = ["1m", "1h", "1D", "3D", "1W"];

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          {intervals.map((int) => (
            <Button
              key={int}
              variant={interval === int ? "default" : "ghost"}
              size="sm"
              onClick={() => setInterval(int)}
              className="h-7"
            >
              {int}
            </Button>
          ))}
          <Button variant="ghost" size="sm" className="h-7">
            Technical Ind
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <button className="hover:bg-accent p-2 rounded-md transition-colors">
            <Save className="w-4 h-4" />
          </button>
          <button className="hover:bg-accent p-2 rounded-md transition-colors">
            <Maximize2 className="w-4 h-4" />
          </button>
          <button className="hover:bg-accent p-2 rounded-md transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative w-full h-[500px] bg-background/50 flex items-center justify-center">
        <p className="text-muted-foreground">
          Chart for {pair.base}/{pair.quote} - {interval}
        </p>
      </div>
    </div>
  );
};
