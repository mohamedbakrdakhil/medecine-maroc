'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

type Variant = 'anatomy' | 'biology' | 'chemistry' | 'methodology' | 'public-health'

type Educational3DProps = {
  variant: Variant
  title: string
}

type PartSpec = {
  name: string
  layer: string
  color: string
  mesh: THREE.Mesh
}

const variantLabels: Record<Variant, string> = {
  anatomy: 'Schema anatomique 3D',
  biology: 'Cellule et ADN 3D',
  chemistry: 'Molecules 3D',
  methodology: 'Memoire et apprentissage 3D',
  'public-health': 'Population et statistiques 3D',
}

function makeMaterial(color: string, opacity = 1) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.32,
    metalness: 0.08,
    transparent: opacity < 1,
    opacity,
  })
}

function makeGlass(color: string, opacity = 0.22) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.18,
    metalness: 0.02,
    transmission: 0.28,
    thickness: 0.75,
    transparent: true,
    opacity,
    clearcoat: 0.65,
    clearcoatRoughness: 0.18,
  })
}

function addPart(group: THREE.Group, parts: PartSpec[], name: string, layer: string, color: string, mesh: THREE.Mesh) {
  mesh.name = name
  mesh.userData.partName = name
  mesh.userData.layer = layer
  mesh.userData.home = mesh.position.clone()
  mesh.userData.exploded = mesh.position.clone().multiplyScalar(1.55)
  parts.push({ name, layer, color, mesh })
  group.add(mesh)
}

function addConnection(group: THREE.Group, from: THREE.Vector3, to: THREE.Vector3, color: string) {
  const direction = to.clone().sub(from)
  const length = direction.length()
  const geometry = new THREE.CylinderGeometry(0.025, 0.025, length, 12)
  const material = makeMaterial(color, 0.85)
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.copy(from).add(direction.multiplyScalar(0.5))
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), to.clone().sub(from).normalize())
  group.add(mesh)
}

function addCapsule(group: THREE.Group, parts: PartSpec[], name: string, layer: string, color: string, position: [number, number, number], scale: [number, number, number], rotation: [number, number, number] = [0, 0, 0]) {
  const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.55, 12, 28), makeMaterial(color))
  mesh.position.set(...position)
  mesh.scale.set(...scale)
  mesh.rotation.set(...rotation)
  addPart(group, parts, name, layer, color, mesh)
  return mesh
}

function buildAnatomy(group: THREE.Group, parts: PartSpec[]) {
  const bone = '#d7b98e'
  for (let i = 0; i < 9; i += 1) {
    const rib = new THREE.Mesh(new THREE.TorusGeometry(0.95 + i * 0.035, 0.018, 8, 64, Math.PI * 1.12), makeMaterial(bone))
    rib.position.set(0, 0.72 - i * 0.18, -0.05 - i * 0.02)
    rib.rotation.set(Math.PI * 0.5, 0, Math.PI * 0.94)
    addPart(group, parts, `Cote ${i + 1}`, 'Squelette', bone, rib)
  }

  const sternum = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 1.25, 8, 24), makeMaterial('#c4915a'))
  sternum.position.set(0, 0.05, 0.62)
  addPart(group, parts, 'Sternum', 'Squelette axial', '#c4915a', sternum)

  const spine = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 1.75, 8, 24), makeMaterial('#b08968'))
  spine.position.set(0, 0.02, -0.78)
  addPart(group, parts, 'Colonne thoracique', 'Squelette axial', '#b08968', spine)

  const organMaterial = makeMaterial('#38bdf8', 0.52)
  const right = new THREE.Mesh(new THREE.SphereGeometry(0.5, 36, 28), organMaterial)
  right.scale.set(0.75, 1.25, 0.48)
  right.position.set(-0.52, -0.14, 0.08)
  addPart(group, parts, 'Poumon droit', 'Organe', '#38bdf8', right)

  const left = new THREE.Mesh(new THREE.SphereGeometry(0.5, 36, 28), organMaterial.clone())
  left.scale.set(0.75, 1.25, 0.48)
  left.position.set(0.52, -0.14, 0.08)
  addPart(group, parts, 'Poumon gauche', 'Organe', '#38bdf8', left)

  const heart = new THREE.Mesh(new THREE.SphereGeometry(0.28, 36, 28), makeMaterial('#ef4444'))
  heart.scale.set(0.85, 1.1, 0.75)
  heart.position.set(0.08, -0.42, 0.48)
  addPart(group, parts, 'Coeur', 'Mediastin', '#ef4444', heart)
}

