import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Eye, Share2 } from "lucide-react";

const primeCollections = [
  {
    id: 1,
    name: "Qwaken PRIME Lions",
    creator: "rnci...3b1M",
    verified: true,
    items: 65,
    owners: 32,
    floorPrice: 18.08,
    volume: 16270.34,
    image: "https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?w=400&h=400&fit=crop"
  },
  {
    id: 2,
    name: "Fly Me to the Moon",
    creator: "rPL...f9p",
    verified: true,
    items: 40,
    owners: 7,
    floorPrice: 452,
    volume: 7322.4,
    image: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=400&h=400&fit=crop"
  }
];

export const PrimeCollections = () => {
  return (
    <section className="space-y-6">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
        Sologenic Prime
      </h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {primeCollections.map((collection) => (
          <Card key={collection.id} className="overflow-hidden group hover:shadow-lg transition-all">
            <div className="relative h-48 overflow-hidden">
              <img
                src={collection.image}
                alt={collection.name}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            </div>
            
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-xl flex-1">{collection.name}</h3>
                <CheckCircle2 className="h-5 w-5 text-blue-500" />
                <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none">
                  PRIME
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-6 h-6 rounded-full bg-muted" />
                <span>{collection.creator}</span>
                {collection.verified && <CheckCircle2 className="h-3 w-3 text-blue-500" />}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Items</div>
                  <div className="font-semibold">{collection.items}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Owners</div>
                  <div className="font-semibold">{collection.owners}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Floor Price (USD)</div>
                  <div className="font-semibold">
                    {Math.floor(collection.floorPrice)}
                    <span className="text-muted-foreground">.{(collection.floorPrice % 1).toFixed(2).slice(2)}</span>
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Vol. Traded (USD)</div>
                  <div className="font-semibold">
                    {collection.volume.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button className="flex-1">View Collection</Button>
                <Button size="icon" variant="outline">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="outline">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
