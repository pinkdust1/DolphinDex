import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 container mx-auto px-4">
        <div className="text-center space-y-6 py-20">
          <h1 className="text-4xl font-bold text-foreground">Welcome to XRPL Trading Platform</h1>
          <p className="text-xl text-muted-foreground">Swap, trade, and manage your XRPL assets</p>
          <Button 
            size="lg" 
            onClick={() => navigate('/pool/rE1tW1ZuRNjaTkEHaYpucbd6Cx7viMrzT6')}
          >
            View Demo Pool
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Index;
