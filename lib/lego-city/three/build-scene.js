import * as THREE from "three";
import { itemMatrix, geometryFor } from "./geometry.js";

/* -------------------------------------------------------------- helpers */

function unrotate(x, z, rot) {
  // inverse of Parts.rotateVec: apply (x, z) -> (z, -x) `rot` times
  let rx = x;
  let rz = z;
  for (let k = 0; k < ((rot % 4) + 4) % 4; k++) {
    const nx = rz;
    const nz = -rx;
    rx = nx;
    rz = nz;
  }
  return [rx, rz];
}

const DIR_ORDER = ["n", "e", "s", "w"]; // clockwise when viewed from above (+x east, +z south)
function unrotateDir(dir, rot) {
  // Parts.rotateDir rotates (x,z)->(-z,x): n(0,-1)->(1,0)=e, so one step = +1 in DIR_ORDER
  const i = DIR_ORDER.indexOf(dir);
  return DIR_ORDER[(i - rot + 400) % 4];
}

export function makeLabelSprite(text, { minor = false, accent = "#C91A09" } = {}) {
  const canvas = document.createElement("canvas");
  const scale = 2;
  const font = `${minor ? 600 : 700} ${minor ? 30 : 38}px Outfit, "Segoe UI", system-ui, sans-serif`;
  const ctx = canvas.getContext("2d");
  ctx.font = font;
  const padX = 34;
  const w = Math.ceil(ctx.measureText(text).width) + padX * 2;
  const h = minor ? 64 : 80;
  canvas.width = w * scale;
  canvas.height = (h + 24) * scale;
  ctx.scale(scale, scale);
  ctx.font = font;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  // pill
  const r = h / 2;
  ctx.fillStyle = minor ? "rgba(27,42,52,0.72)" : "rgba(255,255,255,0.96)";
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(w - r, 0);
  ctx.arc(w - r, r, r, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(r, h);
  ctx.arc(r, r, r, Math.PI / 2, (3 * Math.PI) / 2);
  ctx.closePath();
  ctx.fill();
  if (!minor) {
    ctx.strokeStyle = "rgba(27,42,52,0.9)";
    ctx.lineWidth = 3;
    ctx.stroke();
    // pointer
    ctx.fillStyle = "rgba(255,255,255,0.96)";
    ctx.beginPath();
    ctx.moveTo(w / 2 - 12, h - 1);
    ctx.lineTo(w / 2 + 12, h - 1);
    ctx.lineTo(w / 2, h + 18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(padX - 8, h / 2, 7, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = minor ? "#ffffff" : "#1B2A34";
  ctx.fillText(text, w / 2 + (minor ? 0 : 6), h / 2 + 1);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: true, depthWrite: false });
  const sprite = new THREE.Sprite(material);
  const unit = minor ? 0.042 : 0.06;
  sprite.scale.set(w * unit, (h + 24) * unit, 1);
  sprite.center.set(0.5, 0);
  sprite.renderOrder = 10;
  return sprite;
}

/* ------------------------------------------------------ build-in timing */

/** Seconds before a brick at (x, y, z) lands: a wave from the station outward, low bricks first. */
export function buildDelay(x, y, z) {
  if (y < 0) return -100; // the baseplate is always there
  const dx = x;
  const dz = z - 100;
  const dist = Math.hypot(dx, dz);
  const hash = (Math.sin(x * 12.9898 + z * 78.233) * 43758.5453) % 1;
  return dist * 0.016 + y * 0.03 + Math.abs(hash) * 0.35;
}

export const BUILD_DURATION = 6.5;

/**
 * Animates the instanced meshes so every brick falls into place. `t` is the
 * time since the build started; returns true while still animating.
 */
const _m = new THREE.Matrix4();
export function applyBuildIn(meshes, t) {
  let busy = false;
  for (const mesh of meshes) {
    const rest = mesh.userData.rest;
    const delay = mesh.userData.delay;
    if (!rest) continue;
    const arr = mesh.instanceMatrix.array;
    const n = mesh.count;
    let changed = false;
    for (let i = 0; i < n; i++) {
      const local = t - delay[i];
      const o = i * 16;
      if (local >= 0.6) {
        if (arr[o + 13] !== rest[o + 13] || arr[o + 0] !== rest[o + 0]) {
          for (let k = 0; k < 16; k++) arr[o + k] = rest[o + k];
          changed = true;
        }
        continue;
      }
      busy = true;
      changed = true;
      if (local <= 0) {
        // not yet: collapse to nothing
        for (let k = 0; k < 16; k++) arr[o + k] = 0;
        arr[o + 15] = 1;
        continue;
      }
      // drop from above with a tiny overshoot squash
      const e = local / 0.6;
      const fall = (1 - e) * (1 - e) * 40;
      const squash = e > 0.85 ? 1 - Math.sin(((e - 0.85) / 0.15) * Math.PI) * 0.08 : 1;
      for (let k = 0; k < 16; k++) arr[o + k] = rest[o + k];
      arr[o + 13] = rest[o + 13] + fall;
      arr[o + 5] *= squash;
      void _m;
    }
    if (changed) mesh.instanceMatrix.needsUpdate = true;
  }
  return busy;
}

/* ---------------------------------------------------------- the builder */

/**
 * Builds the static city as a handful of InstancedMeshes, the animated
 * groups (cars, tram, ferris wheel) as regular meshes, and the labels.
 */
export function buildCityScene(city, geos, mats, { colorHex, quality = "high" }) {
  const root = new THREE.Group();
  root.name = "city";
  const batches = new Map();
  const dynamicItems = new Map();

  for (const item of city.items) {
    if (item.g) {
      if (!dynamicItems.has(item.g)) dynamicItems.set(item.g, []);
      dynamicItems.get(item.g).push(item);
      continue;
    }
    const geometry = geometryFor(geos, item);
    const key = `${item.t}|${item.c}|${item.m}|${item.e ? 1 : 0}|${item.seg ?? ""}|${item.axis && item.axis !== "y" ? "c" : "b"}`;
    let batch = batches.get(key);
    if (!batch) {
      batch = { geometry, material: mats.get(item.c, item.m, !!item.e), items: [] };
      batches.set(key, batch);
    }
    batch.items.push(item);
  }

  const matrix = new THREE.Matrix4();
  const staticMeshes = [];
  for (const batch of batches.values()) {
    const mesh = new THREE.InstancedMesh(batch.geometry, batch.material, batch.items.length);
    batch.items.forEach((item, i) => mesh.setMatrixAt(i, itemMatrix(item, matrix)));
    mesh.instanceMatrix.needsUpdate = true;
    // keep the resting matrices + a per-instance delay so the intro can "drop" the bricks in
    mesh.userData.rest = new Float32Array(mesh.instanceMatrix.array);
    mesh.userData.delay = new Float32Array(batch.items.map((item) => buildDelay(item.x, item.y, item.z)));
    mesh.castShadow = !batch.material.userData.glass;
    mesh.receiveShadow = true;
    mesh.computeBoundingSphere();
    root.add(mesh);
    staticMeshes.push(mesh);
  }

  // studs: one instanced mesh per colour (low quality keeps only rooftop/prop studs)
  for (const [color, list] of Object.entries(city.studs)) {
    const count = list.length / 3;
    if (quality === "low" && count > 2000) continue;
    const mesh = new THREE.InstancedMesh(geos.stud, mats.get(color, "plastic"), count);
    for (let i = 0; i < count; i++) {
      matrix.makeTranslation(list[i * 3], list[i * 3 + 1], list[i * 3 + 2]);
      mesh.setMatrixAt(i, matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.userData.rest = new Float32Array(mesh.instanceMatrix.array);
    mesh.userData.delay = new Float32Array(count);
    for (let i = 0; i < count; i++) mesh.userData.delay[i] = buildDelay(list[i * 3], list[i * 3 + 1], list[i * 3 + 2]);
    mesh.receiveShadow = true;
    mesh.castShadow = false;
    mesh.computeBoundingSphere();
    root.add(mesh);
    staticMeshes.push(mesh);
  }

  // dynamic groups
  const dynamics = [];
  for (const dyn of city.dynamic) {
    const items = dynamicItems.get(dyn.id) ?? [];
    const group = new THREE.Group();
    group.name = dyn.id;
    const pivotY = dyn.pivotY ?? 0;
    group.position.set(dyn.x, pivotY, dyn.z);
    group.rotation.y = (-dyn.rot * Math.PI) / 2;
    const gondolas = [];
    for (const item of items) {
      const [lx, lz] = unrotate(item.x - dyn.x, item.z - dyn.z, dyn.rot);
      const local = { ...item, x: lx, z: lz, y: item.y - pivotY };
      if (item.axis && item.axis !== "y" && dyn.rot % 2 !== 0) local.axis = item.axis === "x" ? "z" : "x";
      if (item.t === "wedge") local.dir = unrotateDir(item.dir, dyn.rot);
      if (item.t === "box" && dyn.rot % 2 !== 0) {
        local.w = item.d;
        local.d = item.w;
      }
      const mesh = new THREE.Mesh(geometryFor(geos, local), mats.get(item.c, item.m, !!item.e));
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      if (item.part === "gondola") {
        const pivot = new THREE.Group();
        pivot.position.set(local.x, local.y + local.h / 2, local.z);
        itemMatrix({ ...local, x: 0, y: -local.h / 2, z: 0 }, matrix);
        matrix.decompose(mesh.position, mesh.quaternion, mesh.scale);
        pivot.add(mesh);
        group.add(pivot);
        gondolas.push(pivot);
      } else {
        itemMatrix(local, matrix);
        matrix.decompose(mesh.position, mesh.quaternion, mesh.scale);
        group.add(mesh);
      }
    }
    root.add(group);
    dynamics.push({ ...dyn, group, gondolas });
  }

  // labels
  const labels = new THREE.Group();
  labels.name = "labels";
  for (const label of city.labels) {
    const lot = city.lots.find((l) => l.label === label.text);
    const accent = lot?.color ? colorHex(lot.color) : "#C91A09";
    const sprite = makeLabelSprite(label.text, { minor: !!label.minor, accent });
    sprite.position.set(label.x, label.y, label.z);
    labels.add(sprite);
  }
  root.add(labels);

  return { root, dynamics, labels, staticMeshes };
}

/* ------------------------------------------------------------- clouds */

export function buildClouds(mats, rng, bounds) {
  const group = new THREE.Group();
  const geo = new THREE.BoxGeometry(1, 1, 1);
  const mat = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.95, metalness: 0 });
  const clouds = [];
  const total = 44;
  for (let i = 0; i < total; i++) {
    const cloud = new THREE.Group();
    const puffs = rng.int(3, 6);
    for (let k = 0; k < puffs; k++) {
      const m = new THREE.Mesh(geo, mat);
      m.scale.set(rng.range(6, 14), rng.range(2, 4), rng.range(5, 9));
      m.position.set(rng.range(-8, 8), rng.range(0, 2), rng.range(-4, 4));
      m.castShadow = true;
      cloud.add(m);
    }
    cloud.position.set(rng.range(-bounds, bounds), rng.range(82, 118), rng.range(-bounds, bounds));
    group.add(cloud);
    clouds.push({ group: cloud, speed: rng.range(1.2, 2.6), rank: i / total, shown: true });
  }
  let drift = 1;
  return {
    group,
    /** cover 0..1 reveals more clouds and grows them; dark 0..1 turns them storm-gray. */
    setCover(cover, dark = 0, tint = null) {
      const shown = Math.round(10 + cover * (total - 10));
      clouds.forEach((c, i) => {
        c.shown = i < shown;
        const s = 1 + cover * 0.7 * (1 - c.rank * 0.3);
        c.group.scale.set(s, 1 + cover * 0.5, s);
      });
      mat.color.setScalar(1 - dark * 0.62);
      if (tint) mat.color.multiply(tint);
      drift = 1 + cover * 0.8;
    },
    update(dt, camPos) {
      for (const c of clouds) {
        c.group.position.x += c.speed * dt * drift;
        if (c.group.position.x > bounds + 20) c.group.position.x = -bounds - 20;
        // never let a cloud slab fill the view when the camera drifts through it
        c.group.visible = c.shown && (!camPos || c.group.position.distanceTo(camPos) > 75);
      }
    },
    dispose() {
      geo.dispose();
      mat.dispose();
    },
  };
}
