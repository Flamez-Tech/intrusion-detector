import { detectionService } from "@/src/server/services/detectionService.js"

export async function GET() {
  try {
    const status = detectionService.getStatus()
    return Response.json({
      success: true,
      data: status,
    })
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "Failed to get status",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
