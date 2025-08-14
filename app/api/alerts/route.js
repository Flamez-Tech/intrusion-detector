import { getMockDetectionService } from "@/src/lib/mockDetectionService.js";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const count = Number.parseInt(searchParams.get("count")) || 20;
    const limitedCount = Math.min(Math.max(count, 1), 100);

    const detectionService = getMockDetectionService();
    const alerts = detectionService.getRecentAlerts(limitedCount);

    return Response.json({
      success: true,
      data: alerts,
      count: alerts.length,
    });
  } catch (error) {
    console.error("Alerts API error:", error);
    return Response.json(
      {
        success: false,
        message: "Failed to get alerts",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const detectionService = getMockDetectionService();
    const result = detectionService.clearAlerts();

    return Response.json(result);
  } catch (error) {
    console.error("Clear alerts API error:", error);
    return Response.json(
      {
        success: false,
        message: "Failed to clear alerts",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
