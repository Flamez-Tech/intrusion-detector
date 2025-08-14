const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

class ApiClient {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}/api${endpoint}`

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw Error(data.message || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error)
      throw error
    }
  }

  // Simulation control
  async startSimulation() {
    return this.request("/simulation/start", { method: "POST" })
  }

  async stopSimulation() {
    return this.request("/simulation/stop", { method: "POST" })
  }

  async setScenario(scenario) {
    return this.request("/simulation/scenario", {
      method: "POST",
      body: JSON.stringify({ scenario }),
    })
  }

  async getScenarios() {
    return this.request("/simulation/scenario")
  }

  // Detection control
  async setThreshold(threshold) {
    return this.request("/detection/threshold", {
      method: "POST",
      body: JSON.stringify({ threshold }),
    })
  }

  async getThreshold() {
    return this.request("/detection/threshold")
  }

  // Data retrieval
  async getStatus() {
    return this.request("/status")
  }

  async getEvents(count = 50) {
    return this.request(`/events?count=${count}`)
  }

  async getAlerts(count = 20) {
    return this.request(`/alerts?count=${count}`)
  }

  async clearAlerts() {
    return this.request("/alerts", { method: "DELETE" })
  }

  async getCurrentAnomalyData() {
    return this.request("/anomaly/current")
  }
}

export const apiClient = new ApiClient()
