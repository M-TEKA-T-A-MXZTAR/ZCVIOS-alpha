"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";

type Monthly = {
  monthsActive: number;
  totalRevenue: number;
  totalHours: number;
  averageEhr: number;
  slope: number;
  trend: Array<{ period: string; revenue: number; ehr: number }>;
  notes: string[];
};

export default function MonthlyReportPage() {
  const [report, setReport] = useState<Monthly | null>(null);

  useEffect(() => {
    fetch("/rpc/reports/monthly")
      .then((res) => {
        if (!res.ok) throw new Error("failed");
        return res.json();
      })
      .then((data) => setReport(data))
      .catch(() => toast.error("Unable to load monthly report."));
  }, []);

  return (
    <AppShell>
      <Card testId="monthly-report-header-card">
        <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Monthly report</p>
        <h2 className="font-heading mt-2 text-3xl font-black" data-testid="monthly-report-heading">
          Active for {report?.monthsActive ?? 0} months
        </h2>
      </Card>

      {report && (
        <>
          <section className="grid gap-6 md:grid-cols-3" data-testid="monthly-report-metrics-grid">
            <Card testId="monthly-report-total-revenue-card">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Total revenue</p>
              <p className="font-heading mt-2 text-3xl font-black" data-testid="monthly-report-total-revenue-value">
                ${report.totalRevenue.toFixed(2)}
              </p>
            </Card>
            <Card testId="monthly-report-total-hours-card">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Total hours</p>
              <p className="font-heading mt-2 text-3xl font-black" data-testid="monthly-report-total-hours-value">
                {report.totalHours}
              </p>
            </Card>
            <Card testId="monthly-report-average-ehr-card">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Average EHR</p>
              <p className="font-heading mt-2 text-3xl font-black" data-testid="monthly-report-average-ehr-value">
                ${report.averageEhr}/h
              </p>
            </Card>
          </section>

          <Card testId="monthly-report-chart-card">
            <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Trend summary</p>
            <div className="mt-4 h-72" data-testid="monthly-report-trend-chart">
              <ResponsiveContainer width="100%" height="100%" minWidth={320} minHeight={240}>
                <LineChart data={report.trend}>
                  <XAxis dataKey="period" stroke="#a1a1aa" />
                  <YAxis stroke="#a1a1aa" />
                  <Tooltip />
                  <Line dataKey="ehr" stroke="#fafafa" strokeWidth={2} dot={false} />
                  <Line dataKey="revenue" stroke="#22c55e" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card testId="monthly-report-notes-card">
            <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Neutral improvement notes</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-300" data-testid="monthly-report-notes-list">
              {report.notes.map((note) => (
                <li key={note} data-testid="monthly-report-note-item">{note}</li>
              ))}
            </ul>
          </Card>
        </>
      )}
    </AppShell>
  );
}
