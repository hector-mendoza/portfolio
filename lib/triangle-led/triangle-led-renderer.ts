import { clock, frameLoop, surface, type Gpu, type Surface } from "vgpu";
import { acquireGpu } from "@/lib/vgpu-shared";
import { createHeroRenderer, type HeroRenderer } from "./scene-renderer";
import { DEFAULT_BRUSH, canonicalTriangleGeometry, type RenderSize } from "./settings";
import { brushState, heroStateForActiveClick, simulationBrushState } from "./sim-sizing";
import { DEFAULT_TRIANGLE_LED_CONTROLS } from "./types";

type InputMode = "canvas" | "window";

interface TriangleLedRendererOptions {
  readonly canvas: HTMLCanvasElement;
  readonly interactive?: boolean;
  readonly input?: InputMode;
  readonly dpr?: [number, number];
}

export function createTriangleLedRenderer(options: TriangleLedRendererOptions) {
  const interactive = options.interactive ?? true;
  const inputMode = options.input ?? "canvas";
  const dpr = options.dpr ?? [1, 1.5];
  let disposed = false;
  let gpu: Gpu | undefined;
  let canvasSurface: Surface | undefined;
  let scene: HeroRenderer | undefined;
  let loop: { stop(): void } | undefined;
  let observer: ResizeObserver | undefined;
  let input: ReturnType<typeof installCanvasInput> | undefined;
  let resizeFrame = 0;
  let resizeGeneration = 0;
  let pendingSize: RenderSize | undefined;
  let lastDpr = typeof window === "undefined" ? 1 : window.devicePixelRatio;
  const mode = DEFAULT_TRIANGLE_LED_CONTROLS.mode;

  const fail = (error: unknown): never => {
    dispose();
    throw error;
  };

  const applyResize = () => {
    resizeFrame = 0;
    const size = pendingSize;
    pendingSize = undefined;
    if (disposed || !size || !scene || !canvasSurface) return;
    const generation = ++resizeGeneration;
    try {
      scene.rebuild({ width: size.width, height: size.height, dpr: canvasSurface.dpr });
      scene.setOutputTarget(canvasSurface);
      void scene.prewarm().catch((error: unknown) => {
        if (disposed || generation !== resizeGeneration) return;
        fail(error);
      });
    } catch (error) {
      if (disposed || generation !== resizeGeneration) return;
      fail(error);
    }
  };

  const resize = (size: RenderSize) => {
    if (disposed || size.width <= 0 || size.height <= 0) return;
    pendingSize = size;
    if (!resizeFrame) resizeFrame = requestAnimationFrame(applyResize);
  };

  const measure = () => {
    const rect = options.canvas.getBoundingClientRect();
    resize({ width: rect.width, height: rect.height });
  };

  const onWindowResize = () => {
    if (window.devicePixelRatio === lastDpr) return;
    lastDpr = window.devicePixelRatio;
    measure();
  };

  const dispose = () => {
    if (disposed) return;
    disposed = true;
    resizeGeneration++;
    loop?.stop();
    loop = undefined;
    if (resizeFrame) cancelAnimationFrame(resizeFrame);
    resizeFrame = 0;
    pendingSize = undefined;
    observer?.disconnect();
    observer = undefined;
    if (typeof window !== "undefined") window.removeEventListener("resize", onWindowResize);
    input?.dispose();
    input = undefined;
    scene?.destroy();
    scene = undefined;
    canvasSurface?.dispose();
    canvasSurface = undefined;
    gpu = undefined;
  };

  const initialize = async () => {
    if (disposed) return;

    const nextGpu = await acquireGpu();
    if (disposed) return;

    gpu = nextGpu;
    canvasSurface = surface(gpu, options.canvas, { dpr });
    const nextScene = createHeroRenderer(gpu, {
      theme: "dark",
      css: cssSizeOf(options.canvas, canvasSurface.dpr),
    });
    scene = nextScene;
    nextScene.setOutputTarget(canvasSurface);
    nextScene.setHero(heroStateForActiveClick(mode));
    await nextScene.prewarm();
    if (disposed) {
      nextScene.destroy();
      return;
    }

    if (interactive) {
      input =
        inputMode === "window"
          ? installWindowInput(options.canvas)
          : installCanvasInput(options.canvas);
    } else {
      input = idleInput(options.canvas);
    }

    observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(measure);
    observer?.observe(options.canvas);
    window.addEventListener("resize", onWindowResize);
    measure();

    const time = clock(gpu);
    loop = frameLoop(gpu, (currentFrame) => {
      if (disposed || !scene || !input || !gpu) return;
      scene.setBrush(input.brush());
      scene.setRgbDeployActive(input.rgbDeployActive());
      scene.renderFrame(currentFrame, { time: time.time, dt: time.deltaTime });
    });
  };

  const ready = initialize().catch((error: unknown) => {
    if (disposed) return;
    fail(error);
  });

  return { ready, dispose };
}

