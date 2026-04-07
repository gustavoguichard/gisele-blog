import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import type { Route } from "./+types/contact";
import Contact from "./contact";
import { contactSchema } from "~/business/contact.common";

function renderContact(turnstileSiteKey: string | null = "test-site-key") {
  const Stub = createRoutesStub([
    {
      path: "/",
      Component(props) {
        return Contact(props as Route.ComponentProps);
      },
      loader: () => ({ turnstileSiteKey }),
    },
  ]);
  return render(<Stub initialEntries={["/"]} />);
}

describe("contactSchema", () => {
  const validInput = {
    name: "Maria",
    email: "maria@example.com",
    message: "Olá, gostaria de saber mais sobre os cursos.",
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
});

describe("Contact page", () => {
  it("renders the page header", async () => {
    renderContact();
    expect(await screen.findByText("Vamos Conversar?")).toBeInTheDocument();
    expect(screen.getByText(/Uma porta aberta/)).toBeInTheDocument();
  });

  it("renders form fields with personal labels", async () => {
    renderContact();
    expect(await screen.findByText(/como posso te chamar/i)).toBeInTheDocument();
    expect(screen.getByText(/seu email para que eu possa responder/i)).toBeInTheDocument();
    expect(screen.getByText(/o que está no seu coração/i)).toBeInTheDocument();
  });

  it("renders submit button", async () => {
    renderContact();
    expect(await screen.findByRole("button", { name: "Enviar mensagem" })).toBeInTheDocument();
  });

  it("renders contact alternatives", async () => {
    renderContact();
    expect(await screen.findByText("gi@giseledemenezes.com")).toBeInTheDocument();
    expect(screen.getByText("@gigiseledemenezes")).toBeInTheDocument();
  });

  it("renders the quote", async () => {
    renderContact();
    expect(
      await screen.findByText(/O encontro inicia quando nos abrimos para a escuta/),
    ).toBeInTheDocument();
  });

  it("renders Turnstile widget when site key is provided", async () => {
    renderContact("test-site-key");
    await screen.findByText("Vamos Conversar?");
    expect(screen.getByTestId("turnstile")).toBeInTheDocument();
  });

  it("does not render Turnstile widget when site key is null", async () => {
    renderContact(null);
    await screen.findByText("Vamos Conversar?");
    expect(screen.queryByTestId("turnstile")).not.toBeInTheDocument();
  });
});
