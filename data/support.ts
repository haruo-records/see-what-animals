/**
 * SUPPORT — tiers as data, so amounts and their Stripe Payment Links live in one
 * place.
 *
 * v0 uses **Stripe Payment Links**: each tier is just an external URL, so the
 * button is a plain link — no Stripe SDK, nothing to run, works from the moment a
 * link is pasted in. To migrate to Stripe Checkout / Elements later, change only
 * how `href` is used in components/support/support-options.tsx; this data shape
 * stays the same.
 *
 * ►► TO GO LIVE: in the Stripe Dashboard create one Payment Link per tier and
 *    paste its URL into the matching NEXT_PUBLIC_STRIPE_* env var (.env.example),
 *    then redeploy. Until a link is set, that tier renders quietly disabled — the
 *    page never shows a broken button.
 *
 * Amounts are JPY. 100 / 300 are one-time; 500+ are monthly. Custom amount is a
 * single "customer chooses price" Payment Link.
 *
 * NOTE: env vars are referenced explicitly (not via a dynamic key) so Next.js
 * inlines the NEXT_PUBLIC_* values at build time.
 */
export type SupportCadence = "one-time" | "monthly";

export type SupportTier = {
  id: string;
  amount: number; // JPY
  cadence: SupportCadence;
  /** Stripe Payment Link URL. Empty string = not configured yet. */
  href: string;
};

export const oneTimeTiers: SupportTier[] = [
  { id: "once-100", amount: 100, cadence: "one-time", href: process.env.NEXT_PUBLIC_STRIPE_ONCE_100 ?? "" },
  { id: "once-300", amount: 300, cadence: "one-time", href: process.env.NEXT_PUBLIC_STRIPE_ONCE_300 ?? "" },
];

export const monthlyTiers: SupportTier[] = [
  { id: "monthly-500", amount: 500, cadence: "monthly", href: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_500 ?? "" },
  { id: "monthly-1000", amount: 1000, cadence: "monthly", href: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_1000 ?? "" },
  { id: "monthly-3000", amount: 3000, cadence: "monthly", href: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_3000 ?? "" },
  { id: "monthly-10000", amount: 10000, cadence: "monthly", href: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_10000 ?? "" },
  { id: "monthly-100000", amount: 100000, cadence: "monthly", href: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_100000 ?? "" },
];

/** A single "customer chooses price" Payment Link (monthly), for Custom amount. */
export const customSupportHref: string = process.env.NEXT_PUBLIC_STRIPE_CUSTOM ?? "";

/** True once at least one tier (or the custom link) is configured. */
export const supportConfigured: boolean =
  [...oneTimeTiers, ...monthlyTiers].some((t) => t.href.length > 0) || customSupportHref.length > 0;

/** ¥1,000 — a quiet, locale-stable amount label. */
export function formatYen(amount: number): string {
  return `¥${amount.toLocaleString("en-US")}`;
}
