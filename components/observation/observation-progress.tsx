/** Quiet progress: filled/empty marks, plus text for assistive tech. */
export function ObservationProgress({
  total,
  current,
}: {
  total: number;
  current: number;
}) {
  return (
    <div className="flex items-center gap-2" role="group" aria-label={`Step ${current + 1} of ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={
            "h-1 w-6 rounded-full transition-colors duration-base " +
            (i <= current ? "bg-charcoal" : "bg-plaster")
          }
          aria-hidden="true"
        />
      ))}
      <span className="sr-only">
        Step {current + 1} of {total}
      </span>
    </div>
  );
}
