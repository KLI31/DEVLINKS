import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const isProtected = pathname.startsWith("/dashboard");
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isProtected) {
    if (accessToken) return NextResponse.next();

    if (refreshToken) {
      try {
        const res = await fetch(`${BACKEND}/auth/refresh`, {
          method: "POST",
          headers: { Cookie: `refreshToken=${refreshToken}` },
        });
        if (res.ok) {
          const next = NextResponse.next();
          res.headers
            .getSetCookie()
            .forEach((c) => next.headers.append("Set-Cookie", c));
          return next;
        }
      } catch {}
    }

    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthPage && (accessToken || refreshToken)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
