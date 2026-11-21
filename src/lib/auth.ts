import { useEffect, useState } from "react";
import api from "./api";

/** Ask the navbar to open the sign-in modal from anywhere in the app. */
export const openAuthModal = (mode: "login" | "register" = "login") =>
  window.dispatchEvent(new CustomEvent("auth:open", { detail: { mode } }));

export const notifyAuthChanged = () => window.dispatchEvent(new CustomEvent("auth:changed"));

export const isLoggedIn = (): boolean => {
  try {
    const t = localStorage.getItem("token");
    return !!t && t !== "null" && t !== "undefined";
  } catch {
    return false;
  }
};

/** Re-renders when the shopper signs in or out (in this tab or another). */
export const useIsLoggedIn = (): boolean => {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn);
  useEffect(() => {
    const update = () => setLoggedIn(isLoggedIn());
    window.addEventListener("auth:changed", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("auth:changed", update);
      window.removeEventListener("storage", update);
    };
  }, []);
  return loggedIn;
};

export const logoutUser = async () => {
  try {
    if (isLoggedIn()) await api.post("/logout");
  } catch {
    /* session may already be gone - clear locally anyway */
  }
  ["token", "userData", "user"].forEach((k) => localStorage.removeItem(k));
  notifyAuthChanged();
  window.dispatchEvent(new CustomEvent("cart:updated"));
  window.dispatchEvent(new CustomEvent("wishlist:updated"));
};
