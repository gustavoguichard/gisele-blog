import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { ErrorPage } from "./error-page";

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("ErrorPage", () => {
  const defaultProps = {
    title: "Não encontrado",
    message: "A página não existe.",
    linkHref: "/home",
    linkText: "Voltar",
  };

  it("renders title", () => {
    renderWithRouter(<ErrorPage {...defaultProps} />);
    expect(screen.getByRole("heading", { name: "Não encontrado" })).toBeInTheDocument();
  });

  it("renders message", () => {
    renderWithRouter(<ErrorPage {...defaultProps} />);
    expect(screen.getByText("A página não existe.")).toBeInTheDocument();
  });

  it("renders link with correct href and text", () => {
    renderWithRouter(<ErrorPage {...defaultProps} />);
    const link = screen.getByText("Voltar");
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute("href", "/home");
  });

  it("renders with different props", () => {
    renderWithRouter(
      <ErrorPage
        title="Erro"
        message="Algo deu errado"
        linkHref="/blog"
        linkText="Ir para o blog"
      />,
    );
    expect(screen.getByText("Erro")).toBeInTheDocument();
    expect(screen.getByText("Algo deu errado")).toBeInTheDocument();
    expect(screen.getByText("Ir para o blog").closest("a")).toHaveAttribute("href", "/blog");
  });
});
