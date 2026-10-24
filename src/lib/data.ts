// Catalog data for services, brands and pricing.
// Prices are starting estimates in BDT — adjust them to your real price list.

export type IconName =
  | "screen"
  | "battery"
  | "port"
  | "camera"
  | "water"
  | "chip"
  | "glass"
  | "speaker"
  | "software"
  | "faceid";

export type Service = {
  slug: string;
  name: string;
  short: string;
  intro: string;
  icon: IconName;
  time: string;
  warranty: string;
  symptoms: string[];
  process: string[];
  faqs: { q: string; a: string }[];
};

export const services: Service[] = [
  {
    slug: "screen-replacement",
    name: "Screen Replacement",
    short: "Cracked, black or unresponsive display replaced with original-grade panels.",
    intro:
      "A cracked or dead screen is the most common phone problem we fix. We replace OLED and LCD displays with original or premium-grade panels, recalibrate True Tone and touch, and test every pixel before handing your phone back.",
    icon: "screen",
    time: "45–90 min",
    warranty: "Up to 6 months",
    symptoms: [
      "Cracked or shattered glass",
      "Black screen, lines or green tint",
      "Ghost touch or dead touch zones",
      "Display flickering or dim backlight",
    ],
    process: [
      "Free diagnosis to confirm display vs. board fault",
      "Choose original or premium-grade panel with clear pricing",
      "Careful replacement in a dust-controlled bench",
      "True Tone, touch and Face ID / sensor testing",
    ],
    faqs: [
      {
        q: "Will I lose my data during screen replacement?",
        a: "No. Screen replacement does not touch storage. Your photos, apps and chats stay exactly as they are.",
      },
      {
        q: "Will True Tone and Face ID still work?",
        a: "Yes. We transfer the display serial data so True Tone keeps working, and Face ID is never affected by a proper screen replacement.",
      },
    ],
  },
  {
    slug: "battery-replacement",
    name: "Battery Replacement",
    short: "Restore all-day battery life with high-capacity, genuine-grade cells.",
    intro:
      "Batteries wear out after 500+ charge cycles. If your phone drains fast, shuts down suddenly or the battery is swollen, a new battery brings it back to full-day performance.",
    icon: "battery",
    time: "30–60 min",
    warranty: "6 months",
    symptoms: [
      "Battery health below 80%",
      "Phone shuts down at 20–30%",
      "Swollen battery lifting the screen",
      "Phone gets hot while charging",
    ],
    process: [
      "Battery health and charging-circuit check",
      "Safe removal of the old cell",
      "New battery with fresh adhesive and seal",
      "Charge-cycle and thermal test",
    ],
    faqs: [
      {
        q: "Will battery health show 100% after replacement?",
        a: "With our genuine-grade batteries and calibration, battery health shows correctly on supported models. We explain any model-specific message before we start.",
      },
    ],
  },
  {
    slug: "charging-port-repair",
    name: "Charging Port Repair",
    short: "Loose cable, slow or no charging — port cleaned, repaired or replaced.",
    intro:
      "Charging problems are often caused by lint, corrosion or a damaged port flex. We clean, repair or replace the port and test both charging and data transfer.",
    icon: "port",
    time: "30–60 min",
    warranty: "3 months",
    symptoms: ["Cable feels loose", "Charges only at an angle", "Very slow charging", "Not detected by computer"],
    process: [
      "Port inspection under microscope",
      "Ultrasonic cleaning where possible",
      "Port / flex replacement if damaged",
      "Fast-charge and data test",
    ],
    faqs: [
      {
        q: "Is it always the port that needs replacing?",
        a: "No. Many times a deep clean fixes it. We always try the cheaper fix first and only replace when necessary.",
      },
    ],
  },
  {
    slug: "camera-repair",
    name: "Camera Repair",
    short: "Blurry, shaking or black camera fixed — lens glass and modules replaced.",
    intro:
      "From a cracked camera lens to a shaking OIS module, we repair rear and front cameras so your photos are sharp again.",
    icon: "camera",
    time: "45–90 min",
    warranty: "3 months",
    symptoms: ["Blurry photos", "Camera shaking or buzzing", "Black screen in camera app", "Cracked lens glass"],
    process: ["Module and lens diagnosis", "Lens glass or module replacement", "Focus, OIS and flash testing"],
    faqs: [
      {
        q: "Can you replace only the lens glass?",
        a: "Yes. If only the protective glass is cracked, we replace just the glass, which costs much less than a full module.",
      },
    ],
  },
  {
    slug: "water-damage-repair",
    name: "Water Damage Repair",
    short: "Ultrasonic cleaning and board-level recovery for liquid-damaged phones.",
    intro:
      "Dropped your phone in water? Switch it off and bring it to us fast. We open, ultrasonic-clean and dry the board, then repair corroded components to save your phone and data.",
    icon: "water",
    time: "24–72 hours",
    warranty: "Case by case",
    symptoms: ["Phone fell in water or tea", "No power after liquid contact", "Speaker muffled", "Fogged camera"],
    process: [
      "Immediate disassembly and battery disconnect",
      "Ultrasonic board cleaning",
      "Component-level corrosion repair",
      "Full function test and data check",
    ],
    faqs: [
      {
        q: "Should I put my phone in rice?",
        a: "No. Rice does not remove corrosion and wastes valuable time. Switch the phone off and bring it in as soon as possible.",
      },
    ],
  },
  {
    slug: "motherboard-repair",
    name: "Motherboard Repair",
    short: "Micro-soldering and chip-level repair for dead, bootlooping or no-signal phones.",
    intro:
      "Our board-level technicians handle the repairs most shops refuse: no power, boot loops, no network, audio IC, charging IC and more — using microscopes and micro-soldering stations.",
    icon: "chip",
    time: "1–3 days",
    warranty: "3 months",
    symptoms: ["Phone won't turn on", "Stuck on logo / boot loop", "No service or Wi-Fi", "No sound in calls"],
    process: ["Board diagnosis with power analysis", "Fault isolation to component level", "Micro-soldering repair", "Stress test"],
    faqs: [
      {
        q: "Can you recover data from a dead phone?",
        a: "In many cases, yes. Board repair often brings the phone back long enough to recover all your data.",
      },
    ],
  },
  {
    slug: "back-glass-replacement",
    name: "Back Glass Replacement",
    short: "Cracked back glass replaced by laser removal for a factory finish.",
    intro:
      "We use laser back-glass removal so the frame stays intact and the new glass fits like factory — with wireless charging and MagSafe fully working.",
    icon: "glass",
    time: "1–2 hours",
    warranty: "3 months",
    symptoms: ["Cracked back glass", "Sharp edges on back", "Glass lifting from frame"],
    process: ["Laser removal of broken glass", "Frame cleaning", "New glass with original colour match", "Wireless charging test"],
    faqs: [
      {
        q: "Will wireless charging still work?",
        a: "Yes. Laser removal keeps the wireless charging coil safe, and we test it before returning your phone.",
      },
    ],
  },
  {
    slug: "speaker-mic-repair",
    name: "Speaker & Mic Repair",
    short: "Low volume, crackling sound or people can't hear you — fixed fast.",
    intro:
      "Audio issues usually come from dirty meshes, damaged speakers or a faulty microphone flex. We find the exact cause and fix it the same day.",
    icon: "speaker",
    time: "30–60 min",
    warranty: "3 months",
    symptoms: ["Low or crackling sound", "Caller can't hear you", "Earpiece silent", "Distorted loudspeaker"],
    process: ["Audio path test", "Mesh cleaning or part replacement", "Call and media test"],
    faqs: [
      {
        q: "Is it a software issue?",
        a: "Sometimes. We check software first, so you never pay for a part you don't need.",
      },
    ],
  },
  {
    slug: "software-repair",
    name: "Software & Unlock Help",
    short: "Updates, boot issues, data transfer and performance tune-up.",
    intro:
      "Slow phone, failed update or stuck on recovery? We fix software problems, transfer data safely and set up your phone like new.",
    icon: "software",
    time: "30 min – 2 hours",
    warranty: "7 days",
    symptoms: ["Phone very slow", "Update failed", "Stuck on recovery mode", "Need data transfer"],
    process: ["Backup where possible", "Firmware repair or update", "Performance optimization"],
    faqs: [
      {
        q: "Do you bypass locks?",
        a: "We only help owners with proof of purchase and follow manufacturer-approved methods. We never bypass locks on phones that are not yours.",
      },
    ],
  },
  {
    slug: "face-id-repair",
    name: "Face ID & Sensor Repair",
    short: "Face ID, proximity and fingerprint sensors diagnosed and repaired.",
    intro:
      "Face ID not available? Proximity sensor not turning off the screen in calls? We repair TrueDepth and sensor faults with specialized tools.",
    icon: "faceid",
    time: "1–2 days",
    warranty: "3 months",
    symptoms: ["“Face ID is not available”", "Screen stays on during calls", "Fingerprint not working"],
    process: ["Sensor diagnosis", "Flex or dot-projector repair", "Calibration and test"],
    faqs: [
      {
        q: "Can Face ID always be repaired?",
        a: "Most Face ID faults can be repaired. We tell you honestly after diagnosis, and you only pay if we fix it.",
      },
    ],
  },
];

