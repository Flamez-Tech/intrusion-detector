"use client";

import { useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useDetectionData } from "@/src/hooks/useDetectionData";
import { SIMULATION_CONFIG } from "@/src/server/config/detection";
import { useMobile } from "@/src/hooks/useMobile"; // Added mobile hook for responsive design

export function SimulationControls() {
  const { status, startSimulation, stopSimulation, setScenario } =
    useDetectionData();
  const [loading, setLoading] = useState(false);
  const isMobile = useMobile(); // Added mobile hook for responsive design

  const isRunning = status?.isRunning || false;
  const currentScenario = status?.simulator?.currentScenario || "normal";

  const handleToggleSimulation = async () => {
    setLoading(true);
    try {
      if (isRunning) {
        await stopSimulation();
      } else {
        await startSimulation();
      }
    } catch (error) {
      if (
        error.message.includes("already running") ||
        error.message.includes("already stopped")
      ) {
        console.log("State sync issue, refreshing status...");
        // Refresh status to sync state
      } else if (error.message.includes("Failed to fetch")) {
        console.error("Network connection issue:", error.message);
      } else {
        console.error("Simulation control error:", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleScenarioChange = async (scenario) => {
    setLoading(true);
    try {
      await setScenario(scenario);
    } catch (error) {
      console.error("Failed to change scenario:", error);
    } finally {
      setLoading(false);
    }
  };

  const scenarios = Object.entries(SIMULATION_CONFIG.scenarios).map(
    ([key, config]) => ({
      value: key,
      label: config.name,
      description: config.description,
    })
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span className="text-base sm:text-lg">Simulation Controls</span>
          <Badge variant={isRunning ? "default" : "secondary"}>
            {isRunning ? "Running" : "Stopped"}
          </Badge>
        </CardTitle>
        <CardDescription className="text-sm">
          Control network traffic simulation and attack scenarios
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
          <Button
            onClick={handleToggleSimulation}
            disabled={loading}
            className="flex-1 h-10 sm:h-9"
            variant={isRunning ? "destructive" : "default"}
          >
            {isRunning ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                {isMobile ? "Stop" : "Stop Simulation"}
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                {isMobile ? "Start" : "Start Simulation"}
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size={isMobile ? "default" : "icon"}
            disabled={loading}
            className="sm:w-auto bg-transparent"
          >
            <RotateCcw className="h-4 w-4" />
            {isMobile && <span className="ml-2">Reset</span>}
          </Button>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Attack Scenario</label>
          <Select
            value={currentScenario}
            onValueChange={handleScenarioChange}
            disabled={loading}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select scenario" />
            </SelectTrigger>
            <SelectContent>
              {scenarios.map((scenario) => (
                <SelectItem key={scenario.value} value={scenario.value}>
                  <div className="flex flex-col">
                    <span className="text-sm">{scenario.label}</span>
                    {!isMobile && (
                      <span className="text-xs text-muted-foreground">
                        {scenario.description}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {status && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
            <div className="flex justify-between sm:flex-col sm:justify-start">
              <span className="text-muted-foreground">Events Generated:</span>
              <div className="font-mono font-medium">
                {status.metrics?.eventsGenerated || 0}
              </div>
            </div>
            <div className="flex justify-between sm:flex-col sm:justify-start">
              <span className="text-muted-foreground">Anomalies Detected:</span>
              <div className="font-mono font-medium">
                {status.metrics?.anomaliesDetected || 0}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
