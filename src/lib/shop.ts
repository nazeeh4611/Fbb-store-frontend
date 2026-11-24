import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api, { errorMessage } from "./api";

/* ------------------------------------------------------------ types */

export interface ProductImages {
  image1?: string;
  image2?: string;
  image3?: string;
  image4?: string;
}

/** Shape shared by listing endpoints (/products, /get-related, wishlist items). */
export interface ProductSummary {
  _id: string;
  name: string;
  brand?: string;
  priceINR: number;
  priceAED?: number;
  images?: ProductImages;
  stock?: number;
  colors?: string[];
  sizes?: string[];
  trending?: boolean;
  featured?: boolean;
  createdAt?: string;
  rating?: { average?: number; count?: number };
  discount?: { percentage?: number; amount?: number; startDate?: string | null; endDate?: string | null };
  categoryId?: { _id: string; name: string } | string;
  subCategoryId?: { _id: string; name: string } | string;
  seller?: { _id: string; name?: string; companyName?: string } | string;
}

export interface CategoryNode {
  _id: string;
  name: string;
  image?: string;
  subcategories?: { _id: string; name: string; image?: string; categoryId?: string }[];
}

/** Neutral placeholder shown only when a product/category has no image uploaded. */
export const FALLBACK_IMAGE =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"><rect width="300" height="400" fill="#f5f5f3"/><g fill="none" stroke="#c9c9c4" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><path d="M110 165h80l-8 90h-64z"/><path d="M128 165c0-14 10-24 22-24s22 10 22 24"/></g><text x="150" y="295" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="16" fill="#9a9a95">No image</text></svg>'
  );

export const productImages = (p: { images?: ProductImages }): string[] =>
  [p.images?.image1, p.images?.image2, p.images?.image3, p.images?.image4].filter(Boolean) as string[];

/* ------------------------------------------------------- broadcast */

export const emitCartUpdated = (detail?: { cartCount?: number; cartTotal?: number; cart?: unknown[] }) =>
  window.dispatchEvent(new CustomEvent("cart:updated", detail ? { detail } : undefined));

export const emitWishlistUpdated = () => window.dispatchEvent(new CustomEvent("wishlist:updated"));

/** Opens the slide-out bag in the header. */
export const openMiniCart = () => window.dispatchEvent(new CustomEvent("cart:open"));

/* ----------------------------------------------------------- cart */

export const addToCart = async (
  productId: string,
  opts: { quantity?: number; color?: string; size?: string; silent?: boolean; openBag?: boolean } = {}
): Promise<boolean> => {
  try {
    const res = await api.post("/cart/add", {
      productId,
      quantity: opts.quantity ?? 1,
      color: opts.color || undefined,
      size: opts.size || undefined,
    });
    if (res.data?.success === false) throw new Error(res.data?.message);
    emitCartUpdated({ cartCount: res.data?.cartCount, cartTotal: res.data?.cartTotal, cart: res.data?.cart });
    if (!opts.silent) toast.success("Added to bag");
    if (opts.openBag) openMiniCart();
    return true;
  } catch (err) {
    toast.error(errorMessage(err, "Could not add to bag"));
    return false;
  }
};

/* ------------------------------------------------------- wishlist */

// A tiny shared store so every heart on the page agrees with the server.
let wishlistIds = new Set<string>();
let loaded = false;
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

const loadWishlist = (force = false): Promise<void> => {
  if (loaded && !force) return Promise.resolve();
  if (loading) return loading;
  loading = api
    .get("/wishlist")
    .then((res) => {
      const items: { product?: { _id?: string } | string }[] = res.data?.wishlist || [];
      wishlistIds = new Set(
        items.map((i) => (typeof i.product === "string" ? i.product : i.product?._id)).filter(Boolean) as string[]
      );
      loaded = true;
      notify();
    })
    .catch(() => {
      /* guest session not ready / offline: keep hearts empty */
    })
    .finally(() => {
      loading = null;
    });
  return loading;
};

if (typeof window !== "undefined") {
  window.addEventListener("wishlist:updated", () => loadWishlist(true));
  window.addEventListener("auth:changed", () => loadWishlist(true));
}

export const useWishlist = () => {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    loadWishlist();
    return () => {
      listeners.delete(l);
    };
  }, []);
  return {
    has: (id: string) => wishlistIds.has(id),
    toggle: toggleWishlist,
  };
};

export const toggleWishlist = async (productId: string): Promise<void> => {
  const adding = !wishlistIds.has(productId);
  // optimistic
  if (adding) wishlistIds.add(productId);
  else wishlistIds.delete(productId);
  wishlistIds = new Set(wishlistIds);
  notify();
  try {
    if (adding) await api.post("/wishlist/add", { productId });
    else await api.delete(`/wishlist/remove/${productId}`);
    toast.success(adding ? "Saved to wishlist" : "Removed from wishlist");
    window.dispatchEvent(new CustomEvent("wishlist:changed"));
    emitWishlistUpdated();
  } catch (err) {
    if (adding) wishlistIds.delete(productId);
    else wishlistIds.add(productId);
    wishlistIds = new Set(wishlistIds);
    notify();
    toast.error(errorMessage(err, "Could not update wishlist"));
  }
};

/* -------------------------------------------------------- catalog */

let categoryTree: Promise<CategoryNode[]> | null = null;

/** Categories with their subcategories, fetched once per session. */
export const getCategoryTree = (): Promise<CategoryNode[]> => {
  if (!categoryTree) {
    categoryTree = api
      .get("/categories/with-subcategories")
      .then((r) => (r.data?.categories || []) as CategoryNode[])
      .catch(async () => {
        categoryTree = null;
        // older API: fall back to flat list
        try {
          const r = await api.get("/all-categories");
          return (r.data?.categories || []) as CategoryNode[];
        } catch {
          return [];
        }
      });
  }
  return categoryTree;
};

export const useCategoryTree = () => {
  const [cats, setCats] = useState<CategoryNode[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let alive = true;
    getCategoryTree().then((c) => {
      if (alive) {
        setCats(c);
        setReady(true);
      }
    });
    return () => {
      alive = false;
    };
  }, []);
  return { categories: cats, ready };
};

/** Preferred ordering for the main menu: fashion first. */
const MENU_ORDER = ["women", "men", "kids", "footwear", "accessories", "watches", "eyewear", "beauty", "home"];
export const sortForMenu = <T extends { name: string }>(list: T[]): T[] =>
  [...list].sort((a, b) => {
    const ia = MENU_ORDER.findIndex((k) => a.name.toLowerCase().startsWith(k));
    const ib = MENU_ORDER.findIndex((k) => b.name.toLowerCase().startsWith(k));
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.name.localeCompare(b.name);
  });
