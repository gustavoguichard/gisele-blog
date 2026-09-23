import { useState, useEffect } from "react";
import { Form, href, useLocation } from "react-router";

function SearchIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

export function SearchToggle() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, location.search]);

  return (
    <div className="relative w-9 h-9 shrink-0">
      {isOpen ? (
        <Form
          method="get"
          action={href("/busca")}
          role="search"
          className="absolute top-0 right-0 h-9 w-[min(18rem,calc(100vw-2rem))] flex items-center rounded border border-primary bg-bg shadow-sm z-10"
          onKeyDown={(event) => {
            if (event.key === "Escape") setIsOpen(false);
          }}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false);
          }}
        >
          <input
            type="search"
            name="q"
            autoFocus
            autoComplete="off"
            placeholder="Buscar no blog…"
            aria-label="Buscar no blog"
            className="flex-1 min-w-0 h-full bg-transparent pl-3 pr-1 font-sans text-sm text-text placeholder:text-text-muted outline-none"
          />
          <button
            type="submit"
            className="w-9 h-9 flex items-center justify-center text-accent hover:text-primary transition-colors"
            aria-label="Buscar"
          >
            <SearchIcon />
          </button>
        </Form>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded border border-border-dark text-accent hover:border-primary transition-colors"
          aria-label="Abrir busca"
        >
          <SearchIcon />
        </button>
      )}
    </div>
  );
}
