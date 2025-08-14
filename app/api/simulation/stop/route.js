import { detectionService } from "@/src/server/services/detectionService.js"

export async function POST() {
  try {
    const success = detectionService.stop()

    if (success) {
      return Response.json({
        success: true,
        message: "Simulation stopped successfully",
        status: detectionService.getStatus(),
      })
    } else {
      return Response.json(
        {
          success: false,
          message: "Simulation is not running",
        },
        { status: 400 },
      )
    }
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "Failed to stop simulation",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
