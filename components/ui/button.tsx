import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Variant = "primary" | "quiet" | "ghost";

const base =
  "inline-flex items-center justify-center min-h-[44px] px-6 py-3 rounded-sm " +
  "text-caption uppercase tracking-[0.14em] transition-colors duration-micro ease-quiet " +
  "focus-visible:outline-none disabled:opacity-60 disabled:pointer-events-none select-none";

const variants: Record<Variant, string> = {
  primary: "bg-charcoal text-paper hover:bg-ink",
  quiet: "border border-stone text-charcoal hover:border-charcoal bg-transparent",
  ghost: "text-charcoal hover:text-ink",
};

type CommonProps = { variant?: Variant; children: ReactNode; className?: string };

export function Button({
  variant = "primary",
  className = "",
  children,
  ...rest
}: CommonProps & ComponentPropsWithoutRef<"button">) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  className = "",
  children,
  href,
  ...rest
}: CommonProps & { href: string } & Omit<ComponentPropsWithoutRef<"a">, "href">) {
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </Link>
  );
}
