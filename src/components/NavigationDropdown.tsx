import { ReactNode } from "react";

interface NavigationDropdownProps {
  label: string;
  icon: ReactNode;
  items: Array<{
    title: string;
    desc: string;
  }>;
  isOpen: boolean;
  onToggle: () => void;
}

export const NavigationDropdown = ({
  label,
  icon,
  items,
  isOpen,
  onToggle,
}: NavigationDropdownProps) => {
  return (
    <div className="relative">
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors cursor-pointer"
        onClick={onToggle}
      >
        {icon}
        <span className="text-sm text-foreground">{label}</span>
        <svg
          width="15"
          height="15"
          viewBox="0 0 15 15"
          fill="none"
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          <path
            d="M6.94979 9.22964C7.14841 9.45033 7.49446 9.45033 7.69308 9.22964L10.4275 6.19135C10.7171 5.86959 10.4888 5.35686 10.0559 5.35686L4.58698 5.35686C4.15409 5.35686 3.92574 5.86959 4.21533 6.19135L6.94979 9.22964Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-popover border border-border rounded-lg shadow-lg p-3 z-50">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-md hover:bg-accent transition-colors cursor-pointer"
            >
              <div className="w-5 h-5 flex-shrink-0 mt-0.5">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="text-muted-foreground"
                >
                  <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
              <div className="flex-1">
                <h5 className="text-sm font-semibold text-foreground mb-1">
                  {item.title}
                </h5>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
