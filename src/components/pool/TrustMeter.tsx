interface TrustMeterProps {
  score: string;
}

export const TrustMeter = ({ score }: TrustMeterProps) => {
  return (
    <div className="flex flex-col items-center gap-2 p-4 bg-secondary/50 rounded-lg">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            className="text-primary"
          >
            <path
              d="M16 4L18.472 11.528L26 14L18.472 16.472L16 24L13.528 16.472L6 14L13.528 11.528L16 4Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>
      <span className="text-2xl font-bold text-foreground">{score}</span>
      <span className="text-xs text-muted-foreground">Trust Score</span>
    </div>
  );
};
