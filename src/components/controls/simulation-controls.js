"use client";

import { useState } from "react";
import { Play, Pause, RotateCcw, Loader2 } from "lucide-react";
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
import { useLocalSimulation } from "@/src/hooks/useLocalSimulation";
import { useMobile } from "@/src/hooks/useMobile";

export function SimulationControls() {
  const { status, startSimulation, stopSimulation, isLoading } =
    useLocalSimulation();
  const [scenarioLoading, setScenarioLoading] = useState(false);
  const isMobile = useMobile();

  const isRunning = status?.isRunning || false;

  const handleToggleSimulation = async () => {
    try {
      if (isRunning) {
        await stopSimulation();
      } else {
        await startSimulation();
      }
    } catch (error) {
      console.error("Simulation control error:", error.message);
    }
  };

  const handleScenarioChange = async (scenario) => {
    setScenarioLoading(true);
    try {
      console.log("Scenario changed to:", scenario);
    } catch (error) {
      console.error("Failed to change scenario:", error);
    } finally {
      setTimeout(() => setScenarioLoading(false), 500);
    }
  };

  const scenarios = [
    {
      value: "normal",
      label: "Normal Traffic",
      description: "Regular network activity",
    },
    {
      value: "ddos",
      label: "DDoS Attack",
      description: "Distributed denial of service",
    },
    {
      value: "intrusion",
      label: "Intrusion Attempt",
      description: "Unauthorized access attempts",
    },
    {
      value: "malware",
      label: "Malware Detection",
      description: "Malicious software activity",
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span className="text-base sm:text-lg">Simulation Controls</span>
          <div className="flex items-center gap-2">
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            <Badge
              variant={isRunning ? "default" : "secondary"}
              className={isRunning ? "bg-green-600" : ""}
            >
              {isLoading ? "Processing..." : isRunning ? "Running" : "Stopped"}
            </Badge>
          </div>
        </CardTitle>
        <CardDescription className="text-sm">
          Control network traffic simulation and attack scenarios
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
          <Button
            onClick={handleToggleSimulation}
            disabled={isLoading || scenarioLoading}
            className="flex-1 h-10 sm:h-9 transition-all duration-200"
            variant={isRunning ? "destructive" : "default"}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isRunning ? "Stopping..." : "Starting..."}
              </>
            ) : isRunning ? (
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
            disabled={isLoading || scenarioLoading}
            className="sm:w-auto bg-transparent transition-all duration-200"
          >
            {isLoading || scenarioLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4" />
            )}
            {isMobile && <span className="ml-2">Reset</span>}
          </Button>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Attack Scenario</label>
          <Select
            defaultValue="normal"
            onValueChange={handleScenarioChange}
            disabled={isLoading || scenarioLoading}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select scenario" />
              {scenarioLoading && (
                <Loader2 className="h-4 w-4 animate-spin ml-2" />
              )}
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
              <div className="font-mono font-medium text-blue-600 dark:text-blue-400">
                {status.eventsCount || 0}
              </div>
            </div>
            <div className="flex justify-between sm:flex-col sm:justify-start">
              <span className="text-muted-foreground">Alerts Detected:</span>
              <div className="font-mono font-medium text-red-600 dark:text-red-400">
                {status.alertsCount || 0}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
