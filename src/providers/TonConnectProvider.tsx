import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { ReactNode } from 'react';

interface TonConnectProviderProps {
  children: ReactNode;
}

// Use the published URL for the manifest to avoid CORS issues
const manifestUrl = 'https://pure-html-react-glow.lovable.app/tonconnect-manifest.json';

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
