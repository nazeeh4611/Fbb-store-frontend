// API base URL comes from the environment so the same build can point at
// staging / production without code changes. Set VITE_API_URL in .env or on
// your hosting provider (e.g. https://fbb-store-backend-3eix.onrender.com/api).
const DEFAULT_API_URL = "https://fbb-store-backend-3eix.onrender.com/api";

export const baseurl: string = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).trim().replace(/\/+$/, "");

export const ClientId: string =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "418114033455-nu2odpsacsi4vb0sjrgsoebqcpfb9ai9.apps.googleusercontent.com";
