import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { ReactNode } from 'react';

interface TonConnectProviderProps {
  children: ReactNode;
}

// Use current origin for manifest URL to ensure accessibility
const manifestUrl = typeof window !== 'undefined' 
  ? `${window.location.origin}/tonconnect-manifest.json`
  : 'https://pure-html-react-glow.lovable.app/tonconnect-manifest.json';

export const TonConnectProvider = ({ children }: TonConnectProviderProps) => {
  return (
    <TonConnectUIProvider 
      manifestUrl={manifestUrl}
      actionsConfiguration={{
        twaReturnUrl: 'https://t.me/YOUR_BOT_USERNAME'
      }}
    >
      {children}
    </TonConnectUIProvider>
  );
};
