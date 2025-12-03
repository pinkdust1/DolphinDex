import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, ExternalLink, CheckCircle, XCircle } from "lucide-react";

interface Transaction {
  id: number;
  hash: string;
  tranzaction_for: string;
  quantity_wrb: string;
  time: string;
  status: string;
}

interface FarmingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DIRECTUS_URL = "https://admin.asapcase.shop/items/wrb_transactions";
const ITEMS_PER_PAGE = 10;
const REWARD_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const FarmingModal = ({ open, onOpenChange }: FarmingModalProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);
  const [lastRewardTime, setLastRewardTime] = useState<Date | null>(null);

  // Parse Directus time format "HH:mm DD.MM.YYYY" to Date
  const parseDirectusTime = (timeStr: string): Date => {
    const [time, date] = timeStr.split(" ");
    const [hours, minutes] = time.split(":");
    const [day, month, year] = date.split(".");
    return new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hours),
      parseInt(minutes)
    );
  };

  // Fetch last transaction to get reward time
  const fetchLastRewardTime = useCallback(async () => {
    try {
      const response = await fetch(
        `${DIRECTUS_URL}?sort=-time&limit=1`
      );
      const data = await response.json();
      if (data.data && data.data.length > 0) {
        const lastTime = parseDirectusTime(data.data[0].time);
        setLastRewardTime(lastTime);
      }
    } catch (error) {
      console.error("Failed to fetch last reward time:", error);
    }
  }, []);

  // Fetch transactions with pagination
  const fetchTransactions = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const offset = (page - 1) * ITEMS_PER_PAGE;
      const [dataResponse, countResponse] = await Promise.all([
        fetch(`${DIRECTUS_URL}?sort=-time&limit=${ITEMS_PER_PAGE}&offset=${offset}`),
        fetch(`${DIRECTUS_URL}?aggregate[count]=id`)
      ]);
      
      const data = await dataResponse.json();
      const countData = await countResponse.json();
      
      setTransactions(data.data || []);
      setTotalItems(countData.data?.[0]?.count?.id || 0);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate time remaining until next reward
  useEffect(() => {
    if (!lastRewardTime) return;

    const calculateTimeRemaining = () => {
      const now = new Date();
      const nextRewardTime = new Date(lastRewardTime.getTime() + REWARD_INTERVAL_MS);
      const diff = nextRewardTime.getTime() - now.getTime();

      if (diff <= 0) {
        // Timer expired, refresh data
        fetchLastRewardTime();
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining({ hours, minutes, seconds });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [lastRewardTime, fetchLastRewardTime]);

  // Fetch data when modal opens
  useEffect(() => {
    if (open) {
      fetchLastRewardTime();
      fetchTransactions(currentPage);
    }
  }, [open, currentPage, fetchLastRewardTime, fetchTransactions]);

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const truncateHash = (hash: string) => {
    if (hash.length <= 16) return hash;
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  };

  const truncateAddress = (address: string) => {
    if (address.length <= 16) return address;
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? "default" : "outline"}
          size="sm"
          className="w-8 h-8"
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </Button>
      );
    }

    return (
      <div className="flex items-center justify-center gap-1 mt-4">
        {startPage > 1 && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="w-8 h-8"
              onClick={() => setCurrentPage(1)}
            >
              1
            </Button>
            {startPage > 2 && <span className="px-2 text-muted-foreground">...</span>}
          </>
        )}
        {pages}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2 text-muted-foreground">...</span>}
            <Button
              variant="outline"
              size="sm"
              className="w-8 h-8"
              onClick={() => setCurrentPage(totalPages)}
            >
              {totalPages}
            </Button>
          </>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Pool Farming</DialogTitle>
          <DialogDescription>
            Add liquidity and start earning passive rewards.
          </DialogDescription>
        </DialogHeader>

        {/* Timer Section */}
        <div className="bg-secondary/50 rounded-lg p-4 mt-2">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-primary" />
            <span className="font-medium">Next Reward Distribution</span>
          </div>
          {timeRemaining ? (
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {String(timeRemaining.hours).padStart(2, "0")}
                </div>
                <div className="text-xs text-muted-foreground uppercase">Hours</div>
              </div>
              <span className="text-2xl font-bold text-muted-foreground">:</span>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {String(timeRemaining.minutes).padStart(2, "0")}
                </div>
                <div className="text-xs text-muted-foreground uppercase">Minutes</div>
              </div>
              <span className="text-2xl font-bold text-muted-foreground">:</span>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {String(timeRemaining.seconds).padStart(2, "0")}
                </div>
                <div className="text-xs text-muted-foreground uppercase">Seconds</div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <Skeleton className="h-12 w-48" />
            </div>
          )}
        </div>

        {/* Transactions Table */}
        <div className="mt-4">
          <h3 className="font-medium mb-3">Recent Distributions</h3>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hash</TableHead>
                      <TableHead>Recipient</TableHead>
                      <TableHead className="text-right">Amount (WRB)</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          No transactions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell className="font-mono text-xs">
                            <a
                              href={`https://xrpscan.com/tx/${tx.hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 hover:text-primary transition-colors"
                            >
                              {truncateHash(tx.hash)}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            <a
                              href={`https://xrpscan.com/account/${tx.tranzaction_for}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-primary transition-colors"
                            >
                              {truncateAddress(tx.tranzaction_for)}
                            </a>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {tx.quantity_wrb}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {tx.time}
                          </TableCell>
                          <TableCell>
                            {tx.status === "Success" ? (
                              <span className="flex items-center gap-1 text-green-500 text-sm">
                                <CheckCircle className="w-4 h-4" />
                                Success
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-destructive text-sm">
                                <XCircle className="w-4 h-4" />
                                {tx.status}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              {totalPages > 1 && renderPagination()}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
