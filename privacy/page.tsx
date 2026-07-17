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
          You can observe without an account, and without any sign-in. When you share what you see,
          your answer is recorded anonymously so the project can show how differently people saw the
          same form.
        </P>
        <P>
          With each answer we may record: which question and which option you chose, the country you
          are accessing from (estimated from your IP address on our server — your exact location is
          never requested and your IP address is never stored), your browser language, a coarse
          device type (mobile, tablet, or desktop), how you arrived (a referring site or campaign
          tag), an anonymous session identifier, the game and question version, and the time. We do
          not collect your name, email, age, gender, or precise location, and we do not build a
          fingerprint or track you across other sites.
        </P>
        <P>
          This data is used only in aggregate — for statistics, to improve the project, and as
          material for the work itself — never to identify anyone. Country breakdowns are shown only
          once enough people from a country have answered.
        </P>

        <H>Analytics</H>
        <P>
          If analytics is enabled, aggregate, non-identifying usage events may also be collected to
          understand how the project is used. Personal identifiers and full referrer URLs are never
          sent to analytics. This is disabled until a measurement id is configured.
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