function buildBiology(group: THREE.Group, parts: PartSpec[]) {
  const membrane = new THREE.Mesh(new THREE.SphereGeometry(1.35, 96, 64), makeGlass('#22d3ee', 0.16))
  membrane.scale.set(1.28, 0.92, 0.72)
  addPart(group, parts, 'Membrane cellulaire', 'Cellule', '#22d3ee', membrane)

  const cytoplasm = new THREE.Mesh(new THREE.SphereGeometry(1.18, 72, 42), makeMaterial('#0f766e', 0.12))
  cytoplasm.scale.set(1.18, 0.78, 0.58)
  addPart(group, parts, 'Cytoplasme', 'Cellule', '#0f766e', cytoplasm)

  const nucleus = new THREE.Mesh(new THREE.SphereGeometry(0.42, 64, 40), makeGlass('#a78bfa', 0.52))
  nucleus.position.set(-0.22, 0.05, 0.12)
  addPart(group, parts, 'Noyau', 'Genetique', '#a78bfa', nucleus)

  const nucleolus = new THREE.Mesh(new THREE.SphereGeometry(0.13, 36, 24), makeMaterial('#c084fc'))
  nucleolus.position.set(-0.3, 0.09, 0.27)
  addPart(group, parts, 'Nucleole', 'Genetique', '#c084fc', nucleolus)

  for (let i = 0; i < 18; i += 1) {
    const angle = i * 0.72
    const ribosome = new THREE.Mesh(new THREE.SphereGeometry(0.045, 20, 16), makeMaterial(i % 2 ? '#f97316' : '#facc15'))
    ribosome.position.set(Math.cos(angle) * 1.0, Math.sin(angle * 1.4) * 0.48, Math.sin(angle) * 0.46)
    addPart(group, parts, `Ribosome ${i + 1}`, 'Ribosomes', i % 2 ? '#f97316' : '#facc15', ribosome)
  }

  addCapsule(group, parts, 'Mitochondrie 1', 'Organites', '#fb7185', [0.62, -0.34, -0.12], [1, 0.72, 0.62], [0.9, 0.2, 1.1])
  addCapsule(group, parts, 'Mitochondrie 2', 'Organites', '#fb7185', [-0.82, -0.22, -0.1], [0.82, 0.58, 0.5], [1.1, -0.4, -0.75])
  addCapsule(group, parts, 'Appareil de Golgi', 'Organites', '#38bdf8', [0.52, 0.32, 0.08], [1.05, 0.26, 0.34], [0.7, 0, 0.65])
  addCapsule(group, parts, 'Reticulum endoplasmique', 'Organites', '#2dd4bf', [-0.62, 0.26, -0.16], [1.2, 0.22, 0.42], [0.9, 0.6, -0.28])

  const dnaGroup = new THREE.Group()
  const a = '#60a5fa'
  const b = '#f472b6'
  for (let i = 0; i < 18; i += 1) {
    const y = -0.9 + i * 0.1
    const angle = i * 0.68
    const p1 = new THREE.Vector3(Math.cos(angle) * 0.18 + 0.62, y, Math.sin(angle) * 0.18)
    const p2 = new THREE.Vector3(Math.cos(angle + Math.PI) * 0.18 + 0.62, y, Math.sin(angle + Math.PI) * 0.18)
    const s1 = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 12), makeMaterial(a))
    s1.position.copy(p1)
    const s2 = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 12), makeMaterial(b))
    s2.position.copy(p2)
    dnaGroup.add(s1, s2)
    addConnection(dnaGroup, p1, p2, '#e2e8f0')
  }
  dnaGroup.userData.home = dnaGroup.position.clone()
  const box = new THREE.Box3().setFromObject(dnaGroup)
  const center = new THREE.Vector3()
  box.getCenter(center)
  dnaGroup.children.forEach((child) => child.position.sub(center))
  dnaGroup.position.set(0.65, 0, 0)
  const dnaWrapper = new THREE.Mesh(new THREE.SphereGeometry(0.01), makeMaterial('#ffffff', 0))
  dnaWrapper.visible = false
  dnaWrapper.add(dnaGroup)
  addPart(group, parts, 'Double helice ADN', 'Genetique', '#60a5fa', dnaWrapper)
}

