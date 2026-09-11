type StatRingProps = {
  percent: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
};

export default function StatRing({
  percent,
  size = 40,
  strokeWidth = 3.5,
  className = "text-primary",
}: StatRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(percent, 100));
  const offset = circumference - (clamped / 100) * circumference;
  const center = size / 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="shrink-0"
      aria-hidden="true"
    >
      {/* Background track circle */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-border/60 dark:text-border/40"
      />
      {/* Progress ring fill */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${center} ${center})`}
        className={`transition-[stroke-dashoffset] duration-700 ease-out ${className}`}
      />
    </svg>
  );
}