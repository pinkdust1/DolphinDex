import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { TradingChart } from "@/components/trade/TradingChart";
import { TradingOrderBook } from "@/components/trade/TradingOrderBook";
import { TradingRecentTrades } from "@/components/trade/TradingRecentTrades";
import { TokenSelector } from "@/components/trade/TokenSelector";
import { Button } from "@/components/ui/button";
import type { Token, OHLCData, OrderBookData, Trade as TradeType, TimeInterval } from "@/types/trading";
import { tradingApi } from "@/services/tradingApi";

const intervals: TimeInterval[] = ["1m", "5m", "15m", "1h", "4h", "1d"];

const Trade = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [interval, setInterval] = useState<TimeInterval>("1h");
  const [ohlc, setOhlc] = useState<OHLCData[]>([]);
  const [orderBook, setOrderBook] = useState<OrderBookData | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load tokens on mount
  useEffect(() => {
    const loadTokens = async () => {
      const fetchedTokens = await tradingApi.getTokens();
      setTokens(fetchedTokens);
      if (fetchedTokens.length > 0) {
        setSelectedToken(fetchedTokens[0]);
      }
      setIsLoading(false);
    };
    loadTokens();
  }, []);

  // Load market data when token or interval changes
  useEffect(() => {
    if (!selectedToken?.base) return;

    const fetchMarketData = async () => {
      const [ohlcData, obData, tradeData] = await Promise.all([
        tradingApi.getOHLC(selectedToken.base!, interval),
        tradingApi.getOrderBook(selectedToken.base!),
        tradingApi.getTrades(selectedToken.base!),
      ]);
      setOhlc(ohlcData);
      setOrderBook(obData);
      setTrades(tradeData);
    };

    fetchMarketData();
    const refreshTimer = window.setInterval(fetchMarketData, 5000);
    return () => window.clearInterval(refreshTimer);
  }, [selectedToken, interval]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto p-4 space-y-4 pt-20">
        {/* Token Selector & Interval Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-card border border-border rounded-lg p-3">
          <div className="flex items-center gap-4">
            <TokenSelector
              tokens={tokens}
              selectedToken={selectedToken}
              onSelect={setSelectedToken}
              isLoading={isLoading}
            />
            {selectedToken && (
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <span className={selectedToken.change24h >= 0 ? "text-green-500" : "text-destructive"}>
                  {selectedToken.change24h >= 0 ? "+" : ""}{selectedToken.change24h.toFixed(2)}%
                </span>
                <span className="text-muted-foreground">Vol: {(selectedToken.volume24h / 1000).toFixed(0)}K</span>
              </div>
            )}
          </div>

          <div className="flex bg-muted p-1 rounded-lg">
            {intervals.map((int) => (
              <Button
                key={int}
                variant={interval === int ? "default" : "ghost"}
                size="sm"
                onClick={() => setInterval(int)}
                className="h-7 px-3"
              >
                {int}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Chart Section */}
          <div className="lg:col-span-9 space-y-4">
            <div className="bg-card border border-border rounded-lg overflow-hidden h-[500px]">
              <TradingChart data={ohlc} interval={interval} />
            </div>
            <TradingRecentTrades trades={trades} isLoading={isLoading} />
          </div>

          {/* Order Book */}
          <div className="lg:col-span-3">
            <TradingOrderBook data={orderBook} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trade;
