export const DETECTION_CONFIG = {
  // Z-score threshold for anomaly detection
  anomalyThreshold: Number.parseFloat(process.env.DEFAULT_THRESHOLD) || 2.5,

  // Window size for calculating rolling statistics
  windowSize: 50,

  // Minimum samples needed before detection starts
  minSamples: 10,

  // Feature weights for composite scoring
  featureWeights: {
    requestRate: 0.3,
    errorRate: 0.25,
    responseTime: 0.2,
    uniqueIPs: 0.15,
    payloadSize: 0.1,
  },

  // Alert severity thresholds
  severityThresholds: {
    low: 2.0,
    medium: 2.5,
    high: 3.0,
    critical: 4.0,
  },
}

export const SIMULATION_CONFIG = {
  // Base simulation parameters
  baseRequestRate: 10, // requests per second
  baseErrorRate: 0.02, // 2% error rate
  baseResponseTime: 150, // milliseconds

  // Attack scenario multipliers
  scenarios: {
    normal: {
      name: "Normal Traffic",
      requestRateMultiplier: 1.0,
      errorRateMultiplier: 1.0,
      responseTimeMultiplier: 1.0,
      description: "Typical network activity",
    },
    ddos: {
      name: "DDoS Attack",
      requestRateMultiplier: 5.0,
      errorRateMultiplier: 3.0,
      responseTimeMultiplier: 4.0,
      description: "Distributed denial of service attack",
    },
    bruteforce: {
      name: "Brute Force",
      requestRateMultiplier: 2.0,
      errorRateMultiplier: 8.0,
      responseTimeMultiplier: 1.5,
      description: "Login brute force attempts",
    },
    scanning: {
      name: "Port Scanning",
      requestRateMultiplier: 3.0,
      errorRateMultiplier: 6.0,
      responseTimeMultiplier: 0.8,
      description: "Network reconnaissance",
    },
    injection: {
      name: "SQL Injection",
      requestRateMultiplier: 1.5,
      errorRateMultiplier: 4.0,
      responseTimeMultiplier: 2.0,
      description: "Database injection attempts",
    },
  },
}
