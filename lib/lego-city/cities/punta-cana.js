import { makeCity } from "./make.js";

const puntaCana = makeCity({
  id: "punta-cana",
  name: "Punta Cana",
  country: "Dominican Republic",
  tagline: "Palms, white sand and a warm turquoise sea.",
  geo: { name: "Punta Cana", latitude: 18.5601, longitude: -68.3725, timeZone: "America/Santo_Domingo" },
  setting: { ground: "tan", horizon: "bright-green", mountains: false, trees: "palm", sea: "east" },
  station: "Playa Station",
  line: "Costa Line · Playa ⇄ Bávaro",
  cars: 5,
  rows: [
    [
      { kind: "resort", color: "white", label: "Bávaro Resort", about: "A palm-thatched resort around a lagoon pool, steps from the beach. All-inclusive means no one checks the bar tab." },
      { kind: "park", color: "lime", seed: 41, label: "Palm Grove", about: "Coconut palms and shade in every direction. A cool pause between the beach and the pool." },
      { kind: "pier", label: "Beach Pier", about: "A wooden pier running out into the Caribbean, with a catamaran tied up at the end and loungers on the sand." },
      { kind: "sea" },
    ],
    [
      { kind: "residential", label: "Tropical Villas", seed: 6 },
      { kind: "palapa", label: "Coconut Bar", about: "A round thatched palapa bar: fresh coconut water by day, rum by night." },
      { kind: "palapa", label: "Sunset Palapa", about: "The best seat for the sunset, with a beach volleyball net out front." },
      { kind: "sea" },
    ],
    [
      { kind: "thatchairport", label: "Punta Cana Airport", about: "Famous for its open-air terminals roofed with palm thatch. You step off the plane straight into the tropics." },
      { kind: "lighthouse", label: "Marina Lighthouse", about: "A candy-striped lighthouse watching over the marina and the boats that go out to snorkel." },
      { kind: "resort", color: "bright-light-orange", label: "Caribe Resort", about: "Orange walls, thatched roofs and a pool shaped like a lagoon." },
      { kind: "sea" },
    ],
    [
      { kind: "spa", color: "sand-green", floors: 2, label: "Spa Retreat", about: "Massages under palm trees with the sound of waves in the background." },
      { kind: "shop", color: "bright-yellow", floors: 2, label: "Beach Market", about: "Hammocks, hats, cigars and local coffee. Haggle politely." },
      { kind: "station", color: "dark-bluish-gray", label: "Playa Station", about: "The beachside terminus of the coast line. Mind the sand on the platform." },
      { kind: "sea" },
    ],
  ],
});

export default puntaCana;
