"use client"

import { AlertTriangle, Shield, X, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useLocalSimulation } from "@/src/hooks/useLocalSimulation"
import { useState } from "react"

export function AlertPanel() {
  const { alerts, localSimulation } = useLocalSimulation()
  const loading = false
  const [showAll, setShowAll] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

  const clearAlerts = async () => {
    setIsClearing(true)
    try {
      localSimulation.clearAlerts()
      await new Promise((resolve) => setTimeout(resolve, 500))
    } finally {
      setIsClearing(false)
    }
  }

  const displayAlerts = showAll ? alerts : alerts.slice(0, 3)

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200"
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getStatusIndicatorColor = (severity) => {
    switch (severity) {
      case "critical":
        return "border-l-red-500 bg-red-50 dark:bg-red-950/20"
      case "high":
        return "border-l-orange-500 bg-orange-50 dark:bg-orange-950/20"
      case "medium":
        return "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20"
      default:
        return "border-l-blue-500 bg-blue-50 dark:bg-blue-950/20"
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const formatScore = (score) => {
    return (score || 0).toFixed(2)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Security Alerts</span>
            <Badge variant="outline">{alerts.length}</Badge>
          </div>
          {alerts.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearAlerts} disabled={isClearing}>
              <X className="h-4 w-4 mr-1" />
              {isClearing ? "Clearing..." : "Clear All"}
            </Button>
          )}
        </CardTitle>
        <CardDescription>Anomaly detection alerts and security incidents</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          <div className="space-y-3">
            {displayAlerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No security alerts</p>
                <p className="text-sm">System is operating normally</p>
              </div>
            ) : (
              displayAlerts.map((alert, index) => (
                <div
                  key={`${alert.id || alert.timestamp || Date.now()}_${index}`}
                  className={`p-4 rounded-lg border-l-4 bg-card space-y-3 ${getStatusIndicatorColor(alert.severity)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Badge className={getSeverityColor(alert.severity)}>{alert.severity.toUpperCase()}</Badge>
                        <span className="text-sm font-medium">Score: {formatScore(alert.score)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.description}</p>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatTime(alert.timestamp)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-muted-foreground">Affected IPs:</span>
                      <div className="font-mono">
                        {alert.affectedIPs?.slice(0, 2).join(", ") || "N/A"}
                        {alert.affectedIPs?.length > 2 && ` +${alert.affectedIPs.length - 2}`}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Events:</span>
                      <div className="font-mono">{alert.eventCount || 0}</div>
                    </div>
                  </div>

                  {alert.features && (
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">Key Metrics:</span>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>Request Rate: {alert.features.requestRate?.toFixed(1) || 0}/s</div>
                        <div>Error Rate: {((alert.features.errorRate || 0) * 100).toFixed(1)}%</div>
                        <div>Response Time: {alert.features.responseTime?.toFixed(0) || 0}ms</div>
                        <div>Unique IPs: {alert.features.uniqueIPs || 0}</div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {alerts.length > 3 && (
          <div className="mt-4 text-center">
            <Button variant="outline" onClick={() => setShowAll(!showAll)} className="transition-all duration-200">
              {showAll ? "Show Less" : `Show All ${alerts.length} Alerts`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
