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
  useRouteError,
  isRouteErrorResponse,
} from "react-router";
import type { Route } from "./+types/root";
import { buttonStyles } from "./components/button";
import { ErrorPage } from "./components/error-page";
import { GoldBar } from "./components/decorative";
import { MobileMenu } from "./components/mobile-menu";
import { ThemeToggle } from "./components/theme-toggle";
import { fetchPostByWpId } from "./db/queries.server";
import { resolvePostRoute } from "./lib/wp-redirects";
import { SITE } from "./lib/seo";
import "./styles/tailwind.css";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const wpId = url.searchParams.get("p");
  if (wpId) {
    const result = await fetchPostByWpId({ wpId: Number(wpId) });
    if (result.success) {
      const route = resolvePostRoute(result.data.type, result.data.slug);
      if (route) {
        throw redirect(route, 301);
      }
    }
  }

  return null;
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(localStorage.getItem("theme")==="dark")document.documentElement.classList.add("dark")}catch(e){}})()`,
          }}
        />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#8b5e34" />
        <link rel="icon" href="/favicon.ico" sizes="16x16" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="alternate" type="application/rss+xml" title={SITE.name} href="/feed.xml" />
        <Meta />
        <Links />
      </head>
      <body className="bg-bg text-text font-serif antialiased transition-colors duration-300 overflow-x-hidden">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const navigation = useNavigation();
  const isNavigating = navigation.state !== "idle";

  return (
    <div className="min-h-screen flex flex-col">
      {isNavigating && (
        <div className="fixed top-0 left-0 right-0 h-0.5 bg-accent z-50 animate-pulse" />
      )}

      <GoldBar />

      <header className="border-b border-border bg-bg/95 backdrop-blur-sm sticky top-0 z-40 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <NavLink
              to={href("/")}
              className="text-xl sm:text-2xl font-bold text-primary tracking-tight"
            >
              Gisele de Menezes
            </NavLink>

            <nav className="hidden md:flex items-center gap-2 font-sans text-sm">
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
                to={href("/trabalhos")}
                className={({ isActive }) =>
                  buttonStyles({
                    variant: isActive ? "primary" : "secondary",
                    size: "md",
                  })
                }
              >
                Trabalhos
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
              <NavLink
                to={href("/contato")}
                className={({ isActive }) =>
                  buttonStyles({
                    variant: isActive ? "primary" : "secondary",
                    size: "md",
                  })
                }
              >
                Contato
              </NavLink>
              <ThemeToggle />
            </nav>

            <MobileMenu
              items={[
                { to: href("/blog"), label: "Blog" },
                { to: href("/trabalhos"), label: "Trabalhos" },
                { to: href("/sobre"), label: "Sobre" },
                { to: href("/contato"), label: "Contato" },
              ]}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 bg-gradient-to-b from-bg-warm to-bg">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-bg-warm mt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col items-center gap-4">
            <p className="font-bold text-primary text-lg">Gisele de Menezes</p>
            <p className="text-sm text-text-muted text-center leading-relaxed max-w-md italic">
              Escritora, terapeuta e praticante de Ayurveda.
            </p>
            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-sans">
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
                to={href("/trabalhos")}
                className="text-text-muted hover:text-primary transition-colors"
              >
                Trabalhos
              </NavLink>
              <NavLink
                to={href("/contato")}
                className="text-text-muted hover:text-primary transition-colors"
              >
                Contato
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
