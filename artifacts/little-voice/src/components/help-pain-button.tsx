import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HandHelping, HeartPulse, LifeBuoy } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { useAppStore } from '@/state/app-store';
import { useI18n } from '@/i18n';
import { useSpeaker } from '@/hooks/use-speaker';
import { helpItem } from '@/lib/sentence';

/** Always-visible Help / Pain control for child screens. */
export function HelpPainButton() {
  const [open, setOpen] = useState(false);
  const { addToSentence } = useAppStore();
  const { t, tIn } = useI18n();
  const { sayItem } = useSpeaker();
  const navigate = useNavigate();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-testid="button-help-pain"
        className="fixed bottom-4 end-4 z-40 flex min-h-[80px] items-center gap-3 rounded-full border-2 border-coral-ink/20 bg-coral ps-4 pe-6 text-xl font-extrabold text-coral-ink shadow-lg sm:bottom-6 sm:end-6"
      >
        <span className="grid size-12 place-items-center rounded-full bg-card/70">
          <LifeBuoy className="size-7" aria-hidden />
        </span>
        {t('helpPain')}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg rounded-[2rem] border-card-border bg-card p-6 sm:p-8">
          <DialogTitle className="text-3xl font-extrabold">{t('helpTitle')}</DialogTitle>
          <DialogDescription className="sr-only">{t('helpPain')}</DialogDescription>
          <div className="mt-4 grid gap-4">
            <button
              type="button"
              data-testid="button-need-help"
              onClick={() => {
                const item = helpItem(tIn);
                addToSentence(item);
                sayItem(item);
                setOpen(false);
              }}
              className="flex min-h-[112px] items-center gap-5 rounded-[1.75rem] bg-coral px-6 text-2xl font-extrabold text-coral-ink"
            >
              <span className="grid size-16 place-items-center rounded-full bg-card/70">
                <HandHelping className="size-9" aria-hidden />
              </span>
              {t('needHelp')}
            </button>
            <button
              type="button"
              data-testid="button-something-hurts"
              onClick={() => {
                setOpen(false);
                navigate('/board?tab=body');
              }}
              className="flex min-h-[112px] items-center gap-5 rounded-[1.75rem] bg-sage px-6 text-2xl font-extrabold text-sage-ink"
            >
              <span className="grid size-16 place-items-center rounded-full bg-card/70">
                <HeartPulse className="size-9" aria-hidden />
              </span>
              {t('somethingHurts')}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
