import { useEffect, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";

const featuredNFTs = [
  {
    id: 1,
    title: "Anonymous Astronauts: Sologenic Welcome",
    artist: "anonymous.astronauts.nfts",
    verified: true,
    image: "https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?w=400&h=400&fit=crop"
  },
  {
    id: 2,
    title: "My Girl",
    artist: "oli_d",
    verified: false,
    image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400&h=400&fit=crop"
  },
  {
    id: 3,
    title: "Rule Britannia",
    artist: "pixel.pirate",
    verified: false,
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop"
  },
  {
    id: 4,
    title: "North American Landscapes",
    artist: "benito5050",
    verified: false,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop"
  },
  {
    id: 5,
    title: "Nagarum Nilave",
    artist: "swamiji",
    verified: true,
    image: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&h=400&fit=crop"
  },
  {
    id: 6,
    title: "Crypto 500",
    artist: "mrvinart",
    verified: true,
    image: "https://images.unsplash.com/photo-1549887534-1541e9326642?w=400&h=400&fit=crop"
  },
  {
    id: 7,
    title: "Abstract Laser Eye Punk",
    artist: "leomordac",
    verified: true,
    image: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=400&h=400&fit=crop"
  },
  {
    id: 8,
    title: "Glitch Boy",
    artist: "pixel.pirate",
    verified: false,
    image: "https://images.unsplash.com/photo-1551847812-4a1a7e6ac5c5?w=400&h=400&fit=crop"
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
            <div className="relative w-full h-full flex flex-wrap items-center justify-center gap-6 px-8">
              {featuredNFTs
                .slice(layerIndex * 2, layerIndex * 2 + 2)
                .map((nft, index) => (
                  <Card
                    key={nft.id}
                    className="overflow-hidden group cursor-pointer hover:shadow-xl transition-all"
                    style={{
                      transform: `translateX(${index % 2 === 0 ? -150 : 150}px) rotate(${index % 2 === 0 ? -5 : 5}deg)`,
                      width: layerIndex === 3 ? "280px" : layerIndex === 2 ? "240px" : layerIndex === 1 ? "200px" : "160px",
                    }}
                  >
                    <div className="relative aspect-square">
                      <img
                        src={nft.image}
                        alt={nft.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <h3 
                          className="font-bold mb-1 truncate"
                          style={{
                            fontSize: layerIndex === 3 ? "16px" : layerIndex === 2 ? "14px" : "12px",
                          }}
                        >
                          {nft.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-white/20" />
                          <span 
                            className="flex items-center gap-1 truncate"
                            style={{
                              fontSize: layerIndex === 3 ? "14px" : layerIndex === 2 ? "12px" : "10px",
                            }}
                          >
                            {nft.artist}
                            {nft.verified && layerIndex >= 2 && (
                              <CheckCircle2 className="h-3 w-3 text-blue-400 flex-shrink-0" />
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
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
