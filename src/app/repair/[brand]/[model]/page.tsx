import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd, { businessId } from "@/components/JsonLd";
import ServiceCard from "@/components/ServiceCard";
import { Breadcrumbs, Container, CtaBand } from "@/components/ui";
import { services } from "@/lib/data";
import { formatTaka } from "@/lib/format";
import { allModels, getModel, modelHref } from "@/lib/models";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return allModels().map((m) => ({ brand: m.brand.slug, model: m.slug }));
}

export async function generateMetadata({ params }: PageProps<"/repair/[brand]/[model]">): Promise<Metadata> {
  const { brand, model } = await params;
  const m = getModel(brand, model);
  if (!m) return {};
  const screen = m.brand.prices["screen-replacement"];
  return {
    title: `${m.name} Repair Price in Dhaka`,
    description: `${m.name} repair in Dhaka: display${screen ? ` from ${formatTaka(screen)}` : ""}, battery, charging port, camera, back glass & more. Book online at ${site.name}.`,
    alternates: { canonical: `/repair/${brand}/${model}` },
    openGraph: { url: `/repair/${brand}/${model}` },
  };
}

export default async function ModelPage({ params }: PageProps<"/repair/[brand]/[model]">) {
  const { brand: brandSlug, model: slug } = await params;
  const m = getModel(brandSlug, slug);
  if (!m) notFound();
  const offered = services.filter((s) => m.brand.prices[s.slug] !== undefined);

  const ld = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${m.name} Repair`,
    provider: { "@id": businessId },
    areaServed: { "@type": "City", name: "Dhaka" },
    url: `${site.url}/repair/${brandSlug}/${slug}`,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `${m.name} repairs`,
      itemListElement: offered.map((s) => ({
        "@type": "Offer",
        priceCurrency: "BDT",
        price: m.brand.prices[s.slug],
        itemOffered: { "@type": "Service", name: `${m.name} ${s.name}` },
      })),
    },
  };

  return (
    <section className="bg-white py-10 sm:py-14">
      <Container>
        <Breadcrumbs
          items={[
            { name: `${m.brand.name} Repair`, path: `/repair/${brandSlug}` },
            { name: m.name, path: `/repair/${brandSlug}/${slug}` },
          ]}
        />
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-4xl">{m.name}</h1>
        <p className="mt-2 text-neutral-600">Choose a repair — prices are confirmed after a free diagnosis.</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr] lg:items-start">
          <nav aria-label={`${m.brand.name} models`} className="min-w-0 overflow-hidden rounded-3xl border border-black/[.07] bg-white p-3 lg:sticky lg:top-28">
            <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-[0.18em] text-gold-dark">{m.brand.name} models</p>
            <ul className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1 pb-1 lg:max-h-[70vh] lg:flex-col lg:gap-1 lg:overflow-y-auto lg:pb-0">
              {m.brand.models.map((name) => {
                const active = name === m.name;
                return (
                  <li key={name} className="shrink-0">
                    <Link
                      href={modelHref(brandSlug, name)}
                      aria-current={active ? "page" : undefined}
                      className={`block whitespace-nowrap rounded-2xl px-3 py-2 text-sm font-medium transition lg:px-4 lg:py-3 lg:text-base ${
                        active ? "bg-gold/20 font-semibold text-gold-dark" : "text-ink hover:bg-cream"
                      }`}
                    >
                      {name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <ul className="min-w-0 grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {offered.map((s) => (
              <li key={s.slug}>
                <ServiceCard brandSlug={brandSlug} model={m.name} service={s} price={m.brand.prices[s.slug]!} />
              </li>
            ))}
          </ul>
        </div>
      </Container>
      <div className="mt-10">
        <CtaBand />
      </div>
      <JsonLd data={ld} />
    </section>
  );
}
