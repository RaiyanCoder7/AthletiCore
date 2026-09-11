type StatBarProps = {
  percent: number;
  className?: string;
  trackClassName?: string;
};

export default function StatBar({
  percent,
  className = "bg-primary",
  trackClassName = "bg-muted/70 dark:bg-muted/40",
}: StatBarProps) {
  const clamped = Math.max(0, Math.min(percent, 100));

  return (
    <div
      className={`mt-3 h-1.5 w-full overflow-hidden rounded-full border border-border/40 ${trackClassName}`}
    >
      <div
        className={`h-full rounded-full transition-all duration-500 ease-out ${className}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}