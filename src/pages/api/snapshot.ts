import type { NextApiRequest, NextApiResponse } from 'next'
import { BenchmarkReport } from '@/types/benchmark.types'
import { instantQuery } from '@/lib/metrics'
import { convertSourceData } from '@/lib/benchmark-converter'

// runid 2025-06-24T15:54:10Z

type ResponseData = {
    snapshot
}

async function crudTotalRPS(runid: string) {
 return await instantQuery(`sum by (fhirimpl, scenario) (avg_over_time(rate(k6_http_reqs_total{runid="${runid}", scenario="crud"}[5m])[24h:]))`)
}

async function crudP99(runid: string) {
 return await instantQuery(`sum by (fhirimpl, scenario, group) (avg_over_time(k6_http_req_duration_p99{runid="${runid}", scenario="crud"}[24h:])) * 1000`)
}


async function getSnapshot(runid: string) {
    const crudTotalRPSData = await crudTotalRPS(runid)
    const crudP99Data = await crudP99(runid)
    return {
        crudTotalRPS: crudTotalRPSData,
        crudP99: crudP99Data
    }
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const snapshot = await getSnapshot(req.query.runid as string)
    const fs = require('fs')
    const path = require('path')
    
    const reportsDir = path.join(process.cwd(), 'public', 'reports')
    if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true })
    }
    
    const report = convertSourceData(snapshot as any)
    const reportPath = path.join(reportsDir, `SOURCE_${req.query.runid}.json`)
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    res.status(200).json(report)
}