/* eslint-disable react-hooks/immutability */
import { Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, useGLTF } from "@react-three/drei"
import * as THREE from "three"
import {
  Crosshair,
  Eye,
  Layers,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react"
import { anatomyModules } from "../data/anatomyData"

/*
 * BodyExplorer — a second 3D viewer for the skeleton GLB with an
 * assembled ⇄ exploded slider.
 *
 * Stable base: same GLB (public/models/skeleton.glb, 183 bone meshes).
 * Differences from Skeleton3DView:
 *   - shelf-packed exploded layout (ported from human-atlas'
 *     explosion-layout.ts algorithm — see createExplosionLayout below)
 *   - bones are grouped into region bands when exploded
 *   - tap-vs-drag protection on click selection
 *   - onBoneSelect callback prop as a hook for quiz/practice flows
 *
 * Skeleton3DView.jsx is intentionally left untouched.
 */

/* ------------------------------------------------------------------ */
/*  BONES LAB DATA BRIDGE (same study data, best-effort enrichment)    */
/* ------------------------------------------------------------------ */

const BONES_MODULE = anatomyModules[0]
const BONES_BY_ID = Object.fromEntries(BONES_MODULE.bones.map((b) => [b.id, b]))
const STRUCTURES_BY_BONE = {}
for (const s of BONES_MODULE.structures) {
  ;(STRUCTURES_BY_BONE[s.boneId] ||= []).push(s)
}

/* ------------------------------------------------------------------ */
/*  REGION METADATA                                                    */
/* ------------------------------------------------------------------ */

const REGION_META = [
  { id: "skull", label: "Skull", color: "#60a5fa" },
  { id: "hyoid", label: "Hyoid", color: "#a78bfa" },
  { id: "spine", label: "Vertebral Column", color: "#34d399" },
  { id: "thorax", label: "Thorax", color: "#fbbf24" },
  { id: "shoulder", label: "Pectoral Girdle", color: "#f472b6" },
  { id: "arm", label: "Upper Limb", color: "#fb923c" },
  { id: "pelvis", label: "Pelvic Girdle", color: "#e879f9" },
  { id: "leg", label: "Lower Limb", color: "#2dd4bf" },
]

const REGION_META_MAP = Object.fromEntries(REGION_META.map((r) => [r.id, r]))
const REGION_ORDER = Object.fromEntries(REGION_META.map((r, i) => [r.id, i]))
const REGION_COLORS = Object.fromEntries(
  REGION_META.map((r) => [r.id, new THREE.Color(r.color)]),
)

/* ------------------------------------------------------------------ */
/*  GLB mesh naming: [l_|r_]<stem>_beige_0 — strip to {side, stem}     */
/* ------------------------------------------------------------------ */

function parseMeshName(name) {
  const core = name.replace(/_beige_\d+$/, "")
  const sideMatch = core.match(/^([lr])_/)
  const side = sideMatch ? (sideMatch[1] === "l" ? "Left" : "Right") : null
  const stem = sideMatch ? core.slice(2) : core
  return { side, stem }
}

/* ------------------------------------------------------------------ */
/*  DISPLAY NAMES — resolve the modeler's shorthand stems to real names */
/* ------------------------------------------------------------------ */

const STEM_LABELS = {
  Cranium: "Cranium",
  Mandible: "Mandible",
  Sternum: "Sternum",
  Sacrum: "Sacrum",
  Coccyx: "Coccyx",
  hyoid: "Hyoid Bone",
  Xiphoid_process: "Xiphoid Process",
  clavicle: "Clavicle",
  scapula: "Scapula",
  humerus: "Humerus",
  radius: "Radius",
  ulna: "Ulna",
  oscoxa: "Os Coxa (Hip Bone)",
  femur: "Femur",
  patella: "Patella",
  tibia: "Tibia",
  fibula: "Fibula",
  calcaneus: "Calcaneus",
  talus: "Talus",
  navicular: "Navicular",
  cuboid: "Cuboid",
  medial_cuneiform: "Medial Cuneiform",
  intermediate_cuneiform: "Intermediate Cuneiform",
  lateral_cuneiform: "Lateral Cuneiform",
  scaphoid: "Scaphoid",
  lunate: "Lunate",
  triquetral: "Triquetrum",
  pisiform: "Pisiform",
  trapezium: "Trapezium",
  trapezoid: "Trapezoid",
  capitate: "Capitate",
  hamate: "Hamate",
  sesamoids: "Sesamoid Bones",
  sesamoids001: "Sesamoid Bones",
}

function capitalizeWord(w) {
  return w.charAt(0).toUpperCase() + w.slice(1)
}

function baseBoneName(stem) {
  if (stem === "c1") return "Atlas (C1)"
  if (stem === "c2") return "Axis (C2)"
  let m
  if ((m = stem.match(/^c(\d+)$/i))) return `Cervical Vertebra C${m[1]}`
  if ((m = stem.match(/^t(\d+)$/i))) return `Thoracic Vertebra T${m[1]}`
  if ((m = stem.match(/^l(\d+)$/i))) return `Lumbar Vertebra L${m[1]}`
  if ((m = stem.match(/^rib(\d+)$/i))) return `Rib ${m[1]}`
  if ((m = stem.match(/^metacarpal(\d+)$/i))) return `Metacarpal ${m[1]}`
  if ((m = stem.match(/^metatarsal_(\d+)$/i))) return `Metatarsal ${m[1]}`
  if ((m = stem.match(/^(proximal|intermediate|interemediate|distal)_phalange_?(\d+)$/i))) {
    const kind = m[1].toLowerCase() === "interemediate" ? "Intermediate" : capitalizeWord(m[1].toLowerCase())
    return `${kind} Phalanx ${m[2]}`
  }
  if (STEM_LABELS[stem]) return STEM_LABELS[stem]
  return stem.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

function isPhalanxStem(stem) {
  return /^(proximal|intermediate|interemediate|distal)_phalange_?\d+$/i.test(stem)
}

/* ------------------------------------------------------------------ */
/*  REGION CLASSIFIER — stem + vertical position (hand vs foot)        */
/* ------------------------------------------------------------------ */

function classifyRegion(stem, y01) {
  if (/^(Cranium|Mandible)$/.test(stem)) return "skull"
  if (/^hyoid$/.test(stem)) return "hyoid"
  if (/^[ctl]\d+$/i.test(stem) || /^(Sacrum|Coccyx)$/.test(stem)) return "spine"
  if (/^rib\d+$/i.test(stem) || /^(Sternum|Xiphoid_process)$/.test(stem)) return "thorax"
  if (/^(clavicle|scapula)$/.test(stem)) return "shoulder"
  if (/^oscoxa$/.test(stem)) return "pelvis"
  if (/^(humerus|radius|ulna|scaphoid|lunate|triquetral|pisiform|trapezium|trapezoid|capitate|hamate)$/.test(stem)) return "arm"
  if (/^metacarpal\d+$/i.test(stem)) return "arm"
  if (/^(femur|patella|tibia|fibula|calcaneus|talus|navicular|cuboid|medial_cuneiform|intermediate_cuneiform|lateral_cuneiform|sesamoids|sesamoids001)$/.test(stem)) return "leg"
  if (/^metatarsal_\d+$/i.test(stem)) return "leg"
  if (isPhalanxStem(stem)) return y01 > 0.5 ? "arm" : "leg"
  return null
}

/* ------------------------------------------------------------------ */
/*  BONE-ID CLASSIFIER → Bones Lab study data (best effort)            */
/* ------------------------------------------------------------------ */

const BONE_CLASSIFIERS = [
  [/cranium/, "frontal-bone"],
  [/mandib/, "mandible"],
  [/hyoid/, "hyoid-bone"],
  [/^c1$/, "atlas"],
  [/^c2$/, "axis"],
  [/^c\d$/, "cervical-vertebra"],
  [/^t\d{1,2}$/, "thoracic-vertebra"],
  [/^l\d$/, "lumbar-vertebra"],
  [/sacrum|coccyx/, "sacrum"],
  [/sternum|xiphoid/, "sternum"],
  [/clavicle/, "clavicle"],
  [/scapula/, "scapula"],
  [/humerus/, "humerus"],
  [/ulna/, "ulna"],
  [/radius/, "radius"],
  [/femur/, "femur"],
  [/patella/, "patella"],
  [/tibia/, "tibia-fibula"],
  [/fibula/, "tibia-fibula"],
  [/calcaneus|talus|navicular|cuboid|cuneiform/, "foot-tarsals"],
  [/metacarpal/, "hand-phalanges"],
  [/metatarsal/, "foot-phalanges"],
  [/phalange/, "hand-phalanges"],
  [/scaphoid|lunate|triquetral|pisiform|trapezium|trapezoid|capitate|hamate/, "hand-carpals"],
  [/oscoxa/, "pelvis"],
  [/rib/, "ribs"],
  [/sesamoids/, "foot-phalanges"],
]

function classifyBoneId(stem) {
  const n = stem.toLowerCase()
  for (const [pattern, boneId] of BONE_CLASSIFIERS) {
    if (pattern.test(n)) return boneId
  }
  return null
}

/* ------------------------------------------------------------------ */
/*  EXPLOSION LAYOUT — plain-JS port of human-atlas' shelf-packing     */
/*  algorithm (app/explosion-layout.ts). Packs each bone's projected   */
/*  bounding box into rows, tallest-first within region bands, then    */
/*  recenters the grid on the origin.                                  */
/* ------------------------------------------------------------------ */

function createExplosionLayout(parts, aspect = 1.4) {
  const MIN_SIZE = 0.02
  const PADDING = 0.035

  const cards = parts.map((p) => ({
    id: p.id,
    regionOrder: p.regionOrder,
    width: Math.max(MIN_SIZE, p.width) + PADDING,
    height: Math.max(MIN_SIZE, p.height) + PADDING,
  }))

  const area = cards.reduce((sum, c) => sum + c.width * c.height, 0)
  const maxWidth = Math.max(0.3, ...cards.map((c) => c.width))
  const targetWidth = Math.max(
    maxWidth,
    Math.sqrt(area * Math.max(0.5, Math.min(1.5, aspect))) * 1.18,
  )

  // Region bands first (skull → leg), then tallest cards first per row.
  cards.sort(
    (a, b) =>
      a.regionOrder - b.regionOrder ||
      b.height - a.height ||
      a.id.localeCompare(b.id),
  )

  const cells = new Map()
  let x = 0
  let y = 0
  let rowHeight = 0
  let usedWidth = 0

  for (const card of cards) {
    if (x > 0 && x + card.width > targetWidth) {
      x = 0
      y += rowHeight
      rowHeight = 0
    }
    cells.set(card.id, {
      x: x + card.width / 2,
      y: -y - card.height / 2,
      width: card.width,
      height: card.height,
    })
    x += card.width
    usedWidth = Math.max(usedWidth, x)
    rowHeight = Math.max(rowHeight, card.height)
  }

  const totalHeight = y + rowHeight
  cells.forEach((cell) => {
    cell.x -= usedWidth / 2
    cell.y += totalHeight / 2
  })

  return { cells, width: usedWidth, height: totalHeight }
}

/* ------------------------------------------------------------------ */
/*  VIEW PRESETS                                                       */
/* ------------------------------------------------------------------ */

// Must match the Canvas camera below; the fit math depends on it.
const CAMERA_FOV = 45

const VIEW_PRESETS = [
  { id: "front", label: "Front", angle: [0, 0, 1] },
  { id: "back", label: "Back", angle: [0, 0, -1] },
  { id: "left", label: "Left", angle: [-1, 0, 0] },
  { id: "right", label: "Right", angle: [1, 0, 0] },
  { id: "top", label: "Top", angle: [0, 1, -0.01] },
]

/* ------------------------------------------------------------------ */
/*  SCENE CONTENT                                                      */
/* ------------------------------------------------------------------ */

function ExplorerScene({
  bones,
  fit,
  explodeTarget,
  selectedName,
  hoveredName,
  isolate,
  focusRegion,
  regionColorMode,
  viewPreset,
  onViewPresetApplied,
  focusTarget,
  onFocusApplied,
  onSelectBone,
  onHoverBone,
  downPosRef,
}) {
  const { camera } = useThree()
  const controlsRef = useRef()
  const sceneCenter = useRef(new THREE.Vector3())
  const sceneDist = useRef(1)
  const explodeT = useRef(0)
  const uiRef = useRef({})
  const fitRef = useRef(null)
  const interactedRef = useRef(false)
  fitRef.current = fit

  // Mirror props into a ref so useFrame reads fresh values without re-render.
  uiRef.current = {
    selectedName,
    hoveredName,
    isolate,
    focusRegion,
    regionColorMode,
  }

  // Position the camera from the shared fit metrics. Layout effect so the
  // correct framing lands before first paint — never a flash of the camera
  // sitting inside the model.
  const applyFit = useCallback(() => {
    const f = fitRef.current
    if (!f) return false
    const { center, dist, maxDim } = f
    sceneCenter.current.copy(center)
    sceneDist.current = dist
    camera.position.set(center.x, center.y, center.z + dist)
    camera.near = Math.max(maxDim / 300, 0.001)
    camera.far = Math.max(dist * 12, 50)
    camera.lookAt(center)
    camera.updateProjectionMatrix()
    const controls = controlsRef.current
    if (controls) {
      controls.target.copy(center)
      // Hard zoom limits: the user can always pull back far enough to see
      // the whole skeleton, and can never push the camera inside the bones.
      controls.minDistance = dist * 0.08
      controls.maxDistance = dist * 15
      controls.update()
    }
    return true
  }, [camera])

  useLayoutEffect(() => {
    applyFit()
  }, [fit, camera, applyFit])

  // Disarm the watchdog the moment the user grabs the camera themselves.
  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) return
    const onStart = () => {
      interactedRef.current = true
    }
    controls.addEventListener("start", onStart)
    return () => controls.removeEventListener("start", onStart)
  }, [])

  // Watchdog: if the camera ever collapses onto its target before the user
  // has interacted (orbit radius ~0 makes zooming out impossible — the
  // reported "stuck inside the bones" state), re-apply the fit. Healthy
  // camera positions (view presets, bone focus, user orbiting) are untouched.
  useFrame(() => {
    if (interactedRef.current) return
    const f = fitRef.current
    const controls = controlsRef.current
    if (!f || !controls) return
    const d = camera.position.distanceTo(controls.target)
    if (!isFinite(d) || d < f.dist * 0.02) applyFit()
  })

  // View preset application.
  useEffect(() => {
    if (!viewPreset) return
    const preset = VIEW_PRESETS.find((p) => p.id === viewPreset)
    if (!preset) {
      onViewPresetApplied()
      return
    }
    const c = sceneCenter.current
    const d = sceneDist.current
    const [ax, ay, az] = preset.angle
    camera.position.set(c.x + ax * d, c.y + ay * d, c.z + az * d)
    camera.lookAt(c)
    camera.updateProjectionMatrix()
    if (controlsRef.current) {
      controlsRef.current.target.copy(c)
      controlsRef.current.update()
    }
    onViewPresetApplied()
  }, [viewPreset, camera, onViewPresetApplied])

  // Focus camera on a specific bone when requested.
  useEffect(() => {
    if (!focusTarget) return
    const bone = bones.find((b) => b.name === focusTarget)
    if (!bone) {
      onFocusApplied()
      return
    }
    const c = bone.center
      .clone()
      .addScaledVector(bone.offset, explodeT.current)
    const d = sceneDist.current * 0.35
    camera.position.set(c.x, c.y, c.z + d)
    camera.lookAt(c)
    camera.updateProjectionMatrix()
    if (controlsRef.current) {
      controlsRef.current.target.copy(c)
      controlsRef.current.update()
    }
    onFocusApplied()
  }, [focusTarget, bones, camera, onFocusApplied])

  // Smooth explode animation + material state, per frame.
  useFrame((_, dt) => {
    const ui = uiRef.current
    // Ease the explode factor toward its target.
    const t = explodeT.current
    const next = t + (explodeTarget - t) * Math.min(1, dt * 5)
    explodeT.current = Math.abs(explodeTarget - next) < 0.0005 ? explodeTarget : next
    const k = explodeT.current

    for (const bone of bones) {
      const m = bone.mesh
      // Assembled (k=0) restores the exact authored GLB position; exploded
      // (k=1) lands on the layout target. Never collapses to the origin.
      m.position.copy(bone.originalPosition).addScaledVector(bone.explodeLocal, k)

      const mat = m.material
      const isSelected = ui.selectedName === bone.name
      const isHovered =
        ui.hoveredName === bone.name && !isSelected
      const isDimmed =
        (ui.focusRegion && bone.region !== ui.focusRegion) ||
        (ui.isolate && ui.selectedName && !isSelected)

      if (isSelected) {
        mat.color.set("#22d3ee")
        mat.emissive.set("#0e7490")
        mat.emissiveIntensity = 0.55
        mat.opacity = 1
        mat.transparent = false
        mat.depthWrite = true
      } else if (isHovered) {
        mat.color.copy(bone.originalColor).lerp(new THREE.Color("#67e8f9"), 0.4)
        mat.emissive.set("#155e75")
        mat.emissiveIntensity = 0.3
        mat.opacity = 1
        mat.transparent = false
        mat.depthWrite = true
      } else if (isDimmed) {
        mat.color.copy(bone.originalColor).multiplyScalar(0.25)
        mat.emissive.set("#000000")
        mat.emissiveIntensity = 0
        mat.opacity = 0.12
        mat.transparent = true
        mat.depthWrite = false
      } else if (ui.regionColorMode && bone.region && REGION_COLORS[bone.region]) {
        mat.color.copy(REGION_COLORS[bone.region])
        mat.emissive.set("#000000")
        mat.emissiveIntensity = 0
        mat.opacity = 1
        mat.transparent = false
        mat.depthWrite = true
      } else {
        mat.color.copy(bone.originalColor)
        mat.emissive.set("#000000")
        mat.emissiveIntensity = 0
        mat.opacity = 1
        mat.transparent = false
        mat.depthWrite = true
      }
    }
  })

  const handleClick = useCallback(
    (e) => {
      e.stopPropagation()
      // Tap-vs-drag protection: only select when the pointer barely moved.
      const down = downPosRef.current
      if (down) {
        const dx = e.nativeEvent.clientX - down.x
        const dy = e.nativeEvent.clientY - down.y
        if (dx * dx + dy * dy > 36) return
      }
      if (!e.object?.isMesh) return
      const name = e.object.name
      onSelectBone(selectedName === name ? null : name)
    },
    [selectedName, onSelectBone, downPosRef],
  )

  const handlePointerOver = useCallback(
    (e) => {
      e.stopPropagation()
      if (e.object?.isMesh) {
        document.body.style.cursor = "pointer"
        onHoverBone(e.object.name)
      }
    },
    [onHoverBone],
  )

  const handlePointerOut = useCallback(() => {
    document.body.style.cursor = "auto"
    onHoverBone(null)
  }, [onHoverBone])

  const handlePointerDown = useCallback(
    (e) => {
      downPosRef.current = {
        x: e.nativeEvent.clientX,
        y: e.nativeEvent.clientY,
      }
    },
    [downPosRef],
  )

  return (
    <>
      <ambientLight intensity={0.45} />
      <hemisphereLight skyColor={"#b1e1ff"} groundColor={"#1e293b"} intensity={0.5} />
      <directionalLight position={[5, 12, 7]} intensity={0.9} />
      <directionalLight position={[-6, -4, -5]} intensity={0.25} />
      <directionalLight position={[0, -8, 4]} intensity={0.15} />
      {bones.map((b) => (
        <primitive
          key={b.name}
          object={b.mesh}
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          onPointerDown={handlePointerDown}
        />
      ))}
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.08}
        minDistance={fit ? fit.dist * 0.08 : undefined}
        maxDistance={fit ? fit.dist * 15 : undefined}
      />
    </>
  )
}

