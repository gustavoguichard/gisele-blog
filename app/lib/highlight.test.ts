import { describe, it, expect } from "vitest";
import { highlightMatches, snippetAround } from "./highlight";

describe("highlightMatches", () => {
  it("marks exact words", () => {
    expect(highlightMatches("Meditação é a chave", "meditação")).toEqual([
      { text: "Meditação", match: true },
      { text: " é a chave", match: false },
    ]);
  });

  it("ignores accents and case", () => {
    const segments = highlightMatches("A Meditação Vipassana", "MEDITACAO");
    expect(segments.find((s) => s.match)?.text).toBe("Meditação");
  });

  it("tolerates typos", () => {
    const segments = highlightMatches("Meditação é a chave", "medtação");
    expect(segments.find((s) => s.match)?.text).toBe("Meditação");
  });

  it("matches partial words", () => {
    const segments = highlightMatches("A Tradição - o Ayurveda", "ayurved");
    expect(segments.find((s) => s.match)?.text).toBe("Ayurveda");
  });

  it("marks each word of a multi-word query", () => {
    const segments = highlightMatches("O dosha vata governa o movimento", "dosha vata");
    expect(segments.filter((s) => s.match).map((s) => s.text)).toEqual(["dosha", "vata"]);
  });

  it("returns the text untouched when the query is empty", () => {
    expect(highlightMatches("Texto", "")).toEqual([{ text: "Texto", match: false }]);
  });

  it("does not highlight unrelated words", () => {
    expect(highlightMatches("Feliz Natal", "yoga").some((s) => s.match)).toBe(false);
  });
});

describe("snippetAround", () => {
  const text = `${"palavra ".repeat(40)}ayurveda ${"outra ".repeat(40)}`.trim();

  it("returns a window around the first match with ellipses", () => {
    const snippet = snippetAround(text, "ayurveda", 30);
    expect(snippet).toMatch(/^…/);
    expect(snippet).toMatch(/…$/);
    expect(snippet).toContain("ayurveda");
    expect(snippet?.length).toBeLessThan(90);
  });

  it("omits ellipses when the match is near the edges", () => {
    expect(snippetAround("ayurveda é vida", "ayurveda")).toBe("ayurveda é vida");
  });

  it("returns null without a match", () => {
    expect(snippetAround(text, "tarot")).toBeNull();
  });
});
