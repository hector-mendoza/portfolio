# Loader WebGL Orb Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the loader's CSS breathing orb with reactbits' WebGL shader `Orb` component, hue-shifted toward terracotta, theme-aware background, verified for mount-time jank.

**Architecture:** Install reactbits' `Orb` component via its shadcn-compatible CLI (adds the `ogl` WebGL micro-library as a dependency), then swap it into `components/page-loader.jsx` in place of the current three-layer CSS orb block.

**Tech Stack:** Next.js App Router, React (`.jsx`), `ogl` (new dependency, WebGL micro-library), `next-themes` (already in use via `components/theme-provider.tsx`), Tailwind CSS v4.

## Global Constraints

- No test framework exists in this repo. Verification is `npm run build` and manual browser-preview checks — not unit tests. (`npm run lint` fails in this environment with a pre-existing, unrelated `eslint: command not found` error — not a blocker.)
- Keep loader total visible duration at 1600ms and the existing exit transition (`opacity: 0, y: -16`, `duration: 0.55`, `ease: EASE`) unchanged.
- Spec source of truth: `docs/superpowers/specs/2026-07-09-loader-webgl-orb-design.md`.
- Only `components/page-loader.jsx` should be hand-edited, plus whatever files the reactbits CLI installer generates (expected: a new file under `components/ui/`, and `package.json`/`package-lock.json` for the `ogl` dependency).
- The install target is the **JS-TW variant** (`Orb-JS-TW`), not TS — this repo's components are `.jsx`, not `.tsx` (unlike the earlier mapcn install, which was TS-only and had no JS variant).
- Mount-time jank must be checked in the browser preview and reported either way — this is a required verification step per the spec's flagged risk, not optional polish.

---

### Task 1: Install and wire the WebGL Orb into the loader