export type Brand = {
  slug: string;
  name: string;
  models: string[];
  // starting price (BDT) per service slug
  prices: Partial<Record<string, number>>;
};

export const brands: Brand[] = [
  {
    slug: "iphone",
    name: "iPhone",
    models: [
      "iPhone 17 Pro Max", "iPhone 17 Pro", "iPhone 17", "iPhone 16 Pro Max", "iPhone 16 Pro",
      "iPhone 16 Plus", "iPhone 16", "iPhone 15 Pro Max", "iPhone 15 Pro", "iPhone 15",
      "iPhone 14 Pro Max", "iPhone 14 Pro", "iPhone 14", "iPhone 13 Pro Max", "iPhone 13",
      "iPhone 12 Pro Max", "iPhone 12", "iPhone 11 Pro Max", "iPhone 11", "iPhone XS Max", "iPhone XR", "iPhone SE",
    ],
    prices: {
      "screen-replacement": 3500, "battery-replacement": 2200, "charging-port-repair": 1500,
      "camera-repair": 1800, "water-damage-repair": 2500, "motherboard-repair": 3000,
      "back-glass-replacement": 2500, "speaker-mic-repair": 1200, "software-repair": 800, "face-id-repair": 3500,
    },
  },
  {
    slug: "samsung",
    name: "Samsung",
    models: [
      "Galaxy S25 Ultra", "Galaxy S25+", "Galaxy S25", "Galaxy S24 Ultra", "Galaxy S24", "Galaxy S23 Ultra",
      "Galaxy Z Fold 6", "Galaxy Z Flip 6", "Galaxy A56", "Galaxy A36", "Galaxy A55", "Galaxy A35", "Galaxy A16", "Galaxy M35",
    ],
    prices: {
      "screen-replacement": 3000, "battery-replacement": 1800, "charging-port-repair": 1000,
      "camera-repair": 1500, "water-damage-repair": 2000, "motherboard-repair": 2500,
      "back-glass-replacement": 1200, "speaker-mic-repair": 900, "software-repair": 700, "face-id-repair": 1500,
    },
  },
  {
    slug: "xiaomi",
    name: "Xiaomi",
    models: ["Xiaomi 15 Ultra", "Xiaomi 14T Pro", "Redmi Note 14 Pro+", "Redmi Note 14", "Redmi Note 13", "Redmi 14C", "POCO X7 Pro", "POCO F7"],
    prices: {
      "screen-replacement": 2200, "battery-replacement": 1400, "charging-port-repair": 800,
      "camera-repair": 1200, "water-damage-repair": 1800, "motherboard-repair": 2000,
      "back-glass-replacement": 900, "speaker-mic-repair": 700, "software-repair": 600, "face-id-repair": 1200,
    },
  },
  {
    slug: "oppo",
    name: "OPPO",
    models: ["Find X8 Pro", "Reno 13 Pro", "Reno 13", "Reno 12", "A5 Pro", "A3x", "F27 Pro+"],
    prices: {
      "screen-replacement": 2200, "battery-replacement": 1400, "charging-port-repair": 800,
      "camera-repair": 1200, "water-damage-repair": 1800, "motherboard-repair": 2000,
      "back-glass-replacement": 900, "speaker-mic-repair": 700, "software-repair": 600, "face-id-repair": 1200,
    },
  },
  {
    slug: "vivo",
    name: "vivo",
    models: ["X200 Pro", "V50", "V40", "Y300", "Y29", "T3 Ultra"],
    prices: {
      "screen-replacement": 2200, "battery-replacement": 1400, "charging-port-repair": 800,
      "camera-repair": 1200, "water-damage-repair": 1800, "motherboard-repair": 2000,
      "back-glass-replacement": 900, "speaker-mic-repair": 700, "software-repair": 600, "face-id-repair": 1200,
    },
  },
  {
    slug: "realme",
    name: "realme",
    models: ["GT 7 Pro", "realme 14 Pro+", "realme 13 Pro", "realme C75", "realme C65", "narzo 70"],
    prices: {
      "screen-replacement": 2000, "battery-replacement": 1300, "charging-port-repair": 800,
      "camera-repair": 1100, "water-damage-repair": 1800, "motherboard-repair": 2000,
      "back-glass-replacement": 900, "speaker-mic-repair": 700, "software-repair": 600, "face-id-repair": 1200,
    },
  },
  {
    slug: "google-pixel",
    name: "Google Pixel",
    models: ["Pixel 10 Pro", "Pixel 9 Pro XL", "Pixel 9 Pro", "Pixel 9", "Pixel 8 Pro", "Pixel 8", "Pixel 7a"],
    prices: {
      "screen-replacement": 3500, "battery-replacement": 2000, "charging-port-repair": 1200,
      "camera-repair": 1600, "water-damage-repair": 2200, "motherboard-repair": 2800,
      "back-glass-replacement": 1500, "speaker-mic-repair": 1000, "software-repair": 700, "face-id-repair": 1800,
    },
  },
  {
    slug: "oneplus",
    name: "OnePlus",
    models: ["OnePlus 13", "OnePlus 13R", "OnePlus 12", "Nord 4", "Nord CE4"],
    prices: {
      "screen-replacement": 3000, "battery-replacement": 1600, "charging-port-repair": 1000,
      "camera-repair": 1400, "water-damage-repair": 2000, "motherboard-repair": 2500,
      "back-glass-replacement": 1200, "speaker-mic-repair": 900, "software-repair": 700, "face-id-repair": 1500,
    },
  },
];

