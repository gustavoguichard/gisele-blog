import { useFetcher } from "react-router";

export function ThemeToggle({ theme }: { theme: "light" | "dark" }) {
  const fetcher = useFetcher();
  const optimistic = (fetcher.formData?.get("theme") as string) ?? theme;
  const isDark = optimistic === "dark";

  return (
    <fetcher.Form method="post" action="/set-theme">
      <input type="hidden" name="intent" value="toggle-theme" />
      <input type="hidden" name="theme" value={isDark ? "light" : "dark"} />
      <button
        type="submit"
        className="w-9 h-9 flex items-center justify-center rounded border border-border-dark text-accent hover:border-primary transition-colors"
        aria-label={isDark ? "Modo claro" : "Modo escuro"}
      >
        {isDark ? (
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        ) : (
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </button>
    </fetcher.Form>
  );
}
