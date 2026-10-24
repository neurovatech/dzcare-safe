import { site } from "@/lib/site";

export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

const dayMap: Record<string, string[]> = {
  "Saturday – Thursday": ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
  Friday: ["Friday"],
};

export const businessId = `${site.url}/#business`;

export const localBusinessLd = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "ElectronicsStore"],
  "@id": businessId,
  name: site.name,
  legalName: site.legalName,
  description: site.description,
  url: site.url,
  logo: `${site.url}/logo.svg`,
  image: `${site.url}/opengraph-image`,
  telephone: site.phone,
  email: site.email,
  priceRange: "৳৳",
  currenciesAccepted: "BDT",
  paymentAccepted: "Cash, bKash, Nagad, Card",
  foundingDate: String(site.foundedYear),
  address: {
    "@type": "PostalAddress",
    streetAddress: site.address.street,
    addressLocality: site.address.locality,
    addressRegion: site.address.region,
    postalCode: site.address.postalCode,
    addressCountry: site.address.country,
  },
  geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng },
  hasMap: site.mapUrl,
  areaServed: { "@type": "City", name: "Dhaka" },
  openingHoursSpecification: site.hours.map((h) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: dayMap[h.days] ?? [h.days],
    opens: h.open,
    closes: h.close,
  })),
  sameAs: Object.values(site.social),
};

export const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${site.url}/#website`,
  url: site.url,
  name: site.name,
  publisher: { "@id": businessId },
  inLanguage: "en-BD",
};

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${site.url}${item.path}`,
    })),
  };
}

export function faqLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
