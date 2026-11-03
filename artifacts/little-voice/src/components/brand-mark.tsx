/** Little Voice mark: two overlapping speech pebbles — the child's and the caregiver's. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 96" className={className} aria-hidden="true">
      <path
        d="M58 14c15.5 0 28 10.7 28 24s-12.5 24-28 24c-2.6 0-5.1-.3-7.5-.9L40 68l2.7-11.2C35.1 52.4 30 45.7 30 38c0-13.3 12.5-24 28-24Z"
        fill="hsl(var(--lilac))"
        stroke="hsl(var(--lilac-ink))"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M36 34c13.3 0 24 9.4 24 21s-10.7 21-24 21c-2.3 0-4.5-.3-6.6-.8L18 82l2.9-11.6C15.4 66.6 12 61.1 12 55c0-11.6 10.7-21 24-21Z"
        fill="hsl(var(--apricot))"
        stroke="hsl(var(--apricot-ink))"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <circle cx="28" cy="55" r="3" fill="hsl(var(--apricot-ink))" />
      <circle cx="44" cy="55" r="3" fill="hsl(var(--apricot-ink))" />
      <path d="M30 63c3.5 3 8.5 3 12 0" stroke="hsl(var(--apricot-ink))" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}
