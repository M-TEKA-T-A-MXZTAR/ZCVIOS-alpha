"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Report = {
  revenue: number;
  weeklySignals: {
    trafficSessions: number | null;
    leadsGenerated: number | null;
    closedSales: number | null;
    churnedCustomers: number | null;
    grossMarginPct: number | null;
  };
  leverEhr: number;
  totalEhr: number;
  fullLoggingEnabled: boolean;
  slope: number;
  targetRange: { min: number; max: number; guidance: string };
  momentum: string;
  stage: string;
  projection: { low: number; high: number };
  lever: string;
  bottleneckNote: string;
  growthStatus: string;
  executionStatus: string;
  driftStatus: string;
  allocationAdjustment: string;
  chartData: Array<{ week: string; revenue: number; ehr: number }>;
};

type WeeklyReviewPacket = {
  report: Report;
  missionSnapshot: {
    date: string;
    lever: string;
    primaryTask: string;
    supportTask: string | null;
    doNotDoReminder: string;
    recommendedMinutes: number;
    successDefinition: string;
    source: string;
  } | null;
  overrideHistory: Array<{
    weekStart: string;
    selectedLever: string;
    overrideReason: string | null;
    updatedAt: string;
  }>;
};

const levers = [
  "Distribution",
  "Conversion",
  "Pricing",
  "Traffic",
  "Retention",
  "AssetBuild",
  "Automation",
  "Authority",
] as const;

