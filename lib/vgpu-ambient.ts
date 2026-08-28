import { clock, effect, frameLoop, init, surface } from "vgpu";
import type { FrameLoopHandle } from "vgpu";
import ambientShader from "@/shaders/ambient.wgsl";

export function startAmbientRenderer(
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
  let gpu: Awaited<ReturnType<typeof init>> | undefined;

  void (async () => {
    try {
      gpu = await init();
      if (disposed) {
        gpu.dispose();
        return;
      }

      const canvasSurface = surface(gpu, canvas, { dpr: [1, 1.5] });
      const ambient = effect(gpu, ambientShader, {
        label: "ambient",
        set: { params: { time: 0, texel: canvasSurface.texelSize } },
      });

      canvasSurface.onResize(() => {
        ambient.set({ params: { texel: canvasSurface.texelSize } });
      });

      const time = clock(gpu);

      if (animate) {
        loop = frameLoop(gpu, (frame) => {
          ambient.set({ params: { time: time.time, texel: canvasSurface.texelSize } });
          frame.pass(canvasSurface, ambient);
        });
      } else {
        ambient.set({ params: { time: 0, texel: canvasSurface.texelSize } });
        ambient.draw(canvasSurface);
      }

      options?.onReady?.();
    } catch {
      options?.onUnavailable?.();
      loop?.stop();
      gpu?.dispose();
    }
  })();

  return () => {
    disposed = true;
    loop?.stop();
    gpu?.dispose();
  };
}
