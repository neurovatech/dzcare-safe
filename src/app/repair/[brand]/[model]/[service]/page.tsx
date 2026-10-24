import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RepairDetail from "@/components/repair-detail/RepairDetail";
import { brands, getService, serviceIncludes, services } from "@/lib/data";
import { formatTaka } from "@/lib/format";
import { getModel, repairHref } from "@/lib/models";
import { site } from "@/lib/site";

// Prerender the newest two models of every brand; the rest render on first visit and are then cached.
export function generateStaticParams() {
  return brands.flatMap((b) =>
    b.models.slice(0, 2).flatMap((m) =>
      services.filter((s) => b.prices[s.slug] !== undefined).map((s) => ({ brand: b.slug, model: getModelSlug(b.slug, m), service: s.slug })),
    ),
  );
}
const getModelSlug = (brand: string, name: string) => repairHref(brand, name, "x").split("/")[3];

function resolve(brandSlug: string, modelSlug: string, serviceSlug: string) {
  const model = getModel(brandSlug, modelSlug);
  const service = getService(serviceSlug);
  const price = model?.brand.prices[serviceSlug];
  return model && service && price !== undefined ? { model, service, price } : null;
}

export async function generateMetadata({ params }: PageProps<"/repair/[brand]/[model]/[service]">): Promise<Metadata> {
  const { brand, model, service } = await params;
  const r = resolve(brand, model, service);
  if (!r) return {};
  const title = `${r.model.name} ${r.service.name}`;
  return {
    title: `${title} Price in Dhaka`,
    description: `${title} in Dhaka from ${formatTaka(r.price)}. ${r.service.short} ${r.service.warranty} warranty, ${r.service.time}. Book at ${site.name}.`,
    alternates: { canonical: repairHref(brand, r.model.name, service) },
    openGraph: { url: repairHref(brand, r.model.name, service) },
  };
}

export default async function RepairPage({ params }: PageProps<"/repair/[brand]/[model]/[service]">) {
  const { brand, model, service } = await params;
  const r = resolve(brand, model, service);
  if (!r) notFound();
  const { model: m, service: s, price } = r;
  const path = repairHref(brand, m.name, s.slug);

  return (
    <RepairDetail
      crumbs={[
        { name: `${m.brand.name} Repair`, path: `/repair/${brand}` },
        { name: m.name, path: `/repair/${brand}/${model}` },
        { name: s.name, path },
      ]}
      title={`${m.name} ${s.name}`}
      device={m.name}
      price={price}
      icon={s.icon}
      includes={serviceIncludes[s.slug] ?? []}
      time={s.time}
      warranty={s.warranty}
      cart={{
        itemKey: `phone:${brand}:${s.slug}:${m.name}`,
        source: { kind: "phone", brand, service: s.slug, model: m.name },
        title: `${m.name} — ${s.name}`,
        subtitle: m.name,
        price,
      }}
      feedbackKey={`phone:${s.slug}`}
      description={{ intro: s.intro, symptoms: s.symptoms, process: s.process }}
      faqs={s.faqs}
      url={`${site.url}${path}`}
      related={services
        .filter((x) => x.slug !== s.slug && m.brand.prices[x.slug] !== undefined)
        .map((x) => ({ href: repairHref(brand, m.name, x.slug), label: x.name }))}
    />
  );
}
