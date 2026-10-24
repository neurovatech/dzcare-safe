import Image from "next/image";
import Link from "next/link";
import { photos } from "@/lib/images";
import { site, whatsappUrl } from "@/lib/site";
import TrackedLink from "./TrackedLink";
import JsonLd, { breadcrumbLd, faqLd } from "./JsonLd";
import { ArrowIcon, WhatsAppIcon } from "./Icons";

export function Container({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold-dark">
      <span className="h-px w-6 bg-gold" aria-hidden="true" />
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  text,
  center = false,
}: {
  eyebrow: string;
  title: string;
  text?: string;
  center?: boolean;
}) {
  return (
    <div className={`reveal max-w-2xl ${center ? "mx-auto text-center" : ""}`}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">{title}</h2>
      {text && <p className="mt-4 text-base leading-7 text-neutral-600">{text}</p>}
    </div>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "dark",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "dark" | "gold" | "outline";
}) {
  const cls = {
    dark: "bg-ink text-white hover:bg-gold hover:text-ink",
    gold: "bg-gold text-ink hover:bg-ink hover:text-white",
    outline: "border border-black/15 bg-white text-ink hover:border-gold hover:text-gold-dark",
  }[variant];
  return (
    <Link
      href={href}
      className={`btn-shine group inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-semibold transition duration-300 hover:-translate-y-0.5 ${cls}`}
    >
      {children}
    </Link>
  );
}

export function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  const all = [{ name: "Home", path: "/" }, ...items];
  return (
    <>
      <nav aria-label="Breadcrumb" className="text-sm text-neutral-500">
        <ol className="flex flex-wrap items-center gap-1.5">
          {all.map((item, i) => (
            <li key={item.path} className="flex items-center gap-1.5">
              {i > 0 && <span aria-hidden="true">/</span>}
              {i === all.length - 1 ? (
                <span aria-current="page" className="text-ink">{item.name}</span>
              ) : (
                <Link href={item.path} className="link-underline hover:text-ink">{item.name}</Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd data={breadcrumbLd(all)} />
    </>
  );
}

export function PageHero({
  crumbs,
  title,
  text,
  children,
  aside,
}: {
  crumbs: { name: string; path: string }[];
  title: string;
  text: string;
  children?: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-black/[.06] bg-cream">
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full glow" />
      <Container className={`relative grid items-center gap-10 py-12 sm:py-16 ${aside ? "lg:grid-cols-[1.3fr_1fr]" : ""}`}>
        <div>
          <Breadcrumbs items={crumbs} />
          <h1 className="fade-up mt-5 max-w-3xl text-4xl font-bold tracking-tight text-ink sm:text-5xl">{title}</h1>
          <p className="fade-up mt-5 max-w-2xl text-lg leading-8 text-neutral-600" style={{ "--d": "120ms" } as React.CSSProperties}>
            {text}
          </p>
          {children}
        </div>
        {aside}
      </Container>
    </section>
  );
}

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <>
      <div className="space-y-3">
        {items.map((f, i) => (
          <details
            key={f.q}
            className="group relative overflow-hidden rounded-2xl border border-black/[.07] bg-white px-5 transition duration-300 hover:border-gold/60 open:border-gold/60 open:bg-cream open:shadow-lg open:shadow-gold/10 sm:px-6"
          >
            <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 scale-y-0 bg-gold transition-transform duration-300 group-open:scale-y-100" />
            <summary className="flex cursor-pointer items-center gap-4 py-5 text-left text-base font-semibold text-ink sm:text-lg">
              <span
                aria-hidden="true"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gold/15 text-sm font-bold text-gold-dark transition duration-300 group-open:bg-ink group-open:text-gold"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex-1">{f.q}</span>
              <span
                aria-hidden="true"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-gold/50 text-gold-dark transition duration-300 group-open:rotate-45 group-open:border-ink group-open:bg-ink group-open:text-gold"
              >
                +
              </span>
            </summary>
            <p className="fade-up pb-5 pl-[3.25rem] pr-12 leading-7 text-neutral-600">{f.a}</p>
          </details>
        ))}
      </div>
      <JsonLd data={faqLd(items)} />
    </>
  );
}

export function CtaBand() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <Container>
        <div className="reveal relative grid items-center gap-6 overflow-hidden rounded-[2rem] bg-ink px-6 py-12 text-center sm:px-12 sm:py-16 lg:grid-cols-[1.3fr_1fr] lg:text-left">
          <div aria-hidden="true" className=" absolute -left-16 -top-16 h-64 w-64 rounded-full glow" />
          <div aria-hidden="true" className=" absolute -bottom-20 -right-10 h-72 w-72 rounded-full glow" />
          <div className="relative">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Broken device? Let&apos;s make it <span className="text-shimmer">dazzle</span> again.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/75 lg:mx-0">
            Free diagnosis, transparent pricing and most repairs done the same day.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
            <Link
              href="/book"
              className="btn-shine group inline-flex h-12 items-center gap-2 rounded-full bg-gold px-7 font-semibold text-ink transition hover:-translate-y-0.5 hover:bg-white"
            >
              Book a Repair <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <TrackedLink
              method="whatsapp"
              trackLabel="cta-band"
              href={whatsappUrl()}
              target="_blank"
              rel="noopener"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-white/25 px-7 font-semibold text-white transition hover:-translate-y-0.5 hover:border-gold hover:text-gold"
            >
              <WhatsAppIcon /> WhatsApp {site.phoneDisplay}
            </TrackedLink>
          </div>
          </div>
          <div className="relative mx-auto w-full max-w-sm" aria-hidden="true">
            <Image
              src={photos.heroDevices}
              alt=""
              sizes="(min-width: 1024px) 384px, 80vw"
              className="animate-float h-auto w-full drop-shadow-[0_25px_40px_rgba(212,169,122,0.25)]"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
