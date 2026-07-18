import {
  oneTimeTiers,
  monthlyTiers,
  customSupportHref,
  supportConfigured,
  formatYen,
  type SupportTier,
} from "@/data/support";
import { SupportLink } from "./support-link";

/**
 * "Choose your support" — the live support control. Each tier is a Stripe
 * Payment Link (an external URL): configured tiers are real links; unconfigured
 * tiers render quietly disabled so the page is never broken before launch.
 *
 * Server component — the enabled links are rendered via the small client
 * <SupportLink>, which fires a GA4 `support_click` on click without delaying the
 * navigation. Migrating to Stripe Checkout / Elements later means changing that
 * link component; the data in data/support.ts stays the same.
 */

const chipBase =
  "inline-flex min-h-[48px] items-center justify-center rounded-sm px-5 py-3 " +
  "text-caption uppercase tracking-[0.10em] transition-colors duration-micro ease-quiet";

function Tier({ tier }: { tier: SupportTier }) {
  const label = formatYen(tier.amount);
  if (!tier.href) {
    return (
      <span
        className={`${chipBase} cursor-not-allowed border border-stone text-stone`}
        aria-disabled="true"
        title="Not available yet"
      >
        {label}
      </span>
    );
  }
  const supportType = tier.cadence === "monthly" ? "monthly" : "one_time";
  return (
    <SupportLink
      href={tier.href}
      supportType={supportType}
      amount={tier.amount}
      className={`${chipBase} border border-stone text-charcoal hover:border-charcoal hover:text-ink`}
    >
      {label}
    </SupportLink>
  );
}

export function SupportOptions({ idSuffix = "" }: { idSuffix?: string }) {
  return (
    <div>
      <div>
        <p className="u-label mb-4">One-time</p>
        <div className="flex flex-wrap gap-3">
          {oneTimeTiers.map((t) => (
            <Tier key={t.id} tier={t} />
          ))}
          {/* Custom amount is a ONE-TIME Stripe payment (customer chooses price),
              so it sits here after ¥100 / ¥300, styled identically to the fixed
              tiers — an ordinary enabled link, never disabled/greyed. */}
          <SupportLink
            href={customSupportHref}
            supportType="one_time"
            amount="custom"
            className={`${chipBase} border border-stone text-charcoal hover:border-charcoal hover:text-ink`}
          >
            Custom amount
          </SupportLink>
        </div>
      </div>

      <div className="mt-10">
        <p className="u-label mb-4">Monthly</p>
        <div className="flex flex-wrap gap-3">
          {monthlyTiers.map((t) => (
            <Tier key={t.id} tier={t} />
          ))}
        </div>
      </div>

      {!supportConfigured ? (
        <p className="mt-8 text-caption leading-relaxed text-muted">
          Support opens here shortly. Payments are handled securely by Stripe.
        </p>
      ) : (
        <p className="mt-8 text-caption leading-relaxed text-muted">
          One-time support from ¥100, including a custom amount, or monthly support from ¥500.
          Payments are handled securely by Stripe; you can stop a monthly contribution at any time.
        </p>
      )}
      {/* idSuffix reserved for future per-instance anchors/analytics. */}
      <span className="hidden" data-support-block={idSuffix} />
    </div>
  );
}
