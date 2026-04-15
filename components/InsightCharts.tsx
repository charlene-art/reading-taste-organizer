"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Row = { name: string; count: number };

export function ToneBarChart({ data }: { data: Row[] }) {
  const top = data.slice(0, 12);
  if (top.length === 0) {
    return <p className="text-sm text-[var(--muted)]">No tone data yet.</p>;
  }
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={top} layout="vertical" margin={{ left: 8, right: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2f3336" />
          <XAxis type="number" stroke="#8b98a5" />
          <YAxis
            type="category"
            dataKey="name"
            width={120}
            stroke="#8b98a5"
            tick={{ fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{
              background: "#16181c",
              border: "1px solid #2f3336",
            }}
          />
          <Bar dataKey="count" fill="#1d9bf0" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PlotPatternBarChart({ data }: { data: Row[] }) {
  const top = data.slice(0, 12);
  if (top.length === 0) {
    return (
      <p className="text-sm text-[var(--muted)]">No plot pattern data yet.</p>
    );
  }
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={top} layout="vertical" margin={{ left: 8, right: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2f3336" />
          <XAxis type="number" stroke="#8b98a5" />
          <YAxis
            type="category"
            dataKey="name"
            width={140}
            stroke="#8b98a5"
            tick={{ fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{
              background: "#16181c",
              border: "1px solid #2f3336",
            }}
          />
          <Bar dataKey="count" fill="#7c3aed" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
