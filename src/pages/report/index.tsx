import Link from "next/link";
import { useSearchParams } from 'next/navigation'
import { BenchmarkReport } from "@/types/benchmark.types";
import { parseBenchmarkReport } from "@/utils/benchmark-parser";
import { Suite } from "@/components/Suite";
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next'

function crudQuery(runid: string) {
 return `sum by (fhirimpl, scenario) (avg_over_time(irate(k6_http_reqs_total{runid="${runid}", scenario="crud"}[1m])[24h:]))`
}

function importQuery(runid: string) {
 return `sum by (fhirimpl, scenario) (avg_over_time(irate(k6_http_reqs_total{runid="${runid}", scenario="import"}[1m])[24h:]))`
}

export const getServerSideProps = (async (context) => {
  const runid = context.query.runid as string
  // const query = crudQuery(runid)
  // const query = importQuery(runid)
  const fs = require('fs')
  const path = require('path')
  const reportsPath = path.join(process.cwd(), 'public/reports', `${runid}.json`)
  const benchmarkReport = fs.readFileSync(reportsPath, 'utf8')
  console.log(benchmarkReport)

  const report = parseBenchmarkReport(benchmarkReport)
  return { props: { report } }
}) satisfies GetServerSideProps<{ report: BenchmarkReport }>

function generateQueries(runid: string) {
  return {
    crud: {
      average_rps: {
        query: `sum by (fhirimpl, scenario) (avg_over_time(irate(k6_http_reqs_total{runid="${runid}", scenario="crud"}[1m])[24h:]))`,
      },
      average_crud_p99: {
        query: `sum by (fhirimpl, method, name) (avg_over_time(k6_http_req_duration_p99{runid="${runid}", scenario="crud"}[24h:]))`,
      }
    }
  }
}

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
            <p className="text-sm text-gray-600 mt-1">
              Comparing performance metrics across FHIR servers
            </p>
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
      {/* {report.data.result.map((result: PrometheusVectorData) => (
        <div className="flex gap-2">
          <div> {result.metric.fhirimpl} </div>
          <div> {result.metric.scenario} </div>
          <div> {result.value[1]} RPS</div>
        </div>
      ))} */}
    </main>
  </div>

  );
}
