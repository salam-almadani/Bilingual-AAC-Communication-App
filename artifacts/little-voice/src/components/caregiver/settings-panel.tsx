import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Languages, ShieldCheck, Trash2, Volume1, Volume2 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useAppStore } from '@/state/app-store';
import { useI18n } from '@/i18n';
import { useToast } from '@/hooks/use-toast';
import { useSpeaker } from '@/hooks/use-speaker';
import type { Lang } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ConfirmDialog } from './confirm-dialog';

export function SettingsPanel() {
  const { settings, setLang, setVolume, resetAll } = useAppStore();
  const { t, storageMessage } = useI18n();
  const { toast } = useToast();
  const { sayText } = useSpeaker();
  const navigate = useNavigate();
  const [vol, setVol] = useState(Math.round(settings.volume * 100));
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => setVol(Math.round(settings.volume * 100)), [settings.volume]);

  const fail = (e: unknown) => toast({ title: storageMessage(e), variant: 'destructive' });

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="rounded-[2rem] border border-card-border bg-card p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-xl font-extrabold">
          <Languages className="size-5 text-primary" aria-hidden /> {t('settings.language')}
        </h2>
        <p className="mt-1 text-muted-foreground">{t('settings.languageSub')}</p>
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-[1.5rem] bg-muted p-1.5" role="radiogroup">
          {(['en', 'ar'] as Lang[]).map((l) => (
            <button
              key={l}
              type="button"
              role="radio"
              aria-checked={settings.lang === l}
              lang={l}
              onClick={() => setLang(l).catch(fail)}
              data-testid={`radio-lang-${l}`}
              className={cn(
                'min-h-[64px] rounded-[1.2rem] text-lg font-extrabold transition-colors',
                settings.lang === l ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground',
              )}
            >
              {l === 'en' ? 'English' : 'العربية'}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-card-border bg-card p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-xl font-extrabold">
          <Volume2 className="size-5 text-primary" aria-hidden /> {t('settings.volume')}
        </h2>
        <div className="mt-6 flex items-center gap-4">
          <Volume1 className="size-5 shrink-0 text-muted-foreground" aria-hidden />
          <Slider
            value={[vol]}
            min={0}
            max={100}
            step={5}
            aria-label={t('settings.volume')}
            onValueChange={([v]) => setVol(v)}
            onValueCommit={([v]) => setVolume(v / 100).catch(fail)}
            className="flex-1 [&_[role=slider]]:size-7"
            data-testid="slider-volume"
          />
          <span className="w-12 text-end text-lg font-extrabold tabular-nums">{vol}%</span>
        </div>
        <button
          type="button"
          onClick={() => sayText(t('settings.testPhrase'))}
          className="mt-6 inline-flex min-h-[56px] items-center gap-2 rounded-full bg-secondary px-6 font-bold text-secondary-foreground"
          data-testid="button-test-voice"
        >
          <Volume2 className="size-5" aria-hidden /> {t('settings.test')}
        </button>
      </section>

      <section className="rounded-[2rem] border border-card-border bg-sage/50 p-6 lg:col-span-2">
        <p className="flex items-start gap-3 text-lg font-semibold text-sage-ink">
          <ShieldCheck className="mt-1 size-5 shrink-0" aria-hidden /> {t('settings.privacy')}
        </p>
      </section>

      <section className="rounded-[2rem] border-2 border-destructive/25 bg-card p-6 lg:col-span-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-destructive">{t('settings.danger')}</h2>
            <p className="mt-1 text-muted-foreground">{t('settings.dangerSub')}</p>
          </div>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="inline-flex min-h-[56px] items-center gap-2 rounded-full border-2 border-destructive px-6 font-extrabold text-destructive hover:bg-destructive/5"
            data-testid="button-delete-all"
          >
            <Trash2 className="size-5" aria-hidden /> {t('settings.danger')}
          </button>
        </div>
      </section>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t('settings.danger')}
        body={t('settings.dangerBody')}
        confirmLabel={t('settings.dangerConfirm')}
        testId="dialog-delete-all"
        onConfirm={async () => {
          try {
            await resetAll();
            toast({ title: t('settings.deleted') });
            navigate('/', { replace: true });
          } catch (e) {
            fail(e);
          }
        }}
      />
    </div>
  );
}
