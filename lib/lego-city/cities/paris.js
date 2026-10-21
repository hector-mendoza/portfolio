import { makeCity } from "./make.js";

const paris = makeCity({
  id: "paris",
  name: "Paris",
  country: "France",
  tagline: "An iron tower, a river and an unreasonable amount of bread.",
  geo: { name: "Paris", latitude: 48.8566, longitude: 2.3522, timeZone: "Europe/Paris" },
  station: "Gare du Nord",
  line: "Ligne 1 · Gare du Nord ⇄ Tour Eiffel",
  cars: 6,
  rows: [
    [
      { kind: "bar", color: "bright-red", floors: 2, label: "Montmartre Café", about: "A pavement café below the hill of Montmartre, where painters once set up their easels. Order a café crème and watch the street." },
      { kind: "river" },
      { kind: "eiffel", label: "Eiffel Tower", about: "Built by Gustave Eiffel's company for the 1889 World's Fair, this 330-metre iron lattice tower was meant to be temporary. It never left." },
      { kind: "arc", label: "Arc de Triomphe", about: "Ordered by Napoleon in 1806 and finished in 1836. The Tomb of the Unknown Soldier lies beneath, and its flame is rekindled every evening." },
    ],
    [
      { kind: "cathedral", label: "Notre-Dame", about: "A Gothic cathedral begun in 1163, on an island in the Seine. It reopened in December 2024 after the 2019 fire." },
      { kind: "river" },
      { kind: "shop", color: "bright-yellow", floors: 2, label: "Boulangerie", about: "Fresh baguettes at seven in the morning: the best reason to be awake." },
      { kind: "office", color: "tan", floors: 5, label: "Haussmann Apartments", about: "The cream limestone boulevards and zinc mansard roofs of Baron Haussmann's 1850s–70s remodelling define the look of central Paris." },
    ],
    [
      { kind: "pyramid", label: "Louvre", about: "The world's most-visited museum, in a former royal palace. I. M. Pei's glass pyramid was added to its courtyard in 1989." },
      { kind: "river", boat: true },
      { kind: "station", color: "dark-bluish-gray", label: "Gare du Nord", about: "One of the busiest railway stations in Europe, with trains to London, Brussels and Amsterdam." },
      { kind: "park", color: "bright-green", pond: true, seed: 23, label: "Luxembourg Gardens", about: "Formal lawns, green chairs and a pond where children push model sailboats with sticks." },
    ],
    [
      { kind: "residential", label: "Left Bank Homes", seed: 14 },
      { kind: "river" },
      { kind: "hotel", color: "tan", floors: 4, label: "Grand Hôtel", about: "A belle-époque hotel with balconies, a doorman and a very good breakfast." },
      { kind: "airport", color: "white", label: "Charles de Gaulle Airport", about: "Paris's main international airport since 1974. Gates to the rest of the world." },
    ],
  ],
});

export default paris;
