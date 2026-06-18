'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

type Label = {
  text: string
  color: string
  position: [number, number, number]
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
  group.add(new THREE.Mesh(geometry, material))
}

function addLung(group: THREE.Group, side: -1 | 1) {
  const lung = new THREE.Group()
  const material = new THREE.MeshStandardMaterial({
    color: side === -1 ? '#5eead4' : '#2dd4bf',
    transparent: true,
    opacity: 0.72,
    roughness: 0.62,
  })
  const upper = new THREE.Mesh(new THREE.SphereGeometry(0.62, 36, 32), material)
  upper.scale.set(0.78, 1.1, 0.52)
  upper.position.set(side * 0.68, 0.45, 0.1)
  const lower = new THREE.Mesh(new THREE.SphereGeometry(0.7, 36, 32), material)
  lower.scale.set(0.7, 1.25, 0.5)
  lower.position.set(side * 0.75, -0.45, 0.08)
  lung.add(upper, lower)

  const bronchusMaterial = new THREE.MeshStandardMaterial({ color: '#0f766e', roughness: 0.55 })
  const bronchus = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.88, 16), bronchusMaterial)
  bronchus.rotation.z = side * Math.PI * 0.28
  bronchus.position.set(side * 0.34, 0.32, 0.35)
  lung.add(bronchus)
  group.add(lung)
}

export default function Thorax3D() {
  const mountRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#f8fafc')

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
    camera.position.set(0, 0.55, 6.2)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    mount.appendChild(renderer.domElement)

    const ambient = new THREE.HemisphereLight('#ffffff', '#dbeafe', 2.2)
    scene.add(ambient)

    const key = new THREE.DirectionalLight('#ffffff', 2.8)
    key.position.set(3.5, 4, 5)
    scene.add(key)

    const fill = new THREE.DirectionalLight('#bae6fd', 1.3)
    fill.position.set(-4, 1.8, 2)
    scene.add(fill)

    const thorax = new THREE.Group()
    scene.add(thorax)

    const ribGroup = new THREE.Group()
    for (let i = 0; i < 9; i += 1) {
      addRib(ribGroup, 1.12 - i * 0.24, 1.85 - i * 0.035, 0.35 + i * 0.02, -0.12 - i * 0.035)
    }
    thorax.add(ribGroup)

    const sternumMaterial = new THREE.MeshStandardMaterial({ color: '#c89a62', roughness: 0.46 })
    const sternum = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 1.72, 8, 20), sternumMaterial)
    sternum.position.set(0, 0.22, 0.72)
    sternum.rotation.x = Math.PI * 0.03
    thorax.add(sternum)

    const spineMaterial = new THREE.MeshStandardMaterial({ color: '#b08968', roughness: 0.55 })
    const spine = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 2.55, 8, 20), spineMaterial)
    spine.position.set(0, 0.05, -0.88)
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
    const apex = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.55, 32), heartMaterial)
    apex.position.set(0.03, -0.82, 0.56)
    apex.rotation.z = Math.PI
    heart.add(heartBody, apex)
    thorax.add(heart)

    const vesselMaterial = new THREE.MeshStandardMaterial({ color: '#991b1b', roughness: 0.42 })
    const aorta = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.035, 14, 42, Math.PI * 1.15), vesselMaterial)
    aorta.position.set(0.03, 0.15, 0.58)
    aorta.rotation.set(Math.PI * 0.58, Math.PI * 0.06, Math.PI * 0.08)
    thorax.add(aorta)

    const tracheaMaterial = new THREE.MeshStandardMaterial({ color: '#64748b', roughness: 0.45 })
    const trachea = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.1, 18), tracheaMaterial)
    trachea.position.set(0, 0.95, 0.18)
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
    thorax.add(diaphragm)

    const mediastinumMaterial = new THREE.MeshStandardMaterial({
      color: '#94a3b8',
      transparent: true,
      opacity: 0.25,
      roughness: 0.7,
    })
    const mediastinum = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 1.9, 10, 24), mediastinumMaterial)
    mediastinum.position.set(0, 0.06, 0.12)
    thorax.add(mediastinum)

    labels.forEach((label) => {
      const texture = makeLabelTexture(label.text, label.color)
      if (!texture) return
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }))
      sprite.position.set(...label.position)
      sprite.scale.set(1.15, 0.29, 1)
      thorax.add(sprite)
    })

    let pointerDown = false
    let lastX = 0
    const onPointerDown = (event: PointerEvent) => {
      pointerDown = true
      lastX = event.clientX
    }
    const onPointerMove = (event: PointerEvent) => {
      if (!pointerDown) return
      const delta = event.clientX - lastX
      thorax.rotation.y += delta * 0.008
      lastX = event.clientX
    }
    const onPointerUp = () => {
      pointerDown = false
    }
    renderer.domElement.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)

    const resize = () => {
      const width = mount.clientWidth
      const height = Math.max(420, Math.min(620, Math.round(width * 0.62)))
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
      if (!pointerDown) thorax.rotation.y += 0.003
      heart.scale.setScalar(1 + Math.sin(performance.now() * 0.004) * 0.025)
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(animationFrame)
      observer.disconnect()
      renderer.domElement.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
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

  return (
    <section className="mt-10 border-t border-gray-100 pt-8">
      <div className="mb-5">
        <h2 className="text-base font-bold text-teal-700 mb-1">Modele 3D interactif</h2>
        <p className="text-xs text-gray-400">Thorax : cage thoracique, poumons, coeur, diaphragme et mediastin</p>
      </div>
      <div
        ref={mountRef}
        className="relative w-full overflow-hidden rounded-lg border border-gray-100 bg-slate-50 shadow-sm"
      />
    </section>
  )
}
