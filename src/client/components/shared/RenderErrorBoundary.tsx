import React from "react";
import { AlertCircle } from "lucide-react";

interface Props {
  /** Label shown in the error fallback (e.g. "Mermaid diagram", "Math block") */
  label?: string;
  /** Raw source code to display when rendering fails */
  source?: string;
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * RenderErrorBoundary
 *
 * Wraps heavy or AI-driven renderers (KaTeX, Mermaid, JSXGraph, SmilesDrawer)
 * so that a bad AI-generated expression never crashes the whole chat UI.
 *
 * On error it shows:
 *  • A labelled warning badge
 *  • The raw source code (so the user can still read what was generated)
 *  • A brief error description (dev) / generic message (prod)
 */
export class RenderErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    const label = this.props.label ?? "renderer";
    console.error(`[RenderErrorBoundary] ${label} crashed:`, error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const { label = "Renderer", source } = this.props;
    const isDev = import.meta.env.DEV;
    const message = isDev
      ? (this.state.error?.message ?? "Unknown error")
      : "Could not render this block. Showing raw source instead.";

    return (
      <div className="my-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-300">
        <div className="flex items-center gap-2 font-semibold mb-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{label} failed to render</span>
        </div>
        <p className="text-xs text-amber-700 dark:text-amber-400 mb-3">{message}</p>
        {source && (
          <pre className="overflow-x-auto rounded-lg bg-muted/30 p-3 text-xs font-mono text-foreground whitespace-pre-wrap border border-border/40">
            {source}
          </pre>
        )}
      </div>
    );
  }
}
