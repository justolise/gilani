import React, { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import katex from "katex";

import { RenderErrorBoundary } from "@/client/components/shared/RenderErrorBoundary";
import PracticeQuestionCard from "@/client/components/cards/PracticeQuestionCard";
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

export const MERMAID_PATTERN =
  /^\s*(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|gitGraph|journey|quadrantChart|timeline|xychart|block-beta|mindmap)\b/;

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
