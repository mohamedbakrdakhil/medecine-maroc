'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

type Label = {
  text: string
  color: string
  position: [number, number, number]
}

type StructureInfo = {
  id: string
  title: string
  layer: string
  text: string
}

const structureInfo: Record<string, StructureInfo> = {
  cage: {
    id: 'cage',
    title: 'Cage thoracique',
    layer: 'Squelette',
    text: 'Ensemble formé par les côtes, le sternum et la colonne thoracique. Elle protège les organes thoraciques et participe aux mouvements respiratoires.',
  },
  poumon_droit: {
    id: 'poumon_droit',
    title: 'Poumon droit',
    layer: 'Appareil respiratoire',
    text: 'Organe respiratoire droit, situé dans la cavité pleurale droite. Il est en rapport avec la cage thoracique, le médiastin et le diaphragme.',
  },
  poumon_gauche: {
    id: 'poumon_gauche',
    title: 'Poumon gauche',
    layer: 'Appareil respiratoire',
    text: 'Organe respiratoire gauche, moulé contre le médiastin et le coeur. Sa lecture spatiale aide à comprendre les rapports cardio-pulmonaires.',
  },
  coeur: {
    id: 'coeur',
    title: 'Coeur',
    layer: 'Médiastin',
    text: 'Organe central du médiastin moyen. Il est situé entre les poumons, en arrière du sternum et au-dessus du diaphragme.',
  },
  diaphragme: {
    id: 'diaphragme',
    title: 'Diaphragme',
    layer: 'Muscle respiratoire',
    text: 'Cloison musculo-tendineuse séparant thorax et abdomen. Sa coupole explique les rapports avec les bases pulmonaires.',
  },
  mediastin: {
    id: 'mediastin',
    title: 'Médiastin',
    layer: 'Région topographique',
    text: 'Région médiane du thorax contenant notamment le coeur, les gros vaisseaux, la trachée et des éléments nerveux et lymphatiques.',
  },
  trachee: {
    id: 'trachee',
    title: 'Trachée',
    layer: 'Voies aériennes',
    text: 'Conduit aérien médian descendant vers la bifurcation bronchique. Elle sert de repère pour l’organisation respiratoire du thorax.',
  },
}

const labels: Label[] = [
  { text: 'Poumon droit', color: '#0f766e', position: [-1.25, 0.35, 0.22] },
  { text: 'Poumon gauche', color: '#0f766e', position: [1.25, 0.35, 0.22] },
  { text: 'Coeur', color: '#b91c1c', position: [0, -0.18, 0.72] },
  { text: 'Diaphragme', color: '#7c3aed', position: [0, -1.45, 0.08] },
  { text: 'Cage thoracique', color: '#92400e', position: [0, 1.45, -0.05] },
  { text: 'Mediastin', color: '#334155', position: [0, 0.38, 0.02] },
]

function makeLabelTexture(text: string, color: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = 'rgba(255,255,255,0.92)'
  ctx.strokeStyle = 'rgba(15,23,42,0.14)'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.roundRect(18, 24, 476, 80, 22)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(56, 64, 13, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#111827'
  ctx.font = '600 34px Arial'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 84, 66)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function addRib(group: THREE.Group, y: number, width: number, depth: number, z: number) {
  const curve = new THREE.EllipseCurve(0, y, width, depth, Math.PI * 0.08, Math.PI * 0.92, false, 0)
  const points = curve.getPoints(64).map((point) => new THREE.Vector3(point.x, point.y, z))
  const geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 64, 0.025, 8, false)
  const material = new THREE.MeshStandardMaterial({
    color: '#d8b384',
    roughness: 0.45,
    metalness: 0.05,
  })
  const rib = new THREE.Mesh(geometry, material)
  rib.userData.structureId = 'cage'
  group.add(rib)
}

