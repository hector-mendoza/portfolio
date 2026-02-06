"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Float,
  MeshDistortMaterial,
  MeshWobbleMaterial,
  Environment,
} from "@react-three/drei";
import { useRef, useMemo, useState, useEffect } from "react";
import * as THREE from "three";

function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const handleScroll = () => {
      const heroSection = document.getElementById('hero');
      if (heroSection) {
        const rect = heroSection.getBoundingClientRect();
        const sectionHeight = rect.height;
        const scrolledPastSection = -rect.top;
        const progressValue = Math.max(0, Math.min(1, scrolledPastSection / sectionHeight));
        setProgress(progressValue);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial call
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return progress;
}

function WebGLContextGuard({ onContextLost }) {
  const gl = useThree((state) => state.gl);
  const invalidate = useThree((state) => state.invalidate);
  const lostRef = useRef(false);

  useEffect(() => {
    if (!gl?.domElement) return;
    const canvas = gl.domElement;

    const handleContextLost = (event) => {
      event.preventDefault();
      if (!lostRef.current) {
        lostRef.current = true;
        onContextLost?.();
      }
    };

    const handleContextRestored = () => {
      lostRef.current = false;
      invalidate();
    };

    canvas.addEventListener("webglcontextlost", handleContextLost, false);
    canvas.addEventListener("webglcontextrestored", handleContextRestored, false);

    return () => {
      canvas.removeEventListener("webglcontextlost", handleContextLost, false);
      canvas.removeEventListener("webglcontextrestored", handleContextRestored, false);
    };
  }, [gl, invalidate, onContextLost]);

  return null;
}

function FloatingTorus({ scrollProgress }) {
  const meshRef = useRef(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.3 + scrollProgress * Math.PI * 2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
      meshRef.current.position.x = 3 + Math.sin(scrollProgress * Math.PI * 4) * 2;
      meshRef.current.position.y = 1 - scrollProgress * 3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
      <mesh ref={meshRef} position={[3, 1, -2]}>
        <torusGeometry args={[1, 0.4, 16, 32]} />
        <MeshDistortMaterial
          color="#e07040"
          roughness={0.2}
          metalness={0.8}
          distort={0.3}
          speed={3}
        />
      </mesh>
    </Float>
  );
}

function FloatingIcosahedron({ scrollProgress }) {
  const meshRef = useRef(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.15 + scrollProgress * Math.PI;
      meshRef.current.position.y = -1 + Math.cos(scrollProgress * Math.PI * 3) * 3;
      meshRef.current.position.x = -3.5 + scrollProgress * 2;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={2} floatIntensity={1.5}>
      <mesh ref={meshRef} position={[-3.5, -1, -1]}>
        <icosahedronGeometry args={[1.2, 0]} />
        <MeshWobbleMaterial
          color="#c04070"
          roughness={0.15}
          metalness={0.9}
          factor={0.4}
          speed={2}
          wireframe
        />
      </mesh>
    </Float>
  );
}

function FloatingOctahedron({ scrollProgress }) {
  const meshRef = useRef(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.4 + scrollProgress * Math.PI * 3;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
      const s = 1 + scrollProgress * 0.5;
      meshRef.current.scale.set(s, s, s);
      meshRef.current.position.y = -2.5 + scrollProgress * 4;
    }
  });

  return (
    <Float speed={3} rotationIntensity={1} floatIntensity={3}>
      <mesh ref={meshRef} position={[2, -2.5, -3]}>
        <octahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial
          color="#e07040"
          roughness={0.1}
          metalness={1}
          transparent
          opacity={0.7}
        />
      </mesh>
    </Float>
  );
}

function FloatingKnot({ scrollProgress }) {
  const meshRef = useRef(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.15;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.25 + scrollProgress * Math.PI;
      meshRef.current.position.x = -4 + Math.sin(scrollProgress * Math.PI * 2) * 3;
      meshRef.current.position.y = 3 - scrollProgress * 2.5;
    }
  });

  return (
    <Float speed={1} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef} position={[-4, 3, -4]}>
        <torusKnotGeometry args={[0.6, 0.2, 64, 16]} />
        <MeshDistortMaterial
          color="#e07040"
          roughness={0.15}
          metalness={0.9}
          distort={0.2}
          speed={2}
        />
      </mesh>
    </Float>
  );
}

