"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Github } from "lucide-react";

const PAGE_SIZE = 30;

export default function Home() {
  const [runs, setRuns] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchReportsFromGCS();
  }, []);

  const fetchReportsFromGCS = async () => {
    try {
      setLoading(true);
      setError(null);

      // GCS public bucket URL for listing objects
      const bucketUrl = 'https://storage.googleapis.com/storage/v1/b/samurai-public/o';
      const prefix = 'fhir-server-performance-benchmark/SNAPSHOT_';

      const params = new URLSearchParams({
        prefix: prefix,
        maxResults: '300',
        fields: 'items(name,timeCreated)',
      });

      const apiUrl = `${bucketUrl}?${params}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch reports: ${response.status}`);
      }

      const data = await response.json();

      if (data.items && Array.isArray(data.items)) {
        const reportRuns = data.items
          .map((item: any) => {
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
            <div className="flex items-center space-x-6">
              <Link
                href="/infrastructure"
                className="text-base font-medium text-blue-600 hover:text-blue-700 hover:underline"
              >
                Infrastructure
              </Link>
              <Link
                href="/tests"
                className="text-base font-medium text-blue-600 hover:text-blue-700 hover:underline"
              >
                Tests
              </Link>
            </div>
            <a
              href="https://github.com/HealthSamurai/fhir-server-performance-benchmark"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
              title="View source on GitHub (new tab)"
            >
              <Github className="w-5 h-5" />
              <span>GitHub</span>
            </a>
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

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Performance Benchmark Dashboard
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Comparing performance metrics across FHIR servers
              </p>
            </div>

        {!loading && !error && runs.length > 0 && (() => {
          const totalPages = Math.max(1, Math.ceil(runs.length / PAGE_SIZE));
          const safePage = Math.min(page, totalPages);
          const start = (safePage - 1) * PAGE_SIZE;
          const visible = runs.slice(start, start + PAGE_SIZE);
          return (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800">
                  Benchmark reports
                </h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {visible.map((run) => (
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

                <p className="text-right mt-8 text-sm text-gray-600 mt-1">
                  Showing {start + 1}–{start + visible.length} of {runs.length}
                </p>

              {totalPages > 1 && (
                <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
              )}
            </>
          );
        })()}
      </main>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (next: number) => void;
}) {
  const pageNumbers = buildPageList(page, totalPages);

  return (
    <nav className="flex items-center justify-center gap-1 mt-8" aria-label="Pagination">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="inline-flex items-center justify-center w-9 h-9 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pageNumbers.map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="px-2 text-gray-400 select-none">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={`min-w-9 h-9 px-3 rounded text-sm border transition cursor-pointer ${
              p === page
                ? "border-blue-500 bg-blue-500 text-white"
                : "border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="inline-flex items-center justify-center w-9 h-9 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}

function buildPageList(current: number, total: number): (number | "…")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const result: (number | "…")[] = [1];
  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);
  if (left > 2) result.push("…");
  for (let i = left; i <= right; i++) result.push(i);
  if (right < total - 1) result.push("…");
  result.push(total);
  return result;
}
