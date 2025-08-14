import { getMockDetectionService } from "@/src/lib/mockDetectionService.js";

export async function GET() {
  try {
    const detectionService = getMockDetectionService();
    const status = detectionService.getStatus();

    return Response.json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error("Status API error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to get status",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
