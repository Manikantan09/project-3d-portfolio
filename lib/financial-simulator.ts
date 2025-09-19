export interface FinancialScenario {
  id: string
  name: string
  currentCash: number
  monthlyRevenue: number
  monthlyExpenses: number
  teamSize: number
  avgSalary: number
  marketingSpend: number
  priceIncrease: number
  revenueGrowthRate: number
  expenseGrowthRate: number
  seasonalityFactor: number[]
  oneTimeExpenses: { month: number; amount: number; description: string }[]
  oneTimeRevenue: { month: number; amount: number; description: string }[]
}

export interface MonthlyProjection {
  month: number
  revenue: number
  expenses: number
  netCashFlow: number
  cumulativeCash: number
  burnRate: number
  runway: number
  teamCost: number
  marketingCost: number
  baseExpenses: number
  isRunwayEnd: boolean
}

export interface ScenarioResult {
  scenario: FinancialScenario
  projections: MonthlyProjection[]
  summary: {
    totalRunwayMonths: number
    breakEvenMonth: number | null
    maxCashPosition: number
    minCashPosition: number
    totalRevenue: number
    totalExpenses: number
    averageBurnRate: number
    profitableMonths: number
  }
  risks: string[]
  opportunities: string[]
}

export class FinancialSimulator {
  private static readonly DEFAULT_PROJECTION_MONTHS = 24

  static createDefaultScenario(): FinancialScenario {
    return {
      id: crypto.randomUUID(),
      name: "Base Scenario",
      currentCash: 500000,
      monthlyRevenue: 50000,
      monthlyExpenses: 35000,
      teamSize: 5,
      avgSalary: 8000,
      marketingSpend: 5000,
      priceIncrease: 0,
      revenueGrowthRate: 0,
      expenseGrowthRate: 0,
      seasonalityFactor: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // No seasonality by default
      oneTimeExpenses: [],
      oneTimeRevenue: [],
    }
  }

  static simulateScenario(
    scenario: FinancialScenario,
    months: number = this.DEFAULT_PROJECTION_MONTHS,
  ): ScenarioResult {
    const projections: MonthlyProjection[] = []
    let runningCash = scenario.currentCash
    let currentRevenue = scenario.monthlyRevenue * (1 + scenario.priceIncrease / 100)
    let currentExpenses = scenario.monthlyExpenses
    let breakEvenMonth: number | null = null
    let runwayEndMonth: number | null = null

    for (let month = 1; month <= months; month++) {
      // Apply growth rates
      if (month > 1) {
        currentRevenue *= 1 + scenario.revenueGrowthRate / 100
        currentExpenses *= 1 + scenario.expenseGrowthRate / 100
      }

      // Apply seasonality
      const seasonalIndex = (month - 1) % 12
      const seasonalRevenue = currentRevenue * scenario.seasonalityFactor[seasonalIndex]

      // Calculate costs
      const teamCost = scenario.teamSize * scenario.avgSalary
      const marketingCost = scenario.marketingSpend
      const baseExpenses = currentExpenses

      // Add one-time expenses and revenue
      const oneTimeExpense = scenario.oneTimeExpenses
        .filter((expense) => expense.month === month)
        .reduce((sum, expense) => sum + expense.amount, 0)

      const oneTimeRev = scenario.oneTimeRevenue
        .filter((revenue) => revenue.month === month)
        .reduce((sum, revenue) => sum + revenue.amount, 0)

      const totalRevenue = seasonalRevenue + oneTimeRev
      const totalExpenses = baseExpenses + teamCost + marketingCost + oneTimeExpense
      const netCashFlow = totalRevenue - totalExpenses

      runningCash += netCashFlow
      const burnRate = totalExpenses
      const runway = runningCash > 0 ? Math.ceil(runningCash / burnRate) : 0

      // Check for break-even
      if (breakEvenMonth === null && netCashFlow >= 0) {
        breakEvenMonth = month
      }

      // Check for runway end
      const isRunwayEnd = runningCash <= 0 && runwayEndMonth === null
      if (isRunwayEnd) {
        runwayEndMonth = month
      }

      projections.push({
        month,
        revenue: totalRevenue,
        expenses: totalExpenses,
        netCashFlow,
        cumulativeCash: Math.max(0, runningCash),
        burnRate,
        runway,
        teamCost,
        marketingCost,
        baseExpenses,
        isRunwayEnd,
      })

      // Stop simulation if cash runs out
      if (runningCash <= 0) break
    }

    // Calculate summary metrics
    const summary = this.calculateSummary(projections, runwayEndMonth)
    const risks = this.identifyRisks(scenario, projections)
    const opportunities = this.identifyOpportunities(scenario, projections)

    return {
      scenario,
      projections,
      summary,
      risks,
      opportunities,
    }
  }

