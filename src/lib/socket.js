class SocketClient {
  constructor() {
    this.listeners = new Map();
    this.isConnected = false;
    this.pollingInterval = null;
    this.eventSource = null;
    this.retryCount = 0;
    this.maxRetries = 5;
    this.retryDelay = 1000;
    this.lastEventId = 0; // Add counter for unique event IDs
    this.lastAlertId = 0; // Add counter for unique alert IDs
  }

  connect() {
    if (this.isConnected) {
      return this;
    }

    console.log("Connecting to detection server...");

    // Initialize the detection service
    fetch("/api/socket", { method: "GET" })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Detection service initialized:", data);
        this.isConnected = true;
        this.retryCount = 0;
        this.emit("connection_status", { connected: true });
        this.startPolling();
      })
      .catch((error) => {
        console.error("Connection error:", error);
        this.emit("connection_error", { error: error.message });
        this.handleConnectionError();
      });

    return this;
  }

  handleConnectionError() {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      const delay = this.retryDelay * Math.pow(2, this.retryCount - 1);
      console.log(
        `Retrying connection in ${delay}ms (attempt ${this.retryCount}/${this.maxRetries})`
      );

      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error("Max connection retries reached.");
      this.emit("connection_failed", { message: "Max retries reached" });
    }
  }

  startPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }

    this.pollingInterval = setInterval(async () => {
      try {
        if (!this.isConnected) {
          return;
        }

        // Get current status
        const statusResponse = await fetch("/api/status");
        if (statusResponse.ok) {
          const status = await statusResponse.json();
          if (status.success) {
            this.emit("status", status.data);
          }
        }

        // Get recent events
        const eventsResponse = await fetch("/api/events");
        if (eventsResponse.ok) {
          const events = await eventsResponse.json();
          if (events.success && events.data && events.data.length > 0) {
            this.emit(
              "recent_events",
              events.data.map((event) => ({
                ...event,
                id: event.id || `event_${Date.now()}_${++this.lastEventId}`,
              }))
            );
          }
        }

        // Get recent alerts
        const alertsResponse = await fetch("/api/alerts");
        if (alertsResponse.ok) {
          const alerts = await alertsResponse.json();
          if (alerts.success && alerts.data && alerts.data.length > 0) {
            this.emit(
              "recent_alerts",
              alerts.data.map((alert) => ({
                ...alert,
                id: alert.id || `alert_${Date.now()}_${++this.lastAlertId}`,
              }))
            );
          }
        }

        this.retryCount = 0;
      } catch (error) {
        if (this.retryCount === 0) {
          console.error("Polling error:", error.message);
        }

        this.retryCount++;
        if (this.retryCount >= 3) {
          console.warn("Stopping polling due to repeated errors");
          this.disconnect();
        }
      }
    }, 8000); // Increased to 8 seconds to reduce server load
  }

  disconnect() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.isConnected = false;
    this.emit("connection_status", { connected: false });
  }

  // Event listener management
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    // Return unsubscribe function
    return () => {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        eventListeners.delete(callback);
        if (eventListeners.size === 0) {
          this.listeners.delete(event);
        }
      }
    };
  }

  off(event, callback) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  emit(event, data) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Request current data from server
  requestCurrentData() {
    if (this.isConnected) {
      this.makeImmediateRequest();
    }
  }

  async makeImmediateRequest() {
    try {
      const [statusRes, eventsRes, alertsRes] = await Promise.all([
        fetch("/api/status"),
        fetch("/api/events"),
        fetch("/api/alerts"),
      ]);

      if (statusRes.ok) {
        const status = await statusRes.json();
        if (status.success) this.emit("status", status.data);
      }

      if (eventsRes.ok) {
        const events = await eventsRes.json();
        if (events.success && events.data) {
          this.emit(
            "recent_events",
            events.data.map((event) => ({
              ...event,
              id: event.id || `event_${Date.now()}_${++this.lastEventId}`,
            }))
          );
        }
      }

      if (alertsRes.ok) {
        const alerts = await alertsRes.json();
        if (alerts.success && alerts.data) {
          this.emit(
            "recent_alerts",
            alerts.data.map((alert) => ({
              ...alert,
              id: alert.id || `alert_${Date.now()}_${++this.lastAlertId}`,
            }))
          );
        }
      }
    } catch (error) {
      console.error("Immediate request error:", error.message);
    }
  }

  getConnectionStatus() {
    return {
      connected: this.isConnected,
      method: "polling",
      retryCount: this.retryCount,
    };
  }
}

// Singleton instance
export const socketClient = new SocketClient();

// if (typeof window !== "undefined") {
//   socketClient.connect()
// }