function LoadingFallback() {
  return (
    <div className="flex h-full items-center justify-center bg-slate-900 text-sm text-slate-400">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-cyan-400" />
        Loading 3D body explorer…
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  EXPLORER (inner — owns GLB discovery + all UI state)                */
/* ------------------------------------------------------------------ */

function ExplorerInner({ onBoneSelect }) {
  const { scene: gltfScene } = useGLTF(`${import.meta.env.BASE_URL}models/skeleton.glb`)
  // Clone the cached GLB scene per viewer instance. useGLTF shares one scene
  // across every consumer — without this, one viewer's animation permanently
  // rewrites the mesh transforms the other viewer renders.
  const scene = useMemo(() => gltfScene.clone(true), [gltfScene])
  const downPosRef = useRef(null)

  const [explodeTarget, setExplodeTarget] = useState(0)
  const [selectedName, setSelectedName] = useState(null)
  const [hoveredName, setHoveredName] = useState(null)
  const [focusRegion, setFocusRegion] = useState(null)
  const [isolate, setIsolate] = useState(false)
  const [regionColorMode, setRegionColorMode] = useState(false)
  const [viewPreset, setViewPreset] = useState(null)
  const [focusTarget, setFocusTarget] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)

  // One-time discovery: meshes → bone records (name, region, center, size).
  const bones = useMemo(() => {
    const sceneBox = new THREE.Box3().setFromObject(scene)
    const min = sceneBox.min
    const max = sceneBox.max
    const found = []
    scene.traverse((child) => {
      if (!child.isMesh) return
      child.material = child.material.clone()
      if (!child.material.emissive) {
        child.material.emissive = new THREE.Color(0x000000)
      }
      const box = new THREE.Box3().setFromObject(child)
      const center = new THREE.Vector3()
      const size = new THREE.Vector3()
      box.getCenter(center)
      box.getSize(size)
      const { side, stem } = parseMeshName(child.name)
      const y01 = (center.y - min.y) / Math.max(1e-6, max.y - min.y)
      const region = classifyRegion(stem, y01)
      const base = baseBoneName(stem)
      const qualifiers = []
      if (side) qualifiers.push(side)
      if (isPhalanxStem(stem)) qualifiers.push(region === "arm" ? "Hand" : "Foot")
      const displayName = qualifiers.length
        ? base.includes("(")
          ? `${qualifiers.join(" ")} ${base}`
          : `${base} (${qualifiers.join(" ")})`
        : base
      found.push({
        mesh: child,
        name: child.name,
        displayName,
        side,
        stem,
        region,
        boneId: classifyBoneId(stem),
        center,
        size,
        originalColor: child.material.color.clone(),
        // Local-space position as authored in the GLB. The explode animation
        // must always be relative to this — never overwrite it.
        originalPosition: child.position.clone(),
      })
    })
    return found
  }, [scene])

  // Shelf-packed exploded layout for every bone.
  const layout = useMemo(() => {
    if (!bones.length) return { cells: new Map(), width: 0, height: 0 }
    const aspect = typeof window !== "undefined"
      ? window.innerWidth / Math.max(1, window.innerHeight)
      : 1.4
    return createExplosionLayout(
      bones.map((b) => ({
        id: b.name,
        regionOrder: b.region ? REGION_ORDER[b.region] : 99,
        width: b.size.x,
        height: b.size.y,
      })),
      aspect,
    )
  }, [bones])

  // Exploded targets + per-bone offsets from assembled position.
  // Meshes live nested inside transformed groups, so the animation delta is
  // computed in each mesh's parent-local space: at k=0 the mesh sits at its
  // exact authored GLB position; at k=1 it lands on the world-space layout
  // target. `offset` stays world-space for camera focus tracking.
  useMemo(() => {
    if (!bones.length) return
    scene.updateMatrixWorld(true)
    const sceneBox = new THREE.Box3()
    for (const b of bones) sceneBox.expandByPoint(b.center)
    const flatZ = (sceneBox.min.z + sceneBox.max.z) / 2
    for (const b of bones) {
      const cell = layout.cells.get(b.name)
      const explodedWorld = new THREE.Vector3(
        cell ? cell.x : b.center.x,
        cell ? cell.y : b.center.y,
        flatZ,
      )
      b.exploded = explodedWorld
      b.offset = new THREE.Vector3().subVectors(explodedWorld, b.center)
      const parent = b.mesh.parent || scene
      const localTarget = parent.worldToLocal(explodedWorld.clone())
      b.explodeLocal = localTarget.sub(b.originalPosition)
    }
  }, [bones, layout, scene])

  // Camera fit metrics shared with the scene: framing center + distance that
  // fits both the assembled skeleton and the exploded shelf layout.
  // Degenerate/NaN input falls back to a sane default instead of leaving
  // the camera stranded inside the model.
  const fit = useMemo(() => {
    if (!bones.length) return null
    const box = new THREE.Box3()
    for (const b of bones) box.expandByPoint(b.center)
    for (const b of bones) {
      const e = b.exploded || b.center
      const s = b.size || new THREE.Vector3()
      box.expandByPoint(
        new THREE.Vector3(e.x - s.x / 2, e.y - s.y / 2, e.z),
      )
      box.expandByPoint(
        new THREE.Vector3(e.x + s.x / 2, e.y + s.y / 2, e.z),
      )
    }
    const center = new THREE.Vector3()
    const size = new THREE.Vector3()
    box.getCenter(center)
    box.getSize(size)
    let maxDim = Math.max(size.x, size.y, size.z)
    if (!isFinite(maxDim) || maxDim <= 1e-6) {
      center.set(0, 0, 0)
      maxDim = 2
    }
    const halfFov = ((CAMERA_FOV * Math.PI) / 180) / 2
    const dist = (maxDim / 2 / Math.tan(halfFov)) * 1.35
    if (!isFinite(dist) || dist <= 1e-6) return null
    return { center, dist, maxDim }
  }, [bones])

  const selectedBone = useMemo(
    () => bones.find((b) => b.name === selectedName) || null,
    [bones, selectedName],
  )

  // Quiz hook: notify parent whenever the selection changes.
  useEffect(() => {
    if (!onBoneSelect) return
    onBoneSelect(
      selectedBone
        ? {
            meshName: selectedBone.name,
            displayName: selectedBone.displayName,
            side: selectedBone.side,
            region: selectedBone.region,
            regionLabel: selectedBone.region
              ? REGION_META_MAP[selectedBone.region]?.label
              : null,
            boneId: selectedBone.boneId,
          }
        : null,
    )
  }, [selectedBone, onBoneSelect])

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase()
    return bones
      .filter((b) => b.displayName.toLowerCase().includes(q))
      .slice(0, 10)
  }, [bones, searchQuery])

  const handleSearchSelect = useCallback(
    (name) => {
      setSelectedName(name)
      setFocusTarget(name)
      setSearchQuery("")
      setSearchOpen(false)
    },
    [],
  )

  const handleResetView = useCallback(() => {
    setViewPreset("front")
    setExplodeTarget(0)
  }, [])

  const selectedStudy = useMemo(() => {
    if (!selectedBone) return null
    const boneData = selectedBone.boneId ? BONES_BY_ID[selectedBone.boneId] : null
    const structures = selectedBone.boneId
      ? STRUCTURES_BY_BONE[selectedBone.boneId] || []
      : []
    return { boneData, structures }
  }, [selectedBone])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="panel px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">3D Anatomy Explorer</p>
            <h2 className="mt-1 font-display text-2xl text-slate-900">
              Body Explorer
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              All {bones.length} bones, individually selectable. Drag the
              slider to explode the skeleton into a labeled shelf layout, or
              click any bone to inspect it.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600">
            <Layers size={14} className="text-cyan-600" />
            {bones.length} bone meshes
          </div>
        </div>
      </div>

      {/* Viewer */}
      <div className="panel overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col gap-2 border-b border-slate-200 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Explode slider */}
            <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-xl bg-slate-100 px-3 py-1.5 sm:max-w-xs">
              <SlidersHorizontal size={13} className="shrink-0 text-slate-500" />
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(explodeTarget * 100)}
                onChange={(e) => setExplodeTarget(Number(e.target.value) / 100)}
                className="w-full accent-cyan-600"
                aria-label="Exploded view amount"
                title="Exploded view"
              />
              <span className="w-10 shrink-0 text-right text-[11px] font-bold text-slate-600">
                {Math.round(explodeTarget * 100)}%
              </span>
            </div>

            {/* Search */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setSearchOpen((v) => !v)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  searchOpen
                    ? "bg-cyan-600 text-white shadow-md"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Search size={13} />
                Search
              </button>
            </div>

            {/* Region filter */}
            <select
              value={focusRegion || ""}
              onChange={(e) => setFocusRegion(e.target.value || null)}
              className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 outline-none transition hover:bg-slate-200"
              title="Dim bones outside a region"
            >
              <option value="">All Regions</option>
              {REGION_META.map((r) => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>

            {/* Isolate toggle */}
            <button
              type="button"
              onClick={() => setIsolate((v) => !v)}
              disabled={!selectedName}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                !selectedName
                  ? "cursor-not-allowed bg-slate-50 text-slate-400"
                  : isolate
                    ? "bg-violet-600 text-white shadow-md"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
              title="Show only the selected bone"
            >
              <Eye size={13} />
              Isolate
            </button>

            {/* Region colors */}
            <button
              type="button"
              onClick={() => setRegionColorMode((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                regionColorMode
                  ? "bg-purple-600 text-white shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
              title="Color-code bones by region"
            >
              Regions
            </button>

            {/* View presets */}
            <div className="flex items-center gap-1 rounded-xl bg-slate-100 px-1 py-0.5">
              {VIEW_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setViewPreset(p.id)}
                  className="rounded-lg px-2 py-1 text-[10px] font-bold text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Reset */}
            <button
              type="button"
              onClick={handleResetView}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-200"
              title="Reassemble and reset camera"
            >
              <RotateCcw size={13} />
              Reset
            </button>

            {selectedBone && (
              <span className="rounded-xl bg-cyan-100 px-3 py-1.5 text-xs font-semibold text-cyan-800">
                {selectedBone.displayName}
              </span>
            )}
          </div>

          {/* Search row */}
          {searchOpen && (
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search bones by name… (e.g. radius, rib 7, talus)"
                className="w-full rounded-xl bg-slate-100 px-4 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-slate-200"
                autoFocus
              />
              {searchQuery && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
                  {searchResults.map((r) => (
                    <button
                      key={r.name}
                      type="button"
                      onClick={() => handleSearchSelect(r.name)}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100"
                    >
                      {r.region && (
                        <span
                          className="inline-block h-2 w-2 shrink-0 rounded-full"
                          style={{ background: REGION_META_MAP[r.region]?.color || "#94a3b8" }}
                        />
                      )}
                      {r.displayName}
                    </button>
                  ))}
                </div>
              )}
              {searchQuery && searchResults.length === 0 && (
                <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-xl">
                  No bones match “{searchQuery}”.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Canvas + info panel */}
        <div className="relative">
          <div className="h-[440px] w-full sm:h-[620px]">
            <Canvas
              camera={{
                fov: CAMERA_FOV,
                near: 0.01,
                far: 200,
                position: [0, 0.2, 3.5],
              }}
              gl={{ preserveDrawingBuffer: true }}
              style={{ background: "#0f172a" }}
            >
              <ExplorerScene
                bones={bones}
                fit={fit}
                explodeTarget={explodeTarget}
                selectedName={selectedName}
                hoveredName={hoveredName}
                isolate={isolate}
                focusRegion={focusRegion}
                regionColorMode={regionColorMode}
                viewPreset={viewPreset}
                onViewPresetApplied={() => setViewPreset(null)}
                focusTarget={focusTarget}
                onFocusApplied={() => setFocusTarget(null)}
                onSelectBone={setSelectedName}
                onHoverBone={setHoveredName}
                downPosRef={downPosRef}
              />
            </Canvas>
          </div>

          {/* Region legend overlay */}
          {regionColorMode && (
            <div className="absolute left-4 top-4 rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-xl backdrop-blur-md">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Anatomical Regions
              </p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {REGION_META.map((r) => (
                  <div key={r.id} className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ background: r.color }} />
                    <span className="text-xs font-medium text-slate-300">{r.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hovered bone readout */}
          {hoveredName && !selectedBone && (
            <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2">
              <div className="rounded-xl bg-black/60 px-4 py-2 text-xs font-semibold text-slate-200 backdrop-blur-sm">
                {bones.find((b) => b.name === hoveredName)?.displayName}
              </div>
            </div>
          )}

          {/* Selected bone info panel */}
          {selectedBone && (
            <div className="absolute right-4 top-4 w-72 max-w-[calc(100%-2rem)] rounded-2xl border border-white/10 bg-slate-900/90 p-4 shadow-2xl backdrop-blur-md">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                    Selected Bone
                  </p>
                  <h3 className="mt-0.5 text-sm font-bold text-white">
                    {selectedStudy?.boneData?.label || selectedBone.displayName}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedName(null)}
                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 text-slate-400 transition hover:bg-white/20 hover:text-white"
                  aria-label="Deselect bone"
                >
                  <X size={13} />
                </button>
              </div>

              {selectedBone.region && (
                <span
                  className="mt-2 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white"
                  style={{ background: REGION_META_MAP[selectedBone.region]?.color }}
                >
                  {REGION_META_MAP[selectedBone.region]?.label}
                </span>
              )}

              {selectedStudy?.boneData?.description && (
                <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
                  {selectedStudy.boneData.description}
                </p>
              )}
              {selectedStudy && selectedStudy.structures.length > 0 && (
                <p className="mt-2 text-[11px] text-cyan-400/80">
                  {selectedStudy.structures.length} study landmarks in Bones Lab
                </p>
              )}
              <p className="mt-2 truncate text-[10px] text-slate-600">
                Mesh: {selectedBone.name}
              </p>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setFocusTarget(selectedBone.name)}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-cyan-500/20 px-3 py-1.5 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/30"
                >
                  <Crosshair size={12} />
                  Focus
                </button>
                <button
                  type="button"
                  onClick={() => setIsolate((v) => !v)}
                  className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                    isolate
                      ? "bg-violet-500/90 text-white"
                      : "bg-white/10 text-slate-300 hover:bg-white/20"
                  }`}
                >
                  <Eye size={12} />
                  {isolate ? "Show All" : "Isolate"}
                </button>
              </div>
            </div>
          )}

          {/* Orbit hint */}
          {!selectedBone && bones.length > 0 && (
            <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2">
              <div className="rounded-xl bg-black/50 px-4 py-2 text-[11px] text-slate-400 backdrop-blur-sm">
                Drag to orbit · Scroll to zoom · Click a bone to inspect
              </div>
            </div>
          )}

          {/* Diagnostic: the model file loaded but contained no meshes. */}
          {bones.length === 0 && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="max-w-sm rounded-2xl bg-black/60 px-6 py-5 text-center backdrop-blur-sm">
                <p className="text-sm font-semibold text-amber-300">
                  3D model found no bones
                </p>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">
                  The skeleton file loaded but contained no bone meshes. Check
                  that <span className="font-mono">/models/skeleton.glb</span>{" "}
                  is the 16&nbsp;MB original and that you are serving the
                  latest <span className="font-mono">dist</span> folder.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  MAIN EXPORT                                                        */
/* ------------------------------------------------------------------ */

export function BodyExplorer({ onBoneSelect }) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ExplorerInner onBoneSelect={onBoneSelect} />
    </Suspense>
  )
}

useGLTF.preload(`${import.meta.env.BASE_URL}models/skeleton.glb`)
