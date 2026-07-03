"use client";

import {
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Activity, Gauge, MessageSquare, ShieldCheck } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import type { AnalyticsSnapshot } from "@/types/lumen";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

export function AnalyticsPanel({ analytics }: { analytics: AnalyticsSnapshot }) {
  const metrics = [
    { label: "Total Tests", value: analytics.totalTests, icon: MessageSquare },
    { label: "Avg Groundedness", value: `${analytics.averageGroundedness}%`, icon: Gauge },
    { label: "Flag Rate", value: `${analytics.flagRate}%`, icon: ShieldCheck },
    { label: "Feedback", value: `${analytics.positiveFeedback}/${analytics.negativeFeedback}`, icon: Activity },
  ];

  return (
    <GlassCard strong className="p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-medium leading-none">Quality Analytics</h2>
          <p className="text-sm text-white/55">Updates after each evaluation and feedback action.</p>
        </div>
        <span className="liquid-control rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-white/62">
          Live
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="liquid-glass rounded-lg p-4">
            <metric.icon className="mb-4 h-4 w-4 text-white/46" />
            <p className="text-2xl font-medium leading-none">{metric.value}</p>
            <p className="mt-1 text-xs text-white/50">{metric.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 h-48 rounded-lg bg-black/12 p-2">
        <Line
          data={{
            labels: analytics.groundednessTrend.map((_, index) => `Run ${index + 1}`),
            datasets: [
              {
                data: analytics.groundednessTrend,
                borderColor: "rgba(255,255,255,0.74)",
                pointBackgroundColor: "rgba(255,255,255,0.95)",
                tension: 0.35,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { ticks: { color: "rgba(255,255,255,0.45)" }, grid: { color: "rgba(255,255,255,0.04)" } },
              y: { min: 0, max: 100, ticks: { color: "rgba(255,255,255,0.45)" }, grid: { color: "rgba(255,255,255,0.05)" } },
            },
          }}
        />
      </div>
    </GlassCard>
  );
}