**Files:**
- Create: whatever file the reactbits CLI installer generates (expected `components/ui/orb.jsx`, but follow the installer's actual output — do not assume the exact path/filename ahead of running it)
- Modify: `package.json`, `package-lock.json` (via `npm install`, triggered by the CLI)
- Modify: `components/page-loader.jsx` (replace the CSS breathing-orb block)

**Interfaces:**
- Consumes: `useTheme` from `@/components/theme-provider` (already exported there, re-exporting `next-themes`'s hook — see `components/theme-provider.tsx:10`), which returns `{ resolvedTheme }` (`"light"` or `"dark"`), used the same way `components/navbar.jsx:21` already uses it (`const { resolvedTheme } = useTheme();`).
- Produces: nothing consumed by later tasks (only task in this plan).

- [ ] **Step 1: Install the reactbits Orb component**

Run: `npx shadcn@latest add @react-bits/Orb-JS-TW`

Expected: the CLI installs `ogl` as a new dependency and writes the Orb component source into this project (likely under `components/ui/`, matching how the `mapcn` install worked in an earlier task — but reactbits is a different registry, so confirm the actual output path/filename it uses, don't assume it matches mapcn's naming convention exactly). If the CLI prompts for confirmation, accept the defaults.

If `@react-bits/Orb-JS-TW` is rejected by the CLI (registry name mismatch), the fallback is to hand-create the component file directly from this known-good source (this is the actual JS-TW variant source from `github.com/DavidHDev/react-bits`, path `src/tailwind/Backgrounds/Orb/Orb.jsx`, confirmed working code — not a placeholder):

```jsx
"use client";

import { Mesh, Program, Renderer, Triangle, Vec3 } from 'ogl';
import { useEffect, useRef } from 'react';

export default function Orb({
  hue = 0,
  hoverIntensity = 0.2,
  rotateOnHover = true,
  forceHoverState = false,
  backgroundColor = '#000000'
}) {
  const ctnDom = useRef(null);

  const vert = /* glsl */ `
    precision highp float;
    attribute vec2 position;
    attribute vec2 uv;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  const frag = /* glsl */ `
    precision highp float;

    uniform float iTime;
    uniform vec3 iResolution;
    uniform float hue;
    uniform float hover;
    uniform float rot;
    uniform float hoverIntensity;
    uniform vec3 backgroundColor;
    varying vec2 vUv;

    vec3 rgb2yiq(vec3 c) {
      float y = dot(c, vec3(0.299, 0.587, 0.114));
      float i = dot(c, vec3(0.596, -0.274, -0.322));
      float q = dot(c, vec3(0.211, -0.523, 0.312));
      return vec3(y, i, q);
    }

    vec3 yiq2rgb(vec3 c) {
      float r = c.x + 0.956 * c.y + 0.621 * c.z;
      float g = c.x - 0.272 * c.y - 0.647 * c.z;
      float b = c.x - 1.106 * c.y + 1.703 * c.z;
      return vec3(r, g, b);
    }

    vec3 adjustHue(vec3 color, float hueDeg) {
      float hueRad = hueDeg * 3.14159265 / 180.0;
      vec3 yiq = rgb2yiq(color);
      float cosA = cos(hueRad);
      float sinA = sin(hueRad);
      float i = yiq.y * cosA - yiq.z * sinA;
      float q = yiq.y * sinA + yiq.z * cosA;
      yiq.y = i;
      yiq.z = q;
      return yiq2rgb(yiq);
    }

    vec3 hash33(vec3 p3) {
      p3 = fract(p3 * vec3(0.1031, 0.11369, 0.13787));
      p3 += dot(p3, p3.yxz + 19.19);
      return -1.0 + 2.0 * fract(vec3(
        p3.x + p3.y,
        p3.x + p3.z,
        p3.y + p3.z
      ) * p3.zyx);
    }

    float snoise3(vec3 p) {
      const float K1 = 0.333333333;
      const float K2 = 0.166666667;
      vec3 i = floor(p + (p.x + p.y + p.z) * K1);
      vec3 d0 = p - (i - (i.x + i.y + i.z) * K2);
      vec3 e = step(vec3(0.0), d0 - d0.yzx);
      vec3 i1 = e * (1.0 - e.zxy);
      vec3 i2 = 1.0 - e.zxy * (1.0 - e);
      vec3 d1 = d0 - (i1 - K2);
      vec3 d2 = d0 - (i2 - K1);
      vec3 d3 = d0 - 0.5;
      vec4 h = max(0.6 - vec4(
        dot(d0, d0),
        dot(d1, d1),
        dot(d2, d2),
        dot(d3, d3)
      ), 0.0);
      vec4 n = h * h * h * h * vec4(
        dot(d0, hash33(i)),
        dot(d1, hash33(i + i1)),
        dot(d2, hash33(i + i2)),
        dot(d3, hash33(i + 1.0))
      );
      return dot(vec4(31.316), n);
    }

    vec4 extractAlpha(vec3 colorIn) {
      float a = max(max(colorIn.r, colorIn.g), colorIn.b);
      return vec4(colorIn.rgb / (a + 1e-5), a);
    }

    const vec3 baseColor1 = vec3(0.611765, 0.262745, 0.996078);
    const vec3 baseColor2 = vec3(0.298039, 0.760784, 0.913725);
    const vec3 baseColor3 = vec3(0.062745, 0.078431, 0.600000);
    const float innerRadius = 0.6;
    const float noiseScale = 0.65;

    float light1(float intensity, float attenuation, float dist) {
      return intensity / (1.0 + dist * attenuation);
    }
    float light2(float intensity, float attenuation, float dist) {
      return intensity / (1.0 + dist * dist * attenuation);
    }

    vec4 draw(vec2 uv) {
      vec3 color1 = adjustHue(baseColor1, hue);
      vec3 color2 = adjustHue(baseColor2, hue);
      vec3 color3 = adjustHue(baseColor3, hue);

      float ang = atan(uv.y, uv.x);
      float len = length(uv);
      float invLen = len > 0.0 ? 1.0 / len : 0.0;

      float bgLuminance = dot(backgroundColor, vec3(0.299, 0.587, 0.114));

      float n0 = snoise3(vec3(uv * noiseScale, iTime * 0.5)) * 0.5 + 0.5;
      float r0 = mix(mix(innerRadius, 1.0, 0.4), mix(innerRadius, 1.0, 0.6), n0);
      float d0 = distance(uv, (r0 * invLen) * uv);
      float v0 = light1(1.0, 10.0, d0);
      v0 *= smoothstep(r0 * 1.05, r0, len);
      float innerFade = smoothstep(r0 * 0.8, r0 * 0.95, len);
      v0 *= mix(innerFade, 1.0, bgLuminance * 0.7);
      float cl = cos(ang + iTime * 2.0) * 0.5 + 0.5;

      float a = iTime * -1.0;
      vec2 pos = vec2(cos(a), sin(a)) * r0;
      float d = distance(uv, pos);
      float v1 = light2(1.5, 5.0, d);
      v1 *= light1(1.0, 50.0, d0);

      float v2 = smoothstep(1.0, mix(innerRadius, 1.0, n0 * 0.5), len);
      float v3 = smoothstep(innerRadius, mix(innerRadius, 1.0, 0.5), len);

      vec3 colBase = mix(color1, color2, cl);
      float fadeAmount = mix(1.0, 0.1, bgLuminance);

      vec3 darkCol = mix(color3, colBase, v0);
      darkCol = (darkCol + v1) * v2 * v3;
      darkCol = clamp(darkCol, 0.0, 1.0);

      vec3 lightCol = (colBase + v1) * mix(1.0, v2 * v3, fadeAmount);
      lightCol = mix(backgroundColor, lightCol, v0);
      lightCol = clamp(lightCol, 0.0, 1.0);

      vec3 finalCol = mix(darkCol, lightCol, bgLuminance);

      return extractAlpha(finalCol);
    }

    vec4 mainImage(vec2 fragCoord) {
      vec2 center = iResolution.xy * 0.5;
      float size = min(iResolution.x, iResolution.y);
      vec2 uv = (fragCoord - center) / size * 2.0;

      float angle = rot;
      float s = sin(angle);
      float c = cos(angle);
      uv = vec2(c * uv.x - s * uv.y, s * uv.x + c * uv.y);

      uv.x += hover * hoverIntensity * 0.1 * sin(uv.y * 10.0 + iTime);
      uv.y += hover * hoverIntensity * 0.1 * sin(uv.x * 10.0 + iTime);

      return draw(uv);
    }

    void main() {
      vec2 fragCoord = vUv * iResolution.xy;
      vec4 col = mainImage(fragCoord);
      gl_FragColor = vec4(col.rgb * col.a, col.a);
    }
  `;

  useEffect(() => {
    const container = ctnDom.current;
    if (!container) return;

    const renderer = new Renderer({ alpha: true, premultipliedAlpha: false });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    container.appendChild(gl.canvas);

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: vert,
      fragment: frag,
      uniforms: {
        iTime: { value: 0 },
        iResolution: {
          value: new Vec3(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height)
        },
        hue: { value: hue },
        hover: { value: 0 },
        rot: { value: 0 },
        hoverIntensity: { value: hoverIntensity },
        backgroundColor: { value: hexToVec3(backgroundColor) }
      }
    });

    const mesh = new Mesh(gl, { geometry, program });

    function resize() {
      if (!container) return;
      const dpr = window.devicePixelRatio || 1;
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width * dpr, height * dpr);
      gl.canvas.style.width = width + 'px';
      gl.canvas.style.height = height + 'px';
      program.uniforms.iResolution.value.set(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height);
    }
    window.addEventListener('resize', resize);
    resize();

    let targetHover = 0;
    let lastTime = 0;
    let currentRot = 0;
    const rotationSpeed = 0.3;

    const handleMouseMove = e => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const width = rect.width;
      const height = rect.height;
      const size = Math.min(width, height);
      const centerX = width / 2;
      const centerY = height / 2;
      const uvX = ((x - centerX) / size) * 2.0;
      const uvY = ((y - centerY) / size) * 2.0;

      if (Math.sqrt(uvX * uvX + uvY * uvY) < 0.8) {
        targetHover = 1;
      } else {
        targetHover = 0;
      }
    };

    const handleMouseLeave = () => {
      targetHover = 0;
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    let rafId;
    const update = t => {
      rafId = requestAnimationFrame(update);
      const dt = (t - lastTime) * 0.001;
      lastTime = t;
      program.uniforms.iTime.value = t * 0.001;
      program.uniforms.hue.value = hue;
      program.uniforms.hoverIntensity.value = hoverIntensity;
      program.uniforms.backgroundColor.value = hexToVec3(backgroundColor);

      const effectiveHover = forceHoverState ? 1 : targetHover;
      program.uniforms.hover.value += (effectiveHover - program.uniforms.hover.value) * 0.1;

      if (rotateOnHover && effectiveHover > 0.5) {
        currentRot += dt * rotationSpeed;
      }
      program.uniforms.rot.value = currentRot;

      renderer.render({ scene: mesh });
    };
    rafId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeChild(gl.canvas);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hue, hoverIntensity, rotateOnHover, forceHoverState, backgroundColor]);

  return <div ref={ctnDom} className="w-full h-full" />;
}

