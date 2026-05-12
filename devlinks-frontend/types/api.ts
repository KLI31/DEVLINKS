export interface ApiError {
  message: string;
  statusCode: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export interface RequestConfig extends RequestInit {
  skipAuth?: boolean;
}
