import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ChevronDown,
  Heart,
  Loader2,
  Minus,
  PackageX,
  Play,
  Plus,
  RotateCcw,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Star,
  Store,
  Truck,
} from "lucide-react";
import { toast } from "react-hot-toast";
import NavBar from "../Layouts/Navbar";
import Footer from "../Layouts/Footer";
import api from "../../lib/api";
import { effectivePrice, formatAED, formatINR } from "../../lib/format";
import { addToCart, FALLBACK_IMAGE, ProductSummary, useWishlist } from "../../lib/shop";
import { Breadcrumbs, Container, EmptyState, ProductRail, btn } from "../Store/Sections";
import { cn } from "../../lib/util";

interface ProductData extends ProductSummary {
  description?: string;
  shortDescription?: string;
  specifications?: Record<string, string>;
  sku?: string;
  material?: string;
  videos?: Record<string, string | undefined>;
  weight?: { value?: number; unit?: string };
  dimensions?: { length?: number; width?: number; height?: number; unit?: string };
  warranty?: { period?: number; unit?: string; description?: string };
  shippingInfo?: { freeShipping?: boolean; shippingCost?: number };
  tags?: string[];
  soldCount?: number;
  categoryId?: { _id: string; name: string };
  subCategoryId?: { _id: string; name: string };
  seller?: { _id: string; name: string; companyName?: string; INR?: string; DXB?: string; Image?: string; profileImage?: string; city?: string };
}

type Media = { type: "image" | "video"; url: string };

const COLOR_HEX: Record<string, string> = {
  black: "#111", white: "#fff", grey: "#9ca3af", gray: "#9ca3af", silver: "#c0c0c0", gold: "#d4af37", red: "#c8102e",
  blue: "#1d4ed8", navy: "#1e2a4a", indigo: "#3f4a8a", green: "#2f6b3a", olive: "#6b6b3a", pink: "#f4a6c0", beige: "#e8dcc4",
  sand: "#d8c3a0", brown: "#6b4423", champagne: "#f1e4c8", yellow: "#f2c94c", orange: "#f2994a", purple: "#7c3aed",
};
const swatch = (c: string) => COLOR_HEX[c.toLowerCase().split(" ")[0]];

const Accordion: React.FC<React.PropsWithChildren<{ title: string; defaultOpen?: boolean }>> = ({ title, defaultOpen, children }) => {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="border-b border-line">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between py-5 text-left" aria-expanded={open}>
        <span className="text-sm font-semibold uppercase tracking-wider">{title}</span>
        <ChevronDown className={cn("h-5 w-5 transition", open && "rotate-180")} />
      </button>
      {open && <div className="pb-6 text-sm leading-relaxed text-ink-soft">{children}</div>}
    </div>
  );
};

const ZoomImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [origin, setOrigin] = useState<string | null>(null);
  return (
    <div
      className="relative aspect-[3/4] w-full cursor-zoom-in overflow-hidden rounded-md bg-canvas"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
      }}
      onMouseLeave={() => setOrigin(null)}
    >
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover transition-transform duration-200"
        style={origin ? { transform: "scale(1.9)", transformOrigin: origin } : undefined}
        onError={(e) => ((e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE)}
      />
    </div>
  );
};

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const wishlist = useWishlist();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const [related, setRelated] = useState<ProductSummary[]>([]);
  const [similar, setSimilar] = useState<ProductSummary[]>([]);
  const mobileRail = useRef<HTMLDivElement>(null);
  const buyBox = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setProduct(null);
    setActive(0);
    setQty(1);
    setSize("");
    setSizeError(false);
    api
      .get(`/get-product/${id}`)
      .then((r) => {
        if (!alive) return;
        const p: ProductData = r.data?.product;
        setProduct(p || null);
        if (p?.colors?.length) setColor(p.colors[0]);
        if (p?.sizes?.length === 1) setSize(p.sizes[0]);
        if (p) document.title = `${p.name} · FBB Store`;
      })
      .catch(() => alive && setProduct(null))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(() => {
    if (!product) return;
    const sub = product.subCategoryId?._id;
    const sel = product.seller?._id;
    if (sub && sel) {
      api
        .get(`/get-related/${sel}/${sub}`)
        .then((r) => setRelated((r.data?.products || []).filter((p: ProductSummary) => p._id !== product._id)))
        .catch(() => setRelated([]));
    }
    if (product.categoryId?._id) {
      api
        .get("/products", { params: { category: product.categoryId._id, limit: 16 } })
        .then((r) => setSimilar((r.data?.products || []).filter((p: ProductSummary) => p._id !== product._id)))
        .catch(() => setSimilar([]));
    }
  }, [product]);

  const media: Media[] = useMemo(() => {
    if (!product) return [];
    const imgs = [product.images?.image1, product.images?.image2, product.images?.image3, product.images?.image4].filter(Boolean) as string[];
    const vids = Object.values(product.videos || {}).filter(Boolean) as string[];
    const list: Media[] = [...imgs.map((url) => ({ type: "image" as const, url })), ...vids.map((url) => ({ type: "video" as const, url }))];
    return list.length ? list : [{ type: "image", url: FALLBACK_IMAGE }];
  }, [product]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <NavBar />
        <Container className="grid flex-1 gap-10 py-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="skeleton aspect-[3/4] w-full rounded-md lg:aspect-[4/5]" />
          </div>
          <div className="space-y-4 lg:col-span-5">
            <div className="skeleton h-3 w-24" />
            <div className="skeleton h-9 w-4/5" />
            <div className="skeleton h-7 w-32" />
            <div className="skeleton mt-8 h-12 w-full" />
            <div className="skeleton h-14 w-full" />
          </div>
        </Container>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col">
        <NavBar />
        <main className="flex-1">
          <EmptyState
            className="py-28"
            icon={<PackageX className="h-7 w-7" />}
            title="This product isn't available"
            message="It may have sold out or been removed by the seller."
            action={<Link to="/shop" className={btn.primary}>Continue shopping</Link>}
          />
        </main>
        <Footer />
      </div>
    );
  }

  const { price, original, percentOff } = effectivePrice(product);
  const stock = Number(product.stock) || 0;
  const soldOut = stock <= 0;
  const saved = wishlist.has(product._id);
  const sellerName = product.seller?.companyName || product.seller?.name || "";
  const needsSize = (product.sizes?.length || 0) > 0;
  const ratingAvg = product.rating?.average || 0;
  const ratingCount = product.rating?.count || 0;

  const handleAdd = async () => {
    if (needsSize && !size) {
      setSizeError(true);
      buyBox.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      toast.error("Please select a size");
      return;
    }
    setAdding(true);
    await addToCart(product._id, { quantity: qty, color, size, openBag: true });
    setAdding(false);
  };

  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: product.name, url: window.location.href });
      else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied");
      }
    } catch {
      /* dismissed */
    }
  };

  const whatsapp = product.seller?.INR
    ? `https://wa.me/${product.seller.INR.replace(/\D/g, "")}?text=${encodeURIComponent(
        `Hi, I'm interested in "${product.name}" (${formatINR(price)}) on FBB Store: ${window.location.href}`
      )}`
    : null;

  const specs: [string, string][] = [
    ...(product.material ? [["Material", product.material] as [string, string]] : []),
    ...Object.entries(product.specifications || {}).filter(([, v]) => v),
    ...(product.weight?.value ? [["Weight", `${product.weight.value} ${product.weight.unit || ""}`] as [string, string]] : []),
    ...(product.dimensions?.length
      ? [["Dimensions", `${product.dimensions.length} × ${product.dimensions.width} × ${product.dimensions.height} ${product.dimensions.unit || ""}`] as [string, string]]
      : []),
    ...(product.warranty?.period ? [["Warranty", `${product.warranty.period} ${product.warranty.unit || ""}`] as [string, string]] : []),
    ...(product.sku ? [["SKU", product.sku] as [string, string]] : []),
  ];

  const scrollMobileTo = (i: number) => {
    const el = mobileRail.current;
    if (el) el.scrollTo({ left: el.clientWidth * i, behavior: "smooth" });
  };

  const AddButton = ({ className }: { className?: string }) => (
    <button onClick={handleAdd} disabled={adding || soldOut} className={cn(btn.primary, "h-14 w-full text-[15px]", className)}>
      {adding ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShoppingBag className="h-5 w-5" />}
      {soldOut ? "Sold out" : adding ? "Adding…" : "Add to bag"}
    </button>
  );

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <NavBar />
      <main className="flex-1 pb-24 lg:pb-0">
        <Container className="pt-4 sm:pt-6">
          <Breadcrumbs
            items={[
              { label: "Home", to: "/" },
              ...(product.categoryId ? [{ label: product.categoryId.name, to: `/shop/category/${product.categoryId._id}` }] : []),
              ...(product.subCategoryId ? [{ label: product.subCategoryId.name, to: `/shop/subcategory/${product.subCategoryId._id}` }] : []),
              { label: product.name },
            ]}
          />
        </Container>

        <Container className="grid gap-8 pt-4 lg:grid-cols-12 lg:gap-12 lg:pt-6">
          {/* gallery */}
          <div className="lg:col-span-7">
            {/* mobile swipe */}
            <div className="relative -mx-4 sm:-mx-6 lg:hidden">
              <div
                ref={mobileRail}
                className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
                onScroll={(e) => {
                  const el = e.currentTarget;
                  setActive(Math.round(el.scrollLeft / el.clientWidth));
                }}
              >
                {media.map((m, i) => (
                  <div key={i} className="aspect-[3/4] w-full shrink-0 snap-center bg-canvas">
                    {m.type === "image" ? (
                      <img src={m.url} alt={`${product.name} ${i + 1}`} className="h-full w-full object-cover" loading={i === 0 ? "eager" : "lazy"} />
                    ) : (
                      <video src={m.url} controls playsInline className="h-full w-full object-contain" />
                    )}
                  </div>
                ))}
              </div>
              {media.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
                  {media.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => scrollMobileTo(i)}
                      aria-label={`Image ${i + 1}`}
                      className={cn("h-1.5 rounded-full bg-ink transition-all", i === active ? "w-6" : "w-1.5 opacity-30")}
                    />
                  ))}
                </div>
              )}
              {percentOff > 0 && (
                <span className="absolute left-4 top-4 rounded-sm bg-sale px-2.5 py-1 text-xs font-bold text-white">-{percentOff}%</span>
              )}
            </div>

            {/* desktop */}
            <div className="hidden gap-4 lg:flex">
              {media.length > 1 && (
                <div className="flex w-20 shrink-0 flex-col gap-3">
                  {media.map((m, i) => (
                    <button
                      key={i}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => setActive(i)}
                      aria-label={`View ${m.type} ${i + 1}`}
                      className={cn(
                        "relative aspect-[3/4] overflow-hidden rounded border-2 bg-canvas transition",
                        i === active ? "border-ink" : "border-transparent opacity-70 hover:opacity-100"
                      )}
                    >
                      {m.type === "image" ? (
                        <img src={m.url} alt="" className="h-full w-full object-cover" loading="lazy" />
                      ) : (
                        <span className="grid h-full w-full place-items-center bg-ink/80 text-white">
                          <Play className="h-5 w-5" fill="currentColor" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
              <div className="relative flex-1">
                {media[active]?.type === "video" ? (
                  <div className="aspect-[3/4] w-full overflow-hidden rounded-md bg-black">
                    <video src={media[active].url} controls autoPlay muted playsInline className="h-full w-full object-contain" />
                  </div>
                ) : (
                  <ZoomImage src={media[active]?.url || FALLBACK_IMAGE} alt={product.name} />
                )}
                {percentOff > 0 && (
                  <span className="pointer-events-none absolute left-4 top-4 rounded-sm bg-sale px-2.5 py-1 text-sm font-bold text-white">-{percentOff}%</span>
                )}
              </div>
            </div>
          </div>

          {/* buy box */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-[140px]">
              {sellerName && (
                <Link to={`/shop/seller/${product.seller!._id}`} className="text-xs font-semibold uppercase tracking-[0.18em] text-muted hover:text-ink">
                  {product.brand || sellerName}
                </Link>
              )}
              <h1 className="mt-2 font-display text-[28px] font-semibold leading-tight sm:text-4xl">{product.name}</h1>

              {ratingCount > 0 && (
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <div className="flex" aria-label={`Rated ${ratingAvg.toFixed(1)} out of 5`}>
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} className={cn("h-4 w-4", i < Math.round(ratingAvg) ? "fill-ink text-ink" : "fill-line text-line")} />
                    ))}
                  </div>
                  <span className="font-medium">{ratingAvg.toFixed(1)}</span>
                  <span className="text-muted">({ratingCount} reviews)</span>
                </div>
              )}

              <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className={cn("text-3xl font-bold", percentOff > 0 ? "text-sale" : "text-ink")}>{formatINR(price)}</span>
                {percentOff > 0 && (
                  <>
                    <span className="text-lg text-muted line-through">{formatINR(original)}</span>
                    <span className="rounded-sm bg-sale-soft px-2 py-0.5 text-sm font-bold text-sale">Save {formatINR(original - price)}</span>
                  </>
                )}
              </div>
              <p className="mt-1 text-xs text-muted">
                GST (18%) added at checkout{product.priceAED ? ` · approx. ${formatAED(effectivePrice(product, "AED").price)}` : ""}
              </p>

              {product.shortDescription && <p className="mt-5 text-[15px] leading-relaxed text-ink-soft">{product.shortDescription}</p>}

              <div ref={buyBox} className="mt-6 space-y-6">
                {!!product.colors?.length && (
                  <div>
                    <p className="mb-3 text-sm">
                      <span className="font-semibold">Colour:</span> {color}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((c) => {
                        const hex = swatch(c);
                        return (
                          <button
                            key={c}
                            onClick={() => setColor(c)}
                            aria-pressed={color === c}
                            className={cn(
                              "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition",
                              color === c ? "border-ink ring-1 ring-ink" : "border-line hover:border-ink"
                            )}
                          >
                            {hex && <span className="h-4 w-4 rounded-full border border-black/10" style={{ background: hex }} />}
                            {c}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {needsSize && (
                  <div>
                    <div className="mb-3 flex items-center justify-between text-sm">
                      <p>
                        <span className="font-semibold">Size:</span> {size || <span className={cn(sizeError ? "font-medium text-sale" : "text-muted")}>Please select</span>}
                      </p>
                    </div>
                    <div className={cn("grid grid-cols-4 gap-2 sm:grid-cols-5", sizeError && !size && "rounded-md ring-2 ring-sale ring-offset-4")}>
                      {product.sizes!.map((s) => (
                        <button
                          key={s}
                          onClick={() => {
                            setSize(s);
                            setSizeError(false);
                          }}
                          aria-pressed={size === s}
                          className={cn(
                            "h-12 rounded-md border text-sm font-medium transition",
                            size === s ? "border-ink bg-ink text-white" : "border-line hover:border-ink"
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <div className="flex h-12 items-center rounded-md border border-line">
                    <button onClick={() => setQty((n) => Math.max(1, n - 1))} disabled={qty <= 1} aria-label="Decrease quantity" className="grid h-full w-12 place-items-center disabled:opacity-30">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-semibold" aria-live="polite">{qty}</span>
                    <button onClick={() => setQty((n) => Math.min(stock || 1, n + 1))} disabled={qty >= stock} aria-label="Increase quantity" className="grid h-full w-12 place-items-center disabled:opacity-30">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <p className={cn("text-sm font-medium", soldOut ? "text-sale" : stock <= 5 ? "text-brand" : "text-ok")}>
                    {soldOut ? "Out of stock" : stock <= 5 ? `Hurry, only ${stock} left` : "In stock"}
                  </p>
                </div>

                <div className="flex gap-3">
                  <AddButton className="flex-1" />
                  <button
                    onClick={() => wishlist.toggle(product._id)}
                    aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
                    aria-pressed={saved}
                    className="grid h-14 w-14 shrink-0 place-items-center rounded-md border border-line transition hover:border-ink"
                  >
                    <Heart className={cn("h-6 w-6", saved && "fill-sale text-sale")} strokeWidth={1.5} />
                  </button>
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  {whatsapp && (
                    <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 font-medium underline-offset-4 hover:underline">
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-[#25D366]" aria-hidden>
                        <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.41-.08-.13-.27-.2-.57-.35M12.05 21.8a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88a9.88 9.88 0 0 1 9.88 9.89c0 5.45-4.44 9.88-9.89 9.88M20.46 3.49A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.69 1.45c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.17-3.48-8.42" />
                      </svg>
                      Ask the seller
                    </a>
                  )}
                  <button onClick={share} className="flex items-center gap-2 font-medium underline-offset-4 hover:underline">
                    <Share2 className="h-4 w-4" /> Share
                  </button>
                </div>
              </div>

              <ul className="mt-8 grid gap-4 rounded-md bg-canvas p-5 text-sm">
                <li className="flex gap-3">
                  <Truck className="h-5 w-5 shrink-0" strokeWidth={1.5} />
                  <span>
                    <span className="font-semibold">
                      {product.shippingInfo?.freeShipping || !product.shippingInfo?.shippingCost ? "Free delivery" : `Delivery ${formatINR(product.shippingInfo.shippingCost)}`}
                    </span>
                    <span className="block text-muted">Cash on delivery and online payment available</span>
                  </span>
                </li>
                <li className="flex gap-3">
                  <RotateCcw className="h-5 w-5 shrink-0" strokeWidth={1.5} />
                  <span>
                    <span className="font-semibold">Easy returns</span>
                    <span className="block text-muted">Request a return from your orders after delivery</span>
                  </span>
                </li>
                <li className="flex gap-3">
                  <ShieldCheck className="h-5 w-5 shrink-0" strokeWidth={1.5} />
                  <span>
                    <span className="font-semibold">Secure checkout</span>
                    <span className="block text-muted">Payments protected by Razorpay</span>
                  </span>
                </li>
              </ul>

              <div className="mt-6 border-t border-line">
                <Accordion title="Product details" defaultOpen>
                  <p className="whitespace-pre-line">{product.description || product.shortDescription || "No description provided."}</p>
                  {!!product.tags?.length && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {product.tags.map((t) => (
                        <Link key={t} to={`/shop?q=${encodeURIComponent(t)}`} className="rounded-full bg-canvas px-3 py-1 text-xs hover:bg-line">
                          {t}
                        </Link>
                      ))}
                    </div>
                  )}
                </Accordion>
                {specs.length > 0 && (
                  <Accordion title="Specifications">
                    <dl className="divide-y divide-line">
                      {specs.map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-6 py-2.5">
                          <dt className="text-muted">{k}</dt>
                          <dd className="text-right font-medium text-ink">{v}</dd>
                        </div>
                      ))}
                    </dl>
                  </Accordion>
                )}
                <Accordion title="Delivery & returns">
                  <p>Orders are packed and dispatched by the seller, usually within 1–3 business days. You can track every order from <Link to="/orders" className="underline">My orders</Link>.</p>
                  <p className="mt-3">If something isn't right, open the order and choose <em>Request return</em>. Cancellations are possible until the order ships.</p>
                </Accordion>
                {product.seller && (
                  <Accordion title="Sold by">
                    <Link to={`/shop/seller/${product.seller._id}`} className="flex items-center gap-4 rounded-md border border-line p-4 hover:border-ink">
                      <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-canvas">
                        {product.seller.profileImage || product.seller.Image ? (
                          <img src={product.seller.profileImage || product.seller.Image} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <Store className="h-5 w-5" />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block font-semibold text-ink">{sellerName}</span>
                        <span className="block text-xs text-muted">Verified seller{product.seller.city ? ` · ${product.seller.city}` : ""} · View store</span>
                      </span>
                    </Link>
                  </Accordion>
                )}
              </div>
            </div>
          </div>
        </Container>

        {related.length > 0 && (
          <Container className="pt-16">
            <ProductRail title={`More from ${sellerName || "this seller"}`} products={related.slice(0, 12)} action={product.seller ? { label: "View store", to: `/shop/seller/${product.seller._id}` } : undefined} />
          </Container>
        )}
        {similar.length > 0 && (
          <Container className="py-16">
            <ProductRail
              title="You may also like"
              products={similar.filter((p) => !related.some((r) => r._id === p._id)).slice(0, 12)}
              action={product.categoryId ? { label: "Shop all", to: `/shop/category/${product.categoryId._id}` } : undefined}
            />
          </Container>
        )}
      </main>

      {/* sticky mobile buy bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.2)] lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-muted">{size ? `Size ${size}` : needsSize ? "Select a size" : product.name}</p>
            <p className={cn("text-lg font-bold leading-tight", percentOff > 0 && "text-sale")}>{formatINR(price)}</p>
          </div>
          <AddButton className="h-12 w-auto flex-[1.4] px-4" />
        </div>
      </div>

      <Footer />
    </div>
  );
}
