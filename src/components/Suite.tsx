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

export function Suite({ suite }: { suite: BenchmarkSuite }) {
  return (
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

        {suite.test_cases.map((testCase, index) => (
          <div key={index} className="mt-4">
            <h3 className="text-lg font-medium text-gray-900">{testCase.label}</h3>
            <div className="text-sm text-gray-600">{testCase.description}</div>
            <br />
            <ReportBarChart result={testCase} size="big" />
          </div>
        ))}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
      </CardFooter>
    </Card>
  )
}
