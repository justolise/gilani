import React from "react";
import { MarkdownP, MarkdownA, MarkdownImg, MarkdownBlockquote } from "./MarkdownMedia";
import { MarkdownOl, MarkdownUl, MarkdownLi } from "./MarkdownLists";
import { MarkdownPre, MarkdownCode } from "./MarkdownCode";

export { MarkdownP, MarkdownA, MarkdownImg, MarkdownBlockquote };
export { MarkdownOl, MarkdownUl, MarkdownLi };
export { MarkdownPre, MarkdownCode };

export function getMarkdownComponents(isStreaming: boolean) {
  return {
    h1: ({ children }: any) => (
      <h1 className="text-2xl font-bold mt-7 mb-3.5 text-foreground pb-2 leading-tight tracking-tight border-b border-border/50">
        {children}
      </h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-xl font-bold mt-7 mb-3 text-foreground leading-snug">{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-lg font-semibold mt-5 mb-2.5 text-foreground leading-snug">{children}</h3>
    ),
    h4: ({ children }: any) => (
      <h4 className="text-base font-semibold mt-4 mb-2 text-foreground">{children}</h4>
    ),
    h5: ({ children }: any) => (
      <h5 className="text-sm font-semibold mt-3.5 mb-1.5 text-foreground">{children}</h5>
    ),
    h6: ({ children }: any) => (
      <h6 className="text-xs font-semibold mt-3 mb-1.5 text-muted-foreground uppercase tracking-widest">
        {children}
      </h6>
    ),
    p: MarkdownP,
    del: ({ children }: any) => (
      <del className="line-through text-muted-foreground/60">{children}</del>
    ),
    sup: ({ children }: any) => (
      <sup className="text-xs text-muted-foreground align-super">{children}</sup>
    ),
    sub: ({ children }: any) => (
      <sub className="text-xs text-muted-foreground align-sub">{children}</sub>
    ),
    strong: ({ children }: any) => (
      <strong className="font-semibold text-foreground">{children}</strong>
    ),
    em: ({ children }: any) => <em className="italic text-muted-foreground/90">{children}</em>,
    a: MarkdownA,
    img: MarkdownImg,
    ul: MarkdownUl,
    ol: MarkdownOl,
    li: MarkdownLi,
    blockquote: MarkdownBlockquote,
    details: ({ children }: any) => (
      <details className="my-3 rounded-2xl border border-border/80 bg-card/80 dark:bg-card/40 p-4 text-base sm:text-sm shadow-xs transition-all duration-200 group open:ring-1 open:ring-primary/20">
        {children}
      </details>
    ),
    summary: ({ children }: any) => (
      <summary className="cursor-pointer font-semibold text-sm sm:text-base text-foreground select-none flex items-center gap-2 list-none hover:text-primary transition-colors focus-visible:outline-none">
        <span className="inline-block transition-transform duration-200 group-open:rotate-90 text-primary">
          ▸
        </span>
        <span>{children}</span>
      </summary>
    ),
    hr: () => <hr className="my-6 border-border/60" />,
    table: ({ children }: any) => (
      <div className="my-6 w-full max-w-full overflow-x-auto rounded-2xl border border-border shadow-sm">
        <table className="min-w-full text-base sm:text-sm border-collapse bg-card">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }: any) => (
      <thead className="bg-primary/5 text-sm sm:text-xs uppercase tracking-wider font-bold border-b-2 border-border/80">
        {children}
      </thead>
    ),
    tbody: ({ children }: any) => <tbody className="divide-y divide-border/50">{children}</tbody>,
    tr: ({ children }: any) => (
      <tr className="hover:bg-muted/30 transition-colors even:bg-muted/10">{children}</tr>
    ),
    th: ({ children }: any) => (
      <th className="px-5 py-3.5 text-left text-sm sm:text-xs font-bold text-primary tracking-wide border-r border-border/40 last:border-r-0">
        {children}
      </th>
    ),
    td: ({ children }: any) => (
      <td className="px-5 py-3.5 text-base sm:text-sm leading-relaxed border-r border-border/40 last:border-r-0">
        {children}
      </td>
    ),
    pre: (props: any) => <MarkdownPre {...props} isStreaming={isStreaming} />,
    code: MarkdownCode,
  };
}
