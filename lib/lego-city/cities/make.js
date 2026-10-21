/**
 * Builds a travel-city spec from a 4x4 matrix of lot definitions. Rows pair up
 * around the two tram roads (1 and 3), so every non-water lot sits on a stop.
 */
const SLUG = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function makeCity({ id, name, country, tagline, geo, setting = {}, rows, station, cars = 6, line }) {
  const lots = [];
  rows.forEach((row, r) => {
    row.forEach((def, c) => {
      const water = def.kind === "river" || def.kind === "sea";
      const lot = { id: water ? `${id}-${def.kind}-${r}` : `${id}-${SLUG(def.label)}`, block: [c, r], ...def };
      if (def.about) {
        lot.content = { kind: "place", title: def.label, subtitle: `${name} · ${country}`, body: def.about };
        delete lot.about;
      }
      lots.push(lot);
    });
  });
  const at = (c, r) => lots.find((l) => l.block[0] === c && l.block[1] === r);
  const stops = [];
  for (const road of [3, 1]) {
    for (let c = 0; c < rows[0].length; c++) {
      const pair = [at(c, road - 1), at(c, road)].filter((l) => l.kind !== "river" && l.kind !== "sea");
      if (!pair.length) continue;
      stops.push({ id: `${id}-stop-${c}-${road}`, at: [c + 0.5, road], title: pair[0].label, lots: pair.map((l) => l.id) });
    }
  }
  // the station's stop comes first so the tour starts where the visitor arrives
  const stationLot = lots.find((l) => l.label === station);
  const first = stops.findIndex((s) => s.lots.includes(stationLot.id));
  stops.unshift(...stops.splice(first, 1));
  return {
    name,
    tagline,
    units: "1 unit = 1 stud (8 mm). Brick = 1.2, plate = 0.4.",
    geo,
    setting,
    grid: { blocks: rows.length, block: 32, road: 16, sidewalk: 3, margin: 24 },
    districts: [],
    lots,
    route: { name: line, path: [[rows.length, 1], [0, 1], [0, 3], [rows.length, 3]], stops },
    spawn: { lot: stationLot.id, facing: "north" },
    traffic: { cars },
  };
}
