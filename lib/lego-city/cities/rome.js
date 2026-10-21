import { makeCity } from "./make.js";

const rome = makeCity({
  id: "rome",
  name: "Rome",
  country: "Italy",
  tagline: "Two thousand years of bricks, one coin at a time.",
  geo: { name: "Rome", latitude: 41.9028, longitude: 12.4964, timeZone: "Europe/Rome" },
  station: "Termini Station",
  line: "Linea A · Termini ⇄ Colosseo",
  cars: 6,
  rows: [
    [
      { kind: "colosseum", label: "Colosseum", about: "Opened in AD 80, the largest amphitheatre ever built. It could seat tens of thousands for gladiator games and public spectacles." },
      { kind: "forum", label: "Roman Forum", about: "The centre of public life in ancient Rome: temples, law courts and triumphal arches, now a field of columns." },
      { kind: "river" },
      { kind: "park", color: "bright-green", pond: true, seed: 31, label: "Villa Borghese", about: "Rome's big landscaped park, with a lake, a zoo and gardens. A shady escape from the summer heat." },
    ],
    [
      { kind: "bar", color: "bright-red", floors: 2, label: "Trattoria", about: "Checked tablecloths, cacio e pepe and a nonna in charge of the kitchen." },
      { kind: "trevi", label: "Trevi Fountain", about: "Finished in 1762. Toss a coin over your shoulder with your back to the water and, the legend says, you will return to Rome." },
      { kind: "river" },
      { kind: "shop", color: "bright-pink", floors: 2, label: "Gelateria", about: "Pistachio, stracciatella and a queue out the door. Walking while eating is mandatory." },
    ],
    [
      { kind: "station", color: "dark-bluish-gray", label: "Termini Station", about: "Rome's main railway station, in its current building since 1950. Everything starts here." },
      { kind: "pantheon", label: "Pantheon", about: "Rebuilt by Hadrian around AD 126, with a concrete dome that is still the largest unreinforced one in the world and an open oculus to the sky." },
      { kind: "river" },
      { kind: "pantheon", style: "basilica", label: "St. Peter's Basilica", about: "The Renaissance basilica in Vatican City, crowned by a dome designed by Michelangelo." },
    ],
    [
      { kind: "residential", label: "Trastevere Homes", seed: 17 },
      { kind: "plaza", color: "tan", label: "Piazza Navona", about: "A Baroque square built on the site of an ancient stadium, with Bernini's Fountain of the Four Rivers at its heart." },
      { kind: "river" },
      { kind: "airport", color: "white", label: "Fiumicino Airport", about: "Leonardo da Vinci–Fiumicino, Rome's main airport, a short flight from everywhere." },
    ],
  ],
});

export default rome;
