"use client";

import { useState } from "react";
import { Shield, Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useLocalSimulation } from "@/src/hooks/useLocalSimulation";
import { useMobile } from "@/src/hooks/useMobile"; // Added mobile hook for responsive design

export function DetectionControls() {
  const { status } = useLocalSimulation(); // Updated to use local simulation data
  const [localThreshold, setLocalThreshold] = useState([2.5]);
  const [loading, setLoading] = useState(false);
  const isMobile = useMobile(); // Added mobile hook for responsive design

  const currentThreshold = 2.5; // Updated status properties for local simulation
  const isReady = status?.isRunning || false;
  const sampleCount = status?.eventsGenerated || 0;
  const alertCount = status?.alertsGenerated || 0;

  const handleThresholdChange = async (value) => {
    setLocalThreshold(value);
  };

  const handleThresholdCommit = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error("Failed to set threshold:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAlerts = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error("Failed to clear alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 flex-shrink-0" />
            <span className="text-base sm:text-lg">Detection Settings</span>
          </div>
          <Badge variant={isReady ? "default" : "secondary"}>
            {isReady ? "Active" : "Learning"}
          </Badge>
        </CardTitle>
        <CardDescription className="text-sm">
          Configure anomaly detection sensitivity and manage alerts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Sensitivity Threshold</label>
            <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
              {localThreshold[0].toFixed(1)}
            </span>
          </div>

          <div className="px-1">
            <Slider
              value={localThreshold}
              onValueChange={handleThresholdChange}
              onValueCommit={handleThresholdCommit}
              min={0.5}
              max={5.0}
              step={0.1}
              className="w-full"
              disabled={loading}
            />
          </div>

          <div className="flex justify-between text-xs text-muted-foreground px-1">
            <span>More Sensitive</span>
            <span>Less Sensitive</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
          <div className="flex justify-between sm:flex-col sm:justify-start">
            <span className="text-muted-foreground">Training Samples:</span>
            <div className="font-mono font-medium">{sampleCount}</div>
          </div>
          <div className="flex justify-between sm:flex-col sm:justify-start">
            <span className="text-muted-foreground">Active Alerts:</span>
            <div className="font-mono font-medium">{alertCount}</div>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={handleClearAlerts}
          disabled={loading || alertCount === 0}
          className="w-full h-10 bg-transparent"
        >
          <Sliders className="mr-2 h-4 w-4" />
          {isMobile ? "Clear Alerts" : "Clear Alert History"}
        </Button>
      </CardContent>
    </Card>
  );
}
