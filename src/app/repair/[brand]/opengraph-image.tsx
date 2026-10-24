import { getCategory } from "@/lib/api";
import { getBrand } from "@/lib/data";
import { ogContentType, ogSize, renderOg } from "@/lib/og";

export { generateStaticParams } from "./page";

export const alt = "DazzleCare brand repair";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image({ params }: { params: Promise<{ brand: string }> }) {
  const { brand: slug } = await params;
  const brand = getBrand(slug);
  const screen = brand?.prices["screen-replacement"];
  const phone = await getCategory("phones");
  return renderOg({
    eyebrow: "Brand repair",
    title: `${brand?.name ?? "Phone"} Repair in Dhaka`,
    subtitle: "Screen, battery, charging port, camera & motherboard repair.",
    price: screen ? `Screen from Tk ${screen.toLocaleString("en-IN")}` : undefined,
    image: phone?.image,
  });
}
