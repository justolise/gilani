import React, { useState, useMemo, useContext } from "react";
import { ExternalLink, Check, Copy } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import katex from "katex";

import { RenderErrorBoundary } from "@/client/components/shared/RenderErrorBoundary";
import { FlashCard } from "@/client/components/cards/FlashCard";
import PracticeQuestionCard, { extractMcq } from "@/client/components/cards/PracticeQuestionCard";
import DefinitionCard from "@/client/components/cards/DefinitionCard";
import ExampleCard from "@/client/components/cards/ExampleCard";
import WarningCard from "@/client/components/cards/WarningCard";
import StudyTipCard from "@/client/components/cards/StudyTipCard";
import SummaryCard from "@/client/components/cards/SummaryCard";

import { FreeBodyDiagram, CircuitDiagram, KinematicsEquation } from "@/client/components/physics";
import { ChemicalReaction, MolecularStructure, PeriodicTable } from "@/client/components/chemistry";
import {
  MathBlock,
  InlineMath,
  FormulaCard,
  MatrixRenderer,
  UnitRenderer,
  GeometryRenderer,
} from "@/client/components/maths";
import { FunctionGraphBlock } from "../FunctionGraph";

import { sanitizeMermaidLabels } from "./latexPreprocessor";
import { MermaidDiagram, SmilesDrawer, DiagramSVG } from "./DiagramRenderers";
import { extractCallout, CustomCallout, splitPracticeChildren } from "./CalloutCards";
import { PracticeCounterCtx, InsidePracticeCardCtx } from "./MarkdownContexts";

const MERMAID_PATTERN =
  /^\s*(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|gitGraph|journey|quadrantChart|timeline|xychart|block-beta|mindmap)\b/;

const PRACTICE_MARKS_RE = /\(\d+\s+marks?\)/i;
const PRACTICE_VERBS_RE =
  /^(state|find|calculate|identify|given|show|prove|determine|explain|describe|evaluate|solve|simplify|compute|derive|sketch|draw|write|list|define|compare|differentiate|hence|which|what|how|where|when|why|choose|select)/i;

function hastText(node: any): string {
  if (!node) return "";
  if (node.type === "text") return node.value ?? "";
  return (node.children ?? []).map(hastText).join("");
}

function looksLikePractice(text: string) {
  return (
    PRACTICE_MARKS_RE.test(text) || PRACTICE_VERBS_RE.test(text.trim()) || extractMcq(text).isMcq
  );
}

// ── Top-Level Markdown Subcomponents ──────────────────────────────────────────

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

export function MarkdownOl({ children, node }: any) {
  const practiceNumbers = useMemo(() => {
    const map = new Map<number, number>();
    let q = 0;
    for (const child of node?.children ?? []) {
      if (child.tagName !== "li") continue;
      if (looksLikePractice(hastText(child))) {
        const key = child.position?.start?.offset ?? -Math.random();
        map.set(key, ++q);
      }
    }
    return map;
  }, [node]);

  return (
    <PracticeCounterCtx.Provider value={practiceNumbers}>
      <ol className="list-decimal pl-6 my-4 space-y-1.5 block w-full marker:text-muted-foreground marker:font-medium [&_ol]:list-[lower-alpha] [&_ol_ol]:list-[lower-roman]">
        {children}
      </ol>
    </PracticeCounterCtx.Provider>
  );
}

