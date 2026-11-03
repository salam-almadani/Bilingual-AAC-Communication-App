import type { ReactNode } from 'react';
import { RotateCcw } from 'lucide-react';
import { useAppStore } from '@/state/app-store';
import { useI18n } from '@/i18n';
import { BrandMark } from './brand-mark';

/** Holds the app until IndexedDB has loaded; shows a calm skeleton or a retryable error. */
export function AppGate({ children }: { children: ReactNode }) {
  const { status, retry } = useAppStore();
  const { t } = useI18n();

  if (status === 'loading') {
    return (
      <div className="min-h-[100dvh] grid place-items-center p-8" role="status" aria-live="polite" data-testid="status-loading">
        <div className="flex flex-col items-center gap-5">
          <BrandMark className="size-20 lv-breathe" />
          <div className="h-4 w-40 rounded-full bg-muted animate-pulse" />
          <span className="sr-only">{t('loading')}</span>
        </div>
      </div>
    );
  }
  if (status === 'error') {
    return (
      <div className="min-h-[100dvh] grid place-items-center p-8">
        <div className="max-w-md text-center rounded-[2rem] bg-card border border-card-border p-10 shadow-md" role="alert">
          <BrandMark className="size-16 mx-auto mb-5" />
          <p className="text-xl font-bold mb-2" data-testid="text-load-error">{t('loadError')}</p>
          <p className="text-muted-foreground mb-6">{t('storage.unavailable')}</p>
          <button
            onClick={retry}
            data-testid="button-retry"
            className="inline-flex min-h-[72px] items-center gap-3 rounded-full bg-primary px-8 text-lg font-bold text-primary-foreground"
          >
            <RotateCcw className="size-5" aria-hidden /> {t('retry')}
          </button>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
