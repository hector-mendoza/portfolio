import * as THREE from "three";
import { createMinifig } from "./player.js";
import { createRng } from "../layout.js";
import { PERSONAS } from "../dialogue.js";

/** One look per persona (same order as PERSONAS in dialogue.js). */
const OUTFITS = [
  { torso: "bright-red", legs: "dark-blue", hair: "black", hat: "bright-red", print: "stripes", accessory: "backpack", face: "smile" }, // Benny, courier
  { torso: "white", legs: "dark-blue", hair: "reddish-brown", skin: "medium-nougat", hairStyle: "ponytail", print: "stripes", face: "grin" }, // Lola, tram fan
  { torso: "bright-yellow", legs: "dark-blue", hair: "black", hat: "bright-yellow", hatStyle: "hard", print: "jacket", face: "smile" }, // Otto, street cleaner
  { torso: "white", legs: "black", hair: "reddish-brown", hairStyle: "long", print: "buttons", face: "wink" }, // Mina, café owner
  { torso: "orange", legs: "dark-blue", hair: "black", hat: "bright-yellow", hatStyle: "hard", print: "jacket", face: "grin" }, // Gus, builder
  { torso: "dark-green", legs: "tan", hair: "black", skin: "medium-nougat", hat: "tan", hatStyle: "cap", hairStyle: "ponytail", print: "buttons", accessory: "backpack", face: "smile" }, // Pia, ranger
  { torso: "lime", legs: "tan", hair: "black", hat: "white", print: "stripes", accessory: "backpack", face: "glasses" }, // Remy, tourist
  { torso: "dark-purple", legs: "black", hair: "black", skin: "medium-nougat", hairStyle: "messy", accessory: "scarf", face: "wink" }, // Nora, night owl
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
    const lots = city.lots.filter((l) => l.kind !== "station" && l.kind !== "river" && l.kind !== "sea");
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
      // a little umbrella for rainy days
      const umbrella = new THREE.Group();
      const canopy = new THREE.Mesh(new THREE.ConeGeometry(2.6, 1.1, 10), mats.get(["bright-red", "bright-blue", "bright-yellow", "lime"][i % 4], "plastic"));
      canopy.position.y = 7.3;
      const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3, 6), mats.get("black", "plastic"));
      stick.position.y = 6;
      umbrella.add(canopy, stick);
      umbrella.visible = false;
      fig.root.add(umbrella);
      this.list.push({
        root: fig.root,
        umbrella,
        pivots: fig.pivots,
        loop,
        edge: rng.int(0, 3),
        f: rng.next(),
        dir: rng.chance(0.5) ? 1 : -1,
        speed: rng.range(3.5, 6),
        phase: rng.range(0, 6),
        persona: PERSONAS[i % PERSONAS.length],
        pause: 0,
        wave: 0,
        y: city.groundTop,
      });
    }
  }

  setRain(on) {
    for (const c of this.list) c.umbrella.visible = on;
  }

  /** Closest citizen within `radius` of a point, or null. */
  nearest(pos, radius = 5) {
    let best = null;
    let bestD = radius;
    for (const c of this.list) {
      const d = Math.hypot(c.root.position.x - pos.x, c.root.position.z - pos.z);
      if (d < bestD) {
        bestD = d;
        best = c;
      }
    }
    return best;
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
