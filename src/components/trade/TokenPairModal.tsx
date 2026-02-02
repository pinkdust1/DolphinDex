import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, TrendingUp, TrendingDown } from "lucide-react";
import { tradingApi } from "@/services/tradingApi";
import type { Token } from "@/types/trading";

interface TokenPairModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectPair: (pair: { base: string; quote: string }, token: Token) => void;
}

export const TokenPairModal = ({ open, onOpenChange, onSelectPair }: TokenPairModalProps) => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (open) {
      loadTokens();
    }
  }, [open]);

  const loadTokens = async () => {
    setIsLoading(true);
    const fetchedTokens = await tradingApi.getTokens();
    setTokens(fetchedTokens);
    setIsLoading(false);
  };

  const filteredTokens = tokens.filter(token =>
    token.symbol.toLowerCase().includes(search.toLowerCase()) ||
    token.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectToken = (token: Token) => {
    onSelectPair({ base: token.symbol, quote: "XRP" }, token);
    onOpenChange(false);
    setSearch("");
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1_000_000) return `${(volume / 1_000_000).toFixed(2)}M`;
    if (volume >= 1_000) return `${(volume / 1_000).toFixed(2)}K`;
    return volume.toFixed(2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Выберите токен</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по названию или символу..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-background border-border"
          />
        </div>

        <ScrollArea className="h-[400px] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Загрузка токенов...</div>
            </div>
          ) : filteredTokens.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Токены не найдены</div>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredTokens.map((token, index) => (
                <button
                  key={token.base || index}
                  onClick={() => handleSelectToken(token)}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm">
                      {token.icon || token.symbol.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">
                        {token.symbol}/XRP
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {token.name}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono text-sm text-foreground">
                      {token.price.toFixed(6)}
                    </div>
                    <div className={`flex items-center justify-end gap-1 text-xs ${
                      token.change24h >= 0 ? "text-green-500" : "text-red-500"
                    }`}>
                      {token.change24h >= 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {token.change24h >= 0 ? "+" : ""}{token.change24h.toFixed(2)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Vol: {formatVolume(token.volume24h)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};