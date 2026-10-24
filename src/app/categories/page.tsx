import type { Metadata } from "next";
import { CategoryGrid, Process } from "@/components/sections";
import { CtaBand, PageHero } from "@/components/ui";

export const metadata: Metadata = {
  title: "Devices We Repair — Phone, Laptop, Tablet, Watch & More",
  description:
    "Repair prices for phones, tablets, laptops, smart watches, speakers, smart TVs, monitors and home appliances in Dhaka. Add repairs to your cart and book online.",
  alternates: { canonical: "/categories" },
};

export default function CategoriesPage() {
  return (
    <>
      <PageHero
        crumbs={[{ name: "Devices", path: "/categories" }]}
        title="Every device, expertly repaired"
        text="Pick your device type to see repair options and prices. Add what you need to your cart and we'll take care of the rest."
      />
      <CategoryGrid />
      <Process />
      <CtaBand />
    </>
  );
}
