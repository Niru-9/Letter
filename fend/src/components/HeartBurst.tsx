import { useEffect, useRef, useState, useCallback } from 'react';

interface Heart {
  id: number;
  // final resting position
  tx: number;
  ty: number;
  // current position
  cx: number;
  cy: number;
  // velocity
  vx: number;
  vy: number;
  size: number;
  finalSize: number;
  color: string;
  rotation: number;
  rotSpeed: number;
  scale: number;
  alpha: number;
  landed: boolean;
  visible: boolean;
  // delay before this heart launches (ms)
  delay: number;
  launched: boolean;
}

const COLORS = [
  '#e8003d', '#c0002e', '#ff1744', '#d50000',
  '#ff4569', '#b71c1c', '#e53935', '#ff5252',
  '#c62828', '#ad1457',
];

const BRUSH_RADIUS = 62;
const CLEAR_THRESHOLD = 0.68;

function drawHeart(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  size: number, color: string,
  rotation: number, alpha: number
) {
  if (alpha <= 0 || size <= 0) return;
  const s = size / 2;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.beginPath();
  ctx.moveTo(0, s * 0.35);
  ctx.bezierCurveTo(-s * 0.1, s * 0.1, -s, s * 0.1, -s, -s * 0.25);
  ctx.bezierCurveTo(-s, -s * 0.75, 0, -s * 0.9, 0, -s * 0.4);
  ctx.bezierCurveTo(0, -s * 0.9, s, -s * 0.75, s, -s * 0.25);
  ctx.bezierCurveTo(s, s * 0.1, s * 0.1, s * 0.1, 0, s * 0.35);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

function buildHearts(w: number, h: number): Heart[] {
  const isMobile = w < 768;
  const cols = isMobile ? 8 : 13;
  const rows = isMobile ? 13 : 16;
  const hearts: Heart[] = [];
  let id = 0;

  // Envelope origin — center of screen, slightly below middle
  const ox = w * 0.5;
  const oy = h * 0.56;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const jx = (Math.random() - 0.5) * (w / cols) * 0.85;
      const jy = (Math.random() - 0.5) * (h / rows) * 0.85;
      const tx = (w / (cols - 1)) * c + jx;
      const ty = (h / (rows - 1)) * r + jy;

      // Distance from origin determines delay — close hearts launch first
      const dist = Math.hypot(tx - ox, ty - oy);
      const maxDist = Math.hypot(w, h);
      // Stagger: 0ms (closest) → 600ms (farthest)
      const delay = (dist / maxDist) * 600 + Math.random() * 80;

      // Direction vector from origin to target
      const dx = tx - ox;
      const dy = ty - oy;
      const len = Math.max(dist, 1);

      // Initial velocity: fast outward burst, will spring to target
      const speed = 18 + (dist / maxDist) * 14;

      hearts.push({
        id: id++,
        tx, ty,
        cx: ox,
        cy: oy,
        vx: (dx / len) * speed + (Math.random() - 0.5) * 5,
        vy: (dy / len) * speed + (Math.random() - 0.5) * 5,
        finalSize: Math.random() * 22 + 28,
        size: 0,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: (Math.random() - 0.5) * 0.7,
        rotSpeed: (Math.random() - 0.5) * 0.07,
        scale: 0,
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
  const startTimeRef = useRef<number>(0);
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

      // Launch when delay has passed
      if (!h.launched) {
        if (elapsed < h.delay) {
          allSettled = false;
          return; // not yet
        }
        h.launched = true;
      }

      if (!h.landed) {
        allSettled = false;

        // Spring toward target
        const dx = h.tx - h.cx;
        const dy = h.ty - h.cy;
        const dist = Math.hypot(dx, dy);

        if (dist < 2.5) {
          h.cx = h.tx;
          h.cy = h.ty;
          h.vx = 0;
          h.vy = 0;
          h.landed = true;
          h.scale = 1;
          h.alpha = 1;
          h.size = h.finalSize;
        } else {
          // Spring force
          h.vx += dx * 0.10;
          h.vy += dy * 0.10;
          // Damping
          h.vx *= 0.74;
          h.vy *= 0.74;
          h.cx += h.vx;
          h.cy += h.vy;
          h.rotation += h.rotSpeed;

          // Grow from 0 → finalSize as it travels
          const progress = Math.min(1, 1 - dist / Math.hypot(h.tx - canvas.width / 2, h.ty - canvas.height * 0.56));
          h.scale = Math.min(1, h.scale + 0.055);
          h.alpha = Math.min(1, h.alpha + 0.07);
          h.size = h.finalSize * h.scale;
        }
      }

      drawHeart(ctx, h.cx, h.cy, h.size, h.color, h.rotation, h.alpha);
    });

    if (allSettled && phaseRef.current === 'bursting') {
      setPhaseSync('swipe');
      setTimeout(() => setShowHint(true), 500);
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

    const start = (ts: number) => {
      startTimeRef.current = ts;
      runPhysics(ts);
    };
    rafRef.current = requestAnimationFrame(start);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, runPhysics]);

  // ── Static redraw (swipe phase) ──────────────────────────────────────────
  const redrawStatic = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    heartsRef.current.forEach((h) => {
      if (!h.visible) return;
      drawHeart(ctx, h.tx, h.ty, h.finalSize, h.color, h.rotation, 1);
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

      {/* Minimal progress bar */}
      {phase === 'swipe' && (
        <div className="swipe-progress-bar">
          <div
            className="swipe-progress-fill"
            style={{ width: `${Math.min(clearedPct / CLEAR_THRESHOLD, 1) * 100}%` }}
          />
        </div>
      )}

      {/* Minimal floating hint */}
      {showHint && phase === 'swipe' && (
        <div className="swipe-hint">
          <span className="swipe-hint-hand">✋</span>
          <span className="swipe-hint-text">Swipe to reveal your letter 💌</span>
        </div>
      )}
    </div>
  );
}
