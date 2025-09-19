export interface UsageEvent {
  id: string
  userId: string
  eventType: "scenario_run" | "report_generated" | "data_updated" | "session_start" | "feature_used"
  timestamp: Date
  metadata: {
    scenarioId?: string
    reportType?: string
    featureName?: string
    duration?: number
    success: boolean
    billingAmount?: number
  }
}

export interface UsageStats {
  totalScenarios: number
  totalReports: number
  totalBillingAmount: number
  averageSessionDuration: number
  mostUsedFeatures: Array<{ feature: string; count: number }>
  dailyUsage: Array<{ date: string; scenarios: number; reports: number }>
  monthlyTrends: Array<{ month: string; scenarios: number; reports: number; billing: number }>
}

export class UsageAnalytics {
  private static events: UsageEvent[] = []
  private static sessionStart: Date | null = null

  static startSession(userId: string) {
    this.sessionStart = new Date()
    this.trackEvent(userId, "session_start", {
      success: true,
    })
  }

  static trackEvent(userId: string, eventType: UsageEvent["eventType"], metadata: UsageEvent["metadata"]) {
    const event: UsageEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      eventType,
      timestamp: new Date(),
      metadata,
    }

    this.events.push(event)

    // Keep only last 1000 events to prevent memory issues
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000)
    }

    console.log("[Usage Analytics] Event tracked:", event)
  }

  static trackScenarioRun(userId: string, scenarioId: string, success: boolean, billingAmount?: number) {
    this.trackEvent(userId, "scenario_run", {
      scenarioId,
      success,
      billingAmount,
    })
  }

  static trackReportGeneration(userId: string, reportType: string, success: boolean, billingAmount?: number) {
    this.trackEvent(userId, "report_generated", {
      reportType,
      success,
      billingAmount,
    })
  }

  static trackFeatureUsage(userId: string, featureName: string) {
    this.trackEvent(userId, "feature_used", {
      featureName,
      success: true,
    })
  }

  static getUsageStats(userId: string): UsageStats {
    const userEvents = this.events.filter((e) => e.userId === userId)

    const totalScenarios = userEvents.filter((e) => e.eventType === "scenario_run" && e.metadata.success).length
    const totalReports = userEvents.filter((e) => e.eventType === "report_generated" && e.metadata.success).length
    const totalBillingAmount = userEvents.reduce((sum, e) => sum + (e.metadata.billingAmount || 0), 0)

    // Calculate average session duration
    const sessionEvents = userEvents.filter((e) => e.eventType === "session_start")
    const averageSessionDuration =
      sessionEvents.length > 0
        ? (Date.now() - sessionEvents[0].timestamp.getTime()) / sessionEvents.length / 1000 / 60
        : 0

    // Most used features
    const featureUsage = userEvents
      .filter((e) => e.eventType === "feature_used")
      .reduce(
        (acc, e) => {
          const feature = e.metadata.featureName || "unknown"
          acc[feature] = (acc[feature] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

    const mostUsedFeatures = Object.entries(featureUsage)
      .map(([feature, count]) => ({ feature, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Daily usage (last 7 days)
    const dailyUsage = this.getDailyUsage(userEvents, 7)

    // Monthly trends (last 6 months)
    const monthlyTrends = this.getMonthlyTrends(userEvents, 6)

    return {
      totalScenarios,
      totalReports,
      totalBillingAmount,
      averageSessionDuration,
      mostUsedFeatures,
      dailyUsage,
      monthlyTrends,
    }
  }

  private static getDailyUsage(events: UsageEvent[], days: number) {
    const dailyUsage = []
    const now = new Date()

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]

      const dayEvents = events.filter((e) => e.timestamp.toISOString().split("T")[0] === dateStr)

      dailyUsage.push({
        date: dateStr,
        scenarios: dayEvents.filter((e) => e.eventType === "scenario_run" && e.metadata.success).length,
        reports: dayEvents.filter((e) => e.eventType === "report_generated" && e.metadata.success).length,
      })
    }

    return dailyUsage
  }

  private static getMonthlyTrends(events: UsageEvent[], months: number) {
    const monthlyTrends = []
    const now = new Date()

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthStr = date.toISOString().slice(0, 7) // YYYY-MM format

      const monthEvents = events.filter((e) => e.timestamp.toISOString().slice(0, 7) === monthStr)

      monthlyTrends.push({
        month: monthStr,
        scenarios: monthEvents.filter((e) => e.eventType === "scenario_run" && e.metadata.success).length,
        reports: monthEvents.filter((e) => e.eventType === "report_generated" && e.metadata.success).length,
        billing: monthEvents.reduce((sum, e) => sum + (e.metadata.billingAmount || 0), 0),
      })
    }

    return monthlyTrends
  }

  static exportUsageData(userId: string): string {
    const stats = this.getUsageStats(userId)
    const userEvents = this.events.filter((e) => e.userId === userId)

    const exportData = {
      exportedAt: new Date().toISOString(),
      userId,
      summary: stats,
      events: userEvents.map((e) => ({
        ...e,
        timestamp: e.timestamp.toISOString(),
      })),
    }

    return JSON.stringify(exportData, null, 2)
  }

  static clearUserData(userId: string) {
    this.events = this.events.filter((e) => e.userId !== userId)
  }
}
