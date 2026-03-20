import { Link, useSearchParams } from "react-router";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const [searchParams] = useSearchParams();

  if (totalPages <= 1) return null;

  function pageUrl(page: number) {
    const params = new URLSearchParams(searchParams);
    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }
    const qs = params.toString();
    return qs ? `?${qs}` : "?";
  }

  return (
    <nav className="flex items-center justify-center gap-2 mt-12 font-sans text-sm">
      {currentPage > 1 && (
        <Link
          to={pageUrl(currentPage - 1)}
          className="px-4 py-2 rounded-lg border border-border hover:bg-bg-warm transition-colors"
        >
          Anterior
        </Link>
      )}

      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
        .reduce<Array<number | "ellipsis">>((acc, p, i, arr) => {
          if (i > 0 && arr[i - 1]! < p - 1) {
            acc.push("ellipsis");
          }
          acc.push(p);
          return acc;
        }, [])
        .map((item, i) =>
          item === "ellipsis" ? (
            <span key={`e-${i}`} className="px-2 text-text-muted">
              …
            </span>
          ) : (
            <Link
              key={item}
              to={pageUrl(item)}
              className={
                item === currentPage
                  ? "px-3 py-2 rounded-lg bg-primary text-white font-semibold"
                  : "px-3 py-2 rounded-lg border border-border hover:bg-bg-warm transition-colors"
              }
            >
              {item}
            </Link>
          ),
        )}

      {currentPage < totalPages && (
        <Link
          to={pageUrl(currentPage + 1)}
          className="px-4 py-2 rounded-lg border border-border hover:bg-bg-warm transition-colors"
        >
          Próxima
        </Link>
      )}
    </nav>
  );
}
