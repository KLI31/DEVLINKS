import { type NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function GET(request: NextRequest) {
  // Read real client IP forwarded by the reverse proxy
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp =
    forwardedFor?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "";

  const cookieHeader = request.headers.get("cookie") ?? "";

  try {
    const upstream = await fetch(
      `${BACKEND}/user/me/location-suggestion`,
      {
        headers: {
          ...(cookieHeader && { Cookie: cookieHeader }),
          ...(realIp && {
            "X-Forwarded-For": realIp,
            "X-Real-IP": realIp,
          }),
        },
      },
    );

    const data = await upstream.json().catch(() => null);
    return NextResponse.json(
      data ?? { city: null, country: null, countryCode: null, formatted: null },
      { status: upstream.ok ? 200 : upstream.status },
    );
  } catch {
    return NextResponse.json(
      { city: null, country: null, countryCode: null, formatted: null },
      { status: 500 },
    );
  }
}
