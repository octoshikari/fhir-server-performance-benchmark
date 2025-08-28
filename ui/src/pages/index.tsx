import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const [runs, setRuns] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReportsFromGCS();
  }, []);

  const fetchReportsFromGCS = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // GCS public bucket URL for listing objects
      // Using the JSON API to list objects in the bucket
      const bucketUrl = 'https://storage.googleapis.com/storage/v1/b/samurai-public/o';
      const params = new URLSearchParams({
        prefix: 'fhir-server-performance-benchmark/SNAPSHOT_',
        maxResults: '30',
        fields: 'items(name,timeCreated)',
      });

      const apiUrl = `${bucketUrl}?${params}`;
      let response: Response | null = null;
      let usedProxy = false;

      try {
        response = await fetch(apiUrl);
      } catch (corsError) {
        // If direct fetch fails (likely CORS), try with a public CORS proxy for development
        console.warn('Direct fetch failed, likely due to CORS. Trying proxy for development...');
        
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`;
        
        try {
          response = await fetch(proxyUrl);
          usedProxy = true;
          console.log('Successfully fetched report list via CORS proxy (development mode)');
        } catch (proxyError) {
          console.error('Proxy fetch also failed:', proxyError);
          throw new Error('Unable to fetch report list. CORS is blocking access.');
        }
      }
      
      if (!response || !response.ok) {
        throw new Error(`Failed to fetch reports: ${response?.status || 'Unknown error'}`);
      }
      
      if (usedProxy && typeof window !== 'undefined') {
        console.warn('⚠️ Report list loaded via CORS proxy. For production, configure CORS on the GCS bucket.');
      }

      const data = await response.json();
      
      if (data.items && Array.isArray(data.items)) {
        // Extract run IDs from file names and sort by creation time (newest first)
        const reportRuns = data.items
          .map((item: any) => {
            // Extract run ID from path: fhir-server-performance-benchmark/SNAPSHOT_XXXXX.json
            const match = item.name.match(/SNAPSHOT_(.+)\.json$/);
            return match ? {
              runId: match[1],
              timeCreated: item.timeCreated
            } : null;
          })
          .filter((item: any) => item !== null)
          .sort((a: any, b: any) => 
            new Date(b.timeCreated).getTime() - new Date(a.timeCreated).getTime()
          )
          .map((item: any) => item.runId);
        
        setRuns(reportRuns);
      } else {
        setRuns([]);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch reports');
      setRuns([]);
    } finally {
      setLoading(false);
    }
  };

  const formatRunId = (runId: string) => {
    // Format the run ID for better readability if it's a timestamp
    try {
      if (runId.match(/^\d{4}-\d{2}-\d{2}T/)) {
        const date = new Date(runId);
        return date.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short'
        });
      }
    } catch {
      // If parsing fails, return original
    }
    return runId;
  };
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
              <button
                onClick={fetchReportsFromGCS}
                disabled={loading}
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-500">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p>Loading reports from cloud storage...</p>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            <p className="font-medium">Error loading reports</p>
            <p className="text-sm">{error}</p>
            <button
              onClick={fetchReportsFromGCS}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && runs.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No benchmark reports available</p>
            <p className="text-sm mt-2">Reports will appear here once benchmark tests are run</p>
          </div>
        )}

        {!loading && !error && runs.length > 0 && (
          <>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800">
                Available benchmark reports
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Showing {runs.length} most recent reports
              </p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {runs.map((run) => (
                <Link
                  key={run}
                  href={`/report?runid=${run}`}
                  className="block p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">
                        {formatRunId(run)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Run ID: {run}
                      </p>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
