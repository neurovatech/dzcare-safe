import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/cart", "/booking", "/account", "/signin", "/signup", "/forgot-password", "/reset-password"] },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
