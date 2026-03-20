import { formatDate } from "~/lib/format";

interface Comment {
  id: string;
  authorName: string;
  content: string;
  createdAt: Date | string;
  parentId: string | null;
}

interface CommentThreadProps {
  comments: Comment[];
}

interface TreeNode extends Comment {
  children: TreeNode[];
}

export function buildTree(comments: Comment[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  for (const comment of comments) {
    map.set(comment.id, { ...comment, children: [] });
  }

  for (const comment of comments) {
    const node = map.get(comment.id)!;
    if (comment.parentId) {
      const parent = map.get(comment.parentId);
      if (parent) {
        parent.children.push(node);
        continue;
      }
    }
    roots.push(node);
  }

  return roots;
}

function CommentNode({ node, depth }: { node: TreeNode; depth: number }) {
  return (
    <div className={depth > 0 ? "ml-6 border-l-2 border-accent/20 pl-4" : ""}>
      <div className="py-4">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-sans font-semibold text-sm text-text">{node.authorName}</span>
          <time className="text-xs font-sans text-text-muted">{formatDate(node.createdAt)}</time>
        </div>
        <div
          className="text-sm text-text-body leading-relaxed"
          dangerouslySetInnerHTML={{ __html: node.content }}
        />
      </div>
      {node.children.map((child) => (
        <CommentNode key={child.id} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export function CommentThread({ comments }: CommentThreadProps) {
  if (comments.length === 0) return null;

  const tree = buildTree(comments);

  return (
    <section className="mt-12 pt-8 border-t border-border">
      <h3 className="text-xl font-bold text-primary-dark mb-6">
        {comments.length} {comments.length === 1 ? "comentário" : "comentários"}
      </h3>
      <div className="divide-y divide-border/50">
        {tree.map((node) => (
          <CommentNode key={node.id} node={node} depth={0} />
        ))}
      </div>
    </section>
  );
}
