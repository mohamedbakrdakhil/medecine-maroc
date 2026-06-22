'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

export type PremiumModule3DVariant = 'anatomy' | 'biology' | 'chemistry' | 'biophysics' | 'histology' | 'methodology' | 'psycho-socio' | 'public-health'

type PremiumModule3DProps = {
  variant: PremiumModule3DVariant
  title: string
}

type Part = {
  id: string
  label: string
  layer: string
  object: THREE.Object3D
  meshes: THREE.Mesh[]
  home: THREE.Vector3
  exploded: THREE.Vector3
}

const variantTitle: Record<PremiumModule3DVariant, string> = {
  anatomy: 'Anatomie abdomen et membre inferieur 3D',
  biology: 'Cellule eucaryote 3D',
  chemistry: 'Biochimie moleculaire 3D',
  biophysics: 'Biophysique 3D',
  histology: 'Histologie et embryologie 3D',
  methodology: 'Memoire et apprentissage 3D',
  'psycho-socio': 'Neuro-psycho-sociologie medicale 3D',
  'public-health': 'Sante publique 3D',
}

const variantIntro: Record<PremiumModule3DVariant, string> = {
  anatomy: 'Abdomen, bassin, membre inferieur, axes vasculaires et reperes osseux.',
  biology: 'Organites, noyau, ADN, mitochondries, reticulum et cytosquelette.',
  chemistry: 'Proteine, poche enzymatique, chaine peptidique et molecule organique.',
  biophysics: 'Compartiments, membrane, flux, circulation, rayons et optique.',
  histology: 'Epithelium, tissu osseux, muscle, neurone et developpement embryonnaire.',
  methodology: 'Cerveau, hippocampe, cortex et reseaux neuronaux de memorisation.',
  'psycho-socio': 'Cerveau, reseaux emotionnels, relation soignant-patient et dynamique sociale.',
  'public-health': 'Population, foyers, hopitaux, diffusion et indicateurs epidemiologiques.',
}

function mat(color: string, options: THREE.MeshPhysicalMaterialParameters = {}) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.29,
    metalness: 0.04,
    clearcoat: 0.48,
    clearcoatRoughness: 0.18,
    ...options,
  })
}

function glass(color: string, opacity: number) {
  return mat(color, {
    transparent: true,
    opacity,
    transmission: 0.18,
    thickness: 0.8,
    roughness: 0.16,
    side: THREE.DoubleSide,
  })
}

function addPart(parts: Part[], group: THREE.Group, id: string, label: string, layer: string, object: THREE.Object3D) {
  const meshes: THREE.Mesh[] = []
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.userData.partId = id
      meshes.push(child)
    }
  })
  const home = object.position.clone()
  const direction = home.clone()
  if (direction.length() < 0.1) direction.set((parts.length % 3) - 1, (parts.length % 2) * 0.8 - 0.4, 0.5)
  const exploded = home.clone().add(direction.normalize().multiplyScalar(0.85))
  object.userData.partId = id
  object.userData.layer = layer
  parts.push({ id, label, layer, object, meshes, home, exploded })
  group.add(object)
}

function tubeBetween(from: THREE.Vector3, to: THREE.Vector3, radius: number, color: string) {
  const direction = to.clone().sub(from)
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, direction.length(), 18), mat(color, { roughness: 0.25 }))
  mesh.position.copy(from).add(direction.multiplyScalar(0.5))
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), to.clone().sub(from).normalize())
  return mesh
}

function sphere(radius: number, color: string, position: [number, number, number], scale: [number, number, number] = [1, 1, 1], options: THREE.MeshPhysicalMaterialParameters = {}) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 64, 42), mat(color, options))
  mesh.position.set(...position)
  mesh.scale.set(...scale)
  return mesh
}

function softEllipsoid(color: string, position: [number, number, number], scale: [number, number, number], opacity = 1) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 80, 48),
    opacity < 1 ? glass(color, opacity) : mat(color, { roughness: 0.38, clearcoat: 0.28 }),
  )
  mesh.position.set(...position)
  mesh.scale.set(...scale)
  return mesh
}

function addPebbleTexture(group: THREE.Group, color: string, count: number, radius: number, spread: [number, number, number]) {
  for (let i = 0; i < count; i += 1) {
    const a = i * 2.399
    const r = radius * (0.25 + (i % 9) / 12)
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.018 + (i % 4) * 0.004, 12, 8), mat(color, { roughness: 0.55 }))
    dot.position.set(Math.cos(a) * r * spread[0], Math.sin(i * 1.7) * spread[1], Math.sin(a) * r * spread[2])
    group.add(dot)
  }
}

function addPulseArc(group: THREE.Group, points: THREE.Vector3[], color: string, radius = 0.015) {
  const curve = new THREE.CatmullRomCurve3(points)
  const tube = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 80, radius, 14),
    mat(color, { roughness: 0.18, emissive: new THREE.Color(color), emissiveIntensity: 0.14 }),
  )
  group.add(tube)
  return tube
}

function makeTextSprite(text: string, color = '#67e8f9') {
  const canvas = document.createElement('canvas')
  canvas.width = 640
  canvas.height = 144
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.fillStyle = 'rgba(2,6,23,0.78)'
  ctx.strokeStyle = color
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.roundRect(20, 24, 600, 96, 24)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = '#ffffff'
  ctx.font = '700 34px Arial'
  ctx.textBaseline = 'middle'
  ctx.fillText(text.slice(0, 28), 48, 73)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }))
  sprite.scale.set(0.72, 0.16, 1)
  return sprite
}

function capsule(name: string, color: string, scale: [number, number, number], rotation: [number, number, number]) {
  const object = new THREE.Group()
  object.name = name
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 0.78, 16, 36), mat(color, { roughness: 0.28 }))
  body.scale.set(...scale)
  body.rotation.set(...rotation)
  object.add(body)
  return object
}

