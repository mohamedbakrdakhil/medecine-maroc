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

export default function GLBModelViewer({ title, description, src }: GLBModelViewerProps) {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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

    let mixer: THREE.AnimationMixer | null = null
    let disposed = false

    const loader = new GLTFLoader()
    loader.load(
      src,
      (gltf) => {
        if (disposed) return

        const model = gltf.scene
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
          mixer = new THREE.AnimationMixer(model)
          gltf.animations.forEach((clip) => {
            const action = mixer?.clipAction(clip)
            action?.play()
          })
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

    const clock = new THREE.Clock()
    let animationFrame = 0
    const animate = () => {
      animationFrame = requestAnimationFrame(animate)
      const delta = clock.getDelta()
      mixer?.update(delta)
      if (!controls.enabled) modelRoot.rotation.z += 0
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      disposed = true
      cancelAnimationFrame(animationFrame)
      observer.disconnect()
      controls.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose()
          const materials = Array.isArray(object.material) ? object.material : [object.material]
          materials.forEach((material) => material.dispose())
        }
      })
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
    </section>
  )
}
