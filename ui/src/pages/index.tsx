"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { BranchSelector } from "@/components/BranchSelector";

export default function Home() {
  const router = useRouter();
  const [runs, setRuns] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string>('main');
  const [availableBranches, setAvailableBranches] = useState<string[]>(['main']);

  useEffect(() => {
    // Read branch from URL on initial load
    if (router.isReady) {
      const branchFromUrl = router.query.branch as string;
      if (branchFromUrl) {
        setSelectedBranch(branchFromUrl);
      }
      fetchAvailableBranches();
    }
  }, [router.isReady, router.query]);

  useEffect(() => {
    fetchReportsFromGCS();
  }, [selectedBranch]);

  const handleBranchChange = (branch: string) => {
    setSelectedBranch(branch);
    // Update only query parameters, keep the same path
    const query = { ...router.query };
    if (branch === 'main') {
      delete query.branch;
    } else {
      query.branch = branch;
    }
    router.push({
      pathname: router.pathname,
      query: query
    }, undefined, { shallow: true });
  };

  const fetchAvailableBranches = async () => {
    try {
      // Fetch all folders/prefixes to identify branches
      const bucketUrl = 'https://storage.googleapis.com/storage/v1/b/samurai-public/o';
      const params = new URLSearchParams({
        prefix: 'fhir-server-performance-benchmark/',
        delimiter: '/',
        fields: 'prefixes',
      });

      const apiUrl = `${bucketUrl}?${params}`;
      const response = await fetch(apiUrl);
      
      if (response.ok) {
        const data = await response.json();
        if (data.prefixes && Array.isArray(data.prefixes)) {
          // Extract branch names from prefixes
          const branches = data.prefixes
            .map((prefix: string) => {
              const match = prefix.match(/fhir-server-performance-benchmark\/([^\/]+)\/$/);
              return match ? match[1] : null;
            })
            .filter((branch: string | null) => branch !== null);
          
          // Always include 'main' and combine with found branches
          const allBranches = ['main', ...branches.filter((b: string) => b !== 'main')];
          setAvailableBranches(allBranches);
        }
      }
    } catch (err) {
      console.error('Error fetching branches:', err);
      // Default to just main if we can't fetch branches
      setAvailableBranches(['main']);
    }
  };

  const fetchReportsFromGCS = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // GCS public bucket URL for listing objects
      // Using the JSON API to list objects in the bucket
      const bucketUrl = 'https://storage.googleapis.com/storage/v1/b/samurai-public/o';
      // Adjust prefix based on selected branch
      const prefix = selectedBranch === 'main' 
        ? 'fhir-server-performance-benchmark/SNAPSHOT_'
        : `fhir-server-performance-benchmark/${selectedBranch}/SNAPSHOT_`;
      
      const params = new URLSearchParams({
        prefix: prefix,
        maxResults: '30',
        fields: 'items(name,timeCreated)',
      });

      const apiUrl = `${bucketUrl}?${params}`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch reports: ${response.status}`);
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
              <BranchSelector
                selectedBranch={selectedBranch}
                onBranchChange={handleBranchChange}
                availableBranches={availableBranches}
              />
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
                Showing {runs.length} most recent reports from {selectedBranch} branch
              </p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {runs.map((run) => (
                <Link
                  key={run}
                  href={`/report?runid=${run}&branch=${selectedBranch}`}
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
