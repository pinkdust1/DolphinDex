import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { createLobby, LobbyData } from "@/services/lobbyApi";

interface CreateLobbyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  walletAddress: string | null;
  onLobbyCreated: (lobby: LobbyData) => void;
}

type ModalState = "form" | "creating" | "created" | "waiting" | "error";

export const CreateLobbyModal = ({
  open,
  onOpenChange,
  walletAddress,
  onLobbyCreated,
}: CreateLobbyModalProps) => {
  const [betAmount, setBetAmount] = useState<string>("0");
  const [state, setState] = useState<ModalState>("form");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [createdLobby, setCreatedLobby] = useState<LobbyData | null>(null);

  const handleCreate = async () => {
    if (!walletAddress) {
      setErrorMessage("Wallet not connected");
      setState("error");
      return;
    }

    const amount = parseFloat(betAmount) || 0;
    
    if (amount < 0 || amount > 100) {
      setErrorMessage("Bet must be between 0 and 100 XRP");
      setState("error");
      return;
    }

    setState("creating");
    setErrorMessage("");

    try {
      const result = await createLobby(walletAddress, amount);
      
      if (!result.success) {
        setErrorMessage(result.error || "Failed to create lobby");
        setState("error");
        return;
      }

      setCreatedLobby(result.data || null);
      setState("created");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "An error occurred");
      setState("error");
    }
  };

  const handleOk = () => {
    setState("waiting");
    if (createdLobby) {
      onLobbyCreated(createdLobby);
    }
  };

  const handleClose = () => {
    setState("form");
    setBetAmount("0");
    setErrorMessage("");
    setCreatedLobby(null);
    onOpenChange(false);
  };

  const handleBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty input or valid numbers
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      const numValue = parseFloat(value) || 0;
      if (numValue <= 100) {
        setBetAmount(value);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
        <DialogTitle>
            {state === "form" && "Create Lobby"}
            {state === "creating" && "Creating lobby..."}
            {state === "created" && "Lobby Created"}
            {state === "waiting" && "Waiting for Player"}
            {state === "error" && "Error"}
          </DialogTitle>
          <DialogDescription>
            {state === "form" && "Set the bet amount for the game (0 = no bet)"}
            {state === "creating" && "Please wait..."}
            {state === "created" && "Your lobby has been created successfully!"}
            {state === "waiting" && "Waiting for another player to join..."}
            {state === "error" && "An error occurred while creating the lobby"}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {state === "form" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bet">Bet Amount (XRP)</Label>
                <Input
                  id="bet"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={betAmount}
                  onChange={handleBetChange}
                  placeholder="0"
                />
                <p className="text-xs text-muted-foreground">
                  Maximum: 100 XRP. Enter 0 to play without a bet.
                </p>
              </div>

              {!walletAddress && (
                <div className="flex items-center gap-2 text-amber-500 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>Connect wallet to create a lobby</span>
                </div>
              )}

              <Button
                onClick={handleCreate}
                disabled={!walletAddress}
                className="w-full"
              >
                Create
              </Button>
            </div>
          )}

          {state === "creating" && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">Creating lobby...</p>
            </div>
          )}

          {state === "created" && (
            <div className="flex flex-col items-center justify-center py-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <p className="mt-4 text-lg font-semibold">Lobby Created!</p>
              {createdLobby && (
                <p className="text-muted-foreground">
                  ID: #{createdLobby.id_lobby}
                </p>
              )}
              <Button onClick={handleOk} className="mt-6 w-full">
                OK
              </Button>
            </div>
          )}

          {state === "waiting" && (
            <div className="flex flex-col items-center justify-center py-8">
              <Clock className="h-12 w-12 text-primary animate-pulse" />
              <p className="mt-4 text-lg font-medium">Waiting for another player...</p>
              <p className="text-sm text-muted-foreground mt-2">
                Another player can join at any time
              </p>
              <Button variant="outline" onClick={handleClose} className="mt-6">
                Close
              </Button>
            </div>
          )}

          {state === "error" && (
            <div className="flex flex-col items-center justify-center py-4">
              <AlertCircle className="h-16 w-16 text-destructive" />
              <p className="mt-4 text-lg font-semibold text-destructive">Error</p>
              <p className="text-muted-foreground text-center mt-2">
                {errorMessage}
              </p>
              <Button onClick={() => setState("form")} className="mt-6 w-full">
                Try Again
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
