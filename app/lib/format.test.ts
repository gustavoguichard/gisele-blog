import { describe, it, expect } from "vitest";
import { formatDate, stripHtml, truncate } from "./format";

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
