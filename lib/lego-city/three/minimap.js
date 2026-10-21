import { colorHex } from "../palette.js";

/** 2D canvas minimap drawn from the compiled city (blocks, route, player, tram). */
export class Minimap {
  constructor(canvas, city) {
    this.canvas = canvas;
    this.city = city;
    this.ctx = canvas.getContext("2d");
    this.size = 180;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = this.size * dpr;
    canvas.height = this.size * dpr;
    this.ctx.scale(dpr, dpr);
    this.scale = this.size / (city.layout.half * 2 + 12);
    this.base = document.createElement("canvas");
    this.base.width = canvas.width;
    this.base.height = canvas.height;
    const bctx = this.base.getContext("2d");
    bctx.scale(dpr, dpr);
    this.drawBase(bctx);
  }

  toMap(x, z) {
    return [this.size / 2 + x * this.scale, this.size / 2 + z * this.scale];
  }

  drawBase(ctx) {
    const { city, size } = this;
    ctx.fillStyle = "#3f6f36";
    ctx.beginPath();
    ctx.roundRect(0, 0, size, size, 14);
    ctx.fill();
    ctx.fillStyle = "#5b5f5a";
    const [rx, rz] = this.toMap(-city.layout.half, -city.layout.half);
    ctx.fillRect(rx, rz, city.layout.width * this.scale, city.layout.width * this.scale);
    for (const lot of city.lots) {
      const [x, z] = this.toMap(lot.rect.x0, lot.rect.z0);
      const s = lot.rect.size * this.scale;
      ctx.fillStyle = lot.kind === "river" || lot.kind === "sea" ? "#4f9bd0" : lot.kind === "park" || lot.kind === "residential" ? "#79b85a" : "#a6aaad";
      ctx.fillRect(x, z, s, s);
      if (lot.color && !["park", "residential"].includes(lot.kind)) {
        ctx.fillStyle = colorHex(lot.color);
        ctx.fillRect(x + s * 0.25, z + s * 0.25, s * 0.5, s * 0.5);
      }
    }
    // tram line
    ctx.strokeStyle = "#f2cd37";
    ctx.lineWidth = 2;
    ctx.beginPath();
    city.route.points.forEach((p, i) => {
      const [x, z] = this.toMap(p.x, p.z);
      if (i === 0) ctx.moveTo(x, z);
      else ctx.lineTo(x, z);
    });
    ctx.stroke();
    for (const stop of city.route.stops) {
      const [x, z] = this.toMap(stop.x, stop.z);
      ctx.fillStyle = "#1b2a34";
      ctx.beginPath();
      ctx.arc(x, z, 2.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  draw({ player, tram, mode, stopIndex, pin }) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.size, this.size);
    ctx.drawImage(this.base, 0, 0, this.size, this.size);
    if (mode === "ride" && stopIndex >= 0) {
      const stop = this.city.route.stops[stopIndex];
      const [x, z] = this.toMap(stop.x, stop.z);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, z, 6, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (tram) {
      const [x, z] = this.toMap(tram.x, tram.z);
      ctx.fillStyle = "#c91a09";
      ctx.beginPath();
      ctx.roundRect(x - 4, z - 2.5, 8, 5, 1.5);
      ctx.fill();
    }
    if (pin) {
      const [x, z] = this.toMap(pin.x, pin.z);
      ctx.fillStyle = "#f2cd37";
      ctx.strokeStyle = "#1b2a34";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, z - 7);
      ctx.lineTo(x + 5, z);
      ctx.lineTo(x, z + 7);
      ctx.lineTo(x - 5, z);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    if (player && mode === "walk") {
      const [x, z] = this.toMap(player.x, player.z);
      ctx.save();
      ctx.translate(x, z);
      ctx.rotate(-player.yaw);
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(4, 4);
      ctx.lineTo(-4, 4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }
}
