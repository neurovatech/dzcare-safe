import Link from "next/link";
import { nav, site } from "@/lib/site";
import CartButton from "./CartButton";
import SearchBox from "./SearchBox";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu";
import TrackedLink from "./TrackedLink";
import UserMenu from "./UserMenu";
import { NavIcon, PhoneIcon } from "./Icons";

export default function Header() {
  return (
    <header className="sticky top-0 z-100 border-b border-black/[.06] bg-white/95">
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 xl:h-[76px] lg:px-8">
        <Link href="/" aria-label={`${site.name} home`} className="shrink-0 transition-transform hover:scale-[1.03]">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden xl:block">
          <ul className="flex items-center gap-1 text-[15px] font-medium text-neutral-700">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group flex items-center gap-2 rounded-full px-3.5 py-2 transition-colors duration-300 hover:bg-cream hover:text-ink"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-gold/15 text-gold-dark transition duration-300 group-hover:rotate-[-10deg] group-hover:scale-110 group-hover:bg-ink group-hover:text-gold">
                    <NavIcon name={item.icon} className="h-4 w-4" />
                  </span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          {/* <TrackedLink
            method="call"
            trackLabel="header"
            href={`tel:${site.phone}`}
            className="mr-2 hidden items-center gap-2 text-sm font-semibold text-ink hover:text-gold-dark 2xl:flex"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gold/15 text-gold-dark">
              <PhoneIcon className="h-4 w-4" />
            </span>
            {site.phoneDisplay}
          </TrackedLink> */}
          <SearchBox />
          <CartButton />
          <UserMenu />
          <Link
            href="/book"
            className="btn-shine ml-1 hidden h-11 items-center whitespace-nowrap rounded-full bg-ink px-5 text-sm font-semibold text-white transition hover:bg-gold hover:text-ink sm:inline-flex xl:hidden 2xl:inline-flex"
          >
            Book Repair
          </Link>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
