import { useEffect, useRef, useState } from 'react';
import type { Card } from '@/lib/types';
import { useI18n } from '@/i18n';
import { toneClasses } from '@/lib/tones';
import { cn } from '@/lib/utils';
import { CardPicture } from './card-picture';

export function CardTile({ card, onPick, index = 0 }: { card: Card; onPick: (card: Card) => void; index?: number }) {
  const { pick } = useI18n();
  const [active, setActive] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const tone = toneClasses[card.category];
  const label = pick(card.labelEn, card.labelAr);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <button
      type="button"
      onClick={() => {
        setActive(true);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setActive(false), 1400);
        onPick(card);
      }}
      data-testid={`card-${card.id}`}
      aria-pressed={active}
      style={{ animationDelay: `${Math.min(index, 12) * 35}ms` }}
      className={cn(
        'lv-rise group relative flex min-h-[168px] flex-col overflow-hidden rounded-[1.75rem] border-2 bg-card text-start shadow-sm transition-[transform,box-shadow,border-color] duration-300 ease-out',
        'hover:-translate-y-0.5 hover:shadow-md active:translate-y-0',
        active ? cn('border-transparent ring-4 shadow-md -translate-y-0.5', tone.ring) : 'border-card-border',
      )}
    >
      <span className={cn('relative grid aspect-[4/3] w-full place-items-center overflow-hidden', tone.bg)}>
        <CardPicture image={card.image} emoji={card.emoji} alt="" emojiClassName="text-[3.5rem] sm:text-[4.25rem]" />
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-0 bg-card/40 opacity-0 transition-opacity duration-500',
            active && 'opacity-100',
          )}
        />
      </span>
      <span className={cn('flex flex-1 items-center justify-center px-3 py-3 text-center text-xl font-extrabold leading-tight sm:text-2xl', tone.ink)}>
        {label}
      </span>
    </button>
  );
}
