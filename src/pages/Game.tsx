import { Header } from "@/components/Header";
import { GameCard } from "@/components/game/GameCard";

const games = [
  {
    id: "chess",
    name: "Chess",
    nameRu: "Chess",
    description: "Classic strategy board game",
    descriptionRu: "Classic strategy board game",
    image: "https://images.unsplash.com/photo-1528819622765-d6bcf132f793?w=600&h=400&fit=crop",
    players: "2 Players",
    difficulty: "Medium",
  },
  {
    id: "checkers",
    name: "Checkers",
    nameRu: "Checkers",
    description: "Traditional board game for two players",
    descriptionRu: "Traditional board game for two players",
    image: "https://images.unsplash.com/photo-1611195974119-a96f94be5c1b?w=600&h=400&fit=crop",
    players: "2 Players",
    difficulty: "Easy",
  },
  {
    id: "durak",
    name: "Durak",
    nameRu: "Durak",
    description: "Popular Russian card game",
    descriptionRu: "Popular Russian card game",
    image: "https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=600&h=400&fit=crop",
    players: "2-6 Players",
    difficulty: "Easy",
  },
];

const Game = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-24">
        <div className="container mx-auto px-4">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Game Hub
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Explore classic games powered by XRPL. Play, compete, and earn rewards in our blockchain-enabled gaming ecosystem.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {games.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>

            <div className="mt-12 p-8 rounded-lg border border-border bg-card">
              <h2 className="text-2xl font-bold mb-4">Coming Soon</h2>
              <p className="text-muted-foreground mb-6">
                More exciting games are on the way! Stay tuned for poker, blackjack, and exclusive XRPL-based gaming experiences.
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  Poker
                </div>
                <div className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  Blackjack
                </div>
                <div className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  Roulette
                </div>
                <div className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  Slots
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Game;