import { Header } from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { detectSearchType } from "@/utils/xrpl";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSearch = async () => {
    const query = searchQuery.trim();
    
    if (!query) {
      setError("Введите адрес, транзакцию или пул");
      return;
    }

    setError("");
    const searchType = detectSearchType(query);

    switch (searchType) {
      case 'transaction':
        navigate(`/transaction/${query}`);
        break;
      case 'address':
        // Check if it's an AMM account
        const { isAMMAccount } = await import('@/utils/xrpl');
        const isAMM = await isAMMAccount(query);
        
        if (isAMM) {
          navigate(`/pool/${query}`);
        } else {
          navigate(`/address/${query}`);
        }
        break;
      case 'unknown':
        setError("Неверный формат. Введите корректный адрес XRPL или хэш транзакции");
        break;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 container mx-auto px-4">
        <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8">
          <h1 className="text-6xl md:text-7xl font-bold text-foreground text-center">
            DolphinScan
          </h1>
          <div className="w-full max-w-2xl space-y-4">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Поиск адресов, транзакций, пулов..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setError("");
                }}
                onKeyPress={handleKeyPress}
                className="h-12 text-base"
              />
              <Button 
                size="lg" 
                onClick={handleSearch}
                className="h-12 px-6"
              >
                <Search className="w-5 h-5" />
              </Button>
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
