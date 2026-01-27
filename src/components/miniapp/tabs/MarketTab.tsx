import { ShoppingCart, Package, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export const MarketTab = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <ShoppingCart className="w-6 h-6 text-foreground" />
        <h2 className="text-xl font-bold text-foreground">Market</h2>
      </div>
      
      <p className="text-muted-foreground text-sm">
        Buy and sell in-game items and NFTs.
      </p>
      
      {/* Coming Soon Placeholder */}
      <Card className="bg-card border-border mt-4">
        <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
          
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Marketplace Coming Soon
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Trade in-game items, NFTs, and exclusive collectibles with other players.
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
            <Sparkles className="w-4 h-4" />
            <span>Stay tuned for updates</span>
          </div>
        </CardContent>
      </Card>
      
      {/* Feature Preview */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="p-4 bg-muted/50 rounded-lg text-center">
          <div className="text-2xl mb-2">🎮</div>
          <p className="text-sm font-medium text-foreground">Game Items</p>
          <p className="text-xs text-muted-foreground">Coming soon</p>
        </div>
        
        <div className="p-4 bg-muted/50 rounded-lg text-center">
          <div className="text-2xl mb-2">🖼️</div>
          <p className="text-sm font-medium text-foreground">NFTs</p>
          <p className="text-xs text-muted-foreground">Coming soon</p>
        </div>
        
        <div className="p-4 bg-muted/50 rounded-lg text-center">
          <div className="text-2xl mb-2">🎁</div>
          <p className="text-sm font-medium text-foreground">Rewards</p>
          <p className="text-xs text-muted-foreground">Coming soon</p>
        </div>
        
        <div className="p-4 bg-muted/50 rounded-lg text-center">
          <div className="text-2xl mb-2">💎</div>
          <p className="text-sm font-medium text-foreground">Premium</p>
          <p className="text-xs text-muted-foreground">Coming soon</p>
        </div>
      </div>
    </div>
  );
};
