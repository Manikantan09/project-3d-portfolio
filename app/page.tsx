"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calculator } from "lucide-react"
import { type FinancialScenario, FinancialSimulator, type ScenarioResult } from "@/lib/financial-simulator"
import { flexpriceClient } from "@/lib/flexprice-billing"
import { ReportGenerator, type GeneratedReport } from "@/lib/report-generator"
import type { LiveDataUpdate } from "@/lib/pathway-integration"
import { ScenarioBuilder } from "@/components/scenario-builder"
import { ScenarioResults } from "@/components/scenario-results"
import { AdvancedCharts } from "@/components/advanced-charts"
import { FinancialMetricsDashboard } from "@/components/financial-metrics-dashboard"
import { UsageTracker } from "@/components/usage-tracker"
import { LiveDataFeed } from "@/components/live-data-feed"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ReportPreview } from "@/components/report-preview"
import { UsageAnalytics } from "@/lib/usage-analytics"
import { UsageDashboard } from "@/components/usage-dashboard"

export default function CFOHelperAgent() {
  const [currentResult, setCurrentResult] = useState<ScenarioResult | null>(null)
  const [savedScenarios, setSavedScenarios] = useState<FinancialScenario[]>([])
  const [comparisonResults, setComparisonResults] = useState<ScenarioResult[]>([])
  const [scenariosRun, setScenariosRun] = useState(0)
  const [reportsGenerated, setReportsGenerated] = useState(0)
  const [currentReport, setCurrentReport] = useState<GeneratedReport | null>(null)
  const [liveDataUpdate, setLiveDataUpdate] = useState<LiveDataUpdate | null>(null)

  const userId = "demo-user" // In a real app, this would come from authentication

  useEffect(() => {
    UsageAnalytics.startSession(userId)
  }, [userId])

  const handleLiveDataUpdate = (update: LiveDataUpdate) => {
    setLiveDataUpdate(update)
    console.log("[CFO Agent] Received live data update:", update)
  }

  const handleRunScenario = async (scenario: FinancialScenario) => {
    try {
      UsageAnalytics.trackFeatureUsage(userId, "scenario_builder")

      await flexpriceClient.billScenarioSimulation(
        userId,
        scenario.id,
        scenario.name,
        24, // projection months
      )

      const result = FinancialSimulator.simulateScenario(scenario)
      setCurrentResult(result)
      setScenariosRun((prev) => prev + 1)

      UsageAnalytics.trackScenarioRun(userId, scenario.id, true, 0.1)

      setComparisonResults((prev) => {
        const existing = prev.find((r) => r.scenario.id === scenario.id)
        if (existing) {
          return prev.map((r) => (r.scenario.id === scenario.id ? result : r))
        }
        return [...prev, result].slice(-5) // Keep last 5 scenarios
      })
    } catch (error) {
      console.error("Failed to run scenario:", error)
      UsageAnalytics.trackScenarioRun(userId, scenario.id, false)

      const result = FinancialSimulator.simulateScenario(scenario)
      setCurrentResult(result)
      setScenariosRun((prev) => prev + 1)
    }
  }

  const handleSaveScenario = (scenario: FinancialScenario) => {
    setSavedScenarios((prev) => {
      const existing = prev.find((s) => s.id === scenario.id)
      if (existing) {
        return prev.map((s) => (s.id === scenario.id ? scenario : s))
      }
      return [...prev, scenario]
    })
  }

  const generateReport = async (
    reportType: "executive_summary" | "detailed_forecast" | "risk_assessment" | "growth_opportunities",
  ) => {
    if (!currentResult) {
      alert("Please run a scenario first to generate a report")
      return
    }

    try {
      UsageAnalytics.trackFeatureUsage(userId, "report_generation")

      await flexpriceClient.billReportExport(userId, reportType, currentResult.scenario.id)

      const report = await ReportGenerator.generateReport(
        reportType,
        currentResult,
        {
          includeCharts: true,
          includeRiskAnalysis: true,
          includeOpportunities: true,
          includeProjections: true,
          includeLiveData: !!liveDataUpdate,
          format: "html",
          branding: {
            companyName: "Your Company",
            primaryColor: "#059669",
          },
        },
        liveDataUpdate || undefined,
      )

      setCurrentReport(report)
      setReportsGenerated((prev) => prev + 1)

      UsageAnalytics.trackReportGeneration(userId, reportType, true, 0.25)

      const reportsTab = document.querySelector('[value="reports"]') as HTMLElement
      reportsTab?.click()
    } catch (error) {
      console.error("Failed to generate report:", error)
      UsageAnalytics.trackReportGeneration(userId, reportType, false)

      setReportsGenerated((prev) => prev + 1)
      alert("Report generation failed, but billing was processed")
    }
  }

  const handleDownloadReport = (format: "html" | "pdf") => {
    if (!currentReport) return

    if (format === "html") {
      const htmlContent = ReportGenerator.generateHTML(currentReport)
      const blob = new Blob([htmlContent], { type: "text/html" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${currentReport.title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } else {
      // In a real app, this would generate a PDF
      alert("PDF generation would be implemented with a service like Puppeteer or similar")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                <Calculator className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-balance">CFO Helper Agent</h1>
                <p className="text-sm text-muted-foreground">Advanced financial scenario planning with live data</p>
              </div>
            </div>
            <UsageTracker scenarios={scenariosRun} reports={reportsGenerated} />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Financial Metrics Dashboard */}
        <div className="mb-8">
          <FinancialMetricsDashboard result={currentResult} />
        </div>

        {/* Main Dashboard */}
        <Tabs defaultValue="scenario" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="scenario">Scenario Builder</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="data">Live Data</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="scenario" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <ScenarioBuilder onRunScenario={handleRunScenario} onSaveScenario={handleSaveScenario} />
              <ScenarioResults result={currentResult} />
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <ScenarioResults result={currentResult} />
          </TabsContent>

          <TabsContent value="charts" className="space-y-6">
            <AdvancedCharts result={currentResult} comparisonResults={comparisonResults} />
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <LiveDataFeed onDataUpdate={handleLiveDataUpdate} />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="space-y-6">
              {/* Report Generation Controls */}
              <Card>
                <CardHeader>
                  <CardTitle>Generate Financial Report</CardTitle>
                  <CardDescription>Create professional reports from your scenario analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button
                      onClick={() => generateReport("executive_summary")}
                      disabled={!currentResult}
                      variant="outline"
                    >
                      Executive Summary
                    </Button>
                    <Button
                      onClick={() => generateReport("detailed_forecast")}
                      disabled={!currentResult}
                      variant="outline"
                    >
                      Detailed Forecast
                    </Button>
                    <Button
                      onClick={() => generateReport("risk_assessment")}
                      disabled={!currentResult}
                      variant="outline"
                    >
                      Risk Assessment
                    </Button>
                    <Button
                      onClick={() => generateReport("growth_opportunities")}
                      disabled={!currentResult}
                      variant="outline"
                    >
                      Growth Opportunities
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Report Preview */}
              <ReportPreview report={currentReport} onDownload={handleDownloadReport} />
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <UsageDashboard userId={userId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
