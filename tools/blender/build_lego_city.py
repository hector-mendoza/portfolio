"""
Rebuilds Pilleland inside Blender from public/city/city-parts.json, which is
produced from the very same spec and builders the Three.js site uses
(`npm run city:compile`). Then it lights the scene, renders a set of postcards
and exports a glTF for anyone who wants the model.

Usage (from the repo root):

  blender -b -P tools/blender/build_lego_city.py -- \
      --parts public/city/city-parts.json \
      --out   public/city/renders \
      --glb   public/city/lego-city.glb \
      --samples 64 --scale 100

Or with the `bpy` pip module:

  python -m tools.blender.build_lego_city -- --parts public/city/city-parts.json ...

Flags:
  --no-render       build + export only
  --no-glb          skip the glTF export
  --shots a,b,c     subset of postcard names (overview, station, square, night)
  --engine CYCLES|BLENDER_EEVEE_NEXT
  --baseplate-studs include the ~36k baseplate studs in the glTF (bigger file)
"""

import argparse
import json
import math
import os
import sys

import bpy
import bmesh
from mathutils import Matrix, Vector

# --------------------------------------------------------------------------- args


def parse_args():
    argv = sys.argv
    if "--" in argv:
        argv = argv[argv.index("--") + 1 :]
    else:
        argv = [a for a in argv[1:] if not a.endswith(".py")]
    ap = argparse.ArgumentParser(description="Build Pilleland in Blender")
    ap.add_argument("--parts", default="public/city/city-parts.json")
    ap.add_argument("--out", default="public/city/renders")
    ap.add_argument("--glb", default="public/city/lego-city.glb")
    ap.add_argument("--blend", default="")
    ap.add_argument("--samples", type=int, default=64)
    ap.add_argument("--scale", type=int, default=100, help="render size percentage of 1920x1080")
    ap.add_argument("--engine", default="CYCLES")
    ap.add_argument("--shots", default="overview,station,square,night")
    ap.add_argument("--prefix", default="", help="filename prefix for postcards, e.g. paris-")
    ap.add_argument("--auto-shots", action="store_true", help="frame overview/night/landmark shots from the city bounds (for travel cities)")
    ap.add_argument("--no-render", action="store_true")
    ap.add_argument("--no-glb", action="store_true")
    ap.add_argument("--baseplate-studs", action="store_true")
    ap.add_argument("--labels", action="store_true", help="render the floating 3D labels too")
    return ap.parse_args(argv)


# --------------------------------------------------------------------------- helpers

STUD = 0.008  # 1 stud = 8 mm; the scene is built in metres

# Three.js: +x east, +y up, +z south.   Blender: +x east, +z up, +y north.
def to_blender(x, y, z):
    return Vector((x * STUD, -z * STUD, y * STUD))


def hex_to_rgb(hex_str):
    h = hex_str.lstrip("#")
    return tuple(int(h[i : i + 2], 16) / 255 for i in (0, 2, 4))


def srgb_to_linear(c):
    return tuple((v / 12.92) if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4 for v in c)


