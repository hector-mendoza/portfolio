import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { compileCity } from "../compile.js";
import { getCity, HOME_CITY } from "../cities.js";
import { createRng } from "../layout.js";
import { colorHex } from "../palette.js";
import { MaterialLibrary } from "./materials.js";
import { createGeometries } from "./geometry.js";
import { buildCityScene, buildClouds, applyBuildIn, BUILD_DURATION } from "./build-scene.js";
import { createWireframe, WIRE_DURATION } from "./wireframe.js";
import { Player, recolorMinifig } from "./player.js";
import { Citizens } from "./citizens.js";
import { Collectibles } from "./collectibles.js";
import { Sounds } from "./sounds.js";
import { createSky } from "./sky.js";
import { NightLights } from "./night-lights.js";
import { EnvironmentController } from "./environment-controller.js";
import { TramRide } from "./tram-ride.js";
import { Minimap } from "./minimap.js";
import { Traffic, buildLoop } from "../traffic.js";
import { Bubbles } from "./bubbles.js";
import { Dialogue } from "../dialogue.js";

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


/**
 * Owns the renderer, scene, modes (ride / walk), input and the frame loop.
 * React only talks to it through a small imperative API + state callbacks.
 */
export class CityApp {
  constructor(container, { onState, minimapCanvas, reducedMotion = false, quality = "high", cityId = HOME_CITY } = {}) {
    this.container = container;
    this.cityId = cityId;
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
      talkable: null,
      talk: null,
      waypoint: null,
      closeUp: false,
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
    const city = compileCity((getCity(this.cityId) ?? getCity(HOME_CITY)).spec);
    this.city = city;
    this.state.city = { id: this.cityId, name: city.name, tagline: city.tagline, home: this.cityId === HOME_CITY };

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(this.quality === "low" ? 1 : 1.5, window.devicePixelRatio || 1));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = DAY.exposure;
    renderer.domElement.style.touchAction = "none";
    renderer.domElement.setAttribute("aria-label", `${city.name}, an interactive 3D LEGO city`);
    this.container.appendChild(renderer.domElement);
    this.renderer = renderer;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(DAY.sky);
    scene.fog = new THREE.Fog(DAY.fog, 220, 700);
    this.scene = scene;
    this.sky = createSky();
    scene.add(this.sky.mesh);

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    this.camera = new THREE.PerspectiveCamera(55, 1, 0.5, 1400);
    this.camera.position.set(0, 220, 320);

    this.mats = new MaterialLibrary({ seams: this.quality !== "low" });
    this.geos = createGeometries();
    const built = buildCityScene(city, this.geos, this.mats, { colorHex, quality: this.quality });
    scene.add(built.root);
    this.built = built;
    this.tramGroup = built.dynamics.find((d) => d.kind === "tram")?.group;
    this.cars = built.dynamics.filter((d) => d.kind === "car");
    this.wheels = built.dynamics.filter((d) => d.kind === "wheel");
    this.traffic = new Traffic(
      this.cars.map((c) => ({ path: buildLoop(c.plan), cruise: c.plan.cruise })),
      { seed: 7, intersections: city.intersections },
    );
    this.bubbles = new Bubbles(8);
    this.visited = new Set();
    this.dialogue = new Dialogue(city, { visited: this.visited });
    this.talkTarget = null;
    this.waypoint = null;
    this.prevPlayer = null;

