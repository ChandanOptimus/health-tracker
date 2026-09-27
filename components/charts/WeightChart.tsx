"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { WeeklyProgress } from "@/types/health";

type WeightChartProps = {
  data: WeeklyProgress[];
};

export function WeightChart({
  data,
}: WeightChartProps) {
  const chartData = data.map((item) => ({
    week: `W${item.week}`,
    weight: item.averageWeightKg,
  }));

  const hasData = chartData.some(
    (item) => item.weight !== null,
  );

  if (!hasData) {
    return (
      <div className="flex h-[320px] items-center justify-center">
        <div className="text-center">
          <div className="text-sm font-medium">
            No weight data yet
          </div>

          <div className="mt-1 text-xs muted">
            Your weekly weight trend will appear here
            after your first check-in.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <LineChart
          data={chartData}
          margin={{
            top: 10,
            right: 10,
            left: -20,
            bottom: 0,
          }}
        >
          <CartesianGrid
            stroke="#222a33"
            vertical={false}
          />

          <XAxis
            dataKey="week"
            stroke="#8b96a5"
            tickLine={false}
            axisLine={false}
          />

          <YAxis
            stroke="#8b96a5"
            tickLine={false}
            axisLine={false}
            domain={["auto", "auto"]}
          />

          <Tooltip
            contentStyle={{
              background: "#10151b",
              border:
                "1px solid #222a33",
              borderRadius: 12,
            }}
            labelStyle={{
              color: "#8b96a5",
            }}
            formatter={(value) => [
              value == null
                ? "No entry"
                : `${Number(value).toFixed(1)} kg`,
              "Average weight",
            ]}
          />

          <Line
            type="monotone"
            dataKey="weight"
            stroke="#7dd3fc"
            strokeWidth={3}
            dot={{
              r: 3,
              fill: "#7dd3fc",
            }}
            activeDot={{
              r: 5,
            }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}