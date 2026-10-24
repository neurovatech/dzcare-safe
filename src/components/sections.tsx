import Image from "next/image";
import Link from "next/link";
import { getCategories, getMarqueeBrands } from "@/lib/api";
import { brands, features, getCategoryRepairs, services, stats, steps, testimonials } from "@/lib/data";
import { formatTaka } from "@/lib/format";
import PriceEstimator from "./PriceEstimator";
import { Container, SectionHeading } from "./ui";
import { ArrowIcon, FeatureIcon, ServiceIcon, StarIcon } from "./Icons";
import { photos } from "@/lib/images";
import { tint } from "@/lib/tints";

const lite = {
  brands,
  services: services.map(({ slug, name, icon, time }) => ({ slug, name, icon, time })),
};

const featured = [
  {
    href: "/services/screen-replacement",
    tag: "Most popular",
    title: "Cracked screen? Fixed in 45 minutes",
    price: `Screen from ${formatTaka(Math.min(...brands.map((b) => b.prices["screen-replacement"] ?? Infinity)))}`,
    image: photos.crackedScreens,
    imageClass: "w-[58%]",
    alt: "Cracked phone screens before repair",
  },
  {
    href: "/services/motherboard-repair",
    tag: "Board-level lab",
    title: "Dead phone? Chip-level repair",
    price: `From ${formatTaka(Math.min(...brands.map((b) => b.prices["motherboard-repair"] ?? Infinity)))}`,
    image: photos.phoneInternals,
    imageClass: "w-[34%]",
    alt: "Phone internals: frame, logic board and display",
  },
  {
    href: "/categories/laptop",
    tag: "Laptop care",
    title: "Laptop display, keyboard & more",
    price: `Display from ${formatTaka(getCategoryRepairs("laptop").find((r) => r.slug === "screen-replacement")?.price ?? 0)}`,
    image: photos.laptopParts,
    imageClass: "w-[58%]",
    alt: "Laptop parts: display, keyboard and motherboard",
  },
];

const delay = (i: number, step = 60) => ({ "--d": `${i * step}ms` }) as React.CSSProperties;

