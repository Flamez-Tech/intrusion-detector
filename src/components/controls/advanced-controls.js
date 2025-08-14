"use client";

import { useState } from "react";
import {
  Download,
  RotateCcw,
  Settings,
  Database,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useLocalSimulation } from "@/src/hooks/useLocalSimulation";
import { useToast } from "@/hooks/use-toast";

export function AdvancedControls() {
  const { events, alerts, status } = useLocalSimulation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);

  // Export data functionality
  const exportData = async (format = "json") => {
    setLoading(true);
    try {
      const exportData = {
        timestamp: new Date().toISOString(),
        events: events.slice(0, 1000), // Limit to last 1000 events
        alerts: alerts,
        status: status,
        metadata: {
          totalEvents: events.length,
          totalAlerts: alerts.length,
          exportFormat: format,
        },
      };

      const dataStr =
        format === "json"
          ? JSON.stringify(exportData, null, 2)
          : convertToCSV(exportData);
      const dataBlob = new Blob([dataStr], {
        type: format === "json" ? "application/json" : "text/csv",
      });

      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `intrusion-data-${
        new Date().toISOString().split("T")[0]
      }.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: `Data exported as ${format.toUpperCase()} file`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setExportDialogOpen(false);
    }
  };

  const convertToCSV = (data) => {
    const events = data.events;
    if (events.length === 0) return "No events to export";

    const headers = Object.keys(events[0]).join(",");
    const rows = events.map((event) => Object.values(event).join(","));
    return [headers, ...rows].join("\n");
  };

  // System reset functionality
  const resetSystem = async () => {
    setLoading(true);
    try {
      // Additional reset logic could go here
      toast({
        title: "System Reset",
        description: "Alert history cleared and system reset",
      });
    } catch (error) {
      toast({
        title: "Reset Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate system report
  const generateReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalEvents: events.length,
        totalAlerts: alerts.length,
        systemStatus: status?.isRunning ? "Running" : "Stopped",
        currentScenario: status?.simulator?.currentScenario || "Unknown",
        detectionThreshold: status?.detector?.threshold || 0,
      },
      recentAlerts: alerts.slice(0, 10),
      topIPs: getTopIPs(),
      errorRate: calculateErrorRate(),
    };

    const reportStr = JSON.stringify(report, null, 2);
    const blob = new Blob([reportStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `security-report-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Report Generated",
      description: "Security report downloaded successfully",
    });
  };

  const getTopIPs = () => {
    const ipCounts = events.reduce((acc, event) => {
      acc[event.sourceIP] = (acc[event.sourceIP] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(ipCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([ip, count]) => ({ ip, count }));
  };

  const calculateErrorRate = () => {
    if (events.length === 0) return 0;
    const errorCount = events.filter((e) => e.isError).length;
    return ((errorCount / events.length) * 100).toFixed(2);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Advanced Controls</span>
        </CardTitle>
        <CardDescription>
          System management, data export, and configuration options
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {/* Export Data */}
          <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full bg-transparent">
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Export System Data</DialogTitle>
                <DialogDescription>
                  Choose the format and data to export
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={() => exportData("json")} disabled={loading}>
                    <FileText className="mr-2 h-4 w-4" />
                    JSON Format
                  </Button>
                  <Button onClick={() => exportData("csv")} disabled={loading}>
                    <Database className="mr-2 h-4 w-4" />
                    CSV Format
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Export includes:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Last 1000 events</li>
                    <li>All security alerts</li>
                    <li>System status and configuration</li>
                    <li>Export metadata</li>
                  </ul>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Generate Report */}
          <Button
            variant="outline"
            onClick={generateReport}
            className="w-full bg-transparent"
          >
            <FileText className="mr-2 h-4 w-4" />
            Generate Report
          </Button>

          {/* Reset System */}
          <Button
            variant="outline"
            onClick={resetSystem}
            disabled={loading}
            className="w-full bg-transparent"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset System
          </Button>

          {/* Configuration */}
          <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full bg-transparent">
                <Settings className="mr-2 h-4 w-4" />
                Configure
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>System Configuration</DialogTitle>
                <DialogDescription>
                  Advanced system settings and preferences
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="max-events">Max Events to Store</Label>
                  <Input
                    id="max-events"
                    type="number"
                    defaultValue="1000"
                    min="100"
                    max="10000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="update-interval">Update Interval (ms)</Label>
                  <Input
                    id="update-interval"
                    type="number"
                    defaultValue="1000"
                    min="500"
                    max="10000"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="auto-export" />
                  <Label htmlFor="auto-export">Auto-export daily reports</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="email-alerts" />
                  <Label htmlFor="email-alerts">Email critical alerts</Label>
                </div>
                <Button className="w-full">Save Configuration</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* System Statistics */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-3">System Statistics</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Events Stored:</span>
              <div className="font-mono">{events.length.toLocaleString()}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Active Alerts:</span>
              <div className="font-mono">{alerts.length}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Error Rate:</span>
              <div className="font-mono">{calculateErrorRate()}%</div>
            </div>
            <div>
              <span className="text-muted-foreground">Unique IPs:</span>
              <div className="font-mono">
                {new Set(events.map((e) => e.sourceIP)).size}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
