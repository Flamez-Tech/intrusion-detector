import { DETECTION_CONFIG } from "../config/detection.js"
import { Statistics } from "../utils/statistics.js"
import { Logger } from "../utils/logger.js"

export class AnomalyDetector {
  constructor() {
    this.threshold = DETECTION_CONFIG.anomalyThreshold
    this.windowSize = DETECTION_CONFIG.windowSize
    this.minSamples = DETECTION_CONFIG.minSamples
    this.featureWeights = DETECTION_CONFIG.featureWeights

    // Feature history for rolling statistics
    this.features = {
      requestRate: [],
      errorRate: [],
      responseTime: [],
      uniqueIPs: [],
      payloadSize: [],
    }

    // Rolling statistics
    this.stats = {
      requestRate: { mean: 0, std: 0 },
      errorRate: { mean: 0, std: 0 },
      responseTime: { mean: 0, std: 0 },
      uniqueIPs: { mean: 0, std: 0 },
      payloadSize: { mean: 0, std: 0 },
    }

    this.alerts = []
    this.lastProcessTime = Date.now()
  }

  extractFeatures(events, timeWindow = 10000) {
    // 10 second window
    if (events.length === 0) return null

    const now = Date.now()
    const windowStart = now - timeWindow

    // Filter events within time window
    const recentEvents = events.filter((event) => new Date(event.timestamp).getTime() >= windowStart)

    if (recentEvents.length === 0) return null

    // Calculate features
    const requestRate = recentEvents.length / (timeWindow / 1000) // requests per second
    const errorRate = recentEvents.filter((e) => e.isError).length / recentEvents.length
    const responseTime = Statistics.mean(recentEvents.map((e) => e.responseTime))
    const uniqueIPs = new Set(recentEvents.map((e) => e.sourceIP)).size
    const payloadSize = Statistics.mean(recentEvents.map((e) => e.payloadSize))

    return {
      requestRate,
      errorRate,
      responseTime,
      uniqueIPs,
      payloadSize,
      timestamp: now,
      eventCount: recentEvents.length,
    }
  }

  updateStatistics(features) {
    // Update feature history
    Object.keys(this.features).forEach((key) => {
      this.features[key].push(features[key])
      this.features[key] = Statistics.rollingWindow(this.features[key], this.windowSize)
    })

    // Calculate rolling statistics
    Object.keys(this.features).forEach((key) => {
      const values = this.features[key]
      if (values.length >= this.minSamples) {
        this.stats[key].mean = Statistics.mean(values)
        this.stats[key].std = Statistics.standardDeviation(values, this.stats[key].mean)
      }
    })
  }

  calculateAnomalyScore(features) {
    if (!features) return 0

    let compositeScore = 0
    const featureScores = {}

    // Calculate z-scores for each feature
    Object.keys(this.featureWeights).forEach((key) => {
      if (this.stats[key].std > 0) {
        const zScore = Statistics.zScore(features[key], this.stats[key].mean, this.stats[key].std)
        featureScores[key] = Math.abs(zScore)
        compositeScore += featureScores[key] * this.featureWeights[key]
      }
    })

    return {
      compositeScore,
      featureScores,
      features,
      timestamp: features.timestamp,
    }
  }

  detectAnomalies(events) {
    const features = this.extractFeatures(events)
    if (!features) return null

    // Update rolling statistics
    this.updateStatistics(features)

    // Calculate anomaly score
    const anomalyResult = this.calculateAnomalyScore(features)

    // Determine if this is an anomaly
    const isAnomaly = anomalyResult.compositeScore > this.threshold

    if (isAnomaly) {
      const alert = this.generateAlert(anomalyResult, events)
      this.alerts.push(alert)

      // Keep alerts manageable
      if (this.alerts.length > 100) {
        this.alerts = this.alerts.slice(-50)
      }

      Logger.warn("Anomaly detected", {
        score: anomalyResult.compositeScore,
        threshold: this.threshold,
        features: anomalyResult.features,
      })
    }

    return {
      ...anomalyResult,
      isAnomaly,
      threshold: this.threshold,
      alert: isAnomaly ? this.alerts[this.alerts.length - 1] : null,
    }
  }

  generateAlert(anomalyResult, events) {
    const severity = this.calculateSeverity(anomalyResult.compositeScore)
    const recentEvents = events.slice(-10) // Last 10 events for context

    // Analyze patterns for alert description
    const description = this.generateAlertDescription(anomalyResult, recentEvents)

    const alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      severity,
      score: anomalyResult.compositeScore,
      description,
      features: anomalyResult.features,
      featureScores: anomalyResult.featureScores,
      affectedIPs: [...new Set(recentEvents.map((e) => e.sourceIP))],
      eventCount: recentEvents.length,
    }

    return alert
  }

  calculateSeverity(score) {
    const thresholds = DETECTION_CONFIG.severityThresholds

    if (score >= thresholds.critical) return "critical"
    if (score >= thresholds.high) return "high"
    if (score >= thresholds.medium) return "medium"
    return "low"
  }

  generateAlertDescription(anomalyResult, events) {
    const { featureScores, features } = anomalyResult

    // Find the most anomalous feature
    const maxFeature = Object.keys(featureScores).reduce((a, b) => (featureScores[a] > featureScores[b] ? a : b))

    const descriptions = {
      requestRate: `Unusual request rate detected: ${features.requestRate.toFixed(1)} req/s`,
      errorRate: `High error rate detected: ${(features.errorRate * 100).toFixed(1)}%`,
      responseTime: `Abnormal response times: ${features.responseTime.toFixed(0)}ms average`,
      uniqueIPs: `Suspicious IP activity: ${features.uniqueIPs} unique sources`,
      payloadSize: `Unusual payload sizes: ${features.payloadSize.toFixed(0)} bytes average`,
    }

    return descriptions[maxFeature] || "Anomalous network activity detected"
  }

  setThreshold(newThreshold) {
    this.threshold = Math.max(0.5, Math.min(5.0, newThreshold))
    Logger.info(`Anomaly detection threshold updated to: ${this.threshold}`)
  }

  getStatus() {
    return {
      threshold: this.threshold,
      windowSize: this.windowSize,
      minSamples: this.minSamples,
      featureWeights: this.featureWeights,
      sampleCount: Math.min(...Object.values(this.features).map((f) => f.length)),
      alertCount: this.alerts.length,
      isReady: Math.min(...Object.values(this.features).map((f) => f.length)) >= this.minSamples,
    }
  }

  getRecentAlerts(count = 20) {
    return this.alerts.slice(-count)
  }

  clearAlerts() {
    this.alerts = []
    Logger.info("Alert history cleared")
  }
}
