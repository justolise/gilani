import React from "react";
import { ExternalLink } from "lucide-react";
import { extractCallout, CustomCallout } from "./CalloutCards";

export function MarkdownP({ children }: any) {
  const { type, newChildren } = extractCallout(children);
  if (type) return <CustomCallout type={type}>{newChildren}</CustomCallout>;
  return (
    <p className="text-[15px] sm:text-base leading-relaxed sm:leading-7 mb-4 last:mb-0 text-foreground/90">
      {children}
    </p>
  );
}

export function MarkdownA({ href, children }: any) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-sky-500 hover:text-sky-400 dark:text-sky-400 dark:hover:text-sky-300 underline decoration-sky-500/50 hover:decoration-sky-400 underline-offset-2 decoration-2 transition-colors font-medium cursor-pointer break-words"
      title={href}
    >
      {children}
      <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 opacity-80" />
    </a>
  );
}

export function MarkdownImg({ src, alt }: any) {
  return (
    <figure className="my-3">
      <img
        src={src}
        alt={alt || ""}
        className="rounded-xl border border-border max-w-full shadow-sm"
        loading="lazy"
        onError={(e) => {
          const t = e.currentTarget;
          t.style.display = "none";
          const p = t.parentElement;
          if (p) {
            const fb = document.createElement("p");
            fb.className = "text-xs text-muted-foreground italic";
            fb.textContent = `[Image unavailable: ${alt || src}]`;
            p.appendChild(fb);
          }
        }}
      />
      {alt && (
        <figcaption className="text-xs font-mono text-muted-foreground mt-1 text-center italic">
          {alt}
        </figcaption>
      )}
    </figure>
  );
}

export function MarkdownBlockquote({ children }: any) {
  const { type, newChildren } = extractCallout(children);
  if (type) return <CustomCallout type={type}>{newChildren}</CustomCallout>;
  return (
    <blockquote className="border-l-4 border-primary/50 pl-3.5 my-3 bg-primary/5 rounded-r-xl py-2 text-sm text-muted-foreground italic">
      {children}
    </blockquote>
  );
}
