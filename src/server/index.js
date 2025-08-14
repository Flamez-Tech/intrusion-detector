import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import cors from "cors"
import dotenv from "dotenv"
import { detectionService } from "./services/detectionService.js"
import { Logger } from "./utils/logger.js"

// Load environment variables
dotenv.config()

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "https://yourfrontend.com",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: detectionService.getStatus(),
  })
})

// Socket.IO connection handling
io.on("connection", (socket) => {
  Logger.info("Client connected", { socketId: socket.id })

  // Subscribe to detection service events
  const unsubscribe = detectionService.subscribe((event) => {
    socket.emit(event.type, event.data)
  })

  // Send initial status
  socket.emit("status", detectionService.getStatus())
  socket.emit("recent_events", detectionService.getRecentEvents(20))
  socket.emit("recent_alerts", detectionService.getRecentAlerts(10))

  // Handle client disconnect
  socket.on("disconnect", () => {
    Logger.info("Client disconnected", { socketId: socket.id })
    unsubscribe()
  })

  // Handle client requests for current data
  socket.on("request_current_data", () => {
    socket.emit("status", detectionService.getStatus())
    socket.emit("recent_events", detectionService.getRecentEvents(20))
    socket.emit("recent_alerts", detectionService.getRecentAlerts(10))
    socket.emit("anomaly", detectionService.getCurrentAnomalyData())
  })
})

// Start server
server.listen(PORT, () => {
  Logger.info(`Detection server running on port ${PORT}`)

  // Auto-start detection service in development
  if (process.env.NODE_ENV === "development") {
    setTimeout(() => {
      detectionService.start()
      Logger.info("Auto-started detection service in development mode")
    }, 2000)
  }
})

// Graceful shutdown
process.on("SIGTERM", () => {
  Logger.info("Received SIGTERM, shutting down gracefully")
  detectionService.stop()
  server.close(() => {
    Logger.info("Server closed")
    process.exit(0)
  })
})

process.on("SIGINT", () => {
  Logger.info("Received SIGINT, shutting down gracefully")
  detectionService.stop()
  server.close(() => {
    Logger.info("Server closed")
    process.exit(0)
  })
})

export default app
