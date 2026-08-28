import { init } from "vgpu";
import type { Gpu } from "vgpu";

let gpuPromise: Promise<Gpu> | null = null;

export function acquireGpu(): Promise<Gpu> {
  if (!gpuPromise) {
    gpuPromise = init().catch((error) => {
      gpuPromise = null;
      throw error;
    });
  }

  return gpuPromise;
}

export function releaseGpu(): void {
  gpuPromise = null;
}
