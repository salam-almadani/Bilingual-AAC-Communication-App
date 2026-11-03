import { useEffect, useRef, useState } from 'react';
import { Mic, Play, RotateCcw, Square, Trash2 } from 'lucide-react';
import { useAppStore } from '@/state/app-store';
import { useI18n } from '@/i18n';
import { micErrorKey, pickMimeType, recorderSupport, type MicErrorKey } from '@/lib/recorder';
import { playBlob, stopAll } from '@/lib/speech';
import type { Lang } from '@/lib/types';
import { cn } from '@/lib/utils';

const MAX_MS = 15_000;

/** Record / stop / play / re-record a short voice clip for one language. */
export function VoiceRecorder({
  lang,
  label,
  blob,
  onChange,
  testId,
}: {
  lang: Lang;
  label: string;
  blob?: Blob;
  onChange: (blob: Blob | undefined) => void;
  testId: string;
}) {
  const { settings } = useAppStore();
  const { t } = useI18n();
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<MicErrorKey | null>(null);
  const [seconds, setSeconds] = useState(0);
  const recRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunks = useRef<Blob[]>([]);
  const discard = useRef(false);
  const tick = useRef<number | undefined>(undefined);
  const limit = useRef<number | undefined>(undefined);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const support = recorderSupport();

  const releaseMic = () => {
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    streamRef.current = null;
    window.clearInterval(tick.current);
    window.clearTimeout(limit.current);
  };

  useEffect(
    () => () => {
      discard.current = true;
      if (recRef.current && recRef.current.state !== 'inactive') {
        try {
          recRef.current.stop();
        } catch {
          /* ignore */
        }
      }
      releaseMic();
    },
    [],
  );

  const start = async () => {
    setError(null);
    if (support !== 'ok') {
      setError(support === 'insecure' ? 'rec.insecure' : 'rec.unsupported');
      return;
    }
    stopAll();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      streamRef.current = stream;
      const mimeType = pickMimeType();
      const rec = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      chunks.current = [];
      discard.current = false;
      rec.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.current.push(e.data);
      };
      rec.onstop = () => {
        releaseMic();
        setRecording(false);
        recRef.current = null;
        if (discard.current) return;
        const type = rec.mimeType || mimeType || chunks.current[0]?.type || 'audio/webm';
        const out = new Blob(chunks.current, { type });
        chunks.current = [];
        if (out.size > 0) onChangeRef.current(out);
        else setError('rec.failed');
      };
      rec.onerror = () => {
        discard.current = true;
        setError('rec.failed');
        releaseMic();
        setRecording(false);
      };
      recRef.current = rec;
      rec.start();
      setRecording(true);
      setSeconds(0);
      const began = Date.now();
      tick.current = window.setInterval(() => setSeconds(Math.floor((Date.now() - began) / 1000)), 250);
      limit.current = window.setTimeout(() => stop(), MAX_MS);
    } catch (e) {
      releaseMic();
      setRecording(false);
      setError(micErrorKey(e));
    }
  };

  const stop = () => {
    const rec = recRef.current;
    if (rec && rec.state !== 'inactive') rec.stop();
    else releaseMic();
  };

  const play = () => {
    if (blob) playBlob(blob, settings.volume).catch(() => setError('rec.failed'));
  };

  const btn =
    'inline-flex min-h-[52px] items-center gap-2 rounded-full px-4 text-base font-bold transition-colors disabled:opacity-45';

  return (
    <div className="rounded-2xl border border-card-border bg-background/60 p-4" data-testid={testId}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="font-bold">{label}</span>
        <span lang={lang} className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          {lang}
        </span>
      </div>
      <p className={cn('mb-3 text-sm', blob ? 'font-semibold text-primary' : 'text-muted-foreground')} aria-live="polite">
        {recording ? `${t('rec.recording')} ${seconds}s` : blob ? t('rec.has') : t('rec.none')}
      </p>
      <div className="flex flex-wrap gap-2">
        {recording ? (
          <button type="button" onClick={stop} className={cn(btn, 'bg-coral text-coral-ink')} data-testid={`${testId}-stop`}>
            <Square className="size-4 fill-current" aria-hidden /> {t('rec.stop')}
          </button>
        ) : (
          <button
            type="button"
            onClick={start}
            className={cn(btn, 'bg-primary text-primary-foreground')}
            data-testid={`${testId}-record`}
          >
            {blob ? <RotateCcw className="size-4" aria-hidden /> : <Mic className="size-4" aria-hidden />}
            {blob ? t('rec.rerecord') : t('rec.record')}
          </button>
        )}
        <button type="button" onClick={play} disabled={!blob || recording} className={cn(btn, 'bg-secondary text-secondary-foreground')} data-testid={`${testId}-play`}>
          <Play className="size-4" aria-hidden /> {t('rec.play')}
        </button>
        <button
          type="button"
          onClick={() => onChange(undefined)}
          disabled={!blob || recording}
          aria-label={t('rec.remove')}
          title={t('rec.remove')}
          className={cn(btn, 'bg-muted text-muted-foreground')}
          data-testid={`${testId}-remove`}
        >
          <Trash2 className="size-4" aria-hidden />
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-3 rounded-xl bg-coral/70 px-3 py-2 text-sm font-semibold text-coral-ink">
          {t(error)}
        </p>
      )}
    </div>
  );
}
