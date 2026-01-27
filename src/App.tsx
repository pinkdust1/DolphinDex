import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Pools from "./pages/Pools";
import PoolDetails from "./pages/PoolDetails";
import Farming from "./pages/Farming";
import AddressDetails from "./pages/AddressDetails";
import TransactionDetails from "./pages/TransactionDetails";
import TokenDetails from "./pages/TokenDetails";
import Trade from "./pages/Trade";
import NFTs from "./pages/NFTs";
import Game from "./pages/Game";
import GameLobby from "./pages/GameLobby";
import GamePlay from "./pages/GamePlay";
import MiniApp from "./pages/MiniApp";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" storageKey="dolphinscan-theme">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/pool" element={<Pools />} />
            <Route path="/pool/:address" element={<PoolDetails />} />
            <Route path="/farming" element={<Farming />} />
            <Route path="/address/:address" element={<AddressDetails />} />
            <Route path="/transaction/:transaction" element={<TransactionDetails />} />
            <Route path="/token/:tokenId" element={<TokenDetails />} />
            <Route path="/trade" element={<Trade />} />
            <Route path="/nfts" element={<NFTs />} />
            <Route path="/game" element={<Game />} />
            <Route path="/game/:gameId" element={<GameLobby />} />
            <Route path="/game/:gameId/play/:lobbyId" element={<GamePlay />} />
            <Route path="/tg" element={<MiniApp />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
