import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import * as db from '@/lib/db';
import type { BodyConfig, Card, Lang, SentenceItem, Settings } from '@/lib/types';
import { stopAll } from '@/lib/speech';

interface AppStore {
  status: 'loading' | 'ready' | 'error';
  retry: () => void;
  settings: Settings;
  setLang: (lang: Lang) => Promise<void>;
  setVolume: (v: number) => Promise<void>;
  cards: Card[];
  saveCard: (card: Card) => Promise<void>;
  removeCard: (id: string) => Promise<void>;
  body: BodyConfig;
  saveBody: (body: BodyConfig) => Promise<void>;
  sentence: SentenceItem[];
  addToSentence: (item: SentenceItem) => void;
  removeLast: () => void;
  clearSentence: () => void;
  unlocked: boolean;
  unlock: () => void;
  lock: () => void;
  resetAll: () => Promise<void>;
}

const Ctx = createContext<AppStore | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AppStore['status']>('loading');
  const [attempt, setAttempt] = useState(0);
  const [settings, setSettings] = useState<Settings>(db.DEFAULT_SETTINGS);
  const [cards, setCards] = useState<Card[]>([]);
  const [body, setBody] = useState<BodyConfig>({ mode: 'avatar', hotspots: [] });
  const [sentence, setSentence] = useState<SentenceItem[]>([]);
  // Session-only: never persisted, so a reload always re-locks.
  const [unlocked, setUnlocked] = useState(false);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => {
    let alive = true;
    setStatus('loading');
    db.loadAll()
      .then((snap) => {
        if (!alive) return;
        setSettings(snap.settings);
        setCards(snap.cards);
        setBody(snap.body);
        setStatus('ready');
      })
      .catch(() => alive && setStatus('error'));
    return () => {
      alive = false;
    };
  }, [attempt]);

  const persistSettings = useCallback(async (next: Settings) => {
    await db.setKV('settings', next);
    setSettings(next);
  }, []);

  const setLang = useCallback((lang: Lang) => persistSettings({ ...settingsRef.current, lang }), [persistSettings]);
  const setVolume = useCallback((volume: number) => persistSettings({ ...settingsRef.current, volume }), [persistSettings]);

  const saveCard = useCallback(async (card: Card) => {
    await db.putCard(card);
    setCards((prev) => {
      const exists = prev.some((c) => c.id === card.id);
      const next = exists ? prev.map((c) => (c.id === card.id ? card : c)) : [...prev, card];
      return next.sort((a, b) => a.order - b.order);
    });
  }, []);

  const removeCard = useCallback(async (id: string) => {
    await db.deleteCard(id);
    setCards((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const saveBody = useCallback(async (next: BodyConfig) => {
    await db.setKV('body', next);
    setBody(next);
  }, []);

  const addToSentence = useCallback((item: SentenceItem) => setSentence((s) => [...s, item].slice(-12)), []);
  const removeLast = useCallback(() => setSentence((s) => s.slice(0, -1)), []);
  const clearSentence = useCallback(() => {
    stopAll();
    setSentence([]);
  }, []);

  const resetAll = useCallback(async () => {
    stopAll();
    const snap = await db.wipeAll();
    setSettings(snap.settings);
    setCards(snap.cards);
    setBody(snap.body);
    setSentence([]);
    setUnlocked(false);
  }, []);

  const value = useMemo<AppStore>(
    () => ({
      status,
      retry: () => setAttempt((a) => a + 1),
      settings,
      setLang,
      setVolume,
      cards,
      saveCard,
      removeCard,
      body,
      saveBody,
      sentence,
      addToSentence,
      removeLast,
      clearSentence,
      unlocked,
      unlock: () => setUnlocked(true),
      lock: () => setUnlocked(false),
      resetAll,
    }),
    [status, settings, setLang, setVolume, cards, saveCard, removeCard, body, saveBody, sentence, addToSentence, removeLast, clearSentence, unlocked, resetAll],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppStore(): AppStore {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAppStore outside provider');
  return v;
}
