'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

const SIZE_DEFAULT = 40;
const SIZE_LINK    = 68;

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const dotRef    = useRef(null);
  const labelRef  = useRef(null);
  const t1Ref     = useRef(null);
  const t2Ref     = useRef(null);
  const t3Ref     = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return;

    const cursor = cursorRef.current;
    const dot    = dotRef.current;
    const label  = labelRef.current;

    const pos = (el, dur) => ({
      x: gsap.quickTo(el, 'x', { duration: dur, ease: 'power3.out' }),
      y: gsap.quickTo(el, 'y', { duration: dur, ease: 'power3.out' }),
    });
    const main = pos(cursor,    0.4);
    const p1   = pos(t1Ref.current, 0.55);
    const p2   = pos(t2Ref.current, 0.70);
    const p3   = pos(t3Ref.current, 0.85);

    function move(e) {
      const { clientX: x, clientY: y } = e;
      main.x(x); main.y(y);
      p1.x(x);   p1.y(y);
      p2.x(x);   p2.y(y);
      p3.x(x);   p3.y(y);
    }

    function over(e) {
      const el = e.target.closest('[data-cursor]');
      if (!el) return;
      const type = el.dataset.cursor;
      if (type === 'link') {
        gsap.to(cursor, { width: SIZE_LINK, height: SIZE_LINK, backgroundColor: '#2A6B45', duration: 0.3, ease: 'power2.out' });
        gsap.to(dot,    { opacity: 0, duration: 0.15 });
        label.textContent = el.dataset.cursorLabel ?? '';
        gsap.to(label,  { opacity: 1, duration: 0.2 });
      } else if (type === 'text') {
        gsap.to(cursor, { width: 3, height: 20, duration: 0.25 });
      } else if (type === 'none') {
        gsap.to(cursor, { opacity: 0, duration: 0.2 });
      }
    }

    function out(e) {
      const el = e.target.closest('[data-cursor]');
      if (!el) return;
      gsap.to(cursor, {
        width: SIZE_DEFAULT, height: SIZE_DEFAULT,
        backgroundColor: 'transparent', opacity: 1,
        duration: 0.35, ease: 'power2.out',
      });
      gsap.to(dot,   { opacity: 1, duration: 0.2 });
      gsap.to(label, { opacity: 0, duration: 0.15 });
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

  const base = {
    position: 'fixed',
    borderRadius: '50%',
    pointerEvents: 'none',
    zIndex: 9999,
    transform: 'translate(-50%, -50%)',
  };

  const trail = (size, opacity) => ({
    ...base,
    width: size,
    height: size,
    background: `rgba(42,107,69,${opacity})`,
    zIndex: 9997,
  });

  return (
    <>
      <div ref={t3Ref} style={trail(6,  0.15)} />
      <div ref={t2Ref} style={trail(10, 0.22)} />
      <div ref={t1Ref} style={trail(16, 0.35)} />
      <div
        ref={cursorRef}
        style={{
          ...base,
          width: SIZE_DEFAULT,
          height: SIZE_DEFAULT,
          border: '1.5px solid #2A6B45',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mixBlendMode: 'multiply',
        }}
      >
        <div
          ref={dotRef}
          style={{ width: 4, height: 4, borderRadius: '50%', background: '#2A6B45' }}
        />
        <span
          ref={labelRef}
          style={{
            position: 'absolute',
            fontSize: 9,
            fontFamily: 'var(--font-space-mono), monospace',
            color: '#F0EAD6',
            opacity: 0,
            whiteSpace: 'nowrap',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        />
      </div>
    </>
  );
}
