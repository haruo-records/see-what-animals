/**
 * ArchiveEmpty — the Archive before anything has been published.
 *
 * Not an error or an "under construction" screen: a quiet, still room that is
 * simply waiting for the first observation to close. No icon, no illustration,
 * no border — just a small line of type sitting near the centre, in the same
 * measure and rhythm as the rest of the site, so the emptiness reads as
 * intentional and the page as a place observations will gather in.
 */
export function ArchiveEmpty() {
  return (
    <div className="flex min-h-[46vh] flex-col items-center justify-center text-center">
      <p className="text-body-lg text-charcoal">Nothing here yet.</p>
      <p className="mt-3 max-w-reading text-body text-muted">
        Observations will gather here, one form at a time.
      </p>
    </div>
  );
}
