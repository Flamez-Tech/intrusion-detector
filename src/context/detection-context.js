"use client"

import { createContext, useContext } from "react"
import { useDetectionData } from "@/src/hooks/useDetectionData"

const DetectionContext = createContext(null)

export function DetectionProvider({ children }) {
  const detectionData = useDetectionData()

  return <DetectionContext.Provider value={detectionData}>{children}</DetectionContext.Provider>
}

export function useDetectionContext() {
  const context = useContext(DetectionContext)
  if (!context) {
    throw new Error("useDetectionContext must be used within a DetectionProvider")
  }
  return context
}
