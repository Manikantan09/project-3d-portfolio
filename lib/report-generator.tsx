export interface ReportSection {
  id: string
  title: string
  type: "text" | "chart" | "table" | "metrics"
  content: string
  data?: any
}

export interface GeneratedReport {
  id: string
  title: string
  type: "executive_summary" | "detailed_forecast" | "risk_assessment" | "growth_opportunities"
  scenario: ScenarioResult
  sections: ReportSection[]
  generatedAt: Date
  config: ReportConfig
  metadata: {
    wordCount: number
    pageCount: number
    estimatedReadTime: number
  }
}

export interface ReportConfig {
  includeCharts: boolean
  includeRiskAnalysis: boolean
  includeOpportunities: boolean
  includeProjections: boolean
  includeLiveData: boolean
  format: "html" | "pdf"
  branding?: {
    companyName: string
    primaryColor: string
  }
}

import type { ScenarioResult } from "./financial-simulator"
import type { LiveDataUpdate } from "./pathway-integration"

export class ReportGenerator {
  static async generateReport(
    type: "executive_summary" | "detailed_forecast" | "risk_assessment" | "growth_opportunities",
    result: ScenarioResult,
    config: ReportConfig,
    liveData?: LiveDataUpdate,
  ): Promise<GeneratedReport> {
    const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const sections: ReportSection[] = []

    // Generate sections based on report type
    switch (type) {
      case "executive_summary":
        sections.push(
          {
            id: "overview",
            title: "Executive Overview",
            type: "text",
            content: this.generateExecutiveOverview(result, liveData),
          },
          {
            id: "key_metrics",
            title: "Key Financial Metrics",
            type: "metrics",
            content: "",
            data: this.extractKeyMetrics(result),
          },
          {
            id: "recommendations",
            title: "Strategic Recommendations",
            type: "text",
            content: this.generateRecommendations(result),
          },
        )
        break

      case "detailed_forecast":
        sections.push(
          {
            id: "forecast_summary",
            title: "Forecast Summary",
            type: "text",
            content: this.generateForecastSummary(result),
          },
          {
            id: "monthly_projections",
            title: "Monthly Financial Projections",
            type: "table",
            content: "",
            data: this.generateProjectionTable(result),
          },
          {
            id: "cash_flow_analysis",
            title: "Cash Flow Analysis",
            type: "chart",
            content: this.generateCashFlowAnalysis(result),
          },
        )
        break

      case "risk_assessment":
        sections.push(
          {
            id: "risk_overview",
            title: "Risk Assessment Overview",
            type: "text",
            content: this.generateRiskOverview(result),
          },
          {
            id: "risk_factors",
            title: "Identified Risk Factors",
            type: "table",
            content: "",
            data: this.generateRiskFactorsTable(result),
          },
          {
            id: "mitigation_strategies",
            title: "Risk Mitigation Strategies",
            type: "text",
            content: this.generateMitigationStrategies(result),
          },
        )
        break

      case "growth_opportunities":
        sections.push(
          {
            id: "growth_overview",
            title: "Growth Opportunities Overview",
            type: "text",
            content: this.generateGrowthOverview(result),
          },
          {
            id: "opportunity_matrix",
            title: "Opportunity Impact Matrix",
            type: "table",
            content: "",
            data: this.generateOpportunityMatrix(result),
          },
          {
            id: "implementation_roadmap",
            title: "Implementation Roadmap",
            type: "text",
            content: this.generateImplementationRoadmap(result),
          },
        )
        break
    }

    const content = sections.map((s) => s.content).join(" ")
    const wordCount = content.split(/\s+/).length

    return {
      id: reportId,
      title: this.getReportTitle(type, result),
      type,
      scenario: result,
      sections,
      generatedAt: new Date(),
      config,
      metadata: {
        wordCount,
        pageCount: Math.ceil(wordCount / 250), // Estimate 250 words per page
        estimatedReadTime: Math.ceil(wordCount / 200), // Estimate 200 words per minute
      },
    }
  }

