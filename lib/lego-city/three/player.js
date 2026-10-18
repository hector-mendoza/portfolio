import * as THREE from "three";
import { Parts } from "../parts.js";
import { minifig, MINIFIG_HEIGHT } from "../builders.js";
import { itemMatrix, geometryFor } from "./geometry.js";
import { ROAD_TOP } from "../layout.js";

const PIVOTS = {
  leftLeg: [-0.5, 1.6, 0],
  rightLeg: [0.5, 1.6, 0],
  leftArm: [-1.3, 3.7, 0],
  rightArm: [1.3, 3.7, 0],
  head: [0, 3.7, 0],
};

/** Builds an animatable minifigure: a Group with limb pivots, facing local -z. */
export function createMinifig(geos, mats, colors) {
  const p = new Parts();
  minifig(p, colors);
  const root = new THREE.Group();
  const pivots = {};
  const matrix = new THREE.Matrix4();
  for (const item of p.items) {
    const mesh = new THREE.Mesh(geometryFor(geos, item), mats.get(item.c, item.m));
    mesh.castShadow = true;
    const pivotDef = PIVOTS[item.part];
    let parent = root;
    const local = { ...item };
    if (pivotDef) {
      if (!pivots[item.part]) {
        const g = new THREE.Group();
        g.position.set(...pivotDef);
        root.add(g);
        pivots[item.part] = g;
      }
      parent = pivots[item.part];
      local.x -= pivotDef[0];
      local.y -= pivotDef[1];
      local.z -= pivotDef[2];
    }
    itemMatrix(local, matrix);
    matrix.decompose(mesh.position, mesh.quaternion, mesh.scale);
    parent.add(mesh);
  }
  return { root, pivots, height: MINIFIG_HEIGHT };
}

const WALK_SPEED = 9;
const RUN_SPEED = 16;
const RADIUS = 1.1;

/**
 * Third-person walking controller with simple AABB sliding collisions and a
 * height map for plates/steps. Input is fed by CityApp (keyboard + joystick).
 */
export class Player {
  constructor(city, geos, mats) {
    this.city = city;
    const fig = createMinifig(geos, mats, { torso: "bright-red", legs: "dark-blue", hair: "black" });
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
    for (const c of this.colliders) {
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
    // height
    const gy = this.sampleHeight(this.position.x, this.position.z);
    this.position.y += (gy - this.position.y) * Math.min(1, dt * 14);
    // limb animation
    const moving = this.speed > 0.4;
    this.phase += dt * (moving ? this.speed * 1.1 : 0);
    const swing = moving ? Math.sin(this.phase) * Math.min(0.75, this.speed / 12) : 0;
    const ease = Math.min(1, dt * 10);
    const set = (name, value) => {
      const g = this.pivots[name];
      if (g) g.rotation.x += (value - g.rotation.x) * ease;
    };
    set("leftLeg", swing);
    set("rightLeg", -swing);
    set("leftArm", -swing * 0.9);
    set("rightArm", swing * 0.9);
    this.root.position.set(
      this.position.x,
      this.position.y + (moving ? Math.abs(Math.sin(this.phase)) * 0.12 : 0),
      this.position.z,
    );
  }
}
