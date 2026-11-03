import { useCallback, useEffect, useRef, useState } from 'react';
import { Delete, ShieldCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { pinStore } from '@/lib/db';
import { createPinRecord, cryptoAvailable, LOCKOUT_MS, MAX_FAILS, verifyPin } from '@/lib/crypto';
import type { PinRecord } from '@/lib/types';
import { useAppStore } from '@/state/app-store';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';

type Phase = 'loading' | 'create' | 'confirm' | 'enter';

export function PinDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSuccess: () => void;
}) {
  const { unlock } = useAppStore();
  const { t, storageMessage } = useI18n();
  const [phase, setPhase] = useState<Phase>('loading');
  const [entry, setEntry] = useState('');
  const [first, setFirst] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [lockUntil, setLockUntil] = useState(0);
  const [now, setNow] = useState(Date.now());
  const record = useRef<PinRecord | undefined>(undefined);

  // Load PIN + persisted lockout each time the dialog opens.
  useEffect(() => {
    if (!open) return;
    let alive = true;
    setEntry('');
    setFirst('');
    setMessage(null);
    setPhase('loading');
    Promise.all([pinStore.get(), pinStore.getGuard()])
      .then(([rec, guard]) => {
        if (!alive) return;
        record.current = rec;
        setLockUntil(guard.lockUntil);
        setPhase(rec ? 'enter' : 'create');
      })
      .catch((e) => alive && setMessage(storageMessage(e)));
    return () => {
      alive = false;
    };
  }, [open, storageMessage]);

  const locked = lockUntil > now;
  useEffect(() => {
    if (!open || !locked) return;
    const id = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(id);
  }, [open, locked]);

  const submit = useCallback(
    async (pin: string) => {
      setBusy(true);
      try {
        if (phase === 'create') {
          setFirst(pin);
          setPhase('confirm');
          setMessage(null);
        } else if (phase === 'confirm') {
          if (pin !== first) {
            setMessage(t('pin.mismatch'));
            setFirst('');
            setPhase('create');
          } else {
            const rec = await createPinRecord(pin);
            await pinStore.set(rec);
            await pinStore.setGuard({ fails: 0, lockUntil: 0 });
            unlock();
            onSuccess();
          }
        } else if (phase === 'enter' && record.current) {
          const guard = await pinStore.getGuard();
          if (guard.lockUntil > Date.now()) {
            setLockUntil(guard.lockUntil);
            setNow(Date.now());
            return;
          }
          const ok = await verifyPin(pin, record.current);
          if (ok) {
            await pinStore.setGuard({ fails: 0, lockUntil: 0 });
            unlock();
            onSuccess();
          } else {
            const fails = guard.fails + 1;
            if (fails >= MAX_FAILS) {
              const until = Date.now() + LOCKOUT_MS;
              await pinStore.setGuard({ fails: 0, lockUntil: until });
              setLockUntil(until);
              setNow(Date.now());
              setMessage(null);
            } else {
              await pinStore.setGuard({ fails, lockUntil: 0 });
              setMessage(t('pin.wrong', { left: MAX_FAILS - fails }));
            }
          }
        }
      } catch (e) {
        setMessage(storageMessage(e));
      } finally {
        setEntry('');
        setBusy(false);
      }
    },
    [phase, first, t, unlock, onSuccess, storageMessage],
  );

  const press = (d: string) => {
    if (busy || locked || phase === 'loading') return;
    setEntry((prev) => {
      if (prev.length >= 4) return prev;
      const next = prev + d;
      if (next.length === 4) void submit(next);
      return next;
    });
  };
  const back = () => !busy && setEntry((p) => p.slice(0, -1));

  const supported = cryptoAvailable();
  const title = phase === 'confirm' ? t('pin.confirmTitle') : phase === 'enter' ? t('pin.enterTitle') : t('pin.createTitle');
  const sub = phase === 'confirm' ? t('pin.confirmSub') : phase === 'enter' ? t('pin.enterSub') : t('pin.createSub');
  const secondsLeft = Math.max(0, Math.ceil((lockUntil - now) / 1000));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md rounded-[2rem] border-card-border bg-card p-6 sm:p-8"
        onKeyDown={(e) => {
          if (/^[0-9]$/.test(e.key)) {
            e.preventDefault();
            press(e.key);
          } else if (e.key === 'Backspace') {
            e.preventDefault();
            back();
          }
        }}
      >
        <div className="flex flex-col items-center text-center">
          <span className="mb-3 grid size-14 place-items-center rounded-full bg-secondary text-secondary-foreground">
            <ShieldCheck className="size-7" aria-hidden />
          </span>
          <DialogTitle className="text-2xl font-extrabold">{title}</DialogTitle>
          <DialogDescription className="mt-1 text-base text-muted-foreground">{sub}</DialogDescription>
        </div>

        {!supported ? (
          <p role="alert" className="mt-4 rounded-2xl bg-coral p-4 text-center font-semibold text-coral-ink">
            {t('pin.cryptoUnsupported')}
          </p>
        ) : (
          <>
            <div className="my-5 flex justify-center gap-4" aria-live="polite" aria-label={t('pin.digitsEntered', { n: entry.length })}>
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={cn(
                    'size-5 rounded-full border-2 border-primary transition-colors',
                    i < entry.length ? 'bg-primary' : 'bg-transparent',
                  )}
                />
              ))}
            </div>
            <p role="alert" className="min-h-[1.75rem] text-center font-semibold text-destructive" data-testid="text-pin-message">
              {locked ? t('pin.locked', { s: secondsLeft }) : busy ? t('pin.checking') : message}
            </p>
            <div dir="ltr" className="mt-3 grid grid-cols-3 gap-3">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
                <KeyBtn key={d} onClick={() => press(d)} disabled={busy || locked} label={d} />
              ))}
              <span />
              <KeyBtn onClick={() => press('0')} disabled={busy || locked} label="0" />
              <button
                type="button"
                onClick={back}
                aria-label={t('pin.delete')}
                data-testid="button-pin-back"
                disabled={busy || locked}
                className="grid min-h-[72px] place-items-center rounded-2xl bg-muted text-foreground disabled:opacity-40"
              >
                <Delete className="size-7" aria-hidden />
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function KeyBtn({ label, onClick, disabled }: { label: string; onClick: () => void; disabled: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-testid={`button-pin-${label}`}
      className="min-h-[72px] rounded-2xl bg-secondary text-3xl font-extrabold text-secondary-foreground tabular-nums transition-colors hover:bg-secondary/70 disabled:opacity-40"
    >
      {label}
    </button>
  );
}
