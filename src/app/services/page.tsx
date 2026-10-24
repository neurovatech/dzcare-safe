import type { Metadata } from "next";
import { EstimatorSection, Process, ServicesGrid } from "@/components/sections";
import { CtaBand, PageHero } from "@/components/ui";

export const metadata: Metadata = {
  title: "Phone Repair Services & Prices in Dhaka",
  description:
    "Screen replacement, battery replacement, charging port, camera, water damage, motherboard, back glass and Face ID repair in Dhaka. See starting prices and book online.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        crumbs={[{ name: "Services", path: "/services" }]}
        title="Phone repair services in Dhaka"
        text="Every common and complex smartphone repair under one roof — with transparent prices, genuine-grade parts and a written warranty."
      />
      <ServicesGrid />
      <EstimatorSection />
      <Process />
      <CtaBand />
    </>
  );
}
