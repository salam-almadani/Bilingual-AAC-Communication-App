import type { Card, Hotspot, Lang, SentenceItem } from './types';
import { uid } from './types';
import type { TKey } from '@/i18n/en';

type TIn = (lang: Lang, key: TKey, vars?: Record<string, string | number>) => string;

export function cardToItem(card: Card): SentenceItem {
  return {
    uid: uid(),
    labelEn: card.labelEn || card.labelAr,
    labelAr: card.labelAr || card.labelEn,
    emoji: card.emoji,
    image: card.image,
    wantable: card.category !== 'core',
    tone: card.category,
    parts: {
      en: [{ text: card.labelEn || card.labelAr, blob: card.audioEn }],
      ar: [{ text: card.labelAr || card.labelEn, blob: card.audioAr }],
    },
  };
}

export function painItem(h: Hotspot, tIn: TIn): SentenceItem {
  const en = h.nameEn || h.nameAr;
  const ar = h.nameAr || h.nameEn;
  return {
    uid: uid(),
    labelEn: tIn('en', 'hurts', { part: en }),
    labelAr: tIn('ar', 'hurts', { part: ar }),
    wantable: false,
    tone: 'body',
    parts: {
      en: [{ text: tIn('en', 'hurtsPrefix') }, { text: en, blob: h.audioEn }],
      ar: [{ text: tIn('ar', 'hurtsPrefix') }, { text: ar, blob: h.audioAr }],
    },
  };
}

export const PAIN_KEYS: TKey[] = ['pain0', 'pain1', 'pain2', 'pain3'];

export function severityItem(level: number, tIn: TIn): SentenceItem {
  const key = PAIN_KEYS[level];
  return {
    uid: uid(),
    labelEn: tIn('en', key),
    labelAr: tIn('ar', key),
    wantable: false,
    tone: 'body',
    parts: { en: [{ text: tIn('en', key) }], ar: [{ text: tIn('ar', key) }] },
  };
}

export function helpItem(tIn: TIn): SentenceItem {
  return {
    uid: uid(),
    labelEn: tIn('en', 'needHelp'),
    labelAr: tIn('ar', 'needHelp'),
    wantable: false,
    tone: 'help',
    parts: { en: [{ text: tIn('en', 'needHelp') }], ar: [{ text: tIn('ar', 'needHelp') }] },
  };
}

/** "I want" is spoken before a run of wantable items (start of sentence or after a non-wantable one). */
export function sentenceParts(items: SentenceItem[], lang: Lang, tIn: TIn) {
  const parts: { text: string; blob?: Blob }[] = [];
  items.forEach((item, i) => {
    const prev = items[i - 1];
    if (item.wantable && (!prev || !prev.wantable)) parts.push({ text: tIn(lang, 'iWant') });
    parts.push(...item.parts[lang]);
  });
  return parts;
}
