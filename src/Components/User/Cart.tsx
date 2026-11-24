import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Loader2, Lock, Minus, Plus, RotateCcw, ShieldCheck, ShoppingBag, Trash2, Truck } from "lucide-react";
import { toast } from "react-hot-toast";
import NavBar from "../Layouts/Navbar";
import Footer from "../Layouts/Footer";
import api, { errorMessage } from "../../lib/api";
import { formatINR } from "../../lib/format";
import { emitCartUpdated, emitWishlistUpdated, FALLBACK_IMAGE } from "../../lib/shop";
import { Breadcrumbs, Container, EmptyState, btn } from "../Store/Sections";
import { cn } from "../../lib/util";

interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    brand: string;
    priceINR: number;
    images: { image1: string };
    stock: number;
  };
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  price: number;
}

interface Summary {
  items: number;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

const CartPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const controller = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    controller.current?.abort();
    controller.current = new AbortController();
    try {
      const res = await api.get("/cart", { signal: controller.current.signal });
      if (res.data?.success) {
        setItems((res.data.cart || []).filter((i: CartItem) => i.product));
        setSummary(res.data.summary || null);
        emitCartUpdated({ cartCount: res.data.cartCount, cartTotal: res.data.cartTotal, cart: res.data.cart });
      }
    } catch (err: any) {
      if (err?.name !== "CanceledError") toast.error(errorMessage(err, "Couldn't load your bag"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = "Your bag · FBB Store";
    load();
    const resync = () => load();
    window.addEventListener("cart:changed", resync);
    window.addEventListener("auth:changed", resync);
    return () => {
      window.removeEventListener("cart:changed", resync);
      window.removeEventListener("auth:changed", resync);
    };
  }, [load]);

  const updateQty = async (item: CartItem, quantity: number) => {
    if (quantity < 1 || quantity > (item.product.stock || 99)) return;
    setBusy(item._id);
    try {
      await api.put("/cart/update", { cartItemId: item._id, quantity });
      await load();
    } catch (err) {
      toast.error(errorMessage(err, "Couldn't update quantity"));
    } finally {
      setBusy(null);
    }
  };

  const remove = async (item: CartItem, silent = false) => {
    setBusy(item._id);
    try {
      await api.delete(`/cart/remove/${item._id}`);
      if (!silent) toast.success("Removed from bag");
      await load();
    } catch (err) {
      toast.error(errorMessage(err, "Couldn't remove item"));
    } finally {
      setBusy(null);
    }
  };

  const saveForLater = async (item: CartItem) => {
    setBusy(item._id);
    try {
      await api.post("/wishlist/add", { productId: item.product._id });
      await api.delete(`/cart/remove/${item._id}`);
      emitWishlistUpdated();
      toast.success("Moved to wishlist");
      await load();
    } catch (err) {
      toast.error(errorMessage(err, "Couldn't move item"));
    } finally {
      setBusy(null);
    }
  };

  const clearAll = async () => {
    setClearing(true);
    try {
      await api.delete("/cart/clear");
      await load();
    } catch (err) {
      toast.error(errorMessage(err, "Couldn't clear bag"));
    } finally {
      setClearing(false);
    }
  };

  const subtotal = summary?.subtotal ?? items.reduce((t, i) => t + i.price * i.quantity, 0);
  const count = summary?.items ?? items.reduce((t, i) => t + i.quantity, 0);
  const outOfStock = items.some((i) => i.product.stock < i.quantity);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <NavBar />
      <main className="flex-1">
        <Container className="py-6 sm:py-10">
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Bag" }]} />
          <div className="mt-4 flex items-end justify-between gap-4 border-b border-line pb-5">
            <h1 className="font-display text-3xl font-semibold uppercase sm:text-4xl">
              Your bag {count > 0 && <span className="text-lg font-normal normal-case text-muted">({count} {count === 1 ? "item" : "items"})</span>}
            </h1>
            {items.length > 0 && (
              <button onClick={clearAll} disabled={clearing} className="text-sm text-muted underline-offset-4 hover:text-sale hover:underline">
                {clearing ? "Clearing…" : "Clear bag"}
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid gap-10 pt-6 lg:grid-cols-12">
              <div className="space-y-6 lg:col-span-8">
                {[0, 1, 2].map((k) => (
                  <div key={k} className="flex gap-5">
                    <div className="skeleton h-40 w-[120px] shrink-0 rounded-md" />
                    <div className="flex-1 space-y-3 pt-2">
                      <div className="skeleton h-4 w-1/2" />
                      <div className="skeleton h-3 w-1/4" />
                      <div className="skeleton h-10 w-32" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="skeleton h-72 rounded-md lg:col-span-4" />
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={<ShoppingBag className="h-7 w-7" />}
              title="Your bag is empty"
              message="Looks like you haven't added anything yet. Explore new arrivals and best sellers."
              action={
                <div className="flex flex-wrap justify-center gap-3">
                  <Link to="/shop?sort=new" className={btn.primary}>Shop new in</Link>
                  <Link to="/shop?sale=1" className={btn.secondary}>Shop sale</Link>
                </div>
              }
            />
          ) : (
            <div className="grid gap-10 pt-2 lg:grid-cols-12">
              <ul className="divide-y divide-line lg:col-span-8">
                {items.map((item) => {
                  const isBusy = busy === item._id;
                  const short = item.product.stock < item.quantity;
                  return (
                    <li key={item._id} className={cn("flex gap-4 py-6 transition sm:gap-6", isBusy && "opacity-60")}>
                      <Link to={`/product/${item.product._id}`} className="shrink-0">
                        <img
                          src={item.product.images?.image1 || FALLBACK_IMAGE}
                          alt={item.product.name}
                          className="h-40 w-[120px] rounded-md object-cover sm:h-48 sm:w-36"
                          loading="lazy"
                        />
                      </Link>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{item.product.brand}</p>
                            <Link to={`/product/${item.product._id}`} className="mt-0.5 line-clamp-2 text-[15px] leading-snug hover:underline">
                              {item.product.name}
                            </Link>
                            <div className="mt-2 space-y-0.5 text-sm text-muted">
                              {item.selectedColor && <p>Colour: <span className="text-ink">{item.selectedColor}</span></p>}
                              {item.selectedSize && <p>Size: <span className="text-ink">{item.selectedSize}</span></p>}
                              <p>{formatINR(item.price)} each</p>
                            </div>
                          </div>
                          <p className="shrink-0 text-base font-bold">{formatINR(item.price * item.quantity)}</p>
                        </div>

                        {short && (
                          <p className="mt-2 text-sm font-medium text-sale">
                            {item.product.stock <= 0 ? "This item is now sold out." : `Only ${item.product.stock} left — reduce the quantity to continue.`}
                          </p>
                        )}

                        <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-3 pt-4">
                          <div className="flex h-10 items-center rounded-md border border-line">
                            <button
                              onClick={() => updateQty(item, item.quantity - 1)}
                              disabled={isBusy || item.quantity <= 1}
                              aria-label="Decrease quantity"
                              className="grid h-full w-10 place-items-center disabled:opacity-30"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-8 text-center text-sm font-semibold" aria-live="polite">
                              {isBusy ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : item.quantity}
                            </span>
                            <button
                              onClick={() => updateQty(item, item.quantity + 1)}
                              disabled={isBusy || item.quantity >= (item.product.stock || 99)}
                              aria-label="Increase quantity"
                              className="grid h-full w-10 place-items-center disabled:opacity-30"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <button onClick={() => saveForLater(item)} disabled={isBusy} className="flex items-center gap-1.5 text-sm underline-offset-4 hover:underline">
                            <Heart className="h-4 w-4" /> Save for later
                          </button>
                          <button onClick={() => remove(item)} disabled={isBusy} className="flex items-center gap-1.5 text-sm text-muted underline-offset-4 hover:text-sale hover:underline">
                            <Trash2 className="h-4 w-4" /> Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <aside className="lg:col-span-4">
                <div className="rounded-md bg-canvas p-6 lg:sticky lg:top-[140px]">
                  <h2 className="font-display text-xl font-semibold uppercase">Order summary</h2>
                  <dl className="mt-5 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted">Subtotal ({count} {count === 1 ? "item" : "items"})</dt>
                      <dd className="font-medium">{formatINR(subtotal)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted">Delivery</dt>
                      <dd className="font-medium">{summary ? (summary.shipping > 0 ? formatINR(summary.shipping) : <span className="text-ok">Free</span>) : "At checkout"}</dd>
                    </div>
                    {summary && summary.tax > 0 && (
                      <div className="flex justify-between">
                        <dt className="text-muted">GST (18%)</dt>
                        <dd className="font-medium">{formatINR(summary.tax)}</dd>
                      </div>
                    )}
                  </dl>
                  <div className="mt-5 flex items-baseline justify-between border-t border-line pt-5">
                    <span className="text-base font-semibold">Total</span>
                    <span className="text-2xl font-bold">{formatINR(summary?.total ?? subtotal)}</span>
                  </div>
                  <button
                    onClick={() => navigate("/checkout")}
                    disabled={outOfStock}
                    className={cn(btn.primary, "mt-6 w-full py-4")}
                  >
                    <Lock className="h-4 w-4" /> Checkout securely
                  </button>
                  {outOfStock && <p className="mt-2 text-center text-xs text-sale">Update the highlighted items to continue.</p>}
                  <Link to="/shop" className="mt-3 block text-center text-sm underline underline-offset-4">
                    Continue shopping
                  </Link>

                  <ul className="mt-6 space-y-3 border-t border-line pt-6 text-sm">
                    <li className="flex items-center gap-3"><Truck className="h-5 w-5 shrink-0" strokeWidth={1.5} /> Cash on delivery available</li>
                    <li className="flex items-center gap-3"><RotateCcw className="h-5 w-5 shrink-0" strokeWidth={1.5} /> Easy returns from your orders page</li>
                    <li className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 shrink-0" strokeWidth={1.5} /> Secure payments by Razorpay</li>
                  </ul>
                </div>
              </aside>
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default CartPage;
