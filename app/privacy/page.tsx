import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How See What? handles observations and data.",
};

function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-6 text-body leading-relaxed text-charcoal">{children}</p>;
}
function H({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-16 text-h3 font-normal text-ink">{children}</h2>;
}

export default function PrivacyPage() {
  return (
    <section className="py-24">
      <PageShell width="reading">
        <p className="u-label">Privacy</p>
        <h1 className="mt-6 text-h1 font-normal text-ink">Privacy</h1>

        <H>Observations</H>
        <P>
          You can observe without an account. In this version, your answers to an observation are
          stored only in your own browser (localStorage), so you are not asked the same form twice
          on the same device. They are not sent to a server.
        </P>

        <H>Analytics</H>
        <P>
          If analytics is enabled, aggregate, non-identifying usage events may be collected to
          understand how the project is used. This is disabled until a measurement id is configured.
        </P>

        <H>Contact</H>
        <P>
          If you write to us, we keep your message only to reply. For questions about this page,
          use the contact address.
        </P>

        <P>
          <span className="text-muted">
            This is a starting template. Replace with your reviewed policy before launch — see
            README.
          </span>
        </P>
      </PageShell>
    </section>
  );
}
