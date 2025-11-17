import { Card } from "@/components/ui/card";
import { Heart } from "lucide-react";

const nftItems = [
  {
    id: "000A2710FF690345506B7162DE42A0A530B4E01C9C2D5674AD31A08F051DC752",
    name: "Vorak",
    creator: "sleazyb63",
    image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400&h=400&fit=crop",
    verified: true,
    likes: 42,
  },
  {
    id: "1",
    name: "Cosmic Warriors",
    creator: "artmaster",
    image: "https://images.unsplash.com/photo-1635322966219-b75ed269f85e?w=400&h=400&fit=crop",
    verified: true,
    likes: 128,
  },
  {
    id: "2",
    name: "Digital Dreams",
    creator: "creator_x",
    image: "https://images.unsplash.com/photo-1634193295627-1cdddf751ebf?w=400&h=400&fit=crop",
    verified: false,
    likes: 87,
  },
  {
    id: "3",
    name: "Neon Genesis",
    creator: "neonartist",
    image: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=400&h=400&fit=crop",
    verified: true,
    likes: 256,
  },
  {
    id: "4",
    name: "Abstract Minds",
    creator: "mindscape",
    image: "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=400&h=400&fit=crop",
    verified: true,
    likes: 194,
  },
  {
    id: "5",
    name: "Pixel Paradise",
    creator: "pixelking",
    image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400&h=400&fit=crop",
    verified: false,
    likes: 73,
  },
  {
    id: "6",
    name: "Crypto Creatures",
    creator: "beastmaster",
    image: "https://images.unsplash.com/photo-1635322966219-b75ed269f85e?w=400&h=400&fit=crop",
    verified: true,
    likes: 312,
  },
  {
    id: "7",
    name: "Future Visions",
    creator: "futurist_99",
    image: "https://images.unsplash.com/photo-1634193295627-1cdddf751ebf?w=400&h=400&fit=crop",
    verified: true,
    likes: 445,
  },
];

export const NFTExplore = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Explore NFTs</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {nftItems.map((nft) => (
          <Card 
            key={nft.id}
            className="group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
          >
            <div className="aspect-square relative overflow-hidden bg-muted">
              <img
                src={nft.image}
                alt={nft.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
              />
            </div>
            
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground">{nft.name}</p>
                  {nft.verified && (
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none"
                      className="text-primary"
                    >
                      <path 
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        fill="none"
                      />
                    </svg>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium">
                  {nft.creator[0].toUpperCase()}
                </div>
                <p className="text-sm text-muted-foreground">{nft.creator}</p>
              </div>
              
              <div className="flex items-center gap-1 text-muted-foreground">
                <Heart className="w-4 h-4" />
                <span className="text-sm">{nft.likes}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
