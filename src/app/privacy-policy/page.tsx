import type { Metadata } from "next";
import { Container, PageHero } from "@/components/ui";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${site.name} collects, uses and protects your personal information.`,
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPage() {
  return (
    <>
      <PageHero crumbs={[{ name: "Privacy Policy", path: "/privacy-policy" }]} title="Privacy Policy" text={`How ${site.name} handles your information.`} />
      <section className="bg-white py-12 sm:py-16">
        <Container className="max-w-3xl space-y-6 leading-7 text-neutral-600 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-ink">
          <h2>Information we collect</h2>
          <p>When you book a repair or contact us, we collect your name, phone number, device details and the problem description you provide.</p>
          <h2>How we use it</h2>
          <p>We use this information only to contact you about your repair, provide service updates and honour your warranty.</p>
          <h2>Analytics & advertising</h2>
          <p>
            We use Google Analytics and the Meta Pixel (including server-side Conversions API) to understand how visitors use our
            website and to measure our advertising. Personal identifiers such as phone numbers are hashed (SHA-256) before being
            shared with Meta. You can opt out using your browser&apos;s tracking protection or ad settings in your Google and Meta accounts.
          </p>
          <h2>Your device data</h2>
          <p>Our technicians never access personal files on your device beyond what is required to test the repair.</p>
          <h2>Contact</h2>
          <p>For any privacy question, email {site.email} or call {site.phoneDisplay}.</p>
        </Container>
      </section>
    </>
  );
}
