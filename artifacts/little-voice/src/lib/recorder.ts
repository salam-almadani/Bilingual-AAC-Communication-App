const CANDIDATES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/mp4;codecs=mp4a.40.2',
  'audio/mp4',
  'audio/ogg;codecs=opus',
  'audio/aac',
];

export type RecorderSupport = 'ok' | 'unsupported' | 'insecure';

export function recorderSupport(): RecorderSupport {
  if (typeof window === 'undefined') return 'unsupported';
  if (!window.isSecureContext) return 'insecure';
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') return 'unsupported';
  return 'ok';
}

/** Best supported MIME type, or '' to let the browser choose its default. */
export function pickMimeType(): string {
  if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') return '';
  return CANDIDATES.find((m) => MediaRecorder.isTypeSupported(m)) ?? '';
}

export type MicErrorKey = 'rec.denied' | 'rec.noMic' | 'rec.failed' | 'rec.unsupported' | 'rec.insecure';

export function micErrorKey(err: unknown): MicErrorKey {
  const name = (err as DOMException | null)?.name ?? '';
  if (name === 'NotAllowedError' || name === 'SecurityError' || name === 'PermissionDeniedError') return 'rec.denied';
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError' || name === 'OverconstrainedError') return 'rec.noMic';
  if (name === 'NotSupportedError') return 'rec.unsupported';
  return 'rec.failed';
}
