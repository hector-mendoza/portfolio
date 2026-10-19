# Pilleland in Blender

The city is described once (`lib/lego-city/spec.js` + `lib/lego-city/builders.js`)
and consumed twice: by the Three.js runtime on the home page, and by this Blender
script for high-fidelity renders and a downloadable glTF.

```
npm run city:compile      # spec → public/city/city-parts.json (bricks, studs, route, labels)
npm run city:blender      # Blender (CLI) → public/city/renders/*.png + public/city/lego-city.glb
```

`npm run city:blender` expects `blender` on your PATH (Blender 4.2+ / 5.x). Without a
desktop install you can use the pip module instead:

```
python -m venv .venv && .venv/bin/pip install bpy
.venv/bin/python tools/blender/build_lego_city.py -- \
  --parts public/city/city-parts.json --out public/city/renders --glb public/city/lego-city.glb
```

Useful flags:

| Flag | Effect |
| --- | --- |
| `--shots overview,station,square,night` | Which postcards to render (any subset) |
| `--samples 48` / `--scale 100` | Cycles samples and size (% of 1920×1080) |
| `--engine BLENDER_EEVEE_NEXT` | Faster preview renders (flat sky instead of Nishita) |
| `--no-render` / `--no-glb` | Skip either output |
| `--blend out.blend` | Also save the scene for hand editing |
| `--baseplate-studs` | Realise the ~26k baseplate studs in the glTF (bigger file) |
| `--labels` | Render the floating 3D labels as well |

## How the scene maps

| city-parts.json | Blender |
| --- | --- |
| `items[]` (`box`, `cyl`, `cone`, `wedge`) | Linked duplicates of one unit mesh each, scaled per brick |
| `studs{colour: [x,y,z,…]}` | Roof studs become real objects; baseplate studs are vertex-instanced |
| `labels[]` | Text objects in the `Labels` collection (hidden from render) |
| `dynamic[]` (cars, tram, Ferris wheel) | Static placements in the `Vehicles` collection |
| colours (`palette`) | One Principled BSDF per colour/finish: ABS plastic, glass, chrome, matte |

Units: the JSON is in studs (1 stud = 8 mm); the script builds in metres, so the
city is about 1.9 m across, the size of a large real LEGO® layout.
