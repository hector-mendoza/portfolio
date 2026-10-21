import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { Parts } from "../parts.js";
import { minifig, MINIFIG_HEIGHT } from "../builders.js";
import { itemMatrix, geometryFor } from "./geometry.js";
import { ROAD_TOP } from "../layout.js";
import { animateLimbs } from "./citizens.js";

const PIVOTS = {
  leftLeg: [-0.5, 1.5, 0],
  rightLeg: [0.5, 1.5, 0],
  leftArm: [-1.4, 3.45, 0],
  rightArm: [1.4, 3.45, 0],
  head: [0, 3.55, 0],
};

/**
 * Builds an animatable minifigure: a Group with limb pivots, facing local -z.
 * The ~100 primitives are merged per (limb, colour) so a figure costs a few
 * dozen draw calls instead of a hundred.
 */
export function createMinifig(geos, mats, colors) {
  const p = new Parts();
  minifig(p, colors);
  const root = new THREE.Group();
  const pivots = {};
  const matrix = new THREE.Matrix4();
  const roles = { [colors.torso ?? "bright-blue"]: "torso", [colors.legs ?? "dark-blue"]: "legs" };
  const buckets = new Map();
  for (const item of p.items) {
    const pivotDef = PIVOTS[item.part];
    const local = { ...item };
    if (pivotDef) {
      local.x -= pivotDef[0];
      local.y -= pivotDef[1];
      local.z -= pivotDef[2];
    }
    const geo = geometryFor(geos, item).clone();
    itemMatrix(local, matrix);
    geo.applyMatrix4(matrix);
    const key = `${pivotDef ? item.part : "root"}|${item.c}|${item.m}`;
    if (!buckets.has(key)) buckets.set(key, { part: pivotDef ? item.part : null, item, list: [] });
    buckets.get(key).list.push(geo);
  }
  for (const { part, item, list } of buckets.values()) {
    const merged = list.length === 1 ? list[0] : mergeGeometries(list, false);
    if (list.length > 1) for (const g of list) g.dispose();
    const mesh = new THREE.Mesh(merged, mats.get(item.c, item.m));
    mesh.castShadow = true;
    mesh.userData.role = roles[item.c] ?? null;
    mesh.userData.ownGeometry = true;
    let parent = root;
    if (part) {
      if (!pivots[part]) {
        const g = new THREE.Group();
        g.position.set(...PIVOTS[part]);
        root.add(g);
        pivots[part] = g;
      }
      parent = pivots[part];
    }
    parent.add(mesh);
  }
  return { root, pivots, height: MINIFIG_HEIGHT };
}

/** Swap the torso / legs materials of a minifig built by createMinifig. */
export function recolorMinifig(root, mats, { torso, legs }) {
  root.traverse((obj) => {
    if (!obj.isMesh) return;
    if (obj.userData.role === "torso" && torso) obj.material = mats.get(torso, "plastic");
    if (obj.userData.role === "legs" && legs) obj.material = mats.get(legs, "plastic");
  });
}

const WALK_SPEED = 9;
const RUN_SPEED = 16;
const RADIUS = 1.1;
const GRAVITY = 60;
const JUMP_SPEED = 19;

/**
 * Third-person walking controller with simple AABB sliding collisions and a
 * height map for plates/steps. Input is fed by CityApp (keyboard + joystick).
 */
export class Player {
  constructor(city, geos, mats) {
    this.city = city;
    const fig = createMinifig(geos, mats, { torso: "bright-red", legs: "dark-blue", hair: "black", print: "buttons", accessory: "backpack" });
    this.root = fig.root;
    this.pivots = fig.pivots;
    this.height = fig.height;
    /** Logical position; root.position adds the walk bob on top. */
    this.position = new THREE.Vector3();
    this.yaw = 0;
    this.targetYaw = 0;
    this.phase = 0;
    this.speed = 0;
    this.groundY = city.groundTop;
    this.colliders = city.colliders;
    this.heights = city.heights;
    this.input = { x: 0, z: 0, run: false };
    this.vy = 0;
    this.airborne = false;
    this.jumpOffset = 0;
    this.onLand = null;
    this.onStep = null;
    /** Optional callback returning extra AABBs that move (the tram, cars). */
    this.dynamicColliders = null;
  }

