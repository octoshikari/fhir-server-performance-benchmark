'use client'

import { TrendingUp } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { BenchmarkSuite } from "@/types/benchmark.types"
import {ReportBarChart} from "@/components/BarChart"


export function Suite({ suite }: { suite: BenchmarkSuite }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{suite.name}</CardTitle>
        <CardDescription>{suite.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">Summary</div>
        <ReportBarChart result={suite.result} />

        <div className="flex flex-col gap-4">Detailed</div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter>
    </Card>
  )
}
