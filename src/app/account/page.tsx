import type { Metadata } from "next";
import AccountProfile from "@/components/AccountProfile";
import AccountOrders from "@/components/AccountOrders";
import { Container, PageHero } from "@/components/ui";

export const metadata: Metadata = {
  title: "My Account",
  robots: { index: false },
};

export default function AccountPage() {
  return (
    <>
      <PageHero
        crumbs={[{ name: "My Account", path: "/account" }]}
        title="My account"
        text="Your profile and repair orders."
      />
      <section className="bg-cream py-12 sm:py-16">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1fr_2fr] lg:items-start">
            {/* Profile sidebar — fetches from external API */}
            <AccountProfile />

            {/* Orders panel */}
            <AccountOrders />
          </div>
        </Container>
      </section>
    </>
  );
}
