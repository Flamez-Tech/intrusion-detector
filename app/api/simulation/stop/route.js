import { getMockDetectionService } from "@/src/lib/mockDetectionService.js";

export async function POST() {
  try {
    const detectionService = getMockDetectionService();
    const currentStatus = detectionService.getStatus();

    if (!currentStatus.isRunning) {
      return Response.json({
        success: true,
        message: "Simulation is already stopped",
        status: currentStatus,
      });
    }

    const result = detectionService.stop();

    if (result.success) {
      return Response.json({
        success: true,
        message: result.message,
        status: detectionService.getStatus(),
      });
    } else {
      return Response.json({
        success: true, // Return success true for consistency
        message: result.message,
        status: detectionService.getStatus(),
      });
    }
  } catch (error) {
    console.error("Stop simulation API error:", error);
    return Response.json(
      {
        success: false,
        message: "Failed to stop simulation",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
