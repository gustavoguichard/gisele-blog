import { describe, it, expect } from "vitest";
import { buttonStyles } from "./button";

describe("buttonStyles", () => {
  it("returns default styles (primary, lg)", () => {
    const result = buttonStyles();
    expect(result).toContain("rounded");
    expect(result).toContain("bg-primary");
    expect(result).toContain("px-6");
  });

  it("applies primary variant", () => {
    const result = buttonStyles({ variant: "primary" });
    expect(result).toContain("bg-primary");
    expect(result).toContain("text-white");
  });

  it("applies secondary variant", () => {
    const result = buttonStyles({ variant: "secondary" });
    expect(result).toContain("border-border-dark");
    expect(result).not.toContain("bg-primary");
  });

  it("applies sm size", () => {
    const result = buttonStyles({ size: "sm" });
    expect(result).toContain("px-3");
    expect(result).toContain("py-2");
  });

  it("applies md size", () => {
    const result = buttonStyles({ size: "md" });
    expect(result).toContain("px-5");
  });

  it("applies lg size", () => {
    const result = buttonStyles({ size: "lg" });
    expect(result).toContain("px-6");
    expect(result).toContain("py-2.5");
  });

  it("appends custom className", () => {
    const result = buttonStyles({ className: "my-custom" });
    expect(result).toContain("my-custom");
  });

  it("does not include undefined in output", () => {
    const result = buttonStyles();
    expect(result).not.toContain("undefined");
  });

  it("combines variant, size, and className", () => {
    const result = buttonStyles({
      variant: "secondary",
      size: "sm",
      className: "extra",
    });
    expect(result).toContain("border-border-dark");
    expect(result).toContain("px-3");
    expect(result).toContain("extra");
  });

  it("always includes base styles", () => {
    const result = buttonStyles({ variant: "secondary", size: "sm" });
    expect(result).toContain("rounded");
    expect(result).toContain("font-semibold");
    expect(result).toContain("transition-colors");
  });
});
