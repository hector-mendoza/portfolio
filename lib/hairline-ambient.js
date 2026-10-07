const rad = (deg) => (deg * Math.PI) / 180;

function Cam(azDeg, k, S) {
  return { az: rad(azDeg), k, S, ox: 0, oy: 0 };
}

function proj(C) {
  const c = Math.cos(C.az), s = Math.sin(C.az), zf = Math.sqrt(1 - C.k * C.k);
  return (x, y, z) => {
    const X = x * c - y * s, Y = x * s + y * c;
    return [C.ox + C.S * X, C.oy + C.S * (Y * C.k - z * zf)];
  };
}

function fit(C, pts, cx, cy) {
  C.ox = 0;
  C.oy = 0;
  const P = proj(C);
  let a = 1e9, b = -1e9, c = 1e9, d = -1e9;
  for (const p of pts) {
    const q = P(p[0], p[1], p[2]);
    a = Math.min(a, q[0]);
    b = Math.max(b, q[0]);
    c = Math.min(c, q[1]);
    d = Math.max(d, q[1]);
  }
  C.ox = cx - (a + b) / 2;
  C.oy = cy - (c + d) / 2;
}

const U = 14;
const BZ = 6;
const CASE = 8;
const W = 15;
const ROW_H = [12.6, 11.3, 10.4, 11, 11.8];
const L = (s) => s.split(" ").map((ch) => [1, `key ${ch}`]);
const ROWS = [
  [[1, "esc"], ...L("1 2 3 4 5 6 7 8 9 0 - ="), [2, "bksp"]],
  [[1.5, "tab"], ...L("q w e r t y u i o p [ ]"), [1.5, "key \\"]],
  [[1.75, "caps"], ...L("a s d f g h j k l ; '"), [2.25, "enter"]],
  [[2.25, "shift l"], ...L("z x c v b n m , . /"), [2.75, "shift r"]],
  [[1.5, "ctrl l"], [1, "super"], [1.5, "alt l"], [7, "space"], [1.5, "alt r"], [1, "fn"], [1.5, "ctrl r"]],
];

function keyboardPoints() {
  const C = Cam(45, 0.5, 1.42);
  fit(
    C,
    [
      [-BZ, -BZ, -CASE],
      [W * U + BZ, 5 * U + BZ, -CASE],
      [W * U + BZ, -BZ, -CASE],
      [-BZ, 5 * U + BZ, -CASE],
      [0, 0, ROW_H[0]],
    ],
    200,
    166,
  );
  const P = proj(C);
  const keys = {};
  ROWS.forEach((row, r) => {
    let x = 0;
    for (const [width, name] of row) {
      keys[name] = P((x + width / 2) * U, (r + 0.5) * U, ROW_H[r]);
      x += width;
    }
  });
  return keys;
}

const KEY_POINTS = keyboardPoints();
const LETTER_KEYS = {
  P: "key p",
  I: "key i",
  L: "key l",
  E: "key e",
};

function clientPoint(stage, viewBoxX, viewBoxY) {
  const box = stage.getBoundingClientRect();
  return {
    clientX: box.left + (viewBoxX / 400) * box.width,
    clientY: box.top + (viewBoxY / 320) * box.height,
  };
}

function dispatch(stage, type, viewBoxX = 200, viewBoxY = 160) {
  const point = clientPoint(stage, viewBoxX, viewBoxY);
  stage.dispatchEvent(
    new PointerEvent(type, {
      bubbles: type !== "pointerleave",
      cancelable: true,
      pointerId: 1,
      pointerType: "mouse",
      isPrimary: true,
      clientX: point.clientX,
      clientY: point.clientY,
    }),
  );
}

export const PILLE = "PILLE";

export function startHairlineAmbient(stage, options = {}) {
  const {
    mode = "wander",
    word = PILLE,
    onTyped,
    reducedMotion = false,
  } = options;

  let userOverride = false;
  let visible = true;
  let frame = 0;
  let letter = 0;
  let typed = "";
  let phase = "press";
  let nextAt = 0;
  const origin = performance.now();

  const setTyped = (value) => {
    typed = value;
    onTyped?.(value);
  };

  const play = (now) => {
    if (!visible || userOverride || reducedMotion) return;

    if (mode === "type") {
      if (now < nextAt) return;
      if (letter >= word.length) {
        phase = "hold";
        nextAt = now + 1100;
        letter = 0;
        return;
      }
      if (phase === "hold") {
        dispatch(stage, "pointerleave");
        setTyped("");
        phase = "press";
        nextAt = now + 220;
        return;
      }
      if (phase === "gap") {
        dispatch(stage, "pointerleave");
        phase = "press";
        nextAt = now + 90;
        return;
      }
      const glyph = word[letter];
      const point = KEY_POINTS[LETTER_KEYS[glyph]];
      if (point) dispatch(stage, "pointermove", point[0], point[1]);
      setTyped(word.slice(0, letter + 1));
      letter += 1;
      phase = letter >= word.length ? "hold" : "gap";
      nextAt = now + (phase === "hold" ? 280 : 160);
      return;
    }

    const t = (now - origin) / 1000;
    const x = 200 + 86 * Math.sin(t * 0.62);
    const y = 158 + 58 * Math.cos(t * 0.41);
    dispatch(stage, "pointermove", x, y);
  };

  const loop = (now) => {
    play(now);
    frame = window.requestAnimationFrame(loop);
  };

  const onEnter = (event) => {
    if (!event.isTrusted) return;
    userOverride = true;
  };
  const onLeave = (event) => {
    if (!event.isTrusted) return;
    userOverride = false;
    if (mode === "type") {
      letter = 0;
      phase = "press";
      nextAt = performance.now() + 160;
    }
  };

  stage.addEventListener("pointerenter", onEnter);
  stage.addEventListener("pointerleave", onLeave);

  const io = new IntersectionObserver(
    (entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
    },
    { rootMargin: "80px" },
  );
  io.observe(stage);

  if (!reducedMotion) {
    frame = window.requestAnimationFrame(loop);
    if (mode === "type") setTyped("");
  } else if (mode === "type") {
    setTyped(word);
  }

  return () => {
    window.cancelAnimationFrame(frame);
    stage.removeEventListener("pointerenter", onEnter);
    stage.removeEventListener("pointerleave", onLeave);
    io.disconnect();
    dispatch(stage, "pointerleave");
  };
}
