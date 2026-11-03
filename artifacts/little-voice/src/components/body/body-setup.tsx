import { useEffect, useRef, useState } from 'react';
import { Mic, Pencil, RotateCcw, ShieldCheck, UserRound, Image as ImageIcon } from 'lucide-react';
import { useAppStore } from '@/state/app-store';
import { useI18n } from '@/i18n';
import { useToast } from '@/hooks/use-toast';
import { defaultHotspots } from '@/lib/defaults';
import { uid, type BodyConfig, type Hotspot } from '@/lib/types';
import { cn } from '@/lib/utils';
import { PhotoPicker } from '../caregiver/photo-picker';
import { BodyFigure } from './body-figure';
import { HotspotEditor } from './hotspot-editor';

type Drag = { id: string; mode: 'move' | 'resize'; startX: number; startY: number; moved: boolean };

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export function BodySetup() {
  const { body, saveBody } = useAppStore();
  const { t, pick, storageMessage } = useI18n();
  const { toast } = useToast();
  const [spots, setSpots] = useState<Hotspot[]>(body.hotspots);
  const [editing, setEditing] = useState<Hotspot | null>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const spotsRef = useRef(spots);
  spotsRef.current = spots;

  // Follow persisted state unless a drag is in progress.
  useEffect(() => {
    if (!drag.current) setSpots(body.hotspots);
  }, [body.hotspots]);

  const persist = async (next: Partial<BodyConfig>): Promise<boolean> => {
    try {
      await saveBody({ ...body, hotspots: spotsRef.current, ...next });
      return true;
    } catch (e) {
      toast({ title: storageMessage(e), variant: 'destructive' });
      setSpots(body.hotspots);
      return false;
    }
  };

  const pct = (clientX: number, clientY: number) => {
    const r = overlay.current!.getBoundingClientRect();
    return { x: ((clientX - r.left) / r.width) * 100, y: ((clientY - r.top) / r.height) * 100, w: r.width };
  };

  const addAt = async (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.target !== overlay.current) return;
    const { x, y } = pct(e.clientX, e.clientY);
    const h: Hotspot = { id: uid(), x: clamp(x, 0, 100), y: clamp(y, 0, 100), r: 8, nameEn: '', nameAr: '' };
    const next = [...spotsRef.current, h];
    setSpots(next);
    spotsRef.current = next;
    if (await persist({ hotspots: next })) setEditing(h);
  };

  const onDown = (e: React.PointerEvent, id: string, mode: Drag['mode']) => {
    e.stopPropagation();
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { id, mode, startX: e.clientX, startY: e.clientY, moved: false };
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    if (Math.abs(e.clientX - d.startX) + Math.abs(e.clientY - d.startY) > 5) d.moved = true;
    if (!d.moved) return;
    const p = pct(e.clientX, e.clientY);
    setSpots((prev) =>
      prev.map((h) => {
        if (h.id !== d.id) return h;
        if (d.mode === 'move') return { ...h, x: clamp(p.x, 0, 100), y: clamp(p.y, 0, 100) };
        const r = overlay.current!.getBoundingClientRect();
        const cx = (h.x / 100) * r.width;
        const cy = (h.y / 100) * r.height;
        const dist = Math.hypot(e.clientX - r.left - cx, e.clientY - r.top - cy);
        return { ...h, r: clamp((dist / r.width) * 100 / Math.SQRT2, 3, 30) };
      }),
    );
  };
  const onUp = (id: string) => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (d.moved) void persist({});
    else if (d.mode === 'move') setEditing(spotsRef.current.find((h) => h.id === id) ?? null);
  };

  const saveSpot = (h: Hotspot) => {
    const next = spotsRef.current.map((s) => (s.id === h.id ? h : s));
    setSpots(next);
    spotsRef.current = next;
    return persist({ hotspots: next });
  };
  const deleteSpot = (id: string) => {
    const next = spotsRef.current.filter((s) => s.id !== id);
    setSpots(next);
    spotsRef.current = next;
    return persist({ hotspots: next });
  };

  const view: BodyConfig = { ...body, hotspots: spots };
  const modeBtn = (on: boolean) =>
    cn('inline-flex min-h-[60px] flex-1 items-center justify-center gap-2 rounded-[1.2rem] text-lg font-extrabold', on ? 'bg-card shadow-sm' : 'text-muted-foreground');

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(280px,420px)_1fr]">
      <div className="rounded-[2rem] border border-card-border bg-card p-4 shadow-sm sm:p-6">
        <BodyFigure
          body={view}
          overlayRef={overlay}
          onOverlayPointerDown={addAt}
          className="max-w-[360px] cursor-crosshair"
        >
          {spots.map((h) => {
            const name = pick(h.nameEn, h.nameAr) || t('body.newPart');
            return (
              <div
                key={h.id}
                style={{ left: `${h.x}%`, top: `${h.y}%`, width: `${h.r * 2}%` }}
                className="absolute aspect-square -translate-x-1/2 -translate-y-1/2"
              >
                <button
                  type="button"
                  aria-label={`${t('cards.edit')} ${name}`}
                  onPointerDown={(e) => onDown(e, h.id, 'move')}
                  onPointerMove={onMove}
                  onPointerUp={() => onUp(h.id)}
                  onKeyDown={(e) => e.key === 'Enter' && setEditing(h)}
                  data-testid={`setup-hotspot-${h.id}`}
                  className="absolute inset-0 cursor-grab touch-none rounded-full border-[3px] border-primary/70 bg-primary/15 active:cursor-grabbing"
                />
                <span className="pointer-events-none absolute left-1/2 top-full mt-0.5 -translate-x-1/2 whitespace-nowrap rounded-full bg-card/95 px-2 py-0.5 text-xs font-bold shadow-sm">
                  {name}
                </span>
                <button
                  type="button"
                  aria-label={t('body.resize', { name })}
                  onPointerDown={(e) => onDown(e, h.id, 'resize')}
                  onPointerMove={onMove}
                  onPointerUp={() => onUp(h.id)}
                  className="absolute -bottom-2 -right-2 size-6 touch-none rounded-full border-[3px] border-card bg-primary shadow-sm"
                  data-testid={`resize-hotspot-${h.id}`}
                />
              </div>
            );
          })}
        </BodyFigure>
        <p className="mt-4 text-center text-sm text-muted-foreground">{t('body.tapToAdd')}</p>
      </div>

      <div className="space-y-5">
        <section className="rounded-[2rem] border border-card-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-extrabold">{t('body.title')}</h2>
          <p className="mt-1 text-muted-foreground">{t('body.sub')}</p>
          <div className="mt-4 flex gap-2 rounded-[1.5rem] bg-muted p-1.5" role="radiogroup">
            <button type="button" role="radio" aria-checked={body.mode === 'avatar'} onClick={() => persist({ mode: 'avatar' })} className={modeBtn(body.mode === 'avatar')} data-testid="radio-body-avatar">
              <UserRound className="size-5" aria-hidden /> {t('body.modeAvatar')}
            </button>
            <button type="button" role="radio" aria-checked={body.mode === 'photo'} onClick={() => persist({ mode: 'photo' })} className={modeBtn(body.mode === 'photo')} data-testid="radio-body-photo">
              <ImageIcon className="size-5" aria-hidden /> {t('body.modePhoto')}
            </button>
          </div>
          {body.mode === 'photo' && (
            <div className="mt-5 space-y-4">
              <p className="flex items-start gap-3 rounded-2xl bg-sage/60 p-4 font-semibold text-sage-ink">
                <ShieldCheck className="mt-0.5 size-5 shrink-0" aria-hidden /> {t('body.privacy')}
              </p>
              {!body.photo && <p className="text-muted-foreground">{t('body.noPhoto')}</p>}
              <PhotoPicker
                testId="body-photo"
                maxSide={1200}
                hasPhoto={!!body.photo}
                uploadLabel={t('body.uploadPhoto')}
                cameraLabel={t('body.takePhoto')}
                onPicked={(photo) => void persist({ photo, mode: 'photo' })}
                onRemove={() => void persist({ photo: undefined })}
              />
            </div>
          )}
        </section>

        <section className="rounded-[2rem] border border-card-border bg-card p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-extrabold">{t('body.parts')}</h2>
            <button
              type="button"
              onClick={async () => {
                const next = defaultHotspots();
                setSpots(next);
                spotsRef.current = next;
                if (await persist({ hotspots: next })) toast({ title: t('body.resetDone') });
              }}
              className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-muted px-4 font-bold text-muted-foreground"
              data-testid="button-reset-hotspots"
            >
              <RotateCcw className="size-4" aria-hidden /> {t('body.resetDefaults')}
            </button>
          </div>
          {spots.length === 0 ? (
            <p className="mt-4 text-muted-foreground">{t('body.tapToAdd')}</p>
          ) : (
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {spots.map((h) => (
                <li key={h.id}>
                  <button
                    type="button"
                    onClick={() => setEditing(h)}
                    className="flex min-h-[60px] w-full items-center gap-3 rounded-2xl bg-background/70 px-4 text-start font-bold hover:bg-muted"
                    data-testid={`row-part-${h.id}`}
                  >
                    <span className="size-3 shrink-0 rounded-full bg-primary" aria-hidden />
                    <span className="flex-1 truncate">{pick(h.nameEn, h.nameAr) || t('body.newPart')}</span>
                    {(h.audioEn || h.audioAr) && <Mic className="size-4 text-primary" aria-label={t('rec.has')} />}
                    <Pencil className="size-4 text-muted-foreground" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <HotspotEditor hotspot={editing} onClose={() => setEditing(null)} onSave={saveSpot} onDelete={deleteSpot} />
    </div>
  );
}
