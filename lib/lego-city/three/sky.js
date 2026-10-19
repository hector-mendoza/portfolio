import * as THREE from "three";

/** A big inverted sphere with a horizon gradient and a soft sun glow. */
export function createSky() {
  const uniforms = {
    topColor: { value: new THREE.Color("#3f8fe8") },
    horizonColor: { value: new THREE.Color("#cfeaff") },
    bottomColor: { value: new THREE.Color("#9fd4ff") },
    sunDir: { value: new THREE.Vector3(0.55, 0.6, 0.4).normalize() },
    sunColor: { value: new THREE.Color("#fff3c4") },
    sunSize: { value: 0.012 },
    glow: { value: 0.35 },
    stars: { value: 0 },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    vertexShader: `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        vec4 wp = modelMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: `
      uniform vec3 topColor; uniform vec3 horizonColor; uniform vec3 bottomColor;
      uniform vec3 sunDir; uniform vec3 sunColor; uniform float sunSize; uniform float glow; uniform float stars;
      varying vec3 vDir;
      void main() {
        float h = vDir.y;
        vec3 col = h > 0.0 ? mix(horizonColor, topColor, pow(h, 0.55)) : mix(horizonColor, bottomColor, pow(-h, 0.7));
        float d = max(0.0, dot(normalize(vDir), sunDir));
        col += sunColor * glow * pow(d, 12.0);
        col += sunColor * smoothstep(1.0 - sunSize, 1.0 - sunSize * 0.3, d);
        vec3 sd = normalize(vDir) * 260.0;
        vec3 cell = floor(sd);
        float sh = fract(sin(dot(cell, vec3(12.9898, 78.233, 37.719))) * 43758.5453);
        float twinkle = 0.65 + 0.35 * fract(sh * 91.7);
        col += vec3(1.0, 0.97, 0.9) * step(0.9972, sh) * twinkle * smoothstep(0.02, 0.35, vDir.y) * stars;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(800, 32, 16), material);
  mesh.frustumCulled = false;
  mesh.renderOrder = -1;
  return {
    mesh,
    uniforms,
    setNight(night) {
      uniforms.topColor.value.set(night ? "#060c24" : "#3f8fe8");
      uniforms.horizonColor.value.set(night ? "#1a2a5c" : "#cfeaff");
      uniforms.bottomColor.value.set(night ? "#0b1530" : "#9fd4ff");
      uniforms.sunColor.value.set(night ? "#e9eefc" : "#fff3c4");
      uniforms.glow.value = night ? 0.12 : 0.35;
      uniforms.sunSize.value = night ? 0.006 : 0.012;
      uniforms.stars.value = night ? 1 : 0;
    },
    follow(cameraPos) {
      mesh.position.copy(cameraPos);
    },
    dispose() {
      mesh.geometry.dispose();
      material.dispose();
    },
  };
}
