import { X } from "lucide-react";

export const DepthChart = () => {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <span className="text-sm font-medium">Depth Chart</span>
        <button className="hover:bg-accent p-1 rounded-md transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="h-[200px] flex items-center justify-center bg-background/50">
        <p className="text-sm text-muted-foreground">Depth Chart</p>
      </div>
    </div>
  );
};
