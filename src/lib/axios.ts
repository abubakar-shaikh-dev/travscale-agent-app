// Axios
import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

// Lib
import { useAuthStore } from "@/lib/auth-store";

const API_URL = import.meta.env.VITE_API_URL || "https://api.travscale.com";

// Minimal envelope types used by the interceptor. Kept local (instead of
// importing from a feature) so the `lib` layer never depends on a feature.
interface ApiErrorBody {
  success: false;
  message: string;
  error: {
    code: string;
    details: unknown[] | null;
  };
  meta: {
    timestamp: string;
    request_id: string;
    path?: string;
  };
}

interface RefreshResponseBody {
  success: true;
  message: string;
  data: {
    access_token: string;
    refresh_token: string;
  };
  meta: {
    timestamp: string;
    request_id: string;
  };
}

// Public, side-effect-free instance used only for the refresh-token call so
// the interceptor can never recurse into itself.
const bareAxios = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

export const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

declare module "axios" {
  interface InternalAxiosRequestConfig {
    _retried?: boolean;
  }
}

const AUTH_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh-token",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify-email",
  "/auth/resend-verification-link",
  "/auth/logout",
];

function isAuthPath(url: string | undefined): boolean {
  if (!url) return false;
  return AUTH_PATHS.some((p) => url.includes(p));
}

function redirectToLogin(): void {
  if (
    typeof window !== "undefined" &&
    !window.location.pathname.startsWith("/auth")
  ) {
    window.location.assign("/auth/login");
  }
}

// --- Silent refresh plumbing -------------------------------------------------

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function settleQueue(token: string | null, error: unknown): void {
  failedQueue.forEach((pending) => {
    if (error) pending.reject(error);
    else pending.resolve(token as string);
  });
  failedQueue = [];
}

async function refreshAccessToken(): Promise<string> {
  const { refresh_token, setTokens } = useAuthStore.getState();
  if (!refresh_token) throw new Error("No refresh token available");
  const response = await bareAxios.post<RefreshResponseBody>(
    "/auth/refresh-token",
    { refresh_token }
  );
  const session = response.data.data;
  setTokens(session);
  return session.access_token;
}

// --- Interceptors ------------------------------------------------------------

axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().access_token;
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retried?: boolean })
      | undefined;

    const status = error.response?.status;
    const url = originalRequest?.url;

    // Only attempt a silent refresh on a 401 from a protected (non-auth)
    // endpoint, and only once per request.
    if (
      status !== 401 ||
      !originalRequest ||
      originalRequest._retried ||
      isAuthPath(url)
    ) {
      return Promise.reject(error);
    }

    if (!useAuthStore.getState().refresh_token) {
      useAuthStore.getState().clear();
      redirectToLogin();
      return Promise.reject(error);
    }

    // If a refresh is already in flight, wait on it instead of stacking calls.
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            originalRequest._retried = true;
            resolve(axiosInstance.request(originalRequest));
          },
          reject,
        });
      });
    }

    isRefreshing = true;
    try {
      const newToken = await refreshAccessToken();
      settleQueue(newToken, null);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      originalRequest._retried = true;
      return axiosInstance.request(originalRequest);
    } catch (refreshError) {
      settleQueue(null, refreshError);
      useAuthStore.getState().clear();
      redirectToLogin();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
