"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign, Users, Calendar, Target, Zap } from "lucide-react"
import type { ScenarioResult } from "@/lib/financial-simulator"

interface FinancialMetricsDashboardProps {
  result: ScenarioResult | null
}

export function FinancialMetricsDashboard({ result }: FinancialMetricsDashboardProps) {
  if (!result) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
              <div className="h-4 w-4 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">Calculating...</p>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const { projections, summary, scenario } = result
  const currentProjection = projections[0]
  const lastProjection = projections[projections.length - 1]

  // Calculate additional metrics
  const revenueGrowthTrend =
    projections.length > 1
      ? ((projections[projections.length - 1].revenue - projections[0].revenue) / projections[0].revenue) * 100
      : 0

  const expenseEfficiency = (summary.totalRevenue / summary.totalExpenses) * 100
  const cashBurnEfficiency =
    summary.averageBurnRate > 0 ? (currentProjection.revenue / summary.averageBurnRate) * 100 : 0
  const profitabilityScore = (summary.profitableMonths / projections.length) * 100

  const metrics = [
    {
      title: "Current Runway",
      value: summary.totalRunwayMonths === 24 ? "24+" : `${summary.totalRunwayMonths}`,
      unit: "months",
      icon: Calendar,
      trend: summary.totalRunwayMonths > 12 ? "up" : summary.totalRunwayMonths > 6 ? "neutral" : "down",
      description:
        summary.totalRunwayMonths > 12
          ? "Healthy runway"
          : summary.totalRunwayMonths > 6
            ? "Moderate runway"
            : "Critical runway",
      color:
        summary.totalRunwayMonths > 12
          ? "text-primary"
          : summary.totalRunwayMonths > 6
            ? "text-yellow-600"
            : "text-destructive",
    },
    {
      title: "Monthly Burn Rate",
      value: summary.averageBurnRate.toLocaleString(),
      unit: "$",
      icon: TrendingDown,
      trend: "neutral",
      description: "Average monthly expenses",
      color: "text-foreground",
    },
    {
      title: "Break-even Timeline",
      value: summary.breakEvenMonth ? `${summary.breakEvenMonth}` : "Never",
      unit: summary.breakEvenMonth ? "months" : "",
      icon: Target,
      trend: summary.breakEvenMonth && summary.breakEvenMonth <= 12 ? "up" : "down",
      description: summary.breakEvenMonth ? "Months to profitability" : "No break-even projected",
      color: summary.breakEvenMonth && summary.breakEvenMonth <= 12 ? "text-primary" : "text-destructive",
    },
    {
      title: "Team Size",
      value: scenario.teamSize.toString(),
      unit: "people",
      icon: Users,
      trend: "neutral",
      description: "Current team members",
      color: "text-foreground",
    },
    {
      title: "Revenue Growth",
      value: revenueGrowthTrend.toFixed(1),
      unit: "%",
      icon: revenueGrowthTrend >= 0 ? TrendingUp : TrendingDown,
      trend: revenueGrowthTrend >= 0 ? "up" : "down",
      description: "Projected revenue trend",
      color: revenueGrowthTrend >= 0 ? "text-primary" : "text-destructive",
    },
    {
      title: "Expense Efficiency",
      value: expenseEfficiency.toFixed(0),
      unit: "%",
      icon: DollarSign,
      trend: expenseEfficiency > 100 ? "up" : "down",
      description: "Revenue to expense ratio",
      color: expenseEfficiency > 100 ? "text-primary" : "text-destructive",
    },
    {
      title: "Cash Efficiency",
      value: cashBurnEfficiency.toFixed(0),
      unit: "%",
      icon: Zap,
      trend: cashBurnEfficiency > 100 ? "up" : "down",
      description: "Revenue vs burn rate",
      color: cashBurnEfficiency > 100 ? "text-primary" : "text-destructive",
    },
    {
      title: "Profitability Score",
      value: profitabilityScore.toFixed(0),
      unit: "%",
      icon: Target,
      trend: profitabilityScore > 50 ? "up" : "down",
      description: "Months with positive cash flow",
      color: profitabilityScore > 50 ? "text-primary" : "text-destructive",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <metric.icon
                className={`h-4 w-4 ${
                  metric.trend === "up"
                    ? "text-primary"
                    : metric.trend === "down"
                      ? "text-destructive"
                      : "text-muted-foreground"
                }`}
              />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${metric.color}`}>
                {metric.unit === "$" ? "$" : ""}
                {metric.value}
                {metric.unit !== "$" ? metric.unit : ""}
              </div>
              <p className="text-xs text-muted-foreground">{metric.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Health Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Runway Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current Status</span>
                <Badge
                  variant={
                    summary.totalRunwayMonths > 12
                      ? "default"
                      : summary.totalRunwayMonths > 6
                        ? "secondary"
                        : "destructive"
                  }
                >
                  {summary.totalRunwayMonths > 12 ? "Healthy" : summary.totalRunwayMonths > 6 ? "Caution" : "Critical"}
                </Badge>
              </div>
              <Progress value={Math.min((summary.totalRunwayMonths / 24) * 100, 100)} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Cash Flow Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Positive Months</span>
                <Badge variant={profitabilityScore > 50 ? "default" : "secondary"}>
                  {summary.profitableMonths}/{projections.length}
                </Badge>
              </div>
              <Progress value={profitabilityScore} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Growth Trajectory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Revenue Trend</span>
                <Badge variant={revenueGrowthTrend >= 0 ? "default" : "destructive"}>
                  {revenueGrowthTrend >= 0 ? "+" : ""}
                  {revenueGrowthTrend.toFixed(1)}%
                </Badge>
              </div>
              <Progress value={Math.min(Math.max((revenueGrowthTrend + 10) * 5, 0), 100)} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
