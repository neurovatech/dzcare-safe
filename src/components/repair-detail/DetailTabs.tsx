"use client";

import { useState } from "react";

/** Reviews / Question / Description tabs — panels are rendered on the server and passed in. */
export default function DetailTabs({ tabs }: { tabs: { id: string; label: string; content: React.ReactNode }[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  return (
    <div id="reviews" className="scroll-mt-24">
      <div role="tablist" aria-label="Repair details" className="flex gap-2 border-b border-black/[.07] pb-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={active === t.id}
            aria-controls={`panel-${t.id}`}
            onClick={() => setActive(t.id)}
            className={`h-10 rounded-full px-5 text-sm font-semibold transition ${
              active === t.id ? "bg-gold text-ink shadow-md shadow-gold/30" : "bg-cream text-neutral-700 hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t) => (
        <section key={t.id} id={`panel-${t.id}`} role="tabpanel" aria-labelledby={`tab-${t.id}`} hidden={active !== t.id} className="pt-6">
          {t.content}
        </section>
      ))}
    </div>
  );
}
