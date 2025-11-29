import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink, Copy, ArrowLeft } from "lucide-react";
import { fetchAddressData, isAMMAccount } from "@/utils/xrpl";
import { toast } from "@/hooks/use-toast";

const AddressDetails = () => {
  const { address } = useParams<{ address: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (address) {
      loadAddressData();
    }
  }, [address]);

  const loadAddressData = async () => {
    if (!address) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Check if this is an AMM account first
      const isAMM = await isAMMAccount(address);
      
      if (isAMM) {
        // Redirect to pool page
        navigate(`/pool/${address}`, { replace: true });
        return;
      }
      
      const result = await fetchAddressData(address);
      setData(result);
    } catch (err) {
      setError('Address data not found');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({
        title: "Copied",
        description: "Address copied to clipboard",
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
        <main className="pt-20 container mx-auto px-4 pb-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to search
            </Link>
            <Alert variant="destructive">
              <AlertDescription>
                {error || 'Failed to load address data'}
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
            Back to search
          </Link>

          {/* Address Header */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">XRPL Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-muted-foreground break-all">{address}</span>
                <button
                  onClick={handleCopyAddress}
                  className="p-2 hover:bg-accent rounded-md transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Balance & Tokens */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>XRP Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{data.balance || '0'} XRP</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tokens</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {data.tokens?.length || 0} tokens
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {data.transactions && data.transactions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hash</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.transactions.map((tx: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono text-sm">
                          {tx.hash?.substring(0, 10)}...
                        </TableCell>
                        <TableCell>{tx.type || 'Payment'}</TableCell>
                        <TableCell>{tx.amount || '--'}</TableCell>
                        <TableCell>{tx.date || '--'}</TableCell>
                        <TableCell>
                          <Link 
                            to={`/transaction/${tx.hash}`}
                            className="inline-flex items-center text-primary hover:underline"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No transactions available
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AddressDetails;