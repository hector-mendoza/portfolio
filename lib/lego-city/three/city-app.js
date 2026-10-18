import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { compileCity } from "../compile.js";
import { createRng } from "../layout.js";
import { colorHex } from "../palette.js";
import { MaterialLibrary } from "./materials.js";
import { createGeometries } from "./geometry.js";
import { buildCityScene, buildClouds } from "./build-scene.js";
import { Player } from "./player.js";
import { TramRide } from "./tram-ride.js";
import { Minimap } from "./minimap.js";

const DAY = {
  sky: "#8fd0ff",
  fog: "#bfe6ff",
  sun: { color: "#fff4d6", intensity: 2.8 },
  hemi: { sky: "#cfe9ff", ground: "#7a9a52", intensity: 0.9 },
  exposure: 1.0,
};
const NIGHT = {
  sky: "#0b1530",
  fog: "#101b3a",
  sun: { color: "#8ea6ff", intensity: 0.22 },
  hemi: { sky: "#1a2a55", ground: "#0a0a12", intensity: 0.45 },
  exposure: 0.9,
};

const SEAT = new THREE.Vector3(0, 9.8, 3.5); // open-top deck, behind the pantograph

/**
 * Owns the renderer, scene, modes (ride / walk), input and the frame loop.
 * React only talks to it through a small imperative API + state callbacks.
 */
export class CityApp {
  constructor(container, { onState, minimapCanvas, reducedMotion = false, quality = "high" } = {}) {
    this.container = container;
    this.quality = quality;
    this.onState = onState ?? (() => {});
    this.minimapCanvas = minimapCanvas;
    this.reducedMotion = reducedMotion;
    this.state = {
      mode: "ride",
      view: "third",
      night: false,
      autoplay: !reducedMotion,
      stopIndex: 0,
      stop: null,
      moving: false,
      near: null,
      ready: false,
      intro: true,
    };
    this.keys = new Set();
    this.joy = { x: 0, z: 0 };
    this.look = { yaw: 0, pitch: 0.42, dist: 16 };
    this.rideLook = { yaw: 0, pitch: 0.05, userUntil: 0 };
    this.drag = null;
    this.clock = new THREE.Clock();
    this.disposed = false;
    this.introT = 0;
    this.introLook = new THREE.Vector3();
    this.tmp = {
      v1: new THREE.Vector3(),
      v2: new THREE.Vector3(),
      v3: new THREE.Vector3(),
    };
  }

  /* ------------------------------------------------------------ setup */

  init() {
    const city = compileCity();
    this.city = city;

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(this.quality === "low" ? 1 : 1.5, window.devicePixelRatio || 1));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = DAY.exposure;
    renderer.domElement.style.touchAction = "none";
    renderer.domElement.setAttribute("aria-label", "Mendoza City, an interactive 3D LEGO city");
    this.container.appendChild(renderer.domElement);
    this.renderer = renderer;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(DAY.sky);
    scene.fog = new THREE.Fog(DAY.fog, 160, 420);
    this.scene = scene;

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    this.camera = new THREE.PerspectiveCamera(55, 1, 0.5, 900);
    this.camera.position.set(0, 170, 240);

    this.mats = new MaterialLibrary();
    this.geos = createGeometries();
    const built = buildCityScene(city, this.geos, this.mats, { colorHex, quality: this.quality });
    scene.add(built.root);
    this.built = built;
    this.tramGroup = built.dynamics.find((d) => d.kind === "tram")?.group;
    this.cars = built.dynamics.filter((d) => d.kind === "car");
    this.wheels = built.dynamics.filter((d) => d.kind === "wheel");
    for (const car of this.cars) car.progress = car.offset * 4;

    this.clouds = buildClouds(this.mats, createRng(77), city.bounds);
    scene.add(this.clouds.group);

