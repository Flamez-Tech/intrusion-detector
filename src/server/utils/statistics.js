export class Statistics {
  static mean(values) {
    if (values.length === 0) return 0
    return values.reduce((sum, val) => sum + val, 0) / values.length
  }

  static standardDeviation(values, mean = null) {
    if (values.length < 2) return 0

    const avg = mean !== null ? mean : this.mean(values)
    const squaredDiffs = values.map((val) => Math.pow(val - avg, 2))
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / (values.length - 1)

    return Math.sqrt(variance)
  }

  static zScore(value, mean, standardDeviation) {
    if (standardDeviation === 0) return 0
    return (value - mean) / standardDeviation
  }

  static rollingWindow(array, windowSize) {
    if (array.length <= windowSize) return array
    return array.slice(-windowSize)
  }

  static percentile(values, percentile) {
    if (values.length === 0) return 0

    const sorted = [...values].sort((a, b) => a - b)
    const index = (percentile / 100) * (sorted.length - 1)

    if (Number.isInteger(index)) {
      return sorted[index]
    }

    const lower = Math.floor(index)
    const upper = Math.ceil(index)
    const weight = index - lower

    return sorted[lower] * (1 - weight) + sorted[upper] * weight
  }
}
