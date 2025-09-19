"use client"

import { TabsContent } from "@/components/ui/tabs"

import { TabsTrigger } from "@/components/ui/tabs"

import { TabsList } from "@/components/ui/tabs"

import { Tabs } from "@/components/ui/tabs"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Trash2, Copy, Play, Zap, RefreshCw } from "lucide-react"
import { type FinancialScenario, FinancialSimulator } from "@/lib/financial-simulator"
import { pathwayClient, type LiveDataUpdate } from "@/lib/pathway-integration"

interface ScenarioBuilderProps {
  onRunScenario: (scenario: FinancialScenario) => void
  onSaveScenario: (scenario: FinancialScenario) => void
}

export function ScenarioBuilder({ onRunScenario, onSaveScenario }: ScenarioBuilderProps) {
  const [scenario, setScenario] = useState<FinancialScenario>(FinancialSimulator.createDefaultScenario())
  const [oneTimeExpense, setOneTimeExpense] = useState({ month: 1, amount: 0, description: "" })
  const [oneTimeRevenue, setOneTimeRevenue] = useState({ month: 1, amount: 0, description: "" })
  const [liveDataUpdate, setLiveDataUpdate] = useState<LiveDataUpdate | null>(null)
  const [isUsingLiveData, setIsUsingLiveData] = useState(false)

  useEffect(() => {
    const unsubscribe = pathwayClient.subscribe((update) => {
      setLiveDataUpdate(update)
    })

    return unsubscribe
  }, [])

  const updateScenario = (updates: Partial<FinancialScenario>) => {
    setScenario((prev) => ({ ...prev, ...updates }))
  }

  const applyLiveData = () => {
    if (!liveDataUpdate) return

    const updates: Partial<FinancialScenario> = {}

    if (liveDataUpdate.revenueUpdate) {
      updates.monthlyRevenue = Math.max(scenario.monthlyRevenue + liveDataUpdate.revenueUpdate * 0.1, 1000)
    }

    if (liveDataUpdate.expenseUpdate) {
      updates.monthlyExpenses = Math.max(scenario.monthlyExpenses + liveDataUpdate.expenseUpdate * 0.1, 1000)
    }

    if (liveDataUpdate.marketMultiplier && liveDataUpdate.marketMultiplier !== 1.0) {
      const marketImpact = (liveDataUpdate.marketMultiplier - 1.0) * 10 // Convert to percentage
      updates.revenueGrowthRate = scenario.revenueGrowthRate + marketImpact
    }

    updateScenario(updates)
    setIsUsingLiveData(true)
  }

  const addOneTimeExpense = () => {
    if (oneTimeExpense.amount > 0 && oneTimeExpense.description) {
      updateScenario({
        oneTimeExpenses: [...scenario.oneTimeExpenses, { ...oneTimeExpense }],
      })
      setOneTimeExpense({ month: 1, amount: 0, description: "" })
    }
  }

  const addOneTimeRevenue = () => {
    if (oneTimeRevenue.amount > 0 && oneTimeRevenue.description) {
      updateScenario({
        oneTimeRevenue: [...scenario.oneTimeRevenue, { ...oneTimeRevenue }],
      })
      setOneTimeRevenue({ month: 1, amount: 0, description: "" })
    }
  }

  const removeOneTimeExpense = (index: number) => {
    updateScenario({
      oneTimeExpenses: scenario.oneTimeExpenses.filter((_, i) => i !== index),
    })
  }

  const removeOneTimeRevenue = (index: number) => {
    updateScenario({
      oneTimeRevenue: scenario.oneTimeRevenue.filter((_, i) => i !== index),
    })
  }

  const duplicateScenario = () => {
    const newScenario = {
      ...scenario,
      id: crypto.randomUUID(),
      name: `${scenario.name} (Copy)`,
    }
    setScenario(newScenario)
    setIsUsingLiveData(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Advanced Scenario Builder</span>
          <div className="flex gap-2">
            {liveDataUpdate && (
              <Button onClick={applyLiveData} variant="outline" size="sm" className="text-primary bg-transparent">
                <Zap className="w-4 h-4 mr-2" />
                Apply Live Data
              </Button>
            )}
            <Button onClick={duplicateScenario} variant="outline" size="sm">
              <Copy className="w-4 h-4 mr-2" />
              Duplicate
            </Button>
            <Button onClick={() => onSaveScenario(scenario)} variant="outline" size="sm">
              Save
            </Button>
            <Button onClick={() => onRunScenario(scenario)} size="sm">
              <Play className="w-4 h-4 mr-2" />
              Run
            </Button>
          </div>
        </CardTitle>
        <CardDescription>Build complex financial scenarios with growth rates and one-time events</CardDescription>
        {isUsingLiveData && (
          <Alert>
            <RefreshCw className="h-4 w-4" />
            <AlertDescription>
              This scenario includes live data from Pathway. Values have been automatically adjusted based on real-time
              financial updates.
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="growth">Growth</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="seasonality">Seasonality</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Scenario Name</Label>
                <Input
                  value={scenario.name}
                  onChange={(e) => updateScenario({ name: e.target.value })}
                  placeholder="Enter scenario name"
                />
              </div>
              <div className="space-y-2">
                <Label>Current Cash: ${scenario.currentCash.toLocaleString()}</Label>
                <Slider
                  value={[scenario.currentCash]}
                  onValueChange={([value]) => updateScenario({ currentCash: value })}
                  max={2000000}
                  min={10000}
                  step={10000}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Monthly Revenue: ${scenario.monthlyRevenue.toLocaleString()}
                  {isUsingLiveData && (
                    <Badge variant="secondary" className="text-xs">
                      Live
                    </Badge>
                  )}
                </Label>
                <Slider
                  value={[scenario.monthlyRevenue]}
                  onValueChange={([value]) => updateScenario({ monthlyRevenue: value })}
                  max={200000}
                  min={5000}
                  step={1000}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Base Expenses: ${scenario.monthlyExpenses.toLocaleString()}
                  {isUsingLiveData && (
                    <Badge variant="secondary" className="text-xs">
                      Live
                    </Badge>
                  )}
                </Label>
                <Slider
                  value={[scenario.monthlyExpenses]}
                  onValueChange={([value]) => updateScenario({ monthlyExpenses: value })}
                  max={100000}
                  min={5000}
                  step={1000}
                />
              </div>
              <div className="space-y-2">
                <Label>Team Size: {scenario.teamSize}</Label>
                <Slider
                  value={[scenario.teamSize]}
                  onValueChange={([value]) => updateScenario({ teamSize: value })}
                  max={50}
                  min={1}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <Label>Avg Salary: ${scenario.avgSalary.toLocaleString()}</Label>
                <Slider
                  value={[scenario.avgSalary]}
                  onValueChange={([value]) => updateScenario({ avgSalary: value })}
                  max={20000}
                  min={3000}
                  step={500}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="growth" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Revenue Growth Rate: {scenario.revenueGrowthRate}% monthly
                  {isUsingLiveData && (
                    <Badge variant="secondary" className="text-xs">
                      Live
                    </Badge>
                  )}
                </Label>
                <Slider
                  value={[scenario.revenueGrowthRate]}
                  onValueChange={([value]) => updateScenario({ revenueGrowthRate: value })}
                  max={20}
                  min={-10}
                  step={0.5}
                />
              </div>
              <div className="space-y-2">
                <Label>Expense Growth Rate: {scenario.expenseGrowthRate}% monthly</Label>
                <Slider
                  value={[scenario.expenseGrowthRate]}
                  onValueChange={([value]) => updateScenario({ expenseGrowthRate: value })}
                  max={15}
                  min={-5}
                  step={0.5}
                />
              </div>
              <div className="space-y-2">
                <Label>Price Increase: {scenario.priceIncrease}%</Label>
                <Slider
                  value={[scenario.priceIncrease]}
                  onValueChange={([value]) => updateScenario({ priceIncrease: value })}
                  max={50}
                  min={-30}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <Label>Marketing Spend: ${scenario.marketingSpend.toLocaleString()}</Label>
                <Slider
                  value={[scenario.marketingSpend]}
                  onValueChange={([value]) => updateScenario({ marketingSpend: value })}
                  max={50000}
                  min={0}
                  step={1000}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            {/* One-time Expenses */}
            <div className="space-y-4">
              <h4 className="font-medium">One-time Expenses</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <Input
                  type="number"
                  placeholder="Month"
                  value={oneTimeExpense.month}
                  onChange={(e) =>
                    setOneTimeExpense((prev) => ({ ...prev, month: Number.parseInt(e.target.value) || 1 }))
                  }
                />
                <Input
                  type="number"
                  placeholder="Amount"
                  value={oneTimeExpense.amount}
                  onChange={(e) =>
                    setOneTimeExpense((prev) => ({ ...prev, amount: Number.parseInt(e.target.value) || 0 }))
                  }
                />
                <Input
                  placeholder="Description"
                  value={oneTimeExpense.description}
                  onChange={(e) => setOneTimeExpense((prev) => ({ ...prev, description: e.target.value }))}
                />
                <Button onClick={addOneTimeExpense} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {scenario.oneTimeExpenses.map((expense, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">
                      Month {expense.month}: ${expense.amount.toLocaleString()} - {expense.description}
                    </span>
                    <Button onClick={() => removeOneTimeExpense(index)} variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* One-time Revenue */}
            <div className="space-y-4">
              <h4 className="font-medium">One-time Revenue</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <Input
                  type="number"
                  placeholder="Month"
                  value={oneTimeRevenue.month}
                  onChange={(e) =>
                    setOneTimeRevenue((prev) => ({ ...prev, month: Number.parseInt(e.target.value) || 1 }))
                  }
                />
                <Input
                  type="number"
                  placeholder="Amount"
                  value={oneTimeRevenue.amount}
                  onChange={(e) =>
                    setOneTimeRevenue((prev) => ({ ...prev, amount: Number.parseInt(e.target.value) || 0 }))
                  }
                />
                <Input
                  placeholder="Description"
                  value={oneTimeRevenue.description}
                  onChange={(e) => setOneTimeRevenue((prev) => ({ ...prev, description: e.target.value }))}
                />
                <Button onClick={addOneTimeRevenue} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {scenario.oneTimeRevenue.map((revenue, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">
                      Month {revenue.month}: ${revenue.amount.toLocaleString()} - {revenue.description}
                    </span>
                    <Button onClick={() => removeOneTimeRevenue(index)} variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="seasonality" className="space-y-4">
            <div className="space-y-4">
              <h4 className="font-medium">Monthly Seasonality Factors</h4>
              <p className="text-sm text-muted-foreground">
                Adjust revenue multipliers for each month (1.0 = normal, 1.2 = 20% higher, 0.8 = 20% lower)
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {scenario.seasonalityFactor.map((factor, index) => (
                  <div key={index} className="space-y-2">
                    <Label className="text-sm">
                      {new Date(0, index).toLocaleString("default", { month: "short" })}: {factor.toFixed(1)}x
                    </Label>
                    <Slider
                      value={[factor]}
                      onValueChange={([value]) => {
                        const newFactors = [...scenario.seasonalityFactor]
                        newFactors[index] = value
                        updateScenario({ seasonalityFactor: newFactors })
                      }}
                      max={2}
                      min={0.1}
                      step={0.1}
                    />
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
