"use client"

import { useState, useEffect, useCallback } from "react"
import { useSocket } from "./useSocket"
import { apiClient } from "@/src/lib/api"

export function useDetectionData() {
  const { isConnected, subscribe, requestCurrentData } = useSocket()
  const [status, setStatus] = useState(null)
  const [events, setEvents] = useState([])
  const [alerts, setAlerts] = useState([])
  const [anomalyData, setAnomalyData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load initial data
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [statusRes, eventsRes, alertsRes, anomalyRes] = await Promise.all([
        apiClient.getStatus(),
        apiClient.getEvents(20),
        apiClient.getAlerts(10),
        apiClient.getCurrentAnomalyData(),
      ])

      setStatus(statusRes.data)
      setEvents(eventsRes.data)
      setAlerts(alertsRes.data)
      setAnomalyData(anomalyRes.data)
    } catch (err) {
      setError(err.message)
      console.error("Failed to load initial data:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Socket event handlers
  useEffect(() => {
    if (!isConnected) return

    const unsubscribers = [
      subscribe("status", (data) => {
        setStatus(data)
      }),

      subscribe("event", (data) => {
        setEvents((prev) => {
          const updated = [data, ...prev].slice(0, 100) // Keep last 100 events
          return updated
        })
      }),

      subscribe("alert", (data) => {
        setAlerts((prev) => {
          const updated = [data, ...prev].slice(0, 50) // Keep last 50 alerts
          return updated
        })
      }),

      subscribe("anomaly", (data) => {
        setAnomalyData(data)
      }),

      subscribe("recent_events", (data) => {
        setEvents(data)
      }),

      subscribe("recent_alerts", (data) => {
        setAlerts(data)
      }),

      subscribe("alerts_cleared", () => {
        setAlerts([])
      }),
    ]

    // Request current data when connected
    requestCurrentData()

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe())
    }
  }, [isConnected, subscribe, requestCurrentData])

  // Load initial data on mount
  useEffect(() => {
    loadInitialData()
  }, [loadInitialData])

  // Control functions
  const startSimulation = async () => {
    try {
      await apiClient.startSimulation()
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const stopSimulation = async () => {
    try {
      await apiClient.stopSimulation()
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const setScenario = async (scenario) => {
    try {
      await apiClient.setScenario(scenario)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const setThreshold = async (threshold) => {
    try {
      await apiClient.setThreshold(threshold)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const clearAlerts = async () => {
    try {
      await apiClient.clearAlerts()
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  return {
    // Data
    status,
    events,
    alerts,
    anomalyData,

    // State
    loading,
    error,
    isConnected,

    // Actions
    startSimulation,
    stopSimulation,
    setScenario,
    setThreshold,
    clearAlerts,
    refresh: loadInitialData,
  }
}
