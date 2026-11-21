import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { baseurl } from "../Constant/Base";

/**
 * One shared HTTP client for the whole app.
 *  - attaches the right token automatically (shopper, guest, seller or admin)
 *  - creates a guest session on demand so visitors can use cart & wishlist
 *  - retries once when the free-tier backend is waking up (cold start)
 *  - de-duplicates and briefly caches public catalog GETs for snappy navigation
 *  - sends expired seller/admin sessions back to their login page
 */

const COLD_START_TIMEOUT = 45000;

export const api = axios.create({
  baseURL: baseurl,
  timeout: COLD_START_TIMEOUT,
});

/* ----------------------------------------------------------- device id */

export const getDeviceId = (): string => {
  try {
    let id = localStorage.getItem("deviceId");
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? `device_${crypto.randomUUID()}`
          : `device_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      localStorage.setItem("deviceId", id);
    }
    return id;
  } catch {
    return "device_unavailable";
  }
};

const read = (key: string): string | null => {
  try {
    const v = localStorage.getItem(key);
    return v && v !== "null" && v !== "undefined" ? v : null;
  } catch {
    return null;
  }
};

/* ------------------------------------------------------------- guests */

let guestPromise: Promise<string | null> | null = null;

const ensureGuestToken = async (): Promise<string | null> => {
  const existing = read("guestToken");
  if (existing) return existing;
  if (!guestPromise) {
    guestPromise = axios
      .post(`${baseurl}/guest`, { deviceId: getDeviceId() }, { timeout: COLD_START_TIMEOUT })
      .then((res) => {
        const token = res.data?.token as string | undefined;
        if (token) localStorage.setItem("guestToken", token);
        return token || null;
      })
      .catch(() => null)
      .finally(() => {
        guestPromise = null;
      });
  }
  return guestPromise;
};

/** Routes that need a shopper identity (signed-in or guest). */
const SHOPPER_ROUTE = /^\/(cart|wishlist|order|orders|payment|profile|logout)(\/|$|\?)/;
const pathOf = (url = "") => url.replace(/^https?:\/\/[^/]+/, "").replace(baseurl, "").replace(/^\/api/, "");

const isUsableAuthHeader = (value: unknown) =>
  typeof value === "string" && /^Bearer\s+\S+/.test(value) && !/Bearer\s+(null|undefined)$/.test(value);

/* -------------------------------------------------------- interceptors */

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const path = pathOf(config.url);
  config.headers = config.headers ?? {};
  config.headers["device-id"] = getDeviceId();

  if (isUsableAuthHeader(config.headers.Authorization)) return config;
  delete config.headers.Authorization;

  let token: string | null = null;
  if (path.startsWith("/admin/")) token = read("adminToken");
  else if (path.startsWith("/seller/")) token = read("sellerToken");
  else if (SHOPPER_ROUTE.test(path)) {
    token = read("token");
    if (!token && !/^\/(profile|logout)/.test(path)) token = await ensureGuestToken();
  }

  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean; _guestRetried?: boolean };

const redirectTo = (path: string) => {
  if (!window.location.pathname.startsWith(path)) window.location.assign(path);
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined;
    if (!config) return Promise.reject(error);
    const path = pathOf(config.url);
    const status = error.response?.status;

    // Free-tier backend waking up: retry idempotent requests once.
    const isNetworkOrTimeout = !error.response || error.code === "ECONNABORTED" || status === 502 || status === 504;
    if (isNetworkOrTimeout && !config._retried && (config.method || "get").toLowerCase() === "get") {
      config._retried = true;
      await new Promise((r) => setTimeout(r, 1500));
      return api(config);
    }

    if (status === 401) {
      const sentToken = String(config.headers?.Authorization || "").replace(/^Bearer\s+/, "");

      // Stale guest session -> get a fresh one and retry once.
      if (sentToken && sentToken === read("guestToken") && !config._guestRetried) {
        localStorage.removeItem("guestToken");
        config._guestRetried = true;
        delete config.headers.Authorization;
        return api(config);
      }

      if (path.startsWith("/admin/") && !path.startsWith("/admin/login")) {
        localStorage.removeItem("adminToken");
        redirectTo("/admin/login");
      } else if (path.startsWith("/seller/") && !/^\/seller\/(login|register)/.test(path)) {
        localStorage.removeItem("sellerToken");
        redirectTo("/seller/login");
      } else if (sentToken && sentToken === read("token")) {
        // Shopper session expired: fall back to browsing as a guest.
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        localStorage.removeItem("user");
        window.dispatchEvent(new CustomEvent("auth:changed"));
      }
    }
    return Promise.reject(error);
  }
);

/* ------------------------------------------------- public GET caching */

// Public catalog GETs are cached for a minute and identical in-flight requests
// share one network call. Implemented as an adapter so every api.get() benefits.
const CACHEABLE = /^\/(products|get-product|product|get-related|all-categories|categories|get-category|get-subcategories|subcategories|get-subcategory|subcategory|get-type|types|sellers|get-sellers)(\/|\?|$)/;
const CACHE_TTL = 60 * 1000;
const responseCache = new Map<string, { at: number; response: AxiosResponse }>();
const inflight = new Map<string, Promise<AxiosResponse>>();
const baseAdapter = axios.getAdapter(axios.defaults.adapter);

api.defaults.adapter = (config) => {
  const method = (config.method || "get").toLowerCase();
  const path = pathOf(config.url);
  if (method !== "get" || !CACHEABLE.test(path)) return baseAdapter(config);

  const key = `${config.url}|${JSON.stringify(config.params || {})}`;
  const hit = responseCache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL) return Promise.resolve({ ...hit.response, config });

  let pending = inflight.get(key);
  if (!pending) {
    pending = baseAdapter(config)
      .then((response) => {
        if (response.status >= 200 && response.status < 300) responseCache.set(key, { at: Date.now(), response });
        return response;
      })
      .finally(() => inflight.delete(key));
    inflight.set(key, pending);
  }
  return pending.then((response) => ({ ...response, config }));
};

/** Kept for readability at call sites; api.get is already cached for catalog routes. */
export const cachedGet = api.get.bind(api);

export const clearApiCache = () => responseCache.clear();

/** Fire-and-forget ping so a sleeping backend starts waking while the UI loads. */
export const warmUpBackend = () => {
  const root = baseurl.replace(/\/api$/, "");
  fetch(`${root}/health`, { method: "GET", mode: "cors", cache: "no-store" }).catch(() => {});
};

/** Human friendly message from any API error. */
export const errorMessage = (error: unknown, fallback = "Something went wrong. Please try again."): string => {
  const err = error as AxiosError<{ message?: string; error?: string }>;
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.response?.data?.error) return err.response.data.error;
  if (err?.code === "ECONNABORTED") return "The server is taking too long to respond. Please try again.";
  if (err && !err.response && err.message === "Network Error") return "Can't reach the server. Check your connection.";
  return fallback;
};

export default api;
