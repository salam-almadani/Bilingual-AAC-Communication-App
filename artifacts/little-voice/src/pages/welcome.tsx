import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { useAppStore } from '@/state/app-store';
import { useI18n } from '@/i18n';
import { ChildHeader } from '@/components/child-header';
import { HelpPainButton } from '@/components/help-pain-button';
import { CardPicture } from '@/components/card-picture';
import { toneClasses } from '@/lib/tones';
import { cn } from '@/lib/utils';

export default function WelcomePage() {
  const { t, pick } = useI18n();
  const { cards } = useAppStore();
  const preview = (['core', 'food', 'personal'] as const)
    .map((c) => cards.find((k) => k.category === c))
    .filter((c): c is NonNullable<typeof c> => !!c);
  const tilts = ['-rotate-6 translate-y-6', 'rotate-2 -translate-y-2 z-10', 'rotate-[7deg] translate-y-8'];

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-6xl flex-col px-5 pb-32 pt-5 sm:px-8">
      <ChildHeader />
      <div className="grid flex-1 items-center gap-12 py-10 md:grid-cols-[1.1fr_1fr]">
        <div className="lv-rise">
          <p className="mb-5 inline-flex rounded-full bg-sage px-4 py-2 text-base font-bold text-sage-ink">
            {t('appName')} · <span lang="ar" className="ms-1">{t('appNameAr')}</span>
          </p>
          <h1 className="text-[2.75rem] font-black leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            {t('welcome.tagline')}
          </h1>
          <p className="mt-6 max-w-lg text-xl leading-relaxed text-muted-foreground sm:text-2xl">{t('welcome.sub')}</p>
          <Link
            to="/board"
            data-testid="button-start"
            className="mt-10 inline-flex min-h-[104px] min-w-[260px] items-center justify-center gap-4 rounded-full bg-primary px-12 text-4xl font-black text-primary-foreground shadow-lg transition-transform hover:-translate-y-0.5"
          >
            {t('welcome.start')}
            <ArrowRight className="size-9 rtl:-scale-x-100" aria-hidden />
          </Link>
          <p className="mt-8 flex max-w-md items-start gap-2 text-base text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
            {t('welcome.note')}
          </p>
        </div>

        <div aria-hidden className="relative mx-auto flex h-[340px] w-full max-w-md items-center justify-center sm:h-[420px]">
          <div className="absolute inset-6 rounded-[3rem] bg-lilac/70 lv-breathe" />
          <div className="absolute -bottom-2 start-6 size-28 rounded-full bg-apricot/80" />
          <div className="absolute end-2 top-4 size-20 rounded-full bg-sky/90" />
          <div className="relative flex items-end">
            {preview.map((card, i) => {
              const tone = toneClasses[card.category];
              return (
                <div
                  key={card.id}
                  className={cn(
                    '-mx-3 w-36 overflow-hidden rounded-[1.75rem] border-2 border-card-border bg-card shadow-lg sm:w-44',
                    tilts[i],
                  )}
                >
                  <div className={cn('grid aspect-[4/3] place-items-center', tone.bg)}>
                    <CardPicture image={card.image} emoji={card.emoji} alt="" emojiClassName="text-6xl" />
                  </div>
                  <div className={cn('py-3 text-center text-xl font-extrabold', tone.ink)}>{pick(card.labelEn, card.labelAr)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <HelpPainButton />
    </main>
  );
}
