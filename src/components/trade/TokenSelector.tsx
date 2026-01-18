import { useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Token } from "@/types/trading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TokenSelectorProps {
  tokens: Token[];
  selectedToken: Token | null;
  onSelect: (token: Token) => void;
  isLoading?: boolean;
}

export const TokenSelector = ({
  tokens,
  selectedToken,
  onSelect,
  isLoading,
}: TokenSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredTokens = tokens.filter(
    (token) =>
      token.symbol.toLowerCase().includes(search.toLowerCase()) ||
      token.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (token: Token) => {
    onSelect(token);
    setOpen(false);
    setSearch("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="justify-between gap-2 min-w-[180px]"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="text-muted-foreground">Loading...</span>
          ) : selectedToken ? (
            <div className="flex items-center gap-2">
              {selectedToken.icon && (
                <span className="text-base">{selectedToken.icon}</span>
              )}
              <span className="font-medium">{selectedToken.symbol}</span>
              <span className="text-muted-foreground">/ XRP</span>
            </div>
          ) : (
            <span className="text-muted-foreground">Select token</span>
          )}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <div className="p-2 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tokens..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <ScrollArea className="h-[300px]">
          {filteredTokens.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No tokens found
            </div>
          ) : (
            <div className="p-1">
              {filteredTokens.map((token) => (
                <button
                  key={token.base || token.symbol}
                  onClick={() => handleSelect(token)}
                  className={`w-full flex items-center justify-between p-2 rounded-md hover:bg-accent transition-colors ${
                    selectedToken?.base === token.base ? "bg-accent" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {token.icon ? (
                      <span className="text-lg w-8 h-8 flex items-center justify-center bg-muted rounded-full">
                        {token.icon}
                      </span>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-muted border border-border" />
                    )}
                    <div className="text-left">
                      <div className="font-medium text-foreground text-sm">
                        {token.symbol}
                      </div>
                      <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                        {token.name}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono text-foreground">
                      {token.price.toFixed(6)}
                    </div>
                    <div
                      className={`text-xs font-medium ${
                        token.change24h >= 0 ? "text-green-500" : "text-destructive"
                      }`}
                    >
                      {token.change24h >= 0 ? "+" : ""}
                      {token.change24h.toFixed(2)}%
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
