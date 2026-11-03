import type { SentenceItem } from './types';

export const toneClasses: Record<SentenceItem['tone'], { bg: string; ink: string; ring: string }> = {
  core: { bg: 'bg-lilac', ink: 'text-lilac-ink', ring: 'ring-lilac-ink/35' },
  food: { bg: 'bg-apricot', ink: 'text-apricot-ink', ring: 'ring-apricot-ink/35' },
  personal: { bg: 'bg-sky', ink: 'text-sky-ink', ring: 'ring-sky-ink/35' },
  body: { bg: 'bg-sage', ink: 'text-sage-ink', ring: 'ring-sage-ink/35' },
  help: { bg: 'bg-coral', ink: 'text-coral-ink', ring: 'ring-coral-ink/35' },
};
