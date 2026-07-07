import { useEffect, useRef } from 'react';

export interface ParticleFieldProps {
  /** Number of confetti particles. */
  density?: number;
  /** Particle colors; defaults to the Evently palette. */
  colors?: string[];
  className?: string;
}

/**
 * Animated confetti/particle background (canvas). Drifts small colored
 * shapes downward with rotation for the reference's "live" dark-section feel.
 * Decorative + aria-hidden; honors prefers-reduced-motion. Reusable across the
 * dark sections (hero, after-booking, app download).
 */
export function ParticleField({ density = 40, colors, className }: ParticleFieldProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const palette = colors ?? ['#e8633a', '#1d9e75', '#e0a93c', '#ffffff', '#5b7bd4'];

    let w = 0;
    let h = 0;
    let raf = 0;
    type P = { x: number; y: number; s: number; c: string; a: number; va: number; vx: number; vy: number; shape: number };
    let parts: P[] = [];

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = canvas.width = Math.max(1, Math.floor(r.width * dpr));
      h = canvas.height = Math.max(1, Math.floor(r.height * dpr));
    };
    const init = () => {
      parts = Array.from({ length: density }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        s: (Math.random() * 6 + 3) * dpr,
        c: palette[Math.floor(Math.random() * palette.length)] ?? '#fff',
        a: Math.random() * Math.PI,
        va: (Math.random() - 0.5) * 0.02,
        vx: (Math.random() - 0.5) * 0.25 * dpr,
        vy: (Math.random() * 0.3 + 0.08) * dpr,
        shape: Math.random() > 0.5 ? 0 : 1,
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.x += p.vx;
        p.y += p.vy;
        p.a += p.va;
        if (p.y > h + 12) { p.y = -12; p.x = Math.random() * w; }
        if (p.x > w + 12) p.x = -12;
        if (p.x < -12) p.x = w + 12;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.a);
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = p.c;
        if (p.shape === 0) ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
        else { ctx.beginPath(); ctx.arc(0, 0, p.s / 2, 0, Math.PI * 2); ctx.fill(); }
        ctx.restore();
      }
      raf = requestAnimationFrame(draw);
    };

    resize();
    init();
    if (reduce) draw();
    else raf = requestAnimationFrame(draw);

    const onResize = () => { resize(); init(); };
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, [density, colors]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={className}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
    />
  );
}
