/**
 * NAVIGATION as data. The shell reads these lists — nothing is hardcoded in the
 * header/footer/menu.
 *
 * DELIBERATELY SMALL. Fewer choices is part of the brand. The entrance offers
 * only Play / About / Shop. Everything else (Field Notes, previous observations)
 * is reached from the Home page or after playing — not from a nav bar. Contact
 * and Privacy live in the footer only.
 */
export type NavItem = {
  label: { en: string; ja: string };
  href: string;
  /** External links (e.g. animals archive) get a quiet external marker. */
  external?: boolean;
  enabled: boolean;
};

export const primaryNav: NavItem[] = [
  { label: { en: "About", ja: "アバウト" }, href: "/about", enabled: true },
  { label: { en: "Shop", ja: "ショップ" }, href: "/shop", enabled: true },
];

/** Footer-only. Contact + Privacy are utility; the archive is where works live. */
export const footerNav: NavItem[] = [
  {
    label: { en: "animals Archive", ja: "animals アーカイブ" },
    href: "https://haruo-records.github.io/animals-site/",
    external: true,
    enabled: true,
  },
  { label: { en: "Contact", ja: "お問い合わせ" }, href: "/contact", enabled: true },
  { label: { en: "Privacy", ja: "プライバシー" }, href: "/privacy", enabled: true },
];
