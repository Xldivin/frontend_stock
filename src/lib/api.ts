const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || "http://localhost:4000/api";

export type AuthResponse = {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
};

export type Product = {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  totalStock: number;
  availableStock: number;
  createdAt: string;
  updatedAt: string;
};

export type ListProductsResponse = {
  items: Product[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ReserveResponse = {
  reservationId: string;
  expiresAt: string;
  status: "ACTIVE" | "COMPLETED" | "EXPIRED" | "CANCELLED";
};

export type CheckoutResponse = {
  id: string;
  userId: string;
  reservationId: string;
  status: "CONFIRMED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
};

export type Reservation = {
  id: string;
  productId: string;
  quantity: number;
  status: "ACTIVE" | "COMPLETED" | "EXPIRED" | "CANCELLED";
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
};

export type ListReservationsResponse = {
  items: Reservation[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  createdAt: string;
};

export type Order = {
  id: string;
  userId: string;
  reservationId: string;
  status: "CONFIRMED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
};

export type ListOrdersResponse = {
  items: Order[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type ApiErrorPayload = {
  error?: {
    code?: string;
    message?: string;
    details?: {
      formErrors?: string[];
      fieldErrors?: Record<string, string[]>;
    };
  };
};

const buildHeaders = (token?: string): HeadersInit => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const parseApiError = async (response: Response): Promise<string> => {
  try {
    const payload = (await response.json()) as ApiErrorPayload;
    const fallbackMessage = payload.error?.message || `Request failed with status ${response.status}`;
    const details = payload.error?.details;

    if (!details) {
      return fallbackMessage;
    }

    const formErrors = details.formErrors?.filter(Boolean) ?? [];
    const fieldErrors = Object.entries(details.fieldErrors ?? {})
      .flatMap(([field, messages]) => (messages || []).filter(Boolean).map((message) => `${field}: ${message}`));

    const combined = [...formErrors, ...fieldErrors];
    if (combined.length === 0) {
      return fallbackMessage;
    }

    return combined.join(" | ");
  } catch {
    return `Request failed with status ${response.status}`;
  }
};

const request = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  return (await response.json()) as T;
};

type JwtPayload = {
  exp?: number;
};

const parseJwtPayload = (token: string): JwtPayload | null => {
  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) {
      return null;
    }
    const normalized = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(normalized);
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
};

export const api = {
  register: (payload: { name: string; email: string; password: string }) =>
    request<AuthResponse>("/auth/register", {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify(payload),
    }),

  login: (payload: { email: string; password: string }) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify(payload),
    }),

  listProducts: (params?: URLSearchParams) =>
    request<ListProductsResponse>(`/products${params ? `?${params.toString()}` : ""}`),

  reserve: (token: string, payload: { productId: string; quantity: number }) =>
    request<ReserveResponse>("/reserve", {
      method: "POST",
      headers: buildHeaders(token),
      body: JSON.stringify(payload),
    }),

  checkout: (token: string, payload: { reservationId: string }) =>
    request<CheckoutResponse>("/checkout", {
      method: "POST",
      headers: buildHeaders(token),
      body: JSON.stringify(payload),
    }),

  listReservations: (token: string, params?: URLSearchParams) =>
    request<ListReservationsResponse>(`/reservations${params ? `?${params.toString()}` : ""}`, {
      headers: buildHeaders(token),
    }),

  listOrders: (token: string, params?: URLSearchParams) =>
    request<ListOrdersResponse>(`/orders${params ? `?${params.toString()}` : ""}`, {
      headers: buildHeaders(token),
    }),
};

export const authStorage = {
  getToken: () => localStorage.getItem("stock_drop_token"),
  setToken: (token: string) => {
    localStorage.setItem("stock_drop_token", token);
    window.dispatchEvent(new Event("auth-token-changed"));
  },
  clearToken: () => {
    localStorage.removeItem("stock_drop_token");
    window.dispatchEvent(new Event("auth-token-changed"));
  },
  getTokenExpiryMs: () => {
    const token = localStorage.getItem("stock_drop_token");
    if (!token) {
      return null;
    }
    const payload = parseJwtPayload(token);
    if (!payload?.exp) {
      return null;
    }
    return payload.exp * 1000;
  },
  isTokenExpired: () => {
    const expiryMs = authStorage.getTokenExpiryMs();
    if (!expiryMs) {
      return true;
    }
    return Date.now() >= expiryMs;
  },
};
