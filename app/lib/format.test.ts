import { describe, it, expect } from "vitest";
import {
  formatDate,
  stripHtml,
  truncate,
  extractFirstParagraphs,
  pluralize,
  hideOnImgError,
  hideParentOnImgError,
} from "./format";

describe("formatDate", () => {
  it("formats a Date object in pt-BR", () => {
    const date = new Date("2024-03-15T12:00:00Z");
    expect(formatDate(date)).toContain("2024");
    expect(formatDate(date)).toContain("março");
  });

  it("formats a date string", () => {
    const result = formatDate("2024-06-15T12:00:00Z");
    expect(result).toContain("junho");
    expect(result).toContain("2024");
  });

  it("returns empty string for null", () => {
    expect(formatDate(null)).toBe("");
  });

  it("returns a non-empty string for valid dates", () => {
    expect(formatDate(new Date())).not.toBe("");
  });
});

describe("stripHtml", () => {
  it("strips simple HTML tags", () => {
    expect(stripHtml("<p>Hello</p>")).toBe("Hello");
  });

  it("strips nested tags", () => {
    expect(stripHtml("<div><p>Hello <strong>world</strong></p></div>")).toBe("Hello world");
  });

  it("trims whitespace", () => {
    expect(stripHtml("<p>  Hello  </p>")).toBe("Hello");
  });

  it("handles empty string", () => {
    expect(stripHtml("")).toBe("");
  });

  it("handles text with no HTML", () => {
    expect(stripHtml("plain text")).toBe("plain text");
  });

  it("strips self-closing tags", () => {
    expect(stripHtml("Hello<br/>world")).toBe("Helloworld");
  });

  it("strips tags with attributes", () => {
    expect(stripHtml('<a href="test">link</a>')).toBe("link");
  });

  it("handles multiple tags in sequence", () => {
    expect(stripHtml("<b>bold</b> and <i>italic</i>")).toBe("bold and italic");
  });
});

describe("truncate", () => {
  it("returns text unchanged when shorter than maxLength", () => {
    expect(truncate("short", 160)).toBe("short");
  });

  it("returns text unchanged when exactly maxLength", () => {
    const text = "a".repeat(160);
    expect(truncate(text, 160)).toBe(text);
  });

  it("truncates and adds ellipsis when longer than maxLength", () => {
    const text = "a".repeat(200);
    const result = truncate(text, 160);
    expect(result).toHaveLength(161);
    expect(result.endsWith("…")).toBe(true);
  });

  it("trims trailing whitespace before ellipsis", () => {
    const text =
      "Hello world this is a long text that needs truncation       and more words follow here for padding";
    const result = truncate(text, 55);
    expect(result).not.toMatch(/ …$/);
    expect(result.endsWith("…")).toBe(true);
  });

  it("uses default maxLength of 160", () => {
    const text = "a".repeat(200);
    const result = truncate(text);
    expect(result).toHaveLength(161);
  });

  it("handles single character maxLength", () => {
    const result = truncate("Hello", 1);
    expect(result).toBe("H…");
  });

  it("handles empty string", () => {
    expect(truncate("", 100)).toBe("");
  });
});

describe("extractFirstParagraphs", () => {
  it("extracts the first paragraph", () => {
    const html = "<p>First paragraph.</p><p>Second paragraph.</p><p>Third.</p>";
    expect(extractFirstParagraphs(html, 1)).toBe("<p>First paragraph.</p>");
  });

  it("extracts multiple paragraphs", () => {
    const html = "<p>First.</p><p>Second.</p><p>Third.</p>";
    expect(extractFirstParagraphs(html, 2)).toBe("<p>First.</p><p>Second.</p>");
  });

  it("returns all paragraphs when count exceeds available", () => {
    const html = "<p>Only one.</p>";
    expect(extractFirstParagraphs(html, 3)).toBe("<p>Only one.</p>");
  });

  it("returns empty string when no paragraphs found", () => {
    expect(extractFirstParagraphs("<div>No paragraphs</div>", 2)).toBe("");
  });

  it("returns empty string for empty input", () => {
    expect(extractFirstParagraphs("", 2)).toBe("");
  });

  it("handles paragraphs with attributes", () => {
    const html = '<p class="intro">Hello.</p><p>World.</p>';
    expect(extractFirstParagraphs(html, 1)).toBe('<p class="intro">Hello.</p>');
  });

  it("handles paragraphs with nested HTML", () => {
    const html = "<p>Hello <strong>world</strong></p><p>Second.</p>";
    expect(extractFirstParagraphs(html, 1)).toBe("<p>Hello <strong>world</strong></p>");
  });

  it("defaults to 2 paragraphs", () => {
    const html = "<p>First.</p><p>Second.</p><p>Third.</p>";
    expect(extractFirstParagraphs(html)).toBe("<p>First.</p><p>Second.</p>");
  });
});

describe("pluralize", () => {
  it("returns singular when count is 1", () => {
    expect(pluralize(1, "publicação", "publicações")).toBe("1 publicação");
  });

  it("returns plural when count is 0", () => {
    expect(pluralize(0, "comentário", "comentários")).toBe("0 comentários");
  });

  it("returns plural when count is greater than 1", () => {
    expect(pluralize(5, "publicação", "publicações")).toBe("5 publicações");
  });

  it("returns plural for large numbers", () => {
    expect(pluralize(135, "post", "posts")).toBe("135 posts");
  });
});

describe("hideOnImgError", () => {
  it("sets display none on the image element", () => {
    const img = document.createElement("img");
    const mockEvent = { currentTarget: img } as unknown as React.SyntheticEvent<HTMLImageElement>;
    hideOnImgError(mockEvent);
    expect(img.style.display).toBe("none");
  });
});

describe("hideParentOnImgError", () => {
  it("sets display none on the parent element", () => {
    const parent = document.createElement("div");
    const img = document.createElement("img");
    parent.appendChild(img);
    const mockEvent = { currentTarget: img } as unknown as React.SyntheticEvent<HTMLImageElement>;
    hideParentOnImgError(mockEvent);
    expect(parent.style.display).toBe("none");
  });
});
