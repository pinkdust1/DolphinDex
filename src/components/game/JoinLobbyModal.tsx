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
      setErrorMessage("Кошелёк не подключён");
      setState("error");
      return;
    }

    if (!lobby) {
      setErrorMessage("Лобби не найдено");
      setState("error");
      return;
    }

    if (lobby.lobby_status.toLowerCase() !== "free") {
      setErrorMessage("Это лобби уже занято");
      setState("error");
      return;
    }

    if (lobby.player1 === walletAddress) {
      setErrorMessage("Вы не можете присоединиться к своему лобби");
      setState("error");
      return;
    }

    setState("joining");
    setErrorMessage("");

    try {
      const result = await joinLobby(lobby.id, walletAddress);
      
      if (!result.success) {
        setErrorMessage(result.error || "Не удалось присоединиться к лобби");
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
      setErrorMessage(err instanceof Error ? err.message : "Произошла ошибка");
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
            {state === "details" && `Лобби #${lobby.id_lobby}`}
            {state === "joining" && "Подключение..."}
            {state === "success" && "Успешно!"}
            {state === "error" && "Ошибка"}
          </DialogTitle>
          <DialogDescription>
            {state === "details" && "Информация о лобби"}
            {state === "joining" && "Подключение к игре..."}
            {state === "success" && "Вы успешно присоединились к лобби!"}
            {state === "error" && "Не удалось подключиться"}
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
                    <p className="text-xs text-muted-foreground">ID лобби</p>
                    <p className="font-semibold">#{lobby.id_lobby}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Coins className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Ставка</p>
                    <p className="font-semibold">{lobby.cost}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Создатель</p>
                    <code className="text-sm bg-background px-2 py-1 rounded">
                      {formatWalletAddress(lobby.player1)}
                    </code>
                  </div>
                </div>
              </div>

              {!walletAddress && (
                <div className="flex items-center gap-2 text-amber-500 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>Подключите кошелёк для входа в лобби</span>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  Отмена
                </Button>
                <Button
                  onClick={handleJoin}
                  disabled={!walletAddress}
                  className="flex-1"
                >
                  Подключиться
                </Button>
              </div>
            </div>
          )}

          {state === "joining" && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">Подключение к лобби...</p>
            </div>
          )}

          {state === "success" && (
            <div className="flex flex-col items-center justify-center py-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <p className="mt-4 text-lg font-semibold">Подключение успешно!</p>
              <p className="text-muted-foreground">Переход в игру...</p>
            </div>
          )}

          {state === "error" && (
            <div className="flex flex-col items-center justify-center py-4">
              <AlertCircle className="h-16 w-16 text-destructive" />
              <p className="mt-4 text-lg font-semibold text-destructive">Ошибка</p>
              <p className="text-muted-foreground text-center mt-2">
                {errorMessage}
              </p>
              <Button onClick={() => setState("details")} className="mt-6 w-full">
                Попробовать снова
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
