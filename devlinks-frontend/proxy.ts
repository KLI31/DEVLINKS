import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const COOKIE_BASE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

const IPV4_PATTERN = /^\d{1,3}(\.\d{1,3}){3}$/;
const IPV6_PATTERN = /^[0-9a-fA-F:]+$/;

function sanitizeIp(value: string | null | undefined): string | null {
  const ip = value?.trim();
  if (!ip) return null;

  if (IPV4_PATTERN.test(ip)) {
    const octets = ip.split(".").map(Number);
    return octets.every((octet) => octet >= 0 && octet <= 255) ? ip : null;
  }

  if (ip.includes(":") && IPV6_PATTERN.test(ip)) return ip;

  return null;
}

function safeRedirectTarget(
  raw: string | null,
  requestUrl: string,
): URL {
  const fallback = new URL("/dashboard", requestUrl);
  if (!raw) return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) {
    return fallback;
  }

  try {
    const target = new URL(raw, requestUrl);
    if (target.origin !== new URL(requestUrl).origin) return fallback;
    return target;
  } catch {
    return fallback;
  }
}

// Decode JWT payload and check expiry locally — no network call needed.
function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "==".slice(0, (4 - (base64.length % 4)) % 4);
    const payload = JSON.parse(atob(padded));
    if (typeof payload.exp !== "number") return true;
    return Date.now() / 1000 > payload.exp - 10;
  } catch {
    return true;
  }
}

async function doRefresh(
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string } | null> {
  try {
    const res = await fetch(`${BACKEND}/auth/refresh`, {
      method: "POST",
      headers: { Cookie: `refreshToken=${refreshToken}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.accessToken) return null;
    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken ?? refreshToken,
    };
  } catch {
    return null;
  }
}

function buildResponseWithTokens(
  request: NextRequest,
  newTokens: { accessToken: string; refreshToken: string },
  baseResponse: NextResponse,
): NextResponse {
  // Update request cookie header so server components in this render
  // read the fresh tokens from next/headers instead of the expired ones.
  const existing = request.headers.get("cookie") ?? "";
  const filtered = existing
    .split(";")
    .filter(
      (c) =>
        !c.trim().startsWith("accessToken=") &&
        !c.trim().startsWith("refreshToken="),
    )
    .join(";")
    .trim();

  const updatedCookie = [
    filtered,
    `accessToken=${newTokens.accessToken}`,
    `refreshToken=${newTokens.refreshToken}`,
  ]
    .filter(Boolean)
    .join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("cookie", updatedCookie);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  // Mirror any headers already set on the base response
  baseResponse.headers.forEach((value, key) => {
    if (key.toLowerCase() !== "set-cookie") response.headers.set(key, value);
  });

  response.cookies.set("accessToken", newTokens.accessToken, {
    ...COOKIE_BASE,
    maxAge: 60 * 15,
  });
  response.cookies.set("refreshToken", newTokens.refreshToken, {
    ...COOKIE_BASE,
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Inject real client IP for all API routes so the backend keys rate
  // limiting and analytics on the visitor, not on the proxy hop.
  if (pathname.startsWith("/api/")) {
    const forwarded = request.headers.get("x-forwarded-for");
    const realIp =
      sanitizeIp(forwarded?.split(",")[0]?.trim()) ??
      sanitizeIp(request.headers.get("x-real-ip"));

    const headers = new Headers(request.headers);
    if (realIp) {
      headers.set("X-Client-IP", realIp);
    } else {
      headers.delete("X-Client-IP");
    }
    return NextResponse.next({ request: { headers } });
  }

  const isProtected = pathname.startsWith("/dashboard");
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (!isProtected && !isAuthPage) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  if (isProtected) {
    // Access token is present and not expired — let through without touching cookies.
    if (accessToken && !isTokenExpired(accessToken)) {
      return NextResponse.next();
    }

    if (refreshToken) {
      const newTokens = await doRefresh(refreshToken);
      if (newTokens) {
        return buildResponseWithTokens(request, newTokens, NextResponse.next());
      }
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Auth pages: redirect to dashboard if already authenticated.
  if (isAuthPage) {
    if (accessToken && !isTokenExpired(accessToken)) {
      const redirectTo = request.nextUrl.searchParams.get("redirect");
      return NextResponse.redirect(safeRedirectTarget(redirectTo, request.url));
    }

    if (refreshToken) {
      const newTokens = await doRefresh(refreshToken);
      if (newTokens) {
        const redirectTo = request.nextUrl.searchParams.get("redirect");
        const redirectResponse = NextResponse.redirect(
          safeRedirectTarget(redirectTo, request.url),
        );
        redirectResponse.cookies.set("accessToken", newTokens.accessToken, {
          ...COOKIE_BASE,
          maxAge: 60 * 15,
        });
        redirectResponse.cookies.set("refreshToken", newTokens.refreshToken, {
          ...COOKIE_BASE,
          maxAge: 60 * 60 * 24 * 7,
        });
        return redirectResponse;
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    "/dashboard/:path*",
    "/login",
    "/register",
  ],
};