export const getService = (slug: string) => services.find((s) => s.slug === slug);
export const getBrand = (slug: string) => brands.find((b) => b.slug === slug);

export { formatTaka } from "./format";

export const stats = [
  { value: "25,000+", label: "Phones repaired" },
  { value: "9+", label: "Years of experience" },
  { value: "4.9/5", label: "Customer rating" },
  { value: "45 min", label: "Average repair time" },
];

export type FeatureIcon = "search" | "chip" | "shield" | "bolt" | "lock" | "coin";

export const features: { icon: FeatureIcon; title: string; text: string }[] = [
  { icon: "search", title: "Free Diagnosis", text: "We find the real problem first — no charge, no obligation." },
  { icon: "chip", title: "Genuine-Grade Parts", text: "Original and premium-grade parts tested before every install." },
  { icon: "shield", title: "Repair Warranty", text: "Up to 6 months warranty on parts and workmanship." },
  { icon: "bolt", title: "Same-Day Repair", text: "Most screen and battery repairs done while you wait." },
  { icon: "lock", title: "Data Privacy", text: "Your data stays private. We never access your personal files." },
  { icon: "coin", title: "No Fix, No Fee", text: "If we can't fix it, you don't pay for the repair." },
];

export const steps = [
  { title: "Book or walk in", text: "Book online, message on WhatsApp or simply visit our service center." },
  { title: "Free diagnosis", text: "A certified technician checks your phone and confirms the exact price." },
  { title: "Expert repair", text: "We repair it with quality parts — most jobs done the same day." },
  { title: "Test & warranty", text: "Full quality check, then you get your phone back with a warranty card." },
];

