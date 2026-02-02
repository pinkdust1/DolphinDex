import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertCircle, Coins, Hash, Users } from "lucide-react";
import { joinLobby, LobbyData, formatWalletAddress } from "@/services/lobbyApi";
import { useNavigate } from "react-router-dom";

interface JoinLobbyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lobby: LobbyData | null;
  walletAddress: string | null;
  gameId: string;
  onJoined: () => void;
}

type ModalState = "details" | "joining" | "success" | "error";

export const JoinLobbyModal = ({
  open,
  onOpenChange,
  lobby,
  walletAddress,
  gameId,
  onJoined,
}: JoinLobbyModalProps) => {
  const [state, setState] = useState<ModalState>("details");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const navigate = useNavigate();

  const handleJoin = async () => {
    if (!walletAddress) {
      setErrorMessage("Wallet not connected");
      setState("error");
      return;
    }

    if (!lobby) {
      setErrorMessage("Lobby not found");
      setState("error");
      return;
    }

    if (lobby.lobby_status.toLowerCase() !== "free") {
      setErrorMessage("This lobby is already occupied");
      setState("error");
      return;
    }

    if (lobby.player1 === walletAddress) {
      setErrorMessage("You cannot join your own lobby");
      setState("error");
      return;
    }

    setState("joining");
    setErrorMessage("");

    try {
      const result = await joinLobby(lobby.id, walletAddress, gameId);
      
      if (!result.success) {
        setErrorMessage(result.error || "Failed to join lobby");
        setState("error");
        return;
      }

      setState("success");
      onJoined();
      
      // Navigate to game after short delay
      setTimeout(() => {
        navigate(`/game/${gameId}/play/${lobby.id_lobby}`);
      }, 1500);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "An error occurred");
      setState("error");
    }
  };

  const handleClose = () => {
    setState("details");
    setErrorMessage("");
    onOpenChange(false);
  };

  if (!lobby) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {state === "details" && `Lobby #${lobby.id_lobby}`}
            {state === "joining" && "Connecting..."}
            {state === "success" && "Success!"}
            {state === "error" && "Error"}
          </DialogTitle>
          <DialogDescription>
            {state === "details" && "Lobby information"}
            {state === "joining" && "Connecting to the game..."}
            {state === "success" && "You have successfully joined the lobby!"}
            {state === "error" && "Failed to connect"}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {state === "details" && (
            <div className="space-y-4">
              {/* Lobby info */}
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Hash className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Lobby ID</p>
                    <p className="font-semibold">#{lobby.id_lobby}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Coins className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Bet Amount</p>
                    <p className="font-semibold">{lobby.cost}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Creator</p>
                    <code className="text-sm bg-background px-2 py-1 rounded">
                      {formatWalletAddress(lobby.player1)}
                    </code>
                  </div>
                </div>
              </div>

              {!walletAddress && (
                <div className="flex items-center gap-2 text-amber-500 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>Connect wallet to join lobby</span>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={handleJoin}
                  disabled={!walletAddress}
                  className="flex-1"
                >
                  Join
                </Button>
              </div>
            </div>
          )}

          {state === "joining" && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">Connecting to lobby...</p>
            </div>
          )}

          {state === "success" && (
            <div className="flex flex-col items-center justify-center py-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <p className="mt-4 text-lg font-semibold">Connected successfully!</p>
              <p className="text-muted-foreground">Joining game...</p>
            </div>
          )}

          {state === "error" && (
            <div className="flex flex-col items-center justify-center py-4">
              <AlertCircle className="h-16 w-16 text-destructive" />
              <p className="mt-4 text-lg font-semibold text-destructive">Error</p>
              <p className="text-muted-foreground text-center mt-2">
                {errorMessage}
              </p>
              <Button onClick={() => setState("details")} className="mt-6 w-full">
                Try Again
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
