import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  Heart,
  Loader2,
  LogOut,
  Menu,
  Minus,
  Package,
  Plus,
  Search,
  ShoppingBag,
  Store,
  Trash2,
  User,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import fbb from "./Img/fbb.png";
import AuthModal from "./AuthModal";
import OtpModal from "./OtpModal";
import ForgotPasswordModal from "./ForgotPasswordModal";
import api from "../../lib/api";
import { logoutUser } from "../../lib/auth";
import { formatINR } from "../../lib/format";
import { CategoryNode, FALLBACK_IMAGE, sortForMenu, useCategoryTree } from "../../lib/shop";
import { cn } from "../../lib/util";

interface NavBarProps {
  /** Kept for backwards compatibility; the header is always solid now. */
  isTransparent?: boolean;
}

interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    brand: string;
    priceINR: number;
    images: { image1: string; image2?: string };
    stock: number;
  };
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  price: number;
}

interface WishlistItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    brand: string;
    priceINR: number;
    images: { image1: string };
    stock: number;
  };
}

interface UserData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

const PROMOS = [
  "Free delivery on selected styles · Cash on delivery available",
  "Secure payments with UPI, cards & net banking",
  "Easy returns — request one from your orders page",
];

const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <Link to="/" aria-label="FBB Store home" className={cn("flex shrink-0 items-center", className)}>
    <img src={fbb} alt="FBB Fly Buy Brand" width={96} height={54} decoding="async" className="h-10 w-auto invert sm:h-11" />
  </Link>
);

