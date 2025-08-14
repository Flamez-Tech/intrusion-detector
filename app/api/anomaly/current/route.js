import { detectionService } from "@/src/server/services/detectionService.js"

export async function GET() {
  try {
    const anomalyData = detectionService.getCurrentAnomalyData()

    return Response.json({
      success: true,
      data: anomalyData,
    })
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "Failed to get current anomaly data",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
