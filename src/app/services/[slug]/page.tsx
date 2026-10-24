import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/AddToCartButton";
import JsonLd, { businessId } from "@/components/JsonLd";
import { CheckIcon, ClockIcon, ServiceIcon, ShieldIcon } from "@/components/Icons";
import { Process } from "@/components/sections";
import { ButtonLink, Container, CtaBand, Faq, PageHero, SectionHeading } from "@/components/ui";
import { brands, getService, services } from "@/lib/data";
import { formatTaka } from "@/lib/format";
import { repairHref } from "@/lib/models";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return {
    title: `${service.name} in Dhaka — Price & Same-Day Service`,
    description: `${service.short} Starting prices for iPhone, Samsung, Xiaomi & more. ${service.warranty} warranty, ${service.time} repair time. Book at ${site.name}.`,
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: { url: `/services/${service.slug}` },
  };
}

export default async function ServicePage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const prices = brands
    .map((b) => ({ brand: b, price: b.prices[service.slug] }))
    .filter((p): p is { brand: (typeof brands)[number]; price: number } => typeof p.price === "number");
  const lowest = Math.min(...prices.map((p) => p.price));

  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${service.name} in Dhaka`,
    serviceType: service.name,
    description: service.intro,
    provider: { "@id": businessId },
    areaServed: { "@type": "City", name: "Dhaka" },
    url: `${site.url}/services/${service.slug}`,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "BDT",
      lowPrice: lowest,
      highPrice: Math.max(...prices.map((p) => p.price)),
      offerCount: prices.length,
    },
  };

  return (
    <>
      <PageHero
        crumbs={[
          { name: "Services", path: "/services" },
          { name: service.name, path: `/services/${service.slug}` },
        ]}
        title={`${service.name} in Dhaka`}
        text={service.intro}
      >
        <ul className="mt-8 flex flex-wrap gap-3 text-sm">
          <li className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-neutral-700">
            <ClockIcon className="h-4 w-4 text-gold-dark" /> {service.time}
          </li>
          <li className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-neutral-700">
            <ShieldIcon className="h-4 w-4 text-gold-dark" /> {service.warranty} warranty
          </li>
          <li className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-2 text-gold-dark">
            From {formatTaka(lowest)}
          </li>
        </ul>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href={`/book?service=${service.slug}`}>Book {service.name}</ButtonLink>
          <ButtonLink href="/contact" variant="outline">Talk to a technician</ButtonLink>
        </div>
      </PageHero>

      <section className="bg-cream py-16 text-ink sm:py-20">
        <Container className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Symptoms" title={`Do you need ${service.name.toLowerCase()}?`} />
            <ul className="mt-8 space-y-3">
              {service.symptoms.map((s) => (
                <li key={s} className="reveal flex items-start gap-3 rounded-2xl border border-black/[.05] bg-white p-4 transition hover:translate-x-1 hover:border-gold/60">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink text-gold">
                    <CheckIcon className="h-4 w-4" />
                  </span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SectionHeading eyebrow="Our process" title="How we do it" />
            <ol className="mt-8 space-y-3">
              {service.process.map((p, i) => (
                <li key={p} className="reveal flex items-start gap-4 rounded-2xl border border-black/[.05] bg-white p-4 transition hover:translate-x-1 hover:border-gold/60">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gold text-sm font-bold text-ink">{i + 1}</span>
                  {p}
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <Container>
          <SectionHeading
            eyebrow="Price list"
            title={`${service.name} price in Bangladesh`}
            text="Starting prices by brand. The exact price depends on model and part quality — confirmed after free diagnosis."
          />
          <div className="reveal mt-10 overflow-hidden rounded-3xl border border-black/10 bg-white">
            <table className="w-full text-left text-sm sm:text-base">
              <caption className="sr-only">{service.name} starting prices by brand</caption>
              <thead className="bg-cream text-neutral-600">
                <tr>
                  <th scope="col" className="px-5 py-4 font-medium">Brand</th>
                  <th scope="col" className="px-5 py-4 font-medium">Starting price</th>
                  <th scope="col" className="hidden px-5 py-4 font-medium sm:table-cell">Repair time</th>
                  <th scope="col" className="px-5 py-4 text-right font-medium"><span className="sr-only">Pre-book or start repair</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[.07]">
                {prices.map(({ brand, price }) => (
                  <tr key={brand.slug} className="transition-colors hover:bg-cream">
                    <th scope="row" className="px-5 py-4 font-medium text-ink">
                      <Link href={`/repair/${brand.slug}`} className="hover:text-gold-dark">{brand.name} {service.name}</Link>
                    </th>
                    <td className="px-5 py-4 font-semibold text-gold-dark">{formatTaka(price)}</td>
                    <td className="hidden px-5 py-4 text-neutral-600 sm:table-cell">{service.time}</td>
                    <td className="px-3 py-3 text-right sm:px-5">
                      <span className="inline-flex flex-col gap-2 sm:flex-row">
                      <Link
                        href={repairHref(brand.slug, brand.models[0], service.slug)}
                        className="inline-flex h-9 items-center justify-center rounded-full border border-black/10 px-3.5 text-xs font-semibold text-ink transition hover:border-gold hover:text-gold-dark"
                      >
                        Read More
                      </Link>
                      <AddToCartButton
                        compact
                        itemKey={`phone:${brand.slug}:${service.slug}:`}
                        source={{ kind: "phone", brand: brand.slug, service: service.slug }}
                        title={`${brand.name} — ${service.name}`}
                        subtitle={brand.name}
                        price={price}
                      />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </section>

      <Process />

      <section className="bg-white py-16 sm:py-20">
        <Container className="grid gap-12 lg:grid-cols-[1fr_1.5fr]">
          <div>
            <SectionHeading eyebrow="FAQ" title={`${service.name} FAQ`} />
            <div className="mt-8 hidden lg:block">
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-gold/10 text-gold-dark">
                <ServiceIcon name={service.icon} className="h-8 w-8" />
              </span>
            </div>
          </div>
          <Faq items={service.faqs} />
        </Container>
      </section>

      <section className="border-t border-black/10 bg-white py-12">
        <Container>
          <h2 className="text-lg font-semibold text-ink">Other repair services</h2>
          <ul className="mt-5 flex flex-wrap gap-2">
            {services
              .filter((s) => s.slug !== service.slug)
              .map((s) => (
                <li key={s.slug}>
                  <Link href={`/services/${s.slug}`} className="inline-block rounded-full border border-black/10 px-4 py-2 text-sm text-neutral-700 hover:border-gold hover:text-gold-dark">
                    {s.name}
                  </Link>
                </li>
              ))}
          </ul>
        </Container>
      </section>

      <CtaBand />
      <JsonLd data={serviceLd} />
    </>
  );
}
