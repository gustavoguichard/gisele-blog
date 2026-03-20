import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
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

describe("CommentThread", () => {
  it("returns null when no comments", () => {
    const { container } = render(<CommentThread comments={[]} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders comment count (singular)", () => {
    render(<CommentThread comments={[makeComment({ id: "1", authorName: "Alice" })]} />);
    expect(screen.getByText("1 comentário")).toBeInTheDocument();
  });

  it("renders comment count (plural)", () => {
    render(
      <CommentThread
        comments={[
          makeComment({ id: "1", authorName: "Alice" }),
          makeComment({ id: "2", authorName: "Bob" }),
        ]}
      />,
    );
    expect(screen.getByText("2 comentários")).toBeInTheDocument();
  });

  it("renders author names", () => {
    render(<CommentThread comments={[makeComment({ id: "1", authorName: "Alice" })]} />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("renders nested replies", () => {
    render(
      <CommentThread
        comments={[
          makeComment({ id: "1", authorName: "Alice" }),
          makeComment({ id: "2", authorName: "Bob", parentId: "1" }),
        ]}
      />,
    );
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("renders comment content as HTML", () => {
    render(<CommentThread comments={[makeComment({ id: "1", content: "<p>Hello world</p>" })]} />);
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });
});
