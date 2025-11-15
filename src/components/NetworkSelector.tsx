import { useState } from "react";

type Network = "mainnet" | "testnet" | "devnet";

export const NetworkSelector = () => {
  const [selectedNetwork, setSelectedNetwork] = useState<Network>("mainnet");
  const [isOpen, setIsOpen] = useState(false);

  const networks: Network[] = ["mainnet", "testnet", "devnet"];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary hover:bg-secondary/80 transition-colors border border-border"
      >
        <span className="text-sm font-medium text-foreground capitalize">
          {selectedNetwork}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 15 15"
          fill="none"
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          <path
            d="M6.94979 9.22964C7.14841 9.45033 7.49446 9.45033 7.69308 9.22964L10.4275 6.19135C10.7171 5.86959 10.4888 5.35686 10.0559 5.35686L4.58698 5.35686C4.15409 5.35686 3.92574 5.86959 4.21533 6.19135L6.94979 9.22964Z"
            fill="currentColor"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-popover border border-border rounded-lg shadow-lg py-2 z-50">
          <ul className="space-y-1">
            {networks.map((network) => (
              <li
                key={network}
                onClick={() => {
                  setSelectedNetwork(network);
                  setIsOpen(false);
                }}
                className={`px-4 py-2 text-sm cursor-pointer hover:bg-accent transition-colors flex items-center justify-between ${
                  selectedNetwork === network ? "bg-accent" : ""
                }`}
              >
                <span className="capitalize text-foreground">{network}</span>
                {selectedNetwork === network && (
                  <span className="text-xs text-primary font-medium">
                    connected
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
