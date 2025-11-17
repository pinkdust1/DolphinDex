import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ChevronDown } from "lucide-react";

const artists = [
  {
    id: 1,
    name: "xstik",
    verified: true,
    featured: true,
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"
  },
  {
    id: 2,
    name: "xwalkers",
    verified: true,
    featured: true,
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop"
  }
];

export const TopArtists = () => {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Top Artists
        </h2>
        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          last 7 days
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
      
      <div className="grid sm:grid-cols-2 gap-4">
        {artists.map((artist) => (
          <Card key={artist.id} className="group hover:shadow-lg transition-all cursor-pointer">
            <CardContent className="p-6 flex items-center gap-4">
              <img
                src={artist.avatar}
                alt={artist.name}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-border group-hover:ring-primary transition-all"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{artist.name}</h3>
                  {artist.verified && <CheckCircle2 className="h-4 w-4 text-blue-500" />}
                </div>
                {artist.featured && (
                  <Badge variant="secondary" className="mt-1">Featured</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
