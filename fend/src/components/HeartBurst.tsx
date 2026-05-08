import { useEffect, useRef, useState, useCallback } from 'react';

interface Heart {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  visible: boolean;
}

// Rich reds and deep pinks — fully opaque
const COLORS = [
  '#e8003d', '#c0002e', '#ff1744', '#d50000',
  '#ff4569', '#b71c1c', '#e53935', '#ff5252',
];

const BRUSH_RADIUS = 60;
const CLEAR_THRESHOLD = 0.70;

function buildHearts(w: number, h: number): Heart[] {
  const isMobile = w < 768;
  const cols = isMobile ? 8 : 12;
  const rows = isMobile ? 12 : 15;
  const hearts: Heart[] = [];
  let id = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const jx = (Math.random() - 0.5) * (w / cols) * 0.7;
      const jy = (Math.random() - 0.5) * (h / rows) * 0.7;
      hearts.push({
        id: id++,
        x: (w / (cols - 1)) * c + jx,
        y: (h / (rows - 1)) * r + jy,
        size: Math.random() * 24 + 28, // 28–52px — big and visible
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: (Math.random() - 0.5) * 0.5,
        visible: true,
      });
    }
  }
  return hearts;
}

function drawHeart(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  size: number, color: string, rotation: number
) {
  const s = size / 2;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.beginPath();
  ctx.moveTo(0, s * 0.35);
  ctx.bezierCurveTo(-s * 0.1,  s * 0.1,  -s,  s * 0.1,  -s, -s * 0.25);
  ctx.bezierCurveTo(-s, -s * 0.75,  0, -s * 0.9,   0, -s * 0.4);
  ctx.bezierCurveTo( 0, -s * 0.9,   s, -s * 0.75,  s, -s * 0.25);
  ctx.bezierCurveTo( s,  s * 0.1,   s * 0.1, s * 0.1, 0, s * 0.35);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
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
  const burstProgressRef = useRef(0); // 0→1 overall burst fill
  const isDragging = useRef(false);

  const [phase, setPhase] = useState<Phase>('idle');
  const [clearedPct, setClearedPct] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const setPhaseSync = (p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  };

  // ── Draw all visible hearts ──────────────────────────────────────────────
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const hearts = heartsRef.current;
    const progress = burstProgressRef.current; // 0→1

    hearts.forEach((h, i) => {
      if (!h.visible) return;
      // Each heart appears sequentially based on burst progress
      const threshold = i / hearts.length;
      if (progress < threshold) return;

      ctx.globalAlpha = 1; // fully opaque — no transparency
      drawHeart(ctx, h.x, h.y, h.size, h.color, h.rotation);
    });

    ctx.globalAlpha = 1;
  }, []);

  // ── Burst animation: fill screen with hearts over ~1.2s ─────────────────
  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    heartsRef.current = buildHearts(canvas.width, canvas.height);
    burstProgressRef.current = 0;
    setPhaseSync('bursting');
    setShowHint(false);
    setClearedPct(0);

    const start = performance.now();
    const BURST_DURATION = 1200; // ms to fill screen

    const animate = (now: number) => {
      const t = Math.min((now - start) / BURST_DURATION, 1);
      burstProgressRef.current = t;
      redraw();

      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        // Burst done — switch to swipe phase
        setPhaseSync('swipe');
        setTimeout(() => setShowHint(true), 400);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, redraw]);

  // ── Clear hearts near pointer ────────────────────────────────────────────
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
      const dx = h.x - px;
      const dy = h.y - py;
      if (dx * dx + dy * dy < BRUSH_RADIUS * BRUSH_RADIUS) {
        h.visible = false;
        changed = true;
      }
    });

    if (changed) {
      redraw();
      const total = heartsRef.current.length;
      const cleared = heartsRef.current.filter((h) => !h.visible).length;
      const pct = cleared / total;
      setClearedPct(pct);

      if (pct >= CLEAR_THRESHOLD && phaseRef.current === 'swipe') {
        setPhaseSync('done');
        // Fade out remaining hearts quickly
        heartsRef.current.forEach((h) => (h.visible = false));
        redraw();
        setTimeout(onDone, 400);
      }
    }
  }, [redraw, onDone]);

  // ── Pointer events ───────────────────────────────────────────────────────
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
          <span className="swipe-hint-icon">✋</span>
          <span>Swipe to reveal your letter</span>
        </div>
      )}
    </div>
  );
}
