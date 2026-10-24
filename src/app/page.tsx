import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Hero from "@/components/Hero";
import {
  BrandMarquee,
  CategoryGrid,
  EstimatorSection,
  Process,
  ServicesGrid,
  StatsBand,
  Testimonials,
  WhyUs,
} from "@/components/sections";
import { ArrowIcon, FeatureIcon, PhoneIcon, WhatsAppIcon } from "@/components/Icons";
import TrackedLink from "@/components/TrackedLink";
import { Container, CtaBand, Eyebrow, Faq, SectionHeading } from "@/components/ui";
import { photos } from "@/lib/images";
import { site, whatsappUrl } from "@/lib/site";
import { brands, faqs, services } from "@/lib/data";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const highlights = [
  { icon: "bolt", value: "45 min", title: "Average repair time" },
  { icon: "shield", value: "6 months", title: "Repair warranty" },
  { icon: "chip", value: "20+", title: "Brands repaired" },
  { icon: "search", value: "Free", title: "Diagnosis, always" },
] as const;

const inlineLink = "font-medium text-gold-dark underline underline-offset-4 hover:text-ink";

export default function Home() {
  return (
    <>
      <Hero />
      <BrandMarquee />
      <CategoryGrid />
      <EstimatorSection />
      <ServicesGrid />
      <StatsBand />
      <WhyUs />
      <Process />
      <Testimonials />

      <section className="relative overflow-hidden bg-white py-16 sm:py-24">
        <Container className="grid gap-12 lg:grid-cols-[1fr_1.5fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading
              eyebrow="FAQ"
              title="Questions, answered"
              text="Everything you need to know before you book. Can't find your answer? Our technicians reply within minutes."
            />
            <div className="reveal relative mt-8 overflow-hidden rounded-[2rem] bg-ink p-6 text-white shadow-2xl shadow-black/20 sm:p-7">
              <div aria-hidden="true" className="glow pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full" />
              <div className="relative flex -space-x-3">
                {[photos.techMask, photos.techBench, photos.techGlasses].map((p, i) => (
                  <Image
                    key={i}
                    src={p}
                    alt=""
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full border-2 border-ink object-cover object-top"
                  />
                ))}
                <span className="grid h-12 w-12 place-items-center rounded-full border-2 border-ink bg-gold text-xs font-bold text-ink">
                  Team
                </span>
              </div>
              <p className="relative mt-5 text-xl font-bold">Still have questions?</p>
              <p className="relative mt-1 text-sm text-white/70">Talk to a real technician — free advice, no obligation.</p>
              <div className="relative mt-6 flex flex-col gap-2.5 sm:flex-row">
                <TrackedLink
                  method="whatsapp"
                  trackLabel="faq"
                  href={whatsappUrl("Hi DazzleCare, I have a question about a repair.")}
                  target="_blank"
                  rel="noopener"
                  className="btn-shine inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-gold px-5 text-sm font-semibold text-ink transition hover:bg-white"
                >
                  <WhatsAppIcon className="h-4 w-4" /> Ask on WhatsApp
                </TrackedLink>
                <TrackedLink
                  method="call"
                  trackLabel="faq"
                  href={`tel:${site.phone}`}
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-white/20 px-5 text-sm font-semibold transition hover:border-gold hover:text-gold"
                >
                  <PhoneIcon className="h-4 w-4" /> Call us
                </TrackedLink>
              </div>
            </div>
          </div>
          <Faq items={faqs} />
        </Container>
      </section>

      <section className="relative overflow-hidden bg-cream py-16 sm:py-24">
        <Container className="relative grid items-center gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
          <figure className="reveal group relative overflow-hidden rounded-[2rem] shadow-2xl shadow-black/15">
            <Image
              src={photos.techBench}
              alt="DazzleCare technician testing a repaired phone at the Dhaka service lab"
              placeholder="blur"
              sizes="(min-width: 1024px) 560px, 92vw"
              className="h-auto w-full transition duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink via-ink/85 to-transparent p-4 pt-20 sm:p-5 sm:pt-24">
              <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {highlights.map((h) => (
                  <li key={h.title} className="rounded-2xl border border-white/10 bg-white/10 p-3 text-white backdrop-blur-sm">
                    <FeatureIcon name={h.icon} className="h-5 w-5 text-gold" />
                    <p className="mt-2 text-lg font-bold leading-none text-gold">{h.value}</p>
                    <p className="mt-1 text-[11px] leading-tight text-white/75">{h.title}</p>
                  </li>
                ))}
              </ul>
            </div>
            <figcaption className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-ink">
              Inside our Dhaka service lab
            </figcaption>
          </figure>

          <div>
            <Eyebrow>Dhaka&apos;s repair experts</Eyebrow>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Trusted Mobile Phone Repair Service Center in Dhaka
            </h2>
            <div className="mt-5 space-y-4 border-l-2 border-gold pl-5 leading-7 text-neutral-600">
              <p>
                DazzleCare is a premium mobile phone repair center in Dhaka built for people who want their device fixed
                properly the first time. Modern smartphones use OLED displays, tightly packed logic boards and
                security-paired components — they need trained hands, the right tools and quality parts. That&apos;s
                exactly what our service lab is built around.
              </p>
              <p>
                Whether you need an <Link href="/repair/iphone" className={inlineLink}>iPhone repair in Dhaka</Link>, a{" "}
                <Link href="/repair/samsung" className={inlineLink}>Samsung service</Link>, or a quick{" "}
                <Link href="/services/screen-replacement" className={inlineLink}>screen replacement</Link> or{" "}
                <Link href="/services/battery-replacement" className={inlineLink}>battery replacement</Link>, our
                technicians diagnose your device for free and tell you the exact price before starting. We also repair{" "}
                <Link href="/categories" className={inlineLink}>laptops, tablets, smart watches and more</Link>.
              </p>
              <p>
                We repair {brands.map((b) => b.name).join(", ")} and more — covering {services.length} phone repair
                categories from charging port and camera repair to water damage recovery and chip-level motherboard
                repair. Every repair is backed by a written warranty.
              </p>
            </div>

            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Popular repairs</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {[
                ...brands.map((b) => ({ href: `/repair/${b.slug}`, label: `${b.name} repair` })),
                ...services.slice(0, 4).map((s) => ({ href: `/services/${s.slug}`, label: s.name })),
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="group inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-white px-3.5 py-1.5 text-sm font-medium text-ink transition duration-300 hover:-translate-y-0.5 hover:border-ink hover:bg-ink hover:text-gold"
                  >
                    {l.label}
                    <ArrowIcon className="h-3 w-3 -translate-x-0.5 opacity-50 transition group-hover:translate-x-0 group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <CtaBand />
    </>
  );
}
