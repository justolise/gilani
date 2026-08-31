import { useState } from "react";
import katex from "katex";
import "katex/dist/contrib/mhchem.min.js";
import { Check, Copy } from "lucide-react";
import type { DocumentBlock } from "@/client/components/renderer/types/document";

interface Props {
  block: DocumentBlock;
}

export default function MathBlock({ block }: Props) {
  const [copied, setCopied] = useState(false);
  let latex = (block.data as any)?.latex || block.content || "";

  const macros = {
    "\\vec": "\\overrightarrow{#1}",
    "\\unit": "\\mathrm{#1}",
    "\\degree": "^\\circ",
    "\\mol": "\\mathrm{mol}",
    "\\kJ": "\\mathrm{kJ}",
    "\\atm": "\\mathrm{atm}",
    "\\N": "\\mathbb{N}",
    "\\Z": "\\mathbb{Z}",
    "\\Q": "\\mathbb{Q}",
    "\\R": "\\mathbb{R}",
    "\\C": "\\mathbb{C}",
    "\\diff": "\\mathrm{d}",
    "\\pdiff": "\\partial",
  };

  // Auto-wrap multi-line equations in aligned environment if not already wrapped
  if (latex.includes("\n") && !latex.match(/\\begin\{.*?\}/)) {
    latex = `\\begin{aligned}\n${latex
      .split("\n")
      .filter((l: string) => l.trim())
      .join(" \\\\\n")}\n\\end{aligned}`;
  }

  const html = katex.renderToString(latex, {
    throwOnError: false,
    displayMode: true,
    macros,
    strict: "ignore",
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(latex).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <section className="relative group my-5 w-full max-w-full overflow-x-auto overflow-y-hidden py-3 px-4 rounded-2xl bg-muted/20 dark:bg-muted/10 border border-border/40 text-lg flex items-center justify-center">
      <div dangerouslySetInnerHTML={{ __html: html }} className="overflow-x-auto py-1" />
      <button
        type="button"
        onClick={handleCopy}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity p-1.5 rounded-lg bg-background/90 hover:bg-background border border-border/60 text-muted-foreground hover:text-foreground text-xs shadow-xs"
        title="Copy LaTeX formula"
        aria-label="Copy formula"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-green-500" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>
    </section>
  );
}
