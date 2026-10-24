"use client";

import { useState, useTransition } from "react";
import { askQuestion } from "@/app/reviews/actions";

const field =
  "w-full rounded-xl border border-black/10 bg-cream px-4 text-sm text-ink placeholder:text-neutral-400 outline-none transition focus:border-gold focus:bg-white focus:ring-4 focus:ring-gold/20";

export default function QuestionForm({ questionKey, device }: { questionKey: string; device: string }) {
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();

  if (done) {
    return (
      <p role="status" className="rounded-2xl border border-gold/40 bg-cream px-5 py-4 text-sm text-ink">
        ✓ Question sent — our technicians will get back to you soon.
      </p>
    );
  }

  return (
    <form
      className="rounded-2xl border border-black/[.08] p-4 sm:p-5"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          setError("");
          const res = await askQuestion({ key: questionKey, device, name, text });
          if (!res.ok) return setError(res.error ?? "Couldn't send your question.");
          setDone(true);
        });
      }}
    >
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name (optional)" maxLength={60} className={`${field} h-11`} />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={`Ask anything about this ${device} repair…`}
        rows={3}
        maxLength={800}
        className={`${field} mt-3 py-3`}
      />
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="mt-3 h-10 rounded-full bg-ink px-6 text-sm font-semibold text-white transition hover:bg-gold hover:text-ink disabled:opacity-60"
      >
        {pending ? "Sending…" : "Ask question"}
      </button>
    </form>
  );
}
