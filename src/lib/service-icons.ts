import type { CartItem } from "./cart";
import type { IconName } from "./data";

// Repair slug → icon, small enough for client bundles (no catalogue import)
const ICONS: Record<string, IconName> = {
  "screen-replacement": "screen",
  "battery-replacement": "battery",
  "charging-port-repair": "port",
  "camera-repair": "camera",
  "water-damage-repair": "water",
  "motherboard-repair": "chip",
  "back-glass-replacement": "glass",
  "speaker-mic-repair": "speaker",
  "software-repair": "software",
  "face-id-repair": "faceid",
};

export const iconForItem = (item: Pick<CartItem, "source">): IconName => {
  const slug = item.source.kind === "phone" ? item.source.service : item.source.repair;
  return ICONS[slug] ?? "chip";
};
