import { useEffect, useRef, useState, useCallback } from 'react';

// ── Types ────────────────────────────────────────────────────────────────────
interface Heart {
  id: number;
  // final resting position (where it lands on screen)
  tx: number;
  ty: number;
  // current animated position
  cx: number;
  cy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  // physics
  vx: number;
  vy: number;
  landed: boolean;
  visible: boolean;
  scale: number; // for pop-in effect
}

// Rich reds + deep pinks — fully opaque
const COLORS = [
  '#e8003d', '#c0002e', '#ff1744', '#d50000',
  '#ff4569', '#b71c1c', '#e53935', '#ff5252',
  '#c62828', '#ad1457', '#e91e63',
];

const BRUSH_RADIUS = 65;
const CLEAR_THRESHOLD = 0.68;

// ── Heart drawing ────────────────────────────────────────────────────────────
function drawHeart(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  size: number, color: string,
  rotation: number, scale: number
) {
  const s = (size / 2) * scale;
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
  ctx.globalAlpha = 1;
  ctx.fill();
  ctx.restore();
}

// ── Build hearts with physics launch vectors ─────────────────────────────────
function buildHearts(w: number, h: number): Heart[] {
  const isMobile = w < 768;
  // Dense enough to fully cover screen
  const cols = isMobile ? 9 : 14;
  const rows = isMobile ? 14 : 17;
  const hearts: Heart[] = [];
  let id = 0;

  // Origin: envelope is roughly center-bottom of screen
  const ox = w * 0.5;
  const oy = h * 0.58;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Target position — dense grid with jitter
      const jx = (Math.random() - 0.5) * (w / cols) * 0.9;
      const jy = (Math.random() - 0.5) * (h / rows) * 0.9;
      const tx = (w / (cols - 1)) * c + jx;
      const ty = (h / (rows - 1)) * r + jy;

      // Launch vector: from envelope origin toward target, with overshoot
      const dx = tx - ox;
      const dy = ty - oy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const speed = (dist / 400) * (Math.random() * 0.4 + 0.8); // faster for farther hearts

      hearts.push({
        id: id++,
        tx, ty,
        cx: ox + (Math.random() - 0.5) * 30,
        cy: oy + (Math.random() - 0.5) * 20,
        size: Math.random() * 22 + 30, // 30–52px — big
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: (Math.random() - 0.5) * 0.8,
        rotationSpeed: (Math.random() - 0.5) * 0.08,
        vx: (dx / dist) * speed * 18 + (Math.random() - 0.5) * 4,
        vy: (dy / dist) * speed * 18 + (Math.random() - 0.5) * 4,
        landed: false,
        visible: true,
        scale: 0.1,
      });
    }
  }

  // Stagger launch: hearts closer to origin launch first
  hearts.sort((a, b) => {
    const da = Math.hypot(a.tx - ox, a.ty - oy);
    const db = Math.hypot(b.tx - ox, b.ty - oy);
    return da - db;
  });

  return hearts;
}

// ── Component ────────────────────────────────────────────────────────────────
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
  const isDragging = useRef(false);
  const launchIndexRef = useRef(0); // how many hearts have been launched

  const [phase, setPhase] = useState<Phase>('idle');
  const [clearedPct, setClearedPct] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const setPhaseSync = (p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  };

  // ── Physics render loop ──────────────────────────────────────────────────
  const runPhysics = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const hearts = heartsRef.current;
    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    // Launch a few more hearts each frame (staggered burst effect)
    const LAUNCH_PER_FRAME = 4;
    const idx = launchIndexRef.current;
    launchIndexRef.current = Math.min(idx + LAUNCH_PER_FRAME, hearts.length);

    let allLanded = true;

    hearts.forEach((h, i) => {
      if (!h.visible) return;
      if (i >= launchIndexRef.current) return; // not launched yet

      if (!h.landed) {
        allLanded = false;

        // Move toward target with spring-like deceleration
        const dx = h.tx - h.cx;
        const dy = h.ty - h.cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 3) {
          h.cx = h.tx;
          h.cy = h.ty;
          h.landed = true;
          h.scale = 1;
        } else {
          // Spring: accelerate toward target
          h.vx += dx * 0.12;
          h.vy += dy * 0.12;
          // Dampen
          h.vx *= 0.72;
          h.vy *= 0.72;
          h.cx += h.vx;
          h.cy += h.vy;
          h.rotation += h.rotationSpeed;
          // Pop-in scale
          h.scale = Math.min(1, h.scale + 0.06);
        }
      }

      drawHeart(ctx, h.cx, h.cy, h.size, h.color, h.rotation, h.scale);
    });

    // Check if all launched hearts have landed
    const allLaunched = launchIndexRef.current >= hearts.length;
    if (allLaunched && allLanded && phaseRef.current === 'bursting') {
      setPhaseSync('swipe');
      setTimeout(() => setShowHint(true), 500);
      return; // stop RAF — redraw only happens on swipe now
    }

    rafRef.current = requestAnimationFrame(runPhysics);
  }, []);

  // ── Start burst ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    heartsRef.current = buildHearts(canvas.width, canvas.height);
    launchIndexRef.current = 0;
    setPhaseSync('bursting');
    setShowHint(false);
    setClearedPct(0);

    rafRef.current = requestAnimationFrame(runPhysics);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, runPhysics]);

  // ── Swipe clear ──────────────────────────────────────────────────────────
  const redrawStatic = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    heartsRef.current.forEach((h) => {
      if (!h.visible) return;
      drawHeart(ctx, h.tx, h.ty, h.size, h.color, h.rotation, 1);
    });
  }, []);

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
      const dx = h.tx - px;
      const dy = h.ty - py;
      if (dx * dx + dy * dy < BRUSH_RADIUS * BRUSH_RADIUS) {
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

  // ── Pointer / touch handlers ─────────────────────────────────────────────
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
      {showHint && phase === 'swipe' && (
        <div className="swipe-hint">
          <div className="swipe-hint-hand">✋</div>
          <div className="swipe-hint-text">Swipe away the hearts</div>
          <div className="swipe-hint-sub">to reveal your letter 💌</div>
        </div>
      )}
    </div>
  );
}
