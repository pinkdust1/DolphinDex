import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sprout, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchAllAMMPools } from "@/utils/xrpl";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface Pool {
  id: string;
  token1: string;
  token2: string;
  price: string;
  priceToken: string;
  fee: string;
  amount1: string;
  amount2: string;
  address?: string;
  apr?: string;
}

const CACHE_KEY = 'xrpl_amm_pools_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export default function Farming() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPools = async () => {
      try {
        setLoading(true);
        
        // Check cache first
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          const age = Date.now() - timestamp;
          
          if (age < CACHE_DURATION) {
            setPools(data);
            setLoading(false);
            return;
          }
        }
        
        // Fetch pools from XRPL
        const fetchedPools = await fetchAllAMMPools(5000);
        
        const formattedPools: Pool[] = fetchedPools.map((pool, index) => ({
          id: `farming-${index}`,
          address: pool.address,
          token1: pool.token1.symbol,
          token2: pool.token2.symbol,
          price: pool.price,
          priceToken: pool.token2.symbol,
          fee: pool.fee,
          amount1: pool.token1.amount,
          amount2: pool.token2.amount,
          apr: "--" // APR data not available from XRPL directly
        }));
        
        // Sort: WRB/XRP pool always first
        const WRB_XRP_POOL_ADDRESS = 'rE1tW1ZuRNjaTkEHaYpucbd6Cx7viMrzT6';
        const sortedPools = formattedPools.sort((a, b) => {
          if (a.address === WRB_XRP_POOL_ADDRESS) return -1;
          if (b.address === WRB_XRP_POOL_ADDRESS) return 1;
          return 0;
        });
        
        setPools(sortedPools);
        
        // Cache the pools
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: sortedPools,
          timestamp: Date.now()
        }));
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Не удалось загрузить пулы",
        });
      } finally {
        setLoading(false);
      }
    };

    loadPools();
  }, [toast]);

  const formatNumber = (num: string) => {
    if (num.includes("<") || num === "--") return num;
    const value = parseFloat(num);
    if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(2)}K`;
    return value.toFixed(2);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 container mx-auto px-2 sm:px-4 pb-8">
        <div className="space-y-6 max-w-7xl mx-auto">
          {/* Hero Section */}
          <Card className="p-6 sm:p-8 bg-gradient-to-br from-primary/10 via-background to-accent/10 border-primary/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
                <Sprout className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">Фарминг ликвидности</h1>
                <p className="text-muted-foreground text-sm sm:text-base max-w-2xl">
                  Вы можете добавить ликвидность в пул и пассивно получать награды в виде токенов.
                </p>
              </div>
              <Button disabled className="w-full sm:w-auto opacity-50 cursor-not-allowed">
                Создать пул
              </Button>
            </div>
          </Card>

          {/* Pools Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4">AMM Пулы</h2>
            
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i} className="p-4">
                    <Skeleton className="h-12 w-full mb-3" />
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-10 w-full" />
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {pools.map((pool) => (
                  <Card 
                    key={pool.id}
                    className={`p-4 transition-all ${pool.address ? 'hover:bg-accent/50 cursor-pointer' : 'opacity-60'}`}
                    onClick={() => pool.address && navigate(`/pool/${pool.address}`)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center -space-x-2">
                        <div className="w-9 h-9 rounded-full bg-muted border-2 border-background flex items-center justify-center z-10">
                          <span className="text-xs font-medium">{pool.token1[0]}</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                          <span className="text-xs font-medium">{pool.token2[0]}</span>
                        </div>
                      </div>
                      <div className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                        APR: {pool.apr}
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <p className="font-semibold text-lg">
                        {pool.token1}/{pool.token2}
                      </p>
                      <p className="text-xs text-muted-foreground">Fee: {pool.fee}</p>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs text-muted-foreground mb-1">Ликвидность</p>
                      <p className="text-sm font-medium">
                        {formatNumber(pool.amount1)} {pool.token1} + {formatNumber(pool.amount2)} {pool.token2}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-muted-foreground">Статус</span>
                      <span className="text-xs font-medium text-green-500">Активен</span>
                    </div>

                    <Button 
                      variant="outline" 
                      className="w-full group"
                      disabled={!pool.address}
                    >
                      Перейти в пул
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}