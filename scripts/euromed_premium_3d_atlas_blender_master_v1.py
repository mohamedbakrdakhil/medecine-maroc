# -*- coding: utf-8 -*-
"""
EUROMED Premium 3D Atlas - Blender Master Script V1
---------------------------------------------------
But : générer des scènes 3D pédagogiques premium pour les modules de médecine.
Utilisation : ouvrir Blender > Scripting > coller/lancer ce script.

Réglages importants :
- MODULE_TO_BUILD : choisir le module à générer.
- BUILD_ALL_MODULES : exporter tous les modules l'un après l'autre.
- EXPORT_GLB_AFTER_BUILD : exporter en .glb pour le site/app.
- LABEL_MODE : "OFF", "ESSENTIAL" ou "ALL".

Ce script crée des objets nommés avec préfixes :
BONE_, MUSCLE_, ORGAN_, VESSEL_, NERVE_, CELL_, MEMBRANE_, DEVICE_, FLOW_, LABEL_, INFO_.
Les objets contiennent des propriétés exportables dans le GLB : label, description, category, module, layer.
Dans Three.js, elles seront disponibles dans object.userData si export_extras=True.
"""

import bpy
import math
import os
from mathutils import Vector

# =========================
# CONFIGURATION UTILISATEUR
# =========================
BUILD_ALL_MODULES = True
MODULE_TO_BUILD = "abdomen_premium"  # voir AVAILABLE_MODULES en bas du fichier
EXPORT_GLB_AFTER_BUILD = True
OUTPUT_DIR = "//euromed_3d_exports"
LABEL_MODE = "OFF"  # OFF, ESSENTIAL, ALL
ANIMATE_ASSEMBLY = True
FPS = 24
FRAME_START = 1
FRAME_END = 170

# Qualité Blender : mettre à 1 pour fichiers GLB plus légers, 2 pour rendu plus lisse.
SUBDIV_LEVEL_PREMIUM = 1

MATS = {}

# =========================
# OUTILS GÉNÉRAUX
# =========================

def safe_set(obj, attr, value):
    if hasattr(obj, attr):
        try:
            setattr(obj, attr, value)
        except Exception:
            pass


def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete()
    for datablock_name in ["meshes", "curves", "materials", "images", "textures"]:
        datablock = getattr(bpy.data, datablock_name, None)
        if datablock is None:
            continue
        try:
            for item in list(datablock):
                if item.users == 0:
                    datablock.remove(item)
        except Exception:
            pass


def look_at(obj, target):
    direction = Vector(target) - obj.location
    if direction.length == 0:
        return
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def mat_principled(name, color, metallic=0.0, roughness=0.55, alpha=1.0, emission=None, emission_strength=0.0):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = color
    mat.use_nodes = True
    safe_set(mat, "use_nodes", True)
    safe_set(mat, "blend_method", "BLEND" if alpha < 0.999 else "OPAQUE")
    safe_set(mat, "show_transparent_back", True)
    safe_set(mat, "use_screen_refraction", alpha < 0.999)
    try:
        bsdf = mat.node_tree.nodes.get("Principled BSDF")
        if bsdf:
            def set_input(possible_names, value):
                for n in possible_names:
                    if n in bsdf.inputs:
                        bsdf.inputs[n].default_value = value
                        return
            set_input(["Base Color"], color)
            set_input(["Metallic"], metallic)
            set_input(["Roughness"], roughness)
            set_input(["Alpha"], alpha)
            if emission is not None:
                set_input(["Emission Color", "Emission"], emission)
                set_input(["Emission Strength"], emission_strength)
    except Exception:
        pass
    return mat


def create_materials():
    global MATS
    MATS = {
        "bone": mat_principled("MAT_os_ivoire_micro_rugueux", (0.86, 0.80, 0.66, 1), roughness=0.9),
        "cartilage": mat_principled("MAT_cartilage_bleute_translucide", (0.55, 0.82, 0.95, 0.62), roughness=0.35, alpha=0.62),
        "muscle": mat_principled("MAT_muscle_rouge_fibre", (0.72, 0.16, 0.12, 1), roughness=0.58),
        "muscle_dark": mat_principled("MAT_muscle_rouge_sombre", (0.48, 0.07, 0.07, 1), roughness=0.65),
        "tendon": mat_principled("MAT_tendon_nacre", (0.92, 0.87, 0.70, 1), roughness=0.72),
        "skin": mat_principled("MAT_peau_translucide", (1.0, 0.62, 0.48, 0.24), roughness=0.42, alpha=0.24),
        "organ_liver": mat_principled("MAT_foie_brillant", (0.48, 0.10, 0.08, 1), roughness=0.42),
        "organ_stomach": mat_principled("MAT_estomac_rose", (0.82, 0.40, 0.34, 1), roughness=0.5),
        "organ_intestine": mat_principled("MAT_intestin_ocre_rose", (0.91, 0.58, 0.43, 1), roughness=0.55),
        "organ_kidney": mat_principled("MAT_rein_pourpre", (0.55, 0.11, 0.18, 1), roughness=0.5),
        "organ_bladder": mat_principled("MAT_vessie_jaune_translucide", (0.95, 0.78, 0.30, 0.56), roughness=0.4, alpha=0.56),
        "artery": mat_principled("MAT_artere_rouge", (0.92, 0.04, 0.03, 1), roughness=0.38),
        "vein": mat_principled("MAT_veine_bleue", (0.05, 0.22, 0.82, 1), roughness=0.42),
        "nerve": mat_principled("MAT_nerf_jaune", (1.0, 0.80, 0.12, 1), roughness=0.48, emission=(1.0, 0.65, 0.05, 1), emission_strength=0.08),
        "lymph": mat_principled("MAT_lymphatique_vert", (0.25, 0.95, 0.55, 1), roughness=0.35),
        "glass": mat_principled("MAT_verre_transparent", (0.65, 0.9, 1.0, 0.25), roughness=0.06, alpha=0.25),
        "metal": mat_principled("MAT_metal_anode_cathode", (0.62, 0.62, 0.64, 1), metallic=0.7, roughness=0.23),
        "tungsten": mat_principled("MAT_tungstene_anode", (0.38, 0.37, 0.39, 1), metallic=0.9, roughness=0.2),
        "copper": mat_principled("MAT_cuivre", (0.92, 0.43, 0.17, 1), metallic=0.7, roughness=0.28),
        "electron": mat_principled("MAT_electron_bleu_emissif", (0.1, 0.55, 1.0, 1), roughness=0.2, emission=(0.0, 0.5, 1.0, 1), emission_strength=1.6),
        "xray": mat_principled("MAT_rayons_x_dore", (1.0, 0.9, 0.2, 0.48), roughness=0.2, alpha=0.48, emission=(1.0, 0.82, 0.08, 1), emission_strength=1.4),
        "radiation": mat_principled("MAT_radiation_violette", (0.75, 0.20, 1.0, 0.55), roughness=0.22, alpha=0.55, emission=(0.70, 0.1, 1.0, 1), emission_strength=1.2),
        "cell": mat_principled("MAT_cellule_membrane", (0.35, 0.88, 0.95, 0.42), roughness=0.45, alpha=0.42),
        "nucleus": mat_principled("MAT_noyau_cellulaire", (0.46, 0.23, 0.78, 0.78), roughness=0.5, alpha=0.78),
        "dna": mat_principled("MAT_ADN_orange_bleu", (0.95, 0.58, 0.12, 1), roughness=0.45),
        "water": mat_principled("MAT_eau_bleu_translucide", (0.15, 0.55, 1.0, 0.38), roughness=0.15, alpha=0.38),
        "na": mat_principled("MAT_sodium_violet", (0.55, 0.34, 1.0, 1), roughness=0.35, emission=(0.5, 0.3, 1.0, 1), emission_strength=0.25),
        "acid": mat_principled("MAT_acide_rouge", (1.0, 0.18, 0.10, 1), roughness=0.3),
        "base": mat_principled("MAT_base_bleu", (0.1, 0.44, 1.0, 1), roughness=0.3),
        "membrane": mat_principled("MAT_bicouche_lipidique", (0.98, 0.72, 0.35, 1), roughness=0.4),
        "protein": mat_principled("MAT_proteine_membranaire", (0.55, 0.20, 0.88, 1), roughness=0.4),
        "black": mat_principled("MAT_noir_mat", (0.02, 0.025, 0.03, 1), roughness=0.8),
        "white": mat_principled("MAT_blanc_label", (0.95, 0.96, 0.92, 1), roughness=0.6),
        "label": mat_principled("MAT_label_blanc_emissif", (0.95, 0.98, 1.0, 1), roughness=0.5, emission=(0.95, 0.98, 1.0, 1), emission_strength=0.65),
        "panel": mat_principled("MAT_panel_sombre", (0.03, 0.04, 0.055, 0.86), roughness=0.45, alpha=0.86),
        "green": mat_principled("MAT_vert_signal", (0.1, 0.9, 0.25, 1), roughness=0.3, emission=(0.1, 0.9, 0.25, 1), emission_strength=0.3),
        "orange": mat_principled("MAT_orange_signal", (1.0, 0.45, 0.05, 1), roughness=0.3, emission=(1.0, 0.35, 0.0, 1), emission_strength=0.25),
        "gray": mat_principled("MAT_gris_neutre", (0.45, 0.47, 0.50, 1), roughness=0.65),
    }


def setup_scene(module_title="Module médical 3D", camera_loc=(5, -8, 5), camera_target=(0, 0, 0), ortho_scale=7.0):
    bpy.context.scene.frame_start = FRAME_START
    bpy.context.scene.frame_end = FRAME_END
    bpy.context.scene.render.fps = FPS
    try:
        bpy.context.scene.render.engine = "CYCLES"
        bpy.context.scene.cycles.samples = 64
    except Exception:
        try:
            bpy.context.scene.render.engine = "BLENDER_EEVEE_NEXT"
        except Exception:
            pass
    bpy.context.scene.render.film_transparent = True
    bpy.context.scene.view_settings.view_transform = "Filmic"
    bpy.context.scene.view_settings.look = "Medium High Contrast"
    bpy.context.scene.view_settings.exposure = 0
    bpy.context.scene.view_settings.gamma = 1

    bpy.ops.object.camera_add(location=camera_loc)
    cam = bpy.context.object
    look_at(cam, camera_target)
    cam.data.type = "ORTHO"
    cam.data.ortho_scale = ortho_scale
    cam.name = "CAM_Main_Viewer_Centered"
    bpy.context.scene.camera = cam

    bpy.ops.object.light_add(type="AREA", location=(0, -4, 7))
    key = bpy.context.object
    key.name = "LIGHT_Key_Large_Softbox"
    key.data.energy = 550
    key.data.size = 5

    bpy.ops.object.light_add(type="POINT", location=(-3.5, 3, 4))
    rim = bpy.context.object
    rim.name = "LIGHT_Rim_Premium"
    rim.data.energy = 85

    title_obj = add_label("LABEL_TITRE_MODULE", module_title, (0, -0.22, 3.35), size=0.12, essential=True, module="global", category="LABEL", desc="Titre de la scène 3D.")
    if title_obj:
        title_obj.name = "LABEL_TITRE_MODULE"


def set_meta(obj, label=None, category="STRUCTURE", description="", module="", layer="", page_ref=""):
    if label is None:
        label = obj.name
    obj["label"] = label
    obj["category"] = category
    obj["description"] = description
    obj["module"] = module
    obj["layer"] = layer or category
    obj["page_ref"] = page_ref
    obj["selectable"] = True
    return obj


def shade_smooth_and_subdivide(obj, subdiv=0):
    try:
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        bpy.ops.object.shade_smooth()
        obj.select_set(False)
    except Exception:
        pass
    if subdiv > 0:
        try:
            mod = obj.modifiers.new("premium_smooth_subdivision", "SUBSURF")
            mod.levels = subdiv
            mod.render_levels = subdiv
        except Exception:
            pass
    return obj


def add_ellipsoid(name, loc, scale, mat, label=None, category="STRUCTURE", desc="", module="", layer="", subdiv=None, page_ref=""):
    if subdiv is None:
        subdiv = SUBDIV_LEVEL_PREMIUM
    bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24, location=loc)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    if mat:
        obj.data.materials.append(mat)
    shade_smooth_and_subdivide(obj, subdiv)
    return set_meta(obj, label, category, desc, module, layer, page_ref)


def add_box(name, loc, scale, mat, label=None, category="STRUCTURE", desc="", module="", layer="", page_ref=""):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    if mat:
        obj.data.materials.append(mat)
    shade_smooth_and_subdivide(obj, 0)
    return set_meta(obj, label, category, desc, module, layer, page_ref)


def add_cylinder_between(name, p1, p2, radius, mat, label=None, category="STRUCTURE", desc="", module="", layer="", vertices=32, page_ref=""):
    p1 = Vector(p1)
    p2 = Vector(p2)
    mid = (p1 + p2) / 2
    direction = p2 - p1
    length = direction.length
    if length < 1e-6:
        length = 0.001
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=length, location=mid)
    obj = bpy.context.object
    obj.name = name
    obj.rotation_euler = direction.to_track_quat("Z", "Y").to_euler()
    if mat:
        obj.data.materials.append(mat)
    shade_smooth_and_subdivide(obj, 0)
    return set_meta(obj, label, category, desc, module, layer, page_ref)


