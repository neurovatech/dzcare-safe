import type { Metadata } from "next";
import { Suspense } from "react";
import BookingFlow from "@/components/BookingFlow";
import { Breadcrumbs, Container } from "@/components/ui";
import { getSession } from "@/lib/auth/session";
import { findUserById } from "@/lib/auth/store";

export const metadata: Metadata = {
  title: "Booking Repair Request",
  robots: { index: false },
  alternates: { canonical: "/booking" },
};

/** Pre-fills the form from the signed-in account. */
async function BookingWithUser() {
  const session = await getSession();
  const user = session ? await findUserById(session.uid) : undefined;
  return <BookingFlow defaults={user ? { name: user.name, email: user.email, phone: user.phone } : undefined} />;
}

export default function BookingPage() {
  return (
    <section className="bg-white py-10 sm:py-14">
      <Container>
        <Breadcrumbs items={[{ name: "Booking Request", path: "/booking" }]} />
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-4xl">Booking Repair Request</h1>
        <p className="mt-2 text-neutral-600">
          We&apos;re excited to serve you — enter a few details below to finalize your booking quickly and easily.
        </p>
        <div className="mt-6">
          <Suspense fallback={<BookingFlow />}>
            <BookingWithUser />
          </Suspense>
        </div>
      </Container>
    </section>
  );
}