function buildChemistry(group: THREE.Group, parts: PartSpec[]) {
  const atoms = [
    ['Carbone alpha', '#64748b', -0.45, 0, 0],
    ['Oxygene', '#ef4444', 0.25, 0.42, 0],
    ['Azote', '#3b82f6', 0.32, -0.38, 0],
    ['Hydrogene', '#e5e7eb', -0.95, 0.35, 0],
    ['Groupement R', '#22c55e', -0.18, 0, 0.72],
    ['Site actif', '#f59e0b', 0.82, 0, -0.22],
  ] as const

  const positions: THREE.Vector3[] = []
  atoms.forEach(([name, color, x, y, z], index) => {
    const atom = new THREE.Mesh(new THREE.SphereGeometry(index === 0 ? 0.2 : 0.17, 36, 24), makeMaterial(color))
    atom.position.set(x, y, z)
    positions.push(atom.position.clone())
    addPart(group, parts, name, 'Molecule', color, atom)
  })
  addConnection(group, positions[0], positions[1], '#94a3b8')
  addConnection(group, positions[0], positions[2], '#94a3b8')
  addConnection(group, positions[0], positions[3], '#94a3b8')
  addConnection(group, positions[0], positions[4], '#94a3b8')
  addConnection(group, positions[1], positions[5], '#94a3b8')

  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.018, 10, 96), makeMaterial('#14b8a6', 0.55))
  ring.rotation.x = Math.PI * 0.5
  addPart(group, parts, 'Environnement biochimique', 'Structure', '#14b8a6', ring)

  for (let i = 0; i < 7; i += 1) {
    const angle = (i / 7) * Math.PI * 2
    const bead = new THREE.Mesh(new THREE.SphereGeometry(0.11, 28, 20), makeMaterial(i % 2 ? '#06b6d4' : '#8b5cf6'))
    bead.position.set(Math.cos(angle) * 0.75, -0.75 + i * 0.08, Math.sin(angle) * 0.34)
    addPart(group, parts, `Residus peptidique ${i + 1}`, 'Proteine', i % 2 ? '#06b6d4' : '#8b5cf6', bead)
  }
}

function buildMethodology(group: THREE.Group, parts: PartSpec[]) {
  const brain = new THREE.Mesh(new THREE.SphereGeometry(0.82, 64, 36), makeGlass('#f0abfc', 0.24))
  brain.scale.set(1.26, 0.82, 0.66)
  addPart(group, parts, 'Cerveau schematique', 'Memoire', '#f0abfc', brain)

  const colors = ['#22d3ee', '#a78bfa', '#f472b6', '#facc15', '#34d399', '#fb7185']
  const nodes: THREE.Vector3[] = []
  for (let i = 0; i < 15; i += 1) {
    const angle = i * 0.9
    const radius = i === 0 ? 0 : 0.58 + (i % 3) * 0.22
    const node = new THREE.Mesh(new THREE.SphereGeometry(i === 0 ? 0.22 : 0.12, 32, 20), makeMaterial(colors[i % colors.length]))
    node.position.set(Math.cos(angle) * radius, Math.sin(i * 1.7) * 0.38, Math.sin(angle) * radius)
    nodes.push(node.position.clone())
    addPart(group, parts, i === 0 ? 'Memoire centrale' : `Synapse ${i}`, 'Reseau neuronal', colors[i % colors.length], node)
  }
  for (let i = 1; i < nodes.length; i += 1) addConnection(group, nodes[0], nodes[i], '#64748b')
  for (let i = 1; i < nodes.length - 1; i += 2) addConnection(group, nodes[i], nodes[i + 1], '#475569')
}

