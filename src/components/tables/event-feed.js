"use client";

import { useState } from "react";
import {
  Clock,
  Globe,
  AlertCircle,
  CheckCircle,
  Activity,
  ChevronDown,
  ChevronUp,
  Shield,
} from "lucide-react"; // Added Shield and Zap icons
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useLocalSimulation } from "@/src/hooks/useLocalSimulation";
import { useMobile } from "@/hooks/use-mobile";

export function EventFeed() {
  const { events } = useLocalSimulation();
  const loading = false; // No loading state needed for local simulation
  const [showAll, setShowAll] = useState(false);
  const [expandedEvent, setExpandedEvent] = useState(null);
  const isMobile = useMobile();

  const displayEvents = showAll ? events : events.slice(0, isMobile ? 5 : 10);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getStatusColor = (statusCode) => {
    if (statusCode >= 200 && statusCode < 300)
      return "text-green-600 dark:text-green-400 font-semibold";
    if (statusCode >= 400 && statusCode < 500)
      return "text-orange-600 dark:text-orange-400 font-semibold";
    if (statusCode >= 500)
      return "text-red-600 dark:text-red-400 font-semibold";
    return "text-muted-foreground";
  };

  const getMethodColor = (method) => {
    switch (method) {
      case "GET":
        return "bg-blue-500 text-white dark:bg-blue-600";
      case "POST":
        return "bg-green-500 text-white dark:bg-green-600";
      case "PUT":
        return "bg-yellow-500 text-white dark:bg-yellow-600";
      case "DELETE":
        return "bg-red-500 text-white dark:bg-red-600";
      default:
        return "bg-gray-500 text-white dark:bg-gray-600";
    }
  };

  const getThreatLevel = (event) => {
    if (event.statusCode >= 500 || event.responseTime > 2000) return "critical";
    if (event.statusCode >= 400 || event.responseTime > 1000) return "warning";
    return "normal";
  };

  const getThreatLevelColor = (level) => {
    switch (level) {
      case "critical":
        return "border-l-red-500 bg-red-50 dark:bg-red-950/20";
      case "warning":
        return "border-l-orange-500 bg-orange-50 dark:bg-orange-950/20";
      default:
        return "border-l-green-500 bg-green-50 dark:bg-green-950/20";
    }
  };

  const getThreatLevelIcon = (level) => {
    switch (level) {
      case "critical":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <Shield className="h-4 w-4 text-orange-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  // Removed loading state check since there's no loading for local simulation

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span className="text-base sm:text-lg">Live Event Feed</span>
          </div>
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300"
          >
            {events.length} events
          </Badge>
        </CardTitle>
        <CardDescription>
          Real-time network activity and security events
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64 sm:h-80 lg:h-96">
          <div className="space-y-2">
            {displayEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No events yet. Start the simulation to see live data.</p>
              </div>
            ) : (
              displayEvents.map((event) => {
                const threatLevel = getThreatLevel(event);
                return (
                  <div
                    key={event.id}
                    className={`rounded-lg border-l-4 bg-card hover:bg-accent/50 transition-all duration-200 ${getThreatLevelColor(
                      threatLevel
                    )}`}
                  >
                    <div
                      className="flex items-center space-x-3 p-3 cursor-pointer"
                      onClick={() =>
                        setExpandedEvent(
                          expandedEvent === event.id ? null : event.id
                        )
                      }
                    >
                      <div className="flex-shrink-0">
                        {getThreatLevelIcon(threatLevel)}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <Badge
                            className={`${getMethodColor(
                              event.method
                            )} font-semibold`}
                            variant="secondary"
                          >
                            {event.method}
                          </Badge>
                          <span className="text-sm font-mono truncate font-medium">
                            {event.endpoint}
                          </span>
                          <span
                            className={`text-sm font-mono px-2 py-1 rounded ${getStatusColor(
                              event.statusCode
                            )} bg-opacity-10`}
                          >
                            {event.statusCode}
                          </span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Globe className="h-3 w-3" />
                            <span className="font-mono font-medium">
                              {event.sourceIP}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatTime(event.timestamp)}</span>
                          </div>
                          <span
                            className={`font-semibold ${
                              event.responseTime > 2000
                                ? "text-red-600 dark:text-red-400"
                                : event.responseTime > 1000
                                ? "text-orange-600 dark:text-orange-400"
                                : "text-green-600 dark:text-green-400"
                            }`}
                          >
                            {event.responseTime}ms
                          </span>
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
                            <span className="text-muted-foreground">
                              User Agent:
                            </span>
                            <div className="font-mono text-xs truncate">
                              {event.userAgent}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Payload:
                            </span>
                            <div className="font-mono">
                              {event.payloadSize} bytes
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Transferred:
                            </span>
                            <div className="font-mono">
                              {event.bytesTransferred} bytes
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Scenario:
                            </span>
                            <div className="font-mono">{event.scenario}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        {events.length > (isMobile ? 5 : 10) && (
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              onClick={() => setShowAll(!showAll)}
              className="transition-all duration-200"
            >
              {showAll ? "Show Less" : `Show All ${events.length} Events`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
