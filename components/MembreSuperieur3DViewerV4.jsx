'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const DEFAULT_MODEL_URL = '/models/euromed/s1/anatomie/anatomie_membre_superieur_v2_premium.glb';
const FPS = 24;
const STATIC_FRAME = 52;
const LABEL_MAX_COUNT = 28;

const anatomicalPrefixes = ['BONE_', 'JOINT_', 'LIGAMENT_', 'MUSCLE_', 'TENDON_', 'NERVE_', 'ARTERY_', 'VEIN_', 'FLOW_', 'SKIN_', 'LABEL_'];
const interactivePrefixes = ['BONE_', 'JOINT_', 'LIGAMENT_', 'MUSCLE_', 'TENDON_', 'NERVE_', 'ARTERY_', 'VEIN_', 'SKIN_'];
const layerNames = {
  BONE_: 'Squelette', JOINT_: 'Articulation', LIGAMENT_: 'Ligament', MUSCLE_: 'Muscle', TENDON_: 'Tendon',
  NERVE_: 'Nerf', ARTERY_: 'Artère', VEIN_: 'Veine', FLOW_: 'Flux', SKIN_: 'Surface', LABEL_: 'Label',
};

const descriptionRules = [
  { match: /CLAVICULE|CLAVICLE/i, title: 'Clavicule', tags: ['os', 'épaule', 'région axillaire'], text: "Os long en S qui relie le sternum à l’acromion. C’est un repère majeur de l’épaule et du sommet de la région axillaire." },
  { match: /SCAPULA|OMOPLATE|EPINE_SCAPULAIRE|ACROMION|CORACOIDE/i, title: 'Scapula / Omoplate', tags: ['os', 'région scapulaire'], text: "Os plat triangulaire de la ceinture scapulaire. Il porte l’épine scapulaire, l’acromion, l’apophyse coracoïde et la cavité glénoïde." },
  { match: /HUMERUS|HUMÉRUS|TETE_HUMERALE|EPICONDYLE/i, title: 'Humérus', tags: ['os', 'bras', 'coude'], text: "Os du bras. Sa tête participe à l’articulation scapulo-humérale ; ses épicondyles servent de repères au coude." },
  { match: /RADIUS/i, title: 'Radius', tags: ['os', 'avant-bras', 'main'], text: "Os latéral de l’avant-bras, du côté du pouce. Il participe aux mouvements de pronation-supination et au poignet." },
  { match: /ULNA|CUBITUS|OLECRANE/i, title: 'Ulna / Cubitus', tags: ['os', 'avant-bras', 'coude'], text: "Os médial de l’avant-bras. L’olécrâne forme le relief postérieur du coude." },
  { match: /CARPE/i, title: 'Os du carpe', tags: ['poignet', 'main'], text: "Ensemble des petits os du poignet, entre radius/ulna et métacarpiens." },
  { match: /METACARPIEN|PHALANGE/i, title: 'Métacarpiens / phalanges', tags: ['main', 'doigts'], text: "Squelette de la paume et des doigts : métacarpiens dans la paume, phalanges dans les doigts." },
  { match: /PLEXUS|RACINE_C5|RACINE_C6|RACINE_C7|RACINE_C8|RACINE_T1/i, title: 'Plexus brachial', tags: ['nerfs', 'C5-T1', 'axillaire'], text: "Réseau nerveux issu de C5 à T1, donnant les nerfs principaux du membre supérieur." },
  { match: /MEDIAN|MÉDIAN/i, title: 'Nerf médian', tags: ['nerf', 'avant-bras', 'main'], text: "Nerf majeur du membre supérieur, important pour la motricité et la sensibilité d’une partie de la main." },
  { match: /ULNAIRE|ULNAR/i, title: 'Nerf ulnaire', tags: ['nerf', 'coude', 'main'], text: "Nerf passant classiquement en arrière de l’épicondyle médial, puis vers la main." },
  { match: /RADIAL|RADIALIS/i, title: 'Nerf radial', tags: ['nerf', 'bras postérieur', 'extension'], text: "Nerf de la loge postérieure du bras et de l’avant-bras, associé à l’extension." },
  { match: /MUSCULO|MUSCULO_CUTANE/i, title: 'Nerf musculo-cutané', tags: ['nerf', 'loge antérieure'], text: "Nerf destiné principalement à la loge antérieure du bras, puis sensitif pour l’avant-bras latéral." },
  { match: /AXILLAIRE/i, title: 'Région axillaire', tags: ['axillaire', 'épaule'], text: "Région de passage de l’artère/veine axillaire et du plexus brachial, entourée par des parois musculaires." },
  { match: /ARTERY_AXILLAIRE|ARTERE_AXILLAIRE|ART_AXILLAIRE|AXILLARY/i, title: 'Artère axillaire', tags: ['artère', 'région axillaire'], text: "Artère principale de la région axillaire, entre sous-clavière et brachiale." },
  { match: /BRACHIALE|HUMERALE/i, title: 'Artère brachiale / humérale', tags: ['artère', 'bras'], text: "Artère principale du bras, descendant vers le pli du coude." },
  { match: /ARTERY_RADIALE|ART_RADIALE|RADIAL/i, title: 'Artère radiale', tags: ['artère', 'avant-bras'], text: "Branche artérielle latérale de l’avant-bras, du côté radial." },
  { match: /ARTERY_ULNAIRE|ART_ULNAIRE|ULNAR/i, title: 'Artère ulnaire', tags: ['artère', 'avant-bras'], text: "Branche artérielle médiale de l’avant-bras, contribuant aux arcades palmaires." },
  { match: /PALMAIRE|ARCADE/i, title: 'Arcades palmaires', tags: ['main', 'vascularisation'], text: "Réseaux artériels de la paume distribuant le sang vers les doigts." },
  { match: /CEPHALIQUE|BASILIQUE|CUBITALE|VEIN/i, title: 'Veines superficielles', tags: ['veines', 'bras'], text: "Réseau veineux superficiel : céphalique, basilique et médiane cubitale." },
  { match: /BICEPS|BRACHIAL|CORACO/i, title: 'Loge antérieure du bras', tags: ['muscle', 'flexion'], text: "Plan musculaire antérieur du bras, associé à la flexion du coude." },
  { match: /TRICEPS|VASTE/i, title: 'Triceps brachial', tags: ['muscle', 'extension'], text: "Muscle principal de la loge postérieure du bras, surtout extenseur du coude." },
  { match: /DELTOIDE|DELTOÏDE/i, title: 'Deltoïde', tags: ['muscle', 'épaule'], text: "Muscle superficiel formant le relief du moignon de l’épaule." },
  { match: /PECTORAL/i, title: 'Muscles pectoraux', tags: ['muscle', 'paroi antérieure axillaire'], text: "Grand et petit pectoral forment la paroi antérieure de la région axillaire." },
  { match: /GRAND_DENTELE|DENTELE/i, title: 'Grand dentelé', tags: ['muscle', 'paroi latérale'], text: "Muscle appliqué sur la paroi thoracique latérale, important pour la paroi latérale axillaire." },
  { match: /SUS_EPINEUX|SOUS_EPINEUX|PETIT_ROND|SUBSCAP/i, title: 'Coiffe des rotateurs', tags: ['muscle', 'épaule profonde'], text: "Muscles profonds stabilisant la tête humérale dans la cavité glénoïde." },
];

