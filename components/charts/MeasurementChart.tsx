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

type MeasurementPoint = {
  week: number;
  value: number | null;
};

type MeasurementChartProps = {
  data: MeasurementPoint[];
  label: string;
  unit?: string;
};

export function MeasurementChart({
  data,
  label,
  unit = "in",
}: MeasurementChartProps) {
  const hasData = data.some(
    (item) => item.value !== null,
  );

  if (!hasData) {
    return (
      <div className="flex h-[260px] items-center justify-center">
        <div className="text-center">
          <div className="text-sm font-medium">
            No measurement data yet
          </div>

          <div className="mt-1 text-xs muted">
            {label} measurements will appear here.
          </div>
        </div>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    week: `W${item.week}`,
    value: item.value,
  }));

  return (
    <div className="h-[260px] w-full">
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
                : `${Number(value).toFixed(1)} ${unit}`,
              label,
            ]}
          />

          <Line
            type="monotone"
            dataKey="value"
            stroke="#a7f3d0"
            strokeWidth={3}
            dot={{
              r: 3,
              fill: "#a7f3d0",
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