const BASE = import.meta.env?.BASE_URL ?? "/"

export const CHAPTER_FIGURES = {
  "chapter-6": [
    {
      id: "ch6-fig-1",
      title: "Classification of Bones by Shape",
      caption: "Long, short, flat, and irregular bones compared across the human skeleton.",
      src: `${BASE}anatomy/chapter6/bone-shapes.jpeg`,
      sourceBadge: "Course Textbook / Lecture Figure",
      keyTakeaway: "Sternum and skull bones are flat bones; vertebrae and hip bones are irregular.",
    },
    {
      id: "ch6-fig-2",
      title: "Gross Anatomy of a Long Bone",
      caption: "Diaphysis (compact bone shaft), epiphyses (spongy bone ends), medullary cavity, and periosteum.",
      src: `${BASE}anatomy/chapter6/long-bone-anatomy.jpeg`,
      sourceBadge: "Course Textbook / Lecture Figure",
      keyTakeaway: "The epiphyseal plate (hyaline cartilage) enables interstitial lengthwise growth.",
    },
    {
      id: "ch6-fig-3",
      title: "Bone Cell Lineage & Functions",
      caption: "Osteogenic stem cells, matrix-building osteoblasts, maintaining osteocytes, and resorbing osteoclasts.",
      src: `${BASE}anatomy/chapter6/bone-cells.jpeg`,
      sourceBadge: "Course Textbook / Lecture Figure",
      keyTakeaway: "Osteoblasts build bone matrix; osteoclasts break down matrix for calcium release.",
    },
    {
      id: "ch6-fig-4",
      title: "Microscopic Anatomy: Compact Bone Osteon",
      caption: "Concentric lamellae surrounding a central (Haversian) canal, connected by perforating canals and canaliculi.",
      src: `${BASE}anatomy/chapter6/compact-bone-osteon.jpeg`,
      sourceBadge: "Course Textbook / Lecture Figure",
      keyTakeaway: "Canaliculi connect lacunae so osteocytes can exchange nutrients through solid matrix.",
    },
    {
      id: "ch6-fig-5",
      title: "Spongy Bone & Trabecular Network",
      caption: "Honeycomb trabeculae aligned along lines of mechanical stress without central canals.",
      src: `${BASE}anatomy/chapter6/spongy-bone-trabeculae.jpeg`,
      sourceBadge: "Course Textbook / Lecture Figure",
      keyTakeaway: "Spongy bone lacks osteons and houses red bone marrow for hematopoiesis.",
    },
    {
      id: "ch6-fig-6",
      title: "Endochondral Ossification Stages",
      caption: "Replacement of a hyaline cartilage model with bone, from bone collar formation to secondary ossification centers.",
      src: `${BASE}anatomy/chapter6/endochondral-ossification.jpeg`,
      sourceBadge: "Course Textbook / Lecture Figure",
      keyTakeaway: "Most bones inferior to the skull develop via endochondral ossification.",
    },
    {
      id: "ch6-fig-7",
      title: "Epiphyseal Plate Zones & Interstitial Growth",
      caption: "Proliferation, hypertrophy, calcification, and ossification zones at the metaphysis.",
      src: `${BASE}anatomy/chapter6/epiphyseal-growth-plate.jpeg`,
      sourceBadge: "Course Textbook / Lecture Figure",
      keyTakeaway: "Chondrocytes divide on the epiphyseal side while osteoblasts ossify on the diaphyseal side.",
    },
    {
      id: "ch6-fig-8",
      title: "Calcium Homeostasis & Hormonal Control",
      caption: "Parathyroid hormone (PTH) feedback loop regulating blood Ca²⁺ via osteoclast stimulation.",
      src: `${BASE}anatomy/chapter6/calcium-homeostasis.jpeg`,
      sourceBadge: "Course Textbook / Lecture Figure",
      keyTakeaway: "PTH raises blood calcium when levels drop; mechanical stress drives local remodeling.",
    },
    {
      id: "ch6-fig-9",
      title: "Stages of Bone Fracture Repair",
      caption: "Hematoma formation, fibrocartilaginous callus, bony callus, and final bone remodeling.",
      src: `${BASE}anatomy/chapter6/fracture-healing.jpeg`,
      sourceBadge: "Course Textbook / Lecture Figure",
      keyTakeaway: "A soft fibrocartilage callus forms first before converting to a spongy bony callus.",
    },
  ],
  "chapter-7": [
    {
      id: "ch7-fig-1",
      title: "Axial vs. Appendicular Skeleton Overview",
      caption: "Color-coded division of the 80 axial bones and 126 appendicular bones.",
      src: `${BASE}anatomy/chapter7/axial-skeleton.png`,
      sourceBadge: "Course Textbook / Lecture Figure",
      keyTakeaway: "Axial = skull, vertebral column, thoracic cage; Appendicular = limbs + pectoral/pelvic girdles.",
    },
    {
      id: "ch7-fig-2",
      title: "Anterior & Lateral Skull Landmarks",
      caption: "Cranial and facial bones including frontal, parietal, temporal, zygomatic, maxilla, and mandible.",
      src: `${BASE}anatomy/chapter7/frontal-bone.png`,
      sourceBadge: "Course Textbook / Lecture Figure",
      keyTakeaway: "8 cranial bones protect the brain; 14 facial bones support entrances and facial muscles.",
    },
    {
      id: "ch7-fig-3",
      title: "Sphenoid Bone (Keystone of the Cranial Floor)",
      caption: "Superior view showing sella turcica, greater and lesser wings, and optic canals.",
      src: `${BASE}anatomy/chapter7/sphenoid-bone.png`,
      sourceBadge: "Course Textbook / Lecture Figure",
      keyTakeaway: "The sella turcica ('Turkish saddle') houses the pituitary gland.",
    },
    {
      id: "ch7-fig-4",
      title: "Vertebral Column Curvatures & Regions",
      caption: "7 cervical, 12 thoracic, 5 lumbar, sacrum, and coccyx with primary and secondary curvatures.",
      src: `${BASE}anatomy/chapter7/vertebral-column.png`,
      sourceBadge: "Course Textbook / Lecture Figure",
      keyTakeaway: "Cervical vertebrae have transverse foramina; thoracic have costal facets; lumbar have massive bodies.",
    },
    {
      id: "ch7-fig-5",
      title: "Atlas (C1) and Axis (C2) Articulation",
      caption: "Superior and posterolateral views of C1 and the dens (odontoid process) of C2.",
      src: `${BASE}anatomy/chapter7/axis-c2.png`,
      sourceBadge: "Course Textbook / Lecture Figure",
      keyTakeaway: "Atlas (C1) nods 'yes'; the dens of Axis (C2) pivots to shake the head 'no'.",
    },
    {
      id: "ch7-fig-6",
      title: "Bony Thorax: Sternum & Ribs",
      caption: "Manubrium, body, xiphoid process, true ribs (1–7), false ribs (8–12), and floating ribs (11–12).",
      src: `${BASE}anatomy/chapter7/bony-thorax.png`,
      sourceBadge: "Course Textbook / Lecture Figure",
      keyTakeaway: "True ribs attach directly to the sternum via individual costal cartilages.",
    },
    {
      id: "ch7-fig-7",
      title: "Pectoral Girdle & Scapular Landmarks",
      caption: "Clavicle and scapula showing acromion, coracoid process, glenoid cavity, and spine.",
      src: `${BASE}anatomy/chapter7/scapula.png`,
      sourceBadge: "Course Textbook / Lecture Figure",
      keyTakeaway: "The shallow glenoid cavity articulates with the head of the humerus for maximum shoulder mobility.",
    },
    {
      id: "ch7-fig-8",
      title: "Upper Limb: Humerus, Radius & Ulna",
      caption: "Arm and forearm bones in anatomical position (radius lateral, ulna medial).",
      src: `${BASE}anatomy/chapter7/humerus.png`,
      sourceBadge: "Course Textbook / Lecture Figure",
      keyTakeaway: "Trochlea of humerus articulates with the ulnar trochlear notch; capitulum meets the radial head.",
    },
    {
      id: "ch7-fig-9",
      title: "Pelvic Girdle: Ilium, Ischium & Pubis",
      caption: "Fused coxal bone regions meeting at the deep socket of the acetabulum.",
      src: `${BASE}anatomy/chapter7/pelvic-girdle.png`,
      sourceBadge: "Course Textbook / Lecture Figure",
      keyTakeaway: "The sacroiliac joint links the pelvis to the axial skeleton; pubic bones meet at the pubic symphysis.",
    },
    {
      id: "ch7-fig-10",
      title: "Lower Limb: Femur, Tibia & Fibula",
      caption: "Head, neck, trochanters, and condyles of the femur; medial weight-bearing tibia and lateral fibula.",
      src: `${BASE}anatomy/chapter7/tibia-fibula.png`,
      sourceBadge: "Course Textbook / Lecture Figure",
      keyTakeaway: "The tibia bears body weight and forms the medial malleolus; the fibula forms the lateral malleolus.",
    },
  ],
  "chapter-8": [
    {
      id: "ch8-fig-1",
      title: "Functional & Structural Classification of Joints",
      caption: "Comparing synarthroses (immovable), amphiarthroses (slightly movable), and diarthroses (freely movable).",
      src: `${BASE}anatomy/chapter8/functional-joints.jpeg`,
      sourceBadge: "Course Textbook / Lecture Figure",
      keyTakeaway: "All synovial joints are functionally classified as diarthroses.",
    },
    {
      id: "ch8-fig-2",
      title: "Fibrous Joints: Sutures, Syndesmoses & Gomphoses",
      caption: "Dense fibrous connective tissue uniting bones without a joint cavity.",
      src: `${BASE}anatomy/chapter8/fibrous-joints.jpeg`,
      sourceBadge: "Course Textbook / Lecture Figure",
      keyTakeaway: "Skull sutures and tooth-in-socket gomphoses are immovable fibrous joints.",
    },
    {
      id: "ch8-fig-3",
      title: "Cartilaginous Joints: Synchondroses & Symphyses",
      caption: "Hyaline cartilage epiphyseal plates (synchondroses) vs. fibrocartilage intervertebral discs & pubic symphysis.",
      src: `${BASE}anatomy/chapter8/cartilaginous-joints.jpeg`,
      sourceBadge: "Course Textbook / Lecture Figure",
      keyTakeaway: "Synchondroses use hyaline cartilage; symphyses use compressible fibrocartilage.",
    },
    {
      id: "ch8-fig-4",
      title: "General Structure of a Synovial Joint",
      caption: "Articular cartilage, joint cavity with synovial fluid, double-layered capsule, and reinforcing ligaments.",
      src: `${BASE}anatomy/chapter8/synovial-joint-structure.jpeg`,
      sourceBadge: "Course Textbook / Lecture Figure",
      keyTakeaway: "Muscle tone crossing the joint is typically the most important stabilizing factor.",
    },
    {
      id: "ch8-fig-5",
      title: "Bursae & Tendon Sheaths",
      caption: "Flattened synovial sacs and elongated sleeves that reduce friction where tendons rub against bone.",
      src: `${BASE}anatomy/chapter8/bursae-tendon-sheaths.jpeg`,
      sourceBadge: "Course Textbook / Lecture Figure",
      keyTakeaway: "Bursae are friction-reducing cushions outside the main joint cavity.",
    },
    {
      id: "ch8-fig-6",
      title: "Synovial Angular Movements",
      caption: "Flexion, extension, hyperextension, abduction, adduction, and circumduction.",
      src: `${BASE}anatomy/chapter8/angular-movements.jpeg`,
      sourceBadge: "Course Textbook / Lecture Figure",
      keyTakeaway: "Abduction moves a limb away from the midline; adduction brings it back toward the midline.",
    },
    {
      id: "ch8-fig-7",
      title: "Six Types of Synovial Joints",
      caption: "Plane, hinge, pivot, condyloid, saddle, and ball-and-socket joint geometry.",
      src: `${BASE}anatomy/chapter8/ball-and-socket-saddle.jpeg`,
      sourceBadge: "Course Textbook / Lecture Figure",
      keyTakeaway: "Hinge (elbow/knee) is uniaxial; ball-and-socket (shoulder/hip) is multiaxial.",
    },
    {
      id: "ch8-fig-8",
      title: "Anatomy of the Knee Joint",
      caption: "Tibial/fibular collateral ligaments, anterior/posterior cruciate ligaments (ACL/PCL), and fibrocartilage menisci.",
      src: `${BASE}anatomy/chapter8/knee-joint-anatomy.jpeg`,
      sourceBadge: "Course Textbook / Lecture Figure",
      keyTakeaway: "The ACL prevents anterior sliding of the tibia and checks hyperextension of the knee.",
    },
    {
      id: "ch8-fig-9",
      title: "Arthritis & Joint Homeostasis",
      caption: "Wear-and-tear osteoarthritis vs. autoimmune rheumatoid arthritis and uric-acid gouty arthritis.",
      src: `${BASE}anatomy/chapter8/arthritis-comparison.jpeg`,
      sourceBadge: "Course Textbook / Lecture Figure",
      keyTakeaway: "Osteoarthritis is degenerative cartilage wear; rheumatoid is autoimmune synovial membrane inflammation.",
    },
  ],
  "chapter-9": [
    {
      id: "ch9-fig-1",
      title: "Skeletal, Cardiac, and Smooth Muscle Comparison",
      caption: "Histological appearance, striations, nuclei, control (voluntary vs. involuntary), and location.",
      src: `${BASE}anatomy/chapter9/muscle-tissue-types.jpeg`,
      sourceBadge: "Course Textbook / Lecture Figure",
      keyTakeaway: "Skeletal is striated & voluntary; cardiac is striated & involuntary with intercalated discs; smooth is non-striated & involuntary.",
    },
    {
      id: "ch9-fig-2",
      title: "Connective Tissue Wrappings of Skeletal Muscle",
      caption: "Epimysium (whole muscle), perimysium (fascicles), and endomysium (individual muscle fibers).",
      src: `${BASE}anatomy/chapter9/muscle-sheaths.jpeg`,
      sourceBadge: "Course Textbook / Lecture Figure",
      keyTakeaway: "From outer to inner: Epimysium → Perimysium (around fascicles) → Endomysium (around each fiber).",
    },
    {
      id: "ch9-fig-3",
      title: "Levels of Organization: Muscle to Myofilaments",
      caption: "Whole muscle → fascicle → muscle fiber (cell) → myofibril → sarcomere → thick/thin filaments.",
      src: `${BASE}anatomy/chapter9/muscle-organization-levels.jpeg`,
      sourceBadge: "Course Textbook / Lecture Figure",
      keyTakeaway: "Each muscle fiber contains hundreds of rod-like myofibrils built from repeating sarcomeres.",
    },
    {
      id: "ch9-fig-4",
      title: "Sarcomere Banding Pattern (Z Disc, A Band, I Band)",
      caption: "Thick (myosin) and thin (actin) filament overlap producing dark A bands and light I bands.",
      src: `${BASE}anatomy/chapter9/sarcomere-banding.jpeg`,
      sourceBadge: "Course Textbook / Lecture Figure",
      keyTakeaway: "A sarcomere runs from Z disc to Z disc; the A band length stays constant during contraction.",
    },
    {
      id: "ch9-fig-5",
      title: "Thick (Myosin) & Thin (Actin, Troponin, Tropomyosin) Filaments",
      caption: "Myosin golf-club heads with ATP-binding sites and actin strands regulated by troponin-tropomyosin.",
      src: `${BASE}anatomy/chapter9/myosin-actin-filaments.jpeg`,
      sourceBadge: "Course Textbook / Lecture Figure",
      keyTakeaway: "Ca²⁺ binds to troponin, shifting tropomyosin to expose myosin-binding sites on actin.",
    },
    {
      id: "ch9-fig-6",
      title: "Sarcoplasmic Reticulum & T-Tubule Triads",
      caption: "Sarcolemma invaginations (T-tubules) flanked by terminal cisternae of the sarcoplasmic reticulum.",
      src: `${BASE}anatomy/chapter9/sarcoplasmic-reticulum-tubules.jpeg`,
      sourceBadge: "Course Textbook / Lecture Figure",
      keyTakeaway: "T-tubules conduct action potentials deep into the cell so the SR releases Ca²⁺ simultaneously.",
    },
    {
      id: "ch9-fig-7",
      title: "Sliding-Filament Mechanism of Contraction",
      caption: "Thin filaments slide toward the M line as Z discs pull closer together; filament lengths never change.",
      src: `${BASE}anatomy/chapter9/sliding-filament-mechanism.jpeg`,
      sourceBadge: "Course Textbook / Lecture Figure",
      keyTakeaway: "During contraction, the I band and H zone narrow, the Z discs move closer, and the A band stays the same width.",
    },
    {
      id: "ch9-fig-8",
      title: "Cross-Bridge Cycle & Power Stroke",
      caption: "1. Cross-bridge formation → 2. Power stroke (ADP+Pi released) → 3. Cross-bridge detachment (new ATP binds) → 4. Cocking of myosin head.",
      src: `${BASE}anatomy/chapter9/crossbridge-power-stroke.jpeg`,
      sourceBadge: "Course Textbook / Lecture Figure",
      keyTakeaway: "Fresh ATP binding is required to detach the myosin head from actin (lack of ATP causes rigor mortis).",
    },
    {
      id: "ch9-fig-9",
      title: "Excitation-Contraction Coupling",
      caption: "ACh release at the neuromuscular junction → end-plate potential → T-tubule wave → SR Ca²⁺ release → cross-bridge cycling.",
      src: `${BASE}anatomy/chapter9/excitation-contraction-coupling.png`,
      sourceBadge: "Course Textbook / Lecture Figure",
      keyTakeaway: "Acetylcholine (ACh) opens Na⁺ channels at the motor end plate to trigger the muscle action potential.",
    },
  ],
}

