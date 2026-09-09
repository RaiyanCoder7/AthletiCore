type StatBarProps = {
  percent: number;
  className?: string;
};

export default function StatBar({
  percent,
  className = "bg-primary",
}: StatBarProps) {
  const clamped = Math.max(0, Math.min(percent, 100));

  return (
    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={`h-full rounded-full transition-all ${className}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
