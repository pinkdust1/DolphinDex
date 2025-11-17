import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { NavigationDropdown } from "@/components/NavigationDropdown";
import { NetworkSelector } from "@/components/NetworkSelector";
import { SettingsDropdown } from "@/components/SettingsDropdown";
import { WalletConnectDialog } from "@/components/WalletConnectDialog";
import { NavLink } from "@/components/NavLink";
import { Menu, X } from "lucide-react";

export const Header = () => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Left Side */}
          <div className="flex items-center gap-8">
            <a href="/" className="text-xl font-bold text-foreground">
              LOGO
            </a>
            
            <nav className="hidden md:flex items-center gap-1">
              <NavLink 
                to="/trade" 
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors"
                activeClassName="bg-accent"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                  <path d="M21.9445 14.2778H14.8334C14.5266 14.2778 14.2778 14.5266 14.2778 14.8334V21.9445C14.2778 22.2513 14.5266 22.5001 14.8334 22.5001H21.9445C22.2513 22.5001 22.5001 22.2513 22.5001 21.9445V14.8334C22.5001 14.5266 22.2513 14.2778 21.9445 14.2778Z" fill="currentColor"/>
                  <path d="M21.9445 3.61133H14.8334C14.5266 3.61133 14.2778 3.86006 14.2778 4.16688V11.278C14.2778 11.5848 14.5266 11.8336 14.8334 11.8336H21.9445C22.2513 11.8336 22.5001 11.5848 22.5001 11.278V4.16688C22.5001 3.86006 22.2513 3.61133 21.9445 3.61133Z" fill="currentColor"/>
                  <path d="M11.2778 1.5H2.38889C1.89797 1.5 1.5 1.89797 1.5 2.38889V11.2778C1.5 11.7687 1.89797 12.1667 2.38889 12.1667H11.2778C11.7687 12.1667 12.1667 11.7687 12.1667 11.2778V2.38889C12.1667 1.89797 11.7687 1.5 11.2778 1.5Z" fill="hsl(var(--muted-foreground))"/>
                  <path d="M11.278 14.2778H4.16688C3.86006 14.2778 3.61133 14.5266 3.61133 14.8334V21.9445C3.61133 22.2513 3.86006 22.5001 4.16688 22.5001H11.278C11.5848 22.5001 11.8336 22.2513 11.8336 21.9445V14.8334C11.8336 14.5266 11.5848 14.2778 11.278 14.2778Z" fill="currentColor"/>
                </svg>
                <span className="text-sm text-foreground">Trade</span>
              </NavLink>

              <NavLink 
                to="/nfts" 
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors"
                activeClassName="bg-accent"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                  <path fillRule="evenodd" clipRule="evenodd" d="M7.45586 21.6214C7.35588 21.788 7.47591 22 7.67023 22H18.0783C18.1661 22 18.2475 21.954 18.2927 21.8787L23.4897 13.2171C23.5897 13.0505 23.4697 12.8385 23.2753 12.8385H12.8673C12.7794 12.8385 12.6981 12.8845 12.6529 12.9598L7.45586 21.6214ZM11.1947 12.1285C11.2421 12.0493 11.2421 11.9505 11.1947 11.8713L5.99561 3.20065C5.89855 3.03878 5.66399 3.03872 5.56685 3.20055L0.362231 11.8712C0.314697 11.9504 0.314696 12.0494 0.362231 12.1286L5.56685 20.7992C5.66399 20.9611 5.89855 20.961 5.99561 20.7991L11.1947 12.1285Z" fill="currentColor"/>
                  <path d="M23.4882 10.783L18.2912 2.12137C18.246 2.04607 18.1647 2 18.0769 2H7.66878C7.47445 2 7.35443 2.21199 7.45441 2.37863L12.6514 11.0402C12.6966 11.1155 12.778 11.1616 12.8658 11.1616H23.2739C23.4682 11.1616 23.5882 10.9496 23.4882 10.783Z" fill="hsl(var(--muted-foreground))"/>
                </svg>
              <span className="text-sm text-foreground">NFTs</span>
              </NavLink>

              <NavigationDropdown
                label="Token Hub"
                icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                  <path d="M9.16992 12L9.56483 11.8025C10.5325 11.3187 11.3171 10.5341 11.8009 9.56648L11.9983 9.17157L12.1958 9.56648C12.6796 10.5341 13.4642 11.3187 14.4319 11.8025L14.8268 12L14.4319 12.1975C13.4642 12.6813 12.6796 13.4659 12.1958 14.4335L11.9983 14.8284L11.8009 14.4335C11.3171 13.4659 10.5325 12.6813 9.56483 12.1975L9.16992 12Z" fill="hsl(var(--muted-foreground))"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 23C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1C5.92487 1 1 5.92487 1 12C1 18.0751 5.92487 23 12 23ZM12.9697 8.01431L12.0027 6.08031L11.0357 8.01431C10.3825 9.32062 9.32332 10.3798 8.01701 11.033L6.08301 12L8.01701 12.967C9.32332 13.6202 10.3825 14.6794 11.0357 15.9857L12.0027 17.9197L12.9697 15.9857C13.6229 14.6794 14.6821 13.6202 15.9884 12.967L17.9224 12L15.9884 11.033C14.6821 10.3798 13.6229 9.32062 12.9697 8.01431Z" fill="currentColor"/>
                </svg>}
                items={[
                  { title: "Markets", desc: "An accurate market index for all XRPL Tokens." },
                  { title: "IDO Launchpad", desc: "Launch your own project on the XRPL, issue tokens and raise funds." },
                  { title: "Airdrops", desc: "Track & Promote Community Airdrops" },
                  { title: "Game", desc: "Explore gaming ecosystem and play-to-earn opportunities.", href: "/game" },
                ]}
                isOpen={activeDropdown === "token"}
                onToggle={() => toggleDropdown("token")}
              />

              <NavigationDropdown
                label="Swap"
                icon={<svg width="19" height="18" viewBox="0 0 19 18" fill="none" className="w-5 h-5">
                  <path fillRule="evenodd" clipRule="evenodd" d="M3.72516 11.6641C3.74533 11.7647 3.79514 11.8575 3.86858 11.9304L6.58479 14.6278C6.63294 14.6769 6.69045 14.7162 6.7541 14.7433C6.81843 14.7708 6.88769 14.7853 6.95782 14.7859C7.02795 14.7865 7.09746 14.7732 7.16228 14.7469C7.22709 14.7206 7.28586 14.6817 7.3352 14.6327C7.38453 14.5838 7.42345 14.5256 7.44978 14.4617C7.4761 14.3979 7.48932 14.3295 7.48872 14.2606C7.48812 14.1917 7.47371 14.1235 7.44628 14.0601C7.41909 13.9973 7.37963 13.9402 7.33008 13.8924L7.3274 13.8897L5.50875 12.0836L14.76 12.0836C14.9001 12.0836 15.0342 12.0283 15.1327 11.9305C15.2313 11.8326 15.2863 11.7004 15.2863 11.5628C15.2863 11.4252 15.2313 11.293 15.1327 11.1951C15.0342 11.0973 14.9001 11.042 14.76 11.042L4.24113 11.042C4.13667 11.042 4.03472 11.0728 3.94817 11.1303C3.86164 11.1878 3.79448 11.2692 3.75489 11.3642C3.71531 11.4591 3.70499 11.5634 3.72516 11.6641ZM11.6706 4.09674L13.4924 5.9059H4.24115C4.10099 5.9059 3.96694 5.9612 3.86837 6.05907C3.76986 6.15689 3.71484 6.28917 3.71484 6.42673C3.71484 6.56429 3.76986 6.69657 3.86837 6.79439C3.96692 6.89224 4.10095 6.94754 4.24108 6.94756L14.76 6.94749C14.8644 6.94744 14.9664 6.91665 15.0529 6.85921C15.1394 6.80178 15.2066 6.72035 15.2462 6.62543C15.2858 6.53053 15.2961 6.42621 15.276 6.32557C15.2559 6.22503 15.2061 6.13221 15.1327 6.05922L12.4185 3.3638L12.417 3.36237C12.318 3.26681 12.1846 3.21348 12.0458 3.21447C11.907 3.21547 11.7745 3.27068 11.6768 3.36763C11.5792 3.46453 11.5243 3.59529 11.5233 3.73155C11.5223 3.86717 11.5754 3.99865 11.6706 4.09674Z" fill="currentColor"/>
                </svg>}
                items={[
                  { title: "QuickSwap", desc: "Swap in between Pools with the best rates on the XRP Ledger" },
                  { title: "Pools", desc: "XRPL Pools to provide liquidity and earn rewards", href: "/" },
                ]}
                isOpen={activeDropdown === "swap"}
                onToggle={() => toggleDropdown("swap")}
              />

              <NavigationDropdown
                label="Fiat"
                icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                  <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <line x1="2" y1="10" x2="22" y2="10" stroke="currentColor" strokeWidth="2"/>
                </svg>}
                items={[
                  { title: "Card", desc: "Spend crypto your way on real-world expenditures." },
                  { title: "Buy With Fiat", desc: "Purchase tokens with fiat using Visa, Mastercard & more." },
                ]}
                isOpen={activeDropdown === "fiat"}
                onToggle={() => toggleDropdown("fiat")}
              />
            </nav>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <NetworkSelector />
            </div>
            
            <Button 
              onClick={() => setWalletDialogOpen(true)}
            >
              Connect Wallet
            </Button>

            <div className="w-px h-5 bg-border hidden md:block" />

            <div className="hidden md:block">
              <SettingsDropdown />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-accent rounded-md transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <nav className="flex flex-col py-4 space-y-2">
              <NavLink 
                to="/trade" 
                className="px-4 py-2 hover:bg-accent transition-colors"
                activeClassName="bg-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                Trade
              </NavLink>
              
              <NavLink 
                to="/nfts" 
                className="px-4 py-2 hover:bg-accent transition-colors"
                activeClassName="bg-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                NFTs
              </NavLink>

              {/* Token Hub Section */}
              <div className="px-4 py-2">
                <p className="text-sm font-semibold text-muted-foreground mb-2">Token Hub</p>
                <div className="flex flex-col space-y-1 pl-2">
                  <a href="#" className="py-1.5 text-sm hover:text-primary transition-colors">
                    Markets
                  </a>
                  <a href="#" className="py-1.5 text-sm hover:text-primary transition-colors">
                    IDO Launchpad
                  </a>
                  <a href="#" className="py-1.5 text-sm hover:text-primary transition-colors">
                    Airdrops
                  </a>
                  <NavLink 
                    to="/game" 
                    className="py-1.5 text-sm hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Game
                  </NavLink>
                </div>
              </div>

              {/* Swap Section */}
              <div className="px-4 py-2">
                <p className="text-sm font-semibold text-muted-foreground mb-2">Swap</p>
                <div className="flex flex-col space-y-1 pl-2">
                  <a href="#" className="py-1.5 text-sm hover:text-primary transition-colors">
                    QuickSwap
                  </a>
                  <NavLink 
                    to="/" 
                    className="py-1.5 text-sm hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Pools
                  </NavLink>
                </div>
              </div>

              {/* Fiat Section */}
              <div className="px-4 py-2">
                <p className="text-sm font-semibold text-muted-foreground mb-2">Fiat</p>
                <div className="flex flex-col space-y-1 pl-2">
                  <a href="#" className="py-1.5 text-sm hover:text-primary transition-colors">
                    Card
                  </a>
                  <a href="#" className="py-1.5 text-sm hover:text-primary transition-colors">
                    Buy Crypto
                  </a>
                </div>
              </div>

              <div className="px-4 pt-2 border-t border-border mt-2">
                <NetworkSelector />
              </div>

              {/* Settings */}
              <div className="px-4 py-2">
                <p className="text-sm font-semibold text-muted-foreground mb-2">Settings</p>
                <div className="flex flex-col space-y-1 pl-2">
                  <a href="#" className="py-1.5 text-sm hover:text-primary transition-colors">
                    Language & Currency
                  </a>
                  <a href="#" className="py-1.5 text-sm hover:text-primary transition-colors">
                    Appearance
                  </a>
                </div>
              </div>
            </nav>
          </div>
        )}
      </div>

      <WalletConnectDialog 
        open={walletDialogOpen} 
        onOpenChange={setWalletDialogOpen}
      />
    </header>
  );
};
