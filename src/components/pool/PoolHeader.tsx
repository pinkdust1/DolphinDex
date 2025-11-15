import { Copy, Share2, ThumbsUp, ThumbsDown, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrustMeter } from "./TrustMeter";
import { toast } from "sonner";

interface PoolHeaderProps {
  poolData: {
    token1: {
      symbol: string;
      logo: string;
    };
    token2: {
      symbol: string;
      logo: string;
    };
    fee: string;
    address: string;
    trustScore: string;
  };
}

export const PoolHeader = ({ poolData }: PoolHeaderProps) => {
  const handleCopyAddress = () => {
    navigator.clipboard.writeText(poolData.address);
    toast.success("Address copied to clipboard");
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Pool link copied to clipboard");
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left Section - Token Info */}
        <div className="flex items-start gap-4 flex-1">
          {/* Token Logos */}
          <div className="relative flex items-center">
            <img
              src={poolData.token1.logo}
              alt={poolData.token1.symbol}
              className="w-11 h-11 rounded-full border-2 border-background z-10"
            />
            <img
              src={poolData.token2.logo}
              alt={poolData.token2.symbol}
              className="w-10 h-10 rounded-full -ml-2"
            />
          </div>

          {/* Token Details */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl font-semibold text-foreground">
                {poolData.token1.symbol}
              </span>
              <span className="text-xl text-muted-foreground">/</span>
              <span className="text-xl font-semibold text-foreground">
                {poolData.token2.symbol}
              </span>
              <div className="bg-secondary px-3 py-1 rounded-full">
                <span className="text-sm font-medium text-secondary-foreground">
                  {poolData.fee}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-mono truncate max-w-[200px] sm:max-w-none">{poolData.address}</span>
              <button
                onClick={handleCopyAddress}
                className="hover:text-foreground transition-colors flex-shrink-0"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Section - Trust Meter & Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
          <TrustMeter score={poolData.trustScore} />

          <div className="flex items-center gap-2 flex-wrap">
            <Button className="gap-2 h-9 text-sm">
              <svg
                width="19"
                height="18"
                viewBox="0 0 19 18"
                fill="none"
                className="w-4 h-4"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M3.72516 11.6641C3.74533 11.7647 3.79514 11.8575 3.86858 11.9304L6.58479 14.6278C6.63294 14.6769 6.69045 14.7162 6.7541 14.7433C6.81843 14.7708 6.88769 14.7853 6.95782 14.7859C7.02795 14.7865 7.09746 14.7732 7.16228 14.7469C7.22709 14.7206 7.28586 14.6817 7.3352 14.6327C7.38453 14.5838 7.42345 14.5256 7.44978 14.4617C7.4761 14.3979 7.48932 14.3295 7.48872 14.2606C7.48812 14.1917 7.47371 14.1235 7.44628 14.0601C7.41909 13.9973 7.37963 13.9402 7.33008 13.8924L7.3274 13.8897L5.50875 12.0836L14.76 12.0836C14.9001 12.0836 15.0342 12.0283 15.1327 11.9305C15.2313 11.8326 15.2863 11.7004 15.2863 11.5628C15.2863 11.4252 15.2313 11.293 15.1327 11.1951C15.0342 11.0973 14.9001 11.042 14.76 11.042L4.24113 11.042C4.13667 11.042 4.03472 11.0728 3.94817 11.1303C3.86164 11.1878 3.79448 11.2692 3.75489 11.3642C3.71531 11.4591 3.70499 11.5634 3.72516 11.6641ZM11.6706 4.09674L13.4924 5.9059H4.24115C4.10099 5.9059 3.96694 5.9612 3.86837 6.05907C3.76986 6.15689 3.71484 6.28917 3.71484 6.42673C3.71484 6.56429 3.76986 6.69657 3.86837 6.79439C3.96692 6.89224 4.10095 6.94754 4.24108 6.94756L14.76 6.94749C14.8644 6.94744 14.9664 6.91665 15.0529 6.85921C15.1394 6.80178 15.2066 6.72035 15.2462 6.62543C15.2858 6.53053 15.2961 6.42621 15.276 6.32557C15.2559 6.22503 15.2061 6.13221 15.1327 6.05922L12.4185 3.3638L12.417 3.36237C12.318 3.26681 12.1846 3.21348 12.0458 3.21447C11.907 3.21547 11.7745 3.27068 11.6768 3.36763C11.5792 3.46453 11.5243 3.59529 11.5233 3.73155C11.5223 3.86717 11.5754 3.99865 11.6706 4.09674Z"
                  fill="currentColor"
                />
              </svg>
              Swap
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="w-9 h-9 flex-shrink-0"
              onClick={handleShare}
            >
              <MoreVertical className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="w-9 h-9 flex-shrink-0"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-1 bg-secondary rounded-md p-1 flex-shrink-0">
              <button className="p-1.5 hover:bg-accent rounded transition-colors">
                <ThumbsUp className="w-4 h-4 text-muted-foreground" />
              </button>
              <button className="p-1.5 hover:bg-accent rounded transition-colors">
                <ThumbsDown className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
