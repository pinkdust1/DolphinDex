import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp } from "lucide-react";

interface GameCardProps {
  game: {
    id: string;
    name: string;
    nameRu: string;
    description: string;
    descriptionRu: string;
    image: string;
    players: string;
    difficulty: string;
  };
}

export const GameCard = ({ game }: GameCardProps) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "hard":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-primary/10 text-primary border-primary/20";
    }
  };

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="relative aspect-video overflow-hidden bg-muted">
        <img
          src={game.image}
          alt={game.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-xl font-bold text-foreground mb-1">
            {game.name}
          </h3>
          <p className="text-sm text-muted-foreground">{game.nameRu}</p>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {game.description}
        </p>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Users className="h-3 w-3" />
            {game.players}
          </Badge>
          <Badge className={`gap-1 border ${getDifficultyColor(game.difficulty)}`}>
            <TrendingUp className="h-3 w-3" />
            {game.difficulty}
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button className="flex-1" variant="default">
          Play Now
        </Button>
        <Button variant="outline" size="icon">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
        </Button>
      </CardFooter>
    </Card>
  );
};
