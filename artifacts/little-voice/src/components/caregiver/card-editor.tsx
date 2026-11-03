import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { useAppStore } from '@/state/app-store';
import { useI18n } from '@/i18n';
import { useToast } from '@/hooks/use-toast';
import { CATEGORIES, uid, type Card, type Category } from '@/lib/types';
import { toneClasses } from '@/lib/tones';
import { cn } from '@/lib/utils';
import { CardPicture } from '../card-picture';
import { PhotoPicker } from './photo-picker';
import { VoiceRecorder } from './voice-recorder';
import { TextField } from './field';

const TAB_KEY = { core: 'tab.core', food: 'tab.food', personal: 'tab.personal' } as const;

export function CardEditor({
  open,
  onOpenChange,
  card,
  defaultCategory,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  card: Card | null;
  defaultCategory: Category;
}) {
  const { cards, saveCard } = useAppStore();
  const { t, storageMessage } = useI18n();
  const { toast } = useToast();
  const [draft, setDraft] = useState<Card | null>(null);
  const [saving, setSaving] = useState(false);
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    if (!open) return;
    setInvalid(false);
    setDraft(
      card
        ? { ...card }
        : { id: uid(), category: defaultCategory, labelEn: '', labelAr: '', emoji: '', order: 0 },
    );
  }, [open, card, defaultCategory]);

  if (!draft) return null;
  const set = (patch: Partial<Card>) => setDraft((d) => (d ? { ...d, ...patch } : d));
  const tone = toneClasses[draft.category];

  const onSave = async () => {
    const labelEn = draft.labelEn.trim();
    const labelAr = draft.labelAr.trim();
    if (!labelEn && !labelAr) {
      setInvalid(true);
      return;
    }
    let order = draft.order;
    if (!card || card.category !== draft.category) {
      order = Math.max(0, ...cards.filter((c) => c.category === draft.category).map((c) => c.order)) + 1;
    }
    setSaving(true);
    try {
      await saveCard({ ...draft, labelEn, labelAr, emoji: draft.emoji?.trim() || undefined, order });
      toast({ title: t('saved') });
      onOpenChange(false);
    } catch (e) {
      toast({ title: storageMessage(e), variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !saving && onOpenChange(o)}>
      <DialogContent className="max-h-[92dvh] max-w-2xl overflow-y-auto rounded-[2rem] border-card-border bg-card p-5 sm:p-8">
        <DialogTitle className="text-2xl font-extrabold">{card ? t('editor.editTitle') : t('editor.newTitle')}</DialogTitle>
        <DialogDescription className="sr-only">{t('cg.sub')}</DialogDescription>

        <div className="mt-2 grid gap-6 sm:grid-cols-[180px_1fr]">
          <div>
            <div className="overflow-hidden rounded-[1.5rem] border-2 border-card-border bg-card shadow-sm">
              <div className={cn('grid aspect-[4/3] place-items-center overflow-hidden', tone.bg)}>
                <CardPicture image={draft.image} emoji={draft.emoji} alt="" emojiClassName="text-6xl" />
              </div>
              <div className={cn('px-2 py-3 text-center text-lg font-extrabold', tone.ink)}>
                {draft.labelEn || draft.labelAr || '…'}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-bold text-muted-foreground">{t('editor.picture')}</p>
              <PhotoPicker
                testId="card-photo"
                hasPhoto={!!draft.image}
                onPicked={(image) => set({ image })}
                onRemove={() => set({ image: undefined })}
              />
            </div>
            <TextField
              id="card-emoji"
              label={t('editor.emoji')}
              value={draft.emoji ?? ''}
              maxLength={8}
              onChange={(e) => set({ emoji: e.target.value })}
              className="w-28 text-center text-3xl"
              data-testid="input-card-emoji"
            />
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <TextField
            id="card-label-en"
            label={t('editor.labelEn')}
            dir="ltr"
            lang="en"
            value={draft.labelEn}
            onChange={(e) => set({ labelEn: e.target.value })}
            data-testid="input-label-en"
          />
          <TextField
            id="card-label-ar"
            label={t('editor.labelAr')}
            dir="rtl"
            lang="ar"
            value={draft.labelAr}
            onChange={(e) => set({ labelAr: e.target.value })}
            data-testid="input-label-ar"
          />
        </div>
        {invalid && (
          <p role="alert" className="mt-2 font-semibold text-destructive">
            {t('editor.labelRequired')}
          </p>
        )}

        <fieldset className="mt-6">
          <legend className="mb-2 text-sm font-bold text-muted-foreground">{t('editor.category')}</legend>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={draft.category === c}
                onClick={() => set({ category: c })}
                data-testid={`radio-category-${c}`}
                className={cn(
                  'min-h-[52px] rounded-full border-2 px-5 font-bold',
                  draft.category === c ? cn(toneClasses[c].bg, toneClasses[c].ink, 'border-current/30') : 'border-border bg-card text-muted-foreground',
                )}
              >
                {t(TAB_KEY[c])}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <VoiceRecorder lang="en" label={t('editor.voiceEn')} blob={draft.audioEn} onChange={(audioEn) => set({ audioEn })} testId="recorder-en" />
          <VoiceRecorder lang="ar" label={t('editor.voiceAr')} blob={draft.audioAr} onChange={(audioAr) => set({ audioAr })} testId="recorder-ar" />
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={saving}
            className="min-h-[60px] rounded-full bg-muted px-8 text-lg font-bold"
            data-testid="button-cancel-card"
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="inline-flex min-h-[60px] items-center justify-center gap-2 rounded-full bg-primary px-10 text-lg font-extrabold text-primary-foreground disabled:opacity-60"
            data-testid="button-save-card"
          >
            {saving && <Loader2 className="size-5 animate-spin" aria-hidden />}
            {saving ? t('saving') : t('save')}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
