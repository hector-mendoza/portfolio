export default function GlassGradientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="glass-gradient-base" />
      <div className="glass-gradient-mesh" />
      <div className="ambient-fog ambient-fog-1" />
      <div className="ambient-fog ambient-fog-2" />
      <div className="ambient-fog ambient-fog-3" />
      <div className="ambient-fog ambient-fog-4" />
      <div className="ambient-fog ambient-fog-5" />
      <div className="ambient-fog ambient-fog-6" />
      <div className="glass-gradient-shine" />
    </div>
  );
}
