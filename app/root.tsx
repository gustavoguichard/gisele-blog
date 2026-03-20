import {
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigation,
} from "react-router";
import { GoldBar } from "./components/decorative";
import "./styles/tailwind.css";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;1,400&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <Meta />
        <Links />
      </head>
      <body className="bg-bg text-text font-serif antialiased">
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

      <header className="border-b border-border bg-bg/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <NavLink to="/" className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
              Gisele de Menezes
            </NavLink>

            <nav className="flex items-center gap-2 font-sans text-sm">
              <NavLink
                to="/blog"
                className={({ isActive }) =>
                  `px-5 py-2 rounded border transition-colors ${
                    isActive
                      ? "border-primary bg-primary text-white font-semibold"
                      : "border-border-dark text-primary font-semibold hover:border-primary"
                  }`
                }
              >
                Blog
              </NavLink>
              <NavLink
                to="/sobre"
                className={({ isActive }) =>
                  `px-5 py-2 rounded border transition-colors ${
                    isActive
                      ? "border-primary bg-primary text-white font-semibold"
                      : "border-border-dark text-primary font-semibold hover:border-primary"
                  }`
                }
              >
                Sobre
              </NavLink>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-bg-warm mt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col items-center gap-4">
            <h3 className="font-bold text-primary text-lg">Gisele de Menezes</h3>
            <p className="text-sm text-text-muted text-center leading-relaxed max-w-md italic">
              Terapeuta holística, praticante de Ayurveda, massoterapeuta e escritora.
            </p>
            <nav className="flex gap-6 text-sm font-sans">
              <NavLink to="/blog" className="text-text-muted hover:text-primary transition-colors">
                Blog
              </NavLink>
              <NavLink to="/sobre" className="text-text-muted hover:text-primary transition-colors">
                Sobre
              </NavLink>
              <NavLink
                to="/depoimentos"
                className="text-text-muted hover:text-primary transition-colors"
              >
                Depoimentos
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
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <h1 className="text-3xl font-bold text-primary mb-4">Algo deu errado</h1>
      <p className="text-text-muted mb-6">Desculpe, ocorreu um erro inesperado.</p>
      <a
        href="/"
        className="inline-block px-6 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors font-sans text-sm"
      >
        Voltar ao início
      </a>
    </div>
  );
}
