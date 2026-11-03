import { useEffect, useState } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { useI18n } from '@/i18n';
import type { Hotspot } from '@/lib/types';
import { TextField } from '../caregiver/field';
import { VoiceRecorder } from '../caregiver/voice-recorder';

/** Edit a body place's bilingual names and voices — same recorder as cards. */
export function HotspotEditor({
  hotspot,
  onClose,
  onSave,
  onDelete,
}: {
  hotspot: Hotspot | null;
  onClose: () => void;
  onSave: (h: Hotspot) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}) {
  const { t } = useI18n();
  const [draft, setDraft] = useState<Hotspot | null>(null);
  const [busy, setBusy] = useState(false);
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    setDraft(hotspot ? { ...hotspot } : null);
    setInvalid(false);
  }, [hotspot]);

  const set = (p: Partial<Hotspot>) => setDraft((d) => (d ? { ...d, ...p } : d));

  return (
    <Dialog open={!!hotspot} onOpenChange={(o) => !o && !busy && onClose()}>
      <DialogContent className="max-h-[92dvh] max-w-2xl overflow-y-auto rounded-[2rem] border-card-border bg-card p-5 sm:p-8">
        <DialogTitle className="text-2xl font-extrabold">{t('body.editPart')}</DialogTitle>
        <DialogDescription className="sr-only">{t('body.tapToAdd')}</DialogDescription>
        {draft && (
          <>
            <div className="mt-2 grid gap-4 sm:grid-cols-2">
              <TextField id="part-en" label={t('body.nameEn')} dir="ltr" lang="en" value={draft.nameEn} onChange={(e) => set({ nameEn: e.target.value })} data-testid="input-part-en" />
              <TextField id="part-ar" label={t('body.nameAr')} dir="rtl" lang="ar" value={draft.nameAr} onChange={(e) => set({ nameAr: e.target.value })} data-testid="input-part-ar" />
            </div>
            {invalid && <p role="alert" className="mt-2 font-semibold text-destructive">{t('editor.labelRequired')}</p>}
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <VoiceRecorder lang="en" label={t('editor.voiceEn')} blob={draft.audioEn} onChange={(audioEn) => set({ audioEn })} testId="part-recorder-en" />
              <VoiceRecorder lang="ar" label={t('editor.voiceAr')} blob={draft.audioAr} onChange={(audioAr) => set({ audioAr })} testId="part-recorder-ar" />
            </div>
            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  const ok = await onDelete(draft.id);
                  setBusy(false);
                  if (ok) onClose();
                }}
                className="inline-flex min-h-[60px] items-center justify-center gap-2 rounded-full px-6 font-bold text-destructive hover:bg-destructive/5 sm:me-auto"
                data-testid="button-delete-part"
              >
                <Trash2 className="size-5" aria-hidden /> {t('body.deletePart')}
              </button>
              <button type="button" disabled={busy} onClick={onClose} className="min-h-[60px] rounded-full bg-muted px-8 text-lg font-bold">
                {t('cancel')}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  const nameEn = draft.nameEn.trim();
                  const nameAr = draft.nameAr.trim();
                  if (!nameEn && !nameAr) return setInvalid(true);
                  setBusy(true);
                  const ok = await onSave({ ...draft, nameEn, nameAr });
                  setBusy(false);
                  if (ok) onClose();
                }}
                className="inline-flex min-h-[60px] items-center justify-center gap-2 rounded-full bg-primary px-10 text-lg font-extrabold text-primary-foreground disabled:opacity-60"
                data-testid="button-save-part"
              >
                {busy && <Loader2 className="size-5 animate-spin" aria-hidden />}
                {busy ? t('saving') : t('save')}
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
