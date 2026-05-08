import { useEffect, useRef } from 'react';

export function BackgroundEffects() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Detect mobile for performance tuning
    const isMobile = window.innerWidth < 768;
    const MAX_PARTICLES = isMobile ? 15 : 35;
    const FPS_INTERVAL = isMobile ? 1000 / 30 : 1000 / 60; // 30fps mobile, 60fps desktop

    let animationFrameId: number;
    let lastTime = 0;
    let particles: Array<{
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      type: 'heart' | 'particle';
      opacity: number;
    }> = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const createParticle = () => {
      if (particles.length >= MAX_PARTICLES) return;
      const isHeart = Math.random() > 0.6;
      particles.push({
        x: Math.random() * canvas.width,
        y: canvas.height + 10,
        size: isHeart ? Math.random() * 8 + 4 : Math.random() * 3 + 1,
        speedY: Math.random() * 0.8 + 0.3,
        speedX: Math.random() * 0.6 - 0.3,
        type: isHeart ? 'heart' : 'particle',
        opacity: 0,
      });
    };

    const drawHeart = (x: number, y: number, size: number) => {
      const h = size * 0.3;
      ctx.beginPath();
      ctx.moveTo(x, y + h);
      ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + h);
      ctx.bezierCurveTo(x - size / 2, y + size / 2, x, y + size * 0.8, x, y + size);
      ctx.bezierCurveTo(x, y + size * 0.8, x + size / 2, y + size / 2, x + size / 2, y + h);
      ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + h);
      ctx.closePath();
      ctx.fill();
    };

    const render = (timestamp: number) => {
      animationFrameId = requestAnimationFrame(render);

      // Throttle framerate on mobile
      const elapsed = timestamp - lastTime;
      if (elapsed < FPS_INTERVAL) return;
      lastTime = timestamp - (elapsed % FPS_INTERVAL);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      createParticle();

      particles = particles.filter((p) => {
        p.y -= p.speedY;
        p.x += p.speedX;

        if (p.y > canvas.height * 0.6) {
          p.opacity = Math.min(1, p.opacity + 0.02);
        } else if (p.y < canvas.height * 0.25) {
          p.opacity = Math.max(0, p.opacity - 0.02);
        }

        if (p.opacity <= 0 && p.y < canvas.height * 0.25) return false;

        ctx.globalAlpha = p.opacity;

        if (p.type === 'heart') {
          ctx.fillStyle = '#FBA2AB';
          drawHeart(p.x, p.y, p.size);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(254, 163, 142, 0.5)';
          ctx.fill();
        }

        ctx.globalAlpha = 1;
        return true;
      });
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="background-canvas" />;
}
