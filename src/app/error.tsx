"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="bg-cream py-24">
      <div className="mx-auto max-w-xl px-4 text-center">
        <p className="text-6xl font-bold text-gold-dark">Oops</p>
        <h1 className="mt-4 text-3xl font-bold text-ink">Something went wrong</h1>
        <p className="mt-3 text-neutral-600">Please try again. If the problem continues, call or WhatsApp us.</p>
        <div className="mt-8 flex justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="btn-shine inline-flex h-12 items-center rounded-full bg-ink px-6 font-semibold text-white hover:bg-gold hover:text-ink"
          >
            Try again
          </button>
          <Link href="/" className="inline-flex h-12 items-center rounded-full border border-black/15 px-6 font-semibold text-ink hover:border-gold">
            Go home
          </Link>
        </div>
      </div>
    </section>
  );
}
