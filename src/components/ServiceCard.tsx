import Link from "next/link";
import type { IconName } from "@/lib/data";
import { formatTaka } from "@/lib/format";
import { repairPath } from "@/lib/slug";
import AddToCartButton from "./AddToCartButton";
import { ServiceIcon } from "./Icons";

type Props = {
  brandSlug: string;
  model: string;
  service: { slug: string; name: string; icon: IconName };
  price: number;
};

/** "iPhone 16 Pro Max Display Replacement · ৳X · [Start Repair] [Read More]" */
export default function ServiceCard({ brandSlug, model, service, price }: Props) {
  const title = `${model} ${service.name}`;
  return (
    <article className="group flex h-full flex-col items-center rounded-3xl border border-black/[.07] bg-white p-4 text-center transition duration-500 hover:-translate-y-1 hover:border-gold hover:shadow-xl hover:shadow-gold/20 sm:p-5">
      <span className="grid h-20 w-20 place-items-center rounded-3xl bg-cream text-gold-dark transition duration-500 group-hover:rotate-[-6deg] group-hover:scale-110 group-hover:bg-gold/20 sm:h-24 sm:w-24">
        <ServiceIcon name={service.icon} className="h-10 w-10 sm:h-12 sm:w-12" />
      </span>
      <h3 className="mt-4 flex-1 text-sm font-semibold leading-snug text-ink sm:mt-5 sm:text-base">{title}</h3>
      <p className="mt-2 text-lg font-bold text-gold-dark sm:text-xl">{formatTaka(price)}</p>
      <div className="mt-4 grid w-full grid-cols-2 gap-2">
        <AddToCartButton
          compact
          itemKey={`phone:${brandSlug}:${service.slug}:${model}`}
          source={{ kind: "phone", brand: brandSlug, service: service.slug, model }}
          title={`${model} — ${service.name}`}
          subtitle={model}
          price={price}
        />
        <Link
          href={repairPath(brandSlug, model, service.slug)}
          className="inline-flex h-9 items-center justify-center rounded-full border border-black/10 px-2 text-xs font-semibold text-ink transition hover:border-gold hover:text-gold-dark sm:px-3.5"
        >
          Read More
        </Link>
      </div>
    </article>
  );
}
