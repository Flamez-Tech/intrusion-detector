import { NetworkSimulator } from "../simulators/networkSimulator.js"
import { AnomalyDetector } from "../models/anomalyDetector.js"
import { Logger } from "../utils/logger.js"

export class DetectionService {
  constructor() {
    this.simulator = new NetworkSimulator()
    this.detector = new AnomalyDetector()
    this.subscribers = new Set()
    this.simulationInterval = null
    this.detectionInterval = null
    this.isRunning = false

    // Performance metrics
    this.metrics = {
      eventsGenerated: 0,
      anomaliesDetected: 0,
      alertsGenerated: 0,
      uptime: Date.now(),
    }
  }

  // Event subscription for real-time updates
  subscribe(callback) {
    this.subscribers.add(callback)
    Logger.debug("New subscriber added", { totalSubscribers: this.subscribers.size })

    return () => {
      this.subscribers.delete(callback)
      Logger.debug("Subscriber removed", { totalSubscribers: this.subscribers.size })
    }
  }

  broadcast(event) {
    this.subscribers.forEach((callback) => {
      try {
        callback(event)
      } catch (error) {
        Logger.error("Error broadcasting to subscriber", error)
      }
    })
  }

  start() {
    if (this.isRunning) {
      Logger.warn("Detection service already running")
      return false
    }

    this.isRunning = true
    this.simulator.start()
    this.metrics.uptime = Date.now()

    // Start event generation
    this.simulationInterval = setInterval(() => {
      if (this.simulator.isRunning) {
        const event = this.simulator.generateEvent()
        this.metrics.eventsGenerated++

        // Broadcast new event
        this.broadcast({
          type: "event",
          data: event,
        })
      }
    }, Number.parseInt(process.env.SIMULATION_INTERVAL) || 1000)

    // Start anomaly detection (runs less frequently)
    this.detectionInterval = setInterval(() => {
      this.runDetection()
    }, 5000) // Run detection every 5 seconds

    Logger.info("Detection service started")

    this.broadcast({
      type: "status",
      data: { isRunning: true, message: "Detection service started" },
    })

    return true
  }

  stop() {
    if (!this.isRunning) {
      Logger.warn("Detection service not running")
      return false
    }

    this.isRunning = false
    this.simulator.stop()

    if (this.simulationInterval) {
      clearInterval(this.simulationInterval)
      this.simulationInterval = null
    }

    if (this.detectionInterval) {
      clearInterval(this.detectionInterval)
      this.detectionInterval = null
    }

    Logger.info("Detection service stopped")

    this.broadcast({
      type: "status",
      data: { isRunning: false, message: "Detection service stopped" },
    })

    return true
  }

  runDetection() {
    try {
      const events = this.simulator.getRecentEvents(100)
      const result = this.detector.detectAnomalies(events)

      if (result) {
        // Broadcast anomaly score update
        this.broadcast({
          type: "anomaly",
          data: {
            score: result.compositeScore,
            isAnomaly: result.isAnomaly,
            features: result.features,
            featureScores: result.featureScores,
            threshold: result.threshold,
            timestamp: new Date().toISOString(),
          },
        })

        // If anomaly detected, broadcast alert
        if (result.isAnomaly && result.alert) {
          this.metrics.anomaliesDetected++
          this.metrics.alertsGenerated++

          this.broadcast({
            type: "alert",
            data: result.alert,
          })
        }
      }
    } catch (error) {
      Logger.error("Error during anomaly detection", error)
    }
  }

  // Control methods
  setScenario(scenario) {
    const success = this.simulator.setScenario(scenario)
    if (success) {
      this.broadcast({
        type: "scenario",
        data: { scenario, message: `Scenario changed to ${scenario}` },
      })
    }
    return success
  }

  setThreshold(threshold) {
    this.detector.setThreshold(threshold)
    this.broadcast({
      type: "threshold",
      data: { threshold, message: `Detection threshold set to ${threshold}` },
    })
  }

  // Data access methods
  getStatus() {
    return {
      isRunning: this.isRunning,
      simulator: this.simulator.getStatus(),
      detector: this.detector.getStatus(),
      metrics: {
        ...this.metrics,
        uptime: Date.now() - this.metrics.uptime,
      },
      subscribers: this.subscribers.size,
    }
  }

  getRecentEvents(count = 50) {
    return this.simulator.getRecentEvents(count)
  }

  getRecentAlerts(count = 20) {
    return this.detector.getRecentAlerts(count)
  }

  clearAlerts() {
    this.detector.clearAlerts()
    this.broadcast({
      type: "alerts_cleared",
      data: { message: "Alert history cleared" },
    })
  }

  // Get current anomaly score and features
  getCurrentAnomalyData() {
    const events = this.simulator.getRecentEvents(50)
    const result = this.detector.detectAnomalies(events)

    return (
      result || {
        compositeScore: 0,
        isAnomaly: false,
        features: null,
        featureScores: {},
        threshold: this.detector.threshold,
      }
    )
  }
}

// Singleton instance
export const detectionService = new DetectionService()
