import type { Metadata } from "next";
import { Process, StatsBand, Testimonials, WhyUs } from "@/components/sections";
import { Container, CtaBand, PageHero } from "@/components/ui";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Us — Certified Phone Repair Experts",
  description: `Learn about ${site.name}: certified technicians, an advanced repair lab and honest pricing. Trusted phone repair in Dhaka since ${site.foundedYear}.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        crumbs={[{ name: "About", path: "/about" }]}
        title="We make broken phones dazzle again"
        text={`Since ${site.foundedYear}, ${site.name} has helped thousands of people in Dhaka get their phones back — fixed properly, priced honestly and backed by a real warranty.`}
      />
      <section className="bg-cream py-16 text-ink sm:py-20">
        <Container className="grid max-w-5xl gap-10 md:grid-cols-2">
          <div className="space-y-4 leading-7 text-neutral-700">
            <h2 className="text-2xl font-bold text-ink">Our story</h2>
            <p>
              {site.name} started with a simple idea: phone repair in Bangladesh should feel premium, transparent and
              trustworthy. Too many people had their phones returned with cheap parts, unexplained charges or new
              problems.
            </p>
            <p>
              So we built a clean, well-equipped lab, hired and trained certified technicians, and committed to
              genuine-grade parts and written warranties on every repair.
            </p>
          </div>
          <div className="space-y-4 leading-7 text-neutral-700">
            <h2 className="text-2xl font-bold text-ink">Our promise</h2>
            <p>
              Free diagnosis. The price you&apos;re quoted is the price you pay. If we can&apos;t fix it, you don&apos;t pay for
              the repair. And your data stays yours — always.
            </p>
            <p>
              From a quick battery swap to micro-soldering on a dead motherboard, every phone gets the same careful
              attention.
            </p>
          </div>
        </Container>
      </section>
      <StatsBand />
      <WhyUs />
      <Process />
      <Testimonials />
      <CtaBand />
    </>
  );
}
