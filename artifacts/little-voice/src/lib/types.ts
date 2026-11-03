export type Lang = 'en' | 'ar';
export type Category = 'core' | 'food' | 'personal';
export const CATEGORIES: Category[] = ['core', 'food', 'personal'];

export interface Card {
  id: string;
  category: Category;
  labelEn: string;
  labelAr: string;
  emoji?: string;
  image?: Blob;
  audioEn?: Blob;
  audioAr?: Blob;
  order: number;
}

export interface Hotspot {
  id: string;
  /** center, percent of figure width */
  x: number;
  /** center, percent of figure height */
  y: number;
  /** radius, percent of figure width */
  r: number;
  nameEn: string;
  nameAr: string;
  audioEn?: Blob;
  audioAr?: Blob;
}

export interface BodyConfig {
  mode: 'avatar' | 'photo';
  photo?: Blob;
  hotspots: Hotspot[];
}

export interface Settings {
  lang: Lang;
  volume: number;
}

export interface PinRecord {
  salt: string;
  hash: string;
  iterations: number;
}

export interface PinGuard {
  fails: number;
  lockUntil: number;
}

export interface SpeakPart {
  text: string;
  blob?: Blob;
}

export interface SentenceItem {
  uid: string;
  labelEn: string;
  labelAr: string;
  emoji?: string;
  image?: Blob;
  /** item is an object a child can "want" — triggers the I want preface */
  wantable: boolean;
  tone: 'core' | 'food' | 'personal' | 'body' | 'help';
  parts: Record<Lang, SpeakPart[]>;
}

export const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