function buildPublicHealth(group: THREE.Group, parts: PartSpec[]) {
  for (let i = 0; i < 36; i += 1) {
    const x = (i % 6 - 2.5) * 0.28
    const z = (Math.floor(i / 6) - 2.5) * 0.28
    const height = 0.18 + ((i * 7) % 11) * 0.045
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.16, height, 0.16), makeMaterial(i % 5 === 0 ? '#ef4444' : '#14b8a6'))
    bar.position.set(x, -0.68 + height / 2, z)
    addPart(group, parts, i % 5 === 0 ? `Cas a risque ${i + 1}` : `Individu ${i + 1}`, 'Population', i % 5 === 0 ? '#ef4444' : '#14b8a6', bar)
  }

  const curvePoints = [
    new THREE.Vector3(-1.05, 0.55, 0.65),
    new THREE.Vector3(-0.55, 0.85, 0.3),
    new THREE.Vector3(0.05, 0.72, 0.04),
    new THREE.Vector3(0.56, 1.08, -0.3),
    new THREE.Vector3(1.05, 0.92, -0.62),
  ]
  const curve = new THREE.CatmullRomCurve3(curvePoints)
  const trend = new THREE.Mesh(new THREE.TubeGeometry(curve, 64, 0.03, 12), makeMaterial('#facc15'))
  addPart(group, parts, 'Courbe epidemiologique', 'Statistiques', '#facc15', trend)

  const map = new THREE.Mesh(new THREE.CircleGeometry(1.35, 72), makeMaterial('#064e3b', 0.26))
  map.rotation.x = -Math.PI * 0.5
  map.position.y = -0.72
  addPart(group, parts, 'Territoire sanitaire', 'Carte', '#064e3b', map)
}

function buildScene(variant: Variant, root: THREE.Group, parts: PartSpec[]) {
  if (variant === 'biology') buildBiology(root, parts)
  else if (variant === 'chemistry') buildChemistry(root, parts)
  else if (variant === 'methodology') buildMethodology(root, parts)
  else if (variant === 'public-health') buildPublicHealth(root, parts)
  else buildAnatomy(root, parts)
}

