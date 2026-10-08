import femurAnteriorImage from "../assets/anatomy/femur-anterior.png"
import femurPosteriorImage from "../assets/anatomy/femur-posterior.png"
import hipBoneMedialImage from "../assets/anatomy/hip-bone-medial.png"
import pelvisAnteriorImage from "../assets/anatomy/pelvis-anterior.png"
import pelvisLateralImage from "../assets/anatomy/pelvis-lateral.png"
import pelvisPosteriorImage from "../assets/anatomy/pelvis-posterior.png"

const chapter = {
  id: "chapter-7",
  label: "Chapter 7",
  title: "The Skeletal System",
}

const lectureCredit = "Chapter 7 Skeletal System lecture slide export."

const regionRows = [
  [
    "axial-skeleton",
    "Axial skeleton",
    "Skull, vertebral column, sternum, and ribs from the Chapter 7 deck.",
  ],
  [
    "skull",
    "Skull / cranium / facial bones",
    "Cranial bones, facial bones, sutures, orbit structures, palate, and nasal structures.",
  ],
  [
    "hyoid",
    "Hyoid",
    "Standalone hyoid anatomy and support structures for tongue and laryngeal movement.",
  ],
  [
    "vertebral-column",
    "Vertebral column",
    "General vertebral anatomy plus cervical, thoracic, lumbar, sacral, and coccygeal landmarks.",
  ],
  [
    "thorax",
    "Thorax / sternum / ribs",
    "Sternum and rib landmarks used in thoracic cage practicals.",
  ],
  [
    "pectoral-girdle",
    "Pectoral girdle",
    "Clavicle and scapula views for shoulder girdle identification.",
  ],
  [
    "upper-limb",
    "Upper limb",
    "Humerus, ulna, radius, carpals, metacarpals, and hand phalanges.",
  ],
  [
    "pelvic-girdle",
    "Pelvic girdle",
    "Pelvic brim, hip bone, and pelvic landmark study for the coxal bones.",
  ],
  [
    "lower-limb",
    "Lower limb",
    "Femur, patella, tibia, fibula, tarsals, metatarsals, and toe phalanges.",
  ],
]

const regions = regionRows.map(([id, label, description]) => ({
  id,
  label,
  description,
  chapterId: chapter.id,
  chapterLabel: `${chapter.label} • ${chapter.title}`,
}))

const regionsById = Object.fromEntries(regions.map((region) => [region.id, region]))

const boneRows = [
  [
    "axial-overview",
    "Axial skeleton overview",
    "axial-skeleton",
    "Big-picture orientation for the skull, vertebral column, ribs, and sternum.",
  ],
  ["frontal-bone", "Frontal bone", "skull", "Forehead region and superior orbit."],
  ["parietal-bone", "Parietal bone", "skull", "Superior and lateral cranial vault."],
  ["occipital-bone", "Occipital bone", "skull", "Posterior cranium and foramen magnum."],
  ["temporal-bone", "Temporal bone", "skull", "Lateral skull, ear region, and base landmarks."],
  ["sphenoid-bone", "Sphenoid bone", "skull", "Butterfly-shaped cranial base bone."],
  ["ethmoid-bone", "Ethmoid bone", "skull", "Nasal cavity and anterior cranial floor bone."],
  ["orbit-and-nasal", "Orbit and nasal structures", "skull", "Facial and orbital bone review."],
  ["mandible", "Mandible", "skull", "Lower jaw and chin landmarks."],
  ["maxilla", "Maxilla", "skull", "Upper jaw and hard palate landmarks."],
  ["zygomatic-bone", "Zygomatic bone", "skull", "Cheekbone landmarks."],
  ["palatine-bone", "Palatine bone", "skull", "Posterior hard palate landmarks."],
  ["hyoid-bone", "Hyoid bone", "hyoid", "Bone inferior to the mandible that does not articulate directly."],
  ["vertebral-overview", "Vertebral column overview", "vertebral-column", "General spinal regions and disc orientation."],
  ["typical-vertebra", "Typical vertebra", "vertebral-column", "Shared vertebral landmarks for structure review."],
  ["atlas", "Atlas (C1)", "vertebral-column", "First cervical vertebra."],
  ["axis", "Axis (C2)", "vertebral-column", "Second cervical vertebra with the dens."],
  ["cervical-vertebra", "Cervical vertebra", "vertebral-column", "Representative C3-C7 morphology."],
  ["thoracic-vertebra", "Thoracic vertebra", "vertebral-column", "Thoracic vertebrae with rib facets."],
  ["lumbar-vertebra", "Lumbar vertebra", "vertebral-column", "Thick vertebrae built for support."],
  ["sacrum", "Sacrum", "vertebral-column", "Fused sacral vertebrae and sacral canal landmarks."],
  ["sternum", "Sternum", "thorax", "Manubrium, body, and xiphoid landmarks."],
  ["ribs", "Ribs", "thorax", "Representative rib anatomy and rib classes."],
  ["clavicle", "Clavicle", "pectoral-girdle", "Collarbone articulation landmarks."],
  ["scapula", "Scapula", "pectoral-girdle", "Shoulder blade borders, fossae, and processes."],
  ["humerus", "Humerus", "upper-limb", "Arm bone with proximal and distal landmarks."],
  ["ulna", "Ulna", "upper-limb", "Medial forearm bone and elbow landmarks."],
  ["radius", "Radius", "upper-limb", "Lateral forearm bone and wrist landmarks."],
  ["hand-carpals", "Hand carpals", "upper-limb", "Carpal bones and carpal tunnel orientation."],
  ["hand-phalanges", "Hand metacarpals and phalanges", "upper-limb", "Knuckles and finger bone naming."],
  ["pelvic-overview", "Pelvic girdle overview", "pelvic-girdle", "Coxal bones, acetabulum, and pelvis orientation."],
  ["pelvis", "Pelvis", "pelvic-girdle", "Pelvic brim, ilium, ischium, pubis, and sacral connections."],
  ["femur", "Femur", "lower-limb", "Proximal and distal femur landmarks."],
  ["patella", "Patella", "lower-limb", "Kneecap orientation."],
  ["tibia-fibula", "Tibia and fibula", "lower-limb", "Leg bones and malleoli."],
  ["foot-tarsals", "Foot tarsals", "lower-limb", "Tarsal bones and ankle region."],
  ["foot-phalanges", "Foot metatarsals and phalanges", "lower-limb", "Instep and toe naming."],
]

const bones = boneRows.map(([id, label, regionId, description]) => ({
  id,
  label,
  regionId,
  regionLabel: regionsById[regionId].label,
  description,
  chapterId: chapter.id,
  chapterLabel: `${chapter.label} • ${chapter.title}`,
}))

const bonesById = Object.fromEntries(bones.map((bone) => [bone.id, bone]))

function makeReferenceView(id, boneId, label, fileName, studySurface, helper) {
  return {
    id,
    boneId,
    regionId: bonesById[boneId].regionId,
    label,
    studySurface,
    helper,
    kind: "reference",
    imageSrc: `${import.meta.env.BASE_URL}anatomy/chapter7/${fileName}`,
    imageAlt: `${label} from the Chapter 7 skeletal system lecture deck.`,
    imageCredit: lectureCredit,
    points: [],
  }
}

function makeMappedView(view) {
  return {
    kind: "mapped",
    regionId: bonesById[view.boneId].regionId,
    ...view,
  }
}

