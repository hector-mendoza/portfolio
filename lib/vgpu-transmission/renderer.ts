import { surface, type Gpu, type Surface } from "vgpu";
import { acquireGpu } from "@/lib/vgpu-shared";
import { cameraView } from "./camera";
import { installWindowParallaxInput } from "./pointer-input";
import {
  DEFAULT_CONTROLS,
  aspectOf,
  createScene,
  destroyScene,
  renderScene,
  replaceTargets,
  type Scene,
} from "./scene";

interface TransmissionRendererOptions {
  readonly canvas: HTMLCanvasElement;
}

export function createTransmissionRenderer(options: TransmissionRendererOptions) {
  let disposed = false;
  let gpu: Gpu | undefined;
  let scene: Scene | undefined;
  let output: Surface | undefined;
  let input: ReturnType<typeof installWindowParallaxInput> | undefined;
  let unsubscribeResize: (() => void) | undefined;
  let animationFrame = 0;
  let previous = 0;
  let sawInitialResize = false;

  const onSurfaceResize = () => {
    if (!sawInitialResize) {
      sawInitialResize = true;
      return;
    }
    if (disposed || !gpu || !output || !scene) return;
    replaceTargets(gpu, scene, output.size);
  };

  const tick = (now: number) => {
    animationFrame = 0;
    if (disposed) return;
    if (!document.hidden && gpu && output && scene && input) {
      try {
        input.advance((now - previous) / 1000);
        renderScene(
          gpu,
          scene,
          output,
          () =>
            cameraView(
              input!.yaw,
              input!.pitch,
              aspectOf(output!),
              input!.radius,
            ),
          DEFAULT_CONTROLS,
        );
      } catch (error) {
        fail(error);
      }
    }
    previous = now;
    animationFrame = requestAnimationFrame(tick);
  };

  const dispose = () => {
    if (disposed) return;
    disposed = true;
    if (animationFrame) cancelAnimationFrame(animationFrame);
    unsubscribeResize?.();
    input?.dispose();
    if (scene) destroyScene(scene);
    scene = undefined;
    output?.dispose();
    output = undefined;
  };

  const fail = (error: unknown): never => {
    try {
      dispose();
    } catch {
      // Teardown must not replace the render failure.
    }
    throw error;
  };

  const initialize = async () => {
    if (disposed) return;

    const nextGpu = await acquireGpu();
    if (disposed) return;

    gpu = nextGpu;
    output = surface(gpu, options.canvas, { dpr: [1, 1.5] });
    const nextScene = await createScene(gpu, output);
    if (disposed) {
      destroyScene(nextScene);
      return;
    }

    scene = nextScene;
    input = installWindowParallaxInput();
    unsubscribeResize = output.onResize(onSurfaceResize);
    previous = performance.now();
    animationFrame = requestAnimationFrame(tick);
  };

  const ready = initialize().catch((error: unknown) => {
    if (disposed) return;
    fail(error);
  });

  return { ready, dispose };
}
