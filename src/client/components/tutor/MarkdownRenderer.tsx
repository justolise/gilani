import React, { useMemo, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import "katex/dist/katex.min.css";
import "katex/contrib/mhchem";

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

  // Per-render mutable counter for blockquote [!PRACTICE] numbering
  const bqPracticeCounter = useRef(0);
  bqPracticeCounter.current = 0;

  return (
    <BlockquotePracticeCounterCtx.Provider value={bqPracticeCounter}>
      <div className={`markdown-content text-foreground ${className}`}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath, remarkDisableIndentedCode]}
          rehypePlugins={[]}
          components={components}
        >
          {processed}
        </ReactMarkdown>
      </div>
    </BlockquotePracticeCounterCtx.Provider>
  );
});

export default MarkdownRenderer;
