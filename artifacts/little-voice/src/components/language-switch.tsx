import { Languages } from 'lucide-react';
import { useAppStore } from '@/state/app-store';
import { useI18n } from '@/i18n';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function LanguageSwitch({ className }: { className?: string }) {
  const { settings, setLang } = useAppStore();
  const { t, storageMessage } = useI18n();
  const { toast } = useToast();
  const next = settings.lang === 'en' ? 'ar' : 'en';
  return (
    <button
      type="button"
      onClick={() => setLang(next).catch((e) => toast({ title: storageMessage(e), variant: 'destructive' }))}
      aria-label={t('lang.switchAria')}
      data-testid="button-language"
      lang={next}
      className={cn(
        'inline-flex min-h-[56px] items-center gap-2 rounded-full border border-card-border bg-card/80 px-5 text-lg font-bold text-foreground shadow-sm backdrop-blur hover:bg-card transition-colors',
        className,
      )}
    >
      <Languages className="size-5 text-primary" aria-hidden />
      {t('lang.switchTo')}
    </button>
  );
}
