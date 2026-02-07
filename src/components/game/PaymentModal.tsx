import { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertCircle, XCircle, Smartphone, QrCode } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PaymentModalProps {
  open: boolean;
  amount: number;
  walletAddress: string;
  lobbyId: string | number;
  gameType: string;
  playerRole: "creator" | "joiner";
  onPaymentConfirmed: (txHash: string) => void;
  onPaymentFailed: (error: string) => void;
}

type PaymentState = 
  | "creating"      // Creating payment request
  | "pending"       // Waiting for user to scan QR
  | "checking"      // Checking payment status
  | "verifying"     // Verifying on XRPL
  | "confirmed"     // Payment confirmed
  | "rejected"      // User rejected
  | "expired"       // Payment request expired
  | "error";        // Error occurred

export const PaymentModal = ({
  open,
  amount,
  walletAddress,
  lobbyId,
  gameType,
  playerRole,
  onPaymentConfirmed,
  onPaymentFailed,
}: PaymentModalProps) => {
  const [state, setState] = useState<PaymentState>("creating");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [paymentData, setPaymentData] = useState<{
    uuid: string;
    qrUrl: string;
    deepLink: string;
  } | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Create payment request
  const createPayment = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    setState("creating");
    setErrorMessage("");
    setPaymentData(null);
    setTxHash(null);

    try {
      const { data, error } = await supabase.functions.invoke("xrp-payment", {
        body: {
          action: "create_payment",
          amount,
          sender: walletAddress,
          lobby_id: lobbyId,
          game_type: gameType,
          player_role: playerRole,
        },
      });

      if (error || !data?.success) {
        throw new Error(error?.message || data?.error || "Failed to create payment");
      }

      if (!isMountedRef.current) return;

      setPaymentData({
        uuid: data.uuid,
        qrUrl: data.qrUrl,
        deepLink: data.deepLink,
      });
      setState("pending");
    } catch (err) {
      if (!isMountedRef.current) return;
      const message = err instanceof Error ? err.message : "Failed to create payment";
      setErrorMessage(message);
      setState("error");
    }
  }, [amount, walletAddress, lobbyId, gameType, playerRole]);

  // Check payment status
  const checkPayment = useCallback(async () => {
    if (!paymentData?.uuid || !isMountedRef.current) return;

    try {
      const { data, error } = await supabase.functions.invoke("xrp-payment", {
        body: {
          action: "check_payment",
          uuid: paymentData.uuid,
          expected_amount: amount,
          expected_sender: walletAddress,
        },
      });

      if (error) {
        console.error("Check payment error:", error);
        return;
      }

      if (!isMountedRef.current) return;

      // Payment expired
      if (data.expired) {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
        setState("expired");
        return;
      }

      // User rejected
      if (data.rejected) {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
        setErrorMessage("Payment was rejected");
        setState("rejected");
        return;
      }

      // Payment signed and verified
      if (data.signed && data.verified) {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
        setTxHash(data.txHash);
        setState("confirmed");
        return;
      }

      // Payment signed but verification failed
      if (data.signed && !data.verified) {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
        setErrorMessage(data.verificationError || "Transaction verification failed");
        setState("error");
        return;
      }

      // Still pending - keep polling
    } catch (err) {
      console.error("Payment check error:", err);
    }
  }, [paymentData?.uuid, amount, walletAddress]);

  // Initialize payment on open
  useEffect(() => {
    isMountedRef.current = true;

    if (open && amount > 0) {
      createPayment();
    }

    return () => {
      isMountedRef.current = false;
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [open, amount, createPayment]);

  // Start polling when pending
  useEffect(() => {
    if (state === "pending" && paymentData) {
      // Poll every 2 seconds
      pollingRef.current = setInterval(checkPayment, 2000);
      // Initial check
      checkPayment();

      return () => {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      };
    }
  }, [state, paymentData, checkPayment]);

  // Handle confirmed payment
  useEffect(() => {
    if (state === "confirmed" && txHash) {
      const timer = setTimeout(() => {
        onPaymentConfirmed(txHash);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [state, txHash, onPaymentConfirmed]);

  // Handle failed states
  useEffect(() => {
    if (state === "rejected" || state === "error" || state === "expired") {
      const timer = setTimeout(() => {
        onPaymentFailed(errorMessage || state);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state, errorMessage, onPaymentFailed]);

  const handleRetry = () => {
    createPayment();
  };

  const openDeepLink = () => {
    if (paymentData?.deepLink) {
      window.open(paymentData.deepLink, "_blank");
    }
  };

  // Prevent closing the modal
  const handleOpenChange = () => {
    // Do nothing - modal cannot be closed
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        // Hide the close button
        hideCloseButton
      >
        <DialogHeader>
          <DialogTitle className="text-center">
            {state === "creating" && "Preparing Payment..."}
            {state === "pending" && "Scan to Pay"}
            {state === "checking" && "Checking Payment..."}
            {state === "verifying" && "Verifying Transaction..."}
            {state === "confirmed" && "Payment Confirmed!"}
            {state === "rejected" && "Payment Rejected"}
            {state === "expired" && "Payment Expired"}
            {state === "error" && "Payment Error"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {state === "creating" && "Setting up your payment request..."}
            {state === "pending" && `Send ${amount} XRP to join the game`}
            {state === "checking" && "Please wait..."}
            {state === "verifying" && "Confirming on XRPL blockchain..."}
            {state === "confirmed" && "Your payment has been verified!"}
            {state === "rejected" && "You declined the payment request"}
            {state === "expired" && "The payment request has expired"}
            {state === "error" && errorMessage}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {/* Creating state */}
          {state === "creating" && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">Creating payment request...</p>
            </div>
          )}

          {/* Pending state - Show QR */}
          {state === "pending" && paymentData && (
            <div className="flex flex-col items-center space-y-4">
              {/* Amount display */}
              <div className="text-center bg-muted/50 rounded-lg p-4 w-full">
                <p className="text-sm text-muted-foreground">Amount to pay</p>
                <p className="text-3xl font-bold text-primary">{amount} XRP</p>
              </div>

              {/* QR Code */}
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <img
                  src={paymentData.qrUrl}
                  alt="Payment QR Code"
                  className="w-48 h-48"
                />
              </div>

              {/* Instructions */}
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <QrCode className="h-4 w-4" />
                  <span>Scan with Xaman Wallet</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  or
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openDeepLink}
                  className="gap-2"
                >
                  <Smartphone className="h-4 w-4" />
                  Open in Xaman App
                </Button>
              </div>

              {/* Polling indicator */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Waiting for payment confirmation...</span>
              </div>
            </div>
          )}

          {/* Confirmed state */}
          {state === "confirmed" && (
            <div className="flex flex-col items-center justify-center py-4">
              <CheckCircle className="h-20 w-20 text-green-500" />
              <p className="mt-4 text-lg font-semibold text-green-600">Payment Verified!</p>
              <p className="text-sm text-muted-foreground mt-2">
                {amount} XRP successfully transferred
              </p>
              {txHash && (
                <code className="mt-2 text-xs bg-muted px-2 py-1 rounded max-w-full truncate">
                  TX: {txHash.slice(0, 16)}...{txHash.slice(-8)}
                </code>
              )}
              <div className="flex items-center gap-2 mt-4 text-primary">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Joining game...</span>
              </div>
            </div>
          )}

          {/* Rejected state */}
          {state === "rejected" && (
            <div className="flex flex-col items-center justify-center py-4">
              <XCircle className="h-20 w-20 text-amber-500" />
              <p className="mt-4 text-lg font-semibold text-amber-600">Payment Declined</p>
              <p className="text-sm text-muted-foreground mt-2 text-center">
                You rejected the payment request.
                <br />Returning to lobby...
              </p>
            </div>
          )}

          {/* Expired state */}
          {state === "expired" && (
            <div className="flex flex-col items-center justify-center py-4">
              <AlertCircle className="h-20 w-20 text-amber-500" />
              <p className="mt-4 text-lg font-semibold text-amber-600">Request Expired</p>
              <p className="text-sm text-muted-foreground mt-2 text-center">
                The payment request has expired.
              </p>
              <Button onClick={handleRetry} className="mt-4">
                Try Again
              </Button>
            </div>
          )}

          {/* Error state */}
          {state === "error" && (
            <div className="flex flex-col items-center justify-center py-4">
              <AlertCircle className="h-20 w-20 text-destructive" />
              <p className="mt-4 text-lg font-semibold text-destructive">Payment Error</p>
              <p className="text-sm text-muted-foreground mt-2 text-center max-w-xs">
                {errorMessage || "An unexpected error occurred"}
              </p>
              <Button onClick={handleRetry} className="mt-4">
                Try Again
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
