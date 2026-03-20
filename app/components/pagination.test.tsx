import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { Pagination } from "./pagination";

function renderWithRouter(ui: React.ReactElement, initialEntries = ["/"]) {
  return render(<MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>);
}

describe("Pagination", () => {
  it("renders nothing when totalPages is 1", () => {
    const { container } = renderWithRouter(<Pagination currentPage={1} totalPages={1} />);
    expect(container.querySelector("nav")).not.toBeInTheDocument();
  });

  it("renders page links", () => {
    renderWithRouter(<Pagination currentPage={1} totalPages={3} />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("generates path-based URLs with default basePath", () => {
    renderWithRouter(<Pagination currentPage={1} totalPages={3} />);
    const link2 = screen.getByText("2");
    expect(link2).toHaveAttribute("href", "/blog/page/2");
  });

  it("page 1 links to basePath without /page/1", () => {
    renderWithRouter(<Pagination currentPage={2} totalPages={3} />);
    const link1 = screen.getByText("1");
    expect(link1).toHaveAttribute("href", "/blog");
  });

  it("uses custom basePath", () => {
    renderWithRouter(<Pagination currentPage={1} totalPages={3} basePath="/cursos" />);
    const link2 = screen.getByText("2");
    expect(link2).toHaveAttribute("href", "/cursos/page/2");
  });

  it("shows Próxima button when not on last page", () => {
    renderWithRouter(<Pagination currentPage={1} totalPages={3} />);
    expect(screen.getByText("Próxima")).toBeInTheDocument();
  });

  it("hides Próxima on last page", () => {
    renderWithRouter(<Pagination currentPage={3} totalPages={3} />);
    expect(screen.queryByText("Próxima")).not.toBeInTheDocument();
  });

  it("shows Anterior button when not on first page", () => {
    renderWithRouter(<Pagination currentPage={2} totalPages={3} />);
    expect(screen.getByText("Anterior")).toBeInTheDocument();
  });

  it("hides Anterior on first page", () => {
    renderWithRouter(<Pagination currentPage={1} totalPages={3} />);
    expect(screen.queryByText("Anterior")).not.toBeInTheDocument();
  });

  it("shows ellipsis for many pages", () => {
    renderWithRouter(<Pagination currentPage={1} totalPages={20} />);
    expect(screen.getByText("…")).toBeInTheDocument();
  });
});
