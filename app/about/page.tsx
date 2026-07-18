import type { Metadata } from "next";
import type { ReactNode } from "react";
import { siteSettings } from "@/data/site-settings";
import { PageShell } from "@/components/layout/page-shell";
import { Divider } from "@/components/ui/divider";
import { ArrowLink } from "@/components/ui/arrow-link";

export const metadata: Metadata = {
  title: "About",
  description:
    "See What? is a project for looking before naming. The forms it holds — called animals — are observed together, and seen differently by everyone who looks.",
};

/** A quiet section label. */
function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="u-label">{children}</p>;
}

/** A statement paragraph — short, with air around it. */
function Statement({ children }: { children: ReactNode }) {
  return <p className="mt-8 text-body-lg leading-relaxed text-charcoal">{children}</p>;
}

export default function AboutPage() {
  return (
    <section className="py-24 sm:py-32">
      <PageShell width="reading">
        <Eyebrow>About</Eyebrow>
        <h1 className="mt-6 text-h1 font-normal leading-tight text-ink">
          A project for looking before naming.
        </h1>

        <Statement>See What? is a place to observe.</Statement>
        <Statement>
          It is not a test of what you know, and it does not tell you what a thing is. It simply
          asks you to look — and notice what appears.
        </Statement>
        <Statement>The forms you observe are called animals.</Statement>
        <Statement>
          They are not characters with fixed names, stories, or meanings. What they seem to be,
          where they seem to live, and what they seem to be doing may change from one observer to
          another.
        </Statement>
        <Statement>
          The creator does not decide the correct interpretation. The creator is also one observer
          among many.
        </Statement>
        <Statement>
          Each response becomes part of a shared record of how the same form can be seen
          differently.
        </Statement>
        <Statement>Observation is not preparation for the experience.</Statement>
        <Statement>Observation is the experience.</Statement>

        <Divider className="my-16" />

        <Eyebrow>Where the works live</Eyebrow>
        <Statement>animals is where the forms exist.</Statement>
        <Statement>See What? is where they are observed together.</Statement>
        <Statement>The complete archive of works is preserved in the animals archive.</Statement>
        <div className="mt-8">
          <ArrowLink href={siteSettings.animalsArchiveUrl} external note="opens the animals archive">
            Visit the animals archive
          </ArrowLink>
        </div>

        <Divider className="my-16" />

        <Eyebrow>Follow the project</Eyebrow>
        <Statement>See What? is an independent project.</Statement>
        <Statement>
          Notes on its development, experiments, new works, and the ideas behind them are shared
          through:
        </Statement>
        <ul className="mt-6 flex flex-col gap-3">
          <li className="text-body text-muted">
            <ArrowLink href={siteSettings.noteUrl} external note="opens note, in Japanese">
              note
            </ArrowLink>
            <span className="ml-2 text-caption text-muted">Japanese</span>
          </li>
          <li className="text-body text-muted">
            <ArrowLink href={siteSettings.substackUrl} external note="opens Substack, in English">
              Substack
            </ArrowLink>
            <span className="ml-2 text-caption text-muted">English</span>
          </li>
        </ul>
        <p className="mt-6 text-caption leading-relaxed text-muted">
          Following the project is also a way to support its continued development.
        </p>

        <Divider className="my-16" />

        <Eyebrow>Contact</Eyebrow>
        <Statement>For exhibitions, press, collaborations, or other enquiries:</Statement>
        <div className="mt-8">
          <ArrowLink href="/contact">Get in touch</ArrowLink>
        </div>
      </PageShell>
    </section>
  );
}