const majorLabelRules = [
  /CLAVICULE/i, /SCAPULA|OMOPLATE/i, /ACROMION/i, /HUMERUS_diaphyse/i, /RADIUS_diaphyse/i, /ULNA|CUBITUS/i,
  /CARPE_1_2|METACARPIEN_III|PHALANGE_Majeur_2/i, /PLEXUS|RACINE_C5|RACINE_T1/i,
  /NERVE_MEDIAN/i, /NERVE_ULNAIRE/i, /NERVE_RADIAL/i, /ARTERY_AXILLAIRE|ART_AXILLAIRE/i,
  /ARTERY_BRACHIALE|ART_HUMERALE/i, /ARTERY_RADIALE/i, /ARTERY_ULNAIRE/i, /VEIN_CEPHALIQUE|VEIN_BASILIQUE/i,
  /MUSCLE_DELTOIDE/i, /MUSCLE_BICEPS/i, /MUSCLE_TRICEPS/i, /MUSCLE_GRAND_PECTORAL|PECTORAL/i,
];

function cleanDisplayName(name) {
  return String(name || '')
    .replace(/^(BONE_|JOINT_|LIGAMENT_|MUSCLE_|TENDON_|NERVE_|ARTERY_|VEIN_|FLOW_|SKIN_|LABEL_|TEXT_|PLATE_|LINE_)/, '')
    .replace(/_/g, ' ')
    .replace(/\bdiaphyse\b/gi, '')
    .trim();
}
function displayName(obj) { return obj?.userData?.display_name || cleanDisplayName(obj?.name) || 'Structure'; }
function getLayerPrefix(name) { return anatomicalPrefixes.find((p) => String(name).startsWith(p)) || ''; }
function getLayerName(name) { return layerNames[getLayerPrefix(name)] || 'Structure'; }
function getDescription(obj) {
  const hay = `${obj?.name || ''} ${displayName(obj)}`;
  return descriptionRules.find((r) => r.match.test(hay)) || {
    title: displayName(obj), tags: [getLayerName(obj?.name)],
    text: 'Structure du membre supérieur. Utilise les filtres pour isoler les rapports anatomiques.',
  };
}

