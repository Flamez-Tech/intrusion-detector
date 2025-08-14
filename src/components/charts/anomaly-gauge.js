"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield } from "lucide-react";
import { useLocalSimulation } from "@/src/hooks/useLocalSimulation";

export function AnomalyGauge() {
  const { anomalyScores, status } = useLocalSimulation();

  const latestScore = anomalyScores[0];
  const currentScore = latestScore?.score || 0;
  const threshold = 2.5;
  const isAnomaly = currentScore > threshold;

  // Convert score to percentage (0-100) based on threshold
  const maxDisplayScore = Math.max(threshold * 2, 5); // Show up to 2x threshold or 5, whichever is higher
  const percentage = Math.min((currentScore / maxDisplayScore) * 100, 100);

  const getIntensityLevel = (score, threshold) => {
    if (score < threshold * 0.5)
      return { level: "Low", color: "text-green-600", bgColor: "bg-green-100" };
    if (score < threshold * 0.8)
      return {
        level: "Medium",
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
      };
    if (score < threshold)
      return {
        level: "High",
        color: "text-orange-600",
        bgColor: "bg-orange-100",
      };
    return { level: "Critical", color: "text-red-600", bgColor: "bg-red-100" };
  };

  const intensity = getIntensityLevel(currentScore, threshold);

  const getProgressColor = () => {
    if (currentScore < threshold * 0.5) return "bg-green-500";
    if (currentScore < threshold * 0.8) return "bg-yellow-500";
    if (currentScore < threshold) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {isAnomaly ? (
            <AlertTriangle className="h-5 w-5 text-red-500" />
          ) : (
            <Shield className="h-5 w-5 text-green-500" />
          )}
          <span>Threat Level</span>
        </CardTitle>
        <CardDescription>
          Current anomaly intensity and threat assessment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Anomaly Score</span>
            <span className="text-2xl font-bold font-mono">
              {currentScore.toFixed(2)}
            </span>
          </div>

          <div className="space-y-2">
            <Progress
              value={percentage}
              className="h-3"
              style={{
                "--progress-background": getProgressColor(),
              }}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0.0</span>
              <span>Threshold: {threshold.toFixed(1)}</span>
              <span>{maxDisplayScore.toFixed(1)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg border">
          <div>
            <div className="text-sm text-muted-foreground">Threat Level</div>
            <div className={`text-lg font-semibold ${intensity.color}`}>
              {intensity.level}
            </div>
          </div>
          <Badge
            variant={isAnomaly ? "destructive" : "secondary"}
            className={`${intensity.bgColor} ${intensity.color} border-0`}
          >
            {isAnomaly ? "ANOMALY" : "NORMAL"}
          </Badge>
        </div>

        {latestScore?.features && (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="space-y-1">
              <div className="text-muted-foreground">Request Rate</div>
              <div className="font-mono">
                {latestScore.features.requestRate.toFixed(1)}/s
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">Error Rate</div>
              <div className="font-mono">
                {(latestScore.features.errorRate * 100).toFixed(1)}%
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">Response Time</div>
              <div className="font-mono">
                {latestScore.features.responseTime.toFixed(0)}ms
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">Unique IPs</div>
              <div className="font-mono">{latestScore.features.uniqueIPs}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
