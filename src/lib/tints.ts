// Accent variants for cards — all built on the brand gold (#d4a97a) and ink.
// Class strings are written out in full so Tailwind can see them at build time.
export const tints = [
  {
    tile: "bg-gold/20 text-gold-dark",
    solid: "bg-gold",
    soft: "from-cream",
    text: "text-gold-dark",
    ring: "hover:border-gold",
    shadow: "hover:shadow-gold/25",
  },
  {
    tile: "bg-ink text-gold",
    solid: "bg-gold",
    soft: "from-cream",
    text: "text-ink",
    ring: "hover:border-gold",
    shadow: "hover:shadow-gold/25",
  },
] as const;

export const tint = (i: number) => tints[i % tints.length];
