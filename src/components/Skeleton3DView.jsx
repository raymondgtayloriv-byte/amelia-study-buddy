/* eslint-disable react-hooks/immutability */
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Canvas, useThree, useFrame } from "@react-three/fiber"
import { OrbitControls, useGLTF } from "@react-three/drei"
import * as THREE from "three"
import { Maximize2, Palette, RotateCcw, Search, X, Eye, Crosshair, Trophy, ArrowRight, CheckCircle2, XCircle } from "lucide-react"
import { anatomyModules } from "../data/anatomyData"

/*
 * 3D skeleton viewer with study-data integration and expanded view.
 *
 * Stable base: GLB loading, auto-fit camera, orbit controls.
 * Features:
 *   - expand / fullscreen with study sidebar showing real Bones Lab data
 *   - bone labels (individual bone names from Chapter 7 study data)
 *   - region focus (dims non-focused regions)
 *   - bone click/select with cyan highlight
 *   - study panel with anatomical landmarks, definitions, hints
 */

/* ------------------------------------------------------------------ */
/*  BONES LAB DATA BRIDGE                                              */
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

/* ------------------------------------------------------------------ */
/*  BONE CLASSIFIERS — map GLB mesh names → bones lab bone IDs         */
/* ------------------------------------------------------------------ */

const BONE_CLASSIFIERS = [
  [/frontal/, "frontal-bone"],
  [/parietal/, "parietal-bone"],
  [/occipital/, "occipital-bone"],
  [/temporal/, "temporal-bone"],
  [/sphenoid/, "sphenoid-bone"],
  [/ethmoid/, "ethmoid-bone"],
  [/mandib/, "mandible"],
  [/maxill/, "maxilla"],
  [/zygomatic/, "zygomatic-bone"],
  [/palatine/, "palatine-bone"],
  [/nasal|vomer|lacrimal|concha/, "orbit-and-nasal"],
  [/hyoid/, "hyoid-bone"],
  [/atlas/, "atlas"],
  [/axis/, "axis"],
  [/cervic/, "cervical-vertebra"],
  [/lumbar/, "lumbar-vertebra"],
  [/sacr/, "sacrum"],
  [/coccyx/, "sacrum"],
  [/sternum|manubrium|xiphoid/, "sternum"],
  [/clavicle/, "clavicle"],
  [/scapula/, "scapula"],
  [/humerus/, "humerus"],
  [/ulna/, "ulna"],
  [/radius(?!.*fibula)/, "radius"],
  [/femur/, "femur"],
  [/patella/, "patella"],
  [/tibia/, "tibia-fibula"],
  [/fibula/, "tibia-fibula"],
  [/calcaneus|calcaneum/, "foot-tarsals"],
  [/talus/, "foot-tarsals"],
  [/navicular.*foot|foot.*navicular/, "foot-tarsals"],
  [/cuboid/, "foot-tarsals"],
  [/cuneiform/, "foot-tarsals"],
  [/metacarp/, "hand-phalanges"],
  [/metatars/, "foot-phalanges"],
  [/phalang.*hand|hand.*phalang|finger/, "hand-phalanges"],
  [/phalang.*foot|foot.*phalang|toe/, "foot-phalanges"],
  [/phalanx|phalange/, "hand-phalanges"],
  [/carpal|carpals|lunate|scaphoid|triquetrum|pisiform|trapezium|trapezoid|capitate|hamate/, "hand-carpals"],
  [/tarsal|tarsals/, "foot-tarsals"],
  [/ilium|iliac/, "pelvis"],
  [/ischium|ischial/, "pelvis"],
  [/pubis|pubic/, "pelvis"],
  [/innominate|os.coxa|hip.bone|acetabul/, "pelvis"],
  [/pelvi/, "pelvis"],
  [/rib|costal/, "ribs"],
  [/thoracic/, "thoracic-vertebra"],
  [/vertebr/, "typical-vertebra"],
]

// Region-based colors for the color-coding mode
const REGION_COLORS = {
  skull: new THREE.Color("#60a5fa"),
  hyoid: new THREE.Color("#a78bfa"),
  spine: new THREE.Color("#34d399"),
  thorax: new THREE.Color("#fbbf24"),
  shoulder: new THREE.Color("#f472b6"),
  arm: new THREE.Color("#fb923c"),
  pelvis: new THREE.Color("#e879f9"),
  leg: new THREE.Color("#2dd4bf"),
}

