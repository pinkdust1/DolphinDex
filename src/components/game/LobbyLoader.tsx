import { Loader2 } from "lucide-react";

export const LobbyLoader = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="text-muted-foreground text-lg">Loading lobbies...</p>
    </div>
  );
};
