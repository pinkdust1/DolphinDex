import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";

interface LedgerBlock {
  ledgerIndex: number;
  hash: string;
  parentHash: string;
  closeTime: string;
  txCount: number;
}

const PROXY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/xrpl-proxy`;

async function fetchLatestLedger(): Promise<LedgerBlock | null> {
  try {
    const response = await fetch(PROXY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
      body: JSON.stringify({
        method: "ledger",
        params: [{ ledger_index: "validated", transactions: true }],
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    const ledger = data.result?.ledger;
    if (!ledger) return null;

    const rippleEpoch = 946684800;
    const closeTime = new Date(
      (ledger.close_time + rippleEpoch) * 1000
    ).toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    return {
      ledgerIndex: parseInt(ledger.ledger_index),
      hash: ledger.ledger_hash || ledger.hash,
      parentHash: ledger.parent_hash,
      closeTime,
      txCount: ledger.transactions?.length ?? 0,
    };
  } catch {
    return null;
  }
}

const MAX_BLOCKS = 6;

export const LedgerBlocks = () => {
  const [blocks, setBlocks] = useState<LedgerBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const seenRef = useRef<Set<number>>(new Set());
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    const poll = async () => {
      const block = await fetchLatestLedger();
      if (block && !seenRef.current.has(block.ledgerIndex)) {
        seenRef.current.add(block.ledgerIndex);
        setBlocks((prev) => {
          const next = [block, ...prev].slice(0, MAX_BLOCKS);
          return next;
        });
        setLoading(false);
      }
    };

    poll();
    intervalRef.current = setInterval(poll, 4000);
    return () => clearInterval(intervalRef.current);
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto mt-10 space-y-3">
        <h2 className="text-sm font-medium tracking-widest uppercase text-muted-foreground">
          Live Ledger
        </h2>
        <div className="flex gap-3 overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="min-w-[220px] h-[160px] rounded-lg bg-muted animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto mt-10 space-y-3">
      <h2 className="text-sm font-medium tracking-widest uppercase text-muted-foreground">
        Live Ledger
      </h2>

      <div className="relative overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
        <div className="flex items-stretch gap-0">
          {blocks.map((block, idx) => (
            <div
              key={block.ledgerIndex}
              className="flex items-stretch animate-fade-in"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              {/* Connector line */}
              {idx > 0 && (
                <div className="flex items-center px-1.5 shrink-0">
                  <div className="w-6 md:w-10 h-px bg-border relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                  </div>
                </div>
              )}

              <Card
                className={`min-w-[200px] md:min-w-[230px] p-4 flex flex-col gap-2 shrink-0 transition-all duration-500 ${
                  idx === 0
                    ? "border-foreground/30 shadow-md"
                    : "border-border opacity-70"
                }`}
              >
                {/* Index badge */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-foreground">
                    #{block.ledgerIndex.toLocaleString()}
                  </span>
                  {idx === 0 && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-foreground/40" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-foreground/70" />
                    </span>
                  )}
                </div>

                {/* Hash */}
                <div className="space-y-0.5">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Hash
                  </p>
                  <p className="text-xs font-mono text-foreground/80 truncate max-w-[180px]">
                    {block.hash}
                  </p>
                </div>

                {/* Parent hash */}
                <div className="space-y-0.5">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Parent
                  </p>
                  <p className="text-xs font-mono text-foreground/60 truncate max-w-[180px]">
                    {block.parentHash}
                  </p>
                </div>

                {/* Footer row */}
                <div className="flex items-center justify-between pt-1 mt-auto border-t border-border">
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {block.closeTime}
                  </span>
                  <span className="text-[11px] font-medium text-foreground/80">
                    {block.txCount} tx
                  </span>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