function addBiology(parts: Part[], root: THREE.Group) {
  const cell = new THREE.Group()
  const membrane = new THREE.Mesh(new THREE.SphereGeometry(1.55, 96, 64), glass('#2dd4bf', 0.17))
  membrane.scale.set(1.22, 0.82, 0.68)
  cell.add(membrane)
  addPart(parts, root, 'membrane', 'Membrane cellulaire', 'Cellule', cell)

  const nucleus = new THREE.Group()
  nucleus.position.set(-0.32, 0.08, 0.08)
  const n = new THREE.Mesh(new THREE.SphereGeometry(0.46, 72, 48), glass('#a78bfa', 0.55))
  n.scale.set(1.05, 0.92, 0.86)
  const nucleolus = new THREE.Mesh(new THREE.SphereGeometry(0.13, 36, 24), mat('#c084fc'))
  nucleolus.position.set(-0.08, 0.08, 0.18)
  nucleus.add(n, nucleolus)
  addPart(parts, root, 'nucleus', 'Noyau et nucleole', 'Genetique', nucleus)

  const dna = new THREE.Group()
  dna.position.set(0.58, 0.1, 0.08)
  for (let i = 0; i < 24; i += 1) {
    const y = -0.62 + i * 0.055
    const angle = i * 0.72
    const a = new THREE.Vector3(Math.cos(angle) * 0.13, y, Math.sin(angle) * 0.13)
    const b = new THREE.Vector3(Math.cos(angle + Math.PI) * 0.13, y, Math.sin(angle + Math.PI) * 0.13)
    const beadA = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 12), mat('#60a5fa'))
    beadA.position.copy(a)
    const beadB = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 12), mat('#f472b6'))
    beadB.position.copy(b)
    dna.add(beadA, beadB, tubeBetween(a, b, 0.008, '#e2e8f0'))
  }
  addPart(parts, root, 'dna', 'Double helice ADN', 'Genetique', dna)

  const mitochondriaData: [string, [number, number, number], [number, number, number]][] = [
    ['Mitochondrie gauche', [-0.88, -0.34, -0.08], [0.5, 0.2, -0.72]],
    ['Mitochondrie droite', [0.72, -0.36, -0.12], [0.8, -0.2, 0.82]],
  ]
  mitochondriaData.forEach(([label, pos, rot], index) => {
    const mito = capsule(label, '#fb7185', [1.2, 0.74, 0.55], rot)
    mito.position.set(...pos)
    for (let i = 0; i < 4; i += 1) {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.16, -0.18 + i * 0.11, 0.02),
        new THREE.Vector3(0.02, -0.13 + i * 0.11, 0.08),
        new THREE.Vector3(0.16, -0.2 + i * 0.11, -0.02),
      ])
      mito.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.01, 8), mat('#fecdd3')))
    }
    addPart(parts, root, `mitochondria-${index}`, label, 'Organites', mito)
  })

  const golgi = new THREE.Group()
  golgi.position.set(0.42, 0.42, 0.05)
  for (let i = 0; i < 5; i += 1) {
    const stack = capsule(`Sac Golgi ${i + 1}`, '#38bdf8', [1.0 - i * 0.08, 0.16, 0.22], [Math.PI * 0.5, 0, 0.2])
    stack.position.set(0, (i - 2) * 0.08, i * 0.018)
    golgi.add(stack)
  }
  addPart(parts, root, 'golgi', 'Appareil de Golgi', 'Organites', golgi)

  const er = new THREE.Group()
  er.position.set(-0.52, 0.34, -0.08)
  for (let i = 0; i < 5; i += 1) {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.42, i * 0.08 - 0.16, 0),
      new THREE.Vector3(-0.12, i * 0.08 - 0.1, 0.08),
      new THREE.Vector3(0.22, i * 0.08 - 0.2, -0.02),
      new THREE.Vector3(0.48, i * 0.08 - 0.12, 0.04),
    ])
    er.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 48, 0.018, 12), mat('#5eead4')))
  }
  addPart(parts, root, 'reticulum', 'Reticulum endoplasmique', 'Organites', er)

  const cytoskeleton = new THREE.Group()
  for (let i = 0; i < 10; i += 1) {
    const angle = (i / 10) * Math.PI * 2
    cytoskeleton.add(tubeBetween(new THREE.Vector3(0, 0, 0), new THREE.Vector3(Math.cos(angle) * 1.25, Math.sin(angle * 1.7) * 0.44, Math.sin(angle) * 0.52), 0.008, '#94a3b8'))
  }
  addPart(parts, root, 'cytoskeleton', 'Cytosquelette', 'Structure', cytoskeleton)
}

function addChemistry(parts: Part[], root: THREE.Group) {
  const protein = new THREE.Group()
  const points: THREE.Vector3[] = []
  for (let i = 0; i < 96; i += 1) {
    const t = i / 12
    points.push(new THREE.Vector3(Math.cos(t) * 0.42, -1.05 + i * 0.022, Math.sin(t) * 0.42))
  }
  protein.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 160, 0.055, 18), mat('#7dd3fc', { roughness: 0.2 })))
  protein.position.set(-0.38, 0, 0)
  addPart(parts, root, 'protein', 'Helice proteique', 'Proteines', protein)

  const pocket = new THREE.Group()
  pocket.position.set(0.52, 0.04, 0.02)
  const pocketShell = new THREE.Mesh(new THREE.TorusKnotGeometry(0.38, 0.045, 96, 16, 2, 3), mat('#a78bfa', { roughness: 0.22 }))
  pocket.add(pocketShell)
  addPart(parts, root, 'enzyme-pocket', 'Poche enzymatique', 'Enzymologie', pocket)

  const glucose = new THREE.Group()
  glucose.position.set(0.18, -0.62, 0.18)
  const atomPositions: THREE.Vector3[] = []
  for (let i = 0; i < 6; i += 1) {
    const angle = (i / 6) * Math.PI * 2
    const p = new THREE.Vector3(Math.cos(angle) * 0.35, Math.sin(angle) * 0.35, 0)
    atomPositions.push(p)
    const atom = new THREE.Mesh(new THREE.SphereGeometry(0.075, 28, 20), mat(i === 0 ? '#ef4444' : '#d1d5db'))
    atom.position.copy(p)
    glucose.add(atom)
  }
  for (let i = 0; i < atomPositions.length; i += 1) {
    glucose.add(tubeBetween(atomPositions[i], atomPositions[(i + 1) % atomPositions.length], 0.018, '#94a3b8'))
  }
  addPart(parts, root, 'glucose', 'Cycle glucidique', 'Glucides', glucose)

  const lipid = new THREE.Group()
  lipid.position.set(0.72, 0.62, -0.1)
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 28, 20), mat('#facc15'))
  lipid.add(head)
  for (let side = -1; side <= 1; side += 2) {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.1, 0),
      new THREE.Vector3(side * 0.12, -0.35, 0.02),
      new THREE.Vector3(side * 0.03, -0.62, -0.02),
      new THREE.Vector3(side * 0.16, -0.88, 0.03),
    ])
    lipid.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 48, 0.024, 12), mat('#22c55e')))
  }
  addPart(parts, root, 'lipid', 'Phospholipide', 'Lipides', lipid)

  const heme = new THREE.Group()
  heme.position.set(-0.78, 0.58, 0.1)
  heme.add(new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.025, 16, 80), mat('#ef4444')))
  heme.add(new THREE.Mesh(new THREE.SphereGeometry(0.07, 24, 16), mat('#991b1b', { metalness: 0.25 })))
  addPart(parts, root, 'heme', 'Noyau heminique', 'Proteines', heme)
}