def add_curve_tube(name, points, radius, mat, label=None, category="STRUCTURE", desc="", module="", layer="", resolution=16, page_ref=""):
    curve = bpy.data.curves.new(name, type="CURVE")
    curve.dimensions = "3D"
    curve.resolution_u = resolution
    curve.bevel_depth = radius
    curve.bevel_resolution = 5
    spline = curve.splines.new("POLY")
    spline.points.add(len(points) - 1)
    for p, co in zip(spline.points, points):
        p.co = (co[0], co[1], co[2], 1)
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    if mat:
        obj.data.materials.append(mat)
    return set_meta(obj, label, category, desc, module, layer, page_ref)


def add_torus(name, loc, major_radius, minor_radius, mat, label=None, category="STRUCTURE", desc="", module="", layer="", rotation=(0, 0, 0), page_ref=""):
    bpy.ops.mesh.primitive_torus_add(major_segments=96, minor_segments=16, major_radius=major_radius, minor_radius=minor_radius, location=loc, rotation=rotation)
    obj = bpy.context.object
    obj.name = name
    if mat:
        obj.data.materials.append(mat)
    shade_smooth_and_subdivide(obj, 0)
    return set_meta(obj, label, category, desc, module, layer, page_ref)


def add_cone(name, loc, radius1, radius2, depth, mat, label=None, category="STRUCTURE", desc="", module="", layer="", rotation=(0, 0, 0), page_ref=""):
    bpy.ops.mesh.primitive_cone_add(vertices=64, radius1=radius1, radius2=radius2, depth=depth, location=loc, rotation=rotation)
    obj = bpy.context.object
    obj.name = name
    if mat:
        obj.data.materials.append(mat)
    shade_smooth_and_subdivide(obj, 0)
    return set_meta(obj, label, category, desc, module, layer, page_ref)


def add_label(name, text, loc, size=0.10, essential=False, module="", category="LABEL", desc=""):
    if LABEL_MODE.upper() == "OFF":
        return None
    if LABEL_MODE.upper() == "ESSENTIAL" and not essential:
        return None
    bpy.ops.object.text_add(location=loc, rotation=(math.radians(66), 0, 0))
    obj = bpy.context.object
    obj.name = name
    obj.data.body = text
    obj.data.align_x = "CENTER"
    obj.data.align_y = "CENTER"
    obj.data.size = size
    obj.data.extrude = size * 0.018
    obj.data.materials.append(MATS.get("label"))
    set_meta(obj, text, category, desc or text, module, "LABEL")
    return obj


def add_particle(name, loc, radius, mat, label=None, category="FLOW", desc="", module="", layer="", page_ref=""):
    return add_ellipsoid(name, loc, (radius, radius, radius), mat, label, category, desc, module, layer, subdiv=0, page_ref=page_ref)


