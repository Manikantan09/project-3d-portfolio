"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Play, RotateCcw } from "lucide-react"

interface ScenarioControlsProps {
  currentCash: number[]
  setCurrentCash: (value: number[]) => void
  monthlyRevenue: number[]
  setMonthlyRevenue: (value: number[]) => void
  monthlyExpenses: number[]
  setMonthlyExpenses: (value: number[]) => void
  teamSize: number[]
  setTeamSize: (value: number[]) => void
  avgSalary: number[]
  setAvgSalary: (value: number[]) => void
  marketingSpend: number[]
  setMarketingSpend: (value: number[]) => void
  priceIncrease: number[]
  setPriceIncrease: (value: number[]) => void
  onRunScenario: () => void
}

export function ScenarioControls({
  currentCash,
  setCurrentCash,
  monthlyRevenue,
  setMonthlyRevenue,
  monthlyExpenses,
  setMonthlyExpenses,
  teamSize,
  setTeamSize,
  avgSalary,
  setAvgSalary,
  marketingSpend,
  setMarketingSpend,
  priceIncrease,
  setPriceIncrease,
  onRunScenario,
}: ScenarioControlsProps) {
  const resetToDefaults = () => {
    setCurrentCash([500000])
    setMonthlyRevenue([50000])
    setMonthlyExpenses([35000])
    setTeamSize([5])
    setAvgSalary([8000])
    setMarketingSpend([5000])
    setPriceIncrease([0])
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="w-5 h-5" />
          Scenario Controls
        </CardTitle>
        <CardDescription>Adjust parameters to see how changes affect your financial runway</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Cash */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Current Cash: ${currentCash[0].toLocaleString()}</Label>
          <Slider
            value={currentCash}
            onValueChange={setCurrentCash}
            max={2000000}
            min={10000}
            step={10000}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>$10K</span>
            <span>$2M</span>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Monthly Revenue: ${monthlyRevenue[0].toLocaleString()}</Label>
          <Slider
            value={monthlyRevenue}
            onValueChange={setMonthlyRevenue}
            max={200000}
            min={5000}
            step={1000}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>$5K</span>
            <span>$200K</span>
          </div>
        </div>

        {/* Monthly Expenses */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Base Monthly Expenses: ${monthlyExpenses[0].toLocaleString()}</Label>
          <Slider
            value={monthlyExpenses}
            onValueChange={setMonthlyExpenses}
            max={100000}
            min={5000}
            step={1000}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>$5K</span>
            <span>$100K</span>
          </div>
        </div>

        {/* Team Size */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Team Size: {teamSize[0]} people</Label>
          <Slider value={teamSize} onValueChange={setTeamSize} max={50} min={1} step={1} className="w-full" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1</span>
            <span>50</span>
          </div>
        </div>

        {/* Average Salary */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Avg Monthly Salary: ${avgSalary[0].toLocaleString()}</Label>
          <Slider value={avgSalary} onValueChange={setAvgSalary} max={20000} min={3000} step={500} className="w-full" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>$3K</span>
            <span>$20K</span>
          </div>
        </div>

        {/* Marketing Spend */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Marketing Spend: ${marketingSpend[0].toLocaleString()}</Label>
          <Slider
            value={marketingSpend}
            onValueChange={setMarketingSpend}
            max={50000}
            min={0}
            step={1000}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>$0</span>
            <span>$50K</span>
          </div>
        </div>

        {/* Price Increase */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Price Change: {priceIncrease[0] > 0 ? "+" : ""}
            {priceIncrease[0]}%
          </Label>
          <Slider
            value={priceIncrease}
            onValueChange={setPriceIncrease}
            max={50}
            min={-30}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>-30%</span>
            <span>+50%</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button onClick={onRunScenario} className="flex-1">
            <Play className="w-4 h-4 mr-2" />
            Run Scenario
          </Button>
          <Button onClick={resetToDefaults} variant="outline">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
