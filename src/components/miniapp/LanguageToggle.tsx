import { useLanguage } from '@/hooks/useLanguage';

export const LanguageToggle = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="w-8 h-8 rounded-full overflow-hidden flex-none border-2 border-border hover:border-foreground transition-colors"
      aria-label={language === 'en' ? 'Switch to Russian' : 'Switch to English'}
    >
      {language === 'en' ? (
        // US Flag
        <svg viewBox="0 0 32 32" className="w-full h-full">
          <rect width="32" height="32" fill="#B22234" />
          <rect y="2.46" width="32" height="2.46" fill="white" />
          <rect y="7.38" width="32" height="2.46" fill="white" />
          <rect y="12.31" width="32" height="2.46" fill="white" />
          <rect y="17.23" width="32" height="2.46" fill="white" />
          <rect y="22.15" width="32" height="2.46" fill="white" />
          <rect y="27.08" width="32" height="2.46" fill="white" />
          <rect width="12.8" height="17.23" fill="#3C3B6E" />
          {/* Stars simplified */}
          <circle cx="2" cy="2" r="0.8" fill="white" />
          <circle cx="4.5" cy="2" r="0.8" fill="white" />
          <circle cx="7" cy="2" r="0.8" fill="white" />
          <circle cx="9.5" cy="2" r="0.8" fill="white" />
          <circle cx="12" cy="2" r="0.8" fill="white" />
          <circle cx="3.25" cy="4" r="0.8" fill="white" />
          <circle cx="5.75" cy="4" r="0.8" fill="white" />
          <circle cx="8.25" cy="4" r="0.8" fill="white" />
          <circle cx="10.75" cy="4" r="0.8" fill="white" />
          <circle cx="2" cy="6" r="0.8" fill="white" />
          <circle cx="4.5" cy="6" r="0.8" fill="white" />
          <circle cx="7" cy="6" r="0.8" fill="white" />
          <circle cx="9.5" cy="6" r="0.8" fill="white" />
          <circle cx="12" cy="6" r="0.8" fill="white" />
          <circle cx="3.25" cy="8" r="0.8" fill="white" />
          <circle cx="5.75" cy="8" r="0.8" fill="white" />
          <circle cx="8.25" cy="8" r="0.8" fill="white" />
          <circle cx="10.75" cy="8" r="0.8" fill="white" />
          <circle cx="2" cy="10" r="0.8" fill="white" />
          <circle cx="4.5" cy="10" r="0.8" fill="white" />
          <circle cx="7" cy="10" r="0.8" fill="white" />
          <circle cx="9.5" cy="10" r="0.8" fill="white" />
          <circle cx="12" cy="10" r="0.8" fill="white" />
          <circle cx="3.25" cy="12" r="0.8" fill="white" />
          <circle cx="5.75" cy="12" r="0.8" fill="white" />
          <circle cx="8.25" cy="12" r="0.8" fill="white" />
          <circle cx="10.75" cy="12" r="0.8" fill="white" />
          <circle cx="2" cy="14" r="0.8" fill="white" />
          <circle cx="4.5" cy="14" r="0.8" fill="white" />
          <circle cx="7" cy="14" r="0.8" fill="white" />
          <circle cx="9.5" cy="14" r="0.8" fill="white" />
          <circle cx="12" cy="14" r="0.8" fill="white" />
          <circle cx="3.25" cy="16" r="0.8" fill="white" />
          <circle cx="5.75" cy="16" r="0.8" fill="white" />
          <circle cx="8.25" cy="16" r="0.8" fill="white" />
          <circle cx="10.75" cy="16" r="0.8" fill="white" />
        </svg>
      ) : (
        // Russian Flag
        <svg viewBox="0 0 32 32" className="w-full h-full">
          <rect width="32" height="10.67" fill="white" />
          <rect y="10.67" width="32" height="10.67" fill="#0039A6" />
          <rect y="21.33" width="32" height="10.67" fill="#D52B1E" />
        </svg>
      )}
    </button>
  );
};
