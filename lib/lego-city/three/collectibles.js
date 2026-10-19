import * as THREE from "three";
import { createRng } from "../layout.js";

const STORAGE = "pilleland-studs";

/** Deterministic gold-stud spots: two per block on the sidewalk, plus park paths. */
export function studSpots(city) {
  const rng = createRng(777);
  const spots = [];
  for (const lot of city.lots) {
    const r = lot.rect;
    const inset = r.half - 1.6;
    const count = lot.kind === "park" ? 4 : 2;
    for (let k = 0; k < count; k++) {
      const side = rng.int(0, 3);
      const t = rng.range(-inset + 4, inset - 4);
      const [x, z] =
        side === 0 ? [r.cx + t, r.cz - inset] : side === 1 ? [r.cx + t, r.cz + inset] : side === 2 ? [r.cx - inset, r.cz + t] : [r.cx + inset, r.cz + t];
      spots.push({ id: `${lot.id}-${k}`, x, z });
    }
  }
  return spots;
}

/**
 * Spinning gold studs the visitor can pick up on foot. Progress persists in
 * localStorage so a returning visitor keeps their collection.
 */
export class Collectibles {
  constructor(city, mats) {
    this.spots = studSpots(city);
    this.collected = new Set();
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE) || "[]");
      for (const id of saved) this.collected.add(id);
    } catch {
      /* ignore */
    }
    const geo = new THREE.CylinderGeometry(1, 1, 0.6, 18);
    const cap = new THREE.CylinderGeometry(0.6, 0.6, 0.35, 18);
    cap.translate(0, 0.47, 0);
    this.geo = geo;
    this.cap = cap;
    const mat = mats.get("pearl-gold", "chrome");
    mat.emissive = new THREE.Color("#ffb300");
    mat.emissiveIntensity = 0.35;
    this.mesh = new THREE.InstancedMesh(geo, mat, this.spots.length);
    this.capMesh = new THREE.InstancedMesh(cap, mat, this.spots.length);
    this.mesh.castShadow = true;
    this.capMesh.castShadow = true;
    this.group = new THREE.Group();
    this.group.add(this.mesh, this.capMesh);
    this.m = new THREE.Matrix4();
    this.q = new THREE.Quaternion();
    this.s = new THREE.Vector3();
    this.p = new THREE.Vector3();
    this.e = new THREE.Euler();
    this.pop = new Map(); // id -> t of pickup burst
    this.time = 0;
    this.base = city.groundTop;
    this.update(0, null);
  }

  get total() {
    return this.spots.length;
  }

  get count() {
    return this.collected.size;
  }

  reset() {
    this.collected.clear();
    this.save();
  }

  save() {
    try {
      localStorage.setItem(STORAGE, JSON.stringify([...this.collected]));
    } catch {
      /* ignore */
    }
  }

  /** Returns the spot picked up this frame, if any. */
  update(dt, playerPos) {
    this.time += dt;
    let picked = null;
    this.spots.forEach((spot, i) => {
      const done = this.collected.has(spot.id);
      let scale = done ? 0 : 1;
      let y = this.base + 1.4 + Math.sin(this.time * 2.4 + i) * 0.25;
      if (!done && playerPos && Math.hypot(spot.x - playerPos.x, spot.z - playerPos.z) < 2.2) {
        this.collected.add(spot.id);
        this.pop.set(spot.id, this.time);
        this.save();
        picked = spot;
      }
      const popT = this.pop.get(spot.id);
      if (popT !== undefined) {
        const e = (this.time - popT) / 0.35;
        if (e < 1) {
          scale = 1 + e * 1.2;
          y += e * 4;
        } else {
          this.pop.delete(spot.id);
          scale = 0;
        }
      }
      this.p.set(spot.x, y, spot.z);
      this.q.setFromEuler(this.e.set(0, this.time * 2 + i, Math.PI / 2));
      this.s.set(scale, scale, scale);
      this.m.compose(this.p, this.q, this.s);
      this.mesh.setMatrixAt(i, this.m);
      this.capMesh.setMatrixAt(i, this.m);
    });
    this.mesh.instanceMatrix.needsUpdate = true;
    this.capMesh.instanceMatrix.needsUpdate = true;
    return picked;
  }

  dispose() {
    this.geo.dispose();
    this.cap.dispose();
  }
}
