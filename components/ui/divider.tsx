/** A single hairline in Stone. Used sparingly. */
export function Divider({ className = "" }: { className?: string }) {
  return <hr className={`border-0 border-t border-stone ${className}`} />;
}
