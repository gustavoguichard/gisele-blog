import {
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  href,
  redirect,
  useNavigation,
  useRouteLoaderData,
  useRouteError,
  isRouteErrorResponse,
} from "react-router";
import type { Route } from "./+types/root";
import { buttonStyles } from "./components/button";
import { ErrorPage } from "./components/error-page";
import { GoldBar } from "./components/decorative";
import { ThemeToggle } from "./components/theme-toggle";
import { getSession, getTheme } from "./sessions.server";
import { fetchPostByWpId } from "./db/queries.server";
import { resolvePostRoute } from "./lib/wp-redirects";
import "./styles/tailwind.css";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const wpId = url.searchParams.get("p");
  if (wpId) {
    const result = await fetchPostByWpId({ wpId: Number(wpId) });
    if (result.success) {
      const route = resolvePostRoute(result.data.postType, result.data.slug);
      if (route) {
        throw redirect(route, 301);
      }
    }
  }

  const session = await getSession(request);
  return { theme: getTheme(session) };
}

export function Layout({ children }: { children: React.ReactNode }) {
  const rootData = useRouteLoaderData<typeof loader>("root");
  const theme = rootData?.theme ?? "light";

  return (
    <html lang="pt-BR" className={theme === "dark" ? "dark" : ""}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#8b5e34" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;1,400&family=Inter:wght@400;500;600&display=swap"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;1,400&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <Meta />
        <Links />
      </head>
      <body className="bg-bg text-text font-serif antialiased transition-colors duration-300">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App({ loaderData }: Route.ComponentProps) {
  const { theme } = loaderData;
  const navigation = useNavigation();
  const isNavigating = navigation.state !== "idle";

  return (
    <div className="min-h-screen flex flex-col">
      {isNavigating && (
        <div className="fixed top-0 left-0 right-0 h-0.5 bg-accent z-50 animate-pulse" />
      )}

      <GoldBar />

      <header className="border-b border-border bg-bg/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <NavLink
              to={href("/")}
              className="text-xl sm:text-2xl font-bold text-primary tracking-tight"
            >
              Gisele de Menezes
            </NavLink>

            <nav className="flex items-center gap-2 font-sans text-sm">
              <NavLink
                to={href("/blog")}
                className={({ isActive }) =>
                  buttonStyles({
                    variant: isActive ? "primary" : "secondary",
                    size: "md",
                  })
                }
              >
                Blog
              </NavLink>
              <NavLink
                to={href("/cursos")}
                className={({ isActive }) =>
                  buttonStyles({
                    variant: isActive ? "primary" : "secondary",
                    size: "md",
                  })
                }
              >
                Cursos
              </NavLink>
              <NavLink
                to={href("/sobre")}
                className={({ isActive }) =>
                  buttonStyles({
                    variant: isActive ? "primary" : "secondary",
                    size: "md",
                  })
                }
              >
                Sobre
              </NavLink>
              <ThemeToggle theme={theme} />
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 bg-gradient-to-b from-bg-warm to-bg">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-bg-warm mt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col items-center gap-4">
            <h3 className="font-bold text-primary text-lg">Gisele de Menezes</h3>
            <p className="text-sm text-text-muted text-center leading-relaxed max-w-md italic">
              Escritora, terapeuta holística e praticante de Ayurveda.
            </p>
            <nav className="flex gap-6 text-sm font-sans">
              <NavLink
                to={href("/blog")}
                className="text-text-muted hover:text-primary transition-colors"
              >
                Blog
              </NavLink>
              <NavLink
                to={href("/sobre")}
                className="text-text-muted hover:text-primary transition-colors"
              >
                Sobre
              </NavLink>
              <NavLink
                to={href("/depoimentos")}
                className="text-text-muted hover:text-primary transition-colors"
              >
                Depoimentos
              </NavLink>
              <NavLink
                to={href("/cursos")}
                className="text-text-muted hover:text-primary transition-colors"
              >
                Cursos
              </NavLink>
            </nav>
          </div>
          <div className="mt-8 pt-6 border-t border-border text-center text-xs text-text-muted font-sans">
            &copy; {new Date().getFullYear()} Gisele de Menezes. Todos os direitos reservados.
          </div>
        </div>
        <GoldBar />
      </footer>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  let title = "Algo deu errado";
  let message = "Desculpe, ocorreu um erro inesperado.";

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      title = "Página não encontrada";
      message = "A página que você procura não existe.";
    } else {
      title = `Erro ${error.status}`;
      message = error.statusText ?? message;
    }
  }

  return (
    <ErrorPage title={title} message={message} linkHref={href("/")} linkText="Voltar ao início" />
  );
}
