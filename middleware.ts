import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rewrite /images/svg/* to /assets/images/svg/*
  if (pathname.startsWith("/images/svg/")) {
    const newPath = pathname.replace("/images/svg/", "/assets/images/svg/");
    return NextResponse.rewrite(new URL(newPath, request.url));
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
