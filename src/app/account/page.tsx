import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { signOut } from "@/app/(auth)/actions";
import { Container, PageHero } from "@/components/ui";
import { getSession } from "@/lib/auth/session";
import { findUserById, ordersForUser } from "@/lib/auth/store";
import { formatTaka } from "@/lib/format";

export const metadata: Metadata = {
  title: "My Account",
  robots: { index: false },
};

async function AccountContent() {
  const session = await getSession();
  if (!session) redirect("/signin?next=/account");
  const [user, orders] = await Promise.all([findUserById(session.uid), ordersForUser(session.uid)]);
  if (!user) redirect("/signin?next=/account");

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_2fr] lg:items-start">
      <aside className="fade-up rounded-[2rem] border border-black/[.07] bg-white p-6">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-ink text-xl font-bold text-gold">
          {user.name.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
        </span>
        <h2 className="mt-4 text-xl font-bold text-ink">{user.name}</h2>
        <p className="text-sm text-neutral-600">{user.email}</p>
        {user.phone && <p className="text-sm text-neutral-600">{user.phone}</p>}
        <p className="mt-3 text-xs text-neutral-500">Member since {user.createdAt.slice(0, 10)}</p>
        <div className="mt-6 flex flex-col gap-2">
          <Link href="/forgot-password" className="inline-flex h-11 items-center justify-center rounded-full border border-black/15 text-sm font-semibold text-ink hover:border-gold">
            Change password
          </Link>
          <form action={signOut}>
            <button type="submit" className="h-11 w-full rounded-full bg-red-50 text-sm font-semibold text-red-700 transition hover:bg-red-100">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div>
        <h2 className="text-2xl font-bold text-ink">My repair orders</h2>
        {orders.length === 0 ? (
          <div className="mt-5 rounded-[2rem] border border-dashed border-black/15 bg-white p-10 text-center">
            <p className="text-neutral-600">No orders yet.</p>
            <Link href="/#prices" className="mt-4 inline-flex h-11 items-center rounded-full bg-ink px-6 text-sm font-semibold text-white hover:bg-gold hover:text-ink">
              Find a repair
            </Link>
          </div>
        ) : (
          <ul className="mt-5 space-y-4">
            {orders.map((o, i) => (
              <li key={o.id} className="fade-up card-lift rounded-3xl border border-black/[.07] bg-white p-5" style={{ "--d": `${i * 60}ms` } as React.CSSProperties}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-ink">{o.id}</p>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${o.type === "prebook" ? "bg-ink text-gold" : "bg-gold/20 text-gold-dark"}`}>
                    {o.type === "prebook" ? "Pre-booked" : "Received"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-neutral-500">
                  {o.slot ? `Slot: ${o.slot.date}, ${o.slot.time}` : o.createdAt.slice(0, 10)} · {o.visit === "pickup" ? "Pickup & delivery" : "Walk-in"}
                </p>
                <ul className="mt-3 space-y-1 text-sm text-neutral-700">
                  {o.items.map((it) => (
                    <li key={it.key} className="flex justify-between gap-4">
                      <span>{it.title}</span>
                      <span>{it.price ? formatTaka(it.price) : "Free"}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 flex justify-between border-t border-black/[.06] pt-3 font-bold text-ink">
                  <span>Estimated total</span>
                  <span>{formatTaka(o.total)}</span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <>
      <PageHero crumbs={[{ name: "My Account", path: "/account" }]} title="My account" text="Your profile and repair orders." />
      <section className="bg-cream py-12 sm:py-16">
        <Container>
          <Suspense fallback={<div className="h-64 animate-pulse rounded-[2rem] bg-white" />}>
            <AccountContent />
          </Suspense>
        </Container>
      </section>
    </>
  );
}