const referenceViews = [
  makeReferenceView("axial-overview-slide", "axial-overview", "Axial overview", "axial-skeleton.png", "Use the Chapter 7 axial skeleton slide to anchor body-axis organization before drilling details.", "This slide helps separate axial content from appendicular content before you zoom in by region."),
  makeReferenceView("frontal-bone-slide", "frontal-bone", "Frontal bone slide", "frontal-bone.png", "Reference slide for the frontal bone, frontal sinus, and supraorbital foramen.", "Use this image for forehead and superior orbit orientation from the lecture deck."),
  makeReferenceView("parietal-bone-slide", "parietal-bone", "Parietal bone slide", "parietal-bone.png", "Reference slide for parietal bone anatomy and major cranial sutures.", "Use this view when studying cranial sutures and the superior skull vault."),
  makeReferenceView("occipital-bone-slide", "occipital-bone", "Occipital bone slide", "occipital-bone.png", "Reference slide for the posterior cranium, foramen magnum, and occipital condyles.", "This is a strong practical view for posterior skull landmarks."),
  makeReferenceView("temporal-bone-slide", "temporal-bone", "Temporal bone slide", "temporal-bone.png", "Reference slide for temporal bone regions, auditory landmarks, and cranial foramina.", "Use this lecture image for lateral skull and ear-region naming."),
  makeReferenceView("sphenoid-bone-slide", "sphenoid-bone", "Sphenoid bone slide", "sphenoid-bone.png", "Reference slide for the sphenoid bone and its major wings, foramina, and sinus.", "Good for base-of-skull landmarks that show up in lecture practicals."),
  makeReferenceView("ethmoid-bone-slide", "ethmoid-bone", "Ethmoid bone slide", "ethmoid-bone.png", "Reference slide for the ethmoid bone, cribriform plate, conchae, and perpendicular plate.", "Use this view for nasal cavity and anterior cranial floor landmarks."),
  makeReferenceView("orbit-overview-slide", "orbit-and-nasal", "Orbit and nasal overview", "orbit-overview.png", "Reference slide for lacrimal and orbital bones plus nasal cavity structures.", "This grouped view fills in facial-bone coverage that supports later expansion."),
  makeReferenceView("mandible-slide", "mandible", "Mandible slide", "mandible.png", "Reference slide for jaw landmarks including the ramus, condyle, and mental foramen.", "Use this for lower-jaw landmark spelling and location practice."),
  makeReferenceView("maxilla-slide", "maxilla", "Maxilla slide", "maxilla.png", "Reference slide for upper-jaw structures including the palatine process and maxillary sinus.", "This image supports hard-palate and infraorbital naming."),
  makeReferenceView("zygomatic-bone-slide", "zygomatic-bone", "Zygomatic bone slide", "zygomatic-bone.png", "Reference slide for the zygomatic bone and zygomatic arch.", "Use this for cheekbone anatomy and process naming."),
  makeReferenceView("nasal-vomer-slide", "orbit-and-nasal", "Nasal and septum slide", "nasal-vomer-conchae.png", "Reference slide for nasal bone, vomer, inferior nasal concha, and nasal septum.", "Helpful for distinguishing septum bones from the conchae."),
  makeReferenceView("palatine-bone-slide", "palatine-bone", "Palatine bone slide", "palatine-bone.png", "Reference slide for the palatine bone and hard palate.", "Use this view for posterior hard palate identification."),
  makeReferenceView("hyoid-slide", "hyoid-bone", "Hyoid slide", "hyoid.png", "Reference slide for the hyoid bone and its positional importance.", "This is the non-articulating bone students often forget to include."),
  makeReferenceView("vertebral-column-slide", "vertebral-overview", "Vertebral column slide", "vertebral-column.png", "Reference slide for spinal regions, disc placement, and overall vertebral column organization.", "Use this before narrowing to a specific vertebral type."),
  makeReferenceView("typical-vertebra-slide", "typical-vertebra", "Typical vertebra slide", "typical-vertebra.png", "Reference slide for shared vertebral anatomy such as body, pedicle, and processes.", "A good base image for the core vertebral landmark vocabulary."),
  makeReferenceView("atlas-slide", "atlas", "Atlas (C1) slide", "atlas-c1.png", "Reference slide for the atlas and its lateral masses.", "Use this for the first cervical vertebra and the nodding joint."),
  makeReferenceView("axis-slide", "axis", "Axis (C2) slide", "axis-c2.png", "Reference slide for the axis and dens.", "Use this when studying head rotation and the second cervical vertebra."),
  makeReferenceView("c3-c7-slide", "cervical-vertebra", "C3-C7 slide", "c3-c7.png", "Reference slide for standard cervical vertebra features.", "This view reinforces transverse foramina and bifid spinous processes."),
  makeReferenceView("thoracic-vertebra-slide", "thoracic-vertebra", "Thoracic vertebra slide", "thoracic-vertebrae.png", "Reference slide for thoracic vertebrae and rib articulation landmarks.", "Use this view for demifacets and thoracic body shape."),
  makeReferenceView("lumbar-vertebra-slide", "lumbar-vertebra", "Lumbar vertebra slide", "lumbar-vertebrae.png", "Reference slide for the large body and support-oriented lumbar shape.", "This is a strong contrast view against thoracic and cervical vertebrae."),
  makeReferenceView("sacrum-slide", "sacrum", "Sacrum slide", "sacrum.png", "Reference slide for the sacrum, canal, hiatus, and promontory.", "Use this for fused vertebra landmarks at the base of the spine."),
  makeReferenceView("sternum-slide", "sternum", "Sternum slide", "sternum.png", "Reference slide for the manubrium, body, clavicular notch, and xiphoid process.", "Useful for thoracic cage anatomy and rib articulations."),
  makeReferenceView("ribs-slide", "ribs", "Ribs slide", "ribs.png", "Reference slide for rib parts and the true, false, and floating rib classes.", "Use this to connect rib anatomy with thoracic vertebra articulation."),
  makeReferenceView("pectoral-girdle-slide", "clavicle", "Pectoral girdle overview", "pectoral-girdle.png", "Reference slide for shoulder girdle orientation before drilling clavicle and scapula.", "This view keeps the girdle context visible when studying shoulder bones."),
  makeReferenceView("clavicle-slide", "clavicle", "Clavicle slide", "clavicle.png", "Reference slide for the clavicle and its sternal and acromial ends.", "Use this for shoulder girdle articulation naming."),
  makeReferenceView("scapula-slide", "scapula", "Scapula slide", "scapula.png", "Reference slide for the scapula, its borders, fossae, and processes.", "This view covers both the anterior and posterior scapular surfaces."),
  makeReferenceView("humerus-slide", "humerus", "Humerus slide", "humerus.png", "Reference slide for the humerus from proximal tubercles to distal fossae.", "Use this for arm-bone naming and elbow-joint landmarks."),
  makeReferenceView("ulna-slide", "ulna", "Ulna slide", "ulna.png", "Reference slide for the ulna and proximal elbow landmarks.", "Helpful for trochlear notch and olecranon review."),
  makeReferenceView("radius-slide", "radius", "Radius slide", "radius.png", "Reference slide for the radius, radial tuberosity, and distal wrist landmarks.", "Use this for lateral forearm review and radius-versus-ulna comparison."),
  makeReferenceView("hand-carpals-slide", "hand-carpals", "Carpals slide", "hand-carpals.png", "Reference slide for the eight carpal bones and carpal tunnel context.", "This view keeps the standard carpal mnemonic tied to the actual bone names."),
  makeReferenceView("hand-phalanges-slide", "hand-phalanges", "Hand metacarpals and phalanges slide", "hand-metacarpals-phalanges.png", "Reference slide for metacarpal numbering and finger phalanx naming.", "Use this for knuckle-to-digit orientation and the pollex exception."),
  makeReferenceView("pelvic-overview-slide", "pelvic-overview", "Pelvic girdle slide", "pelvic-girdle.png", "Reference slide for coxal bones, acetabulum, and overall pelvic girdle organization.", "This gives the big-picture pelvis context before the closer mapped pelvis views."),
  makeReferenceView("ilium-slide", "pelvis", "Ilium slide", "ilium.png", "Reference slide for iliac crest, spines, iliac fossa, and greater sciatic notch.", "Use this to supplement the mapped pelvis images with additional Chapter 7 labels."),
  makeReferenceView("ischium-slide", "pelvis", "Ischium slide", "ischium.png", "Reference slide for the ischium, ischial spine, and ischial tuberosity.", "Good for separating posterior-inferior hip-bone landmarks."),
  makeReferenceView("pubis-slide", "pelvis", "Pubis slide", "pubis.png", "Reference slide for the pubis, obturator foramen, crest, and tubercle.", "Use this for anterior pelvic landmarks and the pubic symphysis region."),
  makeReferenceView("femur-slide", "femur", "Femur slide", "femur.png", "Reference slide for additional Chapter 7 femur landmarks beyond the mapped close study views.", "This complements the mapped femur images with lecture-labeled long-bone landmarks."),
  makeReferenceView("patella-slide", "patella", "Patella slide", "patella.png", "Reference slide for patella orientation and surfaces.", "Use this for knee-cap naming and anterior-versus-posterior distinction."),
  makeReferenceView("tibia-fibula-slide", "tibia-fibula", "Tibia and fibula slide", "tibia-fibula.png", "Reference slide for lower-leg bones, condyles, tuberosity, and malleoli.", "This is useful for ankle landmark recall and tibia-versus-fibula comparison."),
  makeReferenceView("lower-limb-overview-slide", "tibia-fibula", "Lower limb overview", "lower-limb.png", "Reference slide for lower-limb orientation before drilling individual bones.", "Use this when you want context for femur, leg bones, and foot study."),
  makeReferenceView("tarsals-slide", "foot-tarsals", "Tarsals slide", "tarsals.png", "Reference slide for talus, calcaneus, navicular, cuboid, and cuneiforms.", "Use this for ankle and proximal foot naming."),
  makeReferenceView("foot-phalanges-slide", "foot-phalanges", "Foot metatarsals and phalanges slide", "foot-metatarsals-phalanges.png", "Reference slide for metatarsals, toe phalanges, and the hallux exception.", "This view supports instep numbering and toe naming."),
]

