import { useState } from "react";
import { formatDate, pluralize } from "~/lib/format";
import { CommentForm } from "./comment-form";

interface Comment {
  id: string;
  authorName: string;
  content: string;
  createdAt: Date | string;
  parentId: string | null;
}

interface CommentThreadProps {
  comments: Comment[];
  turnstileSiteKey?: string | null;
}

interface TreeNode extends Comment {
  children: TreeNode[];
}

const MAX_VISUAL_DEPTH = 5;

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

function CommentNode({
  node,
  depth,
  replyingTo,
  setReplyingTo,
  turnstileSiteKey,
}: {
  node: TreeNode;
  depth: number;
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
  turnstileSiteKey?: string | null;
}) {
  const visualDepth = Math.min(depth, MAX_VISUAL_DEPTH);
  return (
    <div className={visualDepth > 0 ? "ml-3 pl-2 sm:ml-6 sm:pl-4 border-l-2 border-accent/20" : ""}>
      <div className="py-4">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-sans font-semibold text-sm text-text">{node.authorName}</span>
          <time className="text-xs font-sans text-text-muted">{formatDate(node.createdAt)}</time>
        </div>
        <div
          className="text-sm text-text-body leading-relaxed"
          dangerouslySetInnerHTML={{ __html: node.content }}
        />
        <button
          type="button"
          onClick={() => setReplyingTo(replyingTo === node.id ? null : node.id)}
          className="mt-2 text-xs font-sans font-semibold text-primary hover:text-primary-dark transition-colors"
        >
          Responder
        </button>
      </div>
      {replyingTo === node.id && (
        <div className="pb-4">
          <CommentForm
            parentId={node.id}
            onCancel={() => setReplyingTo(null)}
            turnstileSiteKey={turnstileSiteKey}
          />
        </div>
      )}
      {node.children.map((child) => (
        <CommentNode
          key={child.id}
          node={child}
          depth={depth + 1}
          replyingTo={replyingTo}
          setReplyingTo={setReplyingTo}
          turnstileSiteKey={turnstileSiteKey}
        />
      ))}
    </div>
  );
}

export function CommentThread({ comments, turnstileSiteKey }: CommentThreadProps) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const tree = buildTree(comments);

  return (
    <section className="mt-12 pt-8 border-t border-border">
      {comments.length > 0 && (
        <>
          <h3 className="text-xl font-bold text-primary-dark mb-6">
            {pluralize(comments.length, "comentário", "comentários")}
          </h3>
          <div className="divide-y divide-border/50">
            {tree.map((node) => (
              <CommentNode
                key={node.id}
                node={node}
                depth={0}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                turnstileSiteKey={turnstileSiteKey}
              />
            ))}
          </div>
        </>
      )}
      {!replyingTo && (
        <div className="mt-8">
          <h4 className="text-lg font-bold text-primary-dark mb-4">Deixe seu comentário</h4>
          <CommentForm turnstileSiteKey={turnstileSiteKey} />
        </div>
      )}
    </section>
  );
}
