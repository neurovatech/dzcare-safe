import type { Metadata } from "next";
import { Suspense } from "react";
import BookingForm from "@/components/BookingForm";
import TrackedLink from "@/components/TrackedLink";
import { CheckIcon, PhoneIcon, WhatsAppIcon } from "@/components/Icons";
import { Container, PageHero } from "@/components/ui";
import { brands, services } from "@/lib/data";
import { site, whatsappUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Book a Phone Repair Online",
  description: "Book your phone repair online in 30 seconds. Free diagnosis, pickup & delivery in Dhaka and same-day repair at DazzleCare.",
  alternates: { canonical: "/book" },
};

const formProps = { brands, services: services.map(({ slug, name }) => ({ slug, name })) };
const pick = (v: string | string[] | undefined) => (typeof v === "string" ? v.slice(0, 60) : undefined);

export default function BookPage({ searchParams }: PageProps<"/book">) {
  return (
    <>
      <PageHero
        crumbs={[{ name: "Book a Repair", path: "/book" }]}
        title="Book your repair in 30 seconds"
        text="Tell us what's wrong — we'll call you back with the exact price and the earliest slot. Walk-in or free pickup inside Dhaka."
      />
      <section className="bg-white py-12 sm:py-16">
        <Container className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          {/* The empty form ships in the static shell; the prefilled one streams in with the query params */}
          <Suspense fallback={<BookingForm {...formProps} />}>
            {searchParams.then((sp) => (
              <BookingForm
                {...formProps}
                defaults={{ brand: pick(sp.brand), model: pick(sp.model), service: pick(sp.service) }}
              />
            ))}
          </Suspense>
          <aside className="space-y-5">
            <div className="rounded-3xl border border-black/10 bg-white p-6">
              <h2 className="text-lg font-semibold text-ink">Prefer to talk?</h2>
              <div className="mt-4 space-y-3">
                <TrackedLink method="call" trackLabel="book-aside" href={`tel:${site.phone}`} className="flex h-12 items-center justify-center gap-2 rounded-full border border-gold/50 font-semibold text-gold-dark hover:bg-gold/10">
                  <PhoneIcon /> {site.phoneDisplay}
                </TrackedLink>
                <TrackedLink method="whatsapp" trackLabel="book-aside" href={whatsappUrl()} target="_blank" rel="noopener" className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#15803d] font-semibold text-ink">
                  <WhatsAppIcon /> WhatsApp us
                </TrackedLink>
              </div>
            </div>
            <ul className="space-y-3 rounded-3xl border border-black/10 bg-white p-6 text-sm text-neutral-700">
              {["Free diagnosis, no obligation", "Price confirmed before repair", "Up to 6 months warranty", "Your data stays private"].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <CheckIcon className="h-4 w-4 text-gold-dark" /> {t}
                </li>
              ))}
            </ul>
          </aside>
        </Container>
      </section>
    </>
  );
}
