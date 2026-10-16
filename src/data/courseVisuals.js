/* global process */
const BASE =
  typeof process !== "undefined" && process.versions?.node && !import.meta.env
    ? "/"
    : import.meta.env.BASE_URL

export const CUSTOM_FIGURES_STORAGE_KEY = "amelia-study-buddy-custom-figures-v1"
const MAX_CUSTOM_FIGURES_PER_CHAPTER = 12

export const CHAPTER_FIGURES = {
  "chapter-1": [
    {
      id: "ch1-fig-1",
      title: "Anatomical Position, Body Planes & Directional Terms",
      caption: "Sagittal (left/right), Frontal/Coronal (anterior/posterior), and Transverse (superior/inferior) planes with directional axes.",
      src: `${BASE}anatomy/concepts/ch1-fig-1.svg`,
      source: "course",
      sourceBadge: "Illustrated Study Plate",
      badge: "Illustrated Study Plate",
      keyTakeaway: "Directional terms always assume anatomical position (standing erect, palms facing anteriorly).",
    },
    {
      id: "ch1-fig-2",
      title: "Dorsal & Ventral Body Cavities & Serous Membranes",
      caption: "Cranial/vertebral dorsal cavities vs. thoracic/abdominopelvic ventral cavities and parietal/visceral serosa.",
      src: `${BASE}anatomy/concepts/ch1-fig-2.svg`,
      source: "course",
      sourceBadge: "Illustrated Study Plate",
      badge: "Illustrated Study Plate",
      keyTakeaway: "Parietal serosa lines the cavity wall; visceral serosa clings directly to the outer surface of the organ.",
    },
  ],
  "chapter-2": [
    {
      id: "ch2-fig-1",
      title: "Chemical Bonds, Water Polarity & Physiological pH Scale",
      caption: "Ionic, polar covalent, and hydrogen bonding alongside arterial blood pH homeostasis (7.35–7.45).",
      src: `${BASE}anatomy/concepts/ch2-fig-1.svg`,
      source: "course",
      sourceBadge: "Illustrated Study Plate",
      badge: "Illustrated Study Plate",
      keyTakeaway: "Each 1-unit change on the pH scale represents a 10-fold change in H⁺ concentration; blood pH is 7.35–7.45.",
    },
    {
      id: "ch2-fig-2",
      title: "Organic Macromolecules, Enzymes & ATP Energy Cycle",
      caption: "Carbohydrates, lipids, proteins, nucleic acids, enzyme activation energy, and ATP-ADP phosphorylation.",
      src: `${BASE}anatomy/concepts/ch2-fig-2.svg`,
      source: "course",
      sourceBadge: "Illustrated Study Plate",
      badge: "Illustrated Study Plate",
      keyTakeaway: "Dehydration synthesis removes water to build polymers; hydrolysis adds water to split polymers.",
    },
  ],
  "chapter-3": [
    {
      id: "ch3-fig-1",
      title: "Plasma Membrane Bilayer & Selective Transport",
      caption: "Amphipathic phospholipid bilayer, passive diffusion/osmosis, tonicity, and the 3 Na⁺ / 2 K⁺ ATPase pump.",
      src: `${BASE}anatomy/concepts/ch3-fig-1.svg`,
      source: "course",
      sourceBadge: "Illustrated Study Plate",
      badge: "Illustrated Study Plate",
      keyTakeaway: "Primary active Na⁺/K⁺ pump uses ATP to pump 3 Na⁺ out of the cell and 2 K⁺ into the cell against their gradients.",
    },
    {
      id: "ch3-fig-2",
      title: "Cellular Organelles, Protein Synthesis & Mitosis",
      caption: "Nucleus→Rough ER→Golgi secretory pathway, mitochondrial cristae ATP synthesis, transcription, and translation.",
      src: `${BASE}anatomy/concepts/ch3-fig-2.svg`,
      source: "course",
      sourceBadge: "Illustrated Study Plate",
      badge: "Illustrated Study Plate",
      keyTakeaway: "Transcription copies DNA into mRNA in the nucleus; translation reads mRNA codons at ribosomes to build proteins.",
    },
  ],
  "chapter-4": [
    {
      id: "ch4-fig-1",
      title: "Epithelial Tissue Classification & Cell Junctions",
      caption: "Simple vs. stratified layers crossed with squamous, cuboidal, columnar, pseudostratified, and transitional shapes.",
      src: `${BASE}anatomy/concepts/ch4-fig-1.svg`,
      source: "course",
      sourceBadge: "Illustrated Study Plate",
      badge: "Illustrated Study Plate",
      keyTakeaway: "Epithelia are avascular, rest on a basement membrane, and regenerate rapidly from basal stem cells.",
    },
    {
      id: "ch4-fig-2",
      title: "Connective, Muscle & Nervous Tissue Histology",
      caption: "Extracellular matrix (ground substance + collagen/elastic/reticular fibers), -blast vs. -cyte cells, and muscle types.",
      src: `${BASE}anatomy/concepts/ch4-fig-2.svg`,
      source: "course",
      sourceBadge: "Illustrated Study Plate",
      badge: "Illustrated Study Plate",
      keyTakeaway: "Dense regular connective tissue forms tendons (muscle-to-bone) and ligaments (bone-to-bone).",
    },
  ],
  "chapter-5": [
    {
      id: "ch5-fig-1",
      title: "Integumentary System: Epidermal Strata & Dermis",
      caption: "Stratum corneum, lucidum, granulosum, spinosum, and basale above the papillary and reticular dermis.",
      src: `${BASE}anatomy/concepts/ch5-fig-1.svg`,
      source: "supplemental",
      sourceBadge: "Illustrated Study Plate",
      badge: "Illustrated Study Plate",
      keyTakeaway: "Superficial to deep epidermal layers: Corneum, Lucidum (thick skin only), Granulosum, Spinosum, Basale.",
    },
    {
      id: "ch5-fig-2",
      title: "Burn Depth Classification (1°/2°/3°) & ABCD Melanoma Rule",
      caption: "Cutaneous thermoregulation, Vitamin D3 synthesis, partial- vs. full-thickness burns, and ABCD skin cancer screening.",
      src: `${BASE}anatomy/concepts/ch5-fig-2.svg`,
      source: "supplemental",
      sourceBadge: "Illustrated Study Plate",
      badge: "Illustrated Study Plate",
      keyTakeaway: "Second-degree burns damage epidermis + upper dermis (blisters); third-degree destroys full thickness (Fluid loss is #1 threat).",
    },
  ],
  "chapter-6": [
    {
      id: "ch6-fig-1",
      title: "Classification of Bones by Shape",
      caption: "Long, short, flat, and irregular bones compared across the human skeleton.",
      src: `${BASE}anatomy/chapter6/bone-shapes.jpeg`,
      source: "course",
      sourceBadge: "Course Textbook Figure",
      badge: "Course Textbook Figure",
      keyTakeaway: "Sternum and skull bones are flat bones; vertebrae and hip bones are irregular.",
    },
    {
      id: "ch6-fig-2",
      title: "Gross Anatomy of a Long Bone",
      caption: "Diaphysis (compact bone shaft), epiphyses (spongy bone ends), medullary cavity, and periosteum.",
      src: `${BASE}anatomy/chapter6/long-bone-anatomy.jpeg`,
      source: "course",
      sourceBadge: "Course Textbook Figure",
      badge: "Course Textbook Figure",
      keyTakeaway: "The epiphyseal plate (hyaline cartilage) enables interstitial lengthwise growth.",
    },
    {
      id: "ch6-fig-10",
      title: "Long Bone Epiphysis & Compact Wall Cross-Section",
      caption: "Detailed view of proximal epiphysis spongy trabeculae, epiphyseal line, endosteum, and periosteum.",
      src: `${BASE}anatomy/chapter6/long-bone-overview.jpg`,
      source: "course",
      sourceBadge: "Course Textbook Figure",
      badge: "Course Textbook Figure",
      keyTakeaway: "Periosteum anchors to bone matrix via perforating (Sharpey’s) collagen fibers.",
    },
    {
      id: "ch6-fig-3",
      title: "Bone Cell Lineage & Functions",
      caption: "Osteogenic stem cells, matrix-building osteoblasts, maintaining osteocytes, and resorbing osteoclasts.",
      src: `${BASE}anatomy/chapter6/bone-cells.jpeg`,
      source: "course",
      sourceBadge: "Course Textbook Figure",
      badge: "Course Textbook Figure",
      keyTakeaway: "Osteoblasts build bone matrix; osteoclasts break down matrix for calcium release.",
    },
    {
      id: "ch6-fig-4",
      title: "Microscopic Anatomy: Compact Bone Osteon",
      caption: "Concentric lamellae surrounding a central (Haversian) canal, connected by perforating canals and canaliculi.",
      src: `${BASE}anatomy/chapter6/compact-bone-osteon.jpeg`,
      source: "course",
      sourceBadge: "Course Textbook Figure",
      badge: "Course Textbook Figure",
      keyTakeaway: "Canaliculi connect lacunae so osteocytes can exchange nutrients through solid matrix.",
    },
    {
      id: "ch6-fig-5",
      title: "Spongy Bone & Trabecular Network",
      caption: "Honeycomb trabeculae aligned along lines of mechanical stress without central canals.",
      src: `${BASE}anatomy/chapter6/spongy-bone-trabeculae.jpeg`,
      source: "course",
      sourceBadge: "Course Textbook Figure",
      badge: "Course Textbook Figure",
      keyTakeaway: "Spongy bone lacks osteons and houses red bone marrow for hematopoiesis.",
    },
    {
      id: "ch6-fig-6",
      title: "Endochondral Ossification Stages",
      caption: "Replacement of a hyaline cartilage model with bone, from bone collar formation to secondary ossification centers.",
      src: `${BASE}anatomy/chapter6/endochondral-ossification.jpeg`,
      source: "course",
      sourceBadge: "Course Textbook Figure",
      badge: "Course Textbook Figure",
      keyTakeaway: "Most bones inferior to the skull develop via endochondral ossification.",
    },
    {
      id: "ch6-fig-7",
      title: "Epiphyseal Plate Zones & Interstitial Growth",
      caption: "Proliferation, hypertrophy, calcification, and ossification zones at the metaphysis.",
      src: `${BASE}anatomy/chapter6/epiphyseal-growth-plate.jpeg`,
      source: "course",
      sourceBadge: "Course Textbook Figure",
      badge: "Course Textbook Figure",
      keyTakeaway: "Chondrocytes divide on the epiphyseal side while osteoblasts ossify on the diaphyseal side.",
    },
    {
      id: "ch6-fig-8",
      title: "Calcium Homeostasis & Hormonal Control",
      caption: "Parathyroid hormone (PTH) feedback loop regulating blood Ca²⁺ via osteoclast stimulation.",
      src: `${BASE}anatomy/chapter6/calcium-homeostasis.jpeg`,
      source: "course",
      sourceBadge: "Course Textbook Figure",
      badge: "Course Textbook Figure",
      keyTakeaway: "PTH raises blood calcium when levels drop; mechanical stress drives local remodeling.",
    },
    {
      id: "ch6-fig-9",
      title: "Stages of Bone Fracture Repair",
      caption: "Hematoma formation, fibrocartilaginous callus, bony callus, and final bone remodeling.",
      src: `${BASE}anatomy/chapter6/fracture-healing.jpeg`,
      source: "course",
      sourceBadge: "Course Textbook Figure",
      badge: "Course Textbook Figure",
      keyTakeaway: "A soft fibrocartilage callus forms first before converting to a spongy bony callus.",
    },
  ],
  "chapter-7": [
    {
      id: "ch7-fig-1",
      title: "Axial vs. Appendicular Skeleton Overview",
      caption: "Color-coded division of the 80 axial bones and 126 appendicular bones.",
      src: `${BASE}anatomy/chapter7/axial-skeleton.png`,
      source: "course",
      sourceBadge: "Course Textbook Figure",
      badge: "Course Textbook Figure",
      keyTakeaway: "Axial = skull, vertebral column, thoracic cage; Appendicular = limbs + pectoral/pelvic girdles.",
    },
    {
      id: "ch7-fig-2",
      title: "Anterior & Lateral Skull Landmarks",
      caption: "Cranial and facial bones including frontal, parietal, temporal, zygomatic, maxilla, and mandible.",
      src: `${BASE}anatomy/chapter7/frontal-bone.png`,
      source: "course",
      sourceBadge: "Course Textbook Figure",
      badge: "Course Textbook Figure",
      keyTakeaway: "8 cranial bones protect the brain; 14 facial bones support entrances and facial muscles.",
    },
    {
      id: "ch7-fig-3",
      title: "Sphenoid Bone (Keystone of the Cranial Floor)",
      caption: "Superior view showing sella turcica, greater and lesser wings, and optic canals.",
      src: `${BASE}anatomy/chapter7/sphenoid-bone.png`,
      source: "course",
      sourceBadge: "Course Textbook Figure",
      badge: "Course Textbook Figure",
      keyTakeaway: "The sella turcica ('Turkish saddle') houses the pituitary gland.",
    },
    {
      id: "ch7-fig-4",
      title: "Vertebral Column Curvatures & Regions",
      caption: "7 cervical, 12 thoracic, 5 lumbar, sacrum, and coccyx with primary and secondary curvatures.",
      src: `${BASE}anatomy/chapter7/vertebral-column.png`,
      source: "course",
      sourceBadge: "Course Textbook Figure",
      badge: "Course Textbook Figure",
      keyTakeaway: "Cervical vertebrae have transverse foramina; thoracic have costal facets; lumbar have massive bodies.",
    },
    {
      id: "ch7-fig-5",
      title: "Atlas (C1) and Axis (C2) Articulation",
      caption: "Superior and posterolateral views of C1 and the dens (odontoid process) of C2.",
      src: `${BASE}anatomy/chapter7/axis-c2.png`,
      source: "course",
      sourceBadge: "Course Textbook Figure",
      badge: "Course Textbook Figure",
      keyTakeaway: "Atlas (C1) nods 'yes'; the dens of Axis (C2) pivots to shake the head 'no'.",
    },
    {
      id: "ch7-fig-6",
      title: "Bony Thorax: Sternum & Ribs",
      caption: "Manubrium, body, xiphoid process, true ribs (1–7), false ribs (8–12), and floating ribs (11–12).",
      src: `${BASE}anatomy/chapter7/bony-thorax.png`,
      source: "course",
      sourceBadge: "Course Textbook Figure",
      badge: "Course Textbook Figure",
      keyTakeaway: "True ribs attach directly to the sternum via individual costal cartilages.",
    },
    {
      id: "ch7-fig-7",
      title: "Pectoral Girdle & Scapular Landmarks",
      caption: "Clavicle and scapula showing acromion, coracoid process, glenoid cavity, and spine.",
      src: `${BASE}anatomy/chapter7/scapula.png`,
      source: "course",
      sourceBadge: "Course Textbook Figure",
      badge: "Course Textbook Figure",
      keyTakeaway: "The shallow glenoid cavity articulates with the head of the humerus for maximum shoulder mobility.",
    },
    {
      id: "ch7-fig-8",
      title: "Upper Limb: Humerus, Radius & Ulna",
      caption: "Arm and forearm bones in anatomical position (radius lateral, ulna medial).",
      src: `${BASE}anatomy/chapter7/humerus.png`,
      source: "course",
      sourceBadge: "Course Textbook Figure",
      badge: "Course Textbook Figure",
      keyTakeaway: "Trochlea of humerus articulates with the ulnar trochlear notch; capitulum meets the radial head.",
    },
    {
      id: "ch7-fig-9",
      title: "Pelvic Girdle: Ilium, Ischium & Pubis",
      caption: "Fused coxal bone regions meeting at the deep socket of the acetabulum.",
      src: `${BASE}anatomy/chapter7/pelvic-girdle.png`,
      source: "course",
      sourceBadge: "Course Textbook Figure",
      badge: "Course Textbook Figure",
      keyTakeaway: "The sacroiliac joint links the pelvis to the axial skeleton; pubic bones meet at the pubic symphysis.",
    },
    {
      id: "ch7-fig-10",
      title: "Lower Limb: Femur, Tibia & Fibula",
      caption: "Head, neck, trochanters, and condyles of the femur; medial weight-bearing tibia and lateral fibula.",
      src: `${BASE}anatomy/chapter7/tibia-fibula.png`,
      source: "course",
      sourceBadge: "Course Textbook Figure",
      badge: "Course Textbook Figure",
      keyTakeaway: "The tibia bears body weight and forms the medial malleolus; the fibula forms the lateral malleolus.",
    },
  ],
  "chapter-8": [
    {
      id: "ch8-fig-1",
      title: "Functional & Structural Classification of Joints",
      caption: "Comparing synarthroses (immovable), amphiarthroses (slightly movable), and diarthroses (freely movable).",
      src: `${BASE}anatomy/chapter8/functional-joints.jpeg`,
      source: "course",
      sourceBadge: "Course Textbook Figure",
      badge: "Course Textbook Figure",
      keyTakeaway: "All synovial joints are functionally classified as diarthroses.",
    },
    {
      id: "ch8-fig-2",
      title: "Fibrous Joints: Sutures, Syndesmoses & Gomphoses",
      caption: "Dense fibrous connective tissue uniting bones without a joint cavity.",
      src: `${BASE}anatomy/chapter8/fibrous-joints.jpeg`,
      source: "course",
      sourceBadge: "Course Textbook Figure",
      badge: "Course Textbook Figure",
      keyTakeaway: "Skull sutures and tooth-in-socket gomphoses are immovable fibrous joints.",
    },
    {
      id: "ch8-fig-3",
      title: "Cartilaginous Joints: Synchondroses & Symphyses",
      caption: "Hyaline cartilage epiphyseal plates (synchondroses) vs. fibrocartilage intervertebral discs & pubic symphysis.",
      src: `${BASE}anatomy/chapter8/cartilaginous-joints.jpeg`,
      source: "course",
      sourceBadge: "Course Textbook Figure",
      badge: "Course Textbook Figure",
      keyTakeaway: "Synchondroses use hyaline cartilage; symphyses use compressible fibrocartilage.",
    },
    {
      id: "ch8-fig-4",
      title: "General Structure of a Synovial Joint",
      caption: "Articular cartilage, joint cavity with synovial fluid, double-layered capsule, and reinforcing ligaments.",
      src: `${BASE}anatomy/chapter8/synovial-joint-structure.jpeg`,
      source: "course",
      sourceBadge: "Course Textbook Figure",
      badge: "Course Textbook Figure",
      keyTakeaway: "Muscle tone crossing the joint is typically the most important stabilizing factor.",
    },
    {
      id: "ch8-fig-5",
      title: "Bursae & Tendon Sheaths",
      caption: "Flattened synovial sacs and elongated sleeves that reduce friction where tendons rub against bone.",
      src: `${BASE}anatomy/chapter8/bursae-tendon-sheaths.jpeg`,
      source: "course",
      sourceBadge: "Course Textbook Figure",
      badge: "Course Textbook Figure",
      keyTakeaway: "Bursae are friction-reducing cushions outside the main joint cavity.",
    },
    {
      id: "ch8-fig-6",
      title: "Synovial Angular Movements",
      caption: "Flexion, extension, hyperextension, abduction, adduction, and circumduction.",
      src: `${BASE}anatomy/chapter8/angular-movements.jpeg`,
      source: "course",
      sourceBadge: "Course Textbook Figure",
      badge: "Course Textbook Figure",
      keyTakeaway: "Abduction moves a limb away from the midline; adduction brings it back toward the midline.",
    },
    {
      id: "ch8-fig-10",
      title: "Plane, Hinge & Pivot Synovial Joints",
      caption: "Intercarpal plane joints, elbow/interphalangeal hinge joints, and radioulnar/atlantoaxial pivot joints.",
      src: `${BASE}anatomy/chapter8/hinge-pivot-plane.jpeg`,
      source: "course",
      sourceBadge: "Course Textbook Figure",
      badge: "Course Textbook Figure",
      keyTakeaway: "Plane joints permit gliding; hinge and pivot joints are uniaxial.",
    },
    {
      id: "ch8-fig-7",
      title: "Condyloid, Saddle & Ball-and-Socket Joints",
      caption: "Biaxial condyloid (knuckles) and saddle (thumb CMC) joints vs. multiaxial ball-and-socket (shoulder/hip).",
      src: `${BASE}anatomy/chapter8/ball-and-socket-saddle.jpeg`,
      source: "course",
      sourceBadge: "Course Textbook Figure",
      badge: "Course Textbook Figure",
      keyTakeaway: "Hinge (elbow/knee) is uniaxial; ball-and-socket (shoulder/hip) is multiaxial.",
    },
    {
      id: "ch8-fig-8",
      title: "Anatomy of the Knee Joint",
      caption: "Tibial/fibular collateral ligaments, anterior/posterior cruciate ligaments (ACL/PCL), and fibrocartilage menisci.",
      src: `${BASE}anatomy/chapter8/knee-joint-anatomy.jpeg`,
      source: "course",
      sourceBadge: "Course Textbook Figure",
      badge: "Course Textbook Figure",
      keyTakeaway: "The ACL prevents anterior sliding of the tibia and checks hyperextension of the knee.",
    },
    {
      id: "ch8-fig-9",
      title: "Arthritis & Joint Homeostasis",
      caption: "Wear-and-tear osteoarthritis vs. autoimmune rheumatoid arthritis and uric-acid gouty arthritis.",
      src: `${BASE}anatomy/chapter8/arthritis-comparison.jpeg`,
      source: "course",
      sourceBadge: "Course Textbook Figure",
      badge: "Course Textbook Figure",
      keyTakeaway: "Osteoarthritis is degenerative cartilage wear; rheumatoid is autoimmune synovial membrane inflammation.",
    },
  ],
  "chapter-9": [
    {
      id: "ch9-fig-1",
      title: "Skeletal, Cardiac, and Smooth Muscle Comparison",
      caption: "Histological appearance, striations, nuclei, control (voluntary vs. involuntary), and location.",
      src: `${BASE}anatomy/chapter9/muscle-tissue-types.jpeg`,
      source: "course",
      sourceBadge: "Course Textbook Figure",
      badge: "Course Textbook Figure",
      keyTakeaway: "Skeletal is striated & voluntary; cardiac is striated & involuntary with intercalated discs; smooth is non-striated & involuntary.",
    },
    {
      id: "ch9-fig-2",
      title: "Connective Tissue Wrappings of Skeletal Muscle",
      caption: "Epimysium (whole muscle), perimysium (fascicles), and endomysium (individual muscle fibers).",
      src: `${BASE}anatomy/chapter9/muscle-sheaths.jpeg`,
      source: "course",
      sourceBadge: "Course Textbook Figure",
      badge: "Course Textbook Figure",
      keyTakeaway: "From outer to inner: Epimysium → Perimysium (around fascicles) → Endomysium (around each fiber).",
    },
    {
      id: "ch9-fig-3",
      title: "Levels of Organization: Muscle to Myofilaments",
      caption: "Whole muscle → fascicle → muscle fiber (cell) → myofibril → sarcomere → thick/thin filaments.",
      src: `${BASE}anatomy/chapter9/muscle-organization-levels.jpeg`,
      source: "course",
      sourceBadge: "Course Textbook Figure",
      badge: "Course Textbook Figure",
      keyTakeaway: "Each muscle fiber contains hundreds of rod-like myofibrils built from repeating sarcomeres.",
    },
    {
      id: "ch9-fig-4",
      title: "Sarcomere Banding Pattern (Z Disc, A Band, I Band)",
      caption: "Thick (myosin) and thin (actin) filament overlap producing dark A bands and light I bands.",
      src: `${BASE}anatomy/chapter9/sarcomere-banding.jpeg`,
      source: "course",
      sourceBadge: "Course Textbook Figure",
      badge: "Course Textbook Figure",
      keyTakeaway: "A sarcomere runs from Z disc to Z disc; the A band length stays constant during contraction.",
    },
    {
      id: "ch9-fig-5",
      title: "Thick (Myosin) & Thin (Actin, Troponin, Tropomyosin) Filaments",
      caption: "Myosin golf-club heads with ATP-binding sites and actin strands regulated by troponin-tropomyosin.",
      src: `${BASE}anatomy/chapter9/myosin-actin-filaments.jpeg`,
      source: "course",
      sourceBadge: "Course Textbook Figure",
      badge: "Course Textbook Figure",
      keyTakeaway: "Ca²⁺ binds to troponin, shifting tropomyosin to expose myosin-binding sites on actin.",
    },
    {
      id: "ch9-fig-6",
      title: "Sarcoplasmic Reticulum & T-Tubule Triads",
      caption: "Sarcolemma invaginations (T-tubules) flanked by terminal cisternae of the sarcoplasmic reticulum.",
      src: `${BASE}anatomy/chapter9/sarcoplasmic-reticulum-tubules.jpeg`,
      source: "course",
      sourceBadge: "Course Textbook Figure",
      badge: "Course Textbook Figure",
      keyTakeaway: "T-tubules conduct action potentials deep into the cell so the SR releases Ca²⁺ simultaneously.",
    },
    {
      id: "ch9-fig-7",
      title: "Sliding-Filament Mechanism of Contraction",
      caption: "Thin filaments slide toward the M line as Z discs pull closer together; filament lengths never change.",
      src: `${BASE}anatomy/chapter9/sliding-filament-mechanism.jpeg`,
      source: "course",
      sourceBadge: "Course Textbook Figure",
      badge: "Course Textbook Figure",
      keyTakeaway: "During contraction, the I band and H zone narrow, the Z discs move closer, and the A band stays the same width.",
    },
    {
      id: "ch9-fig-8",
      title: "Cross-Bridge Cycle & Power Stroke",
      caption: "1. Cross-bridge formation → 2. Power stroke (ADP+Pi released) → 3. Cross-bridge detachment (new ATP binds) → 4. Cocking of myosin head.",
      src: `${BASE}anatomy/chapter9/crossbridge-power-stroke.jpeg`,
      source: "course",
      sourceBadge: "Course Textbook Figure",
      badge: "Course Textbook Figure",
      keyTakeaway: "Fresh ATP binding is required to detach the myosin head from actin (lack of ATP causes rigor mortis).",
    },
    {
      id: "ch9-fig-9",
      title: "Excitation-Contraction Coupling",
      caption: "ACh release at the neuromuscular junction → end-plate potential → T-tubule wave → SR Ca²⁺ release → cross-bridge cycling.",
      src: `${BASE}anatomy/chapter9/excitation-contraction-coupling.png`,
      source: "course",
      sourceBadge: "Course Textbook Figure",
      badge: "Course Textbook Figure",
      keyTakeaway: "Acetylcholine (ACh) opens Na⁺ channels at the motor end plate to trigger the muscle action potential.",
    },
  ],
  "chapter-10": [
    {
      id: "ch10-fig-1",
      title: "Muscle Lever Systems & Fascicle Architecture",
      caption: "First-, second-, and third-class levers plus parallel/pennate fascicles and agonist/antagonist/synergist roles.",
      src: `${BASE}anatomy/concepts/ch10-fig-1.svg`,
      source: "supplemental",
      sourceBadge: "Illustrated Study Plate",
      badge: "Illustrated Study Plate",
      keyTakeaway: "Muscles only pull — the insertion moves toward the stationary origin upon contraction.",
    },
    {
      id: "ch10-fig-2",
      title: "Major Regional Skeletal Muscle Groups & Actions",
      caption: "Mastication, respiration, core abdominal wall, rotator cuff (SITS), quadriceps, hamstrings, and calf muscles.",
      src: `${BASE}anatomy/concepts/ch10-fig-2.svg`,
      source: "supplemental",
      sourceBadge: "Illustrated Study Plate",
      badge: "Illustrated Study Plate",
      keyTakeaway: "Quadriceps femoris (4 heads) extend the knee; Hamstrings (3 muscles) extend the hip and flex the knee.",
    },
  ],
  "chapter-11": [
    {
      id: "ch11-fig-1",
      title: "Action Potential Waveform & Voltage-Gated Ion Channels",
      caption: "Resting potential (-70 mV), threshold (-55 mV), Na⁺ depolarization (+30 mV), K⁺ repolarization, and refractory periods.",
      src: `${BASE}anatomy/concepts/ch11-fig-1.svg`,
      source: "supplemental",
      sourceBadge: "Illustrated Study Plate",
      badge: "Illustrated Study Plate",
      keyTakeaway: "Depolarization is driven by voltage-gated Na⁺ influx; repolarization is driven by voltage-gated K⁺ efflux.",
    },
    {
      id: "ch11-fig-2",
      title: "Neuron Structure, Neuroglia & Chemical Synapse",
      caption: "CNS vs. PNS glial cells, saltatory conduction across Nodes of Ranvier, Ca²⁺ exocytosis, and EPSP vs. IPSP.",
      src: `${BASE}anatomy/concepts/ch11-fig-2.svg`,
      source: "supplemental",
      sourceBadge: "Illustrated Study Plate",
      badge: "Illustrated Study Plate",
      keyTakeaway: "Voltage-gated Ca²⁺ influx at the presynaptic axon terminal triggers neurotransmitter vesicle exocytosis.",
    },
  ],
  "chapter-12": [
    {
      id: "ch12-fig-1",
      title: "Cerebral Lobes, Diencephalon & Brainstem Functional Map",
      caption: "Precentral motor & postcentral somatosensory gyri, Broca/Wernicke areas, thalamus, hypothalamus, brainstem, and cerebellum.",
      src: `${BASE}anatomy/concepts/ch12-fig-1.svg`,
      source: "supplemental",
      sourceBadge: "Illustrated Study Plate",
      badge: "Illustrated Study Plate",
      keyTakeaway: "Precentral gyrus (frontal lobe) is primary motor cortex; Postcentral gyrus (parietal lobe) is primary somatosensory cortex.",
    },
    {
      id: "ch12-fig-2",
      title: "Spinal Cord Cross-Section, Meninges & CSF Circulation",
      caption: "Dura, arachnoid, and pia mater, choroid plexus CSF flow, dorsal sensory roots, and ventral motor roots.",
      src: `${BASE}anatomy/concepts/ch12-fig-2.svg`,
      source: "supplemental",
      sourceBadge: "Illustrated Study Plate",
      badge: "Illustrated Study Plate",
      keyTakeaway: "Dorsal spinal roots carry afferent sensory fibers; ventral roots carry efferent motor fibers.",
    },
  ],
  "chapter-13": [
    {
      id: "ch13-fig-1",
      title: "The 12 Pairs of Cranial Nerves (CN I – CN XII)",
      caption: "Sensory, motor, and mixed cranial nerves with target organs and clinical cranial nerve testing.",
      src: `${BASE}anatomy/concepts/ch13-fig-1.svg`,
      source: "supplemental",
      sourceBadge: "Illustrated Study Plate",
      badge: "Illustrated Study Plate",
      keyTakeaway: "Vagus nerve (CN X) is the only cranial nerve extending into the thorax and abdomen for parasympathetic control.",
    },
    {
      id: "ch13-fig-2",
      title: "Spinal Nerve Plexuses & Five-Component Reflex Arc",
      caption: "Receptor → Sensory Neuron → Integration Center → Motor Neuron → Effector reflex pathway and 4 spinal plexuses.",
      src: `${BASE}anatomy/concepts/ch13-fig-2.svg`,
      source: "supplemental",
      sourceBadge: "Illustrated Study Plate",
      badge: "Illustrated Study Plate",
      keyTakeaway: "Phrenic nerve (C3–C5) innervates the diaphragm; Sciatic nerve (sacral plexus) is the largest nerve in the body.",
    },
  ],
  "chapter-14": [
    {
      id: "ch14-fig-1",
      title: "Autonomic Nervous System: Sympathetic vs. Parasympathetic",
      caption: "Two-neuron chain comparing thoracolumbar (T1–L2) vs. craniosacral (CN III, VII, IX, X; S2–S4) pathways.",
      src: `${BASE}anatomy/concepts/ch14-fig-1.svg`,
      source: "supplemental",
      sourceBadge: "Illustrated Study Plate",
      badge: "Illustrated Study Plate",
      keyTakeaway: "All autonomic preganglionic axons release ACh onto nicotinic receptors; most sympathetic postganglionic axons release NE.",
    },
    {
      id: "ch14-fig-2",
      title: "Autonomic Receptors (α, β, Muscarinic) & Dual Innervation",
      caption: "Heart (β1 vs. M2), bronchioles (β2), blood vessel α1 sympathetic tone, iris pupil control, and visceral referred pain.",
      src: `${BASE}anatomy/concepts/ch14-fig-2.svg`,
      source: "supplemental",
      sourceBadge: "Illustrated Study Plate",
      badge: "Illustrated Study Plate",
      keyTakeaway: "β1 receptors increase heart rate and contractility; β2 receptors dilate bronchioles; α1 constricts blood vessels.",
    },
  ],
  "chapter-15": [
    {
      id: "ch15-fig-1",
      title: "Sagittal Eye Anatomy, Three Tunics & Retinal Photoreceptors",
      caption: "Cornea, iris, lens accommodation, sclera/choroid/retina, rods vs. cones, fovea centralis, and optic pathway.",
      src: `${BASE}anatomy/concepts/ch15-fig-1.svg`,
      source: "supplemental",
      sourceBadge: "Illustrated Study Plate",
      badge: "Illustrated Study Plate",
      keyTakeaway: "Fovea centralis contains only cones for sharpest color acuity; the optic disc lacks photoreceptors (blind spot).",
    },
    {
      id: "ch15-fig-2",
      title: "Ear Anatomy: Cochlear Organ of Corti & Vestibular Equilibrium",
      caption: "Malleus-incus-stapes ossicles, basilar membrane hair cells, semicircular canal crista ampullaris, and maculae.",
      src: `${BASE}anatomy/concepts/ch15-fig-2.svg`,
      source: "supplemental",
      sourceBadge: "Illustrated Study Plate",
      badge: "Illustrated Study Plate",
      keyTakeaway: "Organ of Corti in the cochlea transduces sound; maculae detect linear acceleration; crista ampullaris detects rotation.",
    },
  ],
}

