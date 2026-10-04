import React from "react";
import { MarkdownRenderer } from "./MarkdownRenderer";

type Props = {
  content: string;
  isStreaming: boolean;
  className?: string;
};

/**
 * StreamingMarkdown renders markdown progressively during a live AI stream.
 * Passes `isStreaming` into MarkdownRenderer so incomplete LaTeX/mhchem
 * expressions are silenced (error colour = transparent) instead of showing
 * red error boxes while the model is still typing.
 *
 * The blinking cursor is driven purely by the `streaming-cursor` CSS class
 * (defined in markdown.css via a ::after pseudo-element), avoiding the need
 * for an extra DOM node or an inline <style> tag.
 */
export const StreamingMarkdown = React.memo(function StreamingMarkdown({
  content,
  isStreaming,
  className = "",
}: Props) {
  if (!content) return null;

  return (
    <MarkdownRenderer
      content={content}
      isStreaming={isStreaming}
      className={`${className}${isStreaming ? " streaming-cursor" : ""}`}
    />
  );
});
