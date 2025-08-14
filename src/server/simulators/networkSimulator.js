import { SIMULATION_CONFIG } from "../config/detection.js"
import { Logger } from "../utils/logger.js"

export class NetworkSimulator {
  constructor() {
    this.isRunning = false
    this.currentScenario = "normal"
    this.eventHistory = []
    this.ipPool = this.generateIPPool()
    this.userAgents = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)",
      "Mozilla/5.0 (Android 11; Mobile; rv:68.0) Gecko/68.0",
    ]
    this.endpoints = [
      "/api/login",
      "/api/users",
      "/api/data",
      "/admin/dashboard",
      "/api/upload",
      "/api/search",
      "/api/orders",
      "/api/payments",
    ]
  }

  generateIPPool() {
    const ips = []
    // Generate legitimate IP ranges
    for (let i = 0; i < 50; i++) {
      ips.push(`192.168.1.${Math.floor(Math.random() * 254) + 1}`)
      ips.push(`10.0.0.${Math.floor(Math.random() * 254) + 1}`)
    }
    // Add some external IPs
    for (let i = 0; i < 20; i++) {
      ips.push(
        `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      )
    }
    return ips
  }

  generateEvent() {
    const scenario = SIMULATION_CONFIG.scenarios[this.currentScenario]
    const baseConfig = SIMULATION_CONFIG

    // Generate basic event properties
    const timestamp = new Date().toISOString()
    const sourceIP = this.getRandomIP()
    const endpoint = this.getRandomEndpoint()
    const userAgent = this.userAgents[Math.floor(Math.random() * this.userAgents.length)]
    const method = Math.random() > 0.8 ? "POST" : "GET"

    // Apply scenario multipliers
    const responseTime = Math.max(
      50,
      Math.floor((baseConfig.baseResponseTime + Math.random() * 200 - 100) * scenario.responseTimeMultiplier),
    )

    const isError = Math.random() < baseConfig.baseErrorRate * scenario.errorRateMultiplier
    const statusCode = isError ? this.getErrorStatusCode() : this.getSuccessStatusCode()

    const payloadSize = Math.floor(Math.random() * 10000) + 100
    const bytesTransferred = Math.floor(Math.random() * 50000) + payloadSize

    const event = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp,
      sourceIP,
      endpoint,
      method,
      statusCode,
      responseTime,
      payloadSize,
      bytesTransferred,
      userAgent,
      scenario: this.currentScenario,
      isError,
    }

    this.eventHistory.push(event)

    // Keep history manageable
    if (this.eventHistory.length > (process.env.MAX_EVENTS_HISTORY || 1000)) {
      this.eventHistory = this.eventHistory.slice(-500)
    }

    return event
  }

  getRandomIP() {
    const scenario = SIMULATION_CONFIG.scenarios[this.currentScenario]

    // For certain attack scenarios, bias towards fewer unique IPs
    if (this.currentScenario === "ddos" && Math.random() < 0.7) {
      return this.ipPool[Math.floor(Math.random() * 5)] // Use only first 5 IPs
    }

    if (this.currentScenario === "bruteforce" && Math.random() < 0.8) {
      return this.ipPool[Math.floor(Math.random() * 3)] // Use only first 3 IPs
    }

    return this.ipPool[Math.floor(Math.random() * this.ipPool.length)]
  }

  getRandomEndpoint() {
    if (this.currentScenario === "bruteforce" && Math.random() < 0.8) {
      return "/api/login" // Focus on login endpoint
    }

    if (this.currentScenario === "injection" && Math.random() < 0.6) {
      return Math.random() > 0.5 ? "/api/search" : "/api/data" // Focus on data endpoints
    }

    return this.endpoints[Math.floor(Math.random() * this.endpoints.length)]
  }

  getErrorStatusCode() {
    const errorCodes = [400, 401, 403, 404, 429, 500, 502, 503]

    if (this.currentScenario === "bruteforce") {
      return Math.random() > 0.3 ? 401 : 403 // Mostly auth errors
    }

    if (this.currentScenario === "ddos") {
      return Math.random() > 0.4 ? 503 : 429 // Service unavailable or rate limited
    }

    return errorCodes[Math.floor(Math.random() * errorCodes.length)]
  }

  getSuccessStatusCode() {
    const successCodes = [200, 201, 202, 204]
    return successCodes[Math.floor(Math.random() * successCodes.length)]
  }

  setScenario(scenario) {
    if (SIMULATION_CONFIG.scenarios[scenario]) {
      this.currentScenario = scenario
      Logger.info(`Simulation scenario changed to: ${scenario}`)
      return true
    }
    return false
  }

  start() {
    this.isRunning = true
    Logger.info("Network simulation started", { scenario: this.currentScenario })
  }

  stop() {
    this.isRunning = false
    Logger.info("Network simulation stopped")
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      currentScenario: this.currentScenario,
      eventCount: this.eventHistory.length,
      availableScenarios: Object.keys(SIMULATION_CONFIG.scenarios),
    }
  }

  getRecentEvents(count = 50) {
    return this.eventHistory.slice(-count)
  }
}
