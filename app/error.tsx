"use client";

import { useEffect } from "react";
import { PageShell } from "@/components/layout/page-shell";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <section className="flex min-h-[60vh] items-center py-24">
      <PageShell width="reading">
        <p className="u-label">Something interrupted</p>
        <h1 className="mt-6 text-h1 font-normal text-ink">The view didn&apos;t load.</h1>
        <p className="mt-8 text-body-lg text-charcoal">
          A quiet error stopped this page. Try again, and if it persists, come back later.
        </p>
        <button
          onClick={reset}
          className="mt-10 min-h-[44px] rounded-sm border border-stone px-6 py-3 text-caption uppercase tracking-[0.14em] text-charcoal hover:border-charcoal"
        >
          Try again
        </button>
      </PageShell>
    </section>
  );
}
