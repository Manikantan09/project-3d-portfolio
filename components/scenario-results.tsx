"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Calendar, DollarSign } from "lucide-react"
import type { ScenarioResult } from "@/lib/financial-simulator"

interface ScenarioResultsProps {
  result: ScenarioResult | null
}

export function ScenarioResults({ result }: ScenarioResultsProps) {
  if (!result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Scenario Results</CardTitle>
          <CardDescription>Run a scenario to see detailed analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">No scenario results to display</p>
        </CardContent>
      </Card>
    )
  }

  const { scenario, projections, summary, risks, opportunities } = result

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          {scenario.name} - Results
        </CardTitle>
        <CardDescription>Detailed analysis of your financial scenario</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="summary" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="projections">Projections</TabsTrigger>
            <TabsTrigger value="risks">Risks</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Total Runway</span>
                </div>
                <div className="text-2xl font-bold">
                  {summary.totalRunwayMonths === 24 ? "24+" : summary.totalRunwayMonths} months
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Break-even</span>
                </div>
                <div className="text-2xl font-bold">
                  {summary.breakEvenMonth ? `Month ${summary.breakEvenMonth}` : "Never"}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Max Cash</span>
                </div>
                <div className="text-2xl font-bold">${summary.maxCashPosition.toLocaleString()}</div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Profitable Months</span>
                </div>
                <div className="text-2xl font-bold">{summary.profitableMonths}</div>
              </div>
            </div>

            {/* Health Score */}
            <div className="space-y-4">
              <h4 className="font-medium">Financial Health Score</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Health</span>
                  <Badge
                    variant={
                      summary.totalRunwayMonths > 12
                        ? "default"
                        : summary.totalRunwayMonths > 6
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {summary.totalRunwayMonths > 12
                      ? "Healthy"
                      : summary.totalRunwayMonths > 6
                        ? "Caution"
                        : "Critical"}
                  </Badge>
                </div>
                <Progress value={Math.min((summary.totalRunwayMonths / 24) * 100, 100)} className="h-2" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="projections" className="space-y-4">
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {projections.map((projection, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">Month {projection.month}</Badge>
                    <div className="text-sm">
                      <div className="font-medium">
                        Cash Flow: {projection.netCashFlow >= 0 ? "+" : ""}${projection.netCashFlow.toLocaleString()}
                      </div>
                      <div className="text-muted-foreground">
                        Balance: ${projection.cumulativeCash.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-medium">
                      {projection.netCashFlow >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-primary inline mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-destructive inline mr-1" />
                      )}
                      {projection.runway} months runway
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="risks" className="space-y-4">
            {risks.length > 0 ? (
              risks.map((risk, index) => (
                <Alert key={index}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{risk}</AlertDescription>
                </Alert>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-primary" />
                <p>No significant risks identified in this scenario</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="opportunities" className="space-y-4">
            {opportunities.length > 0 ? (
              opportunities.map((opportunity, index) => (
                <Alert key={index}>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{opportunity}</AlertDescription>
                </Alert>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No specific opportunities identified</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
