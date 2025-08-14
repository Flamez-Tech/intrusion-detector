import { detectionService } from "@/src/server/services/detectionService.js"

export async function POST() {
  try {
    const success = detectionService.start()

    if (success) {
      return Response.json({
        success: true,
        message: "Simulation started successfully",
        status: detectionService.getStatus(),
      })
    } else {
      return Response.json(
        {
          success: false,
          message: "Simulation is already running",
        },
        { status: 400 },
      )
    }
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "Failed to start simulation",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
