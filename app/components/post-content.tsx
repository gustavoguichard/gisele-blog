interface PostContentProps {
  html: string;
}

export function PostContent({ html }: PostContentProps) {
  return (
    <div
      className="prose sm:prose-lg max-w-none break-words overflow-hidden
        prose-p:text-text-body prose-p:leading-[1.9] prose-p:[text-wrap:pretty]
        prose-headings:text-primary prose-headings:tracking-tight prose-headings:font-bold prose-headings:leading-snug
        prose-h2:mt-12 prose-h2:mb-4
        prose-h3:mt-8 prose-h3:mb-3
        prose-a:text-primary prose-a:no-underline prose-a:border-b prose-a:border-accent/30 hover:prose-a:border-primary
        prose-blockquote:border-l-accent prose-blockquote:text-text-muted prose-blockquote:italic prose-blockquote:pl-6 prose-blockquote:my-8 prose-blockquote:leading-relaxed
        prose-img:rounded-xl prose-img:border prose-img:border-border prose-img:w-full prose-img:h-auto
        prose-figure:my-10
        prose-figcaption:text-text-muted prose-figcaption:italic prose-figcaption:text-center
        prose-li:text-text-body prose-li:leading-7 prose-li:my-1
        prose-ul:my-6 prose-ol:my-6
        prose-strong:text-text
        prose-hr:border-border prose-hr:my-10"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
