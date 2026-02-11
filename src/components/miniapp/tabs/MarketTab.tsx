import { useState, useMemo, useCallback } from 'react';
import { Search, Clock, ChevronDown, ArrowUpDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GiftCard } from '../GiftCard';
import { useLanguage } from '@/hooks/useLanguage';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Mock data for gifts
const mockGifts = [
  { id: '4977', name: 'Whip Cupcake', price: 3.71, type: 'food', skin: 'classic', background: 'light', imageUrl: 'https://nft.fragment.com/gift/whipcupcake-4977.large.jpg' },
  { id: '62519', name: 'B-Day Candle', price: 3.71, type: 'accessory', skin: 'golden', background: 'dark', imageUrl: 'https://nft.fragment.com/gift/bdaycandle-62519.large.jpg' },
  { id: '108323', name: 'Pet Snake', price: 3.72, type: 'pet', skin: 'classic', background: 'dark', imageUrl: 'https://nft.fragment.com/gift/petsnake-108323.large.jpg' },
  { id: '227762', name: 'Ice Cream', price: 3.74, type: 'food', skin: 'rainbow', background: 'light', imageUrl: 'https://nft.fragment.com/gift/icecream-227762.large.jpg' },
];

type SortOrder = 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc';

const TYPES = ['food', 'pet', 'accessory'] as const;
const SKINS = ['classic', 'golden', 'rainbow'] as const;
const BACKGROUNDS = ['light', 'dark'] as const;

