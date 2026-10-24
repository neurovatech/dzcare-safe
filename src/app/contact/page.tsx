import type { Metadata } from "next";
import Link from "next/link";
import TrackedLink from "@/components/TrackedLink";
import { ClockIcon, PhoneIcon, PinIcon, WhatsAppIcon } from "@/components/Icons";
import { Container, PageHero } from "@/components/ui";
import { site, whatsappUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact & Location — Visit Our Service Center",
  description: `Visit ${site.name} at ${site.address.street}, ${site.address.locality}. Call ${site.phoneDisplay} or message us on WhatsApp for a free repair quote.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const cards = [
    {
      icon: <PhoneIcon className="h-6 w-6" />,
      title: "Call us",
      body: (
        <TrackedLink method="call" trackLabel="contact-page" href={`tel:${site.phone}`} className="text-gold-dark hover:underline">
          {site.phoneDisplay}
        </TrackedLink>
      ),
    },
    {
      icon: <WhatsAppIcon className="h-6 w-6" />,
      title: "WhatsApp",
      body: (
        <TrackedLink method="whatsapp" trackLabel="contact-page" href={whatsappUrl()} target="_blank" rel="noopener" className="text-gold-dark hover:underline">
          Chat for a free quote
        </TrackedLink>
      ),
    },
    {
      icon: <PinIcon className="h-6 w-6" />,
      title: "Visit",
      body: (
        <TrackedLink method="map" href={site.mapUrl} target="_blank" rel="noopener" className="hover:text-gold-dark">
          {site.address.street}, {site.address.locality} {site.address.postalCode}
        </TrackedLink>
      ),
    },
    {
      icon: <ClockIcon className="h-6 w-6" />,
      title: "Opening hours",
      body: site.hours.map((h) => (
        <span key={h.days} className="block">
          {h.days}: {h.open}–{h.close}
        </span>
      )),
    },
  ];

  return (
    <>
      <PageHero
        crumbs={[{ name: "Contact", path: "/contact" }]}
        title="Contact DazzleCare"
        text="Walk in, call, or WhatsApp us. Free diagnosis for every phone — most repairs done the same day."
      />
      <section className="bg-white py-12 sm:py-16">
        <Container>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((c) => (
              <li key={c.title} className="reveal card-lift group rounded-3xl border border-black/10 bg-white p-6">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gold/15 text-gold-dark transition duration-500 group-hover:scale-110 group-hover:bg-ink group-hover:text-gold">{c.icon}</span>
                <h2 className="mt-4 font-semibold text-ink">{c.title}</h2>
                <div className="mt-2 text-sm leading-6 text-neutral-600">{c.body}</div>
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-col items-start justify-between gap-6 rounded-3xl border border-gold/30 bg-gold/10 p-8 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-bold text-ink">Want us to call you?</h2>
              <p className="mt-2 text-neutral-600">Book online and we&apos;ll call back within 15 minutes.</p>
            </div>
            <Link href="/book" className="inline-flex h-12 items-center rounded-full bg-gold px-7 font-semibold text-ink hover:bg-gold-light">
              Book a Repair
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
