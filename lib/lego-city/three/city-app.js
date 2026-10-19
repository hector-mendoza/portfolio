import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { compileCity } from "../compile.js";
import { createRng } from "../layout.js";
import { colorHex } from "../palette.js";
import { MaterialLibrary } from "./materials.js";
import { createGeometries } from "./geometry.js";
import { buildCityScene, buildClouds, applyBuildIn, BUILD_DURATION } from "./build-scene.js";
import { Player, recolorMinifig } from "./player.js";
import { Citizens } from "./citizens.js";
import { Collectibles } from "./collectibles.js";
import { Sounds } from "./sounds.js";
import { createSky } from "./sky.js";
import { NightLights } from "./night-lights.js";
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

const SEAT = new THREE.Vector3(1.6, 7.8, -4); // on the roof deck, ahead of the pantograph pole

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
      mode: "explore",
      autoRotate: true,
      view: "third",
      night: false,
      autoplay: !reducedMotion,
      stopIndex: 0,
      stop: null,
      moving: false,
      near: null,
      ready: false,
      intro: true,
      studs: 0,
      studsTotal: 0,
      muted: false,
    };
    this.sounds = new Sounds();
    this.state.muted = this.sounds.muted;
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
    renderer.domElement.setAttribute("aria-label", "Pilleland, an interactive 3D LEGO city");
    this.container.appendChild(renderer.domElement);
    this.renderer = renderer;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(DAY.sky);
    scene.fog = new THREE.Fog(DAY.fog, 180, 560);
    this.scene = scene;
    this.sky = createSky();
    scene.add(this.sky.mesh);

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    this.camera = new THREE.PerspectiveCamera(55, 1, 0.5, 1400);
    this.camera.position.set(0, 170, 240);

    this.mats = new MaterialLibrary({ seams: this.quality !== "low" });
    this.geos = createGeometries();
    const built = buildCityScene(city, this.geos, this.mats, { colorHex, quality: this.quality });
    scene.add(built.root);
    this.built = built;
    this.tramGroup = built.dynamics.find((d) => d.kind === "tram")?.group;
    this.cars = built.dynamics.filter((d) => d.kind === "car");
    this.wheels = built.dynamics.filter((d) => d.kind === "wheel");
    for (const car of this.cars) car.progress = car.offset * 4;

    if (!this.reducedMotion) applyBuildIn(built.staticMeshes, -1); // collapsed until the tour starts
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
    sc.left = -100;
    sc.right = 100;
    sc.top = 100;
    sc.bottom = -100;
    sc.near = 10;
    sc.far = 500;
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
    this.player.dynamicColliders = () => {
      const g = this.tramGroup;
      const alongX = Math.abs(Math.sin(g.rotation.y)) > 0.5;
      return [{ x: g.position.x, z: g.position.z, w: alongX ? 24 : 7, d: alongX ? 7 : 24 }];
    };
    scene.add(this.player.root);
    this.nightLights = new NightLights(city, { quality: this.quality });
    scene.add(this.nightLights.group);
    this.nightLights.attachVehicles(built.dynamics);
    this.citizens = new Citizens(city, this.geos, this.mats, this.quality === "low" ? 8 : 14);
    scene.add(this.citizens.group);
    this.collectibles = new Collectibles(city, this.mats);
    scene.add(this.collectibles.group);
    this.state.studsTotal = this.collectibles.total;
    this.state.studs = this.collectibles.count;
    this.player.onLand = () => this.sounds.land();
    this.player.onStep = () => this.sounds.step(performance.now() / 1000);
    this.ride = new TramRide(city.route, this.tramGroup);
    this.ride.autoplay = false; // wait for intro
    this.ride.onArrive = (stop, index) => {
      this.sounds.bell();
      this.setState({ stopIndex: index, stop, moving: false });
    };
    this.setState({ stopIndex: 0, stop: city.route.stops[0] });

    if (this.minimapCanvas) this.minimap = new Minimap(this.minimapCanvas, city);

    this.bindEvents();
    this.resize();
    // model-viewer controls (Explore mode + the welcome turntable)
    this.orbit = new OrbitControls(this.camera, renderer.domElement);
    this.orbit.enableDamping = true;
    this.orbit.dampingFactor = 0.08;
    this.orbit.minDistance = 12;
    this.orbit.maxDistance = 640;
    this.orbit.maxPolarAngle = Math.PI / 2 - 0.03;
    this.orbit.autoRotate = !this.reducedMotion;
    this.orbit.autoRotateSpeed = 0.6;
    this.orbit.target.set(0, 6, 0);
    this.camera.position.set(190, 150, 240);
    this.orbit.update();
    // the city rains in as soon as the page is ready
    this.buildT = this.reducedMotion ? 1e9 : 0;
    this.buildStart = performance.now();
    this.setState({ ready: true });
    if (typeof window !== "undefined") window.__pilleland = this;
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
    const from = this.state.mode;
    this.orbit.enabled = mode === "explore";
    if (mode === "explore") {
      this.player.root.visible = false;
      this.ride.autoplay = false;
      // orbit from wherever the camera is now
      const focus = from === "walk" ? this.player.position : this.tramGroup.position;
      this.orbit.target.set(focus.x, 6, focus.z);
      this.orbit.update();
      this.setState({ mode, near: null });
      return;
    }
    if (from === "explore") {
      // glide from the viewer camera into the seat / behind the minifig
      this.flyT = 0;
      this.flyStart = performance.now();
      this.flyFrom = this.camera.position.clone();
      this.flyLookFrom = this.orbit.target.clone();
    }
    if (mode === "walk") {
      // hop off next to the tram, on the sidewalk side of the stop's primary lot,
      // offset perpendicular to the tram so its collider never swallows you
      const stop = this.ride.stop;
      const lot = this.city.lots.find((l) => l.id === stop.lots[0]);
      const tx = this.tramGroup.position.x;
      const tz = this.tramGroup.position.z;
      const h = this.ride.heading;
      let sx = -h.z;
      let sz = h.x;
      if (lot && (lot.rect.cx - tx) * sx + (lot.rect.cz - tz) * sz < 0) {
        sx = -sx;
        sz = -sz;
      }
      const off = this.city.layout.road / 2 + 1.5;
      let px = tx + sx * off;
      let pz = tz + sz * off;
      if (this.player.blocked(px, pz)) {
        px = tx - sx * off;
        pz = tz - sz * off;
      }
      // stand on the sidewalk facing along the street, with the tram at your side
      const yaw = Math.atan2(-h.x, -h.z);
      this.player.place(px, pz, yaw);
      this.look.yaw = yaw;
      this.look.pitch = 0.5;
      this.player.root.visible = this.state.view !== "first";
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
    const order = ["ride", "walk", "explore"];
    this.setMode(order[(order.indexOf(this.state.mode) + 1) % order.length]);
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
    this.sky.setNight(night);
    this.nightLights.setNight(night, this.scene);
    this.mats.setNight(night);
    this.setState({ night });
  }

  setView(view) {
    // in first person the minifig would only clip the camera, so hide it
    this.player.root.visible = this.state.mode === "walk" && view !== "first";
    this.setState({ view });
  }

  setMuted(muted) {
    this.sounds.setMuted(muted);
    this.setState({ muted });
  }

  setPlayerColors(colors) {
    recolorMinifig(this.player.root, this.mats, colors);
    this.playerColors = { ...this.playerColors, ...colors };
    this.sounds.snap();
  }

  resetStuds() {
    this.collectibles.reset();
    this.setState({ studs: 0 });
  }

  startTour() {
    this.sounds.unlock();
    this.setState({ intro: false });
    this.setMode("ride");
    this.ride.autoplay = this.state.autoplay;
    this.ride.dwell = 0;
  }

  /** Close the welcome card and stay in the model viewer. */
  explore() {
    this.sounds.unlock();
    this.setState({ intro: false });
    this.setMode("explore");
  }

  /* --------------------------------------------------------- explore mode */

  setAutoRotate(on) {
    this.orbit.autoRotate = on;
    this.setState({ autoRotate: on });
  }

  orbitZoom(factor) {
    const cam = this.camera;
    const t = this.orbit.target;
    const dir = cam.position.clone().sub(t);
    const len = THREE.MathUtils.clamp(dir.length() * factor, this.orbit.minDistance, this.orbit.maxDistance);
    cam.position.copy(t).add(dir.normalize().multiplyScalar(len));
    this.orbit.update();
  }

  orbitView(name) {
    const t = this.orbit.target;
    t.set(0, 6, 0);
    if (name === "top") this.camera.position.set(0.01, 330, 0.01);
    else if (name === "front") this.camera.position.set(0, 60, 260);
    else if (name === "side") this.camera.position.set(260, 60, 0);
    else this.camera.position.set(190, 150, 240);
    this.orbit.update();
  }

  /** Orbit around one landmark (used when a card is opened in Explore). */
  orbitTo(landmark) {
    if (!landmark) return;
    this.orbit.target.set(landmark.x, 8, landmark.z);
    const d = this.camera.position.clone().sub(this.orbit.target);
    if (d.length() > 90) {
      d.normalize().multiplyScalar(70);
      this.camera.position.copy(this.orbit.target).add(d.setY(Math.max(d.y, 30)));
    }
    this.orbit.update();
  }

  /** Landmark cards for the current context (ride stop or walk proximity). */
  landmarksFor(stop) {
    return stop.lots.map((id) => this.city.landmarks.find((lm) => lm.lotId === id)).filter(Boolean);
  }

  jump() {
    if (this.state.mode === "walk" && this.player.jump()) this.sounds.jump();
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
      } else if (k === " " && this.state.mode === "walk") {
        e.preventDefault();
        if (this.player.jump()) this.sounds.jump();
      } else if (k === "m") {
        this.setMuted(!this.state.muted);
      } else if (k === "n") {
        this.setNight(!this.state.night);
      } else if (k === "v") {
        this.setView(this.state.view === "third" ? "first" : "third");
      } else if ((k === "e" || k === "enter") && this.state.near) {
        this.sounds.open();
        this.onState({ ...this.state, open: this.state.near, openNonce: Math.random() });
      }
    };
    this.onKeyUp = (e) => this.keys.delete(e.key.toLowerCase());
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);

    this.onPointerDown = (e) => {
      this.sounds.unlock();
      if (e.button !== undefined && e.button !== 0) return;
      if (this.state.mode !== "explore") el.setPointerCapture?.(e.pointerId);
      this.drag = { x: e.clientX, y: e.clientY, moved: 0, id: e.pointerId };
    };
    this.onPointerMove = (e) => {
      if (!this.drag || this.drag.id !== e.pointerId) return;
      if (this.state.mode === "explore") {
        this.drag.moved += Math.abs(e.clientX - this.drag.x) + Math.abs(e.clientY - this.drag.y);
        this.drag.x = e.clientX;
        this.drag.y = e.clientY;
        return;
      }
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
      if (this.state.mode !== "walk") return; // explore zoom is handled by OrbitControls
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
    if (landmark) {
      this.sounds.open();
      if (this.state.mode === "explore") this.orbitTo(landmark);
      this.onState({ ...this.state, open: landmark, openNonce: Math.random() });
    }
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
    if (this.buildT !== undefined && this.buildT < BUILD_DURATION + 2) {
      // wall-clock driven so a slow device still finishes the build on time
      this.buildT = (performance.now() - this.buildStart) / 1000;
      const busy = applyBuildIn(this.built.staticMeshes, this.buildT);
      if (!busy) this.buildT = 1e9;
    }
    const { v1, v2 } = this.tmp;
    const mode = this.state.mode;

    // animated props
    for (const car of this.cars) this.updateCar(car, dt);
    for (const wheel of this.wheels) {
      wheel.group.rotation.x += dt * 0.35;
      for (const g of wheel.gondolas) g.rotation.x = -wheel.group.rotation.x;
    }
    if (!this.reducedMotion) this.clouds.update(dt);

    this.citizens.update(dt, mode === "walk" ? this.player.position : null);
    if (mode === "walk") {
      const m = this.moveInput();
      this.player.update(dt, m.x, m.z, m.run);
      this.updateNear();
      const picked = this.collectibles.update(dt, this.player.position);
      if (picked) {
        this.sounds.collect(this.collectibles.count);
        this.setState({ studs: this.collectibles.count });
      }
      // a little FOV kick while running
      const wantFov = m.run && this.player.speed > 10 ? 62 : 55;
      if (Math.abs(this.camera.fov - wantFov) > 0.05) {
        this.camera.fov += (wantFov - this.camera.fov) * Math.min(1, dt * 4);
        this.camera.updateProjectionMatrix();
      }
    } else if (mode === "explore") {
      this.collectibles.update(dt, null);
      this.ride.update(dt);
    } else {
      this.collectibles.update(dt, null);
      this.ride.update(dt);
      if (this.ride.moving !== this.state.moving) this.setState({ moving: this.ride.moving });
    }

    this.updateCamera(dt);
    this.sky.follow(this.camera.position);

    // shadow follows the focus
    const focus = mode === "walk" ? this.player.position : mode === "explore" ? this.orbit.target : this.tramGroup.position;
    this.sun.target.position.copy(focus);
    v1.set(80, 160, 60).add(focus);
    this.sun.position.copy(v1);
    v2.copy(this.sun.position);

    this.fadeLabels();
    this.nightLights.update(dt, mode === "walk" ? this.player.position : mode === "explore" ? this.orbit.target : this.tramGroup.position);

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

  /** Labels fade with distance so the skyline isn't wallpapered with pills. */
  fadeLabels() {
    const cam = this.camera.position;
    const sprites = this.built.labels.children;
    for (let i = 0; i < sprites.length; i++) {
      const sprite = sprites[i];
      const minor = !!this.city.labels[i]?.minor;
      const d = sprite.position.distanceTo(cam);
      const far = minor ? 70 : 150;
      const near = minor ? 40 : 90;
      const opacity = d < near ? 1 : d > far ? 0 : 1 - (d - near) / (far - near);
      sprite.material.opacity = opacity;
      sprite.visible = opacity > 0.02;
    }
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

  /** Debug/photo helper: pin the camera to a lot's front until `clearView()`. */
  viewLot(id, { distance = 30, height = 14 } = {}) {
    const lot = this.city.lots.find((l) => l.id === id);
    if (!lot) return false;
    const f = lot.rect.facing;
    this.debugView = {
      pos: new THREE.Vector3(lot.rect.cx + 10, height, lot.rect.cz + f * distance),
      look: new THREE.Vector3(lot.rect.cx, 5, lot.rect.cz),
    };
    return true;
  }

  clearView() {
    this.debugView = null;
  }

  updateCamera(dt) {
    const { v1, v2, v3 } = this.tmp;
    const cam = this.camera;
    let targetPos;
    let lookAt;
    if (this.state.mode === "explore") {
      this.orbit.update();
      return;
    }
    if (this.debugView) {
      cam.position.copy(this.debugView.pos);
      cam.lookAt(this.debugView.look);
      return;
    }
    if (this.state.mode === "walk") {
      const p = this.player.position;
      const head = v3.set(p.x, p.y + 4.2, p.z);
      if (this.state.view === "first") {
        targetPos = v1.set(p.x - Math.sin(this.look.yaw) * 0.9, p.y + 4.6, p.z - Math.cos(this.look.yaw) * 0.9);
        lookAt = v2.set(
          targetPos.x - Math.sin(this.look.yaw) * 10,
          targetPos.y - Math.sin(this.look.pitch - 0.3) * 10,
          targetPos.z - Math.cos(this.look.yaw) * 10,
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
          this.rideLook.pitch += (0.22 - this.rideLook.pitch) * Math.min(1, dt * 1.6);
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

    if (this.flyT !== undefined && this.flyT < 1) {
      // glide from the viewer camera into the seat / behind the minifig
      this.flyT = this.reducedMotion ? 1 : Math.min(1, (performance.now() - this.flyStart) / 2600);
      const e = 1 - Math.pow(1 - this.flyT, 3);
      cam.position.lerpVectors(this.flyFrom, targetPos, e);
      this.introLook.copy(this.flyLookFrom ?? this.introLook).lerp(lookAt, e);
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
    this.orbit?.dispose();
    this.scene?.traverse((obj) => {
      if (obj.isSprite) {
        obj.material.map?.dispose();
        obj.material.dispose();
      }
    });
    this.clouds?.dispose();
    this.sky?.dispose();
    this.nightLights?.dispose();
    this.collectibles?.dispose();
    this.sounds?.dispose();
    this.geos?.dispose();
    this.mats?.dispose();
    this.renderer?.dispose();
    el?.remove();
  }
}
