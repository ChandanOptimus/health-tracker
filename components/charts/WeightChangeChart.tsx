 "use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";
import { WeeklyProgress } from "@/types/health";

export function WeightChangeChart({ data }: { data: WeeklyProgress[] }) {
  const chartData = data.map((item) => ({
    week: `W${item.week}`,
    change: item.weightChangeKg
  }));

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="#222a33" vertical={false} />
          <XAxis dataKey="week" stroke="#8b96a5" tickLine={false} axisLine={false} />
          <YAxis stroke="#8b96a5" tickLine={false} axisLine={false} />
          <ReferenceLine y={0} stroke="#48515c" />
          <Tooltip
            contentStyle={{
              background: "#10151b",
              border: "1px solid #222a33",
              borderRadius: 12
            }}
            formatter={(value) => [
              value == null ? "No entry" : `${Number(value).toFixed(2)} kg`,
              "Weekly change"
            ]}
          />
          <Bar dataKey="change" fill="#a7f3d0" radius={[5, 5, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}