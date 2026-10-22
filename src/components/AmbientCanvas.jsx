import React, { useEffect, useRef } from 'react';

/**
 * AmbientCanvas: High-performance interactive particle & light aura canvas.
 * Creates a subtle living library atmosphere on pitch black with interactive mouse illumination.
 */
export default function AmbientCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouse = { x: width * 0.5, y: height * 0.3, targetX: width * 0.5, targetY: height * 0.3 };

    // Particles setup (library dust motes / glowing points)
    const particleCount = Math.min(Math.floor((width * height) / 25000), 65);
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25 - 0.08, // slight upward float
        size: Math.random() * 1.6 + 0.6,
        alpha: Math.random() * 0.35 + 0.1,
        baseAlpha: Math.random() * 0.35 + 0.1,
        phase: Math.random() * Math.PI * 2,
      });
    }

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    let lastTime = performance.now();

    const render = (time) => {
      animId = requestAnimationFrame(render);
      if (document.hidden) return;

      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Smooth mouse lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;

      ctx.clearRect(0, 0, width, height);

      // 1. Soft Interactive Ambient Light Aura tracking mouse
      const auraGradient = ctx.createRadialGradient(
        mouse.x,
        mouse.y,
        10,
        mouse.x,
        mouse.y,
        Math.max(width * 0.45, 450)
      );
      auraGradient.addColorStop(0, 'rgba(0, 113, 227, 0.08)'); // Subtle Apple Blue
      auraGradient.addColorStop(0.35, 'rgba(99, 102, 241, 0.03)'); // Indigo tint
      auraGradient.addColorStop(0.7, 'rgba(15, 23, 42, 0.01)');
      auraGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = auraGradient;
      ctx.fillRect(0, 0, width, height);

      // 2. Render and update ambient floating particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.phase += 0.02;

        // Wrap around bounds
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Proximity to mouse increases glow
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        let dynamicAlpha = p.baseAlpha + Math.sin(p.phase) * 0.1;
        if (dist < 200) {
          dynamicAlpha = Math.min(dynamicAlpha + (1 - dist / 200) * 0.45, 0.9);
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 230, 255, ${Math.max(0, dynamicAlpha)})`;
        ctx.shadowColor = 'rgba(0, 113, 227, 0.6)';
        ctx.shadowBlur = dist < 200 ? 8 : 2;
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-80"
      style={{ willChange: 'transform' }}
    />
  );
}
