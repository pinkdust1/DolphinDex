import { useEffect, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";

const featuredNFTs = [
  {
    id: 1,
    title: "Anonymous Astronauts: Sologenic Welcome",
    artist: "anonymous.astronauts.nfts",
    verified: true,
  },
  {
    id: 2,
    title: "My Girl",
    artist: "oli_d",
    verified: false,
  },
  {
    id: 3,
    title: "Rule Britannia",
    artist: "pixel.pirate",
    verified: false,
  },
  {
    id: 4,
    title: "North American Landscapes",
    artist: "benito5050",
    verified: false,
  },
  {
    id: 5,
    title: "Nagarum Nilave",
    artist: "swamiji",
    verified: true,
  },
  {
    id: 6,
    title: "Crypto 500",
    artist: "mrvinart",
    verified: true,
  },
  {
    id: 7,
    title: "Abstract Laser Eye Punk",
    artist: "leomordac",
    verified: true,
  },
  {
    id: 8,
    title: "Glitch Boy",
    artist: "pixel.pirate",
    verified: false,
  }
];

// Layer configuration for parallax effect
const layers = [
  { speed: 0.2, blur: 12, opacity: 0.15, scale: 1.8 }, // Background - slowest
  { speed: 0.5, blur: 6, opacity: 0.35, scale: 1.4 },  // Mid-back
  { speed: 0.8, blur: 3, opacity: 0.55, scale: 1.2 },  // Mid-front
  { speed: 1.2, blur: 0, opacity: 1, scale: 1 },       // Foreground - fastest
];

export const NFTCarousel = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const elementTop = rect.top;
        const elementHeight = rect.height;
        
        // Calculate scroll progress relative to element visibility
        const scrollProgress = (viewportHeight - elementTop) / (viewportHeight + elementHeight);
        setScrollY(scrollProgress * 500); // Multiply for more movement
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial call
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative overflow-hidden py-32 bg-gradient-to-b from-background via-background/95 to-background"
      style={{ perspective: "1000px", height: "600px" }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        {layers.map((layer, layerIndex) => (
          <div
            key={layerIndex}
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transform: `translateY(${scrollY * layer.speed - 250}px) scale(${layer.scale})`,
              transition: "transform 0.1s linear",
              filter: `blur(${layer.blur}px)`,
              opacity: layer.opacity,
            }}
          >
            <div className="relative w-full h-full flex flex-col items-center justify-center gap-8">
              {featuredNFTs
                .slice(layerIndex * 2, layerIndex * 2 + 2)
                .map((nft, index) => (
                  <div
                    key={nft.id}
                    className={`text-center ${
                      layerIndex === 3 ? "font-bold" : "font-semibold"
                    }`}
                    style={{
                      transform: `translateX(${index % 2 === 0 ? -100 : 100}px)`,
                      fontSize: layerIndex === 3 ? "3rem" : layerIndex === 2 ? "2.5rem" : layerIndex === 1 ? "2rem" : "1.5rem",
                    }}
                  >
                    <h3 
                      className="text-foreground whitespace-nowrap mb-2"
                      style={{
                        textShadow: layerIndex === 3 ? "0 2px 20px rgba(0,0,0,0.3)" : "none"
                      }}
                    >
                      {nft.title}
                    </h3>
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <span className="text-sm">{nft.artist}</span>
                      {nft.verified && layerIndex >= 2 && (
                        <CheckCircle2 className="h-4 w-4 text-blue-400" />
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Gradient overlays for smooth edges */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background pointer-events-none" />
    </div>
  );
};
