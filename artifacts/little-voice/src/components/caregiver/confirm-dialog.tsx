import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useI18n } from '@/i18n';

/** Destructive confirmation that waits for the async action to finish before closing. */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  body,
  confirmLabel,
  onConfirm,
  testId,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => Promise<void>;
  testId: string;
}) {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  return (
    <AlertDialog open={open} onOpenChange={(o) => !busy && onOpenChange(o)}>
      <AlertDialogContent className="max-w-md rounded-[2rem] border-card-border bg-card p-6 sm:p-8">
        <AlertDialogTitle className="text-2xl font-extrabold">{title}</AlertDialogTitle>
        <AlertDialogDescription className="text-base leading-relaxed text-muted-foreground">{body}</AlertDialogDescription>
        <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            autoFocus
            disabled={busy}
            onClick={() => onOpenChange(false)}
            className="min-h-[60px] rounded-full bg-muted px-8 text-lg font-bold"
            data-testid={`${testId}-cancel`}
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await onConfirm();
                onOpenChange(false);
              } finally {
                setBusy(false);
              }
            }}
            className="inline-flex min-h-[60px] items-center justify-center gap-2 rounded-full bg-destructive px-8 text-lg font-extrabold text-destructive-foreground disabled:opacity-60"
            data-testid={`${testId}-confirm`}
          >
            {busy && <Loader2 className="size-5 animate-spin" aria-hidden />}
            {confirmLabel}
          </button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
