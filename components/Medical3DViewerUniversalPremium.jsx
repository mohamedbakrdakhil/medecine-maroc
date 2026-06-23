"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/**
 * Medical3DViewerUniversalPremium
 * Viewer 3D médical générique pour les GLB générés par le script Blender EUROMED.
 * Fonctionnalités : centrage automatique, zoom vers curseur, Shift+clic point d’intérêt,
 * double-clic zoom structure, recherche, labels non encombrants, descriptions au clic.
 */
export default function Medical3DViewerUniversalPremium({
  modelUrl,
  height = 720,
  title = "Module 3D médical",
}) {
  const containerRef = useRef(null);
  const selectedLabelRef = useRef(null);

  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const mixerRef = useRef(null);
  const modelRef = useRef(null);
  const meshesRef = useRef([]);
  const clockRef = useRef(new THREE.Clock());
  const raycasterRef = useRef(new THREE.Raycaster());
  const pointerRef = useRef(new THREE.Vector2());
  const selectedObjectRef = useRef(null);
  const manualFocusPointRef = useRef(null);
  const frameRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [playing, setPlaying] = useState(true);
  const [labelMode, setLabelMode] = useState("selection");
  const [zoomCursor, setZoomCursor] = useState(true);
  const [focusLocked, setFocusLocked] = useState(false);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.slice(0, 80);
    return items
      .filter((it) => `${it.label} ${it.category} ${it.description}`.toLowerCase().includes(q))
      .slice(0, 80);
  }, [items, query]);

  useEffect(() => {
    if (!containerRef.current) return;

    let disposed = false;
    const container = containerRef.current;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(42, container.clientWidth / height, 0.01, 200);
    camera.position.set(0, -7, 3.5);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.screenSpacePanning = true;
    controls.minDistance = 0.05;
    controls.maxDistance = 80;
    if ("zoomToCursor" in controls) controls.zoomToCursor = true;
    controlsRef.current = controls;

    scene.add(new THREE.HemisphereLight(0xffffff, 0x202235, 2.2));
    const key = new THREE.DirectionalLight(0xffffff, 3.0);
    key.position.set(4, -5, 6);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xffffff, 1.2);
    rim.position.set(-4, 3, 4);
    scene.add(rim);

    const loader = new GLTFLoader();
    setLoading(true);
    setError(null);

    loader.load(
      modelUrl,
      (gltf) => {
        if (disposed) return;
        const root = gltf.scene;
        modelRef.current = root;
        scene.add(root);

        normalizeModel(root);
        fitCameraToObject(root, camera, controls);

        const meshes = [];
        const list = [];
        root.traverse((obj) => {
          if (obj.isMesh || obj.isLine || obj.isPoints) {
            meshes.push(obj);
            const label = readableLabel(obj);
            const category = obj.userData?.category || guessCategory(obj.name);
            const description = obj.userData?.description || "Structure 3D cliquable.";
            if (!obj.name.startsWith("LABEL_")) {
              list.push({ id: obj.uuid, label, category, description, name: obj.name });
            }
          }
        });
        meshesRef.current = meshes;
        setItems(list.sort((a, b) => a.label.localeCompare(b.label)));

        if (gltf.animations?.length) {
          const mixer = new THREE.AnimationMixer(root);
          gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
          mixerRef.current = mixer;
        }

        setLoading(false);
      },
      undefined,
      (err) => {
        console.error(err);
        setError("Impossible de charger le modèle GLB. Vérifie le chemin modelUrl.");
        setLoading(false);
      }
    );

    function onPointerMove(event) {
      pointerRef.current.copy(getPointerNDC(event, renderer.domElement));
    }

    function onClick(event) {
      if (event.shiftKey) {
        const hit = pick(event);
        if (hit) {
          manualFocusPointRef.current = hit.point.clone();
          controls.target.copy(hit.point);
          controls.update();
          setFocusLocked(true);
        }
        return;
      }
      const hit = pick(event);
      if (hit) selectObject(hit.object, hit.point, false);
    }

    function onDblClick(event) {
      const hit = pick(event);
      if (hit) selectObject(hit.object, hit.point, true);
    }

    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("click", onClick);
    renderer.domElement.addEventListener("dblclick", onDblClick);

    function animate() {
      frameRef.current = requestAnimationFrame(animate);
      const delta = clockRef.current.getDelta();
      if (mixerRef.current && playing) mixerRef.current.update(delta);
      if (controlsRef.current) controlsRef.current.update();
      updateSelectedLabelPosition();
      renderer.render(scene, camera);
    }
    animate();

    const onResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      cameraRef.current.aspect = w / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, height);
    };
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("click", onClick);
      renderer.domElement.removeEventListener("dblclick", onDblClick);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelUrl, height]);

  useEffect(() => {
    const controls = controlsRef.current;
    if (controls && "zoomToCursor" in controls) controls.zoomToCursor = zoomCursor;
  }, [zoomCursor]);

  useEffect(() => {
    applyLabelMode(labelMode);
  }, [labelMode]);

  function readableLabel(obj) {
    return obj?.userData?.label || obj?.name?.replace(/^(BONE|MUSCLE|ORGAN|VESSEL|NERVE|CELL|FLOW|DEVICE|INFO|LABEL|MEMBRANE|PROTEIN|RAY|ION|TRACER|COMPARTMENT)_/i, "").replaceAll("_", " ") || "Structure";
  }

  function guessCategory(name = "") {
    const n = name.toUpperCase();
    if (n.startsWith("BONE_")) return "BONE";
    if (n.startsWith("MUSCLE_")) return "MUSCLE";
    if (n.startsWith("NERVE_")) return "NERVE";
    if (n.startsWith("VESSEL_")) return "VESSEL";
    if (n.startsWith("ORGAN_")) return "ORGAN";
    if (n.startsWith("DEVICE_")) return "DEVICE";
    if (n.startsWith("FLOW_")) return "FLOW";
    if (n.startsWith("LABEL_")) return "LABEL";
    return "STRUCTURE";
  }

  function getPointerNDC(event, dom) {
    const rect = dom.getBoundingClientRect();
    return new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
  }

  function pick(event) {
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    if (!camera || !renderer) return null;
    const pointer = getPointerNDC(event, renderer.domElement);
    const raycaster = raycasterRef.current;
    raycaster.setFromCamera(pointer, camera);
    const targets = meshesRef.current.filter((m) => m.visible && !m.name.startsWith("LABEL_"));
    const hits = raycaster.intersectObjects(targets, true);
    return hits[0] || null;
  }

  function selectObject(obj, point, zoom) {
    const dataObj = findDataObject(obj);
    selectedObjectRef.current = dataObj;
    const info = {
      label: readableLabel(dataObj),
      name: dataObj.name,
      category: dataObj.userData?.category || guessCategory(dataObj.name),
      description: dataObj.userData?.description || "Structure 3D cliquable.",
      layer: dataObj.userData?.layer || "",
      module: dataObj.userData?.module || "",
      pageRef: dataObj.userData?.page_ref || "",
    };
    setSelected(info);
    if (point) manualFocusPointRef.current = point.clone();
    if (zoom) zoomToObject(dataObj);
  }

  function findDataObject(obj) {
    let o = obj;
    while (o?.parent && !o.userData?.label && o.parent !== modelRef.current) o = o.parent;
    return o || obj;
  }

  function normalizeModel(root) {
    const box = new THREE.Box3().setFromObject(root);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    root.position.sub(center);
    root.scale.setScalar(4.2 / maxDim);
    root.updateMatrixWorld(true);
  }

  function fitCameraToObject(root, camera, controls) {
    const box = new THREE.Box3().setFromObject(root);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const distance = maxDim * 1.8;
    camera.position.copy(center.clone().add(new THREE.Vector3(0, -distance, distance * 0.58)));
    camera.near = Math.max(distance / 100, 0.01);
    camera.far = distance * 100;
    camera.updateProjectionMatrix();
    controls.target.copy(center);
    controls.update();
  }

  function zoomToObject(obj) {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls || !obj) return;
    const box = new THREE.Box3().setFromObject(obj);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const radius = Math.max(size.length() * 0.8, 0.25);
    const direction = camera.position.clone().sub(controls.target).normalize();
    controls.target.copy(center);
    camera.position.copy(center.clone().add(direction.multiplyScalar(radius * 4.0)));
    camera.updateProjectionMatrix();
    controls.update();
  }

  function updateSelectedLabelPosition() {
    const label = selectedLabelRef.current;
    const obj = selectedObjectRef.current;
    const camera = cameraRef.current;
    const container = containerRef.current;
    if (!label || !obj || !camera || !container || labelMode === "off") {
      if (label) label.style.display = "none";
      return;
    }
    const box = new THREE.Box3().setFromObject(obj);
    const center = box.getCenter(new THREE.Vector3());
    center.project(camera);
    const x = (center.x * 0.5 + 0.5) * container.clientWidth;
    const y = (-center.y * 0.5 + 0.5) * height;
    label.style.display = "block";
    label.style.transform = `translate(${x}px, ${y}px) translate(-50%, -120%)`;
  }

  function resetView() {
    const root = modelRef.current;
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (root && camera && controls) fitCameraToObject(root, camera, controls);
    manualFocusPointRef.current = null;
    setFocusLocked(false);
  }

  function centerSelection() {
    if (selectedObjectRef.current) zoomToObject(selectedObjectRef.current);
  }

  function togglePlay() {
    setPlaying((p) => !p);
  }

  function restartAnimation() {
    if (!mixerRef.current) return;
    mixerRef.current.setTime(0);
    setPlaying(true);
  }

  function applyCategoryFilter(categories) {
    const root = modelRef.current;
    if (!root) return;
    root.traverse((obj) => {
      if (!obj.isMesh && !obj.isLine && !obj.isPoints) return;
      if (obj.name.startsWith("LABEL_")) {
        obj.visible = labelMode !== "off" && labelMode !== "selection";
        return;
      }
      const cat = obj.userData?.category || guessCategory(obj.name);
      obj.visible = categories === "ALL" ? true : categories.some((c) => cat.includes(c) || obj.name.toUpperCase().startsWith(c + "_"));
    });
  }

  function applyLabelMode(mode) {
    const root = modelRef.current;
    if (!root) return;
    root.traverse((obj) => {
      if (obj.name?.startsWith("LABEL_")) obj.visible = mode === "all" || mode === "essential";
    });
  }

  function selectByItem(item) {
    const obj = meshesRef.current.find((m) => m.uuid === item.id || m.name === item.name);
    if (!obj) return;
    selectObject(obj, null, true);
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 340px", gap: 16, width: "100%" }}>
      <div style={{ position: "relative", borderRadius: 18, overflow: "hidden", background: "linear-gradient(180deg,#07111f,#02040a)", minHeight: height }}>
        <div ref={containerRef} style={{ width: "100%", height }} />

        {loading && <div style={overlayBox}>Chargement du modèle 3D...</div>}
        {error && <div style={{ ...overlayBox, color: "#ffb4a8" }}>{error}</div>}

        {selected && labelMode !== "off" && (
          <div ref={selectedLabelRef} style={selectedFloatingLabel}>
            {selected.label}
          </div>
        )}

        <div style={toolbarStyle}>
          <button style={btnStyle} onClick={togglePlay}>{playing ? "Stop / inspecter" : "Lire"}</button>
          <button style={btnStyle} onClick={restartAnimation}>Recommencer</button>
          <button style={btnStyle} onClick={resetView}>Modèle centré</button>
          <button style={btnStyle} onClick={() => setZoomCursor((v) => !v)}>Zoom curseur {zoomCursor ? "ON" : "OFF"}</button>
          <button style={btnStyle} onClick={() => setFocusLocked((v) => !v)}>Verrou POI {focusLocked ? "ON" : "OFF"}</button>
          <button style={btnStyle} onClick={centerSelection}>Centrer sélection</button>
        </div>
      </div>

      <aside style={sideStyle}>
        <h2 style={{ margin: "0 0 6px", fontSize: 18 }}>{title}</h2>
        <p style={{ margin: "0 0 12px", opacity: 0.72, fontSize: 13 }}>
          Clic = description. Double-clic = zoom. Shift + clic = point d’intérêt.
        </p>

        <div style={sectionStyle}>
          <strong>Labels</strong>
          <div style={rowStyle}>
            <button style={btnSmall} onClick={() => setLabelMode("off")}>Sans noms</button>
            <button style={btnSmall} onClick={() => setLabelMode("selection")}>Nom sélection</button>
            <button style={btnSmall} onClick={() => setLabelMode("essential")}>Essentiels</button>
            <button style={btnSmall} onClick={() => setLabelMode("all")}>Tous</button>
          </div>
        </div>

        <div style={sectionStyle}>
          <strong>Couches</strong>
          <div style={rowStyle}>
            <button style={btnSmall} onClick={() => applyCategoryFilter("ALL")}>Tout</button>
            <button style={btnSmall} onClick={() => applyCategoryFilter(["BONE"])}>Os</button>
            <button style={btnSmall} onClick={() => applyCategoryFilter(["MUSCLE", "FASCIA", "TENDON"])}>Muscles</button>
            <button style={btnSmall} onClick={() => applyCategoryFilter(["ORGAN", "CELL", "COMPARTMENT"])}>Organes</button>
            <button style={btnSmall} onClick={() => applyCategoryFilter(["NERVE"])}>Nerfs</button>
            <button style={btnSmall} onClick={() => applyCategoryFilter(["VESSEL", "FLOW"])}>Vaisseaux/flux</button>
            <button style={btnSmall} onClick={() => applyCategoryFilter(["DEVICE", "INFO", "RADIATION", "RAY"])}>Dispositifs</button>
          </div>
        </div>

        <div style={sectionStyle}>
          <strong>Structure sélectionnée</strong>
          {selected ? (
            <div style={cardStyle}>
              <div style={{ fontWeight: 800, fontSize: 16 }}>{selected.label}</div>
              <div style={{ opacity: 0.75, fontSize: 12 }}>{selected.category} · {selected.layer}</div>
              <p style={{ lineHeight: 1.45, fontSize: 13 }}>{selected.description}</p>
              <code style={codeStyle}>{selected.name}</code>
            </div>
          ) : (
            <p style={{ opacity: 0.7, fontSize: 13 }}>Clique sur une structure du modèle.</p>
          )}
        </div>

        <div style={sectionStyle}>
          <strong>Recherche</strong>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ex : aorte, rein, nerf, pH, ADN..."
            style={inputStyle}
          />
          <div style={{ maxHeight: 260, overflow: "auto", marginTop: 8 }}>
            {filteredItems.map((it) => (
              <button key={it.id} style={itemStyle} onClick={() => selectByItem(it)}>
                <span style={{ fontWeight: 700 }}>{it.label}</span>
                <span style={{ opacity: 0.62, fontSize: 11 }}>{it.category}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

const overlayBox = {
  position: "absolute",
  left: 18,
  top: 18,
  padding: "10px 14px",
  borderRadius: 12,
  background: "rgba(0,0,0,.55)",
  color: "white",
  fontWeight: 700,
};

const selectedFloatingLabel = {
  position: "absolute",
  top: 0,
  left: 0,
  pointerEvents: "none",
  background: "rgba(1, 12, 24, .88)",
  color: "white",
  padding: "7px 11px",
  borderRadius: 10,
  fontSize: 14,
  fontWeight: 800,
  boxShadow: "0 10px 28px rgba(0,0,0,.35)",
  whiteSpace: "nowrap",
};

const toolbarStyle = {
  position: "absolute",
  left: 14,
  right: 14,
  bottom: 14,
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
};

const btnStyle = {
  border: 0,
  borderRadius: 10,
  padding: "9px 12px",
  background: "rgba(255,255,255,.92)",
  cursor: "pointer",
  fontWeight: 750,
};

const btnSmall = {
  border: 0,
  borderRadius: 9,
  padding: "7px 9px",
  background: "#eef3ff",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 12,
};

const sideStyle = {
  borderRadius: 18,
  padding: 16,
  background: "#ffffff",
  boxShadow: "0 10px 30px rgba(20,40,70,.08)",
  minHeight: 720,
  color: "#142033",
};

const sectionStyle = {
  borderTop: "1px solid #e6eaf2",
  paddingTop: 12,
  marginTop: 12,
};

const rowStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: 7,
  marginTop: 8,
};

const cardStyle = {
  marginTop: 8,
  background: "#f7f9fd",
  borderRadius: 12,
  padding: 12,
};

const codeStyle = {
  display: "block",
  whiteSpace: "normal",
  background: "#edf1f8",
  padding: 8,
  borderRadius: 8,
  fontSize: 11,
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  marginTop: 8,
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #d7deeb",
};

const itemStyle = {
  width: "100%",
  border: 0,
  borderBottom: "1px solid #edf1f6",
  background: "transparent",
  textAlign: "left",
  padding: "8px 2px",
  cursor: "pointer",
  display: "grid",
  gap: 2,
};
