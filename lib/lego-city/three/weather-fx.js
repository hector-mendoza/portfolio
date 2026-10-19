import * as THREE from "three";
import { createRng } from "../layout.js";

/**
 * GPU precipitation: every drop's position is computed in the vertex shader
 * from a random seed, the clock and the camera centre, so thousands of drops
 * cost one draw call and no per-frame CPU work. Drops wrap inside a box that
 * follows the camera.
 */
const BOX = new THREE.Vector3(150, 80, 150);

const WRAP = `
  vec3 wrapPos(vec3 seed, vec3 vel, float t, vec3 center) {
    vec3 p = seed * uBox + vel * t;
    return mod(p - center, uBox) - uBox * 0.5 + center;
  }
`;

class Precipitation {
  constructor({ count, kind }) {
    this.kind = kind;
    this.count = count;
    const rng = createRng(kind === "rain" ? 811 : 977);
    const geo = new THREE.BufferGeometry();
    if (kind === "rain") {
      const seeds = new Float32Array(count * 2 * 3);
      const ends = new Float32Array(count * 2);
      for (let i = 0; i < count; i++) {
        const x = rng.next();
        const y = rng.next();
        const z = rng.next();
        for (let v = 0; v < 2; v++) {
          seeds.set([x, y, z], (i * 2 + v) * 3);
          ends[i * 2 + v] = v;
        }
      }
      geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 2 * 3), 3));
      geo.setAttribute("seed", new THREE.BufferAttribute(seeds, 3));
      geo.setAttribute("endv", new THREE.BufferAttribute(ends, 1));
    } else {
      const seeds = new Float32Array(count * 3);
      const rnd = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        seeds.set([rng.next(), rng.next(), rng.next()], i * 3);
        rnd[i] = rng.next();
      }
      geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
      geo.setAttribute("seed", new THREE.BufferAttribute(seeds, 3));
      geo.setAttribute("rnd", new THREE.BufferAttribute(rnd, 1));
    }
    this.uniforms = {
      uTime: { value: 0 },
      uCenter: { value: new THREE.Vector3() },
      uBox: { value: BOX.clone() },
      uWind: { value: new THREE.Vector3(kind === "rain" ? 6 : 2.5, 0, 2) },
      uAmount: { value: 0 },
      uScale: { value: 400 },
      uColor: { value: new THREE.Color(kind === "rain" ? "#cfe2ff" : "#ffffff") },
    };
    const common = `uniform float uTime; uniform vec3 uCenter; uniform vec3 uBox; uniform vec3 uWind; uniform float uAmount;`;
    const material =
      kind === "rain"
        ? new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            transparent: true,
            depthWrite: false,
            fog: false,
            vertexShader: `
              ${common}
              attribute vec3 seed; attribute float endv;
              varying float vA;
              ${WRAP}
              void main() {
                float speed = 55.0 + seed.x * 25.0;
                vec3 vel = vec3(uWind.x, -speed, uWind.z);
                vec3 p = wrapPos(seed, vel, uTime, uCenter);
                // streak follows the fall direction
                p -= normalize(vel) * endv * (2.2 + seed.z * 1.6);
                // only a fraction of drops is active, depending on the intensity
                float active = step(seed.y, uAmount);
                vA = (0.25 + 0.35 * (1.0 - endv)) * active;
                gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
              }`,
            fragmentShader: `
              uniform vec3 uColor; varying float vA;
              void main() { gl_FragColor = vec4(uColor, vA); }`,
          })
        : new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            transparent: true,
            depthWrite: false,
            fog: false,
            vertexShader: `
              ${common} uniform float uScale;
              attribute vec3 seed; attribute float rnd;
              varying float vA;
              ${WRAP}
              void main() {
                float fall = 3.5 + rnd * 3.5;
                vec3 vel = vec3(uWind.x, -fall, uWind.z);
                vec3 p = wrapPos(seed, vel, uTime, uCenter);
                p.x += sin(uTime * (0.6 + rnd) + seed.z * 40.0) * 1.4;
                p.z += cos(uTime * (0.5 + rnd) + seed.x * 40.0) * 1.4;
                vec4 mv = viewMatrix * vec4(p, 1.0);
                gl_PointSize = (0.55 + rnd * 0.7) * uScale / max(1.0, -mv.z);
                vA = step(seed.y, uAmount);
                gl_Position = projectionMatrix * mv;
              }`,
            fragmentShader: `
              uniform vec3 uColor; varying float vA;
              void main() {
                float d = length(gl_PointCoord - 0.5);
                if (d > 0.5 || vA < 0.5) discard;
                gl_FragColor = vec4(uColor, smoothstep(0.5, 0.15, d) * 0.9);
              }`,
          });
    this.object = kind === "rain" ? new THREE.LineSegments(geo, material) : new THREE.Points(geo, material);
    this.object.frustumCulled = false;
    this.object.renderOrder = 8;
    this.object.visible = false;
  }

  update(dt, camera, amount, canvasHeight) {
    this.uniforms.uTime.value += dt;
    this.uniforms.uCenter.value.copy(camera.position);
    this.uniforms.uAmount.value = amount;
    this.uniforms.uScale.value = canvasHeight * 0.5;
    this.object.visible = amount > 0.02;
  }

  dispose() {
    this.object.geometry.dispose();
    this.object.material.dispose();
  }
}

export class Rain extends Precipitation {
  constructor(count = 3200) {
    super({ count, kind: "rain" });
  }
}

export class Snow extends Precipitation {
  constructor(count = 2600) {
    super({ count, kind: "snow" });
  }
}
