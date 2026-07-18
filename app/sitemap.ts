import type { MetadataRoute } from "next";
import { siteSettings } from "@/data/site-settings";
import { observationSessions } from "@/data/observation-sessions";
import { products } from "@/data/products";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteSettings.siteUrl.replace(/\/$/, "");
  // Field Notes has no role in the UI yet, so it is not advertised here.
  // The routes still resolve; add "/field-notes" back when it returns.
  const staticRoutes = ["", "/observations", "/support", "/shop", "/contact", "/privacy"];

  const staticEntries = staticRoutes.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }));

  const observationEntries = observationSessions.map((s) => ({
    url: `${base}/observations/${s.slug}`,
    lastModified: new Date(s.closesAt),
  }));

  const productEntries = products.map((p) => ({
    url: `${base}/shop/${p.slug}`,
    lastModified: new Date(),
  }));

  return [...staticEntries, ...observationEntries, ...productEntries];
}
