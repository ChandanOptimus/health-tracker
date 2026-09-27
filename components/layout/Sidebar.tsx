import Link from "next/link";
import { Activity, BarChart3, Dumbbell, House, Utensils, ClipboardCheck } from "lucide-react";

const items = [
  ["/", "Dashboard", House],
  ["/progress", "Progress", BarChart3],
  ["/nutrition", "Nutrition", Utensils],
  ["/workout", "Workout", Dumbbell],
  ["/check-in", "Check-in", ClipboardCheck]
] as const;

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="mb-10 flex items-center gap-3 px-2">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10">
          <Activity size={20} />
        </div>
        <div>
          <div className="font-semibold">Health Tracker</div>
          <div className="text-xs muted">Phase 1</div>
        </div>
      </div>

      <nav className="space-y-1">
        {items.map(([href, label, Icon]) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/75 transition hover:bg-white/5 hover:text-white"
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="mt-10 rounded-2xl border border-white/5 bg-white/[.025] p-4">
        <div className="text-xs muted">Current goal</div>
        <div className="mt-2 text-lg font-semibold">68 kg</div>
        <div className="mt-1 text-xs muted">Body recomposition</div>
      </div>
    </aside>
  );
}