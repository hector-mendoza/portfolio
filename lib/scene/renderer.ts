import type { RenderTier } from "./schedule";
import type { SceneUniforms } from "./uniforms";

export type SceneMountOptions = {
  scale: number;
  dprCap: number;
};

export type SceneRenderer = {
  mount: (el: HTMLElement, options: SceneMountOptions) => void;
  setTier: (tier: RenderTier) => void;
  frame: (uniforms: SceneUniforms) => void;
  pause: () => void;
  dispose: () => void;
};
