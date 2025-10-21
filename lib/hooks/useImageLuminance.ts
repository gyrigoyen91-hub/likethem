'use client';

import { useEffect, useState } from 'react';

// Fast perceptual luminance from a few samples (no heavy libs)
function luminance(r: number, g: number, b: number) {
  // sRGB -> luma
  return 0.2126 * r + 0.7152 * g + 0.0722 * b; // 0..255
}

export function useImageLuminance(src: string | undefined, samples = 5) {
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    if (!src) return;

    let cancelled = false;
    const img = new Image();
    img.crossOrigin = 'anonymous'; // local images ok; remote must be in next.config domains
    img.decoding = 'async';
    img.src = src;

    img.onload = () => {
      if (cancelled) return;
      try {
        const w = Math.max(64, Math.min(256, img.naturalWidth));
        const h = Math.max(64, Math.min(256, img.naturalHeight));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) throw new Error('no ctx');

        ctx.drawImage(img, 0, 0, w, h);

        // sample a small grid to avoid hotspots
        const stepX = Math.max(1, Math.floor(w / samples));
        const stepY = Math.max(1, Math.floor(h / samples));
        let acc = 0;
        let count = 0;

        for (let y = stepY / 2; y < h; y += stepY) {
          for (let x = stepX / 2; x < w; x += stepX) {
            const d = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
            acc += luminance(d[0], d[1], d[2]);
            count++;
          }
        }
        const avg = acc / Math.max(1, count); // 0..255
        // Threshold: lower => darker image. 128 is neutral; bias a bit brighter.
        const dark = avg < 145;
        console.log(`[useImageLuminance] ${src}: avg=${avg.toFixed(1)}, dark=${dark}`);
        setIsDark(dark);
      } catch {
        // fallback: keep null so CSS scrim saves us
        setIsDark(null);
      }
    };

    img.onerror = () => setIsDark(null);

    return () => {
      cancelled = true;
    };
  }, [src, samples]);

  return isDark; // true = dark bg -> use light text
}
