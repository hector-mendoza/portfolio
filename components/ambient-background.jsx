"use client";

export default function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div className="ambient-fog ambient-fog-1" />
      <div className="ambient-fog ambient-fog-2" />
      <div className="ambient-fog ambient-fog-3" />
      <div className="ambient-fog ambient-fog-4" />
      <div className="ambient-fog ambient-fog-5" />
      <div className="ambient-fog ambient-fog-6" />
    </div>
  );
}
