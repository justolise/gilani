import React from "react";
import {
  Globe,
  Code2,
  BookOpen,
  Search,
  FileText,
  HelpCircle,
  Calculator,
  Sparkles,
  Archive,
  Image,
  Cpu,
  Wrench,
  Terminal,
} from "lucide-react";

export interface ToolMetadata {
  displayName: string;
  inProgressLabel: string;
  icon: React.ElementType;
}

const KNOWN_TOOLS: Record<string, Partial<ToolMetadata>> = {
  // Web search
  searchWeb: {
    displayName: "Web Search",
    inProgressLabel: "Searching the web…",
    icon: Globe,
  },
  webSearch: {
    displayName: "Web Search",
    inProgressLabel: "Searching the web…",
    icon: Globe,
  },
  googleSearch: {
    displayName: "Google Search",
    inProgressLabel: "Searching Google…",
    icon: Search,
  },

  // Code execution
  evaluateCode: {
    displayName: "Code Execution",
    inProgressLabel: "Running code in sandbox…",
    icon: Code2,
  },
  runCode: {
    displayName: "Code Execution",
    inProgressLabel: "Running code…",
    icon: Code2,
  },
  executeCode: {
    displayName: "Code Execution",
    inProgressLabel: "Executing code sandbox…",
    icon: Code2,
  },
  python: {
    displayName: "Python Runner",
    inProgressLabel: "Executing Python script…",
    icon: Terminal,
  },

  // Curriculum & preferences
  setCurriculum: {
    displayName: "Curriculum Settings",
    inProgressLabel: "Updating curriculum preferences…",
    icon: BookOpen,
  },
  curriculum: {
    displayName: "Curriculum Settings",
    inProgressLabel: "Saving curriculum settings…",
    icon: BookOpen,
  },

  // Documents & OCR
  extractDocument: {
    displayName: "Document Reader",
    inProgressLabel: "Extracting document content…",
    icon: FileText,
  },
  parseDocument: {
    displayName: "Document Parser",
    inProgressLabel: "Parsing document…",
    icon: FileText,
  },
  readDocument: {
    displayName: "Document Reader",
    inProgressLabel: "Reading attached document…",
    icon: FileText,
  },
  ocrImage: {
    displayName: "Image OCR",
    inProgressLabel: "Extracting text from image…",
    icon: Image,
  },
  extractTextFromImage: {
    displayName: "Image Vision",
    inProgressLabel: "Analyzing image content…",
    icon: Image,
  },

  // Learning tools
  generateQuiz: {
    displayName: "Quiz Generator",
    inProgressLabel: "Generating practice quiz…",
    icon: HelpCircle,
  },
  calculate: {
    displayName: "Calculator",
    inProgressLabel: "Computing calculation…",
    icon: Calculator,
  },
  calculator: {
    displayName: "Calculator",
    inProgressLabel: "Calculating result…",
    icon: Calculator,
  },
  generateFlashcards: {
    displayName: "Flashcard Creator",
    inProgressLabel: "Creating study flashcards…",
    icon: Sparkles,
  },
  fetchPastPapers: {
    displayName: "Past Exam Papers",
    inProgressLabel: "Retrieving exam questions…",
    icon: Archive,
  },
};

/**
 * Converts any raw tool name (camelCase, snake_case, kebab-case, or prefixed)
 * into a clean, human-readable Title Case name.
 */
export function formatToolDisplayName(rawName: string): string {
  if (!rawName) return "Tool";
  const clean = rawName.replace(/^(tool[-_:]?)/i, "").trim();

  // Check explicit known map first
  const known = KNOWN_TOOLS[clean] || KNOWN_TOOLS[rawName];
  if (known?.displayName) return known.displayName;

  // Otherwise, smartly convert camelCase, snake_case, kebab-case into words
  const words = clean
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .trim()
    .split(/\s+/);

  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
}

/**
 * Returns a clean, natural in-progress label for the tool.
 */
export function formatToolInProgressLabel(rawName: string): string {
  if (!rawName) return "Using tool…";
  const clean = rawName.replace(/^(tool[-_:]?)/i, "").trim();

  const known = KNOWN_TOOLS[clean] || KNOWN_TOOLS[rawName];
  if (known?.inProgressLabel) return known.inProgressLabel;

  const displayName = formatToolDisplayName(rawName);
  return `Running ${displayName}…`;
}

/**
 * Returns an appropriate Lucide icon component based on the tool name or category.
 */
export function getToolIcon(rawName: string): React.ElementType {
  if (!rawName) return Wrench;
  const clean = rawName.replace(/^(tool[-_:]?)/i, "").trim();

  const known = KNOWN_TOOLS[clean] || KNOWN_TOOLS[rawName];
  if (known?.icon) return known.icon;

  const lower = clean.toLowerCase();
  if (lower.includes("search") || lower.includes("web") || lower.includes("find")) return Globe;
  if (
    lower.includes("code") ||
    lower.includes("eval") ||
    lower.includes("exec") ||
    lower.includes("run")
  )
    return Code2;
  if (
    lower.includes("doc") ||
    lower.includes("pdf") ||
    lower.includes("file") ||
    lower.includes("text")
  )
    return FileText;
  if (
    lower.includes("image") ||
    lower.includes("ocr") ||
    lower.includes("vision") ||
    lower.includes("scan")
  )
    return Image;
  if (lower.includes("calc") || lower.includes("math")) return Calculator;
  if (lower.includes("curriculum") || lower.includes("grade") || lower.includes("study"))
    return BookOpen;
  if (lower.includes("quiz") || lower.includes("question") || lower.includes("test"))
    return HelpCircle;
  if (lower.includes("flashcard") || lower.includes("ai") || lower.includes("spark"))
    return Sparkles;

  return Cpu;
}
