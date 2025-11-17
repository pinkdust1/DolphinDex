import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, User } from "lucide-react";

export const NFTHero = () => {
  const [activeTab, setActiveTab] = useState<"home" | "explore">("home");

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          NFT Marketplace
        </h1>
        
        <div className="flex items-center gap-3">
          <Button variant="default" className="h-9">
            Mint
          </Button>
          <Button variant="outline" className="h-9">
            Swap
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="flex-1 relative">
          <Input
            type="text"
            placeholder="Search for NFTs, artists and collections by keywords"
            className="pr-20 h-12"
          />
          <Button 
            size="sm" 
            className="absolute right-1 top-1/2 -translate-y-1/2 h-10"
          >
            <Search className="h-4 w-4 mr-2" />
            Go
          </Button>
        </div>
        
        <Button variant="ghost" className="gap-2">
          <User className="h-5 w-5" />
          Profile
        </Button>
      </div>

      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("home")}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
            activeTab === "home"
              ? "border-primary text-primary font-medium"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="w-5 h-5">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" fill="none"/>
          </svg>
          Home
        </button>
        <button
          onClick={() => setActiveTab("explore")}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
            activeTab === "explore"
              ? "border-primary text-primary font-medium"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="w-5 h-5">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" fill="none"/>
            <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
          </svg>
          Explore
        </button>
      </div>
    </div>
  );
};
