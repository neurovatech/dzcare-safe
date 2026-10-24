import { getCategory } from "@/lib/api";
import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const alt = "DazzleCare — Premium Phone Repair in Dhaka";
export const size = ogSize;
export const contentType = ogContentType;

export default async function OpengraphImage() {
  const phone = await getCategory("phones");
  return renderOg({
    eyebrow: "Premium repair in Dhaka",
    title: "Phone, Laptop & Device Repair",
    subtitle: "Genuine-grade parts, expert technicians and up to 6 months warranty.",
    image: phone?.image,
  });
}
