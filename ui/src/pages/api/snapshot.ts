import type { NextApiRequest, NextApiResponse } from 'next'
import { instantQuery } from '@/lib/metrics'
import { convertSourceData } from '@/lib/benchmark-converter'

// runid 2025-06-24T15:54:10Z


async function crudTotalRPS(runid: string) {
 return await instantQuery(`sum by (fhirimpl, scenario) (avg_over_time(rate(k6_http_reqs_total{runid="${runid}", scenario="crud"}[5m])[24h:]))`)
}

async function crudP99(runid: string) {
 return await instantQuery(`sum by (fhirimpl, scenario, group) (avg_over_time(k6_http_req_duration_p99{runid="${runid}", scenario="crud"}[24h:])) * 1000`)
}

async function importTotalRPS(runid: string) {
 return await instantQuery(`sum by (fhirimpl, scenario) (avg_over_time(rate(k6_http_reqs_total{runid="${runid}", scenario="import"}[5m])[24h:]))`)
}

async function importThroughput(runid: string) {
 return await instantQuery(`sum by (fhirimpl) (avg_over_time(rate(k6_bundle_size_total{runid="${runid}"}[5m])[24h:]))`)
}

async function searchTotalRPS(runid: string) {
 return await instantQuery(`sum by (fhirimpl) (avg_over_time(rate(k6_http_reqs_total{runid="${runid}", scenario="search"}[5m])[24h:]))`)
}

async function searchP99(runid: string) {
 return await instantQuery(`sum by (fhirimpl, scenario, group) (avg_over_time(k6_http_req_duration_p99{runid="${runid}", scenario="search"}[24h:])) * 1000`)
}



async function getSnapshot(runid: string) {
    return {
        crud: {
            summary: await crudTotalRPS(runid),
            test_cases: await crudP99(runid)
        },
        import: {
            summary: await importTotalRPS(runid),
            test_cases: await importThroughput(runid)
        },
        search: {
            summary: await searchTotalRPS(runid),
            test_cases: await searchP99(runid)
        }
    }
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const snapshot = await getSnapshot(req.query.runid as string)
    const fs = require('fs')
    const path = require('path')
    
    const reportsDir = path.join(process.cwd(), '..', 'reports')
    if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true })
    }
    
    const report = convertSourceData(snapshot as any)
    const reportPath = path.join(reportsDir, `SNAPSHOT_${req.query.runid}.json`)
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    res.status(200).json(report)

    // const reportPath = path.join(reportsDir, `SOURCE_DATA_${req.query.runid}.json`)
    // fs.writeFileSync(reportPath, JSON.stringify(snapshot, null, 2))
    // res.status(200).json(snapshot)
}