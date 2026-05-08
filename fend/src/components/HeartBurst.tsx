import { useEffect, useRef, useState, useCallback } from 'react';

interface Heart {
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  cleared: boolean;
  opacity: number;
  // for the burst-in animation
  startX: number;
  startY: number;
  progress: number; // 0→1 burst animation
}

const COLORS = ['#FBA2AB', '#FEA38E', '#F3B5A0', '#ff6b8a', '#ffb3c1', '#e91e8c', '#ff4d6d', '#ffb3c6'];
const BRUSH_RADIUS = 55; // px — swipe clear radius
const CLEAR_THRESHOLD = 0.72; // 72% cleared → open letter

function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const s = size / 2;
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.moveTo(0, s * 0.4);
  ctx.bezierCurveTo(-s * 0.1, s * 0.1, -s, s * 0.1, -s, -s * 0.2);
  ctx.bezierCurveTo(-s, -s * 0.7, 0, -s * 0.9, 0, -s * 0.4);
  ctx.bezierCurveTo(0, -s * 0.9, s, -s * 0.7, s, -s * 0.2);
  ctx.bezierCurveTo(s, s * 0.1, s * 0.1, s * 0.1, 0, s * 0.4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

interface HeartBurstProps {
  active: boolean;
  onDone: () => void;
}

export function HeartBurst({ active, onDone }: HeartBurstProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heartsRef = useRef<Heart[]>([]);
  const rafRef = useRef<number>(0);
  const burstDoneRef = useRef(false);
  const isDragging = useRef(false);
  const [phase, setPhase] = useState<'idle' | 'bursting' | 'swipe' | 'clearing' | 'done'>('idle');
  const [clearedPct, setClearedPct] = useState(0);
  const [hint, setHint] = useState(false);

  // ── Generate hearts spread across the full screen ──────────────────────────
  const generateHearts = useCallback((w: number, h: number) => {
    const isMobile = w < 768;
    // Dense enough to cover the screen
    const cols = isMobile ? 7 : 11;
    const rows = isMobile ? 11 : 14;
    const hearts: Heart[] = [];

    // Origin: center of screen (burst from envelope area)
    const ox = w / 2;
    const oy = h * 0.55;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Spread evenly with jitter
        const tx = (w / (cols - 1)) * c + (Math.random() - 0.5) * (w / cols) * 0.8;
        const ty = (h / (rows - 1)) * r + (Math.random() - 0.5) * (h / rows) * 0.8;
        hearts.push({
          x: tx,
          y: ty,
          startX: ox + (Math.random() - 0.5) * 60,
          startY: oy + (Math.random() - 0.5) * 40,
          size: Math.random() * 28 + 22, // 22–50px
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          rotation: (Math.random() - 0.5) * 0.6,
          cleared: false,
          opacity: 1,
          progress: 0,
        });
      }
    }
    // Stagger burst progress so they don't all arrive at once
    hearts.forEach((h, i) => {
      h.progress = -(i / hearts.length) * 0.6; // negative = delayed start
    });
    heartsRef.current = hearts;
  }, []);

  // ── Render loop ────────────────────────────────────────────────────────────
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const hearts = heartsRef.current;
    let allArrived = true;
    let clearedCount = 0;

    hearts.forEach((heart) => {
      if (heart.cleared) {
        clearedCount++;
        return;
      }

      // Advance burst animation
      if (heart.progress < 1) {
        heart.progress = Math.min(1, heart.progress + 0.022);
        allArrived = false;
      }

      if (heart.progress <= 0) return; // not started yet

      // Ease out cubic
      const t = heart.progress < 0 ? 0 : 1 - Math.pow(1 - heart.progress, 3);
      const cx = heart.startX + (heart.x - heart.startX) * t;
      const cy = heart.startY + (heart.y - heart.startY) * t;

      ctx.globalAlpha = heart.opacity * Math.min(1, heart.progress * 3);
      ctx.fillStyle = heart.color;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(heart.rotation);
      ctx.translate(-cx, -cy);
      drawHeart(ctx, cx, cy, heart.size);
      ctx.restore();
      ctx.globalAlpha = 1;
    });

    // Check if burst is done
    if (allArrived && !burstDoneRef.current) {
      burstDoneRef.current = true;
      setPhase('swipe');
      setTimeout(() => setHint(true), 300);
    }

    // Track cleared %
    const pct = clearedCount / hearts.length;
    setClearedPct(pct);

    if (pct >= CLEAR_THRESHOLD && phase !== 'clearing' && phase !== 'done') {
      setPhase('clearing');
      // Fade remaining hearts out
      hearts.forEach((h) => {
        if (!h.cleared) {
          const fade = () => {
            h.opacity = Math.max(0, h.opacity - 0.04);
            if (h.opacity > 0) requestAnimationFrame(fade);
          };
          setTimeout(fade, Math.random() * 400);
        }
      });
      setTimeout(() => {
        setPhase('done');
        onDone();
      }, 800);
    }

    rafRef.current = requestAnimationFrame(render);
  }, [phase, onDone]);

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    generateHearts(canvas.width, canvas.height);
    burstDoneRef.current = false;
    setPhase('bursting');
    setHint(false);
    setClearedPct(0);

    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active]);

  // Re-attach render when phase changes (to pick up new phase value in closure)
  useEffect(() => {
    if (phase === 'swipe' || phase === 'clearing') {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(render);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, render]);

  // ── Swipe / pointer handling ───────────────────────────────────────────────
  const clearNear = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;

    heartsRef.current.forEach((heart) => {
      if (heart.cleared || heart.progress < 1) return;
      const dx = heart.x - px;
      const dy = heart.y - py;
      if (Math.sqrt(dx * dx + dy * dy) < BRUSH_RADIUS) {
        heart.cleared = true;
      }
    });
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (phase !== 'swipe') return;
    isDragging.current = true;
    clearNear(e.clientX, e.clientY);
    setHint(false);
  }, [phase, clearNear]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current || phase !== 'swipe') return;
    clearNear(e.clientX, e.clientY);
  }, [phase, clearNear]);

  const onPointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  // Touch support
  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (phase !== 'swipe') return;
    e.preventDefault();
    Array.from(e.touches).forEach((t) => clearNear(t.clientX, t.clientY));
    setHint(false);
  }, [phase, clearNear]);

  if (!active && phase === 'idle') return null;
  if (phase === 'done') return null;

  return (
    <div className="heart-burst-overlay" aria-hidden={phase !== 'swipe'}>
      <canvas ref={canvasRef} className="heart-burst-canvas" />

      {/* Progress bar */}
      {phase === 'swipe' && (
        <div className="swipe-progress-bar">
          <div
            className="swipe-progress-fill"
            style={{ width: `${Math.min(clearedPct / CLEAR_THRESHOLD, 1) * 100}%` }}
          />
        </div>
      )}

      {/* Swipe hint */}
      {hint && phase === 'swipe' && (
        <div className="swipe-hint">
          <span className="swipe-hint-icon">✋</span>
          <span>Swipe to reveal your letter</span>
        </div>
      )}
    </div>
  );
}
