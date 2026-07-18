import type { MetadataRoute } from "next";
import { siteSettings } from "@/data/site-settings";

/**
 * Web App Manifest, generated from the same brand source as everything else.
 *
 * `display: "browser"` on purpose — See What? is a place you visit and leave,
 * not an app to install and return to daily. No standalone shell, no prompts.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteSettings.brandName} — ${siteSettings.tagline}`,
    short_name: siteSettings.brandName,
    description: "Observe an unfamiliar form, leave what you saw, and see how differently others saw it.",
    start_url: "/",
    display: "browser",
    background_color: "#f4f0e7",
    theme_color: "#f4f0e7",
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/apple-icon.png", type: "image/png", sizes: "180x180" },
    ],
  };
}
