import { ShoppingCart } from 'lucide-react';

export const MarketTab = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <ShoppingCart className="w-6 h-6 text-foreground" />
        <h2 className="text-xl font-bold text-foreground">Market</h2>
      </div>
    </div>
  );
};
