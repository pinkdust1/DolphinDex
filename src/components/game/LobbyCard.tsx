import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Clock, Coins, Hash } from "lucide-react";
import { LobbyData, getPlayerCount, isLobbyAvailable, formatWalletAddress } from "@/services/lobbyApi";
import { cn } from "@/lib/utils";

interface LobbyCardProps {
  lobby: LobbyData;
  onJoin: (lobby: LobbyData) => void;
}

export const LobbyCard = ({ lobby, onJoin }: LobbyCardProps) => {
  const available = isLobbyAvailable(lobby);
  const playerCount = getPlayerCount(lobby);

  const getStatusBadge = () => {
    const status = lobby.lobby_status.toLowerCase();
    switch (status) {
      case "free":
        return (
          <Badge className="bg-green-500/10 text-green-500 border-green-500/20 border">
            Free
          </Badge>
        );
      case "busy":
        return (
          <Badge className="bg-red-500/10 text-red-500 border-red-500/20 border">
            Busy
          </Badge>
        );
      case "waiting":
        return (
          <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 border">
            Waiting
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            {lobby.lobby_status}
          </Badge>
        );
    }
  };

  return (
    <Card 
      className={cn(
        "transition-all duration-300 overflow-hidden",
        available 
          ? "hover:shadow-lg hover:border-primary/50 cursor-pointer" 
          : "opacity-60 cursor-not-allowed"
      )}
      onClick={() => available && onJoin(lobby)}
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Left section - Lobby info */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
            {/* Lobby ID */}
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <Hash className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Lobby</p>
                <p className="font-bold text-lg">#{lobby.id_lobby}</p>
              </div>
            </div>

            {/* Cost */}
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent/50">
                <Coins className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Entry Cost</p>
                <p className="font-semibold">{lobby.cost}</p>
              </div>
            </div>

            {/* Start Time */}
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent/50">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Start Time</p>
                <p className="font-semibold">{lobby.start_time}</p>
              </div>
            </div>

            {/* Players */}
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent/50">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Players</p>
                <p className="font-semibold">{playerCount}/2</p>
              </div>
            </div>
          </div>

          {/* Right section - Status & Action */}
          <div className="flex items-center gap-3 sm:flex-shrink-0">
            {getStatusBadge()}
            <Button 
              variant={available ? "default" : "secondary"}
              disabled={!available}
              className="min-w-[100px]"
              onClick={(e) => {
                e.stopPropagation();
                if (available) onJoin(lobby);
              }}
            >
              {available ? "Join" : "Full"}
            </Button>
          </div>
        </div>

        {/* Player addresses - collapsed on mobile */}
        {(lobby.player1 || lobby.player2) && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex flex-wrap gap-4 text-sm">
              {lobby.player1 && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Player 1:</span>
                  <code className="bg-muted px-2 py-1 rounded text-xs">
                    {formatWalletAddress(lobby.player1)}
                  </code>
                </div>
              )}
              {lobby.player2 && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Player 2:</span>
                  <code className="bg-muted px-2 py-1 rounded text-xs">
                    {formatWalletAddress(lobby.player2)}
                  </code>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