function hslToRgb(h, s, l) {
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return new Vec3(r, g, b);
}

function hexToVec3(color) {
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16) / 255;
    const g = parseInt(color.slice(3, 5), 16) / 255;
    const b = parseInt(color.slice(5, 7), 16) / 255;
    return new Vec3(r, g, b);
  }
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    return new Vec3(parseInt(rgbMatch[1]) / 255, parseInt(rgbMatch[2]) / 255, parseInt(rgbMatch[3]) / 255);
  }
  const hslMatch = color.match(/hsla?\((\d+),\s*(\d+)%,\s*(\d+)%/);
  if (hslMatch) {
    const h = parseInt(hslMatch[1]) / 360;
    const s = parseInt(hslMatch[2]) / 100;
    const l = parseInt(hslMatch[3]) / 100;
    return hslToRgb(h, s, l);
  }
  return new Vec3(0, 0, 0);
}
```

Add `"use client";` at the top of this file if using the fallback path (the CLI-installed version may or may not include it — check, and add it if missing, since this component uses hooks and must be a Client Component).

Run `npm install ogl` if the fallback path was used (the CLI would normally do this automatically).

- [ ] **Step 2: Rewrite the orb block in `components/page-loader.jsx`**

Replace the entire `{/* Breathing glow orb */}` block (the `motion.div` containing the three layered `motion.span` circles) with an `Orb` usage. Import the installed component using whatever path Step 1 actually produced (e.g. `import Orb from "@/components/ui/orb";` — adjust the import path/casing to match the real installed filename).

Also import `useTheme` at the top of `page-loader.jsx`:

```jsx
import { useTheme } from "@/components/theme-provider";
```

Inside the `PageLoader` function body, before the `return`, add:

```jsx
const { resolvedTheme } = useTheme();
const orbBackground = resolvedTheme === "dark" ? "#0e0e11" : "#fafafa";
```

(These hex values are the actual computed colors of this repo's `--background` CSS variable: dark mode `240 8% 6%` ≈ `#0e0e11`, light mode `0 0% 98%` ≈ `#fafafa` — from `app/globals.css`. Use these exact values, don't approximate differently.)