class Materials:
    def __init__(self, palette):
        self.palette = palette
        self.cache = {}
        self.night = False

    def get(self, color, finish="plastic", emissive=False):
        key = (color, finish, emissive)
        if key in self.cache:
            return self.cache[key]
        mat = bpy.data.materials.new(f"lego_{color}_{finish}{'_glow' if emissive else ''}")
        mat.use_nodes = True
        nodes = mat.node_tree.nodes
        bsdf = nodes["Principled BSDF"]
        rgb = srgb_to_linear(hex_to_rgb(self.palette[color]))
        bsdf.inputs["Base Color"].default_value = (*rgb, 1)
        if finish == "glass":
            bsdf.inputs["Transmission Weight"].default_value = 0.9
            bsdf.inputs["Roughness"].default_value = 0.05
            bsdf.inputs["IOR"].default_value = 1.49
            bsdf.inputs["Alpha"].default_value = 0.65
            try:
                mat.surface_render_method = "BLENDED"
            except AttributeError:
                mat.blend_method = "BLEND"
        elif finish == "chrome":
            bsdf.inputs["Metallic"].default_value = 1.0
            bsdf.inputs["Roughness"].default_value = 0.2
        elif finish == "matte":
            bsdf.inputs["Roughness"].default_value = 0.9
        else:
            # ABS plastic: glossy with a touch of clearcoat and subsurface
            bsdf.inputs["Roughness"].default_value = 0.32
            bsdf.inputs["Specular IOR Level"].default_value = 0.55
            bsdf.inputs["Coat Weight"].default_value = 0.25
            bsdf.inputs["Coat Roughness"].default_value = 0.12
            if "Subsurface Weight" in bsdf.inputs:
                bsdf.inputs["Subsurface Weight"].default_value = 0.04
        if emissive:
            bsdf.inputs["Emission Color"].default_value = (*rgb, 1)
            bsdf.inputs["Emission Strength"].default_value = 0.6
            mat["lego_emissive"] = True
        if finish == "glass":
            mat["lego_glass"] = True
        self.cache[key] = mat
        return mat

    def set_night(self, night):
        for mat in self.cache.values():
            bsdf = mat.node_tree.nodes["Principled BSDF"]
            if mat.get("lego_emissive"):
                bsdf.inputs["Emission Strength"].default_value = 40.0 if night else 0.6
            if mat.get("lego_glass"):
                bsdf.inputs["Emission Color"].default_value = (1.0, 0.75, 0.35, 1)
                bsdf.inputs["Emission Strength"].default_value = 3.0 if night else 0.0


class Meshes:
    """Shared unit meshes so bricks are linked duplicates (cheap in Blender and glTF)."""

    def __init__(self):
        self.cache = {}

    def box(self):
        return self._get("box", self._make_box)

    def wedge(self):
        return self._get("wedge", self._make_wedge)

    def cyl(self, seg, centered):
        return self._get(f"cyl{seg}{'c' if centered else ''}", lambda: self._make_cyl(seg, centered))

    def cone(self, seg):
        return self._get(f"cone{seg}", lambda: self._make_cone(seg))

    def stud(self, r, h):
        return self._get("stud", lambda: self._make_stud(r, h))

    def _get(self, key, maker):
        if key not in self.cache:
            self.cache[key] = maker()
        return self.cache[key]

    @staticmethod
    def _finish(bm, name):
        mesh = bpy.data.meshes.new(name)
        bm.to_mesh(mesh)
        bm.free()
        return mesh

    def _make_box(self):
        bm = bmesh.new()
        bmesh.ops.create_cube(bm, size=1.0)
        bmesh.ops.translate(bm, verts=bm.verts, vec=(0, 0, 0.5))
        return self._finish(bm, "unit_box")

    def _make_wedge(self):
        # high edge at y=+0.5 (north in Blender = -z in three), sloping toward -y (south)
        bm = bmesh.new()
        A = bm.verts.new((-0.5, 0.5, 0))
        B = bm.verts.new((0.5, 0.5, 0))
        C = bm.verts.new((0.5, -0.5, 0))
        D = bm.verts.new((-0.5, -0.5, 0))
        E = bm.verts.new((-0.5, 0.5, 1))
        F = bm.verts.new((0.5, 0.5, 1))
        bm.faces.new((A, B, C, D))
        bm.faces.new((A, E, F, B))
        bm.faces.new((E, D, C, F))
        bm.faces.new((A, D, E))
        bm.faces.new((B, F, C))
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
        return self._finish(bm, "unit_wedge")

    def _make_cyl(self, seg, centered):
        bm = bmesh.new()
        bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=1, radius2=1, depth=1)
        if not centered:
            bmesh.ops.translate(bm, verts=bm.verts, vec=(0, 0, 0.5))
        return self._finish(bm, f"unit_cyl{seg}")

    def _make_cone(self, seg):
        bm = bmesh.new()
        bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=1, radius2=0, depth=1)
        bmesh.ops.translate(bm, verts=bm.verts, vec=(0, 0, 0.5))
        return self._finish(bm, f"unit_cone{seg}")

    def _make_stud(self, r, h):
        bm = bmesh.new()
        bmesh.ops.create_cone(bm, cap_ends=True, segments=16, radius1=r * STUD, radius2=r * STUD, depth=h * STUD)
        bmesh.ops.translate(bm, verts=bm.verts, vec=(0, 0, h * STUD / 2))
        return self._finish(bm, "stud")


