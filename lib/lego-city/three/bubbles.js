import * as THREE from "three";

const W = 256;
const H = 96;

function paint(canvas, text, accent) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = accent;
  ctx.lineWidth = 6;
  const r = 20;
  const bh = H - 22;
  ctx.beginPath();
  ctx.roundRect(4, 4, W - 8, bh - 4, r);
  ctx.moveTo(W / 2 - 12, bh);
  ctx.lineTo(W / 2, H - 4);
  ctx.lineTo(W / 2 + 12, bh);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#1b1b1b";
  ctx.font = "800 28px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const w of words) {
    const t = line ? `${line} ${w}` : w;
    if (ctx.measureText(t).width > W - 36 && line) {
      lines.push(line);
      line = w;
    } else line = t;
  }
  lines.push(line);
  lines.slice(0, 2).forEach((l, i, a) => ctx.fillText(l, W / 2, 4 + (bh - 4) / 2 + (i - (a.length - 1) / 2) * 30));
}

/** Pool of speech-bubble sprites that follow a world anchor and fade out. */
export class Bubbles {
  constructor(size = 6) {
    this.group = new THREE.Group();
    this.slots = [];
    for (let i = 0; i < size; i++) {
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false, fog: false });
      const sprite = new THREE.Sprite(mat);
      sprite.renderOrder = 20;
      sprite.visible = false;
      this.group.add(sprite);
      this.slots.push({ sprite, canvas, texture, owner: null, t: 0, ttl: 0, anchor: null, lift: 6 });
    }
  }

  /** Show `text` above `anchor()` ({x,y,z}); a new say() from the same owner replaces its bubble. */
  say(owner, text, { ttl = 3.2, lift = 6, accent = "#C91A09" } = {}) {
    let slot = this.slots.find((s) => s.owner === owner) ?? this.slots.find((s) => !s.owner) ?? this.slots.reduce((a, b) => (a.ttl - a.t < b.ttl - b.t ? a : b));
    slot.owner = owner;
    slot.t = 0;
    slot.ttl = ttl;
    slot.lift = lift;
    slot.text = text;
    paint(slot.canvas, text, accent);
    slot.texture.needsUpdate = true;
    slot.sprite.visible = true;
  }

  clear(owner) {
    for (const s of this.slots) if (s.owner === owner) this.release(s);
  }

  release(s) {
    s.owner = null;
    s.sprite.visible = false;
  }

  update(dt, camera, anchorOf) {
    for (const s of this.slots) {
      if (!s.owner) continue;
      s.t += dt;
      const a = anchorOf(s.owner);
      if (s.t > s.ttl || !a) {
        this.release(s);
        continue;
      }
      s.sprite.position.set(a.x, (a.y ?? 0) + s.lift, a.z);
      const d = camera.position.distanceTo(s.sprite.position);
      const k = THREE.MathUtils.clamp(d / 45, 0.5, 1.6);
      s.sprite.scale.set(10 * k, (10 * H * k) / W, 1);
      s.sprite.material.opacity = Math.min(1, s.t / 0.15, (s.ttl - s.t) / 0.4);
    }
  }

  dispose() {
    for (const s of this.slots) {
      s.texture.dispose();
      s.sprite.material.dispose();
    }
  }
}
