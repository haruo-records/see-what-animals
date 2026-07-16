import type { Metadata } from "next";
import { siteSettings } from "@/data/site-settings";
import { PageShell } from "@/components/layout/page-shell";
import { Divider } from "@/components/ui/divider";
import { ExternalLink } from "@/components/ui/external-link";
import { TextLink } from "@/components/ui/text-link";

export const metadata: Metadata = {
  title: "About",
  description:
    "See What? is a project for looking before naming. animals are observed, interpreted, and gradually described by many people.",
};

/** Short paragraphs, wide margins. Never a wall of text. */
function Line({ children }: { children: React.ReactNode }) {
  return <p className="mt-8 text-body-lg leading-relaxed text-charcoal">{children}</p>;
}

export default function AboutPage() {
  return (
    <section className="py-24">
      <PageShell width="reading">
        <p className="u-label">About</p>
        <h1 className="mt-6 text-h1 font-normal text-ink">
          A project for looking before naming.
        </h1>

        <Line>
          See What? is a place to observe. Not to test what you know, and not to be told what a
          thing is — only to look, and to notice.
        </Line>
        <Line>
          The things you observe are called animals. They are not characters with fixed meanings.
          What they seem to be, where they seem to live, what they seem to be doing — all of it
          shifts from one observer to the next.
        </Line>
        <Line>
          The creator does not decide their meaning. The creator is one observer among many. Over
          time, many people&apos;s answers gather into a shared, unfinished field note.
        </Line>
        <Line>Observation is not preparation for the experience. Observation is the experience.</Line>

        <Divider className="my-16" />

        <p className="u-label">日本語</p>
        <p className="mt-8 text-body-lg leading-relaxed text-charcoal" lang="ja">
          See What? は、名前を付ける前に見るためのプロジェクトです。animals には、あらかじめ決められた意味がありません。多くの人に観察され、異なる見方が重なり、少しずつ記録されていきます。作者もまた、その観察者の一人です。
        </p>

        <Divider className="my-16" />

        <p className="u-label">Where the works live</p>
        <Line>
          animals is the place they exist. See What? is where they are observed together. The full,
          permanent archive of the works lives elsewhere.
        </Line>
        <div className="mt-8 flex flex-col gap-4">
          <ExternalLink href={siteSettings.animalsArchiveUrl} note="opens the animals archive">
            Visit the animals archive
          </ExternalLink>
          <TextLink href="/contact">For exhibitions, press, and collaboration — get in touch</TextLink>
        </div>
      </PageShell>
    </section>
  );
}
