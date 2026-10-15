import type { SceneUniforms } from "./uniforms";

export type SceneRenderer = {
  mount: (el: HTMLElement, dpr: number) => void;
  frame: (uniforms: SceneUniforms) => void;
  pause: () => void;
  dispose: () => void;
};
