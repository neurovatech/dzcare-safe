import { site, whatsappUrl } from "@/lib/site";
import TrackedLink from "./TrackedLink";
import { PhoneIcon, WhatsAppIcon } from "./Icons";

/** Sticky WhatsApp button (all screens) + bottom call/WhatsApp bar on mobile. */
export default function FloatingContact() {
  return (
    <>
      <TrackedLink
        method="whatsapp"
        trackLabel="floating"
        href={whatsappUrl()}
        target="_blank"
        rel="noopener"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-6 right-6 z-40 hidden h-14 w-14 place-items-center rounded-full bg-[#25d366] text-white shadow-lg shadow-black/20 transition hover:scale-110 hover:rotate-6 md:grid"
      >
        <WhatsAppIcon className="h-7 w-7" />
      </TrackedLink>

      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 border-t border-black/10 bg-white md:hidden">
        <TrackedLink
          method="call"
          trackLabel="mobile-bar"
          href={`tel:${site.phone}`}
          className="flex h-14 items-center justify-center gap-2 font-semibold text-ink"
        >
          <PhoneIcon /> Call Now
        </TrackedLink>
        <TrackedLink
          method="whatsapp"
          trackLabel="mobile-bar"
          href={whatsappUrl()}
          target="_blank"
          rel="noopener"
          className="flex h-14 items-center justify-center gap-2 bg-[#15803d] font-semibold text-white"
        >
          <WhatsAppIcon /> WhatsApp
        </TrackedLink>
      </div>
    </>
  );
}
