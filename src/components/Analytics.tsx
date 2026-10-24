"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { trackPageView } from "@/lib/tracking/client";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

function loadScript(src: string) {
  const s = document.createElement("script");
  s.src = src;
  s.async = true;
  document.head.appendChild(s);
}

/**
 * GA4 + Meta Pixel with performance-first loading:
 * - tiny queue stubs are installed immediately, so no event is ever lost
 * - the heavy vendor libraries load only after the first user interaction
 *   (or after an idle timeout), keeping them out of LCP / TBT
 * - every PageView is mirrored to the server (Meta CAPI) for ad-blocker-proof tracking
 */
export default function Analytics() {
  const pathname = usePathname();
  const booted = useRef(false);

  useEffect(() => {
    if (booted.current) return;
    booted.current = true;

    if (GA_ID && !window.gtag) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag() {
        // gtag requires the real `arguments` object
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer!.push(arguments);
      };
      window.gtag("js", new Date());
      window.gtag("config", GA_ID, { send_page_view: false });
    }

    if (PIXEL_ID && !window.fbq) {
      // Same queue stub as Meta's official snippet; history-based auto PageViews are
      // disabled so every PageView carries our eventID for CAPI deduplication.
      type FbqStub = ((...args: unknown[]) => void) & Record<string, unknown>;
      const fbq = function (this: unknown) {
        // eslint-disable-next-line prefer-rest-params
        const args = arguments;
        if (typeof fbq.callMethod === "function") (fbq.callMethod as (...a: unknown[]) => void).apply(fbq, Array.from(args));
        else (fbq.queue as unknown[]).push(args);
      } as unknown as FbqStub;
      Object.assign(fbq, { push: fbq, loaded: true, version: "2.0", queue: [], disablePushState: true });
      window.fbq = fbq;
      (window as unknown as { _fbq: unknown })._fbq = fbq;
      fbq("init", PIXEL_ID);
    }

    let loaded = false;
    const load = () => {
      if (loaded) return;
      loaded = true;
      events.forEach((e) => window.removeEventListener(e, load));
      if (GA_ID) loadScript(`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`);
      if (PIXEL_ID) loadScript("https://connect.facebook.net/en_US/fbevents.js");
    };
    const events = ["pointerdown", "keydown", "scroll", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, load, { once: true, passive: true }));
    window.setTimeout(load, 6000);
  }, []);

  useEffect(() => {
    trackPageView();
  }, [pathname]);

  return null;
}
