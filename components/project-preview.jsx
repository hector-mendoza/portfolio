"use client";

import { projectSurface } from "@/lib/use-theme-mode";
import { cn } from "@/lib/utils";

export default function ProjectPreview({ project, hovered = false, className, aspectClass = "aspect-[16/10]" }) {
  const surface = projectSurface(project);
  const isVibe = project.title === "Vibe Theme";
  const isEmojiDay = project.title === "Emoji of the Day";

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gradient-to-br",
        surface.gradient,
        aspectClass,
        className,
      )}
    >
      {isVibe && (
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-500"
          style={{ opacity: hovered ? 1 : 0 }}
        >
          <div className="vibe-rainbow-glow absolute inset-0" />
        </div>
      )}

      {isEmojiDay && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden text-4xl transition-opacity duration-500"
          style={{ opacity: hovered ? 1 : 0 }}
        >
          <span className="animate-bounce">🎉</span>
        </div>
      )}

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(255,255,255,0.14),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_100%,rgba(0,0,0,0.22),transparent_55%)]" />

      <div className="absolute inset-3 flex flex-col overflow-hidden rounded-xl border border-white/10 bg-black/30 backdrop-blur-sm sm:inset-4">
        <div className="flex shrink-0 items-center gap-2 border-b border-white/10 px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
          <div className="mx-2 flex-1 truncate rounded-full bg-white/10 px-3 py-1">
            <span className="block truncate font-mono text-[10px] text-white/40">{project.preview.bar}</span>
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-end space-y-2 p-4">
          <div className="h-3 rounded-full bg-white/25" style={{ width: project.preview.lines[0] }} />
          <div className="h-2 rounded-full bg-white/12" style={{ width: project.preview.lines[1] }} />
          <div className="h-2 rounded-full bg-white/12" style={{ width: project.preview.lines[2] }} />
          <div className="mt-3 flex gap-2">
            <div className="h-7 w-24 rounded-lg" style={{ background: `${surface.accent}99` }} />
            <div className="h-7 w-16 rounded-lg bg-white/10" />
          </div>
          <div className="mt-1 h-2 rounded-full bg-white/10" style={{ width: project.preview.lines[3] }} />
        </div>
      </div>

      <div
        className="pointer-events-none absolute -bottom-8 left-1/2 h-24 w-48 -translate-x-1/2 rounded-full opacity-50 blur-2xl transition-all duration-500"
        style={{
          background:
            isVibe && hovered
              ? "linear-gradient(90deg, #4C1D95, #7C3AED, #D946EF, #EC4899, #22D3EE, #818CF8)"
              : isEmojiDay && hovered
                ? "linear-gradient(90deg, #FACC15, #FB923C, #F472B6, #FACC15)"
                : surface.accent,
        }}
      />
    </div>
  );
}