function classifyBone(name) {
  const n = name.toLowerCase()
  for (const [pattern, boneId] of BONE_CLASSIFIERS) {
    if (pattern.test(n)) return boneId
  }
  return null
}

/* ------------------------------------------------------------------ */
/*  REGION CLASSIFIER (broader, for mesh → region mapping)             */
/* ------------------------------------------------------------------ */

function classifyMesh(name) {
  const n = name.toLowerCase()
  if (
    /skull|cranium|frontal|parietal|occipital|temporal|sphenoid|ethmoid|zygomatic|maxill|mandib|nasal|lacrimal|vomer|palatine|orbit/.test(n)
  ) return "skull"
  if (/hyoid/.test(n)) return "hyoid"
  if (/vertebr|atlas|axis|cervic|thoracic_v|lumbar|sacr|coccyx|spine|column/.test(n)) return "spine"
  if (/rib|sternum|manubrium|xiphoid|costal/.test(n)) return "thorax"
  if (/clavicle|scapula/.test(n)) return "shoulder"
  if (/humerus|ulna|radius(?!.*fibula)|carpal|metacarp|phalang.*hand|hand/.test(n)) return "arm"
  if (/pelvi|ilium|iliac|ischium|ischial|pubis|pubic|hip|innominate|os.coxa|sacroiliac|acetabul/.test(n)) return "pelvis"
  if (/femur|patella|tibia|fibula|tarsal|metatars|phalang.*foot|foot.*phalang|calcaneus|calcaneum|talus|cuboid|cuneiform|navicular.*foot|foot|toe/.test(n)) return "leg"
  if (/phalang|finger/.test(n)) return "arm"
  return null
}

function prettifyMeshName(name) {
  let clean = name.replace(/_/g, " ").replace(/\.\d+$/, "")
  const sideMatch = clean.match(/\s+(L|R|Left|Right)$/i)
  let side = ""
  if (sideMatch) {
    side = sideMatch[1].length === 1 ? sideMatch[1].toUpperCase() : sideMatch[1]
    clean = clean.slice(0, -sideMatch[0].length)
  }
  clean = clean.replace(/\b\w/g, (c) => c.toUpperCase()).trim()
  return side ? `${clean} (${side})` : clean
}

/* ------------------------------------------------------------------ */
/*  VIEW PRESETS — camera positions for quick orientation               */
/* ------------------------------------------------------------------ */

const VIEW_PRESETS = [
  { id: "front", label: "Front", angle: [0, 0, 1] },
  { id: "back", label: "Back", angle: [0, 0, -1] },
  { id: "left", label: "Left", angle: [-1, 0, 0] },
  { id: "right", label: "Right", angle: [1, 0, 0] },
  { id: "top", label: "Top", angle: [0, 1, -0.01] },
]

/* ------------------------------------------------------------------ */
/*  SCENE CONTENT (Three.js internals)                                 */
/* ------------------------------------------------------------------ */