export default function WeeklyReportPage() {
  const [report, setReport] = useState<Report | null>(null);
  const [packet, setPacket] = useState<WeeklyReviewPacket | null>(null);
  const [overrideLever, setOverrideLever] = useState<(typeof levers)[number]>("Distribution");
  const [reason, setReason] = useState("");

  const load = async () => {
    const response = await fetch("/rpc/reports/weekly-review");
    if (!response.ok) {
      toast.error("Unable to load weekly report.");
      return;
    }
    const payload: WeeklyReviewPacket = await response.json();
    setPacket(payload);
    setReport(payload.report);
    setOverrideLever(payload.report.lever as (typeof levers)[number]);
  };

  useEffect(() => {
    const run = async () => {
      await load();
    };

    run();
  }, []);

  const submitOverride = async () => {
    const response = await fetch("/rpc/lever-override", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selectedLever: overrideLever, reason }),
    });

    if (!response.ok) {
      toast.error("Unable to override lever.");
      return;
    }

    toast.success("Manual override recorded.");
    await load();
  };

  const downloadWeeklyReviewPdf = async () => {
    try {
      const response = await fetch("/rpc/reports/weekly-review");
      if (!response.ok) {
        toast.error("Unable to prepare PDF.");
        return;
      }

      const payload: WeeklyReviewPacket = await response.json();
      const [{ jsPDF }, autoTableModule] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
      const autoTable = (autoTableModule.default ?? autoTableModule) as (doc: unknown, options: unknown) => void;
      const doc = new jsPDF({ unit: "pt", format: "a4" });

      doc.setFontSize(16);
      doc.text("ZC-VIOS Weekly Review", 40, 50);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 68);

      autoTable(doc, {
        startY: 86,
        head: [["Metric", "Value"]],
        body: [
          ["Revenue", `$${payload.report.revenue.toFixed(2)}`],
          ["Weekly Lever", payload.report.lever],
          ["Lever Progress", `$${payload.report.leverEhr}/h`],
          ["Total Progress", `$${payload.report.totalEhr}/h`],
          ["4-week slope", `${payload.report.slope}%`],
          ["Target range", `${payload.report.targetRange.min}% to ${payload.report.targetRange.max}%`],
          ["Momentum", payload.report.momentum],
          ["Stage", payload.report.stage],
          ["Projection (conditional)", `$${payload.report.projection.low} - $${payload.report.projection.high} progress metric`],
          ["Traffic sessions", `${payload.report.weeklySignals.trafficSessions ?? "-"}`],
          ["Leads generated", `${payload.report.weeklySignals.leadsGenerated ?? "-"}`],
          ["Closed sales", `${payload.report.weeklySignals.closedSales ?? "-"}`],
          ["Churned customers", `${payload.report.weeklySignals.churnedCustomers ?? "-"}`],
          ["Gross margin %", `${payload.report.weeklySignals.grossMarginPct ?? "-"}`],
        ],
        styles: { fillColor: [255, 255, 255], textColor: [20, 20, 20], lineColor: [220, 220, 220] },
        headStyles: { fillColor: [245, 245, 245], textColor: [10, 10, 10] },
      });

      const mission = payload.missionSnapshot;
      const missionY = (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 360;
      doc.setFontSize(12);
      doc.text("Mission Snapshot", 40, missionY + 28);
      doc.setFontSize(10);

      if (mission) {
        autoTable(doc, {
          startY: missionY + 36,
          head: [["Field", "Value"]],
          body: [
            ["Date", new Date(mission.date).toLocaleDateString()],
            ["Lever", mission.lever],
            ["Primary Task", mission.primaryTask],
            ["Support Task", mission.supportTask ?? "-"],
            ["Do Not Do", mission.doNotDoReminder],
            ["Recommended Minutes", `${mission.recommendedMinutes}`],
            ["Success Definition", mission.successDefinition],
            ["Source", mission.source],
          ],
          styles: { fillColor: [255, 255, 255], textColor: [20, 20, 20], lineColor: [220, 220, 220] },
          headStyles: { fillColor: [245, 245, 245], textColor: [10, 10, 10] },
        });
      } else {
        doc.text("No mission found for this week.", 40, missionY + 48);
      }

      const overrideY = (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? missionY + 80;
      doc.setFontSize(12);
      doc.text("Lever Override History", 40, overrideY + 28);

      autoTable(doc, {
        startY: overrideY + 36,
        head: [["Week", "Lever", "Reason", "Updated"]],
        body:
          payload.overrideHistory.length > 0
            ? payload.overrideHistory.map((item) => [
                new Date(item.weekStart).toLocaleDateString(),
                item.selectedLever,
                item.overrideReason ?? "Manual override",
                new Date(item.updatedAt).toLocaleDateString(),
              ])
            : [["-", "-", "No overrides recorded", "-"]],
        styles: { fillColor: [255, 255, 255], textColor: [20, 20, 20], lineColor: [220, 220, 220] },
        headStyles: { fillColor: [245, 245, 245], textColor: [10, 10, 10] },
      });

      doc.save(`zcvios-weekly-review-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success("Weekly review PDF downloaded.");
    } catch {
      toast.error("Unable to generate weekly review PDF.");
    }
  };

  return (
    <AppShell>
      <Card testId="weekly-report-header-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Weekly report</p>
            <h2 className="font-heading mt-2 text-3xl font-black" data-testid="weekly-report-heading">
              Weekly Performance Summary
            </h2>
          </div>
          <Button onClick={downloadWeeklyReviewPdf} data-testid="weekly-report-download-pdf-button">
            Download weekly review PDF
          </Button>
        </div>
      </Card>

      {report && (
        <>
          <section className="grid gap-6 md:grid-cols-3" data-testid="weekly-report-metrics-grid">
            <Card testId="weekly-report-revenue-card">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Revenue</p>
              <p className="font-heading mt-2 text-3xl font-black" data-testid="weekly-report-revenue-value">
                ${report.revenue.toFixed(2)}
              </p>
            </Card>
            <Card testId="weekly-report-lever-ehr-card">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Lever Progress</p>
              <p className="font-heading mt-2 text-3xl font-black" data-testid="weekly-report-lever-ehr-value">
                ${report.leverEhr}/h
              </p>
            </Card>
            <Card testId="weekly-report-slope-card">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">4-week slope</p>
              <p className="font-heading mt-2 text-3xl font-black" data-testid="weekly-report-slope-value">
                {report.slope}%
              </p>
            </Card>
          </section>

          <Card testId="weekly-report-chart-card">
            <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Trend chart</p>
            <div className="mt-4 h-72" data-testid="weekly-report-trend-chart">
              <ResponsiveContainer width="100%" height="100%" minWidth={320} minHeight={240}>
                <LineChart data={report.chartData}>
                  <XAxis dataKey="week" stroke="#a1a1aa" />
                  <YAxis stroke="#a1a1aa" />
                  <Tooltip />
                  <Line dataKey="ehr" stroke="#fafafa" strokeWidth={2} dot={false} />
                  <Line dataKey="revenue" stroke="#22c55e" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="grid gap-4 md:grid-cols-2" testId="weekly-report-summary-card">
            <div data-testid="weekly-report-stage-row">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Stage</p>
              <p className="mt-1 text-lg" data-testid="weekly-report-stage-value">{report.stage}</p>
            </div>
            <div data-testid="weekly-report-target-row">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Target range</p>
              <p className="mt-1 text-lg" data-testid="weekly-report-target-value">
                {report.targetRange.min}% to {report.targetRange.max}%
              </p>
            </div>
            <div data-testid="weekly-report-momentum-row">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Momentum status</p>
              <p className="mt-1 text-lg" data-testid="weekly-report-momentum-value">{report.momentum}</p>
            </div>
            <div data-testid="weekly-report-projection-row">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Projection (conditional)</p>
              <p className="mt-1 text-lg" data-testid="weekly-report-projection-value">
                ${report.projection.low} - ${report.projection.high} progress metric
              </p>
            </div>
            <div className="md:col-span-2" data-testid="weekly-report-bottleneck-row">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Bottleneck note</p>
              <p className="mt-1 text-sm text-zinc-300" data-testid="weekly-report-bottleneck-value">{report.bottleneckNote}</p>
            </div>
            <div data-testid="weekly-report-traffic-row">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Traffic sessions</p>
              <p className="mt-1 text-lg" data-testid="weekly-report-traffic-value">{report.weeklySignals.trafficSessions ?? "-"}</p>
            </div>
            <div data-testid="weekly-report-leads-row">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Leads generated</p>
              <p className="mt-1 text-lg" data-testid="weekly-report-leads-value">{report.weeklySignals.leadsGenerated ?? "-"}</p>
            </div>
            <div data-testid="weekly-report-sales-row">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Closed sales</p>
              <p className="mt-1 text-lg" data-testid="weekly-report-sales-value">{report.weeklySignals.closedSales ?? "-"}</p>
            </div>
            <div data-testid="weekly-report-churn-row">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Churned customers</p>
              <p className="mt-1 text-lg" data-testid="weekly-report-churn-value">{report.weeklySignals.churnedCustomers ?? "-"}</p>
            </div>
            <div data-testid="weekly-report-margin-row">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Gross margin %</p>
              <p className="mt-1 text-lg" data-testid="weekly-report-margin-value">{report.weeklySignals.grossMarginPct ?? "-"}</p>
            </div>
          </Card>

          {packet && (
            <Card testId="weekly-review-packet-card">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Weekly review packet</p>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <div className="border border-zinc-800 p-4" data-testid="weekly-review-mission-snapshot-card">
                  <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Mission snapshot</p>
                  {packet.missionSnapshot ? (
                    <>
                      <p className="mt-2 text-sm" data-testid="weekly-review-mission-primary-value">{packet.missionSnapshot.primaryTask}</p>
                      <p className="mt-2 text-xs text-zinc-400" data-testid="weekly-review-mission-meta-value">
                        {new Date(packet.missionSnapshot.date).toLocaleDateString()} · {packet.missionSnapshot.recommendedMinutes} min · {packet.missionSnapshot.source}
                      </p>
                    </>
                  ) : (
                    <p className="mt-2 text-sm text-zinc-400" data-testid="weekly-review-mission-empty-text">
                      No mission recorded this week.
                    </p>
                  )}
                </div>
                <div className="border border-zinc-800 p-4" data-testid="weekly-review-override-history-card">
                  <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Override history</p>
                  <ul className="mt-2 space-y-2 text-sm" data-testid="weekly-review-override-history-list">
                    {packet.overrideHistory.length > 0 ? (
                      packet.overrideHistory.slice(0, 4).map((item) => (
                        <li key={item.updatedAt} className="border border-zinc-800 p-2" data-testid="weekly-review-override-history-item">
                          {new Date(item.weekStart).toLocaleDateString()} · {item.selectedLever}
                        </li>
                      ))
                    ) : (
                      <li className="text-zinc-400" data-testid="weekly-review-override-history-empty-text">No overrides recorded.</li>
                    )}
                  </ul>
                </div>
              </div>
            </Card>
          )}

          <Card testId="weekly-report-override-card">
            <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Lever reconsideration</p>
            <p className="mt-2 text-sm text-zinc-400" data-testid="weekly-report-neutral-evaluation-text">
              System evaluation: growth {report.growthStatus}, execution {report.executionStatus}, drift {report.driftStatus},
              allocation {report.allocationAdjustment}.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-[1fr_2fr_auto]">
              <select
                value={overrideLever}
                onChange={(e) => setOverrideLever(e.target.value as (typeof levers)[number])}
                className="h-10 border border-zinc-700 bg-zinc-950 px-3 text-sm"
                data-testid="weekly-report-override-lever-select"
              >
                {levers.map((lever) => (
                  <option key={lever} value={lever}>{lever}</option>
                ))}
              </select>
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="h-10 border border-zinc-700 bg-zinc-950 px-3 text-sm"
                placeholder="Optional reason"
                data-testid="weekly-report-override-reason-input"
              />
              <Button onClick={submitOverride} data-testid="weekly-report-override-submit-button">
                Record override
              </Button>
            </div>
          </Card>
        </>
      )}
    </AppShell>
  );
}
