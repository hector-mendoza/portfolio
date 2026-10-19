import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { STUD_R, STUD_H } from "../layout.js";

/** Unit geometries. Boxes/wedges/cones/"bottom" cylinders have their origin at the bottom centre. */
export function createGeometries() {
  const box = new THREE.BoxGeometry(1, 1, 1);
  box.translate(0, 0.5, 0);

  const cyl = {};
  const cylCentered = {};
  const cone = {};
  const segFor = (seg) => seg ?? 20;

  const getCyl = (seg) => {
    const s = segFor(seg);
    if (!cyl[s]) {
      const g = new THREE.CylinderGeometry(1, 1, 1, s);
      g.translate(0, 0.5, 0);
      cyl[s] = g;
    }
    return cyl[s];
  };
  const getCylCentered = (seg) => {
    const s = segFor(seg);
    if (!cylCentered[s]) cylCentered[s] = new THREE.CylinderGeometry(1, 1, 1, s);
    return cylCentered[s];
  };
  const getCone = (seg) => {
    const s = segFor(seg);
    if (!cone[s]) {
      const g = new THREE.ConeGeometry(1, 1, s);
      g.translate(0, 0.5, 0);
      cone[s] = g;
    }
    return cone[s];
  };

  // Wedge: triangular prism, high edge at z=-0.5, sloping down toward +z ("s")
  const wedge = new THREE.BufferGeometry();
  const v = (x, y, z) => [x, y, z];
  const tri = (a, b, c) => [...a, ...b, ...c];
  const A = v(-0.5, 0, -0.5);
  const B = v(0.5, 0, -0.5);
  const C = v(0.5, 0, 0.5);
  const D = v(-0.5, 0, 0.5);
  const E = v(-0.5, 1, -0.5);
  const F = v(0.5, 1, -0.5);
  const positions = new Float32Array([
    // bottom (faces -y)
    ...tri(A, B, C),
    ...tri(A, C, D),
    // back (vertical, z=-0.5, faces -z)
    ...tri(A, F, B),
    ...tri(A, E, F),
    // slope (faces +y/+z)
    ...tri(E, C, F),
    ...tri(E, D, C),
    // left triangle (x=-0.5, faces -x)
    ...tri(A, D, E),
    // right triangle (x=0.5, faces +x)
    ...tri(B, F, C),
  ]);

  wedge.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  wedge.computeVertexNormals();

  // studs: open-bottom 10-segment cylinder (30 triangles each; there are ~26k of them)
  const side = new THREE.CylinderGeometry(STUD_R, STUD_R, STUD_H, 10, 1, true);
  const cap = new THREE.CircleGeometry(STUD_R, 10);
  cap.rotateX(-Math.PI / 2);
  cap.translate(0, STUD_H / 2, 0);
  const stud = mergeGeometries([side, cap]);
  side.dispose();
  cap.dispose();
  stud.translate(0, STUD_H / 2, 0);

  return {
    box,
    wedge,
    stud,
    getCyl,
    getCylCentered,
    getCone,
    dispose() {
      box.dispose();
      wedge.dispose();
      stud.dispose();
      for (const g of [...Object.values(cyl), ...Object.values(cylCentered), ...Object.values(cone)]) g.dispose();
    },
  };
}

const WEDGE_YAW = { s: 0, n: Math.PI, e: Math.PI / 2, w: -Math.PI / 2 };
const _pos = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _scale = new THREE.Vector3();
const _euler = new THREE.Euler();

/** Fills `out` with the instance matrix for a primitive (local-space coords already applied). */
export function itemMatrix(item, out, offset = { x: 0, y: 0, z: 0 }) {
  _pos.set(item.x - offset.x, item.y - offset.y, item.z - offset.z);
  _quat.identity();
  switch (item.t) {
    case "box":
      _scale.set(item.w, item.h, item.d);
      break;
    case "cyl":
      _scale.set(item.r, item.h, item.r);
      if (item.axis === "x") _quat.setFromEuler(_euler.set(0, 0, Math.PI / 2));
      else if (item.axis === "z") _quat.setFromEuler(_euler.set(Math.PI / 2, 0, 0));
      break;
    case "cone":
      _scale.set(item.r, item.h, item.r);
      break;
    case "wedge":
      _scale.set(item.w, item.h, item.d);
      _quat.setFromEuler(_euler.set(0, WEDGE_YAW[item.dir] ?? 0, 0));
      if (item.dir === "e" || item.dir === "w") _scale.set(item.d, item.h, item.w);
      break;
    default:
      _scale.set(1, 1, 1);
  }
  return out.compose(_pos, _quat, _scale);
}

export function geometryFor(geos, item) {
  switch (item.t) {
    case "box":
      return geos.box;
    case "cyl":
      return item.axis && item.axis !== "y" ? geos.getCylCentered(item.seg) : geos.getCyl(item.seg);
    case "cone":
      return geos.getCone(item.seg);
    case "wedge":
      return geos.wedge;
    default:
      return geos.box;
  }
}
