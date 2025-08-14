"use client"

import { useState, useEffect } from "react"
import { Activity, Cpu, HardDrive, Wifi, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useDetectionData } from "@/src/hooks/useDetectionData"
import { useSocket } from "@/src/hooks/useSocket"

export function SystemStatus() {
  const { status, isConnected } = useDetectionData()
  const { connectionError } = useSocket()
  const [systemMetrics, setSystemMetrics] = useState({
    uptime: 0,
    memoryUsage: 0,
    eventProcessingRate: 0,
    lastUpdate: new Date(),
  })

  useEffect(() => {
    const interval = setInterval(() => {
      if (status?.metrics) {
        const uptime = status.metrics.uptime || 0
        const eventsGenerated = status.metrics.eventsGenerated || 0

        setSystemMetrics((prev) => ({
          uptime: uptime,
          memoryUsage: Math.random() * 100, // Simulated memory usage
          eventProcessingRate: eventsGenerated / (uptime / 1000 || 1),
          lastUpdate: new Date(),
        }))
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [status])

  const formatUptime = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ${hours % 24}h`
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }

  const getSystemHealth = () => {
    if (!isConnected) return { status: "error", message: "Disconnected" }
    if (connectionError) return { status: "error", message: "Connection Error" }
    if (!status?.isRunning) return { status: "warning", message: "Simulation Stopped" }
    if (systemMetrics.memoryUsage > 90) return { status: "warning", message: "High Memory Usage" }
    return { status: "healthy", message: "All Systems Operational" }
  }

  const lastUpdateStr = systemMetrics.lastUpdate.toLocaleTimeString("en-US", {
    hour12: false,
  });


  const health = getSystemHealth()

  const getHealthColor = (status) => {
    switch (status) {
      case "healthy":
        return "text-green-600 bg-green-100 border-green-200"
      case "warning":
        return "text-yellow-600 bg-yellow-100 border-yellow-200"
      case "error":
        return "text-red-600 bg-red-100 border-red-200"
      default:
        return "text-gray-600 bg-gray-100 border-gray-200"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>System Status</span>
          </div>
          <Badge className={getHealthColor(health.status)}>
            {health.message}
          </Badge>
        </CardTitle>
        <CardDescription>
          Real-time system health and performance metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connection Status */}
        <div className="flex items-center justify-between p-3 rounded-lg border">
          <div className="flex items-center space-x-2">
            <Wifi
              className={`h-4 w-4 ${
                isConnected ? "text-green-500" : "text-red-500"
              }`}
            />
            <span className="text-sm font-medium">Connection</span>
          </div>
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>

        {/* System Metrics */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Uptime</span>
            </div>
            <span className="text-sm font-mono">
              {formatUptime(systemMetrics.uptime)}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Memory Usage</span>
              </div>
              <span className="text-sm font-mono">
                {systemMetrics.memoryUsage.toFixed(1)}%
              </span>
            </div>
            <Progress value={systemMetrics.memoryUsage} className="h-2" />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Cpu className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Processing Rate</span>
            </div>
            <span className="text-sm font-mono">
              {systemMetrics.eventProcessingRate.toFixed(1)} events/s
            </span>
          </div>
        </div>

        {/* Service Status */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Service Status</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Simulation Engine</span>
              <Badge variant={status?.isRunning ? "default" : "secondary"}>
                {status?.isRunning ? "Running" : "Stopped"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Anomaly Detection</span>
              <Badge
                variant={status?.detector?.isReady ? "default" : "secondary"}
              >
                {status?.detector?.isReady ? "Active" : "Learning"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">WebSocket Server</span>
              <Badge variant={isConnected ? "default" : "destructive"}>
                {isConnected ? "Connected" : "Disconnected"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        {status?.metrics && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Performance</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Events Generated:</span>
                <div className="font-mono">
                  {status.metrics.eventsGenerated?.toLocaleString() || 0}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">
                  Anomalies Detected:
                </span>
                <div className="font-mono">
                  {status.metrics.anomaliesDetected?.toLocaleString() || 0}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Alerts Generated:</span>
                <div className="font-mono">
                  {status.metrics.alertsGenerated?.toLocaleString() || 0}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">
                  Active Subscribers:
                </span>
                <div className="font-mono">{status.subscribers || 0}</div>
              </div>
            </div>
          </div>
        )}

        {/* TODO: UNCOMMENT THE BLOCK OF CODE BELOW AND DEBUG IT  */}
        {/* Last Update */}
        {/* <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Last updated: {lastUpdateStr}
        </div> */}
      </CardContent>
    </Card>
  );
}
