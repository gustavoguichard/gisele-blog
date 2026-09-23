import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { SearchToggle } from "./search-toggle";

function renderToggle() {
  const Stub = createRoutesStub([
    { path: "/", Component: SearchToggle },
    { path: "/busca", Component: () => <p>Resultados</p> },
  ]);
  return render(<Stub initialEntries={["/"]} />);
}

describe("SearchToggle", () => {
  it("renders only the toggle button when closed", () => {
    renderToggle();
    expect(screen.getByRole("button", { name: "Abrir busca" })).toBeInTheDocument();
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
  });

  it("opens and focuses the search field on click", () => {
    renderToggle();
    fireEvent.click(screen.getByRole("button", { name: "Abrir busca" }));

    const input = screen.getByRole("searchbox", { name: "Buscar no blog" });
    expect(input).toHaveFocus();
    expect(screen.queryByRole("button", { name: "Abrir busca" })).not.toBeInTheDocument();
  });

  it("closes on Escape", () => {
    renderToggle();
    fireEvent.click(screen.getByRole("button", { name: "Abrir busca" }));
    fireEvent.keyDown(screen.getByRole("searchbox"), { key: "Escape" });

    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Abrir busca" })).toBeInTheDocument();
  });

  it("closes when focus leaves the form", () => {
    renderToggle();
    fireEvent.click(screen.getByRole("button", { name: "Abrir busca" }));
    fireEvent.blur(screen.getByRole("searchbox"), { relatedTarget: document.body });

    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
  });

  it("submits to the search page with the query", async () => {
    renderToggle();
    fireEvent.click(screen.getByRole("button", { name: "Abrir busca" }));
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "ayurveda" } });
    fireEvent.submit(screen.getByRole("search"));

    expect(await screen.findByText("Resultados")).toBeInTheDocument();
  });
});
