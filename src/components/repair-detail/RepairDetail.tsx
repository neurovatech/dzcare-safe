import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import type { CartItem } from "@/lib/cart";
import type { IconName } from "@/lib/data";
import { formatTaka } from "@/lib/format";
import { whatsappUrl } from "@/lib/site";
import AddToCartButton from "../AddToCartButton";
import JsonLd, { businessId, faqLd } from "../JsonLd";
import TrackedLink from "../TrackedLink";
import { Breadcrumbs, Container } from "../ui";
import { CheckIcon, ClockIcon, ServiceIcon, ShieldIcon, WhatsAppIcon } from "../Icons";
import DetailTabs from "./DetailTabs";
import QuestionForm from "./QuestionForm";
import { RatingLine, ReviewsPanel } from "./Reviews";

type Props = {
  crumbs: { name: string; path: string }[];
  title: string;
  device: string;
  price: number;
  icon: IconName;
  /** device photo (category repairs); phone repairs use the large icon */
  image?: string;
  includes: string[];
  time: string;
  warranty?: string;
  cart: Omit<CartItem, "key"> & { itemKey: string };
  /** key for reviews & questions, e.g. "phone:back-glass-replacement" */
  feedbackKey: string;
  description: { intro: string; symptoms?: string[]; process?: string[] };
  faqs: { q: string; a: string }[];
  url: string;
  related?: { href: string; label: string }[];
};

export default function RepairDetail(p: Props) {
  const ld = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: p.title,
    description: p.description.intro,
    provider: { "@id": businessId },
    areaServed: { "@type": "City", name: "Dhaka" },
    url: p.url,
    offers: { "@type": "Offer", priceCurrency: "BDT", price: p.price },
  };

  return (
    <section className="bg-white py-8 sm:py-12">
      <Container>
        <Breadcrumbs items={p.crumbs} />

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,380px)_1fr] lg:gap-12">
          {/* illustration */}
          <div className="relative mx-auto grid w-full max-w-xs place-items-center overflow-hidden rounded-[2rem] bg-cream py-8 sm:max-w-sm lg:mx-0 lg:max-w-none lg:aspect-square lg:py-0">
            <div aria-hidden="true" className="glow pointer-events-none absolute inset-10 rounded-full" />
            {p.image ? (
              <Image src={p.image} alt={p.device} width={340} height={340} preload className="relative h-3/4 w-3/4 object-contain drop-shadow-2xl" />
            ) : (
              <span className="relative grid h-40 w-40 place-items-center rounded-[2.5rem] border-2 border-gold/50 bg-white text-gold-dark shadow-xl shadow-gold/20 sm:h-48 sm:w-48 lg:h-56 lg:w-56">
                <ServiceIcon name={p.icon} className="h-24 w-24 sm:h-28 sm:w-28 lg:h-32 lg:w-32" />
              </span>
            )}
            <span className="absolute left-4 top-4 rounded-full bg-ink px-3 py-1 text-xs font-semibold text-gold">{p.device}</span>
          </div>

          {/* summary */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{p.title}</h1>
            <p className="mt-3 text-3xl font-bold text-gold-dark">{p.price ? formatTaka(p.price) : "Free"}</p>
            <div className="mt-2 min-h-5">
              <Suspense fallback={<p className="text-sm text-neutral-400">Loading reviews…</p>}>
                <RatingLine reviewKey={p.feedbackKey} />
              </Suspense>
            </div>

            <ul className="mt-5 space-y-2.5">
              {p.includes.map((line) => (
                <li key={line} className="flex items-start gap-2.5 text-sm text-neutral-700">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gold text-ink">
                    <CheckIcon className="h-3 w-3" />
                  </span>
                  {line}
                </li>
              ))}
            </ul>

            <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cream px-3 py-1.5 text-ink">
                <ClockIcon className="h-3.5 w-3.5 text-gold-dark" /> {p.time}
              </span>
              {p.warranty && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-cream px-3 py-1.5 text-ink">
                  <ShieldIcon className="h-3.5 w-3.5 text-gold-dark" /> {p.warranty} warranty
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cream px-3 py-1.5 text-ink">Free diagnosis</span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:max-w-md">
              <TrackedLink
                method="whatsapp"
                trackLabel="repair-detail"
                href={whatsappUrl(`Hi DazzleCare, I'd like a quote for: ${p.title}`)}
                target="_blank"
                rel="noopener"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#15803d] text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <WhatsAppIcon className="h-4 w-4" /> WhatsApp
              </TrackedLink>
              <AddToCartButton {...p.cart} />
            </div>
          </div>
        </div>

        <div className="mt-12">
          <DetailTabs
            tabs={[
              {
                id: "reviews",
                label: "Reviews",
                content: (
                  <Suspense fallback={<p className="text-sm text-neutral-400">Loading reviews…</p>}>
                    <ReviewsPanel reviewKey={p.feedbackKey} device={p.device} />
                  </Suspense>
                ),
              },
              {
                id: "question",
                label: "Question",
                content: (
                  <div className="grid gap-8 md:grid-cols-2">
                    <div>
                      <h2 className="text-xl font-bold text-ink">Ask a question</h2>
                      <div className="mt-4">
                        <QuestionForm questionKey={p.feedbackKey} device={p.device} />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-ink">Common questions</h2>
                      <dl className="mt-4 space-y-4">
                        {p.faqs.map((f) => (
                          <div key={f.q} className="rounded-2xl bg-cream p-4">
                            <dt className="font-semibold text-ink">{f.q}</dt>
                            <dd className="mt-1 text-sm leading-6 text-neutral-600">{f.a}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  </div>
                ),
              },
              {
                id: "description",
                label: "Description",
                content: (
                  <div className="max-w-3xl space-y-6 leading-7 text-neutral-700">
                    <p>{p.description.intro}</p>
                    {p.description.symptoms?.length ? (
                      <div>
                        <h3 className="font-bold text-ink">When you need it</h3>
                        <ul className="mt-2 list-disc space-y-1 pl-5">
                          {p.description.symptoms.map((s) => (
                            <li key={s}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {p.description.process?.length ? (
                      <div>
                        <h3 className="font-bold text-ink">How we do it</h3>
                        <ol className="mt-2 list-decimal space-y-1 pl-5">
                          {p.description.process.map((s) => (
                            <li key={s}>{s}</li>
                          ))}
                        </ol>
                      </div>
                    ) : null}
                  </div>
                ),
              },
            ]}
          />
        </div>

        {p.related?.length ? (
          <div className="mt-12 border-t border-black/[.07] pt-8">
            <h2 className="text-lg font-bold text-ink">Other repairs for {p.device}</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {p.related.map((r) => (
                <li key={r.href}>
                  <Link href={r.href} className="inline-block rounded-full border border-black/10 px-4 py-2 text-sm text-ink transition hover:border-gold hover:text-gold-dark">
                    {r.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Container>
      <JsonLd data={ld} />
      {p.faqs.length ? <JsonLd data={faqLd(p.faqs)} /> : null}
    </section>
  );
}
