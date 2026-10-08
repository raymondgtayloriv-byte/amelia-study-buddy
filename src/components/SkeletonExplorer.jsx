import { useState, useMemo, useRef } from "react"
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Crosshair,
  Lightbulb,
  PencilLine,
  RefreshCw,
  Search,
  Sparkles,
  Target,
  X,
  Zap,
} from "lucide-react"
import {
  normalizeAnswer,
  shuffle,
} from "./bonesLabUtils"

/* ------------------------------------------------------------------ */
/*  DATA: skeleton region → SVG visual mapping                        */
/* ------------------------------------------------------------------ */

const REGION_META = [
  {
    id: "skull",
    label: "Skull",
    shortLabel: "Skull",
    color: "#60a5fa",
    description: "Cranial and facial bones",
  },
  {
    id: "hyoid",
    label: "Hyoid",
    shortLabel: "Hyoid",
    color: "#a78bfa",
    description: "Standalone non-articulating bone",
  },
  {
    id: "vertebral-column",
    label: "Vertebral Column",
    shortLabel: "Spine",
    color: "#34d399",
    description: "Cervical, thoracic, lumbar, sacral vertebrae",
  },
  {
    id: "thorax",
    label: "Thorax",
    shortLabel: "Thorax",
    color: "#fbbf24",
    description: "Sternum and ribs",
  },
  {
    id: "pectoral-girdle",
    label: "Pectoral Girdle",
    shortLabel: "Shoulders",
    color: "#f472b6",
    description: "Clavicle and scapula",
  },
  {
    id: "upper-limb",
    label: "Upper Limb",
    shortLabel: "Arms",
    color: "#fb923c",
    description: "Humerus, radius, ulna, hand bones",
  },
  {
    id: "pelvic-girdle",
    label: "Pelvic Girdle",
    shortLabel: "Pelvis",
    color: "#e879f9",
    description: "Hip bones and pelvic brim",
  },
  {
    id: "lower-limb",
    label: "Lower Limb",
    shortLabel: "Legs",
    color: "#2dd4bf",
    description: "Femur, patella, tibia, fibula, foot bones",
  },
]

const REGION_META_MAP = Object.fromEntries(
  REGION_META.map((r) => [r.id, r]),
)

const BONE_TO_REGION = {
  "axial-overview": "skull",
  "frontal-bone": "skull",
  "parietal-bone": "skull",
  "occipital-bone": "skull",
  "temporal-bone": "skull",
  "sphenoid-bone": "skull",
  "ethmoid-bone": "skull",
  "orbit-and-nasal": "skull",
  "mandible": "skull",
  "maxilla": "skull",
  "zygomatic-bone": "skull",
  "palatine-bone": "skull",
  "hyoid-bone": "hyoid",
  "vertebral-overview": "vertebral-column",
  "typical-vertebra": "vertebral-column",
  "atlas": "vertebral-column",
  "axis": "vertebral-column",
  "cervical-vertebra": "vertebral-column",
  "thoracic-vertebra": "vertebral-column",
  "lumbar-vertebra": "vertebral-column",
  "sacrum": "vertebral-column",
  "sternum": "thorax",
  "ribs": "thorax",
  "clavicle": "pectoral-girdle",
  "scapula": "pectoral-girdle",
  "humerus": "upper-limb",
  "ulna": "upper-limb",
  "radius": "upper-limb",
  "hand-carpals": "upper-limb",
  "hand-phalanges": "upper-limb",
  "pelvic-overview": "pelvic-girdle",
  "pelvis": "pelvic-girdle",
  "femur": "lower-limb",
  "patella": "lower-limb",
  "tibia-fibula": "lower-limb",
  "foot-tarsals": "lower-limb",
  "foot-phalanges": "lower-limb",
}

const OVERVIEW_BONE_IDS = new Set([
  "axial-overview",
  "vertebral-overview",
  "pelvic-overview",
])

const RIB_DATA = [
  [122, 72],
  [130, 64],
  [138, 60],
  [146, 58],
  [154, 56],
  [162, 58],
  [170, 62],
  [178, 68],
  [186, 76],
  [194, 84],
  [200, 94],
  [206, 102],
]

/* ------------------------------------------------------------------ */
/*  SVG SKELETON DIAGRAM                                              */
/* ------------------------------------------------------------------ */

