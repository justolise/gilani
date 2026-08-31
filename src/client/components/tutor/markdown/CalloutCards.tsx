import React from "react";
import { Info, Lightbulb, ListOrdered } from "lucide-react";
import { RenderErrorBoundary } from "@/client/components/shared/RenderErrorBoundary";
import DefinitionCard from "@/client/components/cards/DefinitionCard";
import ExampleCard from "@/client/components/cards/ExampleCard";
import WarningCard from "@/client/components/cards/WarningCard";
import StudyTipCard from "@/client/components/cards/StudyTipCard";
import SummaryCard from "@/client/components/cards/SummaryCard";
import PracticeQuestionCard from "@/client/components/cards/PracticeQuestionCard";
import { BlockquotePracticeCounterCtx } from "./MarkdownContexts";

/**
 * Helper to recursively extract raw text from a React node.
 */
export function extractText(node: any): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (!node || !node.props) return "";
  if (node.props.children) {
    if (Array.isArray(node.props.children)) {
      return node.props.children.map(extractText).join("");
    }
    return extractText(node.props.children);
  }
  return "";
}

/**
 * Split React children into question vs answer nodes.
 * Splits at the first node whose text contains "Answer:" anywhere.
 */
export function splitPracticeChildren(children: React.ReactNode): {
  questionNodes: React.ReactNode[];
  answerNodes: React.ReactNode[];
} {
  const arr = React.Children.toArray(children);
  let splitIdx = -1;
  for (let i = 0; i < arr.length; i++) {
    const text = extractText(arr[i]);
    if (/answer\s*:/i.test(text)) {
      splitIdx = i;
      break;
    }
  }
  if (splitIdx === -1) {
    return { questionNodes: arr, answerNodes: [] };
  }
  if (splitIdx === 0) {
    return { questionNodes: [], answerNodes: arr };
  }
  return {
    questionNodes: arr.slice(0, splitIdx),
    answerNodes: arr.slice(splitIdx),
  };
}

export function extractCallout(children: React.ReactNode): {
  type: string | null;
  newChildren: React.ReactNode;
} {
  let type: string | null = null;
  let matched = false;

  const newChildren = React.Children.map(children, (child) => {
    if (matched) return child;

    if (typeof child === "string") {
      const match = child.match(
        /^\[!(NOTE|TIP|WARNING|CAUTION|IMPORTANT|DEFINITION|EXAMPLE|SUMMARY|PRACTICE|STEP|HINT)\]\s*/i,
      );
      if (match) {
        type = match[1].toUpperCase();
        matched = true;
        return child.replace(match[0], "");
      }
      return child;
    }

    if (React.isValidElement(child) && (child.props as any).children) {
      const grandChildren = React.Children.toArray((child.props as any).children);
      if (grandChildren.length > 0 && typeof grandChildren[0] === "string") {
        const match = grandChildren[0].match(
          /^\[!(NOTE|TIP|WARNING|CAUTION|IMPORTANT|DEFINITION|EXAMPLE|SUMMARY|PRACTICE|STEP|HINT)\]\s*/i,
        );
        if (match) {
          type = match[1].toUpperCase();
          matched = true;
          const newFirst = grandChildren[0].replace(match[0], "");
          return React.cloneElement(
            child as React.ReactElement,
            {},
            newFirst,
            ...grandChildren.slice(1),
          );
        }
      }
    }

    return child;
  });

  return { type, newChildren };
}

export function CustomCallout({ type, children }: { type: string; children: React.ReactNode }) {
  // Always call hook unconditionally at the top level (Rules of Hooks)
  const bqCounter = React.useContext(BlockquotePracticeCounterCtx);

  let content;
  switch (type) {
    case "DEFINITION":
      content = <DefinitionCard>{children}</DefinitionCard>;
      break;
    case "EXAMPLE":
      content = <ExampleCard>{children}</ExampleCard>;
      break;
    case "WARNING":
    case "CAUTION":
      content = <WarningCard>{children}</WarningCard>;
      break;
    case "TIP":
    case "NOTE":
      content = <StudyTipCard>{children}</StudyTipCard>;
      break;
    case "IMPORTANT":
    case "SUMMARY":
      content = <SummaryCard>{children}</SummaryCard>;
      break;
    case "HINT":
      content = (
        <div className="my-3 rounded-2xl border border-amber-300/40 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800/40 overflow-hidden shadow-xs">
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-100/60 dark:bg-amber-900/30 border-b border-amber-200/40 font-semibold text-xs text-amber-700 dark:text-amber-300">
            <Lightbulb className="h-4 w-4" />
            Hint / Guiding Tip
          </div>
          <div className="p-3.5 text-sm sm:text-[15px] leading-relaxed text-foreground">
            {children}
          </div>
        </div>
      );
      break;
    case "STEP":
      content = (
        <div className="my-3 rounded-2xl border border-primary/20 bg-primary/5 dark:bg-primary/10 overflow-hidden shadow-xs">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 border-b border-primary/15 font-semibold text-xs text-primary uppercase tracking-wide">
            <ListOrdered className="h-4 w-4" />
            Step Solution
          </div>
          <div className="p-4 text-[15px] sm:text-base leading-relaxed text-foreground">
            {children}
          </div>
        </div>
      );
      break;
    case "PRACTICE": {
      const { questionNodes, answerNodes } = splitPracticeChildren(children);
      const questionContent =
        questionNodes.length > 0 ? questionNodes : React.Children.toArray(children);
      const bqNum = bqCounter ? ++bqCounter.current : undefined;
      content = (
        <PracticeQuestionCard
          number={bqNum}
          question={<>{questionContent}</>}
          answer={answerNodes.length > 0 ? <>{answerNodes}</> : undefined}
        />
      );
      break;
    }
    default:
      content = (
        <div className="my-4 rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-1.5 font-semibold text-xs uppercase tracking-wider mb-2 text-muted-foreground">
            <Info className="h-4 w-4" />
            {type}
          </div>
          <div className="text-sm text-foreground">{children}</div>
        </div>
      );
      break;
  }

  return (
    <RenderErrorBoundary label={`${type} callout`} source={extractText(children)}>
      {content}
    </RenderErrorBoundary>
  );
}