function addAnatomy(parts: Part[], root: THREE.Group) {
  const abdominalWall = new THREE.Group()
  abdominalWall.add(softEllipsoid('#f8b4a2', [0, 0.55, 0], [1.25, 1.55, 0.72], 0.18))
  abdominalWall.add(softEllipsoid('#fecaca', [0, 0.72, 0.02], [0.92, 0.84, 0.5], 0.12))
  for (let i = 0; i < 9; i += 1) {
    const rib = new THREE.Mesh(new THREE.TorusGeometry(0.46 + i * 0.025, 0.011, 10, 72), mat('#e8d2aa', { roughness: 0.5 }))
    rib.position.set(0, 1.25 - i * 0.075, -0.03)
    rib.scale.set(1.45, 0.28, 0.7)
    rib.rotation.x = Math.PI * 0.5
    abdominalWall.add(rib)
  }
  addPart(parts, root, 'abdominal-wall', 'Paroi abdominale translucide', 'Abdomen', abdominalWall)

  const viscera = new THREE.Group()
  const liver = softEllipsoid('#7f1d1d', [0.3, 0.88, 0.24], [0.88, 0.34, 0.46])
  const stomach = softEllipsoid('#f59e0b', [-0.28, 0.68, 0.26], [0.38, 0.46, 0.26])
  const spleen = softEllipsoid('#9333ea', [-0.64, 0.74, 0.15], [0.22, 0.32, 0.18])
  const pancreas = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.62, 14, 36), mat('#fde68a', { roughness: 0.42 }))
  pancreas.position.set(-0.02, 0.55, 0.34)
  pancreas.rotation.z = Math.PI * 0.5
  const bowelCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.38, 0.23, 0.3),
    new THREE.Vector3(0.15, 0.45, 0.36),
    new THREE.Vector3(0.42, 0.16, 0.3),
    new THREE.Vector3(0.12, -0.1, 0.34),
    new THREE.Vector3(-0.42, 0.02, 0.28),
    new THREE.Vector3(-0.18, 0.28, 0.36),
  ])
  const bowel = new THREE.Mesh(new THREE.TubeGeometry(bowelCurve, 160, 0.065, 18), mat('#fca5a5', { roughness: 0.38 }))
  viscera.add(liver, stomach, spleen, pancreas, bowel)
  addPebbleTexture(viscera, '#fecdd3', 38, 0.7, [0.9, 0.42, 0.5])
  addPart(parts, root, 'abdominal-viscera', 'Foie estomac pancreas intestin', 'Visceres', viscera)

  const urogenital = new THREE.Group()
  urogenital.add(softEllipsoid('#a16207', [-0.46, 0.34, -0.18], [0.22, 0.36, 0.15]))
  urogenital.add(softEllipsoid('#a16207', [0.46, 0.34, -0.18], [0.22, 0.36, 0.15]))
  urogenital.add(tubeBetween(new THREE.Vector3(-0.42, 0.12, -0.1), new THREE.Vector3(-0.16, -0.38, 0.05), 0.012, '#fde68a'))
  urogenital.add(tubeBetween(new THREE.Vector3(0.42, 0.12, -0.1), new THREE.Vector3(0.16, -0.38, 0.05), 0.012, '#fde68a'))
  urogenital.add(softEllipsoid('#fbbf24', [0, -0.5, 0.08], [0.34, 0.22, 0.22], 0.45))
  addPart(parts, root, 'urogenital', 'Reins ureteres vessie', 'Retroperitoine', urogenital)

  const pelvis = new THREE.Group()
  pelvis.position.set(0, -0.42, 0)
  for (const side of [-1, 1] as const) {
    const iliac = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.055, 18, 80), mat('#d8b384', { roughness: 0.48 }))
    iliac.position.set(side * 0.34, 0.05, 0)
    iliac.scale.set(1.05, 0.62, 0.5)
    iliac.rotation.set(Math.PI * 0.55, 0.12 * side, 0.24 * side)
    pelvis.add(iliac)
    pelvis.add(tubeBetween(new THREE.Vector3(side * 0.16, -0.02, -0.08), new THREE.Vector3(side * 0.52, -0.18, 0.02), 0.045, '#d8b384'))
  }
  const sacrum = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.48, 12, 30), mat('#c89a62', { roughness: 0.5 }))
  sacrum.position.set(0, 0.06, -0.32)
  pelvis.add(sacrum)
  addPart(parts, root, 'pelvis', 'Bassin osseux et sacrum', 'Squelette', pelvis)

  const vertebral = new THREE.Group()
  vertebral.position.set(0, 0.26, -0.4)
  for (let i = 0; i < 11; i += 1) {
    const vertebra = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.07, 0.1), mat('#e8d2aa', { roughness: 0.5 }))
    vertebra.position.set(0, i * 0.12 - 0.48, 0)
    vertebra.rotation.y = (i % 2 ? 0.08 : -0.08)
    vertebral.add(vertebra)
  }
  addPart(parts, root, 'spine', 'Rachis lombaire et thoracique', 'Squelette', vertebral)

  for (const side of [-1, 1] as const) {
    const limb = new THREE.Group()
    limb.position.set(side * 0.36, -1.1, 0.02)
    limb.add(tubeBetween(new THREE.Vector3(0, 0.52, 0), new THREE.Vector3(side * 0.08, -0.35, 0.02), 0.05, '#d8b384'))
    limb.add(tubeBetween(new THREE.Vector3(side * 0.08, -0.42, 0.02), new THREE.Vector3(side * 0.04, -1.12, 0.04), 0.038, '#d8b384'))
    limb.add(tubeBetween(new THREE.Vector3(side * 0.18, -0.44, -0.04), new THREE.Vector3(side * 0.15, -1.1, -0.03), 0.023, '#c89a62'))
    limb.add(sphere(0.08, '#e8d2aa', [side * 0.08, -0.38, 0.03]))
    limb.add(sphere(0.07, '#e8d2aa', [side * 0.04, -1.1, 0.04]))
    const foot = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.42, 10, 28), mat('#d8b384', { roughness: 0.5 }))
    foot.position.set(side * 0.1, -1.3, 0.22)
    foot.rotation.x = Math.PI * 0.5
    limb.add(foot)
    addPart(parts, root, side === -1 ? 'left-lower-limb' : 'right-lower-limb', side === -1 ? 'Membre inferieur gauche' : 'Membre inferieur droit', 'Membre inferieur', limb)
  }

  const vessels = new THREE.Group()
  vessels.position.set(0, -0.08, 0.38)
  vessels.add(tubeBetween(new THREE.Vector3(0, 0.9, 0), new THREE.Vector3(0, -0.52, 0), 0.024, '#dc2626'))
  vessels.add(tubeBetween(new THREE.Vector3(-0.12, 0.86, -0.04), new THREE.Vector3(-0.12, -0.52, -0.04), 0.021, '#2563eb'))
  vessels.add(tubeBetween(new THREE.Vector3(0, -0.28, 0), new THREE.Vector3(-0.44, -0.84, 0.04), 0.017, '#dc2626'))
  vessels.add(tubeBetween(new THREE.Vector3(0, -0.28, 0), new THREE.Vector3(0.44, -0.84, 0.04), 0.017, '#dc2626'))
  vessels.add(tubeBetween(new THREE.Vector3(-0.12, -0.3, -0.04), new THREE.Vector3(-0.5, -0.86, -0.02), 0.014, '#2563eb'))
  vessels.add(tubeBetween(new THREE.Vector3(-0.12, -0.3, -0.04), new THREE.Vector3(0.38, -0.86, -0.02), 0.014, '#2563eb'))
  addPart(parts, root, 'vessels', 'Aorte veine cave axes iliaques', 'Vaisseaux', vessels)

  const nerves = new THREE.Group()
  nerves.position.set(0, -0.18, -0.28)
  for (const side of [-1, 1] as const) {
    addPulseArc(nerves, [
      new THREE.Vector3(0, 0.22, 0),
      new THREE.Vector3(side * 0.18, -0.1, 0.08),
      new THREE.Vector3(side * 0.38, -0.62, 0.12),
      new THREE.Vector3(side * 0.42, -1.15, 0.1),
    ], '#facc15', 0.012)
  }
  addPart(parts, root, 'lumbar-plexus', 'Plexus lombaire et nerfs femoraux', 'Nerfs', nerves)
}

