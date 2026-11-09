  import {
    isRouteErrorResponse,
    Links,
    Meta,
    NavLink,
    Outlet,
    Scripts,
    ScrollRestoration,
    useLocation,
  } from "react-router";

  import type { Route } from "./+types/root";
  import "./app.css";
  import { Icon } from "./components/icons/Icon";
  import { EditorProvider, useEditorContext } from "./lib/editor-context";

  export const links: Route.LinksFunction = () => [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossOrigin: "anonymous",
    },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
    },
  ];

  function NavigationBar() {
    const location = useLocation();
    const { 
      triggerRandomImage,
      triggerUpload,
      triggerReset,
      triggerToggleSidebar
    } = useEditorContext();
    
    return (
      <header className="fixed inset-x-0 top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
        <nav className="container w-8xl mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <span className="brand-title text-base">Liquid Glass Editor</span>
          </div>
          <div className="flex items-center">
            <div className="hidden md:flex items-center gap-4">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `btn font-medium no-underline ${
                    isActive
                      ? "btn-primary"
                      : "btn-secondary"
                  }`
                }
              >
                <Icon name="home"  />
                Accueil
              </NavLink>
              {/*
                Exemple de condition de route, ici navigation vers "/dashboard" seulement si isLoggedIn est true.
                Remplacez isLoggedIn par la logique/sélecteur/authentification approprié à votre cas.
              */}
              {/* <div className="divider divider-horizontal">{location.pathname}</div> */}
              { !(location.pathname === "/editor") ? (
                <NavLink
                  to="/editor"
                  className={({ isActive }) =>
                    `btn font-medium no-underline ${
                      isActive
                        ? "btn-primary"
                        : "btn-secondary"
                    }`
                  }
                >
                  <Icon name="edit"  />
                  Editeur
                </NavLink>
              ) : (
                <div className=" bg-gray-200 flex items-center justify-center gap-2 p-1.5 px-2 rounded-xl	">
                  
                  <button
                    className={`btn font-medium no-underline btn-secondary`}
                    onClick={triggerRandomImage}
                  >
                    <Icon name="random"  />
                    Aléatoire
                  </button>
                  <button
                    className={`btn font-medium no-underline btn-secondary`}
                    onClick={triggerUpload}
                  >
                    <Icon name="upload"  />
                    {/* Importer une image */}
                  </button>
                  <button
                    className={`btn font-medium no-underline btn-secondary`}
                    onClick={triggerReset}
                  >
                    <Icon name="reset"  />
                    {/* Réinitialiser */}
                  </button>
                  <button
                    className={`btn font-medium no-underline btn-secondary`}
                    onClick={triggerToggleSidebar}
                  >
                    <Icon name="panel"  />
                    {/* Paramètres */}
                  </button>
                </div>
              )}
              <NavLink
                to="/contact"
                end
                className={({ isActive }) =>
                  `btn font-medium no-underline ${
                    isActive
                      ? "btn-primary"
                      : "btn-secondary"
                  }`
                }
              >
                <Icon name="contact"  />
                Contact
              </NavLink>
            </div>
            
          </div>
        </nav>
      </header>
    );
  }

  export function Layout({ children }: { children: React.ReactNode }) {
    return (
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <Meta />
          <Links />
        </head>
        <body className="flex flex-col gap-0 h-screen" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1551384963-cccb0b7ed94b?q=80&w=3247&auto=format&fit=crop')` }}>
          <EditorProvider>
            <NavigationBar />
            <div className="flex-1 flex flex-col justify-space-around items-center bg-transparent ">
            {/* <div className="flex-1 flex flex-col justify-space-around items-center bg-amber-50 "> */}
              {children}

              <div className={`liquid-glass`}>
                <div className="liquid-content">
                  children
                </div>
                <div className="liquid-overlay"></div>
              </div>
            </div>
            <footer className="border-t border-gray-200 bg-white shadow-sm">
              <nav className="container w87xl mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-6">
                  <span className="brand-title text-base">Liquid Glass Editor</span>
                </div>
                  {/* Credits */}
                <div className="">
                  Created by{' '}
                  <a 
                    href="https://bresom.vercel.app" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sidebar-foreground hover:underline"
                  >
                    David Abraham
                  </a>
                </div>
              </nav>
            </footer>
            <ScrollRestoration />
            <Scripts />
            {/* Scripts pour liquidGL */}
            <script
              src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"
              defer
            />
          </EditorProvider>
        </body>
      </html>
    );
  }

  function PageTransition({ children }: { children: React.ReactNode }) {
    const location = useLocation();

    return (
      <div key={location.pathname} className="page-wrapper">
        {children}
      </div>
    );
  }

  export default function App() {
    return (
      <PageTransition>
        <Outlet />
      </PageTransition>
    );
  }

  export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    let message = "Oops!";
    let details = "An unexpected error occurred.";
    let stack: string | undefined;

    if (isRouteErrorResponse(error)) {
      message = error.status === 404 ? "404" : "Error";
      details =
        error.status === 404
          ? "The requested page could not be found."
          : error.statusText || details;
    } else if (import.meta.env.DEV && error && error instanceof Error) {
      details = error.message;
      stack = error.stack;
    }

    return (
      <main className="pt-16 p-4 container mx-auto">
        <h1>{message}</h1>
        <p>{details}</p>
        {stack && (
          <pre className="w-full p-4 overflow-x-auto">
            <code>{stack}</code>
          </pre>
        )}
      </main>
    );
  }
