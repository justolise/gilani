import React, { useState, useEffect, useRef } from "react";
import DOMPurify from "dompurify";
import {
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Copy,
  Check,
  Download,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { RenderErrorBoundary } from "@/client/components/shared/RenderErrorBoundary";

let _mermaidInitialized = false;
let _lastTheme: "dark" | "default" | null = null;

function initMermaid(isDark: boolean) {
  if (import.meta.env.SSR) return;
  const theme = isDark ? "dark" : "default";
  if (_mermaidInitialized && _lastTheme === theme) return;

  _mermaidInitialized = true;
  _lastTheme = theme;
  import("mermaid").then((m) => {
    m.default.initialize({
      startOnLoad: false,
      suppressErrorRendering: true,
      theme,
      fontFamily: "var(--font-sans, inherit)",
      themeVariables: isDark
        ? {
            darkMode: true,
            background: "#18181b",
            primaryColor: "#3b82f6",
            primaryTextColor: "#f4f4f5",
            primaryBorderColor: "#3f3f46",
            lineColor: "#a1a1aa",
            secondaryColor: "#27272a",
            tertiaryColor: "#18181b",
          }
        : {
            darkMode: false,
            background: "#ffffff",
            primaryColor: "#2563eb",
            primaryTextColor: "#18181b",
            primaryBorderColor: "#e4e4e7",
            lineColor: "#71717a",
            secondaryColor: "#f4f4f5",
            tertiaryColor: "#ffffff",
          },
    });
  });
}

/**
 * Reusable Fullscreen Lightbox Modal for any Diagram
 */
function DiagramLightbox({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-5xl h-[85vh] rounded-2xl bg-card border border-border shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/60 bg-muted/40">
          <span className="font-semibold text-sm text-foreground">{title}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
              className="p-1.5 rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground text-xs"
              title="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="font-mono text-xs text-muted-foreground w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
              className="p-1.5 rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground text-xs"
              title="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoom(1)}
              className="p-1.5 rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground text-xs"
              title="Reset zoom"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <div className="h-4 w-[1px] bg-border mx-1" />
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
              title="Close modal (Esc)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Pan / Zoom Canvas */}
        <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-background/50">
          <div
            style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
            className="transition-transform duration-150 flex items-center justify-center max-w-full max-h-full [&>svg]:max-w-full [&>svg]:h-auto"
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MermaidDiagram({ code, isStreaming }: { code: string; isStreaming?: boolean }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (import.meta.env.SSR || !ref.current) return;
    const id = `mermaid-${Math.random().toString(36).slice(2)}`;
    const isDark = document.documentElement.classList.contains("dark");
    initMermaid(isDark);

    // Auto-repair common AI mistakes in Mermaid code
    let processedCode = code;
    if (!processedCode.includes("\n")) {
      processedCode = processedCode
        .replace(/\s+(subgraph\b)/g, "\n$1")
        .replace(/\s+(end\b)/g, "\n$1")
        .replace(/(end\b)\s+/g, "$1\n")
        .replace(/\]\s+([A-Za-z0-9_-]+\[)/g, "]\n$1")
        .replace(/\]\s+([A-Za-z0-9_-]+\s*-[->.])/g, "]\n$1")
        .replace(/([A-Za-z0-9_-]+)\s+([A-Za-z0-9_-]+\s*-[->.])/g, "$1\n$2")
        .replace(/(subgraph[^\n]+?)\s+([A-Za-z0-9_-]+\[)/g, "$1\n$2");
    }
    processedCode = processedCode.replace(/subgraph\s+([^"\[\n]+)(?=\n|$)/g, (match, title) => {
      const t = title.trim();
      return t.includes(" ") ? `subgraph "${t}"` : match;
    });

    setErrorCode(null);
    setIsLoading(true);

    import("mermaid")
      .then((m) => m.default.render(id, processedCode))
      .then(({ svg }) => {
        setSvgContent(svg);
        if (ref.current) {
          ref.current.innerHTML = svg;
        }
        setIsLoading(false);
      })
      .catch((err) => {
        if (!isStreaming) console.error("Mermaid render failed:", err);
        setErrorCode(processedCode);
        setIsLoading(false);
      });
  }, [code, isStreaming]);

  const handleCopy = () => {
    if (svgContent) {
      navigator.clipboard.writeText(svgContent).then(() => {
        setCopied(true);
        toast.success("Diagram SVG copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  if (errorCode) {
    return (
      <div className="my-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 overflow-x-auto text-xs text-destructive whitespace-pre-wrap font-mono">
        {errorCode}
      </div>
    );
  }

  return (
    <RenderErrorBoundary label="Mermaid diagram" source={code}>
      <div className="relative my-4 rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs group">
        {/* Diagram Top Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-muted/30">
          <span className="font-sans text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Diagram
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted transition-colors"
              title="Copy Diagram SVG"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy SVG</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(true)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted transition-colors"
              title="View fullscreen"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              <span>Fullscreen</span>
            </button>
          </div>
        </div>

        {/* Canvas Display */}
        <div className="p-4 overflow-x-auto flex justify-center bg-card">
          {isLoading && (
            <div className="flex items-center gap-2 py-8 text-xs text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>Rendering diagram...</span>
            </div>
          )}
          <div
            ref={ref}
            className={`max-w-full flex justify-center [&>svg]:max-w-full [&>svg]:h-auto ${
              isLoading ? "hidden" : "block"
            }`}
          />
        </div>

        {/* Lightbox Modal */}
        <DiagramLightbox
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          title="Mermaid Diagram (High Resolution)"
        >
          {svgContent ? <div dangerouslySetInnerHTML={{ __html: svgContent }} /> : null}
        </DiagramLightbox>
      </div>
    </RenderErrorBoundary>
  );
}

export function SmilesDrawer({ smiles }: { smiles: string }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    import("smiles-drawer").then((SD) => {
      const drawer = new SD.Drawer({ width: 420, height: 320 });
      SD.parse(
        smiles,
        (tree: any) => {
          drawer.draw(tree, canvasRef.current, "light");
        },
        (err: any) => {
          console.error("SMILES parse error:", err);
        },
      );
    });
  }, [smiles]);

  return (
    <RenderErrorBoundary label="SMILES structure" source={smiles}>
      <figure className="relative my-4 rounded-2xl border border-border/80 bg-card p-4 shadow-xs flex flex-col items-center group">
        <div className="w-full flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Molecular Structure
          </span>
          <button
            type="button"
            onClick={() => setIsLightboxOpen(true)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted transition-colors"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            <span>Fullscreen</span>
          </button>
        </div>

        <canvas
          ref={canvasRef}
          className="rounded-xl border border-border/60 max-w-full bg-white"
        />
        <figcaption className="text-xs font-mono text-muted-foreground mt-2 italic bg-muted/30 px-3 py-1 rounded-full border border-border/40">
          {smiles}
        </figcaption>

        <DiagramLightbox
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          title={`Molecular Structure: ${smiles}`}
        >
          <canvas ref={canvasRef} className="rounded-xl bg-white p-4 shadow-sm" />
        </DiagramLightbox>
      </figure>
    </RenderErrorBoundary>
  );
}

export function DiagramSVG({ svg }: { svg: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const cleanSvg = DOMPurify.sanitize(svg, { ADD_TAGS: ["style"] });

  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = cleanSvg;
  }, [cleanSvg]);

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanSvg).then(() => {
      setCopied(true);
      toast.success("SVG copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <RenderErrorBoundary label="SVG diagram" source={svg}>
      <div className="relative my-4 rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs group">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-muted/30">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Vector Diagram
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(true)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted transition-colors"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              <span>Fullscreen</span>
            </button>
          </div>
        </div>

        {/* Display */}
        <div className="p-4 overflow-x-auto flex justify-center bg-white dark:bg-zinc-900">
          <div ref={ref} className="max-w-full [&>svg]:max-w-full [&>svg]:h-auto" />
        </div>

        {/* Lightbox */}
        <DiagramLightbox
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          title="Vector Diagram (High Resolution)"
        >
          <div dangerouslySetInnerHTML={{ __html: cleanSvg }} />
        </DiagramLightbox>
      </div>
    </RenderErrorBoundary>
  );
}
