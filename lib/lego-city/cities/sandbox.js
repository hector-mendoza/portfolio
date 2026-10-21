/**
 * A tiny 3x3 town used to prove the multi-city engine (hidden from the
 * departures board; open it with ?city=sandbox). Real destinations replace it.
 */
const sandbox = {
  name: "Sandbox Town",
  tagline: "A tiny test city for the travel engine.",
  units: "1 unit = 1 stud (8 mm). Brick = 1.2, plate = 0.4.",
  geo: { name: "Madrid", latitude: 40.4168, longitude: -3.7038, timeZone: "Europe/Madrid" },
  grid: { blocks: 3, block: 32, road: 16, sidewalk: 3, margin: 24 },
  districts: [],
  lots: [
    { id: "sb-park-1", block: [0, 0], kind: "park", color: "bright-green", label: "Sandbox Park", seed: 3 },
    { id: "sb-shop", block: [1, 0], kind: "shop", color: "bright-yellow", floors: 2, label: "Sandbox Shop" },
    { id: "sb-homes", block: [2, 0], kind: "residential", label: "Sandbox Homes", seed: 5 },
    { id: "sb-bar", block: [0, 1], kind: "bar", color: "orange", floors: 2, label: "Sandbox Bar" },
    { id: "sb-plaza", block: [1, 1], kind: "plaza", color: "tan", label: "Sandbox Square" },
    { id: "sb-hotel", block: [2, 1], kind: "hotel", color: "bright-blue", floors: 3, label: "Sandbox Hotel" },
    { id: "sb-homes-2", block: [0, 2], kind: "residential", label: "Sandbox Terrace", seed: 7 },
    { id: "sb-station", block: [1, 2], kind: "station", color: "dark-bluish-gray", label: "Sandbox Station" },
    { id: "sb-park-2", block: [2, 2], kind: "park", color: "lime", label: "Sandbox Green", seed: 9 },
  ],
  route: {
    name: "Sandbox Line",
    path: [[3, 3], [0, 3], [0, 1], [3, 1]],
    stops: [
      { id: "sb-stop-station", at: [1.5, 3], title: "Sandbox Station", lots: ["sb-station"] },
      { id: "sb-stop-green", at: [2.5, 3], title: "Sandbox Green", lots: ["sb-park-2"] },
      { id: "sb-stop-bar", at: [0.5, 1], title: "Sandbox Bar", lots: ["sb-bar", "sb-park-1"] },
      { id: "sb-stop-square", at: [1.5, 1], title: "Sandbox Square", lots: ["sb-plaza", "sb-shop"] },
    ],
  },
  spawn: { lot: "sb-station", facing: "north" },
  traffic: { cars: 4 },
};

export default sandbox;