function addBiophysics(parts: Part[], root: THREE.Group) {
  const membrane = new THREE.Group()
  membrane.position.set(-0.48, 0.35, 0)
  for (let i = 0; i < 34; i += 1) {
    const x = -1.18 + i * 0.07
    const headA = sphere(0.036, '#67e8f9', [x, 0.24, 0])
    const headB = sphere(0.036, '#67e8f9', [x, -0.24, 0])
    membrane.add(headA, headB, tubeBetween(headA.position, headB.position, 0.007, '#22c55e'))
  }
  for (let i = 0; i < 5; i += 1) {
    const channel = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.62, 28), glass('#a78bfa', 0.5))
    channel.position.set(-0.72 + i * 0.36, 0, 0.02)
    channel.rotation.x = Math.PI * 0.5
    membrane.add(channel)
    addPulseArc(membrane, [
      new THREE.Vector3(channel.position.x, 0.46, 0.06),
      new THREE.Vector3(channel.position.x + 0.04, 0.1, 0.1),
      new THREE.Vector3(channel.position.x - 0.02, -0.46, 0.06),
    ], '#facc15', 0.006)
  }
  addPart(parts, root, 'membrane', 'Membrane plasmique canaux et flux', 'Transports', membrane)

  const compartments = new THREE.Group()
  compartments.position.set(0.82, 0.34, 0)
  compartments.add(softEllipsoid('#0ea5e9', [-0.28, 0, 0], [0.52, 0.72, 0.48], 0.28))
  compartments.add(softEllipsoid('#a78bfa', [0.36, 0, 0], [0.58, 0.74, 0.5], 0.24))
  for (let i = 0; i < 30; i += 1) {
    const ion = sphere(0.026, i % 2 ? '#38bdf8' : '#fbbf24', [Math.sin(i) * 0.5, Math.cos(i * 1.7) * 0.45, Math.sin(i * 0.41) * 0.26])
    compartments.add(ion)
  }
  addPulseArc(compartments, [
    new THREE.Vector3(-0.56, 0.5, 0),
    new THREE.Vector3(0.02, 0.12, 0.26),
    new THREE.Vector3(0.64, -0.34, 0.05),
  ], '#facc15', 0.012)
  addPart(parts, root, 'compartments', 'Osmose et compartiments liquidiens', 'Hydrosode', compartments)

  const circulation = new THREE.Group()
  circulation.position.set(-0.72, -0.62, 0.05)
  const heart = new THREE.Group()
  heart.add(softEllipsoid('#dc2626', [-0.08, 0.02, 0], [0.28, 0.34, 0.22]))
  heart.add(softEllipsoid('#ef4444', [0.12, 0.0, 0.02], [0.27, 0.32, 0.22]))
  circulation.add(heart)
  addPulseArc(circulation, [
    new THREE.Vector3(0.06, 0.2, 0),
    new THREE.Vector3(0.5, 0.52, 0.16),
    new THREE.Vector3(0.88, 0.02, 0.1),
    new THREE.Vector3(0.48, -0.44, -0.02),
    new THREE.Vector3(-0.12, -0.28, 0),
  ], '#ef4444', 0.028)
  addPulseArc(circulation, [
    new THREE.Vector3(-0.05, 0.15, -0.04),
    new THREE.Vector3(-0.46, 0.48, -0.12),
    new THREE.Vector3(-0.72, -0.04, -0.1),
    new THREE.Vector3(-0.32, -0.48, 0),
  ], '#2563eb', 0.023)
  addPart(parts, root, 'circulation', 'Hemodynamique pression debit resistance', 'Circulation', circulation)

  const radiology = new THREE.Group()
  radiology.position.set(0.68, -0.56, 0)
  const source = sphere(0.13, '#facc15', [-0.86, 0.16, 0], [1, 1, 1], { emissive: new THREE.Color('#facc15'), emissiveIntensity: 0.35 })
  const target = softEllipsoid('#e5e7eb', [0.05, 0.04, 0], [0.32, 0.56, 0.18], 0.26)
  const detector = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.95, 0.56), mat('#64748b', { metalness: 0.18, roughness: 0.22 }))
  detector.position.set(0.88, 0.02, 0)
  radiology.add(source, target, detector)
  for (let i = 0; i < 9; i += 1) {
    radiology.add(tubeBetween(new THREE.Vector3(-0.72, 0.16, 0), new THREE.Vector3(0.76, -0.28 + i * 0.07, -0.22 + i * 0.055), 0.007, '#fde047'))
  }
  addPart(parts, root, 'radiology', 'Rayons X attenuation detection', 'Rayonnements', radiology)

  const optics = new THREE.Group()
  optics.position.set(0.06, 1.05, -0.08)
  optics.add(softEllipsoid('#bfdbfe', [0, 0, 0], [0.36, 0.24, 0.18], 0.32))
  const lens = new THREE.Mesh(new THREE.SphereGeometry(0.12, 40, 26), glass('#e0f2fe', 0.5))
  lens.scale.set(0.45, 1.0, 1.0)
  lens.position.set(0.22, 0, 0)
  optics.add(lens)
  addPulseArc(optics, [
    new THREE.Vector3(-0.7, 0.22, 0),
    new THREE.Vector3(0.18, 0.06, 0),
    new THREE.Vector3(0.72, -0.04, 0),
  ], '#38bdf8', 0.01)
  addPulseArc(optics, [
    new THREE.Vector3(-0.7, -0.18, 0),
    new THREE.Vector3(0.18, -0.04, 0),
    new THREE.Vector3(0.72, 0.06, 0),
  ], '#38bdf8', 0.01)
  addPart(parts, root, 'optics', 'Optique medicale lentille foyer', 'Optique', optics)
}

