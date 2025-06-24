'use client'

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, LabelList, ResponsiveContainer } from "recharts"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { BenchmarkResult } from "@/types/benchmark.types"


export const description = "A bar chart with a custom label"

const chartData = [
    { month: "January", desktop: 186, mobile: 80 },
    { month: "February", desktop: 305, mobile: 200 },
    { month: "March", desktop: 237, mobile: 120 },
    { month: "April", desktop: 73, mobile: 190 },
    { month: "May", desktop: 209, mobile: 130 },
    { month: "June", desktop: 214, mobile: 140 },
]

const chartConfig = {
    aidbox: {
        label: "Aidbox",
        color: "var(--color-aidbox)",
    },
    medplum: {
        label: "Medplum",
        color: "var(--color-medplum)",
    },
    hapi: {
        label: "Hapi",
        color: "var(--color-hapi)",
    },
    group: {
        color: "var(--background)",
    },
} satisfies ChartConfig

const CustomTooltip = ({ active, payload, label }) => {
    const isVisible = active && payload && payload.length;
    return (
        <div> <p>Foo</p> <p>Bar</p> </div>
    );
  };


export function ReportBarChart({ result }: { result: BenchmarkResult }) {
    // Transform the data to work with vertical bar chart
    const data = [
        { server: 'aidbox', value: result.data.aidbox, color: 'var(--color-aidbox)' },
        { server: 'medplum', value: result.data.medplum, color: 'var(--color-medplum)' },
        { server: 'hapi', value: result.data.hapi, color: 'var(--color-hapi)' }
    ];

    return (
        <div>
            <h3 className="text-lg font-semibold mb-4">{result.type} ({result.unit})</h3>

            <ResponsiveContainer width="100%" minHeight={60}>
            {/* <ChartContainer config={chartConfig}> */}

                <BarChart
                    accessibilityLayer
                    data={data}
                    layout="vertical"
                >
                    <XAxis type="number" hide />
                    <YAxis
                        dataKey="server"
                        type="category"
                        tickLine={false}
                        tickMargin={2}
                        axisLine={false}
                        width={40}
                    />
                    {/* // <Tooltip/> */}
                    <Tooltip content={CustomTooltip} />

                    {/* <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="line" />}
                    /> */}

                    <Bar
                        dataKey="value"
                        radius={3}
                        barSize={15}
                        // fill="var(--color-aidbox)"
                    >
                        <LabelList
                            dataKey="value"
                            position="right"
                            offset={3}
                            className="fill-foreground"
                            fontSize={9}
                        />
                    </Bar>
                </BarChart>

            {/* </ChartContainer> */}
            </ResponsiveContainer>

        </div>
    )
}




// export function ReportBarChart({result}: {result: BenchmarkResult}) {
//     console.log('---result', result)
//     return (
//         <ChartContainer config={chartConfig}>
//             <BarChart
//                 accessibilityLayer
//                 data={[result.data]}
//                 layout="vertical"
//             >
//                 {/* <CartesianGrid horizontal={false} /> */}
//                 <XAxis type="number" dataKey="aidbox" hide />
//                 <YAxis
//                     dataKey="group"
//                     width={150}
//                     type="category"
//                     tickLine={false}
//                     tickMargin={1}
//                     axisLine={false}
//                     tickFormatter={(value) => value.toString() } 
//                 />
//                 {/* <ChartTooltip
//               cursor={false}
//               shared={false}
//               content={<ChartTooltipContent  />}
//             /> */}
//                 <Bar dataKey="aidbox" fill="var(--color-aidbox)" radius={3} >
//                     <LabelList
//                         formatter={(value) => `Aidbox`}
//                         position="insideLeft"
//                         offset={8}
//                         className="fill-foreground"
//                         fontSize={12}
//                     />
//                     <LabelList
//                         dataKey="aidbox"
//                         // content={<div>Aidbox</div>}
//                         position="right"
//                         offset={8}
//                         className="fill-foreground"
//                         fontSize={12}
//                     />
//                 </Bar>
//                 <Bar dataKey="medplum" fill="var(--color-medplum)" radius={3} />
//                 <Bar dataKey="hapi" fill="var(--color-hapi)" radius={3} />
//             </BarChart>
//         </ChartContainer>
//     )
// }