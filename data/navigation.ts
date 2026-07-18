/**
 * NAVIGATION as data. The shell reads these lists — nothing is hardcoded in the
 * header/footer/menu. English-only.
 *
 * DELIBERATELY SMALL. The entrance offers only About / Shop (the wordmark is the
 * game). Contact, Privacy, and the archive live in the footer.
 */
export type NavItem = {
  label: string;
  href: string;
  /** External links (e.g. animals archive) get a quiet external marker. */
  external?: boolean;
  enabled: boolean;
};

export const primaryNav: NavItem[] = [
  { label: "About", href: "/about", enabled: true },
  { label: "Shop", href: "/shop", enabled: true },
];

/** Footer-only. Contact + Privacy are utility; the archive is where works live. */
export const footerNav: NavItem[] = [
  {
    label: "animals Archive",
    href: "https://haruo-records.github.io/animals-site/",
    external: true,
    enabled: true,
  },
  { label: "Contact", href: "/contact", enabled: true },
  { label: "Privacy", href: "/privacy", enabled: true },
];
