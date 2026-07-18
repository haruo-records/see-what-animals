import { PageShell } from "@/components/layout/page-shell";
import { Logo } from "@/components/brand/logo";

export default function Loading() {
  return (
    <section className="flex min-h-[60vh] items-center py-24" aria-busy="true" aria-live="polite">
      <PageShell width="reading">
        {/* The mark breathes rather than spins — nothing here should feel urgent. */}
        <Logo size="loading" className="text-charcoal motion-safe:animate-breathe" />
        <p className="u-label mt-6">Observing…</p>
      </PageShell>
    </section>
  );
}
