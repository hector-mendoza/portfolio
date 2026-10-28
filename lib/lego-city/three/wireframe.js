import * as THREE from "three";

/** Seconds the outlines take to draw before the bricks start dropping in. */
export const WIRE_DURATION = 3.4;

const VERT = /* glsl */ `
  attribute vec3 aOther;
  attribute float aEnd;
  attribute vec4 aM0;
  attribute vec4 aM1;
  attribute vec4 aM2;
  attribute vec4 aM3;
  attribute float aDelay;
  uniform float uDraw;
  varying float vHead;
  void main() {
    mat4 m = mat4(aM0, aM1, aM2, aM3);
    float g = clamp((uDraw - aDelay) / 0.6, 0.0, 1.0);
    vec4 own = m * vec4(position, 1.0);
    vec4 other = m * vec4(aOther, 1.0);
    // the far end of every edge grows out of the near end, like a pen stroke
    vec4 p = aEnd > 0.5 ? mix(other, own, g) : own;
    vHead = g > 0.0 && g < 1.0 ? 1.0 : 0.0;
    gl_Position = projectionMatrix * viewMatrix * p;
    gl_Position.z -= 0.0006 * gl_Position.w; // nudge toward the camera so outlines win over the brick faces
    if (g <= 0.0) gl_Position = vec4(2.0, 2.0, 2.0, 1.0); // not started: clipped away
  }
`;

const FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uHot;
  uniform float uFade;
  varying float vHead;
  void main() {
    gl_FragColor = vec4(mix(uColor, uHot, vHead), uFade);
  }
`;

/**
 * Blueprint-style outlines for every static brick, drawn with instanced
 * line segments (one draw call per brick shape). `update(t)` grows the lines
 * outward in the same order the bricks will later land; `fade` dims them out.
 */
export function createWireframe(staticMeshes, { maxDelay = 8, size = 400 } = {}) {
  const group = new THREE.Group();
  group.name = "wireframe";
  const material = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms: {
      uDraw: { value: 0 },
      uFade: { value: 1 },
      uColor: { value: new THREE.Color("#e9f3ff") },
      uHot: { value: new THREE.Color("#ffd23f") },
    },
    transparent: true,
    depthWrite: false,
  });
  const edgeCache = new Map();
  const geoms = [];

  for (const mesh of staticMeshes) {
    if (mesh.userData.stud || !mesh.userData.rest) continue;
    let edges = edgeCache.get(mesh.geometry);
    if (!edges) {
      const e = new THREE.EdgesGeometry(mesh.geometry, 30).getAttribute("position");
      const n = e.count; // pairs of vertices
      const own = new Float32Array(n * 3);
      const other = new Float32Array(n * 3);
      const end = new Float32Array(n);
      for (let i = 0; i < n; i += 2) {
        for (let k = 0; k < 3; k++) {
          const a = e.array[i * 3 + k];
          const b = e.array[(i + 1) * 3 + k];
          own[i * 3 + k] = a;
          other[i * 3 + k] = b;
          own[(i + 1) * 3 + k] = b;
          other[(i + 1) * 3 + k] = a;
        }
        end[i] = 0;
        end[i + 1] = 1;
      }
      edges = { own, other, end, n };
      edgeCache.set(mesh.geometry, edges);
    }
    const rest = mesh.userData.rest;
    const delay = mesh.userData.delay;
    const keep = [];
    const round = mesh.geometry.type === "CylinderGeometry";
    for (let i = 0; i < mesh.count; i++) {
      if (rest[i * 16 + 13] < 0) continue; // the baseplate is not part of the drawing
      // only the city itself: the outskirts' rocks and hill decorations are left undrawn
      if (Math.abs(rest[i * 16 + 12]) > size / 2 || Math.abs(rest[i * 16 + 14]) > size / 2) continue;
      // wide round slabs are hills and mountains: their stacked rings only add noise
      if (round && Math.hypot(rest[i * 16], rest[i * 16 + 1], rest[i * 16 + 2]) > 10) continue;
      keep.push(i);
    }
    if (!keep.length) continue;

    const geo = new THREE.InstancedBufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(edges.own, 3));
    geo.setAttribute("aOther", new THREE.BufferAttribute(edges.other, 3));
    geo.setAttribute("aEnd", new THREE.BufferAttribute(edges.end, 1));
    const m = new Float32Array(keep.length * 16);
    const d = new Float32Array(keep.length);
    keep.forEach((src, i) => {
      m.set(rest.subarray(src * 16, src * 16 + 16), i * 16);
      d[i] = delay[src];
    });
    for (let c = 0; c < 4; c++) {
      const col = new Float32Array(keep.length * 4);
      for (let i = 0; i < keep.length; i++) for (let k = 0; k < 4; k++) col[i * 4 + k] = m[i * 16 + c * 4 + k];
      geo.setAttribute(`aM${c}`, new THREE.InstancedBufferAttribute(col, 4));
    }
    geo.setAttribute("aDelay", new THREE.InstancedBufferAttribute(d, 1));
    geo.instanceCount = keep.length;
    const lines = new THREE.LineSegments(geo, material);
    lines.frustumCulled = false;
    lines.renderOrder = 5;
    group.add(lines);
    geoms.push(geo);
  }

  // a faint drafting grid on the ground
  const grid = new THREE.GridHelper(size, Math.round(size / 16), "#4f8fd6", "#1d5a9c");
  grid.position.y = 0.3;
  grid.material.transparent = true;
  grid.material.depthWrite = false;
  group.add(grid);

  return {
    group,
    /** `t` seconds since the drawing started; `fade` 1 → 0 dims the lines. */
    update(t, fade = 1) {
      material.uniforms.uDraw.value = Math.max(0, (t / WIRE_DURATION) * (maxDelay + 0.6));
      material.uniforms.uFade.value = fade;
      grid.material.opacity = fade * 0.8;
      group.visible = fade > 0.001;
    },
    dispose() {
      for (const g of geoms) g.dispose();
      edgeCache.clear();
      material.dispose();
      grid.geometry.dispose();
      grid.material.dispose();
    },
  };
}
