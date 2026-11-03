import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function TextField({
  label,
  id,
  className,
  ...rest
}: { label: string; id: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1.5 block text-sm font-bold text-muted-foreground">{label}</span>
      <input
        id={id}
        {...rest}
        className={cn(
          'min-h-[56px] w-full rounded-2xl border-2 border-input bg-card px-4 text-lg font-semibold text-foreground outline-none transition-colors focus:border-primary',
          className,
        )}
      />
    </label>
  );
}
