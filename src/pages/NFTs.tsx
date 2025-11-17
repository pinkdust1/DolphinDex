import { Header } from "@/components/Header";
import { NFTHero } from "@/components/nft/NFTHero";
import { NFTCarousel } from "@/components/nft/NFTCarousel";
import { PrimeCollections } from "@/components/nft/PrimeCollections";
import { TopArtists } from "@/components/nft/TopArtists";
import { TopCollections } from "@/components/nft/TopCollections";
import { RecentCollections } from "@/components/nft/RecentCollections";
import { StaffPicks } from "@/components/nft/StaffPicks";

const NFTs = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-24">
        <div className="container mx-auto px-4 space-y-12">
          <NFTHero />
          <NFTCarousel />
          <PrimeCollections />
          <TopArtists />
          <TopCollections />
          <RecentCollections />
          <StaffPicks />
        </div>
      </main>
    </div>
  );
};

export default NFTs;
