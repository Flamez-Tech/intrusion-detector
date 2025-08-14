"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useDetectionData } from "@/src/hooks/useDetectionData"
import { useMobile } from "@/hooks/use-mobile"

export function EventDistributionChart() {
  const { events } = useDetectionData()
  const isMobile = useMobile()

  // Process events to get distribution data
  const getEventDistribution = () => {
    if (events.length === 0) return []

    const methodCounts = events.reduce((acc, event) => {
      acc[event.method] = (acc[event.method] || 0) + 1
      return acc
    }, {})

    const colors = {
      GET: "hsl(var(--chart-1))",
      POST: "hsl(var(--chart-2))",
      PUT: "hsl(var(--chart-3))",
      DELETE: "hsl(var(--chart-4))",
      PATCH: "hsl(var(--chart-5))",
    }

    return Object.entries(methodCounts).map(([method, count]) => ({
      name: method,
      value: count,
      percentage: ((count / events.length) * 100).toFixed(1),
      color: colors[method] || "hsl(var(--muted))",
    }))
  }

  const getStatusDistribution = () => {
    if (events.length === 0) return []

    const statusGroups = events.reduce((acc, event) => {
      const statusGroup = Math.floor(event.statusCode / 100) * 100
      const groupName = `${statusGroup}s`
      acc[groupName] = (acc[groupName] || 0) + 1
      return acc
    }, {})

    const colors = {
      "200s": "hsl(142, 76%, 36%)", // Green
      "300s": "hsl(45, 93%, 47%)", // Yellow
      "400s": "hsl(25, 95%, 53%)", // Orange
      "500s": "hsl(0, 84%, 60%)", // Red
    }

    return Object.entries(statusGroups).map(([group, count]) => ({
      name: group,
      value: count,
      percentage: ((count / events.length) * 100).toFixed(1),
      color: colors[group] || "hsl(var(--muted))",
    }))
  }

  const methodData = getEventDistribution()
  const statusData = getStatusDistribution()

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">
            <span className="text-muted-foreground">Count: </span>
            <span className="font-mono">{data.value}</span>
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">Percentage: </span>
            <span className="font-mono">{data.percentage}%</span>
          </p>
        </div>
      )
    }
    return null
  }

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }) => {
    if (Number.parseFloat(percentage) < 5 || isMobile) return null

    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${percentage}%`}
      </text>
    )
  }

  if (events.length === 0) {
    return (
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">HTTP Methods</CardTitle>
            <CardDescription>Distribution of request methods</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 sm:h-64 flex items-center justify-center text-muted-foreground">No data available</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Response Status</CardTitle>
            <CardDescription>Distribution of HTTP status codes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 sm:h-64 flex items-center justify-center text-muted-foreground">No data available</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">HTTP Methods</CardTitle>
          <CardDescription>Distribution of request methods ({events.length} events)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={methodData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={isMobile ? 60 : 80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {methodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                {!isMobile && <Legend />}
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Response Status</CardTitle>
          <CardDescription>Distribution of HTTP status codes ({events.length} events)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={isMobile ? 60 : 80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                {!isMobile && <Legend />}
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
