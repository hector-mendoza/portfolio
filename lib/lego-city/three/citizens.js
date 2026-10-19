import * as THREE from "three";
import { createMinifig } from "./player.js";
import { createRng } from "../layout.js";

const OUTFITS = [
  { torso: "bright-red", legs: "dark-blue", hair: "black" },
  { torso: "lime", legs: "black", hair: "reddish-brown" },
  { torso: "dark-azure", legs: "tan", hair: "black" },
  { torso: "bright-yellow", legs: "dark-blue", hat: "white" },
  { torso: "bright-pink", legs: "dark-purple", hair: "reddish-brown" },
  { torso: "orange", legs: "black", hat: "bright-yellow" },
  { torso: "white", legs: "dark-bluish-gray", hair: "black" },
  { torso: "dark-green", legs: "tan", hat: "reddish-brown" },
];

/** Shared limb swing used by the player and the citizens. */
export function animateLimbs(pivots, phase, amount, dt) {
  const swing = Math.sin(phase) * amount;
  const ease = Math.min(1, dt * 10);
  const set = (name, value) => {
    const g = pivots[name];
    if (g) g.rotation.x += (value - g.rotation.x) * ease;
  };
  set("leftLeg", swing);
  set("rightLeg", -swing);
  set("leftArm", -swing * 0.9);
  set("rightArm", swing * 0.9);
}

/**
 * Minifigs strolling the sidewalk ring of their block. They turn at the
 * corners, pause now and then, and wave if the visitor walks right up to them.
 */
export class Citizens {
  constructor(city, geos, mats, count = 12) {
    this.group = new THREE.Group();
    this.group.name = "citizens";
    this.list = [];
    const rng = createRng(4242);
    const lots = city.lots.filter((l) => l.kind !== "station");
    for (let i = 0; i < count; i++) {
      const lot = rng.pick(lots);
      const r = lot.rect;
      const inset = r.half - 1.6; // sidewalk centreline
      const loop = [
        { x: r.cx - inset, z: r.cz - inset },
        { x: r.cx + inset, z: r.cz - inset },
        { x: r.cx + inset, z: r.cz + inset },
        { x: r.cx - inset, z: r.cz + inset },
      ];
      const fig = createMinifig(geos, mats, OUTFITS[i % OUTFITS.length]);
      this.group.add(fig.root);
      this.list.push({
        root: fig.root,
        pivots: fig.pivots,
        loop,
        edge: rng.int(0, 3),
        f: rng.next(),
        dir: rng.chance(0.5) ? 1 : -1,
        speed: rng.range(3.5, 6),
        phase: rng.range(0, 6),
        pause: 0,
        wave: 0,
        y: city.groundTop,
      });
    }
  }

  update(dt, playerPos) {
    for (const c of this.list) {
      const a = c.loop[c.edge];
      const b = c.loop[(c.edge + 1) % 4];
      const len = Math.hypot(b.x - a.x, b.z - a.z);
      const near = playerPos && Math.hypot(c.root.position.x - playerPos.x, c.root.position.z - playerPos.z) < 5;
      if (near) {
        // stop and wave at the visitor
        c.wave += dt;
        const dx = playerPos.x - c.root.position.x;
        const dz = playerPos.z - c.root.position.z;
        c.root.rotation.y = Math.atan2(-dx, -dz);
        const arm = c.pivots.rightArm;
        if (arm) arm.rotation.x = -2.6 + Math.sin(c.wave * 9) * 0.3;
        animateLimbs({ leftLeg: c.pivots.leftLeg, rightLeg: c.pivots.rightLeg, leftArm: c.pivots.leftArm }, 0, 0, dt);
        continue;
      }
      if (c.pause > 0) {
        c.pause -= dt;
        animateLimbs(c.pivots, 0, 0, dt);
        continue;
      }
      c.f += (dt * c.speed * c.dir) / len;
      if (c.f > 1 || c.f < 0) {
        c.edge = (c.edge + (c.f > 1 ? 1 : 3)) % 4;
        c.f = c.f > 1 ? 0 : 1;
        if (Math.random() < 0.25) c.pause = 1 + Math.random() * 2;
      }
      const x = a.x + (b.x - a.x) * c.f;
      const z = a.z + (b.z - a.z) * c.f;
      c.root.position.set(x, c.y, z);
      const fx = (b.x - a.x) * c.dir;
      const fz = (b.z - a.z) * c.dir;
      c.root.rotation.y = Math.atan2(-fx, -fz);
      c.phase += dt * c.speed * 1.4;
      animateLimbs(c.pivots, c.phase, 0.55, dt);
      c.root.position.y = c.y + Math.abs(Math.sin(c.phase)) * 0.08;
    }
  }
}
