"use client";

import { useEffect, useRef } from "react";

const EMOJIS = ["😀", "😂", "🥳", "😎", "🤯", "😱", "🥹", "😴", "🙃", "🤔", "☀️", "🌙", "🎉", "🫠", "😤", "🥸"];

const EMOJI_COUNT = 44;

export default function EmojiDayEasterEgg({ active }) {
  const canvasRef = useRef(null);
  const activeRef = useRef(active);
  const alphaRef  = useRef(0);
  const rafRef    = useRef(null);
  const startRef  = useRef(null);

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

    const bits = Array.from({ length: EMOJI_COUNT }, () => ({
      x:        Math.random() * window.innerWidth,
      y:        Math.random() * window.innerHeight + window.innerHeight,
      size:     Math.random() * 22 + 20,
      emoji:    EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      rot:      Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.03,
      dy:       -(Math.random() * 1.4 + 0.5),
      dx:       Math.sin(Math.random() * Math.PI) * 0.6,
      phase:    Math.random() * Math.PI * 2,
      wobble:   Math.random() * 0.8 + 0.4,
    }));

    function draw() {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (activeRef.current) {
        alphaRef.current = Math.min(1, alphaRef.current + 0.06);
      } else {
        alphaRef.current = Math.max(0, alphaRef.current - 0.04);
      }

      if (alphaRef.current > 0) {
        const t = Date.now() / 1000;
        ctx.textAlign    = "center";
        ctx.textBaseline = "middle";

        for (const b of bits) {
          b.y   += b.dy;
          b.x   += Math.sin(t * b.wobble + b.phase) * 0.8;
          b.rot += b.rotSpeed;

          if (b.y < -40) {
            b.y = canvas.height + 40;
            b.x = Math.random() * canvas.width;
          }

          const pulse = 0.85 + Math.sin(t * b.wobble * 2 + b.phase) * 0.15;

          ctx.save();
          ctx.globalAlpha = alphaRef.current;
          ctx.translate(b.x, b.y);
          ctx.rotate(Math.sin(t * 0.5 + b.phase) * 0.35 + b.rot * 0);
          ctx.scale(pulse, pulse);
          ctx.font = `${b.size}px sans-serif`;
          ctx.fillText(b.emoji, 0, 0);
          ctx.restore();
        }

        ctx.globalAlpha = 1;
        rafRef.current = requestAnimationFrame(draw);
      } else {
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
