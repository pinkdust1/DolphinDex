import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Copy, ExternalLink, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { fetchTokenData, parseTokenQuery, rippleTimeToDate } from "@/utils/xrpl";
import { Header } from "@/components/Header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function TokenDetails() {
  const { tokenId } = useParams<{ tokenId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTokenData();
  }, [tokenId]);

  const loadTokenData = async () => {
    if (!tokenId) return;

    try {
      setLoading(true);
      setError(null);

      const parsed = parseTokenQuery(tokenId);
      if (!parsed) {
        throw new Error("Неверный формат токена. Используйте формат: CURRENCY.rISSUER");
      }

      const tokenData = await fetchTokenData(parsed.currency, parsed.issuer);
      setData(tokenData);
    } catch (err: any) {
      console.error("Error loading token data:", err);
      setError(err.message || "Не удалось загрузить данные токена");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Скопировано",
      description: `${label} скопирован в буфер обмена`,
    });
  };

  const formatCurrency = (currency: string): string => {
    // If it's a hex string (40 chars), try to decode it
    if (currency.length === 40 && /^[A-F0-9]+$/i.test(currency)) {
      try {
        const decoded = Buffer.from(currency, 'hex').toString('utf8').replace(/\0/g, '');
        return decoded || currency;
      } catch {
        return currency;
      }
    }
    return currency;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>

          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
            </div>
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>

          <Alert variant="destructive">
            <AlertDescription>{error || "Токен не найден"}</AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  const currencyDisplay = formatCurrency(data.currency);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>

        {/* Token Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-3xl flex items-center gap-2">
                  {currencyDisplay}
                  <Badge variant="secondary">Токен</Badge>
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <span className="font-mono text-sm">Эмитент: {data.issuer}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleCopy(data.issuer, "Адрес эмитента")}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Total Supply */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Общее предложение</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalSupply.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">{currencyDisplay}</p>
            </CardContent>
          </Card>

          {/* Holders Count */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Держатели</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.holdersCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Уникальных кошельков</p>
            </CardContent>
          </Card>

          {/* Issuer Balance */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Баланс эмитента</CardTitle>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(parseInt(data.issuerInfo.Balance) / 1000000).toFixed(2)} XRP
              </div>
              <p className="text-xs text-muted-foreground mt-1">На счете эмитента</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Holders */}
          <Card>
            <CardHeader>
              <CardTitle>Топ держатели</CardTitle>
              <CardDescription>10 крупнейших держателей токена</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.topHolders.map((holder: any, index: number) => (
                  <div
                    key={holder.account}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <button
                          onClick={() => navigate(`/address/${holder.account}`)}
                          className="font-mono text-sm hover:text-primary transition-colors"
                        >
                          {holder.account.slice(0, 8)}...{holder.account.slice(-6)}
                        </button>
                        <p className="text-xs text-muted-foreground">
                          {((holder.balance / data.totalSupply) * 100).toFixed(2)}% от общего
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{holder.balance.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">{currencyDisplay}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Последние транзакции</CardTitle>
              <CardDescription>Недавняя активность токена</CardDescription>
            </CardHeader>
            <CardContent>
              {data.transactions.length > 0 ? (
                <div className="space-y-2">
                  {data.transactions.slice(0, 10).map((tx: any) => (
                    <div
                      key={tx.tx.hash}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                      onClick={() => navigate(`/transaction/${tx.tx.hash}`)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-sm truncate">
                          {tx.tx.hash.slice(0, 12)}...{tx.tx.hash.slice(-8)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {tx.tx.date ? rippleTimeToDate(tx.tx.date) : "N/A"}
                        </div>
                      </div>
                      <Badge variant={tx.meta.TransactionResult === "tesSUCCESS" ? "default" : "destructive"}>
                        {tx.meta.TransactionResult === "tesSUCCESS" ? "Успешно" : "Ошибка"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Нет транзакций
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
