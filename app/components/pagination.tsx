import { Link } from "react-router";
import { buttonStyles } from "./button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath?: string;
}

export function Pagination({ currentPage, totalPages, basePath = "/blog" }: PaginationProps) {
  if (totalPages <= 1) return null;

  function pageUrl(page: number) {
    return page <= 1 ? basePath : `${basePath}/page/${page}`;
  }

  return (
    <nav className="flex items-center justify-center gap-2 mt-12 font-sans text-sm">
      {currentPage > 1 && (
        <Link
          to={pageUrl(currentPage - 1)}
          className={buttonStyles({ variant: "secondary", size: "sm", className: "px-4" })}
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
              className={buttonStyles({
                variant: item === currentPage ? "primary" : "secondary",
                size: "sm",
              })}
            >
              {item}
            </Link>
          ),
        )}

      {currentPage < totalPages && (
        <Link
          to={pageUrl(currentPage + 1)}
          className={buttonStyles({ variant: "secondary", size: "sm", className: "px-4" })}
        >
          Próxima
        </Link>
      )}
    </nav>
  );
}
