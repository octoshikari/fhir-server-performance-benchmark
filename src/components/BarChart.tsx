'use client'

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, LabelList, ResponsiveContainer } from "recharts"
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { BenchmarkResult } from "@/types/benchmark.types"


const chartConfig = {
    aidbox: { label: "Aidbox", },
    medplum: { label: "Medplum", },
    hapi: { label: "Hapi", }
} satisfies ChartConfig



export function ReportBarChart({ result, size }: { result: BenchmarkResult, size: "small" | "big" }) {
    let className = "w-full"
    if (size === "small") {
        className = `h-[120px] ${className}`
    } else {
        className = `h-[300px] ${className}`
    }

    return (
        <ChartContainer config={chartConfig} className={className}>
            <BarChart
                accessibilityLayer
                data={result.data}
                layout="vertical"
            >
                <XAxis type="number" hide />
                <YAxis
                    dataKey="category"
                    type="category"
                    tickLine={false}
                    tickMargin={10}
                    className="text-sm font-bold"
                    width={100}
                    axisLine={false}
                    tickFormatter={(value) => value}
                />
                {/* <CartesianGrid horizontal={false} /> */}

                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                />
                <ChartLegend content={<ChartLegendContent />} />

                {Object.entries(chartConfig).map(([key]) => (
                    <Bar
                        key={key}
                        dataKey={key}
                        fill={`var(--color-${key})`}
                        radius={4}
                        barSize={24}
                    >
                        <LabelList
                            dataKey={key}
                            formatter={(value) => `${value} ${result.unit}`}
                            position="insideRight"
                            fill="white"
                            offset={10}
                            fontSize={12}
                        />
                    </Bar>
                ))}

            </BarChart>

        </ChartContainer>

    )
}