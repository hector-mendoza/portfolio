"use client";

/**
 * Temporary placement marker for the planned ChatGPT-style orb (vgpu).
 * Visual only — no WebGPU yet. Remove once the real orb ships.
 */
export default function ChatGPTOrbPlacement({
  size = 56,
  label = "vgpu orb",
  className = "",
}) {
  return (
    <div
      className={`relative flex flex-col items-center justify-center gap-1.5 ${className}`}
      style={{ width: size + 8, height: size + 8 }}
      aria-label="Planned ChatGPT orb placement (vgpu)"
    >
      <div
        className="relative rounded-full border border-dashed border-primary/55 bg-primary/5 shadow-[0_0_28px_hsl(var(--primary)/0.18)]"
        style={{ width: size, height: size }}
      >
        <div className="absolute inset-[18%] rounded-full border border-primary/25 bg-gradient-to-br from-primary/25 via-transparent to-accent/20" />
        <div className="absolute inset-0 animate-pulse rounded-full bg-primary/10" />
      </div>
      <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-primary/80">
        {label}
      </span>
    </div>
  );
}
