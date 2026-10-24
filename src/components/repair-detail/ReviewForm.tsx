"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { submitReview } from "@/app/reviews/actions";
import AuthModal from "../AuthModal";
import { StarIcon } from "../Icons";

const field =
  "w-full rounded-xl border border-black/10 bg-cream px-4 text-sm text-ink placeholder:text-neutral-400 outline-none transition focus:border-gold focus:bg-white focus:ring-4 focus:ring-gold/20";

export default function ReviewForm({ reviewKey, device }: { reviewKey: string; device: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [login, setLogin] = useState(false);
  const [pending, start] = useTransition();

  const send = () =>
    start(async () => {
      setError("");
      const res = await submitReview({ key: reviewKey, device, rating, title, body });
      if (res.needsLogin) return setLogin(true);
      if (!res.ok) return setError(res.error ?? "Couldn't save your review.");
      setDone(true);
      setTitle("");
      setBody("");
      router.refresh(); // show it in the list
    });

  if (done) {
    return (
      <p role="status" className="rounded-2xl border border-gold/40 bg-cream px-5 py-4 text-sm text-ink">
        ✓ Thanks for your review!
      </p>
    );
  }

  return (
    <form
      className="rounded-2xl border border-black/[.08] p-4 sm:p-5"
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
    >
      <div className="flex items-center gap-1" role="radiogroup" aria-label="Your rating" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n} star${n === 1 ? "" : "s"}`}
            onMouseEnter={() => setHover(n)}
            onClick={() => setRating(n)}
            className="p-0.5 transition hover:scale-125"
          >
            <StarIcon className={`h-6 w-6 ${(hover || rating) >= n ? "text-gold" : "text-black/15"}`} />
          </button>
        ))}
        {rating > 0 && <span className="ml-2 text-xs text-neutral-500">{["", "Poor", "Fair", "Good", "Very good", "Excellent"][rating]}</span>}
      </div>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Write your review title…" maxLength={100} className={`${field} mt-3 h-11`} />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write your review details…"
        rows={3}
        maxLength={1500}
        className={`${field} mt-3 py-3`}
      />
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="mt-3 h-10 rounded-full bg-ink px-6 text-sm font-semibold text-white transition hover:bg-gold hover:text-ink disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Submit"}
      </button>
      {login && <AuthModal context="writing a review" onSuccess={send} onClose={() => setLogin(false)} />}
    </form>
  );
}
