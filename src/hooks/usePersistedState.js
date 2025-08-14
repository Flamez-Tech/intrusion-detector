"use client";

import { useLocalStorage } from "./useLocalStorage";

export function usePersistedState() {
  const [preferences, setPreferences] = useLocalStorage("ids-preferences", {
    theme: "system",
    autoExport: false,
    emailAlerts: false,
    maxEvents: 1000,
    updateInterval: 1000,
    chartSettings: {
      showThresholdLine: true,
      animateCharts: true,
      chartColors: "default",
    },
  });

  const [dashboardLayout, setDashboardLayout] = useLocalStorage(
    "ids-dashboard-layout",
    {
      sidebarCollapsed: false,
      chartOrder: [
        "anomaly-score",
        "anomaly-gauge",
        "event-distribution",
        "metrics",
      ],
      hiddenPanels: [],
    }
  );

  const [filterSettings, setFilterSettings] = useLocalStorage("ids-filters", {
    eventFilters: {
      showErrors: true,
      showSuccess: true,
      ipFilter: "",
      endpointFilter: "",
      timeRange: "1h",
    },
    alertFilters: {
      severityFilter: "all",
      timeRange: "24h",
    },
  });

  const updatePreferences = (updates) => {
    setPreferences((prev) => ({ ...prev, ...updates }));
  };

  const updateDashboardLayout = (updates) => {
    setDashboardLayout((prev) => ({ ...prev, ...updates }));
  };

  const updateFilterSettings = (updates) => {
    setFilterSettings((prev) => ({ ...prev, ...updates }));
  };

  const resetToDefaults = () => {
    setPreferences({
      theme: "system",
      autoExport: false,
      emailAlerts: false,
      maxEvents: 1000,
      updateInterval: 1000,
      chartSettings: {
        showThresholdLine: true,
        animateCharts: true,
        chartColors: "default",
      },
    });
    setDashboardLayout({
      sidebarCollapsed: false,
      chartOrder: [
        "anomaly-score",
        "anomaly-gauge",
        "event-distribution",
        "metrics",
      ],
      hiddenPanels: [],
    });
    setFilterSettings({
      eventFilters: {
        showErrors: true,
        showSuccess: true,
        ipFilter: "",
        endpointFilter: "",
        timeRange: "1h",
      },
      alertFilters: {
        severityFilter: "all",
        timeRange: "24h",
      },
    });
  };

  return {
    preferences,
    dashboardLayout,
    filterSettings,
    updatePreferences,
    updateDashboardLayout,
    updateFilterSettings,
    resetToDefaults,
  };
}
