import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { PoolHeader } from "@/components/pool/PoolHeader";
import { ChartCard } from "@/components/pool/ChartCard";
import { LiquidityChart } from "@/components/pool/LiquidityChart";
import { LiquidityForm } from "@/components/pool/LiquidityForm";
import { PoolHistoryTable } from "@/components/pool/PoolHistoryTable";

const PoolDetails = () => {
  const navigate = useNavigate();
  const [priceTimeframe, setPriceTimeframe] = useState("1M");
  const [volumeTimeframe, setVolumeTimeframe] = useState("1M");

  // Mock data - replace with actual data
  const poolData = {
    token1: {
      symbol: "WRB",
      logo: "/amm/images/default.png",
    },
    token2: {
      symbol: "XRP",
      logo: "/amm/images/xrp.svg",
    },
    fee: "0.998%",
    address: "rE1tW1ZuRNjaTkEHaYpucbd6Cx7viMrzT6",
    trustScore: "--",
    currentPrice: "0.1857329022",
    currentVolume: "191.401016",
  };

  const liquidityData = {
    token1: {
      symbol: "WRB",
      amount: "1205.03",
      logo: "/amm/images/default.png",
    },
    token2: {
      symbol: "XRP",
      amount: "221.58",
      logo: "/amm/images/xrp.svg",
    },
    totalValue: "1.4K",
    myContribution: "0",
  };

  const liquidityFormData = {
    token1: {
      symbol: "WRB",
      logo: "/amm/images/default.png",
      available: "0",
    },
    token2: {
      symbol: "XRP",
      logo: "/amm/images/xrp.svg",
      available: "--",
    },
  };

  const transactions = [
    {
      activity: "swap" as const,
      fromAmount: "0.03",
      fromCurrency: "XRP",
      toAmount: "0.16",
      toCurrency: "WRB",
      account: "rLhDWnBFitrn8iW8e5m7bVKqFS5raK1NbP",
      time: "15 Nov, 12:39:41",
      txHash: "123...",
    },
    {
      activity: "swap" as const,
      fromAmount: "0.16",
      fromCurrency: "WRB",
      toAmount: "0.03",
      toCurrency: "XRP",
      account: "rLhDWnBFitrn8iW8e5m7bVKqFS5raK1NbP",
      time: "15 Nov, 12:39:41",
      txHash: "456...",
    },
    {
      activity: "swap" as const,
      fromAmount: "2.00",
      fromCurrency: "XRP",
      toAmount: "10.87",
      toCurrency: "WRB",
      account: "r3XXkB37eVXdjQLsBArQX4c985S7gguVuX",
      time: "15 Nov, 12:39:40",
      txHash: "789...",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 container mx-auto px-4 pb-12">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* Pool Details Container */}
        <div className="space-y-6">
          <PoolHeader poolData={poolData} />

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ChartCard
              title="Price"
              currentValue={poolData.currentPrice}
              symbol="XRP"
              timeframe={priceTimeframe}
              onTimeframeChange={setPriceTimeframe}
              chartType="price"
            />
            <ChartCard
              title="Volume Chart"
              currentValue={poolData.currentVolume}
              symbol="XRP"
              timeframe={volumeTimeframe}
              onTimeframeChange={setVolumeTimeframe}
              chartType="volume"
            />
            <LiquidityChart
              token1={liquidityData.token1}
              token2={liquidityData.token2}
              totalValue={liquidityData.totalValue}
              myContribution={liquidityData.myContribution}
            />
          </div>

          {/* Liquidity & History Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <LiquidityForm
                token1={liquidityFormData.token1}
                token2={liquidityFormData.token2}
              />
            </div>
            <div className="lg:col-span-2">
              <PoolHistoryTable transactions={transactions} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PoolDetails;