    if (!this.reducedMotion) {
      applyBuildIn(built.staticMeshes, -1); // collapsed until the tour starts
      // the blueprint stage: every brick's outline is drawn in 3D before the bricks drop in
      this.wire = createWireframe(built.staticMeshes, { size: city.bounds * 2 });
      scene.add(this.wire.group);
      built.root.visible = false;
    }
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
      const h = this.ride.heading;
      const out = [{ x: this.tramGroup.position.x, z: this.tramGroup.position.z, hx: h.x, hz: h.z, len: 24, w: 7 }];
      for (const c of this.traffic.cars) out.push({ x: c.x, z: c.z, hx: c.hx, hz: c.hz, len: c.len, w: c.w });
      return out;
    };
    scene.add(this.player.root);
    scene.add(this.bubbles.group);
    this.nightLights = new NightLights(city, { quality: this.quality });
    scene.add(this.nightLights.group);
    this.nightLights.attachVehicles(built.dynamics);
    this.citizens = new Citizens(city, this.geos, this.mats, this.quality === "low" ? 8 : 14);
    scene.add(this.citizens.group);
    this.collectibles = new Collectibles(city, this.mats);
    scene.add(this.collectibles.group);
    this.env = new EnvironmentController(this);
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
    this.orbit.maxDistance = 820;
    this.orbit.maxPolarAngle = Math.PI / 2 - 0.03;
    this.orbit.autoRotate = !this.reducedMotion;
    this.orbit.autoRotateSpeed = 0.6;
    this.orbit.target.set(0, 6, 0);
    this.camera.position.set(250, 195, 315);
    this.orbit.update();
    // the city rains in as soon as the page is ready
    this.buildT = this.reducedMotion ? 1e9 : -WIRE_DURATION;
    this.wireStart = performance.now();
    this.buildStart = this.wireStart + (this.reducedMotion ? 0 : WIRE_DURATION * 1000);
    this.env.start();
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
      this.setState({ mode, near: null, closeUp: false });
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

  /** Compat wrapper: night forces the night sky, otherwise follow the live sun. */
  setNight(night) {
    this.env.setTimeMode(night ? "night" : "live");
  }

  setTimeMode(mode) {
    this.env.setTimeMode(mode);
  }

  setWeatherMode(mode) {
    this.env.setWeatherMode(mode);
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

  /** Walk mode: a portrait camera that circles the minifig so you can look at it closely. */
  setCloseUp(on) {
    if (on && this.state.mode !== "walk") return;
    if (on === this.state.closeUp) return;
    if (on) {
      this.closeUpPrev = { dist: this.look.dist, pitch: this.look.pitch, view: this.state.view };
      this.look.yaw = this.player.yaw + Math.PI; // swing round to the face
      this.look.dist = 8.5;
      this.look.pitch = 0.08;
      this.setState({ closeUp: true, view: "third" });
    } else {
      if (this.closeUpPrev) {
        this.look.dist = this.closeUpPrev.dist;
        this.look.pitch = this.closeUpPrev.pitch;
      }
      this.setState({ closeUp: false });
    }
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
    else this.camera.position.set(250, 195, 315);
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
        this.env.setTimeMode(this.env.timeMode === "night" ? "live" : "night");
      } else if (k === "c" && this.state.mode === "walk") {
        this.setCloseUp(!this.state.closeUp);
      } else if (k === "v") {
        this.setView(this.state.view === "third" ? "first" : "third");
      } else if ((k === "e" || k === "enter") && this.state.talkable && !this.state.talk) {
        this.startTalk();
      } else if ((k === "e" || k === "enter") && this.state.near) {
        this.sounds.open();
        this.visited.add(this.state.near.id);
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
      this.look.dist = Math.max(this.state.closeUp ? 2.6 : 6, Math.min(this.state.closeUp ? 14 : 40, this.look.dist + e.deltaY * 0.02));
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

  /** Blueprint stage: blue paper sky + drawn outlines first, then the bricks land and the lines fade. */
  updateWire() {
    const drawing = this.buildT < 0;
    if (drawing) {
      const t = (performance.now() - this.wireStart) / 1000;
      this.wire.update(t, 1);
      this.scene.background.set("#0c3b6e");
      this.scene.fog.color.set("#0c3b6e");
      this.scene.fog.near = 900;
      this.scene.fog.far = 1300;
      this.sky.mesh.visible = false;
      this.clouds.group.visible = false;
      return;
    }
    this.built.root.visible = true;
    this.sky.mesh.visible = true;
    this.clouds.group.visible = true;
    const fade = this.buildT >= BUILD_DURATION + 1 ? 0 : Math.max(0, 1 - this.buildT / 4.5);
    if (fade <= 0) {
      this.scene.remove(this.wire.group);
      this.wire.dispose();
      this.wire = null;
      return;
    }
    this.wire.update(WIRE_DURATION * 2, fade);
  }

  frame() {
    if (this.disposed) return;
    const rawDt = this.clock.getDelta();
    const dt = Math.min(0.05, rawDt);
    // camera easing uses real elapsed time (capped) so a slow device still settles in time
    this.camDt = Math.min(1, rawDt);
    if (this.buildT !== undefined && this.buildT < BUILD_DURATION + 2) {
      // wall-clock driven so a slow device still finishes the build on time
      this.buildT = (performance.now() - this.buildStart) / 1000;
      const busy = applyBuildIn(this.built.staticMeshes, this.buildT);
      if (!busy) this.buildT = 1e9;
    }
    const { v1, v2 } = this.tmp;
    const mode = this.state.mode;

    // animated props
    this.updateTraffic(dt, mode);
    this.updateTalk(dt, mode);
    if (this.state.closeUp && mode === "walk" && !this.drag && this.player.speed < 0.2 && !this.reducedMotion) this.look.yaw += dt * 0.45; // turntable
    for (const wheel of this.wheels) {
      wheel.group.rotation.x += dt * 0.35;
      for (const g of wheel.gondolas) g.rotation.x = -wheel.group.rotation.x;
    }
    this.clouds.update(this.reducedMotion ? 0 : dt, this.camera.position);

    this.citizens.update(dt, mode === "walk" ? this.player.position : null, this.talkTarget);
    if (mode === "walk") {
      const m = this.moveInput();
      this.player.update(dt, m.x, m.z, m.run);
      this.updateNear();
      const picked = this.collectibles.update(dt, this.player.position);
      if (picked) {
        this.sounds.collect(this.collectibles.count);
        this.setState({ studs: this.collectibles.count });
      }

    } else if (mode === "explore") {
      this.collectibles.update(dt, null);
      this.ride.update(dt, this.camDt);
    } else {
      this.collectibles.update(dt, null);
      this.ride.update(dt, this.camDt);
      if (this.ride.moving !== this.state.moving) this.setState({ moving: this.ride.moving });
    }

    this.updateCamera(dt);
    // field of view: wide for the tour, a kick while running, tighter in the model viewer
    const wantFov = mode === "ride" ? 68 : mode === "walk" ? (this.keys.has("shift") && this.player.speed > 10 ? 62 : 55) : 50;
    if (Math.abs(this.camera.fov - wantFov) > 0.05) {
      this.camera.fov += (wantFov - this.camera.fov) * (1 - Math.exp(-(this.camDt ?? dt) * 4));
      this.camera.updateProjectionMatrix();
    }
    this.sky.follow(this.camera.position);
    this.env.update(dt);

    // shadow follows the focus
    const focus = mode === "walk" ? this.player.position : mode === "explore" ? this.orbit.target : this.tramGroup.position;
    this.sun.target.position.copy(focus);
    v1.copy(this.env.lightDir).multiplyScalar(190).add(focus);
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
        pin: this.waypoint,
      });
    }

    if (this.wire) this.updateWire();
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
      const base = sprite.userData.base;
      if (base) {
        const f = THREE.MathUtils.clamp(d / 60, 0.38, 1);
        sprite.scale.set(base.x * f, base.y * f, 1);
      }
      const far = minor ? 70 : 150;
      const near = minor ? 40 : 90;
      const opacity = d < near ? 1 : d > far ? 0 : 1 - (d - near) / (far - near);
      sprite.material.opacity = opacity;
      sprite.visible = opacity > 0.02;
    }
  }

  updateTraffic(dt, mode) {
    const p = this.player.position;
    const walking = mode === "walk";
    const prev = this.prevPlayer;
    const vx = walking && prev && dt > 0 ? (p.x - prev.x) / dt : 0;
    const vz = walking && prev && dt > 0 ? (p.z - prev.z) / dt : 0;
    this.prevPlayer = walking ? { x: p.x, z: p.z } : null;
    const h = this.ride.heading;
    const events = this.traffic.update(dt, {
      player: walking ? { x: p.x, z: p.z, vx, vz } : null,
      tram: { x: this.tramGroup.position.x, z: this.tramGroup.position.z, hx: h.x, hz: h.z, v: this.ride.speed },
    });
    for (let i = 0; i < this.cars.length; i++) {
      const c = this.traffic.cars[i];
      const g = this.cars[i].group;
      g.position.set(c.x, 0, c.z);
      g.rotation.y = Math.atan2(-c.hx, -c.hz);
    }
    for (const e of events) {
      const near = walking && Math.hypot(e.car.x - p.x, e.car.z - p.z) < 60;
      if (e.type === "ask") {
        this.bubbles.say(e.car, e.n > 0 ? "Whenever you're ready!" : "Want to cross?", { ttl: 3.4 });
        if (near) this.sounds.honk();
      } else if (e.type === "thanks") {
        this.bubbles.say(e.car, "Thanks!", { ttl: 1.6 });
      } else if (e.type === "honk" && near) {
        this.sounds.honk();
      }
    }
    this.bubbles.update(dt, this.camera, (o) => (o.root ? o.root.position : { x: o.x, y: 0, z: o.z }));
  }

  /** Walk mode: spot a citizen to talk to, keep the open conversation alive, drive the waypoint beacon. */
  updateTalk(dt, mode) {
    const walking = mode === "walk";
    const p = this.player.position;
    if (this.state.talk && (!walking || !this.talkTarget || Math.hypot(this.talkTarget.root.position.x - p.x, this.talkTarget.root.position.z - p.z) > 10)) this.endTalk();
    const c = walking && !this.state.talk && !this.state.intro ? this.citizens.nearest(p, 5) : null;
    if (c?.persona !== this.state.talkable?.persona) {
      this.setState({ talkable: c ? { persona: c.persona, name: c.persona.name, role: c.persona.role } : null });
      if (c && !this.greeted?.has(c)) {
        (this.greeted ??= new Set()).add(c);
        this.bubbles.say(c, "Hi! Press E to chat", { ttl: 2.6, lift: 9, accent: "#0055BF" });
      }
    }
    if (this.waypoint) this.updateWaypoint(dt, walking);
  }

  startTalk() {
    const c = this.citizens.nearest(this.player.position, 5);
    if (!c) return;
    this.talkTarget = c;
    this.talkNode = this.dialogue.start(c.persona, { from: { x: this.player.position.x, z: this.player.position.z }, weather: { rain: (this.env?.lastWet ?? 0) > 0.3, night: (this.env?.lastNight ?? 0) > 0.5 } });
    this.sounds.open();
    this.setState({ talk: this.publicNode(c.persona), talkable: null });
  }

  talkChoose(id) {
    if (!this.talkNode) return;
    this.talkNode = this.dialogue.choose(this.talkNode, id);
    if (this.talkNode.waypoint) this.setWaypoint(this.talkNode.waypoint);
    this.setState({ talk: this.publicNode(this.talkNode.persona) });
  }

  publicNode(persona) {
    const n = this.talkNode;
    return { name: persona.name, role: persona.role, text: n.text, options: n.options, end: !!n.end };
  }

  endTalk() {
    this.talkTarget = null;
    this.talkNode = null;
    if (this.state.talk) this.setState({ talk: null });
  }

  setWaypoint(wp) {
    this.clearWaypoint();
    this.waypoint = wp;
    const g = new THREE.Group();
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(1.6, 1.6, 90, 20, 1, true),
      new THREE.MeshBasicMaterial({ color: "#f2cd37", transparent: true, opacity: 0.32, depthWrite: false, side: THREE.DoubleSide, fog: false }),
    );
    beam.position.y = 45;
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(3.4, 4.6, 32),
      new THREE.MeshBasicMaterial({ color: "#f2cd37", transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false, fog: false }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.7;
    g.add(beam, ring);
    g.position.set(wp.x, 0, wp.z);
    this.scene.add(g);
    this.beacon = { g, ring, beam };
    this.setState({ waypoint: { title: wp.title, dist: Math.round(Math.hypot(wp.x - this.player.position.x, wp.z - this.player.position.z)) } });
  }

  clearWaypoint() {
    if (this.beacon) {
      this.scene.remove(this.beacon.g);
      this.beacon.beam.geometry.dispose();
      this.beacon.beam.material.dispose();
      this.beacon.ring.geometry.dispose();
      this.beacon.ring.material.dispose();
      this.beacon = null;
    }
    this.waypoint = null;
    if (this.state.waypoint) this.setState({ waypoint: null });
  }

  updateWaypoint(dt, walking) {
    const wp = this.waypoint;
    const t = performance.now() / 1000;
    if (this.beacon) {
      const k = 1 + Math.sin(t * 3) * 0.12;
      this.beacon.ring.scale.set(k, k, 1);
      this.beacon.beam.material.opacity = 0.26 + Math.sin(t * 2) * 0.06;
    }
    if (!walking) return;
    const p = this.player.position;
    const dist = Math.hypot(wp.x - p.x, wp.z - p.z);
    if (dist < 12) {
      this.sounds.bell();
      this.bubbles.say(wp, `Welcome to ${wp.title}!`, { ttl: 4, lift: 14, accent: "#F2CD37" });
      this.clearWaypoint();
      return;
    }
    const rounded = Math.round(dist / 2) * 2;
    if (rounded !== this.state.waypoint?.dist) this.setState({ waypoint: { title: wp.title, dist: rounded } });
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
        if (this.state.closeUp) {
          // a portrait of the minifig: low, near, aimed at the chest-to-face
          // zooming in slides the aim from the chest up to the face
          const t = THREE.MathUtils.clamp((d - 3) / 5, 0, 1);
          const aimY = 4.15 + (2.9 - 4.15) * t;
          targetPos.y = p.y + aimY + Math.sin(pitch) * d;
          lookAt.set(p.x, p.y + aimY, p.z);
        }
      }
      if (this.state.talk && this.talkTarget) {
        // a cinematic two-shot: both of you in profile, facing each other, filmed from the side
        const c = this.talkTarget.root.position;
        const mx = (p.x + c.x) / 2;
        const mz = (p.z + c.z) / 2;
        let ax = p.x - c.x;
        let az = p.z - c.z;
        const len = Math.hypot(ax, az) || 1;
        ax /= len;
        az /= len;
        const back = 9.5;
        targetPos = v1.set(mx - az * back, p.y + 4.4, mz + ax * back);
        lookAt = v2.set(mx, p.y + 3.1, mz);
      }
    } else {
      // Tour camera: a drone-style vantage above and slightly behind the tram, high
      // enough that the roof is a sliver at the bottom of the frame, not the picture.
      const g = this.tramGroup;
      const cdt = this.camDt ?? dt;
      const lot = this.city.lots.find((l) => l.id === this.ride.stop.lots[0]);
      const idle = !this.ride.moving && performance.now() > this.rideLook.userUntil;
      const wantY = lot ? THREE.MathUtils.clamp(15 + lot.top * 0.22, 17, 30) : 18;
      this.rideCamY = this.rideCamY === undefined ? wantY : this.rideCamY + (wantY - this.rideCamY) * (1 - Math.exp(-cdt * 1.5));
      // pull back across the street from the building so a whole facade fits the frame
      let wantX = 0;
      if (idle && lot) {
        const r = g.rotation.y;
        const lx = (lot.rect.cx - g.position.x) * Math.cos(r) - (lot.rect.cz - g.position.z) * Math.sin(r);
        wantX = -Math.sign(lx || 1) * 7;
      }
      this.rideCamX = this.rideCamX === undefined ? wantX : this.rideCamX + (wantX - this.rideCamX) * (1 - Math.exp(-cdt * 1.5));
      targetPos = v1.set(this.rideCamX, this.rideCamY, 5).applyQuaternion(g.quaternion).add(g.position);
      if (idle && lot) {
        const dx = lot.rect.cx - targetPos.x;
        const dz = lot.rect.cz - targetPos.z;
        const dist = Math.hypot(dx, dz);
        const aimY = THREE.MathUtils.clamp(lot.top * 0.45, 7, 26);
        const wantYaw = Math.atan2(-dx, -dz) - g.rotation.y;
        let delta = wantYaw - this.rideLook.yaw;
        delta = Math.atan2(Math.sin(delta), Math.cos(delta));
        this.rideLook.yaw += delta * (1 - Math.exp(-cdt * 1.6));
        this.rideLook.pitch += (Math.atan2(this.rideCamY - aimY, dist) - this.rideLook.pitch) * (1 - Math.exp(-cdt * 1.6));
      } else if (this.ride.moving && performance.now() > this.rideLook.userUntil) {
        let delta = -this.rideLook.yaw;
        delta = Math.atan2(Math.sin(delta), Math.cos(delta));
        this.rideLook.yaw += delta * (1 - Math.exp(-cdt * 2.4));
        // look down the street, over the cab, toward a point ~70 studs ahead
        this.rideLook.pitch += (Math.atan2(this.rideCamY - 5, 70) - this.rideLook.pitch) * (1 - Math.exp(-cdt * 2.4));
      }
      const yaw = g.rotation.y + this.rideLook.yaw;
      const pitch = this.rideLook.pitch;
      lookAt = v2.set(
        targetPos.x - Math.sin(yaw) * Math.cos(pitch) * 40,
        targetPos.y - Math.sin(pitch) * 40,
        targetPos.z - Math.cos(yaw) * Math.cos(pitch) * 40,
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
    const k = this.state.mode === "walk" && this.state.view === "first" ? 1 : 1 - Math.exp(-(this.camDt ?? dt) * 6);
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
    this.clearWaypoint();
    this.bubbles?.dispose();
    this.orbit?.dispose();
    this.scene?.traverse((obj) => {
      if (obj.isMesh && obj.userData.ownGeometry) obj.geometry.dispose();
      if (obj.isSprite) {
        obj.material.map?.dispose();
        obj.material.dispose();
      }
    });
    this.clouds?.dispose();
    this.wire?.dispose();
    this.sky?.dispose();
    this.nightLights?.dispose();
    this.env?.dispose();
    this.collectibles?.dispose();
    this.sounds?.dispose();
    this.geos?.dispose();
    this.mats?.dispose();
    this.renderer?.dispose();
    el?.remove();
  }
}