function addHistology(parts: Part[], root: THREE.Group) {
  const epithelium = new THREE.Group()
  epithelium.position.set(-0.6, 0.52, 0)
  for (let i = 0; i < 36; i += 1) {
    const cell = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.32 + (i % 3) * 0.025, 0.13), glass(i % 4 === 0 ? '#22d3ee' : '#38bdf8', 0.42))
    cell.position.set((i % 9 - 4) * 0.14, 0.1, (Math.floor(i / 9) - 1.5) * 0.14)
    const nucleus = sphere(0.028, '#312e81', [cell.position.x, -0.02, cell.position.z])
    epithelium.add(cell, nucleus)
  }
  const basal = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.035, 0.58), mat('#f9a8d4'))
  basal.position.y = -0.08
  epithelium.add(basal)
  addPart(parts, root, 'epithelium', 'Epithelium prismatique et membrane basale', 'Histologie', epithelium)

  const gland = new THREE.Group()
  gland.position.set(0.74, 0.56, 0)
  for (let i = 0; i < 12; i += 1) {
    const angle = (i / 12) * Math.PI * 2
    const acinus = softEllipsoid('#f0abfc', [Math.cos(angle) * 0.34, Math.sin(angle) * 0.22, Math.sin(angle * 2) * 0.12], [0.18, 0.16, 0.16], 0.5)
    gland.add(acinus)
  }
  gland.add(tubeBetween(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.58, -0.46, 0.08), 0.035, '#f9a8d4'))
  addPart(parts, root, 'gland', 'Acini glandulaires et canal excreteur', 'Histologie', gland)

  const bone = new THREE.Group()
  bone.position.set(-0.86, -0.24, 0)
  for (let i = 0; i < 7; i += 1) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.09 + i * 0.038, 0.0065, 10, 70), mat(i % 2 ? '#d8b384' : '#e8d2aa', { roughness: 0.52 }))
    ring.rotation.x = Math.PI * 0.5
    bone.add(ring)
  }
  bone.add(sphere(0.045, '#78350f', [0, 0, 0]))
  for (let i = 0; i < 18; i += 1) {
    const angle = i * 0.65
    bone.add(sphere(0.015, '#92400e', [Math.cos(angle) * 0.18, Math.sin(i) * 0.03, Math.sin(angle) * 0.18]))
  }
  addPart(parts, root, 'bone-tissue', 'Osteon lamelles canal de Havers', 'Tissu osseux', bone)

  const muscle = new THREE.Group()
  muscle.position.set(0.78, -0.28, 0)
  for (let i = 0; i < 10; i += 1) {
    const fiber = capsule(`Fibre musculaire ${i + 1}`, i % 2 ? '#ef4444' : '#f87171', [1.35, 0.15, 0.15], [0, 0, Math.PI * 0.5])
    fiber.position.set(0, (i - 4.5) * 0.055, (i % 3) * 0.045)
    for (let j = 0; j < 6; j += 1) {
      fiber.add(tubeBetween(new THREE.Vector3(-0.44 + j * 0.15, -0.02, 0.08), new THREE.Vector3(-0.44 + j * 0.15, 0.02, 0.08), 0.004, '#fecaca'))
    }
    muscle.add(fiber)
  }
  addPart(parts, root, 'muscle', 'Faisceaux musculaires et striations', 'Tissu musculaire', muscle)

  const neuron = new THREE.Group()
  neuron.position.set(-0.02, -0.7, 0.08)
  neuron.add(sphere(0.13, '#fbbf24', [0, 0, 0]))
  for (let i = 0; i < 8; i += 1) {
    const angle = (i / 8) * Math.PI * 2
    addPulseArc(neuron, [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(Math.cos(angle) * 0.28, Math.sin(angle) * 0.2, Math.sin(angle) * 0.18),
      new THREE.Vector3(Math.cos(angle) * 0.52, Math.sin(angle) * 0.34, Math.sin(angle) * 0.3),
    ], '#fbbf24', 0.009)
  }
  addPulseArc(neuron, [
    new THREE.Vector3(0.12, 0, 0),
    new THREE.Vector3(0.55, -0.1, 0.08),
    new THREE.Vector3(0.98, -0.02, 0.02),
  ], '#fde047', 0.018)
  addPart(parts, root, 'neuron', 'Neurone prolongements et synapse', 'Tissu nerveux', neuron)

  const embryo = new THREE.Group()
  embryo.position.set(0, -1.08, 0.2)
  embryo.add(softEllipsoid('#f9a8d4', [0, 0, 0], [0.42, 0.22, 0.2], 0.52))
  embryo.add(new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.018, 14, 88), mat('#c084fc')))
  addPulseArc(embryo, [
    new THREE.Vector3(-0.26, 0.04, 0.04),
    new THREE.Vector3(0, 0.18, 0.1),
    new THREE.Vector3(0.26, 0.04, 0.04),
  ], '#67e8f9', 0.014)
  addPart(parts, root, 'embryo', 'Neurulation disque embryonnaire', 'Embryologie', embryo)
}

