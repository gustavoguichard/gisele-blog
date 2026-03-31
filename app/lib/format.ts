const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatDate(date: Date | string | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return dateFormatter.format(d);
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

export function truncate(text: string, maxLength: number = 160): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

export function extractFirstParagraphs(html: string, count: number = 2): string {
  const matches = html.match(/<p[^>]*>.*?<\/p>/gs);
  if (!matches) return "";
  return matches.slice(0, count).join("");
}

export interface ContentCardData {
  slug: string;
  title: string;
  excerpt: string | null;
  featuredImage: string | null;
  publishedAt?: Date | string | null;
}

export function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function hideOnImgError(e: React.SyntheticEvent<HTMLImageElement>) {
  e.currentTarget.style.display = "none";
}

export function hideParentOnImgError(e: React.SyntheticEvent<HTMLImageElement>) {
  (e.currentTarget.parentElement as HTMLElement).style.display = "none";
}
