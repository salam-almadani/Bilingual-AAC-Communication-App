import type { ReactNode, Ref } from 'react';
import { useObjectUrl } from '@/hooks/use-object-url';
import { useI18n } from '@/i18n';
import type { BodyConfig } from '@/lib/types';
import { cn } from '@/lib/utils';

/** Neutral, featureless figure. viewBox 200×400 so hotspot % coordinates line up with the default places. */
export function NeutralAvatar({ className }: { className?: string }) {
  const fill = 'hsl(var(--sage))';
  const stroke = 'hsl(var(--sage-ink) / 0.45)';
  return (
    <svg viewBox="0 0 200 400" className={cn('block h-auto w-full', className)} aria-hidden>
      <g fill={fill} stroke={stroke} strokeWidth="2.5" strokeLinejoin="round">
        <rect x="58" y="226" width="34" height="140" rx="17" />
        <rect x="108" y="226" width="34" height="140" rx="17" />
        <ellipse cx="74" cy="374" rx="24" ry="13" />
        <ellipse cx="126" cy="374" rx="24" ry="13" />
        <rect x="32" y="112" width="28" height="118" rx="14" transform="rotate(6 46 112)" />
        <rect x="140" y="112" width="28" height="118" rx="14" transform="rotate(-6 154 112)" />
        <circle cx="42" cy="236" r="15" />
        <circle cx="158" cy="236" r="15" />
        <rect x="54" y="104" width="92" height="150" rx="34" />
        <rect x="86" y="88" width="28" height="24" rx="10" />
        <circle cx="100" cy="54" r="40" />
      </g>
    </svg>
  );
}

export function BodyFigure({
  body,
  children,
  overlayRef,
  onOverlayPointerDown,
  className,
}: {
  body: BodyConfig;
  children?: ReactNode;
  overlayRef?: Ref<HTMLDivElement>;
  onOverlayPointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
  className?: string;
}) {
  const { t } = useI18n();
  const url = useObjectUrl(body.mode === 'photo' ? body.photo : undefined);
  const usePhoto = body.mode === 'photo' && body.photo && url;
  return (
    <div className={cn('relative mx-auto w-full select-none', className)}>
      {usePhoto ? (
        <img src={url} alt={t('body.figureAlt')} className="block h-auto w-full rounded-[1.5rem]" draggable={false} />
      ) : (
        <NeutralAvatar />
      )}
      <div
        ref={overlayRef}
        className="absolute inset-0 touch-none"
        onPointerDown={onOverlayPointerDown}
        data-testid="body-overlay"
      >
        {children}
      </div>
    </div>
  );
}
