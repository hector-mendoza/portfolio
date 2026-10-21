#!/usr/bin/env node
/**
 * Compiles a city spec into the parts JSON the Blender script
 * (tools/blender/build_lego_city.py) consumes. `npm run city:compile` writes
 * Pilleland to public/city/city-parts.json; add `-- --city madrid` (paris, rome,
 * punta-cana) for a travel city, written to public/city/<id>/ (git-ignored).
 */
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { compileCity, serializeCity } from "../../lib/lego-city/compile.js";
import { PALETTE } from "../../lib/lego-city/palette.js";
import { HOME_CITY, getCity } from "../../lib/lego-city/cities.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const args = process.argv.slice(2);
const cityFlag = args.indexOf("--city");
const cityId = cityFlag >= 0 ? args[cityFlag + 1] : HOME_CITY;
const entry = getCity(cityId);
if (!entry) {
  console.error(`Unknown city "${cityId}".`);
  process.exit(1);
}
const positional = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--city");
const defaultOut = cityId === HOME_CITY ? "public/city/city-parts.json" : `public/city/${cityId}/city-parts.json`;
const outFile = positional[0] ? path.resolve(positional[0]) : path.join(root, defaultOut);

const city = compileCity(entry.spec);
const data = { ...serializeCity(city), palette: PALETTE, generatedAt: new Date().toISOString() };
await mkdir(path.dirname(outFile), { recursive: true });
await writeFile(outFile, JSON.stringify(data));

const studs = Object.values(city.studs).reduce((n, list) => n + list.length / 3, 0);
console.log(`Wrote ${path.relative(root, outFile)}: ${city.items.length} bricks, ${studs} studs, ${city.landmarks.length} landmarks, ${city.route.stops.length} tram stops.`);
