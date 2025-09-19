"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Eye, Clock, BarChart3, FileCheck } from "lucide-react"
import type { GeneratedReport } from "@/lib/report-generator"

interface ReportPreviewProps {
  report: GeneratedReport | null
  onDownload?: (format: "html" | "pdf") => void
}

export function ReportPreview({ report, onDownload }: ReportPreviewProps) {
  const [activeSection, setActiveSection] = useState(0)

  if (!report) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Report Preview
          </CardTitle>
          <CardDescription>Generate a report to see the preview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No report generated yet</p>
            <p className="text-sm">Create a scenario and generate a report to see the preview here</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const formatReportType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="w-5 h-5" />
                {report.title}
              </CardTitle>
              <CardDescription className="flex items-center gap-4 mt-2">
                <Badge variant="outline">{formatReportType(report.type)}</Badge>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {report.generatedAt.toLocaleString()}
                </span>
                <span>{report.metadata.wordCount} words</span>
                <span>{report.metadata.pageCount} pages</span>
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => onDownload?.("html")} variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Preview HTML
              </Button>
              <Button onClick={() => onDownload?.("pdf")} size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Report Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Section Navigation */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">Report Sections</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {report.sections.map((section, index) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(index)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors ${
                    activeSection === index ? "bg-muted font-medium" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {section.type === "metrics" && <BarChart3 className="w-3 h-3" />}
                    {section.type === "chart" && <BarChart3 className="w-3 h-3" />}
                    {section.type === "table" && <FileText className="w-3 h-3" />}
                    {section.type === "text" && <FileText className="w-3 h-3" />}
                    <span className="truncate">{section.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Section Content */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {report.sections[activeSection]?.type === "metrics" && <BarChart3 className="w-5 h-5" />}
              {report.sections[activeSection]?.type === "chart" && <BarChart3 className="w-5 h-5" />}
              {report.sections[activeSection]?.type === "table" && <FileText className="w-5 h-5" />}
              {report.sections[activeSection]?.type === "text" && <FileText className="w-5 h-5" />}
              {report.sections[activeSection]?.title}
            </CardTitle>
            <CardDescription>
              Section {activeSection + 1} of {report.sections.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {report.sections[activeSection] && (
              <div className="space-y-4">
                {report.sections[activeSection].type === "metrics" && report.sections[activeSection].data && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(report.sections[activeSection].data).map(([key, value]) => (
                      <div key={key} className="p-4 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                          {typeof value === "number" ? value.toLocaleString() : value}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {report.sections[activeSection].type === "table" && report.sections[activeSection].data && (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          {report.sections[activeSection].data.headers.map((header: string, index: number) => (
                            <th key={index} className="text-left p-2 font-medium">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {report.sections[activeSection].data.rows.map((row: string[], rowIndex: number) => (
                          <tr key={rowIndex} className="border-b">
                            {row.map((cell, cellIndex) => (
                              <td key={cellIndex} className="p-2">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {(report.sections[activeSection].type === "text" ||
                  report.sections[activeSection].type === "chart") && (
                  <div className="prose prose-sm max-w-none">
                    <div
                      className="whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{
                        __html: report.sections[activeSection].content
                          .replace(/^# (.*$)/gm, "<h3 class='text-lg font-semibold mb-2'>$1</h3>")
                          .replace(/^## (.*$)/gm, "<h4 class='text-base font-medium mb-2'>$1</h4>")
                          .replace(/^### (.*$)/gm, "<h5 class='text-sm font-medium mb-1'>$1</h5>")
                          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                          .replace(/\*(.*?)\*/g, "<em>$1</em>")
                          .replace(/^- (.*$)/gm, "<li class='ml-4'>$1</li>")
                          .replace(/🚨/g, '<span class="text-destructive">🚨</span>')
                          .replace(/⚠️/g, '<span class="text-yellow-600">⚠️</span>')
                          .replace(/✅/g, '<span class="text-primary">✅</span>')
                          .replace(/\n\n/g, "<br><br>")
                          .replace(/\n/g, "<br>"),
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Report Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Report Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-medium">Report ID</div>
              <div className="text-muted-foreground font-mono text-xs">{report.id.slice(0, 8)}...</div>
            </div>
            <div>
              <div className="font-medium">Scenario</div>
              <div className="text-muted-foreground">{report.scenario.scenario.name}</div>
            </div>
            <div>
              <div className="font-medium">Sections</div>
              <div className="text-muted-foreground">{report.sections.length} sections</div>
            </div>
            <div>
              <div className="font-medium">Format</div>
              <div className="text-muted-foreground">{report.config.format.toUpperCase()}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
