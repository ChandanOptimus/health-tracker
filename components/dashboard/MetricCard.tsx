import { ReactNode } from "react";

type MetricCardProps = {
  label: string;
  value: string;
  sub?: string;
  icon?: ReactNode;
};

export function MetricCard({
  label,
  value,
  sub,
  icon,
}: MetricCardProps) {
  return (
    <div className="panel metric">
      <div className="flex items-center justify-between">
        <span className="text-sm muted">
          {label}
        </span>

        {icon}
      </div>

      <div className="mt-4 text-2xl font-semibold tracking-tight">
        {value}
      </div>

      {sub && (
        <div className="mt-1 text-xs muted">
          {sub}
        </div>
      )}
    </div>
  );
}