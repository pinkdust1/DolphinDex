import { useState, useEffect, useRef } from "react";
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
import { Loader2, CheckCircle, Clock, AlertCircle, Gamepad2 } from "lucide-react";
import { createLobby, fetchLobbies, LobbyData } from "@/services/lobbyApi";
import { useNavigate } from "react-router-dom";
import { PaymentModal } from "./PaymentModal";

interface CreateLobbyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  walletAddress: string | null;
  gameId: string;
  onLobbyCreated: (lobby: LobbyData) => void;
}

type ModalState = "form" | "creating" | "paying" | "created" | "waiting" | "ready" | "error";

export const CreateLobbyModal = ({
  open,
  onOpenChange,
  walletAddress,
  gameId,
  onLobbyCreated,
}: CreateLobbyModalProps) => {
  const [betAmount, setBetAmount] = useState<string>("0");
  const [state, setState] = useState<ModalState>("form");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [createdLobby, setCreatedLobby] = useState<LobbyData | null>(null);
  const [pendingLobbyId, setPendingLobbyId] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  // Poll for player2 joining
  useEffect(() => {
    if (state === "waiting" && createdLobby) {
      const pollForPlayer2 = async () => {
        try {
          // Fetch lobbies for the specific game type to get the correct collection
          const lobbies = await fetchLobbies(gameId);
          const updatedLobby = lobbies.find(l => l.id === createdLobby.id);
          
          if (updatedLobby && updatedLobby.player2) {
            // Player 2 has joined!
            setCreatedLobby(updatedLobby);
            setState("ready");
            
            // Clear polling
            if (pollingRef.current) {
              clearInterval(pollingRef.current);
              pollingRef.current = null;
            }
            
            // Navigate to game after short delay
            setTimeout(() => {
              navigate(`/game/${gameId}/play/${updatedLobby.id_lobby}`);
            }, 1500);
          }
        } catch (err) {
          console.error("Error polling for player2:", err);
        }
      };

      // Poll every 2 seconds
      pollingRef.current = setInterval(pollForPlayer2, 2000);
      // Initial check
      pollForPlayer2();

      return () => {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      };
    }
  }, [state, createdLobby, gameId, navigate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

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
      const result = await createLobby(walletAddress, amount, gameId);
      
      if (!result.success || !result.data) {
        setErrorMessage(result.error || "Failed to create lobby");
        setState("error");
        return;
      }

      setCreatedLobby(result.data);

      // If bet amount > 0, require payment
      if (amount > 0) {
        setPendingLobbyId(result.data.id_lobby);
        setState("paying");
        setShowPaymentModal(true);
      } else {
        // Free game - skip payment
        setState("created");
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "An error occurred");
      setState("error");
    }
  };

  const handlePaymentConfirmed = (txHash: string) => {
    console.log("Payment confirmed:", txHash);
    setShowPaymentModal(false);
    setState("created");
  };

  const handlePaymentFailed = (error: string) => {
    console.log("Payment failed:", error);
    setShowPaymentModal(false);
    setErrorMessage(error === "rejected" ? "Payment was rejected" : error);
    setState("error");
    // TODO: Consider canceling the lobby in Directus if payment fails
  };

  const handleOk = () => {
    setState("waiting");
    if (createdLobby) {
      onLobbyCreated(createdLobby);
    }
  };

  const handleClose = () => {
    // Don't allow closing during payment
    if (state === "paying" || showPaymentModal) {
      return;
    }
    
    // Stop polling when closing
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    setState("form");
    setBetAmount("0");
    setErrorMessage("");
    setCreatedLobby(null);
    setPendingLobbyId(null);
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

  const betAmountNum = parseFloat(betAmount) || 0;

  return (
    <>
      <Dialog open={open && !showPaymentModal} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
          <DialogTitle>
              {state === "form" && "Create Lobby"}
              {state === "creating" && "Creating lobby..."}
              {state === "paying" && "Processing Payment..."}
              {state === "created" && "Lobby Created"}
              {state === "waiting" && "Waiting for Player"}
              {state === "ready" && "Player Found!"}
              {state === "error" && "Error"}
            </DialogTitle>
            <DialogDescription>
              {state === "form" && "Set the bet amount for the game (0 = no bet)"}
              {state === "creating" && "Please wait..."}
              {state === "paying" && "Complete payment to activate lobby"}
              {state === "created" && "Your lobby has been created successfully!"}
              {state === "waiting" && "Waiting for another player to join..."}
              {state === "ready" && "Another player has joined! Starting game..."}
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
                  {betAmountNum > 0 && (
                    <p className="text-xs text-amber-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Payment of {betAmountNum} XRP will be required via Xaman
                    </p>
                  )}
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
                  {betAmountNum > 0 ? `Create & Pay ${betAmountNum} XRP` : "Create"}
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
                  Checking for players every 2 seconds...
                </p>
                {createdLobby && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Lobby #{createdLobby.id_lobby}
                  </p>
                )}
                <Button variant="outline" onClick={handleClose} className="mt-6">
                  Cancel
                </Button>
              </div>
            )}

            {state === "ready" && (
              <div className="flex flex-col items-center justify-center py-8">
                <Gamepad2 className="h-12 w-12 text-green-500" />
                <p className="mt-4 text-lg font-medium text-green-500">Player Found!</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Starting game...
                </p>
                <Loader2 className="h-6 w-6 animate-spin text-primary mt-4" />
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

      {/* Payment Modal - Non-closable */}
      {showPaymentModal && walletAddress && pendingLobbyId && (
        <PaymentModal
          open={showPaymentModal}
          amount={betAmountNum}
          walletAddress={walletAddress}
          lobbyId={pendingLobbyId}
          gameType={gameId}
          playerRole="creator"
          onPaymentConfirmed={handlePaymentConfirmed}
          onPaymentFailed={handlePaymentFailed}
        />
      )}
    </>
  );
};
