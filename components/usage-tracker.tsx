"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Activity, FileText, CreditCard } from "lucide-react"
import { useState } from "react"
import { BillingTracker } from "./billing-tracker"

interface UsageTrackerProps {
  scenarios: number
  reports: number
}

export function UsageTracker({ scenarios, reports }: UsageTrackerProps) {
  const [showBilling, setShowBilling] = useState(false)
  const userId = "demo-user" // In a real app, this would come from authentication

  // Calculate costs
  const scenarioCost = scenarios * 0.1
  const reportCost = reports * 0.25
  const totalCost = scenarioCost + reportCost

  if (showBilling) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Billing Details</h2>
              <Button variant="outline" onClick={() => setShowBilling(false)}>
                Close
              </Button>
            </div>
            <BillingTracker userId={userId} scenarios={scenarios} reports={reports} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="w-fit">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Scenarios:</span>
            <Badge variant="secondary">{scenarios}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Reports:</span>
            <Badge variant="secondary">{reports}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Cost:</span>
            <Badge variant="outline">${totalCost.toFixed(2)}</Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowBilling(true)} className="text-xs">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
