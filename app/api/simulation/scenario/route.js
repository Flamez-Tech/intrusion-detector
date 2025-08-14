import { detectionService } from "@/src/server/services/detectionService.js"

export async function POST(request) {
  try {
    const { scenario } = await request.json()

    if (!scenario) {
      return Response.json(
        {
          success: false,
          message: "Scenario parameter is required",
        },
        { status: 400 },
      )
    }

    const success = detectionService.setScenario(scenario)

    if (success) {
      return Response.json({
        success: true,
        message: `Scenario changed to ${scenario}`,
        currentScenario: scenario,
        status: detectionService.getStatus(),
      })
    } else {
      return Response.json(
        {
          success: false,
          message: "Invalid scenario",
        },
        { status: 400 },
      )
    }
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "Failed to change scenario",
        error: error.message,
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const status = detectionService.getStatus()
    return Response.json({
      success: true,
      currentScenario: status.simulator.currentScenario,
      availableScenarios: status.simulator.availableScenarios,
    })
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "Failed to get scenarios",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