export function getFiguresForChapter(chapterId) {
  return CHAPTER_FIGURES[chapterId] ?? []
}

CHAPTER_FIGURES["chapter-1"] = [
  {
    id: "ch1-fig-1",
    title: "Body Planes & Anatomical Directions",
    caption: "Sagittal (left/right), Frontal/Coronal (anterior/posterior), and Transverse (superior/inferior) planes.",
    src: "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20760%20370%22%20width%3D%22760%22%20height%3D%22370%22%3E%0A%20%20%20%20%3Crect%20width%3D%22760%22%20height%3D%22370%22%20rx%3D%2220%22%20fill%3D%22%23eef3f0%22%2F%3E%0A%20%20%20%20%3Ctext%20x%3D%2240%22%20y%3D%2252%22%20font-family%3D%22sans-serif%22%20font-size%3D%2222%22%20font-weight%3D%22800%22%20fill%3D%22%23172e32%22%3EChapter%201%20%C2%B7%20Anatomical%20Planes%20%26%20Cavities%3C%2Ftext%3E%0A%20%20%20%20%3Ctext%20x%3D%2240%22%20y%3D%2280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2214%22%20fill%3D%22%2352656a%22%3EStandard%20anatomical%20position%20reference%20map%3C%2Ftext%3E%0A%20%20%20%20%0A%20%20%20%20%20%20%3Cg%20transform%3D%22translate(40%2C%20115)%22%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%22330%22%20height%3D%2294%22%20rx%3D%2214%22%20fill%3D%22%23ffffff%22%20stroke%3D%22%23186c64%22%20stroke-width%3D%222%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%2210%22%20height%3D%2294%22%20rx%3D%225%22%20fill%3D%22%23186c64%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2234%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22700%22%20fill%3D%22%23172e32%22%3ESagittal%20Plane%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2260%22%20font-family%3D%22sans-serif%22%20font-size%3D%2213%22%20fill%3D%22%23475569%22%3EDivides%20body%20into%20left%20and%20right%20portions%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20font-weight%3D%22600%22%20fill%3D%22%23186c64%22%3EMidsagittal%20%3D%20equal%20halves%3C%2Ftext%3E%0A%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%0A%20%20%20%20%20%20%3Cg%20transform%3D%22translate(400%2C%20115)%22%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%22330%22%20height%3D%2294%22%20rx%3D%2214%22%20fill%3D%22%23ffffff%22%20stroke%3D%22%23186c64%22%20stroke-width%3D%222%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%2210%22%20height%3D%2294%22%20rx%3D%225%22%20fill%3D%22%23186c64%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2234%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22700%22%20fill%3D%22%23172e32%22%3EFrontal%20(Coronal)%20Plane%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2260%22%20font-family%3D%22sans-serif%22%20font-size%3D%2213%22%20fill%3D%22%23475569%22%3EDivides%20body%20into%20anterior%20%26%20posterior%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20font-weight%3D%22600%22%20fill%3D%22%23186c64%22%3EFace%20vs.%20back%20view%3C%2Ftext%3E%0A%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%0A%20%20%20%20%20%20%3Cg%20transform%3D%22translate(40%2C%20230)%22%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%22330%22%20height%3D%2294%22%20rx%3D%2214%22%20fill%3D%22%23ffffff%22%20stroke%3D%22%23186c64%22%20stroke-width%3D%222%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%2210%22%20height%3D%2294%22%20rx%3D%225%22%20fill%3D%22%23186c64%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2234%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22700%22%20fill%3D%22%23172e32%22%3ETransverse%20Plane%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2260%22%20font-family%3D%22sans-serif%22%20font-size%3D%2213%22%20fill%3D%22%23475569%22%3EDivides%20body%20into%20superior%20%26%20inferior%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20font-weight%3D%22600%22%20fill%3D%22%23186c64%22%3ECross-sectional%20imaging%3C%2Ftext%3E%0A%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%0A%20%20%20%20%20%20%3Cg%20transform%3D%22translate(400%2C%20230)%22%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%22330%22%20height%3D%2294%22%20rx%3D%2214%22%20fill%3D%22%23ffffff%22%20stroke%3D%22%23186c64%22%20stroke-width%3D%222%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%2210%22%20height%3D%2294%22%20rx%3D%225%22%20fill%3D%22%23186c64%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2234%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22700%22%20fill%3D%22%23172e32%22%3EDorsal%20vs.%20Ventral%20Cavities%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2260%22%20font-family%3D%22sans-serif%22%20font-size%3D%2213%22%20fill%3D%22%23475569%22%3ECranial%2FVertebral%20vs.%20Thoracic%2FAbdominopelvic%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20font-weight%3D%22600%22%20fill%3D%22%23186c64%22%3ESeparated%20by%20diaphragm%3C%2Ftext%3E%0A%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%0A%20%20%3C%2Fsvg%3E",
    sourceBadge: "Course Concept Schematic",
    keyTakeaway: "Directional terms always assume anatomical position (standing erect, palms facing anteriorly).",
  },
];
CHAPTER_FIGURES["chapter-2"] = [
  {
    id: "ch2-fig-1",
    title: "Chemical Bonds, pH Scale & Macromolecules",
    caption: "Ionic, covalent, and hydrogen bonding alongside dehydration synthesis and hydrolysis.",
    src: "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20760%20370%22%20width%3D%22760%22%20height%3D%22370%22%3E%0A%20%20%20%20%3Crect%20width%3D%22760%22%20height%3D%22370%22%20rx%3D%2220%22%20fill%3D%22%23eef3f0%22%2F%3E%0A%20%20%20%20%3Ctext%20x%3D%2240%22%20y%3D%2252%22%20font-family%3D%22sans-serif%22%20font-size%3D%2222%22%20font-weight%3D%22800%22%20fill%3D%22%23172e32%22%3EChapter%202%20%C2%B7%20Physiological%20Chemistry%3C%2Ftext%3E%0A%20%20%20%20%3Ctext%20x%3D%2240%22%20y%3D%2280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2214%22%20fill%3D%22%2352656a%22%3EBonds%2C%20pH%20homeostasis%2C%20and%20biological%20polymers%3C%2Ftext%3E%0A%20%20%20%20%0A%20%20%20%20%20%20%3Cg%20transform%3D%22translate(40%2C%20115)%22%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%22330%22%20height%3D%2294%22%20rx%3D%2214%22%20fill%3D%22%23ffffff%22%20stroke%3D%22%230f766e%22%20stroke-width%3D%222%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%2210%22%20height%3D%2294%22%20rx%3D%225%22%20fill%3D%22%230f766e%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2234%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22700%22%20fill%3D%22%23172e32%22%3ECovalent%20vs.%20Ionic%20Bonds%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2260%22%20font-family%3D%22sans-serif%22%20font-size%3D%2213%22%20fill%3D%22%23475569%22%3EShared%20electrons%20vs.%20transferred%20electrons%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20font-weight%3D%22600%22%20fill%3D%22%230f766e%22%3EPolar%20water%20forms%20H-bonds%3C%2Ftext%3E%0A%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%0A%20%20%20%20%20%20%3Cg%20transform%3D%22translate(400%2C%20115)%22%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%22330%22%20height%3D%2294%22%20rx%3D%2214%22%20fill%3D%22%23ffffff%22%20stroke%3D%22%230f766e%22%20stroke-width%3D%222%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%2210%22%20height%3D%2294%22%20rx%3D%225%22%20fill%3D%22%230f766e%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2234%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22700%22%20fill%3D%22%23172e32%22%3EBlood%20pH%20(7.35%E2%80%937.45)%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2260%22%20font-family%3D%22sans-serif%22%20font-size%3D%2213%22%20fill%3D%22%23475569%22%3ELower%20pH%20%3D%20higher%20H%2B%20concentration%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20font-weight%3D%22600%22%20fill%3D%22%230f766e%22%3EBuffers%20resist%20pH%20shifts%3C%2Ftext%3E%0A%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%0A%20%20%20%20%20%20%3Cg%20transform%3D%22translate(40%2C%20230)%22%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%22330%22%20height%3D%2294%22%20rx%3D%2214%22%20fill%3D%22%23ffffff%22%20stroke%3D%22%230f766e%22%20stroke-width%3D%222%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%2210%22%20height%3D%2294%22%20rx%3D%225%22%20fill%3D%22%230f766e%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2234%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22700%22%20fill%3D%22%23172e32%22%3EDehydration%20Synthesis%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2260%22%20font-family%3D%22sans-serif%22%20font-size%3D%2213%22%20fill%3D%22%23475569%22%3ERemoves%20H2O%20to%20join%20monomers%20into%20polymers%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20font-weight%3D%22600%22%20fill%3D%22%230f766e%22%3EAnabolic%20building%3C%2Ftext%3E%0A%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%0A%20%20%20%20%20%20%3Cg%20transform%3D%22translate(400%2C%20230)%22%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%22330%22%20height%3D%2294%22%20rx%3D%2214%22%20fill%3D%22%23ffffff%22%20stroke%3D%22%230f766e%22%20stroke-width%3D%222%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%2210%22%20height%3D%2294%22%20rx%3D%225%22%20fill%3D%22%230f766e%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2234%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22700%22%20fill%3D%22%23172e32%22%3EHydrolysis%20%26%20ATP%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2260%22%20font-family%3D%22sans-serif%22%20font-size%3D%2213%22%20fill%3D%22%23475569%22%3EAdds%20H2O%20to%20split%20polymers%3B%20ATP%20powers%20cell%20work%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20font-weight%3D%22600%22%20fill%3D%22%230f766e%22%3ECatabolic%20release%3C%2Ftext%3E%0A%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%0A%20%20%3C%2Fsvg%3E",
    sourceBadge: "Course Concept Schematic",
    keyTakeaway: "Dehydration synthesis builds polymers by removing water; hydrolysis breaks them down by adding water.",
  },
];
CHAPTER_FIGURES["chapter-3"] = [
  {
    id: "ch3-fig-1",
    title: "Plasma Membrane Transport & Organelles",
    caption: "Passive diffusion/osmosis vs. ATP-driven active transport and key cellular organelles.",
    src: "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20760%20370%22%20width%3D%22760%22%20height%3D%22370%22%3E%0A%20%20%20%20%3Crect%20width%3D%22760%22%20height%3D%22370%22%20rx%3D%2220%22%20fill%3D%22%23eef3f0%22%2F%3E%0A%20%20%20%20%3Ctext%20x%3D%2240%22%20y%3D%2252%22%20font-family%3D%22sans-serif%22%20font-size%3D%2222%22%20font-weight%3D%22800%22%20fill%3D%22%23172e32%22%3EChapter%203%20%C2%B7%20Cellular%20Transport%20%26%20Organelles%3C%2Ftext%3E%0A%20%20%20%20%3Ctext%20x%3D%2240%22%20y%3D%2280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2214%22%20fill%3D%22%2352656a%22%3ESelective%20permeability%20and%20division%20of%20labor%3C%2Ftext%3E%0A%20%20%20%20%0A%20%20%20%20%20%20%3Cg%20transform%3D%22translate(40%2C%20115)%22%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%22330%22%20height%3D%2294%22%20rx%3D%2214%22%20fill%3D%22%23ffffff%22%20stroke%3D%22%231e5b68%22%20stroke-width%3D%222%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%2210%22%20height%3D%2294%22%20rx%3D%225%22%20fill%3D%22%231e5b68%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2234%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22700%22%20fill%3D%22%23172e32%22%3EPlasma%20Membrane%20Bilayer%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2260%22%20font-family%3D%22sans-serif%22%20font-size%3D%2213%22%20fill%3D%22%23475569%22%3EPhospholipids%20%2B%20proteins%20regulate%20traffic%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20font-weight%3D%22600%22%20fill%3D%22%231e5b68%22%3ESelectively%20permeable%3C%2Ftext%3E%0A%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%0A%20%20%20%20%20%20%3Cg%20transform%3D%22translate(400%2C%20115)%22%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%22330%22%20height%3D%2294%22%20rx%3D%2214%22%20fill%3D%22%23ffffff%22%20stroke%3D%22%231e5b68%22%20stroke-width%3D%222%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%2210%22%20height%3D%2294%22%20rx%3D%225%22%20fill%3D%22%231e5b68%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2234%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22700%22%20fill%3D%22%23172e32%22%3EPassive%20Transport%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2260%22%20font-family%3D%22sans-serif%22%20font-size%3D%2213%22%20fill%3D%22%23475569%22%3ESimple%2Ffacilitated%20diffusion%20%26%20osmosis%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20font-weight%3D%22600%22%20fill%3D%22%231e5b68%22%3EDown%20gradient%20%C2%B7%20No%20ATP%3C%2Ftext%3E%0A%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%0A%20%20%20%20%20%20%3Cg%20transform%3D%22translate(40%2C%20230)%22%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%22330%22%20height%3D%2294%22%20rx%3D%2214%22%20fill%3D%22%23ffffff%22%20stroke%3D%22%231e5b68%22%20stroke-width%3D%222%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%2210%22%20height%3D%2294%22%20rx%3D%225%22%20fill%3D%22%231e5b68%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2234%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22700%22%20fill%3D%22%23172e32%22%3EActive%20Transport%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2260%22%20font-family%3D%22sans-serif%22%20font-size%3D%2213%22%20fill%3D%22%23475569%22%3ESolute%20pumps%20(Na%2B%2FK%2B%20ATPase)%20%26%20vesicles%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20font-weight%3D%22600%22%20fill%3D%22%231e5b68%22%3EAgainst%20gradient%20%C2%B7%20Uses%20ATP%3C%2Ftext%3E%0A%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%0A%20%20%20%20%20%20%3Cg%20transform%3D%22translate(400%2C%20230)%22%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%22330%22%20height%3D%2294%22%20rx%3D%2214%22%20fill%3D%22%23ffffff%22%20stroke%3D%22%231e5b68%22%20stroke-width%3D%222%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%2210%22%20height%3D%2294%22%20rx%3D%225%22%20fill%3D%22%231e5b68%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2234%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22700%22%20fill%3D%22%23172e32%22%3EMitochondria%20%26%20Golgi%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2260%22%20font-family%3D%22sans-serif%22%20font-size%3D%2213%22%20fill%3D%22%23475569%22%3EMitochondria%20make%20ATP%3B%20Golgi%20packages%20proteins%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20font-weight%3D%22600%22%20fill%3D%22%231e5b68%22%3ERough%20ER%20%2B%20Ribosomes%20synthesize%3C%2Ftext%3E%0A%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%0A%20%20%3C%2Fsvg%3E",
    sourceBadge: "Course Concept Schematic",
    keyTakeaway: "Passive transport moves down a concentration gradient without ATP; active transport pumps against a gradient using ATP.",
  },
];
CHAPTER_FIGURES["chapter-4"] = [
  {
    id: "ch4-fig-1",
    title: "Four Primary Tissue Types Comparison",
    caption: "Epithelial, connective, muscle, and nervous tissue hallmarks and repair capacity.",
    src: "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20760%20370%22%20width%3D%22760%22%20height%3D%22370%22%3E%0A%20%20%20%20%3Crect%20width%3D%22760%22%20height%3D%22370%22%20rx%3D%2220%22%20fill%3D%22%23eef3f0%22%2F%3E%0A%20%20%20%20%3Ctext%20x%3D%2240%22%20y%3D%2252%22%20font-family%3D%22sans-serif%22%20font-size%3D%2222%22%20font-weight%3D%22800%22%20fill%3D%22%23172e32%22%3EChapter%204%20%C2%B7%20The%20Four%20Primary%20Tissues%3C%2Ftext%3E%0A%20%20%20%20%3Ctext%20x%3D%2240%22%20y%3D%2280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2214%22%20fill%3D%22%2352656a%22%3EStructure%2C%20extracellular%20matrix%2C%20and%20function%3C%2Ftext%3E%0A%20%20%20%20%0A%20%20%20%20%20%20%3Cg%20transform%3D%22translate(40%2C%20115)%22%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%22330%22%20height%3D%2294%22%20rx%3D%2214%22%20fill%3D%22%23ffffff%22%20stroke%3D%22%23804532%22%20stroke-width%3D%222%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%2210%22%20height%3D%2294%22%20rx%3D%225%22%20fill%3D%22%23804532%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2234%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22700%22%20fill%3D%22%23172e32%22%3EEpithelial%20Tissue%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2260%22%20font-family%3D%22sans-serif%22%20font-size%3D%2213%22%20fill%3D%22%23475569%22%3EApical%20free%20surface%20%2B%20basement%20membrane%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20font-weight%3D%22600%22%20fill%3D%22%23804532%22%3EAvascular%20%C2%B7%20High%20regeneration%3C%2Ftext%3E%0A%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%0A%20%20%20%20%20%20%3Cg%20transform%3D%22translate(400%2C%20115)%22%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%22330%22%20height%3D%2294%22%20rx%3D%2214%22%20fill%3D%22%23ffffff%22%20stroke%3D%22%23804532%22%20stroke-width%3D%222%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%2210%22%20height%3D%2294%22%20rx%3D%225%22%20fill%3D%22%23804532%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2234%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22700%22%20fill%3D%22%23172e32%22%3EConnective%20Tissue%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2260%22%20font-family%3D%22sans-serif%22%20font-size%3D%2213%22%20fill%3D%22%23475569%22%3ECells%20embedded%20in%20abundant%20extracellular%20matrix%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20font-weight%3D%22600%22%20fill%3D%22%23804532%22%3EProper%2C%20cartilage%2C%20bone%2C%20blood%3C%2Ftext%3E%0A%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%0A%20%20%20%20%20%20%3Cg%20transform%3D%22translate(40%2C%20230)%22%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%22330%22%20height%3D%2294%22%20rx%3D%2214%22%20fill%3D%22%23ffffff%22%20stroke%3D%22%23804532%22%20stroke-width%3D%222%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%2210%22%20height%3D%2294%22%20rx%3D%225%22%20fill%3D%22%23804532%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2234%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22700%22%20fill%3D%22%23172e32%22%3EMuscle%20Tissue%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2260%22%20font-family%3D%22sans-serif%22%20font-size%3D%2213%22%20fill%3D%22%23475569%22%3ESkeletal%20(voluntary)%2C%20Cardiac%2C%20Smooth%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20font-weight%3D%22600%22%20fill%3D%22%23804532%22%3ESpecialized%20for%20contraction%3C%2Ftext%3E%0A%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%0A%20%20%20%20%20%20%3Cg%20transform%3D%22translate(400%2C%20230)%22%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%22330%22%20height%3D%2294%22%20rx%3D%2214%22%20fill%3D%22%23ffffff%22%20stroke%3D%22%23804532%22%20stroke-width%3D%222%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%2210%22%20height%3D%2294%22%20rx%3D%225%22%20fill%3D%22%23804532%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2234%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22700%22%20fill%3D%22%23172e32%22%3ENervous%20Tissue%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2260%22%20font-family%3D%22sans-serif%22%20font-size%3D%2213%22%20fill%3D%22%23475569%22%3ENeurons%20(signals)%20%2B%20Neuroglia%20(support)%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20font-weight%3D%22600%22%20fill%3D%22%23804532%22%3EBrain%2C%20spinal%20cord%2C%20nerves%3C%2Ftext%3E%0A%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%0A%20%20%3C%2Fsvg%3E",
    sourceBadge: "Course Concept Schematic",
    keyTakeaway: "Epithelial tissues are avascular with tightly packed cells; connective tissues feature abundant extracellular matrix.",
  },
];
CHAPTER_FIGURES["chapter-5"] = [
  {
    id: "ch5-fig-1",
    title: "Integumentary Layers & Epidermal Strata",
    caption: "Epidermal strata (Come Let’s Get Sun Burned), dermis, and cutaneous glands.",
    src: "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20760%20370%22%20width%3D%22760%22%20height%3D%22370%22%3E%0A%20%20%20%20%3Crect%20width%3D%22760%22%20height%3D%22370%22%20rx%3D%2220%22%20fill%3D%22%23eef3f0%22%2F%3E%0A%20%20%20%20%3Ctext%20x%3D%2240%22%20y%3D%2252%22%20font-family%3D%22sans-serif%22%20font-size%3D%2222%22%20font-weight%3D%22800%22%20fill%3D%22%23172e32%22%3EChapter%205%20%C2%B7%20Integumentary%20System%20Preview%3C%2Ftext%3E%0A%20%20%20%20%3Ctext%20x%3D%2240%22%20y%3D%2280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2214%22%20fill%3D%22%2352656a%22%3EEpidermis%2C%20dermis%2C%20and%20thermoregulation%3C%2Ftext%3E%0A%20%20%20%20%0A%20%20%20%20%20%20%3Cg%20transform%3D%22translate(40%2C%20115)%22%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%22330%22%20height%3D%2294%22%20rx%3D%2214%22%20fill%3D%22%23ffffff%22%20stroke%3D%22%239a5b42%22%20stroke-width%3D%222%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%2210%22%20height%3D%2294%22%20rx%3D%225%22%20fill%3D%22%239a5b42%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2234%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22700%22%20fill%3D%22%23172e32%22%3EEpidermal%20Strata%20(Superficial%E2%86%92Deep)%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2260%22%20font-family%3D%22sans-serif%22%20font-size%3D%2213%22%20fill%3D%22%23475569%22%3ECorneum%20%C2%B7%20Lucidum%20%C2%B7%20Granulosum%20%C2%B7%20Spinosum%20%C2%B7%20Basale%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20font-weight%3D%22600%22%20fill%3D%22%239a5b42%22%3EKeratinocytes%20%26%20Melanocytes%3C%2Ftext%3E%0A%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%0A%20%20%20%20%20%20%3Cg%20transform%3D%22translate(400%2C%20115)%22%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%22330%22%20height%3D%2294%22%20rx%3D%2214%22%20fill%3D%22%23ffffff%22%20stroke%3D%22%239a5b42%22%20stroke-width%3D%222%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%2210%22%20height%3D%2294%22%20rx%3D%225%22%20fill%3D%22%239a5b42%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2234%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22700%22%20fill%3D%22%23172e32%22%3EDermis%20(Papillary%20%26%20Reticular)%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2260%22%20font-family%3D%22sans-serif%22%20font-size%3D%2213%22%20fill%3D%22%23475569%22%3EVascular%20connective%20tissue%20housing%20receptors%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20font-weight%3D%22600%22%20fill%3D%22%239a5b42%22%3EDermal%20papillae%20%3D%20fingerprints%3C%2Ftext%3E%0A%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%0A%20%20%20%20%20%20%3Cg%20transform%3D%22translate(40%2C%20230)%22%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%22330%22%20height%3D%2294%22%20rx%3D%2214%22%20fill%3D%22%23ffffff%22%20stroke%3D%22%239a5b42%22%20stroke-width%3D%222%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%2210%22%20height%3D%2294%22%20rx%3D%225%22%20fill%3D%22%239a5b42%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2234%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22700%22%20fill%3D%22%23172e32%22%3EEccrine%20vs.%20Sebaceous%20Glands%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2260%22%20font-family%3D%22sans-serif%22%20font-size%3D%2213%22%20fill%3D%22%23475569%22%3ESweat%20(thermoregulation)%20vs.%20Sebum%20(oil)%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20font-weight%3D%22600%22%20fill%3D%22%239a5b42%22%3EApocrine%20in%20axillary%2Fanogenital%3C%2Ftext%3E%0A%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%0A%20%20%20%20%20%20%3Cg%20transform%3D%22translate(400%2C%20230)%22%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%22330%22%20height%3D%2294%22%20rx%3D%2214%22%20fill%3D%22%23ffffff%22%20stroke%3D%22%239a5b42%22%20stroke-width%3D%222%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%2210%22%20height%3D%2294%22%20rx%3D%225%22%20fill%3D%22%239a5b42%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2234%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22700%22%20fill%3D%22%23172e32%22%3EABCD%20Rule%20%26%20Burn%20Degrees%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2260%22%20font-family%3D%22sans-serif%22%20font-size%3D%2213%22%20fill%3D%22%23475569%22%3EAsymmetry%2C%20Border%2C%20Color%2C%20Diameter%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20font-weight%3D%22600%22%20fill%3D%22%239a5b42%22%3E1st%2C%202nd%20(blisters)%2C%203rd%20degree%3C%2Ftext%3E%0A%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%0A%20%20%3C%2Fsvg%3E",
    sourceBadge: "Supplemental Study Diagram",
    keyTakeaway: "Stratum basale is the deepest mitotic layer; stratum corneum is the outermost keratinized barrier.",
  },
];
CHAPTER_FIGURES["chapter-10"] = [
  {
    id: "ch10-fig-1",
    title: "Chapter 10 · Muscular System Mechanics",
    caption: "Visual concept map summarizing the core physiological relationships in this unit.",
    src: "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20760%20370%22%20width%3D%22760%22%20height%3D%22370%22%3E%0A%20%20%20%20%3Crect%20width%3D%22760%22%20height%3D%22370%22%20rx%3D%2220%22%20fill%3D%22%23eef3f0%22%2F%3E%0A%20%20%20%20%3Ctext%20x%3D%2240%22%20y%3D%2252%22%20font-family%3D%22sans-serif%22%20font-size%3D%2222%22%20font-weight%3D%22800%22%20fill%3D%22%23172e32%22%3EChapter%2010%20%C2%B7%20Muscular%20System%20Mechanics%3C%2Ftext%3E%0A%20%20%20%20%3Ctext%20x%3D%2240%22%20y%3D%2280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2214%22%20fill%3D%22%2352656a%22%3ESupplemental%20visual%20reference%20map%3C%2Ftext%3E%0A%20%20%20%20%0A%20%20%20%20%20%20%3Cg%20transform%3D%22translate(40%2C%20115)%22%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%22330%22%20height%3D%2294%22%20rx%3D%2214%22%20fill%3D%22%23ffffff%22%20stroke%3D%22%23186c64%22%20stroke-width%3D%222%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%2210%22%20height%3D%2294%22%20rx%3D%225%22%20fill%3D%22%23186c64%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2234%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22700%22%20fill%3D%22%23172e32%22%3EPrime%20Mover%20(Agonist)%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2260%22%20font-family%3D%22sans-serif%22%20font-size%3D%2213%22%20fill%3D%22%23475569%22%3EProvides%20major%20force%20for%20a%20movement%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20font-weight%3D%22600%22%20fill%3D%22%23186c64%22%3EAntagonist%20opposes%20it%3C%2Ftext%3E%0A%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%0A%20%20%20%20%20%20%3Cg%20transform%3D%22translate(400%2C%20115)%22%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%22330%22%20height%3D%2294%22%20rx%3D%2214%22%20fill%3D%22%23ffffff%22%20stroke%3D%22%23186c64%22%20stroke-width%3D%222%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%2210%22%20height%3D%2294%22%20rx%3D%225%22%20fill%3D%22%23186c64%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2234%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22700%22%20fill%3D%22%23172e32%22%3ESynergist%20%26%20Fixator%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2260%22%20font-family%3D%22sans-serif%22%20font-size%3D%2213%22%20fill%3D%22%23475569%22%3ESteadies%20joints%20%26%20immobilizes%20bone%20origin%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20font-weight%3D%22600%22%20fill%3D%22%23186c64%22%3EPrevents%20unwanted%20rotation%3C%2Ftext%3E%0A%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%0A%20%20%20%20%20%20%3Cg%20transform%3D%22translate(40%2C%20230)%22%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%22330%22%20height%3D%2294%22%20rx%3D%2214%22%20fill%3D%22%23ffffff%22%20stroke%3D%22%23186c64%22%20stroke-width%3D%222%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%2210%22%20height%3D%2294%22%20rx%3D%225%22%20fill%3D%22%23186c64%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2234%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22700%22%20fill%3D%22%23172e32%22%3EOrigin%20vs.%20Insertion%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2260%22%20font-family%3D%22sans-serif%22%20font-size%3D%2213%22%20fill%3D%22%23475569%22%3EImmovable%20anchor%20vs.%20movable%20attachment%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20font-weight%3D%22600%22%20fill%3D%22%23186c64%22%3EInsertion%20pulls%20toward%20origin%3C%2Ftext%3E%0A%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%0A%20%20%20%20%20%20%3Cg%20transform%3D%22translate(400%2C%20230)%22%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%22330%22%20height%3D%2294%22%20rx%3D%2214%22%20fill%3D%22%23ffffff%22%20stroke%3D%22%23186c64%22%20stroke-width%3D%222%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%2210%22%20height%3D%2294%22%20rx%3D%225%22%20fill%3D%22%23186c64%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2234%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22700%22%20fill%3D%22%23172e32%22%3ELever%20Systems%20(1st%2C%202nd%2C%203rd)%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2260%22%20font-family%3D%22sans-serif%22%20font-size%3D%2213%22%20fill%3D%22%23475569%22%3EEffort%2C%20fulcrum%20(joint)%2C%20and%20load%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20font-weight%3D%22600%22%20fill%3D%22%23186c64%22%3EMost%20body%20muscles%20are%203rd-class%3C%2Ftext%3E%0A%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%0A%20%20%3C%2Fsvg%3E",
    sourceBadge: "Supplemental Study Diagram",
    keyTakeaway: "Provides major force for a movement — Antagonist opposes it",
  }
];
CHAPTER_FIGURES["chapter-11"] = [
  {
    id: "ch11-fig-1",
    title: "Chapter 11 · Neural Signaling & Potentials",
    caption: "Visual concept map summarizing the core physiological relationships in this unit.",
    src: "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20760%20370%22%20width%3D%22760%22%20height%3D%22370%22%3E%0A%20%20%20%20%3Crect%20width%3D%22760%22%20height%3D%22370%22%20rx%3D%2220%22%20fill%3D%22%23eef3f0%22%2F%3E%0A%20%20%20%20%3Ctext%20x%3D%2240%22%20y%3D%2252%22%20font-family%3D%22sans-serif%22%20font-size%3D%2222%22%20font-weight%3D%22800%22%20fill%3D%22%23172e32%22%3EChapter%2011%20%C2%B7%20Neural%20Signaling%20%26%20Potentials%3C%2Ftext%3E%0A%20%20%20%20%3Ctext%20x%3D%2240%22%20y%3D%2280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2214%22%20fill%3D%22%2352656a%22%3ESupplemental%20visual%20reference%20map%3C%2Ftext%3E%0A%20%20%20%20%0A%20%20%20%20%20%20%3Cg%20transform%3D%22translate(40%2C%20115)%22%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%22330%22%20height%3D%2294%22%20rx%3D%2214%22%20fill%3D%22%23ffffff%22%20stroke%3D%22%23186c64%22%20stroke-width%3D%222%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%2210%22%20height%3D%2294%22%20rx%3D%225%22%20fill%3D%22%23186c64%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2234%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22700%22%20fill%3D%22%23172e32%22%3EResting%20Membrane%20Potential%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2260%22%20font-family%3D%22sans-serif%22%20font-size%3D%2213%22%20fill%3D%22%23475569%22%3E-70%20mV%20maintained%20by%20Na%2B%2FK%2B%20pump%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20font-weight%3D%22600%22%20fill%3D%22%23186c64%22%3E3%20Na%2B%20out%2C%202%20K%2B%20in%3C%2Ftext%3E%0A%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%0A%20%20%20%20%20%20%3Cg%20transform%3D%22translate(400%2C%20115)%22%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%22330%22%20height%3D%2294%22%20rx%3D%2214%22%20fill%3D%22%23ffffff%22%20stroke%3D%22%23186c64%22%20stroke-width%3D%222%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%2210%22%20height%3D%2294%22%20rx%3D%225%22%20fill%3D%22%23186c64%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2234%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22700%22%20fill%3D%22%23172e32%22%3EDepolarization%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2260%22%20font-family%3D%22sans-serif%22%20font-size%3D%2213%22%20fill%3D%22%23475569%22%3EVoltage-gated%20Na%2B%20channels%20open%20(-55%20mV)%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20font-weight%3D%22600%22%20fill%3D%22%23186c64%22%3ENa%2B%20rushes%20into%20neuron%3C%2Ftext%3E%0A%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%0A%20%20%20%20%20%20%3Cg%20transform%3D%22translate(40%2C%20230)%22%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%22330%22%20height%3D%2294%22%20rx%3D%2214%22%20fill%3D%22%23ffffff%22%20stroke%3D%22%23186c64%22%20stroke-width%3D%222%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%2210%22%20height%3D%2294%22%20rx%3D%225%22%20fill%3D%22%23186c64%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2234%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22700%22%20fill%3D%22%23172e32%22%3ERepolarization%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2260%22%20font-family%3D%22sans-serif%22%20font-size%3D%2213%22%20fill%3D%22%23475569%22%3ENa%2B%20channels%20inactivate%2C%20K%2B%20channels%20open%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20font-weight%3D%22600%22%20fill%3D%22%23186c64%22%3EK%2B%20exits%20cell%3C%2Ftext%3E%0A%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%0A%20%20%20%20%20%20%3Cg%20transform%3D%22translate(400%2C%20230)%22%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%22330%22%20height%3D%2294%22%20rx%3D%2214%22%20fill%3D%22%23ffffff%22%20stroke%3D%22%23186c64%22%20stroke-width%3D%222%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%2210%22%20height%3D%2294%22%20rx%3D%225%22%20fill%3D%22%23186c64%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2234%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22700%22%20fill%3D%22%23172e32%22%3EMyelination%20%26%20Saltatory%20Conduction%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2260%22%20font-family%3D%22sans-serif%22%20font-size%3D%2213%22%20fill%3D%22%23475569%22%3ECNS%20Oligodendrocytes%20%C2%B7%20PNS%20Schwann%20cells%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20font-weight%3D%22600%22%20fill%3D%22%23186c64%22%3EJumps%20across%20Nodes%20of%20Ranvier%3C%2Ftext%3E%0A%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%0A%20%20%3C%2Fsvg%3E",
    sourceBadge: "Supplemental Study Diagram",
    keyTakeaway: "-70 mV maintained by Na+/K+ pump — 3 Na+ out, 2 K+ in",
  }
];
CHAPTER_FIGURES["chapter-12"] = [
  {
    id: "ch12-fig-1",
    title: "Chapter 12 · Central Nervous System Map",
    caption: "Visual concept map summarizing the core physiological relationships in this unit.",
    src: "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20760%20370%22%20width%3D%22760%22%20height%3D%22370%22%3E%0A%20%20%20%20%3Crect%20width%3D%22760%22%20height%3D%22370%22%20rx%3D%2220%22%20fill%3D%22%23eef3f0%22%2F%3E%0A%20%20%20%20%3Ctext%20x%3D%2240%22%20y%3D%2252%22%20font-family%3D%22sans-serif%22%20font-size%3D%2222%22%20font-weight%3D%22800%22%20fill%3D%22%23172e32%22%3EChapter%2012%20%C2%B7%20Central%20Nervous%20System%20Map%3C%2Ftext%3E%0A%20%20%20%20%3Ctext%20x%3D%2240%22%20y%3D%2280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2214%22%20fill%3D%22%2352656a%22%3ESupplemental%20visual%20reference%20map%3C%2Ftext%3E%0A%20%20%20%20%0A%20%20%20%20%20%20%3Cg%20transform%3D%22translate(40%2C%20115)%22%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%22330%22%20height%3D%2294%22%20rx%3D%2214%22%20fill%3D%22%23ffffff%22%20stroke%3D%22%23186c64%22%20stroke-width%3D%222%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%2210%22%20height%3D%2294%22%20rx%3D%225%22%20fill%3D%22%23186c64%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2234%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22700%22%20fill%3D%22%23172e32%22%3ECerebral%20Lobes%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2260%22%20font-family%3D%22sans-serif%22%20font-size%3D%2213%22%20fill%3D%22%23475569%22%3EFrontal%20(motor)%20%C2%B7%20Parietal%20(sensory)%20%C2%B7%20Occipital%20%C2%B7%20Temporal%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20font-weight%3D%22600%22%20fill%3D%22%23186c64%22%3EBroca%E2%80%99s%20vs.%20Wernicke%E2%80%99s%20areas%3C%2Ftext%3E%0A%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%0A%20%20%20%20%20%20%3Cg%20transform%3D%22translate(400%2C%20115)%22%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%22330%22%20height%3D%2294%22%20rx%3D%2214%22%20fill%3D%22%23ffffff%22%20stroke%3D%22%23186c64%22%20stroke-width%3D%222%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%2210%22%20height%3D%2294%22%20rx%3D%225%22%20fill%3D%22%23186c64%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2234%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22700%22%20fill%3D%22%23172e32%22%3EDiencephalon%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2260%22%20font-family%3D%22sans-serif%22%20font-size%3D%2213%22%20fill%3D%22%23475569%22%3EThalamus%20(sensory%20relay)%20%26%20Hypothalamus%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20font-weight%3D%22600%22%20fill%3D%22%23186c64%22%3EHomeostasis%20%26%20pituitary%20link%3C%2Ftext%3E%0A%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%0A%20%20%20%20%20%20%3Cg%20transform%3D%22translate(40%2C%20230)%22%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%22330%22%20height%3D%2294%22%20rx%3D%2214%22%20fill%3D%22%23ffffff%22%20stroke%3D%22%23186c64%22%20stroke-width%3D%222%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%2210%22%20height%3D%2294%22%20rx%3D%225%22%20fill%3D%22%23186c64%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2234%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22700%22%20fill%3D%22%23172e32%22%3EBrainstem%20%26%20Cerebellum%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2260%22%20font-family%3D%22sans-serif%22%20font-size%3D%2213%22%20fill%3D%22%23475569%22%3EMidbrain%2C%20Pons%2C%20Medulla%20%2B%20Cerebellar%20balance%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20font-weight%3D%22600%22%20fill%3D%22%23186c64%22%3EAutonomic%20vital%20centers%3C%2Ftext%3E%0A%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%0A%20%20%20%20%20%20%3Cg%20transform%3D%22translate(400%2C%20230)%22%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%22330%22%20height%3D%2294%22%20rx%3D%2214%22%20fill%3D%22%23ffffff%22%20stroke%3D%22%23186c64%22%20stroke-width%3D%222%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%2210%22%20height%3D%2294%22%20rx%3D%225%22%20fill%3D%22%23186c64%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2234%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22700%22%20fill%3D%22%23172e32%22%3EMeninges%20%26%20CSF%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2260%22%20font-family%3D%22sans-serif%22%20font-size%3D%2213%22%20fill%3D%22%23475569%22%3EDura%20mater%20%C2%B7%20Arachnoid%20%C2%B7%20Pia%20mater%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20font-weight%3D%22600%22%20fill%3D%22%23186c64%22%3EChoroid%20plexuses%20produce%20CSF%3C%2Ftext%3E%0A%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%0A%20%20%3C%2Fsvg%3E",
    sourceBadge: "Supplemental Study Diagram",
    keyTakeaway: "Frontal (motor) · Parietal (sensory) · Occipital · Temporal — Broca’s vs. Wernicke’s areas",
  }
];
CHAPTER_FIGURES["chapter-13"] = [
  {
    id: "ch13-fig-1",
    title: "Chapter 13 · PNS, Cranial Nerves & Reflexes",
    caption: "Visual concept map summarizing the core physiological relationships in this unit.",
    src: "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20760%20370%22%20width%3D%22760%22%20height%3D%22370%22%3E%0A%20%20%20%20%3Crect%20width%3D%22760%22%20height%3D%22370%22%20rx%3D%2220%22%20fill%3D%22%23eef3f0%22%2F%3E%0A%20%20%20%20%3Ctext%20x%3D%2240%22%20y%3D%2252%22%20font-family%3D%22sans-serif%22%20font-size%3D%2222%22%20font-weight%3D%22800%22%20fill%3D%22%23172e32%22%3EChapter%2013%20%C2%B7%20PNS%2C%20Cranial%20Nerves%20%26%20Reflexes%3C%2Ftext%3E%0A%20%20%20%20%3Ctext%20x%3D%2240%22%20y%3D%2280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2214%22%20fill%3D%22%2352656a%22%3ESupplemental%20visual%20reference%20map%3C%2Ftext%3E%0A%20%20%20%20%0A%20%20%20%20%20%20%3Cg%20transform%3D%22translate(40%2C%20115)%22%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%22330%22%20height%3D%2294%22%20rx%3D%2214%22%20fill%3D%22%23ffffff%22%20stroke%3D%22%23186c64%22%20stroke-width%3D%222%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%2210%22%20height%3D%2294%22%20rx%3D%225%22%20fill%3D%22%23186c64%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2234%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22700%22%20fill%3D%22%23172e32%22%3E12%20Cranial%20Nerves%20(CN%20I%E2%80%93XII)%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2260%22%20font-family%3D%22sans-serif%22%20font-size%3D%2213%22%20fill%3D%22%23475569%22%3EOlfactory%20(I)%2C%20Optic%20(II)%2C%20Vagus%20(X)%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20font-weight%3D%22600%22%20fill%3D%22%23186c64%22%3EVagus%20%3D%20thoracic%2Fabdominal%20viscera%3C%2Ftext%3E%0A%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%0A%20%20%20%20%20%20%3Cg%20transform%3D%22translate(400%2C%20115)%22%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%22330%22%20height%3D%2294%22%20rx%3D%2214%22%20fill%3D%22%23ffffff%22%20stroke%3D%22%23186c64%22%20stroke-width%3D%222%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%2210%22%20height%3D%2294%22%20rx%3D%225%22%20fill%3D%22%23186c64%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2234%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22700%22%20fill%3D%22%23172e32%22%3ESpinal%20Roots%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2260%22%20font-family%3D%22sans-serif%22%20font-size%3D%2213%22%20fill%3D%22%23475569%22%3EDorsal%20root%20%3D%20sensory%20(afferent)%20%2B%20DRG%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20font-weight%3D%22600%22%20fill%3D%22%23186c64%22%3EVentral%20root%20%3D%20motor%20(efferent)%3C%2Ftext%3E%0A%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%0A%20%20%20%20%20%20%3Cg%20transform%3D%22translate(40%2C%20230)%22%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%22330%22%20height%3D%2294%22%20rx%3D%2214%22%20fill%3D%22%23ffffff%22%20stroke%3D%22%23186c64%22%20stroke-width%3D%222%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%2210%22%20height%3D%2294%22%20rx%3D%225%22%20fill%3D%22%23186c64%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2234%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22700%22%20fill%3D%22%23172e32%22%3EMajor%20Nerve%20Plexuses%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2260%22%20font-family%3D%22sans-serif%22%20font-size%3D%2213%22%20fill%3D%22%23475569%22%3ECervical%20(phrenic)%20%C2%B7%20Brachial%20%C2%B7%20Lumbar%20%C2%B7%20Sacral%20(sciatic)%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20font-weight%3D%22600%22%20fill%3D%22%23186c64%22%3EPhrenic%20nerve%20(C3%E2%80%93C5)%20-%3E%20diaphragm%3C%2Ftext%3E%0A%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%0A%20%20%20%20%20%20%3Cg%20transform%3D%22translate(400%2C%20230)%22%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%22330%22%20height%3D%2294%22%20rx%3D%2214%22%20fill%3D%22%23ffffff%22%20stroke%3D%22%23186c64%22%20stroke-width%3D%222%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%2210%22%20height%3D%2294%22%20rx%3D%225%22%20fill%3D%22%23186c64%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2234%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22700%22%20fill%3D%22%23172e32%22%3E5-Step%20Reflex%20Arc%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2260%22%20font-family%3D%22sans-serif%22%20font-size%3D%2213%22%20fill%3D%22%23475569%22%3EReceptor%20%E2%86%92%20Sensory%20%E2%86%92%20Integration%20%E2%86%92%20Motor%20%E2%86%92%20Effector%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20font-weight%3D%22600%22%20fill%3D%22%23186c64%22%3EStretch%2C%20flexor%20%26%20crossed-extensor%3C%2Ftext%3E%0A%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%0A%20%20%3C%2Fsvg%3E",
    sourceBadge: "Supplemental Study Diagram",
    keyTakeaway: "Olfactory (I), Optic (II), Vagus (X) — Vagus = thoracic/abdominal viscera",
  }
];
CHAPTER_FIGURES["chapter-14"] = [
  {
    id: "ch14-fig-1",
    title: "Chapter 14 · Autonomic Nervous System",
    caption: "Visual concept map summarizing the core physiological relationships in this unit.",
    src: "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20760%20370%22%20width%3D%22760%22%20height%3D%22370%22%3E%0A%20%20%20%20%3Crect%20width%3D%22760%22%20height%3D%22370%22%20rx%3D%2220%22%20fill%3D%22%23eef3f0%22%2F%3E%0A%20%20%20%20%3Ctext%20x%3D%2240%22%20y%3D%2252%22%20font-family%3D%22sans-serif%22%20font-size%3D%2222%22%20font-weight%3D%22800%22%20fill%3D%22%23172e32%22%3EChapter%2014%20%C2%B7%20Autonomic%20Nervous%20System%3C%2Ftext%3E%0A%20%20%20%20%3Ctext%20x%3D%2240%22%20y%3D%2280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2214%22%20fill%3D%22%2352656a%22%3ESupplemental%20visual%20reference%20map%3C%2Ftext%3E%0A%20%20%20%20%0A%20%20%20%20%20%20%3Cg%20transform%3D%22translate(40%2C%20115)%22%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%22330%22%20height%3D%2294%22%20rx%3D%2214%22%20fill%3D%22%23ffffff%22%20stroke%3D%22%23186c64%22%20stroke-width%3D%222%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%2210%22%20height%3D%2294%22%20rx%3D%225%22%20fill%3D%22%23186c64%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2234%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22700%22%20fill%3D%22%23172e32%22%3ESympathetic%20(Fight%20or%20Flight)%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2260%22%20font-family%3D%22sans-serif%22%20font-size%3D%2213%22%20fill%3D%22%23475569%22%3EThoracolumbar%20(T1%E2%80%93L2)%20%C2%B7%20Short%20pre%20%2F%20Long%20post%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20font-weight%3D%22600%22%20fill%3D%22%23186c64%22%3EReleases%20Norepinephrine%20(NE)%3C%2Ftext%3E%0A%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%0A%20%20%20%20%20%20%3Cg%20transform%3D%22translate(400%2C%20115)%22%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%22330%22%20height%3D%2294%22%20rx%3D%2214%22%20fill%3D%22%23ffffff%22%20stroke%3D%22%23186c64%22%20stroke-width%3D%222%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%2210%22%20height%3D%2294%22%20rx%3D%225%22%20fill%3D%22%23186c64%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2234%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22700%22%20fill%3D%22%23172e32%22%3EParasympathetic%20(Rest%20%26%20Digest)%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2260%22%20font-family%3D%22sans-serif%22%20font-size%3D%2213%22%20fill%3D%22%23475569%22%3ECraniosacral%20(CN%20III%2C%20VII%2C%20IX%2C%20X%3B%20S2%E2%80%93S4)%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20font-weight%3D%22600%22%20fill%3D%22%23186c64%22%3EReleases%20Acetylcholine%20(ACh)%3C%2Ftext%3E%0A%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%0A%20%20%20%20%20%20%3Cg%20transform%3D%22translate(40%2C%20230)%22%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%22330%22%20height%3D%2294%22%20rx%3D%2214%22%20fill%3D%22%23ffffff%22%20stroke%3D%22%23186c64%22%20stroke-width%3D%222%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%2210%22%20height%3D%2294%22%20rx%3D%225%22%20fill%3D%22%23186c64%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2234%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22700%22%20fill%3D%22%23172e32%22%3ECholinergic%20Receptors%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2260%22%20font-family%3D%22sans-serif%22%20font-size%3D%2213%22%20fill%3D%22%23475569%22%3ENicotinic%20(all%20ganglia)%20%26%20Muscarinic%20(effectors)%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20font-weight%3D%22600%22%20fill%3D%22%23186c64%22%3EBind%20ACh%3C%2Ftext%3E%0A%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%0A%20%20%20%20%20%20%3Cg%20transform%3D%22translate(400%2C%20230)%22%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%22330%22%20height%3D%2294%22%20rx%3D%2214%22%20fill%3D%22%23ffffff%22%20stroke%3D%22%23186c64%22%20stroke-width%3D%222%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%2210%22%20height%3D%2294%22%20rx%3D%225%22%20fill%3D%22%23186c64%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2234%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22700%22%20fill%3D%22%23172e32%22%3EAdrenergic%20Receptors%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2260%22%20font-family%3D%22sans-serif%22%20font-size%3D%2213%22%20fill%3D%22%23475569%22%3EAlpha%20(%CE%B11%2C%20%CE%B12)%20and%20Beta%20(%CE%B21%20heart%2C%20%CE%B22%20lungs)%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20font-weight%3D%22600%22%20fill%3D%22%23186c64%22%3EBind%20NE%20and%20Epinephrine%3C%2Ftext%3E%0A%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%0A%20%20%3C%2Fsvg%3E",
    sourceBadge: "Supplemental Study Diagram",
    keyTakeaway: "Thoracolumbar (T1–L2) · Short pre / Long post — Releases Norepinephrine (NE)",
  }
];
CHAPTER_FIGURES["chapter-15"] = [
  {
    id: "ch15-fig-1",
    title: "Chapter 15 · Special Senses Overview",
    caption: "Visual concept map summarizing the core physiological relationships in this unit.",
    src: "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20760%20370%22%20width%3D%22760%22%20height%3D%22370%22%3E%0A%20%20%20%20%3Crect%20width%3D%22760%22%20height%3D%22370%22%20rx%3D%2220%22%20fill%3D%22%23eef3f0%22%2F%3E%0A%20%20%20%20%3Ctext%20x%3D%2240%22%20y%3D%2252%22%20font-family%3D%22sans-serif%22%20font-size%3D%2222%22%20font-weight%3D%22800%22%20fill%3D%22%23172e32%22%3EChapter%2015%20%C2%B7%20Special%20Senses%20Overview%3C%2Ftext%3E%0A%20%20%20%20%3Ctext%20x%3D%2240%22%20y%3D%2280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2214%22%20fill%3D%22%2352656a%22%3ESupplemental%20visual%20reference%20map%3C%2Ftext%3E%0A%20%20%20%20%0A%20%20%20%20%20%20%3Cg%20transform%3D%22translate(40%2C%20115)%22%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%22330%22%20height%3D%2294%22%20rx%3D%2214%22%20fill%3D%22%23ffffff%22%20stroke%3D%22%23186c64%22%20stroke-width%3D%222%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%2210%22%20height%3D%2294%22%20rx%3D%225%22%20fill%3D%22%23186c64%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2234%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22700%22%20fill%3D%22%23172e32%22%3EVision%20(Retina)%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2260%22%20font-family%3D%22sans-serif%22%20font-size%3D%2213%22%20fill%3D%22%23475569%22%3ERods%20(dim%2Fperipheral)%20vs.%20Cones%20(color%2Ffovea)%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20font-weight%3D%22600%22%20fill%3D%22%23186c64%22%3EOptic%20disc%20%3D%20blind%20spot%3C%2Ftext%3E%0A%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%0A%20%20%20%20%20%20%3Cg%20transform%3D%22translate(400%2C%20115)%22%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%22330%22%20height%3D%2294%22%20rx%3D%2214%22%20fill%3D%22%23ffffff%22%20stroke%3D%22%23186c64%22%20stroke-width%3D%222%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%2210%22%20height%3D%2294%22%20rx%3D%225%22%20fill%3D%22%23186c64%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2234%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22700%22%20fill%3D%22%23172e32%22%3EHearing%20(Cochlea)%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2260%22%20font-family%3D%22sans-serif%22%20font-size%3D%2213%22%20fill%3D%22%23475569%22%3ETympanic%20membrane%20%E2%86%92%20Malleus%2C%20Incus%2C%20Stapes%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20font-weight%3D%22600%22%20fill%3D%22%23186c64%22%3ESpiral%20organ%20of%20Corti%20on%20basilar%20membrane%3C%2Ftext%3E%0A%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%0A%20%20%20%20%20%20%3Cg%20transform%3D%22translate(40%2C%20230)%22%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%22330%22%20height%3D%2294%22%20rx%3D%2214%22%20fill%3D%22%23ffffff%22%20stroke%3D%22%23186c64%22%20stroke-width%3D%222%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%2210%22%20height%3D%2294%22%20rx%3D%225%22%20fill%3D%22%23186c64%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2234%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22700%22%20fill%3D%22%23172e32%22%3EEquilibrium%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2260%22%20font-family%3D%22sans-serif%22%20font-size%3D%2213%22%20fill%3D%22%23475569%22%3EUtricle%2FSaccule%20(linear)%20%26%20Semicircular%20canals%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20font-weight%3D%22600%22%20fill%3D%22%23186c64%22%3EOtoliths%20vs.%20crista%20ampullaris%3C%2Ftext%3E%0A%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%0A%20%20%20%20%20%20%3Cg%20transform%3D%22translate(400%2C%20230)%22%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%22330%22%20height%3D%2294%22%20rx%3D%2214%22%20fill%3D%22%23ffffff%22%20stroke%3D%22%23186c64%22%20stroke-width%3D%222%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%2210%22%20height%3D%2294%22%20rx%3D%225%22%20fill%3D%22%23186c64%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2234%22%20font-family%3D%22sans-serif%22%20font-size%3D%2216%22%20font-weight%3D%22700%22%20fill%3D%22%23172e32%22%3EOlfaction%20%26%20Gustation%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2260%22%20font-family%3D%22sans-serif%22%20font-size%3D%2213%22%20fill%3D%22%23475569%22%3EChemoreceptors%20require%20dissolved%20molecules%3C%2Ftext%3E%0A%20%20%20%20%20%20%20%20%3Ctext%20x%3D%2224%22%20y%3D%2280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2212%22%20font-weight%3D%22600%22%20fill%3D%22%23186c64%22%3ECN%20I%20(smell)%20%C2%B7%20CN%20VII%2C%20IX%2C%20X%20(taste)%3C%2Ftext%3E%0A%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%0A%20%20%3C%2Fsvg%3E",
    sourceBadge: "Supplemental Study Diagram",
    keyTakeaway: "Rods (dim/peripheral) vs. Cones (color/fovea) — Optic disc = blind spot",
  }
];
