import { Header } from "@/components/Header";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 container mx-auto px-4">
        <div className="text-center space-y-6 py-20">
          <h1 className="text-4xl font-bold text-foreground">Welcome</h1>
          <p className="text-xl text-muted-foreground">Your XRPL trading platform</p>
        </div>
      </main>
    </div>
  );
};

export default Index;
