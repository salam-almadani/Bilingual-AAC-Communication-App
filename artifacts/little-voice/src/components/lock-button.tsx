import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAppStore } from '@/state/app-store';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';
import { PinDialog } from './pin-dialog';

const HOLD_MS = 2000;

/** Small caregiver lock: requires a 2-second press-and-hold (pointer or Enter/Space). */
export function LockButton({ className }: { className?: string }) {
  const { unlocked } = useAppStore();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [holding, setHolding] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const cancel = () => {
    window.clearTimeout(timer.current);
    setHolding(false);
  };
  const start = () => {
    window.clearTimeout(timer.current);
    setHolding(true);
    timer.current = window.setTimeout(() => {
      setHolding(false);
      if (unlocked) navigate('/caregiver');
      else setPinOpen(true);
    }, HOLD_MS);
  };
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const C = 2 * Math.PI * 22;
  return (
    <>
      <button
        type="button"
        aria-label={t('lockAria')}
        title={t('lockAria')}
        data-testid="button-caregiver-lock"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture?.(e.pointerId);
          start();
        }}
        onPointerUp={cancel}
        onPointerCancel={cancel}
        onPointerLeave={cancel}
        onContextMenu={(e) => e.preventDefault()}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) {
            e.preventDefault();
            start();
          }
        }}
        onKeyUp={(e) => {
          if (e.key === 'Enter' || e.key === ' ') cancel();
        }}
        onBlur={cancel}
        className={cn(
          'relative grid size-12 touch-none select-none place-items-center rounded-full text-muted-foreground/80 hover:text-foreground',
          className,
        )}
      >
        <svg viewBox="0 0 48 48" className="absolute inset-0 size-12 -rotate-90" aria-hidden>
          <circle cx="24" cy="24" r="22" fill="none" stroke="hsl(var(--border))" strokeWidth="2" />
          <circle
            cx="24"
            cy="24"
            r="22"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={holding ? 0 : C}
            style={{ transition: holding ? `stroke-dashoffset ${HOLD_MS}ms linear` : 'stroke-dashoffset 150ms ease-out' }}
          />
        </svg>
        <Lock className="size-4" aria-hidden />
        {holding && (
          <span role="status" className="absolute top-full mt-1 whitespace-nowrap rounded-full bg-card px-3 py-1 text-xs font-bold text-foreground shadow-sm">
            {t('holdHint')}
          </span>
        )}
      </button>
      <PinDialog
        open={pinOpen}
        onOpenChange={setPinOpen}
        onSuccess={() => {
          setPinOpen(false);
          navigate('/caregiver');
        }}
      />
    </>
  );
}
