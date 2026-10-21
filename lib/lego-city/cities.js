import pilleland from "./spec.js";
import madrid from "./cities/madrid.js";
import paris from "./cities/paris.js";
import rome from "./cities/rome.js";
import puntaCana from "./cities/punta-cana.js";

export const HOME_CITY = "pilleland";

/**
 * Every place a visitor can be in. `spec` is the compiled-city input; entries
 * without one are announced on the departures board as "coming soon".
 * `hidden` cities load with ?city=<id> but are not listed.
 */
export const CITIES = [
  { id: HOME_CITY, spec: pilleland, name: pilleland.name, country: "Home", blurb: "Where every project lives." },
  { id: "madrid", spec: madrid, name: "Madrid", country: "Spain", blurb: "Plazas, tapas and late nights." },
  { id: "paris", spec: paris, name: "Paris", country: "France", blurb: "An iron tower and a lot of bread." },
  { id: "rome", spec: rome, name: "Rome", country: "Italy", blurb: "Two thousand years of bricks." },
  { id: "punta-cana", spec: puntaCana, name: "Punta Cana", country: "Dominican Republic", blurb: "Palms, sand and a turquoise sea." },
];

export function getCity(id) {
  return CITIES.find((c) => c.id === id && c.spec) ?? null;
}

/** Cities shown on the departures board (the current one is left out by the UI). */
export function listDestinations() {
  return CITIES.filter((c) => !c.hidden);
}

/** Resolves a ?city= value to a loadable city id, falling back to home. */
export function resolveCityId(value) {
  return getCity(value) ? value : HOME_CITY;
}
