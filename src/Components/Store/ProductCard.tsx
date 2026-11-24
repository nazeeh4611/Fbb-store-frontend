import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Plus, Loader2 } from "lucide-react";
import { effectivePrice, formatINR } from "../../lib/format";
import { addToCart, FALLBACK_IMAGE, productImages, ProductSummary, useWishlist } from "../../lib/shop";
import { cn } from "../../lib/util";

interface Props {
  product: ProductSummary;
  /** Hide the quick-add strip (e.g. very small rails). */
  compact?: boolean;
  className?: string;
  priority?: boolean;
}

const isNew = (createdAt?: string) => !!createdAt && Date.now() - new Date(createdAt).getTime() < 1000 * 60 * 60 * 24 * 21;

/** Large retail product tile: 3:4 image, hover swap, wishlist, sale pricing and quick add. */
const ProductCard: React.FC<Props> = ({ product, compact = false, className, priority = false }) => {
  const wishlist = useWishlist();
  const [adding, setAdding] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  const imgs = productImages(product);
  const primary = !imgError && imgs[0] ? imgs[0] : FALLBACK_IMAGE;
  const secondary = imgs[1];
  const { price, original, percentOff } = effectivePrice(product);
  const outOfStock = typeof product.stock === "number" && product.stock <= 0;
  const lowStock = typeof product.stock === "number" && product.stock > 0 && product.stock <= 5;
  const saved = wishlist.has(product._id);
  const sizes = product.sizes || [];
  const brand =
    product.brand ||
    (typeof product.seller === "object" ? product.seller?.companyName || product.seller?.name : undefined);

  const quickAdd = async (e: React.MouseEvent, size?: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (adding || outOfStock) return;
    setAdding(size || "one");
    await addToCart(product._id, { size, color: product.colors?.[0], openBag: true });
    setAdding(null);
  };

  return (
    <Link
      to={`/product/${product._id}`}
      className={cn("group block min-w-0 focus-visible:outline-offset-4", className)}
      aria-label={`${product.name}, ${formatINR(price)}`}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-canvas">
        <img
          src={primary}
          alt={product.name}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onError={() => setImgError(true)}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition duration-500",
            secondary ? "group-hover:opacity-0" : "group-hover:scale-[1.03]"
          )}
        />
        {secondary && (
          <img
            src={secondary}
            alt=""
            aria-hidden
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 group-hover:opacity-100"
          />
        )}

        {/* badges */}
        <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
          {percentOff > 0 && (
            <span className="rounded-sm bg-sale px-2 py-1 text-[11px] font-bold leading-none text-white">-{percentOff}%</span>
          )}
          {isNew(product.createdAt) && percentOff === 0 && (
            <span className="rounded-sm bg-white px-2 py-1 text-[11px] font-bold uppercase leading-none tracking-wide text-ink">New</span>
          )}
          {outOfStock && (
            <span className="rounded-sm bg-ink/80 px-2 py-1 text-[11px] font-semibold leading-none text-white">Sold out</span>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            wishlist.toggle(product._id);
          }}
          aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
          aria-pressed={saved}
          className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-ink shadow-sm transition hover:scale-105 hover:bg-white"
        >
          <Heart className={cn("h-[18px] w-[18px]", saved && "fill-sale text-sale")} strokeWidth={1.75} />
        </button>

        {/* quick add (desktop hover) */}
        {!compact && !outOfStock && (
          <div className="pointer-events-none absolute inset-x-2 bottom-2 hidden translate-y-2 opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 md:block">
            <div className="rounded-md bg-white/95 p-2 shadow-lg backdrop-blur">
              {sizes.length > 0 ? (
                <>
                  <p className="mb-1.5 text-center text-[11px] font-semibold uppercase tracking-wider text-muted">Quick add · select size</p>
                  <div className="flex flex-wrap justify-center gap-1">
                    {sizes.slice(0, 8).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={(e) => quickAdd(e, s)}
                        className="min-w-9 rounded border border-line px-2 py-1.5 text-xs font-medium text-ink transition hover:border-ink hover:bg-ink hover:text-white"
                      >
                        {adding === s ? <Loader2 className="mx-auto h-3.5 w-3.5 animate-spin" /> : s}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  onClick={(e) => quickAdd(e)}
                  className="flex w-full items-center justify-center gap-1.5 rounded bg-ink py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-black"
                >
                  {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add to bag
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="pt-3">
        {brand && <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-muted">{brand}</p>}
        <h3 className="mt-0.5 line-clamp-2 text-sm leading-snug text-ink group-hover:underline group-hover:underline-offset-2">
          {product.name}
        </h3>
        <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className={cn("text-[15px] font-bold", percentOff > 0 ? "text-sale" : "text-ink")}>{formatINR(price)}</span>
          {percentOff > 0 && <span className="text-xs text-muted line-through">{formatINR(original)}</span>}
        </div>
        {(product.colors?.length || 0) > 1 && (
          <p className="mt-1 text-xs text-muted">{product.colors!.length} colours</p>
        )}
        {lowStock && <p className="mt-1 text-xs font-medium text-brand">Only {product.stock} left</p>}
      </div>
    </Link>
  );
};

export default ProductCard;

export const ProductCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("min-w-0", className)} aria-hidden>
    <div className="skeleton aspect-[3/4] w-full rounded-md" />
    <div className="skeleton mt-3 h-3 w-1/3" />
    <div className="skeleton mt-2 h-4 w-4/5" />
    <div className="skeleton mt-2 h-4 w-1/4" />
  </div>
);
