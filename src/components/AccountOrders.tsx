"use client";

import Link from "next/link";

/**
 * Orders panel on the account page.
 *
 * Repair booking orders are stored server-side in the local JSON store and
 * tied to the old session system. This component acts as the client-side
 * placeholder — it shows the "Find a repair" CTA until orders are migrated
 * to the external API.
 */
export default function AccountOrders() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-ink">My repair orders</h2>
      <div className="mt-5 rounded-[2rem] border border-dashed border-black/15 bg-white p-10 text-center">
        <p className="text-neutral-600">No orders yet.</p>
        <Link
          href="/#prices"
          className="mt-4 inline-flex h-11 items-center rounded-full bg-ink px-6 text-sm font-semibold text-white hover:bg-gold hover:text-ink transition"
        >
          Find a repair
        </Link>
      </div>
    </div>
  );
}
