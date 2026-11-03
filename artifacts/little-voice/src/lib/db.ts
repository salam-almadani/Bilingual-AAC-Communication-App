import type { BodyConfig, Card, PinGuard, PinRecord, Settings } from './types';
import { defaultBody, defaultCards } from './defaults';

const DB_NAME = 'little-voice';
const DB_VERSION = 1;
const CARDS = 'cards';
const KV = 'kv';

export type StorageErrorKind = 'quota' | 'unavailable' | 'failed';

export class StorageError extends Error {
  kind: StorageErrorKind;
  constructor(kind: StorageErrorKind, message?: string) {
    super(message ?? kind);
    this.kind = kind;
  }
}

function classify(err: unknown): StorageError {
  if (err instanceof StorageError) return err;
  const name = (err as DOMException | null)?.name ?? '';
  if (name === 'QuotaExceededError') return new StorageError('quota');
  if (name === 'InvalidStateError' || name === 'SecurityError') return new StorageError('unavailable');
  return new StorageError('failed', (err as Error | null)?.message);
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new StorageError('unavailable'));
      return;
    }
    let req: IDBOpenDBRequest;
    try {
      req = indexedDB.open(DB_NAME, DB_VERSION);
    } catch (e) {
      reject(classify(e));
      return;
    }
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(CARDS)) db.createObjectStore(CARDS, { keyPath: 'id' });
      if (!db.objectStoreNames.contains(KV)) db.createObjectStore(KV);
    };
    req.onsuccess = () => {
      const db = req.result;
      db.onversionchange = () => {
        db.close();
        dbPromise = null;
      };
      resolve(db);
    };
    req.onerror = () => reject(classify(req.error));
    req.onblocked = () => reject(new StorageError('unavailable'));
  }).catch((e) => {
    dbPromise = null;
    throw e;
  });
  return dbPromise;
}

/** Runs work inside a transaction; resolves only after the transaction commits. */
async function run<T>(
  stores: string[],
  mode: IDBTransactionMode,
  work: (tx: IDBTransaction) => IDBRequest<T> | void,
): Promise<T | undefined> {
  const db = await openDb();
  return new Promise<T | undefined>((resolve, reject) => {
    let tx: IDBTransaction;
    try {
      tx = db.transaction(stores, mode);
    } catch (e) {
      reject(classify(e));
      return;
    }
    let result: T | undefined;
    try {
      const req = work(tx);
      if (req) req.onsuccess = () => (result = req.result);
    } catch (e) {
      try {
        tx.abort();
      } catch {
        /* already finished */
      }
      reject(classify(e));
      return;
    }
    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(classify(tx.error));
    tx.onabort = () => reject(classify(tx.error ?? new DOMException('aborted', 'AbortError')));
  });
}

export async function getAllCards(): Promise<Card[]> {
  const res = await run<Card[]>([CARDS], 'readonly', (tx) => tx.objectStore(CARDS).getAll());
  return (res ?? []).sort((a, b) => a.order - b.order);
}

export async function putCard(card: Card): Promise<void> {
  await run([CARDS], 'readwrite', (tx) => tx.objectStore(CARDS).put(card));
}

export async function deleteCard(id: string): Promise<void> {
  await run([CARDS], 'readwrite', (tx) => tx.objectStore(CARDS).delete(id));
}

export async function getKV<T>(key: string): Promise<T | undefined> {
  return run<T>([KV], 'readonly', (tx) => tx.objectStore(KV).get(key) as IDBRequest<T>);
}

export async function setKV<T>(key: string, value: T): Promise<void> {
  await run([KV], 'readwrite', (tx) => tx.objectStore(KV).put(value, key));
}

export async function deleteKV(key: string): Promise<void> {
  await run([KV], 'readwrite', (tx) => tx.objectStore(KV).delete(key));
}

export const DEFAULT_SETTINGS: Settings = { lang: 'en', volume: 0.85 };

export interface Snapshot {
  settings: Settings;
  cards: Card[];
  body: BodyConfig;
}

/** Seed defaults on first run (single transaction) and load everything. */
export async function loadAll(): Promise<Snapshot> {
  const seeded = await getKV<boolean>('seeded');
  if (!seeded) await seedDefaults(DEFAULT_SETTINGS);
  const [settings, cards, body] = await Promise.all([
    getKV<Settings>('settings'),
    getAllCards(),
    getKV<BodyConfig>('body'),
  ]);
  return {
    settings: { ...DEFAULT_SETTINGS, ...(settings ?? {}) },
    cards,
    body: body ?? defaultBody(),
  };
}

async function seedDefaults(settings: Settings): Promise<void> {
  await run([CARDS, KV], 'readwrite', (tx) => {
    const cards = tx.objectStore(CARDS);
    for (const c of defaultCards()) cards.put(c);
    const kv = tx.objectStore(KV);
    kv.put(settings, 'settings');
    kv.put(defaultBody(), 'body');
    kv.put(true, 'seeded');
  });
}

/** Wipes every store, then reseeds defaults. */
export async function wipeAll(): Promise<Snapshot> {
  await run([CARDS, KV], 'readwrite', (tx) => {
    tx.objectStore(CARDS).clear();
    tx.objectStore(KV).clear();
  });
  await seedDefaults(DEFAULT_SETTINGS);
  return loadAll();
}

export const pinStore = {
  get: () => getKV<PinRecord>('pin'),
  set: (rec: PinRecord) => setKV('pin', rec),
  getGuard: async () => (await getKV<PinGuard>('pinGuard')) ?? { fails: 0, lockUntil: 0 },
  setGuard: (g: PinGuard) => setKV('pinGuard', g),
};
