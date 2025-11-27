import fs from "fs";
import path from "path";
import type { ReactNode } from "react";
import { headers } from "next/headers";
import "./globals.css";

type AttrMap = Record<string, string>;

type PageSource = {
  headPath: string;
  bodyPath: string;
  metaPath: string;
  fallbackBody?: string;
};

const fallbackBodyMarkup = `
<main style="font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; padding: 2rem; line-height: 1.6;">
  <h1 style="font-size: 1.5rem; margin: 0 0 0.5rem;">HaHaGames clone placeholder</h1>
  <p style="margin: 0;">Run <code>npm run fetch</code> (with the appropriate <code>--url</code>/<code>--prefix</code>) and <code>npm run snapshot</code> to pull the live markup into <code>data/</code>.</p>
</main>
`;

const PAGE_SOURCES: Record<string, PageSource> = {
  "/": {
    headPath: "data/home-head.html",
    bodyPath: "data/home-body.html",
    metaPath: "data/home-meta.json",
  },
  "/coming-soon": {
    headPath: "data/home-head.html",
    bodyPath: "data/game-fallback-body.html",
    metaPath: "data/home-meta.json",
  },
  "/game/a-shedletsky-pov": {
    headPath: "data/a-shedletsky-pov-head.html",
    bodyPath: "data/a-shedletsky-pov-body.html",
    metaPath: "data/a-shedletsky-pov-meta.json",
  },
};

const FALLBACK_GAME_PAGE: PageSource = {
  headPath: PAGE_SOURCES["/"].headPath,
  bodyPath: "data/game-fallback-body.html",
  metaPath: PAGE_SOURCES["/"].metaPath,
};

function readTextFile(relativePath: string): string {
  const fullPath = path.join(process.cwd(), relativePath);
  if (!fs.existsSync(fullPath)) {
    return "";
  }

  try {
    return fs.readFileSync(fullPath, "utf8");
  } catch {
    return "";
  }
}

function normalizeAttributes(value: unknown): AttrMap {
  if (!value || typeof value !== "object") {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, string>).map(([key, attrValue]) => [
      key,
      String(attrValue),
    ]),
  );
}

function readAttributeMeta(metaPath: string): { htmlAttributes: AttrMap; bodyAttributes: AttrMap } {
  const fullPath = path.join(process.cwd(), metaPath);
  if (!fs.existsSync(fullPath)) {
    return { htmlAttributes: {}, bodyAttributes: {} };
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(fullPath, "utf8"));
    return {
      htmlAttributes: normalizeAttributes(parsed.htmlAttributes),
      bodyAttributes: normalizeAttributes(parsed.bodyAttributes),
    };
  } catch {
    return { htmlAttributes: {}, bodyAttributes: {} };
  }
}

function mergeAttributes(defaults: AttrMap, attrs: AttrMap): AttrMap {
  return { ...defaults, ...attrs };
}

function normalizePathname(pathname: string | null | undefined): string {
  if (!pathname) return "/";
  if (pathname === "/") return "/";
  return pathname.endsWith("/") ? pathname.slice(0, -1) || "/" : pathname;
}

function resolvePageSource(pathname: string): PageSource {
  const normalized = normalizePathname(pathname);
  if (PAGE_SOURCES[normalized]) {
    return PAGE_SOURCES[normalized];
  }

  if (normalized.startsWith("/game/")) {
    return FALLBACK_GAME_PAGE;
  }

  return PAGE_SOURCES["/"];
}

async function getRequestPathname(): Promise<string> {
  const headerList = await headers();
  return (
    headerList.get("x-pathname") ||
    headerList.get("x-matched-path") ||
    headerList.get("x-invoke-path") ||
    "/"
  );
}

export default async function RootLayout({
  children: _children,
}: Readonly<{ children: ReactNode }>) {
  const pathname = await getRequestPathname();
  const source = resolvePageSource(pathname);

  const headMarkup = readTextFile(source.headPath);
  const bodyMarkup = readTextFile(source.bodyPath);
  const { htmlAttributes, bodyAttributes } = readAttributeMeta(source.metaPath);

  const htmlProps = mergeAttributes({ lang: "en" }, htmlAttributes);
  const bodyProps = mergeAttributes({}, bodyAttributes);
  const resolvedBody = bodyMarkup || source.fallbackBody || fallbackBodyMarkup;

  return (
    <html {...htmlProps} suppressHydrationWarning>
      <head dangerouslySetInnerHTML={{ __html: headMarkup }} />
      <body
        {...bodyProps}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: resolvedBody }}
      />
    </html>
  );
}
