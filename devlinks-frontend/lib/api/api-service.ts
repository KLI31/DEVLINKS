const BASE_URL =
  typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
    : "/api";

type RequestOptions = RequestInit & { skipAuth?: boolean };

async function getServerCookieHeader(): Promise<Record<string, string>> {
  if (typeof window !== "undefined") return {};
  const { cookies } = await import("next/headers");
  const store = await cookies();
  const cookieString = store.getAll().map((c) => `${c.name}=${c.value}`).join("; ");
  return cookieString ? { Cookie: cookieString } : {};
}

async function tryRefresh(): Promise<boolean> {
  try {
    const isServer = typeof window === "undefined";
    const url = isServer
      ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/auth/refresh`
      : "/api/auth/refresh";

    const serverCookies = isServer ? await getServerCookieHeader() : {};
    const res = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: serverCookies,
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function request<T>(
  method: string,
  url: string,
  body?: unknown,
  options: RequestOptions = {},
): Promise<T> {
  const { skipAuth: _skipAuth, ...fetchOptions } = options;

  const serverCookies = await getServerCookieHeader();

  const headers: Record<string, string> = {
    ...serverCookies,
    ...((fetchOptions.headers as Record<string, string>) || {}),
  };

  if (body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${BASE_URL}${url}`, {
    ...fetchOptions,
    method,
    mode: "cors",
    credentials: "include",
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401 && !url.includes("/auth/refresh")) {
    const refreshed = await tryRefresh();
    if (refreshed) return request<T>(method, url, body, options);
    throw new Error("Sesión expirada. Por favor inicia sesión de nuevo.");
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message =
      body?.message ?? `Error ${response.status}: ${response.statusText}`;
    throw new Error(message);
  }

  const text = await response.text();
  return (text ? JSON.parse(text) : null) as T;
}

export const apiService = {
  get<T>(url: string, options?: RequestOptions): Promise<T> {
    return request<T>("GET", url, undefined, options);
  },

  post<T>(url: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>("POST", url, body, options);
  },

  patch<T>(url: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>("PATCH", url, body, options);
  },

  put<T>(url: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>("PUT", url, body, options);
  },

  delete<T>(url: string, options?: RequestOptions): Promise<T> {
    return request<T>("DELETE", url, undefined, options);
  },
};

export async function apiCall<T>(
  url: string,
  options: RequestOptions = {},
): Promise<T> {
  const method = options.method || "GET";
  const body =
    options.body && typeof options.body === "string"
      ? JSON.parse(options.body)
      : undefined;
  return request<T>(method, url, body, options);
}
