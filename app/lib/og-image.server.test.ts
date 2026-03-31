import { describe, it, expect } from "vitest";
import { getEtag } from "./og-image.server";

describe("getEtag", () => {
  it("returns a hex string", () => {
    const etag = getEtag("Hello");
    expect(etag).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is deterministic for the same input", () => {
    expect(getEtag("Test Title")).toBe(getEtag("Test Title"));
  });

  it("produces different hashes for different inputs", () => {
    expect(getEtag("Title A")).not.toBe(getEtag("Title B"));
  });

  it("handles Portuguese characters", () => {
    const etag = getEtag("Reflexões sobre Ayurveda e saúde");
    expect(etag).toMatch(/^[0-9a-f]{64}$/);
  });

  it("handles empty string", () => {
    const etag = getEtag("");
    expect(etag).toMatch(/^[0-9a-f]{64}$/);
  });
});
