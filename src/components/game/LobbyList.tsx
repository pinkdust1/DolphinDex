import { LobbyCard } from "./LobbyCard";
import { LobbyData } from "@/services/lobbyApi";
import { AlertCircle, Inbox } from "lucide-react";

interface LobbyListProps {
  lobbies: LobbyData[];
  error: string | null;
  onJoinLobby: (lobby: LobbyData) => void;
}

export const LobbyList = ({ lobbies, error, onJoinLobby }: LobbyListProps) => {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-1">Error loading data</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (lobbies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted">
          <Inbox className="h-8 w-8 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-1">No lobbies available</h3>
          <p className="text-muted-foreground">Check back later for new games</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {lobbies.map((lobby) => (
        <LobbyCard 
          key={lobby.id} 
          lobby={lobby} 
          onJoin={onJoinLobby}
        />
      ))}
    </div>
  );
};