function addLung(group: THREE.Group, side: -1 | 1) {
  const lung = new THREE.Group()
  lung.userData.structureId = side === -1 ? 'poumon_droit' : 'poumon_gauche'
  const material = new THREE.MeshStandardMaterial({
    color: side === -1 ? '#5eead4' : '#2dd4bf',
    transparent: true,
    opacity: 0.72,
    roughness: 0.62,
  })
  const upper = new THREE.Mesh(new THREE.SphereGeometry(0.62, 36, 32), material)
  upper.scale.set(0.78, 1.1, 0.52)
  upper.position.set(side * 0.68, 0.45, 0.1)
  upper.userData.structureId = lung.userData.structureId
  const lower = new THREE.Mesh(new THREE.SphereGeometry(0.7, 36, 32), material)
  lower.scale.set(0.7, 1.25, 0.5)
  lower.position.set(side * 0.75, -0.45, 0.08)
  lower.userData.structureId = lung.userData.structureId
  lung.add(upper, lower)

  const bronchusMaterial = new THREE.MeshStandardMaterial({ color: '#0f766e', roughness: 0.55 })
  const bronchus = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.88, 16), bronchusMaterial)
  bronchus.rotation.z = side * Math.PI * 0.28
  bronchus.position.set(side * 0.34, 0.32, 0.35)
  bronchus.userData.structureId = 'trachee'
  lung.add(bronchus)
  group.add(lung)
}