def animate_assembly(objs, strength=0.7, start=1, end=62):
    if not ANIMATE_ASSEMBLY:
        return
    for idx, obj in enumerate(objs):
        if not obj or obj.type == "CAMERA" or obj.name.startswith("LIGHT"):
            continue
        final = obj.location.copy()
        direction = final.copy()
        if direction.length < 0.25:
            direction = Vector(((idx % 5) - 2, ((idx // 5) % 5) - 2, ((idx // 25) % 5) - 2))
        if direction.length < 0.01:
            direction = Vector((1, 0, 0))
        direction.normalize()
        offset = direction * strength
        obj.location = final + offset
        obj.keyframe_insert(data_path="location", frame=start)
        obj.location = final
        obj.keyframe_insert(data_path="location", frame=end)


def animate_scale_pulse(obj, frames=(80, 100, 120), scale_factor=1.12):
    if not obj:
        return
    base = obj.scale.copy()
    obj.scale = base
    obj.keyframe_insert(data_path="scale", frame=frames[0])
    obj.scale = base * scale_factor
    obj.keyframe_insert(data_path="scale", frame=frames[1])
    obj.scale = base
    obj.keyframe_insert(data_path="scale", frame=frames[2])


def interpolate_polyline(points, t):
    if not points:
        return Vector((0, 0, 0))
    if len(points) == 1:
        return Vector(points[0])
    points_v = [Vector(p) for p in points]
    segments = []
    total = 0
    for a, b in zip(points_v[:-1], points_v[1:]):
        l = (b - a).length
        segments.append((a, b, l))
        total += l
    if total <= 1e-6:
        return points_v[0]
    distance = max(0, min(1, t)) * total
    acc = 0
    for a, b, l in segments:
        if acc + l >= distance:
            local = (distance - acc) / l if l > 0 else 0
            return a.lerp(b, local)
        acc += l
    return points_v[-1]


def animate_flow_particles(prefix, points, count, radius, mat, module, category="FLOW", desc="Flux animé", start=70, end=160, stagger=6):
    parts = []
    for i in range(count):
        obj = add_particle(f"{prefix}_{i+1:02d}", points[0], radius, mat, label=f"{prefix} {i+1}", category=category, desc=desc, module=module, layer="FLOW")
        f0 = start + i * stagger
        f1 = end + i * stagger
        obj.location = interpolate_polyline(points, 0)
        obj.keyframe_insert(data_path="location", frame=f0)
        obj.location = interpolate_polyline(points, 1)
        obj.keyframe_insert(data_path="location", frame=f1)
        parts.append(obj)
    return parts


def add_dna_helix(prefix, center=(0, 0, 0), height=2.2, radius=0.35, turns=3.0, module="radiobiologie_premium"):
    objs = []
    n = 90
    strand1, strand2 = [], []
    for i in range(n):
        t = i / (n - 1)
        ang = t * turns * math.tau
        z = center[2] - height / 2 + t * height
        strand1.append((center[0] + math.cos(ang) * radius, center[1] + math.sin(ang) * radius, z))
        strand2.append((center[0] + math.cos(ang + math.pi) * radius, center[1] + math.sin(ang + math.pi) * radius, z))
    objs.append(add_curve_tube(prefix + "_brin_1", strand1, 0.025, MATS["dna"], "Brin ADN 1", "MOLECULE", "Premier brin de la double hélice d’ADN.", module, "ADN"))
    objs.append(add_curve_tube(prefix + "_brin_2", strand2, 0.025, MATS["electron"], "Brin ADN 2", "MOLECULE", "Second brin complémentaire de la double hélice d’ADN.", module, "ADN"))
    for i in range(0, n, 6):
        objs.append(add_cylinder_between(prefix + f"_paire_base_{i:02d}", strand1[i], strand2[i], 0.012, MATS["white"], "Paire de bases", "MOLECULE", "Paire de bases azotées reliant les deux brins.", module, "ADN", vertices=10))
    return objs


def add_human_silhouette(module, name_prefix="BODY", loc=(0, 0, 0), scale=1.0, mat=None, transparent=True):
    mat = mat or MATS["skin"]
    objs = []
    objs.append(add_ellipsoid(name_prefix + "_tete", (loc[0], loc[1], loc[2] + 2.3 * scale), (0.26 * scale, 0.22 * scale, 0.30 * scale), mat, "Tête", "BODY", "Repère corporel global.", module, "BODY", 0))
    objs.append(add_ellipsoid(name_prefix + "_thorax_abdomen", (loc[0], loc[1], loc[2] + 1.35 * scale), (0.55 * scale, 0.28 * scale, 0.88 * scale), mat, "Tronc", "BODY", "Volume corporel global transparent.", module, "BODY", 0))
    objs.append(add_cylinder_between(name_prefix + "_bras_gauche", (loc[0] - 0.52 * scale, loc[1], loc[2] + 1.75 * scale), (loc[0] - 0.90 * scale, loc[1], loc[2] + 0.75 * scale), 0.055 * scale, mat, "Bras", "BODY", "Repère de membre supérieur.", module, "BODY"))
    objs.append(add_cylinder_between(name_prefix + "_bras_droit", (loc[0] + 0.52 * scale, loc[1], loc[2] + 1.75 * scale), (loc[0] + 0.90 * scale, loc[1], loc[2] + 0.75 * scale), 0.055 * scale, mat, "Bras", "BODY", "Repère de membre supérieur.", module, "BODY"))
    objs.append(add_cylinder_between(name_prefix + "_jambe_gauche", (loc[0] - 0.22 * scale, loc[1], loc[2] + 0.55 * scale), (loc[0] - 0.28 * scale, loc[1], loc[2] - 0.65 * scale), 0.07 * scale, mat, "Jambe", "BODY", "Repère de membre inférieur.", module, "BODY"))
    objs.append(add_cylinder_between(name_prefix + "_jambe_droite", (loc[0] + 0.22 * scale, loc[1], loc[2] + 0.55 * scale), (loc[0] + 0.28 * scale, loc[1], loc[2] - 0.65 * scale), 0.07 * scale, mat, "Jambe", "BODY", "Repère de membre inférieur.", module, "BODY"))
    return objs


def export_scene(module_key):
    out_dir = bpy.path.abspath(OUTPUT_DIR)
    os.makedirs(out_dir, exist_ok=True)
    filepath = os.path.join(out_dir, module_key + ".glb")
    try:
        bpy.ops.export_scene.gltf(
            filepath=filepath,
            export_format="GLB",
            export_extras=True,
            export_animations=True,
            export_yup=True,
            export_apply=False,
        )
        print("GLB exporté :", filepath)
    except TypeError:
        bpy.ops.export_scene.gltf(filepath=filepath, export_format="GLB", export_extras=True, export_animations=True)
        print("GLB exporté :", filepath)

# =========================
# MODULES ANATOMIQUES
# =========================

def build_abdomen_premium():
    module = "abdomen_premium"
    setup_scene("Anatomie de l’abdomen — atlas 3D premium", camera_loc=(5, -8, 4.2), camera_target=(0, 0, 0.8), ortho_scale=5.6)
    objs = []

    # Enveloppe corporelle et repères squelettiques
    objs.append(add_ellipsoid("SURFACE_tronc_abdominal_translucide", (0, 0, 0.35), (1.55, 0.55, 2.25), MATS["skin"], "Surface abdominale", "BODY", "Vue transparente du tronc pour situer la paroi, le péritoine et les organes.", module, "surface", 0))
    for i, z in enumerate([1.85, 1.62, 1.39, 1.16]):
        pts_l = [(-0.15, -0.02, z), (-0.7, -0.05, z + 0.05), (-1.35, -0.02, z - 0.12)]
        pts_r = [(0.15, -0.02, z), (0.7, -0.05, z + 0.05), (1.35, -0.02, z - 0.12)]
        objs.append(add_curve_tube(f"BONE_cote_gauche_{i+7}", pts_l, 0.018, MATS["bone"], "Côte", "BONE", "Arc costal inférieur, repère de la paroi supérieure de l’abdomen.", module, "squelette"))
        objs.append(add_curve_tube(f"BONE_cote_droite_{i+7}", pts_r, 0.018, MATS["bone"], "Côte", "BONE", "Arc costal inférieur, repère de la paroi supérieure de l’abdomen.", module, "squelette"))
    objs.append(add_cylinder_between("BONE_colonne_lombaire", (0, 0.32, 1.85), (0, 0.32, -0.8), 0.07, MATS["bone"], "Colonne lombaire", "BONE", "Repère postérieur : rachis lombaire derrière la cavité abdominale.", module, "squelette"))
    for i, z in enumerate([1.45, 1.05, 0.65, 0.25, -0.15]):
        objs.append(add_box(f"BONE_vertebre_L{i+1}", (0, 0.22, z), (0.18, 0.12, 0.10), MATS["bone"], f"Vertèbre L{i+1}", "BONE", "Vertèbre lombaire stylisée.", module, "squelette"))
    objs.append(add_torus("BONE_bassin_anneau_pelvien", (0, 0, -1.05), 0.84, 0.035, MATS["bone"], "Bassin", "BONE", "Anneau pelvien simplifié servant de limite inférieure de l’abdomen.", module, "squelette", rotation=(math.radians(90), 0, 0)))

    # Paroi abdominale antérieure et latérale
    objs.append(add_box("MUSCLE_grand_droit_abdomen_gauche", (-0.22, -0.48, 0.25), (0.16, 0.045, 1.45), MATS["muscle"], "Grand droit gauche", "MUSCLE", "Muscle vertical de la paroi antérieure de l’abdomen, compartimenté par des intersections tendineuses.", module, "paroi antérieure"))
    objs.append(add_box("MUSCLE_grand_droit_abdomen_droit", (0.22, -0.48, 0.25), (0.16, 0.045, 1.45), MATS["muscle"], "Grand droit droit", "MUSCLE", "Muscle vertical de la paroi antérieure de l’abdomen.", module, "paroi antérieure"))
    for z in [0.95, 0.45, -0.05]:
        objs.append(add_box(f"TENDON_intersection_grand_droit_{z:.1f}", (0, -0.535, z), (0.50, 0.015, 0.018), MATS["tendon"], "Intersection tendineuse", "TENDON", "Ligne tendineuse horizontale du muscle grand droit.", module, "paroi antérieure"))
    objs.append(add_box("TENDON_ligne_blanche", (0, -0.56, 0.25), (0.035, 0.018, 1.55), MATS["tendon"], "Ligne blanche", "TENDON", "Raphé médian fibreux entre les deux muscles grands droits.", module, "paroi antérieure"))
    objs.append(add_box("MUSCLE_oblique_externe_gauche", (-0.92, -0.42, 0.35), (0.34, 0.04, 1.35), MATS["muscle_dark"], "Oblique externe", "MUSCLE", "Plan superficiel de la paroi latérale abdominale.", module, "paroi latérale"))
    objs[-1].rotation_euler[2] = math.radians(-18)
    objs.append(add_box("MUSCLE_oblique_externe_droit", (0.92, -0.42, 0.35), (0.34, 0.04, 1.35), MATS["muscle_dark"], "Oblique externe", "MUSCLE", "Plan superficiel de la paroi latérale abdominale.", module, "paroi latérale"))
    objs[-1].rotation_euler[2] = math.radians(18)
    objs.append(add_box("MUSCLE_oblique_interne_gauche", (-0.82, -0.36, 0.25), (0.25, 0.035, 1.20), MATS["muscle"], "Oblique interne", "MUSCLE", "Plan moyen de la paroi latérale abdominale.", module, "paroi latérale"))
    objs[-1].rotation_euler[2] = math.radians(24)
    objs.append(add_box("MUSCLE_oblique_interne_droit", (0.82, -0.36, 0.25), (0.25, 0.035, 1.20), MATS["muscle"], "Oblique interne", "MUSCLE", "Plan moyen de la paroi latérale abdominale.", module, "paroi latérale"))
    objs[-1].rotation_euler[2] = math.radians(-24)
    objs.append(add_box("MUSCLE_transverse_abdomen_gauche", (-1.02, -0.27, 0.2), (0.22, 0.035, 1.1), MATS["organ_stomach"], "Transverse", "MUSCLE", "Plan profond de la paroi latérale abdominale.", module, "paroi latérale"))
    objs.append(add_box("MUSCLE_transverse_abdomen_droit", (1.02, -0.27, 0.2), (0.22, 0.035, 1.1), MATS["organ_stomach"], "Transverse", "MUSCLE", "Plan profond de la paroi latérale abdominale.", module, "paroi latérale"))
    objs.append(add_curve_tube("CANAL_inguinal_gauche", [(-0.85, -0.60, -0.70), (-0.55, -0.64, -0.85), (-0.22, -0.60, -0.98)], 0.025, MATS["tendon"], "Canal inguinal gauche", "CANAL", "Trajet oblique inférieur de la région inguinale.", module, "canal inguinal"))
    objs.append(add_curve_tube("CANAL_inguinal_droit", [(0.85, -0.60, -0.70), (0.55, -0.64, -0.85), (0.22, -0.60, -0.98)], 0.025, MATS["tendon"], "Canal inguinal droit", "CANAL", "Trajet oblique inférieur de la région inguinale.", module, "canal inguinal"))

    # Péritoine et viscères
    objs.append(add_ellipsoid("PERITONEUM_cavite_peritoneale_translucide", (0, -0.08, 0.35), (1.23, 0.36, 1.82), MATS["glass"], "Cavité péritonéale", "PERITONEUM", "Espace péritonéal stylisé avec feuillet pariétal et viscères intrapéritonéaux.", module, "péritoine", 0))
    liver = add_ellipsoid("ORGAN_foie_segments_hepatiques", (-0.56, -0.20, 1.15), (0.76, 0.28, 0.35), MATS["organ_liver"], "Foie", "ORGAN", "Glande abdominale supérieure droite ; visualisation globale avec segmentation hépatique simplifiée.", module, "organes", 1)
    objs.append(liver)
    objs.append(add_ellipsoid("ORGAN_estomac_crosse_gastrique", (0.52, -0.18, 0.92), (0.36, 0.20, 0.50), MATS["organ_stomach"], "Estomac", "ORGAN", "Organe digestif creux de l’étage sus-mésocolique, relié au duodénum.", module, "organes", 1))
    duodenum_pts = [(0.58, -0.20, 0.45), (0.78, -0.18, 0.25), (0.65, -0.18, -0.05), (0.42, -0.18, 0.05)]
    objs.append(add_curve_tube("ORGAN_duodenum_cadre_duodenal", duodenum_pts, 0.045, MATS["organ_intestine"], "Duodénum", "ORGAN", "Cadre duodénal encadrant la tête du pancréas.", module, "organes"))
    objs.append(add_ellipsoid("ORGAN_pancreas", (0.18, -0.14, 0.28), (0.54, 0.12, 0.12), MATS["organ_intestine"], "Pancréas", "ORGAN", "Organe rétro-péritonéal supérieur associé au duodénum.", module, "organes", 1))
    objs.append(add_ellipsoid("ORGAN_rate", (1.02, -0.14, 0.90), (0.22, 0.13, 0.36), MATS["organ_liver"], "Rate", "ORGAN", "Organe lymphoïde de l’hypochondre gauche.", module, "organes", 1))
    # Intestin grêle en spirales
    for k, x in enumerate([-0.45, -0.10, 0.25, 0.58]):
        pts = []
        for i in range(40):
            a = i / 39 * 2 * math.pi
            pts.append((x + 0.15 * math.cos(a), -0.25 + 0.05 * math.sin(a), -0.38 + 0.15 * math.sin(a + k)))
        objs.append(add_curve_tube(f"ORGAN_intestin_grele_anse_{k+1}", pts, 0.035, MATS["organ_intestine"], "Anse intestinale", "ORGAN", "Anse de l’intestin grêle dans l’étage sous-mésocolique.", module, "organes"))
    colon_pts = [(-0.85, -0.2, -0.65), (-0.95, -0.2, 0.10), (-0.86, -0.2, 0.65), (0, -0.22, 0.70), (0.90, -0.2, 0.60), (0.95, -0.2, -0.15), (0.72, -0.2, -0.72)]
    objs.append(add_curve_tube("ORGAN_colon_cadre_colique", colon_pts, 0.055, MATS["organ_intestine"], "Côlon", "ORGAN", "Cadre colique : côlon droit, transverse, gauche et sigmoïde stylisés.", module, "organes"))
    objs.append(add_ellipsoid("ORGAN_caeco_appendice", (-0.86, -0.24, -0.72), (0.16, 0.10, 0.16), MATS["organ_intestine"], "Cæcum", "ORGAN", "Segment initial du gros intestin, avec appendice vermiforme.", module, "organes", 0))
    objs.append(add_curve_tube("ORGAN_appendice_vermiforme", [(-0.95, -0.25, -0.78), (-1.05, -0.25, -0.92), (-1.0, -0.24, -1.05)], 0.018, MATS["organ_intestine"], "Appendice", "ORGAN", "Appendice vermiforme issu du cæcum.", module, "organes"))
    objs.append(add_curve_tube("ORGAN_rectum_canal_anal", [(0.38, -0.22, -0.85), (0.20, -0.20, -1.12), (0.05, -0.18, -1.38)], 0.05, MATS["organ_intestine"], "Rectum et canal anal", "ORGAN", "Segment terminal digestif dans le pelvis.", module, "organes"))
    objs.append(add_ellipsoid("ORGAN_rein_droit", (-0.58, 0.18, 0.25), (0.20, 0.11, 0.42), MATS["organ_kidney"], "Rein droit", "ORGAN", "Rein rétro-péritonéal, avec hile orienté médialement.", module, "rétro-péritonéal", 1))
    objs.append(add_ellipsoid("ORGAN_rein_gauche", (0.58, 0.18, 0.30), (0.20, 0.11, 0.42), MATS["organ_kidney"], "Rein gauche", "ORGAN", "Rein rétro-péritonéal, coupe possible sur la configuration interne.", module, "rétro-péritonéal", 1))
    objs.append(add_ellipsoid("ORGAN_vessie", (0, -0.10, -1.28), (0.32, 0.20, 0.24), MATS["organ_bladder"], "Vessie", "ORGAN", "Réservoir urinaire pelvien représenté en volume translucide.", module, "pelvis", 1))

    # Vaisseaux et lymphatiques
    aorta_pts = [(0.0, 0.08, 1.65), (0.0, 0.08, 0.70), (0.0, 0.08, -0.25), (-0.42, 0.08, -0.88), (-0.68, 0.08, -1.35)]
    ivc_pts = [(0.22, 0.10, 1.60), (0.22, 0.10, 0.75), (0.22, 0.10, -0.22), (0.58, 0.10, -0.88), (0.78, 0.10, -1.30)]
    objs.append(add_curve_tube("VESSEL_aorte_abdominale", aorta_pts, 0.055, MATS["artery"], "Aorte abdominale", "VESSEL_ARTERY", "Tronc artériel rétro-péritonéal médian donnant les branches viscérales et iliaques.", module, "vascularisation"))
    objs.append(add_curve_tube("VESSEL_veine_cave_inferieure", ivc_pts, 0.060, MATS["vein"], "Veine cave inférieure", "VESSEL_VEIN", "Grand collecteur veineux rétro-péritonéal situé à droite de l’aorte.", module, "vascularisation"))
    for side, sgn in [("droit", -1), ("gauche", 1)]:
        objs.append(add_curve_tube(f"VESSEL_artere_renale_{side}", [(0, 0.08, 0.55), (sgn*0.58, 0.12, 0.35)], 0.025, MATS["artery"], f"Artère rénale {side}", "VESSEL_ARTERY", "Branche latérale de l’aorte vers le rein.", module, "vascularisation"))
        objs.append(add_curve_tube(f"VESSEL_veine_renale_{side}", [(0.22, 0.10, 0.46), (sgn*0.58, 0.12, 0.35)], 0.026, MATS["vein"], f"Veine rénale {side}", "VESSEL_VEIN", "Drainage veineux du rein vers la veine cave inférieure.", module, "vascularisation"))
    for i, z in enumerate([1.05, 0.70, 0.35, 0.0, -0.35]):
        objs.append(add_ellipsoid(f"LYMPH_ganglion_lombo_aortique_{i+1}", (-0.18, 0.05, z), (0.05, 0.035, 0.05), MATS["lymph"], "Ganglion lombo-aortique", "LYMPH", "Ganglion lymphatique autour des gros vaisseaux rétro-péritonéaux.", module, "lymphatique", 0))
    objs += animate_flow_particles("FLOW_sang_aortique", aorta_pts, 7, 0.035, MATS["artery"], module, desc="Flux artériel descendant dans l’aorte abdominale.")
    animate_scale_pulse(liver, frames=(76, 96, 116), scale_factor=1.035)

    # Labels essentiels
    add_label("LABEL_foie", "Foie", (-0.90, -0.65, 1.55), 0.13, True, module, desc="Label essentiel : foie.")
    add_label("LABEL_estomac", "Estomac", (0.95, -0.65, 1.16), 0.12, True, module, desc="Label essentiel : estomac.")
    add_label("LABEL_aorte", "Aorte abdominale", (-0.45, -0.68, 0.45), 0.105, True, module, desc="Label essentiel : aorte abdominale.")
    add_label("LABEL_reins", "Reins", (0.95, 0.02, 0.35), 0.12, True, module, desc="Label essentiel : reins.")
    add_label("LABEL_paroi", "Paroi abdominale", (0, -0.78, 2.05), 0.12, True, module, desc="Label essentiel : paroi abdominale.")

    animate_assembly(objs, strength=0.85, start=1, end=62)
    return module


def build_membre_superieur_premium():
    module = "membre_superieur_premium"
    setup_scene("Membre supérieur — atlas 3D premium", camera_loc=(4.5, -7, 4.5), camera_target=(0, 0, 0.5), ortho_scale=5.5)
    objs = []
    # Os
    objs.append(add_curve_tube("BONE_clavicule", [(-1.0, 0, 2.0), (-0.35, 0.04, 2.07), (0.18, 0, 1.96)], 0.035, MATS["bone"], "Clavicule", "BONE", "Os long supérieur reliant sternum et scapula.", module, "squelette"))
    objs.append(add_ellipsoid("BONE_scapula_omoplate", (-0.25, 0.22, 1.55), (0.38, 0.06, 0.55), MATS["bone"], "Scapula", "BONE", "Omoplate avec épine, acromion et cavité glénoïde stylisés.", module, "squelette", 1))
    objs.append(add_cylinder_between("BONE_humerus", (0.12, -0.02, 1.55), (0.10, -0.02, 0.35), 0.06, MATS["bone"], "Humérus", "BONE", "Os du bras, tête proximale et épicondyles distaux stylisés.", module, "squelette"))
    objs.append(add_ellipsoid("BONE_tete_humerale", (0.10, -0.02, 1.62), (0.16, 0.16, 0.16), MATS["bone"], "Tête humérale", "BONE", "Surface articulaire gléno-humérale.", module, "squelette", 0))
    objs.append(add_cylinder_between("BONE_radius", (-0.05, -0.02, 0.26), (-0.25, -0.02, -0.70), 0.035, MATS["bone"], "Radius", "BONE", "Os latéral de l’avant-bras, impliqué dans la pronation-supination.", module, "squelette"))
    objs.append(add_cylinder_between("BONE_ulna", (0.18, -0.02, 0.26), (0.08, -0.02, -0.72), 0.037, MATS["bone"], "Ulna", "BONE", "Os médial de l’avant-bras, repère du coude.", module, "squelette"))
    for i, x in enumerate([-0.22, -0.08, 0.06, 0.20]):
        objs.append(add_cylinder_between(f"BONE_metacarpien_{i+1}", (x, -0.02, -0.82), (x*1.15, -0.02, -1.20), 0.018, MATS["bone"], "Métacarpien", "BONE", "Os de la paume de la main.", module, "main"))
        objs.append(add_cylinder_between(f"BONE_phalanges_{i+1}", (x*1.15, -0.02, -1.22), (x*1.25, -0.02, -1.55), 0.014, MATS["bone"], "Phalanges", "BONE", "Os des doigts.", module, "main"))
    # Muscles
    objs.append(add_ellipsoid("MUSCLE_deltoide", (0.22, -0.10, 1.40), (0.32, 0.10, 0.45), MATS["muscle"], "Deltoïde", "MUSCLE", "Muscle de l’épaule couvrant l’articulation scapulo-humérale.", module, "muscles", 1))
    objs.append(add_curve_tube("MUSCLE_biceps_brachial", [(0.02, -0.13, 1.25), (-0.04, -0.14, 0.78), (-0.02, -0.12, 0.30)], 0.055, MATS["muscle"], "Biceps brachial", "MUSCLE", "Muscle antérieur du bras, fléchisseur du coude et supinateur.", module, "muscles"))
    objs.append(add_curve_tube("MUSCLE_triceps_brachial", [(0.28, 0.08, 1.15), (0.31, 0.08, 0.72), (0.22, 0.08, 0.22)], 0.050, MATS["muscle_dark"], "Triceps brachial", "MUSCLE", "Muscle postérieur du bras, extenseur du coude.", module, "muscles"))
    objs.append(add_curve_tube("MUSCLE_flechisseurs_avant_bras", [(0.02, -0.15, 0.25), (-0.05, -0.16, -0.30), (-0.16, -0.12, -0.78)], 0.045, MATS["muscle"], "Fléchisseurs de l’avant-bras", "MUSCLE", "Loge antérieure de l’avant-bras : flexion poignet/doigts.", module, "muscles"))
    objs.append(add_curve_tube("MUSCLE_extenseurs_avant_bras", [(0.22, 0.08, 0.20), (0.18, 0.08, -0.36), (0.05, 0.04, -0.78)], 0.040, MATS["muscle_dark"], "Extenseurs de l’avant-bras", "MUSCLE", "Loge postérieure de l’avant-bras : extension poignet/doigts.", module, "muscles"))
    # Plexus, nerfs, vaisseaux
    plexus_pts = [(-0.82, -0.02, 1.90), (-0.45, -0.04, 1.72), (-0.10, -0.04, 1.45), (0.02, -0.05, 0.70), (-0.10, -0.06, -0.55)]
    objs.append(add_curve_tube("NERVE_plexus_brachial_nerf_median", plexus_pts, 0.022, MATS["nerve"], "Plexus brachial / nerf médian", "NERVE", "Plexus brachial puis nerf médian descendant vers la main.", module, "nerfs"))
    objs.append(add_curve_tube("NERVE_nerf_radial", [(-0.52, 0.05, 1.65), (0.22, 0.10, 1.05), (0.32, 0.10, 0.15), (0.20, 0.06, -0.65)], 0.020, MATS["nerve"], "Nerf radial", "NERVE", "Nerf postérieur du membre supérieur, proche de l’humérus puis avant-bras postérieur.", module, "nerfs"))
    objs.append(add_curve_tube("NERVE_nerf_ulnaire", [(-0.45, -0.02, 1.63), (0.14, -0.06, 0.55), (0.16, -0.08, -0.72), (0.20, -0.08, -1.20)], 0.020, MATS["nerve"], "Nerf ulnaire", "NERVE", "Nerf médial descendant vers le bord ulnaire de la main.", module, "nerfs"))
    art_pts = [(-0.72, -0.08, 1.92), (-0.32, -0.08, 1.65), (0.05, -0.10, 0.80), (0.03, -0.10, 0.18), (-0.18, -0.10, -0.80)]
    objs.append(add_curve_tube("VESSEL_artere_subclaviere_axillaire_brachiale", art_pts, 0.030, MATS["artery"], "Axe artériel du membre supérieur", "VESSEL_ARTERY", "Sous-clavière, axillaire puis brachiale/humérale avec branches distales.", module, "vaisseaux"))
    objs.append(add_curve_tube("VESSEL_veine_cephalique", [(-0.10, -0.22, -0.8), (-0.30, -0.20, 0.05), (-0.42, -0.18, 0.9), (-0.65, -0.16, 1.55)], 0.024, MATS["vein"], "Veine céphalique", "VESSEL_VEIN", "Veine superficielle latérale du membre supérieur.", module, "vaisseaux"))
    objs += animate_flow_particles("FLOW_art_membre_sup", art_pts, 6, 0.028, MATS["artery"], module, desc="Flux artériel du membre supérieur.")
    add_label("LABEL_membre_sup", "Membre supérieur", (0, -0.72, 2.35), 0.13, True, module)
    add_label("LABEL_plexus", "Plexus brachial", (-0.72, -0.62, 1.75), 0.11, True, module)
    add_label("LABEL_main", "Main", (0, -0.62, -1.45), 0.12, True, module)
    animate_assembly(objs, strength=0.75, start=1, end=62)
    return module


def build_membre_inferieur_premium():
    module = "membre_inferieur_premium"
    setup_scene("Membre inférieur — atlas 3D premium", camera_loc=(5, -8, 4.5), camera_target=(0, 0, 0.15), ortho_scale=6.2)
    objs = []
    # Squelette
    objs.append(add_torus("BONE_bassin_os_coxal", (0, 0, 2.0), 0.75, 0.035, MATS["bone"], "Bassin", "BONE", "Os coxal et repère de la région inguino-fémorale et fessière.", module, "squelette", rotation=(math.radians(90), 0, 0)))
    objs.append(add_cylinder_between("BONE_femur", (0.22, 0.02, 1.55), (0.05, 0.02, 0.15), 0.065, MATS["bone"], "Fémur", "BONE", "Os de la cuisse avec col, condyles et rapports aux loges musculaires.", module, "squelette"))
    objs.append(add_cylinder_between("BONE_tibia", (0.02, 0.02, 0.05), (0.02, 0.02, -1.15), 0.055, MATS["bone"], "Tibia", "BONE", "Os médial de la jambe.", module, "squelette"))
    objs.append(add_cylinder_between("BONE_fibula_perone", (0.28, 0.02, 0.02), (0.32, 0.02, -1.12), 0.032, MATS["bone"], "Fibula", "BONE", "Os latéral de la jambe, ancien péroné.", module, "squelette"))
    for i, x in enumerate([-0.26, -0.12, 0.02, 0.16, 0.30]):
        objs.append(add_cylinder_between(f"BONE_metatarsien_{i+1}", (x, -0.10, -1.28), (x, -0.65, -1.45), 0.018, MATS["bone"], "Métatarsien", "BONE", "Os du pied antérieur.", module, "pied"))
        objs.append(add_cylinder_between(f"BONE_phalanges_pied_{i+1}", (x, -0.65, -1.45), (x, -0.96, -1.52), 0.012, MATS["bone"], "Phalanges du pied", "BONE", "Os des orteils.", module, "pied"))
    objs.append(add_ellipsoid("BONE_patella_rotule", (0.05, -0.05, 0.16), (0.12, 0.05, 0.16), MATS["bone"], "Patella", "BONE", "Rotule en avant du genou.", module, "squelette", 0))
    # Muscles
    objs.append(add_curve_tube("MUSCLE_quadriceps_droit_femoral", [(0.10, -0.16, 1.48), (0.08, -0.18, 0.82), (0.05, -0.15, 0.20)], 0.075, MATS["muscle"], "Quadriceps", "MUSCLE", "Loge antérieure de la cuisse, extension du genou.", module, "cuisse antérieure"))
    objs.append(add_curve_tube("MUSCLE_sartorius", [(-0.62, -0.16, 1.70), (-0.15, -0.18, 0.80), (0.32, -0.16, 0.05)], 0.035, MATS["tendon"], "Sartorius", "MUSCLE", "Muscle long oblique de la région antérieure de cuisse.", module, "cuisse antérieure"))
    objs.append(add_curve_tube("MUSCLE_adducteurs", [(-0.10, -0.12, 1.25), (-0.18, -0.12, 0.65), (-0.10, -0.12, 0.12)], 0.07, MATS["muscle_dark"], "Adducteurs", "MUSCLE", "Loge médiale obturatrice : muscles adducteurs de la cuisse.", module, "région obturatrice"))
    objs.append(add_ellipsoid("MUSCLE_grand_fessier", (-0.45, 0.18, 1.75), (0.50, 0.18, 0.35), MATS["muscle"], "Grand fessier", "MUSCLE", "Plan superficiel de la région fessière.", module, "région fessière", 1))
    objs.append(add_curve_tube("MUSCLE_ischio_jambiers", [(0.00, 0.18, 1.35), (-0.02, 0.16, 0.70), (0.03, 0.14, 0.08)], 0.060, MATS["muscle_dark"], "Ischio-jambiers", "MUSCLE", "Loge postérieure de la cuisse, flexion du genou.", module, "cuisse postérieure"))
    objs.append(add_curve_tube("MUSCLE_gastrocnemien_jumeaux", [(0.02, 0.12, 0.02), (0.00, 0.12, -0.55), (-0.05, 0.10, -1.08)], 0.070, MATS["muscle"], "Jumeaux / gastrocnémien", "MUSCLE", "Plan superficiel postérieur de la jambe.", module, "jambe postérieure"))
    objs.append(add_box("APONEUROSIS_plantaire", (0.02, -0.55, -1.37), (0.34, 0.24, 0.025), MATS["tendon"], "Aponévrose plantaire", "FASCIA", "Plan aponévrotique de la plante du pied.", module, "plante du pied"))
    objs.append(add_curve_tube("MUSCLE_plante_moyen_et_profond", [(-0.20, -0.56, -1.34), (0.00, -0.70, -1.43), (0.25, -0.58, -1.36)], 0.035, MATS["muscle"], "Muscles plantaires", "MUSCLE", "Plans musculaires superficiel, moyen et profond de la plante du pied.", module, "plante du pied"))
    # Nerfs et vaisseaux
    objs.append(add_curve_tube("NERVE_plexus_lombo_sacre_sciatique", [(-0.45, 0.12, 2.15), (-0.65, 0.15, 1.72), (-0.20, 0.18, 1.18), (0.08, 0.16, 0.20), (0.22, 0.12, -1.15)], 0.025, MATS["nerve"], "Plexus lombo-sacré / nerf sciatique", "NERVE", "Racines lombo-sacrées puis nerf sciatique descendant en arrière de la cuisse.", module, "innervation"))
    art_pts = [(0.0, -0.10, 2.15), (0.18, -0.12, 1.45), (0.05, -0.12, 0.35), (0.02, -0.12, -0.35), (0.18, -0.35, -1.28)]
    objs.append(add_curve_tube("VESSEL_artere_iliaque_femorale_poplitee_tibiale", art_pts, 0.030, MATS["artery"], "Axe artériel inférieur", "VESSEL_ARTERY", "Iliaque externe, fémorale, poplitée puis tibiale/plantaire stylisées.", module, "vascularisation"))
    objs.append(add_curve_tube("VESSEL_grande_saphene", [(-0.18, -0.22, -1.20), (-0.30, -0.20, -0.28), (-0.28, -0.18, 0.78), (-0.22, -0.16, 1.45)], 0.023, MATS["vein"], "Grande veine saphène", "VESSEL_VEIN", "Veine superficielle médiale du membre inférieur.", module, "vascularisation"))
    objs += animate_flow_particles("FLOW_art_membre_inf", art_pts, 8, 0.030, MATS["artery"], module, desc="Flux artériel du membre inférieur.")
    add_label("LABEL_membre_inf", "Membre inférieur", (0, -0.95, 2.65), 0.13, True, module)
    add_label("LABEL_quadriceps", "Quadriceps", (0.68, -0.72, 0.95), 0.11, True, module)
    add_label("LABEL_sciatique", "Nerf sciatique", (-0.80, -0.65, 1.25), 0.11, True, module)
    add_label("LABEL_pied", "Pied / plante", (0.10, -1.12, -1.45), 0.11, True, module)
    animate_assembly(objs, strength=0.80, start=1, end=62)
    return module

# =========================
# RADIOLOGIE / RADIOBIOLOGIE
# =========================

def build_radiologie_rx_premium():
    module = "radiologie_rx_premium"
    setup_scene("Rayons X et radiologie — tube, faisceau et image", camera_loc=(5.5, -7.5, 4.4), camera_target=(0.2, 0, 0.7), ortho_scale=6.0)
    objs = []
    # Tube de Coolidge
    objs.append(add_cylinder_between("DEVICE_tube_coolidge_ampoule_verre", (-1.8, 0, 0.7), (1.45, 0, 0.7), 0.42, MATS["glass"], "Tube de Coolidge", "DEVICE", "Ampoule sous vide contenant cathode, filament et anode.", module, "tube RX", vertices=64))
    objs.append(add_torus("DEVICE_cathode_coupelle", (-1.40, 0, 0.70), 0.23, 0.018, MATS["metal"], "Cathode", "DEVICE", "Coupelle cathodique focalisant les électrons issus du filament chauffé.", module, "production"))
    filament = add_torus("DEVICE_filament_tungstene_chauffe", (-1.48, 0, 0.70), 0.12, 0.012, MATS["orange"], "Filament chauffé", "DEVICE", "Filament de tungstène : émission thermo-ionique des électrons.", module, "production", rotation=(0, math.radians(90), 0))
    objs.append(filament)
    anode = add_cylinder_between("DEVICE_anode_tungstene_cible_inclinee", (0.85, -0.28, 0.55), (1.18, 0.28, 0.92), 0.16, MATS["tungsten"], "Anode en tungstène", "DEVICE", "Cible métallique portée à forte tension positive ; lieu de décélération des électrons.", module, "production", vertices=48)
    objs.append(anode)
    objs.append(add_torus("DEVICE_anode_tournante_rotation", (1.03, 0, 0.74), 0.28, 0.025, MATS["copper"], "Anode tournante", "DEVICE", "Anode tournante répartissant l’échauffement du foyer.", module, "refroidissement", rotation=(0, math.radians(60), 0)))
    objs.append(add_ellipsoid("INFO_foyer_thermique_anode", (0.98, -0.05, 0.76), (0.08, 0.04, 0.08), MATS["orange"], "Foyer thermique", "INFO", "Zone d’impact : chaleur majoritaire et photons X produits.", module, "production", 0))
    # Electrons
    electron_path = [(-1.34, 0, 0.70), (-0.75, 0.02, 0.70), (-0.10, -0.02, 0.71), (0.62, 0.00, 0.74), (0.95, -0.04, 0.76)]
    objs.append(add_curve_tube("FLOW_trajectoire_electrons", electron_path, 0.010, MATS["electron"], "Trajectoire des électrons", "FLOW", "Électrons accélérés dans le vide entre cathode et anode.", module, "production"))
    objs += animate_flow_particles("FLOW_electron_accelere", electron_path, 10, 0.035, MATS["electron"], module, desc="Électron accéléré par la haute tension vers l’anode.", start=40, end=110, stagger=4)
    # Rayons X sortants et filtre
    objs.append(add_box("DEVICE_filtre_aluminium", (1.72, -0.02, 0.52), (0.035, 0.48, 0.55), MATS["metal"], "Filtre aluminium", "DEVICE", "Filtre absorbant préférentiellement les photons de basse énergie.", module, "filtration"))
    objs.append(add_box("DEVICE_collimateur_plomb", (1.92, -0.02, 0.52), (0.07, 0.58, 0.62), MATS["black"], "Collimateur", "DEVICE", "Diaphragme/collimateur limitant le champ du faisceau utile.", module, "focalisation"))
    cone = add_cone("FLOW_faisceau_rayons_X_utiles", (2.62, 0, 0.25), 0.62, 0.08, 1.65, MATS["xray"], "Faisceau de rayons X", "FLOW", "Faisceau utile après filtration et collimation.", module, "faisceau", rotation=(0, math.radians(90), 0))
    objs.append(cone)
    objs.append(add_ellipsoid("BODY_patient_coupe_radiologique", (3.65, 0, 0.25), (0.38, 0.28, 0.80), MATS["skin"], "Patient / tissus traversés", "BODY", "Zone anatomique traversée par le faisceau ; atténuation dépendant de l’épaisseur, densité et numéro atomique.", module, "atténuation", 0))
    objs.append(add_cylinder_between("BONE_os_absorbeur_rx", (3.65, 0.05, -0.28), (3.65, 0.05, 0.78), 0.075, MATS["bone"], "Os dense", "BONE", "Structure très dense, fortement atténuante : apparaît claire en radiographie.", module, "atténuation"))
    objs.append(add_box("DEVICE_detecteur_radiologique", (4.35, 0, 0.25), (0.05, 0.80, 0.95), MATS["panel"], "Détecteur radiologique", "DEVICE", "Récepteur transformant l’image radiante en image visible ou numérique.", module, "image"))
    for i, z in enumerate([-0.35, -0.10, 0.15, 0.40, 0.65]):
        mat = MATS["white"] if i in [1, 2] else MATS["gray"]
        objs.append(add_box(f"INFO_pixel_radiographique_{i}", (4.28, -0.46 + i*0.22, z), (0.012, 0.075, 0.075), mat, "Pixel image", "INFO", "Échantillon de l’image radiologique numérique en niveaux de gris.", module, "image"))
    # Mécanismes atome
    objs.append(add_ellipsoid("ATOM_noyau_tungstene_bremsstrahlung", (-0.45, 1.15, 0.55), (0.12, 0.12, 0.12), MATS["tungsten"], "Noyau tungstène", "ATOM", "Noyau atomique responsable de la déviation/décélération de l’électron : Bremsstrahlung.", module, "Bremsstrahlung", 0))
    objs.append(add_curve_tube("FLOW_electron_deviation_bremsstrahlung", [(-0.95, 1.05, 0.52), (-0.62, 1.12, 0.57), (-0.30, 1.30, 0.68)], 0.014, MATS["electron"], "Électron freiné", "FLOW", "Électron ralenti par le champ du noyau, émission d’un photon X de freinage.", module, "Bremsstrahlung"))
    objs.append(add_curve_tube("FLOW_photon_X_freinage", [(-0.50, 1.18, 0.62), (-0.05, 1.55, 0.90)], 0.018, MATS["xray"], "Photon X de freinage", "FLOW", "Photon émis lors de la décélération de l’électron incident.", module, "Bremsstrahlung"))
    objs.append(add_torus("ATOM_couche_K_fluorescence", (0.45, 1.15, 0.55), 0.18, 0.006, MATS["xray"], "Couche K", "ATOM", "Couche électronique interne avec lacune après expulsion d’un électron.", module, "fluorescence"))
    objs.append(add_torus("ATOM_couche_L_fluorescence", (0.45, 1.15, 0.55), 0.32, 0.006, MATS["electron"], "Couche L", "ATOM", "Couche plus périphérique ; transition vers K émet une raie Kα.", module, "fluorescence"))
    objs.append(add_curve_tube("FLOW_photon_Kalpha", [(0.55, 1.22, 0.55), (0.92, 1.55, 0.78)], 0.018, MATS["xray"], "Raie Kα", "FLOW", "Photon X caractéristique issu d’une transition vers la couche K.", module, "fluorescence"))
    animate_scale_pulse(filament, frames=(25, 45, 65), scale_factor=1.18)
    animate_scale_pulse(anode, frames=(80, 100, 120), scale_factor=1.05)
    add_label("LABEL_tube_rx", "Tube de Coolidge", (-0.45, -0.74, 1.35), 0.12, True, module)
    add_label("LABEL_electrons", "Électrons accélérés", (-0.55, -0.62, 0.35), 0.105, True, module)
    add_label("LABEL_rayons_x", "Rayons X utiles", (2.65, -0.80, 0.85), 0.12, True, module)
    add_label("LABEL_detecteur", "Détecteur", (4.35, -0.92, 1.18), 0.11, True, module)
    animate_assembly(objs, strength=0.65, start=1, end=58)
    return module


def build_radiobiologie_premium():
    module = "radiobiologie_premium"
    setup_scene("Radiobiologie — cellule, ADN et lésions", camera_loc=(5.2, -7.2, 4.0), camera_target=(0, 0, 0.7), ortho_scale=5.7)
    objs = []
    # Cellule/noyau/ADN
    cell = add_ellipsoid("CELL_cellule_eucaryote_translucide", (0, 0, 0.5), (1.25, 0.95, 1.05), MATS["cell"], "Cellule irradiée", "CELL", "Cellule exposée aux rayonnements ionisants : membrane, cytoplasme, noyau et ADN.", module, "cellule", 1)
    objs.append(cell)
    nucleus = add_ellipsoid("CELL_noyau", (0.15, 0.02, 0.58), (0.55, 0.42, 0.48), MATS["nucleus"], "Noyau", "CELL", "Compartiment nucléaire contenant l’ADN, cible critique des rayonnements ionisants.", module, "noyau", 1)
    objs.append(nucleus)
    objs += add_dna_helix("MOLECULE_ADN_double_helice", center=(0.18, 0.02, 0.58), height=0.95, radius=0.16, turns=2.8, module=module)
    # Organites et membrane
    for i, loc in enumerate([(-0.55, -0.10, 0.75), (-0.32, 0.24, 0.15), (0.58, -0.18, 0.25)]):
        objs.append(add_ellipsoid(f"CELL_mitochondrie_{i+1}", loc, (0.16, 0.08, 0.06), MATS["orange"], "Mitochondrie", "CELL", "Organite cytoplasmique pouvant subir des lésions moléculaires.", module, "cytoplasme", 0))
    # Tracks irradiation
    alpha_path = [(-2.2, -0.05, 1.25), (-1.2, -0.02, 1.10), (-0.30, 0.02, 0.95)]
    beta_path = [(-2.2, 0.25, 0.65), (-1.10, 0.30, 0.58), (0.05, 0.10, 0.55)]
    gamma_path = [(-2.2, -0.35, -0.15), (-1.15, -0.20, 0.05), (0.30, -0.02, 0.32), (1.35, 0.05, 0.45)]
    objs.append(add_curve_tube("RADIATION_alpha_TLE_eleve", alpha_path, 0.026, MATS["radiation"], "Particule α : TLE élevé", "RADIATION", "Rayonnement fortement ionisant, peu pénétrant, forte densité d’ionisations.", module, "interaction physique"))
    objs.append(add_curve_tube("RADIATION_beta", beta_path, 0.018, MATS["electron"], "Rayonnement β", "RADIATION", "Particule chargée intermédiaire : ionisations le long de la trajectoire.", module, "interaction physique"))
    objs.append(add_curve_tube("RADIATION_X_gamma_TLE_faible", gamma_path, 0.018, MATS["xray"], "Rayons X/γ : TLE faible", "RADIATION", "Rayonnements pénétrants, faiblement ionisants relativement au TLE élevé.", module, "interaction physique"))
    # Radicaux libres
    for i, loc in enumerate([(-0.32, -0.10, 0.55), (-0.05, 0.18, 0.78), (0.42, -0.20, 0.85), (0.55, 0.18, 0.45)]):
        objs.append(add_ellipsoid(f"MOLECULE_radical_libre_OH_{i+1}", loc, (0.055, 0.055, 0.055), MATS["acid"], "Radical libre", "MOLECULE", "Radical libre très réactif issu de la radiolyse de l’eau, responsable d’effets indirects.", module, "réactions physico-chimiques", 0))
    # DNA lesions
    objs.append(add_ellipsoid("LESION_ADN_cassure_simple_brin", (0.05, -0.18, 0.72), (0.05, 0.05, 0.05), MATS["acid"], "Cassure simple brin", "LESION", "Rupture d’un seul brin d’ADN, souvent réparable.", module, "lésions moléculaires", 0))
    objs.append(add_ellipsoid("LESION_ADN_double_brin", (0.31, 0.16, 0.43), (0.07, 0.07, 0.07), MATS["acid"], "Cassure double brin", "LESION", "Cassure simultanée des deux brins d’ADN, lésion critique.", module, "lésions moléculaires", 0))
    objs.append(add_curve_tube("LESION_ADN_pontage", [(0.00, 0.05, 0.40), (0.10, 0.10, 0.48), (0.23, 0.03, 0.52)], 0.018, MATS["acid"], "Pontage ADN", "LESION", "Pontage intra/interbrin ou ADN-protéine altérant la réplication/transcription.", module, "lésions moléculaires"))
    objs += animate_flow_particles("FLOW_photon_ionisant", gamma_path, 6, 0.032, MATS["xray"], module, category="RADIATION", desc="Photon ionisant traversant la cellule.", start=35, end=110, stagger=5)
    animate_scale_pulse(cell, frames=(100, 120, 140), scale_factor=1.04)
    add_label("LABEL_cellule", "Cellule", (0, -1.1, 1.72), 0.13, True, module)
    add_label("LABEL_adn", "ADN : cible critique", (0.78, -0.80, 0.75), 0.11, True, module)
    add_label("LABEL_radical", "Radicaux libres", (-1.05, -0.90, 0.30), 0.11, True, module)
    animate_assembly(objs, strength=0.75, start=1, end=62)
    return module

# =========================
# BIOPHYSIQUE / CHIMIE / PHYSIO
# =========================

def build_circulation_premium():
    module = "circulation_premium"
    setup_scene("Biophysique de la circulation — pression, débit, sténose", camera_loc=(5, -7, 4.4), camera_target=(0, 0, 0.6), ortho_scale=6.0)
    objs = []
    # Coeur stylisé
    objs.append(add_ellipsoid("ORGAN_coeur_pompe_gauche", (-1.55, 0, 0.80), (0.30, 0.22, 0.42), MATS["organ_liver"], "Cœur — pompe", "ORGAN", "Pompe cardiaque générant pression et débit dans le réseau artériel.", module, "biophysique cardiaque", 1))
    objs.append(add_ellipsoid("ORGAN_coeur_pompe_droite", (-1.25, 0.04, 0.72), (0.26, 0.20, 0.36), MATS["muscle"], "Cœur — cavités", "ORGAN", "Partie droite stylisée ; circulation veineuse vers pulmonaire.", module, "biophysique cardiaque", 1))
    # Vaisseau normal/stenose
    vessel_pts = [(-1.0, 0, 0.65), (-0.4, 0, 0.65), (0.15, 0, 0.65), (0.58, 0, 0.65), (1.20, 0, 0.65)]
    objs.append(add_curve_tube("VESSEL_artere_ecoulement_normal", vessel_pts[:3], 0.09, MATS["artery"], "Artère normale", "VESSEL_ARTERY", "Segment vasculaire : débit = section × vitesse en régime stationnaire.", module, "débit"))
    objs.append(add_curve_tube("VESSEL_artere_stenose", [(0.15, 0, 0.65), (0.45, 0, 0.65), (0.58, 0, 0.65), (1.20, 0, 0.65)], 0.055, MATS["artery"], "Sténose", "VESSEL_ARTERY", "Rétrécissement : la section diminue, la vitesse augmente par conservation du débit.", module, "continuité"))
    # Particules vitesse
    objs += animate_flow_particles("FLOW_hematies_vitesse_lente", vessel_pts[:3], 5, 0.035, MATS["organ_liver"], module, category="FLOW", desc="Globules rouges en écoulement laminaire dans une section large.", start=40, end=135, stagger=5)
    objs += animate_flow_particles("FLOW_hematies_vitesse_rapide", vessel_pts[2:], 8, 0.030, MATS["orange"], module, category="FLOW", desc="Accélération du flux au niveau de la sténose.", start=55, end=125, stagger=3)
    # Pression hydrostatique / manomètre
    objs.append(add_box("DEVICE_reservoir_fluide_pascal", (2.35, 0, 0.50), (0.46, 0.30, 0.75), MATS["water"], "Réservoir de fluide", "DEVICE", "Pression hydrostatique augmentant avec la profondeur : ΔP = ρgh.", module, "statique des fluides"))
    objs.append(add_cylinder_between("DEVICE_manometre_eau_colonne_A", (2.85, 0, -0.20), (2.85, 0, 1.25), 0.025, MATS["glass"], "Manomètre", "DEVICE", "Colonne de liquide utilisée pour mesurer une pression.", module, "pressions"))
    objs.append(add_cylinder_between("DEVICE_colonne_eau_manometre", (2.85, 0, -0.18), (2.85, 0, 0.75), 0.018, MATS["water"], "Colonne d’eau", "DEVICE", "Hauteur de colonne proportionnelle à la pression mesurée.", module, "pressions"))
    # Pressions physiologiques
    objs.append(add_box("INFO_barre_PA_systole", (-2.35, -0.05, 1.20), (0.08, 0.08, 0.75), MATS["artery"], "PA systolique", "INFO", "Pression artérielle maximale pendant la systole.", module, "pressions physiologiques"))
    objs.append(add_box("INFO_barre_PA_diastole", (-2.12, -0.05, 0.88), (0.08, 0.08, 0.42), MATS["vein"], "PA diastolique", "INFO", "Pression artérielle minimale pendant la diastole.", module, "pressions physiologiques"))
    objs.append(add_curve_tube("FLOW_onde_pulsatile", [(-1.0, -0.14, 0.95), (-0.75, -0.14, 1.08), (-0.50, -0.14, 0.84), (-0.25, -0.14, 1.04), (0.00, -0.14, 0.90)], 0.014, MATS["xray"], "Onde pulsatile", "FLOW", "Variation temporelle de la pression dans un vaisseau élastique.", module, "hémodynamique"))
    add_label("LABEL_circulation", "Pression - débit - sténose", (0, -0.85, 1.85), 0.12, True, module)
    add_label("LABEL_stenose", "Sténose : vitesse ↑", (0.62, -0.62, 0.98), 0.105, True, module)
    add_label("LABEL_manometre", "Manomètre", (2.72, -0.62, 1.35), 0.105, True, module)
    animate_assembly(objs, strength=0.7, start=1, end=62)
    return module


def build_acide_base_premium():
    module = "acide_base_premium"
    setup_scene("Propriétés acido-basiques — pH, couples, tampon", camera_loc=(5, -7, 4.2), camera_target=(0, 0, 0.5), ortho_scale=6.1)
    objs = []
    # pH scale
    for i in range(15):
        mat = MATS["acid"] if i < 7 else (MATS["base"] if i > 7 else MATS["green"])
        objs.append(add_box(f"INFO_echelle_pH_{i}", (-2.8 + i*0.4, 0, -0.65), (0.18, 0.035, 0.09), mat, f"pH {i}", "INFO", "Échelle pH de l’acide au basique.", module, "pH"))
        if i in [0, 7, 14]:
            add_label(f"LABEL_pH_{i}", f"pH {i}", (-2.8 + i*0.4, -0.42, -0.46), 0.08, True, module)
    # Blood drops
    objs.append(add_ellipsoid("BIO_sang_arteriel_pH_7_39", (-0.65, -0.05, 1.05), (0.28, 0.18, 0.36), MATS["artery"], "Sang artériel pH ~7,39", "BIOCHEM", "Sang artériel légèrement basique, proche de 7,40.", module, "pH sanguin", 1))
    objs.append(add_ellipsoid("BIO_sang_veineux_pH_7_36", (0.05, -0.05, 1.00), (0.28, 0.18, 0.34), MATS["vein"], "Sang veineux pH ~7,36", "BIOCHEM", "Sang veineux légèrement moins basique, lié au CO₂ dissous.", module, "pH sanguin", 1))
    # Molecules buffer
    objs.append(add_ellipsoid("MOLECULE_CO2_dissous", (1.00, 0.0, 1.15), (0.12, 0.12, 0.12), MATS["gray"], "CO₂ dissous", "MOLECULE", "Composant du système tampon bicarbonate/acide carbonique.", module, "tampon"))
    objs.append(add_ellipsoid("MOLECULE_HCO3_bicarbonate", (1.60, 0.0, 1.15), (0.16, 0.12, 0.12), MATS["base"], "HCO₃⁻", "MOLECULE", "Ion hydrogénocarbonate, base conjuguée du système tampon.", module, "tampon"))
    objs.append(add_ellipsoid("MOLECULE_H_plus_proton", (1.32, 0.0, 0.80), (0.055, 0.055, 0.055), MATS["acid"], "H⁺", "MOLECULE", "Proton transféré dans une réaction acide-base de Brønsted.", module, "couples acide-base"))
    objs.append(add_curve_tube("FLOW_transfert_proton_acide_base", [(1.10, 0, 0.80), (1.35, 0.04, 0.90), (1.58, 0.0, 1.08)], 0.014, MATS["xray"], "Transfert de proton", "FLOW", "Réaction acido-basique : transfert d’un proton d’un acide vers une base.", module, "réactions"))
    # Titration/Davenport plane stylized
    objs.append(add_box("INFO_plan_Davenport", (-1.35, 0.12, 0.35), (0.58, 0.035, 0.42), MATS["panel"], "Diagramme de Davenport", "INFO", "Plan conceptuel des troubles acido-basiques : pH, bicarbonate et PCO₂.", module, "Davenport"))
    objs.append(add_curve_tube("INFO_courbe_tampon", [(-1.85, 0.08, 0.15), (-1.55, 0.08, 0.45), (-1.15, 0.08, 0.55), (-0.85, 0.08, 0.70)], 0.014, MATS["green"], "Courbe tampon", "INFO", "Zone tampon où le pH varie peu malgré ajout d’acide/base.", module, "tampons"))
    objs += animate_flow_particles("FLOW_proton", [(1.10, 0, 0.80), (1.58, 0, 1.08)], 5, 0.04, MATS["acid"], module, category="FLOW", desc="Transfert de protons H+ entre deux espèces chimiques.", start=40, end=118, stagger=8)
    add_label("LABEL_acide_base", "pH sanguin et tampon bicarbonate", (0, -0.70, 1.75), 0.12, True, module)
    add_label("LABEL_tampon", "CO₂ / HCO₃⁻", (1.34, -0.58, 1.42), 0.11, True, module)
    animate_assembly(objs, strength=0.7, start=1, end=62)
    return module


def build_transports_membranaires_premium():
    module = "transports_membranaires_premium"
    setup_scene("Transports transmembranaires — diffusion, osmose, canaux", camera_loc=(5, -7, 4.3), camera_target=(0, 0, 0.5), ortho_scale=5.6)
    objs = []
    # Membrane bilayer
    for side_z in [-0.08, 0.08]:
        for i in range(22):
            x = -1.9 + i * 0.18
            objs.append(add_ellipsoid(f"MEMBRANE_tete_phospholipide_{side_z}_{i}", (x, 0, 0.45 + side_z), (0.045, 0.045, 0.045), MATS["membrane"], "Tête phospholipidique", "MEMBRANE", "Tête hydrophile de phospholipide.", module, "bicouche", 0))
            objs.append(add_cylinder_between(f"MEMBRANE_queue_lipidique_{side_z}_{i}", (x, 0, 0.45 + side_z), (x, 0, 0.45 - side_z*0.5), 0.010, MATS["membrane"], "Queue lipidique", "MEMBRANE", "Queue hydrophobe de phospholipide.", module, "bicouche", vertices=8))
    # Proteins/canaux
    objs.append(add_cylinder_between("PROTEIN_canal_ionique", (-0.55, 0, 0.28), (-0.55, 0, 0.66), 0.10, MATS["protein"], "Canal ionique", "PROTEIN", "Protéine transmembranaire permettant le passage sélectif d’ions.", module, "transport facilité", vertices=48))
    objs.append(add_torus("PROTEIN_pompe_NaK_ATPase", (0.55, 0, 0.48), 0.16, 0.045, MATS["protein"], "Pompe Na⁺/K⁺ ATPase", "PROTEIN", "Transport actif consommant de l’ATP pour déplacer Na+ et K+ contre leurs gradients.", module, "transport actif", rotation=(math.radians(90), 0, 0)))
    # Concentration gradient left/right
    for i in range(18):
        x = -1.7 + (i % 6) * 0.13
        z = 0.95 + (i // 6) * 0.13
        objs.append(add_particle(f"ION_zone_concentree_{i}", (x, -0.05, z), 0.035, MATS["na"], "Soluté concentré", "ION", "Particule diffusante du côté à forte concentration.", module, "diffusion"))
    for i in range(6):
        x = 1.1 + (i % 3) * 0.16
        z = 1.00 + (i // 3) * 0.15
        objs.append(add_particle(f"ION_zone_diluee_{i}", (x, -0.05, z), 0.035, MATS["na"], "Soluté dilué", "ION", "Côté moins concentré recevant les particules par diffusion.", module, "diffusion"))
    diffusion_path = [(-1.0, 0.05, 1.12), (-0.55, 0.02, 0.62), (0.1, 0.02, 0.86), (0.9, 0.02, 1.05)]
    objs.append(add_curve_tube("FLOW_flux_diffusion_Fick", diffusion_path, 0.015, MATS["xray"], "Flux diffusif", "FLOW", "Flux selon la loi de Fick : déplacement des zones concentrées vers les zones moins concentrées.", module, "diffusion"))
    objs += animate_flow_particles("FLOW_diffusion_particule", diffusion_path, 7, 0.030, MATS["na"], module, category="FLOW", desc="Particule traversant la membrane selon son gradient.", start=35, end=140, stagger=6)
    # Osmose water
    water_path = [(1.45, -0.08, 0.05), (0.75, -0.08, 0.20), (0.20, -0.08, 0.35), (-0.40, -0.08, 0.70)]
    objs.append(add_curve_tube("FLOW_osmose_eau", water_path, 0.012, MATS["water"], "Osmose", "FLOW", "Flux d’eau à travers une membrane semi-perméable vers le compartiment plus osmotique.", module, "osmose"))
    objs += animate_flow_particles("FLOW_eau_osmose", water_path, 6, 0.030, MATS["water"], module, category="FLOW", desc="Molécule d’eau traversant la membrane par osmose.", start=45, end=132, stagger=7)
    add_label("LABEL_membrane", "Bicouche lipidique", (0, -0.62, 0.55), 0.12, True, module)
    add_label("LABEL_fick", "Diffusion : J = -D grad C", (-1.10, -0.62, 1.45), 0.10, True, module)
    add_label("LABEL_pompe", "Transport actif", (0.72, -0.62, 0.90), 0.10, True, module)
    animate_assembly(objs, strength=0.6, start=1, end=62)
    return module


def build_compartiments_liquidiens_premium():
    module = "compartiments_liquidiens_premium"
    setup_scene("Compartiments liquidiens — eau totale, plasma, interstitium, cellule", camera_loc=(5, -7, 4.2), camera_target=(0, 0, 0.8), ortho_scale=5.7)
    objs = []
    objs += add_human_silhouette(module, "BODY_silhouette_eau_totale", loc=(-1.8, 0, -0.20), scale=0.95, mat=MATS["skin"])
    # Compartiments
    objs.append(add_ellipsoid("COMPARTMENT_eau_totale_60pc", (-1.80, -0.04, 0.90), (0.58, 0.20, 1.30), MATS["water"], "Eau totale", "COMPARTMENT", "Volume d’eau totale de l’organisme, réparti entre compartiments intracellulaire et extracellulaire.", module, "répartition"))
    objs.append(add_box("COMPARTMENT_intracellulaire", (0.15, 0.0, 0.85), (0.55, 0.28, 0.60), MATS["cell"], "Compartiment intracellulaire", "COMPARTMENT", "Eau contenue à l’intérieur des cellules.", module, "CIC"))
    objs.append(add_box("COMPARTMENT_interstitiel", (1.18, 0.0, 0.85), (0.46, 0.26, 0.60), MATS["water"], "Compartiment interstitiel", "COMPARTMENT", "Partie extracellulaire située entre cellules et capillaires.", module, "CEC"))
    objs.append(add_box("COMPARTMENT_plasmatique", (2.08, 0.0, 0.85), (0.34, 0.22, 0.60), MATS["vein"], "Compartiment plasmatique", "COMPARTMENT", "Volume plasmatique intravasculaire, partie du compartiment extracellulaire.", module, "plasma"))
    # Cell and capillary
    objs.append(add_ellipsoid("CELL_cellule_volume_intracellulaire", (0.15, -0.02, 0.88), (0.33, 0.20, 0.33), MATS["nucleus"], "Cellule", "CELL", "Cellule montrant le compartiment intracellulaire.", module, "CIC", 0))
    cap_pts = [(1.70, -0.03, 0.45), (1.95, -0.05, 0.80), (2.15, -0.03, 1.18)]
    objs.append(add_curve_tube("VESSEL_capillaire_plasma", cap_pts, 0.060, MATS["artery"], "Capillaire / plasma", "VESSEL", "Capillaire sanguin contenant le plasma et les éléments figurés.", module, "plasma"))
    for i, t in enumerate([0.2, 0.45, 0.7]):
        loc = interpolate_polyline(cap_pts, t)
        objs.append(add_particle(f"BLOOD_hematie_suspension_{i}", loc, 0.048, MATS["organ_liver"], "Hématie", "BLOOD", "Élément figuré : le sang est une suspension de cellules dans le plasma.", module, "sang"))
    # Tracers
    objs.append(add_particle("TRACER_albumine_Evans_plasma", (2.25, -0.04, 1.25), 0.055, MATS["green"], "Albumine / bleu Evans", "TRACER", "Traceur du compartiment plasmatique.", module, "traceurs"))
    objs.append(add_particle("TRACER_mannitol_extracellulaire", (1.18, -0.04, 1.45), 0.055, MATS["orange"], "Mannitol", "TRACER", "Traceur du compartiment extracellulaire.", module, "traceurs"))
    objs.append(add_particle("TRACER_eau_lourde_antipyrine_eau_totale", (-1.42, -0.04, 1.55), 0.055, MATS["xray"], "Eau lourde / antipyrine", "TRACER", "Traceur de l’eau totale de l’organisme.", module, "traceurs"))
    # Exchange arrows
    exchange_path = [(0.55, -0.10, 0.85), (0.86, -0.10, 0.85), (1.15, -0.10, 0.85)]
    objs.append(add_curve_tube("FLOW_echange_eau_cellule_interstitium", exchange_path, 0.012, MATS["water"], "Échanges d’eau", "FLOW", "Échanges d’eau entre secteur intracellulaire et interstitiel selon les gradients osmotiques.", module, "échanges"))
    objs += animate_flow_particles("FLOW_eau_compartiments", exchange_path, 6, 0.030, MATS["water"], module, category="FLOW", desc="Flux d’eau entre compartiments.", start=42, end=136, stagger=7)
    add_label("LABEL_compartiments", "Compartiments liquidiens", (0.22, -0.70, 1.75), 0.12, True, module)
    add_label("LABEL_cic", "CIC", (0.15, -0.48, 1.45), 0.12, True, module)
    add_label("LABEL_cec", "Interstitiel + plasma = CEC", (1.60, -0.48, 1.45), 0.10, True, module)
    animate_assembly(objs, strength=0.7, start=1, end=62)
    return module


def build_equilibre_hydrosode_premium():
    module = "equilibre_hydrosode_premium"
    setup_scene("Équilibre hydrosodé — rein, volémie, osmolalité", camera_loc=(5.2, -7.2, 4.2), camera_target=(0, 0, 0.55), ortho_scale=5.8)
    objs = []
    # Kidney and nephron
    kidney = add_ellipsoid("ORGAN_rein_regulation_hydrosodee", (-1.25, 0.0, 0.70), (0.38, 0.20, 0.62), MATS["organ_kidney"], "Rein", "ORGAN", "Effecteur majeur de l’équilibre hydrique et sodé.", module, "rein", 1)
    objs.append(kidney)
    nephron_pts = [(-1.34, -0.05, 1.10), (-1.10, -0.05, 0.85), (-1.45, -0.05, 0.55), (-1.02, -0.05, 0.25), (-1.25, -0.05, -0.05)]
    objs.append(add_curve_tube("ORGAN_nephron_tubule_collecteur", nephron_pts, 0.035, MATS["water"], "Néphron", "ORGAN", "Néphron/tubule collecteur : réabsorption d’eau et de sodium.", module, "rein"))
    # Volémie/osmolality sensors
    objs.append(add_ellipsoid("SENSOR_barorecepteurs_sino_carotidiens", (0.20, -0.02, 1.20), (0.16, 0.10, 0.16), MATS["green"], "Barorécepteurs", "SENSOR", "Capteurs de pression liés à la volémie efficace.", module, "volémie"))
    objs.append(add_ellipsoid("SENSOR_osmorecepteurs_hypothalamiques", (0.20, -0.02, 0.55), (0.16, 0.10, 0.16), MATS["xray"], "Osmorécepteurs", "SENSOR", "Capteurs de l’osmolalité efficace reflétant l’hydratation cellulaire.", module, "osmolalité"))
    # Hormones
    objs.append(add_curve_tube("FLOW_ADH_vers_rein", [(0.25, -0.05, 0.55), (-0.45, -0.05, 0.40), (-1.05, -0.05, 0.20)], 0.020, MATS["xray"], "ADH", "HORMONE", "ADH augmentant la réabsorption d’eau dans le rein.", module, "régulation"))
    objs.append(add_curve_tube("FLOW_aldosterone_vers_rein", [(0.28, -0.05, 1.20), (-0.35, -0.05, 1.05), (-1.00, -0.05, 0.88)], 0.020, MATS["orange"], "Aldostérone", "HORMONE", "Hormone favorisant la réabsorption de sodium.", module, "régulation"))
    # Cell shrink/swell and extracellular volume
    objs.append(add_ellipsoid("CELL_hydratation_cellulaire_normale", (1.05, 0.0, 0.95), (0.24, 0.18, 0.24), MATS["cell"], "Cellule normale", "CELL", "Hydratation cellulaire normale.", module, "tonicité", 0))
    objs.append(add_ellipsoid("CELL_hypertonique_cellule_retractee", (1.55, 0.0, 0.95), (0.16, 0.12, 0.16), MATS["nucleus"], "Hypertonie : cellule rétractée", "CELL", "Osmolalité efficace élevée : sortie d’eau et rétraction cellulaire.", module, "tonicité", 0))
    objs.append(add_ellipsoid("CELL_hypotonique_cellule_gonflee", (2.05, 0.0, 0.95), (0.31, 0.23, 0.31), MATS["water"], "Hypotonie : cellule gonflée", "CELL", "Osmolalité efficace basse : entrée d’eau et gonflement cellulaire.", module, "tonicité", 0))
    # Na and water reabsorption
    reabs_path = [(-1.25, -0.10, 0.05), (-1.60, -0.10, 0.20), (-1.82, -0.10, 0.52)]
    objs.append(add_curve_tube("FLOW_reabsorption_eau_Na", reabs_path, 0.018, MATS["water"], "Réabsorption eau/Na⁺", "FLOW", "Réabsorption tubulaire participant au bilan hydrosodé.", module, "réabsorption"))
    objs += animate_flow_particles("FLOW_eau_reabsorbee", reabs_path, 6, 0.030, MATS["water"], module, category="FLOW", desc="Molécule d’eau réabsorbée par le tubule rénal.", start=50, end=135, stagger=6)
    objs += animate_flow_particles("FLOW_Na_reabsorbe", [(-1.30, -0.05, 0.12), (-1.58, -0.05, 0.35), (-1.78, -0.05, 0.62)], 5, 0.032, MATS["na"], module, category="FLOW", desc="Ion sodium réabsorbé par le rein.", start=60, end=145, stagger=7)
    animate_scale_pulse(kidney, frames=(80, 100, 120), scale_factor=1.04)
    add_label("LABEL_rein", "Rein : effecteur", (-1.25, -0.72, 1.45), 0.12, True, module)
    add_label("LABEL_vol_osm", "Volémie efficace / Osmolalité", (0.60, -0.75, 1.55), 0.10, True, module)
    add_label("LABEL_tonicite", "Tonicité cellulaire", (1.65, -0.72, 1.38), 0.11, True, module)
    animate_assembly(objs, strength=0.7, start=1, end=62)
    return module


def build_oxydoreduction_premium():
    module = "oxydoreduction_premium"
    setup_scene("Oxydo-réduction — pile, électrons, potentiel", camera_loc=(5, -7, 4.2), camera_target=(0, 0, 0.55), ortho_scale=5.7)
    objs = []
    # Beakers/electrodes
    objs.append(add_box("DEVICE_becher_anode", (-1.10, 0, 0.45), (0.45, 0.32, 0.55), MATS["water"], "Demi-pile anode", "DEVICE", "Compartiment où se produit l’oxydation : perte d’électrons.", module, "pile"))
    objs.append(add_box("DEVICE_becher_cathode", (1.10, 0, 0.45), (0.45, 0.32, 0.55), MATS["water"], "Demi-pile cathode", "DEVICE", "Compartiment où se produit la réduction : gain d’électrons.", module, "pile"))
    objs.append(add_cylinder_between("DEVICE_electrode_anode_oxydation", (-1.10, 0, -0.05), (-1.10, 0, 1.15), 0.045, MATS["copper"], "Anode", "ELECTRODE", "Électrode d’oxydation : le réducteur cède des électrons.", module, "oxydation"))
    objs.append(add_cylinder_between("DEVICE_electrode_cathode_reduction", (1.10, 0, -0.05), (1.10, 0, 1.15), 0.045, MATS["metal"], "Cathode", "ELECTRODE", "Électrode de réduction : l’oxydant capte des électrons.", module, "réduction"))
    objs.append(add_curve_tube("DEVICE_pont_salin", [(-1.10, 0.18, 0.95), (-0.30, 0.35, 1.30), (0.30, 0.35, 1.30), (1.10, 0.18, 0.95)], 0.045, MATS["glass"], "Pont salin", "DEVICE", "Pont ionique maintenant l’électroneutralité des deux compartiments.", module, "pile"))
    wire_pts = [(-1.10, 0, 1.18), (-0.80, -0.40, 1.55), (0, -0.52, 1.68), (0.80, -0.40, 1.55), (1.10, 0, 1.18)]
    objs.append(add_curve_tube("DEVICE_fil_externe_electrons", wire_pts, 0.020, MATS["metal"], "Circuit externe", "DEVICE", "Trajet extérieur des électrons de l’anode vers la cathode.", module, "pile"))
    objs.append(add_box("DEVICE_voltmetre_potentiel_E", (0, -0.58, 1.72), (0.28, 0.06, 0.16), MATS["panel"], "Voltmètre E", "DEVICE", "Mesure de la différence de potentiel entre deux couples rédox.", module, "potentiel"))
    # Ions / electrons
    for i in range(6):
        objs.append(add_particle(f"ION_Red_anode_{i}", (-1.25 + 0.08*(i%3), -0.08, 0.25 + 0.12*(i//3)), 0.035, MATS["orange"], "Réducteur", "ION", "Forme réduite cédant des électrons à l’anode.", module, "oxydation"))
        objs.append(add_particle(f"ION_Ox_cathode_{i}", (1.02 + 0.08*(i%3), -0.08, 0.25 + 0.12*(i//3)), 0.035, MATS["na"], "Oxydant", "ION", "Forme oxydée captant des électrons à la cathode.", module, "réduction"))
    objs += animate_flow_particles("FLOW_electron_circuit", wire_pts, 8, 0.030, MATS["electron"], module, category="FLOW", desc="Électron circulant dans le circuit externe.", start=35, end=130, stagger=5)
    objs += animate_flow_particles("FLOW_ion_pont_salin", [(-0.9, 0.18, 1.0), (0, 0.34, 1.25), (0.9, 0.18, 1.0)], 5, 0.025, MATS["green"], module, category="FLOW", desc="Ion migrant dans le pont salin.", start=55, end=140, stagger=8)
    # Nernst formula as 3D label
    add_label("LABEL_redox", "Oxydation = perte e⁻ / Réduction = gain e⁻", (0, -0.86, 0.95), 0.105, True, module)
    add_label("LABEL_nernst", "E = E° + (RT/nF) ln(Ox/Red)", (0, -0.86, 1.35), 0.09, True, module)
    animate_assembly(objs, strength=0.65, start=1, end=62)
    return module


def build_optique_vision_audition_premium():
    module = "optique_vision_audition_premium"
    setup_scene("Biophysique — optique, œil, laser et audition", camera_loc=(5, -7, 4.2), camera_target=(0, 0, 0.55), ortho_scale=6.0)
    objs = []
    # Eye cross-section
    eye = add_ellipsoid("ORGAN_oeil_coupe_transparente", (-1.35, 0, 0.75), (0.70, 0.44, 0.48), MATS["glass"], "Œil en coupe", "ORGAN", "Œil avec cornée, iris, cristallin, humeur vitrée et rétine.", module, "œil", 1)
    objs.append(eye)
    objs.append(add_ellipsoid("ORGAN_cornee", (-2.03, -0.02, 0.75), (0.13, 0.22, 0.27), MATS["glass"], "Cornée", "ORGAN", "Dioptre cornéen antérieur : forte vergence de l’œil.", module, "dioptres", 0))
    objs.append(add_torus("ORGAN_iris_pupille", (-1.78, -0.02, 0.75), 0.18, 0.028, MATS["green"], "Iris / pupille", "ORGAN", "Diaphragme régulant la quantité de lumière traversant la pupille.", module, "œil", rotation=(0, math.radians(90), 0)))
    objs.append(add_ellipsoid("ORGAN_cristallin_lentille_convergente", (-1.48, -0.02, 0.75), (0.13, 0.10, 0.24), MATS["water"], "Cristallin", "ORGAN", "Lentille convergente déformable sous l’action des muscles ciliaires.", module, "accommodation", 0))
    objs.append(add_ellipsoid("ORGAN_retine", (-0.78, -0.02, 0.75), (0.04, 0.30, 0.34), MATS["organ_liver"], "Rétine", "ORGAN", "Plan récepteur où se forme l’image chez l’œil emmétrope.", module, "rétine", 0))
    # Rays
    rays1 = [(-3.0, -0.10, 1.10), (-2.03, -0.05, 0.92), (-1.48, -0.02, 0.82), (-0.80, 0, 0.76)]
    rays2 = [(-3.0, -0.10, 0.42), (-2.03, -0.05, 0.58), (-1.48, -0.02, 0.68), (-0.80, 0, 0.75)]
    objs.append(add_curve_tube("RAY_optique_rayons_convergents_haut", rays1, 0.014, MATS["xray"], "Rayon lumineux", "RAY", "Rayon réfracté par cornée et cristallin vers la rétine.", module, "optique géométrique"))
    objs.append(add_curve_tube("RAY_optique_rayons_convergents_bas", rays2, 0.014, MATS["xray"], "Rayon lumineux", "RAY", "Rayon lumineux convergent vers l’image rétinienne.", module, "optique géométrique"))
    # Corrective lenses
    objs.append(add_ellipsoid("DEVICE_lentille_correctrice_convergente", (0.45, 0, 1.05), (0.08, 0.42, 0.42), MATS["glass"], "Lentille convergente", "DEVICE", "Correction d’un défaut optique par ajout de vergence positive.", module, "amétropies", 0))
    objs.append(add_ellipsoid("DEVICE_lentille_correctrice_divergente", (0.45, 0, 0.25), (0.04, 0.42, 0.42), MATS["glass"], "Lentille divergente", "DEVICE", "Correction d’un défaut optique par vergence négative.", module, "amétropies", 0))
    # Laser medical
    objs.append(add_box("DEVICE_laser_medical_source", (1.55, 0, 1.15), (0.22, 0.12, 0.12), MATS["metal"], "Source laser", "DEVICE", "Source cohérente et directionnelle utilisée en applications médicales.", module, "laser"))
    objs.append(add_curve_tube("RAY_faisceau_laser_medical", [(1.75, 0, 1.15), (2.45, 0, 1.15), (2.85, 0, 1.05)], 0.020, MATS["radiation"], "Faisceau laser", "RAY", "Faisceau laser focalisé sur une cible biologique.", module, "laser"))
    objs.append(add_ellipsoid("TISSUE_cible_laser", (2.95, 0, 1.02), (0.16, 0.10, 0.16), MATS["muscle"], "Tissu cible", "TISSUE", "Zone d’interaction laser-tissu.", module, "laser"))
    # Ear cochlea auditory
    cochlea_pts = []
    for i in range(90):
        t = i / 89 * 3.8 * math.pi
        r = 0.38 * (1 - i/110)
        cochlea_pts.append((1.65 + math.cos(t)*r, 0.02 + math.sin(t)*r, -0.30 + 0.004*i))
    objs.append(add_curve_tube("ORGAN_cochlee_spirale", cochlea_pts, 0.035, MATS["organ_stomach"], "Cochlée", "ORGAN", "Organe spiralé de l’audition transformant les vibrations en message sensoriel.", module, "audition"))
    objs.append(add_curve_tube("RAY_onde_sonore", [(0.75, -0.05, -0.55), (1.0, -0.05, -0.38), (1.25, -0.05, -0.55), (1.50, -0.05, -0.38)], 0.014, MATS["xray"], "Onde sonore", "RAY", "Signal physique sonore entrant vers l’oreille.", module, "audition"))
    add_label("LABEL_oeil", "Œil : dioptres + rétine", (-1.42, -0.72, 1.45), 0.11, True, module)
    add_label("LABEL_laser", "Laser médical", (2.05, -0.70, 1.55), 0.11, True, module)
    add_label("LABEL_audition", "Cochlée / audition", (1.65, -0.70, 0.22), 0.11, True, module)
    objs += animate_flow_particles("FLOW_photon_oeil", rays1, 5, 0.025, MATS["xray"], module, category="RAY", desc="Photon lumineux traversant le système optique de l’œil.", start=35, end=120, stagger=6)
    animate_assembly(objs, strength=0.7, start=1, end=62)
    return module

# =========================
# SHS / PSYCHOLOGIE MÉDICALE
# =========================

def build_shs_psy_medicale_premium():
    module = "shs_psy_medicale_premium"
    setup_scene("SHS et psychologie médicale — médecine holistique", camera_loc=(5, -7, 4.2), camera_target=(0, 0, 0.8), ortho_scale=6.0)
    objs = []
    # Patient-praticien
    objs += add_human_silhouette(module, "BODY_patient", loc=(-1.30, 0, -0.15), scale=0.78, mat=MATS["skin"])
    objs += add_human_silhouette(module, "BODY_medecin", loc=(1.30, 0, -0.15), scale=0.78, mat=MATS["glass"])
    objs.append(add_curve_tube("RELATION_medecin_malade_alliance", [(-0.82, -0.05, 1.05), (-0.25, -0.10, 1.20), (0.25, -0.10, 1.20), (0.82, -0.05, 1.05)], 0.028, MATS["green"], "Relation médecin-malade", "RELATION", "Alliance thérapeutique : communication, confiance, écoute et contrat de soins.", module, "relation"))
    # Biopsychosocial rings
    centers = [(0, 0.02, 2.45), (-0.70, 0.02, 2.05), (0.70, 0.02, 2.05), (0, 0.02, 1.72)]
    labels = ["Être humain", "Biologique", "Psychologique", "Social / culturel"]
    mats = [MATS["xray"], MATS["artery"], MATS["radiation"], MATS["green"]]
    for i, (c, lab) in enumerate(zip(centers, labels)):
        objs.append(add_torus(f"INFO_modele_biopsychosocial_{i}", c, 0.28, 0.018, mats[i], lab, "INFO", "Dimension du modèle biopsychosocial de la santé.", module, "biopsychosocial", rotation=(math.radians(90), 0, 0)))
        add_label(f"LABEL_bps_{i}", lab, (c[0], -0.40, c[2]), 0.075, True, module)
    # Hospitalization and reactions
    objs.append(add_box("SCENE_lit_hopital", (-1.80, 0.15, -0.65), (0.55, 0.22, 0.10), MATS["white"], "Hospitalisation", "SCENE", "Scène d’hospitalisation : rupture du milieu familier, sécurité et angoisse.", module, "hospitalisation"))
    objs.append(add_ellipsoid("EMOTION_angoisse", (-1.80, -0.10, -0.25), (0.10, 0.08, 0.10), MATS["radiation"], "Angoisse", "EMOTION", "Réaction psychologique possible face à la maladie ou à l’hospitalisation.", module, "réactions"))
    objs.append(add_ellipsoid("EMOTION_deni", (-1.55, -0.10, -0.35), (0.09, 0.07, 0.09), MATS["gray"], "Déni", "EMOTION", "Refus total ou partiel de la maladie, pouvant modifier l’observance.", module, "réactions"))
    objs.append(add_ellipsoid("EMOTION_regression", (-2.05, -0.10, -0.35), (0.09, 0.07, 0.09), MATS["orange"], "Régression", "EMOTION", "Retour à des comportements plus dépendants face à la maladie.", module, "réactions"))
    # Determinants staircase
    dets = ["Revenu", "Éducation", "Travail", "Culture", "Système de santé"]
    for i, det in enumerate(dets):
        objs.append(add_box(f"DETERMINANT_sante_{i}", (1.95, 0.04, -0.55 + i*0.22), (0.50, 0.12, 0.08), MATS["panel"], det, "DETERMINANT", f"Déterminant social/intermédiaire de santé : {det}.", module, "déterminants sociaux"))
        add_label(f"LABEL_det_{i}", det, (1.95, -0.28, -0.52 + i*0.22), 0.060, True, module)
    # Personality iceberg
    objs.append(add_ellipsoid("INFO_personnalite_iceberg_conscient", (0, 0.18, -0.15), (0.34, 0.08, 0.16), MATS["white"], "Conscient", "INFO", "Partie visible de l’iceberg psychique.", module, "personnalité", 0))
    objs.append(add_ellipsoid("INFO_personnalite_iceberg_inconscient", (0, 0.18, -0.65), (0.42, 0.10, 0.36), MATS["water"], "Inconscient", "INFO", "Partie immergée : désirs, conflits, défenses, représentations.", module, "personnalité", 0))
    objs.append(add_curve_tube("RELATION_information_soignant_soigne", [(-0.95, -0.08, 0.35), (-0.35, -0.08, 0.50), (0.35, -0.08, 0.50), (0.95, -0.08, 0.35)], 0.018, MATS["xray"], "Information / écoute", "RELATION", "Flux de communication entre soignant et patient.", module, "communication"))
    objs += animate_flow_particles("FLOW_communication", [(-0.95, -0.08, 0.35), (0.95, -0.08, 0.35)], 5, 0.030, MATS["xray"], module, category="FLOW", desc="Message verbal/non verbal dans la relation de soin.", start=45, end=130, stagger=8)
    add_label("LABEL_shs", "Médecine = corps + esprit + société", (0, -0.82, 3.0), 0.12, True, module)
    add_label("LABEL_relation", "Relation médecin-malade", (0, -0.72, 1.45), 0.10, True, module)
    add_label("LABEL_hospitalisation", "Hospitalisation", (-1.82, -0.62, 0.05), 0.10, True, module)
    animate_assembly(objs, strength=0.7, start=1, end=62)
    return module

# =========================
# REGISTRY
# =========================

BUILDERS = {
    "abdomen_premium": build_abdomen_premium,
    "membre_superieur_premium": build_membre_superieur_premium,
    "membre_inferieur_premium": build_membre_inferieur_premium,
    "radiologie_rx_premium": build_radiologie_rx_premium,
    "radiobiologie_premium": build_radiobiologie_premium,
    "circulation_premium": build_circulation_premium,
    "acide_base_premium": build_acide_base_premium,
    "transports_membranaires_premium": build_transports_membranaires_premium,
    "compartiments_liquidiens_premium": build_compartiments_liquidiens_premium,
    "equilibre_hydrosode_premium": build_equilibre_hydrosode_premium,
    "oxydoreduction_premium": build_oxydoreduction_premium,
    "optique_vision_audition_premium": build_optique_vision_audition_premium,
    "shs_psy_medicale_premium": build_shs_psy_medicale_premium,
}

AVAILABLE_MODULES = list(BUILDERS.keys())


def build_one(module_key):
    if module_key not in BUILDERS:
        raise ValueError(f"Module inconnu : {module_key}. Modules disponibles : {AVAILABLE_MODULES}")
    clear_scene()
    create_materials()
    built_key = BUILDERS[module_key]()
    if EXPORT_GLB_AFTER_BUILD:
        export_scene(built_key)
    print("Module généré :", built_key)
    print("Objets créés :", len(bpy.data.objects))
    return built_key


def build_all_modules():
    for key in AVAILABLE_MODULES:
        build_one(key)


if __name__ == "__main__":
    if BUILD_ALL_MODULES:
        build_all_modules()
    else:
        build_one(MODULE_TO_BUILD)