    // lights
    this.hemi = new THREE.HemisphereLight(DAY.hemi.sky, DAY.hemi.ground, DAY.hemi.intensity);
    scene.add(this.hemi);
    this.sun = new THREE.DirectionalLight(DAY.sun.color, DAY.sun.intensity);
    this.sun.position.set(70, 120, 50);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(this.quality === "low" ? 1024 : 2048, this.quality === "low" ? 1024 : 2048);
    this.sun.shadow.bias = -0.0006;
    this.sun.shadow.normalBias = 0.25;
    const sc = this.sun.shadow.camera;
    sc.left = -80;
    sc.right = 80;
    sc.top = 80;
    sc.bottom = -80;
    sc.near = 10;
    sc.far = 400;
    scene.add(this.sun);
    scene.add(this.sun.target);
    this.fill = new THREE.DirectionalLight("#cfe4ff", 0.5);
    this.fill.position.set(-80, 60, -40);
    scene.add(this.fill);
    // the "sun" itself
    const sunDisc = new THREE.Mesh(
      new THREE.SphereGeometry(10, 16, 16),
      new THREE.MeshBasicMaterial({ color: "#fff2b0", fog: false }),
    );
    sunDisc.position.set(260, 300, 180);
    scene.add(sunDisc);
    this.sunDisc = sunDisc;

    // player + tram
    this.player = new Player(city, this.geos, this.mats);
    this.player.place(city.spawn.x, city.spawn.z, city.spawn.yaw);
    this.player.root.visible = false;
    scene.add(this.player.root);
    this.ride = new TramRide(city.route, this.tramGroup);
    this.ride.autoplay = false; // wait for intro
    this.ride.onArrive = (stop, index) => this.setState({ stopIndex: index, stop, moving: false });
    this.setState({ stopIndex: 0, stop: city.route.stops[0] });

    if (this.minimapCanvas) this.minimap = new Minimap(this.minimapCanvas, city);

