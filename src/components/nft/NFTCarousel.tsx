import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

const featuredNFTs = [
  {
    id: 1,
    title: "Anonymous Astronauts: Sologenic Welcome",
    artist: "anonymous.astronauts.nfts",
    verified: true,
    image: "https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?w=800&h=600&fit=crop"
  },
  {
    id: 2,
    title: "My Girl",
    artist: "oli_d",
    verified: false,
    image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&h=600&fit=crop"
  },
  {
    id: 3,
    title: "Rule Britannia",
    artist: "pixel.pirate",
    verified: false,
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop"
  },
  {
    id: 4,
    title: "North American Landscapes",
    artist: "benito5050",
    verified: false,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
  },
  {
    id: 5,
    title: "Nagarum Nilave",
    artist: "swamiji",
    verified: true,
    image: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&h=600&fit=crop"
  }
];

export const NFTCarousel = () => {
  return (
    <div className="relative overflow-hidden py-8">
      <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
        {featuredNFTs.map((nft) => (
          <Card
            key={nft.id}
            className="flex-none w-80 snap-center overflow-hidden group cursor-pointer hover:shadow-lg transition-all"
          >
            <div className="relative aspect-[4/3]">
              <img
                src={nft.image}
                alt={nft.title}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="font-bold text-lg mb-1 truncate">{nft.title}</h3>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-muted" />
                  <span className="text-sm flex items-center gap-1">
                    {nft.artist}
                    {nft.verified && (
                      <CheckCircle2 className="h-3 w-3 text-blue-400" />
                    )}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
