import type { ReactNode } from "react";

type SectionHeadingProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

export default function SectionHeading({
  title,
  subtitle,
  action,
}: SectionHeadingProps) {
  return (
    <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
          {title}
        </h2>

        {subtitle && (
          <p className="text-xs text-muted-foreground sm:text-sm">
            {subtitle}
          </p>
        )}
      </div>

      {action && <div className="mt-2 sm:mt-0">{action}</div>}
    </div>
  );
}