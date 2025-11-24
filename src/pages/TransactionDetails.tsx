import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, ArrowLeft, ExternalLink } from "lucide-react";
import { fetchTransactionData } from "@/utils/xrpl";
import { toast } from "@/hooks/use-toast";

const TransactionDetails = () => {
  const { transaction } = useParams<{ transaction: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (transaction) {
      loadTransactionData();
    }
  }, [transaction]);

  const loadTransactionData = async () => {
    if (!transaction) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchTransactionData(transaction);
      setData(result);
    } catch (err) {
      setError('Транзакция не найдена');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyHash = () => {
    if (transaction) {
      navigator.clipboard.writeText(transaction);
      toast({
        title: "Скопировано",
        description: "Хэш транзакции скопирован в буфер обмена",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 container mx-auto px-4 pb-8">
          <div className="space-y-6 max-w-7xl mx-auto">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 container mx-auto px-4 pb-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Вернуться к поиску
            </Link>
            <Alert variant="destructive">
              <AlertDescription>
                {error || 'Не удалось загрузить данные транзакции'}
              </AlertDescription>
            </Alert>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 container mx-auto px-4 pb-8">
        <div className="space-y-6 max-w-7xl mx-auto">
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Вернуться к поиску
          </Link>

          {/* Transaction Header */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Транзакция XRPL</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Хэш транзакции</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono break-all">{transaction}</span>
                  <button
                    onClick={handleCopyHash}
                    className="p-2 hover:bg-accent rounded-md transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {data.status && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Статус</p>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    data.status === 'success' || data.status === 'tesSUCCESS' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {data.status}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transaction Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Отправитель</CardTitle>
              </CardHeader>
              <CardContent>
                <Link 
                  to={`/address/${data.sender || data.Account}`}
                  className="font-mono text-sm text-primary hover:underline break-all flex items-center gap-2"
                >
                  {data.sender || data.Account || '--'}
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Получатель</CardTitle>
              </CardHeader>
              <CardContent>
                <Link 
                  to={`/address/${data.recipient || data.Destination}`}
                  className="font-mono text-sm text-primary hover:underline break-all flex items-center gap-2"
                >
                  {data.recipient || data.Destination || '--'}
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Сумма</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {data.amount || data.Amount || '--'} XRP
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Комиссия</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl">
                  {data.fee || data.Fee || '--'} XRP
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Дата</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {data.date || data.date_time || '--'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Additional Info */}
          <Card>
            <CardHeader>
              <CardTitle>Дополнительная информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Тип транзакции</p>
                  <p className="text-sm">{data.type || data.TransactionType || '--'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ledger</p>
                  <p className="text-sm font-mono">{data.ledger || data.ledger_index || '--'}</p>
                </div>
                {data.sequence && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Sequence</p>
                    <p className="text-sm font-mono">{data.sequence}</p>
                  </div>
                )}
                {data.memo && (
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">Memo</p>
                    <p className="text-sm break-all">{data.memo}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default TransactionDetails;
