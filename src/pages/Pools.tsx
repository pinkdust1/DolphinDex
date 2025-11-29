import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Search, Grid3x3, List, Plus, Star, Clock, Loader2, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchAllAMMPools } from "@/utils/xrpl";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Pool {
  id: string;
  token1: string;
  token2: string;
  logo1?: string;
  logo2?: string;
  price: string;
  priceToken: string;
  fee: string;
  amount1: string;
  amount2: string;
  address?: string; // Real AMM address from XRPL
}

// Featured pools that always show at the top
const featuredPools: Pool[] = [
  {
    id: "featured-1",
    token1: "XRP",
    token2: "BND",
    price: "--",
    priceToken: "BND",
    fee: "0.5%",
    amount1: "0",
    amount2: "0",
    address: undefined // Will be linked when pool exists
  },
  {
    id: "featured-2",
    token1: "XRP",
    token2: "WRB",
    price: "--",
    priceToken: "WRB",
    fee: "0.5%",
    amount1: "0",
    amount2: "0",
    address: "rE1tW1ZuRNjaTkEHaYpucbd6Cx7viMrzT6"
  },
  {
    id: "featured-3",
    token1: "XRP",
    token2: "SNK",
    price: "--",
    priceToken: "SNK",
    fee: "0.5%",
    amount1: "0",
    amount2: "0",
    address: undefined // Will be linked when pool exists
  }
];

const highlightedPools: Pool[] = [
  {
    id: "1",
    token1: "BTC",
    token2: "XRP",
    price: "345.8226",
    priceToken: "XRP",
    fee: "0.958%",
    amount1: "100",
    amount2: "34582.26",
    address: "rE1tW1ZuRNjaTkEHaYpucbd6Cx7viMrzT6"
  },
  {
    id: "2",
    token1: "WRB",
    token2: "XRP",
    price: "0.08744527",
    priceToken: "XRP",
    fee: "0.659%",
    amount1: "2116711.53",
    amount2: "183876.64"
  },
  {
    id: "3",
    token1: "CORE",
    token2: "XRP",
    price: "--",
    priceToken: "XRP",
    fee: "1%",
    amount1: "0",
    amount2: "0"
  }
];

const recentPools: Pool[] = [
  {
    id: "4",
    token1: "Fronks",
    token2: "MeowRP",
    price: "0.20675397",
    priceToken: "MeowRP",
    fee: "1%",
    amount1: "1000",
    amount2: "206.75"
  },
  {
    id: "5",
    token1: "666",
    token2: "XRP",
    price: "0.06738559",
    priceToken: "XRP",
    fee: "0.001%",
    amount1: "160064.85",
    amount2: "10785.95"
  },
  {
    id: "6",
    token1: "HAIC",
    token2: "XRP",
    price: "0.0000009",
    priceToken: "XRP",
    fee: "0.217%",
    amount1: "5000000",
    amount2: "4.5"
  }
];

