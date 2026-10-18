/** City layout spec: lots, districts, tram route. Shared by the Three.js runtime and the Blender exporter. */
const spec = 
{
  "name": "Mendoza City",
  "tagline": "A brick-built portfolio you can walk through.",
  "units": "1 unit = 1 stud (8 mm). Brick = 1.2, plate = 0.4.",
  "grid": { "blocks": 5, "block": 32, "road": 8, "sidewalk": 3, "margin": 16 },
  "districts": [
    { "id": "work", "title": "Work District", "rows": [0, 1], "blurb": "One building per shipped project." },
    { "id": "downtown", "title": "Downtown", "rows": [2], "blurb": "Mendoza Square, home, and the post office." },
    { "id": "career", "title": "Career Avenue", "rows": [3], "blurb": "Every employer and the university, in order." },
    { "id": "southside", "title": "Southside", "rows": [4], "blurb": "Central Station, parks, and quiet streets." }
  ],
  "lots": [
    { "id": "agent-ready", "block": [0, 0], "kind": "tower", "color": "bright-red", "floors": 7, "label": "Agent Ready", "project": "Agent Ready" },
    { "id": "vibe-theme", "block": [1, 0], "kind": "tower", "color": "magenta", "floors": 6, "label": "Vibe Theme", "project": "Vibe Theme" },
    { "id": "mojito", "block": [2, 0], "kind": "bar", "color": "bright-green", "floors": 2, "label": "Mojito Bar", "project": "Mojito Cocktails" },
    { "id": "emoji-day", "block": [3, 0], "kind": "shop", "color": "bright-yellow", "floors": 2, "label": "Emoji of the Day", "project": "Emoji of the Day" },
    { "id": "cantera-diez", "block": [4, 0], "kind": "hotel", "color": "medium-nougat", "floors": 4, "label": "Cantera Diez Hotel", "project": "Cantera Diez Hotel" },

    { "id": "astes", "block": [0, 1], "kind": "office", "color": "medium-azure", "floors": 4, "label": "Astes", "project": "Astes" },
    { "id": "north-park", "block": [1, 1], "kind": "park", "color": "bright-green", "label": "North Park", "seed": 11,
      "content": { "kind": "place", "title": "North Park", "subtitle": "Work District · Green space", "body": "A quiet square of trees between the project towers. Good spot to catch your breath between Vibe Theme and the library." } },
    { "id": "library", "block": [2, 1], "kind": "library", "color": "tan", "label": "City Library",
      "content": { "kind": "blog", "title": "City Library", "subtitle": "Writing · Notes & essays", "body": "Long-form writing on engineering, design systems, and building for the open web lives here. Browse the stacks.", "cta": "Browse writing", "href": "/blog" } },
    { "id": "east-park", "block": [3, 1], "kind": "park", "color": "bright-green", "label": "Pond Park", "pond": true, "seed": 23,
      "content": { "kind": "place", "title": "Pond Park", "subtitle": "Work District · Ducks included", "body": "Three ducks, one pond, zero deadlines. The Emoji shop and the Milestone spa are a short walk from here." } },
    { "id": "milestone", "block": [4, 1], "kind": "spa", "color": "sand-green", "floors": 2, "label": "Milestone Spa", "project": "Milestone Massage Therapy" },

    { "id": "michoacan-auto", "block": [0, 2], "kind": "garage", "color": "bright-red", "label": "Michoacán Auto", "project": "Michoacán Auto" },
    { "id": "our-wedding", "block": [1, 2], "kind": "chapel", "color": "white", "label": "Wedding Chapel", "project": "Our Wedding" },
    { "id": "plaza", "block": [2, 2], "kind": "plaza", "color": "tan", "label": "Mendoza Square", "sign": ["HECTOR", "MENDOZA"],
      "content": { "kind": "hero", "title": "Hector Mendoza", "subtitle": "Senior Software Engineer · Head of Web Integrations", "body": "Design-minded engineer leading web integrations at UrVenue. I turn complex systems into focused, fast, and human experiences. Welcome to the city.", "cta": "Read the classic page", "href": "/classic" } },
    { "id": "home", "block": [3, 2], "kind": "house", "color": "tan", "roof": "dark-red", "label": "Hector's House",
      "content": { "kind": "about", "title": "About Hector", "subtitle": "Engineer by training. Designer in practice.", "body": "For more than eight years I've built web experiences where technical rigor and visual restraint meet. Based in Morelia, Mexico. Master's in Computer Science, specialising in mobile application development.", "stats": [["8+", "Years building"], ["20+", "Projects delivered"], ["10+", "Happy clients"]], "cta": "More about me", "href": "/classic#about" } },
    { "id": "post-office", "block": [4, 2], "kind": "postoffice", "color": "bright-blue", "label": "Post Office",
      "content": { "kind": "contact", "title": "Post Office", "subtitle": "Start a conversation", "body": "Have something worth building? Drop a letter. I read every one.", "cta": "hey@hectormendoza.me", "href": "mailto:hey@hectormendoza.me", "links": [["GitHub", "https://github.com/hector-mendoza"], ["LinkedIn", "https://www.linkedin.com/in/hector-mendoza-m/"], ["Threads", "https://www.threads.com/@hectormendozax2"]] } },

    { "id": "coparmex", "block": [0, 3], "kind": "civic", "color": "white", "label": "COPARMEX",
      "content": { "kind": "experience", "title": "COPARMEX Michoacán", "subtitle": "2017 · Web Developer", "body": "Managed and maintained the web platform. First professional role contributing to social and business events for the employers' confederation.", "tags": ["WordPress", "PHP", "Web Maintenance"] } },
    { "id": "once-interactive", "block": [1, 3], "kind": "office", "color": "dark-azure", "floors": 5, "label": "Once Interactive",
      "content": { "kind": "experience", "title": "Once Interactive Inc.", "subtitle": "2017 — 2023 · Senior Web Developer → Office Manager & Lead Developer", "body": "Promoted to lead the First-Line Web Team while managing all office operations in Mexico. Oversaw development workflows, client communications, and project delivery for 50+ international companies.", "tags": ["Leadership", "WordPress", "Shopify", "WooCommerce", "Project Management"] } },
    { "id": "urvenue", "block": [2, 3], "kind": "tower", "color": "dark-bluish-gray", "glass": "trans-light-blue", "floors": 10, "label": "UrVenue HQ",
      "content": { "kind": "experience", "title": "UrVenue", "subtitle": "2023 — Now · Web Services Developer → Head of Web Integrations", "body": "Leading web integrations strategy and execution across the UrVenue platform. Overseeing technical direction, team workflows, and delivery of high-impact web projects for enterprise venue technology clients.", "tags": ["Leadership", "Next.js", "Integrations", "APIs", "Project Management"] } },
    { "id": "university", "block": [3, 3], "kind": "university", "color": "dark-red", "label": "UVAQ Campus",
      "content": { "kind": "education", "title": "Universidad Vasco de Quiroga", "subtitle": "Computer Science", "body": "Master's Degree in Computer Science (2018 — 2020), specialty in Mobile App Development. Engineer's Degree in Computer Science (2013 — 2017).", "tags": ["M.Sc. Computer Science", "B.Eng. Computer Science"] } },
    { "id": "east-homes", "block": [4, 3], "kind": "residential", "label": "Eastside Homes", "seed": 37,
      "content": { "kind": "place", "title": "Eastside Homes", "subtitle": "Career Avenue · Residential", "body": "Three brick houses, a fence, and a parked car. Every Lego city needs a street where nothing much happens." } },

    { "id": "west-homes", "block": [0, 4], "kind": "residential", "label": "Westside Homes", "seed": 41,
      "content": { "kind": "place", "title": "Westside Homes", "subtitle": "Southside · Residential", "body": "The first houses you pass after leaving Central Station. Chimneys, flower beds, and a very patient neighbour." } },
    { "id": "lake-park", "block": [1, 4], "kind": "park", "color": "bright-green", "label": "Lake Park", "pond": true, "seed": 53,
      "content": { "kind": "place", "title": "Lake Park", "subtitle": "Southside · First stop out of the station", "body": "A small lake, benches, and pine trees. The tram slows down here so you can look back at Central Station." } },
    { "id": "station", "block": [2, 4], "kind": "station", "color": "dark-bluish-gray", "roof": "bright-red", "label": "Central Station",
      "content": { "kind": "station", "title": "Central Station", "subtitle": "Welcome to Mendoza City", "body": "Ride the tram to tour every district, or hop off and walk anywhere. Each building is a project, a job, or a chapter. Press the mode button or hit Tab to switch between riding and walking.", "cta": "Start the tour" } },
    { "id": "south-homes", "block": [3, 4], "kind": "residential", "label": "Southside Homes", "seed": 67,
      "content": { "kind": "place", "title": "Southside Homes", "subtitle": "Southside · Residential", "body": "Red roofs and white fences next to the station. Walk through the garden gate if you want to peek inside." } },
    { "id": "fairground", "block": [4, 4], "kind": "park", "color": "lime", "label": "Fairground", "wheel": true, "seed": 71,
      "content": { "kind": "place", "title": "Fairground", "subtitle": "Southside · Ferris wheel & ice cream", "body": "The Ferris wheel never stops turning and the ice-cream stand never runs out. The best view of the whole city is from the top gondola." } }
  ],
  "route": {
    "name": "Line 1 · Fairground ⇄ North Terminal",
    "path": [[5, 5], [0, 5], [0, 3], [5, 3], [5, 1], [0, 1]],
    "stops": [
      { "id": "stop-station", "at": [2.5, 5], "title": "Central Station", "lots": ["station"] },
      { "id": "stop-fair", "at": [4, 5], "title": "Fairground", "lots": ["fairground", "south-homes"] },
      { "id": "stop-lake", "at": [1, 5], "title": "Lake Park", "lots": ["lake-park", "west-homes"] },
      { "id": "stop-auto", "at": [0.5, 3], "title": "Garage & Civic", "lots": ["michoacan-auto", "coparmex"] },
      { "id": "stop-chapel", "at": [1.5, 3], "title": "Chapel & Once", "lots": ["our-wedding", "once-interactive"] },
      { "id": "stop-square", "at": [2.5, 3], "title": "Mendoza Square", "lots": ["plaza", "urvenue"] },
      { "id": "stop-home", "at": [3.5, 3], "title": "Home & Campus", "lots": ["home", "university"] },
      { "id": "stop-post", "at": [4.5, 3], "title": "Post Office", "lots": ["post-office", "east-homes"] },
      { "id": "stop-hotel", "at": [4.5, 1], "title": "Hotel & Spa", "lots": ["cantera-diez", "milestone"] },
      { "id": "stop-emoji", "at": [3.5, 1], "title": "Emoji Shop", "lots": ["emoji-day", "east-park"] },
      { "id": "stop-mojito", "at": [2.5, 1], "title": "Mojito & Library", "lots": ["mojito", "library"] },
      { "id": "stop-vibe", "at": [1.5, 1], "title": "Vibe Theme", "lots": ["vibe-theme", "north-park"] },
      { "id": "stop-agent", "at": [0.5, 1], "title": "North Terminal", "lots": ["agent-ready", "astes"] }
    ]
  },
  "spawn": { "lot": "station", "facing": "north" },
  "traffic": { "cars": 6 }
}
;

export default spec;
