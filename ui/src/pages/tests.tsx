import React from "react";
import Link from "next/link";
import type { GetStaticProps } from "next";
import { Github } from "lucide-react";
import { TestScenarioAccordion } from "@/components/TestScenarioAccordion";
import { loadTestScenarios, type TestScenario } from "@/lib/infra-snippets";

interface TestsProps {
  scenarios: TestScenario[];
}

export const getStaticProps: GetStaticProps<TestsProps> = async () => {
  return { props: { scenarios: loadTestScenarios() } };
};

export default function Tests({ scenarios }: TestsProps) {
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

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div>
          <Link href="/" className="text-blue-600 hover:underline text-sm">
            ← Back to dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Tests</h1>
          <p className="text-sm text-gray-600 mt-1">
            What we measure and how — k6 scenarios run during each benchmark
          </p>
        </div>

        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Overview</h2>
          <p className="text-gray-700 leading-relaxed">
            Each benchmark run executes a sequence of k6 scenarios against every FHIR server in turn,
            on identical infrastructure. Results are tagged with <code className="px-1 py-0.5 bg-gray-100 rounded text-sm">runid</code>
            {" "}and <code className="px-1 py-0.5 bg-gray-100 rounded text-sm">fhirimpl</code> labels and shipped to Prometheus.
          </p>
        </section>

        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Scenarios</h2>
          <p className="text-sm text-gray-600 mb-4">
            Click a scenario to expand its source code.
          </p>
          <TestScenarioAccordion scenarios={scenarios} />
        </section>
      </main>
    </div>
  );
}
