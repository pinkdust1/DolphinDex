import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

interface DirectusUser {
  id: number;
  id_telergram: string;
  name: string;
  username: string;
  photo_url: string;
  balance: string;
  inventory: string;
  tg_wallet: string;
  processed_tx_hashes: string;
  total_deposited: string;
  last_deposit_at: string;
  deposit_count: string;
  updated_balance: string;
  status: string;
}

interface UseTelegramUserReturn {
  telegramUser: TelegramUser | null;
  directusUser: DirectusUser | null;
  isLoading: boolean;
  error: string | null;
  syncUser: () => Promise<void>;
  saveWallet: (walletAddress: string) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

export const useTelegramUser = (): UseTelegramUserReturn => {
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const [directusUser, setDirectusUser] = useState<DirectusUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get Telegram user data
  const getTelegramUser = useCallback((): TelegramUser | null => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user) {
      return tg.initDataUnsafe.user;
    }
    return null;
  }, []);

  // Sync user with Directus
  const syncUser = useCallback(async () => {
    const tgUser = getTelegramUser();
    if (!tgUser) {
      console.log('No Telegram user data available');
      setIsLoading(false);
      return;
    }

    setTelegramUser(tgUser);
    setIsLoading(true);
    setError(null);

    try {
      console.log('Syncing user with Directus:', tgUser);
      
      const { data, error: invokeError } = await supabase.functions.invoke('tg-user-sync', {
        body: {
          action: 'sync_user',
          telegram_user: tgUser,
        },
      });

      if (invokeError) {
        throw new Error(invokeError.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to sync user');
      }

      console.log('User synced successfully:', data.user);
      setDirectusUser(data.user);
    } catch (err) {
      console.error('Error syncing user:', err);
      setError(err instanceof Error ? err.message : 'Failed to sync user');
    } finally {
      setIsLoading(false);
    }
  }, [getTelegramUser]);

  // Save wallet address to Directus
  const saveWallet = useCallback(async (walletAddress: string): Promise<boolean> => {
    const tgUser = getTelegramUser();
    if (!tgUser) {
      setError('No Telegram user data');
      return false;
    }

    try {
      console.log('Saving wallet to Directus:', walletAddress);

      const { data, error: invokeError } = await supabase.functions.invoke('tg-user-sync', {
        body: {
          action: 'save_wallet',
          telegram_id: String(tgUser.id),
          wallet_address: walletAddress,
        },
      });

      if (invokeError) {
        throw new Error(invokeError.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to save wallet');
      }

      console.log('Wallet saved successfully:', data.user);
      setDirectusUser(data.user);
      return true;
    } catch (err) {
      console.error('Error saving wallet:', err);
      setError(err instanceof Error ? err.message : 'Failed to save wallet');
      return false;
    }
  }, [getTelegramUser]);

  // Refresh user data from Directus
  const refreshUser = useCallback(async () => {
    const tgUser = getTelegramUser();
    if (!tgUser) {
      return;
    }

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('tg-user-sync', {
        body: {
          action: 'get_user',
          telegram_id: String(tgUser.id),
        },
      });

      if (invokeError) {
        throw new Error(invokeError.message);
      }

      if (data.success && data.user) {
        setDirectusUser(data.user);
      }
    } catch (err) {
      console.error('Error refreshing user:', err);
    }
  }, [getTelegramUser]);

  // Initial sync on mount
  useEffect(() => {
    const initSync = () => {
      const tgUser = getTelegramUser();
      if (tgUser) {
        syncUser();
      } else {
        // Retry after a short delay (Telegram data might not be ready)
        const timer = setTimeout(() => {
          syncUser();
        }, 500);
        return () => clearTimeout(timer);
      }
    };

    initSync();
  }, [syncUser, getTelegramUser]);

  return {
    telegramUser,
    directusUser,
    isLoading,
    error,
    syncUser,
    saveWallet,
    refreshUser,
  };
};
