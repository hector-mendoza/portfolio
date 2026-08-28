struct Params {
  time: f32,
  texel: vec2f,
}

@group(0) @binding(0) var<uniform> params: Params;

fn blob(center: vec2f, radius: f32, softness: f32, uv: vec2f) -> f32 {
  let dist = distance(uv, center);
  return 1.0 - smoothstep(radius - softness, radius + softness, dist);
}

@fragment
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let t = params.time * 0.12;
  let aspect = vec2f(1.0, 0.62);

  let teal = vec3f(0.18, 0.58, 0.48);
  let blue = vec3f(0.22, 0.48, 0.72);
  let deep = vec3f(0.04, 0.08, 0.1);

  let p = (uv - 0.5) * aspect;

  let b1 = blob(vec2f(-0.18 + sin(t * 0.7) * 0.08, 0.08 + cos(t * 0.5) * 0.06), 0.42, 0.28, p);
  let b2 = blob(vec2f(0.22 + cos(t * 0.6) * 0.1, -0.04 + sin(t * 0.8) * 0.07), 0.38, 0.26, p);
  let b3 = blob(vec2f(0.02 + sin(t * 0.45) * 0.12, 0.18 + cos(t * 0.55) * 0.05), 0.34, 0.24, p);
  let b4 = blob(vec2f(-0.08 + cos(t * 0.35) * 0.09, -0.16 + sin(t * 0.65) * 0.08), 0.36, 0.25, p);

  var color = deep;
  color += teal * b1 * 0.22;
  color += blue * b2 * 0.18;
  color += teal * b3 * 0.14;
  color += blue * b4 * 0.12;

  let vignette = smoothstep(1.15, 0.25, length(p));
  color *= mix(0.72, 1.0, vignette);

  return vec4f(color, 1.0);
}