const mappedViews = [
  makeMappedView({ id: "femur-proximal-anterior", boneId: "femur", label: "Anterior mapped view", studySurface: "Anterior femur view with mapped points for proximal landmarks and head-neck orientation.", helper: "Use this mapped image for image-first practice. Marker overlays are more precise here than on the lecture slide export.", imageSrc: femurAnteriorImage, imageAlt: "Anterior full-body view with the femurs highlighted in red.", imageCredit: "Femur image by Anatomography / BodyParts3D via Wikimedia Commons, CC BY-SA 2.1 JP.", sourceUrl: "https://commons.wikimedia.org/wiki/File:Femur_-_anterior_view.png", points: [{ structureId: "head-of-femur", x: 60.8, y: 40.3 }, { structureId: "neck-of-femur", x: 59.8, y: 43.2 }, { structureId: "greater-trochanter", x: 58.2, y: 44.3 }, { structureId: "fovea-capitis", x: 61.3, y: 40.8, approximate: true }] }),
  makeMappedView({ id: "femur-distal-posterior", boneId: "femur", label: "Posterior mapped view", studySurface: "Posterior femur view with mapped points for distal landmarks and posterior proximal details.", helper: "Use this mapped image when you want to drill the distal femur without visible lecture labels.", imageSrc: femurPosteriorImage, imageAlt: "Posterior full-body view with the femurs highlighted in red.", imageCredit: "Femur image by Anatomography / BodyParts3D via Wikimedia Commons, CC BY-SA 2.1 JP.", sourceUrl: "https://commons.wikimedia.org/wiki/File:Femur_-_posterior_view.png", points: [{ structureId: "lesser-trochanter", x: 58.7, y: 45.1, approximate: true }, { structureId: "medial-supracondylar-ridge", x: 59.2, y: 76.2 }, { structureId: "medial-epicondyle-of-femur", x: 58.7, y: 81.0 }, { structureId: "intercondylar-fossa", x: 60.8, y: 82.1 }] }),
  makeMappedView({ id: "pelvis-anterior-overview", boneId: "pelvis", label: "Anterior mapped view", studySurface: "Anterior pelvis view with mapped points for brim, basin, iliac crest, pubis, and related landmarks.", helper: "Use this mapped overview for pelvis orientation and exact pelvis marker practice.", imageSrc: pelvisAnteriorImage, imageAlt: "Anterior full-body view with the pelvis highlighted in red.", imageCredit: "Pelvis image by Anatomography / BodyParts3D via Wikimedia Commons, CC BY-SA 2.1 JP.", sourceUrl: "https://commons.wikimedia.org/wiki/File:Pelvis_(male)_00_-_anterior_view.png", points: [{ structureId: "false-pelvis", x: 58.4, y: 44.0, approximate: true }, { structureId: "true-pelvis", x: 57.2, y: 47.4, approximate: true }, { structureId: "pubic-symphysis", x: 49.8, y: 51.1 }, { structureId: "pubis", x: 56.9, y: 50.3 }, { structureId: "superior-pubic-ramus", x: 57.9, y: 49.2 }, { structureId: "ilium", x: 60.6, y: 45.1 }, { structureId: "iliac-crest", x: 61.7, y: 42.9 }] }),
  makeMappedView({ id: "pelvis-medial-closeup", boneId: "pelvis", label: "Medial hip-bone close-up", studySurface: "Medial hip-bone close-up for iliac fossa and internal pelvic landmarks.", helper: "This mapped close-up stays useful for internal pelvis landmarks that are hard to place on a full pelvis slide.", imageSrc: hipBoneMedialImage, imageAlt: "Medial close-up of a right hip bone.", imageCredit: "Hip bone image by Anatomography / BodyParts3D via Wikimedia Commons, CC BY-SA 2.1 JP.", sourceUrl: "https://commons.wikimedia.org/wiki/File:Hip_bone_-_close-up_-_medial_view_(right_hip_bone).png", points: [{ structureId: "iliac-fossa", x: 63.2, y: 34.4 }, { structureId: "ilium", x: 49.6, y: 22.8 }, { structureId: "superior-pubic-ramus", x: 52.2, y: 72.8 }, { structureId: "pubis", x: 57.0, y: 76.0 }, { structureId: "ischium", x: 31.4, y: 72.8 }] }),
  makeMappedView({ id: "pelvis-posterior-overview", boneId: "pelvis", label: "Posterior mapped view", studySurface: "Posterior pelvis view with mapped points for sacral and posterior ischial landmarks.", helper: "Use this mapped view for posterior pelvic anatomy and deep/internal approximations.", imageSrc: pelvisPosteriorImage, imageAlt: "Posterior view of the pelvis.", imageCredit: "Pelvis image by Anatomography / BodyParts3D via Wikimedia Commons, CC BY-SA 2.1 JP.", sourceUrl: "https://commons.wikimedia.org/wiki/File:Pelvis_(male)_03_-_posterior_view.png", points: [{ structureId: "sacrum", x: 50.1, y: 46.2 }, { structureId: "sacral-promontory", x: 50.0, y: 33.8, approximate: true }, { structureId: "sacroiliac-joint", x: 58.4, y: 39.7 }, { structureId: "ischial-tuberosity", x: 64.9, y: 79.3 }] }),
  makeMappedView({ id: "pelvis-lateral-overview", boneId: "pelvis", label: "Lateral mapped view", studySurface: "Lateral pelvis view with mapped points for ischial projection landmarks.", helper: "This mapped view is especially useful for the ischial spine and tuberosity.", imageSrc: pelvisLateralImage, imageAlt: "Lateral full-body view with the pelvis highlighted in red.", imageCredit: "Pelvis image by Anatomography / BodyParts3D via Wikimedia Commons, CC BY-SA 2.1 JP.", sourceUrl: "https://commons.wikimedia.org/wiki/File:Pelvis_(male)_01_-_lateral_view.png", points: [{ structureId: "ischial-spine", x: 47.2, y: 69.5 }, { structureId: "ischial-tuberosity", x: 49.2, y: 79.0 }] }),
]

const views = [...referenceViews, ...mappedViews]

function promptFromDefinition(definition) {
  const trimmed = definition.replace(/\.$/, "").replace(/^The\s+/i, "")
  return `Identify ${trimmed.charAt(0).toLowerCase()}${trimmed.slice(1)}.`
}

function createStructure(boneId, viewId, item) {
  const [id, term, definition, location, hint, note = "", aliases = []] = item
  const bone = bonesById[boneId]
  const region = regionsById[bone.regionId]

  return {
    id,
    chapterId: chapter.id,
    chapterLabel: `${chapter.label} • ${chapter.title}`,
    boneId,
    boneLabel: bone.label,
    regionId: region.id,
    regionLabel: region.label,
    viewId,
    term,
    aliases,
    identifyPrompt: promptFromDefinition(definition),
    definition,
    location,
    hint,
    note:
      note ||
      `High-yield ${chapter.label} landmark from the ${bone.label.toLowerCase()} study set.`,
  }
}

const structureGroups = []

