// Map of digit → Unicode subscript character
const SUBSCRIPT: Record<string, string> = {
  "0": "₀",
  "1": "₁",
  "2": "₂",
  "3": "₃",
  "4": "₄",
  "5": "₅",
  "6": "₆",
  "7": "₇",
  "8": "₈",
  "9": "₉",
};

// Converts chemical formulas to Unicode subscripts so Mermaid renders them
// correctly as plain text inside SVG nodes.
export function formatChemFormulas(text: string): string {
  return text.replace(/\b([A-Z][a-z]?\d*(?:[A-Z][a-z]?\d*)+)\b/g, (word) => {
    if (/^([A-Z][a-z]?\d*)+$/.test(word) && /\d/.test(word)) {
      return word.replace(/\d/g, (d) => SUBSCRIPT[d] ?? d);
    }
    return word;
  });
}

// Mermaid's flowchart parser treats "(" inside a [...] node label as the start
// of a different node shape, which breaks parsing unless the whole label is
// quoted. AI-generated diagrams often include parentheses in labels (e.g.
// "Brine (NaCl)"), so quote any bracket label containing unescaped parens.
export function sanitizeMermaidLabels(code: string): string {
  const wrap = (id: string, label: string, open: string, close: string) => {
    const alreadyQuoted = /^".*"$/.test(label.trim());
    if (alreadyQuoted) return `${id}${open}${label}${close}`;

    // Apply Unicode subscript formatting to chemical formulas
    const formatted = formatChemFormulas(label);
    // Quote the label if it contains parentheses (or was changed by formula formatting)
    if (/[()]/.test(formatted) || formatted !== label) {
      return `${id}${open}"${formatted.replace(/"/g, "'")}"${close}`;
    }
    return `${id}${open}${formatted}${close}`;
  };
  return code
    .replace(/(\b[A-Za-z0-9_]+)\[([^\[\]"`]*)\]/g, (_m, id, label) => wrap(id, label, "[", "]"))
    .replace(/(\b[A-Za-z0-9_]+)\{([^{}`"]*)\}/g, (_m, id, label) => wrap(id, label, "{", "}"));
}

// JS blocklist (avoid auto-wrapping these as formulas)
const JS_BLOCKLIST = new Set([
  "React",
  "ReactDOM",
  "TypeScript",
  "JavaScript",
  "NextJS",
  "NodeJS",
  "Props",
  "State",
  "Ref",
  "Context",
  "Provider",
  "Consumer",
  "Promise",
  "Boolean",
  "String",
  "Number",
  "Object",
  "Array",
  "HTML",
  "CSS",
  "JSON",
  "XML",
  "API",
  "URL",
  "DOM",
  "BOM",
  "NaN",
  "Infinity",
  "undefined",
  "null",
  "true",
  "false",
]);

const PHYSICS_UNITS = [
  "m/s\\^2",
  "m/s",
  "km/h",
  "km/s",
  "mol/L",
  "g/mol",
  "kg/mol",
  "kJ/mol",
  "J/mol",
  "eV",
  "MeV",
  "GeV",
  "°C",
  "°F",
  "°K",
  "K",
  "atm",
  "Pa",
  "kPa",
  "MPa",
  "GPa",
  "bar",
  "mmHg",
  "torr",
  "N",
  "kN",
  "MN",
  "J",
  "kJ",
  "MJ",
  "W",
  "kW",
  "MW",
  "V",
  "mV",
  "A",
  "mA",
  "Ω",
  "Hz",
  "kHz",
  "MHz",
  "GHz",
  "m",
  "km",
  "cm",
  "mm",
  "μm",
  "nm",
  "pm",
  "fm",
  "kg",
  "g",
  "mg",
  "μg",
  "lb",
  "oz",
  "s",
  "ms",
  "μs",
  "ns",
  "min",
  "h",
  "d",
  "yr",
  "C",
  "mC",
  "μC",
  "F",
  "mF",
  "μF",
  "H",
  "mH",
  "T",
  "Wb",
  "lm",
  "lx",
  "Bq",
  "Gy",
  "Sv",
  "kat",
  "mol",
  "mmol",
];

export const MATH_MACROS: Record<string, string> = {
  "\\vec": "\\overrightarrow{#1}",
  "\\unit": "\\mathrm{#1}",
  "\\degree": "^\\circ",
  "\\mol": "\\mathrm{mol}",
  "\\kJ": "\\mathrm{kJ}",
  "\\atm": "\\mathrm{atm}",
  "\\N": "\\mathbb{N}",
  "\\Z": "\\mathbb{Z}",
  "\\Q": "\\mathbb{Q}",
  "\\R": "\\mathbb{R}",
  "\\C": "\\mathbb{C}",
  "\\diff": "\\mathrm{d}",
  "\\pdiff": "\\partial",
};

/**
 * Repair pmatrix/bmatrix blocks where the AI omitted \\ row separators.
 */
export function repairMatrix(math: string): string {
  return math.replace(
    /(\\begin\{[bBpvV]?matrix\})([ \t\S]*?)(\\end\{[bBpV]?matrix\})/g,
    (_m, open, inner, close) => {
      if (inner.includes("\\\\")) return _m;

      if (inner.includes("&")) {
        const fixed = inner.replace(
          /([0-9a-zA-Z}\])\|])[ \t]+(-?[0-9\\-])/g,
          (_match: string, end: string, start: string) => `${end} \\\\ ${start}`,
        );
        return `${open}${fixed}${close}`;
      }

      const trimmed = inner.trim();
      const tokens = trimmed.split(/[ \t]+/).filter(Boolean);
      if (tokens.length > 1 && /^[\d.+\-\\a-zA-Z{}^_ ]+$/.test(trimmed)) {
        return `${open} ${tokens.join(" \\\\ ")} ${close}`;
      }

      return _m;
    },
  );
}

/**
 * Preprocesses raw AI markdown for LaTeX, mhchem, callouts, and math formats.
 */
export function preprocessLatex(raw: string): string {
  if (!raw || typeof raw !== "string") return raw;

  let s = raw;

  // ── Step -1: Convert hallucinated code blocks to blockquotes ────────────────
  s = s.replace(/```(?:practice|question)\n([\s\S]*?)```/gi, (_, content) => {
    return (
      "> [!PRACTICE]\n" +
      content
        .split("\n")
        .map((l: string) => `> ${l}`)
        .join("\n")
    );
  });
  s = s.replace(/```(?:study-tip|tip)\n([\s\S]*?)```/gi, (_, content) => {
    return (
      "> [!TIP]\n" +
      content
        .split("\n")
        .map((l: string) => `> ${l}`)
        .join("\n")
    );
  });

  // ── Step 0: Repair broken blockquotes ──────────────────────────────────────
  s = s.replace(/^\[!PRACTICE\]/gim, "> [!PRACTICE]");
  s = s.replace(/\n>\s*\n> \[!PRACTICE\]/gim, "\n\n> [!PRACTICE]");

  // ── Step 1: Fix control-character mangling from streaming ─────────────────
  s = s
    .replace(/[\x00-\x1F]rac/g, "\\frac")
    .replace(/[\x00-\x1F]imes/g, "\\times")
    .replace(/[\x00-\x1F]egin/g, "\\begin")
    .replace(/[\x00-\x1F]end/g, "\\end")
    .replace(/[\x00-\x1F]pm/g, "\\pm")
    .replace(/[\x00-\x1F]cdot/g, "\\cdot")
    .replace(/[\x00-\x1F]sqrt/g, "\\sqrt")
    .replace(/[\x00-\x1F]ext/g, "\\text")
    .replace(/[\x00-\x1F]left/g, "\\left")
    .replace(/[\x00-\x1F]right/g, "\\right")
    .replace(/[\x00-\x1F]ce\b/g, "\\ce");

  // ── Step 2: Protect math blocks FIRST (before any \\ stripping) ───────────
  const MATH_TOKEN = "\x00MATH\x00";
  const mathBlocks: string[] = [];
  s = s.replace(/\$\$[\s\S]*?\$\$/g, (m) => {
    mathBlocks.push(m);
    return MATH_TOKEN;
  });
  s = s.replace(/\$(?!\s)[^\$\n]*?(?<!\s)\$/g, (m) => {
    mathBlocks.push(m);
    return MATH_TOKEN;
  });

  // ── Step 3: Strip AI-generated \\ line-break artifacts (plain text only) ──
  s = s.replace(/^[ \t]*\\\\[ \t]*$/gm, ""); // line that is only \\
  s = s.replace(/ \\\\ /g, "\n"); // inline " \\ " → newline

  // ── Step 4: Fence / code / link protection ────────────────────────────────
  const fenceCount = (s.match(/```/g) || []).length;
  if (fenceCount % 2 !== 0) {
    // Unbalanced fences (still streaming) – restore math and bail early
    s = s.replace(new RegExp(MATH_TOKEN, "g"), () => mathBlocks.shift()!);
    return s;
  }

  const FENCE_TOKEN = "\x00FENCE\x00";
  const fenceBlocks: string[] = [];
  s = s.replace(/```[\s\S]*?```/g, (m) => {
    fenceBlocks.push(m);
    return FENCE_TOKEN;
  });

  const LINK_TOKEN = "\x00LINK\x00";
  const linkBlocks: string[] = [];
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m) => {
    linkBlocks.push(m);
    return LINK_TOKEN;
  });

  const INLINE_CODE_TOKEN = "\x00ICODE\x00";
  const inlineCodeBlocks: string[] = [];
  s = s.replace(/`[^`\n]+`/g, (m) => {
    inlineCodeBlocks.push(m);
    return INLINE_CODE_TOKEN;
  });

  // ── Step 5: Convert \[...\] and \(...\) to $$ / $ ────────────────────────
  s = s.replace(/\\\[\s*([\s\S]*?)\s*\\\]/g, (_m, inner) => `$$\n${inner.trim()}\n$$`);
  s = s.replace(/\\\(\s*([\s\S]*?)\s*\\\)/g, (_m, inner) => `$${inner.trim()}$`);

  // ── Step 6: \ce chemical notation (mhchem) ───────────────────────────────
  s = s.replace(/(^|[^a-zA-Z\\])ce\s*\{([^}]+)\}/g, "$1\\ce{$2}");
  s = s.replace(/\\ce([A-Z][A-Za-z0-9^_+\-]*)/g, "\\ce{$1}");
  s = s.replace(/\\ce\s+([A-Za-z][A-Za-z0-9^_+\-]*)/g, "\\ce{$1}");
  s = s.replace(/(?<!\$)\\ce\{([^}]+)\}(?!\$)/g, "`chem:$1`");

  // Common maths commands
  s = s.replace(/\\xrightarrow\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g, "$\\xrightarrow{$1}$");
  s = s.replace(/\\xleftarrow\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g, "$\\xleftarrow{$1}$");
  s = s.replace(/\\overset\{([^}]+)\}\{([^}]+)\}/g, "$\\overset{$1}{$2}$");
  s = s.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "$\\frac{$1}{$2}$");

  // Numbers before \text{}
  s = s.replace(/(\d+(?:\.\d+)?)\s*\\text\{([^}]+)\}/g, "$$$1 \\text{$2}$$");
  s = s.replace(/\\text\{([^}]+)\}/g, "$\\text{$1}$");

  s = s.replace(/\\sqrt\{([^}]+)\}/g, "$\\sqrt{$1}$");
  s = s.replace(/\\times\b/g, "$\\times$");
  s = s.replace(/\\cdot\b/g, "$\\cdot$");
  s = s.replace(/\\pm\b/g, "$\\pm$");
  s = s.replace(/\\rightarrow\b/g, "$\\rightarrow$");
  s = s.replace(/\\leftarrow\b/g, "$\\leftarrow$");
  s = s.replace(/\\longrightarrow\b/g, "$\\longrightarrow$");
  s = s.replace(/\\leftrightarrow\b/g, "$\\leftrightarrow$");

  // ── Step 7: Auto-detect chemical formulas ────────────────────────────────
  s = s.replace(
    /\b([A-Z][a-z]?\d*(?:[A-Z][a-z]?\d*){1,}(?:\([A-Z][a-z]?\d*\)\d*)*)(?=\s|$|[^a-zA-Z])/g,
    (_m, formula) => {
      if (!/\d/.test(formula)) return formula;
      if (JS_BLOCKLIST.has(formula)) return formula;
      const elementCount = (formula.match(/[A-Z]/g) || []).length;
      if (elementCount < 2) return formula;
      return `$\\ce{${formula}}$`;
    },
  );

  // ── Step 8: Arrow shorthand ───────────────────────────────────────────────
  s = s.replace(/(\s)(->|-->|<->|<=>)(\s)/g, (_m, pre, arrow, post) => {
    const map: Record<string, string> = {
      "->": "$\\rightarrow$",
      "-->": "$\\longrightarrow$",
      "<->": "$\\leftrightarrow$",
      "<=>": "$\\rightleftharpoons$",
    };
    return `${pre}${map[arrow]}${post}`;
  });

  // ── Step 9: Physics units ─────────────────────────────────────────────────
  const unitPattern = PHYSICS_UNITS.join("|");
  s = s.replace(
    new RegExp(`\\b(\\d+(?:\\.\\d+)?)\\s*(${unitPattern})\\b`, "g"),
    (_m, num, unit) => {
      const latexUnit = unit.replace(/\\?\^(\d)/g, "^{$1}").replace(/°/g, "^\\circ ");
      return `$${num} \\text{${latexUnit}}$`;
    },
  );

  // Clean up stray LaTeX thin spaces outside math mode
  s = s.replace(/\\,/g, " ");

  // ── Step 10: Make plain-text URLs clickable ───────────────────────────────
  s = s.replace(
    /(?<![\[(!`]|https?:\/\/)\b((?:www\.)?[a-zA-Z0-9-]{2,}(?:\.[a-zA-Z]{2,}){1,}(?:\/[^\s,)"'<>]*)?)/g,
    (_m, url) => {
      if (!url.includes(".") || url.match(/^(\d+\.)+\d+$/)) return _m;
      if (/^\d/.test(url)) return _m;
      const href = url.startsWith("http") ? url : `https://${url}`;
      return `[${url}](${href})`;
    },
  );

  // ── Step 11: Format MCQ choices and list items ───────────────────────────
  // Split inline choices on same line (e.g. A. Opt1 B. Opt2) into newlines
  s = s.replace(/([^\n])\s+(?:\b|\()([A-D])(?:\)|\.|\:)\s+/g, "$1\n$2. ");

  // Ensure choices under numbered question list items stay indented inside the <li>
  const lines = s.split("\n");
  const outLines: string[] = [];
  let inNumberedItem = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (/^\s*\d+\.\s+/.test(line)) {
      inNumberedItem = true;
      outLines.push(line);
      continue;
    }

    const choiceMatch = line.match(
      /^\s*(?:[\-\*]\s+)?(?:\(?([A-D])\)|\b([A-D])[\.\:\)]|\[([A-D])\])\s+(.*)$/,
    );
    if (choiceMatch) {
      const letter = (choiceMatch[1] || choiceMatch[2] || choiceMatch[3]).toUpperCase();
      const rest = choiceMatch[4];
      if (inNumberedItem) {
        // Indent 3 spaces so CommonMark keeps it inside the parent <li>
        outLines.push(`   - **${letter})** ${rest}`);
      } else {
        outLines.push(`- **${letter})** ${rest}`);
      }
      continue;
    }

    if (line.trim() === "") {
      if (i + 1 < lines.length && /^\s*\d+\.\s+/.test(lines[i + 1])) {
        inNumberedItem = false;
      }
    } else if (!/^\s{2,}/.test(line)) {
      inNumberedItem = false;
    }

    outLines.push(line);
  }
  s = outLines.join("\n");

  s = s.replace(
    /([^\n(])\s+([a-z]\))\s+(?=[A-Za-z0-9$])/g,
    (_, pre, letter) => `${pre}\n\n   ${letter} `,
  );
  s = s.replace(/([^\n:])[ \t]+(\d+\.\s+)(?=[A-Za-z0-9$])/g, (_, pre, num) => `${pre}\n${num}`);

  // Restore protected blocks
  s = s.replace(new RegExp(MATH_TOKEN, "g"), () => repairMatrix(mathBlocks.shift()!));
  s = s.replace(new RegExp(INLINE_CODE_TOKEN, "g"), () => inlineCodeBlocks.shift()!);
  s = s.replace(new RegExp(FENCE_TOKEN, "g"), () => fenceBlocks.shift()!);
  s = s.replace(new RegExp(LINK_TOKEN, "g"), () => linkBlocks.shift()!);

  return s;
}
