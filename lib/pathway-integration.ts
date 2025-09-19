// Pathway Integration for Real-time Financial Data Updates
// Simulates live data feeds for expenses, revenue, and market conditions

export interface PathwayDataPoint {
  id: string
  timestamp: Date
  type: "revenue" | "expense" | "market_condition" | "team_update"
  value: number
  description: string
  source: string
  confidence: number // 0-1 scale
  metadata: Record<string, any>
}

export interface PathwayConfig {
  apiKey: string
  endpoint: string
  updateInterval: number // milliseconds
  enableRealTimeUpdates: boolean
}

export interface LiveDataUpdate {
  revenueUpdate?: number
  expenseUpdate?: number
  marketMultiplier?: number
  teamSizeChange?: number
  lastUpdated: Date
  dataPoints: PathwayDataPoint[]
}

export class PathwayClient {
  private config: PathwayConfig
  private subscribers: ((update: LiveDataUpdate) => void)[] = []
  private intervalId: NodeJS.Timeout | null = null
  private mockDataPoints: PathwayDataPoint[] = []

  constructor(config: PathwayConfig) {
    this.config = config
    this.generateMockData()
  }

  // Generate mock financial data points
  private generateMockData() {
    const now = new Date()
    const sources = ["Stripe", "QuickBooks", "Bank API", "CRM", "Analytics", "Market Data"]

    // Generate revenue data points
    for (let i = 0; i < 10; i++) {
      this.mockDataPoints.push({
        id: crypto.randomUUID(),
        timestamp: new Date(now.getTime() - i * 3600000), // Last 10 hours
        type: "revenue",
        value: 2000 + Math.random() * 8000,
        description: `Payment received from customer ${Math.floor(Math.random() * 1000)}`,
        source: sources[Math.floor(Math.random() * sources.length)],
        confidence: 0.9 + Math.random() * 0.1,
        metadata: {
          customer_id: `cust_${Math.random().toString(36).substr(2, 9)}`,
          payment_method: ["card", "bank_transfer", "wire"][Math.floor(Math.random() * 3)],
        },
      })
    }

    // Generate expense data points
    for (let i = 0; i < 8; i++) {
      this.mockDataPoints.push({
        id: crypto.randomUUID(),
        timestamp: new Date(now.getTime() - i * 3600000),
        type: "expense",
        value: 500 + Math.random() * 3000,
        description: `${["Software subscription", "Office supplies", "Marketing spend", "Contractor payment"][Math.floor(Math.random() * 4)]}`,
        source: sources[Math.floor(Math.random() * sources.length)],
        confidence: 0.85 + Math.random() * 0.15,
        metadata: {
          category: ["software", "office", "marketing", "contractors"][Math.floor(Math.random() * 4)],
          vendor: `vendor_${Math.random().toString(36).substr(2, 6)}`,
        },
      })
    }

    // Generate market condition updates
    for (let i = 0; i < 5; i++) {
      this.mockDataPoints.push({
        id: crypto.randomUUID(),
        timestamp: new Date(now.getTime() - i * 7200000), // Every 2 hours
        type: "market_condition",
        value: 0.8 + Math.random() * 0.4, // Market multiplier between 0.8 and 1.2
        description: `Market sentiment: ${["Bullish", "Bearish", "Neutral", "Volatile"][Math.floor(Math.random() * 4)]}`,
        source: "Market Data API",
        confidence: 0.7 + Math.random() * 0.3,
        metadata: {
          sector: "SaaS",
          region: "North America",
          indicators: ["GDP", "Tech Index", "VC Funding"][Math.floor(Math.random() * 3)],
        },
      })
    }
  }

  // Start real-time data updates
  startRealTimeUpdates() {
    if (!this.config.enableRealTimeUpdates || this.intervalId) return

    this.intervalId = setInterval(() => {
      this.fetchAndBroadcastUpdate()
    }, this.config.updateInterval)

    console.log("[Pathway] Started real-time data updates")
  }

