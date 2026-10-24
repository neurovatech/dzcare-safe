import { LogoMark } from "./Logo";
import { CheckIcon } from "./Icons";

const perks = ["Track every repair order", "Faster checkout next time", "Warranty records in one place"];

export default function AuthShell({ title, text, children }: { title: string; text: string; children: React.ReactNode }) {
  return (
    <section className="bg-cream py-10 sm:py-16">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] border border-black/[.06] bg-white shadow-2xl shadow-black/[.06] lg:grid-cols-[1.1fr_1fr]">
        <div className="p-6 sm:p-12">
          <h1 className="fade-up text-3xl font-bold tracking-tight text-ink sm:text-4xl">{title}</h1>
          <p className="fade-up mt-3 text-neutral-600" style={{ "--d": "80ms" } as React.CSSProperties}>{text}</p>
          <div className="fade-up mt-8" style={{ "--d": "160ms" } as React.CSSProperties}>{children}</div>
        </div>
        <div className="relative hidden overflow-hidden bg-ink p-12 lg:flex lg:flex-col lg:justify-between">
          <div aria-hidden="true" className=" absolute -right-20 -top-20 h-80 w-80 rounded-full glow" />
          <div aria-hidden="true" className=" absolute -bottom-24 -left-10 h-72 w-72 rounded-full glow" />
          <LogoMark className="relative h-14 w-14" />
          <div className="relative">
            <p className="text-3xl font-bold leading-tight text-white">
              Your devices deserve <span className="text-shimmer">premium care.</span>
            </p>
            <ul className="mt-8 space-y-3">
              {perks.map((p, i) => (
                <li key={p} className="fade-up flex items-center gap-3 text-white/80" style={{ "--d": `${300 + i * 120}ms` } as React.CSSProperties}>
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-gold text-ink">
                    <CheckIcon className="h-4 w-4" />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <p className="relative text-sm text-white/50">Secure sign-in · your data stays private</p>
        </div>
      </div>
    </section>
  );
}