// Sample testimonials — replace with real customer reviews.
export const testimonials = [
  { name: "Rafiul Islam", area: "Gulshan, Dhaka", service: "Screen Replacement", text: "iPhone 14 Pro screen replaced in under an hour. Looks and feels exactly like original. Very professional team." },
  { name: "Nusrat Jahan", area: "Dhanmondi, Dhaka", service: "Water Damage", text: "My Samsung fell in water and other shops gave up. DazzleCare fixed the board and recovered all my photos." },
  { name: "Sabbir Ahmed", area: "Mirpur, Dhaka", service: "Charging Port", text: "Honest diagnosis — they cleaned the charging port instead of selling me a new one. Will come back for sure." },
  { name: "Farzana Akter", area: "Uttara, Dhaka", service: "Battery", text: "Battery replacement was quick and the price was exactly what they quoted on WhatsApp. Highly recommended." },
];

export const faqs = [
  {
    q: "How long does a phone repair take?",
    a: "Most screen, battery and charging port repairs are done in 30–90 minutes while you wait. Board-level and water damage repairs usually take 1–3 days.",
  },
  {
    q: "Do you give a warranty on repairs?",
    a: "Yes. Every repair comes with a written warranty of up to 6 months on parts and workmanship, depending on the service.",
  },
  {
    q: "Is diagnosis really free?",
    a: "Yes. We diagnose your phone for free and tell you the exact price before starting. You decide whether to go ahead.",
  },
  {
    q: "Which brands do you repair?",
    a: "We repair iPhone, Samsung, Xiaomi, Redmi, POCO, OPPO, vivo, realme, Google Pixel, OnePlus and most other Android brands.",
  },
  {
    q: "Is my data safe?",
    a: "Absolutely. Most repairs don't touch your data at all, and our technicians never access your personal files. You can also remove your passcode-protected data before handing over.",
  },
  {
    q: "Do you offer pickup and delivery in Dhaka?",
    a: "Yes. Book online or message us on WhatsApp and we can arrange pickup and delivery inside Dhaka city.",
  },
];