structureGroups.push(
  {
    boneId: "axial-overview",
    viewId: "axial-overview-slide",
    items: [
      [
        "axial-skeleton",
        "Axial skeleton",
        "The division of the skeleton that includes the skull, vertebral column, sternum, and ribs.",
        "along the body's central axis",
        "Think body-axis bones rather than limb bones.",
        "This overview term helps anchor the chapter before you filter into skull, spine, or thorax study.",
      ],
    ],
  },
  {
    boneId: "frontal-bone",
    viewId: "frontal-bone-slide",
    items: [
      [
        "frontal-bone",
        "Frontal bone",
        "The cranial bone that forms the forehead and part of the roof of the orbits.",
        "at the forehead and superior orbital margin",
        "Forehead bone of the cranium.",
      ],
      [
        "frontal-sinus",
        "Frontal sinus",
        "An air-filled sinus within the frontal bone.",
        "inside the frontal bone above the nasal region",
        "Think sinus space in the forehead.",
      ],
      [
        "supraorbital-foramen",
        "Supraorbital foramen",
        "An opening in the frontal bone at the superior margin of the orbit.",
        "above the eye orbit in the frontal bone",
        "Supraorbital means above the orbit.",
      ],
    ],
  },
  {
    boneId: "parietal-bone",
    viewId: "parietal-bone-slide",
    items: [
      [
        "parietal-bone",
        "Parietal bone",
        "The cranial bone that forms the superior and lateral aspects of the skull.",
        "along the upper lateral cranial vault",
        "Large paired bone of the skull cap.",
      ],
      [
        "coronal-suture",
        "Coronal suture",
        "The suture between the frontal bone and parietal bones.",
        "between the frontal and parietal bones",
        "Crown-like line across the skull.",
      ],
      [
        "sagittal-suture",
        "Sagittal suture",
        "The midline suture between the right and left parietal bones.",
        "along the superior midline of the skull",
        "Runs front to back between the parietals.",
      ],
      [
        "lambdoid-suture",
        "Lambdoid suture",
        "The suture between the parietal bones and occipital bone.",
        "between the parietal and occipital bones",
        "Posterior skull suture near the occipital bone.",
      ],
      [
        "squamous-suture",
        "Squamous suture",
        "The suture between the parietal bone and temporal bone.",
        "on the lateral skull between parietal and temporal bones",
        "Lateral suture over the temporal region.",
      ],
    ],
  },
  {
    boneId: "occipital-bone",
    viewId: "occipital-bone-slide",
    items: [
      [
        "occipital-bone",
        "Occipital bone",
        "The posterior cranial bone that forms the back and base of the skull.",
        "at the posterior and inferior skull",
        "Back-of-skull bone.",
      ],
      [
        "foramen-magnum",
        "Foramen magnum",
        "The large opening in the occipital bone for the spinal cord.",
        "at the inferior occipital bone",
        "Big opening where the spinal cord passes.",
      ],
      [
        "occipital-condyles",
        "Occipital condyles",
        "The articular surfaces on the occipital bone that meet the atlas.",
        "on either side of the foramen magnum",
        "They articulate with C1.",
      ],
      [
        "superior-nuchal-line",
        "Superior nuchal line",
        "A ridge on the occipital bone that anchors neck and back muscles.",
        "across the posterior occipital surface",
        "Think posterior muscle-attachment ridge.",
      ],
    ],
  },
  {
    boneId: "temporal-bone",
    viewId: "temporal-bone-slide",
    items: [
      [
        "temporal-bone",
        "Temporal bone",
        "The cranial bone on the lateral skull that houses ear structures.",
        "on the lateral side of the skull",
        "Temple and ear region bone.",
      ],
      [
        "zygomatic-process-of-temporal-bone",
        "Zygomatic process of temporal bone",
        "The temporal bone projection that joins the zygomatic bone to form the arch.",
        "projecting anteriorly from the temporal bone",
        "Temporal contribution to the zygomatic arch.",
      ],
      [
        "mandibular-fossa",
        "Mandibular fossa",
        "The depression in the temporal bone that articulates with the mandible.",
        "on the inferior temporal bone near the zygomatic process",
        "Jaw-joint socket on the temporal bone.",
      ],
      [
        "external-acoustic-meatus",
        "External acoustic meatus",
        "The opening in the temporal bone that leads into the ear canal.",
        "on the lateral temporal bone",
        "Ear-canal opening.",
      ],
      [
        "styloid-process-of-temporal-bone",
        "Styloid process of temporal bone",
        "A slender projection of the temporal bone that serves as a muscle and ligament attachment site.",
        "inferior to the external acoustic meatus",
        "Thin spike below the ear opening.",
      ],
      [
        "mastoid-process",
        "Mastoid process",
        "The rounded projection of the temporal bone posterior to the ear region.",
        "posterior and inferior to the external acoustic meatus",
        "Palpable bump behind the ear.",
      ],
      [
        "jugular-foramen",
        "Jugular foramen",
        "An opening associated with the temporal bone at the base of the skull.",
        "near the petrous region at the cranial base",
        "Base-of-skull foramen near the temporal bone.",
      ],
      [
        "carotid-canal",
        "Carotid canal",
        "A canal in the petrous temporal bone for the internal carotid artery.",
        "within the petrous part of the temporal bone",
        "Carotid passage in the temporal bone.",
      ],
    ],
  },
  {
    boneId: "sphenoid-bone",
    viewId: "sphenoid-bone-slide",
    items: [
      [
        "sphenoid-bone",
        "Sphenoid bone",
        "The cranial base bone with a body, wings, and pterygoid processes.",
        "in the middle of the cranial floor behind the orbits",
        "Butterfly-shaped cranial bone.",
      ],
      [
        "sella-turcica",
        "Sella turcica",
        "The saddle-shaped depression in the sphenoid bone that houses the pituitary gland.",
        "on the superior body of the sphenoid bone",
        "Pituitary seat of the sphenoid.",
      ],
      [
        "greater-wing-of-sphenoid",
        "Greater wing of sphenoid",
        "The broad lateral projection of the sphenoid bone.",
        "extending laterally from the sphenoid body",
        "Large wing-like expansion of the sphenoid.",
      ],
      [
        "lesser-wing-of-sphenoid",
        "Lesser wing of sphenoid",
        "The smaller superior wing of the sphenoid bone.",
        "superior to the greater wing of the sphenoid",
        "Smaller sphenoid wing closer to the orbit roof.",
      ],
      [
        "superior-orbital-fissure",
        "Superior orbital fissure",
        "The slit-like opening between the greater and lesser wings of the sphenoid.",
        "between the sphenoid wings at the orbit",
        "Fissure at the back of the orbit.",
      ],
      [
        "optic-foramen",
        "Optic foramen",
        "The opening in the sphenoid bone for the optic nerve.",
        "medial to the superior orbital fissure in the sphenoid",
        "Optic nerve passage through the sphenoid.",
      ],
      [
        "pterygoid-processes",
        "Pterygoid processes",
        "The inferior projections of the sphenoid bone used for muscle attachment.",
        "extending inferiorly from the sphenoid bone",
        "Inferior sphenoid processes for chewing muscles.",
      ],
      [
        "foramen-ovale",
        "Foramen ovale",
        "An opening in the sphenoid bone at the cranial base.",
        "in the greater wing of the sphenoid",
        "Oval opening in the sphenoid.",
      ],
      [
        "sphenoid-sinus",
        "Sphenoid sinus",
        "The paranasal sinus located within the body of the sphenoid bone.",
        "inside the body of the sphenoid bone",
        "Sinus space of the sphenoid.",
      ],
      [
        "foramen-rotundum",
        "Foramen rotundum",
        "The round opening in the sphenoid bone for the maxillary nerve.",
        "in the medial part of the greater wing of the sphenoid",
        "Round opening in the sphenoid.",
      ],
      [
        "foramen-lacerum",
        "Foramen lacerum",
        "The jagged opening between the sphenoid, temporal, and occipital bones.",
        "at the base of the skull medial to the foramen ovale",
        "Jagged base-of-skull opening.",
      ],
    ],
  },
  {
    boneId: "ethmoid-bone",
    viewId: "ethmoid-bone-slide",
    items: [
      [
        "ethmoid-bone",
        "Ethmoid bone",
        "The delicate cranial bone between the orbits that contributes to the nasal cavity.",
        "between the orbits and superior to the nasal cavity",
        "Central bone for the nasal cavity and orbit walls.",
      ],
      [
        "cribriform-plate",
        "Cribriform plate",
        "The perforated plate of the ethmoid bone that transmits olfactory nerves.",
        "at the superior ethmoid bone beneath the frontal bone",
        "Olfactory nerve passage plate.",
      ],
      [
        "crista-galli",
        "Crista galli",
        "The superior midline projection of the ethmoid bone that anchors meninges.",
        "projecting upward from the ethmoid bone",
        "Midline crest on the ethmoid.",
      ],
      [
        "ethmoid-sinus",
        "Ethmoid sinus",
        "Air cells within the lateral masses of the ethmoid bone.",
        "inside the ethmoid bone between the orbits",
        "Sinus spaces of the ethmoid.",
      ],
      [
        "superior-nasal-concha",
        "Superior nasal concha",
        "The upper scroll-like projection from the ethmoid bone into the nasal cavity.",
        "on the lateral wall of the nasal cavity",
        "Upper ethmoid concha.",
      ],
      [
        "middle-nasal-concha",
        "Middle nasal concha",
        "The middle scroll-like projection from the ethmoid bone into the nasal cavity.",
        "inferior to the superior nasal concha",
        "Middle ethmoid concha.",
      ],
      [
        "perpendicular-plate-of-ethmoid",
        "Perpendicular plate of ethmoid",
        "The inferior projection of the ethmoid that forms the superior part of the nasal septum.",
        "projecting inferiorly from the ethmoid into the nasal cavity",
        "Superior bony part of the nasal septum.",
      ],
    ],
  },
  {
    boneId: "orbit-and-nasal",
    viewId: "orbit-overview-slide",
    items: [
      [
        "lacrimal-bone",
        "Lacrimal bone",
        "The small facial bone on the medial wall of the orbit.",
        "on the medial wall of the eye orbit",
        "Tiny orbit bone near the tear duct.",
      ],
      [
        "lacrimal-fossa",
        "Lacrimal fossa",
        "The depression associated with the lacrimal bone that houses lacrimal structures.",
        "on the medial wall of the orbit near the lacrimal bone",
        "Tear-sac depression.",
      ],
      [
        "nasal-bone",
        "Nasal bone",
        "The facial bone that forms the superior bridge of the nose.",
        "at the upper bridge of the nose",
        "Upper bridge-of-nose bone.",
      ],
      [
        "vomer",
        "Vomer",
        "The facial bone that forms the inferior portion of the nasal septum.",
        "in the midline of the nasal cavity below the ethmoid plate",
        "Inferior part of the nasal septum.",
      ],
      [
        "inferior-nasal-concha",
        "Inferior nasal concha",
        "The separate facial bone that projects from the lateral wall of the nasal cavity.",
        "on the lateral wall of the nasal cavity below the middle concha",
        "Lowest separate concha bone.",
      ],
      [
        "nasal-septum",
        "Nasal septum",
        "The midline partition that divides the nasal cavity.",
        "down the midline of the nasal cavity",
        "Think partition between the right and left nasal passages.",
      ],
    ],
  },
)

