import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { useI18n } from '@/i18n';
import { PAIN_KEYS } from '@/lib/sentence';
import { cn } from '@/lib/utils';

const LEVELS = [
  { bg: 'bg-sage', ink: 'text-sage-ink', mouth: 'M34 62 Q50 76 66 62', brow: 0 },
  { bg: 'bg-sky', ink: 'text-sky-ink', mouth: 'M36 66 L64 66', brow: 0 },
  { bg: 'bg-apricot', ink: 'text-apricot-ink', mouth: 'M36 70 Q50 60 64 70', brow: 6 },
  { bg: 'bg-coral', ink: 'text-coral-ink', mouth: 'M34 72 Q50 56 66 72', brow: 10 },
];

function Face({ level }: { level: number }) {
  const l = LEVELS[level];
  return (
    <svg viewBox="0 0 100 100" className="size-20 sm:size-24" aria-hidden>
      <circle cx="50" cy="50" r="44" fill="hsl(var(--card))" stroke="currentColor" strokeWidth="4" />
      <circle cx="36" cy="44" r="5" fill="currentColor" />
      <circle cx="64" cy="44" r="5" fill="currentColor" />
      {l.brow > 0 && (
        <g stroke="currentColor" strokeWidth="4" strokeLinecap="round">
          <path d={`M28 ${32 - l.brow / 3} L42 ${32 + l.brow / 3}`} />
          <path d={`M72 ${32 - l.brow / 3} L58 ${32 + l.brow / 3}`} />
        </g>
      )}
      <path d={l.mouth} fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

/** Simple face-based pain scale. */
export function PainScale({
  open,
  onOpenChange,
  partName,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  partName: string;
  onSelect: (level: number) => void;
}) {
  const { t } = useI18n();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-[2rem] border-card-border bg-card p-6 sm:p-8">
        <DialogTitle className="text-3xl font-extrabold">{t('painTitle')}</DialogTitle>
        <DialogDescription className="text-lg font-semibold text-muted-foreground">{t('hurts', { part: partName })}</DialogDescription>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {LEVELS.map((l, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(i)}
              data-testid={`button-pain-${i}`}
              className={cn('flex min-h-[168px] flex-col items-center justify-center gap-3 rounded-[1.75rem] p-3 text-center', l.bg, l.ink)}
            >
              <Face level={i} />
              <span className="text-lg font-extrabold leading-tight">{t(PAIN_KEYS[i])}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
