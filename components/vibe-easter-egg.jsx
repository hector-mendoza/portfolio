"use client";

import { useEffect, useRef } from "react";

const PALETTE = [
  "#4C1D95", // Deep Violet
  "#7C3AED", // Electric Violet
  "#A855F7", // Bright Violet
  "#D946EF", // Fuchsia Pulse
  "#EC4899", // Hot Pink
  "#22D3EE", // Cyan Spark
  "#818CF8", // Indigo Haze
  "#C026D3", // Magenta Glow
];

const STAR_COUNT = 140;

export default function VibeEasterEgg({ active }) {
  const canvasRef   = useRef(null);
  const activeRef   = useRef(active);
  const alphaRef    = useRef(0);
  const gradXRef    = useRef(0);
  const rafRef      = useRef(null);
  const startRef    = useRef(null); // set by main effect, called by sync effect

  // Keep activeRef in sync and kick the loop when activation begins
  useEffect(() => {
    activeRef.current = active;
    if (active && !rafRef.current && startRef.current) {
      startRef.current();
    }
  }, [active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x:     Math.random() * window.innerWidth,
      y:     Math.random() * window.innerHeight,
      size:  Math.random() * 2.8 + 0.6,
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.6 + 0.2,
      dy:    -(Math.random() * 0.5 + 0.1),
      dx:    (Math.random() - 0.5) * 0.15,
    }));

    function draw() {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (activeRef.current) {
        alphaRef.current = Math.min(1, alphaRef.current + 0.055);
      } else {
        alphaRef.current = Math.max(0, alphaRef.current - 0.035);
      }

      if (alphaRef.current > 0) {
        // Rainbow sweep
        gradXRef.current = (gradXRef.current + 0.8) % (canvas.width * 2);
        const span = canvas.width * 2;
        const grd  = ctx.createLinearGradient(gradXRef.current - span, 0, gradXRef.current + span, canvas.height);
        PALETTE.forEach((c, i) => grd.addColorStop(i / (PALETTE.length - 1), c + "18"));
        ctx.globalAlpha = alphaRef.current;
        ctx.fillStyle   = grd;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Stars
        const t = Date.now() / 1000;
        for (const s of stars) {
          s.y += s.dy;
          s.x += s.dx;
          if (s.y < -20)               { s.y = canvas.height + 20; s.x = Math.random() * canvas.width; }
          if (s.x < -20)               s.x = canvas.width + 20;
          if (s.x > canvas.width + 20) s.x = -20;

          const twinkle = Math.pow((Math.sin(t * s.speed * 3 + s.phase) + 1) / 2, 1.4);
          const sz      = s.size * (0.35 + twinkle * 1.9);

          ctx.globalAlpha = alphaRef.current * twinkle * 0.9;
          ctx.fillStyle   = s.color;
          ctx.shadowColor = s.color;
          ctx.shadowBlur  = sz * 7;

          ctx.save();
          ctx.translate(s.x, s.y);
          ctx.beginPath();
          for (let i = 0; i < 4; i++) {
            const a  = (i / 4) * Math.PI * 2;
            ctx.lineTo(Math.cos(a) * sz, Math.sin(a) * sz);
            const ia = a + Math.PI / 4;
            ctx.lineTo(Math.cos(ia) * sz * 0.22, Math.sin(ia) * sz * 0.22);
          }
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }

        ctx.shadowBlur  = 0;
        ctx.globalAlpha = 1;

        rafRef.current = requestAnimationFrame(draw);
      } else {
        // Fully faded — pause until next hover
        rafRef.current = null;
      }
    }

    startRef.current = () => {
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(draw);
      }
    };

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      startRef.current = null;
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9990 }}
    />
  );
}
