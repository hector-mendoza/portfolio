export const MONOGRAM_RANGE = [18, 30, 48];

export function createMonogramMount(HL) {
const {
  Cam, clamp, facing, fit, prism, proj, rings, unproj, spring, stepS,
  fillet, mk, pointer, put, register, disposer, solid,
} = HL;

const R = 52, HMAX = 28, PB = 6, W = 6.4;

function stadium(x0, y0, x1, y1, w) {
  const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy) || 1;
  const px = (-dy / len) * (w / 2), py = (dx / len) * (w / 2);
  return fillet(
    [[x0 + px, y0 + py], [x1 + px, y1 + py], [x1 - px, y1 - py], [x0 - px, y0 - py]],
    [w / 2, w / 2, w / 2, w / 2],
    5,
  );
}

function ringOf(pts, b = 0) {
  const n = pts.length, out = [];
  for (let i = 0; i < n; i++) {
    const a = pts[(i + n - 1) % n], p = pts[i], c = pts[(i + 1) % n];
    const la = Math.hypot(p[0] - a[0], p[1] - a[1]) || 1;
    const lb = Math.hypot(c[0] - p[0], c[1] - p[1]) || 1;
    const nx = (p[1] - a[1]) / la + (c[1] - p[1]) / lb;
    const ny = (a[0] - p[0]) / la + (p[0] - c[0]) / lb;
    const L = Math.hypot(nx, ny) || 1;
    out.push({ u: p[0] + (nx / L) * b, v: p[1] + (ny / L) * b, nu: nx / L, nv: ny / L });
  }
  return out;
}

function circ(r) {
  const n = 32, out = [];
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
    out.push({ u: r * ca, v: r * sa, nu: ca, nv: sa });
  }
  return out;
}

const falloff = (u) =>
  u <= 0 ? 1 : u <= 0.42 ? 1 - (u / 0.42) * 0.68 : u <= 1 ? 0.32 - ((u - 0.42) / 0.58) * 0.22 : 0.1;

function mountMonogram({ stage, svg, read }, value) {
  const bag = disposer();
  const C = Cam(45, 0.5, 2.18);
  fit(C, [[-R, -R, -PB], [R, R, -PB], [R, -R, HMAX], [-R, R, 0]], 200, 166);
  const P = proj(C), front = facing(C);
  let radLift = value, over = null;
  const g = mk("g", {}, svg);
  put(solid(g), prism(P, front, circ(R), circ(R - 2.6), -PB, 0));

  const cols = [];
  function add(id, ring, inner, h0, cx, cy) {
    cols.push({ id, ring, inner, h0, cx, cy, sp: spring(h0, { eps: 0.05 }), el: solid(g), drawn: NaN });
  }
  function rect(id, x0, y0, x1, y1, h0) {
    const [ring, inner] = rings(x0, y0, x1, y1, 1.15, 0.7);
    add(id, ring, inner, h0, (x0 + x1) / 2, (y0 + y1) / 2);
  }
  function polyBar(id, pts, h0) {
    add(id, ringOf(pts), ringOf(pts, 0.85), h0,
      pts.reduce((s, p) => s + p[0], 0) / pts.length,
      pts.reduce((s, p) => s + p[1], 0) / pts.length);
  }
  rect("h", -24, -22, -17.2, 22, 12);
  rect("bar", -17.2, -4.2, -3.4, 4.2, 9);
  rect("stem", -3.4, -22, 3.4, 22, 17);
  polyBar("ml", stadium(3.4, 18.5, 11.2, -14, W), 11);
  polyBar("mr", stadium(11.2, -14, 17.2, 18.5, W), 11);
  rect("m", 17.2, -22, 24, 22, 12);
  cols.sort((a, b) => a.cx + a.cy - (b.cx + b.cy));
  cols.forEach((c) => g.append(c.el.g));

  const peak = cols.find((c) => c.id === "stem");
  let want = peak;

  function drawCol(c) {
    const h = Math.max(0.9, c.sp.x);
    if (h === c.drawn && c !== want && !c.el.sil.classList.contains("hi")) return;
    c.drawn = h;
    put(c.el, prism(P, front, c.ring, c.inner, 0, h));
    c.el.sil.classList.toggle("hi", c === want);
  }

  const B = register(stage, (dt) => {
    let moving = false;
    for (const c of cols) { if (stepS(c.sp, dt)) moving = true; drawCol(c); }
    return moving;
  });
  bag.add(B.unregister);

  function retarget() {
    for (const c of cols) {
      if (!over) { c.sp.t = c.h0; continue; }
      c.sp.t = clamp(4 + HMAX * falloff(Math.hypot(c.cx - over[0], c.cy - over[1]) / radLift), 4, HMAX);
    }
    if (over) {
      want = cols.reduce((a, b) => Math.hypot(b.cx - over[0], b.cy - over[1]) < Math.hypot(a.cx - over[0], a.cy - over[1]) ? b : a);
      read.textContent = want.id;
    } else { want = peak; read.textContent = "rest"; }
    cols.forEach(drawCol);
    B.wake();
  }

  bag.add(pointer(stage, {
    move: (p) => { over = unproj(C, p[0], p[1], 0); retarget(); },
    leave: () => { over = null; retarget(); },
  }));
  bag.add(() => svg.replaceChildren());
  retarget();
  return {
    set: (v) => { radLift = v; if (over) retarget(); },
    destroy: bag.dispose,
  };
}

return mountMonogram;
}
