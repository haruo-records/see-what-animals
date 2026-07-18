import type { Metadata } from "next";
import type { ReactNode } from "react";
import { siteSettings } from "@/data/site-settings";
import { PageShell } from "@/components/layout/page-shell";
import { Divider } from "@/components/ui/divider";
import { ArrowLink } from "@/components/ui/arrow-link";
import { SupportOptions } from "@/components/support/support-options";
import { ContactEmail } from "@/components/support/contact-email";

export const metadata: Metadata = {
  title: "Support",
  description:
    "See What? is an independent project. Support keeps the observation open — new animals, and new ways of seeing, made together.",
};

/** A quiet section label. */
function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="u-label">{children}</p>;
}
/** A statement paragraph — short, with air around it. */
function Statement({ children }: { children: ReactNode }) {
  return <p className="mt-6 text-body-lg leading-relaxed text-charcoal">{children}</p>;
}

/**
 * SUPPORT — the hub for the whole project, not merely a checkout. Order matters:
 * a support control sits both first and last, with Concept · Profile · Why
 * support in between. Explanation comes *after* the experience — this page is
 * read once someone has already looked.
 *
 *   Support → Choose your support → Concept → Profile → Why support → Choose your support
 */
export default function SupportPage() {
  return (
    <section className="py-16 sm:py-24">
      <PageShell width="reading">
        {/* Header */}
        <Eyebrow>Support</Eyebrow>
        <h1 className="mt-6 text-h1 font-normal leading-tight text-ink">
          Help keep the observation open.
        </h1>
        <p className="mt-6 font-serif text-body-lg italic text-muted">
          See What? is made and kept by one person. Support is how it continues.
        </p>

        {/* Choose your support — first */}
        <div className="mt-12">
          <p className="u-label mb-6">Choose your support</p>
          <SupportOptions idSuffix="top" />
        </div>

        <Divider className="my-16" />

        {/* Concept */}
        <Eyebrow>Concept</Eyebrow>
        <Statement>
          See What? is not a game with a right answer. It is a place to look at an unfamiliar form
          and notice what appears — before a name arrives.
        </Statement>
        <Statement>
          The forms are called animals. They have no fixed identity; what they seem to be changes
          from one person to the next.
        </Statement>
        <Statement>
          See What? is where they are observed together. animals is where they are kept.
        </Statement>

        <Divider className="my-16" />

        {/* Profile */}
        <Eyebrow>Profile</Eyebrow>
        <h2 className="mt-6 text-h2 font-normal text-ink">{siteSettings.creatorName}</h2>
        <Statement>
          {siteSettings.creatorName} makes the animals and builds See What? — drawing the forms,
          writing the questions, and keeping the record of how they are seen. One observer among
          many, not the one who decides what a thing is.
        </Statement>

        <div className="mt-10">
          <p className="u-label mb-4">Continue exploring</p>
          <ul className="flex flex-col gap-4">
            <li>
              <ArrowLink href="/">See What?</ArrowLink>
              <span className="ml-2 text-caption text-muted">the current observation</span>
            </li>
            <li>
              <ArrowLink
                href={siteSettings.animalsArchiveUrl}
                external
                note="opens the animals archive"
              >
                animals archive
              </ArrowLink>
              <span className="ml-2 text-caption text-muted">where the works are kept</span>
            </li>
            <li>
              <ArrowLink href={siteSettings.noteUrl} external note="opens note, in Japanese">
                note
              </ArrowLink>
              <span className="ml-2 text-caption text-muted">Japanese — making, thinking, development</span>
            </li>
            <li>
              <ArrowLink href={siteSettings.substackUrl} external note="opens Substack, in English">
                Substack
              </ArrowLink>
              <span className="ml-2 text-caption text-muted">English development notes</span>
            </li>
          </ul>
        </div>

        <Divider className="my-16" />

        {/* Why support? */}
        <Eyebrow>Why support?</Eyebrow>
        <Statement>
          Support goes toward making new animals, developing See What?, and building new perception
          games.
        </Statement>
        <Statement>
          It is not simply applauding finished work. It is making new ways of observing — together.
        </Statement>

        {/* Choose your support — last */}
        <div className="mt-12">
          <p className="u-label mb-6">Choose your support</p>
          <SupportOptions idSuffix="bottom" />
        </div>

        {/* Contact — quiet, page-bottom, minimal. Not a primary path; just a
            small muted line after everything else, with generous space above. */}
        <div className="mt-24">
          <ContactEmail />
        </div>
      </PageShell>
    </section>
  );
}