function FloatingDodecahedron({ scrollProgress }) {
  const meshRef = useRef(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.1 + scrollProgress * Math.PI * 2;
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.2;
      meshRef.current.position.y = 2 + Math.sin(scrollProgress * Math.PI * 5) * 2;
      meshRef.current.position.x = 4.5 - scrollProgress * 3;
    }
  });

  return (
    <Float speed={2.5} rotationIntensity={1.5} floatIntensity={1}>
      <mesh ref={meshRef} position={[4.5, 2, -5]}>
        <dodecahedronGeometry args={[0.7, 0]} />
        <meshStandardMaterial
          color="#e07040"
          roughness={0.05}
          metalness={1}
          transparent
          opacity={0.6}
          wireframe
        />
      </mesh>
    </Float>
  );
}

function FloatingCone({ scrollProgress }) {
  const meshRef = useRef(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.x = Math.PI * 0.5 + scrollProgress * Math.PI;
      meshRef.current.position.y = -3 + scrollProgress * 5;
      meshRef.current.position.x = 5 - scrollProgress * 2;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={2.5}>
      <mesh ref={meshRef} position={[5, -3, -3]}>
        <coneGeometry args={[0.5, 1.2, 6]} />
        <meshStandardMaterial
          color="#c04070"
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.8}
        />
      </mesh>
    </Float>
  );
}

function ParticleField({ scrollProgress }) {
  const particlesRef = useRef(null);

  const particles = useMemo(() => {
    const count = 300;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 25;
      positions[i + 1] = (Math.random() - 0.5) * 25;
      positions[i + 2] = (Math.random() - 0.5) * 25;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02 + scrollProgress * 0.5;
      particlesRef.current.rotation.x = state.clock.elapsedTime * 0.01;
      particlesRef.current.position.y = -scrollProgress * 3;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles, 3]}
          count={particles.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        color="#e07040"
        transparent
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  );
}

function FloatingSphere({ scrollProgress }) {
  const meshRef = useRef(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.5 + 2;
      meshRef.current.position.z = -4 + scrollProgress * 3;
      const s = 0.6 + Math.sin(scrollProgress * Math.PI * 3) * 0.3;
      meshRef.current.scale.set(s, s, s);
    }
  });

  return (
    <Float speed={1} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} position={[-2, 2, -4]}>
        <sphereGeometry args={[1, 32, 32]} />
        <MeshDistortMaterial
          color="#e07040"
          roughness={0.05}
          metalness={1}
          distort={0.5}
          speed={4}
          transparent
          opacity={0.4}
        />
      </mesh>
    </Float>
  );
}

function ScrollReactiveLights({ scrollProgress }) {
  const lightRef = useRef(null);

  useFrame(() => {
    if (lightRef.current) {
      lightRef.current.intensity = 0.4 + scrollProgress * 0.6;
      lightRef.current.position.x = Math.sin(scrollProgress * Math.PI * 2) * 5;
    }
  });

  return (
    <pointLight ref={lightRef} position={[0, 0, 5]} intensity={0.4} color="#c04070" />
  );
}

function SceneContent() {
  const scrollProgress = useScrollProgress();

  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} />
      <pointLight position={[-5, -5, -5]} intensity={0.4} color="#e07040" />
      <spotLight position={[0, 10, 0]} intensity={0.3} angle={0.3} penumbra={1} color="#c04070" />
      <ScrollReactiveLights scrollProgress={scrollProgress} />

      <FloatingTorus scrollProgress={scrollProgress} />
      <FloatingIcosahedron scrollProgress={scrollProgress} />
      <FloatingOctahedron scrollProgress={scrollProgress} />
      <FloatingSphere scrollProgress={scrollProgress} />
      <FloatingKnot scrollProgress={scrollProgress} />
      <FloatingDodecahedron scrollProgress={scrollProgress} />
      <FloatingCone scrollProgress={scrollProgress} />
      <ParticleField scrollProgress={scrollProgress} />

      <Environment preset="night" resolution={64} frames={1} />
    </>
  );
}

export default function Scene3D() {
  const [canvasKey, setCanvasKey] = useState(0);
  const handleContextLost = () => {
    setCanvasKey((key) => key + 1);
  };

  return (
    <Canvas
      key={canvasKey}
      camera={{ position: [0, 0, 6], fov: 60 }}
      dpr={[1, 1]}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      performance={{ min: 0.5 }}
      style={{ background: "transparent" }}
      className="w-full h-full"
    >
      <WebGLContextGuard onContextLost={handleContextLost} />
      <SceneContent />
    </Canvas>
  );
}
