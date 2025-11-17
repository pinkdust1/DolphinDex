import { useState } from "react";
import { Header } from "@/components/Header";
import { TradingTabs } from "@/components/trade/TradingTabs";
import { CurrentTickers } from "@/components/trade/CurrentTickers";
import { ChartWrapper } from "@/components/trade/ChartWrapper";
import { OrderActions } from "@/components/trade/OrderActions";
import { Orderbook } from "@/components/trade/Orderbook";
import { DepthChart } from "@/components/trade/DepthChart";
import { OrderSummary } from "@/components/trade/OrderSummary";
import { ExchangeHistory } from "@/components/trade/ExchangeHistory";
import { TransactionQueue } from "@/components/trade/TransactionQueue";

const Trade = () => {
  const [selectedPair, setSelectedPair] = useState({ base: "SOLO", quote: "XRP" });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto p-4 space-y-4">
        <TradingTabs selectedPair={selectedPair} onPairChange={setSelectedPair} />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Section */}
          <div className="lg:col-span-9 space-y-4">
            <CurrentTickers pair={selectedPair} />
            <ChartWrapper pair={selectedPair} />
            <OrderSummary />
          </div>

          {/* Right Section */}
          <div className="lg:col-span-3 space-y-4">
            <OrderActions pair={selectedPair} />
            <Orderbook pair={selectedPair} />
            <DepthChart />
            <ExchangeHistory />
          </div>
        </div>
      </div>

      <TransactionQueue />
    </div>
  );
};

export default Trade;
