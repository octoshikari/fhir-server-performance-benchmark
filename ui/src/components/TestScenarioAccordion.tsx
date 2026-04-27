"use client";

import React, { useState } from "react";
import { ChevronRight, ExternalLink } from "lucide-react";
import { CodeBlock } from "@/components/CodeBlock";
import type { TestScenario } from "@/lib/infra-snippets";

const GITHUB_BASE =
  "https://github.com/HealthSamurai/fhir-server-performance-benchmark/blob/main";

interface Props {
  scenarios: TestScenario[];
}

export function TestScenarioAccordion({ scenarios }: Props) {
  const [open, setOpen] = useState<Set<string>>(new Set());

  const toggle = (name: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  return (
    <div className="divide-y divide-gray-200 border border-gray-200 rounded-md overflow-hidden">
      {scenarios.map((s) => {
        const isOpen = open.has(s.name);
        return (
          <div key={s.name}>
            <button
              type="button"
              onClick={() => toggle(s.name)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition cursor-pointer focus:outline-none focus:bg-gray-50"
              aria-expanded={isOpen}
            >
              <ChevronRight
                className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`}
              />
              <code className="font-mono text-sm text-gray-900 shrink-0">{s.name}</code>
              <span className="text-sm text-gray-600 flex-1">{s.description}</span>
            </button>
            {isOpen && (
              <div className="px-4 pb-4 pt-1 bg-gray-50">
                <a
                  href={`${GITHUB_BASE}/${s.file}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-mono text-blue-600 hover:text-blue-700 hover:underline mb-2"
                  title="Open on GitHub (new tab)"
                >
                  {s.file}
                  <ExternalLink className="w-4 h-4" />
                </a>
                {s.content ? (
                  <CodeBlock code={s.content} language="javascript" />
                ) : (
                  <div className="text-xs text-gray-500 italic">Source not available</div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
