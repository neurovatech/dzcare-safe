import { getCategory } from "@/lib/api";
import { brands, getService } from "@/lib/data";
import { ogContentType, ogSize, renderOg } from "@/lib/og";

export { generateStaticParams } from "./page";

export const alt = "DazzleCare repair service";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getService(slug);
  const prices = brands.map((b) => b.prices[slug]).filter((p): p is number => typeof p === "number");
  const phone = await getCategory("phones");
  return renderOg({
    eyebrow: "Repair service",
    title: `${service?.name ?? "Phone Repair"} in Dhaka`,
    subtitle: service?.short,
    price: prices.length ? `From Tk ${Math.min(...prices).toLocaleString("en-IN")}` : undefined,
    image: phone?.image,
    chips: service ? [service.time, `${service.warranty} warranty`] : undefined,
  });
}
