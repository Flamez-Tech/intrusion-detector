import { detectionService } from "@/src/server/services/detectionService.js"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const count = Number.parseInt(searchParams.get("count")) || 50
    const limitedCount = Math.min(Math.max(count, 1), 200) // Limit between 1-200

    const events = detectionService.getRecentEvents(limitedCount)

    return Response.json({
      success: true,
      data: events,
      count: events.length,
    })
  } catch (error) {
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
