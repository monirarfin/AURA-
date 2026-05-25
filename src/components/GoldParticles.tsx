import { useEffect, useRef } from "react";

interface GoldParticlesProps {
  density?: number;
}

export function GoldParticles({ density = 45 }: GoldParticlesProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      c.width = c.offsetWidth || 390;
      c.height = c.offsetHeight || 844;
    };
    resize();
    window.addEventListener("resize", resize);

    const pts = Array.from({ length: density }, () => ({
      x: Math.random() * c.width,
      y: Math.random() * c.height,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.22,
      vy: -(Math.random() * 0.35 + 0.08),
      alpha: Math.random() * 0.55 + 0.1,
      phase: Math.random() * Math.PI * 2,
    }));

    let raf: number;
    const draw = () => {
      if (!ctx || !c) return;
      ctx.clearRect(0, 0, c.width, c.height);
      for (const p of pts) {
        p.phase += 0.015;
        p.x += p.vx + Math.sin(p.phase) * 0.22;
        p.y += p.vy;
        if (p.y < -4) {
          p.y = c.height + 4;
          p.x = Math.random() * c.width;
        }
        const s = 0.32 + 0.68 * Math.abs(Math.sin(p.phase));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201, 168, 76, ${p.alpha * s})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [density]);

  return (
    <canvas
      ref={ref}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
      }}
    />
  );
}
