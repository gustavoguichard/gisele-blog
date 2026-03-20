interface PostContentProps {
  html: string;
}

export function PostContent({ html }: PostContentProps) {
  return (
    <div
      className="prose prose-lg max-w-none
        prose-p:text-text-body prose-p:leading-8
        prose-headings:text-primary-dark prose-headings:tracking-tight
        prose-a:text-primary prose-a:no-underline prose-a:border-b prose-a:border-accent/30 hover:prose-a:border-primary
        prose-blockquote:border-l-accent prose-blockquote:text-text-muted prose-blockquote:italic
        prose-img:rounded-xl prose-img:border prose-img:border-border
        prose-figure:my-8
        prose-figcaption:text-text-muted prose-figcaption:italic
        prose-strong:text-text
        prose-hr:border-border"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