export const MarketTab = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('price_asc');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedSkin, setSelectedSkin] = useState<string | null>(null);
  const [selectedBg, setSelectedBg] = useState<string | null>(null);

  const filteredGifts = useMemo(() => {
    let result = [...mockGifts];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (g) => g.name.toLowerCase().includes(q) || g.id.includes(q)
      );
    }

    // Filters
    if (selectedType) result = result.filter((g) => g.type === selectedType);
    if (selectedSkin) result = result.filter((g) => g.skin === selectedSkin);
    if (selectedBg) result = result.filter((g) => g.background === selectedBg);

    // Sort
    switch (sortOrder) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name_asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }

    return result;
  }, [searchQuery, selectedType, selectedSkin, selectedBg, sortOrder]);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const sortLabel = sortOrder.includes('price')
    ? `${sortOrder === 'price_asc' ? '↑' : '↓'} Price`
    : `${sortOrder === 'name_asc' ? 'A→Z' : 'Z→A'}`;

  return (
    <div className="flex flex-col gap-4">
      {/* Search and Actions Row */}
      <div className="flex items-center justify-between gap-2 h-10">
        <div className="flex items-center w-full">
          <label className="flex items-center gap-2 px-3 h-10 rounded-xl flex-1 min-w-0 bg-secondary">
            <Search className="w-4 h-4 flex-none text-muted-foreground" />
            <Input 
              type="text" 
              className="w-full min-w-0 text-[14px] leading-[20px] tracking-[-0.28px] font-bold text-foreground placeholder:text-muted-foreground border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
              placeholder={t.searchGift}
              value={searchQuery}
              onChange={handleSearch}
            />
          </label>
        </div>
        
        {/* Balance Button */}
        <Button 
          className="bg-secondary hover:bg-secondary/80 text-foreground h-10 px-4 rounded-xl flex-shrink-0"
          variant="ghost"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="16" height="16" rx="8" className="fill-foreground"/>
                <path d="M10.7021 4.9248C11.2224 4.92489 11.6522 5.17141 11.8857 5.52246C12.12 5.87474 12.1551 6.33186 11.8877 6.7373L8.55273 11.7939C8.42752 11.9838 8.21079 12.0752 8 12.0752C7.78922 12.0752 7.57253 11.9837 7.44727 11.7939L4.1123 6.7373C3.84467 6.33141 3.88007 5.87461 4.11426 5.52246C4.34791 5.17147 4.77823 4.9248 5.29883 4.9248H10.7021ZM5.29785 5.93848C5.20076 5.93848 5.1287 5.98331 5.0918 6.03906C5.05554 6.09409 5.05107 6.16199 5.09082 6.22266L5.0918 6.22363L6.84375 8.96582L6.8457 8.96777L7.43164 9.95996V5.93848H5.29785ZM8.56738 9.95996L9.15332 8.96875L9.15527 8.9668L10.9062 6.22363L10.9072 6.22266C10.9472 6.16189 10.9426 6.0942 10.9062 6.03906C10.8694 5.98318 10.7974 5.93848 10.7002 5.93848H8.56738V9.95996Z" className="fill-background stroke-background" strokeWidth="0.15"/>
              </svg>
              <span className="text-[14px] font-bold">0</span>
            </div>
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.001 0C15.5237 0.000156241 20.001 4.47725 20.001 10C20.001 15.5228 15.5237 19.9998 10.001 20C4.47813 20 0 15.5228 0 10C0 4.47715 4.47813 0 10.001 0ZM9.99902 4C9.44696 4.00024 8.99902 4.44786 8.99902 5V9H5C4.44773 9 4 9.44772 4 10C4 10.5523 4.44773 11 5 11H8.99902V15C8.99902 15.5521 9.44696 15.9998 9.99902 16C10.5513 16 10.999 15.5523 10.999 15V11H14.999C15.5513 11 15.999 10.5523 15.999 10C15.999 9.44772 15.5513 9 14.999 9H10.999V5C10.999 4.44772 10.5513 4 9.99902 4Z" fill="currentColor"/>
            </svg>
          </div>
        </Button>
        
        {/* History Button */}
        <Button
          variant="ghost"
          size="icon"
          className="bg-secondary hover:bg-secondary/80 text-foreground h-10 w-10 rounded-xl flex-shrink-0"
        >
          <Clock className="w-6 h-6" />
        </Button>
      </div>

      {/* Filters Row */}
      <div className="flex items-center gap-2 overflow-x-auto h-10 -mx-4 px-4">
        {/* Sort Button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="bg-secondary hover:bg-secondary/80 text-foreground w-10 h-10 rounded-xl flex-none"
            >
              <ArrowUpDown className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-card border-border">
            {([
              ['price_asc', '↑ Price Low'],
              ['price_desc', '↓ Price High'],
              ['name_asc', 'A → Z'],
              ['name_desc', 'Z → A'],
            ] as const).map(([value, label]) => (
              <DropdownMenuItem
                key={value}
                onClick={() => setSortOrder(value as SortOrder)}
                className="flex items-center justify-between gap-2"
              >
                {label}
                {sortOrder === value && <Check className="w-4 h-4" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Type Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={`pl-3 pr-2 h-10 rounded-xl gap-0.5 whitespace-nowrap ${selectedType ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-secondary hover:bg-secondary/80 text-foreground'}`}
            >
              <span className="text-[14px] leading-[20px] font-bold tracking-[-0.28px]">
                {selectedType ? selectedType : t.type}
              </span>
              <ChevronDown className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-card border-border">
            <DropdownMenuItem onClick={() => setSelectedType(null)} className="flex items-center justify-between gap-2">
              All
              {!selectedType && <Check className="w-4 h-4" />}
            </DropdownMenuItem>
            {TYPES.map((type) => (
              <DropdownMenuItem
                key={type}
                onClick={() => setSelectedType(type)}
                className="flex items-center justify-between gap-2 capitalize"
              >
                {type}
                {selectedType === type && <Check className="w-4 h-4" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Skin Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={`pl-3 pr-2 h-10 rounded-xl gap-0.5 whitespace-nowrap ${selectedSkin ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-secondary hover:bg-secondary/80 text-foreground'}`}
            >
              <span className="text-[14px] leading-[20px] font-bold tracking-[-0.28px]">
                {selectedSkin ? selectedSkin : t.skin}
              </span>
              <ChevronDown className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-card border-border">
            <DropdownMenuItem onClick={() => setSelectedSkin(null)} className="flex items-center justify-between gap-2">
              All
              {!selectedSkin && <Check className="w-4 h-4" />}
            </DropdownMenuItem>
            {SKINS.map((skin) => (
              <DropdownMenuItem
                key={skin}
                onClick={() => setSelectedSkin(skin)}
                className="flex items-center justify-between gap-2 capitalize"
              >
                {skin}
                {selectedSkin === skin && <Check className="w-4 h-4" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Background Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={`pl-3 pr-2 h-10 rounded-xl gap-0.5 whitespace-nowrap ${selectedBg ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-secondary hover:bg-secondary/80 text-foreground'}`}
            >
              <span className="text-[14px] leading-[20px] font-bold tracking-[-0.28px]">
                {selectedBg ? selectedBg : t.background}
              </span>
              <ChevronDown className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-card border-border">
            <DropdownMenuItem onClick={() => setSelectedBg(null)} className="flex items-center justify-between gap-2">
              All
              {!selectedBg && <Check className="w-4 h-4" />}
            </DropdownMenuItem>
            {BACKGROUNDS.map((bg) => (
              <DropdownMenuItem
                key={bg}
                onClick={() => setSelectedBg(bg)}
                className="flex items-center justify-between gap-2 capitalize"
              >
                {bg}
                {selectedBg === bg && <Check className="w-4 h-4" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Gifts Grid */}
      <div className="grid grid-cols-3 gap-4 w-full">
        {filteredGifts.length === 0 ? (
          <div className="col-span-3 text-center py-8 text-muted-foreground text-[13px]">
            No gifts found
          </div>
        ) : (
          filteredGifts.map((gift) => (
            <GiftCard
              key={gift.id}
              id={gift.id}
              name={gift.name}
              price={String(gift.price)}
              imageUrl={gift.imageUrl}
              onAddClick={() => console.log('Add clicked:', gift.id)}
              onBuyClick={() => console.log('Buy clicked:', gift.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};
