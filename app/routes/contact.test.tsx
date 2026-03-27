import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import Contact, { contactSchema, MIN_SUBMIT_TIME_MS } from "./contact";

function renderContact() {
  const Stub = createRoutesStub([{ path: "/", Component: Contact }]);
  return render(<Stub initialEntries={["/"]} />);
}

describe("contactSchema", () => {
  const validInput = {
    name: "Maria",
    email: "maria@example.com",
    message: "Olá, gostaria de saber mais sobre os cursos.",
    _gotcha: "",
    _timestamp: Date.now() - 10000,
  };

  it("accepts valid input", () => {
    const result = contactSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = contactSchema.safeParse({ ...validInput, name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = contactSchema.safeParse({ ...validInput, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects short message", () => {
    const result = contactSchema.safeParse({ ...validInput, message: "Oi" });
    expect(result.success).toBe(false);
  });

  it("rejects filled honeypot", () => {
    const result = contactSchema.safeParse({ ...validInput, _gotcha: "spam bot" });
    expect(result.success).toBe(false);
  });

  it("coerces _timestamp to number", () => {
    const result = contactSchema.safeParse({ ...validInput, _timestamp: "1234567890" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data._timestamp).toBe(1234567890);
    }
  });
});

describe("MIN_SUBMIT_TIME_MS", () => {
  it("is at least 2 seconds", () => {
    expect(MIN_SUBMIT_TIME_MS).toBeGreaterThanOrEqual(2000);
  });
});

describe("Contact page", () => {
  it("renders the page header", () => {
    renderContact();
    expect(screen.getByText("Vamos Conversar?")).toBeInTheDocument();
    expect(screen.getByText(/Uma porta aberta/)).toBeInTheDocument();
  });

  it("renders form fields with personal labels", () => {
    renderContact();
    expect(screen.getByText(/como posso te chamar/i)).toBeInTheDocument();
    expect(screen.getByText(/seu email para que eu possa responder/i)).toBeInTheDocument();
    expect(screen.getByText(/o que está no seu coração/i)).toBeInTheDocument();
  });

  it("renders submit button", () => {
    renderContact();
    expect(screen.getByRole("button", { name: "Enviar mensagem" })).toBeInTheDocument();
  });

  it("renders honeypot field", () => {
    const { container } = renderContact();
    const honeypot = container.querySelector('input[name="_gotcha"]');
    expect(honeypot).toBeInTheDocument();
    expect(honeypot).toHaveAttribute("tabindex", "-1");
  });

  it("renders hidden timestamp field", () => {
    const { container } = renderContact();
    const timestamp = container.querySelector('input[name="_timestamp"]');
    expect(timestamp).toBeInTheDocument();
    expect(timestamp).toHaveAttribute("type", "hidden");
  });

  it("renders contact alternatives", () => {
    renderContact();
    expect(screen.getByText("gi@giseledemenezes.com")).toBeInTheDocument();
    expect(screen.getByText("@gigiseledemenezes")).toBeInTheDocument();
  });

  it("renders the quote", () => {
    renderContact();
    expect(
      screen.getByText(/O encontro verdadeiro começa quando nos permitimos ser ouvidos/),
    ).toBeInTheDocument();
  });
});
