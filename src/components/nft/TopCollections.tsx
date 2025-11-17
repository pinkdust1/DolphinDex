import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ChevronDown } from "lucide-react";

const collections = [
  { id: 1, name: "Years of the Dragon", creator: "rnzfjpwfnL9y259SB3gVaENCxXthPyNEes", verified: false, image: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=200&h=200&fit=crop" },
  { id: 2, name: "Proud NFT Collection", creator: "tracklish", verified: false, image: "https://images.unsplash.com/photo-1579546929662-711aa81148cf?w=200&h=200&fit=crop" },
  { id: 3, name: "X Ray Mickeys", creator: "deadpunk", verified: false, image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=200&h=200&fit=crop" },
  { id: 4, name: "Nordin The Viking", creator: "northernvoip", verified: true, image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop" },
  { id: 5, name: "CHOWBEYLA", creator: "tracklish", verified: false, image: "https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?w=200&h=200&fit=crop" },
  { id: 6, name: "Crypto-Saloon", creator: "gerry", verified: true, image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=200&h=200&fit=crop" },
  { id: 7, name: "Club X Lucky Lanterns", creator: "rawthoughts", verified: false, image: "https://images.unsplash.com/photo-1643101809204-6fb869816dbe?w=200&h=200&fit=crop" },
  { id: 8, name: "Addis aka Raptile", creator: "nftmediabox", verified: false, image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=200&h=200&fit=crop" },
  { id: 9, name: "Club X Curated", creator: "rawthoughts", verified: false, image: "https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=200&h=200&fit=crop" },
  { id: 10, name: "Gax-R150 ride experience", creator: "ray777", verified: false, image: "https://images.unsplash.com/photo-1634926878768-2a5b3c42f139?w=200&h=200&fit=crop" }
];

export const TopCollections = () => {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Top NFT Collections
        </h2>
        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          last 7 days
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
      
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {collections.map((collection) => (
          <Card key={collection.id} className="group hover:shadow-lg transition-all cursor-pointer overflow-hidden">
            <div className="relative aspect-square">
              <img
                src={collection.image}
                alt={collection.name}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm truncate mb-2">{collection.name}</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-4 h-4 rounded-full bg-muted flex-shrink-0" />
                <span className="truncate flex items-center gap-1">
                  {collection.creator}
                  {collection.verified && <CheckCircle2 className="h-3 w-3 text-blue-500 flex-shrink-0" />}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
