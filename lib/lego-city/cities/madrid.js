import { makeCity } from "./make.js";

const madrid = makeCity({
  id: "madrid",
  name: "Madrid",
  country: "Spain",
  tagline: "Plazas, tapas and late nights in the heart of Spain.",
  geo: { name: "Madrid", latitude: 40.4168, longitude: -3.7038, timeZone: "Europe/Madrid" },
  station: "Atocha Station",
  line: "Línea 1 · Atocha ⇄ Palacio",
  cars: 6,
  rows: [
    [
      { kind: "palace", label: "Royal Palace", about: "The official residence of the Spanish royal family, used for state ceremonies. With over 3,000 rooms it is one of the largest royal palaces in Europe." },
      { kind: "arcade", color: "dark-orange", label: "Plaza Mayor", about: "A 17th-century square ringed by three-storey terracotta buildings and arcades, with a statue of Philip III at its centre. Cafés fill the arches." },
      { kind: "gate", label: "Puerta de Alcalá", about: "A neoclassical triumphal gate with five openings, commissioned by Charles III and finished in 1778. It stands at the edge of the old city." },
      { kind: "park", color: "bright-green", pond: true, seed: 11, label: "Retiro Park", about: "A 125-hectare park with a rowing lake and the glass Crystal Palace, part of a UNESCO World Heritage landscape. Perfect for a lazy Sunday." },
    ],
    [
      { kind: "bar", color: "orange", floors: 2, label: "Taberna La Latina", about: "Tapas crawl headquarters: small plates, vermouth and a crowd spilling into the street after the Sunday flea market." },
      { kind: "cibeles", label: "Plaza de Cibeles", about: "The fountain of the goddess Cybele on a chariot drawn by two lions. A symbol of Madrid and a favourite spot for celebrations." },
      { kind: "civic", color: "tan", label: "Prado Museum", about: "One of the world's great art museums, home to Velázquez, Goya and El Greco." },
      { kind: "residential", label: "Salamanca Homes", seed: 5 },
    ],
    [
      { kind: "tower", color: "white", floors: 8, label: "Gran Vía Tower", about: "Madrid's Broadway: a boulevard of early 20th-century towers, theatres and neon." },
      { kind: "station", color: "dark-bluish-gray", label: "Atocha Station", about: "Madrid's main railway terminus, with a tropical garden growing in its old iron-and-glass hall." },
      { kind: "stadium", label: "Santiago Bernabéu", about: "Home of Real Madrid since 1947. Floodlights, white shirts and a lot of noise on matchdays." },
      { kind: "shop", color: "bright-red", floors: 2, label: "Mercado de San Miguel", about: "A glass-and-iron market from 1916, now a gourmet tapas hall under one roof." },
    ],
    [
      { kind: "residential", label: "Malasaña Homes", seed: 9 },
      { kind: "bar", color: "bright-yellow", floors: 2, label: "Chocolatería San Ginés", about: "Thick hot chocolate and churros, served here since 1894. The classic end to a long night." },
      { kind: "plaza", color: "tan", label: "Puerta del Sol", about: "Kilometre zero of Spain's roads. At New Year the clock here sets the rhythm for the twelve grapes." },
      { kind: "airport", color: "white", label: "Madrid-Barajas Airport", about: "Madrid's international gateway. Boarding passes for every other city live here." },
    ],
  ],
});

export default madrid;