const Badge: React.FC<{ count: number; tone?: "ink" | "sale" }> = ({ count, tone = "ink" }) =>
  count > 0 ? (
    <span
      className={cn(
        "absolute -right-1.5 -top-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 text-[10px] font-bold leading-none text-white",
        tone === "sale" ? "bg-sale" : "bg-ink"
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  ) : null;

const Drawer: React.FC<
  React.PropsWithChildren<{ open: boolean; onClose: () => void; side?: "left" | "right"; title: React.ReactNode; footer?: React.ReactNode; wide?: boolean }>
> = ({ open, onClose, side = "right", title, footer, children, wide }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div className={cn("fixed inset-0 z-[90]", open ? "visible" : "invisible pointer-events-none")} aria-hidden={!open}>
      <div
        onClick={onClose}
        className={cn("absolute inset-0 bg-black/40 transition-opacity duration-300", open ? "opacity-100" : "opacity-0")}
      />
      <aside
        role="dialog"
        aria-modal="true"
        className={cn(
          "absolute top-0 flex h-full w-full flex-col bg-white shadow-2xl transition-transform duration-300 ease-out",
          wide ? "max-w-md" : "max-w-sm",
          side === "right" ? "right-0" : "left-0",
          open ? "translate-x-0" : side === "right" ? "translate-x-full" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="font-display text-lg font-semibold uppercase tracking-wide">{title}</div>
          <button onClick={onClose} aria-label="Close" className="-mr-2 grid h-10 w-10 place-items-center rounded-full hover:bg-canvas">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
        {footer && <div className="border-t border-line p-5">{footer}</div>}
      </aside>
    </div>
  );
};

const NavBar: React.FC<NavBarProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { categories } = useCategoryTree();
  const menuCats = sortForMenu(categories).slice(0, 7);

  const [promo, setPromo] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [openCat, setOpenCat] = useState<string | null>(null);
  const [mobileCat, setMobileCat] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartLoading, setCartLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [updatingCartItem, setUpdatingCartItem] = useState<string | null>(null);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [user, setUser] = useState<UserData | null>(() => {
    try {
      const cached = localStorage.getItem("userData");
      return localStorage.getItem("token") && cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [isLogged, setIsLogged] = useState(() => !!localStorage.getItem("token"));
  const [accountOpen, setAccountOpen] = useState(false);

  const accountRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cartFetchController = useRef<AbortController | null>(null);

  // keep search box in sync with ?q=
  useEffect(() => {
    const q = new URLSearchParams(location.search).get("q") || "";
    setQuery(q);
  }, [location.search]);

  // close menus on navigation
  useEffect(() => {
    setMenuOpen(false);
    setOpenCat(null);
    setMobileSearch(false);
    setAccountOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const t = setInterval(() => setPromo((p) => (p + 1) % PROMOS.length), 4500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    document.body.style.overflow = cartOpen || wishlistOpen || menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen, wishlistOpen, menuOpen]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  /* ------------------------------------------------------ data */

  const checkAuthStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLogged(false);
        setUser(null);
        return;
      }
      const response = await api.get("/profile");
      if (response.data.success) {
        setIsLogged(true);
        setUser(response.data.user);
        localStorage.setItem("userData", JSON.stringify(response.data.user));
      }
    } catch (error: any) {
      if (error?.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        setIsLogged(false);
        setUser(null);
      }
    }
  }, []);

  const fetchCartData = useCallback(async (showLoader = true) => {
    cartFetchController.current?.abort();
    cartFetchController.current = new AbortController();
    try {
      if (showLoader) setCartLoading(true);
      const response = await api.get("/cart", { signal: cartFetchController.current.signal });
      if (response.data.success) {
        setCartItems(response.data.cart || []);
        setCartCount(response.data.cartCount || 0);
        setCartTotal(response.data.cartTotal || 0);
      }
    } catch (error: any) {
      if (error.name !== "CanceledError" && error.name !== "AbortError") console.error("Error fetching cart:", error);
    } finally {
      setCartLoading(false);
    }
  }, []);

  const fetchWishlistData = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setWishlistLoading(true);
      const response = await api.get("/wishlist");
      if (response.data.success) {
        setWishlistItems(response.data.wishlist || []);
        setWishlistCount(response.data.wishlistCount ?? (response.data.wishlist || []).length);
      }
    } catch {
      /* guest session not ready */
    } finally {
      setWishlistLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
    fetchCartData(false);
    fetchWishlistData(false);
  }, [checkAuthStatus, fetchCartData, fetchWishlistData]);

  useEffect(() => {
    const openAuth = (e: Event) => {
      const mode = (e as CustomEvent).detail?.mode;
      setAuthMode(mode === "register" ? "register" : "login");
      setShowAuthModal(true);
      setMenuOpen(false);
      setCartOpen(false);
    };
    const authChanged = () => {
      checkAuthStatus();
      fetchCartData(false);
      fetchWishlistData(false);
    };
    const onCart = (e: Event) => {
      const d = (e as CustomEvent).detail;
      if (d && (d.cartCount !== undefined || d.cart !== undefined)) {
        if (d.cartCount !== undefined) setCartCount(d.cartCount);
        if (d.cartTotal !== undefined) setCartTotal(d.cartTotal);
        if (d.cart !== undefined) setCartItems(d.cart);
        else fetchCartData(false);
      } else fetchCartData(false);
    };
    const onWishlist = () => fetchWishlistData(false);
    const onOpenCart = () => {
      setWishlistOpen(false);
      setCartOpen(true);
    };
    window.addEventListener("auth:open", openAuth);
    window.addEventListener("auth:changed", authChanged);
    window.addEventListener("cart:updated", onCart);
    window.addEventListener("wishlist:updated", onWishlist);
    window.addEventListener("cart:open", onOpenCart);
    return () => {
      window.removeEventListener("auth:open", openAuth);
      window.removeEventListener("auth:changed", authChanged);
      window.removeEventListener("cart:updated", onCart);
      window.removeEventListener("wishlist:updated", onWishlist);
      window.removeEventListener("cart:open", onOpenCart);
    };
  }, [checkAuthStatus, fetchCartData, fetchWishlistData]);

  useEffect(() => {
    if (cartOpen) fetchCartData(cartItems.length === 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartOpen]);

  useEffect(() => {
    if (wishlistOpen) fetchWishlistData(wishlistItems.length === 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wishlistOpen]);

  /* --------------------------------------------------- actions */

  const removeFromCart = async (cartItemId: string) => {
    setUpdatingCartItem(cartItemId);
    try {
      await api.delete(`/cart/remove/${cartItemId}`);
    } catch {
      toast.error("Couldn't remove that item");
    }
    await fetchCartData(false);
    setUpdatingCartItem(null);
    window.dispatchEvent(new CustomEvent("cart:changed"));
  };

  const updateCartQuantity = async (cartItemId: string, quantity: number) => {
    setUpdatingCartItem(cartItemId);
    try {
      await api.put("/cart/update", { cartItemId, quantity });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Couldn't update quantity");
    }
    await fetchCartData(false);
    setUpdatingCartItem(null);
    window.dispatchEvent(new CustomEvent("cart:changed"));
  };

  const removeFromWishlist = async (productId: string) => {
    setWishlistItems((prev) => prev.filter((i) => i.product?._id !== productId));
    setWishlistCount((c) => Math.max(0, c - 1));
    try {
      await api.delete(`/wishlist/remove/${productId}`);
    } catch {
      /* resync below */
    }
    window.dispatchEvent(new CustomEvent("wishlist:updated"));
  };

  const moveToCart = async (productId: string) => {
    try {
      await api.post("/wishlist/move-to-cart", { productId });
      toast.success("Moved to bag");
      await Promise.all([fetchCartData(false), fetchWishlistData(false)]);
      window.dispatchEvent(new CustomEvent("wishlist:updated"));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Please choose a size on the product page");
      navigate(`/product/${productId}`);
      setWishlistOpen(false);
    }
  };

  const handleLoginSuccess = async (userData: UserData, token: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("userData", JSON.stringify(userData));
    localStorage.removeItem("guestToken");
    toast.success(`Welcome${userData?.name ? `, ${userData.name.split(" ")[0]}` : ""}!`);
    setIsLogged(true);
    setUser(userData);
    setShowAuthModal(false);
    setShowOtpModal(false);
    window.dispatchEvent(new CustomEvent("auth:changed"));
  };

  const handleLogout = async () => {
    await logoutUser();
    setIsLogged(false);
    setUser(null);
    setCartItems([]);
    setWishlistItems([]);
    setCartCount(0);
    setWishlistCount(0);
    setCartTotal(0);
    setAccountOpen(false);
    setMenuOpen(false);
    navigate("/");
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
    setMobileSearch(false);
  };

  const openAccount = () => {
    if (isLogged) setAccountOpen((v) => !v);
    else {
      setAuthMode("login");
      setShowAuthModal(true);
    }
  };

  const hoverCat = (id: string | null) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (id) setOpenCat(id);
    else closeTimer.current = setTimeout(() => setOpenCat(null), 120);
  };

  const activeCat: CategoryNode | undefined = menuCats.find((c) => c._id === openCat);

  /* --------------------------------------------------- render */

  const searchBox = (autoFocus = false) => (
    <form onSubmit={submitSearch} role="search" className="relative w-full">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted" />
      <input
        type="search"
        value={query}
        autoFocus={autoFocus}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for products, brands and more"
        aria-label="Search products"
        className="h-11 w-full rounded-full border border-transparent bg-canvas pl-11 pr-4 text-sm text-ink outline-none transition placeholder:text-muted focus:border-ink focus:bg-white"
      />
    </form>
  );

  return (
    <>
      {/* promo bar */}
      <div className="bg-ink text-white">
        <div className="mx-auto flex h-9 max-w-[1440px] items-center justify-center px-4 text-center text-[12px] font-medium tracking-wide sm:justify-between sm:px-6 lg:px-10">
          <p key={promo} className="animate-fade-in truncate">{PROMOS[promo]}</p>
          <div className="hidden items-center gap-5 text-white/80 sm:flex">
            <Link to="/seller/register" className="hover:text-white">Sell on FBB</Link>
            <Link to="/contact" className="hover:text-white">Help</Link>
            <Link to="/orders" className="hover:text-white">Track order</Link>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-3 px-4 sm:h-[72px] sm:gap-6 sm:px-6 lg:px-10">
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="-ml-2 grid h-10 w-10 place-items-center rounded-full hover:bg-canvas lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>

          <Logo className="max-lg:mx-auto max-lg:pl-10" />

          <div className="hidden max-w-2xl flex-1 lg:block">{searchBox()}</div>

          <div className="flex items-center gap-1 sm:gap-2 lg:ml-auto">
            <button
              onClick={() => setMobileSearch((v) => !v)}
              aria-label="Search"
              className="grid h-10 w-10 place-items-center rounded-full hover:bg-canvas lg:hidden"
            >
              <Search className="h-[22px] w-[22px]" />
            </button>

            <div className="relative hidden sm:block" ref={accountRef}>
              <button
                onClick={openAccount}
                className="flex h-10 items-center gap-2 rounded-full px-2 hover:bg-canvas lg:px-3"
                aria-haspopup={isLogged ? "menu" : undefined}
                aria-expanded={isLogged ? accountOpen : undefined}
              >
                <User className="h-[22px] w-[22px]" />
                <span className="hidden max-w-[110px] truncate text-sm font-medium xl:block">
                  {isLogged ? `Hi, ${user?.name?.split(" ")[0] || "there"}` : "Sign in"}
                </span>
              </button>
              {accountOpen && isLogged && (
                <div className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-lg border border-line bg-white shadow-xl" role="menu">
                  <div className="border-b border-line px-4 py-3">
                    <p className="truncate text-sm font-semibold">{user?.name}</p>
                    <p className="truncate text-xs text-muted">{user?.email}</p>
                  </div>
                  <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-canvas" role="menuitem">
                    <User className="h-4 w-4" /> My account
                  </Link>
                  <Link to="/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-canvas" role="menuitem">
                    <Package className="h-4 w-4" /> My orders
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 border-t border-line px-4 py-2.5 text-left text-sm text-sale hover:bg-sale-soft"
                    role="menuitem"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setCartOpen(false);
                setWishlistOpen(true);
              }}
              aria-label={`Wishlist, ${wishlistCount} items`}
              className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-canvas"
            >
              <Heart className="h-[22px] w-[22px]" />
              <Badge count={wishlistCount} tone="sale" />
            </button>

            <button
              onClick={() => {
                setWishlistOpen(false);
                setCartOpen(true);
              }}
              aria-label={`Bag, ${cartCount} items`}
              className="relative -mr-2 grid h-10 w-10 place-items-center rounded-full hover:bg-canvas sm:mr-0"
            >
              <ShoppingBag className="h-[22px] w-[22px]" />
              <Badge count={cartCount} />
            </button>
          </div>
        </div>

        {mobileSearch && <div className="border-t border-line px-4 py-3 lg:hidden">{searchBox(true)}</div>}

        {/* category row (desktop) */}
        <nav className="relative hidden border-t border-line lg:block" onMouseLeave={() => hoverCat(null)} aria-label="Shop by category">
          <ul className="mx-auto flex h-12 max-w-[1440px] items-stretch gap-1 px-6 lg:px-10">
            <li className="flex">
              <NavLink
                to="/shop?sort=new"
                onMouseEnter={() => hoverCat(null)}
                className="flex items-center px-3 text-[13px] font-semibold uppercase tracking-wider text-ink hover:underline hover:underline-offset-[18px]"
              >
                New in
              </NavLink>
            </li>
            {menuCats.map((c) => (
              <li key={c._id} className="flex" onMouseEnter={() => hoverCat(c._id)}>
                <Link
                  to={`/shop/category/${c._id}`}
                  className={cn(
                    "flex items-center border-b-2 px-3 text-[13px] font-semibold uppercase tracking-wider transition",
                    openCat === c._id ? "border-ink" : "border-transparent hover:border-ink"
                  )}
                  aria-expanded={openCat === c._id}
                >
                  {c.name}
                </Link>
              </li>
            ))}
            <li className="flex" onMouseEnter={() => hoverCat(null)}>
              <Link to="/seller-list" className="flex items-center gap-1.5 border-b-2 border-transparent px-3 text-[13px] font-semibold uppercase tracking-wider hover:border-ink">
                Brands
              </Link>
            </li>
            <li className="flex" onMouseEnter={() => hoverCat(null)}>
              <Link to="/shop?sale=1" className="flex items-center border-b-2 border-transparent px-3 text-[13px] font-bold uppercase tracking-wider text-sale hover:border-sale">
                Sale
              </Link>
            </li>
          </ul>

          {activeCat && (
            <div
              className="absolute inset-x-0 top-full z-40 border-b border-line bg-white shadow-[0_24px_40px_-24px_rgba(0,0,0,0.25)]"
              onMouseEnter={() => hoverCat(activeCat._id)}
            >
              <div className="mx-auto grid max-w-[1440px] grid-cols-12 gap-8 px-10 py-8">
                <div className="col-span-3">
                  <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted">{activeCat.name}</p>
                  <Link to={`/shop/category/${activeCat._id}`} className="mb-3 block text-sm font-semibold underline underline-offset-4">
                    Shop all {activeCat.name}
                  </Link>
                  <Link to={`/shop/category/${activeCat._id}?sort=new`} className="mb-3 block text-sm hover:underline">New arrivals</Link>
                  <Link to={`/shop/category/${activeCat._id}?sale=1`} className="block text-sm font-semibold text-sale hover:underline">On sale</Link>
                </div>
                <div className="col-span-5">
                  <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted">Categories</p>
                  {activeCat.subcategories?.length ? (
                    <ul className="grid grid-cols-2 gap-x-6 gap-y-3">
                      {activeCat.subcategories.map((s) => (
                        <li key={s._id}>
                          <Link to={`/shop/subcategory/${s._id}`} className="text-sm text-ink-soft hover:text-ink hover:underline">
                            {s.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted">Browse the full {activeCat.name.toLowerCase()} range.</p>
                  )}
                </div>
                <Link to={`/shop/category/${activeCat._id}`} className="group col-span-4 grid grid-cols-2 gap-3">
                  {[activeCat.image, activeCat.subcategories?.[0]?.image].map((src, i) =>
                    src ? (
                      <div key={i} className="relative aspect-[4/5] overflow-hidden rounded-md bg-canvas">
                        <img src={src} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                        {i === 0 && (
                          <span className="absolute bottom-3 left-3 rounded-sm bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wider">
                            Shop {activeCat.name}
                          </span>
                        )}
                      </div>
                    ) : null
                  )}
                </Link>
              </div>
            </div>
          )}
        </nav>

        {/* category chips (mobile/tablet) */}
        <div className="no-scrollbar flex gap-2 overflow-x-auto border-t border-line px-4 py-2.5 sm:px-6 lg:hidden">
          <Link to="/shop?sort=new" className="shrink-0 rounded-full border border-line px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide">New in</Link>
          {menuCats.map((c) => (
            <Link key={c._id} to={`/shop/category/${c._id}`} className="shrink-0 rounded-full border border-line px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide">
              {c.name}
            </Link>
          ))}
          <Link to="/shop?sale=1" className="shrink-0 rounded-full border border-sale px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-sale">Sale</Link>
        </div>
      </header>

      {/* mobile menu */}
      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} side="left" title={<Logo />}>
        <div className="p-5">
          {isLogged ? (
            <div className="mb-5 flex items-center gap-3 rounded-lg bg-canvas p-4">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-ink text-sm font-bold text-white">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{user?.name}</p>
                <p className="truncate text-xs text-muted">{user?.email}</p>
              </div>
            </div>
          ) : (
            <div className="mb-5 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setAuthMode("login");
                  setShowAuthModal(true);
                  setMenuOpen(false);
                }}
                className="rounded-md bg-ink py-3 text-sm font-semibold text-white"
              >
                Sign in
              </button>
              <button
                onClick={() => {
                  setAuthMode("register");
                  setShowAuthModal(true);
                  setMenuOpen(false);
                }}
                className="rounded-md border border-ink py-3 text-sm font-semibold"
              >
                Create account
              </button>
            </div>
          )}

          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">Shop</p>
          <ul className="divide-y divide-line border-y border-line">
            <li>
              <Link to="/shop?sort=new" className="flex items-center justify-between py-3.5 text-[15px] font-semibold uppercase tracking-wide">
                New in <ChevronRight className="h-4 w-4 text-muted" />
              </Link>
            </li>
            {menuCats.map((c) => (
              <li key={c._id}>
                <button
                  onClick={() => setMobileCat((v) => (v === c._id ? null : c._id))}
                  className="flex w-full items-center justify-between py-3.5 text-left text-[15px] font-semibold uppercase tracking-wide"
                  aria-expanded={mobileCat === c._id}
                >
                  <span className="flex items-center gap-3">
                    <img src={c.image || FALLBACK_IMAGE} alt="" className="h-9 w-9 rounded-full object-cover" loading="lazy" />
                    {c.name}
                  </span>
                  <ChevronDown className={cn("h-4 w-4 text-muted transition", mobileCat === c._id && "rotate-180")} />
                </button>
                {mobileCat === c._id && (
                  <ul className="pb-3 pl-12">
                    <li>
                      <Link to={`/shop/category/${c._id}`} className="block py-2 text-sm font-semibold underline underline-offset-4">
                        Shop all {c.name}
                      </Link>
                    </li>
                    {c.subcategories?.map((s) => (
                      <li key={s._id}>
                        <Link to={`/shop/subcategory/${s._id}`} className="block py-2 text-sm text-ink-soft">
                          {s.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
            <li>
              <Link to="/seller-list" className="flex items-center justify-between py-3.5 text-[15px] font-semibold uppercase tracking-wide">
                Brands & sellers <ChevronRight className="h-4 w-4 text-muted" />
              </Link>
            </li>
            <li>
              <Link to="/shop?sale=1" className="flex items-center justify-between py-3.5 text-[15px] font-bold uppercase tracking-wide text-sale">
                Sale <ChevronRight className="h-4 w-4" />
              </Link>
            </li>
          </ul>

          <p className="mb-2 mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-muted">Account & help</p>
          <ul className="space-y-1 text-sm">
            {isLogged && (
              <>
                <li><Link to="/profile" className="flex items-center gap-3 py-2.5"><User className="h-4 w-4" /> My account</Link></li>
                <li><Link to="/orders" className="flex items-center gap-3 py-2.5"><Package className="h-4 w-4" /> My orders</Link></li>
              </>
            )}
            <li><Link to="/seller/register" className="flex items-center gap-3 py-2.5"><Store className="h-4 w-4" /> Sell on FBB</Link></li>
            <li><Link to="/about" className="block py-2.5 pl-7">About us</Link></li>
            <li><Link to="/contact" className="block py-2.5 pl-7">Contact & help</Link></li>
            {isLogged && (
              <li>
                <button onClick={handleLogout} className="flex items-center gap-3 py-2.5 text-sale">
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </li>
            )}
          </ul>
        </div>
      </Drawer>

      {/* bag */}
      <Drawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        wide
        title={
          <span className="flex items-center gap-2">
            Your bag <span className="text-sm font-normal normal-case tracking-normal text-muted">({cartCount} {cartCount === 1 ? "item" : "items"})</span>
          </span>
        }
        footer={
          cartItems.length > 0 ? (
            <>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-medium">Subtotal</span>
                <span className="text-lg font-bold">{formatINR(cartTotal)}</span>
              </div>
              <p className="mb-4 text-xs text-muted">Shipping and taxes are calculated at checkout.</p>
              <div className="grid gap-2">
                <button
                  onClick={() => {
                    setCartOpen(false);
                    navigate("/checkout");
                  }}
                  className="rounded-md bg-ink py-3.5 text-sm font-semibold uppercase tracking-wider text-white hover:bg-black"
                >
                  Checkout securely
                </button>
                <button
                  onClick={() => {
                    setCartOpen(false);
                    navigate("/cart");
                  }}
                  className="rounded-md border border-ink py-3.5 text-sm font-semibold uppercase tracking-wider hover:bg-canvas"
                >
                  View bag
                </button>
              </div>
            </>
          ) : undefined
        }
      >
        {cartLoading && cartItems.length === 0 ? (
          <div className="space-y-5 p-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="skeleton h-28 w-[84px] shrink-0 rounded" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-3 w-1/3" />
                  <div className="skeleton h-8 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : cartItems.length === 0 ? (
          <div className="flex flex-col items-center px-8 py-20 text-center">
            <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-canvas">
              <ShoppingBag className="h-7 w-7 text-muted" />
            </div>
            <p className="font-display text-xl font-semibold">Your bag is empty</p>
            <p className="mt-1 text-sm text-muted">Find something you love and it will show up here.</p>
            <button
              onClick={() => {
                setCartOpen(false);
                navigate("/shop");
              }}
              className="mt-6 rounded-md bg-ink px-8 py-3 text-sm font-semibold uppercase tracking-wider text-white"
            >
              Start shopping
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-line px-5">
            {cartItems.map((item) => {
              const busy = updatingCartItem === item._id;
              if (!item.product) return null;
              return (
                <li key={item._id} className={cn("flex gap-4 py-5 transition", busy && "opacity-60")}>
                  <Link to={`/product/${item.product._id}`} onClick={() => setCartOpen(false)} className="shrink-0">
                    <img
                      src={item.product.images?.image1 || FALLBACK_IMAGE}
                      alt={item.product.name}
                      className="h-28 w-[84px] rounded object-cover"
                      loading="lazy"
                    />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{item.product.brand}</p>
                        <Link
                          to={`/product/${item.product._id}`}
                          onClick={() => setCartOpen(false)}
                          className="line-clamp-2 text-sm leading-snug hover:underline"
                        >
                          {item.product.name}
                        </Link>
                      </div>
                      <button
                        onClick={() => removeFromCart(item._id)}
                        disabled={busy}
                        aria-label={`Remove ${item.product.name}`}
                        className="-mr-1 grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted hover:bg-canvas hover:text-sale"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      {[item.selectedColor && `Colour: ${item.selectedColor}`, item.selectedSize && `Size: ${item.selectedSize}`]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex h-9 items-center rounded-md border border-line">
                        <button
                          onClick={() => updateCartQuantity(item._id, item.quantity - 1)}
                          disabled={busy || item.quantity <= 1}
                          aria-label="Decrease quantity"
                          className="grid h-full w-9 place-items-center disabled:opacity-30"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-7 text-center text-sm font-semibold">
                          {busy ? <Loader2 className="mx-auto h-3.5 w-3.5 animate-spin" /> : item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item._id, item.quantity + 1)}
                          disabled={busy || item.quantity >= (item.product.stock || 99)}
                          aria-label="Increase quantity"
                          className="grid h-full w-9 place-items-center disabled:opacity-30"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="text-sm font-bold">{formatINR(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Drawer>

      {/* wishlist */}
      <Drawer
        open={wishlistOpen}
        onClose={() => setWishlistOpen(false)}
        wide
        title={
          <span className="flex items-center gap-2">
            Wishlist <span className="text-sm font-normal normal-case tracking-normal text-muted">({wishlistCount})</span>
          </span>
        }
      >
        {wishlistLoading && wishlistItems.length === 0 ? (
          <div className="space-y-5 p-5">
            {[0, 1].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="skeleton h-28 w-[84px] shrink-0 rounded" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="flex flex-col items-center px-8 py-20 text-center">
            <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-canvas">
              <Heart className="h-7 w-7 text-muted" />
            </div>
            <p className="font-display text-xl font-semibold">Nothing saved yet</p>
            <p className="mt-1 text-sm text-muted">Tap the heart on any product to save it for later.</p>
            <button
              onClick={() => {
                setWishlistOpen(false);
                navigate("/shop");
              }}
              className="mt-6 rounded-md bg-ink px-8 py-3 text-sm font-semibold uppercase tracking-wider text-white"
            >
              Discover products
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-line px-5">
            {wishlistItems.map((item) =>
              item.product ? (
                <li key={item._id} className="flex gap-4 py-5">
                  <Link to={`/product/${item.product._id}`} onClick={() => setWishlistOpen(false)} className="shrink-0">
                    <img src={item.product.images?.image1 || FALLBACK_IMAGE} alt={item.product.name} className="h-28 w-[84px] rounded object-cover" loading="lazy" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{item.product.brand}</p>
                    <Link to={`/product/${item.product._id}`} onClick={() => setWishlistOpen(false)} className="line-clamp-2 text-sm hover:underline">
                      {item.product.name}
                    </Link>
                    <p className="mt-1 text-sm font-bold">{formatINR(item.product.priceINR)}</p>
                    <div className="mt-auto flex gap-2 pt-2">
                      <button
                        onClick={() => moveToCart(item.product._id)}
                        disabled={item.product.stock <= 0}
                        className="flex-1 rounded-md bg-ink py-2 text-xs font-semibold uppercase tracking-wider text-white disabled:opacity-40"
                      >
                        {item.product.stock <= 0 ? "Sold out" : "Move to bag"}
                      </button>
                      <button
                        onClick={() => removeFromWishlist(item.product._id)}
                        aria-label="Remove from wishlist"
                        className="grid w-9 place-items-center rounded-md border border-line text-muted hover:text-sale"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ) : null
            )}
          </ul>
        )}
      </Drawer>

      <AuthModal
        key={authMode}
        initialMode={authMode}
        show={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onRegisterSuccess={(email: string) => {
          setRegisteredEmail(email);
          setShowAuthModal(false);
          setShowOtpModal(true);
        }}
        onLoginSuccess={handleLoginSuccess}
        onForgotPassword={() => {
          setShowAuthModal(false);
          setShowForgotPasswordModal(true);
        }}
      />
      <OtpModal
        show={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        email={registeredEmail}
        onVerifySuccess={() => {
          setShowOtpModal(false);
          window.dispatchEvent(new CustomEvent("auth:changed"));
        }}
        onLoginSuccess={handleLoginSuccess}
      />
      <ForgotPasswordModal show={showForgotPasswordModal} onClose={() => setShowForgotPasswordModal(false)} />
    </>
  );
};

export default NavBar;