  private static getReportTitle(type: string, result: ScenarioResult): string {
    const scenarioName = result.scenario.name
    switch (type) {
      case "executive_summary":
        return `Executive Summary: ${scenarioName}`
      case "detailed_forecast":
        return `Financial Forecast: ${scenarioName}`
      case "risk_assessment":
        return `Risk Assessment: ${scenarioName}`
      case "growth_opportunities":
        return `Growth Opportunities: ${scenarioName}`
      default:
        return `Financial Report: ${scenarioName}`
    }
  }

  private static generateExecutiveOverview(result: ScenarioResult, liveData?: LiveDataUpdate): string {
    const runway = result.projections[result.projections.length - 1]?.cumulativeCashFlow || 0
    const monthsToBreakeven = result.projections.findIndex((p) => p.cumulativeCashFlow > 0) + 1

    return `
# Executive Summary

Based on the financial scenario "${result.scenario.name}", our analysis reveals the following key insights:

## Financial Position
- **Current Runway**: ${runway > 0 ? `${Math.floor(runway / result.scenario.monthlyBurn)} months` : "Immediate cash flow concerns"}
- **Break-even Timeline**: ${monthsToBreakeven > 0 ? `${monthsToBreakeven} months` : "Not achieved within projection period"}
- **Monthly Burn Rate**: $${result.scenario.monthlyBurn.toLocaleString()}

## Key Findings
${runway < 0 ? "🚨 **Critical**: Negative cash flow projected. Immediate action required." : ""}
${monthsToBreakeven > 12 ? "⚠️ **Caution**: Break-even timeline exceeds 12 months." : ""}
${result.projections.some((p) => p.cumulativeCashFlow > result.scenario.initialCash * 1.5) ? "✅ **Positive**: Strong growth trajectory identified." : ""}

${
  liveData
    ? `## Live Data Integration
Recent market data shows ${liveData.type} updates affecting ${liveData.impact}. This has been factored into our projections.`
    : ""
}

## Strategic Implications
The scenario analysis indicates ${runway > 0 ? "sustainable" : "unsustainable"} financial performance under current assumptions. Key areas requiring attention include cost optimization, revenue acceleration, and cash flow management.
    `.trim()
  }

  private static extractKeyMetrics(result: ScenarioResult) {
    const finalProjection = result.projections[result.projections.length - 1]
    const totalRevenue = result.projections.reduce((sum, p) => sum + p.revenue, 0)
    const totalExpenses = result.projections.reduce((sum, p) => sum + p.expenses, 0)

    return {
      totalRevenue: `$${totalRevenue.toLocaleString()}`,
      totalExpenses: `$${totalExpenses.toLocaleString()}`,
      netProfit: `$${(totalRevenue - totalExpenses).toLocaleString()}`,
      finalCashPosition: `$${finalProjection?.cumulativeCashFlow.toLocaleString() || "0"}`,
      monthlyBurnRate: `$${result.scenario.monthlyBurn.toLocaleString()}`,
      projectionPeriod: `${result.projections.length} months`,
    }
  }

  private static generateRecommendations(result: ScenarioResult): string {
    const recommendations = []
    const finalCash = result.projections[result.projections.length - 1]?.cumulativeCashFlow || 0

    if (finalCash < 0) {
      recommendations.push("- **Immediate**: Reduce monthly burn rate by 20-30% through cost optimization")
      recommendations.push(
        "- **Short-term**: Accelerate revenue generation through pricing optimization or new customer acquisition",
      )
      recommendations.push("- **Medium-term**: Consider additional funding or strategic partnerships")
    } else {
      recommendations.push("- **Growth**: Consider strategic investments in marketing and product development")
      recommendations.push("- **Optimization**: Maintain current burn rate while scaling revenue")
      recommendations.push("- **Planning**: Prepare for next growth phase with scenario planning")
    }

    return `
# Strategic Recommendations

Based on the financial analysis, we recommend the following actions:

${recommendations.join("\n")}

## Implementation Priority
1. **High Priority**: Cash flow management and burn rate optimization
2. **Medium Priority**: Revenue growth initiatives and market expansion
3. **Low Priority**: Long-term strategic planning and infrastructure investments
    `.trim()
  }

