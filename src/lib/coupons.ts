// Coupon codes, checked on the server at booking time. Edit to run promotions.
// percent: % off the repair subtotal, capped at `max` taka.
export type Coupon = { code: string; percent: number; max: number; minSubtotal?: number; label: string };

export const coupons: Coupon[] = [
  // Example — change or remove before going live
  { code: "WELCOME10", percent: 10, max: 500, minSubtotal: 1000, label: "10% off your first repair (up to ৳500)" },
];

export function applyCoupon(code: string, subtotal: number): { ok: true; discount: number; coupon: Coupon } | { ok: false; error: string } {
  const coupon = coupons.find((c) => c.code === code.trim().toUpperCase());
  if (!coupon) return { ok: false, error: "This coupon code isn't valid." };
  if (coupon.minSubtotal && subtotal < coupon.minSubtotal)
    return { ok: false, error: `This coupon needs a subtotal of at least ৳${coupon.minSubtotal.toLocaleString("en-IN")}.` };
  const discount = Math.min(Math.round((subtotal * coupon.percent) / 100), coupon.max);
  return { ok: true, discount, coupon };
}
