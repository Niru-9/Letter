import { useEffect, useRef, useState, useCallback } from 'react';

interface Heart {
  id: number;
  tx: number; ty: number;   // final position
  cx: number; cy: number;   // current position
  vx: number; vy: number;
  finalSize: number;
  currentSize: number;
  color: string;
  rotation: number;
  rotSpeed: number;
  alpha: number;
  landed: boolean;
  visible: boolean;
  delay: number;   // ms before launch
  launched: boolean;
}

// ❤️ emoji colors via fillStyle — rich reds
const COLORS = [
  '#e8003d', '#c0002e', '#ff1744', '#d50000',
  '#ff4569', '#b71c1c', '#e53935', '#ff5252',
  '#c62828', '#ad1457', '#880e4f',
];

const BRUSH_RADIUS = 68;
const CLEAR_THRESHOLD = 0.65;

function drawEmoji(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  size: number, alpha: number
) {
  if (alpha <= 0.02 || size < 2) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = `${size}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('❤️', x, y);
  ctx.restore();
}

function buildHearts(w: number, h: number): Heart[] {
  const isMobile = w < 768;
  // Dense enough to fully cover — extra hearts at edges
  const cols = isMobile ? 10 : 16;
  const rows = isMobile ? 16 : 20;
  const hearts: Heart[] = [];
  let id = 0;

  const ox = w * 0.5;
  const oy = h * 0.56;
  const maxDist = Math.hypot(w, h);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const jx = (Math.random() - 0.5) * (w / cols) * 0.9;
      const jy = (Math.random() - 0.5) * (h / rows) * 0.9;
      const tx = (w / (cols - 1)) * c + jx;
      const ty = (h / (rows - 1)) * r + jy;

      const dx = tx - ox;
      const dy = ty - oy;
      const dist = Math.hypot(dx, dy) || 1;

      // Closer hearts launch first, farther ones follow — wave effect
      const delay = (dist / maxDist) * 700 + Math.random() * 60;

      // Initial velocity: fast outward burst
      const speed = 22 + (dist / maxDist) * 16;

      hearts.push({
        id: id++,
        tx, ty,
        cx: ox + (Math.random() - 0.5) * 20,
        cy: oy + (Math.random() - 0.5) * 20,
        vx: (dx / dist) * speed + (Math.random() - 0.5) * 4,
        vy: (dy / dist) * speed + (Math.random() - 0.5) * 4,
        finalSize: Math.random() * 20 + 28, // 28–48px
        currentSize: 4, // starts tiny — grows as it flies = "coming at you"
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: (Math.random() - 0.5) * 0.5,
        rotSpeed: (Math.random() - 0.5) * 0.05,
        alpha: 0,
        landed: false,
        visible: true,
        delay,
        launched: false,
      });
    }
  }
  return hearts;
}

interface HeartBurstProps {
  active: boolean;
  onDone: () => void;
}

type Phase = 'idle' | 'bursting' | 'swipe' | 'done';

export function HeartBurst({ active, onDone }: HeartBurstProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heartsRef = useRef<Heart[]>([]);
  const rafRef = useRef<number>(0);
  const phaseRef = useRef<Phase>('idle');
  const startTimeRef = useRef(0);
  const isDragging = useRef(false);

  const [phase, setPhase] = useState<Phase>('idle');
  const [clearedPct, setClearedPct] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const setPhaseSync = (p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  };

  // ── Physics loop ─────────────────────────────────────────────────────────
  const runPhysics = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const hearts = heartsRef.current;
    const elapsed = timestamp - startTimeRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let allSettled = true;

    hearts.forEach((h) => {
      if (!h.visible) return;

      if (!h.launched) {
        if (elapsed < h.delay) {
          allSettled = false;
          return;
        }
        h.launched = true;
      }

      if (!h.landed) {
        allSettled = false;

        const dx = h.tx - h.cx;
        const dy = h.ty - h.cy;
        const dist = Math.hypot(dx, dy);

        if (dist < 2.5) {
          h.cx = h.tx; h.cy = h.ty;
          h.vx = 0; h.vy = 0;
          h.landed = true;
          h.currentSize = h.finalSize;
          h.alpha = 1;
        } else {
          // Spring toward target
          h.vx += dx * 0.09;
          h.vy += dy * 0.09;
          h.vx *= 0.76;
          h.vy *= 0.76;
          h.cx += h.vx;
          h.cy += h.vy;
          h.rotation += h.rotSpeed;

          // Grow from tiny → full size as it travels (perspective zoom feel)
          h.currentSize = Math.min(h.finalSize, h.currentSize + (h.finalSize / 18));
          h.alpha = Math.min(1, h.alpha + 0.08);
        }
      }

      drawEmoji(ctx, h.cx, h.cy, h.currentSize, h.alpha);
    });

    if (allSettled && phaseRef.current === 'bursting') {
      setPhaseSync('swipe');
      setTimeout(() => setShowHint(true), 400);
      return;
    }

    rafRef.current = requestAnimationFrame(runPhysics);
  }, []);

  // ── Start ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    heartsRef.current = buildHearts(canvas.width, canvas.height);
    setPhaseSync('bursting');
    setShowHint(false);
    setClearedPct(0);

    rafRef.current = requestAnimationFrame((ts) => {
      startTimeRef.current = ts;
      runPhysics(ts);
    });
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, runPhysics]);

  // ── Static redraw ────────────────────────────────────────────────────────
  const redrawStatic = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    heartsRef.current.forEach((h) => {
      if (!h.visible) return;
      drawEmoji(ctx, h.tx, h.ty, h.finalSize, 1);
    });
  }, []);

  // ── Swipe clear ──────────────────────────────────────────────────────────
  const clearNear = useCallback((clientX: number, clientY: number) => {
    if (phaseRef.current !== 'swipe') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;

    let changed = false;
    heartsRef.current.forEach((h) => {
      if (!h.visible) return;
      if ((h.tx - px) ** 2 + (h.ty - py) ** 2 < BRUSH_RADIUS ** 2) {
        h.visible = false;
        changed = true;
      }
    });

    if (!changed) return;
    redrawStatic();

    const total = heartsRef.current.length;
    const cleared = heartsRef.current.filter((h) => !h.visible).length;
    const pct = cleared / total;
    setClearedPct(pct);

    if (pct >= CLEAR_THRESHOLD && phaseRef.current === 'swipe') {
      setPhaseSync('done');
      heartsRef.current.forEach((h) => (h.visible = false));
      redrawStatic();
      setTimeout(onDone, 350);
    }
  }, [redrawStatic, onDone]);

  // ── Pointer / touch ──────────────────────────────────────────────────────
  const onPointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    clearNear(e.clientX, e.clientY);
    setShowHint(false);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    clearNear(e.clientX, e.clientY);
  };
  const onPointerUp = () => { isDragging.current = false; };

  const onTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    Array.from(e.touches).forEach((t) => clearNear(t.clientX, t.clientY));
    setShowHint(false);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    Array.from(e.touches).forEach((t) => clearNear(t.clientX, t.clientY));
  };

  if (!active && phase === 'idle') return null;
  if (phase === 'done') return null;

  return (
    <div
      className="heart-burst-overlay"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onPointerUp}
    >
      <canvas ref={canvasRef} className="heart-burst-canvas" />

      {phase === 'swipe' && (
        <div className="swipe-progress-bar">
          <div
            className="swipe-progress-fill"
            style={{ width: `${Math.min(clearedPct / CLEAR_THRESHOLD, 1) * 100}%` }}
          />
        </div>
      )}

      {showHint && phase === 'swipe' && (
        <div className="swipe-hint">
          <span className="swipe-hint-hand">✋</span>
          <span className="swipe-hint-text">Swipe to reveal your letter</span>
        </div>
      )}
    </div>
  );
}
