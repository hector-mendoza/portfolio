# Blueprint tool

Draws Pilleland as architectural blueprints: a minifig sheet (front, side, back, top)
and a plan view of every city, as SVG in `public/city/blueprints/`.

It uses [gkjohnson/three-edge-projection](https://github.com/gkjohnson/three-edge-projection)
(MIT) to extract the visible edges of the real brick geometry, the same primitives the
site and the Blender pipeline are built from.

```bash
npm run city:blueprints:install   # once: installs this folder's dev dependencies
npm run city:blueprints           # minifig + every city
npm run city:blueprints -- --only minifig
npm run city:blueprints -- --only paris      # or: plans
```

## Why this is a separate package

- The library is **not published on npm** under the official name: `three-edge-projection` there
  was created and unpublished by an unrelated account, and a scoped copy of it exists under that
  account. Neither is used. It is installed from the official GitHub repo, **pinned to a commit**
  (`3ac00e1`, see `package.json` and `package-lock.json`).
- It only runs offline to generate files, so it stays out of the site's own `package.json`,
  `npm ci` and bundle. The SVGs are plain static assets.
- Its declared peer ranges (three ^0.155, three-mesh-bvh ^0.6) are stale; `.npmrc` sets
  `legacy-peer-deps` and the site's own `three` (0.186) is shared from the repo root.

To update the library, review the new source first, then change the commit in `package.json`
and re-run `npm install` in this folder.

## How it works

The library projects straight down the y axis. City plans are projected as-is (ground plates,
tree leaves and tiny detail are filtered out; tree trunks become circle symbols; block outlines and
lot names are drawn on top). Minifig views turn the figure so each side faces up first. The SVG
styling lives in `lib/lego-city/blueprint.js` (pure, unit-tested).
