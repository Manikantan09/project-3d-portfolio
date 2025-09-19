// Flexprice Billing Integration for CFO Helper Agent
// Bills per scenario simulated and per report exported

export interface BillingEvent {
  id: string
  type: "scenario_simulation" | "report_export"
  timestamp: Date
  userId: string
  metadata: {
    scenarioId?: string
    scenarioName?: string
    reportType?: string
    projectionMonths?: number
  }
  cost: number
  status: "pending" | "billed" | "failed"
}

export interface BillingConfig {
  scenarioSimulationCost: number // Cost per scenario simulation
  reportExportCost: number // Cost per report export
  currency: string
  apiKey: string
  endpoint: string
}

export class FlexpriceClient {
  private config: BillingConfig
  private events: BillingEvent[] = []

  constructor(config: BillingConfig) {
    this.config = config
  }

  // Create a billing event for scenario simulation
  async billScenarioSimulation(
    userId: string,
    scenarioId: string,
    scenarioName: string,
    projectionMonths = 24,
  ): Promise<BillingEvent> {
    const event: BillingEvent = {
      id: crypto.randomUUID(),
      type: "scenario_simulation",
      timestamp: new Date(),
      userId,
      metadata: {
        scenarioId,
        scenarioName,
        projectionMonths,
      },
      cost: this.config.scenarioSimulationCost,
      status: "pending",
    }

    try {
      // In a real implementation, this would call the Flexprice API
      await this.sendBillingEvent(event)
      event.status = "billed"
      this.events.push(event)

      console.log(`[Flexprice] Billed $${event.cost} for scenario simulation: ${scenarioName}`)
      return event
    } catch (error) {
      event.status = "failed"
      this.events.push(event)
      console.error("[Flexprice] Failed to bill scenario simulation:", error)
      throw error
    }
  }

  // Create a billing event for report export
  async billReportExport(userId: string, reportType: string, scenarioId?: string): Promise<BillingEvent> {
    const event: BillingEvent = {
      id: crypto.randomUUID(),
      type: "report_export",
      timestamp: new Date(),
      userId,
      metadata: {
        reportType,
        scenarioId,
      },
      cost: this.config.reportExportCost,
      status: "pending",
    }

    try {
      // In a real implementation, this would call the Flexprice API
      await this.sendBillingEvent(event)
      event.status = "billed"
      this.events.push(event)

      console.log(`[Flexprice] Billed $${event.cost} for report export: ${reportType}`)
      return event
    } catch (error) {
      event.status = "failed"
      this.events.push(event)
      console.error("[Flexprice] Failed to bill report export:", error)
      throw error
    }
  }

  // Mock API call to Flexprice
  private async sendBillingEvent(event: BillingEvent): Promise<void> {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Mock API request
    const payload = {
      event_id: event.id,
      user_id: event.userId,
      event_type: event.type,
      amount: event.cost,
      currency: this.config.currency,
      timestamp: event.timestamp.toISOString(),
      metadata: event.metadata,
    }

    // In production, this would be:
    // const response = await fetch(this.config.endpoint, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${this.config.apiKey}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(payload),
    // })

    // if (!response.ok) {
    //   throw new Error(`Flexprice API error: ${response.statusText}`)
    // }

    console.log("[Flexprice] Mock API call:", payload)
  }

  // Get billing summary for a user
  getBillingSummary(userId: string): {
    totalCost: number
    scenarioSimulations: number
    reportExports: number
    events: BillingEvent[]
  } {
    const userEvents = this.events.filter((event) => event.userId === userId)
    const scenarioSimulations = userEvents.filter((event) => event.type === "scenario_simulation").length
    const reportExports = userEvents.filter((event) => event.type === "report_export").length
    const totalCost = userEvents
      .filter((event) => event.status === "billed")
      .reduce((sum, event) => sum + event.cost, 0)

    return {
      totalCost,
      scenarioSimulations,
      reportExports,
      events: userEvents,
    }
  }

  // Get all events (for admin purposes)
  getAllEvents(): BillingEvent[] {
    return [...this.events]
  }
}

// Default billing configuration
export const defaultBillingConfig: BillingConfig = {
  scenarioSimulationCost: 0.1, // $0.10 per scenario simulation
  reportExportCost: 0.25, // $0.25 per report export
  currency: "USD",
  apiKey: process.env.FLEXPRICE_API_KEY || "mock-api-key",
  endpoint: process.env.FLEXPRICE_ENDPOINT || "https://api.flexprice.com/v1/events",
}

// Singleton instance
export const flexpriceClient = new FlexpriceClient(defaultBillingConfig)
