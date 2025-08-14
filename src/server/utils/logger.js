export class Logger {
  static log(level, message, data = null) {
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...(data && { data }),
    }

    console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`, data ? data : "")
    return logEntry
  }

  static info(message, data) {
    return this.log("info", message, data)
  }

  static warn(message, data) {
    return this.log("warn", message, data)
  }

  static error(message, data) {
    return this.log("error", message, data)
  }

  static debug(message, data) {
    if (process.env.NODE_ENV === "development") {
      return this.log("debug", message, data)
    }
  }
}
