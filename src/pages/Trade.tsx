import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { TradingTabs } from "@/components/trade/TradingTabs";
import { CurrentTickers } from "@/components/trade/CurrentTickers";
import { ChartWrapper } from "@/components/trade/ChartWrapper";
import { OrderActions } from "@/components/trade/OrderActions";
import { Orderbook } from "@/components/trade/Orderbook";
import { ExchangeHistory } from "@/components/trade/ExchangeHistory";
import { DepthChart } from "@/components/trade/DepthChart";
import type { Token, OHLCData, OrderBookData, Trade as TradeType, TimeInterval } from "@/types/trading";
import { tradingApi } from "@/services/tradingApi";

const Trade = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [interval, setInterval] = useState<TimeInterval>("1m");
  const [ohlc, setOhlc] = useState<OHLCData[]>([]);
  const [orderBook, setOrderBook] = useState<OrderBookData | null>(null);
  const [trades, setTrades] = useState<TradeType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const selectedPair = {
    base: selectedToken?.symbol || "SOLO",
    quote: "XRP"
  };

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

  const handlePairChange = (pair: { base: string; quote: string }, token?: Token) => {
    if (token) {
      setSelectedToken(token);
    } else {
      const foundToken = tokens.find(t => t.symbol === pair.base);
      if (foundToken) {
        setSelectedToken(foundToken);
      }
    }
    setInterval("1m"); // Reset to 1m chart when changing pair
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto p-4 pt-20 flex items-center justify-center">
          <div className="text-muted-foreground">Loading trading data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto p-4 space-y-4 pt-20">
        {/* Trading Tabs */}
        <TradingTabs 
          selectedPair={selectedPair} 
          onPairChange={handlePairChange} 
        />

        {/* Ticker Information */}
        <CurrentTickers 
          pair={selectedPair} 
          token={selectedToken}
        />

        {/* Main Trading Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column - Chart */}
          <div className="lg:col-span-9 space-y-4">
            <ChartWrapper 
              pair={selectedPair}
              ohlcData={ohlc}
              interval={interval}
              onIntervalChange={setInterval}
            />

            {/* Open Orders / Order History */}
            <ExchangeHistory trades={trades} />
          </div>

          {/* Right Column - Order Actions, Orderbook, Depth */}
          <div className="lg:col-span-3 space-y-4">
            <OrderActions pair={selectedPair} />
            <Orderbook pair={selectedPair} orderBook={orderBook} />
            <DepthChart />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trade;