Replace the orb block with:

```jsx
<motion.div
  initial={{ opacity: 0, scale: 0.8 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.5, ease: EASE }}
  className="mb-8 h-64 w-64"
>
  <Orb hue={120} backgroundColor={orbBackground} />
</motion.div>
```

(`hue={120}` is a starting value — Step 3 requires visually tuning this in the browser, so treat 120 as a placeholder to adjust, not a final value to leave unexamined.)

- [ ] **Step 3: Tune the hue value visually and verify no mount-time jank**

Start the dev server (launch config `portfolio-dev`, port 3000). Reload and screenshot. The loader is only visible ~1.6s, so use the same slow-down technique as prior loader tasks if needed: temporarily multiply `setTimeout` and the non-`Orb`-internal transition durations/delays by ~5x, reload, screenshot mid-animation, then revert before committing.

Adjust the `hue` prop value (try a few values in the 90–160 range) until the blob leans warm/orange-red while still showing some multi-color shimmer (not flattened to solid orange — some blue/purple/cyan should remain visible in parts of the swirl, per the spec's "glossy/iridescent" requirement, not a flat single-hue blob). Settle on one final value and leave it in the committed code.

Separately, verify there's no visible stutter/freeze right as the loader mounts (compare the overall page load feel before/after this change — a one-time WebGL/shader compile cost is the risk called out in the spec). Note what you observed either way in your report — this is required, not optional.

Check both light and dark mode (use the site's theme toggle, or `preview_resize` with `colorScheme`) to confirm `orbBackground` picks the right value in each and the orb doesn't look broken/washed out in either.

Check console for errors (WebGL context errors, missing `ogl` import, etc.) via the preview console logs tool.

- [ ] **Step 4: Build check**

Run: `npm run build`
Expected: build completes successfully, no errors (confirms `ogl` bundles correctly for the client).

- [ ] **Step 5: Commit**

```bash
git add components/page-loader.jsx package.json package-lock.json
git commit -m "$(cat <<'EOF'
Replace loader CSS orb with reactbits WebGL Orb

Swaps the layered CSS breathing orb for reactbits' shader-based Orb
component (adds ogl as a dependency), hue-tuned toward terracotta and
theme-aware for light/dark backgrounds.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

If Step 1's CLI install created a new component file, include it in the `git add` (check `git status` first to catch it, along with any other files the CLI touched).

---

## Self-Review Notes

- **Spec coverage:** Installation method (CLI with hand-written fallback since the exact CLI behavior wasn't directly observable ahead of time), hue tuning as an explicit visual-adjustment step (not a fixed guessed value), theme-aware `backgroundColor` (computed from this repo's actual `--background` values), composition (large square, name unchanged below), and the required jank verification are all covered by Task 1's steps.
- **Placeholder scan:** The fallback component source in Step 1 is the verified, complete, real JS-TW variant source (fetched directly from `DavidHDev/react-bits` on GitHub) — not a stub. The `hue={120}` starting value in Step 2 is explicitly labeled as a value to tune, not a placeholder for missing plan content — Step 3 makes the tuning a required action with a concrete range and acceptance criterion (warm-leaning but still multi-color).
- **Type/name consistency:** `EASE` constant reused verbatim from the existing file. `useTheme`/`resolvedTheme` usage matches the exact pattern already established in `components/navbar.jsx:21`. No new exports for other tasks to consume, since this is the only task.
