import fs from "node:fs"
import path from "node:path"

const outDir = path.join(process.cwd(), "public", "anatomy", "concepts")
fs.mkdirSync(outDir, { recursive: true })

function esc(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
}

function wrapPlate({ chapterLabel, title, subtitle, illustrationSvg, cards }) {
  const cardBlocks = cards
    .map((c, idx) => {
      const col = idx % 2
      const row = Math.floor(idx / 2)
      const x = 440 + col * 365
      const y = 118 + row * 192
      const accent = c.accent || "#5ec2ab"
      return `
      <g transform="translate(${x}, ${y})">
        <rect width="345" height="172" rx="16" fill="#1b3037" stroke="#2e4d56" stroke-width="1.5"/>
        <rect x="0" y="0" width="8" height="172" rx="4" fill="${accent}"/>
        <rect x="22" y="16" width="96" height="22" rx="11" fill="${accent}" fill-opacity="0.16"/>
        <text x="70" y="31" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="10.5" font-weight="800" letter-spacing="0.08em" fill="${accent}">${esc(c.tag)}</text>
        <text x="22" y="62" font-family="system-ui, -apple-system, sans-serif" font-size="16.5" font-weight="800" fill="#f1faf8">${esc(c.heading)}</text>
        <text x="22" y="90" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#c3d9d5">${esc(c.line1)}</text>
        <text x="22" y="114" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#c3d9d5">${esc(c.line2)}</text>
        <line x1="22" y1="132" x2="323" y2="132" stroke="#2a4750" stroke-width="1"/>
        <text x="22" y="153" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" fill="${accent}">${esc(c.footer)}</text>
      </g>`
    })
    .join("\n")

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 750" width="1200" height="750" role="img" aria-label="${esc(title)}">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#111f24"/>
      <stop offset="100%" stop-color="#172a31"/>
    </linearGradient>
    <linearGradient id="stageGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#182c33"/>
      <stop offset="100%" stop-color="#122127"/>
    </linearGradient>
    <pattern id="gridPat" width="28" height="28" patternUnits="userSpaceOnUse">
      <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#223b43" stroke-width="0.7" stroke-opacity="0.55"/>
    </pattern>
  </defs>

  <rect width="1200" height="750" rx="24" fill="url(#bgGrad)"/>
  <rect x="16" y="16" width="1168" height="718" rx="18" fill="none" stroke="#29464f" stroke-width="1.5"/>

  <!-- Header -->
  <rect x="36" y="34" width="136" height="26" rx="13" fill="#5ec2ab" fill-opacity="0.16" stroke="#5ec2ab" stroke-opacity="0.4"/>
  <text x="104" y="51" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="800" letter-spacing="0.1em" fill="#6fd6be">${esc(chapterLabel)}</text>
  <text x="188" y="53" font-family="system-ui, -apple-system, sans-serif" font-size="23" font-weight="800" fill="#f3fbf9">${esc(title)}</text>
  <text x="38" y="84" font-family="system-ui, -apple-system, sans-serif" font-size="14" fill="#9db5b2">${esc(subtitle)}</text>
  <line x1="36" y1="100" x2="1164" y2="100" stroke="#26424a" stroke-width="1.2"/>

  <!-- Left Anatomical Illustration Panel -->
  <g transform="translate(36, 118)">
    <rect width="384" height="584" rx="18" fill="url(#stageGrad)" stroke="#2d4c55" stroke-width="1.5"/>
    <rect width="384" height="584" rx="18" fill="url(#gridPat)"/>
    ${illustrationSvg}
  </g>

  <!-- Right 6 High-Yield Study Cards (2x3 Grid) -->
  ${cardBlocks}
</svg>
`
}

const plates = [
  {
    file: "ch1-fig-1.svg",
    chapterLabel: "CHAPTER 01",
    title: "Anatomical Position, Body Planes & Directional Terms",
    subtitle: "Standard anatomical reference frame: erect posture, feet slightly apart, palms facing anteriorly (supinated)",
    illustrationSvg: `
      <text x="192" y="34" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#6fd6be" letter-spacing="0.08em">3D ANATOMICAL PLANES</text>
      <!-- Frontal Plane Sheet -->
      <polygon points="85,80 299,60 299,450 85,470" fill="#5ec2ab" fill-opacity="0.12" stroke="#5ec2ab" stroke-width="1.5" stroke-dasharray="5,4"/>
      <!-- Body Silhouette -->
      <circle cx="192" cy="122" r="28" fill="#23424a" stroke="#8ce0cb" stroke-width="2.2"/>
      <rect x="156" y="158" width="72" height="132" rx="22" fill="#23424a" stroke="#8ce0cb" stroke-width="2.2"/>
      <!-- Arms (palms forward) -->
      <path d="M156,170 L112,268 L128,276 L160,198" fill="#23424a" stroke="#8ce0cb" stroke-width="2"/>
      <path d="M228,170 L272,268 L256,276 L224,198" fill="#23424a" stroke="#8ce0cb" stroke-width="2"/>
      <!-- Legs -->
      <path d="M164,290 L156,435 L182,435 L188,290" fill="#23424a" stroke="#8ce0cb" stroke-width="2"/>
      <path d="M220,290 L228,435 L202,435 L196,290" fill="#23424a" stroke="#8ce0cb" stroke-width="2"/>
      <!-- Midsagittal Plane Line -->
      <line x1="192" y1="68" x2="192" y2="465" stroke="#e99a83" stroke-width="3"/>
      <text x="200" y="84" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#e99a83">Midsagittal (Median)</text>
      <!-- Transverse Plane Ellipse -->
      <ellipse cx="192" cy="232" rx="135" ry="26" fill="#e5c478" fill-opacity="0.18" stroke="#e5c478" stroke-width="2.2"/>
      <text x="64" y="218" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#e5c478">Transverse Plane</text>
      <!-- Directional Arrows -->
      <text x="192" y="510" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#f1faf8">Superior (Cranial) ↑   |   ↓ Inferior (Caudal)</text>
      <text x="192" y="536" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#6fd6be">Proximal → Distal (Limbs) · Medial ↔ Lateral</text>
      <text x="192" y="560" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" fill="#9db5b2">Frontal = Anterior / Posterior</text>
    `,
    cards: [
      { tag: "PLANE 01", heading: "Sagittal Plane", line1: "Vertical cut dividing the body into", line2: "left and right portions.", footer: "Midsagittal = equal left & right halves", accent: "#e99a83" },
      { tag: "PLANE 02", heading: "Frontal (Coronal) Plane", line1: "Vertical cut dividing the body into", line2: "anterior (ventral) & posterior (dorsal).", footer: "Separates front from back", accent: "#5ec2ab" },
      { tag: "PLANE 03", heading: "Transverse (Horizontal)", line1: "Horizontal cut dividing body into", line2: "superior (upper) & inferior (lower).", footer: "Called a cross-section in CT/MRI", accent: "#e5c478" },
      { tag: "DIRECTION", heading: "Medial vs. Lateral", line1: "Medial = closer to the midline;", line2: "Lateral = farther from the midline.", footer: "Sternum is medial to the ribs", accent: "#7cc4e8" },
      { tag: "LIMB AXIS", heading: "Proximal vs. Distal", line1: "Proximal = closer to limb attachment;", line2: "Distal = farther from trunk origin.", footer: "Elbow is proximal to the wrist", accent: "#5ec2ab" },
      { tag: "DEPTH", heading: "Superficial vs. Deep", line1: "Superficial = toward body surface;", line2: "Deep = more internal away from skin.", footer: "Skin is superficial to skeletal muscle", accent: "#e99a83" },
    ],
  },
  {
    file: "ch1-fig-2.svg",
    chapterLabel: "CHAPTER 01",
    title: "Body Cavities, Serous Membranes & Homeostasis",
    subtitle: "Dorsal protector cavities vs. Ventral visceral cavities lined by double-layered serous membranes",
    illustrationSvg: `
      <text x="192" y="34" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#e5c478" letter-spacing="0.08em">DORSAL &amp; VENTRAL CAVITIES</text>
      <!-- Dorsal Cavity -->
      <path d="M120,75 C120,55 185,55 185,85 L185,135 L155,135 L155,340 L132,340 L132,125 Z" fill="#e5c478" fill-opacity="0.22" stroke="#e5c478" stroke-width="2.2"/>
      <text x="72" y="96" font-family="system-ui, sans-serif" font-size="11.5" font-weight="700" fill="#e5c478">Cranial</text>
      <text x="60" y="235" font-family="system-ui, sans-serif" font-size="11.5" font-weight="700" fill="#e5c478">Vertebral</text>
      <!-- Thoracic Cavity -->
      <rect x="172" y="148" width="136" height="106" rx="18" fill="#5ec2ab" fill-opacity="0.2" stroke="#5ec2ab" stroke-width="2.2"/>
      <text x="240" y="188" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#6fd6be">Thoracic Cavity</text>
      <text x="240" y="210" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#d3ece7">Pleural (2) + Mediastinum</text>
      <text x="240" y="228" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#d3ece7">&amp; Pericardial Cavity</text>
      <!-- Diaphragm -->
      <path d="M166,262 Q240,242 314,262" fill="none" stroke="#e99a83" stroke-width="4"/>
      <text x="240" y="278" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="800" fill="#e99a83">Diaphragm Muscle Dome</text>
      <!-- Abdominopelvic Cavity -->
      <rect x="172" y="288" width="136" height="145" rx="18" fill="#7cc4e8" fill-opacity="0.18" stroke="#7cc4e8" stroke-width="2.2"/>
      <text x="240" y="335" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#7cc4e8">Abdominal Cavity</text>
      <line x1="178" y1="372" x2="302" y2="372" stroke="#7cc4e8" stroke-dasharray="4,4"/>
      <text x="240" y="405" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#7cc4e8">Pelvic Cavity</text>
      <!-- Serosa Callout -->
      <rect x="34" y="458" width="316" height="98" rx="14" fill="#1b323a" stroke="#365a64"/>
      <text x="192" y="484" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12.5" font-weight="800" fill="#f1faf8">SEROUS MEMBRANE ARCHITECTURE</text>
      <text x="192" y="508" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" fill="#6fd6be">Parietal Serosa lines cavity wall</text>
      <text x="192" y="528" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" fill="#e99a83">Visceral Serosa covers organ surface</text>
      <text x="192" y="546" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#9db5b2">Serous fluid between layers prevents friction</text>
    `,
    cards: [
      { tag: "DORSAL", heading: "Cranial & Vertebral", line1: "Continuous dorsal cavity encasing the", line2: "brain (skull) and spinal cord (vertebrae).", footer: "Protected by bone and meninges", accent: "#e5c478" },
      { tag: "THORACIC", heading: "Pleural & Pericardial", line1: "Lateral pleural cavities house the lungs;", line2: "pericardial cavity encloses the heart.", footer: "Superior to the diaphragm", accent: "#5ec2ab" },
      { tag: "VENTRAL", heading: "Abdominopelvic Cavity", line1: "Digestive viscera superiorly; urinary", line2: "bladder & reproductive organs inferiorly.", footer: "Lined by the peritoneum", accent: "#7cc4e8" },
      { tag: "SEROSA", heading: "Parietal vs. Visceral", line1: "Parietal lines the outer body wall;", line2: "Visceral clings directly to the organ.", footer: "Fist-in-balloon analogy", accent: "#e99a83" },
      { tag: "CONTROL", heading: "Negative Feedback Loop", line1: "Receptor → Control Center → Effector", line2: "reverses stimulus to restore set point.", footer: "Body temp, blood glucose, blood Ca²⁺", accent: "#5ec2ab" },
      { tag: "AMPLIFY", heading: "Positive Feedback Cascade", line1: "Response amplifies the original stimulus", line2: "until a climatic event completes.", footer: "Oxytocin labor contractions & clotting", accent: "#e5c478" },
    ],
  },
  {
    file: "ch2-fig-1.svg",
    chapterLabel: "CHAPTER 02",
    title: "Chemical Bonds, Water Polarity & Physiological pH Scale",
    subtitle: "Electron sharing/transfer, hydrogen bonding in water, and acid-base homeostasis (blood pH 7.35–7.45)",
    illustrationSvg: `
      <text x="192" y="34" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#6fd6be" letter-spacing="0.08em">BONDING &amp; BLOOD pH SCALE</text>
      <!-- Water Molecule H2O -->
      <circle cx="192" cy="128" r="38" fill="#e99a83" fill-opacity="0.28" stroke="#e99a83" stroke-width="2.5"/>
      <text x="192" y="133" text-anchor="middle" font-family="system-ui, sans-serif" font-size="16" font-weight="800" fill="#f1faf8">O (δ⁻)</text>
      <circle cx="132" cy="176" r="24" fill="#5ec2ab" fill-opacity="0.28" stroke="#5ec2ab" stroke-width="2.2"/>
      <text x="132" y="181" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#f1faf8">H (δ⁺)</text>
      <circle cx="252" cy="176" r="24" fill="#5ec2ab" fill-opacity="0.28" stroke="#5ec2ab" stroke-width="2.2"/>
      <text x="252" y="181" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#f1faf8">H (δ⁺)</text>
      <text x="192" y="222" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#6fd6be">Polar Covalent + Intermolecular H-Bonds</text>
      <!-- pH Scale Bar -->
      <rect x="34" y="268" width="316" height="36" rx="10" fill="#1f3a42" stroke="#365a64"/>
      <rect x="36" y="270" width="140" height="32" rx="8" fill="#e99a83" fill-opacity="0.45"/>
      <rect x="176" y="270" width="32" height="32" fill="#5ec2ab" fill-opacity="0.65"/>
      <rect x="208" y="270" width="140" height="32" rx="8" fill="#7cc4e8" fill-opacity="0.45"/>
      <text x="96" y="291" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#fff">Acidic (0–6.9)</text>
      <text x="192" y="291" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#111f24">7</text>
      <text x="280" y="291" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#fff">Basic (7.1–14)</text>
      <!-- Arterial Blood Callout -->
      <rect x="52" y="335" width="280" height="104" rx="14" fill="#1b3438" stroke="#5ec2ab" stroke-width="2"/>
      <text x="192" y="366" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#6fd6be">Arterial Blood pH: 7.35 – 7.45</text>
      <text x="192" y="392" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" fill="#e2f2ef">pH &lt; 7.35 = Physiological Acidosis</text>
      <text x="192" y="414" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" fill="#e2f2ef">pH &gt; 7.45 = Physiological Alkalosis</text>
      <text x="192" y="485" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#e5c478">Each 1 pH unit = 10× change in [H⁺]</text>
      <text x="192" y="512" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" fill="#9db5b2">Bicarbonate buffer system resists pH shifts</text>
    `,
    cards: [
      { tag: "ELECTRONS", heading: "Ionic Bonds (Cation + Anion)", line1: "Complete transfer of valence electrons", line2: "creates oppositely charged ions (Na⁺Cl⁻).", footer: "Dissociates into electrolytes in water", accent: "#e5c478" },
      { tag: "SHARING", heading: "Nonpolar vs. Polar Covalent", line1: "Equal electron sharing = nonpolar (O₂);", line2: "unequal sharing = polar dipole (H₂O).", footer: "Strongest chemical bond in physiology", accent: "#5ec2ab" },
      { tag: "WATER", heading: "Hydrogen Bonding", line1: "Weak attraction between δ⁺ hydrogen", line2: "and δ⁻ oxygen or nitrogen atoms.", footer: "Gives water high heat capacity & cohesion", accent: "#7cc4e8" },
      { tag: "ACID / BASE", heading: "Proton Donors & Acceptors", line1: "Acids release H⁺ ions in solution;", line2: "Bases accept H⁺ (or release OH⁻).", footer: "Lower pH = higher [H⁺] concentration", accent: "#e99a83" },
      { tag: "BUFFERS", heading: "Chemical Buffer Systems", line1: "Weak acid + conjugate base pairs bind", line2: "or release H⁺ to prevent pH swings.", footer: "Carbonic acid / bicarbonate in blood", accent: "#5ec2ab" },
      { tag: "REACTIONS", heading: "Dehydration vs. Hydrolysis", line1: "Dehydration removes H₂O to join monomers;", line2: "Hydrolysis adds H₂O to split polymers.", footer: "Anabolic build vs. Catabolic breakdown", accent: "#e5c478" },
    ],
  },
  {
    file: "ch2-fig-2.svg",
    chapterLabel: "CHAPTER 02",
    title: "Organic Macromolecules, Enzymes & ATP Energy Currency",
    subtitle: "Monomer building blocks, protein folding hierarchy, enzyme catalysis, and ATP phosphorylation",
    illustrationSvg: `
      <text x="192" y="34" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#e5c478" letter-spacing="0.08em">ATP – ADP ENERGY CYCLE</text>
      <!-- ATP Box -->
      <rect x="64" y="72" width="256" height="78" rx="16" fill="#e5c478" fill-opacity="0.2" stroke="#e5c478" stroke-width="2.2"/>
      <text x="192" y="104" text-anchor="middle" font-family="system-ui, sans-serif" font-size="16" font-weight="800" fill="#f6e3b4">ATP (Adenosine-P~P~P)</text>
      <text x="192" y="128" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" fill="#d8e8e4">High-energy terminal phosphate bond</text>
      <!-- Cycle Arrows -->
      <path d="M300,165 C345,215 345,275 300,320" fill="none" stroke="#e99a83" stroke-width="3"/>
      <text x="282" y="242" text-anchor="end" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#e99a83">Hydrolysis → Cellular Work</text>
      <text x="282" y="262" text-anchor="end" font-family="system-ui, sans-serif" font-size="11" fill="#f1faf8">(Transport, Contraction, Synthesis)</text>
      <path d="M84,320 C38,275 38,215 84,165" fill="none" stroke="#5ec2ab" stroke-width="3"/>
      <text x="102" y="210" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#6fd6be">← Cellular Respiration</text>
      <text x="102" y="228" font-family="system-ui, sans-serif" font-size="11" fill="#d8e8e4">(Glucose + O₂ in Mitochondria)</text>
      <!-- ADP Box -->
      <rect x="64" y="335" width="256" height="72" rx="16" fill="#213a42" stroke="#5ec2ab" stroke-width="2"/>
      <text x="192" y="366" text-anchor="middle" font-family="system-ui, sans-serif" font-size="15" font-weight="800" fill="#6fd6be">ADP + Pi (Inorganic Phosphate)</text>
      <text x="192" y="388" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" fill="#b9d2ce">Recharged continuously by catabolism</text>
      <!-- Enzyme Action -->
      <rect x="40" y="438" width="304" height="114" rx="14" fill="#1b323a" stroke="#365a64"/>
      <text x="192" y="466" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12.5" font-weight="800" fill="#f1faf8">ENZYME CATALYSIS</text>
      <text x="192" y="492" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" fill="#6fd6be">Lowers Activation Energy (Ea) barrier</text>
      <text x="192" y="514" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" fill="#e99a83">Extreme heat or pH denatures 3D active site</text>
      <text x="192" y="536" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#9db5b2">Enzymes are not consumed in the reaction</text>
    `,
    cards: [
      { tag: "CARBS", heading: "Carbohydrates (CH₂O)n", line1: "Monomer: Monosaccharides (glucose).", line2: "Polymer: Glycogen stored in liver/muscle.", footer: "Primary rapid fuel for ATP synthesis", accent: "#5ec2ab" },
      { tag: "LIPIDS", heading: "Triglycerides, Phospholipids, Steroids", line1: "Glycerol + 3 fatty acids = energy reserve;", line2: "Phospholipids form cell bilayers.", footer: "Cholesterol is precursor to steroid hormones", accent: "#e5c478" },
      { tag: "PROTEINS", heading: "Amino Acids & Peptide Bonds", line1: "Primary (sequence) → Secondary (α/β) →", line2: "Tertiary (3D fold) → Quaternary.", footer: "Structure determines biological function", accent: "#e99a83" },
      { tag: "CATALYSTS", heading: "Biological Enzymes (-ase)", line1: "Globular proteins that bind specific", line2: "substrates at their 3D active site.", footer: "Drastically speed up metabolic reactions", accent: "#7cc4e8" },
      { tag: "GENETICS", heading: "DNA vs. RNA Nucleic Acids", line1: "DNA (A-T, C-G, deoxyribose, double helix);", line2: "RNA (A-U, C-G, ribose, single strand).", footer: "Nucleotide = base + pentose + phosphate", accent: "#5ec2ab" },
      { tag: "ENERGY", heading: "Adenosine Triphosphate (ATP)", line1: "Terminal phosphate transfer phosphorylates", line2: "transport pumps & contractile proteins.", footer: "Immediate universal cellular energy currency", accent: "#e5c478" },
    ],
  },
  {
    file: "ch3-fig-1.svg",
    chapterLabel: "CHAPTER 03",
    title: "Plasma Membrane Bilayer & Selective Transport Mechanisms",
    subtitle: "Amphipathic phospholipid bilayer, passive diffusion/osmosis vs. ATP-driven Na⁺/K⁺ pump and vesicular transport",
    illustrationSvg: `
      <text x="192" y="34" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#6fd6be" letter-spacing="0.08em">PHOSPHOLIPID BILAYER &amp; PUMPS</text>
      <text x="192" y="68" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#7cc4e8">Extracellular Fluid (High Na⁺, Cl⁻)</text>
      <!-- Bilayer Heads & Tails -->
      <rect x="34" y="96" width="316" height="132" rx="14" fill="#1f3b44" stroke="#5ec2ab" stroke-width="2"/>
      <!-- Top Row Heads -->
      <g fill="#e5c478">
        <circle cx="64" cy="112" r="11"/><circle cx="94" cy="112" r="11"/><circle cx="124" cy="112" r="11"/>
        <circle cx="260" cy="112" r="11"/><circle cx="290" cy="112" r="11"/><circle cx="320" cy="112" r="11"/>
      </g>
      <!-- Bottom Row Heads -->
      <g fill="#e5c478">
        <circle cx="64" cy="212" r="11"/><circle cx="94" cy="212" r="11"/><circle cx="124" cy="212" r="11"/>
        <circle cx="260" cy="212" r="11"/><circle cx="290" cy="212" r="11"/><circle cx="320" cy="212" r="11"/>
      </g>
      <!-- Transmembrane Pump Protein -->
      <rect x="154" y="84" width="76" height="156" rx="22" fill="#e99a83" stroke="#fff" stroke-width="1.8"/>
      <text x="192" y="154" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#111f24">Na⁺/K⁺</text>
      <text x="192" y="172" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" font-weight="800" fill="#111f24">ATPase</text>
      <text x="192" y="268" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#6fd6be">Intracellular Cytosol (High K⁺, Proteins⁻)</text>
      <!-- Stoichiometry Callout -->
      <rect x="38" y="302" width="308" height="252" rx="14" fill="#1b323a" stroke="#365a64"/>
      <text x="192" y="334" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13.5" font-weight="800" fill="#f1faf8">MEMBRANE TRAFFIC RULES</text>
      <text x="192" y="366" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#6fd6be">1. Lipid-Soluble &amp; Nonpolar (O₂, CO₂)</text>
      <text x="192" y="386" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" fill="#c3d9d5">Cross hydrophobic core by simple diffusion</text>
      <text x="192" y="422" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#e5c478">2. Ions &amp; Glucose (Polar / Charged)</text>
      <text x="192" y="442" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" fill="#c3d9d5">Require protein channels or carriers</text>
      <text x="192" y="478" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#e99a83">3. Na⁺/K⁺ Pump (Primary Active)</text>
      <text x="192" y="498" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" fill="#c3d9d5">Pumps 3 Na⁺ OUT and 2 K⁺ IN per 1 ATP</text>
      <text x="192" y="532" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#9db5b2">Maintains -70 mV resting membrane potential</text>
    `,
    cards: [
      { tag: "BILAYER", heading: "Amphipathic Phospholipids", line1: "Hydrophilic phosphate heads face water;", line2: "hydrophobic fatty acid tails face inward.", footer: "Cholesterol stabilizes membrane fluidity", accent: "#e5c478" },
      { tag: "PASSIVE", heading: "Simple & Facilitated Diffusion", line1: "Movement down concentration gradient", line2: "(high → low) using zero cellular ATP.", footer: "Channels & carriers assist polar solutes", accent: "#5ec2ab" },
      { tag: "WATER", heading: "Osmosis & Aquaporins", line1: "Diffusion of water across a selectively", line2: "permeable membrane toward higher osmolarity.", footer: "Water follows salt (solute concentration)", accent: "#7cc4e8" },
      { tag: "TONICITY", heading: "Isotonic, Hypertonic, Hypotonic", line1: "Hypertonic shrinks cells (crenation);", line2: "Hypotonic swells & lyses cells.", footer: "0.9% NaCl normal saline is isotonic", accent: "#e99a83" },
      { tag: "ACTIVE", heading: "Na⁺/K⁺ ATPase Pump", line1: "Uses ATP to pump 3 Na⁺ out of the cell", line2: "and 2 K⁺ into the cell against gradients.", footer: "Essential for excitable nerve & muscle cells", accent: "#5ec2ab" },
      { tag: "VESICLES", heading: "Endocytosis & Exocytosis", line1: "ATP-driven vesicular bulk transport for", line2: "macromolecules, hormones & neurotransmitters.", footer: "Phagocytosis, pinocytosis & receptor-mediated", accent: "#e5c478" },
    ],
  },
  {
    file: "ch3-fig-2.svg",
    chapterLabel: "CHAPTER 03",
    title: "Cellular Organelles, Protein Synthesis & Cell Cycle",
    subtitle: "Organelle division of labor, transcription (DNA → mRNA) & translation (mRNA → polypeptide), and mitosis",
    illustrationSvg: `
      <text x="192" y="34" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#e5c478" letter-spacing="0.08em">ORGANELLE PATHWAY MAP</text>
      <!-- Nucleus -->
      <circle cx="192" cy="128" r="52" fill="#7cc4e8" fill-opacity="0.2" stroke="#7cc4e8" stroke-width="2.5"/>
      <circle cx="192" cy="128" r="20" fill="#7cc4e8" fill-opacity="0.4"/>
      <text x="192" y="132" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#fff">Nucleus</text>
      <text x="192" y="198" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" font-weight="700" fill="#7cc4e8">1. DNA → mRNA (Transcription)</text>
      <!-- Rough ER -->
      <rect x="68" y="218" width="248" height="58" rx="14" fill="#5ec2ab" fill-opacity="0.18" stroke="#5ec2ab" stroke-width="2"/>
      <text x="192" y="244" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#6fd6be">2. Rough ER + Ribosomes</text>
      <text x="192" y="264" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#d3ece7">mRNA → Protein Translation &amp; Folding</text>
      <!-- Golgi -->
      <rect x="68" y="298" width="248" height="58" rx="14" fill="#e5c478" fill-opacity="0.18" stroke="#e5c478" stroke-width="2"/>
      <text x="192" y="324" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#e5c478">3. Golgi Apparatus</text>
      <text x="192" y="344" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#d3ece7">Modifies, sorts, tags &amp; packages vesicles</text>
      <!-- Mitochondrion -->
      <ellipse cx="192" cy="432" rx="124" ry="44" fill="#e99a83" fill-opacity="0.22" stroke="#e99a83" stroke-width="2.2"/>
      <path d="M96,432 Q125,402 145,432 T192,432 T240,432 T285,432" fill="none" stroke="#e99a83" stroke-width="2"/>
      <text x="192" y="428" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#f1faf8">Mitochondrion (Cristae)</text>
      <text x="192" y="448" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#fbd0bd">Aerobic ATP Powerhouse (O₂ → ATP)</text>
      <text x="192" y="522" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#6fd6be">Mitosis Stages: Prophase → Metaphase</text>
      <text x="192" y="544" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#6fd6be">→ Anaphase → Telophase + Cytokinesis</text>
    `,
    cards: [
      { tag: "ATP ENGINE", heading: "Mitochondria", line1: "Double-membrane organelle with folded", line2: "inner cristae; site of aerobic ATP synthesis.", footer: "Contains its own maternal mtDNA", accent: "#e99a83" },
      { tag: "SYNTHESIS", heading: "Ribosomes & Rough ER", line1: "Ribosomes translate mRNA into proteins;", line2: "Rough ER folds membrane & secretory proteins.", footer: "Smooth ER synthesizes lipids & detoxifies", accent: "#5ec2ab" },
      { tag: "SHIPPING", heading: "Golgi Apparatus", line1: "Receives Rough ER transport vesicles,", line2: "modifies glycoproteins & ships to targets.", footer: "Produces secretory vesicles & lysosomes", accent: "#e5c478" },
      { tag: "CLEANUP", heading: "Lysosomes vs. Peroxisomes", line1: "Lysosomes use acid hydrolases for autophagy;", line2: "Peroxisomes neutralize free radicals & H₂O₂.", footer: "Catalase converts H₂O₂ into water", accent: "#7cc4e8" },
      { tag: "EXPRESSION", heading: "Transcription & Translation", line1: "Transcription (nucleus): DNA → mRNA;", line2: "Translation (ribosome): mRNA + tRNA → protein.", footer: "3-base mRNA codon pairs with tRNA anticodon", accent: "#5ec2ab" },
      { tag: "DIVISION", heading: "DNA Replication & Mitosis", line1: "S-phase semi-conservative DNA synthesis;", line2: "PMAT mitosis yields 2 identical diploid cells.", footer: "Checkpoints prevent uncontrolled division", accent: "#e99a83" },
    ],
  },
  {
    file: "ch4-fig-1.svg",
    chapterLabel: "CHAPTER 04",
    title: "Epithelial Tissue Classification & Cellular Junctions",
    subtitle: "Apical vs. basal polarity, avascularity on a basement membrane, and layer × shape classification",
    illustrationSvg: `
      <text x="192" y="34" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#6fd6be" letter-spacing="0.08em">EPITHELIAL LAYER × SHAPE</text>
      <!-- Simple Squamous -->
      <rect x="38" y="64" width="308" height="92" rx="12" fill="#1b323a" stroke="#365a64"/>
      <ellipse cx="95" cy="102" rx="34" ry="10" fill="#5ec2ab" fill-opacity="0.35" stroke="#5ec2ab" stroke-width="1.8"/>
      <ellipse cx="165" cy="102" rx="34" ry="10" fill="#5ec2ab" fill-opacity="0.35" stroke="#5ec2ab" stroke-width="1.8"/>
      <line x1="54" y1="118" x2="206" y2="118" stroke="#e99a83" stroke-width="3"/>
      <text x="222" y="98" font-family="system-ui, sans-serif" font-size="12.5" font-weight="800" fill="#f1faf8">Simple Squamous</text>
      <text x="222" y="118" font-family="system-ui, sans-serif" font-size="11" fill="#9db5b2">Rapid diffusion (Alveoli)</text>
      <!-- Simple Cuboidal -->
      <rect x="38" y="172" width="308" height="106" rx="12" fill="#1b323a" stroke="#365a64"/>
      <rect x="64" y="196" width="42" height="42" rx="6" fill="#e5c478" fill-opacity="0.3" stroke="#e5c478" stroke-width="1.8"/>
      <circle cx="85" cy="217" r="9" fill="#e5c478"/>
      <rect x="110" y="196" width="42" height="42" rx="6" fill="#e5c478" fill-opacity="0.3" stroke="#e5c478" stroke-width="1.8"/>
      <circle cx="131" cy="217" r="9" fill="#e5c478"/>
      <line x1="54" y1="244" x2="170" y2="244" stroke="#e99a83" stroke-width="3"/>
      <text x="186" y="216" font-family="system-ui, sans-serif" font-size="12.5" font-weight="800" fill="#f1faf8">Simple Cuboidal</text>
      <text x="186" y="236" font-family="system-ui, sans-serif" font-size="11" fill="#9db5b2">Secretion (Kidney Tubules)</text>
      <!-- Simple Columnar -->
      <rect x="38" y="294" width="308" height="122" rx="12" fill="#1b323a" stroke="#365a64"/>
      <rect x="64" y="314" width="34" height="68" rx="6" fill="#7cc4e8" fill-opacity="0.3" stroke="#7cc4e8" stroke-width="1.8"/>
      <ellipse cx="81" cy="360" rx="7" ry="12" fill="#7cc4e8"/>
      <rect x="102" y="314" width="34" height="68" rx="6" fill="#7cc4e8" fill-opacity="0.3" stroke="#7cc4e8" stroke-width="1.8"/>
      <ellipse cx="119" cy="360" rx="7" ry="12" fill="#7cc4e8"/>
      <line x1="54" y1="388" x2="160" y2="388" stroke="#e99a83" stroke-width="3"/>
      <text x="176" y="346" font-family="system-ui, sans-serif" font-size="12.5" font-weight="800" fill="#f1faf8">Simple Columnar</text>
      <text x="176" y="366" font-family="system-ui, sans-serif" font-size="11" fill="#9db5b2">Absorption (GI Tract)</text>
      <!-- Polarity Note -->
      <rect x="38" y="434" width="308" height="118" rx="12" fill="#1b323a" stroke="#5ec2ab"/>
      <text x="192" y="462" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12.5" font-weight="800" fill="#6fd6be">EPITHELIAL HALLMARKS</text>
      <text x="192" y="488" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" fill="#f1faf8">• Avascular (nourished by underlying CT)</text>
      <text x="192" y="510" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" fill="#f1faf8">• Apical (free) vs. Basal (anchored) surface</text>
      <text x="192" y="532" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" fill="#e99a83">• High mitotic regeneration rate</text>
    `,
    cards: [
      { tag: "1 LAYER", heading: "Simple Epithelia", line1: "Single cell layer specialized for filtration,", line2: "gas exchange, absorption, and secretion.", footer: "Alveoli, capillaries, kidney tubules, GI tract", accent: "#5ec2ab" },
      { tag: "2+ LAYERS", heading: "Stratified Squamous", line1: "Multiple stacked layers built to resist", line2: "mechanical abrasion in high-friction zones.", footer: "Keratinized epidermis; nonkeratinized esophagus", accent: "#e99a83" },
      { tag: "AIRWAY", heading: "Pseudostratified Columnar", line1: "Single layer of cells of varying heights;", line2: "cilia + goblet cells propel mucus escalator.", footer: "Lines trachea and upper respiratory tract", accent: "#7cc4e8" },
      { tag: "STRETCH", heading: "Transitional Epithelium", line1: "Dome-shaped umbrella cells flatten as", line2: "hollow urinary organs distend with urine.", footer: "Lines ureters, urinary bladder & urethra", accent: "#e5c478" },
      { tag: "GLANDS", heading: "Endocrine vs. Exocrine Glands", line1: "Endocrine (ductless) secretes hormones into blood;", line2: "Exocrine secretes onto surfaces via ducts.", footer: "Merocrine (exocytosis) vs. Holocrine (cell rupture)", accent: "#5ec2ab" },
      { tag: "JUNCTIONS", heading: "Tight, Desmosome & Gap", line1: "Tight junctions seal; Desmosomes anchor", line2: "against tension; Gap junctions pass ions.", footer: "Hemidesmosomes anchor basal cells to lamina", accent: "#e99a83" },
    ],
  },
  {
    file: "ch4-fig-2.svg",
    chapterLabel: "CHAPTER 04",
    title: "Connective, Muscle & Nervous Tissue Histology",
    subtitle: "Extracellular matrix (ground substance + collagen/elastic/reticular fibers), contractile tissues, and neurons",
    illustrationSvg: `
      <text x="192" y="34" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#e5c478" letter-spacing="0.08em">CONNECTIVE MATRIX &amp; FIBERS</text>
      <rect x="38" y="62" width="308" height="190" rx="14" fill="#1b323a" stroke="#e5c478" stroke-width="1.8"/>
      <!-- Collagen & Elastic Fibers -->
      <path d="M55,95 Q190,120 325,90" fill="none" stroke="#f1faf8" stroke-width="6" stroke-opacity="0.5"/>
      <path d="M55,155 Q190,130 325,165" fill="none" stroke="#f1faf8" stroke-width="6" stroke-opacity="0.5"/>
      <path d="M70,78 L310,220" fill="none" stroke="#e5c478" stroke-width="2" stroke-dasharray="6,4"/>
      <path d="M310,78 L70,220" fill="none" stroke="#5ec2ab" stroke-width="2"/>
      <circle cx="140" cy="135" r="14" fill="#e99a83"/>
      <circle cx="245" cy="180" r="14" fill="#7cc4e8"/>
      <text x="192" y="236" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" font-weight="700" fill="#e5c478">ECM = Ground Substance + 3 Fiber Types</text>
      <!-- Cell Lineage Table -->
      <rect x="38" y="274" width="308" height="282" rx="14" fill="#1b323a" stroke="#365a64"/>
      <text x="192" y="304" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#6fd6be">CONNECTIVE TISSUE CELLS</text>
      <text x="60" y="340" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#f1faf8">• Fibroblasts →</text>
      <text x="180" y="340" font-family="system-ui, sans-serif" font-size="12" fill="#c3d9d5">Connective Tissue Proper</text>
      <text x="60" y="376" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#7cc4e8">• Chondroblasts →</text>
      <text x="180" y="376" font-family="system-ui, sans-serif" font-size="12" fill="#c3d9d5">Hyaline, Elastic, Fibrocartilage</text>
      <text x="60" y="412" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#e5c478">• Osteoblasts →</text>
      <text x="180" y="412" font-family="system-ui, sans-serif" font-size="12" fill="#c3d9d5">Calcified Osseous Tissue</text>
      <text x="60" y="448" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#e99a83">• Hematopoietic →</text>
      <text x="180" y="448" font-family="system-ui, sans-serif" font-size="12" fill="#c3d9d5">Blood Cells in Plasma ECM</text>
      <line x1="58" y1="474" x2="326" y2="474" stroke="#2c4a52"/>
      <text x="192" y="502" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" font-weight="700" fill="#e99a83">-blast = actively secreting matrix</text>
      <text x="192" y="526" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" font-weight="700" fill="#6fd6be">-cyte = mature cell maintaining matrix</text>
    `,
    cards: [
      { tag: "ECM MATRIX", heading: "Ground Substance & 3 Fibers", line1: "Collagen (tensile strength), Elastic (recoil),", line2: "and Reticular (delicate stroma meshwork).", footer: "Derived from embryonic mesenchyme", accent: "#e5c478" },
      { tag: "CT PROPER", heading: "Loose vs. Dense Connective", line1: "Areolar, Adipose & Reticular (loose);", line2: "Dense Regular (tendons/ligaments) & Irregular.", footer: "Tendons = muscle-to-bone; Ligaments = bone-to-bone", accent: "#5ec2ab" },
      { tag: "CARTILAGE", heading: "Hyaline, Elastic & Fibrocartilage", line1: "Avascular matrix of chondroitin sulfate;", line2: "chondrocytes reside in cavities called lacunae.", footer: "Fibrocartilage resists compression in discs/menisci", accent: "#7cc4e8" },
      { tag: "BONE & BLOOD", heading: "Osseous Tissue & Fluid Blood", line1: "Bone is vascularized calcified collagen;", line2: "Blood carries erythrocytes/leukocytes in plasma.", footer: "Atypical connective tissues", accent: "#e99a83" },
      { tag: "CONTRACTILE", heading: "Skeletal, Cardiac & Smooth", line1: "Skeletal (striated, voluntary, multinucleate);", line2: "Cardiac (striated, intercalated discs, involuntary).", footer: "Smooth = non-striated visceral walls", accent: "#5ec2ab" },
      { tag: "REPAIR", heading: "Regeneration vs. Fibrosis", line1: "Epithelia & bone regenerate readily;", line2: "cardiac muscle & CNS neurons heal by scar.", footer: "Inflammation → Organization → Regeneration", accent: "#e5c478" },
    ],
  },
  {
    file: "ch5-fig-1.svg",
    chapterLabel: "CHAPTER 05",
    title: "Integumentary System: Epidermal Strata & Dermis",
    subtitle: "Superficial-to-deep epidermal layers (C-L-G-S-B), papillary vs. reticular dermis, and skin appendages",
    illustrationSvg: `
      <text x="192" y="34" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#e99a83" letter-spacing="0.08em">EPIDERMIS &amp; DERMIS STRATA</text>
      <!-- 5 Strata Stack -->
      <rect x="42" y="60" width="300" height="44" rx="8" fill="#e99a83" fill-opacity="0.32" stroke="#e99a83"/>
      <text x="192" y="87" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#fff">1. Stratum Corneum (20–30 dead layers)</text>
      <rect x="42" y="110" width="300" height="36" rx="8" fill="#7cc4e8" fill-opacity="0.28" stroke="#7cc4e8"/>
      <text x="192" y="133" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#fff">2. Stratum Lucidum (Thick skin ONLY)</text>
      <rect x="42" y="152" width="300" height="40" rx="8" fill="#e5c478" fill-opacity="0.26" stroke="#e5c478"/>
      <text x="192" y="177" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12.5" font-weight="800" fill="#fff">3. Stratum Granulosum (Keratohyalin)</text>
      <rect x="42" y="198" width="300" height="40" rx="8" fill="#5ec2ab" fill-opacity="0.24" stroke="#5ec2ab"/>
      <text x="192" y="223" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12.5" font-weight="800" fill="#fff">4. Stratum Spinosum (Desmosomes)</text>
      <rect x="42" y="244" width="300" height="46" rx="8" fill="#5ec2ab" fill-opacity="0.4" stroke="#5ec2ab" stroke-width="2"/>
      <text x="192" y="272" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#fff">5. Stratum Basale (Mitotic + Melanocytes)</text>
      <!-- Dermis -->
      <rect x="42" y="302" width="300" height="156" rx="12" fill="#1d353d" stroke="#e99a83" stroke-width="2"/>
      <text x="192" y="334" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#e99a83">VASCULAR DERMIS</text>
      <text x="192" y="362" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" fill="#f1faf8">• Papillary (20%): Areolar CT + Dermal Papillae</text>
      <text x="192" y="388" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" fill="#f1faf8">• Reticular (80%): Dense Irregular CT + Cleavage</text>
      <text x="192" y="416" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" fill="#6fd6be">Houses blood vessels, nerve endings &amp; glands</text>
      <!-- Hypodermis -->
      <rect x="42" y="470" width="300" height="82" rx="12" fill="#e5c478" fill-opacity="0.18" stroke="#e5c478"/>
      <text x="192" y="502" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#e5c478">Hypodermis (Subcutaneous Fascia)</text>
      <text x="192" y="526" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" fill="#d8e8e4">Adipose insulation &amp; shock absorption</text>
    `,
    cards: [
      { tag: "MNEMONIC", heading: "Epidermal Strata (C-L-G-S-B)", line1: "Come Let’s Get Sun Burned:", line2: "Corneum → Lucidum → Granulosum → Spinosum → Basale.", footer: "Lucidum is present ONLY in thick skin (palms/soles)", accent: "#e99a83" },
      { tag: "CELL TYPES", heading: "Keratinocytes & Melanocytes", line1: "Keratinocytes produce tough fibrous keratin;", line2: "Melanocytes make UV-shielding melanin.", footer: "Dendritic (immune) & Tactile/Merkel (touch) cells", accent: "#5ec2ab" },
      { tag: "DERMIS 20%", heading: "Papillary Layer", line1: "Superficial areolar CT with capillary loops,", line2: "Meissner corpuscles & friction-ridge fingerprints.", footer: "Nourishes the avascular epidermis above", accent: "#e5c478" },
      { tag: "DERMIS 80%", heading: "Reticular Layer", line1: "Deep dense irregular CT packed with thick", line2: "collagen bundles along tension (cleavage) lines.", footer: "Lamellar (Pacinian) corpuscles sense deep pressure", accent: "#7cc4e8" },
      { tag: "SWEAT", heading: "Eccrine vs. Apocrine Glands", line1: "Eccrine (merocrine) secretes hypotonic sweat", line2: "for cooling; Apocrine opens into hair follicles.", footer: "Eccrine covers entire body (palms, soles, forehead)", accent: "#5ec2ab" },
      { tag: "OIL & HAIR", heading: "Sebaceous Glands & Arrector Pili", line1: "Holocrine sebaceous glands secrete sebum;", line2: "smooth muscle arrector pili raises hair.", footer: "Sebum softens skin and inhibits bacterial growth", accent: "#e99a83" },
    ],
  },
  {
    file: "ch5-fig-2.svg",
    chapterLabel: "CHAPTER 05",
    title: "Skin Homeostasis, Burn Depth Classification & Skin Cancer",
    subtitle: "Cutaneous thermoregulation, Vitamin D3 synthesis, 1st/2nd/3rd-degree burns, and ABCD melanoma criteria",
    illustrationSvg: `
      <text x="192" y="34" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#e5c478" letter-spacing="0.08em">BURN DEPTH &amp; ABCD RULE</text>
      <!-- Burn Depth Bars -->
      <rect x="38" y="64" width="308" height="82" rx="12" fill="#1b323a" stroke="#5ec2ab"/>
      <text x="58" y="92" font-family="system-ui, sans-serif" font-size="13.5" font-weight="800" fill="#6fd6be">1st-Degree Burn (Epidermis Only)</text>
      <text x="58" y="116" font-family="system-ui, sans-serif" font-size="11.5" fill="#d3ece7">Redness, localized edema, pain (e.g., sunburn)</text>
      <rect x="38" y="158" width="308" height="86" rx="12" fill="#1b323a" stroke="#e5c478"/>
      <text x="58" y="186" font-family="system-ui, sans-serif" font-size="13.5" font-weight="800" fill="#e5c478">2nd-Degree Burn (Partial-Thickness)</text>
      <text x="58" y="210" font-family="system-ui, sans-serif" font-size="11.5" fill="#d3ece7">Epidermis + upper Dermis; characteristic BLISTERS</text>
      <rect x="38" y="256" width="308" height="92" rx="12" fill="#1b323a" stroke="#e99a83" stroke-width="2"/>
      <text x="58" y="284" font-family="system-ui, sans-serif" font-size="13.5" font-weight="800" fill="#e99a83">3rd-Degree Burn (Full-Thickness)</text>
      <text x="58" y="308" font-family="system-ui, sans-serif" font-size="11.5" fill="#f1faf8">Destroys full skin thickness &amp; nerve endings</text>
      <text x="58" y="328" font-family="system-ui, sans-serif" font-size="11" fill="#fbd0bd">Gray/white or charred; requires skin grafting</text>
      <!-- ABCD Box -->
      <rect x="38" y="366" width="308" height="190" rx="14" fill="#1b323a" stroke="#7cc4e8"/>
      <text x="192" y="396" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#7cc4e8">MELANOMA ABCD(E) SCREENING</text>
      <text x="64" y="426" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#f1faf8">A — Asymmetry (two sides do not match)</text>
      <text x="64" y="454" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#f1faf8">B — Border irregularity (notched/indented)</text>
      <text x="64" y="482" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#f1faf8">C — Color variation (black, brown, tan, blue)</text>
      <text x="64" y="510" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#f1faf8">D — Diameter &gt; 6 mm (pencil eraser size)</text>
      <text x="64" y="538" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#6fd6be">E — Evolving size, shape, or elevation</text>
    `,
    cards: [
      { tag: "COOLING", heading: "Cutaneous Thermoregulation", line1: "Heat: Dermal vasodilation + eccrine sweating;", line2: "Cold: Dermal vasoconstriction conserves core heat.", footer: "Controlled by the hypothalamus", accent: "#5ec2ab" },
      { tag: "VITAMIN D", heading: "Cholecalciferol Synthesis", line1: "UV light converts epidermal steroid precursor", line2: "to Vitamin D3 → active calcitriol in kidney.", footer: "Required for intestinal Ca²⁺ absorption", accent: "#e5c478" },
      { tag: "CANCER 01", heading: "Basal Cell Carcinoma", line1: "Proliferation of stratum basale cells;", line2: "most common and least malignant skin cancer.", footer: "Slow-growing dome nodules on sun-exposed face", accent: "#7cc4e8" },
      { tag: "CANCER 02", heading: "Squamous Cell & Melanoma", line1: "SCC arises from stratum spinosum keratinocytes;", line2: "Melanoma arises from melanocytes (metastasizes).", footer: "Early surgical excision is critical for melanoma", accent: "#e99a83" },
      { tag: "TRIAGE", heading: "Rule of Nines & Burn Threats", line1: "Divides body surface into 11 × 9% regions;", line2: "Immediate #1 threat = dehydration & shock.", footer: "Secondary threat = systemic bacterial infection", accent: "#e5c478" },
      { tag: "BARRIER", heading: "Acid Mantle & Defensins", line1: "pH 4–6 acid mantle retards bacterial growth;", line2: "glycolipids block water loss across epidermis.", footer: "Chemical, physical, and biological barrier", accent: "#5ec2ab" },
    ],
  },
  {
    file: "ch10-fig-1.svg",
    chapterLabel: "CHAPTER 10",
    title: "Muscle Lever Mechanics, Fascicle Patterns & Functional Roles",
    subtitle: "Origin vs. Insertion, Agonist/Antagonist/Synergist/Fixator coordination, and 1st-, 2nd-, and 3rd-class levers",
    illustrationSvg: `
      <text x="192" y="34" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#6fd6be" letter-spacing="0.08em">BIOMECHANICAL LEVER CLASSES</text>
      <!-- 1st Class Lever -->
      <rect x="38" y="64" width="308" height="128" rx="12" fill="#1b323a" stroke="#5ec2ab"/>
      <text x="192" y="90" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#6fd6be">1st-Class Lever (E — F — L)</text>
      <line x1="74" y1="138" x2="310" y2="138" stroke="#f1faf8" stroke-width="3"/>
      <polygon points="192,138 178,162 206,162" fill="#5ec2ab"/>
      <text x="90" y="126" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#e5c478">Effort ↓</text>
      <text x="192" y="178" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" font-weight="700" fill="#6fd6be">Fulcrum in middle (Atlanto-occipital head nod)</text>
      <text x="285" y="126" text-anchor="end" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#e99a83">↓ Load</text>
      <!-- 2nd Class Lever -->
      <rect x="38" y="206" width="308" height="128" rx="12" fill="#1b323a" stroke="#e5c478"/>
      <text x="192" y="232" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#e5c478">2nd-Class Lever (F — L — E)</text>
      <line x1="74" y1="282" x2="310" y2="282" stroke="#f1faf8" stroke-width="3"/>
      <polygon points="90,282 76,306 104,306" fill="#e5c478"/>
      <text x="192" y="270" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#e99a83">↓ Load</text>
      <text x="295" y="270" text-anchor="end" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#6fd6be">↑ Effort</text>
      <text x="192" y="320" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" font-weight="700" fill="#e5c478">Load in middle · Power lever (Standing on toes)</text>
      <!-- 3rd Class Lever -->
      <rect x="38" y="348" width="308" height="132" rx="12" fill="#1b323a" stroke="#e99a83"/>
      <text x="192" y="374" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#e99a83">3rd-Class Lever (F — E — L)</text>
      <line x1="74" y1="424" x2="310" y2="424" stroke="#f1faf8" stroke-width="3"/>
      <polygon points="90,424 76,448 104,448" fill="#e99a83"/>
      <text x="180" y="412" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#6fd6be">↑ Effort</text>
      <text x="295" y="412" text-anchor="end" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#e5c478">↓ Load</text>
      <text x="192" y="464" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" font-weight="700" fill="#e99a83">Effort in middle · Speed &amp; Range (Biceps curl)</text>
      <text x="192" y="528" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#f1faf8">Insertion always pulls toward Origin</text>
    `,
    cards: [
      { tag: "ATTACHMENT", heading: "Origin vs. Insertion", line1: "Origin = immovable/proximal bone anchor;", line2: "Insertion = movable/distal bone pulled.", footer: "Muscles only pull; they never push", accent: "#5ec2ab" },
      { tag: "AGONIST", heading: "Prime Mover & Antagonist", line1: "Agonist provides major force for movement;", line2: "Antagonist opposes & regulates that action.", footer: "Biceps brachii (flexor) vs. Triceps (extensor)", accent: "#e99a83" },
      { tag: "STABILIZE", heading: "Synergist & Fixator", line1: "Synergists assist prime mover & stop rotation;", line2: "Fixators immobilize the bone of origin.", footer: "Rhomboids/trapezius fixate the scapula", accent: "#e5c478" },
      { tag: "FASCICLES", heading: "Parallel vs. Pennate Architecture", line1: "Parallel/fusiform = longest range of motion;", line2: "Multipennate (deltoid) = maximum power.", footer: "More fibers packed per unit area = greater force", accent: "#7cc4e8" },
      { tag: "LEVERS", heading: "1st, 2nd & 3rd Class Levers", line1: "Bone = lever, Joint = fulcrum, Muscle = effort.", line2: "2nd class = mechanical advantage; 3rd = speed.", footer: "Most skeletal muscles operate as 3rd-class levers", accent: "#5ec2ab" },
      { tag: "NAMING", heading: "Anatomical Muscle Naming", line1: "Named by location, shape (deltoid), size", line2: "(maximus), fiber direction (rectus/oblique) & heads.", footer: "Sternocleidomastoid = origin (sterno/cleido) + insertion", accent: "#e99a83" },
    ],
  },
  {
    file: "ch10-fig-2.svg",
    chapterLabel: "CHAPTER 10",
    title: "Major Regional Skeletal Muscle Groups & Actions",
    subtitle: "Muscles of mastication, respiration, abdominal wall, shoulder/arm, and lower-limb locomotion",
    illustrationSvg: `
      <text x="192" y="34" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#e5c478" letter-spacing="0.08em">REGIONAL MUSCLE COMPARTMENTS</text>
      <rect x="38" y="64" width="308" height="110" rx="12" fill="#1b323a" stroke="#5ec2ab"/>
      <text x="192" y="92" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#6fd6be">HEAD, NECK &amp; THORAX</text>
      <text x="192" y="118" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" fill="#f1faf8">• Masseter &amp; Temporalis → Elevate mandible</text>
      <text x="192" y="140" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" fill="#f1faf8">• Diaphragm &amp; External Intercostals → Inspiration</text>
      <rect x="38" y="188" width="308" height="114" rx="12" fill="#1b323a" stroke="#e5c478"/>
      <text x="192" y="216" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#e5c478">SHOULDER &amp; UPPER LIMB</text>
      <text x="192" y="242" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" fill="#f1faf8">• Rotator Cuff (SITS): Supraspinatus, Infraspinatus,</text>
      <text x="192" y="262" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" fill="#f1faf8">  Teres minor, Subscapularis</text>
      <text x="192" y="284" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" fill="#6fd6be">• Brachialis + Biceps flex; Triceps extends elbow</text>
      <rect x="38" y="316" width="308" height="122" rx="12" fill="#1b323a" stroke="#e99a83"/>
      <text x="192" y="344" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#e99a83">THIGH &amp; LEG COMPARTMENTS</text>
      <text x="192" y="370" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" fill="#f1faf8">• Quadriceps (4): Extend knee (Rectus femoris +</text>
      <text x="192" y="390" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" fill="#f1faf8">  Vastus lateralis, medialis, intermedius)</text>
      <text x="192" y="414" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" fill="#fbd0bd">• Hamstrings (3): Extend hip &amp; flex knee</text>
      <rect x="38" y="452" width="308" height="104" rx="12" fill="#1b323a" stroke="#7cc4e8"/>
      <text x="192" y="482" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#7cc4e8">ANKLE DORSIFLEXION vs. PLANTAR</text>
      <text x="192" y="508" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" fill="#f1faf8">• Tibialis anterior → Dorsiflexion &amp; inversion</text>
      <text x="192" y="530" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" fill="#f1faf8">• Gastrocnemius &amp; Soleus → Plantar flexion</text>
    `,
    cards: [
      { tag: "MASTICATION", heading: "Masseter & Temporalis", line1: "Prime movers of jaw closure (mandibular", line2: "elevation); innervated by CN V (Trigeminal).", footer: "Buccinator compresses cheeks; CN VII does facial expression", accent: "#5ec2ab" },
      { tag: "BREATHING", heading: "Diaphragm & Intercostals", line1: "Diaphragm flattens on contraction (Phrenic C3–C5)", line2: "to increase thoracic volume for inspiration.", footer: "Internal intercostals assist forced expiration", accent: "#7cc4e8" },
      { tag: "CORE WALL", heading: "Four Abdominal Wall Pairs", line1: "Rectus abdominis, External oblique,", line2: "Internal oblique, and Transversus abdominis.", footer: "Flex vertebral column and compress abdominal viscera", accent: "#e5c478" },
      { tag: "SHOULDER", heading: "Deltoid & Rotator Cuff (SITS)", line1: "Deltoid is prime mover of arm abduction;", line2: "SITS tendons reinforce shallow glenoid cavity.", footer: "Pectoralis major & Latissimus dorsi adduct humerus", accent: "#e99a83" },
      { tag: "ANTERIOR THIGH", heading: "Iliopsoas & Quadriceps Femoris", line1: "Iliopsoas is prime mover of hip flexion;", line2: "all 4 Quadriceps heads extend the knee.", footer: "Insert via patellar ligament onto tibial tuberosity", accent: "#5ec2ab" },
      { tag: "POSTERIOR", heading: "Gluteus, Hamstrings & Calf", line1: "Gluteus maximus extends hip; Biceps femoris,", line2: "Semitendinosus & Semimembranosus flex knee.", footer: "Gastrocnemius + Soleus insert via calcaneal tendon", accent: "#e99a83" },
    ],
  },
  {
    file: "ch11-fig-1.svg",
    chapterLabel: "CHAPTER 11",
    title: "Action Potential Waveform & Voltage-Gated Ion Channels",
    subtitle: "Resting membrane potential (-70 mV), threshold (-55 mV), Na⁺ depolarization (+30 mV), and K⁺ repolarization",
    illustrationSvg: `
      <text x="192" y="34" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#6fd6be" letter-spacing="0.08em">ACTION POTENTIAL GRAPH (mV vs ms)</text>
      <!-- Axes -->
      <line x1="64" y1="80" x2="64" y2="410" stroke="#5b7c85" stroke-width="2"/>
      <line x1="64" y1="360" x2="356" y2="360" stroke="#5b7c85" stroke-width="2"/>
      <!-- Y Labels -->
      <text x="54" y="114" text-anchor="end" font-family="system-ui, sans-serif" font-size="11.5" font-weight="800" fill="#e99a83">+30 mV</text>
      <text x="54" y="210" text-anchor="end" font-family="system-ui, sans-serif" font-size="11" fill="#9db5b2">0 mV</text>
      <text x="54" y="295" text-anchor="end" font-family="system-ui, sans-serif" font-size="11.5" font-weight="800" fill="#e5c478">-55 mV</text>
      <text x="54" y="340" text-anchor="end" font-family="system-ui, sans-serif" font-size="11.5" font-weight="800" fill="#6fd6be">-70 mV</text>
      <line x1="64" y1="291" x2="350" y2="291" stroke="#e5c478" stroke-dasharray="4,4"/>
      <text x="348" y="283" text-anchor="end" font-family="system-ui, sans-serif" font-size="10.5" font-weight="700" fill="#e5c478">Threshold</text>
      <!-- AP Curve -->
      <path d="M64,336 L118,336 Q135,336 146,291 L182,108 Q192,90 202,108 L244,378 Q262,402 286,356 L346,336" fill="none" stroke="#5ec2ab" stroke-width="4"/>
      <!-- Phase Callouts -->
      <text x="134" y="195" font-family="system-ui, sans-serif" font-size="11.5" font-weight="800" fill="#e99a83">1. Na⁺ Influx</text>
      <text x="234" y="235" font-family="system-ui, sans-serif" font-size="11.5" font-weight="800" fill="#7cc4e8">2. K⁺ Efflux</text>
      <text x="262" y="416" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#e5c478">3. Hyperpolarization</text>
      <!-- Summary Box -->
      <rect x="38" y="444" width="308" height="114" rx="12" fill="#1b323a" stroke="#365a64"/>
      <text x="192" y="472" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12.5" font-weight="800" fill="#f1faf8">ALL-OR-NONE PRINCIPLE</text>
      <text x="192" y="498" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" fill="#6fd6be">Once -55 mV threshold is reached at the</text>
      <text x="192" y="518" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" fill="#6fd6be">axon hillock, AP fires at full amplitude.</text>
      <text x="192" y="542" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#e99a83">Stimulus intensity is coded by AP frequency</text>
    `,
    cards: [
      { tag: "-70 mV", heading: "Resting Membrane Potential", line1: "Maintained by K⁺ leak channels (higher K⁺", line2: "permeability) and the 3 Na⁺ / 2 K⁺ ATPase pump.", footer: "Inside of axon is negative relative to outside", accent: "#5ec2ab" },
      { tag: "LOCAL", heading: "Graded Potentials", line1: "Short-distance depolarizations or hyperpolarizations", line2: "on dendrites/soma that decay with distance.", footer: "Must summate to -55 mV at axon hillock", accent: "#e5c478" },
      { tag: "UPSTROKE", heading: "Depolarization Phase (+30 mV)", line1: "Voltage-gated Na⁺ channels open rapidly;", line2: "Na⁺ rushes INTO the cell down its gradient.", footer: "Reverses membrane polarity from -55 to +30 mV", accent: "#e99a83" },
      { tag: "DOWNSTROKE", heading: "Repolarization & Hyperpolarization", line1: "Na⁺ channels inactivate; voltage-gated K⁺", line2: "channels open so K⁺ exits the neuron.", footer: "Slow K⁺ gate closure causes after-hyperpolarization", accent: "#7cc4e8" },
      { tag: "REFRACTORY", heading: "Absolute vs. Relative Refractory", line1: "Absolute: Na⁺ channels inactivated (no AP possible);", line2: "Relative: requires suprathreshold stimulus.", footer: "Ensures one-way orthodromic propagation", accent: "#5ec2ab" },
      { tag: "MYELIN", heading: "Saltatory Conduction", line1: "Action potentials jump node-to-node across", line2: "Nodes of Ranvier in myelinated axons.", footer: "Large-diameter myelinated (Group A) = fastest", accent: "#e5c478" },
    ],
  },
  {
    file: "ch11-fig-2.svg",
    chapterLabel: "CHAPTER 11",
    title: "Neuron Architecture, Neuroglia & Chemical Synapse",
    subtitle: "CNS vs. PNS glial support cells, myelin sheaths, Ca²⁺-triggered synaptic transmission, and EPSP vs. IPSP",
    illustrationSvg: `
      <text x="192" y="34" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#e5c478" letter-spacing="0.08em">MULTIPOLAR NEURON &amp; SYNAPSE</text>
      <!-- Neuron Soma & Axon -->
      <circle cx="96" cy="128" r="36" fill="#5ec2ab" fill-opacity="0.28" stroke="#5ec2ab" stroke-width="2.2"/>
      <circle cx="96" cy="128" r="12" fill="#5ec2ab"/>
      <text x="96" y="182" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" font-weight="700" fill="#6fd6be">Soma + Dendrites</text>
      <!-- Axon with Myelin -->
      <line x1="132" y1="128" x2="328" y2="128" stroke="#f1faf8" stroke-width="4"/>
      <rect x="148" y="114" width="42" height="28" rx="8" fill="#e5c478" stroke="#fff"/>
      <rect x="204" y="114" width="42" height="28" rx="8" fill="#e5c478" stroke="#fff"/>
      <rect x="260" y="114" width="42" height="28" rx="8" fill="#e5c478" stroke="#fff"/>
      <text x="225" y="164" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" font-weight="700" fill="#e5c478">Myelin Sheath + Nodes of Ranvier</text>
      <!-- Chemical Synapse Steps -->
      <rect x="38" y="206" width="308" height="348" rx="14" fill="#1b323a" stroke="#365a64"/>
      <text x="192" y="236" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#f1faf8">CHEMICAL SYNAPSE (6 STEPS)</text>
      <text x="58" y="268" font-family="system-ui, sans-serif" font-size="11.5" fill="#6fd6be">1. Action potential arrives at axon terminal</text>
      <text x="58" y="298" font-family="system-ui, sans-serif" font-size="11.5" fill="#e5c478">2. Voltage-gated Ca²⁺ channels open (Ca²⁺ enters)</text>
      <text x="58" y="328" font-family="system-ui, sans-serif" font-size="11.5" fill="#e99a83">3. Ca²⁺ triggers synaptic vesicle exocytosis</text>
      <text x="58" y="358" font-family="system-ui, sans-serif" font-size="11.5" fill="#7cc4e8">4. Neurotransmitter diffuses across cleft</text>
      <text x="58" y="388" font-family="system-ui, sans-serif" font-size="11.5" fill="#f1faf8">5. Binds postsynaptic ligand-gated channels</text>
      <text x="58" y="418" font-family="system-ui, sans-serif" font-size="11.5" fill="#6fd6be">6. Signal terminated by reuptake or enzymes</text>
      <line x1="58" y1="442" x2="326" y2="442" stroke="#2c4a52"/>
      <text x="192" y="472" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#5ec2ab">EPSP = Na⁺ influx (Depolarizes toward -55 mV)</text>
      <text x="192" y="498" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#e99a83">IPSP = K⁺ efflux or Cl⁻ influx (Hyperpolarizes)</text>
    `,
    cards: [
      { tag: "CNS GLIA", heading: "Astrocytes, Microglia, Ependymal", line1: "Astrocytes support blood-brain barrier;", line2: "Microglia phagocytize; Ependymal circulate CSF.", footer: "Oligodendrocytes myelinate multiple CNS axons", accent: "#5ec2ab" },
      { tag: "PNS GLIA", heading: "Schwann & Satellite Cells", line1: "Schwann cells form myelin sheaths around", line2: "single PNS axons & guide regeneration.", footer: "Satellite cells cushion neuron somas in ganglia", accent: "#e5c478" },
      { tag: "POLARITY", heading: "Dendrites vs. Axon Hillock", line1: "Dendrites receive graded inputs (receptive);", line2: "Axon hillock triggers the action potential.", footer: "Multipolar (motor/interneuron) vs. Unipolar (sensory)", accent: "#7cc4e8" },
      { tag: "SYNAPSE", heading: "Presynaptic Ca²⁺ Trigger", line1: "Depolarization opens voltage-gated Ca²⁺ channels;", line2: "Ca²⁺ influx causes SNARE vesicle fusion.", footer: "Converts electrical signal into chemical signal", accent: "#e99a83" },
      { tag: "SUMMATION", heading: "Temporal & Spatial Summation", line1: "EPSPs (depolarizing) and IPSPs (hyperpolarizing)", line2: "sum at the axon hillock to decide firing.", footer: "Glutamate = major CNS excitatory; GABA/Glycine = inhibitory", accent: "#5ec2ab" },
      { tag: "CLEARANCE", heading: "Neurotransmitter Termination", line1: "Cleared within milliseconds via astrocyte/presynaptic", line2: "reuptake, enzymatic degradation (AChE), or diffusion.", footer: "Prevents continuous postsynaptic stimulation", accent: "#e5c478" },
    ],
  },
  {
    file: "ch12-fig-1.svg",
    chapterLabel: "CHAPTER 12",
    title: "Central Nervous System: Cerebral Lobes, Diencephalon & Brainstem",
    subtitle: "Motor/sensory cortical mapping, thalamus, hypothalamus, midbrain-pons-medulla, and cerebellum",
    illustrationSvg: `
      <text x="192" y="34" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#6fd6be" letter-spacing="0.08em">BRAIN REGIONS &amp; LOBES</text>
      <!-- Cerebral Lobes Diagram -->
      <path d="M58,195 C58,105 145,72 215,78 L215,205 L58,205 Z" fill="#e99a83" fill-opacity="0.28" stroke="#e99a83" stroke-width="2.2"/>
      <text x="135" y="148" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#f1faf8">Frontal Lobe</text>
      <text x="135" y="168" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#fbd0bd">Motor (Precentral) + Broca</text>
      <path d="M215,78 C285,82 332,120 332,185 L215,205 Z" fill="#5ec2ab" fill-opacity="0.28" stroke="#5ec2ab" stroke-width="2.2"/>
      <text x="272" y="146" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13.5" font-weight="800" fill="#f1faf8">Parietal</text>
      <text x="272" y="166" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10.5" fill="#d3ece7">Somatosensory</text>
      <path d="M98,205 L248,205 L248,276 C165,282 108,262 98,205 Z" fill="#e5c478" fill-opacity="0.28" stroke="#e5c478" stroke-width="2.2"/>
      <text x="176" y="242" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13.5" font-weight="800" fill="#f1faf8">Temporal Lobe</text>
      <text x="176" y="260" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10.5" fill="#f6e3b4">Auditory + Wernicke</text>
      <path d="M248,195 L336,185 C344,230 322,268 248,272 Z" fill="#7cc4e8" fill-opacity="0.28" stroke="#7cc4e8" stroke-width="2.2"/>
      <text x="292" y="232" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#f1faf8">Occipital</text>
      <text x="292" y="250" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10.5" fill="#d5eefb">Visual Cortex</text>
      <!-- Cerebellum & Brainstem -->
      <ellipse cx="282" cy="332" rx="54" ry="38" fill="#5ec2ab" fill-opacity="0.22" stroke="#5ec2ab" stroke-width="2"/>
      <text x="282" y="336" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12.5" font-weight="800" fill="#6fd6be">Cerebellum</text>
      <rect x="166" y="286" width="54" height="148" rx="14" fill="#23424a" stroke="#e5c478" stroke-width="2"/>
      <text x="193" y="316" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#e5c478">Midbrain</text>
      <text x="193" y="358" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#e5c478">Pons</text>
      <text x="193" y="402" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#e99a83">Medulla</text>
      <text x="192" y="482" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#f1faf8">Central Sulcus divides Precentral (Motor)</text>
      <text x="192" y="504" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#f1faf8">from Postcentral (Somatosensory) Gyrus</text>
    `,
    cards: [
      { tag: "CORTEX", heading: "Motor vs. Somatosensory Gyri", line1: "Precentral gyrus (Frontal) = primary motor;", line2: "Postcentral gyrus (Parietal) = somatosensory.", footer: "Contralateral control; mapped by homunculus", accent: "#e99a83" },
      { tag: "LANGUAGE", heading: "Broca’s vs. Wernicke’s Areas", line1: "Broca’s (left frontal) = motor speech production;", line2: "Wernicke’s (temporal-parietal) = comprehension.", footer: "Corpus callosum commissure connects R & L hemispheres", accent: "#5ec2ab" },
      { tag: "RELAY", heading: "Thalamus (Diencephalon)", line1: "The 'gateway to the cerebral cortex' that", line2: "sorts, edits & relays afferent sensory impulses.", footer: "Every sense except olfaction (smell) relays here", accent: "#7cc4e8" },
      { tag: "MASTER", heading: "Hypothalamus", line1: "Visceral control center: ANS, body temp, hunger,", line2: "thirst, circadian rhythms & pituitary hormones.", footer: "Epithalamus (pineal gland) secretes melatonin", accent: "#e5c478" },
      { tag: "AUTONOMIC", heading: "Brainstem (Midbrain, Pons, Medulla)", line1: "Medulla houses vital cardiac, vasomotor &", line2: "respiratory centers + pyramidal decussation.", footer: "Crossover of motor tracts explains contralateral control", accent: "#e99a83" },
      { tag: "COORDINATION", heading: "Cerebellum & Basal Nuclei", line1: "Cerebellum compares motor plan vs. proprioception", line2: "for smooth balance; Basal nuclei filter movement.", footer: "Arbor vitae = cerebellar white matter tree", accent: "#5ec2ab" },
    ],
  },
  {
    file: "ch12-fig-2.svg",
    chapterLabel: "CHAPTER 12",
    title: "Meninges, Cerebrospinal Fluid (CSF) & Spinal Cord Anatomy",
    subtitle: "Dura-Arachnoid-Pia mater protection, choroid plexus CSF circulation, and dorsal sensory vs. ventral motor roots",
    illustrationSvg: `
      <text x="192" y="34" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#e5c478" letter-spacing="0.08em">SPINAL CORD CROSS-SECTION</text>
      <!-- Outer White Matter Oval -->
      <ellipse cx="192" cy="195" rx="132" ry="98" fill="#23424a" stroke="#7cc4e8" stroke-width="3"/>
      <!-- Butterfly Gray Matter -->
      <path d="M135,132 C160,155 170,175 192,175 C214,175 224,155 249,132 C238,175 238,215 254,255 C224,230 214,215 192,215 C170,215 160,230 130,255 C146,215 146,175 135,132 Z" fill="#e99a83" fill-opacity="0.45" stroke="#e99a83" stroke-width="2.2"/>
      <circle cx="192" cy="195" r="7" fill="#111f24" stroke="#5ec2ab" stroke-width="2"/>
      <!-- Root Callouts -->
      <text x="192" y="80" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#6fd6be">Dorsal Horn &amp; Dorsal Root = SENSORY (Afferent)</text>
      <text x="192" y="320" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#e99a83">Ventral Horn &amp; Ventral Root = MOTOR (Efferent)</text>
      <!-- Meninges Stack -->
      <rect x="38" y="352" width="308" height="202" rx="14" fill="#1b323a" stroke="#365a64"/>
      <text x="192" y="382" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#f1faf8">MENINGEAL LAYERS (OUTER → INNER)</text>
      <text x="58" y="414" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#e5c478">1. Dura Mater — Tough leathery outer coat</text>
      <text x="58" y="446" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#7cc4e8">2. Arachnoid Mater — Subarachnoid CSF space</text>
      <text x="58" y="478" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#6fd6be">3. Pia Mater — Delicate vascular inner layer</text>
      <line x1="58" y1="498" x2="326" y2="498" stroke="#2c4a52"/>
      <text x="192" y="524" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" font-weight="700" fill="#e99a83">Lumbar Puncture safe below L1/L2 (Cauda Equina)</text>
    `,
    cards: [
      { tag: "MENINGES", heading: "Dura, Arachnoid & Pia Mater", line1: "Dura (tough outer), Arachnoid (web-like middle),", line2: "and Pia (clings tightly to brain/cord surface).", footer: "Subarachnoid space is filled with liquid CSF", accent: "#e5c478" },
      { tag: "CSF FLOW", heading: "Choroid Plexuses & Ventricles", line1: "Choroid plexuses filter blood to make CSF;", line2: "drains into dural sinuses via arachnoid villi.", footer: "Provides liquid buoyancy cushion for the brain", accent: "#7cc4e8" },
      { tag: "BARRIER", heading: "Blood-Brain Barrier (BBB)", line1: "Continuous endothelial tight junctions +", line2: "astrocyte feet block bloodborne toxins.", footer: "Allows glucose, O₂ & lipid-soluble molecules", accent: "#5ec2ab" },
      { tag: "DORSAL", heading: "Dorsal Root & Ganglion (Sensory)", line1: "Unipolar sensory neuron cell bodies sit in DRG;", line2: "axons enter dorsal horn (afferent input).", footer: "Dorsal = Sensory (SAME: Sensory Afferent)", accent: "#5ec2ab" },
      { tag: "VENTRAL", heading: "Ventral Horn & Root (Motor)", line1: "Somatic motor neuron somas in ventral horn", line2: "send axons out ventral root to skeletal muscle.", footer: "Lateral horn (T1–L2) houses sympathetic neurons", accent: "#e99a83" },
      { tag: "TRACTS", heading: "Ascending vs. Descending Tracts", line1: "Ascending white columns carry sensory up;", line2: "Descending corticospinal tracts carry motor down.", footer: "Conus medullaris ends at L1/L2 in adults", accent: "#e5c478" },
    ],
  },
  {
    file: "ch13-fig-1.svg",
    chapterLabel: "CHAPTER 13",
    title: "Peripheral Nervous System: The 12 Pairs of Cranial Nerves",
    subtitle: "Sensory, motor, and mixed cranial nerves (CN I – CN XII), target organs, and clinical testing",
    illustrationSvg: `
      <text x="192" y="34" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#6fd6be" letter-spacing="0.08em">CRANIAL NERVES (CN I – XII)</text>
      <rect x="34" y="58" width="316" height="498" rx="14" fill="#1b323a" stroke="#365a64"/>
      <text x="54" y="92" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#7cc4e8">I. Olfactory (S) — Smell (Cribriform plate)</text>
      <text x="54" y="128" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#7cc4e8">II. Optic (S) — Vision (Retina → Optic canal)</text>
      <text x="54" y="164" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#e5c478">III. Oculomotor (M) — 4 eye muscles + pupil</text>
      <text x="54" y="200" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#e5c478">IV. Trochlear (M) — Superior oblique muscle</text>
      <text x="54" y="236" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#e99a83">V. Trigeminal (B) — Face sensation + chewing</text>
      <text x="54" y="272" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#e5c478">VI. Abducens (M) — Lateral rectus (abducts eye)</text>
      <text x="54" y="308" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#e99a83">VII. Facial (B) — Facial expression + ant. 2/3 taste</text>
      <text x="54" y="344" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#7cc4e8">VIII. Vestibulocochlear (S) — Hearing &amp; balance</text>
      <text x="54" y="380" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#e99a83">IX. Glossopharyngeal (B) — Swallowing + post. 1/3</text>
      <text x="54" y="416" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#5ec2ab">X. Vagus (B) — Thoracic &amp; abdominal viscera</text>
      <text x="54" y="452" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#e5c478">XI. Accessory (M) — Sternocleidomastoid &amp; Traps</text>
      <text x="54" y="488" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#e5c478">XII. Hypoglossal (M) — Intrinsic/extrinsic tongue</text>
      <text x="192" y="534" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#9db5b2">(S) = Sensory · (M) = Motor · (B) = Both/Mixed</text>
    `,
    cards: [
      { tag: "SPECIAL SENSES", heading: "CN I (Olfactory), II (Optic), VIII", line1: "Purely sensory nerves for smell (I), vision", line2: "(II), and hearing + equilibrium (VIII).", footer: "CN I & II attach to forebrain; III–XII to brainstem", accent: "#7cc4e8" },
      { tag: "EYE MOTION", heading: "CN III, IV & VI (LR6-SO4)", line1: "Abducens (VI) → Lateral rectus; Trochlear (IV)", line2: "→ Superior oblique; Oculomotor (III) → all others.", footer: "CN III also constricts pupil via parasympathetic fibers", accent: "#e5c478" },
      { tag: "FACE & JAW", heading: "CN V (Trigeminal) & VII (Facial)", line1: "CN V: 3 divisions (V1, V2, V3) for face touch &", line2: "chewing; CN VII: facial expression & tears/saliva.", footer: "Bell's palsy = CN VII inflammation / hemifacial paralysis", accent: "#e99a83" },
      { tag: "WANDERER", heading: "CN X (Vagus Nerve)", line1: "Only cranial nerve extending beyond the head/neck", line2: "to regulate heart rate, lungs, and GI digestion.", footer: "Carries ~90% of parasympathetic preganglionic fibers", accent: "#5ec2ab" },
      { tag: "THROAT & NECK", heading: "CN IX, XI & XII", line1: "IX (Glossopharyngeal): gag/swallow & carotid sinus;", line2: "XI (Accessory): head turn/shrug; XII: tongue motion.", footer: "Damage to CN XII causes tongue deviation to injured side", accent: "#e5c478" },
      { tag: "RECEPTORS", heading: "Sensory Receptor Classification", line1: "Mechano-, Thermo-, Photo-, Chemo-, Nociceptors;", line2: "Exteroceptors, Interoceptors & Proprioceptors.", footer: "Encapsulated vs. free dendritic nerve endings", accent: "#7cc4e8" },
    ],
  },
  {
    file: "ch13-fig-2.svg",
    chapterLabel: "CHAPTER 13",
    title: "Spinal Nerves (31 Pairs), Nerve Plexuses & Somatic Reflex Arcs",
    subtitle: "Endoneurium-Perineurium-Epineurium wrappings, Cervical/Brachial/Lumbar/Sacral plexuses, and 5-step reflex arc",
    illustrationSvg: `
      <text x="192" y="34" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#e99a83" letter-spacing="0.08em">5-COMPONENT REFLEX ARC</text>
      <!-- 5 Steps Vertical Flow -->
      <rect x="48" y="64" width="288" height="62" rx="12" fill="#1b323a" stroke="#5ec2ab" stroke-width="2"/>
      <text x="192" y="92" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#6fd6be">1. Sensory Receptor (Muscle Spindle)</text>
      <text x="192" y="112" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#d3ece7">Detects stretch or noxious stimulus</text>
      <rect x="48" y="142" width="288" height="62" rx="12" fill="#1b323a" stroke="#7cc4e8" stroke-width="2"/>
      <text x="192" y="170" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#7cc4e8">2. Sensory Neuron (Dorsal Root)</text>
      <text x="192" y="190" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#d3ece7">Conducts afferent impulse into CNS</text>
      <rect x="48" y="220" width="288" height="62" rx="12" fill="#1b323a" stroke="#e5c478" stroke-width="2"/>
      <text x="192" y="248" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#e5c478">3. CNS Integration Center</text>
      <text x="192" y="268" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#d3ece7">Monosynaptic (stretch) or Polysynaptic</text>
      <rect x="48" y="298" width="288" height="62" rx="12" fill="#1b323a" stroke="#e99a83" stroke-width="2"/>
      <text x="192" y="326" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#e99a83">4. Motor Neuron (Ventral Root)</text>
      <text x="192" y="346" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#d3ece7">Conducts efferent command to target</text>
      <rect x="48" y="376" width="288" height="62" rx="12" fill="#1b323a" stroke="#5ec2ab" stroke-width="2"/>
      <text x="192" y="404" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#6fd6be">5. Effector Organ (Muscle / Gland)</text>
      <text x="192" y="424" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#d3ece7">Contracts or secretes automatically</text>
      <!-- Plexus Summary -->
      <text x="192" y="482" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#f1faf8">31 Spinal Nerve Pairs: 8C · 12T · 5L · 5S · 1Co</text>
      <text x="192" y="508" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" font-weight="700" fill="#e5c478">Ventral rami (except T2–T12) form 4 Plexuses</text>
    `,
    cards: [
      { tag: "WRAPPINGS", heading: "Epineurium, Perineurium, Endoneurium", line1: "Epineurium wraps whole nerve; Perineurium", line2: "wraps fascicles; Endoneurium wraps each axon.", footer: "Mirrors muscle epimysium / perimysium / endomysium", accent: "#5ec2ab" },
      { tag: "CERVICAL", heading: "Cervical Plexus (C1–C4) & Phrenic", line1: "Phrenic nerve (C3–C5) innervates the diaphragm", line2: "for breathing ('C3, 4, 5 keep the diaphragm alive').", footer: "Severing cord above C3 causes respiratory arrest", accent: "#7cc4e8" },
      { tag: "BRACHIAL", heading: "Brachial Plexus (C5–T1)", line1: "Gives rise to Axillary, Musculocutaneous,", line2: "Median, Ulnar, and Radial nerves of upper limb.", footer: "Radial = wrist drop; Median = carpal tunnel", accent: "#e5c478" },
      { tag: "LUMBOSACRAL", heading: "Lumbar (L1–L4) & Sacral (L4–S4)", line1: "Lumbar: Femoral & Obturator nerves;", line2: "Sacral: Sciatic nerve (tibial + common fibular).", footer: "Sciatic nerve is the thickest/longest nerve in the body", accent: "#e99a83" },
      { tag: "STRETCH", heading: "Stretch & Tendon Reflexes", line1: "Stretch (patellar) is monosynaptic & ipsilateral", line2: "with reciprocal inhibition of antagonists.", footer: "Golgi tendon reflex prevents muscle/tendon tearing", accent: "#5ec2ab" },
      { tag: "WITHDRAWAL", heading: "Flexor & Crossed-Extensor Reflex", line1: "Polysynaptic ipsilateral flexion pulls limb from pain;", line2: "contralateral extension supports body weight.", footer: "Stepping on glass: flex injured leg, extend opposite leg", accent: "#e99a83" },
    ],
  },
  {
    file: "ch14-fig-1.svg",
    chapterLabel: "CHAPTER 14",
    title: "Autonomic Nervous System: Sympathetic vs. Parasympathetic",
    subtitle: "Two-neuron visceral motor chain, Thoracolumbar (T1–L2) vs. Craniosacral outflow, and neurotransmitter release",
    illustrationSvg: `
      <text x="192" y="34" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#6fd6be" letter-spacing="0.08em">TWO-NEURON AUTONOMIC CHAIN</text>
      <!-- Sympathetic Box -->
      <rect x="34" y="64" width="316" height="222" rx="14" fill="#1b323a" stroke="#e99a83" stroke-width="2"/>
      <text x="192" y="94" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#e99a83">SYMPATHETIC (Fight-or-Flight)</text>
      <text x="192" y="116" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" font-weight="700" fill="#fbd0bd">Thoracolumbar Outflow (T1 – L2)</text>
      <line x1="60" y1="154" x2="145" y2="154" stroke="#5ec2ab" stroke-width="4"/>
      <circle cx="155" cy="154" r="10" fill="#e5c478"/>
      <line x1="165" y1="154" x2="320" y2="154" stroke="#e99a83" stroke-width="4" stroke-dasharray="6,4"/>
      <text x="102" y="142" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10.5" font-weight="700" fill="#6fd6be">Short Pre (ACh)</text>
      <text x="242" y="142" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10.5" font-weight="700" fill="#e99a83">Long Post (Norepinephrine)</text>
      <text x="192" y="196" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" fill="#f1faf8">• Ganglia close to spinal cord (Sympathetic Trunk)</text>
      <text x="192" y="220" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" fill="#f1faf8">• Adrenal Medulla releases Epinephrine into blood</text>
      <text x="192" y="244" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" fill="#e5c478">• ↑ HR, bronchodilation, mydriasis, ↑ glucose</text>
      <!-- Parasympathetic Box -->
      <rect x="34" y="308" width="316" height="222" rx="14" fill="#1b323a" stroke="#5ec2ab" stroke-width="2"/>
      <text x="192" y="338" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" font-weight="800" fill="#6fd6be">PARASYMPATHETIC (Rest-and-Digest)</text>
      <text x="192" y="360" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" font-weight="700" fill="#d3ece7">Craniosacral Outflow (CN III, VII, IX, X + S2–S4)</text>
      <line x1="60" y1="398" x2="235" y2="398" stroke="#5ec2ab" stroke-width="4"/>
      <circle cx="245" cy="398" r="10" fill="#e5c478"/>
      <line x1="255" y1="398" x2="320" y2="398" stroke="#7cc4e8" stroke-width="4" stroke-dasharray="6,4"/>
      <text x="148" y="386" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10.5" font-weight="700" fill="#6fd6be">Long Pre (ACh)</text>
      <text x="288" y="386" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10.5" font-weight="700" fill="#7cc4e8">Short (ACh)</text>
      <text x="192" y="440" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" fill="#f1faf8">• Terminal ganglia in/near visceral target wall</text>
      <text x="192" y="464" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" fill="#f1faf8">• CN X (Vagus) carries 90% of parasympathetic fibers</text>
      <text x="192" y="488" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" fill="#6fd6be">• ↓ HR, GI motility/secretion, pupil miosis</text>
    `,
    cards: [
      { tag: "SOMATIC vs ANS", heading: "1-Neuron vs. 2-Neuron Chain", line1: "Somatic uses 1 myelinated neuron to skeletal muscle;", line2: "ANS uses Preganglionic → Ganglion → Postganglionic.", footer: "ANS targets cardiac muscle, smooth muscle & glands", accent: "#5ec2ab" },
      { tag: "T1 – L2", heading: "Sympathetic (Thoracolumbar)", line1: "Short preganglionic (ACh) + Long postganglionic (NE);", line2: "ganglia sit in paravertebral sympathetic trunk.", footer: "Exception: sweat glands use ACh on muscarinic receptors", accent: "#e99a83" },
      { tag: "CRANIOSACRAL", heading: "Parasympathetic (CN III, VII, IX, X)", line1: "Long preganglionic (ACh) + Short postganglionic (ACh);", line2: "intramural ganglia sit at the effector organ.", footer: "SLUDD: Salivation, Lacrimation, Urination, Digestion, Defecation", accent: "#7cc4e8" },
      { tag: "ADRENAL", heading: "Adrenal Medulla Hormonal Surge", line1: "Preganglionic sympathetic fibers synapse directly", line2: "on chromaffin cells to release 80% Epi / 20% NE.", footer: "Prolongs systemic fight-or-flight response in blood", accent: "#e5c478" },
      { tag: "CHOLINERGIC", heading: "Nicotinic vs. Muscarinic (ACh)", line1: "Nicotinic: ALWAYS excitatory at all ANS ganglia;", line2: "Muscarinic: on all parasympathetic target organs.", footer: "Muscarinic inhibits cardiac pacemaker (slows heart rate)", accent: "#5ec2ab" },
      { tag: "ADRENERGIC", heading: "Alpha (α1, α2) vs. Beta (β1, β2)", line1: "α1 constricts blood vessels; β1 increases heart", line2: "rate & contractility; β2 dilates bronchioles.", footer: "Sympathetic tone maintains baseline blood pressure", accent: "#e99a83" },
    ],
  },
  {
    file: "ch14-fig-2.svg",
    chapterLabel: "CHAPTER 14",
    title: "Autonomic Receptor Pharmacology & Dual Visceral Innervation",
    subtitle: "Organ-by-organ sympathetic vs. parasympathetic antagonistic effects, vascular sympathetic tone, and hypothalamus control",
    illustrationSvg: `
      <text x="192" y="34" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#e5c478" letter-spacing="0.08em">TARGET ORGAN DUAL INNERVATION</text>
      <rect x="34" y="64" width="316" height="486" rx="14" fill="#1b323a" stroke="#365a64"/>
      <text x="54" y="100" font-family="system-ui, sans-serif" font-size="12.5" font-weight="800" fill="#e99a83">HEART (β1 vs. M2)</text>
      <text x="54" y="122" font-family="system-ui, sans-serif" font-size="11.5" fill="#f1faf8">Symp: ↑ HR &amp; force  |  Para: ↓ HR (Vagus)</text>
      <line x1="54" y1="138" x2="330" y2="138" stroke="#2c4a52"/>
      <text x="54" y="168" font-family="system-ui, sans-serif" font-size="12.5" font-weight="800" fill="#7cc4e8">LUNGS / BRONCHIOLES (β2 vs. M3)</text>
      <text x="54" y="190" font-family="system-ui, sans-serif" font-size="11.5" fill="#f1faf8">Symp: Bronchodilation  |  Para: Constriction</text>
      <line x1="54" y1="206" x2="330" y2="206" stroke="#2c4a52"/>
      <text x="54" y="236" font-family="system-ui, sans-serif" font-size="12.5" font-weight="800" fill="#e5c478">IRIS / PUPIL (α1 vs. M3)</text>
      <text x="54" y="258" font-family="system-ui, sans-serif" font-size="11.5" fill="#f1faf8">Symp: Dilates (Mydriasis)  |  Para: Constricts</text>
      <line x1="54" y1="274" x2="330" y2="274" stroke="#2c4a52"/>
      <text x="54" y="304" font-family="system-ui, sans-serif" font-size="12.5" font-weight="800" fill="#6fd6be">GI TRACT &amp; BLADDER</text>
      <text x="54" y="326" font-family="system-ui, sans-serif" font-size="11.5" fill="#f1faf8">Symp: Inhibits motility  |  Para: Stimulates</text>
      <line x1="54" y1="342" x2="330" y2="342" stroke="#2c4a52"/>
      <text x="54" y="372" font-family="system-ui, sans-serif" font-size="12.5" font-weight="800" fill="#e99a83">SYMPATHETIC-ONLY TARGETS</text>
      <text x="54" y="396" font-family="system-ui, sans-serif" font-size="11.5" fill="#f1faf8">• Systemic blood vessels (Vasomotor α1 tone)</text>
      <text x="54" y="420" font-family="system-ui, sans-serif" font-size="11.5" fill="#f1faf8">• Sweat glands, Arrector pili, Adrenal medulla</text>
      <text x="54" y="444" font-family="system-ui, sans-serif" font-size="11.5" fill="#f1faf8">• Kidneys (Renin release) &amp; Adipose lipolysis</text>
      <text x="192" y="516" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#6fd6be">Hypothalamus = Boss of the ANS</text>
    `,
    cards: [
      { tag: "HEART β1", heading: "Cardiac Pacemaker Control", line1: "Sympathetic NE/Epi binds β1 to speed SA node;", line2: "Parasympathetic ACh binds M2 to slow heart rate.", footer: "Beta-blockers (metoprolol) block β1 to lower HR & BP", accent: "#e99a83" },
      { tag: "AIRWAY β2", heading: "Bronchiole Smooth Muscle", line1: "Sympathetic Epinephrine binds β2 receptors", line2: "to relax airway smooth muscle (bronchodilation).", footer: "Albuterol inhalers are selective β2 agonists", accent: "#7cc4e8" },
      { tag: "VESSELS α1", heading: "Sympathetic Vasomotor Tone", line1: "Blood vessels receive ONLY sympathetic innervation;", line2: "α1 activation constricts arterioles to raise BP.", footer: "Decreasing sympathetic firing dilates vessels", accent: "#e5c478" },
      { tag: "EYE FOCUS", heading: "Pupil & Ciliary Muscle", line1: "Sympathetic (α1) contracts radial muscle (dilates);", line2: "Parasympathetic (CN III) constricts pupil & bulges lens.", footer: "Atropine blocks muscarinic receptors to dilate pupils", accent: "#5ec2ab" },
      { tag: "RAMI", heading: "White vs. Gray Rami Communicantes", line1: "White rami (T1–L2): myelinated preganglionic;", line2: "Gray rami (all levels): unmyelinated postganglionic.", footer: "Splanchnic nerves synapse in prevertebral ganglia", accent: "#e99a83" },
      { tag: "PAIN MAP", heading: "Visceral Referred Pain", line1: "Visceral pain afferents travel along the same", line2: "spinal cord pathways as somatic skin afferents.", footer: "Heart ischemia refers pain to left chest & medial arm", accent: "#5ec2ab" },
    ],
  },
  {
    file: "ch15-fig-1.svg",
    chapterLabel: "CHAPTER 15",
    title: "Special Senses: Sagittal Eye Tunics, Refraction & Retina",
    subtitle: "Fibrous, vascular, and neural tunics, lens accommodation, rods vs. cones, and the visual pathway to occipital cortex",
    illustrationSvg: `
      <text x="192" y="34" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#6fd6be" letter-spacing="0.08em">SAGITTAL EYE &amp; RETINA</text>
      <!-- Eye Globe -->
      <circle cx="204" cy="195" r="106" fill="#1b343c" stroke="#f1faf8" stroke-width="3.5"/>
      <!-- Cornea Bulge -->
      <path d="M108,145 C68,170 68,220 108,245" fill="#7cc4e8" fill-opacity="0.28" stroke="#7cc4e8" stroke-width="3"/>
      <!-- Choroid & Retina -->
      <circle cx="204" cy="195" r="96" fill="none" stroke="#e99a83" stroke-width="2.5" stroke-dasharray="6,3"/>
      <circle cx="204" cy="195" r="86" fill="none" stroke="#e5c478" stroke-width="2.5"/>
      <!-- Lens -->
      <ellipse cx="132" cy="195" rx="14" ry="38" fill="#5ec2ab" fill-opacity="0.4" stroke="#5ec2ab" stroke-width="2.2"/>
      <!-- Fovea & Optic Nerve -->
      <circle cx="290" cy="195" r="8" fill="#e5c478"/>
      <text x="274" y="178" text-anchor="end" font-family="system-ui, sans-serif" font-size="11" font-weight="800" fill="#e5c478">Fovea (Cones)</text>
      <rect x="292" y="218" width="52" height="24" fill="#23424a" stroke="#e5c478" stroke-width="2"/>
      <text x="275" y="236" text-anchor="end" font-family="system-ui, sans-serif" font-size="11" font-weight="800" fill="#e99a83">Optic Disc (CN II)</text>
      <!-- Light Pathway Box -->
      <rect x="38" y="332" width="308" height="222" rx="14" fill="#1b323a" stroke="#365a64"/>
      <text x="192" y="362" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#f1faf8">REFRACTION &amp; RETINAL PATHWAY</text>
      <text x="192" y="392" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" fill="#7cc4e8">Cornea (main fixed refraction) → Aqueous Humor</text>
      <text x="192" y="416" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" fill="#6fd6be">→ Lens (adjustable focus) → Vitreous Humor</text>
      <text x="192" y="440" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" fill="#e5c478">→ Photoreceptors (Rods/Cones) → Bipolar Cells</text>
      <text x="192" y="464" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" fill="#e99a83">→ Ganglion Cells → Optic Nerve (CN II) →</text>
      <text x="192" y="488" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" fill="#f1faf8">Optic Chiasm → Thalamus (LGN) → Occipital Cortex</text>
      <text x="192" y="528" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#6fd6be">Myopia = eyeball too long (concave lens fixes)</text>
    `,
    cards: [
      { tag: "3 TUNICS", heading: "Fibrous, Vascular & Neural Layers", line1: "Fibrous: Sclera + Cornea; Vascular (Uvea):", line2: "Choroid + Ciliary body + Iris; Inner: Retina.", footer: "Cornea has the highest refractive power of the eye", accent: "#7cc4e8" },
      { tag: "HUMORS", heading: "Aqueous vs. Vitreous Humor", line1: "Aqueous humor (anterior segment) drains via", line2: "scleral venous sinus; blocked drainage = Glaucoma.", footer: "Vitreous humor holds the retina against the choroid", accent: "#5ec2ab" },
      { tag: "FOCUS", heading: "Lens Accommodation", line1: "Near vision: Ciliary muscle contracts → lens", line2: "bulges (more convex) + pupils constrict + eyes converge.", footer: "Hyperopia (farsighted) corrected with convex lens", accent: "#e5c478" },
      { tag: "RODS vs CONES", heading: "Scotopic vs. Photopic Vision", line1: "Rods: dim light, peripheral, monochromatic (rhodopsin);", line2: "Cones: bright light, high-acuity color (blue/green/red).", footer: "Light hyperpolarizes photoreceptors via cGMP closure", accent: "#e99a83" },
      { tag: "ACUITY", heading: "Fovea Centralis vs. Optic Disc", line1: "Fovea centralis (in macula) has ONLY cones for", line2: "sharpest vision; Optic disc has zero photoreceptors.", footer: "Optic disc = physiological blind spot where CN II exits", accent: "#5ec2ab" },
      { tag: "PATHWAY", heading: "Optic Chiasm & Visual Cortex", line1: "Medial (nasal) retinal fibers cross at the optic", line2: "chiasm → Lateral Geniculate Nucleus → Occipital lobe.", footer: "Gives each hemisphere the contralateral visual field", accent: "#7cc4e8" },
    ],
  },
  {
    file: "ch15-fig-2.svg",
    chapterLabel: "CHAPTER 15",
    title: "Hearing, Equilibrium & Chemical Senses (Olfaction & Gustation)",
    subtitle: "Middle ear ossicles, cochlear spiral organ of Corti, vestibular maculae & crista ampullaris, and smell/taste",
    illustrationSvg: `
      <text x="192" y="34" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#e5c478" letter-spacing="0.08em">INNER EAR: COCHLEA &amp; VESTIBULE</text>
      <!-- Semicircular Canals -->
      <path d="M84,160 C84,78 164,78 164,160" fill="none" stroke="#5ec2ab" stroke-width="5"/>
      <path d="M64,185 C64,125 140,125 140,185" fill="none" stroke="#7cc4e8" stroke-width="5"/>
      <circle cx="152" cy="188" r="26" fill="#e5c478" fill-opacity="0.28" stroke="#e5c478" stroke-width="2.2"/>
      <text x="152" y="192" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10.5" font-weight="800" fill="#fff">Vestibule</text>
      <!-- Cochlea Spiral -->
      <path d="M178,188 C235,130 322,155 312,215 C304,265 235,275 215,232 C202,202 238,178 265,198 C278,208 268,228 250,222" fill="none" stroke="#e99a83" stroke-width="6" stroke-linecap="round"/>
      <text x="120" y="92" font-family="system-ui, sans-serif" font-size="11.5" font-weight="800" fill="#6fd6be">Semicircular Canals (Rotation)</text>
      <text x="262" y="286" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#e99a83">Cochlea (Hearing)</text>
      <!-- Sound Transduction Flow -->
      <rect x="38" y="318" width="308" height="236" rx="14" fill="#1b323a" stroke="#365a64"/>
      <text x="192" y="348" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#f1faf8">AUDITORY TRANSDUCTION CHAIN</text>
      <text x="192" y="378" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" fill="#6fd6be">1. Tympanic Membrane → Malleus, Incus, Stapes</text>
      <text x="192" y="404" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" fill="#e5c478">2. Stapes rocks Oval Window → Perilymph wave</text>
      <text x="192" y="430" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" fill="#e99a83">3. Basilar Membrane vibrates at specific pitch</text>
      <text x="192" y="456" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" fill="#7cc4e8">4. Hair cell stereocilia bend against Tectorial</text>
      <text x="192" y="482" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" fill="#f1faf8">5. K⁺ influx depolarizes hair cells → CN VIII</text>
      <text x="192" y="524" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#e5c478">Base of cochlea = High pitch · Apex = Low pitch</text>
    `,
    cards: [
      { tag: "MIDDLE EAR", heading: "Auditory Ossicles (M-I-S)", line1: "Malleus (hammer) → Incus (anvil) → Stapes", line2: "(stirrup) amplify tympanic vibration to oval window.", footer: "Pharyngotympanic tube equalizes middle ear pressure", accent: "#e5c478" },
      { tag: "HEARING", heading: "Spiral Organ of Corti", line1: "Rests on the basilar membrane inside scala media", line2: "(cochlear duct, filled with K⁺-rich endolymph).", footer: "Stereocilia shear against the tectorial membrane", accent: "#e99a83" },
      { tag: "PITCH & LOUD", heading: "Tonotopic Basilar Mapping", line1: "High-frequency sounds vibrate stiff base near", line2: "oval window; Low-frequency vibrates flexible apex.", footer: "Loudness (dB) is coded by hair-cell deflection amplitude", accent: "#5ec2ab" },
      { tag: "STATIC", heading: "Vestibular Maculae (Utricle & Saccule)", line1: "Otolithic membrane weighted with CaCO₃", line2: "otoliths detects linear acceleration & head tilt.", footer: "Utricle = horizontal (car); Saccule = vertical (elevator)", accent: "#7cc4e8" },
      { tag: "DYNAMIC", heading: "Crista Ampullaris (Semicircular)", line1: "Gelatinous cupula inside each ampulla bends", line2: "with endolymph inertia during rotational spin.", footer: "3 canals oriented in X, Y, and Z planes", accent: "#5ec2ab" },
      { tag: "CHEMORECEPT", heading: "Olfaction (CN I) & Gustation", line1: "Olfactory receptor neurons renew from basal cells;", line2: "5 tastes: Sweet, Sour, Salty, Bitter, Umami.", footer: "Taste carried by CN VII (ant. 2/3), CN IX (post. 1/3) & CN X", accent: "#e5c478" },
    ],
  },
]

for (const plate of plates) {
  const svgContent = wrapPlate(plate)
  const filePath = path.join(outDir, plate.file)
  fs.writeFileSync(filePath, svgContent, "utf8")
}

console.log(`Generated ${plates.length} illustrated study plates in ${outDir}`)
