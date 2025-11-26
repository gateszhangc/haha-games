import fs from "fs";
import path from "path";
import type { ReactNode } from "react";
import "./globals.css";

type AttrMap = Record<string, string>;

const fallbackBodyMarkup = `
<main style="font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; padding: 2rem; line-height: 1.6;">
  <h1 style="font-size: 1.5rem; margin: 0 0 0.5rem;">HaHaGames clone placeholder</h1>
  <p style="margin: 0;">Run <code>npm run fetch</code> and <code>npm run snapshot</code> to pull the live markup into <code>data/</code>.</p>
</main>
`;

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

function readAttributeMeta(): { htmlAttributes: AttrMap; bodyAttributes: AttrMap } {
  const metaPath = path.join(process.cwd(), "data", "markup-meta.json");
  if (!fs.existsSync(metaPath)) {
    return { htmlAttributes: {}, bodyAttributes: {} };
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(metaPath, "utf8"));
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

export default function RootLayout({
  children: _children,
}: Readonly<{ children: ReactNode }>) {
  const headMarkup = readTextFile("data/home-head.html");
  const bodyMarkup = readTextFile("data/home-body.html");
  const { htmlAttributes, bodyAttributes } = readAttributeMeta();

  const htmlProps = mergeAttributes({ lang: "en" }, htmlAttributes);
  const bodyProps = mergeAttributes({}, bodyAttributes);

  return (
    <html {...htmlProps} suppressHydrationWarning>
      <head dangerouslySetInnerHTML={{ __html: headMarkup }} />
      <body
        {...bodyProps}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: bodyMarkup || fallbackBodyMarkup,
        }}
      />
    </html>
  );
}
