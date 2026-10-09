import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A página que você está procurando não existe ou foi movida.
        </p>
        <div className="mt-6">
          <Link
            to="."
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Voltar para o início
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Esta página não carregou
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Algo deu errado do nosso lado. Tente atualizar a página.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Tentar novamente
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Voltar para o início
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Dimensionador Expert — Academia do Eletricista" },
      {
        name: "description",
        content:
          "Dimensionamento de condutores e comandos elétricos industriais por Academia do Eletricista.",
      },
      { property: "og:title", content: "Dimensionador Expert — Academia do Eletricista" },
      {
        property: "og:description",
        content:
          "Dimensionamento de condutores e comandos elétricos industriais por Academia do Eletricista.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "icon", href: "data:image/png;base64,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" },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico?v=7100a9519932", type: "image/x-icon" },
      {
        rel: "stylesheet",
        href: "https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}


function LovableBadgeGuard() {
  useEffect(() => {
    const removeLovableBadge = () => {
      const candidates = document.querySelectorAll<HTMLElement>(
        '#lovable-badge, [data-lovable-badge], [class*="lovable-badge"], a[href*="lovable.dev"], a[href*="lovable.app"]',
      );
      candidates.forEach((element) => {
        const text = (element.textContent || "").toLowerCase();
        const aria = (element.getAttribute("aria-label") || "").toLowerCase();
        const id = (element.id || "").toLowerCase();
        const className = (element.getAttribute("class") || "").toLowerCase();
        const isLovableBadge =
          id.includes("lovable-badge") ||
          className.includes("lovable-badge") ||
          text.includes("made with lovable") ||
          text.includes("feito com lovable") ||
          aria.includes("made with lovable") ||
          aria.includes("feito com lovable");
        if (isLovableBadge) element.remove();
      });
    };
    removeLovableBadge();
    const observer = new MutationObserver(removeLovableBadge);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <LovableBadgeGuard />
      <Outlet />
    </QueryClientProvider>
  );
}
