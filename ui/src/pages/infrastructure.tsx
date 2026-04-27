"use client";

import React from "react";
import Link from "next/link";

export default function Infrastructure() {
  return (
    <div>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/" className="text-blue-500">
                ← Back to dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 mt-1">
                Test Infrastructure
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                How the benchmark suite is wired together
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Overview</h2>
          <p className="text-gray-700 leading-relaxed">
            The benchmark compares three FHIR server implementations under identical workload, hardware, and database
            conditions. Each test run boots the full stack via Docker Compose, runs k6 scenarios sequentially against
            each server, and ships metrics to Prometheus.
          </p>
        </section>

        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Architecture diagram</h2>
          <div className="overflow-x-auto">
            <svg viewBox="0 0 980 760" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto" style={{ minWidth: 720 }}>
              <defs>
                <marker id="arr-blue" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#2563eb" />
                </marker>
                <marker id="arr-green" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#16a34a" />
                </marker>
                <marker id="arr-red" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#dc2626" />
                </marker>
                <marker id="arr-orange" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#ea580c" />
                </marker>
              </defs>


              {/* Row 2: k6 + tgz */}
              <rect x="40" y="90" width="220" height="64" rx="6" fill="#dbeafe" stroke="#3b82f6" />
              <text x="150" y="118" textAnchor="middle" fontSize="14" fontWeight="600" fill="#1e3a8a">k6 runner</text>
              <text x="150" y="138" textAnchor="middle" fontSize="11" fill="#1e40af">prewarm · crud · search · import</text>

              <rect x="720" y="90" width="220" height="64" rx="6" fill="#fef3c7" stroke="#d97706" />
              <text x="830" y="118" textAnchor="middle" fontSize="14" fontWeight="600" fill="#78350f">tgz</text>
              <text x="830" y="138" textAnchor="middle" fontSize="11" fill="#92400e">Synthea bundle host</text>

              {/* Row 3: FHIR servers */}
              <rect x="40"  y="200" width="220" height="78" rx="6" fill="#fce7f3" stroke="#db2777" />
              <text x="150" y="230" textAnchor="middle" fontSize="14" fontWeight="600" fill="#831843">Aidbox</text>
              <text x="150" y="250" textAnchor="middle" fontSize="11" fill="#9d174d">JVM · :8080</text>
              <text x="150" y="266" textAnchor="middle" fontSize="11" fill="#9d174d">/metrics on :8379</text>

              <rect x="380" y="200" width="220" height="78" rx="6" fill="#fce7f3" stroke="#db2777" />
              <text x="490" y="230" textAnchor="middle" fontSize="14" fontWeight="600" fill="#831843">HAPI FHIR</text>
              <text x="490" y="250" textAnchor="middle" fontSize="11" fill="#9d174d">JVM · :8080</text>
              <text x="490" y="266" textAnchor="middle" fontSize="11" fill="#9d174d">/actuator/prometheus</text>

              <rect x="720" y="200" width="220" height="78" rx="6" fill="#fce7f3" stroke="#db2777" />
              <text x="830" y="230" textAnchor="middle" fontSize="14" fontWeight="600" fill="#831843">Medplum (×8)</text>
              <text x="830" y="250" textAnchor="middle" fontSize="11" fill="#9d174d">Node.js · :8103</text>
              <text x="830" y="266" textAnchor="middle" fontSize="11" fill="#9d174d">OAuth2</text>

              {/* Row 4: PostgreSQL + Redis */}
              <rect x="280" y="330" width="280" height="74" rx="6" fill="#dcfce7" stroke="#16a34a" />
              <text x="420" y="360" textAnchor="middle" fontSize="14" fontWeight="600" fill="#14532d">PostgreSQL 18</text>
              <text x="420" y="380" textAnchor="middle" fontSize="11" fill="#166534">shared instance · DB-per-server</text>

              <rect x="720" y="330" width="220" height="74" rx="6" fill="#fee2e2" stroke="#dc2626" />
              <text x="830" y="360" textAnchor="middle" fontSize="14" fontWeight="600" fill="#7f1d1d">Redis</text>
              <text x="830" y="380" textAnchor="middle" fontSize="11" fill="#991b1b">Medplum sessions/cache</text>

              {/* Monitoring band */}
              <rect x="20" y="450" width="940" height="240" rx="10" fill="#fff7ed" stroke="#ea580c" strokeDasharray="6,4" />
              <text x="40" y="475" fontSize="12" fontWeight="700" fill="#9a3412">MONITORING</text>

              <rect x="40"  y="500" width="220" height="64" rx="6" fill="#ffedd5" stroke="#f97316" />
              <text x="150" y="528" textAnchor="middle" fontSize="14" fontWeight="600" fill="#7c2d12">cAdvisor</text>
              <text x="150" y="548" textAnchor="middle" fontSize="11" fill="#9a3412">container CPU / mem / I/O</text>

              <rect x="380" y="500" width="220" height="64" rx="6" fill="#ffedd5" stroke="#f97316" strokeWidth="2" />
              <text x="490" y="528" textAnchor="middle" fontSize="14" fontWeight="700" fill="#7c2d12">Prometheus</text>
              <text x="490" y="548" textAnchor="middle" fontSize="11" fill="#9a3412">scrape + remote-write</text>

              <rect x="720" y="500" width="220" height="64" rx="6" fill="#ffedd5" stroke="#f97316" />
              <text x="830" y="528" textAnchor="middle" fontSize="14" fontWeight="600" fill="#7c2d12">Grafana</text>
              <text x="830" y="548" textAnchor="middle" fontSize="11" fill="#9a3412">dashboards · :13000</text>

              <rect x="40"  y="600" width="220" height="64" rx="6" fill="#ffedd5" stroke="#f97316" />
              <text x="150" y="628" textAnchor="middle" fontSize="14" fontWeight="600" fill="#7c2d12">postgres-exporter</text>
              <text x="150" y="648" textAnchor="middle" fontSize="11" fill="#9a3412">PG internals</text>

              <rect x="380" y="600" width="220" height="64" rx="6" fill="#ffedd5" stroke="#f97316" />
              <text x="490" y="628" textAnchor="middle" fontSize="14" fontWeight="600" fill="#7c2d12">OTel Collector</text>
              <text x="490" y="648" textAnchor="middle" fontSize="11" fill="#9a3412">OTLP → Prometheus exporter</text>

              {/* Arrows: k6 → FHIR servers (HTTP) */}
              <line x1="150" y1="154" x2="150" y2="200" stroke="#2563eb" strokeWidth="2" markerEnd="url(#arr-blue)" />
              <line x1="200" y1="154" x2="490" y2="200" stroke="#2563eb" strokeWidth="2" markerEnd="url(#arr-blue)" />
              <line x1="220" y1="154" x2="780" y2="200" stroke="#2563eb" strokeWidth="2" markerEnd="url(#arr-blue)" />

              {/* k6 → tgz (fetches dataset) */}
              <line x1="260" y1="122" x2="720" y2="122" stroke="#2563eb" strokeWidth="2" strokeDasharray="4,3" markerEnd="url(#arr-blue)" />
              <text x="490" y="115" textAnchor="middle" fontSize="10" fill="#1e40af">fetch dataset</text>

              {/* FHIR → PostgreSQL (SQL) */}
              <line x1="180" y1="278" x2="340" y2="330" stroke="#16a34a" strokeWidth="2" markerEnd="url(#arr-green)" />
              <line x1="490" y1="278" x2="430" y2="330" stroke="#16a34a" strokeWidth="2" markerEnd="url(#arr-green)" />
              <line x1="780" y1="278" x2="510" y2="330" stroke="#16a34a" strokeWidth="2" markerEnd="url(#arr-green)" />

              {/* Medplum → Redis */}
              <line x1="830" y1="278" x2="830" y2="330" stroke="#dc2626" strokeWidth="2" markerEnd="url(#arr-red)" />

              {/* Monitoring arrows (dashed orange) */}
              {/* Aidbox → Prometheus */}
              <path d="M 220 278 Q 260 400 400 500" fill="none" stroke="#ea580c" strokeWidth="1.5" strokeDasharray="3,3" markerEnd="url(#arr-orange)" />
              {/* HAPI → Prometheus */}
              <path d="M 490 278 Q 490 390 490 500" fill="none" stroke="#ea580c" strokeWidth="1.5" strokeDasharray="3,3" markerEnd="url(#arr-orange)" />
              {/* k6 → Prometheus (remote-write) */}
              <path d="M 80 154 Q 30 380 380 520" fill="none" stroke="#ea580c" strokeWidth="1.5" strokeDasharray="3,3" markerEnd="url(#arr-orange)" />
              {/* cAdvisor → Prometheus */}
              <line x1="260" y1="532" x2="380" y2="532" stroke="#ea580c" strokeWidth="1.5" markerEnd="url(#arr-orange)" />
              {/* postgres-exporter → Prometheus */}
              <path d="M 260 632 Q 360 632 460 564" fill="none" stroke="#ea580c" strokeWidth="1.5" markerEnd="url(#arr-orange)" />
              {/* Grafana ← Prometheus */}
              <line x1="720" y1="532" x2="600" y2="532" stroke="#ea580c" strokeWidth="1.5" markerEnd="url(#arr-orange)" />
              {/* Medplum → OTel Collector (OTLP) */}
              <path d="M 830 278 Q 700 460 600 632" fill="none" stroke="#ea580c" strokeWidth="1.5" strokeDasharray="3,3" markerEnd="url(#arr-orange)" />
              {/* OTel Collector → Prometheus */}
              <line x1="490" y1="600" x2="490" y2="564" stroke="#ea580c" strokeWidth="1.5" markerEnd="url(#arr-orange)" />

              {/* Legend */}
              <g transform="translate(40, 706)">
                <line x1="0" y1="6" x2="20" y2="6" stroke="#2563eb" strokeWidth="2" />
                <text x="26" y="10" fontSize="11" fill="#374151">FHIR HTTP</text>

                <line x1="120" y1="6" x2="140" y2="6" stroke="#16a34a" strokeWidth="2" />
                <text x="146" y="10" fontSize="11" fill="#374151">SQL</text>

                <line x1="200" y1="6" x2="220" y2="6" stroke="#dc2626" strokeWidth="2" />
                <text x="226" y="10" fontSize="11" fill="#374151">Cache</text>

                <line x1="290" y1="6" x2="310" y2="6" stroke="#ea580c" strokeWidth="1.5" strokeDasharray="3,3" />
                <text x="316" y="10" fontSize="11" fill="#374151">metrics scrape / remote-write</text>
              </g>
            </svg>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Solid arrows are runtime traffic during a test run. Dashed orange lines are metrics flowing into the
            monitoring stack — Prometheus scrapes <code className="px-1 bg-gray-100 rounded">/metrics</code> endpoints
            and receives k6 results via remote-write; Grafana reads from Prometheus.
          </p>
        </section>

        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">FHIR servers under test</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-md p-4">
              <h3 className="font-semibold text-gray-900">Aidbox</h3>
              <p className="text-sm text-gray-600 mt-1">healthsamurai/aidboxone:edge</p>
              <p className="text-sm text-gray-700 mt-2">JVM, basic auth, 8 vCPU / 20 GB RAM</p>
            </div>
            <div className="border border-gray-200 rounded-md p-4">
              <h3 className="font-semibold text-gray-900">HAPI FHIR</h3>
              <p className="text-sm text-gray-600 mt-1">hapiproject/hapi:latest</p>
              <p className="text-sm text-gray-700 mt-2">JVM, basic auth, 8 vCPU / 20 GB RAM</p>
            </div>
            <div className="border border-gray-200 rounded-md p-4">
              <h3 className="font-semibold text-gray-900">Medplum</h3>
              <p className="text-sm text-gray-600 mt-1">medplum/medplum-server</p>
              <p className="text-sm text-gray-700 mt-2">Node.js, OAuth2, 8 replicas × 2 vCPU / 3 GB</p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Shared infrastructure</h2>
          <ul className="space-y-2 text-gray-700">
            <li>
              <span className="font-medium">PostgreSQL 18</span> — single instance, separate databases per server,
              tuned via <code className="px-1 py-0.5 bg-gray-100 rounded text-sm">postgres.conf</code>, 8 vCPU / 30 GB RAM.
            </li>
            <li>
              <span className="font-medium">Redis</span> — used by Medplum for sessions and caching.
            </li>
            <li>
              <span className="font-medium">tgz</span> — service that downloads and serves the synthetic dataset
              (Synthea bulk_1k) for import tests.
            </li>
          </ul>
        </section>

        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test scenarios (k6)</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Scenario</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-2 px-3 font-mono text-gray-900">prewarm.js</td>
                  <td className="py-2 px-3 text-gray-700">Warm up JVMs and caches before measurement</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-gray-900">crud.js</td>
                  <td className="py-2 px-3 text-gray-700">Create / read / update / delete throughput on FHIR resources</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-gray-900">search.js</td>
                  <td className="py-2 px-3 text-gray-700">Search performance on a pre-loaded Patient dataset with custom indexes</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-gray-900">import.js</td>
                  <td className="py-2 px-3 text-gray-700">Bulk ingest of a Synthea bundle</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Monitoring stack</h2>
          <ul className="space-y-2 text-gray-700">
            <li>
              <span className="font-medium">Prometheus</span> — receives k6 metrics via remote-write and scrapes
              exporters.
            </li>
            <li>
              <span className="font-medium">Grafana</span> — provisioned dashboards with anonymous Admin access.
            </li>
            <li>
              <span className="font-medium">cAdvisor</span> — per-container CPU / memory / IO metrics.
            </li>
            <li>
              <span className="font-medium">postgres-exporter</span> — PostgreSQL internals.
            </li>
            <li>
              <span className="font-medium">OTel Collector</span> — receives OpenTelemetry metrics from Medplum
              (which has no native Prometheus endpoint) and re-exposes them via a Prometheus exporter that
              Prometheus scrapes.
            </li>
          </ul>
        </section>

        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">CI execution</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Drone CI runs the full suite on every commit on a dedicated bare-metal node (<code className="px-1 py-0.5 bg-gray-100 rounded text-sm">hz-cdr</code>).
            Docker-in-Docker hosts the stack; persistent host volumes cache image layers between builds.
            Search-test datasets are stored on ZFS for fast snapshot-based resets.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Each run is tagged with <code className="px-1 py-0.5 bg-gray-100 rounded text-sm">runid</code>,
            <code className="px-1 py-0.5 bg-gray-100 rounded text-sm">commit</code>, and
            <code className="px-1 py-0.5 bg-gray-100 rounded text-sm">branch</code> labels, then snapshotted into a
            JSON report and uploaded to <code className="px-1 py-0.5 bg-gray-100 rounded text-sm">gs://samurai-public/fhir-server-performance-benchmark/</code>.
            The dashboard reads those snapshots directly from GCS.
          </p>
        </section>

        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Service ports (local)</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Service</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">URL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr><td className="py-2 px-3 font-mono">Aidbox</td><td className="py-2 px-3 font-mono">http://localhost:13080</td></tr>
                <tr><td className="py-2 px-3 font-mono">HAPI</td><td className="py-2 px-3 font-mono">http://localhost:13090</td></tr>
                <tr><td className="py-2 px-3 font-mono">Grafana</td><td className="py-2 px-3 font-mono">http://localhost:13000</td></tr>
                <tr><td className="py-2 px-3 font-mono">Prometheus</td><td className="py-2 px-3 font-mono">http://localhost:13010</td></tr>
                <tr><td className="py-2 px-3 font-mono">PostgreSQL</td><td className="py-2 px-3 font-mono">localhost:13020</td></tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
