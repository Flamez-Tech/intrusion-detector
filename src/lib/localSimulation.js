class LocalSimulationService {
  constructor() {
    this.isRunning = false
    this.events = []
    this.alerts = []
    this.anomalyScores = []
    this.interval = null
    this.listeners = new Set()
    this.maxScores = 100
  }

  // Add event listener
  on(callback) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  // Emit data to all listeners
  emit(type, data) {
    this.listeners.forEach((callback) => {
      try {
        callback(type, data)
      } catch (error) {
        console.error("Listener error:", error)
      }
    })
  }

  // Generate realistic network event
  generateEvent() {
    const eventTypes = ["HTTP_REQUEST", "DNS_QUERY", "TCP_CONNECTION", "UDP_PACKET", "SSH_LOGIN"]
    const sources = ["192.168.1.100", "10.0.0.50", "172.16.0.25", "192.168.1.200", "10.0.0.75"]
    const destinations = ["8.8.8.8", "1.1.1.1", "192.168.1.1", "10.0.0.1", "172.16.0.1"]
    const methods = ["GET", "POST", "PUT", "DELETE", "PATCH"]
    const statusCodes = [200, 201, 400, 401, 403, 404, 500, 502, 503]
    const endpoints = ["/api/users", "/login", "/dashboard", "/api/data", "/admin", "/upload", "/download"]

    const anomalyScore = Math.random() * 5
    const isAnomaly = anomalyScore > 2.5

    return {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
      sourceIP: sources[Math.floor(Math.random() * sources.length)],
      destination: destinations[Math.floor(Math.random() * destinations.length)],
      method: methods[Math.floor(Math.random() * methods.length)],
      endpoint: endpoints[Math.floor(Math.random() * endpoints.length)],
      statusCode: statusCodes[Math.floor(Math.random() * statusCodes.length)],
      responseTime: Math.floor(Math.random() * 3000) + 50,
      payloadSize: Math.floor(Math.random() * 10000) + 100,
      bytesTransferred: Math.floor(Math.random() * 50000) + 500,
      userAgent: "Mozilla/5.0 (compatible; SecurityBot/1.0)",
      scenario: isAnomaly ? "attack_simulation" : "normal_traffic",
      anomalyScore: Number.parseFloat(anomalyScore.toFixed(2)),
      status: isAnomaly ? (anomalyScore > 4 ? "critical" : "warning") : "normal",
      details: `${isAnomaly ? "Suspicious" : "Normal"} network activity detected`,
    }
  }

  // Generate alert from high anomaly events
  generateAlert(event) {
    if (event.anomalyScore <= 2.5) return null

    const severityMap = {
      critical: "critical",
      warning: "high",
    }

    return {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      severity: severityMap[event.status] || "medium",
      title: `${event.status === "critical" ? "Critical" : "Suspicious"} Activity Detected`,
      description: `High anomaly score (${event.anomalyScore}) from ${event.sourceIP}`,
      score: event.anomalyScore,
      affectedIPs: [event.sourceIP],
      eventCount: 1,
      features: {
        requestRate: Math.random() * 100,
        errorRate: Math.random() * 0.5,
        responseTime: event.responseTime,
        uniqueIPs: Math.floor(Math.random() * 10) + 1,
      },
      source: event.sourceIP,
      eventId: event.id,
    }
  }

  // Start simulation
  start() {
    if (this.isRunning) return { success: true, message: "Simulation already running" }

    this.isRunning = true
    this.interval = setInterval(() => {
      // Generate new event
      const event = this.generateEvent()
      this.events.unshift(event)

      // Add to anomaly scores
      this.anomalyScores.unshift({
        timestamp: event.timestamp,
        score: event.anomalyScore,
      })

      if (this.anomalyScores.length > this.maxScores) {
        this.anomalyScores = this.anomalyScores.slice(0, this.maxScores)
      }

      // Generate alert if needed
      const alert = this.generateAlert(event)
      if (alert) {
        this.alerts.unshift(alert)
      }

      // Emit updates
      this.emit("event", event)
      if (alert) this.emit("alert", alert)
      this.emit("anomalyScore", { timestamp: event.timestamp, score: event.anomalyScore })
    }, 2000) // Generate event every 2 seconds

    return { success: true, message: "Simulation started successfully" }
  }

  // Stop simulation
  stop() {
    if (!this.isRunning) return { success: true, message: "Simulation already stopped" }

    this.isRunning = false
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }

    return { success: true, message: "Simulation stopped successfully" }
  }

  clearAlerts() {
    this.alerts = []
    return { success: true, message: "All alerts cleared" }
  }

  // Get current status
  getStatus() {
    return {
      isRunning: this.isRunning,
      eventsCount: this.events.length,
      alertsCount: this.alerts.length,
      lastUpdate: this.events[0]?.timestamp || null,
    }
  }

  // Get recent events
  getEvents(limit = null) {
    return limit ? this.events.slice(0, limit) : this.events
  }

  // Get recent alerts
  getAlerts(limit = null) {
    return limit ? this.alerts.slice(0, limit) : this.alerts
  }

  // Get anomaly scores
  getAnomalyScores(limit = 50) {
    return this.anomalyScores.slice(0, limit)
  }
}

// Create singleton instance
const localSimulation = new LocalSimulationService()
export default localSimulation
