"use client"

import { useState } from "react"
import { Clock, Globe, AlertCircle, CheckCircle, Activity, ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { useDetectionData } from "@/src/hooks/useDetectionData"
import { useMobile } from "@/hooks/use-mobile"

export function EventFeed() {
  const { events, loading } = useDetectionData()
  const [showAll, setShowAll] = useState(false)
  const [expandedEvent, setExpandedEvent] = useState(null)
  const isMobile = useMobile()

  const displayEvents = showAll ? events : events.slice(0, isMobile ? 5 : 10)

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const getStatusColor = (statusCode) => {
    if (statusCode >= 200 && statusCode < 300) return "text-green-600 dark:text-green-400"
    if (statusCode >= 400 && statusCode < 500) return "text-yellow-600 dark:text-yellow-400"
    if (statusCode >= 500) return "text-red-600 dark:text-red-400"
    return "text-muted-foreground"
  }

  const getMethodColor = (method) => {
    switch (method) {
      case "GET":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "POST":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "PUT":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "DELETE":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Live Event Feed</CardTitle>
          <CardDescription>Loading events...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 sm:h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span className="text-base sm:text-lg">Live Event Feed</span>
          </div>
          <Badge variant="outline">{events.length}</Badge>
        </CardTitle>
        <CardDescription>Real-time network activity and security events</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64 sm:h-80 lg:h-96">
          <div className="space-y-2">
            {displayEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No events yet. Start the simulation to see live data.
              </div>
            ) : (
              displayEvents.map((event) => (
                <div key={event.id} className="rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                  <div
                    className="flex items-center space-x-3 p-3 cursor-pointer"
                    onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
                  >
                    <div className="flex-shrink-0">
                      {event.isError ? (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <Badge className={getMethodColor(event.method)} variant="secondary">
                          {event.method}
                        </Badge>
                        <span className="text-sm font-mono truncate">{event.endpoint}</span>
                        <span className={`text-sm font-mono ${getStatusColor(event.statusCode)}`}>
                          {event.statusCode}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Globe className="h-3 w-3" />
                          <span className="font-mono">{event.sourceIP}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatTime(event.timestamp)}</span>
                        </div>
                        <span>{event.responseTime}ms</span>
                      </div>
                    </div>

                    {isMobile && (
                      <div className="flex-shrink-0">
                        {expandedEvent === event.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    )}
                  </div>

                  {isMobile && expandedEvent === event.id && (
                    <div className="px-3 pb-3 border-t bg-muted/20">
                      <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                        <div>
                          <span className="text-muted-foreground">User Agent:</span>
                          <div className="font-mono text-xs truncate">{event.userAgent}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Payload:</span>
                          <div className="font-mono">{event.payloadSize} bytes</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Transferred:</span>
                          <div className="font-mono">{event.bytesTransferred} bytes</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Scenario:</span>
                          <div className="font-mono">{event.scenario}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {events.length > (isMobile ? 5 : 10) && (
          <div className="mt-4 text-center">
            <Button variant="outline" onClick={() => setShowAll(!showAll)}>
              {showAll ? "Show Less" : `Show All ${events.length} Events`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