export function MarkdownLi({ children, checked, node }: any) {
  const practiceNumbers = useContext(PracticeCounterCtx);
  const insidePractice = useContext(InsidePracticeCardCtx);

  // Task-list checkbox support
  if (checked !== null && checked !== undefined) {
    return (
      <li className="flex items-start gap-3 text-[15px] sm:text-base leading-relaxed sm:leading-7 list-none -ml-2">
        <input
          type="checkbox"
          checked={checked}
          readOnly
          className="mt-1.5 h-4 w-4 rounded border-border accent-primary flex-shrink-0 cursor-default"
        />
        <span>{children}</span>
      </li>
    );
  }

  const text = React.Children.toArray(children)
    .map((c) => (typeof c === "string" ? c : ((c as any)?.props?.children ?? "")))
    .join("");

  // Quick Review Card detection
  const flashMatch = text.match(/^Front:\s*(.+?)\s+Back:\s*(.+)$/s);
  if (flashMatch) {
    return (
      <li className="list-none -mx-1">
        <FlashCard front={flashMatch[1].trim()} back={flashMatch[2].trim()} />
      </li>
    );
  }

  // Practice Question Card
  if (!insidePractice && practiceNumbers && looksLikePractice(text)) {
    const offset = node?.position?.start?.offset ?? -1;
    const num = practiceNumbers.get(offset);
    const { questionNodes, answerNodes } = splitPracticeChildren(children);

    const isMultipleChoice = questionNodes.some(
      (n: any) => n?.props?.node?.tagName === "ol" || n?.props?.node?.tagName === "ul",
    );

    return (
      <InsidePracticeCardCtx.Provider value={{ isMultipleChoice, isQuestion: true }}>
        <li className="list-none -ml-6 my-2">
          <PracticeQuestionCard
            number={num}
            question={<>{questionNodes}</>}
            answer={answerNodes.length > 0 ? <>{answerNodes}</> : undefined}
            isMultipleChoice={isMultipleChoice}
          />
        </li>
      </InsidePracticeCardCtx.Provider>
    );
  }

  return (
    <li
      className="text-[15px] sm:text-base leading-relaxed sm:leading-7"
      style={{ display: "list-item" }}
    >
      {children}
    </li>
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

export function MarkdownPre({ children, isStreaming }: any) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [wrapCode, setWrapCode] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(false);

  const child = React.Children.only(children) as any;
  const rawLang = (child?.props?.className || "").replace("language-", "").toLowerCase().trim();
  const langs = rawLang.split(/\s+/).filter(Boolean);
  const code =
    typeof child?.props?.children === "string" ? child.props.children.replace(/\n$/, "") : "";

  const isMermaidLabel = langs.includes("mermaid");
  const isMermaidContent = MERMAID_PATTERN.test(code);
  const isMermaid = isMermaidLabel || isMermaidContent;
  const isSmiles = langs.some((l: string) => ["smiles", "smi"].includes(l));
  const isGraph =
    langs.some((l: string) => ["function-plot", "plot"].includes(l)) ||
    (langs.includes("graph") && !isMermaidContent);
  const isSvg = langs.some((l: string) => ["svg", "diagram"].includes(l));
  const isMath = langs.some((l: string) => ["math", "latex", "tex"].includes(l));
  const isChem = langs.some((l: string) => ["chemistry", "chem"].includes(l));

  const createBlock = (type: string): any => ({
    id: "block-" + Math.random(),
    type,
    content: code,
    children: [],
  });

  if (isMermaid) {
    const clean = sanitizeMermaidLabels(
      code
        .replace(/\$\\longrightarrow\$/g, "-->")
        .replace(/\$\\rightarrow\$/g, "-->")
        .replace(/\$\\to\$/g, "-->")
        .replace(/\$\\leftarrow\$/g, "<--")
        .replace(/\$\\leftrightarrow\$/g, "<-->"),
    );
    return <MermaidDiagram code={clean} isStreaming={isStreaming} />;
  }

  let parsedBlock;
  switch (rawLang) {
    case "physics:fbd":
    case "fbd":
      parsedBlock = <FreeBodyDiagram block={createBlock("fbd")} />;
      break;
    case "physics:circuit":
    case "circuit":
      parsedBlock = <CircuitDiagram block={createBlock("circuit")} />;
      break;
    case "physics:kinematics":
    case "kinematics":
      parsedBlock = <KinematicsEquation block={createBlock("kinematics")} />;
      break;
    case "chemistry:reaction":
    case "reaction":
      parsedBlock = <ChemicalReaction block={createBlock("reaction")} />;
      break;
    case "chemistry:molecule":
    case "molecule":
      parsedBlock = <MolecularStructure block={createBlock("molecule")} />;
      break;
    case "chemistry:periodic":
    case "periodic":
      parsedBlock = <PeriodicTable block={createBlock("periodic")} />;
      break;
    case "maths:formula":
    case "formula":
      parsedBlock = <FormulaCard block={createBlock("formula")} />;
      break;
    case "maths:graph":
    case "graph":
      parsedBlock = <FunctionGraphBlock spec={code} />;
      break;
    case "maths:geometry":
    case "geometry":
      parsedBlock = <GeometryRenderer block={createBlock("geometry")} />;
      break;
    case "maths:matrix":
    case "matrix":
      parsedBlock = <MatrixRenderer block={createBlock("matrix")} />;
      break;
    case "maths:unit":
    case "unit":
      parsedBlock = <UnitRenderer block={createBlock("unit")} />;
      break;
    case "definition":
      parsedBlock = <DefinitionCard>{code}</DefinitionCard>;
      break;
    case "example":
    case "worked-example":
      parsedBlock = <ExampleCard>{code}</ExampleCard>;
      break;
    case "warning":
    case "common-mistake":
      parsedBlock = <WarningCard>{code}</WarningCard>;
      break;
    case "tip":
    case "study-tip":
      parsedBlock = <StudyTipCard>{code}</StudyTipCard>;
      break;
    case "summary":
      parsedBlock = <SummaryCard>{code}</SummaryCard>;
      break;
    case "practice":
    case "question": {
      const separator = /\n---\n|\n(?:Answer|A):\s*/i;
      const parts = code.split(separator);
      const qText = parts[0]?.trim() ?? code;
      const aText = parts[1]?.trim() ?? "";
      if (!aText) {
        parsedBlock = <StudyTipCard>{qText}</StudyTipCard>;
      } else {
        parsedBlock = (
          <PracticeQuestionCard
            question={<span style={{ whiteSpace: "pre-wrap" }}>{qText}</span>}
            answer={<span style={{ whiteSpace: "pre-wrap" }}>{aText}</span>}
          />
        );
      }
      break;
    }
  }

  if (parsedBlock) {
    return (
      <RenderErrorBoundary label={`${rawLang} block`} source={code}>
        {parsedBlock}
      </RenderErrorBoundary>
    );
  }

  if (isMath) {
    return (
      <RenderErrorBoundary label="Math block" source={code}>
        <MathBlock block={createBlock("math")} />
      </RenderErrorBoundary>
    );
  }

  if (isChem) {
    return (
      <RenderErrorBoundary label="Chemical reaction" source={code}>
        <ChemicalReaction block={createBlock("reaction")} />
      </RenderErrorBoundary>
    );
  }

  if (isSmiles) return <SmilesDrawer smiles={code} />;
  if (isGraph) return <FunctionGraphBlock spec={code} />;
  if (isSvg) return <DiagramSVG svg={code} />;

  const lineCount = code ? code.split("\n").length : 0;
  const isCollapsible = lineCount > 18;

  const handleCopy = () =>
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });

  return (
    <div className="relative my-4 rounded-2xl overflow-hidden bg-zinc-950 border border-border/50 shadow-sm group">
      {/* Header Controls */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/90 border-b border-white/10 select-none">
        <div className="flex items-center gap-2">
          <span className="font-sans text-xs text-zinc-400 font-medium">{rawLang || "code"}</span>
          {lineCount > 1 && (
            <span className="text-xs font-mono text-zinc-500">({lineCount} lines)</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {lineCount > 3 && (
            <button
              type="button"
              onClick={() => setShowLineNumbers((v) => !v)}
              className={`text-xs px-2 py-0.5 rounded font-mono transition-colors ${
                showLineNumbers
                  ? "bg-zinc-800 text-zinc-200"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
              }`}
              title="Toggle line numbers"
            >
              #
            </button>
          )}
          <button
            type="button"
            onClick={() => setWrapCode((v) => !v)}
            className={`text-xs px-2 py-0.5 rounded font-mono transition-colors ${
              wrapCode
                ? "bg-zinc-800 text-zinc-200"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
            }`}
            title="Toggle word wrap"
          >
            Wrap
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 font-mono text-xs text-zinc-400 hover:text-zinc-100 transition-colors px-2 py-0.5 rounded hover:bg-zinc-800"
            aria-label="Copy code"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-green-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Container with Collapsible Max-Height */}
      <div
        className={`text-sm font-mono leading-relaxed transition-all duration-300 relative ${
          isCollapsible && !isExpanded ? "max-h-[340px] overflow-hidden" : ""
        } ${wrapCode ? "[&_pre]:!whitespace-pre-wrap" : ""}`}
      >
        <SyntaxHighlighter
          language={rawLang || "text"}
          style={vscDarkPlus}
          showLineNumbers={showLineNumbers}
          customStyle={{
            margin: 0,
            padding: "1rem",
            background: "transparent",
          }}
          PreTag="div"
        >
          {code}
        </SyntaxHighlighter>

        {isCollapsible && !isExpanded && (
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none flex items-end justify-center pb-2.5">
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="pointer-events-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 shadow-md border border-white/10 transition-all active:scale-95"
            >
              Expand snippet ({lineCount} lines)
            </button>
          </div>
        )}
      </div>

      {isCollapsible && isExpanded && (
        <div className="flex justify-center p-2 border-t border-white/10 bg-zinc-900/50">
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Collapse snippet ↑
          </button>
        </div>
      )}
    </div>
  );
}

export function MarkdownCode({ children, className }: any) {
  const classStr = className || "";
  if (classStr.includes("math-inline") || classStr.includes("language-math")) {
    return (
      <InlineMath
        block={{
          id: "math-" + Math.random(),
          type: "inlineMath",
          content: String(children),
          children: [],
        }}
      />
    );
  }

  const rawLang = classStr.replace("language-", "").toLowerCase().trim();
  if (!rawLang) {
    const text = String(children);
    if (text.startsWith("chem:")) {
      const formula = text.slice(5);
      try {
        const html = katex.renderToString(`\\ce{${formula}}`, { throwOnError: false });
        return <span dangerouslySetInnerHTML={{ __html: html }} />;
      } catch {
        return <span>{`\\ce{${formula}}`}</span>;
      }
    }
    return (
      <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs text-primary font-medium">
        {children}
      </code>
    );
  }
  return <code className={className}>{children}</code>;
}

export function getMarkdownComponents(isStreaming: boolean) {
  return {
    h1: ({ children }: any) => (
      <h1 className="text-2xl font-bold mt-8 mb-4 text-foreground pb-2 leading-tight tracking-tight border-b border-border/50">
        {children}
      </h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-xl font-bold mt-8 mb-4 text-foreground leading-snug">{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-lg font-semibold mt-6 mb-3 text-foreground leading-snug">{children}</h3>
    ),
    h4: ({ children }: any) => (
      <h4 className="text-base font-semibold mt-5 mb-2 text-foreground">{children}</h4>
    ),
    h5: ({ children }: any) => (
      <h5 className="text-sm font-semibold mt-4 mb-2 text-foreground">{children}</h5>
    ),
    h6: ({ children }: any) => (
      <h6 className="text-xs font-semibold mt-4 mb-2 text-muted-foreground uppercase tracking-wide">
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
    ul: ({ children }: any) => (
      <ul className="list-disc pl-6 my-4 space-y-1.5 block w-full marker:text-muted-foreground/70">
        {children}
      </ul>
    ),
    ol: MarkdownOl,
    li: MarkdownLi,
    blockquote: MarkdownBlockquote,
    details: ({ children }: any) => (
      <details className="my-3 rounded-2xl border border-border/80 bg-card/80 dark:bg-card/40 p-3.5 text-sm shadow-xs transition-all duration-200 group open:ring-1 open:ring-primary/20">
        {children}
      </details>
    ),
    summary: ({ children }: any) => (
      <summary className="cursor-pointer font-semibold text-xs sm:text-sm text-foreground select-none flex items-center gap-2 list-none hover:text-primary transition-colors focus-visible:outline-none">
        <span className="inline-block transition-transform duration-200 group-open:rotate-90 text-primary">
          ▸
        </span>
        <span>{children}</span>
      </summary>
    ),
    hr: () => <hr className="my-6 border-border/60" />,
    table: ({ children }: any) => (
      <div className="my-6 w-full max-w-full overflow-x-auto rounded-2xl border border-border shadow-sm">
        <table className="min-w-full text-sm sm:text-[15px] border-collapse bg-card">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }: any) => (
      <thead className="bg-primary/5 text-xs uppercase tracking-wider font-bold border-b-2 border-border/80">
        {children}
      </thead>
    ),
    tbody: ({ children }: any) => <tbody className="divide-y divide-border/50">{children}</tbody>,
    tr: ({ children }: any) => (
      <tr className="hover:bg-muted/30 transition-colors even:bg-muted/10">{children}</tr>
    ),
    th: ({ children }: any) => (
      <th className="px-5 py-3.5 text-left text-xs font-bold text-primary tracking-wide border-r border-border/40 last:border-r-0">
        {children}
      </th>
    ),
    td: ({ children }: any) => (
      <td className="px-5 py-3.5 text-sm sm:text-[15px] leading-relaxed border-r border-border/40 last:border-r-0">
        {children}
      </td>
    ),
    pre: (props: any) => <MarkdownPre {...props} isStreaming={isStreaming} />,
    code: MarkdownCode,
  };
}
