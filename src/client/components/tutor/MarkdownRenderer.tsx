import React, { useMemo, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import "katex/contrib/mhchem";
import "@/client/components/styles/markdown.css";

import { preprocessLatex } from "./markdown/latexPreprocessor";
import { healStreamingMarkdown } from "./markdown/streamingAutoHealer";
import { getMarkdownComponents } from "./markdown/MarkdownComponents";
import {
  BlockquotePracticeCounterCtx,
  InsidePracticeCardCtx,
  PracticeCounterCtx,
} from "./markdown/MarkdownContexts";
import { extractText } from "./markdown/CalloutCards";

// Re-export contexts and helpers for backwards compatibility
// eslint-disable-next-line react-refresh/only-export-components
export { InsidePracticeCardCtx, PracticeCounterCtx, BlockquotePracticeCounterCtx, extractText };

type Props = {
  content: string;
  skipPreprocess?: boolean;
  className?: string;
  isStreaming?: boolean;
};

function remarkDisableIndentedCode(this: any) {
  const data = this.data();
  data.micromarkExtensions = data.micromarkExtensions || [];
  data.micromarkExtensions.push({
    disable: { null: ["codeIndented"] },
  });
}

// rehype-katex options: silence errors during streaming so partial LaTeX
// doesn't flash red error boxes while the model is mid-token.
function getRehypeKatexOptions(isStreaming: boolean) {
  return [
    rehypeKatex,
    {
      throwOnError: false,
      errorColor: isStreaming ? "transparent" : "var(--color-destructive, #ef4444)",
      trust: false,
      strict: false,
      macros: {
        "\\vec": "\\overrightarrow{#1}",
        "\\unit": "\\mathrm{#1}",
        "\\degree": "^\\circ",
        "\\mol": "\\mathrm{mol}",
        "\\diff": "\\mathrm{d}",
        "\\pdiff": "\\partial",
        "\\N": "\\mathbb{N}",
        "\\Z": "\\mathbb{Z}",
        "\\Q": "\\mathbb{Q}",
        "\\R": "\\mathbb{R}",
        "\\C": "\\mathbb{C}",
      },
    },
  ] as const;
}

export const MarkdownRenderer = React.memo(function MarkdownRenderer({
  content,
  skipPreprocess,
  className = "",
  isStreaming = false,
}: Props) {
  const processed = useMemo(() => {
    const text = isStreaming ? healStreamingMarkdown(content) : content;
    return skipPreprocess ? text : preprocessLatex(text);
  }, [content, isStreaming, skipPreprocess]);

  // Components map with top-level subcomponents
  const components = useMemo(() => getMarkdownComponents(isStreaming), [isStreaming]);

  // rehype plugins — memoised per isStreaming so options stay stable between ticks
  const rehypePlugins = useMemo(() => [getRehypeKatexOptions(isStreaming)], [isStreaming]);

  // Per-render mutable counter for blockquote [!PRACTICE] numbering
  const bqPracticeCounter = useRef(0);
  bqPracticeCounter.current = 0;

  return (
    <BlockquotePracticeCounterCtx.Provider value={bqPracticeCounter}>
      <div className={`markdown-content text-foreground ${className}`}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath, remarkDisableIndentedCode]}
          rehypePlugins={rehypePlugins as any}
          components={components}
        >
          {processed}
        </ReactMarkdown>
      </div>
    </BlockquotePracticeCounterCtx.Provider>
  );
});

export default MarkdownRenderer;
