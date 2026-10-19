/**
 * Grid math shared by every consumer of the city spec.
 *
 * Axes: +x east, +z south (down on the minimap), +y up. 1 unit = 1 stud.
 * Block [c, r] is the c-th column (x) and r-th row (z). Roads run between
 * blocks; road index i runs 0..blocks (inclusive) along each axis.
 */
export const BRICK = 1.2;
export const PLATE = 0.4;
export const STUD_R = 0.3;
export const STUD_H = 0.2;
export const FLOOR = 3 * BRICK; // 3.6
export const GROUND = PLATE; // top of a block plate
export const ROAD_TOP = 0.2;

export function createLayout(grid) {
  const { blocks, block, road, sidewalk, margin } = grid;
  const width = blocks * block + (blocks + 1) * road;
  const half = width / 2;
  const pitch = block + road;
  const bounds = half + margin;

  const roadCoord = (i) => -half + road / 2 + i * pitch;

  const blockRect = (c, r) => {
    const x0 = -half + road + c * pitch;
    const z0 = -half + road + r * pitch;
    const cx = x0 + block / 2;
    const cz = z0 + block / 2;
    const innerSize = block - sidewalk * 2;
    return {
      c,
      r,
      x0,
      z0,
      size: block,
      cx,
      cz,
      half: block / 2,
      innerHalf: innerSize / 2,
      innerSize,
      /** Rows alternate which road they face so tram riders see every facade. */
      facing: r % 2 === 0 ? 1 : -1,
    };
  };

  const pathPoint = ([i, j]) => ({ x: roadCoord(i), z: roadCoord(j) });

  return {
    ...grid,
    width,
    half,
    pitch,
    bounds,
    roadCoord,
    blockRect,
    pathPoint,
  };
}

/** Small deterministic PRNG (mulberry32) so both renderers agree on "random" props. */
export function createRng(seed = 1) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    range: (min, max) => min + next() * (max - min),
    int: (min, max) => Math.floor(min + next() * (max - min + 1)),
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    chance: (p) => next() < p,
  };
}
