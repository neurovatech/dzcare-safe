import { getCategory } from "@/lib/api";
import { getCategoryRepairs } from "@/lib/data";
import { ogContentType, ogSize, renderOg } from "@/lib/og";

export { generateStaticParams } from "./page";

export const alt = "DazzleCare device repair";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategory(slug);
  const paid = getCategoryRepairs(slug).filter((r) => r.price > 0);
  return renderOg({
    eyebrow: "Device repair",
    title: `${category?.name ?? "Device"} Repair in Dhaka`,
    subtitle: paid.slice(0, 3).map((r) => r.name).join(" · "),
    price: paid.length ? `From Tk ${Math.min(...paid.map((r) => r.price)).toLocaleString("en-IN")}` : undefined,
    image: category?.image,
  });
}
