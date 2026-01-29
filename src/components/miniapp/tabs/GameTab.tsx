import { useLanguage } from '@/hooks/useLanguage';

export const GameTab = () => {
  const { t } = useLanguage();

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-lg text-muted-foreground">{t.comingSoon}</p>
    </div>
  );
};