structureGroups.push(
  {
    boneId: "clavicle",
    viewId: "clavicle-slide",
    items: [
      ["clavicle", "Clavicle", "The collarbone that links the sternum and scapula.", "across the superior anterior thorax", "Collarbone of the pectoral girdle."],
      ["sternum-end-of-clavicle", "Sternal end of clavicle", "The medial end of the clavicle that articulates with the sternum.", "at the medial clavicle", "Medial clavicle end."],
      ["acromial-end-of-clavicle", "Acromial end of clavicle", "The lateral end of the clavicle that articulates with the acromion.", "at the lateral clavicle", "Lateral clavicle end near the shoulder."],
    ],
  },
  {
    boneId: "scapula",
    viewId: "scapula-slide",
    items: [
      ["scapula", "Scapula", "The flat triangular shoulder blade.", "posterior to the ribs of the upper back", "Shoulder blade."],
      ["acromion", "Acromion", "The lateral projection of the scapular spine that articulates with the clavicle.", "at the superior lateral scapula", "Shoulder tip that meets the clavicle."],
      ["coracoid-process", "Coracoid process", "The anterior hook-like projection of the scapula.", "projecting anteriorly from the superior scapula", "Hooked scapular process for muscle attachment."],
      ["glenoid-fossa", "Glenoid fossa", "The shallow depression of the scapula that articulates with the humerus.", "on the lateral scapula", "Shoulder socket on the scapula."],
      ["spine-of-scapula", "Spine of scapula", "The prominent posterior ridge across the scapula.", "across the posterior scapula", "Posterior scapular ridge."],
      ["supraspinous-fossa", "Supraspinous fossa", "The depression superior to the scapular spine.", "on the posterior scapula above the spine", "Posterior fossa above the spine."],
      ["infraspinous-fossa", "Infraspinous fossa", "The depression inferior to the scapular spine.", "on the posterior scapula below the spine", "Posterior fossa below the spine."],
      ["subscapular-fossa", "Subscapular fossa", "The broad depression on the anterior surface of the scapula.", "on the anterior scapula", "Anterior scapular fossa."],
      ["medial-border-of-scapula", "Medial border of scapula", "The vertebral border of the scapula.", "along the medial edge of the scapula", "Border closest to the vertebral column."],
      ["lateral-border-of-scapula", "Lateral border of scapula", "The axillary border of the scapula.", "along the lateral edge of the scapula", "Border closest to the armpit."],
      ["inferior-angle-of-scapula", "Inferior angle of scapula", "The pointed inferior corner of the scapula.", "at the bottom of the scapula", "Lowest tip of the scapula."],
    ],
  },
  {
    boneId: "humerus",
    viewId: "humerus-slide",
    items: [
      ["humerus", "Humerus", "The long bone of the arm.", "between the shoulder and the elbow", "Upper-arm bone."],
      ["head-of-humerus", "Head of humerus", "The rounded proximal articular surface of the humerus.", "at the proximal humerus", "Ball at the shoulder joint."],
      ["anatomical-neck-of-humerus", "Anatomical neck of humerus", "The groove immediately distal to the humeral head.", "surrounding the proximal humeral head", "Neck directly bordering the head."],
      ["surgical-neck-of-humerus", "Surgical neck of humerus", "The constricted region distal to the humeral tubercles.", "below the greater and lesser tubercles", "Common fracture site of the proximal humerus."],
      ["greater-tubercle-of-humerus", "Greater tubercle of humerus", "The larger lateral projection on the proximal humerus.", "lateral to the humeral head", "Large proximal humeral bump."],
      ["lesser-tubercle-of-humerus", "Lesser tubercle of humerus", "The smaller anterior projection on the proximal humerus.", "anterior to the humeral head", "Smaller proximal humeral bump."],
      ["intertubercular-sulcus", "Intertubercular sulcus", "The groove between the greater and lesser tubercles of the humerus.", "between the proximal humeral tubercles", "Bicipital groove of the humerus.", "Often called the intertubercular groove.", ["Intertubercular groove", "Bicipital groove"]],
      ["deltoid-tuberosity", "Deltoid tuberosity", "The roughened lateral shaft area where the deltoid inserts.", "on the lateral shaft of the humerus", "Deltoid insertion site on the humerus."],
      ["trochlea-of-humerus", "Trochlea of humerus", "The spool-shaped distal articular surface of the humerus for the ulna.", "at the distal medial humerus", "Spool-shaped humeral surface."],
      ["capitulum", "Capitulum", "The rounded distal articular surface of the humerus for the radius.", "at the distal lateral humerus", "Rounded articular knob on the humerus."],
      ["medial-epicondyle-of-humerus", "Medial epicondyle of humerus", "The medial projection superior to the trochlea.", "on the distal medial humerus", "Funny-bone side projection."],
      ["lateral-epicondyle-of-humerus", "Lateral epicondyle of humerus", "The lateral projection superior to the capitulum.", "on the distal lateral humerus", "Lateral distal humeral projection."],
      ["radial-fossa", "Radial fossa", "The depression above the capitulum that receives the head of the radius.", "on the anterior distal humerus above the capitulum", "Anterior fossa for the radius."],
      ["coronoid-fossa", "Coronoid fossa", "The depression above the trochlea that receives the ulna during flexion.", "on the anterior distal humerus above the trochlea", "Anterior fossa for the ulna."],
      ["olecranon-fossa", "Olecranon fossa", "The large posterior depression of the distal humerus for the ulna.", "on the posterior distal humerus", "Posterior elbow fossa."],
    ],
  },
  {
    boneId: "ulna",
    viewId: "ulna-slide",
    items: [
      ["ulna", "Ulna", "The medial long bone of the forearm.", "on the medial side of the forearm", "Pinky-side forearm bone."],
      ["olecranon-process-of-ulna", "Olecranon process of ulna", "The large proximal projection that forms the point of the elbow.", "at the proximal posterior ulna", "Point of the elbow."],
      ["trochlear-notch", "Trochlear notch", "The notch of the ulna that articulates with the trochlea of the humerus.", "between the olecranon and coronoid processes", "C-shaped notch of the ulna."],
      ["coronoid-process-of-ulna", "Coronoid process of ulna", "The anterior projection of the ulna below the trochlear notch.", "at the proximal anterior ulna", "Anterior lip of the trochlear notch."],
      ["radial-notch-of-ulna", "Radial notch of ulna", "The lateral notch of the ulna that articulates with the head of the radius.", "on the proximal lateral ulna", "Ulna surface for the radius."],
      ["head-of-ulna", "Head of ulna", "The rounded distal end of the ulna.", "at the distal ulna near the wrist", "Distal rounded end of the ulna."],
      ["ulnar-styloid-process", "Ulnar styloid process", "The pointed distal projection of the ulna.", "at the distal ulna near the head", "Pointed wrist projection of the ulna.", "", ["Styloid process of ulna"]],
    ],
  },
  {
    boneId: "radius",
    viewId: "radius-slide",
    items: [
      ["radius", "Radius", "The lateral long bone of the forearm.", "on the lateral side of the forearm", "Thumb-side forearm bone."],
      ["head-of-radius", "Head of radius", "The proximal disc-shaped end of the radius.", "at the proximal radius near the elbow", "Coin-shaped proximal radius."],
      ["radial-tuberosity", "Radial tuberosity", "The roughened prominence of the radius for muscle attachment.", "just distal to the head of the radius", "Biceps insertion area on the radius."],
      ["radial-styloid-process", "Radial styloid process", "The pointed distal projection on the lateral radius.", "at the distal lateral radius", "Lateral wrist projection of the radius.", "", ["Styloid process of radius"]],
      ["ulnar-notch-of-radius", "Ulnar notch of radius", "The distal notch on the radius for articulation with the ulna.", "at the distal medial radius", "Radius surface for the ulna."],
    ],
  },
  {
    boneId: "hand-carpals",
    viewId: "hand-carpals-slide",
    items: [
      ["scaphoid", "Scaphoid", "A carpal bone on the lateral proximal row of the wrist.", "in the proximal carpal row near the thumb side", "Thumb-side proximal carpal."],
      ["lunate", "Lunate", "A proximal-row carpal bone medial to the scaphoid.", "in the proximal carpal row near the center of the wrist", "Moon-shaped proximal carpal."],
      ["triquetrum", "Triquetrum", "A proximal-row carpal bone medial to the lunate.", "in the proximal carpal row on the ulnar side", "Triangular proximal carpal."],
      ["pisiform", "Pisiform", "A pea-shaped carpal bone on the anterior side of the triquetrum.", "on the medial proximal carpal row", "Pea-shaped carpal."],
      ["trapezium", "Trapezium", "A distal-row carpal bone at the base of the thumb.", "in the distal carpal row on the thumb side", "Thumb-base carpal."],
      ["trapezoid", "Trapezoid", "A distal-row carpal bone medial to the trapezium.", "in the distal carpal row between trapezium and capitate", "Small distal carpal next to trapezium."],
      ["capitate", "Capitate", "The largest carpal bone in the center of the distal row.", "in the middle of the distal carpal row", "Largest central carpal."],
      ["hamate", "Hamate", "A distal-row carpal bone on the medial side of the wrist.", "in the distal carpal row on the ulnar side", "Hooked medial distal carpal."],
      ["carpal-tunnel", "Carpal tunnel", "The passage formed at the anterior wrist beneath the flexor retinaculum.", "across the anterior carpal bones", "Tunnel for tendons and nerves at the wrist."],
    ],
  },
  {
    boneId: "hand-phalanges",
    viewId: "hand-phalanges-slide",
    items: [
      ["metacarpals", "Metacarpals", "The bones of the palm.", "between the carpals and proximal phalanges", "Palm bones numbered one through five."],
      ["proximal-phalanx-of-hand", "Proximal phalanx of hand", "The finger phalanx closest to the palm.", "immediately distal to the metacarpals", "First finger phalanx."],
      ["middle-phalanx-of-hand", "Middle phalanx of hand", "The middle phalanx of a finger.", "between the proximal and distal phalanges of most fingers", "Middle finger phalanx."],
      ["distal-phalanx-of-hand", "Distal phalanx of hand", "The terminal phalanx of a finger.", "at the fingertip", "Fingertip phalanx."],
      ["pollex", "Pollex", "The thumb, which has only two phalanges.", "on the lateral side of the hand", "Thumb of the hand."],
    ],
  },
  {
    boneId: "pelvic-overview",
    viewId: "pelvic-overview-slide",
    items: [
      ["pelvic-girdle", "Pelvic girdle", "The bony ring that attaches the lower limbs to the axial skeleton.", "between the vertebral column and lower limbs", "Hip girdle supporting the trunk."],
      ["coxal-bone", "Coxal bone", "One of the paired hip bones formed by fusion of the ilium, ischium, and pubis.", "on either side of the pelvis", "Hip bone of the pelvic girdle.", "", ["Hip bone", "Os coxae"]],
      ["acetabulum", "Acetabulum", "The deep socket where the coxal bone articulates with the head of the femur.", "on the lateral side of the hip bone", "Hip socket for the femur."],
    ],
  },
  {
    boneId: "pelvis",
    viewId: "pelvis-anterior-overview",
    items: [
      ["false-pelvis", "False pelvis", "The broad region superior to the pelvic brim.", "superior to the pelvic brim", "Flared upper pelvic region.", "", ["Greater pelvis"]],
      ["true-pelvis", "True pelvis", "The pelvic region inferior to the pelvic brim that encloses the pelvic cavity.", "below the pelvic brim", "Deeper lower pelvic basin.", "", ["Lesser pelvis"]],
      ["pubic-symphysis", "Pubic symphysis", "The fibrocartilaginous joint that unites the left and right pubic bones.", "at the anterior midline of the pelvis", "Anterior pelvic midline joint."],
      ["pubis", "Pubis", "The anterior portion of the hip bone.", "at the front of the os coxae", "Anterior hip-bone region.", "", ["Pubic bone"]],
      ["superior-pubic-ramus", "Superior pubic ramus", "The superior branch of the pubis.", "extending laterally from the pubis toward the acetabulum", "Upper branch of the pubis."],
      ["ilium", "Ilium", "The broad superior portion of the hip bone.", "forming the flared superior region of the os coxae", "Upper wing-like hip-bone region."],
      ["iliac-crest", "Iliac crest", "The superior curved ridge of the ilium.", "along the top border of the ilium", "Hands-on-hips ridge."],
      ["iliac-fossa", "Iliac fossa", "The smooth concavity on the internal surface of the ilium.", "on the medial surface of the ilium", "Scooped internal surface of the ilium."],
      ["sacroiliac-joint", "Sacroiliac joint", "The articulation between the sacrum and ilium.", "between the sacrum and ilium on either side", "Joint linking pelvis to the sacrum.", "", ["SI joint"]],
      ["ischium", "Ischium", "The posteroinferior portion of the hip bone.", "forming the lower posterior os coxae", "Posterior-inferior hip-bone region."],
      ["ischial-spine", "Ischial spine", "The sharp projection of the ischium between the sciatic notches.", "projecting from the posterior ischium", "Pointed ischial projection."],
      ["ischial-tuberosity", "Ischial tuberosity", "The large roughened projection of the ischium that bears weight while sitting.", "on the inferior ischium", "Sitting bone."],
      ["anterior-superior-iliac-spine", "Anterior superior iliac spine", "The anterior superior projection of the ilium.", "on the anterior end of the iliac crest", "ASIS at the front of the iliac crest.", "", ["ASIS"]],
      ["posterior-superior-iliac-spine", "Posterior superior iliac spine", "The posterior superior projection of the ilium.", "on the posterior end of the iliac crest", "PSIS at the back of the iliac crest.", "", ["PSIS"]],
      ["greater-sciatic-notch", "Greater sciatic notch", "The large posterior notch of the ilium used as a landmark for the sciatic nerve region.", "posterior to the ilium above the ischial spine", "Large posterior pelvic notch."],
      ["lesser-sciatic-notch", "Lesser sciatic notch", "The smaller posterior notch inferior to the ischial spine.", "posterior to the ischium below the ischial spine", "Small posterior pelvic notch below the spine."],
      ["pubic-crest", "Pubic crest", "The ridge on the superior border of the pubis.", "on the superior pubic body near the midline", "Ridge on the pubis near the symphysis."],
      ["pubic-tubercle", "Pubic tubercle", "The small projection on the pubis near the pubic crest.", "on the anterior pubis lateral to the symphysis", "Small anterior bump on the pubis."],
      ["obturator-foramen", "Obturator foramen", "The large opening formed by the pubis and ischium.", "inferior to the acetabulum in the hip bone", "Large hole of the hip bone."],
    ],
  },
  {
    boneId: "femur",
    viewId: "femur-proximal-anterior",
    items: [
      ["head-of-femur", "Head of femur", "The rounded proximal articular surface of the femur.", "at the proximal femur, medial to the greater trochanter", "Ball of the hip joint.", "", ["Femoral head"]],
      ["neck-of-femur", "Neck of femur", "The narrowed region connecting the head of the femur to the shaft.", "just distal to the head of the femur", "Narrow bridge below the head.", "", ["Femoral neck"]],
      ["greater-trochanter", "Greater trochanter", "The large lateral projection on the proximal femur.", "on the lateral proximal femur", "Large proximal lateral bump."],
      ["fovea-capitis", "Fovea capitis", "The pit on the head of the femur for ligament attachment.", "on the surface of the femoral head", "Small pit on the head of the femur."],
    ],
  },
  {
    boneId: "femur",
    viewId: "femur-distal-posterior",
    items: [
      ["lesser-trochanter", "Lesser trochanter", "The smaller medial projection on the proximal femur.", "inferior to the neck on the posteromedial femur", "Smaller proximal trochanter."],
      ["medial-supracondylar-ridge", "Medial supracondylar ridge", "The ridge extending superiorly from the medial distal femur.", "along the distal medial femur above the condyle", "Ridge running up from the medial distal femur."],
      ["medial-epicondyle-of-femur", "Medial epicondyle of femur", "The medial distal projection superior to the condyle.", "on the distal medial femur", "Medial projection above the femoral condyle."],
      ["intercondylar-fossa", "Intercondylar fossa", "The deep notch between the distal femoral condyles, best seen posteriorly.", "between the distal condyles on the posterior femur", "Deep posterior gap between the condyles.", "", ["Intercondylar notch"]],
    ],
  },
  {
    boneId: "femur",
    viewId: "femur-slide",
    items: [
      ["gluteal-tuberosity", "Gluteal tuberosity", "The roughened posterior shaft area of the femur for muscle attachment.", "on the posterior proximal shaft of the femur", "Posterior roughened line below the trochanters."],
      ["linea-aspera", "Linea aspera", "The prominent longitudinal ridge on the posterior femur.", "down the posterior shaft of the femur", "Posterior line of the femur."],
      ["lateral-epicondyle-of-femur", "Lateral epicondyle of femur", "The lateral distal projection superior to the condyle.", "on the distal lateral femur", "Lateral projection above the femoral condyle."],
      ["patellar-surface", "Patellar surface", "The anterior distal femoral surface that articulates with the patella.", "on the anterior distal femur between the condyles", "Smooth anterior surface for the patella."],
      ["medial-condyle-of-femur", "Medial condyle of femur", "The medial distal articular condyle of the femur.", "at the distal medial femur", "Medial articular end of the femur."],
      ["lateral-condyle-of-femur", "Lateral condyle of femur", "The lateral distal articular condyle of the femur.", "at the distal lateral femur", "Lateral articular end of the femur."],
    ],
  },
  {
    boneId: "patella",
    viewId: "patella-slide",
    items: [
      ["patella", "Patella", "The sesamoid bone of the knee embedded in a tendon.", "anterior to the knee joint", "Kneecap."],
      ["apex-of-patella", "Apex of patella", "The inferior pointed tip of the patella.", "at the inferior end of the patella", "Pointed bottom of the kneecap."],
    ],
  },
  {
    boneId: "tibia-fibula",
    viewId: "tibia-fibula-slide",
    items: [
      ["tibia", "Tibia", "The larger medial weight-bearing bone of the leg.", "on the medial side of the leg", "Shin bone."],
      ["fibula", "Fibula", "The slender lateral bone of the leg.", "on the lateral side of the leg", "Lateral stabilizing leg bone."],
      ["medial-condyle-of-tibia", "Medial condyle of tibia", "The medial proximal articular condyle of the tibia.", "at the proximal medial tibia", "Medial tibial condyle."],
      ["lateral-condyle-of-tibia", "Lateral condyle of tibia", "The lateral proximal articular condyle of the tibia.", "at the proximal lateral tibia", "Lateral tibial condyle."],
      ["medial-malleolus", "Medial malleolus", "The distal medial ankle projection of the tibia.", "at the distal tibia on the medial ankle", "Medial ankle bump."],
      ["tibial-tuberosity", "Tibial tuberosity", "The anterior proximal prominence of the tibia.", "on the anterior proximal tibia below the condyles", "Large bump below the knee on the tibia."],
      ["lateral-malleolus", "Lateral malleolus", "The distal lateral ankle projection of the fibula.", "at the distal fibula on the lateral ankle", "Lateral ankle bump."],
    ],
  },
  {
    boneId: "foot-tarsals",
    viewId: "tarsals-slide",
    items: [
      ["talus", "Talus", "The tarsal bone that articulates with the tibia and fibula.", "at the superior ankle among the tarsals", "Ankle bone that receives body weight."],
      ["calcaneus", "Calcaneus", "The heel bone of the foot.", "at the posterior foot beneath the talus", "Heel bone."],
      ["navicular", "Navicular", "A tarsal bone anterior to the talus on the medial foot.", "between the talus and cuneiforms", "Boat-shaped tarsal on the medial foot."],
      ["cuboid", "Cuboid", "A lateral tarsal bone anterior to the calcaneus.", "on the lateral side of the distal tarsus", "Cube-like lateral tarsal."],
      ["medial-cuneiform", "Medial cuneiform", "The most medial cuneiform bone of the foot.", "distal to the navicular on the medial foot", "Most medial wedge-shaped tarsal."],
      ["intermediate-cuneiform", "Intermediate cuneiform", "The middle cuneiform bone of the foot.", "between the medial and lateral cuneiforms", "Middle wedge-shaped tarsal."],
      ["lateral-cuneiform", "Lateral cuneiform", "The most lateral cuneiform bone of the foot.", "distal to the navicular on the lateral side of the cuneiform row", "Lateral wedge-shaped tarsal."],
    ],
  },
  {
    boneId: "foot-phalanges",
    viewId: "foot-phalanges-slide",
    items: [
      ["metatarsals-of-foot", "Metatarsals of foot", "The long bones of the instep.", "between the tarsals and toe phalanges", "Instep bones of the foot."],
      ["proximal-phalanx-of-foot", "Proximal phalanx of foot", "The toe phalanx closest to the metatarsals.", "immediately distal to the metatarsals", "First toe phalanx."],
      ["middle-phalanx-of-foot", "Middle phalanx of foot", "The middle toe phalanx of most digits.", "between the proximal and distal toe phalanges", "Middle toe phalanx."],
      ["distal-phalanx-of-foot", "Distal phalanx of foot", "The terminal toe phalanx.", "at the end of a toe", "Toe-tip phalanx."],
      ["hallux", "Hallux", "The great toe, which has only two phalanges.", "on the medial side of the foot", "Big toe of the foot."],
    ],
  },
)