  private static calculateSummary(projections: MonthlyProjection[], runwayEndMonth: number | null) {
    const totalRevenue = projections.reduce((sum, p) => sum + p.revenue, 0)
    const totalExpenses = projections.reduce((sum, p) => sum + p.expenses, 0)
    const averageBurnRate = totalExpenses / projections.length
    const profitableMonths = projections.filter((p) => p.netCashFlow > 0).length
    const maxCashPosition = Math.max(...projections.map((p) => p.cumulativeCash))
    const minCashPosition = Math.min(...projections.map((p) => p.cumulativeCash))
    const breakEvenMonth = projections.find((p) => p.netCashFlow >= 0)?.month || null

    return {
      totalRunwayMonths: runwayEndMonth || projections.length,
      breakEvenMonth,
      maxCashPosition,
      minCashPosition,
      totalRevenue,
      totalExpenses,
      averageBurnRate,
      profitableMonths,
    }
  }

  private static identifyRisks(scenario: FinancialScenario, projections: MonthlyProjection[]): string[] {
    const risks: string[] = []
    const lastProjection = projections[projections.length - 1]

    if (lastProjection.runway < 6) {
      risks.push("Critical runway: Less than 6 months of cash remaining")
    }

    if (scenario.revenueGrowthRate < 0) {
      risks.push("Declining revenue trend may accelerate cash burn")
    }

    if (scenario.expenseGrowthRate > scenario.revenueGrowthRate) {
      risks.push("Expenses growing faster than revenue")
    }

    const burnRate = projections[projections.length - 1]?.burnRate || 0
    if (burnRate > scenario.monthlyRevenue * 2) {
      risks.push("High burn rate relative to revenue")
    }

    const teamCostRatio = (scenario.teamSize * scenario.avgSalary) / scenario.monthlyRevenue
    if (teamCostRatio > 0.8) {
      risks.push("Team costs represent high percentage of revenue")
    }

    return risks
  }

  private static identifyOpportunities(scenario: FinancialScenario, projections: MonthlyProjection[]): string[] {
    const opportunities: string[] = []

    if (scenario.priceIncrease === 0) {
      opportunities.push("Consider price optimization to improve margins")
    }

    if (scenario.revenueGrowthRate === 0) {
      opportunities.push("Revenue growth initiatives could extend runway significantly")
    }

    const profitableMonths = projections.filter((p) => p.netCashFlow > 0).length
    if (profitableMonths > projections.length * 0.5) {
      opportunities.push("Strong path to profitability - consider growth investments")
    }

    if (scenario.marketingSpend < scenario.monthlyRevenue * 0.2) {
      opportunities.push("Marketing spend is conservative - growth opportunity exists")
    }

    const lastProjection = projections[projections.length - 1]
    if (lastProjection.cumulativeCash > scenario.currentCash) {
      opportunities.push("Scenario shows positive cash generation")
    }

    return opportunities
  }

  static compareScenarios(scenarios: FinancialScenario[]): {
    results: ScenarioResult[]
    comparison: {
      bestRunway: string
      bestCashFlow: string
      mostProfitable: string
      riskiest: string
    }
  } {
    const results = scenarios.map((scenario) => this.simulateScenario(scenario))

    const bestRunway = results.reduce((best, current) =>
      current.summary.totalRunwayMonths > best.summary.totalRunwayMonths ? current : best,
    ).scenario.name

    const bestCashFlow = results.reduce((best, current) => {
      const currentAvgCashFlow =
        current.projections.reduce((sum, p) => sum + p.netCashFlow, 0) / current.projections.length
      const bestAvgCashFlow = best.projections.reduce((sum, p) => sum + p.netCashFlow, 0) / best.projections.length
      return currentAvgCashFlow > bestAvgCashFlow ? current : best
    }).scenario.name

    const mostProfitable = results.reduce((best, current) =>
      current.summary.profitableMonths > best.summary.profitableMonths ? current : best,
    ).scenario.name

    const riskiest = results.reduce((riskiest, current) =>
      current.risks.length > riskiest.risks.length ? current : riskiest,
    ).scenario.name

    return {
      results,
      comparison: {
        bestRunway,
        bestCashFlow,
        mostProfitable,
        riskiest,
      },
    }
  }
}
