import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";

export default function NotFound() {
  return (
    <section className="flex min-h-[60vh] items-center py-24">
      <PageShell width="reading">
        <p className="u-label">Not here</p>
        <h1 className="mt-6 text-h1 font-normal text-ink">Nothing to observe at this address.</h1>
        <p className="mt-8 text-body-lg text-charcoal">
          The page may have moved, or never existed. You can return to this week&apos;s observation.
        </p>
        <div className="mt-10">
          <Link href="/" className="border-b border-stone pb-px text-charcoal hover:border-charcoal hover:text-ink">
            Return to the current observation
          </Link>
        </div>
      </PageShell>
    </section>
  );
}
