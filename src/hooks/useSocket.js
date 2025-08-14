"use client"

import { useEffect, useRef, useState } from "react"
import { socketClient } from "@/src/lib/socket"

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState(null)
  const listenersRef = useRef(new Set())

  useEffect(() => {
    // Connect to socket
    socketClient.connect()

    // Listen for connection status changes
    const unsubscribeConnection = socketClient.on("connection_status", ({ connected }) => {
      setIsConnected(connected)
      if (connected) {
        setConnectionError(null)
      }
    })

    const unsubscribeError = socketClient.on("connection_error", ({ error }) => {
      setConnectionError(error)
      setIsConnected(false)
    })

    // Store unsubscribe functions
    listenersRef.current.add(unsubscribeConnection)
    listenersRef.current.add(unsubscribeError)

    // Set initial connection status
    const status = socketClient.getConnectionStatus()
    setIsConnected(status.connected)

    return () => {
      // Clean up all listeners
      listenersRef.current.forEach((unsubscribe) => unsubscribe())
      listenersRef.current.clear()
    }
  }, [])

  const subscribe = (event, callback) => {
    const unsubscribe = socketClient.on(event, callback)
    listenersRef.current.add(unsubscribe)
    return unsubscribe
  }

  const requestCurrentData = () => {
    socketClient.requestCurrentData()
  }

  return {
    isConnected,
    connectionError,
    subscribe,
    requestCurrentData,
    socket: socketClient,
  }
}
