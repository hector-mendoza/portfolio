'use client';

import { useRef, useEffect } from 'react';
import { gsap } from '@/lib/gsap';

export default function MagneticButton({ children, className = '', style = {}, ...props }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(hover: none)').matches) return;

    const MAX = 20;

    function onMove(e) {
      const r = el.getBoundingClientRect();
      const dx = ((e.clientX - (r.left + r.width  / 2)) / (r.width  / 2)) * MAX;
      const dy = ((e.clientY - (r.top  + r.height / 2)) / (r.height / 2)) * MAX;
      gsap.to(el, { x: dx, y: dy, duration: 0.4, ease: 'power2.out' });
    }

    function onLeave() {
      gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
    }

    el.addEventListener('mousemove',  onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove',  onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <div ref={ref} className={className} style={{ display: 'inline-block', ...style }} {...props}>
      {children}
    </div>
  );
}
