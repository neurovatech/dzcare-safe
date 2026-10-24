import { connection } from "next/server";
import { cache } from "react";
import { reviewsFor } from "@/lib/auth/store";
import { StarIcon } from "../Icons";
import ReviewForm from "./ReviewForm";

// one store read per request, shared by the rating line and the reviews tab
const load = cache(async (key: string) => {
  await connection(); // reviews change all the time — never bake them into the static page
  return reviewsFor(key);
});

function Stars({ value, size = "h-4 w-4" }: { value: number; size?: string }) {
  return (
    <span className="flex gap-0.5" role="img" aria-label={`${value.toFixed(1)} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <StarIcon key={i} className={`${size} ${i < Math.round(value) ? "text-gold" : "text-black/15"}`} />
      ))}
    </span>
  );
}

/** "4.6 ★★★★★ (12 reviews)" under the title */
export async function RatingLine({ reviewKey }: { reviewKey: string }) {
  const reviews = await load(reviewKey);
  if (!reviews.length) return <p className="text-sm text-neutral-500">No reviews yet — be the first after your repair.</p>;
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  return (
    <p className="flex items-center gap-2 text-sm">
      <b className="text-ink">{avg.toFixed(1)}</b>
      <Stars value={avg} />
      <a href="#reviews" className="text-neutral-500 hover:text-ink">
        ({reviews.length} review{reviews.length === 1 ? "" : "s"})
      </a>
    </p>
  );
}

export async function ReviewsPanel({ reviewKey, device }: { reviewKey: string; device: string }) {
  const reviews = await load(reviewKey);
  const fmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Dhaka" });
  return (
    <div>
      <h2 className="text-xl font-bold text-ink">Reviews</h2>
      <div className="mt-4">
        <ReviewForm reviewKey={reviewKey} device={device} />
      </div>
      {reviews.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-cream px-5 py-4 text-sm text-neutral-600">
          No reviews yet. Booked this repair with us? Share how it went.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-black/[.07]">
          {reviews.map((r) => (
            <li key={r.id} className="grid gap-3 py-6 sm:grid-cols-[160px_1fr]">
              <div className="flex items-center gap-3 sm:block">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-ink text-sm font-bold text-gold">
                  {r.name.slice(0, 1).toUpperCase()}
                </span>
                <div className="sm:mt-2">
                  <p className="font-semibold text-ink">{r.name}</p>
                  <p className="text-xs text-neutral-500">
                    {r.device}
                    {r.verified && <span className="ml-1 font-semibold text-gold-dark">· Verified booking</span>}
                  </p>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between gap-3">
                  <Stars value={r.rating} />
                  <time className="text-xs text-neutral-500" dateTime={r.createdAt}>
                    {fmt.format(new Date(r.createdAt))}
                  </time>
                </div>
                {r.title && <p className="mt-2 font-semibold text-ink">{r.title}</p>}
                <p className="mt-1 text-sm leading-6 text-neutral-700">{r.body}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
