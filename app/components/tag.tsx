export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-3 py-1 bg-bg-warm rounded text-xs font-sans text-text-muted">
      {children}
    </span>
  );
}

export function TagList({ tags }: { tags: { id: string; name: string }[] }) {
  if (tags.length === 0) return null;

  return (
    <div className="mt-10 pt-6 border-t border-border">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Tag key={tag.id}>{tag.name}</Tag>
        ))}
      </div>
    </div>
  );
}
