import { detectionService } from "@/src/server/services/detectionService.js"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const count = Number.parseInt(searchParams.get("count")) || 20
    const limitedCount = Math.min(Math.max(count, 1), 100) // Limit between 1-100

    const alerts = detectionService.getRecentAlerts(limitedCount)

    return Response.json({
      success: true,
      data: alerts,
      count: alerts.length,
    })
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "Failed to get alerts",
        error: error.message,
      },
      { status: 500 },
    )
  }
}

export async function DELETE() {
  try {
    detectionService.clearAlerts()

    return Response.json({
      success: true,
      message: "Alert history cleared",
    })
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "Failed to clear alerts",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
