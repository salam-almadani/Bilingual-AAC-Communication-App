/** Downscale and re-encode a photo locally. Returns a compact Blob (never base64). */
export async function compressImage(file: Blob, maxSide = 900, quality = 0.82): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('decode'));
      el.src = url;
    });
    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas');
    ctx.fillStyle = '#fbf8f2';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    const tryType = (type: string) =>
      new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), type, quality));
    const out = (await tryType('image/webp')) ?? (await tryType('image/jpeg'));
    if (!out) throw new Error('encode');
    canvas.width = 0;
    canvas.height = 0;
    return out;
  } finally {
    URL.revokeObjectURL(url);
  }
}
