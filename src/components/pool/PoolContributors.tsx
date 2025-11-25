import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

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

export const PoolContributors = ({ contributors, loading, totalLpTokens }: PoolContributorsProps) => {
  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Контрибьюторы</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Контрибьюторы</CardTitle>
        <p className="text-sm text-muted-foreground">
          Провайдеры ликвидности и их доли в пуле
        </p>
      </CardHeader>
      <CardContent>
        {contributors.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Нет данных о контрибьюторах
          </div>
        ) : (
          <div className="space-y-4">
            {contributors.map((contributor, index) => (
              <div 
                key={contributor.address} 
                className="flex items-center gap-3 p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
              >
                <Avatar className="h-10 w-10 bg-primary/20">
                  <AvatarFallback className="text-primary font-semibold">
                    #{index + 1}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {contributor.address.slice(0, 6)}...{contributor.address.slice(-4)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {parseFloat(contributor.lpTokens).toLocaleString()} LP токенов
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold text-primary">
                    {contributor.percentage}%
                  </p>
                  <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${Math.min(parseFloat(contributor.percentage), 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
            
            {contributors.length > 0 && (
              <div className="pt-3 mt-3 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Всего LP токенов:</span>
                  <span className="font-semibold text-foreground">
                    {parseFloat(totalLpTokens).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
