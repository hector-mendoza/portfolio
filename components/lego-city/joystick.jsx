"use client";

import { useRef } from "react";
import styles from "./lego-city.module.css";

/** Touch joystick: reports a normalised (x, z) vector, z negative = forward. */
export default function Joystick({ onMove }) {
  const ref = useRef(null);
  const knob = useRef(null);
  const active = useRef(null);

  const update = (e) => {
    const el = ref.current;
    if (!el || !active.current) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const max = rect.width / 2;
    let dx = (e.clientX - cx) / max;
    let dy = (e.clientY - cy) / max;
    const len = Math.hypot(dx, dy);
    if (len > 1) {
      dx /= len;
      dy /= len;
    }
    if (knob.current) knob.current.style.transform = `translate(${dx * max * 0.6}px, ${dy * max * 0.6}px)`;
    onMove(dx, dy);
  };

  return (
    <div
      ref={ref}
      className={styles.joystick}
      aria-label="Movement joystick"
      role="application"
      onPointerDown={(e) => {
        active.current = e.pointerId;
        e.currentTarget.setPointerCapture(e.pointerId);
        update(e);
      }}
      onPointerMove={update}
      onPointerUp={() => {
        active.current = null;
        if (knob.current) knob.current.style.transform = "translate(0,0)";
        onMove(0, 0);
      }}
      onPointerCancel={() => {
        active.current = null;
        if (knob.current) knob.current.style.transform = "translate(0,0)";
        onMove(0, 0);
      }}
    >
      <span ref={knob} className={styles.joystickKnob} />
    </div>
  );
}