// ---------------------------------------------------------------------------
// Repairs for non-phone device categories (slugs match the API categories).
// Phones use the brand × service price table above.

export type CategoryRepair = { slug: string; name: string; price: number; time: string };

const generic: CategoryRepair[] = [
  { slug: "diagnosis", name: "Full Diagnosis", price: 0, time: "30 min" },
  { slug: "power-repair", name: "Power / No Start Repair", price: 1500, time: "1–2 days" },
  { slug: "board-repair", name: "Board-Level Repair", price: 2500, time: "2–3 days" },
];

export const categoryRepairs: Record<string, CategoryRepair[]> = {
  tablet: [
    { slug: "screen-replacement", name: "Screen Replacement", price: 4500, time: "1–2 hours" },
    { slug: "battery-replacement", name: "Battery Replacement", price: 3000, time: "1–2 hours" },
    { slug: "charging-port-repair", name: "Charging Port Repair", price: 1500, time: "1 hour" },
    { slug: "software-repair", name: "Software Repair", price: 800, time: "1 hour" },
    ...generic,
  ],
  laptop: [
    { slug: "screen-replacement", name: "Display Replacement", price: 6500, time: "1 day" },
    { slug: "keyboard-replacement", name: "Keyboard Replacement", price: 2500, time: "1 day" },
    { slug: "battery-replacement", name: "Battery Replacement", price: 3500, time: "2 hours" },
    { slug: "ssd-upgrade", name: "SSD / RAM Upgrade", price: 1000, time: "1 hour" },
    { slug: "os-install", name: "OS Install & Data Backup", price: 1200, time: "2 hours" },
    { slug: "cleaning", name: "Thermal Paste & Cleaning", price: 1200, time: "2 hours" },
    ...generic,
  ],
  "smart-watch": [
    { slug: "screen-replacement", name: "Screen Replacement", price: 3500, time: "2 hours" },
    { slug: "battery-replacement", name: "Battery Replacement", price: 2000, time: "1 hour" },
    { slug: "strap-sensor", name: "Sensor / Button Repair", price: 1500, time: "1 day" },
    ...generic,
  ],
  gadget: [
    { slug: "battery-replacement", name: "Battery Replacement", price: 1200, time: "1 hour" },
    { slug: "charging-port-repair", name: "Charging Port Repair", price: 800, time: "1 hour" },
    ...generic,
  ],
  accessories: [
    { slug: "cable-adapter", name: "Charger / Adapter Check", price: 300, time: "30 min" },
    { slug: "earbuds-battery", name: "Earbuds Battery Repair", price: 1500, time: "1 day" },
    ...generic,
  ],
  sounds: [
    { slug: "speaker-repair", name: "Speaker Driver Repair", price: 1500, time: "1 day" },
    { slug: "bluetooth-repair", name: "Bluetooth / Board Repair", price: 1800, time: "1–2 days" },
    { slug: "battery-replacement", name: "Battery Replacement", price: 1200, time: "2 hours" },
    ...generic,
  ],
  "smart-tv": [
    { slug: "panel-repair", name: "Panel / Backlight Repair", price: 3500, time: "1–2 days" },
    { slug: "power-board", name: "Power Board Repair", price: 2500, time: "1 day" },
    { slug: "software-repair", name: "Software Update & Apps", price: 800, time: "1 hour" },
    ...generic,
  ],
  "home-appliance": [
    { slug: "motor-repair", name: "Motor / Compressor Check", price: 1500, time: "1 day" },
    { slug: "control-board", name: "Control Board Repair", price: 2000, time: "1–2 days" },
    ...generic,
  ],
  monitor: [
    { slug: "backlight-repair", name: "Backlight Repair", price: 2500, time: "1 day" },
    { slug: "power-board", name: "Power Board Repair", price: 2000, time: "1 day" },
    ...generic,
  ],
};