function SkeletonSVG({
  hoveredRegion,
  selectedRegion,
  highlightedRegion,
  onRegionHover,
  onRegionClick,
  labelsVisible,
  masteredRegions,
  weakRegions,
  dimOthers,
}) {
  const getRegionStyle = (regionId) => {
    const isHovered = hoveredRegion === regionId
    const isSelected = selectedRegion === regionId
    const isHighlighted = highlightedRegion === regionId
    const isMastered = masteredRegions?.has(regionId)
    const isWeak = weakRegions?.has(regionId)
    const isDimmed =
      dimOthers && selectedRegion && selectedRegion !== regionId && !isHighlighted

    const meta = REGION_META_MAP[regionId]
    let fillColor = "#E8DFD0"
    let strokeColor = "#C4B8A8"
    let opacity = 1
    let glowFilter = ""

    if (isHighlighted) {
      fillColor = meta?.color ?? "#60a5fa"
      strokeColor = meta?.color ?? "#60a5fa"
      glowFilter = "url(#highlight-glow)"
    } else if (isSelected) {
      fillColor = meta?.color ?? "#60a5fa"
      strokeColor = meta?.color ?? "#60a5fa"
      glowFilter = "url(#selected-glow)"
    } else if (isHovered) {
      fillColor = "#F5EEE0"
      strokeColor = meta?.color ?? "#94a3b8"
      glowFilter = "url(#hover-glow)"
    } else if (isMastered) {
      fillColor = "#BBF7D0"
      strokeColor = "#4ADE80"
    } else if (isWeak) {
      fillColor = "#FEF08A"
      strokeColor = "#FBBF24"
    }

    if (isDimmed) {
      opacity = 0.25
    }

    return {
      fill: fillColor,
      stroke: strokeColor,
      strokeWidth: isSelected || isHighlighted ? 2 : isHovered ? 1.5 : 1,
      opacity,
      filter: glowFilter,
      cursor: "pointer",
      transition: "all 0.3s ease",
    }
  }

  const socketStyle = (regionId) => {
    const base = getRegionStyle(regionId)
    return {
      ...base,
      fill: base.fill === "#E8DFD0" ? "#1e293b" : `${base.fill}44`,
    }
  }

  const ribStyle = (regionId) => {
    const base = getRegionStyle(regionId)
    return {
      ...base,
      fill: "none",
      strokeWidth: base.strokeWidth + 1.5,
      strokeLinecap: "round",
    }
  }

  const longBoneStyle = (regionId) => {
    const base = getRegionStyle(regionId)
    return {
      ...base,
      fill: "none",
      strokeLinecap: "round",
    }
  }

  const regionHandlers = (regionId) => ({
    onMouseEnter: () => onRegionHover(regionId),
    onMouseLeave: () => onRegionHover(null),
    onClick: () => onRegionClick(regionId),
  })

  return (
    <svg
      viewBox="0 0 280 500"
      className="skeleton-svg w-full h-auto select-none"
      style={{ maxHeight: "70vh" }}
    >
      <defs>
        <radialGradient id="bg-glow" cx="50%" cy="35%" r="60%">
          <stop offset="0%" stopColor="rgba(31,109,112,0.08)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <filter id="hover-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feFlood floodColor="#94a3b8" floodOpacity="0.3" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="selected-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feFlood floodColor="#1f6d70" floodOpacity="0.45" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter
          id="highlight-glow"
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
        >
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feFlood floodColor="#60a5fa" floodOpacity="0.6" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background glow */}
      <rect width="280" height="500" fill="url(#bg-glow)" />

      {/* ========== VERTEBRAL COLUMN ========== */}
      <g {...regionHandlers("vertebral-column")} style={getRegionStyle("vertebral-column")}>
        {Array.from({ length: 7 }, (_, i) => (
          <rect
            key={`c${i}`}
            x={137}
            y={78 + i * 5.5}
            width={6}
            height={4}
            rx={1.5}
          />
        ))}
        {Array.from({ length: 12 }, (_, i) => (
          <rect
            key={`t${i}`}
            x={136}
            y={120 + i * 7.5}
            width={8}
            height={5.5}
            rx={2}
          />
        ))}
        {Array.from({ length: 5 }, (_, i) => (
          <rect
            key={`l${i}`}
            x={134}
            y={214 + i * 8}
            width={12}
            height={6}
            rx={3}
          />
        ))}
        <path d="M134,256 L140,284 L146,256 Z" />
        <path d="M138,284 L140,294 L142,284" />
      </g>

      {/* ========== THORAX (RIBS + STERNUM) ========== */}
      <g {...regionHandlers("thorax")}>
        {/* Sternum */}
        <g style={getRegionStyle("thorax")}>
          <path d="M131,118 L129,122 L129,132 L133,134 L147,134 L151,132 L151,122 L149,118 Z" />
          <rect x={132} y={134} width={16} height={56} rx={3} />
          <path d="M136,190 L140,200 L144,190" />
        </g>
        {/* Ribs */}
        {RIB_DATA.map(([y, extent], i) => {
          const lStart = 130
          const rStart = 150
          const lEnd = extent
          const rEnd = 280 - extent
          const curveAmt = 5 + (12 - Math.abs(i - 5)) * 0.6
          return (
            <g key={`rib-${i}`} style={ribStyle("thorax")}>
              <path
                d={`M${lStart},${y} Q${(lStart + lEnd) / 2},${y + curveAmt} ${lEnd},${y - 1}`}
              />
              <path
                d={`M${rStart},${y} Q${(rStart + rEnd) / 2},${y + curveAmt} ${rEnd},${y - 1}`}
              />
            </g>
          )
        })}
      </g>

      {/* ========== PECTORAL GIRDLE ========== */}
      <g {...regionHandlers("pectoral-girdle")}>
        {/* Clavicles */}
        <g style={{ ...longBoneStyle("pectoral-girdle"), strokeWidth: 5 }}>
          <path d="M130,118 Q108,112 72,122" strokeLinecap="round" />
          <path d="M150,118 Q172,112 208,122" strokeLinecap="round" />
        </g>
        {/* Scapulae */}
        <g style={getRegionStyle("pectoral-girdle")}>
          <path d="M80,132 L68,172 L84,172 Z" />
          <path d="M200,132 L212,172 L196,172 Z" />
        </g>
      </g>

      {/* ========== SKULL ========== */}
      <g {...regionHandlers("skull")}>
        {/* Cranium */}
        <path
          d="M140,10 C168,10 180,34 180,52 C180,68 166,80 140,80 C114,80 100,68 100,52 C100,34 112,10 140,10 Z"
          style={getRegionStyle("skull")}
        />
        {/* Eye sockets */}
        <ellipse cx={126} cy={48} rx={9} ry={7} style={socketStyle("skull")} />
        <ellipse cx={154} cy={48} rx={9} ry={7} style={socketStyle("skull")} />
        {/* Nasal */}
        <path
          d="M137,56 L140,68 L143,56"
          style={{
            ...getRegionStyle("skull"),
            fill: "none",
            strokeWidth: 1.5,
          }}
        />
        {/* Zygomatic */}
        <path
          d="M115,52 L106,56 L108,62 L117,60 Z"
          style={getRegionStyle("skull")}
        />
        <path
          d="M165,52 L174,56 L172,62 L163,60 Z"
          style={getRegionStyle("skull")}
        />
        {/* Mandible */}
        <path
          d="M114,72 Q106,82 116,92 L130,96 L140,98 L150,96 L164,92 Q174,82 166,72 Q154,78 140,80 Q126,78 114,72 Z"
          style={getRegionStyle("skull")}
        />
      </g>

      {/* ========== HYOID ========== */}
      <g {...regionHandlers("hyoid")}>
        <path
          d="M132,102 Q128,106 132,110 L138,112 L142,112 L148,110 Q152,106 148,102"
          style={{
            ...getRegionStyle("hyoid"),
            fill: "none",
            strokeWidth: 2.5,
            strokeLinecap: "round",
          }}
        />
      </g>

      {/* ========== UPPER LIMB ========== */}
      <g {...regionHandlers("upper-limb")}>
        {/* LEFT ARM */}
        {/* Humerus */}
        <line
          x1={70}
          y1={124}
          x2={56}
          y2={216}
          style={{ ...longBoneStyle("upper-limb"), strokeWidth: 9 }}
        />
        {/* Ulna */}
        <line
          x1={54}
          y1={220}
          x2={40}
          y2={298}
          style={{ ...longBoneStyle("upper-limb"), strokeWidth: 6 }}
        />
        {/* Radius */}
        <line
          x1={58}
          y1={220}
          x2={46}
          y2={296}
          style={{ ...longBoneStyle("upper-limb"), strokeWidth: 5 }}
        />
        {/* Hand carpals */}
        <ellipse
          cx={40}
          cy={304}
          rx={9}
          ry={5}
          style={getRegionStyle("upper-limb")}
        />
        {/* Fingers */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={`lf${i}`}
            x1={32 + i * 3.5}
            y1={308}
            x2={26 + i * 4.5}
            y2={330 - (i === 0 ? 6 : i === 4 ? 4 : 0)}
            style={{ ...longBoneStyle("upper-limb"), strokeWidth: 2.5 }}
          />
        ))}

        {/* RIGHT ARM */}
        <line
          x1={210}
          y1={124}
          x2={224}
          y2={216}
          style={{ ...longBoneStyle("upper-limb"), strokeWidth: 9 }}
        />
        <line
          x1={226}
          y1={220}
          x2={240}
          y2={298}
          style={{ ...longBoneStyle("upper-limb"), strokeWidth: 6 }}
        />
        <line
          x1={222}
          y1={220}
          x2={234}
          y2={296}
          style={{ ...longBoneStyle("upper-limb"), strokeWidth: 5 }}
        />
        <ellipse
          cx={240}
          cy={304}
          rx={9}
          ry={5}
          style={getRegionStyle("upper-limb")}
        />
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={`rf${i}`}
            x1={232 + i * 3.5}
            y1={308}
            x2={228 + i * 4.5}
            y2={330 - (i === 0 ? 6 : i === 4 ? 4 : 0)}
            style={{ ...longBoneStyle("upper-limb"), strokeWidth: 2.5 }}
          />
        ))}
      </g>

      {/* ========== PELVIC GIRDLE ========== */}
      <g {...regionHandlers("pelvic-girdle")}>
        {/* Left iliac wing */}
        <path
          d="M136,250 Q120,244 100,254 Q90,264 92,278 L108,298 L126,298 L136,276 Z"
          style={getRegionStyle("pelvic-girdle")}
        />
        {/* Right iliac wing */}
        <path
          d="M144,250 Q160,244 180,254 Q190,264 188,278 L172,298 L154,298 L144,276 Z"
          style={getRegionStyle("pelvic-girdle")}
        />
        {/* Pubic symphysis */}
        <path
          d="M128,296 L140,306 L152,296"
          style={{
            ...getRegionStyle("pelvic-girdle"),
            fill: "none",
            strokeWidth: 2.5,
            strokeLinecap: "round",
          }}
        />
        {/* Acetabulum circles */}
        <circle
          cx={110}
          cy={292}
          r={7}
          style={{
            ...getRegionStyle("pelvic-girdle"),
            fillOpacity: 0.3,
          }}
        />
        <circle
          cx={170}
          cy={292}
          r={7}
          style={{
            ...getRegionStyle("pelvic-girdle"),
            fillOpacity: 0.3,
          }}
        />
      </g>

      {/* ========== LOWER LIMB ========== */}
      <g {...regionHandlers("lower-limb")}>
        {/* LEFT LEG */}
        {/* Femur */}
        <line
          x1={112}
          y1={296}
          x2={106}
          y2={386}
          style={{ ...longBoneStyle("lower-limb"), strokeWidth: 11 }}
        />
        {/* Patella */}
        <ellipse
          cx={104}
          cy={392}
          rx={7}
          ry={8}
          style={getRegionStyle("lower-limb")}
        />
        {/* Tibia */}
        <line
          x1={104}
          y1={400}
          x2={100}
          y2={458}
          style={{ ...longBoneStyle("lower-limb"), strokeWidth: 8 }}
        />
        {/* Fibula */}
        <line
          x1={110}
          y1={400}
          x2={108}
          y2={456}
          style={{ ...longBoneStyle("lower-limb"), strokeWidth: 4.5 }}
        />
        {/* Foot tarsals */}
        <ellipse
          cx={96}
          cy={464}
          rx={11}
          ry={6}
          style={getRegionStyle("lower-limb")}
        />
        {/* Toes */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={`lt${i}`}
            x1={86 + i * 4}
            y1={468}
            x2={80 + i * 5}
            y2={488 - (i === 0 ? 4 : i === 4 ? 3 : 0)}
            style={{ ...longBoneStyle("lower-limb"), strokeWidth: 2.5 }}
          />
        ))}

        {/* RIGHT LEG */}
        <line
          x1={168}
          y1={296}
          x2={174}
          y2={386}
          style={{ ...longBoneStyle("lower-limb"), strokeWidth: 11 }}
        />
        <ellipse
          cx={176}
          cy={392}
          rx={7}
          ry={8}
          style={getRegionStyle("lower-limb")}
        />
        <line
          x1={176}
          y1={400}
          x2={180}
          y2={458}
          style={{ ...longBoneStyle("lower-limb"), strokeWidth: 8 }}
        />
        <line
          x1={170}
          y1={400}
          x2={172}
          y2={456}
          style={{ ...longBoneStyle("lower-limb"), strokeWidth: 4.5 }}
        />
        <ellipse
          cx={184}
          cy={464}
          rx={11}
          ry={6}
          style={getRegionStyle("lower-limb")}
        />
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={`rt${i}`}
            x1={174 + i * 4}
            y1={468}
            x2={172 + i * 5}
            y2={488 - (i === 0 ? 4 : i === 4 ? 3 : 0)}
            style={{ ...longBoneStyle("lower-limb"), strokeWidth: 2.5 }}
          />
        ))}
      </g>

      {/* ========== REGION LABELS ========== */}
      {labelsVisible
        ? REGION_META.map((region) => {
            const pos = LABEL_POSITIONS[region.id]
            if (!pos) return null
            const isActive =
              hoveredRegion === region.id ||
              selectedRegion === region.id ||
              highlightedRegion === region.id
            return (
              <g key={`label-${region.id}`} style={{ pointerEvents: "none" }}>
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor={pos.anchor ?? "start"}
                  className="skeleton-label"
                  style={{
                    fontSize: isActive ? "8.5px" : "7.5px",
                    fontWeight: isActive ? 700 : 600,
                    fill: isActive ? region.color : "#64748b",
                    transition: "all 0.3s ease",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  {region.shortLabel}
                </text>
                {pos.lineToX != null ? (
                  <line
                    x1={pos.x + (pos.anchor === "end" ? -2 : 2)}
                    y1={pos.y + 2}
                    x2={pos.lineToX}
                    y2={pos.lineToY}
                    stroke={isActive ? region.color : "#cbd5e1"}
                    strokeWidth={0.6}
                    strokeDasharray="2,2"
                    style={{ transition: "stroke 0.3s ease" }}
                  />
                ) : null}
              </g>
            )
          })
        : null}
    </svg>
  )
}

