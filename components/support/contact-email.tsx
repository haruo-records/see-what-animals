"use client";

import { useEffect, useState } from "react";

/**
 * CONTACT — the single, quiet contact point at the foot of the Support page.
 * Deliberately understated: not a heading, not a button, not a card; just a small
 * muted line for the few who look for it.
 *
 * The address is assembled from character codes at runtime, so the literal
 * "…@gmail.com" string never appears in the HTML source or the JS bundle as
 * plain text (a light anti-scrape measure). It renders only after mount, so it is
 * absent from the server HTML too. No dangerouslySetInnerHTML; nothing untrusted
 * is interpolated, so there is no XSS surface.
 */
const CODES = [
  104, 97, 114, 109, 111, 110, 101, 101, 114, 46, 105, 110, 102, 111, 64, 103, 109, 97, 105, 108,
  46, 99, 111, 109,
]; // harmoneer.info (at) gmail (dot) com

export function ContactEmail() {
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    setAddress(String.fromCharCode(...CODES));
  }, []);

  return (
    <p className="text-caption text-muted">
      Contact:{" "}
      {address ? (
        <a
          href={`mailto:${address}`}
          className="border-b border-stone pb-px text-muted transition-colors duration-micro hover:border-charcoal hover:text-charcoal"
        >
          {address}
        </a>
      ) : null}
    </p>
  );
}
