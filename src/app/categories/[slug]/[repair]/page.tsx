import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RepairDetail from "@/components/repair-detail/RepairDetail";
import { getCategories, getCategory } from "@/lib/api";
import { genericIncludes, getCategoryRepairs, getService, serviceIncludes } from "@/lib/data";
import { formatTaka } from "@/lib/format";
import { site } from "@/lib/site";

export async function generateStaticParams() {
  const cats = await getCategories();
  const params = cats.flatMap((c) => getCategoryRepairs(c.slug).map((r) => ({ slug: c.slug, repair: r.slug })));
  return params.length ? params : [{ slug: "laptop", repair: "screen-replacement" }];
}

async function resolve(slug: string, repairSlug: string) {
  const category = await getCategory(slug);
  const repair = getCategoryRepairs(slug).find((r) => r.slug === repairSlug);
  return category && repair ? { category, repair } : null;
}

export async function generateMetadata({ params }: PageProps<"/categories/[slug]/[repair]">): Promise<Metadata> {
  const { slug, repair } = await params;
  const r = await resolve(slug, repair);
  if (!r) return {};
  const title = `${r.category.name} ${r.repair.name}`;
  return {
    title: `${title} in Dhaka`,
    description: `${title} in Dhaka${r.repair.price ? ` from ${formatTaka(r.repair.price)}` : ""}. Free diagnosis, genuine-grade parts and warranty at ${site.name}.`,
    alternates: { canonical: `/categories/${slug}/${repair}` },
  };
}

export default async function CategoryRepairPage({ params }: PageProps<"/categories/[slug]/[repair]">) {
  const { slug, repair } = await params;
  const r = await resolve(slug, repair);
  if (!r) notFound();
  const { category, repair: rep } = r;
  // reuse the phone-service copy when the repair is the same kind (screen, battery, …)
  const svc = getService(rep.slug);
  const path = `/categories/${slug}/${rep.slug}`;

  return (
    <RepairDetail
      crumbs={[
        { name: "Devices", path: "/categories" },
        { name: category.name, path: `/categories/${slug}` },
        { name: rep.name, path },
      ]}
      title={`${category.name} ${rep.name}`}
      device={category.name}
      price={rep.price}
      icon={svc?.icon ?? "chip"}
      image={category.image}
      includes={serviceIncludes[rep.slug] ?? genericIncludes}
      time={rep.time}
      warranty={svc?.warranty}
      cart={{
        itemKey: `category:${slug}:${rep.slug}:`,
        source: { kind: "category", category: slug, repair: rep.slug },
        title: `${category.name} — ${rep.name}`,
        subtitle: category.name,
        price: rep.price,
        image: category.image,
      }}
      feedbackKey={`category:${slug}:${rep.slug}`}
      description={{
        intro:
          svc?.intro ??
          `Professional ${rep.name.toLowerCase()} for your ${category.name.toLowerCase()} by specialist technicians. We diagnose the fault for free, confirm the exact price before starting and test everything before you get it back.`,
        symptoms: svc?.symptoms,
        process: svc?.process,
      }}
      faqs={
        svc?.faqs ?? [
          { q: "How long does it take?", a: `Most ${category.name.toLowerCase()} repairs of this type take ${rep.time}.` },
          { q: "Is diagnosis free?", a: "Yes — we check the device for free and confirm the price before any work starts." },
        ]
      }
      url={`${site.url}${path}`}
      related={getCategoryRepairs(slug)
        .filter((x) => x.slug !== rep.slug)
        .map((x) => ({ href: `/categories/${slug}/${x.slug}`, label: x.name }))}
    />
  );
}
