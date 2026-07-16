import { PageShell } from "@/components/layout/page-shell";

export default function Loading() {
  return (
    <section className="flex min-h-[60vh] items-center py-24" aria-busy="true" aria-live="polite">
      <PageShell width="reading">
        <p className="u-label motion-safe:animate-breathe">Observing…</p>
      </PageShell>
    </section>
  );
}
