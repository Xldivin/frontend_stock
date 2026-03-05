const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || "http://localhost:4000/api";

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

const buildHeaders = (): HeadersInit => ({
  "Content-Type": "application/json",
});

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

export const api = {
  listProducts: (params?: URLSearchParams) =>
    request<ListProductsResponse>(`/products${params ? `?${params.toString()}` : ""}`),

  reserve: (payload: { productId: string; quantity: number }) =>
    request<ReserveResponse>("/reserve", {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify(payload),
    }),

  checkout: (payload: { reservationId: string }) =>
    request<CheckoutResponse>("/checkout", {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify(payload),
    }),

  listReservations: (params?: URLSearchParams) =>
    request<ListReservationsResponse>(`/reservations${params ? `?${params.toString()}` : ""}`, {
      headers: buildHeaders(),
    }),

  listOrders: (params?: URLSearchParams) =>
    request<ListOrdersResponse>(`/orders${params ? `?${params.toString()}` : ""}`, {
      headers: buildHeaders(),
    }),
};