export default function MembreSuperieur3DViewerV4({ modelUrl = DEFAULT_MODEL_URL, height = 720 }) {
  const viewerRef = useRef(null);
  const labelLayerRef = useRef(null);
  const focusMarkerRef = useRef(null);
  const timelineRef = useRef(null);
  const apiRef = useRef({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState({ title: 'Clique sur une structure anatomique', meta: 'Nom, couche, page et description apparaîtront ici.', text: 'Clique sur une structure du modèle pour afficher sa description.', tags: [] });
  const [labelsOn, setLabelsOn] = useState(true);
  const [zoomOn, setZoomOn] = useState(true);
  const [focusOn, setFocusOn] = useState(false);
  const [time, setTime] = useState('Temps : 0.00 s');

  useEffect(() => {
    const container = viewerRef.current;
    const labelLayer = labelLayerRef.current;
    const focusMarker = focusMarkerRef.current;
    if (!container || !labelLayer || !focusMarker) return undefined;

    let destroyed = false;
    let model = null;
    let mixer = null;
    let paused = true;
    let labelsVisible = true;
    let zoomToCursor = true;
    let focusLocked = false;
    let focusPoint = null;
    let modelCenter = new THREE.Vector3();
    let modelSize = 5;
    let htmlLabels = [];
    let lastPickedPoint = null;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, container.clientWidth / container.clientHeight, 0.01, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0xf8fafc, 1);
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = true;
    controls.screenSpacePanning = true;
    controls.rotateSpeed = 0.72;
    controls.zoomSpeed = 0.92;
    const supportsNativeZoomToCursor = 'zoomToCursor' in controls;
    if (supportsNativeZoomToCursor) controls.zoomToCursor = true;

    scene.add(new THREE.HemisphereLight(0xffffff, 0xdbeafe, 2.0));
    const key = new THREE.DirectionalLight(0xffffff, 3.0);
    key.position.set(4, -6, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xffffff, 1.35);
    rim.position.set(-4, 4, 3);
    scene.add(rim);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const clock = new THREE.Clock();

    const isInteractiveMesh = (obj) => obj.isMesh && obj.visible && interactivePrefixes.some((p) => obj.name.startsWith(p));
    const visibleMeshes = () => { const arr = []; model?.traverse((o) => { if (isInteractiveMesh(o)) arr.push(o); }); return arr; };
    const getPointer = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      return pointer;
    };
    const pickAt = (event) => {
      if (!model) return null;
      raycaster.setFromCamera(getPointer(event), camera);
      return raycaster.intersectObjects(visibleMeshes(), true)[0] || null;
    };
    const computeBox = (includeLabels = false) => {
      const box = new THREE.Box3();
      if (!model) return box;
      model.updateMatrixWorld(true);
      model.traverse((obj) => {
        if (!obj.isMesh || !obj.visible) return;
        if (!includeLabels && (obj.name.startsWith('LABEL_') || obj.name.startsWith('FLOW_'))) return;
        box.expandByObject(obj);
      });
      if (box.isEmpty()) box.setFromObject(model);
      return box;
    };
    const setAnimationFrame = (frame) => {
      if (!mixer) return;
      const seconds = frame / FPS;
      mixer.setTime(seconds);
      if (timelineRef.current) timelineRef.current.value = String(seconds);
      setTime(`Frame ${frame} — ${seconds.toFixed(2)} s`);
      model?.updateMatrixWorld(true);
    };
    const normalizeModelOnce = () => {
      if (!model) return;
      const box = computeBox(false);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      model.position.sub(center);
      model.scale.multiplyScalar(10.5 / maxDim);
      model.updateMatrixWorld(true);
    };
    const updateButtons = () => {
      setLabelsOn(labelsVisible);
      setZoomOn(zoomToCursor);
      setFocusOn(focusLocked);
      if (supportsNativeZoomToCursor) controls.zoomToCursor = zoomToCursor && !focusLocked;
    };
    const updateFocusMarker = () => {
      if (!focusLocked || !focusPoint) { focusMarker.style.display = 'none'; return; }
      const rect = renderer.domElement.getBoundingClientRect();
      const p = focusPoint.clone().project(camera);
      if (p.z < -1 || p.z > 1) { focusMarker.style.display = 'none'; return; }
      focusMarker.style.display = 'block';
      focusMarker.style.left = `${(p.x * 0.5 + 0.5) * rect.width}px`;
      focusMarker.style.top = `${(-p.y * 0.5 + 0.5) * rect.height}px`;
    };
    const fitCameraToModel = (direction = new THREE.Vector3(0.62, -1.0, 0.28), padding = 1.22) => {
      if (!model) return;
      const box = computeBox(false);
      modelCenter = box.getCenter(new THREE.Vector3());
      const sizeVec = box.getSize(new THREE.Vector3());
      modelSize = Math.max(sizeVec.x, sizeVec.y, sizeVec.z) || 5;
      const fov = THREE.MathUtils.degToRad(camera.fov);
      const fitHeight = modelSize / (2 * Math.tan(fov / 2));
      const fitWidth = fitHeight / camera.aspect;
      const distance = Math.max(fitHeight, fitWidth) * padding;
      camera.near = Math.max(0.001, modelSize / 500);
      camera.far = modelSize * 120;
      camera.updateProjectionMatrix();
      camera.position.copy(modelCenter).add(direction.clone().normalize().multiplyScalar(distance));
      controls.target.copy(modelCenter);
      controls.minDistance = modelSize * 0.035;
      controls.maxDistance = modelSize * 9;
      focusLocked = false;
      focusPoint = null;
      controls.update();
      updateFocusMarker();
      updateButtons();
    };
    const buildHtmlLabels = () => {
      labelLayer.innerHTML = '';
      htmlLabels = [];
      if (!model) return;
      const candidates = [];
      model.traverse((obj) => {
        if (!obj.isMesh) return;
        if (!interactivePrefixes.some((p) => obj.name.startsWith(p))) return;
        if (!majorLabelRules.some((rx) => rx.test(obj.name))) return;
        candidates.push(obj);
      });
      const unique = [];
      const seen = new Set();
      for (const obj of candidates) {
        const name = displayName(obj);
        if (!seen.has(name)) { seen.add(name); unique.push(obj); }
      }
      unique.slice(0, LABEL_MAX_COUNT).forEach((obj) => {
        const el = document.createElement('div');
        el.className = 'ms-html-label';
        el.textContent = displayName(obj);
        labelLayer.appendChild(el);
        htmlLabels.push({ obj, el, center: new THREE.Vector3() });
      });
    };
    const updateHtmlLabels = () => {
      if (!labelsVisible || !model) { labelLayer.style.display = 'none'; return; }
      labelLayer.style.display = 'block';
      const rect = renderer.domElement.getBoundingClientRect();
      htmlLabels.forEach((item) => {
        if (!item.obj.visible) { item.el.style.display = 'none'; return; }
        const box = new THREE.Box3().setFromObject(item.obj);
        if (box.isEmpty()) { item.el.style.display = 'none'; return; }
        box.getCenter(item.center);
        const p = item.center.clone().project(camera);
        const visible = p.z >= -1 && p.z <= 1 && p.x > -1.15 && p.x < 1.15 && p.y > -1.15 && p.y < 1.15;
        if (!visible) { item.el.style.display = 'none'; return; }
        item.el.style.display = 'block';
        item.el.style.left = `${(p.x * 0.5 + 0.5) * rect.width}px`;
        item.el.style.top = `${(-p.y * 0.5 + 0.5) * rect.height}px`;
      });
    };
    const setVisibilityByPrefix = (prefixes, visible) => {
      model?.traverse((obj) => { if (obj.name && prefixes.some((p) => obj.name.startsWith(p))) obj.visible = visible; });
    };
    const prepareMeshesForStudyView = () => {
      model?.traverse((obj) => {
        if (!obj.isMesh) return;
        obj.visible = true;
        const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
        materials.filter(Boolean).forEach((material) => {
          material.depthWrite = true;
          material.side = THREE.DoubleSide;
          material.needsUpdate = true;
        });
      });
    };
    const showAllLayers = (refit = true) => {
      model?.traverse((obj) => { if (obj.name && anatomicalPrefixes.some((p) => obj.name.startsWith(p))) obj.visible = true; });
      setVisibilityByPrefix(['LABEL_'], false);
      labelsVisible = true;
      buildHtmlLabels();
      updateButtons();
      if (refit) fitCameraToModel();
    };
    const showOnly = (prefixes, refit = true) => {
      model?.traverse((obj) => {
        if (!obj.name) return;
        const anatomical = anatomicalPrefixes.some((p) => obj.name.startsWith(p));
        if (anatomical) obj.visible = prefixes.some((p) => obj.name.startsWith(p));
      });
      setVisibilityByPrefix(['LABEL_'], false);
      labelsVisible = false;
      buildHtmlLabels();
      updateButtons();
      if (refit) fitCameraToModel();
    };
    const centerCameraOnPoint = (point, distanceScale = 0.95) => {
      const currentOffset = camera.position.clone().sub(controls.target);
      const distance = Math.max(modelSize * 0.2, currentOffset.length() * distanceScale);
      const dir = currentOffset.length() > 0.0001 ? currentOffset.normalize() : new THREE.Vector3(0.6, -1, .25).normalize();
      controls.target.copy(point);
      camera.position.copy(point).add(dir.multiplyScalar(distance));
      controls.update();
    };
    const setSelectedObject = (hit, lock = false) => {
      const obj = hit?.object;
      if (!obj) return;
      const info = getDescription(obj);
      lastPickedPoint = hit.point.clone();
      const page = obj?.userData?.course_page || '';
      setSelected({
        title: info.title || displayName(obj),
        meta: `${obj.name} — ${getLayerName(obj.name)}${page ? ` — page(s) : ${page}` : ''}`,
        text: info.text,
        tags: [...(info.tags || []), getLayerName(obj.name), ...(page ? [`page ${page}`] : [])].slice(0, 6),
      });
      if (lock) {
        focusPoint = hit.point.clone();
        focusLocked = true;
        controls.target.copy(focusPoint);
        updateButtons();
        updateFocusMarker();
      }
    };
    const zoomAroundPoint = (point, deltaY) => {
      const scale = Math.exp(deltaY * 0.00145);
      const offset = camera.position.clone().sub(point);
      const newOffset = offset.multiplyScalar(scale);
      const dist = newOffset.length();
      if (dist < controls.minDistance || dist > controls.maxDistance) return;
      camera.position.copy(point).add(newOffset);
      if (focusLocked && focusPoint) controls.target.copy(focusPoint);
      else controls.target.copy(point).add(controls.target.clone().sub(point).multiplyScalar(scale));
      controls.update();
    };

    const onPointerDown = (event) => {
      const hit = pickAt(event);
      if (hit) setSelectedObject(hit, event.shiftKey);
    };
    const onDoubleClick = (event) => {
      const hit = pickAt(event);
      if (!hit) return;
      setSelectedObject(hit, true);
      centerCameraOnPoint(hit.point, 0.7);
    };
    const onWheel = (event) => {
      if (!zoomToCursor || !model) return;
      if (focusLocked && focusPoint) {
        event.preventDefault(); event.stopPropagation(); zoomAroundPoint(focusPoint, event.deltaY);
      } else if (!supportsNativeZoomToCursor) {
        const hit = pickAt(event);
        if (hit) { event.preventDefault(); event.stopPropagation(); zoomAroundPoint(hit.point, event.deltaY); }
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('dblclick', onDoubleClick);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false, capture: true });

    apiRef.current = {
      play: () => { paused = false; },
      pause: () => { paused = true; },
      restart: () => { if (mixer) { mixer.setTime(0); paused = false; } },
      static: () => { paused = true; setAnimationFrame(STATIC_FRAME); showAllLayers(false); fitCameraToModel(); buildHtmlLabels(); },
      scrub: (seconds) => { if (mixer) { paused = true; mixer.setTime(Number(seconds)); setTime(`Temps : ${Number(seconds).toFixed(2)} s`); } },
      toggleLabels: () => { labelsVisible = !labelsVisible; updateButtons(); updateHtmlLabels(); },
      toggleZoom: () => { zoomToCursor = !zoomToCursor; updateButtons(); },
      toggleFocus: () => { if (!focusPoint && lastPickedPoint) focusPoint = lastPickedPoint.clone(); if (!focusPoint) return; focusLocked = !focusLocked; if (focusLocked) controls.target.copy(focusPoint); updateButtons(); updateFocusMarker(); },
      reset: () => { fitCameraToModel(); labelsVisible = true; updateButtons(); updateHtmlLabels(); },
      onlyBones: () => showOnly(['BONE_', 'JOINT_', 'LIGAMENT_']),
      onlyMuscles: () => showOnly(['MUSCLE_', 'TENDON_']),
      onlyNerves: () => showOnly(['NERVE_', 'FLOW_NERVE']),
      onlyVessels: () => showOnly(['ARTERY_', 'VEIN_', 'FLOW_ARTERIAL', 'FLOW_VEINEUX']),
      exam: () => showOnly(['BONE_', 'JOINT_', 'NERVE_', 'ARTERY_', 'VEIN_']),
      all: () => showAllLayers(),
      modelOnly: () => { showAllLayers(false); setVisibilityByPrefix(['FLOW_'], false); labelsVisible = false; updateButtons(); labelLayer.style.display = 'none'; fitCameraToModel(); },
      preset: (name) => {
        const dirs = { global: [0.62, -1, 0.28], axilla: [0.95, -1, 0.52], shoulder: [0.8, -0.95, 0.4], elbow: [0.45, -1, 0.1], forearm: [0.55, -1, -0.12], hand: [0.5, -1, -0.36] };
        const dir = new THREE.Vector3(...(dirs[name] || dirs.global));
        fitCameraToModel(dir, name === 'global' ? 1.22 : 0.95);
        const offsets = { axilla: [0,0,modelSize*.28], shoulder: [.02,0,modelSize*.25], elbow: [.03,0,0], forearm: [.05,0,-modelSize*.23], hand: [.07,0,-modelSize*.43] };
        if (offsets[name]) centerCameraOnPoint(modelCenter.clone().add(new THREE.Vector3(...offsets[name])), 0.92);
      },
    };

    new GLTFLoader().load(modelUrl, (gltf) => {
      if (destroyed) return;
      model = gltf.scene;
      scene.add(model);
      prepareMeshesForStudyView();
      mixer = new THREE.AnimationMixer(model);
      const actions = (gltf.animations || []).map((clip) => mixer.clipAction(clip));
      actions.forEach((action) => action.play());
      if (gltf.animations?.length && timelineRef.current) timelineRef.current.max = String(Math.max(...gltf.animations.map((c) => c.duration)));
      setAnimationFrame(STATIC_FRAME);
      normalizeModelOnce();
      setAnimationFrame(STATIC_FRAME);
      showAllLayers(false);
      setVisibilityByPrefix(['LABEL_', 'FLOW_'], false);
      labelsVisible = false;
      buildHtmlLabels();
      labelLayer.style.display = 'none';
      updateButtons();
      fitCameraToModel();
      setLoading(false);
    }, undefined, (error) => {
      console.error(error);
      setLoading(false);
      setSelected({ title: 'Erreur de chargement du modèle', meta: modelUrl, text: 'Vérifie le chemin du fichier .glb dans public/models.', tags: ['erreur'] });
    });

    const animate = () => {
      if (destroyed) return;
      requestAnimationFrame(animate);
      const dt = clock.getDelta();
      if (mixer && !paused) {
        mixer.update(dt);
        const max = Number(timelineRef.current?.max || 1);
        const current = mixer.time % max;
        if (timelineRef.current) timelineRef.current.value = String(current);
        setTime(`Temps : ${current.toFixed(2)} s`);
      }
      controls.update();
      updateHtmlLabels();
      updateFocusMarker();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
      if (model) fitCameraToModel();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      destroyed = true;
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('dblclick', onDoubleClick);
      renderer.domElement.removeEventListener('wheel', onWheel, { capture: true });
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, [modelUrl]);

  return (
    <div className="ms3d-root" style={{ minHeight: height }}>
      <div className="ms3d-viewer" ref={viewerRef} style={{ minHeight: height }}>
        <div className="ms-html-labels" ref={labelLayerRef} />
        <div className="ms-focus-marker" ref={focusMarkerRef} />
        {loading && <div className="ms-loading">Chargement du modèle 3D…</div>}
        <div className="ms-top-tools">
          <button className="primary" onClick={() => apiRef.current.static?.()}>Modèle centré</button>
          <button onClick={() => apiRef.current.play?.()}>Lire</button>
          <button className="danger" onClick={() => apiRef.current.pause?.()}>Stop/Pause</button>
          <button className={labelsOn ? 'active' : ''} onClick={() => apiRef.current.toggleLabels?.()}>{labelsOn ? 'Noms ON' : 'Noms OFF'}</button>
          <button className={zoomOn ? 'active' : ''} onClick={() => apiRef.current.toggleZoom?.()}>{zoomOn ? 'Zoom curseur ON' : 'Zoom curseur OFF'}</button>
          <button className={focusOn ? 'active' : ''} onClick={() => apiRef.current.toggleFocus?.()}>{focusOn ? 'Verrou POI ON' : 'Verrou POI OFF'}</button>
          <button onClick={() => apiRef.current.reset?.()}>Reset vue</button>
        </div>
        <div className="ms-hud">
          <div className="ms-hud-title">{selected.title}</div>
          <div className="ms-hud-meta">{selected.meta}</div>
          <div className="ms-hud-hint">Molette = zoom curseur. Double-clic ou Shift+clic = point d’intérêt. Stop/Pause = inspection statique.</div>
        </div>
      </div>
      <div className="ms-panel">
        <div className="ms-section-title">Contrôles</div>
        <div className="ms-grid">
          <button onClick={() => apiRef.current.play?.()}>Lire</button>
          <button className="danger" onClick={() => apiRef.current.pause?.()}>Stop</button>
          <button onClick={() => apiRef.current.restart?.()}>Recommencer</button>
          <button className="primary" onClick={() => apiRef.current.static?.()}>Vue étude</button>
        </div>
        <input className="ms-timeline" ref={timelineRef} type="range" min="0" max="6" step="0.01" defaultValue="0" onInput={(e) => apiRef.current.scrub?.(e.currentTarget.value)} />
        <div className="ms-time">{time}</div>
        <div className="ms-section-title mt">Couches</div>
        <div className="ms-grid">
          <button onClick={() => apiRef.current.all?.()}>Tout</button>
          <button onClick={() => apiRef.current.modelOnly?.()}>Modèle seul</button>
          <button onClick={() => apiRef.current.onlyBones?.()}>Squelette</button>
          <button onClick={() => apiRef.current.onlyMuscles?.()}>Muscles</button>
          <button onClick={() => apiRef.current.onlyNerves?.()}>Nerfs</button>
          <button onClick={() => apiRef.current.onlyVessels?.()}>Vaisseaux</button>
          <button className="full" onClick={() => apiRef.current.exam?.()}>Vue examen : os + nerfs + vaisseaux</button>
        </div>
        <div className="ms-section-title mt">Vues rapides</div>
        <div className="ms-grid">
          <button onClick={() => apiRef.current.preset?.('global')}>Globale</button>
          <button onClick={() => apiRef.current.preset?.('axilla')}>Axillaire</button>
          <button onClick={() => apiRef.current.preset?.('shoulder')}>Épaule</button>
          <button onClick={() => apiRef.current.preset?.('elbow')}>Coude</button>
          <button onClick={() => apiRef.current.preset?.('forearm')}>Avant-bras</button>
          <button onClick={() => apiRef.current.preset?.('hand')}>Main</button>
        </div>
        <div className="ms-description">
          <h3>{selected.title}</h3>
          <p>{selected.text}</p>
          <div>{selected.tags.map((t) => <span className="ms-tag" key={t}>{t}</span>)}</div>
        </div>
      </div>
      <style>{`
        .ms3d-root{display:grid;grid-template-columns:minmax(0,1fr)340px;gap:14px;width:100%;}
        .ms3d-viewer{position:relative;border:1px solid #e2e8f0;border-radius:18px;background:radial-gradient(circle at 50% 42%,rgba(14,165,233,.10),rgba(255,255,255,0) 48%),linear-gradient(180deg,#fff,#f8fafc);overflow:hidden;box-shadow:0 20px 60px rgba(15,23,42,.08)}
        .ms3d-viewer canvas{display:block;width:100%;height:100%;cursor:grab}.ms3d-viewer canvas:active{cursor:grabbing}
        .ms-loading{position:absolute;inset:0;display:grid;place-items:center;background:rgba(255,255,255,.7);color:#64748b;font-weight:800;z-index:8}
        .ms-top-tools{position:absolute;left:12px;right:12px;top:12px;display:flex;flex-wrap:wrap;gap:8px;z-index:6;pointer-events:none}.ms-top-tools button,.ms-panel button{appearance:none;border:1px solid rgba(15,23,42,.08);border-radius:999px;background:rgba(255,255,255,.93);font-size:12px;font-weight:850;padding:8px 11px;cursor:pointer;box-shadow:0 6px 18px rgba(15,23,42,.07);pointer-events:auto}.ms-top-tools button:hover,.ms-panel button:hover{background:#ecfeff}.ms-top-tools .active,.ms-panel .active{background:#ccfbf1;color:#0f766e}.ms-top-tools .primary,.ms-panel .primary{background:#cffafe;color:#155e75}.ms-top-tools .danger,.ms-panel .danger{background:#fff1f2;color:#be123c}
        .ms-hud{position:absolute;left:14px;bottom:14px;max-width:min(560px,calc(100% - 28px));background:rgba(15,23,42,.86);color:white;border-radius:16px;padding:14px 16px;box-shadow:0 20px 70px rgba(15,23,42,.25);pointer-events:none}.ms-hud-title{font-size:17px;font-weight:950}.ms-hud-meta{margin-top:4px;color:#cbd5e1;font-size:12px}.ms-hud-hint{margin-top:9px;color:#67e8f9;font-size:12px;line-height:1.45}
        .ms-html-labels{position:absolute;inset:0;z-index:3;pointer-events:none}.ms-html-label{position:absolute;transform:translate(-50%,-50%);max-width:190px;padding:5px 8px;border-radius:10px;background:rgba(15,23,42,.88);color:white;font-size:14px;line-height:1.12;font-weight:900;text-align:center;box-shadow:0 8px 24px rgba(15,23,42,.22);border:1px solid rgba(255,255,255,.18)}
        .ms-focus-marker{position:absolute;width:26px;height:26px;display:none;z-index:7;pointer-events:none;border:2px solid #f59e0b;border-radius:50%;transform:translate(-50%,-50%);box-shadow:0 0 28px rgba(245,158,11,.9),inset 0 0 10px rgba(245,158,11,.45)}.ms-focus-marker:before,.ms-focus-marker:after{content:"";position:absolute;background:#f59e0b;left:50%;top:50%;transform:translate(-50%,-50%)}.ms-focus-marker:before{width:38px;height:2px}.ms-focus-marker:after{width:2px;height:38px}
        .ms-panel{border:1px solid #e2e8f0;border-radius:18px;background:#fff;padding:16px;box-shadow:0 20px 60px rgba(15,23,42,.07);overflow:auto}.ms-section-title{color:#0891b2;font-size:12px;font-weight:950;text-transform:uppercase;letter-spacing:.06em;margin:0 0 10px}.ms-section-title.mt{margin-top:18px}.ms-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.ms-grid .full{grid-column:1/-1}.ms-timeline{width:100%;margin-top:12px;accent-color:#0891b2}.ms-time{color:#64748b;font-size:12px;margin-top:5px}.ms-description{margin-top:18px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:13px}.ms-description h3{margin:0 0 6px;color:#0f766e;font-size:16px}.ms-description p{margin:0;color:#334155;font-size:13px;line-height:1.55}.ms-tag{display:inline-block;margin:8px 6px 0 0;border-radius:999px;background:rgba(8,145,178,.12);color:#155e75;padding:4px 8px;font-size:11px;font-weight:900}
        @media(max-width:1100px){.ms3d-root{grid-template-columns:1fr}.ms-panel{max-height:none}}@media(max-width:640px){.ms3d-viewer{border-radius:14px}.ms-html-label{font-size:12px;max-width:140px}.ms-top-tools button{font-size:11px;padding:7px 9px}}
      `}</style>
    </div>
  );
}
