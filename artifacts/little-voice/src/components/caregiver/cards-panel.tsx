import { useState } from 'react';
import { Mic, MicOff, Pencil, Plus, Trash2 } from 'lucide-react';
import { useAppStore } from '@/state/app-store';
import { useI18n } from '@/i18n';
import { useToast } from '@/hooks/use-toast';
import { CATEGORIES, type Card, type Category } from '@/lib/types';
import { toneClasses } from '@/lib/tones';
import { cn } from '@/lib/utils';
import { CardPicture } from '../card-picture';
import { CardEditor } from './card-editor';
import { ConfirmDialog } from './confirm-dialog';

const TAB_KEY = { core: 'tab.core', food: 'tab.food', personal: 'tab.personal' } as const;

export function CardsPanel() {
  const { cards, removeCard } = useAppStore();
  const { t, pick, storageMessage } = useI18n();
  const { toast } = useToast();
  const [filter, setFilter] = useState<Category>('core');
  const [editing, setEditing] = useState<Card | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [deleting, setDeleting] = useState<Card | null>(null);

  const list = cards.filter((c) => c.category === filter);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" role="tablist">
          {CATEGORIES.map((c) => {
            const n = cards.filter((k) => k.category === c).length;
            const on = filter === c;
            return (
              <button
                key={c}
                role="tab"
                aria-selected={on}
                onClick={() => setFilter(c)}
                data-testid={`filter-${c}`}
                className={cn(
                  'inline-flex min-h-[52px] items-center gap-2 rounded-full border-2 px-5 font-bold',
                  on ? cn(toneClasses[c].bg, toneClasses[c].ink, 'border-current/25') : 'border-border bg-card text-muted-foreground',
                )}
              >
                {t(TAB_KEY[c])}
                <span className="rounded-full bg-card/80 px-2 text-sm tabular-nums">{n}</span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setEditorOpen(true);
          }}
          data-testid="button-new-card"
          className="inline-flex min-h-[56px] items-center gap-2 rounded-full bg-primary px-6 text-lg font-extrabold text-primary-foreground shadow-sm"
        >
          <Plus className="size-5" aria-hidden /> {t('cards.new')}
        </button>
      </div>

      {list.length === 0 ? (
        <div className="grid place-items-center rounded-[2rem] border-2 border-dashed border-border bg-card/60 px-6 py-14 text-center">
          <p className="text-xl font-extrabold">{t('emptyCategory')}</p>
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setEditorOpen(true);
            }}
            className="mt-4 inline-flex min-h-[52px] items-center gap-2 rounded-full bg-secondary px-5 font-bold text-secondary-foreground"
          >
            <Plus className="size-4" aria-hidden /> {t('cards.new')}
          </button>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((card) => {
            const tone = toneClasses[card.category];
            return (
              <li key={card.id} className="flex items-center gap-4 rounded-[1.5rem] border border-card-border bg-card p-3 shadow-sm" data-testid={`row-card-${card.id}`}>
                <div className={cn('grid size-20 shrink-0 place-items-center overflow-hidden rounded-2xl', tone.bg)}>
                  <CardPicture image={card.image} emoji={card.emoji} alt="" emojiClassName="text-4xl" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg font-extrabold">{pick(card.labelEn, card.labelAr)}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    <span lang="en" dir="ltr">{card.labelEn || '—'}</span> · <span lang="ar" dir="rtl">{card.labelAr || '—'}</span>
                  </p>
                  <div className="mt-1.5 flex gap-1.5 text-xs font-bold">
                    <VoiceBadge on={!!card.audioEn} label={t('cards.voiceEn')} off={t('cards.noVoice')} />
                    <VoiceBadge on={!!card.audioAr} label={t('cards.voiceAr')} off={t('cards.noVoice')} />
                  </div>
                </div>
                <div className="flex shrink-0 flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(card);
                      setEditorOpen(true);
                    }}
                    aria-label={`${t('cards.edit')} ${pick(card.labelEn, card.labelAr)}`}
                    className="grid size-12 place-items-center rounded-full bg-secondary text-secondary-foreground"
                    data-testid={`button-edit-${card.id}`}
                  >
                    <Pencil className="size-5" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleting(card)}
                    aria-label={`${t('cards.delete')} ${pick(card.labelEn, card.labelAr)}`}
                    className="grid size-12 place-items-center rounded-full bg-coral/70 text-coral-ink"
                    data-testid={`button-delete-${card.id}`}
                  >
                    <Trash2 className="size-5" aria-hidden />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <CardEditor open={editorOpen} onOpenChange={setEditorOpen} card={editing} defaultCategory={filter} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={t('cards.deleteTitle', { name: deleting ? pick(deleting.labelEn, deleting.labelAr) : '' })}
        body={t('cards.deleteBody')}
        confirmLabel={t('confirmDelete')}
        testId="dialog-delete-card"
        onConfirm={async () => {
          if (!deleting) return;
          try {
            await removeCard(deleting.id);
            toast({ title: t('cards.deleted') });
          } catch (e) {
            toast({ title: storageMessage(e), variant: 'destructive' });
          }
        }}
      />
    </div>
  );
}

function VoiceBadge({ on, label, off }: { on: boolean; label: string; off: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5', on ? 'bg-sage text-sage-ink' : 'bg-muted text-muted-foreground')}>
      {on ? <Mic className="size-3" aria-hidden /> : <MicOff className="size-3" aria-hidden />}
      {label}
      {!on && <span className="sr-only">: {off}</span>}
    </span>
  );
}
