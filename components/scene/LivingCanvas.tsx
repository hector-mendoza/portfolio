"use client";

import {
  getSceneState,
  getSceneUniforms,
  setScenePaused,
  setUniformResolution,
  setUniformTime,
  useScene,
} from "@/lib/scene/store";
import { useEffect, useRef, useState } from "react";
import { Renderer, Program, Mesh, Triangle } from "ogl";

const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;

uniform float uTime;
uniform float uProgress;
uniform float uHue;
uniform float uIntensity;
uniform float uFlow;
uniform vec2 uResolution;

out vec4 fragColor;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float wave = sin(uv.x * 6.283 + uTime * (0.4 + uFlow * 0.3)) * 0.5 + 0.5;
  float band = smoothstep(0.2, 0.85, uv.y + wave * 0.08 * uIntensity);
  vec3 rgb = vec3(
    uHue + uProgress * 0.05,
    uHue * 0.6 + band * 0.2,
    1.0 - uHue * 0.3
  );
  float alpha = band * 0.35 * uIntensity;
  fragColor = vec4(rgb * alpha, alpha);
}
`;

export default function LivingCanvas() {
  const scene = useScene();
  const phase = scene.phase;

  const hostRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (phase === "disabled") return;
    const idle =
      typeof requestIdleCallback !== "undefined"
        ? requestIdleCallback
        : (cb: IdleRequestCallback) =>
            window.setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 0 }), 1);
    const cancel =
      typeof cancelIdleCallback !== "undefined"
        ? cancelIdleCallback
        : clearTimeout;
    const id = idle(() => setReady(true));
    return () => cancel(id);
  }, [phase]);

  useEffect(() => {
    if (!ready || phase === "disabled") return;
    const t = window.requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, [ready, phase]);

  useEffect(() => {
    if (!ready || phase === "disabled") return;
    const host = hostRef.current;
    if (!host) return;

    const renderer = new Renderer({
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      dpr: Math.min(window.devicePixelRatio, 2),
    });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const geometry = new Triangle(gl);
    if (geometry.attributes.uv) {
      delete geometry.attributes.uv;
    }

    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uHue: { value: 0 },
        uIntensity: { value: 0 },
        uFlow: { value: 0 },
        uResolution: { value: [1, 1] },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });
    gl.canvas.style.cssText =
      "position:fixed;inset:0;width:100%;height:100%;display:block;pointer-events:none;";
    host.appendChild(gl.canvas);

    const syncUniforms = () => {
      const u = getSceneUniforms();
      program.uniforms.uTime.value = u.uTime;
      program.uniforms.uProgress.value = u.uProgress;
      program.uniforms.uHue.value = u.uHue;
      program.uniforms.uIntensity.value = u.uIntensity;
      program.uniforms.uFlow.value = u.uFlow;
      program.uniforms.uResolution.value = u.uResolution;
    };

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      setUniformResolution(w, h);
      syncUniforms();
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    let start = performance.now();

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const current = getSceneState();
      if (current.phase === "paused" || current.phase === "disabled") {
        return;
      }
      const t = (now - start) * 0.001;
      setUniformTime(t);
      syncUniforms();
      renderer.render({ scene: mesh });
    };
    raf = requestAnimationFrame(tick);

    const offscreenObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        setScenePaused("offscreen", !entry.isIntersecting);
      },
      { threshold: 0 }
    );
    offscreenObserver.observe(gl.canvas);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      offscreenObserver.disconnect();
      if (host.contains(gl.canvas)) {
        host.removeChild(gl.canvas);
      }
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [ready, phase]);

  if (phase === "disabled") {
    return null;
  }

  return (
    <div
      ref={hostRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-500"
      style={{ opacity: visible ? 1 : 0 }}
    />
  );
}
