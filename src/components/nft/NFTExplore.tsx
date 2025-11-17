import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";

const nftItems = [
  {
    id: "000A2710FF690345506B7162DE42A0A530B4E01C9C2D5674AD31A08F051DC752",
    name: "Vorak",
    creator: "sleazyb63",
    creatorVerified: true,
    image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400&h=400&fit=crop",
    verified: true,
    likes: 2,
    price: 350,
    isPrivate: false,
  },
  {
    id: "000A000036ADD3868DA8CDDF04C23220DCCB2134697044F9E2ABB6A304B84E07",
    name: "Guardians of XRP",
    creator: "rUbY5XVibfTEC48cWBUPeadM5FVhyndqGF",
    creatorVerified: false,
    image: "https://images.unsplash.com/photo-1635322966219-b75ed269f85e?w=400&h=400&fit=crop",
    verified: false,
    likes: 0,
    price: null,
    isPrivate: true,
  },
  {
    id: "00080000DD7EDB0AD5F0FB226B4A92132CABB03318432F3633C8FC860404C416",
    name: "Pin-Up Girl #40",
    creator: "rMYoLgmLU6hu3xaiossPPD9LcPReRLNgvA",
    creatorVerified: false,
    image: "https://images.unsplash.com/photo-1634193295627-1cdddf751ebf?w=400&h=400&fit=crop",
    verified: false,
    likes: 0,
    price: 3000,
    isPrivate: false,
  },
  {
    id: "000A000036ADD3868DA8CDDF04C23220DCCB2134697044F985BB764304B8539A",
    name: "The Skunk Mascot and His Squad",
    creator: "rnawAj5vjrXXq1LGp8ncjj9qJouoFyVy9c",
    creatorVerified: false,
    image: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=400&h=400&fit=crop",
    verified: false,
    likes: 0,
    price: null,
    isPrivate: true,
  },
  {
    id: "000A1B582D799F3AA28AB4130DA1E9ED025466FE889F06B733CF954B058466A6",
    name: "XRP POSH 24",
    creator: "CryptoPosh",
    creatorVerified: true,
    image: "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=400&h=400&fit=crop",
    verified: false,
    likes: 0,
    price: 1111,
    isPrivate: false,
  },
  {
    id: "0008000069A1EF1CDE9354D0D774DEADD6969847D252D882936DBC02042DC83B",
    name: "XCOATS OF ARMS #456",
    creator: "rwdXAWAJymZdZ31hSXZNnkGserTU3dtyhp",
    creatorVerified: false,
    image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400&h=400&fit=crop",
    verified: true,
    likes: 0,
    price: null,
    isPrivate: true,
  },
  {
    id: "000A000036ADD3868DA8CDDF04C23220DCCB2134697044F99CFE9F4404B84F3D",
    name: "Inferno Clown XRP",
    creator: "rfbHvoguTUgc9JuKfGyHgLeJH97wZujj7U",
    creatorVerified: false,
    image: "https://images.unsplash.com/photo-1635322966219-b75ed269f85e?w=400&h=400&fit=crop",
    verified: false,
    likes: 0,
    price: null,
    isPrivate: true,
  },
  {
    id: "00081B58C2AB017EB3107A1C312369DE4008E424E0BBAE779AF816080000037A",
    name: "Money Minded Ape #205",
    creator: "msky32",
    creatorVerified: true,
    image: "https://images.unsplash.com/photo-1634193295627-1cdddf751ebf?w=400&h=400&fit=crop",
    verified: true,
    likes: 0,
    price: null,
    isPrivate: true,
  },
  {
    id: "00081388CBFFFC6BCE4F331C83D617B6DD128EFC8EAB59AA2E17DFAC03CB784B",
    name: "Meme Coin Jester",
    creator: "Stargate",
    creatorVerified: true,
    image: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=400&h=400&fit=crop",
    verified: false,
    likes: 0,
    price: 100,
    isPrivate: false,
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
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground truncate">{nft.name}</p>
                {nft.verified && (
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none"
                    className="text-primary flex-shrink-0"
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
              
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium flex-shrink-0">
                  {nft.creator[0].toUpperCase()}
                </div>
                <p className="text-sm text-muted-foreground truncate">{nft.creator}</p>
                {nft.creatorVerified && (
                  <svg 
                    width="15" 
                    height="15" 
                    viewBox="0 0 24 24" 
                    fill="none"
                    className="text-primary flex-shrink-0"
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
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Heart className="w-4 h-4" />
                    <span className="text-sm">{nft.likes}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">XLS-20</Badge>
                </div>
              </div>
              
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1">Price</p>
                {nft.isPrivate ? (
                  <p className="text-sm font-medium">Private</p>
                ) : (
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-xs">
                      X
                    </div>
                    <p className="text-sm font-medium">{nft.price?.toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
