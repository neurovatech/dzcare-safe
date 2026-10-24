import { mkdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";

// Simple JSON-file store for users & orders.
// Fine for a single server (VPS / `next start`). On serverless hosting (Vercel)
// the filesystem is not persistent — swap these functions for your backend API
// or a database; the rest of the app only talks to this module.

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  createdAt: string;
  resetTokenHash?: string;
  resetTokenExpires?: number;
};

export type OrderItem = { key: string; title: string; price: number };

export type Order = {
  id: string;
  userId?: string;
  name: string;
  phone: string;
  visit: string;
  note: string;
  items: OrderItem[];
  total: number;
  createdAt: string;
  /** "prebook" = reserved time slot for a single repair */
  type?: "order" | "prebook";
  slot?: { date: string; time: string };
  // booking-page fields
  email?: string;
  address?: { division: string; district: string; area: string; line: string };
  serviceType?: "erepair" | "shop";
  shop?: string;
  subtotal?: number;
  discount?: number;
  coupon?: string;
};

export type Review = {
  id: string;
  /** what is reviewed, e.g. "phone:back-glass-replacement" or "category:laptop:keyboard-replacement" */
  key: string;
  /** device it was for, e.g. "iPhone 14 Pro Max" */
  device: string;
  userId: string;
  name: string;
  rating: number;
  title: string;
  body: string;
  verified: boolean;
  createdAt: string;
};

export type Question = { id: string; key: string; device: string; userId?: string; name: string; text: string; createdAt: string };

type Db = { users: User[]; orders: Order[]; reviews?: Review[]; questions?: Question[] };

// DATA_DIR should be an absolute path in production (the standalone server
// changes its working directory into .next/standalone, which is rebuilt on deploy).
const FILE = path.join(process.env.DATA_DIR ?? path.join(process.cwd(), ".data"), "db.json");
let queue: Promise<unknown> = Promise.resolve();

// Parsed copy kept in memory so reads don't re-parse the whole file on every
// request. A cheap mtime check picks up edits made to the file from outside.
let cache: { db: Db; mtimeMs: number } | null = null;

async function load(): Promise<Db> {
  try {
    const { mtimeMs } = await stat(FILE);
    if (cache && cache.mtimeMs === mtimeMs) return cache.db;
    const db = JSON.parse(await readFile(FILE, "utf8")) as Db;
    cache = { db, mtimeMs };
    return db;
  } catch {
    return { users: [], orders: [] };
  }
}

async function save(db: Db) {
  await mkdir(path.dirname(FILE), { recursive: true });
  const tmp = `${FILE}.tmp`;
  await writeFile(tmp, JSON.stringify(db));
  await rename(tmp, FILE);
  cache = { db, mtimeMs: (await stat(FILE)).mtimeMs };
}

/** Serializes read-modify-write cycles so concurrent requests don't clobber each other. */
function mutate<T>(fn: (db: Db) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    // Work on a copy so a failed write never leaves the in-memory cache half-updated
    const db = structuredClone(await load());
    const result = await fn(db);
    await save(db);
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export async function findUserByEmail(email: string) {
  const db = await load();
  return db.users.find((u) => u.email === normalizeEmail(email));
}

export async function findUserById(id: string) {
  const db = await load();
  return db.users.find((u) => u.id === id);
}

export function createUser(user: User) {
  return mutate((db) => {
    if (db.users.some((u) => u.email === user.email)) return null;
    db.users.push(user);
    return user;
  });
}

export function updateUser(id: string, patch: Partial<User>) {
  return mutate((db) => {
    const user = db.users.find((u) => u.id === id);
    if (user) Object.assign(user, patch);
    return user ?? null;
  });
}

export function findUserByResetHash(hash: string) {
  return load().then((db) =>
    db.users.find((u) => u.resetTokenHash === hash && (u.resetTokenExpires ?? 0) > Date.now()),
  );
}

export function createOrder(order: Order) {
  return mutate((db) => {
    db.orders.push(order);
    return order;
  });
}

export async function ordersForUser(userId: string) {
  const db = await load();
  return db.orders.filter((o) => o.userId === userId).reverse();
}

export async function reviewsFor(key: string) {
  const db = await load();
  return (db.reviews ?? []).filter((r) => r.key === key).reverse();
}

export function addReview(review: Review) {
  return mutate((db) => {
    db.reviews = db.reviews ?? [];
    // one review per customer per repair — a new one replaces the old
    db.reviews = db.reviews.filter((r) => !(r.key === review.key && r.userId === review.userId));
    db.reviews.push(review);
    return review;
  });
}

export function addQuestion(question: Question) {
  return mutate((db) => {
    db.questions = db.questions ?? [];
    db.questions.push(question);
    return question;
  });
}

/** Did this customer book a repair whose item key contains `needle`? (for "Verified booking") */
export async function hasBooked(userId: string, needle: string) {
  const db = await load();
  return db.orders.some((o) => o.userId === userId && o.items.some((i) => i.key.includes(needle)));
}
