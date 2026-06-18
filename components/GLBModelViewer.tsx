'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

type GLBModelViewerProps = {
  title: string
  description?: string
  src: string
}

const anatomyPrefixes = [
  'BONE_',
  'JOINT_',
  'LIGAMENT_',
  'MUSCLE_',
  'TENDON_',
  'NERVE_',
  'ARTERY_',
  'VEIN_',
  'FLOW_',
  'SKIN_',
  'LABEL_',
]

const courseSteps = [
  { label: 'Vue eclatee', frame: 1 },
  { label: 'Squelette', frame: 32 },
  { label: 'Muscles', frame: 52 },
  { label: 'Nerfs/Vaisseaux', frame: 70 },
  { label: 'Noms', frame: 76 },
  { label: 'Mouvement', frame: 90 },
]

export default function GLBModelViewer({ title, description, src }: GLBModelViewerProps) {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const modelRef = useRef<THREE.Object3D | null>(null)
  const mixerRef = useRef<THREE.AnimationMixer | null>(null)
  const actionsRef = useRef<THREE.AnimationAction[]>([])
  const pausedRef = useRef(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedObject, setSelectedObject] = useState('Clique sur une structure anatomique')
  const [selectedLayer, setSelectedLayer] = useState('Les noms Blender et les couches pedagogiques apparaitront ici.')

  const setVisibleByPrefix = (prefixes: string[], visible: boolean) => {
    modelRef.current?.traverse((object) => {
      if (object.name && prefixes.some((prefix) => object.name.startsWith(prefix))) object.visible = visible
    })
  }

  const showOnlyPrefixes = (prefixes: string[]) => {
    modelRef.current?.traverse((object) => {
      if (!object.name) return
      const isAnatomical = anatomyPrefixes.some((prefix) => object.name.startsWith(prefix))
      if (isAnatomical) object.visible = prefixes.some((prefix) => object.name.startsWith(prefix))
    })
  }

  const showAllLayers = () => {
    modelRef.current?.traverse((object) => {
      if (object.name && anatomyPrefixes.some((prefix) => object.name.startsWith(prefix))) object.visible = true
    })
  }

  const setAnimationPaused = (paused: boolean) => {
    pausedRef.current = paused
  }

  const restartAnimation = () => {
    mixerRef.current?.setTime(0)
    pausedRef.current = false
  }

  const goToFrame = (frame: number) => {
    mixerRef.current?.setTime(frame / 24)
    pausedRef.current = true
  }

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#f8fafc')

    const camera = new THREE.PerspectiveCamera(38, 1, 0.01, 200)
    camera.position.set(2.5, -5.2, 1.35)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    mount.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    controls.enablePan = false
    controls.minDistance = 1.7
    controls.maxDistance = 10

    scene.add(new THREE.HemisphereLight('#ffffff', '#dbeafe', 2.2))

    const key = new THREE.DirectionalLight('#ffffff', 2.8)
    key.position.set(4, -5, 6)
    scene.add(key)

    const fill = new THREE.DirectionalLight('#bae6fd', 1.4)
    fill.position.set(-5, 2, 4)
    scene.add(fill)

    const modelRoot = new THREE.Group()
    scene.add(modelRoot)

    let disposed = false
    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()

    const loader = new GLTFLoader()
    loader.load(
      src,
      (gltf) => {
        if (disposed) return

        const model = gltf.scene
        modelRef.current = model
        modelRoot.add(model)

        const box = new THREE.Box3().setFromObject(model)
        const center = new THREE.Vector3()
        const size = new THREE.Vector3()
        box.getCenter(center)
        box.getSize(size)

        model.position.sub(center)
        const maxDimension = Math.max(size.x, size.y, size.z)
        if (maxDimension > 0) model.scale.setScalar(5.4 / maxDimension)

        controls.target.set(0, 0, 0)
        controls.update()

        if (gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(model)
          mixerRef.current = mixer
          actionsRef.current = gltf.animations.map((clip) => mixer.clipAction(clip))
          actionsRef.current.forEach((action) => action.play())
        }

        setIsLoading(false)
      },
      undefined,
      () => setIsLoading(false),
    )

    const resize = () => {
      const width = mount.clientWidth
      const height = Math.max(420, Math.min(640, Math.round(width * 0.68)))
      renderer.setSize(width, height)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }

    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(mount)

    const onPointerDown = (event: PointerEvent) => {
      if (!modelRef.current) return
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)
      const meshes: THREE.Object3D[] = []
      modelRef.current.traverse((object) => {
        if (object instanceof THREE.Mesh && object.visible) meshes.push(object)
      })
      const hits = raycaster.intersectObjects(meshes, true)
      if (hits.length === 0) return
      const object = hits[0].object
      const displayName = typeof object.userData?.display_name === 'string' ? object.userData.display_name : object.name
      const layer = typeof object.userData?.medical_layer === 'string' ? object.userData.medical_layer : 'non classe'
      setSelectedObject(displayName || 'Structure anatomique')
      setSelectedLayer(`${object.name || 'Objet 3D'} - couche : ${layer}`)
    }

    renderer.domElement.addEventListener('pointerdown', onPointerDown)

    const clock = new THREE.Clock()
    let animationFrame = 0
    const animate = () => {
      animationFrame = requestAnimationFrame(animate)
      const delta = clock.getDelta()
      if (!pausedRef.current) mixerRef.current?.update(delta)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      disposed = true
      cancelAnimationFrame(animationFrame)
      observer.disconnect()
      controls.dispose()
      renderer.domElement.removeEventListener('pointerdown', onPointerDown)
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose()
          const materials = Array.isArray(object.material) ? object.material : [object.material]
          materials.forEach((material) => material.dispose())
        }
      })
      modelRef.current = null
      mixerRef.current = null
      actionsRef.current = []
    }
  }, [src])

  return (
    <section className="mt-10 border-t border-gray-100 pt-8">
      <div className="mb-5">
        <h2 className="text-base font-bold text-teal-700 mb-1">{title}</h2>
        {description && <p className="text-xs text-gray-400">{description}</p>}
      </div>
      <div className="relative overflow-hidden rounded-lg border border-gray-100 bg-slate-50 shadow-sm">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center text-xs font-semibold uppercase tracking-widest text-gray-400">
            Chargement 3D
          </div>
        )}
        <div ref={mountRef} className="w-full" />
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <button className="rounded-md bg-teal-600 px-3 py-2 text-xs font-bold text-white" onClick={() => setAnimationPaused(false)}>
          Lire
        </button>
        <button className="rounded-md bg-gray-100 px-3 py-2 text-xs font-bold text-gray-700" onClick={() => setAnimationPaused(true)}>
          Pause
        </button>
        <button className="rounded-md bg-gray-100 px-3 py-2 text-xs font-bold text-gray-700" onClick={restartAnimation}>
          Recommencer
        </button>
        <button className="rounded-md bg-gray-100 px-3 py-2 text-xs font-bold text-gray-700" onClick={() => {
          showAllLayers()
          setVisibleByPrefix(['LABEL_', 'FLOW_'], false)
          setAnimationPaused(true)
        }}>
          Modele seul
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {courseSteps.map((step) => (
          <button
            key={step.label}
            className="rounded-md bg-teal-50 px-3 py-2 text-xs font-bold text-teal-700"
            onClick={() => goToFrame(step.frame)}
          >
            {step.label}
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button className="rounded-md bg-gray-100 px-3 py-2 text-xs font-bold text-gray-700" onClick={showAllLayers}>
          Tout
        </button>
        <button className="rounded-md bg-gray-100 px-3 py-2 text-xs font-bold text-gray-700" onClick={() => setVisibleByPrefix(['LABEL_'], false)}>
          Masquer noms
        </button>
        <button className="rounded-md bg-gray-100 px-3 py-2 text-xs font-bold text-gray-700" onClick={() => showOnlyPrefixes(['BONE_', 'JOINT_', 'LIGAMENT_', 'LABEL_'])}>
          Squelette
        </button>
        <button className="rounded-md bg-gray-100 px-3 py-2 text-xs font-bold text-gray-700" onClick={() => showOnlyPrefixes(['MUSCLE_', 'TENDON_', 'LABEL_'])}>
          Muscles
        </button>
        <button className="rounded-md bg-gray-100 px-3 py-2 text-xs font-bold text-gray-700" onClick={() => showOnlyPrefixes(['NERVE_', 'FLOW_', 'LABEL_'])}>
          Nerfs
        </button>
        <button className="rounded-md bg-gray-100 px-3 py-2 text-xs font-bold text-gray-700" onClick={() => showOnlyPrefixes(['ARTERY_', 'VEIN_', 'FLOW_', 'LABEL_'])}>
          Vaisseaux
        </button>
      </div>
      <div className="mt-3 rounded-lg border border-gray-100 bg-white px-3 py-2 text-xs text-gray-500">
        <p className="font-bold text-gray-800">{selectedObject}</p>
        <p className="mt-1">{selectedLayer}</p>
      </div>
    </section>
  )
}
