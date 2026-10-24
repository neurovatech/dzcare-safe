import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd, { businessId } from "@/components/JsonLd";
import { EstimatorSection, Process, ServicesGrid, WhyUs } from "@/components/sections";
import { ButtonLink, Container, CtaBand, Faq, PageHero, SectionHeading } from "@/components/ui";
import { brands, getBrand, services } from "@/lib/data";
import { formatTaka } from "@/lib/format";
import { modelHref } from "@/lib/models";
import { site } from "@/lib/site";

/** Simple phone back with camera bump, in brand gold — used on the model cards. */
function PhoneGlyph() {
  return (
    <svg viewBox="0 0 48 80" className="h-20 w-12 transition duration-500 group-hover:-translate-y-1 group-hover:rotate-[-6deg]" aria-hidden="true">
      <rect x="2" y="2" width="44" height="76" rx="9" className="fill-cream stroke-gold" strokeWidth="2.5" />
      <rect x="7" y="7" width="17" height="19" rx="5" className="fill-ink" />
      <circle cx="12" cy="12.5" r="3" className="fill-gold" />
      <circle cx="12" cy="20.5" r="3" className="fill-gold" />
      <circle cx="19" cy="16.5" r="2.2" className="fill-gold-light" />
      <path d="M24 46c0-3 2-5 4-5-.3 1.8-1.6 3.2-4 5zm-2 1c3 0 3 1 5 1s2.5-1 4.5-1c1.2 0 2.2.7 2.8 1.5-2.6 1.4-2.2 5.2.6 6.2-.7 2-2.4 4.3-4 4.3-1.4 0-1.8-.9-3.6-.9s-2.3.9-3.6.9c-1.9 0-4.7-4.5-4.7-8 0-2.6 1.6-4 3-4z" className="fill-gold/50" />
    </svg>
  );
}

export function generateStaticParams() {
  return brands.map((b) => ({ brand: b.slug }));
}

export async function generateMetadata({ params }: PageProps<"/repair/[brand]">): Promise<Metadata> {
  const { brand: slug } = await params;
  const brand = getBrand(slug);
  if (!brand) return {};
  return {
    title: `${brand.name} Repair in Dhaka — Screen, Battery & More`,
    description: `Expert ${brand.name} repair in Dhaka: screen replacement from ${formatTaka(brand.prices["screen-replacement"] ?? 0)}, battery, charging port, camera, water damage & motherboard repair. Genuine-grade parts, warranty and same-day service.`,
    alternates: { canonical: `/repair/${brand.slug}` },
    openGraph: { url: `/repair/${brand.slug}` },
  };
}

export default async function BrandPage({ params }: PageProps<"/repair/[brand]">) {
  const { brand: slug } = await params;
  const brand = getBrand(slug);
  if (!brand) notFound();

  const brandFaqs = [
    {
      q: `How much does ${brand.name} screen replacement cost in Dhaka?`,
      a: `${brand.name} screen replacement at ${site.name} starts from ${formatTaka(brand.prices["screen-replacement"] ?? 0)}. The exact price depends on your model and whether you choose an original or premium-grade display.`,
    },
    {
      q: `Which ${brand.name} models do you repair?`,
      a: `We repair all popular ${brand.name} models including ${brand.models.slice(0, 6).join(", ")} and older models.`,
    },
    {
      q: `How long does a ${brand.name} repair take?`,
      a: "Most screen, battery and charging port repairs are completed within 30–90 minutes. Board-level repairs usually take 1–3 days.",
    },
  ];

  const ld = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${brand.name} Repair in Dhaka`,
    serviceType: "Mobile phone repair",
    brand: { "@type": "Brand", name: brand.name },
    provider: { "@id": businessId },
    areaServed: { "@type": "City", name: "Dhaka" },
    url: `${site.url}/repair/${brand.slug}`,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `${brand.name} repair services`,
      itemListElement: services
        .filter((s) => brand.prices[s.slug])
        .map((s) => ({
          "@type": "Offer",
          priceCurrency: "BDT",
          price: brand.prices[s.slug],
          itemOffered: { "@type": "Service", name: `${brand.name} ${s.name}` },
        })),
    },
  };

  return (
    <>
      <PageHero
        crumbs={[{ name: `${brand.name} Repair`, path: `/repair/${brand.slug}` }]}
        title={`${brand.name} repair in Dhaka`}
        text={`Cracked screen, weak battery or not charging? Our certified technicians repair every ${brand.name} model with genuine-grade parts, free diagnosis and up to 6 months warranty.`}
      >
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href={`/book?brand=${brand.slug}`}>Book {brand.name} Repair</ButtonLink>
          <ButtonLink href="#devices" variant="outline">Select your model</ButtonLink>
        </div>
      </PageHero>

      <section id="devices" className="scroll-mt-24 bg-white py-16 sm:py-20">
        <Container>
          <SectionHeading eyebrow="Get started" title="Select Device" text="Choose your model to see every repair and its price." />
          <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {brand.models.map((m, i) => (
              <li key={m} className="reveal" style={{ "--d": `${i * 25}ms` } as React.CSSProperties}>
                <Link
                  href={modelHref(brand.slug, m)}
                  className="group flex h-full flex-col items-center gap-4 rounded-3xl border border-black/[.07] bg-white px-3 py-6 text-center transition duration-500 hover:-translate-y-1 hover:border-gold hover:shadow-xl hover:shadow-gold/20"
                >
                  <PhoneGlyph />
                  <span className="text-sm font-semibold text-ink sm:text-base">{m}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <EstimatorSection initialBrand={brand.slug} />
      <ServicesGrid brandSlug={brand.slug} />

      <WhyUs />
      <Process />

      <section className="bg-white py-16 sm:py-20">
        <Container className="grid gap-12 lg:grid-cols-[1fr_1.5fr]">
          <SectionHeading eyebrow="FAQ" title={`${brand.name} repair FAQ`} />
          <Faq items={brandFaqs} />
        </Container>
      </section>

      <CtaBand />
      <JsonLd data={ld} />
    </>
  );
}
