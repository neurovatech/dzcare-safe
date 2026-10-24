"use client";

import { trackContact } from "@/lib/tracking/client";

type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  method: "call" | "whatsapp" | "map" | "email";
  trackLabel?: string;
};

/** External contact link (tel:, wa.me, maps) that fires a Contact conversion on click. */
export default function TrackedLink({ method, trackLabel, onClick, ...props }: Props) {
  return (
    <a
      {...props}
      onClick={(e) => {
        trackContact(method, trackLabel);
        onClick?.(e);
      }}
    />
  );
}
