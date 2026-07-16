import type { MetadataRoute } from "next";
import { siteSettings } from "@/data/site-settings";

export default function robots(): MetadataRoute.Robots {
  const base = siteSettings.siteUrl.replace(/\/$/, "");
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${base}/sitemap.xml`,
  };
}
