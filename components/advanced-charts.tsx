"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  AreaChart,
  Bar,
  BarChart,
  ComposedChart,
  ReferenceLine,
  Pie,
  PieChart,
  Cell,
} from "recharts"
import { TrendingUp, BarChart3, PieChartIcon, Activity } from "lucide-react"
import type { ScenarioResult } from "@/lib/financial-simulator"

interface AdvancedChartsProps {
  result: ScenarioResult | null
  comparisonResults?: ScenarioResult[]
}

export function AdvancedCharts({ result, comparisonResults }: AdvancedChartsProps) {
  if (!result) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Financial Charts</CardTitle>
            <CardDescription>Run a scenario to see detailed visualizations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">No data to display</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { projections, summary } = result

  // Prepare data for different chart types
  const cashFlowData = projections.map((p) => ({
    month: `M${p.month}`,
    revenue: p.revenue,
    expenses: p.expenses,
    netCashFlow: p.netCashFlow,
    cumulativeCash: p.cumulativeCash,
    burnRate: p.burnRate,
  }))

  const expenseBreakdownData =
    projections.length > 0
      ? [
          { name: "Team Costs", value: projections[0].teamCost, color: "hsl(var(--chart-1))" },
          { name: "Marketing", value: projections[0].marketingCost, color: "hsl(var(--chart-2))" },
          { name: "Base Expenses", value: projections[0].baseExpenses, color: "hsl(var(--chart-3))" },
        ]
      : []

  const runwayData = projections.map((p) => ({
    month: `M${p.month}`,
    runway: p.runway,
    isHealthy: p.runway > 6,
    isCritical: p.runway <= 3,
  }))

  const chartConfig = {
    revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
    expenses: { label: "Expenses", color: "hsl(var(--chart-2))" },
    netCashFlow: { label: "Net Cash Flow", color: "hsl(var(--chart-3))" },
    cumulativeCash: { label: "Cash Balance", color: "hsl(var(--chart-4))" },
    burnRate: { label: "Burn Rate", color: "hsl(var(--chart-5))" },
    runway: { label: "Runway (Months)", color: "hsl(var(--chart-1))" },
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue vs Expenses Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Revenue vs Expenses
          </CardTitle>
          <CardDescription>Monthly revenue and expense trends</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="revenue" fill="var(--color-revenue)" opacity={0.8} />
                <Bar dataKey="expenses" fill="var(--color-expenses)" opacity={0.8} />
                <Line
                  type="monotone"
                  dataKey="netCashFlow"
                  stroke="var(--color-netCashFlow)"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
                <ReferenceLine y={0} stroke="#666" strokeDasharray="2 2" />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Cash Balance Runway */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Cash Balance Forecast
          </CardTitle>
          <CardDescription>Projected cash runway with critical thresholds</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="cumulativeCash"
                  stroke="var(--color-cumulativeCash)"
                  fill="var(--color-cumulativeCash)"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <ReferenceLine
                  y={summary.averageBurnRate * 6}
                  stroke="orange"
                  strokeDasharray="5 5"
                  label={{ value: "6 Month Buffer", position: "topRight" }}
                />
                <ReferenceLine
                  y={summary.averageBurnRate * 3}
                  stroke="red"
                  strokeDasharray="5 5"
                  label={{ value: "Critical Level", position: "topRight" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Expense Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="w-5 h-5" />
            Expense Breakdown
          </CardTitle>
          <CardDescription>Current month expense distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseBreakdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {expenseBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, "Amount"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Runway Health Over Time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Runway Health Trend
          </CardTitle>
          <CardDescription>Monthly runway projections with health indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={runwayData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} label={{ value: "Months", angle: -90, position: "insideLeft" }} />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  formatter={(value: number) => [`${value} months`, "Runway"]}
                />
                <Bar
                  dataKey="runway"
                  fill={(entry: any) =>
                    entry.isCritical
                      ? "hsl(var(--destructive))"
                      : entry.isHealthy
                        ? "hsl(var(--chart-1))"
                        : "hsl(var(--chart-3))"
                  }
                />
                <ReferenceLine y={6} stroke="orange" strokeDasharray="3 3" />
                <ReferenceLine y={3} stroke="red" strokeDasharray="3 3" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Scenario Comparison (if multiple scenarios) */}
      {comparisonResults && comparisonResults.length > 1 && (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Scenario Comparison
            </CardTitle>
            <CardDescription>Compare cash flow across different scenarios</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" type="category" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  {comparisonResults.map((scenarioResult, index) => {
                    const data = scenarioResult.projections.map((p) => ({
                      month: `M${p.month}`,
                      cumulativeCash: p.cumulativeCash,
                    }))
                    return (
                      <Line
                        key={scenarioResult.scenario.id}
                        type="monotone"
                        dataKey="cumulativeCash"
                        data={data}
                        stroke={`hsl(var(--chart-${(index % 5) + 1}))`}
                        strokeWidth={2}
                        name={scenarioResult.scenario.name}
                        connectNulls={false}
                      />
                    )
                  })}
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
