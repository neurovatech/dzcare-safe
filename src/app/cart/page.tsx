import { redirect } from "next/navigation";

// The cart now lives in the "Your Booked Services" drawer; checkout is /booking.
export default function CartPage() {
  redirect("/booking");
}