  private static generateForecastSummary(result: ScenarioResult): string {
    return `
# Financial Forecast Summary

This detailed forecast covers ${result.projections.length} months of financial projections based on the scenario "${result.scenario.name}".

## Methodology
- Initial cash position: $${result.scenario.initialCash.toLocaleString()}
- Monthly burn rate: $${result.scenario.monthlyBurn.toLocaleString()}
- Revenue growth assumptions: Based on scenario parameters
- Expense scaling: Proportional to business growth

## Key Assumptions
- Market conditions remain stable
- No major external disruptions
- Operational efficiency maintained
- Customer acquisition costs remain consistent
    `.trim()
  }

  private static generateProjectionTable(result: ScenarioResult) {
    const headers = ["Month", "Revenue", "Expenses", "Net Cash Flow", "Cumulative Cash"]
    const rows = result.projections.map((p, index) => [
      `Month ${index + 1}`,
      `$${p.revenue.toLocaleString()}`,
      `$${p.expenses.toLocaleString()}`,
      `$${(p.revenue - p.expenses).toLocaleString()}`,
      `$${p.cumulativeCashFlow.toLocaleString()}`,
    ])

    return { headers, rows }
  }

  private static generateCashFlowAnalysis(result: ScenarioResult): string {
    return `
# Cash Flow Analysis

## Monthly Trends
The cash flow analysis reveals important patterns in your financial trajectory:

- **Revenue Growth**: ${result.projections[0].revenue < result.projections[result.projections.length - 1].revenue ? "Positive trend" : "Declining trend"}
- **Expense Management**: ${result.projections[0].expenses < result.projections[result.projections.length - 1].expenses ? "Scaling with growth" : "Cost optimization evident"}
- **Net Position**: ${result.projections[result.projections.length - 1].cumulativeCashFlow > 0 ? "Positive cash position" : "Negative cash position"}

## Critical Milestones
Key financial milestones identified in the projection period include break-even points, cash flow turning points, and growth inflection moments.
    `.trim()
  }

  private static generateRiskOverview(result: ScenarioResult): string {
    return `
# Risk Assessment Overview

This comprehensive risk analysis evaluates potential threats to the financial scenario "${result.scenario.name}".

## Risk Categories Evaluated
- **Financial Risks**: Cash flow, profitability, and funding risks
- **Operational Risks**: Execution, scaling, and efficiency risks  
- **Market Risks**: Competition, demand, and external factors
- **Strategic Risks**: Decision-making and opportunity costs

## Overall Risk Level
${result.projections[result.projections.length - 1]?.cumulativeCashFlow < 0 ? "🔴 **High Risk**: Negative cash flow trajectory" : "🟡 **Medium Risk**: Manageable with proper oversight"}
    `.trim()
  }

  private static generateRiskFactorsTable(result: ScenarioResult) {
    const headers = ["Risk Factor", "Probability", "Impact", "Severity", "Mitigation"]
    const rows = [
      ["Cash Flow Shortage", "Medium", "High", "Critical", "Reduce burn rate, increase revenue"],
      ["Market Competition", "High", "Medium", "Moderate", "Differentiation strategy, customer retention"],
      ["Operational Scaling", "Low", "High", "Moderate", "Process optimization, team building"],
      ["Economic Downturn", "Medium", "High", "High", "Diversification, cost flexibility"],
    ]

    return { headers, rows }
  }

  private static generateMitigationStrategies(result: ScenarioResult): string {
    return `
# Risk Mitigation Strategies

## Immediate Actions (0-3 months)
- Implement cash flow monitoring and early warning systems
- Establish contingency plans for various scenarios
- Optimize operational efficiency and reduce unnecessary costs

## Medium-term Strategies (3-12 months)  
- Diversify revenue streams and customer base
- Build strategic partnerships and alliances
- Strengthen financial reserves and funding options

## Long-term Planning (12+ months)
- Develop robust business model resilience
- Create multiple growth pathways and exit strategies
- Build organizational capabilities for uncertainty management
    `.trim()
  }

  private static generateGrowthOverview(result: ScenarioResult): string {
    return `
# Growth Opportunities Overview

Analysis of the "${result.scenario.name}" scenario reveals several potential growth opportunities and strategic initiatives.

## Growth Potential Assessment
${result.projections[result.projections.length - 1]?.cumulativeCashFlow > result.scenario.initialCash ? "✅ **High Growth Potential**: Strong financial foundation for expansion" : "⚠️ **Moderate Growth Potential**: Focus on stability before aggressive growth"}

## Opportunity Categories
- **Revenue Expansion**: New markets, products, and customer segments
- **Operational Excellence**: Efficiency improvements and cost optimization
- **Strategic Partnerships**: Collaborations and joint ventures
- **Technology Innovation**: Digital transformation and automation
    `.trim()
  }

