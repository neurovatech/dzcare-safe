import type { FeatureIcon as FeatureIconName, IconName } from "@/lib/data";

type P = { className?: string };
const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
  "aria-hidden": true,
};

const paths: Record<IconName, React.ReactNode> = {
  screen: (
    <>
      <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
      <path d="M9 7.5l3 3-2 2 4 4M14 6l-1.5 2.5" />
    </>
  ),
  battery: (
    <>
      <rect x="3" y="7" width="16" height="10" rx="2" />
      <path d="M21 10.5v3M11.5 9l-2 3h3l-2 3" />
    </>
  ),
  port: (
    <>
      <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
      <path d="M10 18.5h4M12 6.5v5m-2-2.5h4" />
    </>
  ),
  camera: (
    <>
      <rect x="3" y="6" width="18" height="13" rx="2.5" />
      <circle cx="12" cy="12.5" r="3.5" />
      <path d="M8.5 6l1.5-2h4l1.5 2" />
    </>
  ),
  water: (
    <>
      <path d="M12 3s6 6.4 6 11a6 6 0 1 1-12 0c0-4.6 6-11 6-11Z" />
      <path d="M9.5 14.5a2.5 2.5 0 0 0 2.5 2.5" />
    </>
  ),
  chip: (
    <>
      <rect x="6.5" y="6.5" width="11" height="11" rx="1.5" />
      <rect x="9.5" y="9.5" width="5" height="5" rx=".5" />
      <path d="M9 3v3.5M15 3v3.5M9 17.5V21M15 17.5V21M3 9h3.5M3 15h3.5M17.5 9H21M17.5 15H21" />
    </>
  ),
  glass: (
    <>
      <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
      <rect x="8.5" y="5" width="4" height="4" rx="1" />
      <path d="M11 13l2.5 2.5L12 17" />
    </>
  ),
  speaker: (
    <>
      <path d="M4 9.5h3l4.5-4v13L7 14.5H4z" />
      <path d="M15 9a4 4 0 0 1 0 6M17.5 6.5a7.5 7.5 0 0 1 0 11" />
    </>
  ),
  software: (
    <>
      <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
      <path d="M9 12.5l2 2 4-4.5" />
    </>
  ),
  faceid: (
    <>
      <path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2" />
      <path d="M9 9.5v1M15 9.5v1M12 9.5v3.5h-1M9.5 16a3.5 3.5 0 0 0 5 0" />
    </>
  ),
};

export function ServiceIcon({ name, className = "h-6 w-6" }: P & { name: IconName }) {
  return (
    <svg {...base} className={className}>
      {paths[name]}
    </svg>
  );
}

export const PhoneIcon = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}>
    <path d="M5 4h3.5l1.5 4-2 1.5a11 11 0 0 0 6.5 6.5l1.5-2 4 1.5V19a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
  </svg>
);

export const WhatsAppIcon = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.8-1.2.2-.6.2-1.1.1-1.2l-.5-.2Z" />
  </svg>
);

export const CheckIcon = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className} strokeWidth={2}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

export const ArrowIcon = ({ className = "h-4 w-4" }: P) => (
  <svg {...base} className={className} strokeWidth={2}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const PinIcon = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}>
    <path d="M12 21s7-6.2 7-11.5a7 7 0 0 0-14 0C5 14.8 12 21 12 21Z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </svg>
);

export const ClockIcon = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const ShieldIcon = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}>
    <path d="M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6z" />
    <path d="M8.5 12l2.5 2.5 4.5-5" />
  </svg>
);

export const StarIcon = ({ className = "h-4 w-4" }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" />
  </svg>
);

export type NavIconName = "wrench" | "grid" | "phone" | "chat" | "cart" | "user";

const navPaths: Record<NavIconName, React.ReactNode> = {
  wrench: <path d="M14.5 6.5a4 4 0 0 0-5.3 5.1L4 16.8V20h3.2l5.2-5.2a4 4 0 0 0 5.1-5.3l-2.4 2.4-2.6-.6-.6-2.6z" />,
  grid: (
    <>
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
    </>
  ),
  phone: (
    <>
      <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" />
      <path d="M10.5 18.5h3" />
    </>
  ),
  chat: <path d="M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-8l-4 3.5V16H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM8.5 10.5h7" />,
  cart: (
    <>
      <path d="M3 4h2l2.2 10.5a2 2 0 0 0 2 1.5h7.6a2 2 0 0 0 2-1.6L20 8H6.2" />
      <circle cx="10" cy="20" r="1.3" />
      <circle cx="17" cy="20" r="1.3" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
};

export const NavIcon = ({ name, className = "h-4 w-4" }: P & { name: NavIconName }) => (
  <svg {...base} className={className} strokeWidth={1.8}>
    {navPaths[name]}
  </svg>
);


const featurePaths: Record<FeatureIconName, React.ReactNode> = {
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-4.3-4.3M8.5 11h5M11 8.5v5" />
    </>
  ),
  chip: paths.chip,
  shield: (
    <>
      <path d="M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6z" />
      <path d="M8.5 12l2.5 2.5 4.5-5" />
    </>
  ),
  bolt: <path d="M13 2.5L5 13.5h6l-1 8 8-11h-6l1-8z" />,
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5M12 14.5v2.5" />
    </>
  ),
  coin: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M14.5 9.2c-.5-.8-1.4-1.2-2.5-1.2-1.5 0-2.6.8-2.6 2s1 1.7 2.6 2c1.6.3 2.6.8 2.6 2s-1.1 2-2.6 2c-1.2 0-2.2-.5-2.7-1.4M12 6.5v1.5M12 16v1.5" />
    </>
  ),
};

export const FeatureIcon = ({ name, className = "h-6 w-6" }: P & { name: FeatureIconName }) => (
  <svg {...base} className={className}>
    {featurePaths[name]}
  </svg>
);
