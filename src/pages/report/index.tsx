import Link from "next/link";
import { useSearchParams } from 'next/navigation'
import { BenchmarkReport } from "@/types/benchmark.types";
import { parseBenchmarkReport } from "@/lib/benchmark-parser";
import { Suite } from "@/components/Suite";
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next'


export const getServerSideProps = (async (context) => {
  const runid = context.query.runid as string
  if (!runid) {
    return { report: null }
  }
  const fs = require('fs')
  const path = require('path')
  const reportsPath = path.join(process.cwd(), 'public/reports', `${runid}.json`)
  const benchmarkReport = fs.readFileSync(reportsPath, 'utf8')

  const report = parseBenchmarkReport(benchmarkReport)
  return { props: { report } }
}) satisfies GetServerSideProps<{ report: BenchmarkReport }>


export default function ReportPage({
  report
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const searchParams = useSearchParams()
  return (
    <div>
    {/* Header */}
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/" className="text-blue-500"> ← Back to all reports</Link>
            <h1 className="text-2xl font-bold text-gray-900">
              Performance Benchmark Report
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Run ID:</span>
              <span className="font-medium"> {report.runid} </span>
            </div>
          </div>
        </div>
      </div>
    </header>

    {/* Main Content */}
    <main className="max-w-7xl mx-auto px-6 py-8">
      {report.suites.map(suite => (
        <div key={suite.name} className="mb-12">
          <Suite  suite={suite} />
        </div>
      ))}
      
    </main>
  </div>

  );
}