const LABEL_POSITIONS = {
  skull: { x: 14, y: 42, anchor: "start", lineToX: 100, lineToY: 50 },
  hyoid: { x: 14, y: 108, anchor: "start", lineToX: 130, lineToY: 106 },
  "vertebral-column": {
    x: 266,
    y: 170,
    anchor: "end",
    lineToX: 148,
    lineToY: 168,
  },
  thorax: { x: 14, y: 165, anchor: "start", lineToX: 72, lineToY: 162 },
  "pectoral-girdle": {
    x: 266,
    y: 126,
    anchor: "end",
    lineToX: 208,
    lineToY: 122,
  },
  "upper-limb": { x: 14, y: 220, anchor: "start", lineToX: 56, lineToY: 218 },
  "pelvic-girdle": {
    x: 266,
    y: 268,
    anchor: "end",
    lineToX: 190,
    lineToY: 264,
  },
  "lower-limb": { x: 14, y: 390, anchor: "start", lineToX: 96, lineToY: 388 },
}

/* ------------------------------------------------------------------ */
/*  MODE DEFINITIONS                                                  */
/* ------------------------------------------------------------------ */

const MODES = [
  {
    id: "explore",
    label: "Explore",
    icon: Search,
    helper: "Click any region to see its bones and structures",
  },
  {
    id: "study",
    label: "Study",
    icon: Eye,
    helper: "Labels hidden — test your spatial memory",
  },
  {
    id: "quiz",
    label: "Quiz",
    icon: Target,
    helper: "Identify the highlighted bone from options",
  },
  {
    id: "type",
    label: "Type",
    icon: PencilLine,
    helper: "Type the bone name with spelling practice",
  },
  {
    id: "cram",
    label: "Cram",
    icon: BookOpen,
    helper: "Rapid-fire structure review — know it or flag it",
  },
  {
    id: "review",
    label: "Weak Spots",
    icon: Zap,
    helper: "Review bones you've missed before",
  },
]

/* ------------------------------------------------------------------ */
/*  QUIZ / TYPED SESSION BUILDERS                                     */
/* ------------------------------------------------------------------ */

function buildExplorerQuiz(bones, count = 8) {
  const quizzable = bones.filter((b) => !OVERVIEW_BONE_IDS.has(b.id))
  const selected = shuffle(quizzable).slice(
    0,
    Math.min(count, quizzable.length),
  )

  return selected.map((bone) => {
    const distractorPool = shuffle(
      quizzable.filter((b) => b.id !== bone.id),
    ).slice(0, 3)
    return {
      bone,
      regionId: bone.regionId,
      options: shuffle([bone, ...distractorPool]),
      answered: false,
      selectedAnswer: null,
      correct: false,
    }
  })
}

function buildExplorerTypedSession(bones) {
  const quizzable = bones.filter((b) => !OVERVIEW_BONE_IDS.has(b.id))
  return shuffle(quizzable).slice(0, Math.min(10, quizzable.length))
}

/* ------------------------------------------------------------------ */
/*  MAIN COMPONENT                                                    */
/* ------------------------------------------------------------------ */

