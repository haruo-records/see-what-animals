import {
  oneTimeTiers,
  monthlyTiers,
  customSupportHref,
  supportConfigured,
  formatYen,
  type SupportTier,
} from "@/data/support";

/**
 * "Choose your support" — the live support control. Each tier is a Stripe
 * Payment Link (an external URL): configured tiers are real links; unconfigured
 * tiers render quietly disabled so the page is never broken before launch.
 *
 * Server component on purpose — the tiers are plain links, so there is nothing
 * to run on the client. Migrating to Stripe Checkout / Elements later means
 * turning these <a>/disabled elements into a client control here; the data in
 * data/support.ts stays the same.
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
  return (
    <a
      href={tier.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${chipBase} border border-stone text-charcoal hover:border-charcoal hover:text-ink`}
    >
      {label}
    </a>
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
        </div>
      </div>

      <div className="mt-10">
        <p className="u-label mb-4">Monthly</p>
        <div className="flex flex-wrap gap-3">
          {monthlyTiers.map((t) => (
            <Tier key={t.id} tier={t} />
          ))}
        </div>

        <div className="mt-3">
          {customSupportHref ? (
            <a
              href={customSupportHref}
              target="_blank"
              rel="noopener noreferrer"
              className={`${chipBase} border border-stone text-charcoal hover:border-charcoal hover:text-ink`}
            >
              Custom amount
            </a>
          ) : (
            <span
              className={`${chipBase} cursor-not-allowed border border-stone text-stone`}
              aria-disabled="true"
              title="Not available yet"
            >
              Custom amount
            </span>
          )}
        </div>
      </div>

      {!supportConfigured ? (
        <p className="mt-8 text-caption leading-relaxed text-muted">
          Support opens here shortly. Payments are handled securely by Stripe.
        </p>
      ) : (
        <p className="mt-8 text-caption leading-relaxed text-muted">
          One-time from ¥100, or monthly from ¥500. Payments are handled securely by Stripe; you can
          stop a monthly contribution at any time.
        </p>
      )}
      {/* idSuffix reserved for future per-instance anchors/analytics. */}
      <span className="hidden" data-support-block={idSuffix} />
    </div>
  );
}
