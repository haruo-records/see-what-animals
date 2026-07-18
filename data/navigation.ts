/**
 * NAVIGATION as data. The shell reads these lists — nothing is hardcoded in the
 * header / left drawer / footer. English-only.
 *
 * See What? is an **Observation Platform**, not a single game. The left drawer is
 * the primary way around it: Play is a list of *observation methods*, not a list
 * of levels. animals is the centre of the platform; other perception games are
 * added to Play over time (Find the Different, Grouping, Pattern, Near / Far,
 * Attention, Sorting …), and the structure is meant to allow external developers
 * to add their own later.
 *
 * Header right holds only Support (always present, like a quiet Subscribe — part
 * of the brand, never an ad).
 */
export type NavItem = {
  label: string;
  href: string;
  /** External links (e.g. animals archive) get a quiet external marker. */
  external?: boolean;
  enabled: boolean;
  /** A not-yet-open destination — shown, quiet, and non-clickable (e.g. Lab). */
  comingSoon?: boolean;
  /** Optional one-line hint under the item in the drawer. */
  note?: string;
};

/**
 * PLAY — observation methods. Current Observation is the entrance (`/`); Archive
 * is the record of past observations; Lab is reserved for what comes next.
 */
export const playNav: NavItem[] = [
  { label: "Current Observation", href: "/", enabled: true, note: "the form open now" },
  { label: "Archive", href: "/observations", enabled: true, note: "how past forms were seen" },
  { label: "Lab", href: "/lab", enabled: false, comingSoon: true, note: "new ways of observing" },
];

/** Shop + Support sit below Play, separated by a rule. */
export const utilityNav: NavItem[] = [
  { label: "Shop", href: "/shop", enabled: true },
  { label: "Support", href: "/support", enabled: true },
];

/** Legal, quiet, at the very bottom of the drawer. */
export const legalNav: NavItem[] = [
  { label: "Privacy", href: "/privacy", enabled: true },
];

/** Footer-only utility. The archive is where the works themselves live. */
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
