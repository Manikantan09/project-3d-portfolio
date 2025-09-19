"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Activity, FileText, DollarSign, TrendingUp } from "lucide-react"
import { flexpriceClient, type BillingEvent } from "@/lib/flexprice-billing"

interface BillingTrackerProps {
  userId: string
  scenarios: number
  reports: number
}

export function BillingTracker({ userId, scenarios, reports }: BillingTrackerProps) {
  const [billingSummary, setBillingSummary] = useState({
    totalCost: 0,
    scenarioSimulations: 0,
    reportExports: 0,
    events: [] as BillingEvent[],
  })

  useEffect(() => {
    const summary = flexpriceClient.getBillingSummary(userId)
    setBillingSummary(summary)
  }, [userId, scenarios, reports])

  const monthlySpend = billingSummary.totalCost
  const avgCostPerScenario =
    billingSummary.scenarioSimulations > 0 ? billingSummary.totalCost / billingSummary.scenarioSimulations : 0
  const recentEvents = billingSummary.events.slice(-5).reverse()

  return (
    <div className="space-y-6">
      {/* Billing Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${billingSummary.totalCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Current session</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scenarios Billed</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{billingSummary.scenarioSimulations}</div>
            <p className="text-xs text-muted-foreground">$0.10 each</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reports Billed</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{billingSummary.reportExports}</div>
            <p className="text-xs text-muted-foreground">$0.25 each</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Cost/Scenario</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${avgCostPerScenario.toFixed(3)}</div>
            <p className="text-xs text-muted-foreground">Per simulation</p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Usage Breakdown
          </CardTitle>
          <CardDescription>Detailed billing information for current session</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Scenario Simulations</span>
              </div>
              <div className="text-right">
                <div className="font-medium">{billingSummary.scenarioSimulations} × $0.10</div>
                <div className="text-sm text-muted-foreground">
                  ${(billingSummary.scenarioSimulations * 0.1).toFixed(2)}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Report Exports</span>
              </div>
              <div className="text-right">
                <div className="font-medium">{billingSummary.reportExports} × $0.25</div>
                <div className="text-sm text-muted-foreground">${(billingSummary.reportExports * 0.25).toFixed(2)}</div>
              </div>
            </div>

            <div className="border-t pt-3">
              <div className="flex items-center justify-between font-medium">
                <span>Total</span>
                <span>${billingSummary.totalCost.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          {recentEvents.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Recent Activity</h4>
              <div className="space-y-2">
                {recentEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <div className="flex items-center gap-2">
                      {event.type === "scenario_simulation" ? (
                        <Activity className="w-3 h-3 text-muted-foreground" />
                      ) : (
                        <FileText className="w-3 h-3 text-muted-foreground" />
                      )}
                      <span className="text-xs">
                        {event.type === "scenario_simulation"
                          ? `Scenario: ${event.metadata.scenarioName || "Unknown"}`
                          : `Report: ${event.metadata.reportType || "Unknown"}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          event.status === "billed"
                            ? "default"
                            : event.status === "failed"
                              ? "destructive"
                              : "secondary"
                        }
                        className="text-xs"
                      >
                        {event.status}
                      </Badge>
                      <span className="text-xs font-medium">${event.cost.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
