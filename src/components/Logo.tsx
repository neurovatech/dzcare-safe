type Props = {
  className?: string;
  /** "light" = white wordmark for dark backgrounds, "dark" = black wordmark for light backgrounds */
  tone?: "light" | "dark";
  showText?: boolean;
};

export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" focusable="false">
      <rect x="11" y="3" width="26" height="42" rx="7" fill="none" stroke="#d4a97a" strokeWidth="3" />
      <rect x="20" y="7.5" width="8" height="2.2" rx="1.1" fill="#d4a97a" />
      <path
        d="M24 15.5c.9 4.6 2.9 6.6 7.5 7.5-4.6.9-6.6 2.9-7.5 7.5-.9-4.6-2.9-6.6-7.5-7.5 4.6-.9 6.6-2.9 7.5-7.5Z"
        fill="#d4a97a"
      />
      <path d="M32.5 31.5c.35 1.8 1.1 2.55 2.9 2.9-1.8.35-2.55 1.1-2.9 2.9-.35-1.8-1.1-2.55-2.9-2.9 1.8-.35 2.55-1.1 2.9-2.9Z" fill="#d4a97a" opacity=".7" />
    </svg>
  );
}

export default function Logo({ className = "", tone = "dark", showText = true }: Props) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark />
      {showText && (
        <span className="text-xl font-bold leading-none tracking-tight">
          <span className={tone === "light" ? "text-white" : "text-ink"}>Dazzle</span>
          <span className="text-gold-dark">Care</span>
        </span>
      )}
    </span>
  );
}
