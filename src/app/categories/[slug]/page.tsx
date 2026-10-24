import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import CategoryRepairPicker from "@/components/CategoryRepairPicker";
import JsonLd, { businessId } from "@/components/JsonLd";
import { CategoryGrid } from "@/components/sections";
import { Breadcrumbs, Container, CtaBand, Faq, SectionHeading } from "@/components/ui";
import { getCategories, getCategory, getCategoryBrands } from "@/lib/api";
import { brands as phoneBrands, getCategoryRepairs, phoneBrandFor } from "@/lib/data";
import { formatTaka } from "@/lib/format";
import { site } from "@/lib/site";

export async function generateStaticParams() {
  const slugs = (await getCategories()).map((c) => ({ slug: c.slug }));
  // Cache Components needs at least one param even if the API is unreachable at build time
  return slugs.length ? slugs : [{ slug: "laptop" }];
}

export async function generateMetadata({ params }: PageProps<"/categories/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return {};
  const repairs = getCategoryRepairs(slug).filter((r) => r.price > 0);
  const from = Math.min(...repairs.map((r) => r.price));
  return {
    title: `${category.name} Repair in Dhaka — Price List`,
    description: `${category.name} repair in Dhaka from ${formatTaka(from)}: ${repairs
      .slice(0, 4)
      .map((r) => r.name.toLowerCase())
      .join(", ")} and more. Free diagnosis & warranty at ${site.name}.`,
    alternates: { canonical: `/categories/${slug}` },
    openGraph: { url: `/categories/${slug}` },
  };
}

export default async function CategoryPage({ params }: PageProps<"/categories/[slug]">) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();
  const repairs = getCategoryRepairs(slug);
  const apiBrands = await getCategoryBrands(slug);

  // Phones: brands we have a price table for get exact prices and our curated model list first
  const brandPrices: Record<string, { slug: string; prices: Partial<Record<string, number>>; models: string[] }> = {};
  const brands =
    slug === "phones"
      ? apiBrands.map((b) => {
          const table = phoneBrandFor(b.slug);
          if (!table) return b;
          brandPrices[b.slug] = { slug: table.slug, prices: table.prices, models: table.models };
          const seen = new Set<string>();
          const models = [...table.models, ...b.models].filter((m) => {
            const k = m.toLowerCase().replace(/^apple\s+/, "");
            if (seen.has(k)) return false;
            seen.add(k);
            return true;
          });
          return { ...b, models: models.slice(0, 80) };
        })
      : apiBrands;
  if (slug === "phones") {
    // Brands with exact prices (iPhone, Samsung, …) first, in our price-table order
    const rank = (apiSlug: string) => {
      const table = phoneBrandFor(apiSlug);
      return table ? phoneBrands.findIndex((p) => p.slug === table.slug) : phoneBrands.length;
    };
    brands.sort((a, b) => rank(a.slug) - rank(b.slug));
  }
  const paid = repairs.filter((r) => r.price > 0);

  const faqs = [
    {
      q: `How much does ${category.name.toLowerCase()} repair cost?`,
      a: `${category.name} repairs at ${site.name} start from ${formatTaka(Math.min(...paid.map((r) => r.price)))}. Diagnosis is free and you approve the final price before we start.`,
    },
    {
      q: "Do you give a warranty?",
      a: "Yes — every repair includes a written warranty on parts and workmanship.",
    },
  ];

  const ld = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${category.name} Repair in Dhaka`,
    image: category.image,
    provider: { "@id": businessId },
    areaServed: { "@type": "City", name: "Dhaka" },
    url: `${site.url}/categories/${slug}`,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `${category.name} repairs`,
      itemListElement: paid.map((r) => ({
        "@type": "Offer",
        priceCurrency: "BDT",
        price: r.price,
        itemOffered: { "@type": "Service", name: `${category.name} ${r.name}` },
      })),
    },
  };

  return (
    <>
      <section id="repairs" className="scroll-mt-20 bg-gradient-to-b from-cream to-white pb-16 pt-8 sm:pb-20 sm:pt-10">
        <Container>
          <Breadcrumbs
            items={[
              { name: "Devices", path: "/categories" },
              { name: category.name, path: `/categories/${slug}` },
            ]}
          />
          <div className="mt-6 flex items-center gap-4 sm:gap-6">
            <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl border border-gold/30 bg-white shadow-lg shadow-gold/15 sm:h-20 sm:w-20">
              <Image src={category.image} alt={`${category.name} repair`} width={80} height={80} preload className="h-full w-full object-contain p-2" />
            </span>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-4xl">{category.name} repair in Dhaka</h1>
              <p className="mt-1.5 text-sm text-neutral-600 sm:text-base">
                Choose your brand and model, then pick a repair — the exact price is confirmed after a free diagnosis.
              </p>
            </div>
          </div>
          <ul className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-ink">
            {[
              paid.length ? `From ${formatTaka(Math.min(...paid.map((r) => r.price)))}` : null,
              "Free diagnosis",
              "Genuine-grade parts",
              "Written warranty",
            ]
              .filter(Boolean)
              .map((t) => (
                <li key={t} className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-white px-3 py-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
                  {t}
                </li>
              ))}
          </ul>
          <div className="mt-8">
            <CategoryRepairPicker
              categorySlug={slug}
              categoryName={category.name}
              categoryImage={category.image}
              brands={brands}
              repairs={repairs}
              brandPrices={slug === "phones" ? brandPrices : undefined}
            />
          </div>
          {slug !== "phones" && (
          <p className="mt-6 text-sm text-neutral-500">
            Need a phone repair instead? <Link href="/services" className="font-medium text-gold-dark underline underline-offset-4">See phone repair prices</Link>.
          </p>
          )}
        </Container>
      </section>

      <section className="bg-cream py-16 sm:py-20">
        <Container className="grid gap-12 lg:grid-cols-[1fr_1.5fr]">
          <SectionHeading eyebrow="FAQ" title={`${category.name} repair FAQ`} />
          <Faq items={faqs} />
        </Container>
      </section>

      <CategoryGrid limit={5} />
      <CtaBand />
      <JsonLd data={ld} />
    </>
  );
}
