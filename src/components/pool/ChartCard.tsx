import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useState } from "react";

interface ChartCardProps {
  title: string;
  currentValue: string;
  symbol: string;
  timeframe: string;
  onTimeframeChange: (timeframe: string) => void;
  chartType: "price" | "volume";
}

export const ChartCard = ({
  title,
  currentValue,
  symbol,
  timeframe,
  onTimeframeChange,
}: ChartCardProps) => {
  const timeframes = ["1D", "1M", "3M"];
  const [wholePart, decimalPart] = currentValue.split(".");

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-foreground">{title}</h3>
          <div className="flex items-center gap-1 sm:gap-2">
            {timeframes.map((tf) => (
              <button
                key={tf}
                onClick={() => onTimeframeChange(tf)}
                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md transition-colors ${
                  timeframe === tf
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold text-foreground">
            {wholePart}
            {decimalPart && (
              <span className="text-muted-foreground">.{decimalPart}</span>
            )}
          </span>
          <span className="text-base sm:text-lg text-muted-foreground">{symbol}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-[250px] sm:h-[330px] bg-secondary/20 rounded-lg flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <svg
              className="w-16 h-16 mx-auto mb-2 opacity-50"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
              />
            </svg>
            <p className="text-sm">Chart visualization</p>
            <p className="text-xs mt-1">
              Integrate your preferred charting library
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
