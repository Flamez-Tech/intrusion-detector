import { getMockDetectionService } from "@/src/lib/mockDetectionService.js";

export async function POST() {
  try {
    const detectionService = getMockDetectionService();
    const currentStatus = detectionService.getStatus();

    if (currentStatus.isRunning) {
      return Response.json({
        success: true,
        message: "Simulation is already running",
        status: currentStatus,
      });
    }

    const result = detectionService.start();

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
    console.error("Start simulation API error:", error);
    return Response.json(
      {
        success: false,
        message: "Failed to start simulation",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const detectionService = getMockDetectionService();
    return Response.json({
      success: true,
      status: detectionService.getStatus(),
    });
  } catch (error) {
    console.error("Get simulation status API error:", error);
    return Response.json(
      {
        success: false,
        message: "Failed to get simulation status",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
