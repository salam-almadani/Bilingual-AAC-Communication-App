import { useRef, useState } from 'react';
import { Camera, ImageUp, Loader2, X } from 'lucide-react';
import { useI18n } from '@/i18n';
import { compressImage } from '@/lib/image';
import { cn } from '@/lib/utils';

/** Upload or camera-capture a photo, compressed locally into a Blob. */
export function PhotoPicker({
  hasPhoto,
  onPicked,
  onRemove,
  maxSide,
  testId,
  uploadLabel,
  cameraLabel,
}: {
  hasPhoto: boolean;
  onPicked: (blob: Blob) => void;
  onRemove?: () => void;
  maxSide?: number;
  testId: string;
  uploadLabel?: string;
  cameraLabel?: string;
}) {
  const { t } = useI18n();
  const upload = useRef<HTMLInputElement>(null);
  const camera = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  const handle = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    setError(false);
    try {
      onPicked(await compressImage(file, maxSide));
    } catch {
      setError(true);
    } finally {
      setBusy(false);
      if (upload.current) upload.current.value = '';
      if (camera.current) camera.current.value = '';
    }
  };

  const btn = 'inline-flex min-h-[52px] items-center gap-2 rounded-full px-4 text-base font-bold disabled:opacity-45';
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={busy} onClick={() => upload.current?.click()} className={cn(btn, 'bg-sky text-sky-ink')} data-testid={`${testId}-upload`}>
          {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <ImageUp className="size-4" aria-hidden />}
          {uploadLabel ?? t('editor.upload')}
        </button>
        <button type="button" disabled={busy} onClick={() => camera.current?.click()} className={cn(btn, 'bg-apricot text-apricot-ink')} data-testid={`${testId}-camera`}>
          <Camera className="size-4" aria-hidden />
          {cameraLabel ?? t('editor.camera')}
        </button>
        {hasPhoto && onRemove && (
          <button type="button" onClick={onRemove} className={cn(btn, 'bg-muted text-muted-foreground')} data-testid={`${testId}-remove`}>
            <X className="size-4" aria-hidden /> {t('editor.removePhoto')}
          </button>
        )}
      </div>
      <input ref={upload} type="file" accept="image/*" hidden onChange={(e) => handle(e.target.files?.[0])} />
      <input ref={camera} type="file" accept="image/*" capture="environment" hidden onChange={(e) => handle(e.target.files?.[0])} />
      {busy && <p className="mt-2 text-sm text-muted-foreground" role="status">{t('editor.processing')}</p>}
      {error && (
        <p role="alert" className="mt-2 rounded-xl bg-coral/70 px-3 py-2 text-sm font-semibold text-coral-ink">
          {t('editor.imageFailed')}
        </p>
      )}
    </div>
  );
}
