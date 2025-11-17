import { useState } from "react";
import { Header } from "@/components/Header";
import { NFTHero } from "@/components/nft/NFTHero";
import { NFTCarousel } from "@/components/nft/NFTCarousel";
import { NFTExplore } from "@/components/nft/NFTExplore";
import { PrimeCollections } from "@/components/nft/PrimeCollections";
import { TopArtists } from "@/components/nft/TopArtists";
import { TopCollections } from "@/components/nft/TopCollections";
import { RecentCollections } from "@/components/nft/RecentCollections";
import { StaffPicks } from "@/components/nft/StaffPicks";

const NFTs = () => {
  const [activeTab, setActiveTab] = useState<"home" | "explore">("home");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-24">
        <div className="container mx-auto px-4 space-y-12">
          <NFTHero activeTab={activeTab} setActiveTab={setActiveTab} />
          
          {activeTab === "home" ? (
            <>
              <NFTCarousel />
              <PrimeCollections />
              <TopArtists />
              <TopCollections />
              <RecentCollections />
              <StaffPicks />
            </>
          ) : (
            <NFTExplore />
          )}
        </div>
      </main>
    </div>
  );
};

export default NFTs;