export default function Thorax3D() {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const apiRef = useRef<{
    zoomIn?: () => void
    zoomOut?: () => void
    reset?: () => void
    isolate?: () => void
    showAll?: () => void
    toggleLabels?: () => void
  }>({})
  const [selected, setSelected] = useState<StructureInfo>({
    id: 'intro',
    title: 'Clique sur une structure du thorax',
    layer: 'Exploration 3D',
    text: 'Sélectionne la cage thoracique, un poumon, le coeur, le diaphragme, le médiastin ou la trachée pour afficher sa fiche.',
  })
  const [fullScreenOn, setFullScreenOn] = useState(false)
  const [labelsOn, setLabelsOn] = useState(true)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#020617')

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
    camera.position.set(0, 0.55, 6.2)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15
    renderer.setClearColor('#020617', 1)
    mount.appendChild(renderer.domElement)

    const pmrem = new THREE.PMREMGenerator(renderer)
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.enablePan = true
    controls.screenSpacePanning = true
    controls.minDistance = 2.2
    controls.maxDistance = 12
    if ('zoomToCursor' in controls) {
      ;(controls as OrbitControls & { zoomToCursor: boolean }).zoomToCursor = true
    }

    const ambient = new THREE.HemisphereLight('#ffffff', '#1e293b', 2.2)
    scene.add(ambient)

    const key = new THREE.DirectionalLight('#ffffff', 2.8)
    key.position.set(3.5, 4, 5)
    scene.add(key)

    const fill = new THREE.DirectionalLight('#bae6fd', 1.3)
    fill.position.set(-4, 1.8, 2)
    scene.add(fill)

    const thorax = new THREE.Group()
    scene.add(thorax)
    const selectable: THREE.Object3D[] = []
    let selectedStructureId: string | null = null
    let labelsVisible = true

    const ribGroup = new THREE.Group()
    for (let i = 0; i < 9; i += 1) {
      addRib(ribGroup, 1.12 - i * 0.24, 1.85 - i * 0.035, 0.35 + i * 0.02, -0.12 - i * 0.035)
    }
    thorax.add(ribGroup)

    const sternumMaterial = new THREE.MeshStandardMaterial({ color: '#c89a62', roughness: 0.46 })
    const sternum = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 1.72, 8, 20), sternumMaterial)
    sternum.position.set(0, 0.22, 0.72)
    sternum.rotation.x = Math.PI * 0.03
    sternum.userData.structureId = 'cage'
    thorax.add(sternum)

    const spineMaterial = new THREE.MeshStandardMaterial({ color: '#b08968', roughness: 0.55 })
    const spine = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 2.55, 8, 20), spineMaterial)
    spine.position.set(0, 0.05, -0.88)
    spine.userData.structureId = 'cage'
    thorax.add(spine)

    addLung(thorax, -1)
    addLung(thorax, 1)

    const heartMaterial = new THREE.MeshStandardMaterial({
      color: '#dc2626',
      roughness: 0.5,
      metalness: 0.03,
    })
    const heart = new THREE.Group()
    const heartBody = new THREE.Mesh(new THREE.SphereGeometry(0.38, 40, 32), heartMaterial)
    heartBody.scale.set(0.78, 1, 0.65)
    heartBody.position.set(0.08, -0.34, 0.54)
    heartBody.userData.structureId = 'coeur'
    const apex = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.55, 32), heartMaterial)
    apex.position.set(0.03, -0.82, 0.56)
    apex.rotation.z = Math.PI
    apex.userData.structureId = 'coeur'
    heart.add(heartBody, apex)
    heart.userData.structureId = 'coeur'
    thorax.add(heart)

    const vesselMaterial = new THREE.MeshStandardMaterial({ color: '#991b1b', roughness: 0.42 })
    const aorta = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.035, 14, 42, Math.PI * 1.15), vesselMaterial)
    aorta.position.set(0.03, 0.15, 0.58)
    aorta.rotation.set(Math.PI * 0.58, Math.PI * 0.06, Math.PI * 0.08)
    aorta.userData.structureId = 'coeur'
    thorax.add(aorta)

    const tracheaMaterial = new THREE.MeshStandardMaterial({ color: '#64748b', roughness: 0.45 })
    const trachea = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.1, 18), tracheaMaterial)
    trachea.position.set(0, 0.95, 0.18)
    trachea.userData.structureId = 'trachee'
    thorax.add(trachea)

    const diaphragmMaterial = new THREE.MeshStandardMaterial({
      color: '#8b5cf6',
      transparent: true,
      opacity: 0.58,
      roughness: 0.5,
      side: THREE.DoubleSide,
    })
    const diaphragm = new THREE.Mesh(new THREE.SphereGeometry(1.42, 48, 20, 0, Math.PI * 2, 0, Math.PI * 0.42), diaphragmMaterial)
    diaphragm.scale.set(1.05, 0.28, 0.48)
    diaphragm.rotation.x = Math.PI
    diaphragm.position.set(0, -1.34, 0.05)
    diaphragm.userData.structureId = 'diaphragme'
    thorax.add(diaphragm)

    const mediastinumMaterial = new THREE.MeshStandardMaterial({
      color: '#94a3b8',
      transparent: true,
      opacity: 0.25,
      roughness: 0.7,
    })
    const mediastinum = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 1.9, 10, 24), mediastinumMaterial)
    mediastinum.position.set(0, 0.06, 0.12)
    mediastinum.userData.structureId = 'mediastin'
    thorax.add(mediastinum)

    labels.forEach((label) => {
      const texture = makeLabelTexture(label.text, label.color)
      if (!texture) return
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }))
      sprite.position.set(...label.position)
      sprite.scale.set(1.15, 0.29, 1)
      sprite.userData.isLabel = true
      thorax.add(sprite)
    })

    thorax.traverse((object) => {
      if (object instanceof THREE.Mesh && object.userData.structureId) selectable.push(object)
    })

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    const getStructureId = (object: THREE.Object3D | null): string | null => {
      let current = object
      while (current) {
        if (typeof current.userData.structureId === 'string') return current.userData.structureId
        current = current.parent
      }
      return null
    }
    const setVisibleByStructure = (id: string | null) => {
      thorax.traverse((object) => {
        if (object.userData.isLabel) {
          object.visible = labelsVisible && !id
          return
        }
        if (!(object instanceof THREE.Mesh)) return
        const structureId = getStructureId(object)
        if (structureId) object.visible = !id || structureId === id
      })
    }
    const focusStructure = (id: string) => {
      const box = new THREE.Box3()
      thorax.traverse((object) => {
        if (object instanceof THREE.Mesh && getStructureId(object) === id && object.visible) {
          box.expandByObject(object)
        }
      })
      if (box.isEmpty()) return
      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())
      const targetSize = Math.max(size.x, size.y, size.z, 0.3)
      controls.target.copy(center)
      camera.position.copy(center).add(new THREE.Vector3(0.45, 0.25, 1).normalize().multiplyScalar(targetSize * 4.2))
      controls.minDistance = targetSize * 0.75
      controls.maxDistance = Math.max(targetSize * 12, 8)
      controls.update()
    }
    const onPointerDown = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)
      const hit = raycaster.intersectObjects(selectable, true)[0]
      const id = getStructureId(hit?.object ?? null)
      if (!id) return
      selectedStructureId = id
      const info = structureInfo[id]
      if (info) setSelected(info)
    }
    renderer.domElement.addEventListener('pointerdown', onPointerDown)

    apiRef.current = {
      zoomIn: () => {
        const offset = camera.position.clone().sub(controls.target)
        camera.position.copy(controls.target).add(offset.multiplyScalar(0.72))
        controls.update()
      },
      zoomOut: () => {
        const offset = camera.position.clone().sub(controls.target)
        camera.position.copy(controls.target).add(offset.multiplyScalar(1.32))
        controls.update()
      },
      reset: () => {
        selectedStructureId = null
        labelsVisible = true
        setLabelsOn(true)
        setVisibleByStructure(null)
        camera.position.set(0, 0.55, 6.2)
        controls.target.set(0, 0, 0)
        controls.minDistance = 2.2
        controls.maxDistance = 12
        controls.update()
      },
      isolate: () => {
        if (!selectedStructureId) return
        setVisibleByStructure(selectedStructureId)
        focusStructure(selectedStructureId)
      },
      showAll: () => {
        selectedStructureId = null
        setVisibleByStructure(null)
      },
      toggleLabels: () => {
        labelsVisible = !labelsVisible
        setLabelsOn(labelsVisible)
        setVisibleByStructure(selectedStructureId ? selectedStructureId : null)
      },
    }

    const resize = () => {
      const width = mount.clientWidth
      const height = Math.max(620, mount.clientHeight || Math.round(width * 0.72))
      renderer.setSize(width, height)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }
    resize()

    const observer = new ResizeObserver(resize)
    observer.observe(mount)

    let animationFrame = 0
    const animate = () => {
      animationFrame = requestAnimationFrame(animate)
      controls.update()
      heart.scale.setScalar(1 + Math.sin(performance.now() * 0.004) * 0.025)
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(animationFrame)
      observer.disconnect()
      renderer.domElement.removeEventListener('pointerdown', onPointerDown)
      controls.dispose()
      pmrem.dispose()
      renderer.dispose()
      mount.removeChild(renderer.domElement)
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose()
          const materials = Array.isArray(object.material) ? object.material : [object.material]
          materials.forEach((material) => material.dispose())
        }
      })
    }
  }, [])

  useEffect(() => {
    const handleFullScreenChange = () => {
      setFullScreenOn(document.fullscreenElement === rootRef.current)
      window.setTimeout(() => window.dispatchEvent(new Event('resize')), 80)
    }
    document.addEventListener('fullscreenchange', handleFullScreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange)
  }, [])

  const toggleFullScreen = async () => {
    const root = rootRef.current
    if (!root) return
    if (document.fullscreenElement === root) await document.exitFullscreen?.()
    else await root.requestFullscreen?.()
  }

  return (
    <section className="mt-10 border-t border-gray-100 pt-8">
      <div className="mb-5">
        <h2 className="text-base font-bold text-teal-700 mb-1">Modele 3D interactif - thorax</h2>
        <p className="text-xs text-gray-400">Fond noir, plein ecran, zoom, selection et isolation des structures</p>
      </div>
      <div ref={rootRef} className={`thorax3d-root${fullScreenOn ? ' fullscreen' : ''}`}>
        <div className="thorax3d-stage">
          <div ref={mountRef} className="thorax3d-canvas" />
          <div className="thorax3d-tools">
            <button className="primary" onClick={toggleFullScreen}>{fullScreenOn ? 'Quitter plein écran' : 'Plein écran'}</button>
            <button onClick={() => apiRef.current.zoomIn?.()}>Zoom +</button>
            <button onClick={() => apiRef.current.zoomOut?.()}>Zoom -</button>
            <button className="primary" onClick={() => apiRef.current.isolate?.()}>Isoler sélection</button>
            <button onClick={() => apiRef.current.showAll?.()}>Tout afficher</button>
            <button className={labelsOn ? 'active' : ''} onClick={() => apiRef.current.toggleLabels?.()}>{labelsOn ? 'Noms ON' : 'Noms OFF'}</button>
            <button onClick={() => apiRef.current.reset?.()}>Reset vue</button>
          </div>
          <div className="thorax3d-hud">
            <h3>{selected.title}</h3>
            <p className="meta">{selected.layer}</p>
            <p>{selected.text}</p>
          </div>
        </div>
        <aside className="thorax3d-panel">
          <p className="section">Structure sélectionnée</p>
          <h3>{selected.title}</h3>
          <p className="meta">{selected.layer}</p>
          <p>{selected.text}</p>
          <div className="grid">
            <button className="primary full" onClick={toggleFullScreen}>{fullScreenOn ? 'Quitter le plein écran' : 'Ouvrir en plein écran'}</button>
            <button onClick={() => apiRef.current.zoomIn?.()}>Zoom +</button>
            <button onClick={() => apiRef.current.zoomOut?.()}>Zoom -</button>
            <button className="primary full" onClick={() => apiRef.current.isolate?.()}>Isoler la structure cliquée</button>
            <button onClick={() => apiRef.current.showAll?.()}>Tout afficher</button>
            <button onClick={() => apiRef.current.reset?.()}>Reset vue</button>
          </div>
        </aside>
      </div>
      <style>{`
        .thorax3d-root{display:grid;grid-template-columns:minmax(0,1fr)340px;gap:14px;width:100%;min-height:720px}
        .thorax3d-root.fullscreen{height:100vh;min-height:100vh;background:#020617;padding:16px;box-sizing:border-box;grid-template-columns:minmax(0,1fr)360px}
        .thorax3d-stage{position:relative;min-height:720px;border-radius:18px;overflow:hidden;border:1px solid rgba(148,163,184,.22);background:linear-gradient(180deg,#020617,#0f172a 60%,#020617);box-shadow:0 20px 70px rgba(2,6,23,.28)}
        .thorax3d-root.fullscreen .thorax3d-stage{min-height:calc(100vh - 32px)}
        .thorax3d-canvas{width:100%;height:100%;min-height:720px}
        .thorax3d-root.fullscreen .thorax3d-canvas{min-height:calc(100vh - 32px)}
        .thorax3d-canvas canvas{display:block;width:100%;height:100%;cursor:grab}
        .thorax3d-tools{position:absolute;left:12px;right:12px;top:12px;display:flex;flex-wrap:wrap;gap:8px;z-index:3;pointer-events:none}
        .thorax3d-tools button,.thorax3d-panel button{appearance:none;border:1px solid rgba(15,23,42,.08);border-radius:999px;background:rgba(255,255,255,.94);font-size:12px;font-weight:850;padding:8px 11px;cursor:pointer;box-shadow:0 6px 18px rgba(15,23,42,.08);pointer-events:auto}
        .thorax3d-tools button:hover,.thorax3d-panel button:hover{background:#ecfeff}
        .thorax3d-tools .primary,.thorax3d-panel .primary{background:#cffafe;color:#155e75}
        .thorax3d-tools .active,.thorax3d-panel .active{background:#ccfbf1;color:#0f766e}
        .thorax3d-hud{position:absolute;right:14px;bottom:14px;max-width:min(340px,calc(100% - 28px));background:rgba(15,23,42,.84);color:white;border-radius:14px;padding:12px 14px;box-shadow:0 18px 54px rgba(15,23,42,.22);pointer-events:none}
        .thorax3d-hud h3,.thorax3d-panel h3{margin:0 0 5px;font-size:16px;font-weight:950;color:#0f766e}
        .thorax3d-hud h3{color:white}
        .thorax3d-hud p,.thorax3d-panel p{margin:0;color:#334155;font-size:13px;line-height:1.5}
        .thorax3d-hud p{color:#cbd5e1}
        .thorax3d-hud .meta,.thorax3d-panel .meta{color:#67e8f9;font-size:12px;font-weight:850;margin-bottom:7px}
        .thorax3d-panel{border:1px solid #e2e8f0;border-radius:18px;background:#fff;padding:16px;box-shadow:0 20px 60px rgba(15,23,42,.07);overflow:auto}
        .thorax3d-panel .section{color:#0891b2;font-size:12px;font-weight:950;text-transform:uppercase;letter-spacing:.06em;margin:0 0 10px}
        .thorax3d-panel .grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:16px}
        .thorax3d-panel .full{grid-column:1/-1}
        @media(max-width:1100px){.thorax3d-root,.thorax3d-root.fullscreen{grid-template-columns:1fr}.thorax3d-root.fullscreen{overflow:auto}.thorax3d-panel{max-height:none}}
      `}</style>
    </section>
  )
}