export const courseVisuals = CHAPTER_FIGURES

export function loadCustomFigures() {
  if (typeof window === "undefined") return {}
  try {
    const raw = window.localStorage.getItem(CUSTOM_FIGURES_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

export function saveCustomFigure(chapterId, figure) {
  if (typeof window === "undefined") return loadCustomFigures()
  const current = loadCustomFigures()
  const existing = Array.isArray(current[chapterId]) ? current[chapterId] : []
  const next = {
    ...current,
    [chapterId]: [figure, ...existing.filter((item) => item.id !== figure.id)].slice(
      0,
      MAX_CUSTOM_FIGURES_PER_CHAPTER,
    ),
  }
  window.localStorage.setItem(CUSTOM_FIGURES_STORAGE_KEY, JSON.stringify(next))
  return next
}

export function removeCustomFigure(chapterId, figureId) {
  if (typeof window === "undefined") return loadCustomFigures()
  const current = loadCustomFigures()
  const existing = Array.isArray(current[chapterId]) ? current[chapterId] : []
  const next = {
    ...current,
    [chapterId]: existing.filter((item) => item.id !== figureId),
  }
  window.localStorage.setItem(CUSTOM_FIGURES_STORAGE_KEY, JSON.stringify(next))
  return next
}

export async function compressImageFileToDataUrl(file, { maxDimension = 1100, quality = 0.82 } = {}) {
  if (!file || !file.type?.startsWith("image/")) {
    throw new Error("Choose a PNG, JPG, WebP, GIF, or SVG image file.")
  }
  if (file.size > 15 * 1024 * 1024) {
    throw new Error("Choose an image smaller than 15 MB.")
  }
  if (file.type === "image/svg+xml" && file.size <= 350 * 1024) {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result || ""))
      reader.onerror = () => reject(new Error("Could not read SVG image."))
      reader.readAsDataURL(file)
    })
  }
  const objectUrl = URL.createObjectURL(file)
  try {
    const img = await new Promise((resolve, reject) => {
      const el = new Image()
      el.onload = () => resolve(el)
      el.onerror = () => reject(new Error("This image could not be decoded."))
      el.src = objectUrl
    })
    const width = img.naturalWidth || img.width || 800
    const height = img.naturalHeight || img.height || 600
    const scale = Math.min(1, maxDimension / Math.max(width, height, 1))
    const targetW = Math.max(1, Math.round(width * scale))
    const targetH = Math.max(1, Math.round(height * scale))
    const canvas = document.createElement("canvas")
    canvas.width = targetW
    canvas.height = targetH
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Canvas context unavailable for image processing.")
    ctx.drawImage(img, 0, 0, targetW, targetH)
    const mime = file.type === "image/png" ? "image/png" : "image/jpeg"
    const dataUrl = canvas.toDataURL(mime, quality)
    if (dataUrl.length > 550_000) {
      ctx.globalCompositeOperation = "destination-over"
      ctx.fillStyle = "#f4f7f5"
      ctx.fillRect(0, 0, targetW, targetH)
      return canvas.toDataURL("image/jpeg", 0.78)
    }
    return dataUrl
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

export function getFiguresForChapter(chapterId, customFiguresMap = null) {
  const custom = customFiguresMap ?? loadCustomFigures()
  const customList = Array.isArray(custom?.[chapterId]) ? custom[chapterId] : []
  const builtIn = CHAPTER_FIGURES[chapterId] ?? []
  return [...customList, ...builtIn]
}