function addMethodology(parts: Part[], root: THREE.Group) {
  const brain = new THREE.Group()
  const left = new THREE.Mesh(new THREE.SphereGeometry(0.62, 64, 40), glass('#f0abfc', 0.36))
  left.scale.set(0.84, 1.04, 0.68)
  left.position.set(-0.28, 0, 0)
  const right = left.clone()
  right.position.x = 0.28
  brain.add(left, right)
  for (let i = 0; i < 12; i += 1) {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.52 + i * 0.09, 0.36, 0.42),
      new THREE.Vector3(-0.42 + i * 0.08, 0.12, 0.5),
      new THREE.Vector3(-0.5 + i * 0.09, -0.22, 0.42),
    ])
    brain.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 36, 0.01, 8), mat('#f9a8d4')))
  }
  addPart(parts, root, 'brain', 'Cortex cerebral', 'Cerveau', brain)

  const hippocampus = capsule('Hippocampe', '#f97316', [1.25, 0.42, 0.36], [0.4, 0.25, 1.1])
  hippocampus.position.set(0.05, -0.38, 0.28)
  addPart(parts, root, 'hippocampus', 'Hippocampe', 'Memoire', hippocampus)

  const network = new THREE.Group()
  const nodes: THREE.Vector3[] = []
  for (let i = 0; i < 16; i += 1) {
    const angle = i * 0.82
    const p = new THREE.Vector3(Math.cos(angle) * (0.45 + (i % 4) * 0.13), Math.sin(i * 1.4) * 0.36, Math.sin(angle) * 0.5)
    nodes.push(p)
    const node = new THREE.Mesh(new THREE.SphereGeometry(i % 5 === 0 ? 0.055 : 0.04, 20, 14), mat(i % 5 === 0 ? '#facc15' : '#67e8f9'))
    node.position.copy(p)
    network.add(node)
  }
  for (let i = 1; i < nodes.length; i += 1) network.add(tubeBetween(nodes[0], nodes[i], 0.006, '#38bdf8'))
  addPart(parts, root, 'network', 'Reseau neuronal', 'Apprentissage', network)
}

function addPsychoSocio(parts: Part[], root: THREE.Group) {
  const brain = new THREE.Group()
  brain.position.set(-0.42, 0.42, 0)
  const left = softEllipsoid('#f0abfc', [-0.18, 0, 0], [0.72, 0.9, 0.55], 0.4)
  const right = softEllipsoid('#c4b5fd', [0.18, 0, 0], [0.72, 0.9, 0.55], 0.38)
  brain.add(left, right)
  for (let i = 0; i < 18; i += 1) {
    const x = -0.52 + (i % 6) * 0.2
    const y = 0.32 - Math.floor(i / 6) * 0.28
    addPulseArc(brain, [
      new THREE.Vector3(x, y, 0.32),
      new THREE.Vector3(x + 0.08, y - 0.08, 0.48),
      new THREE.Vector3(x - 0.03, y - 0.18, 0.34),
    ], '#f9a8d4', 0.008)
  }
  addPart(parts, root, 'brain-cortex', 'Cortex et aires associatives', 'Neuropsychologie', brain)

  const limbic = new THREE.Group()
  limbic.position.set(-0.42, 0.04, 0.36)
  const hippocampus = capsule('Hippocampe', '#f97316', [1.35, 0.32, 0.28], [0.4, 0.1, 1.1])
  hippocampus.position.set(0.08, -0.16, 0)
  const amygdala = sphere(0.11, '#ef4444', [-0.22, -0.08, 0.1], [1, 0.86, 0.9], { roughness: 0.24 })
  const thalamus = softEllipsoid('#38bdf8', [0.05, 0.08, -0.02], [0.28, 0.22, 0.2], 0.58)
  limbic.add(hippocampus, amygdala, thalamus)
  addPulseArc(limbic, [
    new THREE.Vector3(-0.24, -0.08, 0.1),
    new THREE.Vector3(-0.05, 0.18, 0.12),
    new THREE.Vector3(0.22, -0.18, 0.04),
  ], '#facc15', 0.014)
  addPart(parts, root, 'limbic-system', 'Hippocampe amygdale thalamus', 'Emotion memoire', limbic)

  const consultation = new THREE.Group()
  consultation.position.set(0.78, 0.34, 0)
  const desk = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.08, 0.42), mat('#334155', { roughness: 0.45 }))
  desk.position.set(0, -0.18, 0)
  consultation.add(desk)
  const doctor = new THREE.Group()
  doctor.position.set(-0.34, 0.1, 0.04)
  doctor.add(sphere(0.09, '#fde68a', [0, 0.26, 0]))
  doctor.add(new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.36, 12, 28), mat('#e5e7eb')))
  const patient = new THREE.Group()
  patient.position.set(0.34, 0.08, 0.04)
  patient.add(sphere(0.09, '#f8b4a2', [0, 0.26, 0]))
  patient.add(new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.34, 12, 28), mat('#60a5fa')))
  consultation.add(doctor, patient)
  addPulseArc(consultation, [
    new THREE.Vector3(-0.22, 0.28, 0.08),
    new THREE.Vector3(0, 0.42, 0.2),
    new THREE.Vector3(0.22, 0.28, 0.08),
  ], '#22d3ee', 0.013)
  addPulseArc(consultation, [
    new THREE.Vector3(0.22, 0.2, 0.03),
    new THREE.Vector3(0, 0.06, 0.18),
    new THREE.Vector3(-0.22, 0.2, 0.03),
  ], '#f472b6', 0.01)
  addPart(parts, root, 'clinical-relationship', 'Relation medecin patient empathie', 'Communication', consultation)

  const socialNetwork = new THREE.Group()
  socialNetwork.position.set(0.64, -0.52, 0)
  const nodes: THREE.Vector3[] = []
  for (let i = 0; i < 18; i += 1) {
    const angle = i * 0.92
    const p = new THREE.Vector3(Math.cos(angle) * (0.24 + (i % 4) * 0.12), Math.sin(i * 1.35) * 0.34, Math.sin(angle) * 0.28)
    nodes.push(p)
    socialNetwork.add(sphere(i % 5 === 0 ? 0.065 : 0.042, i % 5 === 0 ? '#facc15' : '#14b8a6', [p.x, p.y, p.z]))
  }
  for (let i = 1; i < nodes.length; i += 1) {
    if (i % 2 === 0 || i % 5 === 0) socialNetwork.add(tubeBetween(nodes[Math.max(0, i - 3)], nodes[i], 0.006, '#38bdf8'))
    socialNetwork.add(tubeBetween(nodes[0], nodes[i], 0.004, '#475569'))
  }
  addPart(parts, root, 'social-network', 'Famille groupe normes et influence sociale', 'Sociologie', socialNetwork)

  const history = new THREE.Group()
  history.position.set(-0.62, -0.66, -0.02)
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.04, 0.12), mat('#94a3b8', { metalness: 0.12 }))
  history.add(base)
  for (let i = 0; i < 6; i += 1) {
    const marker = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.22 + i * 0.025, 18), mat(i % 2 ? '#22c55e' : '#f59e0b'))
    marker.position.set(-0.48 + i * 0.19, 0.11 + i * 0.012, 0)
    history.add(marker)
  }
  addPulseArc(history, [
    new THREE.Vector3(-0.54, 0.26, 0.02),
    new THREE.Vector3(-0.12, 0.46, 0.08),
    new THREE.Vector3(0.54, 0.38, 0.02),
  ], '#facc15', 0.009)
  addPart(parts, root, 'medical-history', 'Evolution historique des savoirs medicaux', 'Histoire', history)
}

