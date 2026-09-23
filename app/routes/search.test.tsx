import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import type { Route } from "./+types/search";
import Search from "./search";
import type { SearchResult } from "~/business/search.server";

const work: SearchResult = {
  type: "work",
  id: "w1",
  slug: "taro-egipcio",
  title: "Tarô Egípcio",
  featuredImage: null,
  publishedAt: null,
  snippet: "Um sistema de conhecimento.",
};

const post: SearchResult = {
  type: "post",
  id: "p1",
  slug: "arcanos-maiores",
  title: "Arcanos Maiores do Tarot",
  featuredImage: null,
  publishedAt: new Date("2008-11-09T12:00:00Z"),
  snippet: "…estudos com o tarot egípcio…",
};

function renderSearch(loaderData: { query: string; results: SearchResult[] }) {
  const Stub = createRoutesStub([
    {
      path: "/busca",
      Component(props) {
        return Search(props as Route.ComponentProps);
      },
      loader: () => loaderData,
    },
  ]);
  return render(<Stub initialEntries={["/busca"]} />);
}

describe("Search page", () => {
  it("asks for a longer query when none is given", async () => {
    renderSearch({ query: "", results: [] });
    expect(await screen.findByRole("heading", { name: "Buscar no blog" })).toBeInTheDocument();
    expect(screen.getByText(/pelo menos 2 caracteres/)).toBeInTheDocument();
  });

  it("shows an empty state when nothing matches", async () => {
    renderSearch({ query: "xyz", results: [] });
    expect(await screen.findByText("Nenhum resultado encontrado.")).toBeInTheDocument();
    expect(screen.getByText(/verifique a grafia/)).toBeInTheDocument();
  });

  it("lists trabalhos above publicações with a summary", async () => {
    renderSearch({ query: "tarô", results: [post, work] });
    expect(await screen.findByText("1 trabalho e 1 publicação.")).toBeInTheDocument();

    const sections = screen.getAllByRole("region");
    expect(sections.map((section) => section.getAttribute("aria-labelledby"))).toEqual([
      "busca-trabalhos",
      "busca-publicacoes",
    ]);
    expect(screen.getByRole("link", { name: /Tarô Egípcio/ })).toHaveAttribute(
      "href",
      "/trabalhos/taro-egipcio",
    );
    expect(screen.getByRole("link", { name: /Arcanos Maiores/ })).toHaveAttribute(
      "href",
      "/blog/arcanos-maiores",
    );
  });

  it("keeps the query in the refine form", async () => {
    renderSearch({ query: "tarô", results: [] });
    expect(await screen.findByRole("searchbox")).toHaveValue("tarô");
  });
});
