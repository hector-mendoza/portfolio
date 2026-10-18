import * as THREE from "three";
import { colorHex } from "../palette.js";

/**
 * One material per (colour, finish, emissive) so instanced batches stay small.
 * `setNight` re-tunes every material at once for the day/night toggle.
 */
export class MaterialLibrary {
  constructor() {
    this.cache = new Map();
    this.night = false;
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
    } else if (finish === "chrome") {
      mat = new THREE.MeshStandardMaterial({ color, roughness: 0.22, metalness: 0.95, envMapIntensity: 1.6 });
    } else if (finish === "matte") {
      mat = new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0 });
    } else {
      mat = new THREE.MeshStandardMaterial({ color, roughness: 0.32, metalness: 0.02, envMapIntensity: 0.9 });
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
    if (mat.userData.emissive) mat.emissiveIntensity = this.night ? 1.6 : 0.25;
    if (mat.userData.glass) {
      mat.emissive = this.night ? new THREE.Color("#ffd27a") : new THREE.Color("#000000");
      mat.emissiveIntensity = this.night ? 0.55 : 0;
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
