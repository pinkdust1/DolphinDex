interface GiftCardProps {
  name: string;
  id: string;
  price: string;
  imageUrl: string;
  onAddClick?: () => void;
  onBuyClick?: () => void;
}

export const GiftCard = ({ name, id, price, imageUrl, onAddClick, onBuyClick }: GiftCardProps) => {
  return (
    <div className="flex flex-col items-center bg-secondary rounded-xl cursor-pointer relative min-h-[170px]">
      {/* Image Container */}
      <div className="rounded-xl overflow-hidden aspect-square w-full flex relative">
        <div className="h-full relative flex w-full">
          <img
            src={imageUrl}
            alt={name}
            className="h-full object-contain w-full"
          />
        </div>
        
        {/* Add Button Overlay */}
        <button 
          type="button"
          onClick={onAddClick}
          className="absolute pr-2 pt-2 top-0 p-4 pb-4 right-0 z-[2] flex w-[50%] aspect-square justify-end"
        >
          <div 
            className="flex h-fit"
            style={{ filter: 'drop-shadow(rgba(0, 0, 0, 0.2) 0px 4px 15px)', backdropFilter: 'blur(2px)' }}
          >
            <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M10.001 0C15.5237 0.000156241 20.001 4.47725 20.001 10C20.001 15.5228 15.5237 19.9998 10.001 20C4.47813 20 0 15.5228 0 10C0 4.47715 4.47813 0 10.001 0ZM9.99902 4C9.44696 4.00024 8.99902 4.44786 8.99902 5V9H5C4.44773 9 4 9.44772 4 10C4 10.5523 4.44773 11 5 11H8.99902V15C8.99902 15.5521 9.44696 15.9998 9.99902 16C10.5513 16 10.999 15.5523 10.999 15V11H14.999C15.5513 11 15.999 10.5523 15.999 10C15.999 9.44772 15.5513 9 14.999 9H10.999V5C10.999 4.44772 10.5513 4 9.99902 4Z"
                fill="currentColor"
              />
            </svg>
          </div>
        </button>
      </div>

      {/* Info Section */}
      <div className="py-2 flex flex-col text-center w-full px-2 mt-auto min-h-[58px] items-center justify-center">
        <div className="flex flex-col w-full overflow-hidden">
          <div className="text-[13px] leading-[20px] tracking-[-0.26px] font-bold text-foreground overflow-hidden text-ellipsis whitespace-nowrap">
            {name}
          </div>
          <div className="text-[13px] leading-[20px] tracking-[-0.22px] font-bold text-muted-foreground">
            #{id}
          </div>
        </div>
        
        {/* Price Button */}
        <button 
          type="button" 
          onClick={onBuyClick}
          className="h-6 w-full rounded-full bg-[#237BFF] hover:bg-[#1a6ae6] mt-2 relative"
        >
          <div className="flex items-center justify-center gap-0.5 text-white">
            <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M9.41504 2.43164V2.4375C10.037 2.46479 10.5555 2.74061 10.8477 3.14062C11.1586 3.56667 11.2072 4.12542 10.8516 4.61719L6.75879 10.2744C6.58174 10.5193 6.28196 10.6308 6 10.6309C5.71799 10.6309 5.41735 10.5195 5.24023 10.2744L1.14941 4.61719C0.79349 4.12499 0.840546 3.56664 1.15137 3.14062C1.44352 2.74055 1.96261 2.46476 2.58496 2.4375V2.43164H9.41504ZM2.68457 3.76562C2.59316 3.76562 2.53678 3.80371 2.5127 3.83691C2.49328 3.86378 2.49151 3.8881 2.50293 3.91113L2.50879 3.9209L2.51367 3.92676L4.66309 6.99512L4.66504 6.99707L4.66699 7V7.00098L5.20215 7.82715V3.76562H2.68457ZM6.7959 7.82715L7.32617 7.00879L7.3291 7.00391L7.33496 6.99512L9.48145 3.93066L9.48535 3.92383H9.48633C9.50774 3.89382 9.50624 3.86608 9.48535 3.83691L9.46094 3.81152C9.43056 3.78668 9.38179 3.76468 9.31348 3.76465H6.7959V7.82715Z"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="0.2"
              />
            </svg>
            <div className="text-[12px] leading-[20px] font-bold tracking-[-0.24px] overflow-hidden text-ellipsis whitespace-nowrap">
              {price} TON
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};
