import { Search, Clock, ChevronDown, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const MarketTab = () => {
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
              placeholder="Поиск Гифта"
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
                <rect width="16" height="16" rx="8" fill="#237BFF"/>
                <path d="M10.7021 4.9248C11.2224 4.92489 11.6522 5.17141 11.8857 5.52246C12.12 5.87474 12.1551 6.33186 11.8877 6.7373L8.55273 11.7939C8.42752 11.9838 8.21079 12.0752 8 12.0752C7.78922 12.0752 7.57253 11.9837 7.44727 11.7939L4.1123 6.7373C3.84467 6.33141 3.88007 5.87461 4.11426 5.52246C4.34791 5.17147 4.77823 4.9248 5.29883 4.9248H10.7021ZM5.29785 5.93848C5.20076 5.93848 5.1287 5.98331 5.0918 6.03906C5.05554 6.09409 5.05107 6.16199 5.09082 6.22266L5.0918 6.22363L6.84375 8.96582L6.8457 8.96777L7.43164 9.95996V5.93848H5.29785ZM8.56738 9.95996L9.15332 8.96875L9.15527 8.9668L10.9062 6.22363L10.9072 6.22266C10.9472 6.16189 10.9426 6.0942 10.9062 6.03906C10.8694 5.98318 10.7974 5.93848 10.7002 5.93848H8.56738V9.95996Z" fill="white" stroke="white" strokeWidth="0.15"/>
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
        <Button
          variant="ghost"
          size="icon"
          className="bg-secondary hover:bg-secondary/80 text-foreground w-10 h-10 rounded-xl flex-none"
        >
          <ArrowUpDown className="w-5 h-5" />
        </Button>

        {/* Type Filter */}
        <Button
          variant="ghost"
          className="bg-secondary hover:bg-secondary/80 text-foreground pl-3 pr-2 h-10 rounded-xl gap-0.5 whitespace-nowrap"
        >
          <span className="text-[14px] leading-[20px] font-bold tracking-[-0.28px]">Тип</span>
          <ChevronDown className="w-5 h-5" />
        </Button>

        {/* Skin Filter */}
        <Button
          variant="ghost"
          className="bg-secondary hover:bg-secondary/80 text-foreground pl-3 pr-2 h-10 rounded-xl gap-0.5 whitespace-nowrap"
        >
          <span className="text-[14px] leading-[20px] font-bold tracking-[-0.28px]">Скин</span>
          <ChevronDown className="w-5 h-5" />
        </Button>

        {/* Background Filter */}
        <Button
          variant="ghost"
          className="bg-secondary hover:bg-secondary/80 text-foreground pl-3 pr-2 h-10 rounded-xl gap-0.5 whitespace-nowrap"
        >
          <span className="text-[14px] leading-[20px] font-bold tracking-[-0.28px]">Фон</span>
          <ChevronDown className="w-5 h-5" />
        </Button>
      </div>

      {/* Placeholder for gifts grid */}
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-sm text-muted-foreground">Гифты появятся здесь</p>
      </div>
    </div>
  );
};
