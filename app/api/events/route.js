import { getMockDetectionService } from "@/src/lib/mockDetectionService.js"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const count = Number.parseInt(searchParams.get("count")) || 50
    const limitedCount = Math.min(Math.max(count, 1), 200)

    const detectionService = getMockDetectionService()
    const events = detectionService.getRecentEvents(limitedCount)

    return Response.json({
      success: true,
      data: events,
      count: events.length,
    })
  } catch (error) {
    console.error("Events API error:", error)
    return Response.json(
      {
        success: false,
        message: "Failed to get events",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
