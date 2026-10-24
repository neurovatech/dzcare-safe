type P = { className?: string };

// Brand marks (simplified single-path glyphs), filled with currentColor.
export const FacebookIcon = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.9v3h2.6V21h3z" />
  </svg>
);

export const InstagramIcon = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className={className} aria-hidden="true">
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export const YouTubeIcon = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15V9l5.2 3L10 15z" />
  </svg>
);

export const TikTokIcon = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M16.6 3c.3 2.3 1.6 3.8 3.9 3.9v2.6c-1.4.1-2.6-.3-3.9-1.1v5.1c0 6.3-6.9 8.3-9.6 3.8-1.8-2.9-.7-8 5-8.2v2.8c-.4.1-.9.2-1.3.3-1.3.4-2 1.3-1.8 2.6.4 2.6 5.2 3.4 4.8-1.7V3h2.9z" />
  </svg>
);
