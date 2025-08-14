import { detectionService } from "@/src/server/services/detectionService.js"

export async function POST(request) {
  try {
    const { threshold } = await request.json()

    if (threshold === undefined || threshold === null) {
      return Response.json(
        {
          success: false,
          message: "Threshold parameter is required",
        },
        { status: 400 },
      )
    }

    const numThreshold = Number.parseFloat(threshold)

    if (Number.isNaN(numThreshold) || numThreshold < 0.5 || numThreshold > 5.0) {
      return Response.json(
        {
          success: false,
          message: "Threshold must be a number between 0.5 and 5.0",
        },
        { status: 400 },
      )
    }

    detectionService.setThreshold(numThreshold)

    return Response.json({
      success: true,
      message: `Detection threshold set to ${numThreshold}`,
      threshold: numThreshold,
      status: detectionService.getStatus(),
    })
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "Failed to set threshold",
        error: error.message,
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const status = detectionService.getStatus()
    return Response.json({
      success: true,
      threshold: status.detector.threshold,
      isReady: status.detector.isReady,
      sampleCount: status.detector.sampleCount,
    })
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "Failed to get threshold",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
