import { useState } from 'react';
import { HeartPulse } from 'lucide-react';
import { useAppStore } from '@/state/app-store';
import { useI18n } from '@/i18n';
import { useSpeaker } from '@/hooks/use-speaker';
import { painItem, severityItem } from '@/lib/sentence';
import type { Hotspot } from '@/lib/types';
import { cn } from '@/lib/utils';
import { BodyFigure } from './body-figure';
import { PainScale } from './pain-scale';

/** Child-facing body map: tap a place → hear it, add "It hurts: …", then choose how much. */
export function BodyBoard() {
  const { body, addToSentence } = useAppStore();
  const { t, tIn, pick, lang } = useI18n();
  const { sayPartsNow, sayItem } = useSpeaker();
  const [active, setActive] = useState<Hotspot | null>(null);
  const [scaleOpen, setScaleOpen] = useState(false);

  const tap = (h: Hotspot) => {
    setActive(h);
    const name = pick(h.nameEn, h.nameAr);
    sayPartsNow([{ text: name, blob: lang === 'ar' ? h.audioAr : h.audioEn }]);
    addToSentence(painItem(h, tIn));
    setScaleOpen(true);
  };

  if (body.hotspots.length === 0) {
    return (
      <div className="grid gap-6 rounded-[2rem] bg-card/70 p-6 md:grid-cols-[280px_1fr] md:items-center">
        <BodyFigure body={body} className="max-w-[220px] opacity-70" />
        <p className="text-xl font-bold text-muted-foreground" data-testid="text-body-empty">{t('bodyEmpty')}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 rounded-[2rem] bg-card/70 p-4 sm:p-6 md:grid-cols-[minmax(240px,360px)_1fr]">
      <div>
        <p className="mb-3 flex items-center gap-2 text-xl font-extrabold text-sage-ink">
          <HeartPulse className="size-6" aria-hidden /> {t('bodyHint')}
        </p>
        <BodyFigure body={body} className="max-w-[340px]">
          {body.hotspots.map((h) => {
            const name = pick(h.nameEn, h.nameAr);
            const on = active?.id === h.id;
            return (
              <button
                key={h.id}
                type="button"
                onClick={() => tap(h)}
                aria-label={name}
                data-testid={`hotspot-${h.id}`}
                style={{ left: `${h.x}%`, top: `${h.y}%`, width: `${Math.max(h.r * 2, 14)}%` }}
                className={cn(
                  'absolute aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-dashed transition-colors',
                  on ? 'border-coral-ink/70 bg-coral/70' : 'border-sage-ink/40 bg-card/30 hover:bg-card/60',
                )}
              />
            );
          })}
        </BodyFigure>
      </div>
      <ul className="grid content-start gap-3 sm:grid-cols-2">
        {body.hotspots.map((h) => (
          <li key={h.id}>
            <button
              type="button"
              onClick={() => tap(h)}
              data-testid={`button-part-${h.id}`}
              className={cn(
                'flex min-h-[80px] w-full items-center gap-3 rounded-[1.5rem] border-2 px-5 text-start text-xl font-extrabold',
                active?.id === h.id ? 'border-coral-ink/30 bg-coral text-coral-ink' : 'border-transparent bg-sage text-sage-ink',
              )}
            >
              <span className="size-4 shrink-0 rounded-full border-[3px] border-dashed border-current" aria-hidden />
              {pick(h.nameEn, h.nameAr)}
            </button>
          </li>
        ))}
      </ul>
      <PainScale
        open={scaleOpen}
        onOpenChange={setScaleOpen}
        partName={active ? pick(active.nameEn, active.nameAr) : ''}
        onSelect={(level) => {
          const item = severityItem(level, tIn);
          addToSentence(item);
          sayItem(item);
          setScaleOpen(false);
        }}
      />
    </div>
  );
}
