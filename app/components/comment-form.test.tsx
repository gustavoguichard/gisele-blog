import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { CommentForm } from "./comment-form";

function renderForm(props: Parameters<typeof CommentForm>[0] = {}) {
  const Stub = createRoutesStub([{ path: "/", Component: () => <CommentForm {...props} /> }]);
  return render(<Stub initialEntries={["/"]} />);
}

describe("CommentForm", () => {
  it("renders name, email, and content fields", () => {
    renderForm();
    expect(screen.getByLabelText(/nome/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/comentário/i)).toBeInTheDocument();
  });

  it("renders submit button", () => {
    renderForm();
    expect(screen.getByRole("button", { name: "Enviar" })).toBeInTheDocument();
  });

  it("renders honeypot field", () => {
    const { container } = renderForm();
    const honeypot = container.querySelector('input[name="website"]');
    expect(honeypot).toBeInTheDocument();
    expect(honeypot).toHaveAttribute("tabindex", "-1");
  });

  it("renders hidden timestamp field", () => {
    const { container } = renderForm();
    const timestamp = container.querySelector('input[name="_t"]');
    expect(timestamp).toBeInTheDocument();
    expect(timestamp).toHaveAttribute("type", "hidden");
  });

  it("renders hidden parentId when provided", () => {
    const { container } = renderForm({ parentId: "abc-123" });
    const parentInput = container.querySelector('input[name="parentId"]');
    expect(parentInput).toBeInTheDocument();
    expect(parentInput).toHaveAttribute("value", "abc-123");
  });

  it("does not render parentId when not provided", () => {
    const { container } = renderForm();
    const parentInput = container.querySelector('input[name="parentId"]');
    expect(parentInput).not.toBeInTheDocument();
  });

  it("does not render cancel button for top-level form", () => {
    renderForm();
    expect(screen.queryByRole("button", { name: "Cancelar" })).not.toBeInTheDocument();
  });

  it("renders cancel button when onCancel is provided", () => {
    renderForm({ onCancel: () => {} });
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeInTheDocument();
  });
});
