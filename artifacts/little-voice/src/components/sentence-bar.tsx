import { useEffect, useRef } from 'react';
import { Delete, Eraser, Volume2 } from 'lucide-react';
import { useAppStore } from '@/state/app-store';
import { useI18n } from '@/i18n';
import { useSpeaker } from '@/hooks/use-speaker';
import { toneClasses } from '@/lib/tones';
import { cn } from '@/lib/utils';
import { CardPicture } from './card-picture';

export function SentenceBar() {
  const { sentence, removeLast, clearSentence } = useAppStore();
  const { t, pick } = useI18n();
  const { saySentence } = useSpeaker();
  const scroller = useRef<HTMLDivElement>(null);
  const empty = sentence.length === 0;

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const rtl = document.documentElement.dir === 'rtl';
    el.scrollTo({ left: rtl ? -el.scrollWidth : el.scrollWidth, behavior: 'smooth' });
  }, [sentence.length]);

  return (
    <section
      aria-label={t('sentenceLabel')}
      className="rounded-[2rem] border border-card-border bg-card/90 p-3 shadow-md backdrop-blur sm:p-4"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
        <div
          ref={scroller}
          className="lv-scroll-x flex min-h-[96px] flex-1 items-center gap-2 overflow-x-auto rounded-[1.5rem] bg-muted/70 px-3 py-2"
          aria-live="polite"
          data-testid="sentence-strip"
        >
          {empty ? (
            <p className="px-2 text-lg font-semibold text-muted-foreground">{t('sentenceEmpty')}</p>
          ) : (
            sentence.map((item, i) => {
              const tone = toneClasses[item.tone];
              const showWant = item.wantable && (i === 0 || !sentence[i - 1].wantable);
              return (
                <div key={item.uid} className="flex shrink-0 items-center gap-2 lv-rise">
                  {showWant && (
                    <span className="rounded-2xl bg-primary px-4 py-3 text-lg font-extrabold text-primary-foreground" data-testid="text-i-want">
                      {t('iWant')}
                    </span>
                  )}
                  <span
                    className={cn('flex h-[76px] items-center gap-2 rounded-2xl ps-2 pe-4 font-extrabold', tone.bg, tone.ink)}
                    data-testid={`sentence-item-${i}`}
                  >
                    {(item.image || item.emoji) && (
                      <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-card/60">
                        <CardPicture image={item.image} emoji={item.emoji} alt="" emojiClassName="text-3xl" />
                      </span>
                    )}
                    <span className="text-lg leading-tight">{pick(item.labelEn, item.labelAr)}</span>
                  </span>
                </div>
              );
            })
          )}
        </div>
        <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-2 lg:flex lg:w-auto">
          <button
            type="button"
            onClick={() => saySentence()}
            disabled={empty}
            data-testid="button-speak-sentence"
            className="flex min-h-[80px] items-center justify-center gap-2 rounded-[1.5rem] bg-primary px-6 text-xl font-extrabold text-primary-foreground shadow-sm transition-opacity disabled:opacity-45 lg:min-w-[150px]"
          >
            <Volume2 className="size-7" aria-hidden /> {t('speak')}
          </button>
          <button
            type="button"
            onClick={removeLast}
            disabled={empty}
            data-testid="button-delete-last"
            className="flex min-h-[80px] flex-col items-center justify-center gap-1 rounded-[1.5rem] bg-secondary px-3 text-base font-bold text-secondary-foreground disabled:opacity-45"
          >
            <Delete className="size-6 rtl:-scale-x-100" aria-hidden /> {t('deleteLast')}
          </button>
          <button
            type="button"
            onClick={clearSentence}
            disabled={empty}
            data-testid="button-clear-sentence"
            className="flex min-h-[80px] flex-col items-center justify-center gap-1 rounded-[1.5rem] bg-accent px-3 text-base font-bold text-accent-foreground disabled:opacity-45"
          >
            <Eraser className="size-6" aria-hidden /> {t('clearAll')}
          </button>
        </div>
      </div>
    </section>
  );
}
