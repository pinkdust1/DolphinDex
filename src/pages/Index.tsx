import { Header } from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useState } from "react";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
      // TODO: Implement search logic
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
          <div className="w-full max-w-2xl flex gap-2">
            <Input
              type="text"
              placeholder="Search addresses, transactions, tokens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
        </div>
      </main>
    </div>
  );
};

export default Index;