WEDGE_YAW = {"s": 0.0, "n": math.pi, "e": -math.pi / 2, "w": math.pi / 2}


def item_matrix(item):
    """World matrix for a primitive, mirroring lib/lego-city/three/geometry.js."""
    t = item["t"]
    loc = to_blender(item["x"], item["y"], item["z"])
    rot = Matrix.Identity(4)
    if t == "box":
        scale = (item["w"] * STUD, item["d"] * STUD, item["h"] * STUD)
    elif t == "cyl":
        scale = (item["r"] * STUD, item["r"] * STUD, item["h"] * STUD)
        axis = item.get("axis", "y")
        if axis == "x":
            rot = Matrix.Rotation(math.pi / 2, 4, "Y")
        elif axis == "z":
            rot = Matrix.Rotation(math.pi / 2, 4, "X")
    elif t == "cone":
        scale = (item["r"] * STUD, item["r"] * STUD, item["h"] * STUD)
    elif t == "wedge":
        d = item.get("dir", "s")
        rot = Matrix.Rotation(WEDGE_YAW[d], 4, "Z")
        if d in ("e", "w"):
            scale = (item["d"] * STUD, item["w"] * STUD, item["h"] * STUD)
        else:
            scale = (item["w"] * STUD, item["d"] * STUD, item["h"] * STUD)
    else:
        scale = (STUD, STUD, STUD)
    return Matrix.Translation(loc) @ rot @ Matrix.Diagonal((*scale, 1))


# --------------------------------------------------------------------------- build


def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def link_material(obj, mat):
    """Per-object material on a shared mesh."""
    if not obj.material_slots:
        obj.data.materials.append(None)
    slot = obj.material_slots[0]
    slot.link = "OBJECT"
    slot.material = mat


def build(parts, mats, meshes, include_baseplate_studs):
    city = bpy.data.collections.new("Pilleland")
    bpy.context.scene.collection.children.link(city)
    bricks = bpy.data.collections.new("Bricks")
    studs_col = bpy.data.collections.new("Studs")
    dynamic = bpy.data.collections.new("Vehicles")
    city.children.link(bricks)
    city.children.link(studs_col)
    city.children.link(dynamic)

    for i, item in enumerate(parts["items"]):
        t = item["t"]
        if t == "box":
            mesh = meshes.box()
        elif t == "cyl":
            mesh = meshes.cyl(item.get("seg", 20), item.get("axis", "y") != "y")
        elif t == "cone":
            mesh = meshes.cone(item.get("seg", 20))
        elif t == "wedge":
            mesh = meshes.wedge()
        else:
            continue
        obj = bpy.data.objects.new(f"{t}_{i}", mesh)
        obj.matrix_world = item_matrix(item)
        link_material(obj, mats.get(item["c"], item.get("m", "plastic"), bool(item.get("e"))))
        (dynamic if item.get("g") else bricks).objects.link(obj)

    # Studs. Roof/prop studs become real linked duplicates (so they survive the
    # glTF export); the ~25k baseplate studs are vertex-instanced for rendering
    # and only realised when --baseplate-studs is given.
    stud_mesh = meshes.stud(0.3, parts.get("studHeight", 0.2))
    for color, flat in parts["studs"].items():
        count = len(flat) // 3
        pts = [to_blender(flat[k * 3], flat[k * 3 + 1], flat[k * 3 + 2]) for k in range(count)]
        mat = mats.get(color)
        is_baseplate = count > 2000
        if is_baseplate and not include_baseplate_studs:
            field = bpy.data.meshes.new(f"studfield_{color}")
            field.from_pydata(pts, [], [])
            field_obj = bpy.data.objects.new(f"studs_{color}", field)
            field_obj.instance_type = "VERTS"
            field_obj.show_instancer_for_render = False
            field_obj.show_instancer_for_viewport = False
            field_obj["lego_baseplate"] = True
            studs_col.objects.link(field_obj)
            stud_obj = bpy.data.objects.new(f"stud_{color}", stud_mesh)
            link_material(stud_obj, mat)
            stud_obj.parent = field_obj
            stud_obj.location = (0, 0, 0)  # instances are offset by this, so keep it at the parent origin
            studs_col.objects.link(stud_obj)
            continue
        for k, pt in enumerate(pts):
            stud_obj = bpy.data.objects.new(f"stud_{color}_{k}", stud_mesh)
            stud_obj.location = pt
            link_material(stud_obj, mat)
            studs_col.objects.link(stud_obj)

    # landmark labels as 3D text (handy in the viewport, excluded from glTF)
    labels = bpy.data.collections.new("Labels")
    city.children.link(labels)
    for label in parts.get("labels", []):
        curve = bpy.data.curves.new(f"label_{label['text']}", type="FONT")
        curve.body = label["text"]
        curve.size = 0.05 if label.get("minor") else 0.07
        curve.align_x = "CENTER"
        obj = bpy.data.objects.new(f"label_{label['text']}", curve)
        obj.location = to_blender(label["x"], label["y"], label["z"])
        obj.rotation_euler = (math.pi / 2, 0, 0)
        obj["lego_label"] = True
        obj.hide_render = True
        labels.objects.link(obj)
    return city