  // Stop real-time data updates
  stopRealTimeUpdates() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
      console.log("[Pathway] Stopped real-time data updates")
    }
  }

  // Subscribe to data updates
  subscribe(callback: (update: LiveDataUpdate) => void) {
    this.subscribers.push(callback)
    return () => {
      this.subscribers = this.subscribers.filter((sub) => sub !== callback)
    }
  }

  // Fetch fresh data and broadcast to subscribers
  private async fetchAndBroadcastUpdate() {
    try {
      const update = await this.fetchLiveData()
      this.subscribers.forEach((callback) => callback(update))
    } catch (error) {
      console.error("[Pathway] Failed to fetch live data:", error)
    }
  }

  // Mock API call to fetch live financial data
  private async fetchLiveData(): Promise<LiveDataUpdate> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Generate new mock data point
    const now = new Date()
    const newDataPoint: PathwayDataPoint = {
      id: crypto.randomUUID(),
      timestamp: now,
      type: ["revenue", "expense", "market_condition"][Math.floor(Math.random() * 3)] as any,
      value: 1000 + Math.random() * 5000,
      description: "Live data update",
      source: "Pathway API",
      confidence: 0.9,
      metadata: { live: true },
    }

    this.mockDataPoints.unshift(newDataPoint)
    this.mockDataPoints = this.mockDataPoints.slice(0, 50) // Keep last 50 points

    // Calculate aggregated updates
    const recentRevenue = this.mockDataPoints
      .filter((dp) => dp.type === "revenue" && dp.timestamp > new Date(now.getTime() - 3600000))
      .reduce((sum, dp) => sum + dp.value, 0)

    const recentExpenses = this.mockDataPoints
      .filter((dp) => dp.type === "expense" && dp.timestamp > new Date(now.getTime() - 3600000))
      .reduce((sum, dp) => sum + dp.value, 0)

    const latestMarketCondition = this.mockDataPoints
      .filter((dp) => dp.type === "market_condition")
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0]

    return {
      revenueUpdate: recentRevenue,
      expenseUpdate: recentExpenses,
      marketMultiplier: latestMarketCondition?.value || 1.0,
      lastUpdated: now,
      dataPoints: this.mockDataPoints.slice(0, 10), // Return last 10 data points
    }
  }

  // Get historical data points
  getHistoricalData(hours = 24): PathwayDataPoint[] {
    const cutoff = new Date(Date.now() - hours * 3600000)
    return this.mockDataPoints.filter((dp) => dp.timestamp > cutoff)
  }

  // Get data summary
  getDataSummary(): {
    totalRevenue: number
    totalExpenses: number
    dataPointCount: number
    lastUpdate: Date | null
    averageConfidence: number
  } {
    const totalRevenue = this.mockDataPoints
      .filter((dp) => dp.type === "revenue")
      .reduce((sum, dp) => sum + dp.value, 0)

    const totalExpenses = this.mockDataPoints
      .filter((dp) => dp.type === "expense")
      .reduce((sum, dp) => sum + dp.value, 0)

    const averageConfidence =
      this.mockDataPoints.length > 0
        ? this.mockDataPoints.reduce((sum, dp) => sum + dp.confidence, 0) / this.mockDataPoints.length
        : 0

    const lastUpdate =
      this.mockDataPoints.length > 0
        ? this.mockDataPoints.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0].timestamp
        : null

    return {
      totalRevenue,
      totalExpenses,
      dataPointCount: this.mockDataPoints.length,
      lastUpdate,
      averageConfidence,
    }
  }
}

// Default Pathway configuration
export const defaultPathwayConfig: PathwayConfig = {
  apiKey: process.env.PATHWAY_API_KEY || "mock-pathway-key",
  endpoint: process.env.PATHWAY_ENDPOINT || "https://api.pathway.com/v1/data",
  updateInterval: 30000, // 30 seconds
  enableRealTimeUpdates: true,
}

// Singleton instance
export const pathwayClient = new PathwayClient(defaultPathwayConfig)
