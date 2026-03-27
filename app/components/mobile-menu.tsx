import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router";
import { buttonStyles } from "./button";
import { ThemeToggle } from "./theme-toggle";

type NavItem = { to: string; label: string };

export function MobileMenu({ items }: { items: NavItem[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <div className="md:hidden">
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-9 h-9 flex items-center justify-center rounded border border-border-dark text-primary hover:border-primary transition-colors"
          aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {isOpen && (
        <nav className="absolute top-full left-0 right-0 bg-bg border-b border-border shadow-lg z-50">
          <div className="flex flex-col p-4 gap-2">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  buttonStyles({
                    variant: isActive ? "primary" : "secondary",
                    size: "md",
                    className: "text-center",
                  })
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
