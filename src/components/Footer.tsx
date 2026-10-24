import Link from "next/link";
import { brands, services } from "@/lib/data";
import { site, whatsappUrl } from "@/lib/site";
import Logo from "./Logo";
import TrackedLink from "./TrackedLink";
import { ArrowIcon, ClockIcon, PhoneIcon, PinIcon, ShieldIcon, WhatsAppIcon } from "./Icons";
import { FacebookIcon, InstagramIcon, TikTokIcon, YouTubeIcon } from "./SocialIcons";

const socials = [
  { name: "Facebook", href: site.social.facebook, Icon: FacebookIcon },
  { name: "Instagram", href: site.social.instagram, Icon: InstagramIcon },
  { name: "YouTube", href: site.social.youtube, Icon: YouTubeIcon },
  { name: "TikTok", href: site.social.tiktok, Icon: TikTokIcon },
];

const payments = ["bKash", "Nagad", "Rocket", "VISA", "Cash"];

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="group inline-flex items-center gap-1.5 text-neutral-600 transition-colors hover:text-ink">
        <span className="h-px w-0 bg-gold transition-all duration-300 group-hover:w-3" aria-hidden="true" />
        {children}
      </Link>
    </li>
  );
}

function ColumnTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="relative pb-3 text-sm font-bold uppercase tracking-wider text-ink">
      {children}
      <span className="absolute bottom-0 left-0 h-[3px] w-8 rounded-full bg-gradient-to-r from-gold to-gold-light" aria-hidden="true" />
    </h2>
  );
}

export default function Footer() {
  const { address } = site;
  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-cream via-[#fbf3e9] to-sand pb-14 text-neutral-600 md:pb-0">
      {/* soft colour glows */}
      <div aria-hidden="true" className="glow pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full" />
      <div aria-hidden="true" className="glow pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full" />

      {/* CTA band */}
      <div className="relative mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 rounded-[2rem] bg-gradient-to-r from-gold via-[#e2bd94] to-gold-light p-7 shadow-xl shadow-gold/20 sm:p-9 lg:flex-row lg:items-center">
          <div>
            <p className="text-2xl font-bold text-ink sm:text-3xl">Need a repair today?</p>
            <p className="mt-1.5 text-ink/75">Free diagnosis · same-day repair · up to 6 months warranty</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <TrackedLink
              method="call"
              trackLabel="footer-cta"
              href={`tel:${site.phone}`}
              className="btn-shine inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ink px-6 font-semibold text-white transition hover:-translate-y-0.5"
            >
              <PhoneIcon /> {site.phoneDisplay}
            </TrackedLink>
            <TrackedLink
              method="whatsapp"
              trackLabel="footer-cta"
              href={whatsappUrl()}
              target="_blank"
              rel="noopener"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 font-semibold text-ink transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <WhatsAppIcon /> WhatsApp
            </TrackedLink>
          </div>
        </div>
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.3fr] lg:px-8">
        <div>
          <Logo />
          <p className="mt-4 text-sm leading-6">
            {site.tagline}. Genuine parts, expert technicians and up to 6 months warranty on every repair.
          </p>

          <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-ink">Follow us</p>
          <ul className="mt-3 flex gap-2.5">
            {socials.map(({ name, href, Icon }) => (
              <li key={name}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener"
                  aria-label={`${site.name} on ${name}`}
                  className="grid h-11 w-11 place-items-center rounded-2xl bg-ink text-gold shadow-lg shadow-black/15 transition duration-300 hover:-translate-y-1 hover:rotate-[-8deg] hover:bg-gold hover:text-ink"
                >
                  <Icon />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <ColumnTitle>Services</ColumnTitle>
          <ul className="mt-5 space-y-2.5 text-sm">
            {services.slice(0, 7).map((s) => (
              <FooterLink key={s.slug} href={`/services/${s.slug}`}>{s.name}</FooterLink>
            ))}
          </ul>
        </div>

        <div>
          <ColumnTitle>Brands</ColumnTitle>
          <ul className="mt-5 space-y-2.5 text-sm">
            {brands.map((b) => (
              <FooterLink key={b.slug} href={`/repair/${b.slug}`}>{b.name} Repair</FooterLink>
            ))}
          </ul>
        </div>

        <div>
          <ColumnTitle>Visit us</ColumnTitle>
          <ul className="mt-5 space-y-4 text-sm">
            <li className="flex gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gold/20 text-gold-dark">
                <PinIcon className="h-4 w-4" />
              </span>
              <TrackedLink method="map" href={site.mapUrl} target="_blank" rel="noopener" className="pt-1.5 hover:text-ink">
                {address.street}, {address.locality} {address.postalCode}
              </TrackedLink>
            </li>
            <li className="flex gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gold/20 text-gold-dark">
                <PhoneIcon className="h-4 w-4" />
              </span>
              <TrackedLink method="call" trackLabel="footer" href={`tel:${site.phone}`} className="pt-1.5 font-semibold text-ink hover:text-gold-dark">
                {site.phoneDisplay}
              </TrackedLink>
            </li>
            <li className="flex gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gold/20 text-gold-dark">
                <ClockIcon className="h-4 w-4" />
              </span>
              <span className="pt-1.5">
                {site.hours.map((h) => (
                  <span key={h.days} className="block">
                    {h.days}: <span className="font-medium text-ink">{h.open}–{h.close}</span>
                  </span>
                ))}
              </span>
            </li>
            <li className="flex gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gold/20 text-gold-dark">
                <ShieldIcon className="h-4 w-4" />
              </span>
              <span className="pt-1.5">Written warranty on every repair</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 border-t border-black/[.08] py-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-ink">We accept</span>
            {payments.map((p) => (
              <span key={p} className="rounded-lg border border-gold/50 bg-white px-2.5 py-1 text-xs font-bold text-ink">
                {p}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
            <p>© {site.legalName}. All rights reserved.</p>
            <Link href="/about" className="hover:text-ink">About</Link>
            <Link href="/privacy-policy" className="hover:text-ink">Privacy Policy</Link>
            <Link href="/contact" className="group inline-flex items-center gap-1 font-semibold text-gold-dark hover:text-ink">
              Contact <ArrowIcon className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