export function EstimatorSection({ initialBrand }: { initialBrand?: string }) {
  return (
    <section id="prices" className="relative scroll-mt-20 overflow-hidden bg-cream py-16 sm:py-24">
      <Container>
        <div className="grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <SectionHeading
              eyebrow="Repair price"
              title="Select your device, see the price, start your repair"
              text="Transparent starting prices for every popular model. Tap Start Repair, review your booked services and confirm in seconds — the final price is confirmed after a free diagnosis."
            />
            <ul className="reveal mt-6 flex flex-wrap gap-2 text-sm font-medium text-ink">
              {["Genuine-grade parts", "Free diagnosis", "Pay after repair"].map((t) => (
                <li key={t} className="rounded-full border border-gold/50 bg-white px-3.5 py-1.5">
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="reveal relative mx-auto hidden w-full max-w-sm sm:block" aria-hidden="true">
            <div className="absolute -inset-3 rotate-3 rounded-[2.2rem] bg-gold/30" />
            <div className="relative overflow-hidden rounded-[2rem] border border-gold/30 bg-white p-6 shadow-2xl shadow-gold/20">
              <Image src={photos.explodedPhone} alt="" sizes="384px" className="mx-auto h-auto w-[82%] transition duration-700 hover:scale-105" />
              <span className="absolute left-4 top-4 rounded-full bg-ink px-3 py-1 text-xs font-semibold text-gold">Every part, tested</span>
            </div>
          </div>
        </div>
        <div className="reveal mt-10">
          {/* <PriceEstimator brands={lite.brands} services={lite.services} initialBrand={initialBrand} /> */}
        </div>
      </Container>
    </section>
  );
}

/** Device categories from the API, with their images. */
export async function CategoryGrid({ limit }: { limit?: number }) {
  const categories = (await getCategories()).slice(0, limit);
  if (!categories.length) return null;

  return (
    <section className="bg-white py-16 sm:py-24">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="What we repair"
            title="Choose your device"
            text="Phones, tablets, laptops, smart watches, TVs and more — fixed by specialists for each category."
          />
          {limit && (
            <Link href="/categories" className="link-underline inline-flex items-center gap-2 pb-1 font-semibold text-ink">
              All devices <ArrowIcon />
            </Link>
          )}
        </div>
        <ul className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((c, i) => (
            <li key={c.uuid} className="reveal">
              <Link
                href={`/categories/${c.slug}`}
                className="spotlight card-lift group flex h-full flex-col items-center overflow-hidden rounded-3xl border border-black/[.06] bg-cream p-4 text-center sm:p-5"
                style={delay(i, 40)}
              >
                <span className="relative block aspect-square w-full">
                  <Image
                    src={c.image}
                    alt={`${c.name} repair`}
                    width={220}
                    height={220}
                    className="h-full w-full object-contain drop-shadow-xl transition duration-700 ease-out group-hover:-translate-y-2 group-hover:rotate-[-4deg] group-hover:scale-110"
                  />
                </span>
                <span className="mt-3 text-base font-semibold text-ink">{c.name}</span>
                <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-neutral-500 transition-colors group-hover:text-gold-dark">
                  View repairs
                  <ArrowIcon className="h-3 w-3 -translate-x-1 opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

export function ServicesGrid({ brandSlug }: { brandSlug?: string }) {
  const brand = brandSlug ? brands.find((b) => b.slug === brandSlug) : undefined;
  return (
    <section className="bg-white py-16 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Our services"
          title={brand ? `${brand.name} repair services` : "Every repair your phone needs"}
          text="From a cracked screen to chip-level motherboard work — handled by certified technicians in our advanced service lab."
        />
        {!brand && (
          <ul className="mt-12 grid gap-5 md:grid-cols-3">
            {featured.map((f, i) => (
              <li key={f.href} className="reveal">
                <Link
                  href={f.href}
                  className={`group relative flex h-full min-h-[24rem] flex-col overflow-hidden rounded-[2rem] p-7 transition duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-gold/25 ${
                    i === 1 ? "bg-ink text-white" : "bg-cream text-ink"
                  }`}
                >
                  <span aria-hidden="true" className={`absolute -bottom-16 -right-16 h-72 w-72 rounded-full ${i === 1 ? "glow" : "bg-gold/25"}`} />
                  <span className={`relative text-xs font-semibold uppercase tracking-[0.18em] ${i === 1 ? "text-gold" : "text-gold-dark"}`}>
                    {f.tag}
                  </span>
                  <h3 className="relative z-10 mt-2 max-w-[12rem] text-2xl font-bold leading-tight">{f.title}</h3>
                  <span className={`relative mt-3 text-sm font-semibold ${i === 1 ? "text-gold" : "text-gold-dark"}`}>{f.price}</span>
                  <span className="relative z-10 mt-auto inline-flex w-fit items-center gap-2 rounded-full bg-gold px-4 py-2 text-sm font-semibold text-ink transition group-hover:gap-3">
                    Learn more <ArrowIcon />
                  </span>
                  <Image
                    src={f.image}
                    alt={f.alt}
                    sizes="(min-width: 768px) 240px, 60vw"
                    className={`pointer-events-none absolute -right-2 bottom-4 h-auto max-w-[15rem] drop-shadow-2xl ${f.imageClass} transition duration-700 ease-out group-hover:-translate-y-2 group-hover:rotate-[-4deg] group-hover:scale-105`}
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
        <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => {
            const price = (brand ?? brands[0]).prices[s.slug];
            return (
              <li key={s.slug} className="reveal">
                <Link
                  href={`/services/${s.slug}`}
                  className="spotlight card-lift group flex h-full flex-col rounded-3xl border border-black/[.07] bg-white p-6"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-cream text-gold-dark transition duration-500 group-hover:rotate-[-8deg] group-hover:scale-110 group-hover:bg-ink group-hover:text-gold">
                    <ServiceIcon name={s.icon} />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-ink">{brand ? `${brand.name} ${s.name}` : s.name}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-neutral-600">{s.short}</p>
                  <span className="mt-5 flex items-center justify-between border-t border-black/[.06] pt-4 text-sm">
                    <span className="text-neutral-500">
                      {price !== undefined ? <>From <b className="text-ink">{formatTaka(price)}</b></> : s.time}
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-gold-dark transition-all group-hover:gap-2">
                      Details <ArrowIcon />
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}

// API brand slug → our repair page (others go to the device list)
const brandPage: Record<string, string> = {
  apple: "/repair/iphone",
  google: "/repair/google-pixel",
  ...Object.fromEntries(brands.map((b) => [b.slug, `/repair/${b.slug}`])),
};

// Two alternating gold-tinted card backgrounds
const tints = [
  "from-cream to-white hover:border-gold hover:shadow-gold/25",
  "from-white to-cream hover:border-gold hover:shadow-gold/25",
];

/** Infinite, colourful brand-logo marquee (logos from the API). */
export async function BrandMarquee() {
  const list = await getMarqueeBrands();
  if (!list.length) return null;
  // Two identical halves → the -50% translate loops seamlessly; each half is wider than any screen.
  const row = [...list, ...list];

  return (
    <section aria-label="Brands we repair" className="relative overflow-hidden border-y border-black/[.06] bg-white py-6">
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent sm:w-32" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent sm:w-32" />
      <ul className="marquee flex w-max items-center gap-4 pr-4">
        {row.map((b, i) => {
          const hidden = i >= list.length;
          return (
            <li key={`${b.uuid}-${i}`} aria-hidden={hidden || undefined}>
              <Link
                href={brandPage[b.slug] ?? "/categories"}
                tabIndex={hidden ? -1 : undefined}
                title={`${b.name} repair`}
                className={`group flex h-20 w-40 items-center justify-center rounded-2xl border border-black/[.05] bg-gradient-to-br p-4 transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:w-44 ${tints[i % tints.length]}`}
              >
                <span className="relative h-full w-full">
                  <Image
                    src={b.logo}
                    alt={hidden ? "" : `${b.name} logo`}
                    width={144}
                    height={48}
                    loading="eager"
                    fetchPriority="low"
                    className="h-full w-full object-contain mix-blend-multiply transition duration-300 group-hover:scale-110"
                  />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

const statIcons = ["chip", "bolt", "shield", "search"] as const;

export function StatsBand() {
  return (
    <section className="bg-white py-14 sm:py-20">
      <Container>
        <div className="reveal relative overflow-hidden rounded-[2rem] bg-ink shadow-2xl shadow-black/20">
          <Image
            src={photos.techGlasses}
            alt=""
            fill
            sizes="(min-width: 1280px) 1216px, 100vw"
            className="object-cover object-[center_30%] opacity-40"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/60" />
          <div aria-hidden="true" className="glow pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full" />

          <div className="relative grid gap-8 p-7 sm:p-10 lg:grid-cols-[1fr_2.4fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Our track record</p>
              <p className="mt-2 text-2xl font-bold leading-tight text-white sm:text-3xl">Numbers that earn trust</p>
            </div>
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-white/10 lg:grid-cols-4">
              {stats.map((s, i) => (
                <div
                  key={s.label}
                  className="group flex flex-col bg-ink/80 p-5 backdrop-blur-sm transition duration-500 hover:bg-ink sm:p-6"
                  style={delay(i)}
                >
                  <dd aria-hidden="true" className="grid h-10 w-10 place-items-center rounded-xl bg-gold/15 text-gold transition duration-500 group-hover:rotate-[-8deg] group-hover:scale-110 group-hover:bg-gold group-hover:text-ink">
                    {i === 2 ? <StarIcon className="h-5 w-5" /> : <FeatureIcon name={statIcons[i] ?? "chip"} className="h-5 w-5" />}
                  </dd>
                  <dd className="order-2 mt-4 text-3xl font-bold tracking-tight text-gold sm:text-4xl">{s.value}</dd>
                  <dt className="order-3 mt-1 text-sm text-white/70">{s.label}</dt>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Container>
    </section>
  );
}

const featureTints = [0, 3, 2, 6, 7, 4]; // rose, amber, emerald, orange, indigo, violet

export function WhyUs() {
  return (
    <section className="relative overflow-hidden bg-cream py-16 sm:py-24">
      <div aria-hidden="true" className="glow pointer-events-none absolute -left-40 top-10 h-[460px] w-[460px] rounded-full" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-32 bottom-0 h-[420px] w-[420px] rounded-full bg-[radial-gradient(closest-side,rgb(212_169_122/0.18),transparent)]" />
      <Container className="relative grid gap-12 lg:grid-cols-[1fr_1.45fr] lg:items-start">
        <div className="lg:sticky lg:top-28">
          <SectionHeading
            eyebrow="Why DazzleCare"
            title="Repairs you can trust, service that shines"
            text="Certified technicians, quality parts and an advanced lab — with honest, upfront pricing. That's why customers across Dhaka trust us with their devices."
          />
          <figure className="reveal group relative mt-8 overflow-hidden rounded-[2rem] shadow-2xl shadow-black/20">
            <Image
              src={photos.techMask}
              alt="DazzleCare technician repairing a phone logic board at the service bench"
              placeholder="blur"
              sizes="(min-width: 1024px) 460px, 92vw"
              className="h-auto w-full transition duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink via-ink/80 to-transparent p-5 pt-16">
              <div className="grid grid-cols-2 gap-3">
                {stats.slice(0, 2).map((s) => (
                  <div key={s.label} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
                    <p className="text-2xl font-bold text-gold">{s.value}</p>
                    <p className="text-xs text-white/75">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <figcaption className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-ink">
              Certified technicians
            </figcaption>
          </figure>
          <Link href="/about" className="group mt-8 inline-flex items-center gap-2 font-semibold text-ink">
            <span className="link-underline">More about us</span>
            <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <ul className="grid gap-5 sm:grid-cols-2">
          {features.map((f, i) => {
            const t = tint(featureTints[i] ?? i);
            return (
              <li
                key={f.title}
                className={`reveal group relative overflow-hidden rounded-3xl border border-black/[.06] bg-gradient-to-br ${t.soft} to-white p-6 transition duration-500 hover:-translate-y-1.5 hover:shadow-xl ${t.ring} ${t.shadow}`}
              >
                <span aria-hidden="true" className="absolute -right-3 -top-5 text-8xl font-black text-black/[.04] transition duration-500 group-hover:scale-110">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className={`relative grid h-12 w-12 place-items-center rounded-2xl shadow-sm transition duration-500 group-hover:rotate-[-8deg] group-hover:scale-110 ${t.tile}`}>
                  <FeatureIcon name={f.icon} />
                </span>
                <h3 className="relative mt-5 text-lg font-semibold text-ink">{f.title}</h3>
                <p className="relative mt-2 text-sm leading-6 text-neutral-600">{f.text}</p>
                <span aria-hidden="true" className={`absolute bottom-0 left-0 h-1 w-0 transition-all duration-500 group-hover:w-full ${t.solid}`} />
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}

export function Process() {
  return (
    <section className="bg-white py-16 sm:py-24">
      <Container className="grid items-center gap-12 lg:grid-cols-2">
        <figure className="reveal group relative order-2 lg:order-1">
          <div aria-hidden="true" className="absolute -left-4 -top-4 h-full w-full rounded-[2rem] border-2 border-gold/60" />
          <div className="relative overflow-hidden rounded-[2rem] shadow-2xl shadow-black/15">
            <Image
              src={photos.techGlasses}
              alt="DazzleCare technician carefully opening a smartphone on an anti-static mat"
              placeholder="blur"
              sizes="(min-width: 1024px) 560px, 92vw"
              className="h-auto w-full transition duration-700 ease-out group-hover:scale-105"
            />
          </div>
          <figcaption className="absolute -bottom-5 right-6 flex items-center gap-3 rounded-2xl bg-ink px-5 py-3 text-white shadow-xl">
            <span className="text-2xl font-bold text-gold">45 min</span>
            <span className="text-xs leading-tight text-white/75">
              average
              <br />
              repair time
            </span>
          </figcaption>
        </figure>

        <div className="order-1 lg:order-2">
          <SectionHeading eyebrow="How it works" title="Fixed in 4 simple steps" />
          <ol className="relative mt-10 space-y-4">
            <span aria-hidden="true" className="absolute bottom-6 left-6 top-6 w-px bg-gradient-to-b from-gold via-gold/50 to-transparent" />
            {steps.map((s, i) => (
              <li
                key={s.title}
                className="reveal group relative flex gap-5 rounded-3xl border border-transparent p-3 pr-5 transition duration-500 hover:border-gold/50 hover:bg-cream"
              >
                <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-full bg-ink text-lg font-bold text-gold transition duration-500 group-hover:scale-110 group-hover:bg-gold group-hover:text-ink">
                  {i + 1}
                </span>
                <span className="pt-1">
                  <h3 className="text-lg font-semibold text-ink">{s.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-neutral-600">{s.text}</p>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}

const avatarGradients = [
  "from-gold to-gold-dark",
  "from-ink to-ink-2",
];

export function Testimonials() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-cream to-white py-16 sm:py-24">
      <div aria-hidden="true" className="glow pointer-events-none absolute left-1/2 top-0 h-[420px] w-[620px] -translate-x-1/2 rounded-full" />
      <Container className="relative">
        <div className="flex flex-col items-center gap-6 text-center">
          <SectionHeading center eyebrow="Reviews" title="What our customers say" />
          <div className="reveal inline-flex items-center gap-4 rounded-2xl border border-black/[.06] bg-white px-5 py-3 shadow-lg shadow-gold/10">
            <span className="text-3xl font-bold text-ink">4.9</span>
            <span className="text-left">
              <span className="flex gap-0.5 text-gold" role="img" aria-label="Rated 4.9 out of 5">
                {Array.from({ length: 5 }, (_, i) => (
                  <StarIcon key={i} />
                ))}
              </span>
              <span className="block text-xs text-neutral-500">from 2,000+ happy customers</span>
            </span>
          </div>
        </div>
        <ul className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t, i) => (
            <li
              key={t.name}
              className="reveal group relative flex flex-col overflow-hidden rounded-3xl border border-black/[.05] bg-white p-6 shadow-sm transition duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-gold/15"
            >
              <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${avatarGradients[i % avatarGradients.length]}`} />
              <span aria-hidden="true" className="absolute right-4 top-2 font-serif text-7xl leading-none text-gold/25 transition duration-500 group-hover:text-gold/50">
                &rdquo;
              </span>
              <div className="flex gap-0.5 text-gold" role="img" aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }, (_, k) => (
                  <StarIcon key={k} />
                ))}
              </div>
              <span className="mt-4 w-fit rounded-full bg-cream px-2.5 py-1 text-[11px] font-semibold text-gold-dark">{t.service}</span>
              <blockquote className="mt-3 flex-1 text-sm leading-6 text-neutral-700">“{t.text}”</blockquote>
              <div className="mt-5 flex items-center gap-3 border-t border-black/[.06] pt-4">
                <span className={`grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br text-sm font-bold text-white shadow-md transition duration-500 group-hover:scale-110 ${avatarGradients[i % avatarGradients.length]}`}>
                  {t.name.split(" ").map((p) => p[0]).join("")}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-ink">{t.name}</span>
                  <span className="block text-xs text-neutral-500">{t.area}</span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
