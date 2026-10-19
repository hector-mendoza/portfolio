import * as THREE from "three";

const CRUISE = 20; // studs per second
const DWELL = 7; // seconds at each stop when auto-touring

/** Drives the tram group along the route polyline and tracks the current stop. */
export class TramRide {
  constructor(route, group) {
    this.route = route;
    this.group = group;
    this.t = route.stops[0]?.t ?? 0;
    this.stopIndex = 0;
    this.target = this.t;
    this.speed = 0;
    this.autoplay = true;
    this.dwell = 0;
    this.direction = 1;
    this.heading = new THREE.Vector3(0, 0, -1);
    this.onArrive = null;
    this.arrivedAt = -1;
    this.moving = false;
    this.apply();
  }

  pointAt(t) {
    const pts = this.route.points;
    const clamped = Math.max(0, Math.min(this.route.length, t));
    for (let i = 1; i < pts.length; i++) {
      if (clamped <= pts[i].t) {
        const a = pts[i - 1];
        const b = pts[i];
        const f = (clamped - a.t) / Math.max(1e-6, b.t - a.t);
        return { x: a.x + (b.x - a.x) * f, z: a.z + (b.z - a.z) * f, dx: Math.sign(b.x - a.x), dz: Math.sign(b.z - a.z) };
      }
    }
    const last = pts[pts.length - 1];
    const prev = pts[pts.length - 2];
    return { x: last.x, z: last.z, dx: Math.sign(last.x - prev.x), dz: Math.sign(last.z - prev.z) };
  }

  goTo(index) {
    const n = this.route.stops.length;
    const next = Math.max(0, Math.min(n - 1, index));
    this.direction = next >= this.stopIndex ? 1 : -1;
    this.stopIndex = next;
    this.target = this.route.stops[next].t;
    this.dwell = 0;
    this.arrivedAt = -1;
  }

  next() {
    if (this.stopIndex >= this.route.stops.length - 1) {
      this.goTo(0);
      return;
    }
    this.goTo(this.stopIndex + 1);
  }

  prev() {
    if (this.stopIndex <= 0) {
      this.goTo(this.route.stops.length - 1);
      return;
    }
    this.goTo(this.stopIndex - 1);
  }

  get stop() {
    return this.route.stops[this.stopIndex];
  }

  update(dt) {
    const remaining = this.target - this.t;
    const dist = Math.abs(remaining);
    if (dist > 0.05) {
      const dir = Math.sign(remaining);
      // ease in/out: cap speed by distance left
      const cap = Math.min(CRUISE, Math.sqrt(2 * 14 * dist) + 1.5);
      this.speed = Math.min(cap, this.speed + 18 * dt);
      const step = Math.min(dist, this.speed * dt);
      this.t += dir * step;
      this.moving = true;
    } else {
      this.t = this.target;
      this.speed = 0;
      if (this.moving) {
        this.moving = false;
        this.arrivedAt = this.stopIndex;
        this.onArrive?.(this.stop, this.stopIndex);
      }
      if (this.autoplay) {
        this.dwell += dt;
        if (this.dwell > DWELL) this.next();
      }
    }
    this.apply(dt);
  }

  apply(dt = 1 / 60) {
    const pt = this.pointAt(this.t);
    this.group.position.x = pt.x;
    this.group.position.z = pt.z;
    // forward is local -z, so yaw = atan2(-dx, -dz)
    const fx = pt.dx * this.direction;
    const fz = pt.dz * this.direction;
    if (fx !== 0 || fz !== 0) {
      const yaw = Math.atan2(-fx, -fz);
      let delta = yaw - this.group.rotation.y;
      delta = Math.atan2(Math.sin(delta), Math.cos(delta));
      this.group.rotation.y += delta * Math.min(1, dt * 9);
      this.heading.set(fx, 0, fz).normalize();
    }
  }
}
