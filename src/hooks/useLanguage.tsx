import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type Language = 'en' | 'ru';

interface Translations {
  // Profile Tab
  balance: string;
  topUp: string;
  // Market Tab
  searchGift: string;
  type: string;
  skin: string;
  background: string;
  // Bottom Nav
  game: string;
  market: string;
  profile: string;
  // Game Tab
  comingSoon: string;
}

const translations: Record<Language, Translations> = {
  en: {
    balance: 'Balance',
    topUp: 'Top Up',
    searchGift: 'Search Gift',
    type: 'Type',
    skin: 'Skin',
    background: 'Background',
    game: 'Game',
    market: 'Market',
    profile: 'Profile',
    comingSoon: 'Coming Soon',
  },
  ru: {
    balance: 'Баланс',
    topUp: 'Пополнить',
    searchGift: 'Поиск Гифта',
    type: 'Тип',
    skin: 'Скин',
    background: 'Фон',
    game: 'Игра',
    market: 'Маркет',
    profile: 'Профиль',
    comingSoon: 'Скоро',
  },
};

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => (prev === 'en' ? 'ru' : 'en'));
  }, []);

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
