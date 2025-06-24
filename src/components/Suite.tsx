'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { BenchmarkSuite } from "@/types/benchmark.types"
import { ReportBarChart } from "@/components/BarChart"

// Helper function to calculate average metrics from test case data
function calculateAverageMetrics(testCase: any) {
  return {
    ...testCase,
    data: [{
      category: 'Average',
      aidbox: Math.round(testCase.data.reduce((sum: number, dp: any) => sum + dp.aidbox, 0) / testCase.data.length),
      medplum: Math.round(testCase.data.reduce((sum: number, dp: any) => sum + dp.medplum, 0) / testCase.data.length),
      hapi: Math.round(testCase.data.reduce((sum: number, dp: any) => sum + dp.hapi, 0) / testCase.data.length)
    }]
  }
}

export function Suite({ suite }: { suite: BenchmarkSuite }) {
  return (
    <div>
      <Card>
        <CardHeader className="border-b">
          <CardTitle>{suite.name}</CardTitle>
          <CardDescription>{suite.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <h3 className="text-lg font-medium text-gray-900">{suite.result.label}</h3>
          <div className="text-sm text-gray-600">{suite.result.description}</div>
          <br />
          <ReportBarChart result={suite.result} size="small" />

        </CardContent>
      </Card>

      {suite.test_cases.length > 1 &&
        suite.test_cases.map((testCase, index) => (
          <div key={index} className="mt-4">
            <Card>
              <CardHeader className="border-b">
                <CardTitle>{testCase.label}</CardTitle>
                <CardDescription>{testCase.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ReportBarChart result={calculateAverageMetrics(testCase)} size="small" />
                <br />
                <ReportBarChart result={testCase} size="big" />
              </CardContent>
            </Card>
          </div>
        ))
      }
    </div>
  )
}
