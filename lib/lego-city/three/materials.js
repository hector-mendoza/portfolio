import * as THREE from "three";
import { colorHex } from "../palette.js";

/**
 * One material per (colour, finish, emissive) so instanced batches stay small.
 * `setNight` re-tunes every material at once for the day/night toggle.
 */
/**
 * Brick seams: a subtle dark line every stud (x/z) and every brick course
 * (y, 1.2 studs) in world space, chosen per face by the surface normal. Big
 * instanced walls then read as stacks of real 1x1 bricks.
 */
function addBrickSeams(mat) {
  mat.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vSeamPos;\nvarying vec3 vSeamNormal;")
      .replace(
        "#include <worldpos_vertex>",
        `#include <worldpos_vertex>
        #ifdef USE_INSTANCING
          vSeamPos = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).xyz;
          vSeamNormal = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * objectNormal);
        #else
          vSeamPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
          vSeamNormal = normalize(mat3(modelMatrix) * objectNormal);
        #endif`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vSeamPos;\nvarying vec3 vSeamNormal;")
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        {
          vec3 n = abs(normalize(vSeamNormal));
          float lx = abs(fract(vSeamPos.x) - 0.5);
          float lz = abs(fract(vSeamPos.z) - 0.5);
          float ly = abs(fract(vSeamPos.y / 1.2) - 0.5);
          float w = 0.47;
          float seam = 0.0;
          if (n.y > 0.7) {
            seam = max(smoothstep(w, 0.5, lx), smoothstep(w, 0.5, lz));
          } else if (n.x > 0.7) {
            seam = max(smoothstep(w, 0.5, lz), smoothstep(w - 0.01, 0.5, ly));
          } else {
            seam = max(smoothstep(w, 0.5, lx), smoothstep(w - 0.01, 0.5, ly));
          }
          float dist = length(vSeamPos - cameraPosition);
          seam *= 1.0 - smoothstep(60.0, 140.0, dist);
          diffuseColor.rgb *= 1.0 - seam * 0.16;
        }`,
      );
  };
  mat.customProgramCacheKey = () => "brick-seams";
}

/** At night only some windows glow: a per-window hash picks lit ones and varies warmth. */
function addWindowLights(mat) {
  mat.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vWinPos;")
      .replace(
        "#include <worldpos_vertex>",
        `#include <worldpos_vertex>
        #ifdef USE_INSTANCING
          vWinPos = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).xyz;
        #else
          vWinPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
        #endif`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vWinPos;")
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        {
          vec3 cell = floor(vec3(vWinPos.x / 2.0, vWinPos.y / 3.6, vWinPos.z / 2.0));
          float id = dot(cell, vec3(12.9898, 78.233, 37.719));
          float h = fract(sin(id) * 43758.5453);
          float lit = step(0.42, h);
          vec3 warm = mix(vec3(1.0, 0.8, 0.45), vec3(0.75, 0.9, 1.0), step(0.85, fract(h * 7.31)));
          totalEmissiveRadiance *= lit * warm * (0.75 + 0.5 * fract(h * 13.7));
        }`,
      );
  };
  mat.customProgramCacheKey = () => "window-lights";
}

export class MaterialLibrary {
  constructor({ seams = true } = {}) {
    this.cache = new Map();
    this.night = false;
    this.seams = seams;
  }

  get(colorName, finish = "plastic", emissive = false) {
    const key = `${colorName}|${finish}|${emissive ? 1 : 0}`;
    let mat = this.cache.get(key);
    if (mat) return mat;
    const color = new THREE.Color(colorHex(colorName));
    if (finish === "glass") {
      mat = new THREE.MeshPhysicalMaterial({
        color,
        roughness: 0.08,
        metalness: 0,
        transparent: true,
        opacity: colorName === "trans-clear" ? 0.42 : 0.58,
        depthWrite: false,
        clearcoat: 0.6,
        envMapIntensity: 1.4,
      });
      mat.userData.glass = true;
      addWindowLights(mat);
    } else if (finish === "chrome") {
      mat = new THREE.MeshStandardMaterial({ color, roughness: 0.22, metalness: 0.95, envMapIntensity: 1.6 });
    } else if (finish === "matte") {
      mat = new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0 });
    } else {
      mat = new THREE.MeshStandardMaterial({ color, roughness: 0.26, metalness: 0.04, envMapIntensity: 1.15 });
      if (this.seams) addBrickSeams(mat);
    }
    if (emissive) {
      mat.emissive = color.clone();
      mat.emissiveIntensity = 0.25;
      mat.userData.emissive = true;
    }
    this.cache.set(key, mat);
    this.applyNight(mat);
    return mat;
  }

  applyNight(mat) {
    if (mat.userData.emissive) mat.emissiveIntensity = this.night ? 2.4 : 0.25;
    if (mat.userData.glass) {
      mat.emissive = this.night ? new THREE.Color("#ffd27a") : new THREE.Color("#000000");
      mat.emissiveIntensity = this.night ? 1.1 : 0;
    }
  }

  setNight(night) {
    this.night = night;
    for (const mat of this.cache.values()) this.applyNight(mat);
  }

  dispose() {
    for (const mat of this.cache.values()) mat.dispose();
    this.cache.clear();
  }
}
