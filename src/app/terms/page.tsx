import type { Metadata } from "next";
import { Container, PageHero } from "@/components/ui";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: `Repair booking terms at ${site.name}: diagnosis, pricing, warranty, pickup & delivery and data.`,
  alternates: { canonical: "/terms" },
};

// TODO: review these terms with your business before going live.
export default function TermsPage() {
  return (
    <>
      <PageHero crumbs={[{ name: "Terms & Conditions", path: "/terms" }]} title="Terms & Conditions" text={`The terms that apply when you book a repair with ${site.name}.`} />
      <section className="bg-white py-12 sm:py-16">
        <Container className="max-w-3xl space-y-6 leading-7 text-neutral-600 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-ink">
          <h2>Diagnosis & pricing</h2>
          <p>Prices shown on the website are starting prices. The final price is confirmed after a free diagnosis, and no repair starts without your approval.</p>
          <h2>Pickup & delivery (Erepair)</h2>
          <p>
            Pickup and delivery charges depend on your location (৳{site.deliveryCharge.min}–৳{site.deliveryCharge.max}) and are confirmed by our team before pickup.
          </p>
          <h2>Payment</h2>
          <p>You pay after the repair is complete and tested. We accept cash, bKash, Nagad and cards.</p>
          <h2>Warranty</h2>
          <p>Each repair carries the warranty stated for that service. Warranty does not cover new physical or liquid damage after the repair.</p>
          <h2>Your data</h2>
          <p>Please back up your device before handing it over. Our technicians never access personal files beyond what is needed to test the repair.</p>
          <h2>Cancellation</h2>
          <p>You can cancel a booking any time before the repair starts by calling {site.phoneDisplay}.</p>
        </Container>
      </section>
    </>
  );
}
