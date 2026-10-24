import { ImageResponse } from "next/og";
import { site } from "./site";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

type Og = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  price?: string;
  image?: string;
  chips?: string[];
};

const GOLD = "#d4a97a";
const GOLD_DARK = "#8a6337";
const INK = "#0b0b0b";
const CREAM = "#fffbf6";

/** Geist (subset to the glyphs we draw) from Google Fonts. Returns null if offline. */
async function loadFont(weight: 400 | 700, text: string) {
  try {
    const css = await (
      await fetch(`https://fonts.googleapis.com/css2?family=Geist:wght@${weight}&text=${encodeURIComponent(text)}`, {
        signal: AbortSignal.timeout(5000),
      })
    ).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!url) return null;
    return await (await fetch(url, { signal: AbortSignal.timeout(5000) })).arrayBuffer();
  } catch {
    return null;
  }
}

/** Branded 1200×630 social preview (Facebook, WhatsApp, LinkedIn, X…). */
export async function renderOg({ eyebrow, title, subtitle, price, image, chips = [] }: Og) {
  const shownChips = chips.length ? chips : ["Free diagnosis", "Same-day repair", "Warranty"];
  // eyebrow is drawn uppercase, so include those glyphs in the subset too
  const text = ["DazzleCare", eyebrow, eyebrow.toUpperCase(), title, subtitle, price, ...shownChips, site.url].join(" ");
  const [regular, bold] = await Promise.all([loadFont(400, text), loadFont(700, text)]);
  const fonts = [
    ...(regular ? [{ name: "Geist", data: regular, weight: 400 as const, style: "normal" as const }] : []),
    ...(bold ? [{ name: "Geist", data: bold, weight: 700 as const, style: "normal" as const }] : []),
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: `radial-gradient(circle at 82% 30%, #f1dcc0 0%, ${CREAM} 55%)`,
          color: INK,
          fontFamily: fonts.length ? "Geist" : "sans-serif",
        }}
      >
        {/* gold frame */}
        <div style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 630, display: "flex", border: `14px solid ${GOLD}` }} />

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 0 56px 72px", width: image ? 700 : 1100 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <svg width="56" height="56" viewBox="0 0 48 48">
              <rect x="11" y="3" width="26" height="42" rx="7" fill="none" stroke={GOLD} strokeWidth="3" />
              <rect x="20" y="7.5" width="8" height="2.2" rx="1.1" fill={GOLD} />
              <path d="M24 15.5c.9 4.6 2.9 6.6 7.5 7.5-4.6.9-6.6 2.9-7.5 7.5-.9-4.6-2.9-6.6-7.5-7.5 4.6-.9 6.6-2.9 7.5-7.5Z" fill={GOLD} />
            </svg>
            <div style={{ display: "flex", fontSize: 40, fontWeight: 700 }}>
              <span>Dazzle</span>
              <span style={{ color: GOLD_DARK }}>Care</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 24, fontWeight: 700, letterSpacing: 4, color: GOLD_DARK, textTransform: "uppercase" }}>
              {eyebrow}
            </div>
            <div style={{ display: "flex", marginTop: 14, fontSize: title.length > 34 ? 56 : 66, fontWeight: 700, lineHeight: 1.08 }}>
              {title}
            </div>
            {subtitle && <div style={{ display: "flex", marginTop: 18, fontSize: 28, color: "#525252", lineHeight: 1.35 }}>{subtitle}</div>}
            {price && (
              <div style={{ display: "flex", marginTop: 26 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, background: INK, color: GOLD, padding: "12px 26px", borderRadius: 999, fontSize: 30, fontWeight: 700 }}>
                  {price}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 12, fontSize: 22 }}>
            {shownChips.map((c) => (
              <div key={c} style={{ display: "flex", border: `2px solid ${GOLD}`, borderRadius: 999, padding: "8px 18px", color: INK, background: "#ffffff" }}>
                {c}
              </div>
            ))}
          </div>
        </div>

        {image && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 500, position: "relative" }}>
            <div style={{ position: "absolute", width: 400, height: 400, borderRadius: 999, background: `linear-gradient(135deg, ${GOLD}, #f3e2cc)`, display: "flex" }} />
            {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse needs a plain <img> */}
            <img src={image} width={420} height={420} alt="" style={{ objectFit: "contain" }} />
          </div>
        )}

        <div style={{ position: "absolute", right: 48, bottom: 40, display: "flex", fontSize: 22, color: GOLD_DARK, fontWeight: 600 }}>
          {site.url.replace(/^https?:\/\//, "")}
        </div>
      </div>
    ),
    { ...ogSize, fonts: fonts.length ? fonts : undefined },
  );
}
