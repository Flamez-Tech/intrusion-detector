// Simplified detection service that works in Next.js environment
class MockDetectionService {
  constructor() {
    this.isRunning = false;
    this.events = [];
    this.alerts = [];
    this.currentScore = 0;
    this.threshold = 2.5;
    this.scenario = "normal";
    this.startTime = Date.now();
    this.eventId = 1;
    this.alertId = 1;

    // Generate some initial mock data
    this.generateInitialData();
  }

  generateInitialData() {
    // Generate some sample events
    const eventTypes = [
      "HTTP_REQUEST",
      "LOGIN_ATTEMPT",
      "FILE_ACCESS",
      "NETWORK_SCAN",
      "DATA_TRANSFER",
    ];
    const sources = [
      "192.168.1.10",
      "10.0.0.15",
      "172.16.0.5",
      "192.168.1.25",
      "10.0.0.8",
    ];
    const statuses = ["normal", "suspicious", "critical"];

    for (let i = 0; i < 20; i++) {
      const event = {
        id: this.eventId++,
        timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        sourceIp: sources[Math.floor(Math.random() * sources.length)],
        score: Math.random() * 5,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        details: `Mock event ${i + 1}`,
      };
      this.events.push(event);
    }

    // Generate some sample alerts
    for (let i = 0; i < 5; i++) {
      const alert = {
        id: this.alertId++,
        timestamp: new Date(Date.now() - Math.random() * 1800000).toISOString(),
        type: "ANOMALY_DETECTED",
        severity: ["low", "medium", "high"][Math.floor(Math.random() * 3)],
        message: `Anomaly detected in network traffic pattern ${i + 1}`,
        sourceIp: sources[Math.floor(Math.random() * sources.length)],
        score: 2.5 + Math.random() * 2.5,
      };
      this.alerts.push(alert);
    }
  }

  start() {
    if (this.isRunning) {
      return { success: false, message: "Simulation is already running" };
    }

    this.isRunning = true;
    this.startTime = Date.now();

    // Start generating events periodically
    if (typeof window === "undefined") {
      // Only on server side
      this.interval = setInterval(() => {
        this.generateEvent();
      }, 3000);
    }

    return { success: true, message: "Simulation started successfully" };
  }

  stop() {
    if (!this.isRunning) {
      return { success: false, message: "Simulation is not running" };
    }

    this.isRunning = false;

    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    return { success: true, message: "Simulation stopped successfully" };
  }

  generateEvent() {
    const eventTypes = [
      "HTTP_REQUEST",
      "LOGIN_ATTEMPT",
      "FILE_ACCESS",
      "NETWORK_SCAN",
      "DATA_TRANSFER",
    ];
    const sources = [
      "192.168.1.10",
      "10.0.0.15",
      "172.16.0.5",
      "192.168.1.25",
      "10.0.0.8",
    ];

    let status = "normal";
    let score = Math.random() * 2;

    // Adjust based on scenario
    if (this.scenario === "attack") {
      score = 2 + Math.random() * 3;
      status = Math.random() > 0.3 ? "suspicious" : "critical";
    } else if (this.scenario === "mixed") {
      score = Math.random() * 4;
      status = score > 2.5 ? "suspicious" : score > 4 ? "critical" : "normal";
    }

    const event = {
      id: this.eventId++,
      timestamp: new Date().toISOString(),
      type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
      sourceIp: sources[Math.floor(Math.random() * sources.length)],
      score: score,
      status: status,
      details: `Generated event at ${new Date().toLocaleTimeString()}`,
    };

    this.events.unshift(event);

    // Keep only last 100 events
    if (this.events.length > 100) {
      this.events = this.events.slice(0, 100);
    }

    // Generate alert if score is high
    if (score > this.threshold) {
      const alert = {
        id: this.alertId++,
        timestamp: new Date().toISOString(),
        type: "ANOMALY_DETECTED",
        severity: score > 4 ? "high" : score > 3 ? "medium" : "low",
        message: `Anomaly detected: ${event.type} from ${event.sourceIp}`,
        sourceIp: event.sourceIp,
        score: score,
      };

      this.alerts.unshift(alert);

      // Keep only last 50 alerts
      if (this.alerts.length > 50) {
        this.alerts = this.alerts.slice(0, 50);
      }
    }

    this.currentScore = score;
    return event;
  }

  setScenario(scenario) {
    this.scenario = scenario;
    return { success: true, message: `Scenario changed to ${scenario}` };
  }

  setThreshold(threshold) {
    this.threshold = threshold;
    return { success: true, message: `Threshold set to ${threshold}` };
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      scenario: this.scenario,
      threshold: this.threshold,
      currentScore: this.currentScore,
      eventsCount: this.events.length,
      alertsCount: this.alerts.length,
      uptime: Date.now() - this.startTime,
    };
  }

  getRecentEvents(count = 50) {
    return this.events.slice(0, count);
  }

  getRecentAlerts(count = 20) {
    return this.alerts.slice(0, count);
  }

  clearAlerts() {
    this.alerts = [];
    return { success: true, message: "Alerts cleared" };
  }

  getCurrentAnomalyData() {
    return {
      compositeScore: this.currentScore,
      isAnomaly: this.currentScore > this.threshold,
      threshold: this.threshold,
      timestamp: new Date().toISOString(),
    };
  }
}

// Create singleton instance
let mockDetectionService = null;

export function getMockDetectionService() {
  if (!mockDetectionService) {
    mockDetectionService = new MockDetectionService();
  }
  return mockDetectionService;
}
