import { describe, it, expect } from "vitest";
import React from "react";
import ReactDOMServer from "react-dom/server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getMarkdownComponents } from "./MarkdownComponents";
import { preprocessLatex } from "./latexPreprocessor";

describe("Markdown List Rendering", () => {
  const components = getMarkdownComponents(false);

  function render(markdown: string) {
    const processed = preprocessLatex(markdown);
    return ReactDOMServer.renderToStaticMarkup(
      React.createElement(ReactMarkdown, {
        remarkPlugins: [remarkGfm],
        components,
        children: processed,
      }),
    );
  }

  it("renders a standard unordered bullet list with disc markers", () => {
    const md = `
- Item one
- Item two
- Item three
`.trim();
    const html = render(md);
    expect(html).toContain("<ul");
    expect(html).toContain("list-disc");
    expect(html).toContain("Item one");
    expect(html).toContain("Item two");
    expect(html).toContain("Item three");
  });

  it("renders a standard ordered list with decimal markers", () => {
    const md = `
1. Step one
2. Step two
3. Step three
`.trim();
    const html = render(md);
    expect(html).toContain("<ol");
    expect(html).toContain("list-decimal");
    expect(html).toContain("Step one");
    expect(html).toContain("Step two");
    expect(html).toContain("Step three");
  });

  it("respects the start attribute when an ordered list starts from a non-1 number", () => {
    const md = `
4. Step four
5. Step five
`.trim();
    const html = render(md);
    expect(html).toContain("<ol");
    expect(html).toContain('start="4"');
  });

  it("hierarchically renders nested ordered lists with lower-alpha for depth 1", () => {
    const md = `
1. Main item
   1. Sub item A
   2. Sub item B
2. Next item
`.trim();
    const html = render(md);
    expect(html).toContain("list-decimal");
    expect(html).toContain("list-[lower-alpha]");
    expect(html).toContain("Sub item A");
  });

  it("hierarchically renders nested unordered lists with circle for depth 1", () => {
    const md = `
- Main bullet
  - Child bullet 1
  - Child bullet 2
`.trim();
    const html = render(md);
    expect(html).toContain("list-disc");
    expect(html).toContain("list-[circle]");
    expect(html).toContain("Child bullet 1");
  });

  it("does NOT break lists with letter references like 'Point A' or 'Vitamin C' into fake bullets", () => {
    const md = `
Key Points:
- Point A. First major point
- Point B. Second major point
- Point C. Third major point
`.trim();
    const html = render(md);
    expect(html).toContain("Point A. First major point");
    expect(html).toContain("Point B. Second major point");
    expect(html).toContain("Point C. Third major point");
    expect(html).not.toContain("- **A)**");
  });

  it("does NOT break sentences with Vitamin C into fake bullets", () => {
    const md = "Vitamin C. It is water soluble.";
    const html = render(md);
    expect(html).toContain("Vitamin C. It is water soluble.");
    expect(html).not.toContain("<ul");
    expect(html).not.toContain("<li");
  });

  it("renders task list checkboxes correctly", () => {
    const md = `
- [x] Task complete
- [ ] Task incomplete
`.trim();
    const html = render(md);
    expect(html).toContain('type="checkbox"');
    expect(html).toContain("checked");
  });
});
