import { useEffect, useState } from 'react';

interface Heart {
  id: number;
  x: number;        // vw %
  size: number;     // px
  duration: number; // animation duration s
  delay: number;    // animation delay s
  color: string;
}

const COLORS = ['#FBA2AB', '#FEA38E', '#F3B5A0', '#ff6b8a', '#ffb3c1', '#ff4d6d'];

function randomHeart(id: number): Heart {
  return {
    id,
    x: Math.random() * 100,
    size: Math.random() * 28 + 14,        // 14–42px
    duration: Math.random() * 1.0 + 1.2,  // 1.2–2.2s
    delay: Math.random() * 0.7,           // 0–0.7s stagger
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  };
}

interface HeartBurstProps {
  active: boolean;   // true = burst is playing
  onDone: () => void; // called when burst finishes
}

export function HeartBurst({ active, onDone }: HeartBurstProps) {
  const [hearts, setHearts] = useState<Heart[]>([]);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!active) return;

    // Generate hearts in 3 waves for a "filling the screen" feel
    const isMobile = window.innerWidth < 768;
    const total = isMobile ? 30 : 55;

    const generated: Heart[] = Array.from({ length: total }, (_, i) => randomHeart(i));
    setHearts(generated);
    setFading(false);

    // Start fading the overlay out after hearts have risen
    const fadeTimer = setTimeout(() => setFading(true), 1600);

    // Notify parent when fully done
    const doneTimer = setTimeout(() => {
      setHearts([]);
      onDone();
    }, 2400);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [active]);

  if (!active && hearts.length === 0) return null;

  return (
    <div
      className={`heart-burst-overlay ${fading ? 'fading' : ''}`}
      aria-hidden="true"
    >
      {hearts.map((h) => (
        <span
          key={h.id}
          className="burst-heart"
          style={{
            left: `${h.x}vw`,
            bottom: '-60px',
            fontSize: `${h.size}px`,
            color: h.color,
            animationDuration: `${h.duration}s`,
            animationDelay: `${h.delay}s`,
          } as React.CSSProperties}
        >
          ♥
        </span>
      ))}
    </div>
  );
}
