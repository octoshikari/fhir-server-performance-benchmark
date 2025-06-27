import Image from "next/image";
import Link from "next/link";

import type { InferGetServerSidePropsType, GetServerSideProps } from 'next'

function getRuns() {
  const fs = require('fs')
  const path = require('path')
  const reportsDir = path.join(process.cwd(), 'public/reports')
  return fs.readdirSync(reportsDir)
    .filter(file => file.startsWith('SNAPSHOT_'))
    .map(file => file.replace('.json', ''))
    .sort((a, b) => b.localeCompare(a))
}

export const getServerSideProps = (async (context) => {
  const runs = await getRuns()
  return { props: { runs } }
}) satisfies GetServerSideProps<{ runs: string[] }>


export default function Home({ runs }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <div>

    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Performance Benchmark Dashboard
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Comparing performance metrics across FHIR servers
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
            </div>
          </div>
        </div>
      </div>
    </header>
    <main className="max-w-7xl mx-auto px-6 py-8">
      <div className=" md:grid-cols-2 lg:grid-cols-3 gap-4">
        {runs.map((run) => (
          <div className="flex flex-col gap-2" key={run}>
            <Link href={`/report?runid=${run}`} className="text-blue-500">
              {run}
            </Link>
          </div>
        ))}
      </div>
    </main>
    </div>
  );
}
