import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/auth/signin", "/auth/error", "/manifest.webmanifest", "/sw.js"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes and API auth routes
  if (
    pathname === "/" ||
    publicRoutes.some((route) => pathname.startsWith(route)) ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  // Check for session token cookie
  const sessionToken =
    request.cookies.get("authjs.session-token") ??
    request.cookies.get("__Secure-authjs.session-token");

  if (!sessionToken) {
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
