"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useLocalSimulation } from "@/src/hooks/useLocalSimulation";
import { useMobile } from "@/hooks/use-mobile";

export function AnomalyScoreChart() {
  const { anomalyScores, status } = useLocalSimulation();
  const [scoreHistory, setScoreHistory] = useState([]);
  const isMobile = useMobile();

  const threshold = 2.5;

  useEffect(() => {
    if (anomalyScores.length > 0) {
      const formattedData = anomalyScores.slice(0, 50).map((score) => ({
        timestamp: new Date(score.timestamp).toLocaleTimeString(),
        score: score.score,
        threshold: threshold,
        isAnomaly: score.score > threshold,
      }));
      setScoreHistory(formattedData.reverse());
    }
  }, [anomalyScores, threshold]);

  const currentScore = anomalyScores[0]?.score || 0;
  const isAnomaly = currentScore > threshold;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{`Time: ${label}`}</p>
          <p className="text-sm">
            <span className="text-blue-600 dark:text-blue-400">Score: </span>
            <span className="font-mono">{data.score.toFixed(2)}</span>
          </p>
          <p className="text-sm">
            <span className="text-red-600 dark:text-red-400">Threshold: </span>
            <span className="font-mono">{data.threshold.toFixed(2)}</span>
          </p>
          {data.isAnomaly && (
            <Badge className="mt-1" variant="destructive">
              Anomaly Detected
            </Badge>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span className="text-base sm:text-lg">Anomaly Score Timeline</span>
          <div className="flex items-center space-x-2">
            {currentScore > threshold ? (
              <TrendingUp className="h-4 w-4 text-red-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-green-500" />
            )}
            <Badge variant={isAnomaly ? "destructive" : "secondary"}>
              {currentScore.toFixed(2)}
            </Badge>
          </div>
        </CardTitle>
        <CardDescription className="text-sm">
          Real-time anomaly detection scores with threshold line
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-48 sm:h-64 lg:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={scoreHistory}
              margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="timestamp"
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: isMobile ? 8 : 10 }}
                interval={isMobile ? "preserveStartEnd" : 0}
              />
              <YAxis
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: isMobile ? 8 : 10 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="threshold"
                stroke="hsl(var(--destructive))"
                strokeDasharray="5 5"
                strokeWidth={2}
                dot={false}
                name="Threshold"
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{
                  fill: "hsl(var(--primary))",
                  strokeWidth: 2,
                  r: isMobile ? 2 : 3,
                }}
                activeDot={{ r: isMobile ? 4 : 5, fill: "hsl(var(--primary))" }}
                name="Anomaly Score"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