  private static generateOpportunityMatrix(result: ScenarioResult) {
    const headers = ["Opportunity", "Impact", "Effort", "Timeline", "ROI Estimate"]
    const rows = [
      ["Market Expansion", "High", "Medium", "6-12 months", "150-300%"],
      ["Product Innovation", "High", "High", "12-18 months", "200-400%"],
      ["Operational Efficiency", "Medium", "Low", "3-6 months", "50-100%"],
      ["Strategic Partnerships", "Medium", "Medium", "6-9 months", "100-200%"],
    ]

    return { headers, rows }
  }

  private static generateImplementationRoadmap(result: ScenarioResult): string {
    return `
# Implementation Roadmap

## Phase 1: Foundation (Months 1-3)
- Establish baseline metrics and KPIs
- Implement core operational improvements
- Begin market research and opportunity validation

## Phase 2: Execution (Months 4-9)
- Launch priority growth initiatives
- Scale successful pilot programs
- Monitor and adjust strategies based on results

## Phase 3: Optimization (Months 10-12)
- Refine and optimize successful programs
- Prepare for next growth phase
- Evaluate and plan future opportunities

## Success Metrics
- Revenue growth targets
- Cost optimization goals
- Market share objectives
- Customer satisfaction benchmarks
    `.trim()
  }

  static generateHTML(report: GeneratedReport): string {
    const sectionsHTML = report.sections
      .map((section) => {
        let sectionContent = ""

        if (section.type === "metrics" && section.data) {
          const metricsHTML = Object.entries(section.data)
            .map(
              ([key, value]) => `
            <div class="metric-card">
              <div class="metric-value">${value}</div>
              <div class="metric-label">${key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}</div>
            </div>
          `,
            )
            .join("")
          sectionContent = `<div class="metrics-grid">${metricsHTML}</div>`
        } else if (section.type === "table" && section.data) {
          const tableHTML = `
          <table class="report-table">
            <thead>
              <tr>${section.data.headers.map((h: string) => `<th>${h}</th>`).join("")}</tr>
            </thead>
            <tbody>
              ${section.data.rows
                .map((row: string[]) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`)
                .join("")}
            </tbody>
          </table>
        `
          sectionContent = tableHTML
        } else {
          sectionContent = `<div class="content">${section.content.replace(/\n/g, "<br>")}</div>`
        }

        return `
        <section class="report-section">
          <h2>${section.title}</h2>
          ${sectionContent}
        </section>
      `
      })
      .join("")

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${report.title}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        .report-header { border-bottom: 2px solid #059669; padding-bottom: 20px; margin-bottom: 30px; }
        .report-title { color: #059669; margin: 0; }
        .report-meta { color: #666; font-size: 14px; margin-top: 10px; }
        .report-section { margin-bottom: 40px; }
        .report-section h2 { color: #059669; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric-card { background: #f9fafb; padding: 20px; border-radius: 8px; text-align: center; }
        .metric-value { font-size: 24px; font-weight: bold; color: #059669; }
        .metric-label { font-size: 14px; color: #666; margin-top: 5px; }
        .report-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .report-table th, .report-table td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; }
        .report-table th { background: #f9fafb; font-weight: 600; }
        .content { margin: 20px 0; }
        .content h3 { color: #374151; margin-top: 25px; }
        .content strong { color: #059669; }
    </style>
</head>
<body>
    <div class="report-header">
        <h1 class="report-title">${report.title}</h1>
        <div class="report-meta">
            Generated on ${report.generatedAt.toLocaleDateString()} | 
            ${report.metadata.wordCount} words | 
            ${report.metadata.estimatedReadTime} min read
        </div>
    </div>
    
    ${sectionsHTML}
    
    <footer style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px;">
        <p>Generated by CFO Helper Agent | Report ID: ${report.id}</p>
    </footer>
</body>
</html>
    `
  }
}
