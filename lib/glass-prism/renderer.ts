import { clock, effect, frameLoop, surface } from "vgpu";
import type { FrameLoopHandle } from "vgpu";
import glassPrismShader from "@/shaders/glass-prism.wgsl";
import { acquireGpu } from "@/lib/vgpu-shared";

export function startGlassPrismRenderer(
  canvas: HTMLCanvasElement,
  options?: {
    animate?: boolean;
    onReady?: () => void;
    onUnavailable?: () => void;
  },
): () => void {
  const animate = options?.animate ?? true;
  let disposed = false;
  let loop: FrameLoopHandle | undefined;
  let pointer = { x: 0.5, y: 0.5 };

  const onPointerMove = (event: PointerEvent) => {
    pointer = {
      x: event.clientX / Math.max(1, window.innerWidth),
      y: event.clientY / Math.max(1, window.innerHeight),
    };
  };

  void (async () => {
    try {
      const gpu = await acquireGpu();
      if (disposed) return;

      const canvasSurface = surface(gpu, canvas, { dpr: [1, 1.5] });
      const prism = effect(gpu, glassPrismShader, {
        label: "glass-prism",
        set: {
          params: {
            time: 0,
            resolution: canvasSurface.texelSize,
            pointer: [0.5, 0.5],
          },
        },
      });

      canvasSurface.onResize(() => {
        prism.set({
          params: {
            resolution: canvasSurface.texelSize,
          },
        });
      });

      const time = clock(gpu);
      window.addEventListener("pointermove", onPointerMove, { passive: true });

      if (animate) {
        loop = frameLoop(gpu, (frame) => {
          prism.set({
            params: {
              time: time.time,
              pointer: [pointer.x, pointer.y],
            },
          });
          frame.pass(canvasSurface, prism);
        });
      } else {
        prism.set({
          params: {
            time: 0,
            pointer: [pointer.x, pointer.y],
          },
        });
        prism.draw(canvasSurface);
      }

      options?.onReady?.();
    } catch {
      options?.onUnavailable?.();
      loop?.stop();
    }
  })();

  return () => {
    disposed = true;
    loop?.stop();
    window.removeEventListener("pointermove", onPointerMove);
  };
}