function SceneContent({
  selectedBone,
  hoveredBone,
  onSelectBone,
  onHoverBone,
  focusRegion,
  viewPreset,
  onViewPresetApplied,
  focusTarget,
  onFocusApplied,
  regionColorMode,
  quizTargetBone,
}) {
  const { scene: gltfScene } = useGLTF("/models/skeleton.glb")
  // Clone the cached GLB scene: useGLTF shares one scene across consumers,
  // and the Body Explorer rewrites mesh transforms for its explode animation.
  const scene = useMemo(() => gltfScene.clone(true), [gltfScene])
  const { camera } = useThree()
  const controlsRef = useRef()
  const bonesRef = useRef([])
  const sceneCenter = useRef(new THREE.Vector3())
  const sceneDist = useRef(1)

  // one-time: discover meshes, clone materials, compute centers, classify
  useEffect(() => {
    const bones = []
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material = child.material.clone()
        if (!child.material.emissive) {
          child.material.emissive = new THREE.Color(0x000000)
        }
        const box = new THREE.Box3().setFromObject(child)
        const center = new THREE.Vector3()
        box.getCenter(center)
        const region = classifyMesh(child.name)
        const boneId = classifyBone(child.name)
        bones.push({
          mesh: child,
          name: child.name,
          displayName: prettifyMeshName(child.name),
          region,
          boneId,
          originalColor: child.material.color.clone(),
          center,
        })
      }
    })
    bonesRef.current = bones
  }, [scene])

  /*
   * Three.js objects (camera, materials) are mutable by design.
   * The react-hooks/immutability rule is not aware of this R3F pattern.
   */
  // auto-fit camera and cache scene metrics for view presets
  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene)
    const center = new THREE.Vector3()
    const size = new THREE.Vector3()
    box.getCenter(center)
    box.getSize(size)
    const maxDim = Math.max(size.x, size.y, size.z)
    const fov = camera.fov * (Math.PI / 180)
    const dist = ((maxDim / 2) / Math.tan(fov / 2)) * 1.6

    sceneCenter.current.copy(center)
    sceneDist.current = dist

    camera.position.set(center.x, center.y, center.z + dist)
    camera.near = maxDim / 200
    camera.far = dist * 10
    camera.lookAt(center)
    camera.updateProjectionMatrix()

    if (controlsRef.current) {
      controlsRef.current.target.copy(center)
      controlsRef.current.update()
    }
  }, [scene, camera])

  // Apply view preset when requested
  useEffect(() => {
    if (!viewPreset) return
    const preset = VIEW_PRESETS.find((p) => p.id === viewPreset)
    if (!preset) return
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

  // Focus camera on a selected bone when requested
  useEffect(() => {
    if (!focusTarget) return
    const bone = bonesRef.current.find((b) => b.name === focusTarget || b.boneId === focusTarget)
    if (!bone) { onFocusApplied(); return }
    const c = bone.center
    const d = sceneDist.current * 0.5
    camera.position.set(c.x, c.y, c.z + d)
    camera.lookAt(c)
    camera.updateProjectionMatrix()
    if (controlsRef.current) {
      controlsRef.current.target.copy(c)
      controlsRef.current.update()
    }
    onFocusApplied()
  }, [focusTarget, camera, onFocusApplied])

  // update materials based on selection / hover / focus / color mode / quiz
  useFrame(({ clock }) => {
    const bones = bonesRef.current
    const time = clock.getElapsedTime()
    
    for (const bone of bones) {
      const mat = bone.mesh.material
      const isSelected = selectedBone && (selectedBone === bone.name || selectedBone === bone.boneId)
      const isQuizTarget = quizTargetBone && (quizTargetBone === bone.name || quizTargetBone === bone.boneId)
      const isHovered = hoveredBone && (hoveredBone === bone.name || hoveredBone === bone.boneId) && !isSelected && !isQuizTarget
      const isDimmed = (focusRegion && bone.region !== focusRegion) || (quizTargetBone && !isQuizTarget)

      if (isQuizTarget) {
        mat.color.set("#fde047") // Yellow for quiz
        mat.emissive.set("#ca8a04")
        mat.emissiveIntensity = 0.4 + Math.sin(time * 5) * 0.3 // Pulsing effect
        mat.opacity = 1
        mat.transparent = false
        mat.depthWrite = true
      } else if (isSelected) {
        mat.color.set("#22d3ee")
        mat.emissive.set("#0e7490")
        mat.emissiveIntensity = 0.5
        mat.opacity = 1
        mat.transparent = false
        mat.depthWrite = true
      } else if (isHovered && !quizTargetBone) {
        mat.color.copy(bone.originalColor).lerp(new THREE.Color("#67e8f9"), 0.35)
        mat.emissive.set("#155e75")
        mat.emissiveIntensity = 0.25
        mat.opacity = 1
        mat.transparent = false
        mat.depthWrite = true
      } else if (isDimmed) {
        mat.color.copy(bone.originalColor).multiplyScalar(0.3)
        mat.emissive.set("#000000")
        mat.emissiveIntensity = 0
        mat.opacity = 0.15
        mat.transparent = true
        mat.depthWrite = false
      } else if (regionColorMode && bone.region && REGION_COLORS[bone.region]) {
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

  // click handler
  const handleClick = useCallback(
    (e) => {
      e.stopPropagation()
      if (!e.object?.isMesh) return
      const name = e.object.name
      onSelectBone(selectedBone === name ? null : name)
    },
    [selectedBone, onSelectBone],
  )

  // hover handlers
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

  return (
    <>
      <ambientLight intensity={0.45} />
      <hemisphereLight skyColor={"#b1e1ff"} groundColor={"#1e293b"} intensity={0.5} />
      <directionalLight position={[5, 12, 7]} intensity={0.9} />
      <directionalLight position={[-6, -4, -5]} intensity={0.25} />
      <directionalLight position={[0, -8, 4]} intensity={0.15} />
      <primitive
        object={scene}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      />
      <OrbitControls ref={controlsRef} enableDamping dampingFactor={0.08} />
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  LOADING FALLBACK                                                   */
/* ------------------------------------------------------------------ */

function LoadingFallback() {
  return (
    <div className="flex h-full items-center justify-center bg-slate-900 text-sm text-slate-400">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-cyan-400" />
        Loading 3D skeleton…
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  VIEWER TOOLBAR                                                     */
/* ------------------------------------------------------------------ */

function ViewerToolbar({
  expanded,
  onToggleExpand,
  focusRegion,
  onSetFocusRegion,
  selectedBone,
  onSetViewPreset,
  onResetView,
  onFocusSelected,
  searchQuery,
  onSearchChange,
  searchResults,
  onSearchSelect,
  regionColorMode,
  onToggleRegionColorMode,
  quizMode,
  onToggleQuizMode,
}) {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <div
      className={`flex flex-col gap-2 ${
        expanded ? "border-b border-white/10 px-4 py-3" : "px-4 py-3"
      }`}
    >
      {/* Top row: controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Region Colors toggle */}
        <button
          type="button"
          onClick={onToggleRegionColorMode}
          disabled={quizMode}
          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
            quizMode ? "opacity-50 cursor-not-allowed bg-white/5 text-slate-500" :
            regionColorMode
              ? "bg-purple-500/90 text-white shadow-md"
              : "bg-white/10 text-slate-300 hover:bg-white/20"
          }`}
          title="Color-code bones by region"
        >
          <Palette size={13} />
          Regions
        </button>

        {/* Quiz Mode toggle */}
        <button
          type="button"
          onClick={onToggleQuizMode}
          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
            quizMode
              ? "bg-yellow-500/90 text-slate-900 shadow-md"
              : "bg-white/10 text-slate-300 hover:bg-white/20"
          }`}
          title="Identify random bones"
        >
          <Trophy size={13} />
          Quiz Mode
        </button>

        {/* Region focus dropdown */}
        <select
          value={focusRegion || ""}
          onChange={(e) => onSetFocusRegion(e.target.value || null)}
          disabled={quizMode}
          className={`rounded-xl px-3 py-1.5 text-xs font-semibold outline-none transition ${
            quizMode ? "opacity-50 bg-white/5 text-slate-500 cursor-not-allowed" : "bg-white/10 text-slate-300 hover:bg-white/20"
          }`}
        >
          <option value="" className="bg-slate-800">All Regions</option>
          {REGION_META.map((r) => (
            <option key={r.id} value={r.id} className="bg-slate-800">{r.label}</option>
          ))}
        </select>

        {/* View presets */}
        <div className="flex items-center gap-1 rounded-xl bg-white/5 px-1 py-0.5">
          <Eye size={12} className="ml-1 text-slate-500" />
          {VIEW_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onSetViewPreset(p.id)}
              className="rounded-lg px-2 py-1 text-[10px] font-bold text-slate-400 transition hover:bg-white/15 hover:text-white"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Reset view */}
        <button
          type="button"
          onClick={onResetView}
          className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-white/20"
          title="Reset camera to default (R)"
        >
          <RotateCcw size={13} />
          Reset
        </button>

        {/* Focus on selected bone */}
        {selectedBone && (
          <button
            type="button"
            onClick={onFocusSelected}
            className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-500/20 px-3 py-1.5 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/30"
          >
            Focus Bone
          </button>
        )}

        {/* Search toggle */}
        <button
          type="button"
          onClick={() => setSearchOpen((v) => !v)}
          disabled={quizMode}
          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
            quizMode ? "opacity-50 cursor-not-allowed bg-white/5 text-slate-500" :
            searchOpen
              ? "bg-cyan-500/90 text-white shadow-md"
              : "bg-white/10 text-slate-300 hover:bg-white/20"
          }`}
        >
          <Search size={13} />
          Search
        </button>

        {/* Selected bone display */}
        {selectedBone && !quizMode && (
          <span className="rounded-xl bg-cyan-500/20 px-3 py-1.5 text-xs font-semibold text-cyan-300">
            {prettifyMeshName(selectedBone)}
          </span>
        )}

        {/* Hint when no bone selected in expanded mode */}
        {expanded && !selectedBone && !quizMode && (
          <span className="text-xs italic text-slate-500">Click a bone to study it</span>
        )}

        <div className="flex-1" />

        {/* Expand / collapse */}
        {expanded ? (
          <button
            type="button"
            onClick={onToggleExpand}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-white/20"
            title="Exit full view (Esc)"
          >
            <X size={14} />
            Exit Full View
          </button>
        ) : (
          <button
            type="button"
            onClick={onToggleExpand}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-white/20"
          >
            <Maximize2 size={13} />
            Expand
          </button>
        )}
      </div>

      {/* Search row */}
      {searchOpen && (
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search bones by name…"
            className="w-full rounded-xl bg-white/10 px-4 py-2 text-sm text-white placeholder-slate-500 outline-none focus:bg-white/15"
            autoFocus
          />
          {searchQuery && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-48 overflow-y-auto rounded-xl border border-white/10 bg-slate-900/95 shadow-xl backdrop-blur-md">
              {searchResults.map((r) => (
                <button
                  key={r.name}
                  type="button"
                  onClick={() => { onSearchSelect(r.name); setSearchOpen(false) }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
                >
                  {r.region && (
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ background: REGION_META_MAP[r.region]?.color || "#94a3b8" }}
                    />
                  )}
                  {r.displayName}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  STUDY PANEL — shows real Bones Lab data for selected bone          */
/* ------------------------------------------------------------------ */

function StudyPanel({ boneName, expanded, onDeselect, onFocusBone }) {
  if (!boneName) return null

  const displayName = prettifyMeshName(boneName)
  const region = classifyMesh(boneName)
  const regionMeta = region ? REGION_META_MAP[region] : null
  const boneId = classifyBone(boneName)
  const boneData = boneId ? BONES_BY_ID[boneId] : null
  const structures = boneId ? (STRUCTURES_BY_BONE[boneId] || []) : []

  const title = boneData ? boneData.label : displayName

  /* ---- Expanded sidebar layout ---- */
  if (expanded) {
    return (
      <div className="flex h-full flex-col overflow-hidden bg-slate-900/95 backdrop-blur-md">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 px-5 py-4">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              Selected Bone
            </p>
            <h3 className="mt-1 truncate text-lg font-bold text-white">{title}</h3>
            {regionMeta && (
              <span
                className="mt-2 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white"
                style={{ background: regionMeta.color }}
              >
                {regionMeta.label}
              </span>
            )}
          </div>
          <div className="ml-3 flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={onFocusBone}
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 transition hover:bg-cyan-500/30 hover:text-cyan-300"
              aria-label="Focus camera on bone"
              title="Zoom camera to this bone"
            >
              <Eye size={14} />
            </button>
            <button
              type="button"
              onClick={onDeselect}
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-slate-400 transition hover:bg-white/20 hover:text-white"
              aria-label="Deselect bone"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Description */}
        {boneData && (
          <div className="border-b border-white/10 px-5 py-3">
            <p className="text-xs leading-relaxed text-slate-400">
              {boneData.description}
            </p>
          </div>
        )}

        {/* Landmarks list (scrollable) */}
        {structures.length > 0 ? (
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              Key Landmarks ({structures.length})
            </p>
            <div className="space-y-3">
              {structures.map((s) => (
                <div key={s.id} className="rounded-xl bg-white/5 px-3.5 py-3">
                  <p className="text-xs font-bold text-cyan-300">{s.term}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-300">
                    {s.definition}
                  </p>
                  <p className="mt-1.5 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-400">Location: </span>
                    {s.location}
                  </p>
                  <p className="mt-0.5 text-[11px] italic text-slate-500">
                    {s.hint}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 px-5 py-4">
            <p className="text-xs text-slate-500">
              No detailed landmarks mapped for this mesh yet.
            </p>
            {!boneData && (
              <p className="mt-1 text-[10px] text-slate-600">
                Mesh: {boneName}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }

  /* ---- Normal mode: compact panel below canvas ---- */
  return (
    <div className="px-4 pb-4">
      <div className="rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-3 shadow-xl backdrop-blur-md">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          Selected Bone
        </p>
        <p className="mt-0.5 text-sm font-bold text-white">{title}</p>
        {regionMeta && (
          <span
            className="mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
            style={{ background: regionMeta.color }}
          >
            {regionMeta.label}
          </span>
        )}
        {boneData && (
          <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
            {boneData.description}
          </p>
        )}
        {structures.length > 0 && (
          <p className="mt-2 text-[11px] text-cyan-400/80">
            {structures.length} study landmarks available — open full view to explore
          </p>
        )}
        {!boneData && (
          <p className="mt-2 text-[10px] text-slate-600">
            Mesh: {boneName}
          </p>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  MAIN EXPORT                                                        */
/* ------------------------------------------------------------------ */

function getLevenshteinDistance(a, b) {
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length
  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null))
  for (let i = 0; i <= a.length; i++) matrix[0][i] = i
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j
  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      )
    }
  }
  return matrix[b.length][a.length]
}

export function Skeleton3DView() {
  const [expanded, setExpanded] = useState(false)
  const [focusRegion, setFocusRegion] = useState(null)
  const [selectedBone, setSelectedBone] = useState(null)
  const [hoveredBone, setHoveredBone] = useState(null)
  const [viewPreset, setViewPreset] = useState(null)
  const [focusTarget, setFocusTarget] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")

  // New features state
  const [regionColorMode, setRegionColorMode] = useState(false)
  const [quizMode, setQuizMode] = useState(false)
  const [quizTargetBone, setQuizTargetBone] = useState(null)
  const [quizInput, setQuizInput] = useState("")
  const [quizStatus, setQuizStatus] = useState("idle") // "idle" | "correct" | "incorrect"
  
  // Quiz Options state
  const [quizFormat, setQuizFormat] = useState("mcq") // "mcq" | "typed"
  const [quizOptions, setQuizOptions] = useState([])
  const [exactSpelling, setExactSpelling] = useState(false)

  // Build searchable bone list from GLB mesh name patterns
  const allMeshBones = useMemo(() => {
    // We can't access GLB meshes here, so we expose search over study data bones
    return BONES_MODULE.bones.map((b) => ({
      name: b.id,
      displayName: b.label,
      region: classifyMesh(b.id),
    }))
  }, [])

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase()
    return allMeshBones.filter((b) => b.displayName.toLowerCase().includes(q)).slice(0, 10)
  }, [searchQuery, allMeshBones])

  const handleResetView = useCallback(() => {
    setViewPreset("front")
  }, [])

  const handleFocusSelected = useCallback(() => {
    if (selectedBone) setFocusTarget(selectedBone)
  }, [selectedBone])

  // lock body scroll when expanded
  useEffect(() => {
    if (expanded) {
      document.body.style.overflow = "hidden"
      return () => { document.body.style.overflow = "" }
    }
  }, [expanded])

  // keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") {
        if (expanded && !quizMode) setExpanded(false)
        else if (selectedBone && !quizMode) setSelectedBone(null)
      }
      if (e.key === "r" || e.key === "R") {
        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return
        handleResetView()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [expanded, selectedBone, handleResetView, quizMode])

  // Quiz logic
  const startQuiz = useCallback(() => {
    // Pick a random bone from our mapped study data
    const randomIndex = Math.floor(Math.random() * allMeshBones.length)
    const randomBone = allMeshBones[randomIndex]
    
    // Generate MCQ options
    const options = new Set([randomBone.displayName])
    while (options.size < 4 && options.size < allMeshBones.length) {
      const wrongBone = allMeshBones[Math.floor(Math.random() * allMeshBones.length)]
      options.add(wrongBone.displayName)
    }
    const shuffledOptions = Array.from(options).sort(() => Math.random() - 0.5)
    
    setQuizTargetBone(randomBone)
    setQuizInput("")
    setQuizStatus("idle")
    setFocusTarget(randomBone.name)
    setQuizOptions(shuffledOptions)
  }, [allMeshBones])

  const handleToggleQuizMode = useCallback(() => {
    if (quizMode) {
      setQuizMode(false)
      setQuizTargetBone(null)
      setQuizStatus("idle")
    } else {
      // Turn off conflicting modes
      setRegionColorMode(false)
      setSelectedBone(null)
      setFocusRegion(null)
      setQuizMode(true)
      startQuiz()
    }
  }, [quizMode, startQuiz])

  const handleQuizSubmit = useCallback((e) => {
    e.preventDefault()
    if (!quizTargetBone || quizStatus === "correct") return
    
    const guess = quizInput.trim().toLowerCase()
    const answer = quizTargetBone.displayName.toLowerCase()
    
    let isCorrect = false
    if (exactSpelling) {
      isCorrect = guess === answer
    } else {
      const dist = getLevenshteinDistance(guess, answer)
      const allowedTypos = answer.length <= 5 ? 1 : 2
      isCorrect = dist <= allowedTypos || (answer.includes(guess) && guess.length > 4)
    }
    
    if (isCorrect) {
      setQuizStatus("correct")
      setTimeout(() => startQuiz(), 1500)
    } else {
      setQuizStatus("incorrect")
      setTimeout(() => setQuizStatus("idle"), 800)
    }
  }, [quizInput, quizTargetBone, quizStatus, startQuiz, exactSpelling])

  const handleOptionClick = useCallback((opt) => {
    if (quizStatus === "correct") return
    if (opt === quizTargetBone?.displayName) {
      setQuizStatus("correct")
      setTimeout(() => startQuiz(), 1500)
    } else {
      setQuizStatus("incorrect")
      setTimeout(() => setQuizStatus("idle"), 800)
    }
  }, [quizTargetBone, quizStatus, startQuiz])

  const showSidebar = expanded && selectedBone && !quizMode

  return (
    <div className="space-y-4">
      {/* Header — visible in normal mode only */}
      {!expanded && (
        <div className="panel px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">3D Anatomy Explorer</p>
              <h2 className="mt-1 font-display text-2xl text-slate-900">
                Skeletal System
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Explore the full skeleton in 3D. Hover over bones to preview,
                click to select and study. Use view presets or drag to orbit.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="shrink-0 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:shadow-xl hover:brightness-110"
            >
              <Maximize2 size={16} />
              Open Full 3D View
            </button>
          </div>
        </div>
      )}

      {/* Viewer container — inline panel OR fullscreen overlay */}
      <div
        className={
          expanded
            ? "fixed inset-0 z-50 flex flex-col bg-slate-950"
            : "panel overflow-hidden"
        }
      >
        {/* Toolbar */}
        <ViewerToolbar
          expanded={expanded}
          onToggleExpand={() => setExpanded((v) => !v)}
          focusRegion={focusRegion}
          onSetFocusRegion={setFocusRegion}
          selectedBone={selectedBone}
          onSetViewPreset={setViewPreset}
          onResetView={handleResetView}
          onFocusSelected={handleFocusSelected}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchResults={searchResults}
          onSearchSelect={(name) => { setSelectedBone(name); setSearchQuery("") }}
          regionColorMode={regionColorMode}
          onToggleRegionColorMode={() => {
            setRegionColorMode((v) => !v)
          }}
          quizMode={quizMode}
          onToggleQuizMode={handleToggleQuizMode}
        />

        {/* Main content area — flex row in expanded (canvas + sidebar) */}
        <div
          className={
            expanded
              ? "relative flex flex-1 overflow-hidden"
              : ""
          }
        >
          {/* Canvas wrapper */}
          <div
            className={
              expanded
                ? "relative flex-1"
                : "h-[440px] w-full overflow-hidden rounded-b-[32px] sm:h-[600px]"
            }
          >
            <Suspense fallback={<LoadingFallback />}>
              <Canvas
                camera={{ fov: 45 }}
                gl={{ preserveDrawingBuffer: true }}
                style={{ background: "#0f172a" }}
              >
                <SceneContent
                  expanded={expanded}
                  selectedBone={selectedBone}
                  hoveredBone={hoveredBone}
                  onSelectBone={quizMode ? undefined : setSelectedBone}
                  onHoverBone={quizMode ? undefined : setHoveredBone}
                  focusRegion={focusRegion}
                  viewPreset={viewPreset}
                  onViewPresetApplied={() => setViewPreset(null)}
                  focusTarget={focusTarget}
                  onFocusApplied={() => setFocusTarget(null)}
                  regionColorMode={regionColorMode}
                  quizTargetBone={quizTargetBone ? quizTargetBone.name : null}
                />
              </Canvas>
            </Suspense>

            {/* Region Legend overlay */}
            {regionColorMode && !quizMode && (
              <div className="absolute left-6 top-6 rounded-2xl bg-slate-900/80 p-4 backdrop-blur-md border border-white/10 shadow-xl">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Anatomical Regions
                </p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  {REGION_META.map(r => (
                    <div key={r.id} className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ background: r.color }} />
                      <span className="text-xs font-medium text-slate-300">{r.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quiz Mode UI Overlay */}
            {quizMode && quizTargetBone && (
              <div className="absolute right-6 top-6 w-full max-w-[320px] rounded-2xl bg-slate-900/90 p-5 backdrop-blur-md border border-white/10 shadow-2xl z-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="flex items-center gap-2 text-[15px] font-bold text-white">
                    <Crosshair size={16} className="text-yellow-400" />
                    Identify This Bone
                  </h3>
                  <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400 px-2 py-1 rounded-md bg-white/5">
                    Quiz
                  </div>
                </div>
                
                <div className="mb-4 flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex gap-2 bg-slate-950 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setQuizFormat("mcq")}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                        quizFormat === "mcq" ? "bg-cyan-500 text-white" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Multiple Choice
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuizFormat("typed")}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                        quizFormat === "typed" ? "bg-cyan-500 text-white" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Type Name
                    </button>
                  </div>
                  {quizFormat === "typed" && (
                    <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer hover:text-white transition">
                      <input 
                        type="checkbox" 
                        checked={exactSpelling} 
                        onChange={(e) => setExactSpelling(e.target.checked)}
                        className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900"
                      />
                      Exact spelling
                    </label>
                  )}
                </div>

                {quizFormat === "mcq" ? (
                  <div className="grid grid-cols-1 gap-2">
                    {quizOptions.map((opt, i) => {
                      const isSelectedAndWrong = quizStatus === "incorrect" && quizTargetBone.displayName !== opt
                      const isCorrectAnswer = quizStatus === "correct" && quizTargetBone.displayName === opt
                      return (
                        <button
                          key={i}
                          type="button"
                          disabled={quizStatus === "correct"}
                          onClick={() => handleOptionClick(opt)}
                          className={`w-full rounded-xl px-4 py-3 text-sm font-semibold text-left transition-colors border ${
                            isCorrectAnswer
                              ? "border-green-500/50 bg-green-950/20 text-green-400"
                              : isSelectedAndWrong
                                ? "border-white/10 bg-slate-900 text-slate-500" // Not revealing red on everything to not clutter, just visual feedback below
                                : "border-white/10 bg-slate-950 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-cyan-500/50"
                          }`}
                        >
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <form noValidate onSubmit={handleQuizSubmit} className="relative">
                    <input
                      type="text"
                      value={quizInput}
                      onChange={(e) => setQuizInput(e.target.value)}
                      placeholder="Type bone name..."
                      autoFocus
                      disabled={quizStatus === "correct"}
                      className={`w-full rounded-xl bg-slate-950 px-4 py-3 pr-12 text-sm text-white placeholder-slate-500 outline-none border transition-colors ${
                        quizStatus === "incorrect" 
                          ? "border-red-500/50 bg-red-950/20" 
                          : quizStatus === "correct"
                            ? "border-green-500/50 bg-green-950/20 text-green-400"
                            : "border-white/10 focus:border-cyan-500/50"
                      }`}
                    />
                    <button
                      type="submit"
                      className="absolute right-1.5 top-1.5 bottom-1.5 flex w-10 items-center justify-center rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white transition-colors disabled:opacity-50"
                      disabled={!quizInput.trim() || quizStatus === "correct"}
                    >
                      <ArrowRight size={16} />
                    </button>
                  </form>
                )}
                
                {/* Feedback */}
                <div className="mt-4 h-5 flex items-center justify-center">
                  {quizStatus === "correct" && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-green-400">
                      <CheckCircle2 size={14} />
                      Correct! Next bone...
                    </div>
                  )}
                  {quizStatus === "incorrect" && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-red-400">
                      <XCircle size={14} />
                      Try again
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Orbit hint — bottom center of canvas */}
            {expanded && !selectedBone && !quizMode && (
              <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2">
                <div className="rounded-xl bg-black/50 px-4 py-2 text-[11px] text-slate-400 backdrop-blur-sm">
                  Drag to orbit · Scroll to zoom · Click a bone · R to reset view
                </div>
              </div>
            )}
          </div>

          {/* Study sidebar — expanded mode, when bone selected */}
          {showSidebar && (
            <div className="w-96 shrink-0 border-l border-white/10">
              <StudyPanel
                boneName={selectedBone}
                expanded
                onDeselect={() => setSelectedBone(null)}
                onFocusBone={() => setFocusTarget(selectedBone)}
              />
            </div>
          )}
        </div>

        {/* Study panel — normal mode, below canvas */}
        {!expanded && !quizMode && (
          <StudyPanel
            boneName={selectedBone}
            expanded={false}
            onDeselect={() => setSelectedBone(null)}
            onFocusBone={() => { setExpanded(true); setFocusTarget(selectedBone) }}
          />
        )}
      </div>
    </div>
  )
}
