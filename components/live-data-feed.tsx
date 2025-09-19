"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Activity, Wifi, WifiOff, TrendingUp, TrendingDown, Clock, Database } from "lucide-react"
import { pathwayClient, type LiveDataUpdate, type PathwayDataPoint } from "@/lib/pathway-integration"

interface LiveDataFeedProps {
  onDataUpdate?: (update: LiveDataUpdate) => void
}

export function LiveDataFeed({ onDataUpdate }: LiveDataFeedProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<LiveDataUpdate | null>(null)
  const [recentDataPoints, setRecentDataPoints] = useState<PathwayDataPoint[]>([])
  const [dataSummary, setDataSummary] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    dataPointCount: 0,
    lastUpdate: null as Date | null,
    averageConfidence: 0,
  })

  useEffect(() => {
    // Subscribe to live data updates
    const unsubscribe = pathwayClient.subscribe((update) => {
      setLastUpdate(update)
      setRecentDataPoints(update.dataPoints)
      onDataUpdate?.(update)

      // Update summary
      const summary = pathwayClient.getDataSummary()
      setDataSummary(summary)
    })

    // Get initial data
    const initialData = pathwayClient.getHistoricalData(1) // Last hour
    setRecentDataPoints(initialData.slice(0, 10))

    const initialSummary = pathwayClient.getDataSummary()
    setDataSummary(initialSummary)

    return unsubscribe
  }, [onDataUpdate])

  const toggleConnection = () => {
    if (isConnected) {
      pathwayClient.stopRealTimeUpdates()
      setIsConnected(false)
    } else {
      pathwayClient.startRealTimeUpdates()
      setIsConnected(true)
    }
  }

  const getDataPointIcon = (type: string) => {
    switch (type) {
      case "revenue":
        return <TrendingUp className="w-3 h-3 text-primary" />
      case "expense":
        return <TrendingDown className="w-3 h-3 text-destructive" />
      case "market_condition":
        return <Activity className="w-3 h-3 text-blue-500" />
      default:
        return <Database className="w-3 h-3 text-muted-foreground" />
    }
  }

  const formatValue = (type: string, value: number) => {
    if (type === "market_condition") {
      return `${(value * 100).toFixed(1)}%`
    }
    return `$${value.toLocaleString()}`
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Pathway Live Data Feed
            </div>
            <Button onClick={toggleConnection} variant={isConnected ? "destructive" : "default"} size="sm">
              {isConnected ? (
                <>
                  <WifiOff className="w-4 h-4 mr-2" />
                  Disconnect
                </>
              ) : (
                <>
                  <Wifi className="w-4 h-4 mr-2" />
                  Connect
                </>
              )}
            </Button>
          </CardTitle>
          <CardDescription>Real-time financial data updates from integrated sources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-primary animate-pulse" : "bg-muted"}`} />
                <span className="text-sm">{isConnected ? "Connected" : "Disconnected"}</span>
              </div>
              {lastUpdate && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  Last update: {lastUpdate.lastUpdated.toLocaleTimeString()}
                </div>
              )}
            </div>
            <Badge variant="outline">{dataSummary.dataPointCount} data points</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Data Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Live Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">${dataSummary.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From connected sources</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Live Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">${dataSummary.totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Real-time tracking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Data Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(dataSummary.averageConfidence * 100).toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">Average confidence</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Data Points */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Data Points
          </CardTitle>
          <CardDescription>Latest financial data from your connected sources</CardDescription>
        </CardHeader>
        <CardContent>
          {recentDataPoints.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentDataPoints.map((dataPoint) => (
                <div key={dataPoint.id} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                  <div className="flex items-center gap-3">
                    {getDataPointIcon(dataPoint.type)}
                    <div>
                      <div className="font-medium text-sm">{dataPoint.description}</div>
                      <div className="text-xs text-muted-foreground">
                        {dataPoint.source} • {dataPoint.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatValue(dataPoint.type, dataPoint.value)}</div>
                    <Badge variant="outline" className="text-xs">
                      {(dataPoint.confidence * 100).toFixed(0)}% confidence
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No data points available</p>
              <p className="text-sm">Connect to start receiving live updates</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Impact Alert */}
      {lastUpdate && (lastUpdate.revenueUpdate > 10000 || lastUpdate.expenseUpdate > 5000) && (
        <Alert>
          <TrendingUp className="h-4 w-4" />
          <AlertDescription>
            Significant financial activity detected:
            {lastUpdate.revenueUpdate > 10000 && ` +$${lastUpdate.revenueUpdate.toLocaleString()} revenue`}
            {lastUpdate.expenseUpdate > 5000 && ` +$${lastUpdate.expenseUpdate.toLocaleString()} expenses`}. Consider
            updating your scenarios to reflect these changes.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
