import Image from "next/image";
import { getCategories } from "@/lib/api";
import { whatsappUrl } from "@/lib/site";
import TrackedLink from "./TrackedLink";
import { ButtonLink, Container } from "./ui";
import { ArrowIcon, CheckIcon, ShieldIcon, StarIcon, WhatsAppIcon } from "./Icons";

const headline = ["Premium", "Phone", "Repair", "in", "Dhaka"];
const rotating = ["iPhone", "Samsung", "Laptop", "Smart Watch", "Tablet"];

const v = (vars: Record<string, string | number>) => vars as React.CSSProperties;

// Positions for the floating device collage (slug → placement)
const collage: Record<string, string> = {
  phones: "left-[30%] top-[6%] w-[44%] z-20",
  laptop: "left-[-2%] bottom-[8%] w-[52%] z-10",
  "smart-watch": "right-[0%] top-[14%] w-[30%] z-10",
  tablet: "right-[4%] bottom-[2%] w-[38%] z-30",
};

export default async function Hero() {
  const categories = await getCategories();
  const pics = Object.keys(collage)
    .map((slug) => categories.find((c) => c.slug === slug))
    .filter((c): c is NonNullable<typeof c> => !!c);

  return (
    <section className="relative overflow-hidden bg-cream">
      <div aria-hidden="true" className=" pointer-events-none absolute -left-40 -top-24 h-[520px] w-[520px] rounded-full glow" />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-0 right-0 h-[380px] w-[380px] rounded-full glow-white" />

      <Container className="relative grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.1fr_1fr] lg:py-24">
        <div>
          <p className="fade-up inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white px-4 py-1.5 text-sm font-medium text-ink shadow-sm">
            <StarIcon className="h-3.5 w-3.5 text-gold" />
            Rated 4.9/5 by 2,000+ customers
          </p>

          <h1 className="mt-6 text-[2.6rem] font-bold leading-[1.08] tracking-tight text-ink sm:text-6xl lg:text-[4.1rem]">
            {headline.map((w, i) => (
              <span key={w} className="word mr-[0.25em]" style={v({ "--i": i })}>
                {w === "Repair" ? <span className="text-shimmer">{w}</span> : w}
              </span>
            ))}
          </h1>

          <p className="fade-up mt-5 flex flex-wrap items-baseline gap-x-2 text-2xl font-semibold text-neutral-700 sm:text-3xl" style={v({ "--d": "450ms" })}>
            We fix your
            <span className="rotator text-gold-dark" aria-hidden="true">
              <span>
                {[...rotating, rotating[0]].map((w, i) => (
                  <span key={`${w}-${i}`}>{w}</span>
                ))}
              </span>
            </span>
            <span className="sr-only">{rotating.join(", ")}</span>
          </p>

          <p className="mt-6 max-w-xl text-lg leading-8 text-neutral-600">
            Screen, battery, charging port, camera, water damage and motherboard repair with genuine-grade parts, free
            diagnosis and up to 6 months warranty.
          </p>

          <div className="fade-up mt-8 flex flex-col gap-3 sm:flex-row" style={v({ "--d": "600ms" })}>
            <ButtonLink href="#prices">
              See Repair Prices <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </ButtonLink>
            <TrackedLink
              method="whatsapp"
              trackLabel="hero"
              href={whatsappUrl()}
              target="_blank"
              rel="noopener"
              className="btn-shine inline-flex h-12 items-center justify-center gap-2 rounded-full border border-black/15 bg-white px-6 text-[15px] font-semibold text-ink transition duration-300 hover:-translate-y-0.5 hover:border-gold"
            >
              <WhatsAppIcon className="h-5 w-5 text-[#15803d]" /> Get Price on WhatsApp
            </TrackedLink>
          </div>

          <ul className="fade-up mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-neutral-700" style={v({ "--d": "750ms" })}>
            {["Free diagnosis", "Same-day repair", "No fix, no fee"].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-gold/25 text-gold-dark">
                  <CheckIcon className="h-3.5 w-3.5" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-[520px]" aria-hidden="true">
          <div className="absolute inset-[12%] rounded-full bg-gradient-to-br from-gold/50 via-gold-light/40 to-white" />
          <div className="absolute inset-[4%] rounded-full border border-dashed border-gold/50 motion-safe:animate-[spin_40s_linear_infinite]" />
          {pics.map((c, i) => (
            <div
              key={c.slug}
              className={`absolute aspect-square ${collage[c.slug]} ${i % 2 ? "animate-float-slow" : "animate-float"}`}
              style={v({ "--r": `${[-4, 3, 6, -3][i]}deg`, animationDelay: `${i * -1.5}s` })}
            >
              <Image
                src={c.image}
                alt=""
                width={260}
                height={260}
                preload={i === 0}
                className="h-full w-full object-contain drop-shadow-2xl"
              />
            </div>
          ))}
          <div className="fade-up absolute -left-2 top-[46%] z-40 flex items-center gap-3 rounded-2xl border border-black/5 bg-white/95 px-4 py-3 shadow-xl sm:-left-6" style={v({ "--d": "900ms" })}>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gold/20 text-gold-dark">
              <ShieldIcon />
            </span>
            <span>
              <span className="block text-sm font-semibold text-ink">6-Month Warranty</span>
              <span className="block text-xs text-neutral-500">Parts & labour</span>
            </span>
          </div>
          <div className="fade-up absolute -right-1 top-[2%] z-40 flex items-center gap-3 rounded-2xl border border-black/5 bg-white/95 px-4 py-3 shadow-xl" style={v({ "--d": "1100ms" })}>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-gold">
              <CheckIcon />
            </span>
            <span>
              <span className="block text-sm font-semibold text-ink">Fixed in 45 min</span>
              <span className="block text-xs text-neutral-500">Screen replacement</span>
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}
