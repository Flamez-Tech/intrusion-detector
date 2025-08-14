import { io } from "socket.io-client"

class SocketClient {
  constructor() {
    this.socket = null
    this.listeners = new Map()
    this.isConnected = false
  }

  connect() {
    if (this.socket?.connected) {
      return this.socket
    }

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000"

    this.socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      timeout: 20000,
      forceNew: true,
    })

    this.socket.on("connect", () => {
      console.log("Connected to detection server")
      this.isConnected = true
      this.emit("connection_status", { connected: true })
    })

    this.socket.on("disconnect", (reason) => {
      console.log("Disconnected from detection server:", reason)
      this.isConnected = false
      this.emit("connection_status", { connected: false, reason })
    })

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error)
      this.isConnected = false
      this.emit("connection_error", { error: error.message })
    })

    // Forward all server events to registered listeners
    const eventTypes = [
      "event",
      "anomaly",
      "alert",
      "status",
      "scenario",
      "threshold",
      "alerts_cleared",
      "recent_events",
      "recent_alerts",
    ]

    eventTypes.forEach((eventType) => {
      this.socket.on(eventType, (data) => {
        this.emit(eventType, data)
      })
    })

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  // Event listener management
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event).add(callback)

    // Return unsubscribe function
    return () => {
      const eventListeners = this.listeners.get(event)
      if (eventListeners) {
        eventListeners.delete(callback)
        if (eventListeners.size === 0) {
          this.listeners.delete(event)
        }
      }
    }
  }

  off(event, callback) {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.delete(callback)
      if (eventListeners.size === 0) {
        this.listeners.delete(event)
      }
    }
  }

  emit(event, data) {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach((callback) => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error)
        }
      })
    }
  }

  // Request current data from server
  requestCurrentData() {
    if (this.socket?.connected) {
      this.socket.emit("request_current_data")
    }
  }

  getConnectionStatus() {
    return {
      connected: this.isConnected,
      socketId: this.socket?.id || null,
    }
  }
}

// Singleton instance
export const socketClient = new SocketClient()

// Auto-connect in browser environment
if (typeof window !== "undefined") {
  socketClient.connect()
}
