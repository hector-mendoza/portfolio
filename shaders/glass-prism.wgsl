struct Params {
  time: f32,
  resolution: vec2f,
  pointer: vec2f,
}

@group(0) @binding(0) var<uniform> params: Params;

const PI: f32 = 3.14159265;
const MAX_STEPS: i32 = 96;
const MAX_DIST: f32 = 24.0;
const SURF_EPS: f32 = 0.0015;

fn hash21(p: vec2f) -> f32 {
  return fract(sin(dot(p, vec2f(127.1, 311.7))) * 43758.5453);
}

fn noise2(p: vec2f) -> f32 {
  let i = floor(p);
  let f = fract(p);
  let u = f * f * (3.0 - 2.0 * f);
  let a = hash21(i);
  let b = hash21(i + vec2f(1.0, 0.0));
  let c = hash21(i + vec2f(0.0, 1.0));
  let d = hash21(i + vec2f(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

fn fbm(p: vec2f) -> f32 {
  var value = 0.0;
  var amp = 0.5;
  var pos = p;
  for (var i = 0; i < 4; i++) {
    value += amp * noise2(pos);
    pos = pos * 2.03 + vec2f(1.7, 9.2);
    amp *= 0.5;
  }
  return value;
}

fn sd_tri_prism(p: vec3f, h: vec2f) -> f32 {
  let q = abs(p);
  return max(q.z - h.y, max(q.x * 0.866025 + p.y * 0.5, -p.y) - h.x * 0.5);
}

fn rotate_y(p: vec3f, a: f32) -> vec3f {
  let c = cos(a);
  let s = sin(a);
  return vec3f(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
}

fn rotate_x(p: vec3f, a: f32) -> vec3f {
  let c = cos(a);
  let s = sin(a);
  return vec3f(p.x, c * p.y - s * p.z, s * p.y + c * p.z);
}

fn map_scene(p: vec3f) -> vec2f {
  let prism = rotate_y(rotate_x(p - vec3f(0.0, 0.15, 0.0), -0.42), 0.35);
  let d = sd_tri_prism(prism, vec2f(1.35, 0.22));
  return vec2f(d, 1.0);
}

fn calc_normal(p: vec3f) -> vec3f {
  let e = vec2f(0.0012, 0.0);
  return normalize(vec3f(
    map_scene(p + e.xyy).x - map_scene(p - e.xyy).x,
    map_scene(p + e.yxy).x - map_scene(p - e.yxy).x,
    map_scene(p + e.yyx).x - map_scene(p - e.yyx).x,
  ));
}

fn background(uv: vec2f) -> vec3f {
  let grain = (hash21(uv * params.resolution * 1.7) - 0.5) * 0.035;
  let base = vec3f(0.91, 0.91, 0.89);
  let vignette = smoothstep(1.2, 0.25, length(uv - 0.5) * 1.35);
  let bloom = fbm(uv * 4.0 + params.time * 0.02) * 0.08;
  return (base + grain + bloom) * mix(0.82, 1.0, vignette);
}

fn fresnel(cos_theta: f32, f0: f32) -> f32 {
  return f0 + (1.0 - f0) * pow(1.0 - abs(cos_theta), 5.0);
}

fn refract_dir(incident: vec3f, normal: vec3f, eta: f32) -> vec3f {
  let cos_i = dot(-incident, normal);
  let sin2_t = eta * eta * (1.0 - cos_i * cos_i);
  if (sin2_t > 1.0) {
    return reflect(incident, normal);
  }
  return eta * incident + (eta * cos_i - sqrt(1.0 - sin2_t)) * normal;
}

fn trace_glass(ro: vec3f, rd: vec3f) -> vec3f {
  var t = 0.0;
  var inside = false;
  var col = vec3f(0.0);
  var weight = 1.0;

  for (var i = 0; i < 6; i++) {
    var p = ro + rd * t;
    let hit = map_scene(p);
    if (hit.x < SURF_EPS) {
      let n = calc_normal(p) * select(1.0, -1.0, inside);
      let eta = select(1.0 / 1.48, 1.48, inside);
      let ior_r = eta * 0.985;
      let ior_g = eta;
      let ior_b = eta * 1.015;
      let rr = refract_dir(rd, n, ior_r);
      let rg = refract_dir(rd, n, ior_g);
      let rb = refract_dir(rd, n, ior_b);
      let fr = fresnel(dot(-rd, n), 0.04);
      col += vec3f(0.95, 0.97, 1.0) * fr * weight * 0.35;
      rd = normalize(mix(rg, reflect(rd, n), fr * 0.55));
      t += 0.02;
      inside = !inside;
      weight *= 0.82;
      continue;
    }
    t += hit.x * 0.65;
    if (t > MAX_DIST) { break; }
  }

  return col;
}

fn beam_glow(p: vec3f) -> f32 {
  let light_dir = normalize(vec3f(0.55, 0.35, -0.76));
  let beam_axis = normalize(vec3f(-0.62, -0.28, 0.74));
  let along = dot(normalize(p), beam_axis);
  let cone = smoothstep(0.72, 0.98, along);
  let scatter = exp(-length(p - beam_axis * 2.2) * 1.4);
  return cone * scatter * 0.35;
}

fn caustics(uv: vec2f) -> f32 {
  let p = uv * 6.0 + vec2f(params.time * 0.03, -params.time * 0.02);
  let c = abs(sin(p.x * 2.1 + fbm(p)) * sin(p.y * 1.8 - fbm(p.yx)));
  return pow(c, 2.2) * 0.22;
}

fn ray_march(ro: vec3f, rd: vec3f) -> vec3f {
  var t = 0.0;
  for (var i = 0; i < MAX_STEPS; i++) {
    let p = ro + rd * t;
    let scene = map_scene(p);
    if (scene.x < SURF_EPS) {
      let n = calc_normal(p);
      let light_dir = normalize(vec3f(0.55, 0.35, -0.76));
      let fres = fresnel(dot(-rd, n), 0.04);
      let spec = pow(max(dot(reflect(-light_dir, n), -rd), 0.0), 48.0);
      let glass = vec3f(0.92, 0.95, 0.98) * 0.08;
      let edge = pow(1.0 - abs(dot(n, rd)), 3.0) * 0.55;
      let internal = trace_glass(p + n * 0.01, refract_dir(rd, n, 1.0 / 1.48));
      return glass + vec3f(spec) * 0.9 + edge * vec3f(0.95) + internal;
    }
    t += scene.x * 0.7;
    if (t > MAX_DIST) { break; }
  }
  return vec3f(0.0);
}

fn rainbow_streak(uv: vec2f) -> vec3f {
  let dir = normalize(vec2f(-0.78, 0.62));
  let proj = dot(uv - vec2f(0.42, 0.58), dir);
  let band = smoothstep(0.18, 0.0, abs(proj)) * smoothstep(-0.35, 0.05, proj);
  let hue = fract(proj * 3.5 + 0.15);
  let rgb = vec3f(
    abs(hue * 6.0 - 3.0) - 1.0,
    2.0 - abs(hue * 6.0 - 2.0),
    2.0 - abs(hue * 6.0 - 4.0),
  );
  return clamp(rgb, vec3f(0.0), vec3f(1.0)) * band * 0.28;
}

@fragment
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let aspect = params.resolution.x / max(params.resolution.y, 1.0);
  var screen = uv * 2.0 - 1.0;
  screen.x *= aspect;

  let parallax = (params.pointer - 0.5) * 0.12;
  let ro = vec3f(parallax.x * 2.0, 0.15 + parallax.y, 4.2);
  let ta = vec3f(0.0, 0.0, 0.0);
  let ww = normalize(ta - ro);
  let uu = normalize(cross(vec3f(0.0, 1.0, 0.0), ww));
  let vv = cross(ww, uu);
  let rd = normalize(screen.x * uu + screen.y * vv + 1.65 * ww);

  var col = background(uv);
  col += vec3f(beam_glow(rd * 3.0));
  col += rainbow_streak(uv);
  col += caustics(uv + vec2f(0.08, 0.12)) * vec3f(0.95, 0.97, 1.0);

  let hit = ray_march(ro, rd);
  let depth = 1.0 - smoothstep(0.0, 0.65, length(hit));
  col = mix(col, col + hit, depth);

  let prism_shadow = smoothstep(0.55, 0.05, length(uv - vec2f(0.5, 0.56)));
  col *= mix(0.9, 1.0, prism_shadow);
  col = pow(col, vec3f(0.95));

  return vec4f(col, 1.0);
}