// Phones reuse the phone services; the category-level price is the lowest brand price
// ("from"). Brands with their own price table get exact prices via `phoneBrandFor`.
categoryRepairs.phones = services.map((s) => ({
  slug: s.slug,
  name: s.name,
  price: Math.min(...brands.map((b) => b.prices[s.slug] ?? Infinity)),
  time: s.time,
}));

export const getCategoryRepairs = (slug: string) => categoryRepairs[slug] ?? generic;

// API brand slugs that differ from our phone price-table slugs
const PHONE_BRAND_ALIASES: Record<string, string> = { apple: "iphone", google: "google-pixel" };

/** Our phone price table for an API brand slug (e.g. "apple" → iPhone prices), if we have one. */
export const phoneBrandFor = (apiSlug: string) => getBrand(PHONE_BRAND_ALIASES[apiSlug] ?? apiSlug);

// ---------------------------------------------------------------------------
// Cart references. The server always recomputes the price from these refs,
// so a tampered client price can never reach an order.

export type CartRef =
  | { kind: "phone"; brand: string; service: string; model?: string }
  | { kind: "category"; category: string; repair: string; model?: string };

// Model names may be typed by the user — keep them short and printable.
const safeModel = (m: unknown) =>
  typeof m === "string"
    ? m
        .replace(/\s+/g, " ")
        .replace(/[\u0000-\u001f<>]/g, "")
        .trim()
        .slice(0, 80)
    : "";

