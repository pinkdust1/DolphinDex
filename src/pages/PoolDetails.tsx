import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { PoolHeader } from "@/components/pool/PoolHeader";
import { ChartCard } from "@/components/pool/ChartCard";
import { LiquidityChart } from "@/components/pool/LiquidityChart";
import { LiquidityForm } from "@/components/pool/LiquidityForm";
import { PoolHistoryTable } from "@/components/pool/PoolHistoryTable";
import { fetchPoolData, fetchPoolContributors } from "@/utils/xrpl";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Sprout, ArrowRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PoolContributors } from "@/components/pool/PoolContributors";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PoolDetails = () => {
  const { address } = useParams<{ address: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [priceTimeframe, setPriceTimeframe] = useState("1M");
  const [volumeTimeframe, setVolumeTimeframe] = useState("1M");
  const [poolData, setPoolData] = useState<any>(null);
  const [contributors, setContributors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [contributorsLoading, setContributorsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPoolData = async () => {
      if (!address) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await fetchPoolData(address);
        setPoolData(data);
        
        // Load contributors in background
        setContributorsLoading(true);
        const contributorsData = await fetchPoolContributors(address, data.ammId);
        
        // Calculate percentages
        const totalLp = parseFloat(data.lpTokenBalance);
        const contributorsWithPercentage = contributorsData.map((c: any) => ({
          ...c,
          percentage: ((parseFloat(c.lpTokens) / totalLp) * 100).toFixed(2)
        }));
        
        setContributors(contributorsWithPercentage);
        setContributorsLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load pool data';
        setError(errorMessage);
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: errorMessage,
        });
      } finally {
        setLoading(false);
      }
    };

    loadPoolData();
  }, [address, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 container mx-auto px-2 sm:px-4 pb-8">
          <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !poolData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 container mx-auto px-2 sm:px-4 pb-8">
          <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || 'Пул не найден'}
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  // Calculate total value (simplified - in real app would need price data)
  const totalValue = parseFloat(poolData.token1.amount) + parseFloat(poolData.token2.amount);
  const formattedTotalValue = totalValue > 1000 
    ? `${(totalValue / 1000).toFixed(1)}K` 
    : totalValue.toFixed(2);

  // Calculate current price
  const currentPrice = (parseFloat(poolData.token2.amount) / parseFloat(poolData.token1.amount)).toFixed(8);

  // Format transactions for display
  const formattedTransactions = poolData.transactions.map((tx: any) => ({
    activity: tx.type === 'Payment' ? 'swap' as const : 'add' as const,
    fromAmount: '--',
    fromCurrency: poolData.token1.symbol,
    toAmount: '--',
    toCurrency: poolData.token2.symbol,
    account: tx.account,
    time: tx.date,
    txHash: tx.hash,
  }));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 container mx-auto px-2 sm:px-4 pb-8">
        <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
          <PoolHeader 
            poolData={{
              token1: poolData.token1,
              token2: poolData.token2,
              fee: poolData.fee,
              address: poolData.address,
              trustScore: "--",
            }} 
          />

          {/* Farming Block */}
          <Card className="p-4 sm:p-6 bg-gradient-to-r from-primary/5 via-background to-accent/5 border-primary/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                <Sprout className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">Фарминг пула</h3>
                <p className="text-sm text-muted-foreground">
                  Добавьте ликвидность и начните получать пассивные награды.
                </p>
              </div>
              <Button 
                onClick={() => navigate('/farming')}
                className="w-full sm:w-auto group"
              >
                Перейти к фармингу
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </Card>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <ChartCard
              title="Price"
              currentValue={currentPrice}
              symbol={poolData.token2.symbol}
              timeframe={priceTimeframe}
              onTimeframeChange={setPriceTimeframe}
              chartType="price"
            />
            <ChartCard
              title="Volume Chart"
              currentValue="--"
              symbol={poolData.token2.symbol}
              timeframe={volumeTimeframe}
              onTimeframeChange={setVolumeTimeframe}
              chartType="volume"
            />
            <LiquidityChart
              token1={{
                symbol: poolData.token1.symbol,
                amount: poolData.token1.amount,
                logo: poolData.token1.logo,
              }}
              token2={{
                symbol: poolData.token2.symbol,
                amount: poolData.token2.amount,
                logo: poolData.token2.logo,
              }}
              totalValue={formattedTotalValue}
              myContribution="0"
            />
          </div>

          {/* Liquidity & History Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-1 space-y-4 sm:space-y-6">
              <LiquidityForm
                token1={{
                  symbol: poolData.token1.symbol,
                  logo: poolData.token1.logo,
                  available: "0",
                }}
                token2={{
                  symbol: poolData.token2.symbol,
                  logo: poolData.token2.logo,
                  available: "--",
                }}
              />
              {/* Contributors on Desktop - below liquidity form */}
              <div className="hidden lg:block">
                <PoolContributors 
                  contributors={contributors}
                  loading={contributorsLoading}
                  totalLpTokens={poolData.lpTokenBalance}
                />
              </div>
            </div>
            <div className="lg:col-span-2">
              <PoolHistoryTable transactions={formattedTransactions} />
            </div>
          </div>

          {/* Contributors on Mobile - full width below */}
          <div className="lg:hidden">
            <PoolContributors 
              contributors={contributors}
              loading={contributorsLoading}
              totalLpTokens={poolData.lpTokenBalance}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default PoolDetails;
