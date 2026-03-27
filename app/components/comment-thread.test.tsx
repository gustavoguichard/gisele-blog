import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { buildTree, CommentThread } from "./comment-thread";

function makeComment(overrides: Partial<Parameters<typeof buildTree>[0][0]> & { id: string }) {
  return {
    authorName: "Author",
    content: "Content",
    createdAt: "2024-01-01",
    parentId: null,
    ...overrides,
  };
}

describe("buildTree", () => {
  it("returns empty array for no comments", () => {
    expect(buildTree([])).toEqual([]);
  });

  it("returns all as roots when no parentIds", () => {
    const comments = [
      makeComment({ id: "1", authorName: "A" }),
      makeComment({ id: "2", authorName: "B" }),
    ];
    const tree = buildTree(comments);
    expect(tree).toHaveLength(2);
    expect(tree[0].id).toBe("1");
    expect(tree[1].id).toBe("2");
    expect(tree[0].children).toEqual([]);
    expect(tree[1].children).toEqual([]);
  });

  it("nests children under parents", () => {
    const comments = [makeComment({ id: "1" }), makeComment({ id: "2", parentId: "1" })];
    const tree = buildTree(comments);
    expect(tree).toHaveLength(1);
    expect(tree[0].children).toHaveLength(1);
    expect(tree[0].children[0].id).toBe("2");
  });

  it("handles deeply nested threads", () => {
    const comments = [
      makeComment({ id: "1" }),
      makeComment({ id: "2", parentId: "1" }),
      makeComment({ id: "3", parentId: "2" }),
    ];
    const tree = buildTree(comments);
    expect(tree).toHaveLength(1);
    expect(tree[0].children[0].children[0].id).toBe("3");
  });

  it("treats orphan comments as roots", () => {
    const comments = [makeComment({ id: "1" }), makeComment({ id: "2", parentId: "missing" })];
    const tree = buildTree(comments);
    expect(tree).toHaveLength(2);
  });

  it("handles multiple children under one parent", () => {
    const comments = [
      makeComment({ id: "1" }),
      makeComment({ id: "2", parentId: "1" }),
      makeComment({ id: "3", parentId: "1" }),
    ];
    const tree = buildTree(comments);
    expect(tree).toHaveLength(1);
    expect(tree[0].children).toHaveLength(2);
  });

  it("preserves comment data in tree nodes", () => {
    const comments = [
      makeComment({
        id: "1",
        authorName: "Alice",
        content: "<p>Hello</p>",
        createdAt: "2024-06-15",
      }),
    ];
    const tree = buildTree(comments);
    expect(tree[0].authorName).toBe("Alice");
    expect(tree[0].content).toBe("<p>Hello</p>");
    expect(tree[0].createdAt).toBe("2024-06-15");
  });

  it("handles multiple root-level threads", () => {
    const comments = [
      makeComment({ id: "1" }),
      makeComment({ id: "2", parentId: "1" }),
      makeComment({ id: "3" }),
      makeComment({ id: "4", parentId: "3" }),
    ];
    const tree = buildTree(comments);
    expect(tree).toHaveLength(2);
    expect(tree[0].children).toHaveLength(1);
    expect(tree[1].children).toHaveLength(1);
  });
});

function renderThread(comments: Parameters<typeof CommentThread>[0]["comments"]) {
  const Stub = createRoutesStub([
    { path: "/", Component: () => <CommentThread comments={comments} /> },
  ]);
  return render(<Stub initialEntries={["/"]} />);
}

describe("CommentThread", () => {
  it("renders form even when no comments", () => {
    renderThread([]);
    expect(screen.getByText("Deixe seu comentário")).toBeInTheDocument();
  });

  it("does not render comment count when no comments", () => {
    renderThread([]);
    expect(screen.queryByText(/^\d+ comentário/)).not.toBeInTheDocument();
  });

  it("renders comment count (singular)", () => {
    renderThread([makeComment({ id: "1", authorName: "Alice" })]);
    expect(screen.getByText("1 comentário")).toBeInTheDocument();
  });

  it("renders comment count (plural)", () => {
    renderThread([
      makeComment({ id: "1", authorName: "Alice" }),
      makeComment({ id: "2", authorName: "Bob" }),
    ]);
    expect(screen.getByText("2 comentários")).toBeInTheDocument();
  });

  it("renders author names", () => {
    renderThread([makeComment({ id: "1", authorName: "Alice" })]);
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("renders nested replies", () => {
    renderThread([
      makeComment({ id: "1", authorName: "Alice" }),
      makeComment({ id: "2", authorName: "Bob", parentId: "1" }),
    ]);
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("renders comment content as HTML", () => {
    renderThread([makeComment({ id: "1", content: "<p>Hello world</p>" })]);
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  it("renders reply button on each comment", () => {
    renderThread([
      makeComment({ id: "1", authorName: "Alice" }),
      makeComment({ id: "2", authorName: "Bob" }),
    ]);
    expect(screen.getAllByRole("button", { name: "Responder" })).toHaveLength(2);
  });

  it("always renders top-level comment form", () => {
    renderThread([makeComment({ id: "1" })]);
    expect(screen.getByText("Deixe seu comentário")).toBeInTheDocument();
  });
});
