"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart } from "recharts"
import { TrendingUp } from "lucide-react"

interface FinancialChartProps {
  revenue: number
  expenses: number
  cashFlow: number
  currentCash: number
}

export function FinancialChart({ revenue, expenses, cashFlow, currentCash }: FinancialChartProps) {
  // Generate 12-month forecast data
  const generateForecastData = () => {
    const data = []
    let runningCash = currentCash

    for (let month = 0; month < 12; month++) {
      runningCash += cashFlow
      data.push({
        month: `Month ${month + 1}`,
        revenue: revenue,
        expenses: expenses,
        cashFlow: cashFlow,
        cumulativeCash: Math.max(0, runningCash),
        runway: runningCash > 0 ? 12 - month : 0,
      })

      if (runningCash <= 0) break
    }

    return data
  }

  const forecastData = generateForecastData()

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(var(--chart-1))",
    },
    expenses: {
      label: "Expenses",
      color: "hsl(var(--chart-2))",
    },
    cumulativeCash: {
      label: "Cash Balance",
      color: "hsl(var(--chart-3))",
    },
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Monthly Cash Flow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Monthly Cash Flow
          </CardTitle>
          <CardDescription>Revenue vs Expenses over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  formatter={(value: number, name: string) => [
                    `$${value.toLocaleString()}`,
                    name === "revenue" ? "Revenue" : name === "expenses" ? "Expenses" : "Cash Flow",
                  ]}
                />
                <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="expenses" stroke="var(--color-expenses)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Cash Balance Runway */}
      <Card>
        <CardHeader>
          <CardTitle>Cash Balance Forecast</CardTitle>
          <CardDescription>Projected cash runway based on current scenario</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, "Cash Balance"]}
                />
                <Area
                  type="monotone"
                  dataKey="cumulativeCash"
                  stroke="var(--color-cumulativeCash)"
                  fill="var(--color-cumulativeCash)"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
