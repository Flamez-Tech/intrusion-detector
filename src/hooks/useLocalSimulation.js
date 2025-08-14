"use client";

import { useState, useEffect } from "react";
import localSimulation from "../lib/localSimulation";

export function useLocalSimulation() {
  const [status, setStatus] = useState(localSimulation.getStatus());
  const [events, setEvents] = useState(localSimulation.getEvents());
  const [alerts, setAlerts] = useState(localSimulation.getAlerts());
  const [anomalyScores, setAnomalyScores] = useState(
    localSimulation.getAnomalyScores()
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Listen for updates
    const unsubscribe = localSimulation.on((type, data) => {
      if (type === "event") {
        setEvents((prev) => [data, ...prev.slice(0, 49)]);
        setStatus(localSimulation.getStatus());
      } else if (type === "alert") {
        setAlerts((prev) => [data, ...prev.slice(0, 19)]);
      } else if (type === "anomalyScore") {
        setAnomalyScores((prev) => [data, ...prev.slice(0, 99)]);
      }
    });

    // Initial data load
    setEvents(localSimulation.getEvents());
    setAlerts(localSimulation.getAlerts());
    setAnomalyScores(localSimulation.getAnomalyScores());
    setStatus(localSimulation.getStatus());

    return unsubscribe;
  }, []);

  const startSimulation = async () => {
    setIsLoading(true);
    try {
      const result = localSimulation.start();
      setStatus(localSimulation.getStatus());
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const stopSimulation = async () => {
    setIsLoading(true);
    try {
      const result = localSimulation.stop();
      setStatus(localSimulation.getStatus());
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    status,
    events,
    alerts,
    anomalyScores,
    isLoading,
    startSimulation,
    stopSimulation,
  };
}
