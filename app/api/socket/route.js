export async function GET(request) {
  try {
    // Import detection service dynamically to avoid server-side issues
    const { detectionService } = await import(
      "@/src/server/services/detectionService.js"
    );

    // Check if service is properly initialized
    if (!detectionService) {
      throw new Error("Detection service not available");
    }

    // Get current status without starting if not needed
    const currentStatus = detectionService.getStatus();

    return Response.json({
      status: "Socket.IO endpoint ready",
      detectionStatus: currentStatus,
      message: "Detection service is available",
    });
  } catch (error) {
    console.error("Socket.IO initialization error:", error);
    return Response.json(
      {
        error: "Failed to initialize Socket.IO",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { detectionService } = await import(
      "@/src/server/services/detectionService.js"
    );

    if (!detectionService) {
      throw new Error("Detection service not available");
    }

    const body = await request.json();

    // Handle different socket actions
    switch (body.action) {
      case "start":
        const startResult = detectionService.start();
        return Response.json({
          success: startResult,
          message: startResult ? "Service started" : "Service already running",
        });
      case "stop":
        const stopResult = detectionService.stop();
        return Response.json({
          success: stopResult,
          message: stopResult ? "Service stopped" : "Service not running",
        });
      case "getStatus":
        return Response.json({
          success: true,
          data: detectionService.getStatus(),
        });
      default:
        return Response.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Socket action error:", error);
    return Response.json(
      {
        error: error.message,
        success: false,
      },
      { status: 500 }
    );
  }
}
