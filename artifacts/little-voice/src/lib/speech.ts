import type { Lang, SpeakPart } from './types';

export type VoiceIssue = 'speechUnsupported' | 'noVoice' | 'playFailed';

class VoiceError extends Error {
  issue: VoiceIssue;
  constructor(issue: VoiceIssue) {
    super(issue);
    this.issue = issue;
  }
}

let currentAudio: HTMLAudioElement | null = null;
let currentUrl: string | null = null;
let generation = 0;

function releaseAudio() {
  if (currentAudio) {
    currentAudio.onended = null;
    currentAudio.onerror = null;
    currentAudio.pause();
  }
  if (currentUrl) URL.revokeObjectURL(currentUrl);
  currentAudio = null;
  currentUrl = null;
}

export function stopAll() {
  generation++;
  releaseAudio();
  if (speechSupported()) window.speechSynthesis.cancel();
}

export function speechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

export function playBlob(blob: Blob, volume: number): Promise<void> {
  return new Promise((resolve, reject) => {
    releaseAudio();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.volume = Math.min(1, Math.max(0, volume));
    currentAudio = audio;
    currentUrl = url;
    const done = (ok: boolean) => {
      if (currentAudio === audio) releaseAudio();
      else URL.revokeObjectURL(url);
      if (ok) resolve();
      else reject(new VoiceError('playFailed'));
    };
    audio.onended = () => done(true);
    audio.onerror = () => done(false);
    audio.play().catch(() => done(false));
  });
}

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  const synth = window.speechSynthesis;
  const now = synth.getVoices();
  if (now.length) return Promise.resolve(now);
  return new Promise((resolve) => {
    const timer = window.setTimeout(() => resolve(synth.getVoices()), 1200);
    synth.addEventListener(
      'voiceschanged',
      () => {
        window.clearTimeout(timer);
        resolve(synth.getVoices());
      },
      { once: true },
    );
  });
}

export async function speakText(text: string, lang: Lang, volume: number): Promise<void> {
  if (!speechSupported()) throw new VoiceError('speechUnsupported');
  const voices = await loadVoices();
  const match = voices.find((v) => v.lang.toLowerCase().startsWith(lang));
  if (voices.length > 0 && !match) throw new VoiceError('noVoice');
  return new Promise((resolve, reject) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
    if (match) u.voice = match;
    u.volume = Math.min(1, Math.max(0, volume));
    u.rate = 0.9;
    u.onend = () => resolve();
    u.onerror = (e) => {
      if (e.error === 'interrupted' || e.error === 'canceled') resolve();
      else reject(new VoiceError(e.error === 'language-unavailable' || e.error === 'voice-unavailable' ? 'noVoice' : 'speechUnsupported'));
    };
    window.speechSynthesis.speak(u);
  });
}

/** Plays a recorded blob when present, falling back to device speech. Returns the first issue met, if any. */
async function sayPart(part: SpeakPart, lang: Lang, volume: number): Promise<VoiceIssue | null> {
  let issue: VoiceIssue | null = null;
  if (part.blob) {
    try {
      await playBlob(part.blob, volume);
      return null;
    } catch {
      issue = 'playFailed';
    }
  }
  if (!part.text.trim()) return issue;
  try {
    await speakText(part.text, lang, volume);
  } catch (e) {
    return e instanceof VoiceError ? e.issue : 'speechUnsupported';
  }
  return issue;
}

/** Speaks parts in order. A newer call cancels an older sequence. */
export async function sayParts(parts: SpeakPart[], lang: Lang, volume: number): Promise<VoiceIssue | null> {
  stopAll();
  const mine = generation;
  let first: VoiceIssue | null = null;
  for (const p of parts) {
    if (mine !== generation) break;
    const issue = await sayPart(p, lang, volume);
    if (issue && !first) first = issue;
    if (issue === 'speechUnsupported' || issue === 'noVoice') {
      // keep going: later parts may have recordings
    }
    if (mine !== generation) break;
    await new Promise((r) => setTimeout(r, 140));
  }
  return first;
}
