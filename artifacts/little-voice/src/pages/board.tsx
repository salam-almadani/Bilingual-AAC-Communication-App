import { useSearchParams } from 'react-router-dom';
import { HeartPulse, Shapes, Apple, Backpack } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAppStore } from '@/state/app-store';
import { useI18n } from '@/i18n';
import { useSpeaker } from '@/hooks/use-speaker';
import { ChildHeader } from '@/components/child-header';
import { SentenceBar } from '@/components/sentence-bar';
import { CardTile } from '@/components/card-tile';
import { HelpPainButton } from '@/components/help-pain-button';
import { BodyBoard } from '@/components/body/body-board';
import { cardToItem } from '@/lib/sentence';
import { toneClasses } from '@/lib/tones';
import type { Card, Category } from '@/lib/types';
import type { TKey } from '@/i18n/en';
import { cn } from '@/lib/utils';

type Tab = Category | 'body';
const TABS: { id: Tab; key: TKey; icon: LucideIcon }[] = [
  { id: 'core', key: 'tab.core', icon: Shapes },
  { id: 'food', key: 'tab.food', icon: Apple },
  { id: 'personal', key: 'tab.personal', icon: Backpack },
  { id: 'body', key: 'tab.body', icon: HeartPulse },
];

export default function BoardPage() {
  const [params, setParams] = useSearchParams();
  const raw = params.get('tab');
  const tab: Tab = TABS.some((x) => x.id === raw) ? (raw as Tab) : 'core';
  const { cards, addToSentence } = useAppStore();
  const { t } = useI18n();
  const { sayItem } = useSpeaker();
  const visible = cards.filter((c) => c.category === tab);

  const onPick = (card: Card) => {
    const item = cardToItem(card);
    addToSentence(item);
    sayItem(item);
  };

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-7xl flex-col gap-4 px-3 pb-32 pt-4 sm:px-6">
      <ChildHeader />
      <div className="sticky top-2 z-30">
        <SentenceBar />
      </div>

      <nav role="tablist" aria-label={t('sentenceLabel')} className="lv-scroll-x -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {TABS.map(({ id, key, icon: Icon }) => {
          const tone = toneClasses[id === 'body' ? 'body' : id];
          const selected = id === tab;
          return (
            <button
              key={id}
              role="tab"
              aria-selected={selected}
              data-testid={`tab-${id}`}
              onClick={() => setParams(id === 'core' ? {} : { tab: id }, { replace: true })}
              className={cn(
                'flex min-h-[76px] shrink-0 items-center gap-3 rounded-[1.5rem] border-2 px-5 text-lg font-extrabold transition-colors sm:flex-1 sm:justify-center',
                selected ? cn(tone.bg, tone.ink, 'border-current/20 shadow-sm') : 'border-transparent bg-card/70 text-muted-foreground hover:bg-card',
              )}
            >
              <span className={cn('grid size-10 place-items-center rounded-full', selected ? 'bg-card/70' : tone.bg, tone.ink)}>
                <Icon className="size-5" aria-hidden />
              </span>
              {t(key)}
            </button>
          );
        })}
      </nav>

      <section role="tabpanel" className="flex-1">
        {tab === 'body' ? (
          <BodyBoard />
        ) : visible.length === 0 ? (
          <div className="grid place-items-center rounded-[2rem] border-2 border-dashed border-border bg-card/60 px-6 py-16 text-center" data-testid="empty-category">
            <div className={cn('mb-4 grid size-20 place-items-center rounded-full', toneClasses[tab].bg)}>
              <Shapes className={cn('size-9', toneClasses[tab].ink)} aria-hidden />
            </div>
            <p className="text-2xl font-extrabold">{t('emptyCategory')}</p>
            <p className="mt-2 max-w-sm text-lg text-muted-foreground">{t('emptyCategoryHint')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5 xl:grid-cols-6">
            {visible.map((card, i) => (
              <CardTile key={card.id} card={card} onPick={onPick} index={i} />
            ))}
          </div>
        )}
      </section>
      <HelpPainButton />
    </main>
  );
}
