import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface Contributor {
  address: string;
  lpTokens: string;
  percentage: string;
}

interface PoolContributorsProps {
  contributors: Contributor[];
  loading?: boolean;
  totalLpTokens: string;
}

const COLORS = [
  'hsl(220, 70%, 55%)',
  'hsl(220, 70%, 65%)',
  'hsl(160, 60%, 50%)',
  'hsl(160, 60%, 60%)',
  'hsl(200, 65%, 55%)',
  'hsl(30, 70%, 55%)',
  'hsl(270, 60%, 55%)',
  'hsl(280, 60%, 65%)',
];

export const PoolContributors = ({ contributors, loading, totalLpTokens }: PoolContributorsProps) => {
  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Contributors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-48 w-full" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (contributors.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Contributors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No contributor data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = contributors.map((contributor, index) => ({
    name: `${contributor.address.slice(0, 6)}...${contributor.address.slice(-4)}`,
    value: parseFloat(contributor.percentage),
    color: COLORS[index % COLORS.length]
  }));

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Contributors</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Donut Chart */}
          <div className="relative h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Contributors List Header */}
          <div className="grid grid-cols-[1fr,auto,auto] gap-4 px-3 pb-2 border-b border-border text-xs text-muted-foreground font-medium">
            <div>Wallet</div>
            <div className="text-right">Share</div>
            <div className="text-right w-20">LP Tokens</div>
          </div>

          {/* Contributors List */}
          <div className="space-y-2">
            {contributors.map((contributor, index) => (
              <div 
                key={contributor.address} 
                className="grid grid-cols-[1fr,auto,auto] gap-4 items-center px-3 py-2.5 rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm font-mono text-foreground truncate">
                    {contributor.address.slice(0, 8)}...{contributor.address.slice(-4)}
                  </span>
                </div>
                
                <div className="text-sm font-semibold text-foreground">
                  {contributor.percentage}%
                </div>

                <div className="text-sm text-muted-foreground text-right w-20">
                  {parseFloat(contributor.lpTokens) >= 1000 
                    ? `${(parseFloat(contributor.lpTokens) / 1000).toFixed(1)}K`
                    : parseFloat(contributor.lpTokens).toFixed(0)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};