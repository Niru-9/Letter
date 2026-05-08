import { useEffect, useRef } from 'react';

export function BackgroundEffects() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      type: 'heart' | 'particle' | 'light';
      opacity: number;
    }> = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    const createParticles = () => {
      if (particles.length < 50) {
        const typeRand = Math.random();
        particles.push({
          x: Math.random() * canvas.width,
          y: canvas.height + 10,
          size: typeRand > 0.8 ? Math.random() * 8 + 4 : Math.random() * 3 + 1,
          speedY: Math.random() * 1 + 0.5,
          speedX: Math.random() * 1 - 0.5,
          type: typeRand > 0.9 ? 'heart' : typeRand > 0.6 ? 'light' : 'particle',
          opacity: 0
        });
      }
    };

    const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
      ctx.beginPath();
      const topCurveHeight = size * 0.3;
      ctx.moveTo(x, y + topCurveHeight);
      ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + topCurveHeight);
      ctx.bezierCurveTo(x - size / 2, y + size / 2, x, y + size * 0.8, x, y + size);
      ctx.bezierCurveTo(x, y + size * 0.8, x + size / 2, y + size / 2, x + size / 2, y + topCurveHeight);
      ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight);
      ctx.closePath();
      ctx.fill();
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      createParticles();

      particles.forEach((p, index) => {
        p.y -= p.speedY;
        p.x += p.speedX;
        
        // Fade in
        if (p.opacity < 1 && p.y > canvas.height / 2) {
          p.opacity += 0.01;
        } else if (p.y < canvas.height / 3) {
          // Fade out near top
          p.opacity -= 0.01;
        }

        if (p.opacity <= 0 && p.y < canvas.height / 2) {
          particles.splice(index, 1);
          return;
        }

        ctx.globalAlpha = Math.max(0, p.opacity);

        if (p.type === 'heart') {
          ctx.fillStyle = '#ff4d6d';
          drawHeart(ctx, p.x, p.y, p.size);
        } else if (p.type === 'light') {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = '#ff8fa3';
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#ff8fa3';
          ctx.fill();
          ctx.shadowBlur = 0;
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="background-canvas" />;
}
