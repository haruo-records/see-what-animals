import type { MetadataRoute } from "next";
import { siteSettings } from "@/data/site-settings";
import { observationSessions } from "@/data/observation-sessions";
import { fieldNotes } from "@/data/field-notes";
import { products } from "@/data/products";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteSettings.siteUrl.replace(/\/$/, "");
  const staticRoutes = ["", "/observations", "/support", "/field-notes", "/shop", "/contact", "/privacy"];

  const staticEntries = staticRoutes.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }));

  const observationEntries = observationSessions.map((s) => ({
    url: `${base}/observations/${s.slug}`,
    lastModified: new Date(s.closesAt),
  }));

  const noteEntries = fieldNotes.map((n) => ({
    url: `${base}/field-notes/${n.slug}`,
    lastModified: new Date(n.publishedAt),
  }));

  const productEntries = products.map((p) => ({
    url: `${base}/shop/${p.slug}`,
    lastModified: new Date(),
  }));

  return [...staticEntries, ...observationEntries, ...noteEntries, ...productEntries];
}
