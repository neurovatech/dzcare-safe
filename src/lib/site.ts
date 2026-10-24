// Central business details. Update these values before going live —
// they feed the header, footer, contact page, JSON-LD and metadata.
export const site = {
  name: "DazzleCare",
  legalName: "DazzleCare Phone Repair",
  tagline: "Premium Phone Repair in Dhaka",
  description:
    "DazzleCare is a premium phone repair center in Dhaka. Screen replacement, battery, charging port, camera, water damage and motherboard repair for iPhone, Samsung, Xiaomi, OPPO, vivo, realme & more — with genuine parts and warranty.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://dazzlecare.com.bd").replace(/\/$/, ""),
  locale: "en_BD",
  // TODO: replace with real contact details
  phone: "+8801700000000",
  phoneDisplay: "+880 1700-000000",
  whatsapp: "8801700000000",
  email: "support@dazzlecare.com.bd",
  address: {
    street: "Level 4, Shop 4/12, Bashundhara City",
    locality: "Dhaka",
    region: "Dhaka Division",
    postalCode: "1215",
    country: "BD",
  },
  geo: { lat: 23.7509, lng: 90.3906 },
  mapUrl: "https://maps.google.com/?q=Bashundhara+City+Dhaka",
  hours: [
    { days: "Saturday – Thursday", open: "10:00", close: "21:00" },
    { days: "Friday", open: "15:00", close: "21:00" },
  ],
  social: {
    facebook: "https://www.facebook.com/dazzlecare",
    instagram: "https://www.instagram.com/dazzlecare",
    youtube: "https://www.youtube.com/@dazzlecare",
    tiktok: "https://www.tiktok.com/@dazzlecare",
  },
  foundedYear: 2016,
  // Walk-in shops shown for "Direct Shop" bookings. TODO: replace with your real branches.
  shops: ["Bashundhara City, Level 4, Shop 4/12, Dhaka 1215"],
  // Pickup & delivery ("Erepair") charge range shown to customers, in taka
  deliveryCharge: { min: 80, max: 150 },
} as const;

export const nav = [
  { href: "/services", label: "Services", icon: "wrench" },
  { href: "/categories", label: "Devices", icon: "grid" },
  { href: "/repair/iphone", label: "iPhone", icon: "phone" },
  { href: "/repair/samsung", label: "Samsung", icon: "phone" },
  { href: "/contact", label: "Contact", icon: "chat" },
] as const;

export const whatsappUrl = (text = "Hi DazzleCare, I need a phone repair.") =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;
