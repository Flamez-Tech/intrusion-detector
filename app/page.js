"use client";

import { DashboardLayout } from "@/src/components/layout/dashboard-layout";
import { SimulationControls } from "@/src/components/controls/simulation-controls";
import { DetectionControls } from "@/src/components/controls/detection-controls";
import { AdvancedControls } from "@/src/components/controls/advanced-controls";
import { SystemStatus } from "@/src/components/controls/system-status";
import { DataFilters } from "@/src/components/controls/data-filters";
import { EventFeed } from "@/src/components/tables/event-feed";
import { AlertPanel } from "@/src/components/alerts/alert-panel";
import { AnomalyScoreChart } from "@/src/components/charts/anomaly-score-chart";
import { AnomalyGauge } from "@/src/components/charts/anomaly-gauge";
import { EventDistributionChart } from "@/src/components/charts/event-distribution-chart";
import { MetricsOverview } from "@/src/components/charts/metrics-overview";

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Security Dashboard
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Monitor network activity and detect security threats in real-time
          </p>
        </div>

        {/* Controls Row */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
          <SimulationControls />
          <DetectionControls />
          <div className="md:col-span-2 xl:col-span-1">
            <SystemStatus />
          </div>
        </div>

        {/* Advanced Controls Row */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          <AdvancedControls />
          <DataFilters />
        </div>

        {/* Metrics Overview */}
        <MetricsOverview />

        {/* Charts Row */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          <AnomalyScoreChart />
          <AnomalyGauge />
        </div>

        {/* Distribution Charts */}
        <EventDistributionChart />

        {/* Data Display Row */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          <EventFeed />
          <AlertPanel />
        </div>
      </div>
    </DashboardLayout>
  );
}
