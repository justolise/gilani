import React from "react";

// PracticeCounterCtx: stable Map<byteOffset → questionNumber> computed once from HAST
export const PracticeCounterCtx = React.createContext<Map<number, number> | null>(null);

// InsidePracticeCardCtx: flag set inside practice cards so nested lists don't re-convert
export const InsidePracticeCardCtx = React.createContext<
  { isQuestion: boolean; isMultipleChoice?: boolean } | false
>(false);

// BlockquotePracticeCounterCtx: mutable ref for [!PRACTICE] blockquote sequential numbering
export const BlockquotePracticeCounterCtx =
  React.createContext<React.MutableRefObject<number> | null>(null);
