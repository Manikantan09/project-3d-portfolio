"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, TrendingUp, DollarSign, Clock, Download, Activity, Calendar, Target } from "lucide-react"
import { Line, LineChart, Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { UsageAnalytics, type UsageStats } from "@/lib/usage-analytics"

interface UsageDashboardProps {
  userId: string
}

export function UsageDashboard({ userId }: UsageDashboardProps) {
  const [stats, setStats] = useState<UsageStats | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const loadStats = () => {
      const usageStats = UsageAnalytics.getUsageStats(userId)
      setStats(usageStats)
    }

    loadStats()

    // Refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000)
    return () => clearInterval(interval)
  }, [userId, refreshKey])

  const handleExportData = () => {
    const exportData = UsageAnalytics.exportUsageData(userId)
    const blob = new Blob([exportData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `usage-analytics-${userId}-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Usage Analytics
          </CardTitle>
          <CardDescription>Loading usage statistics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Usage Analytics Dashboard
              </CardTitle>
              <CardDescription>Comprehensive tracking of your CFO Helper Agent usage and billing</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <Activity className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={handleExportData} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scenarios</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalScenarios}</div>
            <p className="text-xs text-muted-foreground">Financial scenarios analyzed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reports Generated</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalReports}</div>
            <p className="text-xs text-muted-foreground">Professional reports created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Billing</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">${stats.totalBillingAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Usage-based charges</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Session</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{Math.round(stats.averageSessionDuration)}m</div>
            <p className="text-xs text-muted-foreground">Average session duration</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Usage Trends</TabsTrigger>
          <TabsTrigger value="features">Feature Usage</TabsTrigger>
          <TabsTrigger value="billing">Billing History</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Usage Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Daily Usage (Last 7 Days)
                </CardTitle>
                <CardDescription>Scenarios and reports generated per day</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    scenarios: {
                      label: "Scenarios",
                      color: "hsl(var(--chart-1))",
                    },
                    reports: {
                      label: "Reports",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.dailyUsage}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(value) =>
                          new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                        }
                      />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="scenarios" fill="var(--color-scenarios)" name="Scenarios" />
                      <Bar dataKey="reports" fill="var(--color-reports)" name="Reports" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Monthly Trends Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Monthly Trends (Last 6 Months)
                </CardTitle>
                <CardDescription>Usage patterns over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    scenarios: {
                      label: "Scenarios",
                      color: "hsl(var(--chart-1))",
                    },
                    reports: {
                      label: "Reports",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.monthlyTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="month"
                        tickFormatter={(value) =>
                          new Date(value + "-01").toLocaleDateString("en-US", { month: "short", year: "2-digit" })
                        }
                      />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="scenarios" stroke="var(--color-scenarios)" name="Scenarios" />
                      <Line type="monotone" dataKey="reports" stroke="var(--color-reports)" name="Reports" />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Most Used Features</CardTitle>
              <CardDescription>Features ranked by usage frequency</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.mostUsedFeatures.length > 0 ? (
                  stats.mostUsedFeatures.map((feature, index) => (
                    <div key={feature.feature} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <span className="font-medium">{feature.feature}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{feature.count} uses</span>
                        <div className="w-20 h-2 bg-muted rounded-full">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{
                              width: `${(feature.count / Math.max(...stats.mostUsedFeatures.map((f) => f.count))) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No feature usage data available yet</p>
                    <p className="text-sm">Start using the CFO Helper Agent to see feature analytics</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Monthly Billing History
              </CardTitle>
              <CardDescription>Usage-based billing breakdown by month</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  billing: {
                    label: "Billing Amount",
                    color: "hsl(var(--chart-3))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="month"
                      tickFormatter={(value) =>
                        new Date(value + "-01").toLocaleDateString("en-US", { month: "short", year: "2-digit" })
                      }
                    />
                    <YAxis tickFormatter={(value) => `$${value}`} />
                    <ChartTooltip content={<ChartTooltipContent formatter={(value) => [`$${value}`, "Billing"]} />} />
                    <Bar dataKey="billing" fill="var(--color-billing)" name="Billing Amount" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Billing Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Billing Breakdown</CardTitle>
              <CardDescription>Cost per feature usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <div className="font-medium">Scenario Simulations</div>
                    <div className="text-sm text-muted-foreground">{stats.totalScenarios} scenarios × $0.10 each</div>
                  </div>
                  <div className="text-lg font-bold">${(stats.totalScenarios * 0.1).toFixed(2)}</div>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <div className="font-medium">Report Exports</div>
                    <div className="text-sm text-muted-foreground">{stats.totalReports} reports × $0.25 each</div>
                  </div>
                  <div className="text-lg font-bold">${(stats.totalReports * 0.25).toFixed(2)}</div>
                </div>

                <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <div>
                    <div className="font-medium">Total Billing</div>
                    <div className="text-sm text-muted-foreground">All usage charges combined</div>
                  </div>
                  <div className="text-xl font-bold text-primary">${stats.totalBillingAmount.toFixed(2)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