const allPools: Pool[] = [
  {
    id: "7",
    token1: "XRP",
    token2: "aura",
    price: "1054582.46",
    priceToken: "aura",
    fee: "0.333%",
    amount1: "6604.9446",
    amount2: "6942263886.8"
  },
  {
    id: "8",
    token1: "SIGMA",
    token2: "XRP",
    price: "0.00000509",
    priceToken: "XRP",
    fee: "0.294%",
    amount1: "4972575653.45",
    amount2: "25271.12"
  },
  {
    id: "9",
    token1: "666",
    token2: "XRP",
    price: "0.06738559",
    priceToken: "XRP",
    fee: "0.001%",
    amount1: "160064.85",
    amount2: "10785.95"
  },
  {
    id: "10",
    token1: "SENT",
    token2: "XRP",
    price: "0.01851731",
    priceToken: "XRP",
    fee: "0.048%",
    amount1: "113580.45",
    amount2: "2102.1953"
  },
  {
    id: "11",
    token1: "CHAOS",
    token2: "XRP",
    price: "0.00023484",
    priceToken: "XRP",
    fee: "0.138%",
    amount1: "2245956.44",
    amount2: "526.721"
  },
  {
    id: "12",
    token1: "ARMY",
    token2: "ATM",
    price: "78.188135",
    priceToken: "ATM",
    fee: "0%",
    amount1: "27890.81",
    amount2: "2180730.93"
  },
  {
    id: "13",
    token1: "SCHWEPE",
    token2: "XRP",
    price: "< 0.0000001",
    priceToken: "XRP",
    fee: "0.262%",
    amount1: "69473733757802.26",
    amount2: "13654.51"
  },
  {
    id: "14",
    token1: "BITx",
    token2: "RLUSD",
    price: "15.072346",
    priceToken: "RLUSD",
    fee: "0.04%",
    amount1: "16.029639",
    amount2: "241.5076"
  },
  {
    id: "15",
    token1: "Schmeckles",
    token2: "XRP",
    price: "0.54566632",
    priceToken: "XRP",
    fee: "0.25%",
    amount1: "28357.94",
    amount2: "15435.28"
  },
  {
    id: "16",
    token1: "STEVE",
    token2: "XRP",
    price: "< 0.0000001",
    priceToken: "XRP",
    fee: "1%",
    amount1: "1305071403228.83",
    amount2: "1534.2109"
  },
  {
    id: "17",
    token1: "Serenity",
    token2: "XRP",
    price: "0.00000586",
    priceToken: "XRP",
    fee: "0.036%",
    amount1: "143703488.39",
    amount2: "842.5894"
  },
  {
    id: "18",
    token1: "RLUSD",
    token2: "XRP",
    price: "0.45954357",
    priceToken: "XRP",
    fee: "0.537%",
    amount1: "1699842.02",
    amount2: "776956.7"
  },
  {
    id: "19",
    token1: "ATM",
    token2: "bull",
    price: "0.07937594",
    priceToken: "bull",
    fee: "0%",
    amount1: "11315924.32",
    amount2: "898212.2"
  },
  {
    id: "20",
    token1: "Equilibrium",
    token2: "XRP",
    price: "0.00423894",
    priceToken: "XRP",
    fee: "0.034%",
    amount1: "1085056.74",
    amount2: "4597.9343"
  },
  {
    id: "21",
    token1: "XRP",
    token2: "XRPBR",
    price: "70.660846",
    priceToken: "XRPBR",
    fee: "0.154%",
    amount1: "1810.13",
    amount2: "127708.34"
  },
  {
    id: "22",
    token1: "SOLO",
    token2: "XRP",
    price: "0.08744527",
    priceToken: "XRP",
    fee: "0.659%",
    amount1: "2116711.53",
    amount2: "183876.64"
  },
  {
    id: "23",
    token1: "ATM",
    token2: "XRP",
    price: "0.0000068",
    priceToken: "XRP",
    fee: "0.011%",
    amount1: "10794565722.16",
    amount2: "73496.74"
  }
];

const PoolCard = ({ pool }: { pool: Pool }) => {
  const navigate = useNavigate();
  
  const formatNumber = (num: string) => {
    if (num.includes("<") || num === "--") return num;
    const parts = num.split(".");
    return (
      <>
        {parts[0]}
        {parts[1] && <span className="text-muted-foreground">.{parts[1]}</span>}
      </>
    );
  };

  const handleClick = () => {
    if (pool.address) {
      navigate(`/pool/${pool.address}`);
    }
  };

  return (
    <Card 
      className={`p-4 transition-all ${pool.address ? 'hover:bg-accent/50 cursor-pointer' : 'opacity-60 cursor-not-allowed'}`} 
      onClick={handleClick}
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
        <div className="text-right">
          <p className="text-sm font-medium">{formatNumber(pool.price)}</p>
          <p className="text-xs text-muted-foreground">{pool.priceToken}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <p className="font-medium">
          <span className="text-foreground">{pool.token1}</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground">{pool.token2}</span>
        </p>
        <div className="px-2 py-1 bg-secondary rounded text-xs font-medium">
          {pool.fee}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">{pool.token1} Amount</p>
          <p className="text-sm font-medium">
            {formatNumber(pool.amount1)} <span className="text-muted-foreground text-xs">{pool.token1}</span>
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">{pool.token2} Amount</p>
          <p className="text-sm font-medium">
            {formatNumber(pool.amount2)} <span className="text-muted-foreground text-xs">{pool.token2}</span>
          </p>
        </div>
      </div>

      <Button variant="outline" className="w-full" disabled={!pool.address}>
        {pool.address ? 'Enter Pool' : 'Coming Soon'}
      </Button>
    </Card>
  );
};

