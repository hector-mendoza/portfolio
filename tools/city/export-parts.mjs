#!/usr/bin/env node
/**
 * Compiles the city spec into public/city/city-parts.json, the file the Blender
 * script (tools/blender/build_lego_city.py) consumes. Run: `npm run city:compile`.
 */
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { compileCity, serializeCity } from "../../lib/lego-city/compile.js";
import { PALETTE } from "../../lib/lego-city/palette.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const outFile = process.argv[2] ? path.resolve(process.argv[2]) : path.join(root, "public/city/city-parts.json");

const city = compileCity();
const data = { ...serializeCity(city), palette: PALETTE, generatedAt: new Date().toISOString() };
await mkdir(path.dirname(outFile), { recursive: true });
await writeFile(outFile, JSON.stringify(data));

const studs = Object.values(city.studs).reduce((n, list) => n + list.length / 3, 0);
console.log(`Wrote ${path.relative(root, outFile)}: ${city.items.length} bricks, ${studs} studs, ${city.landmarks.length} landmarks, ${city.route.stops.length} tram stops.`);