    this.bindEvents();
    this.resize();
    this.setState({ ready: true });
    this.renderer.setAnimationLoop(() => this.frame());
  }

  setState(patch) {
    let changed = false;
    for (const [k, v] of Object.entries(patch)) {
      if (this.state[k] !== v) {
        this.state[k] = v;
        changed = true;
      }
    }
    if (changed) this.onState({ ...this.state });
  }

  /* ------------------------------------------------------------ public API */

  setMode(mode) {
    if (mode === this.state.mode) return;
    if (mode === "walk") {
      // hop off next to the tram, on the side of the stop's primary lot
      const stop = this.ride.stop;
      const lot = this.city.lots.find((l) => l.id === stop.lots[0]);
      const tx = this.tramGroup.position.x;
      const tz = this.tramGroup.position.z;
      let dx = lot ? lot.rect.cx - tx : 1;
      let dz = lot ? lot.rect.cz - tz : 0;
      const len = Math.hypot(dx, dz) || 1;
      dx /= len;
      dz /= len;
      let px = tx + dx * 7;
      let pz = tz + dz * 7;
      if (this.player.blocked(px, pz)) {
        px = tx;
        pz = tz;
      }
      this.player.place(px, pz, Math.atan2(-dx, -dz));
      this.look.yaw = Math.atan2(-dx, -dz) + Math.PI;
      this.player.root.visible = true;
      this.ride.autoplay = false;
    } else {
      // board the tram: it meets you at the nearest stop
      const p = this.player.position;
      let best = 0;
      let bestD = Infinity;
      this.city.route.stops.forEach((s, i) => {
        const d = Math.hypot(s.x - p.x, s.z - p.z);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      });
      this.ride.t = this.city.route.stops[best].t;
      this.ride.goTo(best);
      this.ride.apply();
      this.ride.autoplay = this.state.autoplay;
      this.ride.dwell = 0;
      this.player.root.visible = false;
      this.setState({ stopIndex: best, stop: this.city.route.stops[best], near: null });
    }
    this.setState({ mode });
  }

  toggleMode() {
    this.setMode(this.state.mode === "ride" ? "walk" : "ride");
  }

  nextStop() {
    if (this.state.mode !== "ride") this.setMode("ride");
    this.ride.next();
    this.setState({ moving: true, stopIndex: this.ride.stopIndex, stop: this.ride.stop });
  }

  prevStop() {
    if (this.state.mode !== "ride") this.setMode("ride");
    this.ride.prev();
    this.setState({ moving: true, stopIndex: this.ride.stopIndex, stop: this.ride.stop });
  }

  goToStop(index) {
    if (this.state.mode !== "ride") this.setMode("ride");
    this.ride.goTo(index);
    this.setState({ moving: true, stopIndex: this.ride.stopIndex, stop: this.ride.stop });
  }

  setAutoplay(on) {
    this.ride.autoplay = on && this.state.mode === "ride";
    this.ride.dwell = 0;
    this.setState({ autoplay: on });
  }

  setNight(night) {
    const t = night ? NIGHT : DAY;
    this.scene.background.set(t.sky);
    this.scene.fog.color.set(t.fog);
    this.sun.color.set(t.sun.color);
    this.sun.intensity = t.sun.intensity;
    this.hemi.color.set(t.hemi.sky);
    this.hemi.groundColor.set(t.hemi.ground);
    this.hemi.intensity = t.hemi.intensity;
    this.fill.intensity = night ? 0.12 : 0.5;
    this.renderer.toneMappingExposure = t.exposure;
    this.scene.environmentIntensity = night ? 0.1 : 1;
    this.sunDisc.material.color.set(night ? "#e9eefc" : "#fff2b0");
    this.mats.setNight(night);
    this.setState({ night });
  }

  setView(view) {
    this.setState({ view });
  }

  startTour() {
    this.setState({ intro: false });
    this.ride.autoplay = this.state.autoplay && this.state.mode === "ride";
    this.ride.dwell = 0;
  }

  /** Landmark cards for the current context (ride stop or walk proximity). */
  landmarksFor(stop) {
    return stop.lots.map((id) => this.city.landmarks.find((lm) => lm.lotId === id)).filter(Boolean);
  }

  setJoystick(x, z) {
    this.joy.x = x;
    this.joy.z = z;
  }

  /* ------------------------------------------------------------ input */

  bindEvents() {
    const el = this.renderer.domElement;
    this.onKeyDown = (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const k = e.key.toLowerCase();
      this.keys.add(k);
      if (k === "tab") {
        e.preventDefault();
        this.toggleMode();
      } else if (k === " " && this.state.mode === "ride") {
        e.preventDefault();
        this.nextStop();
      } else if (k === "arrowright" && this.state.mode === "ride") {
        this.nextStop();
      } else if (k === "arrowleft" && this.state.mode === "ride") {
        this.prevStop();
      } else if (k === "n") {
        this.setNight(!this.state.night);
      } else if (k === "v") {
        this.setView(this.state.view === "third" ? "first" : "third");
      } else if ((k === "e" || k === "enter") && this.state.near) {
        this.onState({ ...this.state, open: this.state.near, openNonce: Math.random() });
      }
    };
    this.onKeyUp = (e) => this.keys.delete(e.key.toLowerCase());
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);

    this.onPointerDown = (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      el.setPointerCapture?.(e.pointerId);
      this.drag = { x: e.clientX, y: e.clientY, moved: 0, id: e.pointerId };
    };
    this.onPointerMove = (e) => {
      if (!this.drag || this.drag.id !== e.pointerId) return;
      const dx = e.clientX - this.drag.x;
      const dy = e.clientY - this.drag.y;
      this.drag.x = e.clientX;
      this.drag.y = e.clientY;
      this.drag.moved += Math.abs(dx) + Math.abs(dy);
      const look = this.state.mode === "ride" ? this.rideLook : this.look;
      look.yaw -= dx * 0.0055;
      look.pitch = Math.max(-0.35, Math.min(1.2, look.pitch + dy * 0.004));
      if (this.state.mode === "ride") this.rideLook.userUntil = performance.now() + 6000;
    };
    this.onPointerUp = (e) => {
      if (!this.drag || this.drag.id !== e.pointerId) return;
      const tap = this.drag.moved < 6;
      this.drag = null;
      if (tap) this.pick(e);
    };
    this.onWheel = (e) => {
      if (this.state.mode !== "walk") return;
      this.look.dist = Math.max(6, Math.min(40, this.look.dist + e.deltaY * 0.02));
    };
    el.addEventListener("pointerdown", this.onPointerDown);
    el.addEventListener("pointermove", this.onPointerMove);
    el.addEventListener("pointerup", this.onPointerUp);
    el.addEventListener("pointercancel", this.onPointerUp);
    el.addEventListener("wheel", this.onWheel, { passive: true });

    this.raycaster = new THREE.Raycaster();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.container);
  }

  /** Tap/click on a floating label opens that landmark. */
  pick(e) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    this.raycaster.setFromCamera(ndc, this.camera);
    const hits = this.raycaster.intersectObjects(this.built.labels.children, false);
    if (!hits.length) return;
    const sprite = hits[0].object;
    const label = this.city.labels[this.built.labels.children.indexOf(sprite)];
    const landmark = this.city.landmarks.find((lm) => lm.title === label?.text);
    if (landmark) this.onState({ ...this.state, open: landmark, openNonce: Math.random() });
  }

  resize() {
    const w = this.container.clientWidth || 1;
    const h = this.container.clientHeight || 1;
    this.renderer.setSize(w, h, false);
    this.renderer.domElement.style.width = "100%";
    this.renderer.domElement.style.height = "100%";
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  /* ------------------------------------------------------------ frame */

  moveInput() {
    const k = this.keys;
    let x = this.joy.x;
    let z = this.joy.z;
    if (k.has("w") || k.has("arrowup")) z -= 1;
    if (k.has("s") || k.has("arrowdown")) z += 1;
    if (k.has("a") || k.has("arrowleft")) x -= 1;
    if (k.has("d") || k.has("arrowright")) x += 1;
    const run = k.has("shift");
    // camera-relative
    const yaw = this.look.yaw;
    const fx = -Math.sin(yaw);
    const fz = -Math.cos(yaw);
    const rx = -fz;
    const rz = fx;
    return { x: fx * -z + rx * x, z: fz * -z + rz * x, run };
  }

  frame() {
    if (this.disposed) return;
    const dt = Math.min(0.05, this.clock.getDelta());
    const { v1, v2 } = this.tmp;
    const mode = this.state.mode;

    // animated props
    for (const car of this.cars) this.updateCar(car, dt);
    for (const wheel of this.wheels) {
      wheel.group.rotation.x += dt * 0.35;
      for (const g of wheel.gondolas) g.rotation.x = -wheel.group.rotation.x;
    }
    if (!this.reducedMotion) this.clouds.update(dt);

    if (mode === "walk") {
      const m = this.moveInput();
      this.player.update(dt, m.x, m.z, m.run);
      this.updateNear();
    } else {
      this.ride.update(dt);
      if (this.ride.moving !== this.state.moving) this.setState({ moving: this.ride.moving });
    }

    this.updateCamera(dt);

    // shadow follows the focus
    const focus = mode === "walk" ? this.player.position : this.tramGroup.position;
    this.sun.target.position.copy(focus);
    v1.set(70, 120, 50).add(focus);
    this.sun.position.copy(v1);
    v2.copy(this.sun.position);

    if (this.minimap) {
      this.minimap.draw({
        player: { x: this.player.position.x, z: this.player.position.z, yaw: this.player.yaw },
        tram: { x: this.tramGroup.position.x, z: this.tramGroup.position.z },
        mode,
        stopIndex: this.ride.stopIndex,
      });
    }

    this.renderer.render(this.scene, this.camera);
  }

  updateCar(car, dt) {
    const loop = car.loop;
    car.progress = (car.progress + (dt * car.speed) / 40) % 4; // 4 edges, "progress" in edges
    const i = Math.floor(car.progress);
    const f = car.progress - i;
    const a = loop[i % 4];
    const b = loop[(i + 1) % 4];
    const x = a.x + (b.x - a.x) * f;
    const z = a.z + (b.z - a.z) * f;
    car.group.position.set(x, 0, z);
    const yaw = Math.atan2(-(b.x - a.x), -(b.z - a.z));
    let delta = yaw - car.group.rotation.y;
    delta = Math.atan2(Math.sin(delta), Math.cos(delta));
    car.group.rotation.y += delta * Math.min(1, dt * 8);
  }

  updateNear() {
    const p = this.player.position;
    let best = null;
    let bestD = Infinity;
    for (const lm of this.city.landmarks) {
      const d = Math.hypot(lm.x - p.x, lm.z - p.z);
      if (d < lm.radius && d < bestD) {
        bestD = d;
        best = lm;
      }
    }
    if (best?.id !== this.state.near?.id) this.setState({ near: best });
  }

  updateCamera(dt) {
    const { v1, v2, v3 } = this.tmp;
    const cam = this.camera;
    let targetPos;
    let lookAt;
    if (this.state.mode === "walk") {
      const p = this.player.position;
      const head = v3.set(p.x, p.y + 4.2, p.z);
      if (this.state.view === "first") {
        targetPos = v1.set(p.x - Math.sin(this.player.yaw) * 0.6, p.y + 4.4, p.z - Math.cos(this.player.yaw) * 0.6);
        lookAt = v2.set(
          p.x - Math.sin(this.look.yaw) * 10,
          p.y + 4.4 - Math.sin(this.look.pitch - 0.3) * 10,
          p.z - Math.cos(this.look.yaw) * 10,
        );
        // player faces the camera yaw in first person
        this.player.targetYaw = this.look.yaw;
      } else {
        const d = this.look.dist;
        const pitch = this.look.pitch;
        targetPos = v1.set(
          p.x + Math.sin(this.look.yaw) * Math.cos(pitch) * d,
          p.y + 2 + Math.sin(pitch) * d,
          p.z + Math.cos(this.look.yaw) * Math.cos(pitch) * d,
        );
        if (targetPos.y < p.y + 1.5) targetPos.y = p.y + 1.5;
        lookAt = v2.copy(head);
      }
    } else {
      const g = this.tramGroup;
      targetPos = v1.copy(SEAT).applyQuaternion(g.quaternion).add(g.position);
      // auto-look toward the stop's primary lot when idle
      if (!this.ride.moving && performance.now() > this.rideLook.userUntil) {
        const lot = this.city.lots.find((l) => l.id === this.ride.stop.lots[0]);
        if (lot) {
          const dx = lot.rect.cx - g.position.x;
          const dz = lot.rect.cz - g.position.z;
          const want = Math.atan2(-dx, -dz) - g.rotation.y;
          let delta = want - this.rideLook.yaw;
          delta = Math.atan2(Math.sin(delta), Math.cos(delta));
          this.rideLook.yaw += delta * Math.min(1, dt * 1.6);
          this.rideLook.pitch += (0.12 - this.rideLook.pitch) * Math.min(1, dt * 1.6);
        }
      } else if (this.ride.moving && performance.now() > this.rideLook.userUntil) {
        let delta = -this.rideLook.yaw;
        delta = Math.atan2(Math.sin(delta), Math.cos(delta));
        this.rideLook.yaw += delta * Math.min(1, dt * 1.2);
        this.rideLook.pitch += (0.05 - this.rideLook.pitch) * Math.min(1, dt * 1.2);
      }
      const yaw = g.rotation.y + this.rideLook.yaw;
      const pitch = this.rideLook.pitch;
      lookAt = v2.set(
        targetPos.x - Math.sin(yaw) * Math.cos(pitch) * 20,
        targetPos.y - Math.sin(pitch) * 20 + 1,
        targetPos.z - Math.cos(yaw) * Math.cos(pitch) * 20,
      );
    }

    if (this.state.intro && this.introT < 1) {
      // fly-in from above the city
      this.introT = Math.min(1, this.introT + dt / (this.reducedMotion ? 0.01 : 4.5));
      const e = 1 - Math.pow(1 - this.introT, 3);
      const from = v3.set(0, 170, 240);
      cam.position.lerpVectors(from, targetPos, e);
      this.introLook.set(0, 0, 0).lerp(lookAt, e);
      cam.lookAt(this.introLook);
      return;
    }
    const k = this.state.mode === "walk" && this.state.view === "first" ? 1 : Math.min(1, dt * 6);
    cam.position.lerp(targetPos, k);
    cam.lookAt(lookAt);
  }

  /* ------------------------------------------------------------ teardown */

  dispose() {
    this.disposed = true;
    this.renderer?.setAnimationLoop(null);
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    const el = this.renderer?.domElement;
    if (el) {
      el.removeEventListener("pointerdown", this.onPointerDown);
      el.removeEventListener("pointermove", this.onPointerMove);
      el.removeEventListener("pointerup", this.onPointerUp);
      el.removeEventListener("pointercancel", this.onPointerUp);
      el.removeEventListener("wheel", this.onWheel);
    }
    this.resizeObserver?.disconnect();
    this.scene?.traverse((obj) => {
      if (obj.isSprite) {
        obj.material.map?.dispose();
        obj.material.dispose();
      }
    });
    this.clouds?.dispose();
    this.geos?.dispose();
    this.mats?.dispose();
    this.renderer?.dispose();
    el?.remove();
  }
}
