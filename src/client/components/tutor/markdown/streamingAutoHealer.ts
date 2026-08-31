/**
 * Streaming Syntax Auto-Healer
 *
 * During active AI streaming, tokens arrive in incomplete fragments (e.g. half a LaTeX formula,
 * an unclosed code block, or an incomplete table).
 *
 * This utility inspects the streaming markdown and non-destructively appends virtual closing tokens
 * so that ReactMarkdown, KaTeX, and SyntaxHighlighter render gracefully without layout popping.
 */

export function healStreamingMarkdown(raw: string): string {
  if (!raw || typeof raw !== "string") return raw;

  let healed = raw;

  // 1. Balance Code Fences (```)
  const fenceMatches = healed.match(/```/g);
  const fenceCount = fenceMatches ? fenceMatches.length : 0;
  const isInsideCodeFence = fenceCount % 2 !== 0;

  if (isInsideCodeFence) {
    // If the stream ends inside a code block, append closing fence
    healed += "\n```";
    return healed;
  }

  // 2. Balance Block Math ($$) and nested LaTeX environments
  const blockMathMatches = healed.match(/\$\$/g);
  const blockMathCount = blockMathMatches ? blockMathMatches.length : 0;
  if (blockMathCount % 2 !== 0) {
    // Check for unclosed \begin{env} inside the active math block
    const lastBlockIndex = healed.lastIndexOf("$$");
    const activeMath = healed.slice(lastBlockIndex + 2);

    const envMatches = Array.from(activeMath.matchAll(/\\begin\{([a-zA-Z*]+)\}/g));
    const endMatches = Array.from(activeMath.matchAll(/\\end\{([a-zA-Z*]+)\}/g));

    const openEnvs: string[] = [];
    for (const match of envMatches) {
      openEnvs.push(match[1]);
    }
    for (const match of endMatches) {
      const idx = openEnvs.lastIndexOf(match[1]);
      if (idx !== -1) {
        openEnvs.splice(idx, 1);
      }
    }

    // Close any unclosed LaTeX environments
    let closers = "";
    while (openEnvs.length > 0) {
      const env = openEnvs.pop();
      closers += `\\end{${env}}`;
    }

    healed += closers + "$$";
  } else {
    // 3. Balance Inline Math ($)
    // Strip already matched $$ first to avoid counting them
    const textWithoutDisplayMath = healed.replace(/\$\$[\s\S]*?\$\$/g, "");
    const inlineMathMatches = textWithoutDisplayMath.match(/(?<!\\)\$/g);
    const inlineCount = inlineMathMatches ? inlineMathMatches.length : 0;

    if (inlineCount % 2 !== 0) {
      // Check that the last character is not a lonely dollar sign at word start
      if (!healed.endsWith(" $")) {
        healed += "$";
      }
    }
  }

  // 4. Balance Chemical Notation (\ce{...)
  const ceOpenCount = (healed.match(/\\ce\{/g) || []).length;
  const ceCloseCount = (healed.match(/\}/g) || []).length;
  if (ceOpenCount > 0 && ceOpenCount > ceCloseCount) {
    healed += "}".repeat(ceOpenCount - ceCloseCount);
  }

  // 5. Balance Unclosed Bold (**)
  const boldMatches = healed.match(/\*\*/g);
  if (boldMatches && boldMatches.length % 2 !== 0) {
    healed += "**";
  }

  // 6. Balance Incomplete Markdown Tables
  const lines = healed.split("\n");
  const lastLine = lines[lines.length - 1];
  if (lastLine.includes("|") && !lastLine.trim().endsWith("|")) {
    healed += " |";
  }

  return healed;
}
