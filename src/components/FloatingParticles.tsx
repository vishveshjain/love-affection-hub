import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  fadeSpeed: number;
  rotation: number;
  rotSpeed: number;
  color: string;
  shape: 'heart' | 'star' | 'circle';
}

export const FloatingParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const colors = [
      'rgba(244, 63, 94, ', // rose-500
      'rgba(251, 113, 133, ', // rose-400
      'rgba(244, 114, 182, ', // pink-400
      'rgba(192, 132, 252, ', // purple-400
      'rgba(253, 164, 175, ', // rose-300
    ];

    const particles: Particle[] = [];

    // Background floating ambient particles
    for (let i = 0; i < 28; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 14 + 10,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: -(Math.random() * 0.6 + 0.3),
        opacity: Math.random() * 0.4 + 0.15,
        fadeSpeed: 0.002,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.015,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: Math.random() > 0.4 ? 'heart' : 'circle',
      });
    }

    const drawHeart = (
      context: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      color: string,
      alpha: number,
      angle: number
    ) => {
      context.save();
      context.translate(x, y);
      context.rotate(angle);
      context.beginPath();
      const topCurveHeight = size * 0.3;
      context.moveTo(0, topCurveHeight);
      // top left curve
      context.bezierCurveTo(
        -size / 2,
        -size / 2,
        -size,
        topCurveHeight / 3,
        0,
        size
      );
      // top right curve
      context.bezierCurveTo(
        size,
        topCurveHeight / 3,
        size / 2,
        -size / 2,
        0,
        topCurveHeight
      );
      context.closePath();
      context.fillStyle = `${color}${alpha})`;
      context.fill();
      context.restore();
    };

    const drawStar = (
      context: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      color: string,
      alpha: number
    ) => {
      context.save();
      context.translate(x, y);
      context.beginPath();
      for (let i = 0; i < 5; i++) {
        context.lineTo(Math.cos(((18 + i * 72) * Math.PI) / 180) * size, -Math.sin(((18 + i * 72) * Math.PI) / 180) * size);
        context.lineTo(Math.cos(((54 + i * 72) * Math.PI) / 180) * (size / 2), -Math.sin(((54 + i * 72) * Math.PI) / 180) * (size / 2));
      }
      context.closePath();
      context.fillStyle = `${color}${alpha})`;
      context.fill();
      context.restore();
    };

    // Mouse movement sparkle spawn
    let lastMouseSpawn = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastMouseSpawn < 40) return; // throttle
      lastMouseSpawn = now;

      particles.push({
        x: e.clientX + (Math.random() - 0.5) * 10,
        y: e.clientY + (Math.random() - 0.5) * 10,
        size: Math.random() * 8 + 6,
        speedX: (Math.random() - 0.5) * 0.8,
        speedY: (Math.random() - 0.5) * 0.8 - 0.5,
        opacity: 0.7,
        fadeSpeed: 0.02,
        rotation: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.05,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: Math.random() > 0.5 ? 'heart' : 'star',
      });
    };

    // Click burst
    const handleClick = (e: MouseEvent) => {
      for (let i = 0; i < 8; i++) {
        particles.push({
          x: e.clientX,
          y: e.clientY,
          size: Math.random() * 12 + 8,
          speedX: (Math.random() - 0.5) * 3,
          speedY: (Math.random() - 0.5) * 3 - 1,
          opacity: 0.9,
          fadeSpeed: 0.02,
          rotation: Math.random() * Math.PI,
          rotSpeed: (Math.random() - 0.5) * 0.1,
          color: colors[Math.floor(Math.random() * colors.length)],
          shape: 'heart',
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotSpeed;
        p.opacity -= p.fadeSpeed;

        // Reset ambient background particles when they float off screen
        if (p.fadeSpeed <= 0.005) {
          if (p.y < -20) {
            p.y = height + 20;
            p.x = Math.random() * width;
            p.opacity = Math.random() * 0.4 + 0.15;
          }
        } else if (p.opacity <= 0) {
          particles.splice(i, 1);
          continue;
        }

        if (p.shape === 'heart') {
          drawHeart(ctx, p.x, p.y, p.size, p.color, Math.max(0, p.opacity), p.rotation);
        } else if (p.shape === 'star') {
          drawStar(ctx, p.x, p.y, p.size * 0.7, p.color, Math.max(0, p.opacity));
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.4, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${Math.max(0, p.opacity)})`;
          ctx.fill();
        }
      }

      animFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ width: '100%', height: '100%' }}
    />
  );
};
