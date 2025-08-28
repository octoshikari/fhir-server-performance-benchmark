import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from 'next/navigation'
import { BenchmarkReport } from "@/types/benchmark.types";
import { parseBenchmarkReport } from "@/lib/benchmark-parser";
import { Suite } from "@/components/Suite";
import { ReportSummary } from "@/components/ReportSummary";

export default function ReportPage() {
  const searchParams = useSearchParams();
  const runid = searchParams?.get('runid') || null;
  
  const [report, setReport] = useState<BenchmarkReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (runid) {
      fetchReportFromGCS(runid);
    } else {
      setLoading(false);
      setError('No run ID provided');
    }
  }, [runid]);

  const fetchReportFromGCS = async (runId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Direct URL to the report file in GCS public bucket
      const reportUrl = `https://storage.googleapis.com/samurai-public/fhir-server-performance-benchmark/SNAPSHOT_${runId}.json`;
      
      // Try to fetch directly first
      let response: Response | null = null;
      let usedProxy = false;
      
      try {
        response = await fetch(reportUrl);
      } catch (corsError) {
        // If direct fetch fails (likely CORS), try with a public CORS proxy for development
        console.warn('Direct fetch failed, likely due to CORS. Trying proxy for development...');
        
        // Use a public CORS proxy for development only
        // In production, the bucket should have proper CORS configured
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(reportUrl)}`;
        
        try {
          response = await fetch(proxyUrl);
          usedProxy = true;
          console.log('Successfully fetched via CORS proxy (development mode)');
        } catch (proxyError) {
          console.error('Proxy fetch also failed:', proxyError);
          throw new Error('Unable to fetch report. CORS is blocking access. For production, configure CORS on the GCS bucket.');
        }
      }
      
      if (!response || !response.ok) {
        if (response?.status === 404) {
          throw new Error(`Report not found for run ID: ${runId}`);
        }
        throw new Error(`Failed to fetch report: ${response?.status || 'Unknown error'}`);
      }

      const reportData = await response.text();
      const parsedReport = parseBenchmarkReport(reportData);
      setReport(parsedReport);
      
      // Show a warning if proxy was used
      if (usedProxy && typeof window !== 'undefined') {
        console.warn('⚠️ Report loaded via CORS proxy. For production, configure CORS on the GCS bucket.');
      }
    } catch (err) {
      console.error('Error fetching report:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch report');
      setReport(null);
    } finally {
      setLoading(false);
    }
  };
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
            {report && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>Run ID:</span>
                  <span className="font-medium">{report.runid}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-500">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p>Loading report data...</p>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p className="font-medium">Error loading report</p>
            <p className="text-sm mt-1">{error}</p>
            <div className="mt-4">
              <Link href="/" className="text-sm text-red-700 underline hover:no-underline">
                Return to reports list
              </Link>
            </div>
          </div>
        )}

        {!loading && !error && report && (
          <>
            <ReportSummary report={report} />
            {report.suites.map((suite) => (
              <div key={suite.name} className="mb-12">
                <Suite suite={suite} />
              </div>
            ))}
          </>
        )}

        {!loading && !error && !report && (
          <div className="text-center py-12">
            <p className="text-gray-500">No report data available</p>
            <Link href="/" className="mt-4 inline-block text-blue-500 underline">
              Back to reports list
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