function cssSizeOf(canvas: HTMLCanvasElement, surfaceDpr: Surface["dpr"]) {
  const rect = canvas.getBoundingClientRect();
  return {
    width: Math.max(1, rect.width || canvas.clientWidth || canvas.width / surfaceDpr),
    height: Math.max(1, rect.height || canvas.clientHeight || canvas.height / surfaceDpr),
    dpr: surfaceDpr,
  };
}

function idleInput(canvas: HTMLCanvasElement) {
  const tick = () => {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    return simulationBrushState(
      DEFAULT_BRUSH,
      {
        x: width * 0.5,
        y: height * 0.42,
        active: true,
        inside: true,
        isMouse: false,
      },
      height,
    );
  };

  return {
    brush: tick,
    rgbDeployActive: () => false,
    dispose() {},
  };
}

function installWindowInput(canvas: HTMLCanvasElement) {
  let currentBrush = brushState(DEFAULT_BRUSH);
  let deployActive = false;

  const updateFromClient = (clientX: number, clientY: number, isMouse: boolean) => {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    currentBrush = simulationBrushState(
      DEFAULT_BRUSH,
      {
        x: Math.max(0, Math.min(width, x)),
        y: Math.max(0, Math.min(height, y)),
        active: true,
        inside: isPointInsideTriangle({ x, y }, { width, height }),
        isMouse,
      },
      height,
    );
  };

  const onMove = (event: PointerEvent) => {
    if (!event.isPrimary) return;
    updateFromClient(event.clientX, event.clientY, event.pointerType === "mouse");
  };

  const onDown = (event: PointerEvent) => {
    if (!event.isPrimary) return;
    updateFromClient(event.clientX, event.clientY, event.pointerType === "mouse");
    deployActive = !deployActive;
  };

  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("pointerdown", onDown, { passive: true });

  return {
    brush: () => currentBrush,
    rgbDeployActive: () => deployActive,
    dispose() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
    },
  };
}

function installCanvasInput(canvas: HTMLCanvasElement) {
  let currentBrush = brushState(DEFAULT_BRUSH);
  let deployActive = false;
  let activePointer: number | undefined;
  const previousTouchAction = canvas.style.touchAction;
  canvas.style.touchAction = "none";

  const leave = () => {
    currentBrush = brushState(DEFAULT_BRUSH);
  };

  const update = (event: PointerEvent) => {
    if (!event.isPrimary || (activePointer !== undefined && event.pointerId !== activePointer)) {
      return false;
    }
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    if (x < 0 || x > width || y < 0 || y > height) {
      leave();
      return false;
    }
    currentBrush = simulationBrushState(
      DEFAULT_BRUSH,
      {
        x,
        y,
        active: true,
        inside: isPointInsideTriangle({ x, y }, { width, height }),
        isMouse: event.pointerType === "mouse",
      },
      height,
    );
    return true;
  };

  const down = (event: PointerEvent) => {
    if (!event.isPrimary || activePointer !== undefined) return;
    activePointer = event.pointerId;
    canvas.setPointerCapture?.(event.pointerId);
    update(event);
  };

  const move = (event: PointerEvent) => {
    update(event);
  };

  const up = (event: PointerEvent) => {
    if (!event.isPrimary || (activePointer !== undefined && event.pointerId !== activePointer)) {
      return;
    }
    if (update(event)) deployActive = !deployActive;
    if (canvas.hasPointerCapture?.(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
    activePointer = undefined;
  };

  const cancel = (event: PointerEvent) => {
    if (event.pointerId !== activePointer) return;
    if (canvas.hasPointerCapture?.(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
    activePointer = undefined;
    leave();
  };

  const pointerLeave = () => {
    if (activePointer === undefined) leave();
  };

  canvas.addEventListener("pointerdown", down);
  canvas.addEventListener("pointermove", move, { passive: true });
  canvas.addEventListener("pointerup", up, { passive: true });
  canvas.addEventListener("pointercancel", cancel);
  canvas.addEventListener("pointerleave", pointerLeave);

  return {
    brush: () => currentBrush,
    rgbDeployActive: () => deployActive,
    dispose() {
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", cancel);
      canvas.removeEventListener("pointerleave", pointerLeave);
      if (activePointer !== undefined && canvas.hasPointerCapture?.(activePointer)) {
        canvas.releasePointerCapture(activePointer);
      }
      activePointer = undefined;
      canvas.style.touchAction = previousTouchAction;
    },
  };
}

function isPointInsideTriangle(
  point: { x: number; y: number },
  size: { width: number; height: number },
) {
  const { top, left, right } = canonicalTriangleGeometry(size);
  const side = (a: typeof top, b: typeof top) =>
    (b.x - a.x) * (point.y - a.y) - (b.y - a.y) * (point.x - a.x);
  const a = side(top, left);
  const b = side(left, right);
  const c = side(right, top);
  return (a <= 0 && b <= 0 && c <= 0) || (a >= 0 && b >= 0 && c >= 0);
}