def add_world_and_lights(night=False):
    scene = bpy.context.scene
    world = bpy.data.worlds.new("Sky")
    world.use_nodes = True
    nodes = world.node_tree.nodes
    links = world.node_tree.links
    bg = nodes["Background"]
    if scene.render.engine == "CYCLES":
        # physically based Nishita sky: low sun for a warm evening, or a thin moonlit one at night
        sky = nodes.new("ShaderNodeTexSky")
        try:
            sky.sky_type = "NISHITA"  # Blender 2.9 – 4.x
        except TypeError:
            sky.sky_type = "MULTIPLE_SCATTERING"  # Blender 5.x name for the same model
        settings = {
            "sun_elevation": math.radians(4 if night else 38),
            "sun_rotation": math.radians(215),
            "sun_intensity": 0.05 if night else 0.9,
            "sun_size": math.radians(1.2),
            "altitude": 300,
            "air_density": 1.4,
            "dust_density": 0.6 if night else 1.2,  # renamed between Blender versions
            "aerosol_density": 0.6 if night else 1.2,
        }
        for name, value in settings.items():
            if hasattr(sky, name):
                setattr(sky, name, value)
        links.new(sky.outputs["Color"], bg.inputs["Color"])
        bg.inputs["Strength"].default_value = 0.08 if night else 0.28
    else:
        bg.inputs["Color"].default_value = (0.03, 0.05, 0.14, 1) if night else (0.42, 0.72, 1.0, 1)
        bg.inputs["Strength"].default_value = 0.35 if night else 1.0
    scene.world = world

    sun_data = bpy.data.lights.new("Sun", type="SUN")
    sun_data.energy = 0.6 if night else 2.6
    sun_data.angle = math.radians(2.5)
    sun_data.color = (0.75, 0.8, 1.0) if night else (1.0, 0.96, 0.88)
    sun = bpy.data.objects.new("Sun", sun_data)
    sun.rotation_euler = (math.radians(50), 0, math.radians(35))
    scene.collection.objects.link(sun)

    fill_data = bpy.data.lights.new("Fill", type="SUN")
    fill_data.energy = 0.1 if night else 0.5
    fill_data.color = (0.8, 0.9, 1.0)
    fill = bpy.data.objects.new("Fill", fill_data)
    fill.rotation_euler = (math.radians(60), 0, math.radians(-140))
    scene.collection.objects.link(fill)


SHOTS = {
    # name: (location in studs [x, y, z] three.js coords, look-at target, lens mm, night)
    "overview": ((260, 360, 360), (0, 0, 10), 40, False),
    "station": ((50, 30, 180), (0, 10, 112), 45, False),
    "square": ((-30, 20, 52), (0, 8, -6), 38, False),
    "night": ((-250, 110, 250), (0, 12, 0), 45, True),
}


