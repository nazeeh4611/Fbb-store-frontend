import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, ChevronRight as Crumb } from "lucide-react";
import ProductCard, { ProductCardSkeleton } from "./ProductCard";
import { ProductSummary } from "../../lib/shop";
import { cn } from "../../lib/util";

export const Container: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <div className={cn("mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10", className)}>{children}</div>
);

export const SectionHeading: React.FC<{
  title: string;
  eyebrow?: string;
  action?: { label: string; to: string };
  className?: string;
  children?: React.ReactNode;
}> = ({ title, eyebrow, action, className, children }) => (
  <div className={cn("mb-5 flex items-end justify-between gap-4 sm:mb-7", className)}>
    <div className="min-w-0">
      {eyebrow && <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted">{eyebrow}</p>}
      <h2 className="font-display text-2xl font-semibold uppercase tracking-wide text-ink sm:text-3xl">{title}</h2>
    </div>
    <div className="flex shrink-0 items-center gap-2">
      {children}
      {action && (
        <Link
          to={action.to}
          className="group inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-ink underline-offset-4 hover:underline"
        >
          {action.label}
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  </div>
);

/** Horizontally scrolling row with arrow buttons on desktop and swipe on touch. */
export const Rail: React.FC<{
  children: React.ReactNode;
  itemClassName?: string;
  ariaLabel?: string;
  title?: string;
  eyebrow?: string;
  action?: { label: string; to: string };
}> = ({ children, itemClassName = "w-[46%] sm:w-[31%] lg:w-[23.5%]", ariaLabel, title, eyebrow, action }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const update = () => {
    const el = ref.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
  };
  useEffect(() => {
    update();
    const el = ref.current;
    el?.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [children]);

  const scroll = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.9, behavior: "smooth" });

  const arrows = (
    <div className="hidden gap-2 md:flex">
      {[-1, 1].map((d) => (
        <button
          key={d}
          type="button"
          onClick={() => scroll(d as 1 | -1)}
          disabled={d === -1 ? edges.start : edges.end}
          aria-label={d === -1 ? "Scroll left" : "Scroll right"}
          className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white text-ink transition hover:border-ink disabled:cursor-default disabled:opacity-30 disabled:hover:border-line"
        >
          {d === -1 ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </button>
      ))}
    </div>
  );

  return (
    <div>
      {title && (
        <SectionHeading title={title} eyebrow={eyebrow} action={action}>
          {arrows}
        </SectionHeading>
      )}
      <div
        ref={ref}
        aria-label={ariaLabel || title}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 sm:-mx-6 sm:gap-5 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:scroll-px-0 lg:px-0"
      >
        {React.Children.map(children, (child) => <div className={cn("shrink-0 snap-start", itemClassName)}>{child}</div>)}
      </div>
    </div>
  );
};

export const ProductRail: React.FC<{
  title: string;
  eyebrow?: string;
  action?: { label: string; to: string };
  products: ProductSummary[];
  loading?: boolean;
}> = ({ title, eyebrow, action, products, loading }) => {
  if (!loading && products.length === 0) return null;
  return (
    <Rail title={title} eyebrow={eyebrow} action={action}>
      {loading
        ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
        : products.map((p) => <ProductCard key={p._id} product={p} />)}
    </Rail>
  );
};

export const ProductGrid: React.FC<{
  products: ProductSummary[];
  loading?: boolean;
  columns?: 2 | 3 | 4;
  skeletons?: number;
}> = ({ products, loading, columns = 4, skeletons = 8 }) => (
  <div
    className={cn(
      "grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10",
      columns === 4 && "md:grid-cols-3 xl:grid-cols-4",
      columns === 3 && "md:grid-cols-3",
      columns === 2 && "md:grid-cols-2 md:gap-x-8"
    )}
  >
    {loading
      ? Array.from({ length: skeletons }).map((_, i) => <ProductCardSkeleton key={i} />)
      : products.map((p, i) => <ProductCard key={p._id} product={p} priority={i < 4} />)}
  </div>
);

export const Breadcrumbs: React.FC<{ items: { label: string; to?: string }[]; className?: string }> = ({ items, className }) => (
  <nav aria-label="Breadcrumb" className={cn("text-xs text-muted", className)}>
    <ol className="flex flex-wrap items-center gap-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-center gap-1">
          {i > 0 && <Crumb className="h-3 w-3" aria-hidden />}
          {item.to && i < items.length - 1 ? (
            <Link to={item.to} className="hover:text-ink hover:underline">
              {item.label}
            </Link>
          ) : (
            <span className={i === items.length - 1 ? "text-ink" : ""}>{item.label}</span>
          )}
        </li>
      ))}
    </ol>
  </nav>
);

export const EmptyState: React.FC<{
  icon?: React.ReactNode;
  title: string;
  message?: string;
  action?: React.ReactNode;
  className?: string;
}> = ({ icon, title, message, action, className }) => (
  <div className={cn("flex flex-col items-center px-6 py-16 text-center", className)}>
    {icon && <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-canvas text-muted">{icon}</div>}
    <h3 className="font-display text-xl font-semibold text-ink">{title}</h3>
    {message && <p className="mt-2 max-w-md text-sm text-muted">{message}</p>}
    {action && <div className="mt-6">{action}</div>}
  </div>
);

/** Consistent button styles for the storefront. */
export const btn = {
  primary:
    "inline-flex items-center justify-center gap-2 rounded-md bg-ink px-6 py-3.5 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50",
  secondary:
    "inline-flex items-center justify-center gap-2 rounded-md border border-ink bg-white px-6 py-3.5 text-sm font-semibold uppercase tracking-wider text-ink transition hover:bg-ink hover:text-white disabled:cursor-not-allowed disabled:opacity-50",
  ghost:
    "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-canvas disabled:opacity-50",
};
