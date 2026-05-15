import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface AuthResult {
  valid: boolean;
  tokens?: { accessToken: string; refreshToken: string };
  error?: string;
}

async function validateAccessToken(token: string): Promise<AuthResult> {
  try {
    const res = await fetch(`${BACKEND}/auth/me`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (res.ok) {
      return { valid: true };
    }

    if (res.status === 401) {
      return { valid: false, error: "Token expired or invalid" };
    }

    return { valid: false, error: `Unexpected status: ${res.status}` };
  } catch (err) {
    console.error("Token validation error:", err);
    return { valid: true };
  }
}

async function refreshTokens(refreshToken: string): Promise<AuthResult> {
  try {
    const res = await fetch(`${BACKEND}/auth/refresh`, {
      method: "POST",
      headers: { Cookie: `refreshToken=${refreshToken}` },
      cache: "no-store",
    });

    if (!res.ok) {
      return { valid: false, error: `Refresh failed: ${res.status}` };
    }

    const setCookies = res.headers.getSetCookie();
    const cookies: Record<string, string> = {};

    for (const cookie of setCookies) {
      const match = cookie.match(/^(accessToken|refreshToken)=([^;]+)/);
      if (match) {
        cookies[match[1]] = match[2];
      }
    }

    if (!cookies.accessToken) {
      return { valid: false, error: "No access token in refresh response" };
    }

    return {
      valid: true,
      tokens: {
        accessToken: cookies.accessToken,
        refreshToken: cookies.refreshToken || refreshToken,
      },
    };
  } catch (err) {
    console.error("Token refresh error:", err);
    return { valid: false, error: "Network error during refresh" };
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/static/") ||
    pathname.match(/\.(?:ico|png|jpg|jpeg|svg|gif|webp|css|js|woff|woff2)$/)
  ) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  const isProtected = pathname.startsWith("/dashboard");
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isProtected) {
    if (accessToken) {
      const validation = await validateAccessToken(accessToken);
      if (validation.valid) {
        return NextResponse.next();
      }
    }

    if (refreshToken) {
      const refreshResult = await refreshTokens(refreshToken);
      if (refreshResult.valid && refreshResult.tokens) {
        const response = NextResponse.next();

        response.cookies.set("accessToken", refreshResult.tokens.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 15,
        });

        if (refreshResult.tokens.refreshToken !== refreshToken) {
          response.cookies.set(
            "refreshToken",
            refreshResult.tokens.refreshToken,
            {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              path: "/",
              maxAge: 60 * 60 * 24 * 7,
            },
          );
        }

        return response;
      }
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage) {
    if (accessToken) {
      const validation = await validateAccessToken(accessToken);
      if (validation.valid) {
        const redirectTo = request.nextUrl.searchParams.get("redirect");
        return NextResponse.redirect(
          new URL(redirectTo || "/dashboard", request.url),
        );
      }
    }

    if (refreshToken) {
      const refreshResult = await refreshTokens(refreshToken);
      if (refreshResult.valid) {
        const redirectTo = request.nextUrl.searchParams.get("redirect");
        return NextResponse.redirect(
          new URL(redirectTo || "/dashboard", request.url),
        );
      }
    }
  }

  return NextResponse.next();
}

export const proxyConfig = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/register",
    "/settings/:path*",
    "/analytics/:path*",
  ],
};