function addPublicHealth(parts: Part[], root: THREE.Group) {
  const map = new THREE.Group()
  const shape = new THREE.Shape()
  shape.moveTo(-0.75, -0.72)
  shape.lineTo(-0.25, -0.95)
  shape.lineTo(0.42, -0.72)
  shape.lineTo(0.7, -0.18)
  shape.lineTo(0.45, 0.62)
  shape.lineTo(-0.28, 0.9)
  shape.lineTo(-0.82, 0.34)
  shape.lineTo(-0.75, -0.72)
  const plate = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.08, bevelEnabled: true, bevelSize: 0.025, bevelThickness: 0.018 }), mat('#0f766e', { roughness: 0.42 }))
  plate.rotation.x = -Math.PI * 0.5
  map.add(plate)
  addPart(parts, root, 'map', 'Carte sanitaire', 'Territoire', map)

  const population = new THREE.Group()
  for (let i = 0; i < 42; i += 1) {
    const x = (i % 7 - 3) * 0.22
    const z = (Math.floor(i / 7) - 2.5) * 0.2
    const h = 0.12 + ((i * 11) % 13) * 0.035
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.12, h, 0.12), mat(i % 6 === 0 ? '#ef4444' : '#14b8a6'))
    bar.position.set(x, -0.52 + h / 2, z)
    population.add(bar)
  }
  addPart(parts, root, 'population', 'Population exposee', 'Population', population)

  const hospitals = new THREE.Group()
  const coords = [[-0.48, 0.1, 0.12], [0.36, 0.02, -0.2], [0.08, 0.14, 0.42]] as const
  coords.forEach(([x, y, z], index) => {
    const hospital = new THREE.Group()
    hospital.position.set(x, y, z)
    hospital.add(new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.16), mat('#e5e7eb')))
    const crossA = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.018), mat('#ef4444'))
    const crossB = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.12, 0.018), mat('#ef4444'))
    crossA.position.z = 0.085
    crossB.position.z = 0.088
    hospital.add(crossA, crossB)
    hospitals.add(hospital)
    hospital.name = `Hopital ${index + 1}`
  })
  addPart(parts, root, 'hospitals', 'Structures de soins', 'Offre de soins', hospitals)

  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.85, 0.62, -0.55),
    new THREE.Vector3(-0.38, 0.88, -0.2),
    new THREE.Vector3(0.12, 0.72, 0.08),
    new THREE.Vector3(0.58, 1.08, 0.42),
    new THREE.Vector3(0.9, 0.86, 0.68),
  ])
  const epi = new THREE.Mesh(new THREE.TubeGeometry(curve, 96, 0.03, 14), mat('#facc15'))
  addPart(parts, root, 'curve', 'Courbe epidemiologique', 'Indicateurs', epi)
}

function buildVariant(variant: PremiumModule3DVariant, parts: Part[], root: THREE.Group) {
  if (variant === 'anatomy') addAnatomy(parts, root)
  if (variant === 'biology') addBiology(parts, root)
  if (variant === 'chemistry') addChemistry(parts, root)
  if (variant === 'biophysics') addBiophysics(parts, root)
  if (variant === 'histology') addHistology(parts, root)
  if (variant === 'methodology') addMethodology(parts, root)
  if (variant === 'psycho-socio') addPsychoSocio(parts, root)
  if (variant === 'public-health') addPublicHealth(parts, root)
}

