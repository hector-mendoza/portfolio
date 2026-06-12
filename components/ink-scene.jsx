'use client';

import { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */`
  precision highp float;
  uniform float uTime;
  uniform float uDark;
  varying vec2  vUv;

  float hash(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1,0)), f.x),
      mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x),
      f.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 6; i++) {
      v += noise(p) * a;
      p *= 2.1;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;

    float t = uTime * 0.22;

    // Layer 1: broad drift
    float n1 = fbm(uv * 2.0 + vec2(t * 1.2, t * 0.7));
    // Layer 2: counter-direction turbulence warped by layer 1
    float n2 = fbm(uv * 1.6 - vec2(t * 0.6, t * 0.85) + n1 * 0.45);
    // Layer 3: fine detail with swirl
    float n3 = fbm(uv * 3.0 + vec2(-t * 0.8, t * 0.45) + n2 * 0.35);

    float ink = smoothstep(0.28, 0.68, n2 * 0.55 + n3 * 0.45);

    vec3 lightBg  = vec3(0.941, 0.918, 0.839);
    vec3 darkBg   = vec3(0.068, 0.078, 0.072);
    vec3 lightInk = vec3(0.165, 0.420, 0.271);
    vec3 darkInk  = vec3(0.290, 0.588, 0.400);

    vec3 bg      = mix(lightBg,  darkBg,  uDark);
    vec3 fgColor = mix(lightInk, darkInk, uDark);

    float maxBlend = mix(0.38, 0.28, uDark);
    vec3 col = mix(bg, fgColor, ink * maxBlend);
    gl_FragColor = vec4(col, 1.0);
  }
`;

function InkPlane() {
  const meshRef = useRef(null);
  const { viewport } = useThree();

  const uniforms = useRef({
    uTime: { value: 0 },
    uDark: { value: document.documentElement.classList.contains('dark') ? 1.0 : 0.0 },
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      uniforms.current.uDark.value = document.documentElement.classList.contains('dark') ? 1.0 : 0.0;
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useFrame(({ clock }) => {
    uniforms.current.uTime.value = clock.getElapsedTime();
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[viewport.width, viewport.height]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms.current}
      />
    </mesh>
  );
}

export default function InkScene() {
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  return (
    <Canvas
      camera={{ position: [0, 0, 1], fov: 75 }}
      dpr={[1, 1.5]}
      frameloop="always"
      gl={{ antialias: false, alpha: false }}
      style={{ background: isDark ? '#111313' : '#F0EAD6' }}
    >
      <InkPlane />
    </Canvas>
  );
}
