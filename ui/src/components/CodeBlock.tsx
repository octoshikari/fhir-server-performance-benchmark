"use client";

import React from "react";
import { Highlight, themes, type Language } from "prism-react-renderer";

const LANG_MAP: Record<string, Language> = {
  yaml: "yaml",
  json: "json",
  bash: "bash",
  docker: "docker",
  conf: "bash",
  js: "javascript",
  javascript: "javascript",
};

export function CodeBlock({ code, language }: { code: string; language: string }) {
  const lang = (LANG_MAP[language] ?? "markup") as Language;
  return (
    <Highlight code={code} language={lang} theme={themes.vsDark}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className={`${className} rounded p-3 overflow-x-auto text-xs leading-relaxed`}
          style={{ ...style, margin: 0 }}
        >
          {tokens.map((line, i) => {
            const { key: _lk, ...lineProps } = getLineProps({ line });
            return (
              <div key={i} {...lineProps}>
                {line.map((token, k) => {
                  const { key: _tk, ...tokenProps } = getTokenProps({ token });
                  return <span key={k} {...tokenProps} />;
                })}
              </div>
            );
          })}
        </pre>
      )}
    </Highlight>
  );
}