const HighlightSection = ({ title, icon, pools }: { title: string; icon: React.ReactNode; pools: Pool[] }) => {
  const navigate = useNavigate();
  
  const handlePoolClick = (pool: Pool) => {
    if (pool.address) {
      navigate(`/pool/${pool.address}`);
    }
  };
  
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div className="space-y-3">
        {pools.map((pool) => (
          <div
            key={pool.id}
            className={`flex items-center justify-between p-3 rounded-lg transition-all ${
              pool.address ? 'hover:bg-accent/50 cursor-pointer' : 'opacity-60 cursor-not-allowed'
            }`}
            onClick={() => handlePoolClick(pool)}
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="flex items-center -space-x-2">
                <div className="w-9 h-9 rounded-full bg-muted border-2 border-background flex items-center justify-center z-10">
                  <span className="text-xs font-medium">{pool.token1[0]}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                  <span className="text-xs font-medium">{pool.token2[0]}</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">
                  <span>{pool.token1}</span>/<span>{pool.token2}</span>
                </p>
                <div className="px-2 py-0.5 bg-secondary rounded text-xs inline-block mt-1">
                  {pool.fee}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{pool.price}</p>
              <p className="text-xs text-muted-foreground">{pool.priceToken}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

const CACHE_KEY = 'xrpl_amm_pools_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export default function Pools() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notifyNewPools, setNotifyNewPools] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [realPools, setRealPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const poolsPerPage = 8;

  // Load real AMM pools from XRPL with caching
  const loadPools = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Check cache first
      if (!forceRefresh) {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          const age = Date.now() - timestamp;
          
          if (age < CACHE_DURATION) {
            setRealPools(data);
            setLoading(false);
            console.log(`Loaded ${data.length} pools from cache (age: ${Math.round(age / 1000)}s)`);
            return;
          }
        }
      }
      
      // Fetch all pools from XRPL (increased limit to get all pools)
      const pools = await fetchAllAMMPools(5000);
      
      // Convert to Pool format
      const formattedPools: Pool[] = pools.map((pool, index) => ({
        id: `real-${index}`,
        address: pool.address,
        token1: pool.token1.symbol,
        token2: pool.token2.symbol,
        price: pool.price,
        priceToken: pool.token2.symbol,
        fee: pool.fee,
        amount1: pool.token1.amount,
        amount2: pool.token2.amount
      }));
      
      // Sort: WRB/XRP pool always first
      const WRB_XRP_POOL_ADDRESS = 'rE1tW1ZuRNjaTkEHaYpucbd6Cx7viMrzT6';
      const sortedPools = formattedPools.sort((a, b) => {
        if (a.address === WRB_XRP_POOL_ADDRESS) return -1;
        if (b.address === WRB_XRP_POOL_ADDRESS) return 1;
        return 0;
      });
      
      setRealPools(sortedPools);
      
      // Cache the pools
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: sortedPools,
        timestamp: Date.now()
      }));
      
      toast({
        title: "Обновлено",
        description: `Загружено ${formattedPools.length} пулов`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load pools';
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

  useEffect(() => {
    loadPools();
  }, []);

  // Use real pools if loaded, otherwise show static pools
  const poolsToDisplay = realPools.length > 0 ? realPools : allPools;

  const filteredPools = poolsToDisplay.filter(pool => 
    pool.token1.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pool.token2.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPools.length / poolsPerPage);
  const startIndex = (currentPage - 1) * poolsPerPage;
  const endIndex = startIndex + poolsPerPage;
  const currentPools = filteredPools.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 mt-20">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-bold">XRPL Pools</h1>
            <Button
              variant="outline"
              size="icon"
              onClick={() => loadPools(true)}
              disabled={loading}
              className="shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Notify New Pools</span>
              <Switch checked={notifyNewPools} onCheckedChange={setNotifyNewPools} />
            </div>
            <Button className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Create Pool
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Featured Pools - Always visible */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Featured Pools</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {featuredPools.map((pool) => (
              <Card 
                key={pool.id}
                className={`p-4 transition-all ${pool.address ? 'hover:bg-accent/50 cursor-pointer' : 'opacity-70'}`}
                onClick={() => pool.address && navigate(`/pool/${pool.address}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center -space-x-2">
                    <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center z-10">
                      <span className="text-sm font-bold text-primary">{pool.token1[0]}</span>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                      <span className="text-sm font-medium">{pool.token2[0]}</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-lg">
                      {pool.token1}/{pool.token2}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {pool.address ? 'Active' : 'Coming Soon'}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Highlights - only show static highlights when not loading real data */}
        {!loading && realPools.length === 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Highlights</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <HighlightSection 
                title="Featured" 
                icon={<Star className="w-5 h-5 text-primary" />}
                pools={highlightedPools}
              />
              <HighlightSection 
                title="Recently Created" 
                icon={<Clock className="w-5 h-5 text-primary" />}
                pools={recentPools}
              />
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-80" />
              ))}
            </div>
          </div>
        )}

        {/* Search and View Toggle */}
        {!loading && (
        <>
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <Grid3x3 className="w-5 h-5" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="w-5 h-5" />
          </Button>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search Projects"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Pool Grid */}
        <div className={viewMode === "grid" ? "grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "space-y-4"}>
          {currentPools.map((pool) => (
            <PoolCard key={pool.id} pool={pool} />
          ))}
        </div>
        </>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="gap-2"
            >
              <span>Previous</span>
            </Button>
            <span className="text-sm text-muted-foreground px-4">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="gap-2"
            >
              <span>Next</span>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