export function SkeletonExplorer({
  unit,
  progress = { recall: {}, quizHistory: {}, typedHistory: {}, weakSpots: {} },
  onUpdateRecall,
  onNavigateToBones,
}) {
  const [mode, setMode] = useState("explore")
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [hoveredRegion, setHoveredRegion] = useState(null)
  const [labelsVisible, setLabelsVisible] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [highlightedRegion, setHighlightedRegion] = useState(null)

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState([])
  const [quizIndex, setQuizIndex] = useState(0)
  const [quizScore, setQuizScore] = useState(0)
  const [quizComplete, setQuizComplete] = useState(false)

  // Typed state
  const [typedBones, setTypedBones] = useState([])
  const [typedIndex, setTypedIndex] = useState(0)
  const [typedInput, setTypedInput] = useState("")
  const [typedFeedback, setTypedFeedback] = useState(null)
  const [typedSubmitted, setTypedSubmitted] = useState(false)
  const [typedResults, setTypedResults] = useState([])
  const [typedComplete, setTypedComplete] = useState(false)

  // Cram state
  const [cramCards, setCramCards] = useState([])
  const [cramIndex, setCramIndex] = useState(0)
  const [cramRevealed, setCramRevealed] = useState(false)
  const [cramKnown, setCramKnown] = useState(0)
  const [cramFlagged, setCramFlagged] = useState(0)
  const [cramComplete, setCramComplete] = useState(false)
  const [cramRegionFilter, setCramRegionFilter] = useState("all")

  // Explore detail
  const [expandedBoneId, setExpandedBoneId] = useState(null)

  const typedInputRef = useRef(null)
  const mainRef = useRef(null)

  const regionBones = useMemo(() => {
    const map = {}
    for (const bone of unit.bones) {
      if (!map[bone.regionId]) map[bone.regionId] = []
      map[bone.regionId].push(bone)
    }
    return map
  }, [unit.bones])

  const regionStructureCounts = useMemo(() => {
    const map = {}
    for (const structure of unit.structures) {
      map[structure.regionId] = (map[structure.regionId] ?? 0) + 1
    }
    return map
  }, [unit.structures])

  const weakSpotBoneIds = useMemo(() => {
    const boneIdSet = new Set()
    for (const structure of unit.structures) {
      if ((progress.weakSpots?.[structure.id]?.misses ?? 0) > 0) {
        boneIdSet.add(structure.boneId)
      }
    }
    return boneIdSet
  }, [unit.structures, progress.weakSpots])

  const weakRegions = useMemo(() => {
    const set = new Set()
    for (const boneId of weakSpotBoneIds) {
      const regionId = BONE_TO_REGION[boneId]
      if (regionId) set.add(regionId)
    }
    return set
  }, [weakSpotBoneIds])

  const masteredRegions = useMemo(() => {
    const regionProgress = {}
    for (const structure of unit.structures) {
      const rid = structure.regionId
      if (!regionProgress[rid])
        regionProgress[rid] = { total: 0, known: 0 }
      regionProgress[rid].total++
      if (progress.recall?.[structure.id] === "known")
        regionProgress[rid].known++
    }
    const set = new Set()
    for (const [rid, data] of Object.entries(regionProgress)) {
      if (data.total > 0 && data.known / data.total > 0.75) set.add(rid)
    }
    return set
  }, [unit.structures, progress.recall])

  const structuresByBone = useMemo(() => {
    const map = {}
    for (const structure of unit.structures) {
      if (!map[structure.boneId]) map[structure.boneId] = []
      map[structure.boneId].push(structure)
    }
    return map
  }, [unit.structures])

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = normalizeAnswer(searchQuery)
    return unit.bones
      .filter(
        (bone) =>
          normalizeAnswer(bone.label).includes(q) ||
          normalizeAnswer(bone.description).includes(q),
      )
      .slice(0, 8)
  }, [searchQuery, unit.bones])

  const handleModeChange = (newMode) => {
    setMode(newMode)
    setHighlightedRegion(null)

    if (newMode === "study") {
      setLabelsVisible(false)
    } else {
      setLabelsVisible(true)
    }

    if (newMode === "quiz") {
      startQuiz()
    }

    if (newMode === "type") {
      startTypedSession()
    }

    if (newMode === "cram") {
      startCram("all")
    }

    if (newMode === "review") {
      setLabelsVisible(true)
    }
  }

  const handleRegionClick = (regionId) => {
    if (mode === "explore" || mode === "study" || mode === "review") {
      setSelectedRegion(regionId === selectedRegion ? null : regionId)
      setExpandedBoneId(null)
    }
    if (mode === "cram") {
      startCram(regionId)
    }
  }

  const handleRegionHover = (regionId) => {
    setHoveredRegion(regionId)
  }

  const handleSearchSelect = (bone) => {
    const regionId = BONE_TO_REGION[bone.id]
    if (regionId) {
      setSelectedRegion(regionId)
      setHighlightedRegion(regionId)
      setTimeout(() => setHighlightedRegion(null), 2000)
    }
    setSearchQuery("")
  }

  /* ---- Quiz logic ---- */

  const startQuiz = (pool = null) => {
    const bones = pool ?? unit.bones
    const questions = buildExplorerQuiz(bones)
    setQuizQuestions(questions)
    setQuizIndex(0)
    setQuizScore(0)
    setQuizComplete(false)
    if (questions.length > 0) {
      setHighlightedRegion(BONE_TO_REGION[questions[0].bone.id])
    }
  }

  const handleQuizAnswer = (bone) => {
    const current = quizQuestions[quizIndex]
    if (!current || current.answered) return

    const correct = bone.id === current.bone.id
    const updated = [...quizQuestions]
    updated[quizIndex] = {
      ...current,
      answered: true,
      selectedAnswer: bone.id,
      correct,
    }
    setQuizQuestions(updated)
    if (correct) setQuizScore((s) => s + 1)
  }

  const nextQuizQuestion = () => {
    const nextIdx = quizIndex + 1
    if (nextIdx >= quizQuestions.length) {
      setQuizComplete(true)
      setHighlightedRegion(null)
      return
    }
    setQuizIndex(nextIdx)
    setHighlightedRegion(
      BONE_TO_REGION[quizQuestions[nextIdx].bone.id],
    )
  }

  /* ---- Typed logic ---- */

  const startTypedSession = (pool = null) => {
    const bones = pool ?? unit.bones
    const session = buildExplorerTypedSession(bones)
    setTypedBones(session)
    setTypedIndex(0)
    setTypedInput("")
    setTypedFeedback(null)
    setTypedSubmitted(false)
    setTypedResults([])
    setTypedComplete(false)
    if (session.length > 0) {
      setHighlightedRegion(BONE_TO_REGION[session[0].id])
    }
    setTimeout(() => typedInputRef.current?.focus(), 100)
  }

  const submitTypedBone = () => {
    const bone = typedBones[typedIndex]
    if (!bone || typedSubmitted) return

    const trimmed = typedInput.trim()
    if (!trimmed) {
      setTypedFeedback({
        kind: "blank",
        message: "Type an answer before submitting.",
      })
      return
    }

    const normalizedInput = normalizeAnswer(trimmed)
    const acceptedNames = [
      bone.label,
      ...(bone.label.includes("(") ? [bone.label.replace(/\s*\(.*\)/, "")] : []),
    ]
    const normalizedAccepted = acceptedNames.map(normalizeAnswer)

    const exactMatch = normalizedAccepted.includes(normalizedInput)

    if (exactMatch) {
      setTypedFeedback({
        kind: "correct",
        correct: true,
        message: "Correct!",
      })
    } else {
      // Levenshtein check
      const distances = normalizedAccepted.map((term) => {
        let a = normalizedInput
        let b = term
        const matrix = Array.from({ length: a.length + 1 }, (_, i) =>
          Array.from({ length: b.length + 1 }, (_, j) =>
            i === 0 ? j : j === 0 ? i : 0,
          ),
        )
        for (let i = 1; i <= a.length; i++)
          for (let j = 1; j <= b.length; j++)
            matrix[i][j] = Math.min(
              matrix[i - 1][j] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
            )
        return matrix[a.length][b.length]
      })
      const closest = Math.min(...distances)
      const maxLen = Math.max(
        normalizedInput.length,
        ...normalizedAccepted.map((t) => t.length),
      )
      const isClose =
        closest <= 2 || closest / Math.max(maxLen, 1) <= 0.25

      if (isClose) {
        setTypedFeedback({
          kind: "close",
          correct: false,
          message: `Close! The correct spelling is: ${bone.label}`,
        })
      } else {
        setTypedFeedback({
          kind: "wrong",
          correct: false,
          message: `Incorrect. The answer is: ${bone.label}`,
        })
      }
    }

    setTypedSubmitted(true)
    setTypedResults((prev) => [
      ...prev,
      {
        bone,
        input: trimmed,
        correct: exactMatch,
      },
    ])
  }

  const nextTypedBone = () => {
    const nextIdx = typedIndex + 1
    if (nextIdx >= typedBones.length) {
      setTypedComplete(true)
      setHighlightedRegion(null)
      return
    }
    setTypedIndex(nextIdx)
    setTypedInput("")
    setTypedFeedback(null)
    setTypedSubmitted(false)
    setHighlightedRegion(BONE_TO_REGION[typedBones[nextIdx].id])
    setTimeout(() => typedInputRef.current?.focus(), 50)
  }

  const handleTypedKeyDown = (e) => {
    if (e.key === "Enter") {
      if (typedSubmitted) {
        nextTypedBone()
      } else {
        submitTypedBone()
      }
    }
  }

  /* ---- Cram logic ---- */

  const startCram = (regionFilter = "all") => {
    setCramRegionFilter(regionFilter)
    const pool =
      regionFilter === "all"
        ? unit.structures
        : unit.structures.filter((s) => s.regionId === regionFilter)
    const cards = shuffle(pool).slice(0, Math.min(20, pool.length))
    setCramCards(cards)
    setCramIndex(0)
    setCramRevealed(false)
    setCramKnown(0)
    setCramFlagged(0)
    setCramComplete(false)
    if (cards.length > 0) {
      setHighlightedRegion(BONE_TO_REGION[cards[0].boneId])
    }
  }

  const cramMark = (known) => {
    if (known) {
      setCramKnown((c) => c + 1)
      if (onUpdateRecall && currentCramCard) {
        onUpdateRecall(currentCramCard.id, "known")
      }
    } else {
      setCramFlagged((c) => c + 1)
      if (onUpdateRecall && currentCramCard) {
        onUpdateRecall(currentCramCard.id, "missed")
      }
    }

    const nextIdx = cramIndex + 1
    if (nextIdx >= cramCards.length) {
      setCramComplete(true)
      setHighlightedRegion(null)
      return
    }
    setCramIndex(nextIdx)
    setCramRevealed(false)
    setHighlightedRegion(BONE_TO_REGION[cramCards[nextIdx].boneId])
  }

  const currentCramCard = cramCards.length > 0 ? cramCards[cramIndex] : null

  const currentQuizQ =
    quizQuestions.length > 0 ? quizQuestions[quizIndex] : null
  const currentTypedBone =
    typedBones.length > 0 ? typedBones[typedIndex] : null

  const typedCorrectCount = typedResults.filter((r) => r.correct).length

  return (
    <div className="space-y-4" ref={mainRef}>
      {/* ========== HEADER ========== */}
      <section className="panel px-5 py-6 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow">Chapter 7 • Interactive Study</p>
            <h2 className="font-display text-3xl font-semibold text-slate-900">
              Skeleton Explorer
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              Interactive skeletal system diagram with click-to-explore regions,
              visual quizzes, and typed bone identification. Hover over any bone
              region to highlight it.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="rounded-[24px] bg-[linear-gradient(135deg,_rgba(236,250,248,0.96),_rgba(232,244,255,0.88))] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Chapter 7 coverage
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {unit.bones.length} bones &middot;{" "}
                {unit.structures.length} structures &middot;{" "}
                {unit.regions.length} regions
              </p>
            </div>
          </div>
        </div>

        {/* Mode selector */}
        <div className="mt-5 flex flex-wrap gap-2">
          {MODES.map((m) => {
            const Icon = m.icon
            const active = mode === m.id

            return (
              <button
                key={m.id}
                type="button"
                onClick={() => handleModeChange(m.id)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                  active
                    ? "bg-[linear-gradient(135deg,_rgba(31,109,112,0.95),_rgba(18,81,99,0.95))] text-white shadow-soft"
                    : "bg-[rgba(31,109,112,0.08)] text-slate-700 hover:bg-[rgba(31,109,112,0.14)]"
                }`}
              >
                <Icon size={16} />
                {m.label}
              </button>
            )
          })}
        </div>

        {/* Mode description */}
        <p className="mt-3 text-sm text-slate-500">
          {MODES.find((m) => m.id === mode)?.helper}
        </p>
      </section>

      {/* ========== MAIN AREA ========== */}
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_400px]">
        {/* Skeleton diagram panel */}
        <div className="panel relative overflow-hidden px-4 py-5 sm:px-6">
          {/* Controls strip */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setLabelsVisible((v) => !v)}
              className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-white"
            >
              {labelsVisible ? <EyeOff size={14} /> : <Eye size={14} />}
              {labelsVisible ? "Hide labels" : "Show labels"}
            </button>

            {/* Search */}
            <div className="relative flex-1 sm:max-w-xs">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search a bone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-white/70 bg-white/90 py-2 pl-9 pr-4 text-sm text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[var(--ink-strong)] focus:ring-1 focus:ring-[var(--ink-strong)]"
              />
              {searchResults.length > 0 ? (
                <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-2xl border border-white/70 bg-white/95 py-2 shadow-soft backdrop-blur-xl">
                  {searchResults.map((bone) => (
                    <button
                      key={bone.id}
                      type="button"
                      onClick={() => handleSearchSelect(bone)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-[rgba(31,109,112,0.06)]"
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor:
                            REGION_META_MAP[BONE_TO_REGION[bone.id]]?.color ??
                            "#94a3b8",
                        }}
                      />
                      <span className="font-semibold text-slate-800">
                        {bone.label}
                      </span>
                      <span className="text-xs text-slate-500">
                        {bone.regionLabel}
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            {selectedRegion ? (
              <button
                type="button"
                onClick={() => setSelectedRegion(null)}
                className="inline-flex items-center gap-1 rounded-full bg-[rgba(31,109,112,0.08)] px-3 py-2 text-xs font-semibold text-[var(--ink-strong)]"
              >
                <X size={12} />
                Clear selection
              </button>
            ) : null}
          </div>

          {/* Skeleton SVG */}
          <div className="skeleton-container mx-auto" style={{ maxWidth: "420px" }}>
            <SkeletonSVG
              hoveredRegion={hoveredRegion}
              selectedRegion={selectedRegion}
              highlightedRegion={highlightedRegion}
              onRegionHover={handleRegionHover}
              onRegionClick={handleRegionClick}
              labelsVisible={labelsVisible}
              masteredRegions={masteredRegions}
              weakRegions={mode === "review" ? weakRegions : null}
              dimOthers={mode === "study"}
            />
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-full bg-[#E8DFD0]" />
              Default
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-full bg-[#BBF7D0]" />
              Mastered
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-full bg-[#FEF08A]" />
              Weak spot
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-full bg-[#60a5fa]" />
              Selected
            </span>
          </div>
        </div>

        {/* ========== SIDE PANEL ========== */}
        <div className="space-y-4">
          {/* ---- EXPLORE MODE ---- */}
          {mode === "explore" ? (
            <>
              {selectedRegion ? (
                <div className="panel px-5 py-5 sm:px-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p
                        className="eyebrow"
                        style={{
                          color:
                            REGION_META_MAP[selectedRegion]?.color ?? "#64748b",
                        }}
                      >
                        {REGION_META_MAP[selectedRegion]?.label}
                      </p>
                      <h3 className="mt-1 text-xl font-semibold text-slate-900">
                        {REGION_META_MAP[selectedRegion]?.description}
                      </h3>
                    </div>
                    <span
                      className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-2xl text-white"
                      style={{
                        backgroundColor:
                          REGION_META_MAP[selectedRegion]?.color ?? "#64748b",
                      }}
                    >
                      {regionStructureCounts[selectedRegion] ?? 0}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-slate-600">
                    {regionBones[selectedRegion]?.length ?? 0} bones &middot;{" "}
                    {regionStructureCounts[selectedRegion] ?? 0} structures
                  </p>

                  <div className="mt-4 space-y-2">
                    {(regionBones[selectedRegion] ?? []).map((bone) => {
                      const isWeak = weakSpotBoneIds.has(bone.id)
                      const isOverview = OVERVIEW_BONE_IDS.has(bone.id)
                      const isExpanded = expandedBoneId === bone.id
                      const boneStructures = structuresByBone[bone.id] ?? []
                      return (
                        <div key={bone.id}>
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedBoneId(isExpanded ? null : bone.id)
                            }
                            className="flex w-full items-center gap-3 rounded-2xl bg-[rgba(248,251,252,0.96)] px-4 py-3 text-left transition hover:bg-[rgba(236,250,248,0.96)]"
                          >
                            <span
                              className="h-2 w-2 shrink-0 rounded-full"
                              style={{
                                backgroundColor: isWeak
                                  ? "#fbbf24"
                                  : isOverview
                                    ? "#cbd5e1"
                                    : REGION_META_MAP[selectedRegion]?.color ??
                                      "#94a3b8",
                              }}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-slate-800">
                                {bone.label}
                              </p>
                              <p className="mt-0.5 text-xs leading-5 text-slate-500">
                                {bone.description}
                              </p>
                            </div>
                            {isWeak ? (
                              <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                                weak
                              </span>
                            ) : null}
                            {boneStructures.length > 0 ? (
                              isExpanded ? (
                                <ChevronDown
                                  size={14}
                                  className="shrink-0 text-slate-400"
                                />
                              ) : (
                                <ChevronRight
                                  size={14}
                                  className="shrink-0 text-slate-400"
                                />
                              )
                            ) : null}
                          </button>
                          {isExpanded && boneStructures.length > 0 ? (
                            <div className="ml-6 mt-1 space-y-1 border-l-2 border-[rgba(31,109,112,0.12)] pl-3">
                              {boneStructures.map((structure) => {
                                const structureWeak =
                                  (progress.weakSpots?.[structure.id]
                                    ?.misses ?? 0) > 0
                                return (
                                  <div
                                    key={structure.id}
                                    className="rounded-xl bg-white/60 px-3 py-2"
                                  >
                                    <p className="text-xs font-semibold text-slate-700">
                                      {structure.term}
                                      {structureWeak ? (
                                        <Zap
                                          size={10}
                                          className="ml-1 inline text-amber-500"
                                        />
                                      ) : null}
                                    </p>
                                    <p className="mt-0.5 text-xs leading-4 text-slate-500">
                                      {structure.hint}
                                    </p>
                                  </div>
                                )
                              })}
                            </div>
                          ) : null}
                        </div>
                      )
                    })}
                  </div>

                  {onNavigateToBones ? (
                    <button
                      type="button"
                      onClick={() => onNavigateToBones(selectedRegion)}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,_rgba(31,109,112,0.95),_rgba(18,81,99,0.95))] px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:shadow-lg"
                    >
                      Study this region in Bones Lab
                      <ChevronRight size={16} />
                    </button>
                  ) : null}
                </div>
              ) : (
                <div className="panel px-5 py-5 sm:px-6">
                  <div className="flex items-center gap-3">
                    <Sparkles size={20} className="text-[var(--ink-strong)]" />
                    <h3 className="text-lg font-semibold text-slate-900">
                      Select a region
                    </h3>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Click any bone region on the skeleton to see the bones and
                    structures it contains. Hover to preview. Use the search bar
                    to find a specific bone.
                  </p>

                  {/* Region quick list */}
                  <div className="mt-4 space-y-1.5">
                    {REGION_META.map((region) => (
                      <button
                        key={region.id}
                        type="button"
                        onClick={() => setSelectedRegion(region.id)}
                        onMouseEnter={() => setHoveredRegion(region.id)}
                        onMouseLeave={() => setHoveredRegion(null)}
                        className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition hover:bg-[rgba(248,251,252,0.96)]"
                      >
                        <span
                          className="h-3 w-3 shrink-0 rounded-full"
                          style={{ backgroundColor: region.color }}
                        />
                        <span className="flex-1 text-sm font-semibold text-slate-800">
                          {region.label}
                        </span>
                        <span className="text-xs text-slate-500">
                          {regionBones[region.id]?.length ?? 0} bones
                        </span>
                        <ChevronRight size={14} className="text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Progress stats */}
              <div className="panel px-5 py-4 sm:px-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Overall progress
                </p>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-[rgba(238,250,246,0.95)] p-3 text-center">
                    <p className="text-2xl font-semibold text-slate-900">
                      {masteredRegions.size}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">mastered</p>
                  </div>
                  <div className="rounded-2xl bg-[rgba(255,247,237,0.96)] p-3 text-center">
                    <p className="text-2xl font-semibold text-slate-900">
                      {weakSpotBoneIds.size}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">weak bones</p>
                  </div>
                  <div className="rounded-2xl bg-[rgba(237,244,255,0.95)] p-3 text-center">
                    <p className="text-2xl font-semibold text-slate-900">
                      {unit.regions.length}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">regions</p>
                  </div>
                </div>
              </div>
            </>
          ) : null}

          {/* ---- STUDY MODE ---- */}
          {mode === "study" ? (
            <div className="panel px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">
                <Lightbulb
                  size={20}
                  className="text-[var(--ink-strong)]"
                />
                <h3 className="text-lg font-semibold text-slate-900">
                  Self-test mode
                </h3>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Labels are hidden. Click a region on the skeleton to check if
                you can name the bones in that area. Toggle labels on/off with
                the button above the skeleton.
              </p>

              {selectedRegion ? (
                <div className="mt-5">
                  <div className="rounded-[24px] bg-[rgba(238,250,246,0.95)] p-4">
                    <p
                      className="text-sm font-semibold"
                      style={{
                        color:
                          REGION_META_MAP[selectedRegion]?.color ?? "#1e293b",
                      }}
                    >
                      {REGION_META_MAP[selectedRegion]?.label}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      Can you name all{" "}
                      {regionBones[selectedRegion]?.length ?? 0} bones in this
                      region?
                    </p>
                  </div>

                  <div className="mt-3 space-y-2">
                    {(regionBones[selectedRegion] ?? []).map((bone) => (
                      <StudyRevealCard key={bone.id} bone={bone} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-[24px] bg-[rgba(248,251,252,0.96)] p-5 text-center">
                  <Crosshair
                    size={32}
                    className="mx-auto text-slate-300"
                  />
                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    Click a region on the skeleton
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Then try to name each bone before revealing
                  </p>
                </div>
              )}
            </div>
          ) : null}

          {/* ---- QUIZ MODE ---- */}
          {mode === "quiz" ? (
            <div className="panel px-5 py-5 sm:px-6">
              {quizComplete ? (
                <div className="text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[linear-gradient(135deg,_rgba(236,250,248,0.96),_rgba(232,244,255,0.88))]">
                    <Check
                      size={36}
                      className="text-[var(--ink-strong)]"
                    />
                  </div>
                  <h3 className="mt-4 text-2xl font-semibold text-slate-900">
                    Quiz Complete!
                  </h3>
                  <p className="mt-2 text-lg font-semibold text-[var(--ink-strong)]">
                    {quizScore} / {quizQuestions.length} correct
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {Math.round(
                      (quizScore / quizQuestions.length) * 100,
                    )}
                    % accuracy
                  </p>

                  {/* Missed bones list */}
                  {quizQuestions.filter((q) => !q.correct).length > 0 ? (
                    <div className="mt-4 rounded-[20px] bg-[rgba(255,247,237,0.96)] p-4 text-left">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Review these bones
                      </p>
                      <div className="mt-2 space-y-1">
                        {quizQuestions
                          .filter((q) => !q.correct)
                          .map((q) => (
                            <p
                              key={q.bone.id}
                              className="text-sm font-semibold text-slate-800"
                            >
                              {q.bone.label}{" "}
                              <span className="font-normal text-slate-500">
                                — {q.bone.regionLabel}
                              </span>
                            </p>
                          ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-5 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => startQuiz()}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,_rgba(31,109,112,0.95),_rgba(18,81,99,0.95))] px-4 py-3 text-sm font-semibold text-white shadow-soft"
                    >
                      <RefreshCw size={16} />
                      New quiz
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModeChange("type")}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(31,109,112,0.16)] bg-white px-4 py-3 text-sm font-semibold text-[var(--ink-strong)]"
                    >
                      <PencilLine size={16} />
                      Try typed recall
                    </button>
                  </div>
                </div>
              ) : currentQuizQ ? (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <p className="eyebrow">Bone identification quiz</p>
                    <span className="rounded-2xl bg-[rgba(31,109,112,0.08)] px-3 py-1.5 text-xs font-semibold text-[var(--ink-strong)]">
                      {quizIndex + 1} / {quizQuestions.length}
                    </span>
                  </div>

                  <div className="mt-4 rounded-[24px] bg-[rgba(238,250,246,0.95)] p-4">
                    <p className="text-sm font-semibold text-slate-900">
                      What bone is highlighted on the skeleton?
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      Region: {currentQuizQ.bone.regionLabel}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Hint: {currentQuizQ.bone.description}
                    </p>
                  </div>

                  <div className="mt-4 space-y-2">
                    {currentQuizQ.options.map((option) => {
                      const isSelected =
                        currentQuizQ.selectedAnswer === option.id
                      const isCorrect = option.id === currentQuizQ.bone.id
                      const showResult = currentQuizQ.answered

                      let btnClass =
                        "w-full rounded-[20px] border px-4 py-3.5 text-left text-sm font-semibold transition"
                      if (showResult && isCorrect) {
                        btnClass +=
                          " border-green-300 bg-green-50 text-green-800"
                      } else if (showResult && isSelected && !isCorrect) {
                        btnClass += " border-red-300 bg-red-50 text-red-800"
                      } else if (!showResult) {
                        btnClass +=
                          " border-white/70 bg-white/90 text-slate-800 hover:border-[var(--ink-strong)] hover:bg-[rgba(31,109,112,0.04)]"
                      } else {
                        btnClass +=
                          " border-white/70 bg-white/60 text-slate-500"
                      }

                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => handleQuizAnswer(option)}
                          disabled={currentQuizQ.answered}
                          className={btnClass}
                        >
                          <span className="flex items-center gap-3">
                            {showResult && isCorrect ? (
                              <Check size={16} className="text-green-600" />
                            ) : showResult && isSelected ? (
                              <X size={16} className="text-red-500" />
                            ) : (
                              <span className="h-4 w-4 rounded-full border-2 border-slate-300" />
                            )}
                            {option.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  {currentQuizQ.answered ? (
                    <button
                      type="button"
                      onClick={nextQuizQuestion}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,_rgba(31,109,112,0.95),_rgba(18,81,99,0.95))] px-4 py-3 text-sm font-semibold text-white shadow-soft"
                    >
                      {quizIndex + 1 < quizQuestions.length
                        ? "Next question"
                        : "See results"}
                      <ArrowRight size={16} />
                    </button>
                  ) : null}

                  {/* Score bar */}
                  <div className="mt-4 flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-[var(--ink-strong)] transition-all duration-500"
                        style={{
                          width: `${((quizIndex + (currentQuizQ.answered ? 1 : 0)) / quizQuestions.length) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-[var(--ink-strong)]">
                      {quizScore} correct
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-slate-500">
                    Loading quiz...
                  </p>
                </div>
              )}
            </div>
          ) : null}

          {/* ---- TYPE MODE ---- */}
          {mode === "type" ? (
            <div className="panel px-5 py-5 sm:px-6">
              {typedComplete ? (
                <div className="text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[linear-gradient(135deg,_rgba(236,250,248,0.96),_rgba(232,244,255,0.88))]">
                    <PencilLine
                      size={36}
                      className="text-[var(--ink-strong)]"
                    />
                  </div>
                  <h3 className="mt-4 text-2xl font-semibold text-slate-900">
                    Typing Complete!
                  </h3>
                  <p className="mt-2 text-lg font-semibold text-[var(--ink-strong)]">
                    {typedCorrectCount} / {typedResults.length} correct
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {Math.round(
                      (typedCorrectCount / typedResults.length) * 100,
                    )}
                    % accuracy
                  </p>

                  {typedResults.filter((r) => !r.correct).length > 0 ? (
                    <div className="mt-4 rounded-[20px] bg-[rgba(255,247,237,0.96)] p-4 text-left">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Missed bones
                      </p>
                      <div className="mt-2 space-y-1">
                        {typedResults
                          .filter((r) => !r.correct)
                          .map((r) => (
                            <p
                              key={r.bone.id}
                              className="text-sm text-slate-800"
                            >
                              <span className="font-semibold">
                                {r.bone.label}
                              </span>{" "}
                              <span className="text-slate-500">
                                — you typed: {r.input}
                              </span>
                            </p>
                          ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-5 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => startTypedSession()}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,_rgba(31,109,112,0.95),_rgba(18,81,99,0.95))] px-4 py-3 text-sm font-semibold text-white shadow-soft"
                    >
                      <RefreshCw size={16} />
                      Try again
                    </button>
                  </div>
                </div>
              ) : currentTypedBone ? (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <p className="eyebrow">Typed bone recall</p>
                    <span className="rounded-2xl bg-[rgba(31,109,112,0.08)] px-3 py-1.5 text-xs font-semibold text-[var(--ink-strong)]">
                      {typedIndex + 1} / {typedBones.length}
                    </span>
                  </div>

                  <div className="mt-4 rounded-[24px] bg-[rgba(238,250,246,0.95)] p-4">
                    <p className="text-sm font-semibold text-slate-900">
                      Name the highlighted bone
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      Region: {currentTypedBone.regionLabel}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {currentTypedBone.description}
                    </p>
                  </div>

                  <div className="mt-4">
                    <input
                      ref={typedInputRef}
                      type="text"
                      value={typedInput}
                      onChange={(e) => setTypedInput(e.target.value)}
                      onKeyDown={handleTypedKeyDown}
                      disabled={typedSubmitted}
                      placeholder="Type the bone name..."
                      className="w-full rounded-2xl border border-white/70 bg-white/90 px-4 py-3.5 text-sm font-semibold text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[var(--ink-strong)] focus:ring-2 focus:ring-[rgba(31,109,112,0.2)] disabled:opacity-60"
                      autoComplete="off"
                      spellCheck={false}
                    />
                  </div>

                  {typedFeedback ? (
                    <div
                      className={`mt-3 rounded-[20px] p-4 ${
                        typedFeedback.kind === "correct"
                          ? "bg-green-50 text-green-800"
                          : typedFeedback.kind === "close"
                            ? "bg-amber-50 text-amber-800"
                            : typedFeedback.kind === "blank"
                              ? "bg-slate-50 text-slate-600"
                              : "bg-red-50 text-red-800"
                      }`}
                    >
                      <p className="text-sm font-semibold">
                        {typedFeedback.message}
                      </p>
                    </div>
                  ) : null}

                  <div className="mt-4 flex gap-2">
                    {!typedSubmitted ? (
                      <button
                        type="button"
                        onClick={submitTypedBone}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,_rgba(31,109,112,0.95),_rgba(18,81,99,0.95))] px-4 py-3 text-sm font-semibold text-white shadow-soft"
                      >
                        Submit
                        <ArrowRight size={16} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={nextTypedBone}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,_rgba(31,109,112,0.95),_rgba(18,81,99,0.95))] px-4 py-3 text-sm font-semibold text-white shadow-soft"
                      >
                        {typedIndex + 1 < typedBones.length
                          ? "Next bone"
                          : "See results"}
                        <ArrowRight size={16} />
                      </button>
                    )}
                  </div>

                  {/* Progress */}
                  <div className="mt-4 flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-[var(--ink-strong)] transition-all duration-500"
                        style={{
                          width: `${((typedIndex + (typedSubmitted ? 1 : 0)) / typedBones.length) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-[var(--ink-strong)]">
                      {typedCorrectCount} correct
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-slate-500">
                    Loading typed session...
                  </p>
                </div>
              )}
            </div>
          ) : null}

          {/* ---- CRAM MODE ---- */}
          {mode === "cram" ? (
            <div className="panel px-5 py-5 sm:px-6">
              {cramComplete ? (
                <div className="text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[linear-gradient(135deg,_rgba(236,250,248,0.96),_rgba(232,244,255,0.88))]">
                    <BookOpen size={36} className="text-[var(--ink-strong)]" />
                  </div>
                  <h3 className="mt-4 text-2xl font-semibold text-slate-900">
                    Cram Complete!
                  </h3>
                  <div className="mt-3 flex justify-center gap-6">
                    <div className="text-center">
                      <p className="text-2xl font-semibold text-green-600">
                        {cramKnown}
                      </p>
                      <p className="text-xs text-slate-500">knew it</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-semibold text-amber-500">
                        {cramFlagged}
                      </p>
                      <p className="text-xs text-slate-500">need review</p>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    {Math.round(
                      (cramKnown / cramCards.length) * 100,
                    )}
                    % confidence
                  </p>
                  <div className="mt-5 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => startCram(cramRegionFilter)}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,_rgba(31,109,112,0.95),_rgba(18,81,99,0.95))] px-4 py-3 text-sm font-semibold text-white shadow-soft"
                    >
                      <RefreshCw size={16} />
                      Cram again
                    </button>
                    <button
                      type="button"
                      onClick={() => startCram("all")}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(31,109,112,0.16)] bg-white px-4 py-3 text-sm font-semibold text-[var(--ink-strong)]"
                    >
                      All regions
                    </button>
                  </div>
                </div>
              ) : currentCramCard ? (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <p className="eyebrow">Quick cram</p>
                    <span className="rounded-2xl bg-[rgba(31,109,112,0.08)] px-3 py-1.5 text-xs font-semibold text-[var(--ink-strong)]">
                      {cramIndex + 1} / {cramCards.length}
                    </span>
                  </div>

                  {/* Region filter pills */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => startCram("all")}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                        cramRegionFilter === "all"
                          ? "bg-[var(--ink-strong)] text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      All
                    </button>
                    {REGION_META.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => startCram(r.id)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                          cramRegionFilter === r.id
                            ? "text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                        style={
                          cramRegionFilter === r.id
                            ? { backgroundColor: r.color }
                            : {}
                        }
                      >
                        {r.shortLabel}
                      </button>
                    ))}
                  </div>

                  {/* Structure card */}
                  <div className="mt-4 rounded-[24px] bg-[rgba(238,250,246,0.95)] p-5">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor:
                            REGION_META_MAP[currentCramCard.regionId]?.color ??
                            "#94a3b8",
                        }}
                      />
                      <span className="text-xs font-semibold text-slate-500">
                        {currentCramCard.boneLabel} &middot;{" "}
                        {currentCramCard.regionLabel}
                      </span>
                    </div>
                    <h4 className="mt-3 text-lg font-semibold text-slate-900">
                      {currentCramCard.term}
                    </h4>

                    {cramRevealed ? (
                      <div className="mt-3 space-y-2">
                        <p className="text-sm leading-6 text-slate-700">
                          {currentCramCard.definition}
                        </p>
                        <p className="text-sm text-slate-500">
                          <span className="font-semibold">Location:</span>{" "}
                          {currentCramCard.location}
                        </p>
                        <p className="text-xs italic text-slate-400">
                          {currentCramCard.hint}
                        </p>
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-slate-500">
                        {currentCramCard.hint}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex gap-2">
                    {!cramRevealed ? (
                      <button
                        type="button"
                        onClick={() => setCramRevealed(true)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[rgba(31,109,112,0.16)] bg-white px-4 py-3 text-sm font-semibold text-[var(--ink-strong)]"
                      >
                        <Eye size={16} />
                        Reveal
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => cramMark(true)}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-100"
                        >
                          <Check size={16} />
                          Knew it
                        </button>
                        <button
                          type="button"
                          onClick={() => cramMark(false)}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
                        >
                          <Zap size={16} />
                          Need review
                        </button>
                      </>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4 flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-[var(--ink-strong)] transition-all duration-500"
                        style={{
                          width: `${((cramIndex + 1) / cramCards.length) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="flex gap-2 text-xs font-semibold">
                      <span className="text-green-600">{cramKnown}</span>
                      <span className="text-slate-300">/</span>
                      <span className="text-amber-500">{cramFlagged}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-slate-500">
                    Click a region on the skeleton to cram that area, or use All.
                  </p>
                </div>
              )}
            </div>
          ) : null}

          {/* ---- REVIEW / WEAK SPOTS MODE ---- */}
          {mode === "review" ? (
            <div className="panel px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">
                <Zap size={20} className="text-amber-500" />
                <h3 className="text-lg font-semibold text-slate-900">
                  Weak spot review
                </h3>
              </div>

              {weakSpotBoneIds.size === 0 ? (
                <div className="mt-5 rounded-[24px] bg-[rgba(238,250,246,0.95)] p-5 text-center">
                  <Check size={32} className="mx-auto text-green-500" />
                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    No weak spots yet!
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Missed bones from quizzes and typed recall will appear here
                  </p>
                </div>
              ) : (
                <>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {weakSpotBoneIds.size} bones with missed structures.
                    Regions with weak spots glow amber on the skeleton.
                  </p>

                  <div className="mt-4 space-y-2">
                    {unit.bones
                      .filter((b) => weakSpotBoneIds.has(b.id))
                      .map((bone) => {
                        const missCount = unit.structures
                          .filter((s) => s.boneId === bone.id)
                          .reduce(
                            (sum, s) =>
                              sum +
                              (progress.weakSpots?.[s.id]?.misses ?? 0),
                            0,
                          )
                        return (
                          <div
                            key={bone.id}
                            className="flex items-center gap-3 rounded-2xl bg-[rgba(255,247,237,0.96)] px-4 py-3"
                          >
                            <Zap
                              size={14}
                              className="shrink-0 text-amber-500"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-slate-800">
                                {bone.label}
                              </p>
                              <p className="text-xs text-slate-500">
                                {bone.regionLabel}
                              </p>
                            </div>
                            <span className="shrink-0 text-xs font-semibold text-amber-700">
                              {missCount} miss
                              {missCount !== 1 ? "es" : ""}
                            </span>
                          </div>
                        )
                      })}
                  </div>

                  <div className="mt-5 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const weakBones = unit.bones.filter((b) =>
                          weakSpotBoneIds.has(b.id),
                        )
                        handleModeChange("quiz")
                        setTimeout(() => startQuiz(weakBones), 50)
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,_rgba(31,109,112,0.95),_rgba(18,81,99,0.95))] px-4 py-3 text-sm font-semibold text-white shadow-soft"
                    >
                      <Target size={16} />
                      Quiz weak spots
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const weakBones = unit.bones.filter((b) =>
                          weakSpotBoneIds.has(b.id),
                        )
                        handleModeChange("type")
                        setTimeout(() => startTypedSession(weakBones), 50)
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(31,109,112,0.16)] bg-white px-4 py-3 text-sm font-semibold text-[var(--ink-strong)]"
                    >
                      <PencilLine size={16} />
                      Type weak spots
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  STUDY REVEAL CARD                                                 */
/* ------------------------------------------------------------------ */

function StudyRevealCard({ bone }) {
  const [revealed, setRevealed] = useState(false)

  return (
    <div className="rounded-2xl border border-white/70 bg-white/90 p-4 transition">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          {revealed ? (
            <>
              <p className="text-sm font-semibold text-slate-900">
                {bone.label}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {bone.description}
              </p>
            </>
          ) : (
            <p className="text-sm font-semibold text-slate-400">
              ? ? ?
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setRevealed((v) => !v)}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
            revealed
              ? "bg-[rgba(31,109,112,0.08)] text-[var(--ink-strong)]"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {revealed ? <EyeOff size={12} /> : <Eye size={12} />}
          {revealed ? "Hide" : "Reveal"}
        </button>
      </div>
    </div>
  )
}
