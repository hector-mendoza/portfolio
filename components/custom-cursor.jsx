'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

export default function CustomCursor() {
  const diamondRef = useRef(null);
  const dotRef     = useRef(null);
  const labelRef   = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return;

    const diamond = diamondRef.current;
    const dot     = dotRef.current;
    const label   = labelRef.current;

    // Initialise transforms via GSAP so it owns the whole transform string
    gsap.set(diamond, { xPercent: -50, yPercent: -50, rotation: 45 });
    gsap.set(dot,     { xPercent: -50, yPercent: -50 });

    const moveDiamond = {
      x: gsap.quickTo(diamond, 'x', { duration: 0.38, ease: 'power3.out' }),
      y: gsap.quickTo(diamond, 'y', { duration: 0.38, ease: 'power3.out' }),
    };
    const moveDot = {
      x: gsap.quickTo(dot, 'x', { duration: 0.05, ease: 'none' }),
      y: gsap.quickTo(dot, 'y', { duration: 0.05, ease: 'none' }),
    };

    function move(e) {
      const { clientX: x, clientY: y } = e;
      moveDiamond.x(x); moveDiamond.y(y);
      moveDot.x(x);     moveDot.y(y);
    }

    function over(e) {
      const el = e.target.closest('[data-cursor]');
      if (!el) return;
      const type = el.dataset.cursor;

      if (type === 'link') {
        gsap.to(diamond, {
          width: 52, height: 52, rotation: 0, borderRadius: 6,
          backgroundColor: 'rgba(42,107,69,0.14)', borderColor: '#2A6B45',
          borderWidth: 1.5, duration: 0.28, ease: 'back.out(2)',
        });
        gsap.to(dot, { opacity: 0, duration: 0.12 });
        label.textContent = el.dataset.cursorLabel ?? '';
        gsap.to(label, { opacity: 1, duration: 0.18 });

      } else if (type === 'text') {
        gsap.to(diamond, {
          width: 2, height: 22, rotation: 0, borderRadius: 1,
          backgroundColor: 'rgba(42,107,69,0.7)',
          duration: 0.18, ease: 'power2.out',
        });
        gsap.to(dot, { opacity: 0, duration: 0.12 });

      } else if (type === 'none') {
        gsap.to(diamond, { opacity: 0, duration: 0.15 });
        gsap.to(dot,     { opacity: 0, duration: 0.12 });
      }
    }

    function out(e) {
      const el = e.target.closest('[data-cursor]');
      if (!el) return;
      gsap.to(diamond, {
        width: 20, height: 20, rotation: 45, borderRadius: 2,
        backgroundColor: 'transparent', borderColor: 'rgba(42,107,69,0.65)',
        borderWidth: 1.5, opacity: 1, duration: 0.32, ease: 'power2.out',
      });
      gsap.to(dot,   { opacity: 1, duration: 0.18 });
      gsap.to(label, { opacity: 0, duration: 0.12 });
    }

    window.addEventListener('mousemove',   move);
    document.addEventListener('mouseover', over);
    document.addEventListener('mouseout',  out);
    return () => {
      window.removeEventListener('mousemove',   move);
      document.removeEventListener('mouseover', over);
      document.removeEventListener('mouseout',  out);
    };
  }, []);

  return (
    <>
      {/* Diamond shape — lags slightly behind */}
      <div
        ref={diamondRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 20,
          height: 20,
          borderRadius: 2,
          border: '1.5px solid rgba(42,107,69,0.65)',
          pointerEvents: 'none',
          zIndex: 9998,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          ref={labelRef}
          style={{
            position: 'absolute',
            fontSize: 8,
            fontFamily: 'var(--font-space-mono), monospace',
            color: '#2A6B45',
            opacity: 0,
            whiteSpace: 'nowrap',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        />
      </div>

      {/* Dot — tracks instantly */}
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 4,
          height: 4,
          borderRadius: '50%',
          background: 'rgba(42,107,69,0.8)',
          pointerEvents: 'none',
          zIndex: 9999,
        }}
      />
    </>
  );
}
