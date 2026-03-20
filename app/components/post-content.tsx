interface PostContentProps {
  html: string;
}

export function PostContent({ html }: PostContentProps) {
  return (
    <div
      className="prose prose-lg prose-stone max-w-none
        prose-headings:font-serif prose-headings:text-text
        prose-a:text-primary prose-a:no-underline hover:prose-a:underline
        prose-img:rounded-lg prose-figure:my-8
        prose-blockquote:border-primary prose-blockquote:text-text-muted
        prose-p:leading-relaxed"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
