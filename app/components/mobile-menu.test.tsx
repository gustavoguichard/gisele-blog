import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { MobileMenu } from "./mobile-menu";

const items = [
  { to: "/blog", label: "Blog" },
  { to: "/sobre", label: "Sobre" },
  { to: "/contato", label: "Contato" },
];

function renderMenu(menuItems = items) {
  const Stub = createRoutesStub([{ path: "/", Component: () => <MobileMenu items={menuItems} /> }]);
  return render(<Stub initialEntries={["/"]} />);
}

describe("MobileMenu", () => {
  it("renders the toggle button", () => {
    renderMenu();
    expect(screen.getByRole("button", { name: "Abrir menu" })).toBeInTheDocument();
  });

  it("does not show nav links before opening", () => {
    renderMenu();
    expect(screen.queryByRole("link", { name: "Blog" })).not.toBeInTheDocument();
  });

  it("shows nav links after clicking toggle", () => {
    renderMenu();
    fireEvent.click(screen.getByRole("button", { name: "Abrir menu" }));
    expect(screen.getByRole("link", { name: "Blog" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sobre" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Contato" })).toBeInTheDocument();
  });

  it("updates aria-label and aria-expanded when open", () => {
    renderMenu();
    const button = screen.getByRole("button", { name: "Abrir menu" });
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-label", "Fechar menu");
    expect(button).toHaveAttribute("aria-expanded", "true");
  });

  it("closes menu on second toggle click", () => {
    renderMenu();
    const button = screen.getByRole("button", { name: "Abrir menu" });
    fireEvent.click(button);
    fireEvent.click(screen.getByRole("button", { name: "Fechar menu" }));
    expect(screen.queryByRole("link", { name: "Blog" })).not.toBeInTheDocument();
  });

  it("renders nav links with correct hrefs", () => {
    renderMenu();
    fireEvent.click(screen.getByRole("button", { name: "Abrir menu" }));
    expect(screen.getByRole("link", { name: "Blog" })).toHaveAttribute("href", "/blog");
    expect(screen.getByRole("link", { name: "Sobre" })).toHaveAttribute("href", "/sobre");
  });

  it("renders with no items", () => {
    renderMenu([]);
    fireEvent.click(screen.getByRole("button", { name: "Abrir menu" }));
    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });
});