export function resolveCartRef(ref: CartRef): { title: string; price: number } | null {
  const model = safeModel(ref.model);
  if (ref.kind === "phone") {
    const brand = getBrand(ref.brand);
    const service = getService(ref.service);
    const price = brand?.prices[ref.service];
    if (!brand || !service || price === undefined) return null;
    return { title: `${model || brand.name} — ${service.name}`, price };
  }
  const repair = getCategoryRepairs(ref.category).find((r) => r.slug === ref.repair);
  if (!repair) return null;
  const category = ref.category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return { title: `${model || category} — ${repair.name}`, price: repair.price };
}

export const cartKey = (ref: CartRef) =>
  ref.kind === "phone"
    ? `phone:${ref.brand}:${ref.service}:${ref.model ?? ""}`
    : `category:${ref.category}:${ref.repair}:${ref.model ?? ""}`;

// ---------------------------------------------------------------------------
// "What's included" bullets on the repair detail pages. Edit freely.

export const serviceIncludes: Record<string, string[]> = {
  "screen-replacement": [
    "Careful removal of the damaged display",
    "Original or premium-grade replacement panel",
    "True Tone, brightness and touch calibration",
    "Face ID / sensors checked after fitting",
    "New adhesive seal against dust",
    "Every pixel and touch zone tested",
  ],
  "battery-replacement": [
    "Battery health and charging-circuit check",
    "High-capacity, genuine-grade battery",
    "Safe removal of the old or swollen cell",
    "Fresh adhesive and sealing",
    "Charge-cycle and temperature test",
    "Old battery recycled responsibly",
  ],
  "charging-port-repair": [
    "Port inspected under a microscope",
    "Ultrasonic cleaning where it's enough",
    "Port or flex replaced only when needed",
    "Fast-charge and data transfer tested",
    "Cable fit checked for a firm click",
  ],
  "camera-repair": [
    "Rear and front camera diagnosis",
    "Lens glass replaced on its own when possible",
    "Camera module replaced if faulty",
    "Focus, stabilisation and flash tested",
    "Photo and video quality check",
  ],
  "water-damage-repair": [
    "Immediate disassembly and battery disconnect",
    "Ultrasonic cleaning of the logic board",
    "Corroded components repaired or replaced",
    "Data recovery attempted wherever possible",
    "Full function test before return",
  ],
  "motherboard-repair": [
    "Power analysis to find the exact fault",
    "Micro-soldering by board-level technicians",
    "IC, connector and trace repairs",
    "Data kept intact where possible",
    "Stress test after the repair",
  ],
  "back-glass-replacement": [
    "Old back glass removed by laser — frame stays intact",
    "New back glass in the original colour",
    "Logo and back design look just like before",
    "No glue or adhesive marks visible",
    "Wireless charging and MagSafe tested",
    "Expert technician's final inspection",
  ],
  "speaker-mic-repair": [
    "Full audio path test",
    "Speaker and mic mesh cleaning",
    "Earpiece, loudspeaker or mic replaced if needed",
    "Call, video and media sound checked",
  ],
  "software-repair": [
    "Backup before any software work (when possible)",
    "Firmware repair or update",
    "Boot-loop and recovery-mode fixes",
    "Performance clean-up and setup help",
  ],
  "face-id-repair": [
    "TrueDepth / sensor diagnosis",
    "Flex or dot-projector repair",
    "Proximity and fingerprint sensors fixed",
    "Calibration and unlock test",
  ],
};

/** Bullets for device-category repairs (laptops, TVs, …) without their own list. */
export const genericIncludes = [
  "Free diagnosis before any work starts",
  "Exact price confirmed before repair",
  "Genuine-grade parts only",
  "Repaired by specialist technicians",
  "Full function test before return",
  "Warranty on parts and labour",
];
