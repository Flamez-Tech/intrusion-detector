"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Clock, Globe, AlertCircle } from "lucide-react"
import { useDetectionData } from "@/src/hooks/useDetectionData"
import { useMobile } from "@/hooks/use-mobile"

export function MetricsOverview() {
  const { events, alerts, status } = useDetectionData()
  const isMobile = useMobile()

  // Calculate metrics from recent events
  const getMetrics = () => {
    if (events.length === 0) {
      return {
        totalEvents: 0,
        errorRate: 0,
        avgResponseTime: 0,
        uniqueIPs: 0,
        totalAlerts: alerts.length,
      }
    }

    const errorCount = events.filter((e) => e.isError).length
    const errorRate = (errorCount / events.length) * 100
    const avgResponseTime = events.reduce((sum, e) => sum + e.responseTime, 0) / events.length
    const uniqueIPs = new Set(events.map((e) => e.sourceIP)).size

    return {
      totalEvents: events.length,
      errorRate: errorRate.toFixed(1),
      avgResponseTime: avgResponseTime.toFixed(0),
      uniqueIPs,
      totalAlerts: alerts.length,
    }
  }

  // Get hourly event distribution for the bar chart
  const getHourlyDistribution = () => {
    if (events.length === 0) return []

    const hourlyData = {}
    const now = new Date()

    // Initialize last 12 hours
    for (let i = 11; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000)
      const hourKey = hour.getHours()
      hourlyData[hourKey] = {
        hour: `${hourKey.toString().padStart(2, "0")}:00`,
        events: 0,
        errors: 0,
      }
    }

    // Count events by hour
    events.forEach((event) => {
      const eventHour = new Date(event.timestamp).getHours()
      if (hourlyData[eventHour]) {
        hourlyData[eventHour].events++
        if (event.isError) {
          hourlyData[eventHour].errors++
        }
      }
    })

    return Object.values(hourlyData)
  }

  const metrics = getMetrics()
  const hourlyData = getHourlyDistribution()

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{`Time: ${label}`}</p>
          <p className="text-sm">
            <span className="text-blue-600 dark:text-blue-400">Events: </span>
            <span className="font-mono">{payload[0].value}</span>
          </p>
          <p className="text-sm">
            <span className="text-red-600 dark:text-red-400">Errors: </span>
            <span className="font-mono">{payload[1].value}</span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-5">
        <Card className="lg:col-span-1">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="space-y-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground truncate">
                  {isMobile ? "Events" : "Total Events"}
                </p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold truncate">{metrics.totalEvents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="space-y-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground truncate">
                  {isMobile ? "Errors" : "Error Rate"}
                </p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold truncate">{metrics.errorRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="space-y-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground truncate">
                  {isMobile ? "Response" : "Avg Response"}
                </p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold truncate">{metrics.avgResponseTime}ms</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="space-y-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground truncate">{isMobile ? "IPs" : "Unique IPs"}</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold truncate">{metrics.uniqueIPs}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2 lg:col-span-1">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="space-y-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground truncate">
                  {isMobile ? "Alerts" : "Active Alerts"}
                </p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold truncate">{metrics.totalAlerts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hourly Activity Chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Hourly Activity</CardTitle>
          <CardDescription className="text-sm">Event distribution over the last 12 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-40 sm:h-48 lg:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData} margin={{ top: 10, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="hour"
                  className="text-xs fill-muted-foreground"
                  tick={{ fontSize: isMobile ? 8 : 10 }}
                  interval={isMobile ? 2 : 0}
                />
                <YAxis
                  className="text-xs fill-muted-foreground"
                  tick={{ fontSize: isMobile ? 8 : 10 }}
                  width={isMobile ? 25 : 35}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="events"
                  fill="hsl(var(--primary))"
                  name="Events"
                  radius={[1, 1, 0, 0]}
                  maxBarSize={isMobile ? 20 : 40}
                />
                <Bar
                  dataKey="errors"
                  fill="hsl(var(--destructive))"
                  name="Errors"
                  radius={[1, 1, 0, 0]}
                  maxBarSize={isMobile ? 20 : 40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
