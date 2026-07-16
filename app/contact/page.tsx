import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { ExternalLink } from "@/components/ui/external-link";

export const metadata: Metadata = {
  title: "Contact",
  description: "For exhibitions, press, collaboration, and sales enquiries.",
};

const email = "hello@see-what.example"; // Replace with the real address — see README.

export default function ContactPage() {
  return (
    <section className="py-24">
      <PageShell width="reading">
        <p className="u-label">Contact</p>
        <h1 className="mt-6 text-h1 font-normal text-ink">Get in touch</h1>
        <p className="mt-8 text-body-lg text-charcoal">
          For exhibitions, press, collaboration, and sales, write to us. We read everything and
          reply as we can.
        </p>
        <div className="mt-12">
          <a
            href={`mailto:${email}`}
            className="border-b border-stone pb-px text-h3 text-ink transition-colors hover:border-charcoal"
          >
            {email}
          </a>
        </div>
        <div className="mt-16">
          <p className="u-label mb-4">Elsewhere</p>
          <ExternalLink href="https://haruo-records.github.io/animals-site/" note="opens the animals archive">
            animals archive
          </ExternalLink>
        </div>
      </PageShell>
    </section>
  );
}
