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
      setErrorMessage("Кошелёк не подключён");
      setState("error");
      return;
    }

    const amount = parseFloat(betAmount) || 0;
    
    if (amount < 0 || amount > 100) {
      setErrorMessage("Ставка должна быть от 0 до 100 XRP");
      setState("error");
      return;
    }

    setState("creating");
    setErrorMessage("");

    try {
      const result = await createLobby(walletAddress, amount);
      
      if (!result.success) {
        setErrorMessage(result.error || "Не удалось создать лобби");
        setState("error");
        return;
      }

      setCreatedLobby(result.data || null);
      setState("created");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Произошла ошибка");
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
            {state === "form" && "Создать лобби"}
            {state === "creating" && "Создание лобби..."}
            {state === "created" && "Лобби создано"}
            {state === "waiting" && "Ожидание игрока"}
            {state === "error" && "Ошибка"}
          </DialogTitle>
          <DialogDescription>
            {state === "form" && "Установите ставку для игры (0 = без ставки)"}
            {state === "creating" && "Пожалуйста, подождите..."}
            {state === "created" && "Ваше лобби успешно создано!"}
            {state === "waiting" && "Ожидание подключения другого игрока..."}
            {state === "error" && "Произошла ошибка при создании лобби"}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {state === "form" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bet">Ставка (XRP)</Label>
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
                  Максимум: 100 XRP. Введите 0 для игры без ставки.
                </p>
              </div>

              {!walletAddress && (
                <div className="flex items-center gap-2 text-amber-500 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>Подключите кошелёк для создания лобби</span>
                </div>
              )}

              <Button
                onClick={handleCreate}
                disabled={!walletAddress}
                className="w-full"
              >
                Создать
              </Button>
            </div>
          )}

          {state === "creating" && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">Создание лобби...</p>
            </div>
          )}

          {state === "created" && (
            <div className="flex flex-col items-center justify-center py-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <p className="mt-4 text-lg font-semibold">Лобби создано!</p>
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
              <p className="mt-4 text-lg font-medium">Ожидание другого игрока...</p>
              <p className="text-sm text-muted-foreground mt-2">
                Другой игрок может присоединиться в любой момент
              </p>
              <Button variant="outline" onClick={handleClose} className="mt-6">
                Закрыть
              </Button>
            </div>
          )}

          {state === "error" && (
            <div className="flex flex-col items-center justify-center py-4">
              <AlertCircle className="h-16 w-16 text-destructive" />
              <p className="mt-4 text-lg font-semibold text-destructive">Ошибка</p>
              <p className="text-muted-foreground text-center mt-2">
                {errorMessage}
              </p>
              <Button onClick={() => setState("form")} className="mt-6 w-full">
                Попробовать снова
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
