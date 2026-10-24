import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import ServiceCard from "@/components/ServiceCard";
import { Breadcrumbs, Container } from "@/components/ui";
import { search } from "@/lib/search";
import { getSearchIndex } from "@/lib/search-index";

export const metadata: Metadata = {
  title: "Search repairs",
  robots: { index: false },
};

async function Results({ q }: { q: string }) {
  const index = await getSearchIndex();
  const { hits, total, categories } = search(index, q, 60);
  return (
    <>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        {q ? <>Results for “{q}”</> : "Search repairs"}
      </h1>
      <p className="mt-2 text-neutral-600">
        {q ? `${total} repair${total === 1 ? "" : "s"} found${total > hits.length ? ` — showing the top ${hits.length}` : ""}.` : "Use the search in the header to find your device or repair."}
      </p>
      {q && (
        <div className="mt-8 grid gap-6 lg:grid-cols-[220px_1fr] lg:items-start">
          <aside className="rounded-3xl border border-black/[.07] p-5">
            <p className="font-bold text-ink">Categories</p>
            <ul className="mt-3 space-y-1.5 text-sm">
              {categories.slice(0, 14).map((c) => (
                <li key={c.href}>
                  <Link href={c.href} className="text-neutral-700 hover:text-gold-dark">{c.name}</Link>
                </li>
              ))}
            </ul>
          </aside>
          {hits.length ? (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {hits.map((h) => (
                <li key={`${h.brand}-${h.model}-${h.service.slug}`}>
                  <ServiceCard brandSlug={h.brand} model={h.model} service={h.service} price={h.price} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-3xl bg-cream p-8 text-neutral-600">
              Nothing matched. Try a shorter word like “iPhone 14” or “battery”, or{" "}
              <Link href="/contact" className="font-semibold text-gold-dark underline">ask us</Link>.
            </p>
          )}
        </div>
      )}
    </>
  );
}

export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <section className="bg-white py-10 sm:py-14">
      <Container>
        <Breadcrumbs items={[{ name: "Search", path: "/search" }]} />
        <Suspense fallback={<p className="mt-6 text-neutral-500">Searching…</p>}>
          {searchParams.then((sp) => (
            <Results q={typeof sp.q === "string" ? sp.q.slice(0, 80) : ""} />
          ))}
        </Suspense>
      </Container>
    </section>
  );
}