export default function Educational3D({ variant, title }: Educational3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const apiRef = useRef<{
    zoomIn: () => void
    zoomOut: () => void
    reset: () => void
    isolate: () => void
    showAll: () => void
    filterLayer: (layer: string) => void
    toggleLabels: () => void
  } | null>(null)
  const [selected, setSelected] = useState('Clique sur une piece 3D')
  const [layer, setLayer] = useState(variantLabels[variant])
  const [layers, setLayers] = useState<string[]>([])
  const [activeLayer, setActiveLayer] = useState('Toutes')
  const [labelsOn, setLabelsOn] = useState(true)
  const [explode, setExplode] = useState(0.35)
  const [fullscreen, setFullscreen] = useState(false)
  const explodeRef = useRef(explode)
  const labelsOnRef = useRef(labelsOn)

  const heading = useMemo(() => variantLabels[variant], [variant])

  useEffect(() => {
    explodeRef.current = explode
  }, [explode])

  useEffect(() => {
    labelsOnRef.current = labelsOn
  }, [labelsOn])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#020617')

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
    camera.position.set(0, 0.65, 4.6)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.1
    mount.appendChild(renderer.domElement)

    const pmrem = new THREE.PMREMGenerator(renderer)
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.enablePan = true
    controls.screenSpacePanning = true
    controls.minDistance = 1.6
    controls.maxDistance = 8
    if ('zoomToCursor' in controls) {
      ;(controls as OrbitControls & { zoomToCursor: boolean }).zoomToCursor = true
    }

    scene.add(new THREE.HemisphereLight('#ffffff', '#1e293b', 2.4))
    const key = new THREE.DirectionalLight('#ffffff', 3.2)
    key.position.set(3, 4, 5)
    scene.add(key)
    const fill = new THREE.DirectionalLight('#38bdf8', 1.2)
    fill.position.set(-4, 1, 2)
    scene.add(fill)

    const root = new THREE.Group()
    scene.add(root)
    const parts: PartSpec[] = []
    buildScene(variant, root, parts)
    setLayers(Array.from(new Set(parts.map((part) => part.layer))))

    const selectable = parts.map((part) => part.mesh)
    const labelSprites: THREE.Sprite[] = []
    let selectedMesh: THREE.Mesh | null = null
    let isolated = false
    let targetExplode = explodeRef.current

    parts.forEach((part) => {
      const canvas = document.createElement('canvas')
      canvas.width = 512
      canvas.height = 128
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.fillStyle = 'rgba(2,6,23,0.72)'
      ctx.strokeStyle = 'rgba(45,212,191,0.5)'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.roundRect(18, 26, 476, 76, 22)
      ctx.fill()
      ctx.stroke()
      ctx.fillStyle = '#ffffff'
      ctx.font = '600 30px Arial'
      ctx.textBaseline = 'middle'
      ctx.fillText(part.name.slice(0, 26), 42, 66)
      const texture = new THREE.CanvasTexture(canvas)
      texture.colorSpace = THREE.SRGBColorSpace
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }))
      const home = part.mesh.userData.home as THREE.Vector3
      sprite.position.copy(home).add(new THREE.Vector3(0, 0.22, 0))
      sprite.scale.set(0.62, 0.16, 1)
      sprite.userData.layer = part.layer
      labelSprites.push(sprite)
      root.add(sprite)
    })

    const box = new THREE.Box3().setFromObject(root)
    const center = new THREE.Vector3()
    box.getCenter(center)
    root.position.sub(center)

    const resize = () => {
      const width = mount.clientWidth
      const height = Math.max(430, Math.min(760, Math.round(width * 0.64)))
      renderer.setSize(width, height)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(mount)

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    const selectMesh = (mesh: THREE.Mesh) => {
      selectedMesh = mesh
      setSelected(String(mesh.userData.partName ?? mesh.name ?? 'Piece 3D'))
      setLayer(String(mesh.userData.layer ?? heading))
      selectable.forEach((object) => {
        const material = object.material
        if (material instanceof THREE.MeshStandardMaterial) {
          material.emissive.set(object === mesh ? '#0f766e' : '#000000')
          material.emissiveIntensity = object === mesh ? 0.32 : 0
        }
      })
    }

    const onPointerDown = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)
      const hits = raycaster.intersectObjects(selectable, true)
      const hit = hits.find((item) => selectable.includes(item.object as THREE.Mesh))
      if (hit?.object instanceof THREE.Mesh) selectMesh(hit.object)
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
        camera.position.set(0, 0.65, 4.6)
        controls.target.set(0, 0, 0)
        controls.update()
      },
      isolate: () => {
        if (!selectedMesh) return
        const isolatedMesh = selectedMesh
        const isolatedHome = isolatedMesh.userData.home as THREE.Vector3 | undefined
        isolated = true
        selectable.forEach((mesh) => {
          mesh.visible = mesh === isolatedMesh || Boolean(isolatedMesh.children.includes(mesh))
        })
        labelSprites.forEach((sprite) => {
          sprite.visible = Boolean(isolatedHome) && sprite.position.distanceTo(isolatedHome ?? isolatedMesh.position) < 0.4
        })
      },
      showAll: () => {
        isolated = false
        setActiveLayer('Toutes')
        selectable.forEach((mesh) => {
          mesh.visible = true
        })
        labelSprites.forEach((sprite) => {
          sprite.visible = labelsOnRef.current
        })
      },
      filterLayer: (targetLayer: string) => {
        isolated = false
        setActiveLayer(targetLayer)
        selectable.forEach((mesh) => {
          mesh.visible = targetLayer === 'Toutes' || mesh.userData.layer === targetLayer
        })
        labelSprites.forEach((sprite) => {
          sprite.visible = labelsOnRef.current && (targetLayer === 'Toutes' || sprite.userData.layer === targetLayer)
        })
      },
      toggleLabels: () => {
        setLabelsOn((current) => {
          labelSprites.forEach((sprite) => {
            sprite.visible = !current
          })
          return !current
        })
      },
    }

    const onFullscreenChange = () => setFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFullscreenChange)

    let frame = 0
    let lastTime = performance.now()
    const animate = () => {
      frame = requestAnimationFrame(animate)
      const now = performance.now()
      const dt = Math.min((now - lastTime) / 1000, 0.05)
      lastTime = now
      targetExplode += (explodeRef.current - targetExplode) * Math.min(1, dt * 5)
      parts.forEach((part, index) => {
        const home = part.mesh.userData.home as THREE.Vector3 | undefined
        const exploded = part.mesh.userData.exploded as THREE.Vector3 | undefined
        if (home && exploded) part.mesh.position.lerpVectors(home, exploded, targetExplode)
        part.mesh.rotation.y += dt * (0.06 + (index % 3) * 0.012)
      })
      labelSprites.forEach((sprite) => {
        sprite.quaternion.copy(camera.quaternion)
      })
      root.rotation.y += dt * 0.025
      if (!isolated) controls.update()
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('fullscreenchange', onFullscreenChange)
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
  }, [heading, variant])

  return (
    <section className="mt-10 border-t border-gray-100 pt-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-600">3D premium interactif</p>
          <h2 className="text-base font-bold text-gray-900">{heading}</h2>
          <p className="text-xs text-gray-400">{title}</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => apiRef.current?.zoomOut()} className="rounded-md border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">-</button>
          <button type="button" onClick={() => apiRef.current?.zoomIn()} className="rounded-md border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">+</button>
          <button type="button" onClick={() => apiRef.current?.reset()} className="rounded-md border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">Reset</button>
          <button type="button" onClick={() => apiRef.current?.toggleLabels()} className="rounded-md border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">Labels</button>
          <button type="button" onClick={() => rootRef.current?.requestFullscreen()} className="rounded-md bg-gray-900 px-3 py-2 text-xs font-semibold text-white hover:bg-black">Plein ecran</button>
        </div>
      </div>

      <div ref={rootRef} className="overflow-hidden rounded-lg border border-gray-900 bg-gray-950">
        <div ref={mountRef} className="w-full" />
        <div className="grid gap-3 border-t border-white/10 bg-gray-950 p-4 text-white sm:grid-cols-[1fr_auto]">
          <div>
            <p className="text-sm font-bold">{selected}</p>
            <p className="text-xs text-gray-400">{layer}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-xs text-gray-300">
              Slow assembly
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={explode}
                onChange={(event) => setExplode(Number(event.target.value))}
                className="w-28 accent-teal-400"
              />
            </label>
            <button type="button" onClick={() => apiRef.current?.isolate()} className="rounded-md border border-white/15 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10">Isoler</button>
            <button type="button" onClick={() => apiRef.current?.showAll()} className="rounded-md border border-white/15 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10">Tout afficher</button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 border-t border-white/10 bg-gray-950 px-4 pb-4">
          {['Toutes', ...layers].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => apiRef.current?.filterLayer(item)}
              className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeLayer === item
                  ? 'border-teal-300 bg-teal-400 text-gray-950'
                  : 'border-white/15 text-white hover:bg-white/10'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {fullscreen && (
        <div className="fixed bottom-4 right-4 z-[60] rounded-full bg-black/70 px-3 py-2 text-xs font-semibold text-white">
          Mode plein ecran actif
        </div>
      )}
    </section>
  )
}
