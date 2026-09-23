const WORD_PATTERN = /([\p{L}\p{N}]+)/u;
const MIN_QUERY_WORD_LENGTH = 2;
const MIN_SUBSTRING_LENGTH = 4;

interface Segment {
  text: string;
  match: boolean;
}

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function trigrams(word: string): Set<string> {
  const padded = `  ${word} `;
  const result = new Set<string>();
  for (let i = 0; i <= padded.length - 3; i++) {
    result.add(padded.slice(i, i + 3));
  }
  return result;
}

function similarity(a: string, b: string): number {
  const left = trigrams(a);
  const right = trigrams(b);
  let common = 0;
  for (const trigram of left) {
    if (right.has(trigram)) common++;
  }
  const union = left.size + right.size - common;
  return union === 0 ? 0 : common / union;
}

function queryWords(query: string): string[] {
  return normalize(query)
    .split(WORD_PATTERN)
    .filter((part, index) => index % 2 === 1 && part.length >= MIN_QUERY_WORD_LENGTH);
}

function wordMatches(word: string, terms: string[], threshold: number): boolean {
  const normalized = normalize(word);
  return terms.some(
    (term) =>
      (term.length >= MIN_SUBSTRING_LENGTH && normalized.includes(term)) ||
      similarity(term, normalized) >= threshold,
  );
}

export function highlightMatches(text: string, query: string, threshold = 0.5): Segment[] {
  const terms = queryWords(query);
  if (terms.length === 0 || text.length === 0) return [{ text, match: false }];

  const segments: Segment[] = [];
  const parts = text.split(WORD_PATTERN);
  parts.forEach((part, index) => {
    if (part.length === 0) return;
    const isWord = index % 2 === 1;
    const match = isWord && wordMatches(part, terms, threshold);
    const last = segments[segments.length - 1];
    if (last && last.match === match) {
      last.text += part;
    } else {
      segments.push({ text: part, match });
    }
  });
  return segments;
}

export function snippetAround(text: string, query: string, radius = 110): string | null {
  const segments = highlightMatches(text, query);
  let offset = 0;
  let matchStart = -1;
  let matchEnd = -1;
  for (const segment of segments) {
    if (segment.match) {
      matchStart = offset;
      matchEnd = offset + segment.text.length;
      break;
    }
    offset += segment.text.length;
  }
  if (matchStart === -1) return null;

  let start = Math.max(0, matchStart - radius);
  let end = Math.min(text.length, matchEnd + radius);
  if (start > 0) {
    const boundary = text.indexOf(" ", start);
    if (boundary !== -1 && boundary < matchStart) start = boundary + 1;
  }
  if (end < text.length) {
    const boundary = text.lastIndexOf(" ", end);
    if (boundary > matchEnd) end = boundary;
  }

  const prefix = start > 0 ? "…" : "";
  const suffix = end < text.length ? "…" : "";
  return `${prefix}${text.slice(start, end).trim()}${suffix}`;
}
