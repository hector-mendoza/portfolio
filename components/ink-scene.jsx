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
  uniform vec2  uMouse;
  uniform vec2  uResolution;
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
    for (int i = 0; i < 5; i++) {
      v += noise(p) * a;
      p *= 2.1;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;

    vec2  mouse     = uMouse * 0.5 + 0.5;
    float mouseDist = distance(uv, mouse);
    float pull      = smoothstep(0.45, 0.0, mouseDist) * 0.25;

    float t  = uTime * 0.06;
    float n1 = fbm(uv * 2.8 + vec2(t, t * 0.6) + pull);
    float n2 = fbm(uv * 2.0 - vec2(t * 0.4, 0.0) + n1 * 0.55);
    float ink = smoothstep(0.35, 0.72, n2);

    vec3 parchment = vec3(0.941, 0.918, 0.839);
    vec3 inkCol    = vec3(0.165, 0.420, 0.271);

    vec3 col = mix(parchment, inkCol, ink * 0.20);
    gl_FragColor = vec4(col, 1.0);
  }
`;

function InkPlane() {
  const meshRef    = useRef(null);
  const mouseRef   = useRef(new THREE.Vector2(0, 0));
  const { viewport } = useThree();

  useEffect(() => {
    function onMove(e) {
      mouseRef.current.x =  (e.clientX / window.innerWidth)  * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const uniforms = useRef({
    uTime:       { value: 0 },
    uMouse:      { value: mouseRef.current },
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
  });

  useFrame(({ clock }) => {
    uniforms.current.uTime.value  = clock.getElapsedTime();
    uniforms.current.uMouse.value = mouseRef.current;
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
  return (
    <Canvas
      camera={{ position: [0, 0, 1], fov: 75 }}
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: false }}
      style={{ background: '#F0EAD6' }}
    >
      <InkPlane />
    </Canvas>
  );
}