def auto_shots(parts):
    """Postcards framed from the city's own size, for cities other than Pilleland."""
    b = float(parts.get("bounds", 150))
    shots = {
        "overview": ((b * 1.35, b * 1.8, b * 1.8), (0, 0, b * 0.05), 40, False),
        "night": ((-b * 1.3, b * 0.6, b * 1.2), (0, b * 0.08, 0), 45, True),
    }
    lms = [lm for lm in parts.get("landmarks", []) if lm.get("kind") not in ("station", "residential", "park")]
    if lms:
        lm = lms[0]
        shots["landmark"] = ((lm["x"] + 26, 24, lm["z"] + 46), (lm["x"], 9, lm["z"]), 38, False)
    return shots


def make_camera(loc, target, lens):
    cam_data = bpy.data.cameras.new("Postcard")
    cam_data.lens = lens
    cam_data.clip_end = 50
    cam = bpy.data.objects.new("Postcard", cam_data)
    cam.location = to_blender(*loc)
    look = to_blender(*target)
    direction = look - cam.location
    cam.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    bpy.context.scene.collection.objects.link(cam)
    bpy.context.scene.camera = cam
    return cam


def render_shots(args, mats, names):
    scene = bpy.context.scene
    scene.render.engine = args.engine
    scene.render.resolution_x = 1920
    scene.render.resolution_y = 1080
    scene.render.resolution_percentage = args.scale
    scene.render.image_settings.file_format = "PNG"
    if args.engine == "CYCLES":
        scene.cycles.samples = args.samples
        scene.cycles.use_denoising = True
        scene.cycles.device = "CPU"
    scene.view_settings.view_transform = "AgX" if "AgX" in [v.identifier for v in scene.view_settings.bl_rna.properties["view_transform"].enum_items] else "Filmic"
    scene.view_settings.look = "AgX - Punchy" if scene.view_settings.view_transform == "AgX" else "Medium High Contrast"
    scene.view_settings.exposure = -0.6
    os.makedirs(args.out, exist_ok=True)
    if args.labels:
        for obj in bpy.data.objects:
            if obj.get("lego_label"):
                obj.hide_render = False
    for name in names:
        if name not in SHOTS:
            print(f"unknown shot {name}, skipping")
            continue
        loc, target, lens, night = SHOTS[name]
        for obj in list(scene.collection.objects):
            if obj.type in ("CAMERA", "LIGHT"):
                bpy.data.objects.remove(obj)
        add_world_and_lights(night)
        mats.set_night(night)
        make_camera(loc, target, lens)
        scene.render.filepath = os.path.join(args.out, f"{args.prefix}{name}.png")
        print(f"rendering {name} -> {scene.render.filepath}")
        bpy.ops.render.render(write_still=True)


def export_glb(path, include_baseplate_studs):
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    # hide labels and (optionally) baseplate studs from the export
    hidden = []
    for obj in bpy.data.objects:
        if obj.get("lego_label") or (obj.get("lego_baseplate") and not include_baseplate_studs):
            if not obj.hide_render:
                obj.hide_render = True
                hidden.append(obj)
            # vertex-instanced studs live on a child object; hide it too
            for child in obj.children:
                if not child.hide_render:
                    child.hide_render = True
                    hidden.append(child)
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLB",
        use_renderable=True,
        export_apply=True,
        export_yup=True,
        export_lights=False,
        export_cameras=False,
    )
    for obj in hidden:
        obj.hide_render = False
    print(f"exported {path} ({os.path.getsize(path) / 1e6:.1f} MB)")


def main():
    args = parse_args()
    with open(args.parts, "r", encoding="utf-8") as fh:
        parts = json.load(fh)
    clear_scene()
    scene = bpy.context.scene
    scene.unit_settings.system = "METRIC"
    if args.auto_shots:
        SHOTS.clear()
        SHOTS.update(auto_shots(parts))
        if args.shots == "overview,station,square,night":
            args.shots = "overview,landmark,night"
    mats = Materials(parts["palette"])
    meshes = Meshes()
    build(parts, mats, meshes, args.baseplate_studs)
    add_world_and_lights(False)
    print(f"built {len(parts['items'])} bricks, {sum(len(v) // 3 for v in parts['studs'].values())} studs")
    if args.blend:
        bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(args.blend))
    if not args.no_render:
        render_shots(args, mats, [s.strip() for s in args.shots.split(",") if s.strip()])
    if not args.no_glb:
        mats.set_night(False)
        export_glb(args.glb, args.baseplate_studs)


if __name__ == "__main__":
    main()
