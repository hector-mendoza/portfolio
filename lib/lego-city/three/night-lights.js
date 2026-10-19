import * as THREE from "three";
import { colorHex } from "../palette.js";
import { createRng } from "../layout.js";

function radialTexture(stops = [[0, "rgba(255,255,255,1)"], [0.25, "rgba(255,255,255,0.55)"], [1, "rgba(255,255,255,0)"]]) {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  for (const [o, c] of stops) g.addColorStop(o, c);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Everything that makes the city glow after dark: warm light pools under each
 * street lamp, halos on lamp heads and glowing signs, a pool of real point
 * lights that follows the visitor, tram/car headlights, fireflies in the parks.
 * Window glow lives in the glass material (random lit windows).
 */
export class NightLights {
  constructor(city, { quality = "high" } = {}) {
    this.city = city;
    this.group = new THREE.Group();
    this.group.name = "night-lights";
    this.group.visible = false;
    this.glowTex = radialTexture();
    this.poolTex = radialTexture([[0, "rgba(255,255,255,0.85)"], [0.45, "rgba(255,255,255,0.28)"], [1, "rgba(255,255,255,0)"]]);
    this.lamps = city.lights.filter((l) => l.kind === "lamp");
    this.time = 0;
    this.on = false;
    this.level = 0;

    // ground pools under the lamps (one instanced draw call)
    const poolGeo = new THREE.PlaneGeometry(1, 1);
    poolGeo.rotateX(-Math.PI / 2);
    this.poolMat = new THREE.MeshBasicMaterial({
      map: this.poolTex,
      color: "#ffcf80",
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.pools = new THREE.InstancedMesh(poolGeo, this.poolMat, this.lamps.length);
    const m = new THREE.Matrix4();
    this.lamps.forEach((lamp, i) => {
      m.compose(new THREE.Vector3(lamp.x, 0.75, lamp.z), new THREE.Quaternion(), new THREE.Vector3(22, 1, 22));
      this.pools.setMatrixAt(i, m);
    });
    this.pools.renderOrder = 1;
    this.pools.frustumCulled = false;
    this.group.add(this.pools);

    // halos: lamp heads + accent colours (signs, fountain)
    this.halos = [];
    this.addHalos(this.lamps.map((l) => [l.x, l.y, l.z]), "#ffd98a", 9, 0.9);
    const accents = new Map();
    for (const l of city.lights.filter((x) => x.kind === "accent")) {
      const key = `${l.c}|${l.size.toFixed(1)}`;
      if (!accents.has(key)) accents.set(key, { c: l.c, size: l.size, pts: [] });
      accents.get(key).pts.push([l.x, l.y, l.z]);
    }
    for (const { c, size, pts } of accents.values()) this.addHalos(pts, colorHex(c), 20 * size, 0.55);

    // real lights that follow the focus
    this.pointCount = quality === "low" ? 3 : 8;
    this.pointLights = [];
    for (let i = 0; i < this.pointCount; i++) {
      const light = new THREE.PointLight("#ffc26b", 70, 42, 1.6);
      light.castShadow = false;
      this.pointLights.push(light);
    }

    // vehicles' headlights are attached later (they live inside moving groups)
    this.vehicleGlows = [];
    this.vehicleSpots = [];

    // fireflies
    const rng = createRng(31337);
    const parks = city.lots.filter((l) => l.kind === "park");
    this.fireflyBase = [];
    const count = quality === "low" ? 30 : 80;
    for (let i = 0; i < count; i++) {
      const park = rng.pick(parks).rect;
      this.fireflyBase.push({
        x: park.cx + rng.range(-12, 12),
        y: rng.range(2.5, 9),
        z: park.cz + rng.range(-12, 12),
        ph: rng.range(0, 6.28),
        sp: rng.range(0.5, 1.4),
      });
    }
    this.fireflyGeo = new THREE.BufferGeometry();
    this.fireflyGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    this.fireflies = new THREE.Points(
      this.fireflyGeo,
      new THREE.PointsMaterial({
        size: 1.6,
        map: this.glowTex,
        color: "#d7ff7a",
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    this.fireflies.frustumCulled = false;
    this.group.add(this.fireflies);
  }

  addHalos(points, color, size, opacity) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(points.flat()), 3));
    const pts = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        size,
        map: this.glowTex,
        color,
        transparent: true,
        opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    pts.renderOrder = 5;
    pts.frustumCulled = false;
    this.halos.push(pts);
    this.group.add(pts);
  }

  /** Headlights for the tram (spot beams) and cars (glow sprites). */
  attachVehicles(dynamics) {
    const glow = (parent, x, y, z, color, size) => {
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: this.glowTex, color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }),
      );
      sprite.position.set(x, y, z);
      sprite.scale.set(size, size, 1);
      sprite.visible = false;
      sprite.renderOrder = 6;
      parent.add(sprite);
      this.vehicleGlows.push(sprite);
    };
    for (const dyn of dynamics) {
      if (dyn.kind === "car") {
        for (const sx of [-1.3, 1.3]) {
          glow(dyn.group, sx, 1.7, -3.9, "#fff1b8", 5);
          glow(dyn.group, sx, 1.7, 3.9, "#ff4a3a", 2.6);
        }
      } else if (dyn.kind === "tram") {
        for (const sx of [-2, 2]) {
          glow(dyn.group, sx, 3.8, -11.4, "#fff1b8", 9);
          glow(dyn.group, sx, 3.8, 11.4, "#ff4a3a", 4);
          const spot = new THREE.SpotLight("#fff1c8", 160, 70, 0.5, 0.6, 1.2);
          spot.position.set(sx, 3.6, -11.2);
          spot.target.position.set(sx, 0.5, -40);
          spot.visible = false;
          dyn.group.add(spot, spot.target);
          this.vehicleSpots.push(spot);
        }
      }
    }
  }

  /** level 0..1: lamps, pools, halos and headlights fade in through dusk. */
  setLevel(level, scene) {
    const on = level > 0.04;
    this.level = level;
    if (on !== this.on) {
      this.on = on;
      this.group.visible = on;
      for (const s of this.vehicleGlows) s.visible = on;
      for (const s of this.vehicleSpots) s.visible = on;
      for (const light of this.pointLights) {
        if (on && !light.parent) scene.add(light);
        else if (!on && light.parent) light.parent.remove(light);
      }
    }
    if (!on) return;
    this.poolMat.opacity = 0.5 * level;
    this.halos.forEach((h, i) => (h.material.opacity = (i === 0 ? 0.9 : 0.55) * level));
    for (const light of this.pointLights) light.intensity = 70 * level;
    for (const s of this.vehicleSpots) s.intensity = 160 * level;
    for (const g of this.vehicleGlows) g.material.opacity = level;
    this.fireflies.material.userData.level = level;
  }

  update(dt, focus) {
    if (!this.on) return;
    this.time += dt;
    // the closest lamps get a real light
    const lamps = this.lamps;
    const order = lamps
      .map((l, i) => [Math.hypot(l.x - focus.x, l.z - focus.z), i])
      .sort((a, b) => a[0] - b[0])
      .slice(0, this.pointCount);
    order.forEach(([, i], k) => {
      const l = lamps[i];
      this.pointLights[k].position.set(l.x, l.y - 0.5, l.z);
    });
    // fireflies drift
    const pos = this.fireflyGeo.attributes.position;
    this.fireflyBase.forEach((f, i) => {
      const t = this.time * f.sp + f.ph;
      pos.setXYZ(i, f.x + Math.sin(t) * 2.2, f.y + Math.sin(t * 1.7) * 0.9, f.z + Math.cos(t * 0.8) * 2.2);
    });
    pos.needsUpdate = true;
    this.fireflies.material.opacity = (0.65 + Math.sin(this.time * 3) * 0.25) * (this.level ?? 1);
  }

  dispose() {
    this.glowTex.dispose();
    this.poolTex.dispose();
    this.poolMat.dispose();
    this.fireflyGeo.dispose();
    this.pools.geometry.dispose();
    for (const h of this.halos) {
      h.geometry.dispose();
      h.material.dispose();
    }
  }
}