  place(x, z, yaw) {
    this.position.set(x, this.sampleHeight(x, z), z);
    this.root.position.copy(this.position);
    this.yaw = yaw;
    this.targetYaw = yaw;
    this.root.rotation.y = yaw;
  }

  sampleHeight(x, z) {
    let y = ROAD_TOP;
    for (const h of this.heights) {
      if (x >= h.x - h.w / 2 && x <= h.x + h.w / 2 && z >= h.z - h.d / 2 && z <= h.z + h.d / 2 && h.top > y && h.top < y + 2.6) {
        y = h.top;
      }
    }
    return y;
  }

  blocked(x, z) {
    const dynamic = this.dynamicColliders ? this.dynamicColliders() : [];
    for (const c of dynamic.length ? [...dynamic, ...this.colliders] : this.colliders) {
      if (c.hx !== undefined) {
        // oriented box (cars, tram): test in its own frame
        const dx = x - c.x;
        const dz = z - c.z;
        if (Math.abs(dx * c.hx + dz * c.hz) < c.len / 2 + RADIUS && Math.abs(-dx * c.hz + dz * c.hx) < c.w / 2 + RADIUS) return true;
        continue;
      }
      if (
        x + RADIUS > c.x - c.w / 2 &&
        x - RADIUS < c.x + c.w / 2 &&
        z + RADIUS > c.z - c.d / 2 &&
        z - RADIUS < c.z + c.d / 2
      ) {
        return true;
      }
    }
    return false;
  }

  jump() {
    if (this.airborne) return false;
    this.vy = JUMP_SPEED;
    this.airborne = true;
    return true;
  }

  /** Move by world-space direction (already camera-relative). */
  update(dt, moveX, moveZ, run) {
    const len = Math.hypot(moveX, moveZ);
    const target = len > 0.01 ? (run ? RUN_SPEED : WALK_SPEED) * Math.min(1, len) : 0;
    this.speed += (target - this.speed) * Math.min(1, dt * 10);
    if (len > 0.01) {
      const nx = moveX / len;
      const nz = moveZ / len;
      this.targetYaw = Math.atan2(-nx, -nz);
      const step = this.speed * dt;
      let x = this.position.x + nx * step;
      let z = this.position.z;
      if (this.blocked(x, z)) x = this.position.x;
      z = this.position.z + nz * step;
      if (this.blocked(x, z)) z = this.position.z;
      this.position.x = x;
      this.position.z = z;
    }
    // smooth turn (shortest arc)
    let delta = this.targetYaw - this.yaw;
    delta = Math.atan2(Math.sin(delta), Math.cos(delta));
    this.yaw += delta * Math.min(1, dt * 12);
    this.root.rotation.y = this.yaw;
    // height + jump
    const gy = this.sampleHeight(this.position.x, this.position.z);
    if (this.airborne) {
      this.vy -= GRAVITY * dt;
      this.jumpOffset += this.vy * dt;
      if (this.jumpOffset <= 0) {
        this.jumpOffset = 0;
        this.vy = 0;
        this.airborne = false;
        this.onLand?.();
      }
    }
    this.position.y += (gy - this.position.y) * Math.min(1, dt * 14);
    // limb animation
    const moving = this.speed > 0.4 && !this.airborne;
    const before = Math.floor(this.phase / Math.PI);
    this.phase += dt * (moving ? this.speed * 1.1 : 0);
    if (moving && Math.floor(this.phase / Math.PI) !== before) this.onStep?.();
    if (this.airborne) {
      const ease = Math.min(1, dt * 12);
      for (const name of ["leftLeg", "rightLeg"]) this.pivots[name].rotation.x += (0.35 - this.pivots[name].rotation.x) * ease;
      for (const name of ["leftArm", "rightArm"]) this.pivots[name].rotation.x += (-2.4 - this.pivots[name].rotation.x) * ease;
    } else {
      animateLimbs(this.pivots, this.phase, moving ? Math.min(0.75, this.speed / 12) : 0, dt);
    }
    this.root.position.set(
      this.position.x,
      this.position.y + this.jumpOffset + (moving ? Math.abs(Math.sin(this.phase)) * 0.12 : 0),
      this.position.z,
    );
  }
}
