import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { en, type TKey } from './en';
import { ar } from './ar';
import type { Lang } from '@/lib/types';
import { useAppStore } from '@/state/app-store';
import { StorageError } from '@/lib/db';

const dicts = { en, ar } as const;

type Vars = Record<string, string | number>;

interface I18n {
  lang: Lang;
  dir: 'ltr' | 'rtl';
  t: (key: TKey, vars?: Vars) => string;
  /** Translate in a specific language (used for bilingual speech/sentences). */
  tIn: (lang: Lang, key: TKey, vars?: Vars) => string;
  pick: (en: string, ar: string) => string;
  storageMessage: (err: unknown) => string;
}

const Ctx = createContext<I18n | null>(null);

const fmt = (s: string, vars?: Vars) => (vars ? s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? '')) : s);

export function I18nProvider({ children }: { children: ReactNode }) {
  const { settings } = useAppStore();
  const lang = settings.lang;
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const tIn = useCallback((l: Lang, key: TKey, vars?: Vars) => fmt(dicts[l][key] ?? en[key], vars), []);
  const t = useCallback((key: TKey, vars?: Vars) => tIn(lang, key, vars), [lang, tIn]);

  const value = useMemo<I18n>(
    () => ({
      lang,
      dir,
      t,
      tIn,
      pick: (e, a) => (lang === 'ar' ? a || e : e || a),
      storageMessage: (err) => {
        const kind = err instanceof StorageError ? err.kind : 'failed';
        return t(kind === 'quota' ? 'storage.quota' : kind === 'unavailable' ? 'storage.unavailable' : 'storage.failed');
      },
    }),
    [lang, dir, t, tIn],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): I18n {
  const v = useContext(Ctx);
  if (!v) throw new Error('useI18n outside provider');
  return v;
}

export type { TKey };
