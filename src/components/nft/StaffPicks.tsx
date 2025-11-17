import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";

const collections = [
  { id: 1, name: "Coreum Punks Collection", creator: "rnASWbwG1gbd8JCpK2GPQ2kiMh9bbU6dzw", verified: false, image: "https://images.unsplash.com/photo-1634926878768-2a5b3c42f139?w=200&h=200&fit=crop" },
  { id: 2, name: "XRP CEO FIAT", creator: "rnzfjpwfnL9y259SB3gVaENCxXthPyNEes", verified: false, image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop" },
  { id: 3, name: "XRP CEO 2", creator: "rnzfjpwfnL9y259SB3gVaENCxXthPyNEes", verified: false, image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=200&h=200&fit=crop" },
  { id: 4, name: "Magnetic Girls: Series 2", creator: "rMAGea7B4RpncJSisk3EJaTgY4QLP9H4gq", verified: true, image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=200&h=200&fit=crop" },
  { id: 5, name: "Magnetic Girls: Auto Mining", creator: "rMAGea7B4RpncJSisk3EJaTgY4QLP9H4gq", verified: true, image: "https://images.unsplash.com/photo-1643101809204-6fb869816dbe?w=200&h=200&fit=crop" }
];

export const StaffPicks = () => {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Staff Picks
        </h2>
        <div className="flex gap-2">
          <Button size="icon" variant="outline" disabled>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="outline">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
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
              <h3 className="font-semibold text-sm truncate mb-2 flex items-center gap-1">
                {collection.name}
                {collection.verified && <CheckCircle2 className="h-4 w-4 text-blue-500 flex-shrink-0" />}
              </h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-4 h-4 rounded-full bg-muted flex-shrink-0" />
                <span className="truncate">{collection.creator}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
