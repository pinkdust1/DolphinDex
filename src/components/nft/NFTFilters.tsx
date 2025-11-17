import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Search, ChevronUp } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categories = [
  { name: "Art", icon: "🎨" },
  { name: "Collectibles", icon: "🎁" },
  { name: "Metaverse", icon: "🌐" },
  { name: "Motion", icon: "🎬" },
  { name: "Music", icon: "🎵" },
  { name: "Others", icon: "📦" },
  { name: "Sports", icon: "⚽" },
  { name: "Trading Cards", icon: "🃏" },
];

const fileTypes = [
  { name: "gif" },
  { name: "jpeg" },
  { name: "mp4" },
  { name: "mpeg" },
  { name: "png" },
  { name: "svg+xml" },
  { name: "wav" },
];

const currencies = [
  { name: "LIONART", icon: "🦁" },
  { name: "RLUSD", icon: "💵" },
  { name: "SOLO", icon: "💎" },
  { name: "XSTIK", icon: "🎯" },
  { name: "MAG", icon: "🧲" },
  { name: "XDX", icon: "💠" },
  { name: "XRP", icon: "⚡" },
];

export const NFTFilters = () => {
  const [onSale, setOnSale] = useState(true);
  const [onlyXLS20, setOnlyXLS20] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [explicitContent, setExplicitContent] = useState(false);
  const [forYou, setForYou] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [fileTypeOpen, setFileTypeOpen] = useState(true);
  const [currenciesOpen, setCurrenciesOpen] = useState(true);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">34,721</span> results
        </p>

        <div className="space-y-3">
          <label className="text-sm font-medium">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Enter keyword"
              className="pl-10 h-9"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium">Sort by</label>
          <Select defaultValue="recent">
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popularity">Popularity</SelectItem>
              <SelectItem value="recent">Recently created</SelectItem>
              <SelectItem value="price-low">Price (Low to High)</SelectItem>
              <SelectItem value="price-high">Price (High to Low)</SelectItem>
              <SelectItem value="liked-24h">Most liked (24 hours)</SelectItem>
              <SelectItem value="liked-7d">Most liked (7 days)</SelectItem>
              <SelectItem value="liked-30d">Most liked (30 days)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">On Sale</label>
          <Switch checked={onSale} onCheckedChange={setOnSale} />
        </div>

        <Collapsible open={categoriesOpen} onOpenChange={setCategoriesOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
            <span className="text-sm font-medium">Categories</span>
            <ChevronUp
              className={`h-4 w-4 transition-transform ${
                categoriesOpen ? "" : "rotate-180"
              }`}
            />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="space-y-2 pt-2">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-md hover:bg-accent transition-colors text-sm"
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible open={fileTypeOpen} onOpenChange={setFileTypeOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
            <span className="text-sm font-medium">File type</span>
            <ChevronUp
              className={`h-4 w-4 transition-transform ${
                fileTypeOpen ? "" : "rotate-180"
              }`}
            />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="space-y-2 pt-2">
              {fileTypes.map((type) => (
                <button
                  key={type.name}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-md hover:bg-accent transition-colors text-sm"
                >
                  <span className="text-muted-foreground">📄</span>
                  <span>{type.name}</span>
                </button>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible open={currenciesOpen} onOpenChange={setCurrenciesOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
            <span className="text-sm font-medium">Currencies</span>
            <ChevronUp
              className={`h-4 w-4 transition-transform ${
                currenciesOpen ? "" : "rotate-180"
              }`}
            />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="space-y-2 pt-2">
              {currencies.map((cur) => (
                <button
                  key={cur.name}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-md hover:bg-accent transition-colors text-sm"
                >
                  <span>{cur.icon}</span>
                  <span>{cur.name}</span>
                </button>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div className="flex items-center justify-between pt-2">
          <label className="text-sm font-medium">Only XLS-20</label>
          <Switch checked={onlyXLS20} onCheckedChange={setOnlyXLS20} />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">From Verified collections</label>
          <Switch checked={verifiedOnly} onCheckedChange={setVerifiedOnly} />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Explicit Content</label>
          <Switch checked={explicitContent} onCheckedChange={setExplicitContent} />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">For you</label>
          <Switch checked={forYou} onCheckedChange={setForYou} />
        </div>
      </div>
    </div>
  );
};
