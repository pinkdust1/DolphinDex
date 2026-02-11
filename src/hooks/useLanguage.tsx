import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type Language = 'en' | 'ru';

interface Translations {
  // Profile Tab
  balance: string;
  topUp: string;
  referralLink: string;
  referralCopy: string;
  referralCopied: string;
  referralDescription: string;
  inventory: string;
  inventoryEmpty: string;
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
  // Shell Game
  shellGame: string;
  shellGameDesc: string;
  shellStart: string;
  shellWatch: string;
  shellShuffling: string;
  shellPick: string;
  shellWin: string;
  shellLose: string;
  shellPlay: string;
  shellPlayAgain: string;
  shellPlaying: string;
  shellWins: string;
}

const translations: Record<Language, Translations> = {
  en: {
    balance: 'Balance',
    topUp: 'Top Up',
    referralLink: 'Referral Link',
    referralCopy: 'Copy',
    referralCopied: 'Copied!',
    referralDescription: 'Invite friends and earn rewards',
    inventory: 'Inventory',
    inventoryEmpty: 'No gifts yet',
    searchGift: 'Search Gift',
    type: 'Type',
    skin: 'Skin',
    background: 'Background',
    game: 'Game',
    market: 'Market',
    profile: 'Profile',
    comingSoon: 'Coming Soon',
    shellGame: 'Shell Game',
    shellGameDesc: 'Find the ball under the cup',
    shellStart: 'Press Play to start',
    shellWatch: 'Watch the ball!',
    shellShuffling: 'Shuffling...',
    shellPick: 'Pick a cup!',
    shellWin: '🎉 You found it!',
    shellLose: '😔 Wrong cup!',
    shellPlay: 'Play',
    shellPlayAgain: 'Play Again',
    shellPlaying: 'Playing...',
    shellWins: 'Score',
  },
  ru: {
    balance: 'Баланс',
    topUp: 'Пополнить',
    referralLink: 'Реферальная ссылка',
    referralCopy: 'Копировать',
    referralCopied: 'Скопировано!',
    referralDescription: 'Приглашайте друзей и получайте награды',
    inventory: 'Инвентарь',
    inventoryEmpty: 'Подарков пока нет',
    searchGift: 'Поиск Гифта',
    type: 'Тип',
    skin: 'Скин',
    background: 'Фон',
    game: 'Игра',
    market: 'Маркет',
    profile: 'Профиль',
    comingSoon: 'Скоро',
    shellGame: 'Напёрстки',
    shellGameDesc: 'Найди шарик под стаканом',
    shellStart: 'Нажми Играть',
    shellWatch: 'Следи за шариком!',
    shellShuffling: 'Перемешиваю...',
    shellPick: 'Выбери стакан!',
    shellWin: '🎉 Угадал!',
    shellLose: '😔 Не угадал!',
    shellPlay: 'Играть',
    shellPlayAgain: 'Ещё раз',
    shellPlaying: 'Играем...',
    shellWins: 'Счёт',
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
