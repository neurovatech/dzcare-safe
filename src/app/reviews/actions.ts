"use server";

import { randomUUID } from "node:crypto";
import { after } from "next/server";
import { getSession } from "@/lib/auth/session";
import { addQuestion, addReview, findUserById, hasBooked } from "@/lib/auth/store";

// "phone:back-glass-replacement" or "category:laptop:keyboard-replacement"
const KEY_RE = /^(phone|category):[a-z0-9-]{2,40}(:[a-z0-9-]{2,40})?$/;
const clean = (v: unknown, max: number) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);

export type ReviewResult = { ok: boolean; error?: string; needsLogin?: boolean };

export async function submitReview(input: { key: string; device: string; rating: number; title: string; body: string }): Promise<ReviewResult> {
  const session = await getSession();
  // a signed cookie can outlive its account — the user must still exist
  if (!session || !(await findUserById(session.uid))) return { ok: false, needsLogin: true, error: "Please sign in to write a review." };
  if (!KEY_RE.test(input.key)) return { ok: false, error: "Invalid review." };

  const rating = Math.round(Number(input.rating));
  const title = clean(input.title, 100);
  const body = clean(input.body, 1500);
  if (!(rating >= 1 && rating <= 5)) return { ok: false, error: "Please choose a star rating." };
  if (body.length < 10) return { ok: false, error: "Please write at least a sentence about your repair." };

  // phone reviews cover the repair type for every model; category ones the exact repair
  const needle = input.key.startsWith("phone:") ? `:${input.key.slice(6)}:` : input.key;
  await addReview({
    id: randomUUID(),
    key: input.key,
    device: clean(input.device, 80),
    userId: session.uid,
    name: session.name.split(" ")[0] || "Customer",
    rating,
    title,
    body,
    verified: await hasBooked(session.uid, needle),
    createdAt: new Date().toISOString(),
  });
  return { ok: true };
}

export type QuestionResult = { ok: boolean; error?: string };

export async function askQuestion(input: { key: string; device: string; name: string; text: string }): Promise<QuestionResult> {
  if (!KEY_RE.test(input.key)) return { ok: false, error: "Invalid question." };
  const text = clean(input.text, 800);
  if (text.length < 8) return { ok: false, error: "Please write your question." };
  const session = await getSession();
  const question = await addQuestion({
    id: randomUUID(),
    key: input.key,
    device: clean(input.device, 80),
    userId: session?.uid,
    name: clean(input.name, 60) || session?.name || "Guest",
    text,
    createdAt: new Date().toISOString(),
  });

  // forward to the team (same webhook as bookings)
  const webhook = process.env.LEAD_WEBHOOK_URL;
  if (webhook) {
    after(() =>
      fetch(webhook, {
        method: "POST",
        signal: AbortSignal.timeout(8000),
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "question", ...question, email: session?.email }),
      }).catch((err) => console.error("[question-webhook]", err)),
    );
  }
  return { ok: true };
}