structureGroups.push(
  {
    boneId: "mandible",
    viewId: "mandible-slide",
    items: [
      ["mandible", "Mandible", "The lower jaw bone.", "forming the lower jaw and chin", "Movable lower jaw bone."],
      ["alveoli-of-mandible", "Alveoli of mandible", "The tooth sockets in the mandible.", "along the superior border of the mandible", "Mandibular tooth sockets."],
      ["body-of-mandible", "Body of mandible", "The horizontal anterior portion of the mandible that forms the chin.", "at the anterior mandible", "Main chin-forming part of the mandible."],
      ["ramus-of-mandible", "Ramus of mandible", "The vertical posterior part of the mandible.", "rising upward from the posterior mandible", "Vertical branch of the mandible."],
      ["mandibular-condyle", "Mandibular condyle", "The condylar process of the mandible that articulates with the temporal bone.", "at the superior posterior mandible", "TMJ articular knob of the mandible."],
      ["coronoid-process-of-mandible", "Coronoid process of mandible", "The superior anterior process of the mandible for muscle attachment.", "at the superior anterior ramus", "Anterior upward jaw process."],
      ["mental-foramen", "Mental foramen", "The opening in the mandible for blood vessels and nerves.", "on the anterior body of the mandible", "Anterior jaw foramen near the chin."],
    ],
  },
  {
    boneId: "maxilla",
    viewId: "maxilla-slide",
    items: [
      ["maxilla", "Maxilla", "The paired facial bone that forms the upper jaw.", "at the upper jaw and central face", "Upper jaw bone."],
      ["alveoli-of-maxilla", "Alveoli of maxilla", "The tooth sockets in the maxilla.", "along the inferior border of the maxilla", "Upper tooth sockets."],
      ["palatine-process-of-maxilla", "Palatine process of maxilla", "The process of the maxilla that forms the anterior hard palate.", "projecting medially from the maxilla", "Anterior hard palate contribution."],
      ["maxillary-sinus", "Maxillary sinus", "The large paranasal sinus within the maxilla.", "inside the maxilla beside the nasal cavity", "Large sinus in the cheek region."],
      ["infraorbital-foramen", "Infraorbital foramen", "The opening in the maxilla below the orbit for nerves and vessels.", "inferior to the eye orbit on the maxilla", "Foramen below the orbit."],
    ],
  },
  {
    boneId: "zygomatic-bone",
    viewId: "zygomatic-bone-slide",
    items: [
      ["zygomatic-bone", "Zygomatic bone", "The facial bone that forms the prominence of the cheek.", "at the lateral cheek and orbit", "Cheekbone."],
      ["temporal-process-of-zygomatic-bone", "Temporal process of zygomatic bone", "The posterior process of the zygomatic bone that joins the temporal bone.", "extending posteriorly from the zygomatic bone", "Zygomatic contribution to the arch."],
      ["zygomatic-arch", "Zygomatic arch", "The arch formed by the zygomatic bone and temporal bone.", "across the lateral face between the zygomatic and temporal bones", "Cheek arch on the lateral skull."],
    ],
  },
  {
    boneId: "palatine-bone",
    viewId: "palatine-bone-slide",
    items: [
      ["palatine-bone", "Palatine bone", "The facial bone that forms the posterior portion of the hard palate.", "posterior to the palatine processes of the maxillae", "Posterior hard-palate bone."],
      ["hard-palate", "Hard palate", "The bony roof of the mouth formed by the maxillae and palatine bones.", "forming the anterior roof of the mouth", "Bony palate beneath the nasal cavity."],
    ],
  },
  {
    boneId: "hyoid-bone",
    viewId: "hyoid-slide",
    items: [
      ["hyoid-bone", "Hyoid bone", "The bone inferior to the mandible that does not directly articulate with other bones.", "in the anterior neck below the mandible", "Supports the tongue without a direct bony joint."],
    ],
  },
  {
    boneId: "vertebral-overview",
    viewId: "vertebral-column-slide",
    items: [
      ["vertebral-column", "Vertebral column", "The bony column that extends from the skull to the pelvis.", "along the posterior midline of the trunk", "Think spine from skull to pelvis."],
      ["intervertebral-disc", "Intervertebral disc", "The fibrocartilaginous disc between adjacent vertebrae.", "between vertebral bodies", "Shock-absorbing pad between vertebrae."],
      ["coccyx", "Coccyx", "The tailbone formed by fused reduced-size vertebrae.", "inferior to the sacrum", "Tailbone at the base of the spine."],
    ],
  },
  {
    boneId: "typical-vertebra",
    viewId: "typical-vertebra-slide",
    items: [
      ["vertebral-body", "Vertebral body", "The weight-bearing anterior part of a vertebra.", "at the anterior portion of a vertebra", "Large front portion of a vertebra."],
      ["pedicle", "Pedicle", "The short bridge connecting the vertebral body to the arch.", "between the vertebral body and the vertebral arch", "Bridge from body to arch."],
      ["vertebral-foramen", "Vertebral foramen", "The opening within a vertebra that encloses the spinal cord.", "inside the vertebral arch behind the body", "Spinal-cord opening through a vertebra."],
      ["intervertebral-foramen", "Intervertebral foramen", "The opening between adjacent vertebrae for spinal nerves.", "between neighboring vertebrae", "Nerve-exit opening between vertebrae."],
      ["spinous-process", "Spinous process", "The posterior projecting process of a vertebra.", "projecting posteriorly from the vertebral arch", "Midline posterior vertebral projection."],
      ["transverse-process", "Transverse process", "The lateral projecting process of a vertebra.", "projecting laterally from the vertebral arch", "Side projection of a vertebra."],
      ["superior-articular-process", "Superior articular process", "The superior process that articulates with the vertebra above.", "on the superior posterior vertebral arch", "Superior vertebral articulation point."],
      ["inferior-articular-process", "Inferior articular process", "The inferior process that articulates with the vertebra below.", "on the inferior posterior vertebral arch", "Inferior vertebral articulation point."],
    ],
  },
  {
    boneId: "atlas",
    viewId: "atlas-slide",
    items: [
      ["atlas-c1", "Atlas (C1)", "The first cervical vertebra that supports the skull.", "immediately inferior to the occipital condyles", "First cervical vertebra for nodding yes."],
      ["lateral-mass-of-atlas", "Lateral mass of atlas", "The enlarged lateral portion of the atlas that articulates with the occipital condyles.", "on each side of the atlas", "Atlas articulation mass for the skull."],
    ],
  },
  {
    boneId: "axis",
    viewId: "axis-slide",
    items: [
      ["axis-c2", "Axis (C2)", "The second cervical vertebra that enables head rotation.", "inferior to the atlas", "Second cervical vertebra for shaking no."],
      ["dens", "Dens", "The tooth-like projection of the axis.", "projecting superiorly from the axis", "Odontoid peg on C2.", "Also called the odontoid process.", ["Odontoid process"]],
    ],
  },
  {
    boneId: "cervical-vertebra",
    viewId: "c3-c7-slide",
    items: [
      ["cervical-vertebra", "Cervical vertebra", "A vertebra of the cervical region with a large vertebral foramen and transverse foramina.", "in the neck region of the vertebral column", "Neck vertebra with transverse foramina."],
      ["transverse-foramen", "Transverse foramen", "The opening in a cervical vertebra's transverse process.", "within the transverse processes of cervical vertebrae", "Cervical-only opening in the transverse process."],
      ["bifid-spinous-process", "Bifid spinous process", "A split spinous process typical of many cervical vertebrae.", "at the posterior process of C3-C7", "Forked cervical spinous process."],
    ],
  },
  {
    boneId: "thoracic-vertebra",
    viewId: "thoracic-vertebra-slide",
    items: [
      ["thoracic-vertebra", "Thoracic vertebra", "A vertebra of the thoracic region that articulates with ribs.", "in the thoracic segment of the vertebral column", "Mid-back vertebra — the one with facets for ribs."],
      ["demifacet", "Demifacet", "A partial articular facet on a thoracic vertebral body for a rib head.", "on the body of a thoracic vertebra", "Partial rib facet on a thoracic body."],
    ],
  },
  {
    boneId: "lumbar-vertebra",
    viewId: "lumbar-vertebra-slide",
    items: [
      ["lumbar-vertebra", "Lumbar vertebra", "A large vertebra of the lower back built for support.", "in the lumbar region of the vertebral column", "Big support-focused vertebra of the lower back."],
    ],
  },
  {
    boneId: "sacrum",
    viewId: "sacrum-slide",
    items: [
      ["sacrum", "Sacrum", "The fused bone formed by sacral vertebrae at the base of the vertebral column.", "between the hip bones at the posterior pelvis", "Fused base of the spine."],
      ["sacral-promontory", "Sacral promontory", "The projecting anterior superior margin of the sacrum.", "at the superior anterior edge of the sacrum", "Anterior lip of the sacrum."],
      ["ala-of-sacrum", "Ala of sacrum", "The wing-like lateral expansion of the sacrum.", "on the superior lateral sacrum", "Wing of the sacrum."],
      ["sacral-canal", "Sacral canal", "The continuation of the vertebral canal within the sacrum.", "running down the posterior sacrum", "Canal inside the sacrum."],
      ["sacral-hiatus", "Sacral hiatus", "The inferior opening of the sacral canal.", "at the inferior posterior sacrum", "Bottom opening of the sacral canal."],
    ],
  },
  {
    boneId: "sternum",
    viewId: "sternum-slide",
    items: [
      ["sternum", "Sternum", "The flat bone in the anterior thorax.", "at the midline anterior chest", "Breastbone."],
      ["manubrium", "Manubrium", "The superior part of the sternum.", "at the superior sternum", "Top segment of the sternum."],
      ["body-of-sternum", "Body of sternum", "The long middle portion of the sternum.", "inferior to the manubrium", "Main central part of the sternum."],
      ["xiphoid-process", "Xiphoid process", "The inferior tip of the sternum.", "at the inferior end of the sternum", "Bottom tip of the sternum."],
      ["clavicular-notch", "Clavicular notch", "The notch on the manubrium where the clavicle articulates.", "on the superior lateral manubrium", "Clavicle articulation notch on the sternum."],
    ],
  },
  {
    boneId: "ribs",
    viewId: "ribs-slide",
    items: [
      ["rib", "Rib", "A curved bone of the thoracic cage.", "forming the thoracic cage between the vertebral column and sternum", "Think one curved thoracic cage bone."],
      ["head-of-rib", "Head of rib", "The posterior end of a rib that articulates with vertebral bodies.", "at the posterior rib end", "Posterior rib head with articular facets."],
      ["tubercle-of-rib", "Tubercle of rib", "The projection on a rib that articulates with a thoracic transverse process.", "just lateral to the head and neck of a rib", "Rib bump that meets the transverse process."],
      ["shaft-of-rib", "Shaft of rib", "The long curved body of a rib.", "along the length of a rib", "Main curved portion of the rib."],
      ["costal-cartilage", "Costal cartilage", "The cartilage connecting ribs to the sternum.", "at the anterior ends of the ribs", "Flexible anterior rib connection."],
      ["true-ribs", "True ribs", "The ribs that attach directly to the sternum.", "ribs 1 through 7 of the thoracic cage", "Direct sternal rib group."],
      ["false-ribs", "False ribs", "The ribs that do not attach directly to the sternum.", "ribs 8 through 12 of the thoracic cage", "Indirect or absent sternal attachment group."],
      ["floating-ribs", "Floating ribs", "The ribs that have no anterior attachment to the sternum.", "the most inferior ribs of the thoracic cage", "Lowest ribs with free anterior ends."],
    ],
  },
)

const structures = structureGroups.flatMap(({ boneId, viewId, items }) =>
  items.map((item) => createStructure(boneId, viewId, item)),
)

const bonesModule = {
  id: "bones",
  chapterId: chapter.id,
  chapterLabel: `${chapter.label} • ${chapter.title}`,
  label: "Bones Lab",
  category: "Chapter 7 skeletal anatomy",
  examFocus:
    "Practice Chapter 7 skeletal landmarks and bone names with image-backed study, exact typed recall, multiple-choice review, and honest weak-spot tracking.",
  description:
    "A broad Chapter 7 skeletal-system study set organized by region, bone, view, and structure so you can drill the same content several different ways.",
  chapters: [chapter],
  regions,
  bones,
  views,
  structures,
}

export const anatomyModules = [bonesModule]

export const bonesLabModule = bonesModule