export default function PremiumModule3D({ variant, title }: PremiumModule3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const apiRef = useRef<{
    zoomIn: () => void
    zoomOut: () => void
    reset: () => void
    isolate: () => void
    showAll: () => void
    toggleLabels: () => void
    filterLayer: (layer: string) => void
  } | null>(null)
  const [selected, setSelected] = useState('Clique sur une structure 3D')
  const [selectedLayer, setSelectedLayer] = useState(variantTitle[variant])
  const [layers, setLayers] = useState<string[]>([])
  const [activeLayer, setActiveLayer] = useState('Tout')
  const [assembly, setAssembly] = useState(0.18)
  const assemblyRef = useRef(assembly)

  const heading = useMemo(() => variantTitle[variant], [variant])
  useEffect(() => {
    assemblyRef.current = assembly
  }, [assembly])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#020617')
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
    camera.position.set(0, 0.6, 4.8)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15
    mount.appendChild(renderer.domElement)

    const pmrem = new THREE.PMREMGenerator(renderer)
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.enablePan = true
    controls.screenSpacePanning = true
    controls.minDistance = 1.6
    controls.maxDistance = 10
    if ('zoomToCursor' in controls) {
      ;(controls as OrbitControls & { zoomToCursor: boolean }).zoomToCursor = true
    }

    scene.add(new THREE.HemisphereLight('#ffffff', '#1e293b', 2.2))
    const key = new THREE.DirectionalLight('#ffffff', 3.1)
    key.position.set(3.5, 4.5, 5.2)
    scene.add(key)
    const rim = new THREE.DirectionalLight('#67e8f9', 1.35)
    rim.position.set(-4, 1.2, 2.4)
    scene.add(rim)

    const root = new THREE.Group()
    scene.add(root)
    const parts: Part[] = []
    buildVariant(variant, parts, root)
    setLayers(Array.from(new Set(parts.map((part) => part.layer))))

    const box = new THREE.Box3().setFromObject(root)
    const center = new THREE.Vector3()
    box.getCenter(center)
    root.position.sub(center)

    const meshToPart = new Map<THREE.Object3D, Part>()
    parts.forEach((part) => part.meshes.forEach((mesh) => meshToPart.set(mesh, part)))
    const selectable = Array.from(meshToPart.keys())

    const labels: THREE.Sprite[] = []
    parts.forEach((part) => {
      const sprite = makeTextSprite(part.label)
      if (!sprite) return
      sprite.position.copy(part.home).add(new THREE.Vector3(0, 0.28, 0))
      sprite.visible = false
      sprite.userData.layer = part.layer
      labels.push(sprite)
      root.add(sprite)
    })

    let selectedPart: Part | null = null
    let labelsVisible = false
    let isolated = false
    let targetAssembly = assemblyRef.current
    let currentLayer = 'Tout'

    const resize = () => {
      const width = mount.clientWidth
      const height = Math.max(460, Math.min(780, Math.round(width * 0.64)))
      renderer.setSize(width, height)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(mount)

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()

    const setPartHighlighted = (part: Part | null) => {
      parts.forEach((item) => {
        item.meshes.forEach((mesh) => {
          const material = mesh.material
          if (material instanceof THREE.MeshPhysicalMaterial || material instanceof THREE.MeshStandardMaterial) {
            material.emissive.set(part?.id === item.id ? '#0f766e' : '#000000')
            material.emissiveIntensity = part?.id === item.id ? 0.28 : 0
          }
        })
      })
    }

    const onPointerDown = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)
      const hit = raycaster.intersectObjects(selectable, true)[0]
      if (!hit) return
      const part = meshToPart.get(hit.object)
      if (!part) return
      selectedPart = part
      setSelected(part.label)
      setSelectedLayer(part.layer)
      setPartHighlighted(part)
    }
    renderer.domElement.addEventListener('pointerdown', onPointerDown)

    apiRef.current = {
      zoomIn: () => {
        camera.position.multiplyScalar(0.82)
        controls.update()
      },
      zoomOut: () => {
        camera.position.multiplyScalar(1.18)
        controls.update()
      },
      reset: () => {
        camera.position.set(0, 0.6, 4.8)
        controls.target.set(0, 0, 0)
        controls.update()
      },
      isolate: () => {
        if (!selectedPart) return
        isolated = true
        parts.forEach((part) => {
          part.object.visible = part.id === selectedPart?.id
        })
        labels.forEach((label) => {
          label.visible = false
        })
      },
      showAll: () => {
        isolated = false
        currentLayer = 'Tout'
        setActiveLayer('Tout')
        parts.forEach((part) => {
          part.object.visible = true
        })
        labels.forEach((label) => {
          label.visible = labelsVisible
        })
      },
      toggleLabels: () => {
        labelsVisible = !labelsVisible
        labels.forEach((label) => {
          label.visible = labelsVisible && (currentLayer === 'Tout' || label.userData.layer === currentLayer)
        })
      },
      filterLayer: (layer) => {
        isolated = false
        currentLayer = layer
        setActiveLayer(layer)
        parts.forEach((part) => {
          part.object.visible = layer === 'Tout' || part.layer === layer
        })
        labels.forEach((label) => {
          label.visible = labelsVisible && (layer === 'Tout' || label.userData.layer === layer)
        })
      },
    }

    let frame = 0
    let lastTime = performance.now()
    const animate = () => {
      frame = requestAnimationFrame(animate)
      const now = performance.now()
      const dt = Math.min((now - lastTime) / 1000, 0.05)
      lastTime = now
      targetAssembly += (assemblyRef.current - targetAssembly) * Math.min(1, dt * 3.2)
      parts.forEach((part) => {
        part.object.position.lerpVectors(part.home, part.exploded, targetAssembly)
      })
      labels.forEach((label) => label.quaternion.copy(camera.quaternion))
      if (!isolated) root.rotation.y += dt * 0.035
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(frame)
      renderer.domElement.removeEventListener('pointerdown', onPointerDown)
      observer.disconnect()
      apiRef.current = null
      pmrem.dispose()
      root.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose()
          const materials = Array.isArray(object.material) ? object.material : [object.material]
          materials.forEach((material) => material.dispose())
        } else if (object instanceof THREE.Sprite) {
          object.material.map?.dispose()
          object.material.dispose()
        }
      })
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [variant])

  return (
    <section className="mt-10 border-t border-gray-100 pt-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-600">Viewer 3D dedie</p>
          <h2 className="text-base font-bold text-gray-900">{heading}</h2>
          <p className="text-xs text-gray-400">{variantIntro[variant]} · {title}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => apiRef.current?.zoomOut()} className="rounded-md border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">Zoom -</button>
          <button type="button" onClick={() => apiRef.current?.zoomIn()} className="rounded-md border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">Zoom +</button>
          <button type="button" onClick={() => apiRef.current?.reset()} className="rounded-md border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">Reset</button>
          <button type="button" onClick={() => apiRef.current?.toggleLabels()} className="rounded-md border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">Labels</button>
          <button type="button" onClick={() => rootRef.current?.requestFullscreen()} className="rounded-md bg-gray-900 px-3 py-2 text-xs font-semibold text-white hover:bg-black">Plein ecran</button>
        </div>
      </div>

      <div ref={rootRef} className="overflow-hidden rounded-lg border border-gray-900 bg-gray-950">
        <div ref={mountRef} className="w-full" />
        <div className="grid gap-3 border-t border-white/10 bg-gray-950 p-4 text-white lg:grid-cols-[1fr_auto]">
          <div>
            <p className="text-sm font-bold">{selected}</p>
            <p className="text-xs text-gray-400">{selectedLayer}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-xs text-gray-300">
              Assemblage lent
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={assembly}
                onChange={(event) => setAssembly(Number(event.target.value))}
                className="w-32 accent-teal-400"
              />
            </label>
            <button type="button" onClick={() => apiRef.current?.isolate()} className="rounded-md border border-white/15 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10">Isoler</button>
            <button type="button" onClick={() => apiRef.current?.showAll()} className="rounded-md border border-white/15 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10">Tout afficher</button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 border-t border-white/10 bg-gray-950 px-4 pb-4">
          {['Tout', ...layers].map((layer) => (
            <button
              key={layer}
              type="button"
              onClick={() => apiRef.current?.filterLayer(layer)}
              className={`rounded-md border px-3 py-1.5 text-xs font-semibold ${
                activeLayer === layer ? 'border-teal-300 bg-teal-300 text-gray-950' : 'border-white/15 text-white hover:bg-white/10'
              }`}
            >
              {layer}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
