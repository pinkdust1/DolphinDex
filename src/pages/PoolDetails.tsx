import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { PoolHeader } from "@/components/pool/PoolHeader";
import { ChartCard } from "@/components/pool/ChartCard";

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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default PoolDetails;
