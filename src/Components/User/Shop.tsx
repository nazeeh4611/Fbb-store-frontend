import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Check, ChevronDown, LayoutGrid, Rows3, SearchX, SlidersHorizontal, X } from "lucide-react";
import NavBar from "../Layouts/Navbar";
import Footer from "../Layouts/Footer";
import api from "../../lib/api";
import { effectivePrice, formatINR } from "../../lib/format";
import { CategoryNode, FALLBACK_IMAGE, ProductSummary, sortForMenu, useCategoryTree } from "../../lib/shop";
import { Breadcrumbs, Container, EmptyState, ProductGrid, btn } from "../Store/Sections";
import { cn } from "../../lib/util";

interface Seller {
  _id: string;
  name: string;
  companyName?: string;
  profileImage?: string;
  city?: string;
  categories?: string[];
}

const SORTS = [
  { value: "featured", label: "Recommended" },
  { value: "new", label: "Newest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "discount", label: "Biggest discount" },
  { value: "rating", label: "Top rated" },
];

const PRICE_BANDS: [number, number | null][] = [
  [0, 999],
  [1000, 2499],
  [2500, 4999],
  [5000, 9999],
  [10000, null],
];

const PAGE = 24;
const sizeRank = (s: string) => {
  const order = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];
  const i = order.indexOf(s.toUpperCase());
  if (i >= 0) return i;
  const n = parseFloat(s);
  return Number.isNaN(n) ? 100 : 20 + n;
};
const csv = (v: string | null) => (v ? v.split(",").filter(Boolean) : []);
const brandOf = (p: ProductSummary) =>
  p.brand || (typeof p.seller === "object" ? p.seller?.companyName || p.seller?.name : "") || "";

/* ---------------------------------------------------------- filter UI */

const FilterGroup: React.FC<React.PropsWithChildren<{ title: string; count?: number; defaultOpen?: boolean }>> = ({
  title,
  count,
  defaultOpen = true,
  children,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-line py-4">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between text-left" aria-expanded={open}>
        <span className="text-sm font-semibold uppercase tracking-wider">
          {title}
          {count ? <span className="ml-1.5 text-muted">({count})</span> : null}
        </span>
        <ChevronDown className={cn("h-4 w-4 transition", open && "rotate-180")} />
      </button>
      {open && <div className="pt-3">{children}</div>}
    </div>
  );
};

const CheckRow: React.FC<{ checked: boolean; onChange: () => void; label: React.ReactNode; count?: number }> = ({
  checked,
  onChange,
  label,
  count,
}) => (
  <label className="flex cursor-pointer items-center gap-3 py-1.5 text-sm">
    <span
      className={cn(
        "grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[3px] border transition",
        checked ? "border-ink bg-ink text-white" : "border-[#bdbdbd] bg-white"
      )}
    >
      {checked && <Check className="h-3 w-3" strokeWidth={3} />}
    </span>
    <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
    <span className="flex-1">{label}</span>
    {count !== undefined && <span className="text-xs text-muted">{count}</span>}
  </label>
);

/* --------------------------------------------------------------- page */

export default function ShopLayout(): JSX.Element {
  const navigate = useNavigate();
  const { categoryId, subcategoryId, sellerId } = useParams<{ categoryId?: string; subcategoryId?: string; sellerId?: string }>();
  const [params, setParams] = useSearchParams();
  const { categories, ready: catsReady } = useCategoryTree();

  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [visible, setVisible] = useState(PAGE);
  const [drawer, setDrawer] = useState(false);
  const [dense, setDense] = useState<boolean>(() => {
    try {
      return localStorage.getItem("shop:dense") === "1";
    } catch {
      return false;
    }
  });
  const [minInput, setMinInput] = useState(params.get("min") || "");
  const [maxInput, setMaxInput] = useState(params.get("max") || "");

  const q = params.get("q") || "";
  const sort = params.get("sort") || "featured";
  const sale = params.get("sale") === "1";
  const trending = params.get("trending") === "true";
  const inStock = params.get("stock") === "1";
  const min = Number(params.get("min")) || 0;
  const max = Number(params.get("max")) || 0;
  const selSizes = csv(params.get("size"));
  const selColors = csv(params.get("color"));
  const selBrands = csv(params.get("brand"));
  const sellerFilter = sellerId || params.get("seller") || "";

  useEffect(() => {
    setMinInput(params.get("min") || "");
    setMaxInput(params.get("max") || "");
  }, [params]);

  useEffect(() => {
    api
      .get("/sellers")
      .then((r) => setSellers(r.data?.sellers || []))
      .catch(() => {});
  }, []);

  /* context: which category/subcategory are we in? */
  const ctx = useMemo(() => {
    let category: CategoryNode | undefined;
    let sub: { _id: string; name: string; image?: string } | undefined;
    if (categoryId) category = categories.find((c) => c._id === categoryId);
    if (subcategoryId) {
      for (const c of categories) {
        const s = c.subcategories?.find((x) => x._id === subcategoryId);
        if (s) {
          category = c;
          sub = s;
          break;
        }
      }
    }
    return { category, sub };
  }, [categories, categoryId, subcategoryId]);

  const seller = sellers.find((s) => s._id === sellerFilter);
  const sellerName = seller ? seller.companyName || seller.name : "";

  /* fetch */
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(false);
    setVisible(PAGE);
    const base: Record<string, string | number | boolean> = { limit: 100 };
    if (subcategoryId) base.subcategory = subcategoryId;
    else if (categoryId) base.category = categoryId;
    if (sellerFilter) base.seller = sellerFilter;
    if (q) base.search = q;
    if (trending) base.trending = true;

    (async () => {
      try {
        const first = await api.get("/products", { params: { ...base, page: 1 } });
        let list: ProductSummary[] = first.data?.products || [];
        const pages = Math.min(first.data?.totalPages || 1, 5);
        if (pages > 1) {
          const rest = await Promise.all(
            Array.from({ length: pages - 1 }, (_, i) => api.get("/products", { params: { ...base, page: i + 2 } }))
          );
          rest.forEach((r) => (list = list.concat(r.data?.products || [])));
        }
        if (!alive) return;
        setProducts(list);
        setTotal(first.data?.total ?? list.length);
      } catch {
        if (alive) {
          setError(true);
          setProducts([]);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [categoryId, subcategoryId, sellerFilter, q, trending]);

  /* facets from the fetched set */
  const facets = useMemo(() => {
    const sizes = new Map<string, number>();
    const colors = new Map<string, number>();
    const brands = new Map<string, number>();
    let saleCount = 0;
    for (const p of products) {
      p.sizes?.forEach((s) => sizes.set(s, (sizes.get(s) || 0) + 1));
      p.colors?.forEach((c) => colors.set(c, (colors.get(c) || 0) + 1));
      const b = brandOf(p);
      if (b) brands.set(b, (brands.get(b) || 0) + 1);
      if (effectivePrice(p).percentOff > 0) saleCount++;
    }
    return {
      sizes: [...sizes.entries()].sort((a, b) => sizeRank(a[0]) - sizeRank(b[0])),
      colors: [...colors.entries()].sort((a, b) => b[1] - a[1]),
      brands: [...brands.entries()].sort((a, b) => a[0].localeCompare(b[0])),
      saleCount,
    };
  }, [products]);

  /* filter + sort */
  const results = useMemo(() => {
    let list = products.filter((p) => {
      const { price, percentOff } = effectivePrice(p);
      if (sale && percentOff <= 0) return false;
      if (inStock && !(Number(p.stock) > 0)) return false;
      if (min && price < min) return false;
      if (max && price > max) return false;
      if (selSizes.length && !p.sizes?.some((s) => selSizes.includes(s))) return false;
      if (selColors.length && !p.colors?.some((c) => selColors.includes(c))) return false;
      if (selBrands.length && !selBrands.includes(brandOf(p))) return false;
      return true;
    });
    const price = (p: ProductSummary) => effectivePrice(p).price;
    switch (sort) {
      case "new":
        list = [...list].sort((a, b) => +new Date(b.createdAt || 0) - +new Date(a.createdAt || 0));
        break;
      case "price-asc":
        list = [...list].sort((a, b) => price(a) - price(b));
        break;
      case "price-desc":
        list = [...list].sort((a, b) => price(b) - price(a));
        break;
      case "discount":
        list = [...list].sort((a, b) => effectivePrice(b).percentOff - effectivePrice(a).percentOff);
        break;
      case "rating":
        list = [...list].sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0));
        break;
      default:
        list = [...list].sort((a, b) => Number(!!b.trending) - Number(!!a.trending));
    }
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, sale, inStock, min, max, sort, params]);

  /* url helpers */
  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
    setVisible(PAGE);
  };
  const toggleList = (key: string, value: string) => {
    const list = csv(params.get(key));
    setParam(key, (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]).join(",") || null);
  };
  const applyPrice = (lo: string, hi: string) => {
    const next = new URLSearchParams(params);
    lo ? next.set("min", lo) : next.delete("min");
    hi ? next.set("max", hi) : next.delete("max");
    setParams(next, { replace: true });
  };
  const clearFilters = () => {
    const next = new URLSearchParams();
    if (q) next.set("q", q);
    if (sort !== "featured") next.set("sort", sort);
    setParams(next, { replace: true });
  };

  const chips: { label: string; clear: () => void }[] = [
    ...(sale ? [{ label: "On sale", clear: () => setParam("sale", null) }] : []),
    ...(trending ? [{ label: "Trending", clear: () => setParam("trending", null) }] : []),
    ...(inStock ? [{ label: "In stock", clear: () => setParam("stock", null) }] : []),
    ...(min || max
      ? [{ label: `${formatINR(min)} – ${max ? formatINR(max) : "any"}`, clear: () => applyPrice("", "") }]
      : []),
    ...selSizes.map((s) => ({ label: `Size ${s}`, clear: () => toggleList("size", s) })),
    ...selColors.map((c) => ({ label: c, clear: () => toggleList("color", c) })),
    ...selBrands.map((b) => ({ label: b, clear: () => toggleList("brand", b) })),
    ...(params.get("seller") && !sellerId ? [{ label: sellerName || "Seller", clear: () => setParam("seller", null) }] : []),
  ];

  /* titles */
  const title = q
    ? `Results for “${q}”`
    : ctx.sub?.name || ctx.category?.name || sellerName || (sale ? "Sale" : trending ? "Trending now" : sort === "new" ? "New in" : "All products");

  useEffect(() => {
    document.title = `${title} · FBB Store`;
  }, [title]);

  const crumbs = [
    { label: "Home", to: "/" },
    { label: "Shop", to: "/shop" },
    ...(ctx.category ? [{ label: ctx.category.name, to: `/shop/category/${ctx.category._id}` }] : []),
    ...(ctx.sub ? [{ label: ctx.sub.name }] : []),
    ...(sellerId && sellerName ? [{ label: sellerName }] : []),
    ...(!ctx.category && !sellerId && title !== "All products" ? [{ label: title }] : []),
  ];

  const subChips = ctx.category?.subcategories || [];
  const shown = results.slice(0, visible);
  const sellerCats = seller?.categories?.length ? sortForMenu(categories.filter((c) => seller.categories!.includes(c._id))) : [];

  const filterPanel = (
    <div>
      {/* categories */}
      <FilterGroup title="Category">
        <ul className="space-y-0.5 text-sm">
          <li>
            <Link
              to={sellerId ? `/shop/seller/${sellerId}` : "/shop"}
              className={cn("block py-1.5", !categoryId && !subcategoryId ? "font-semibold underline underline-offset-4" : "hover:underline")}
            >
              All categories
            </Link>
          </li>
          {(!catsReady ? [] : sellerCats.length ? sellerCats : sortForMenu(categories)).map((c) => {
            const active = c._id === ctx.category?._id;
            const href = (path: string) => (sellerFilter ? `${path}?seller=${sellerFilter}` : path);
            return (
              <li key={c._id}>
                <Link
                  to={href(`/shop/category/${c._id}`)}
                  className={cn("block py-1.5", active && !ctx.sub ? "font-semibold underline underline-offset-4" : "hover:underline")}
                >
                  {c.name}
                </Link>
                {active && !!c.subcategories?.length && (
                  <ul className="mb-1 ml-3 border-l border-line pl-3">
                    {c.subcategories.map((s) => (
                      <li key={s._id}>
                        <Link
                          to={href(`/shop/subcategory/${s._id}`)}
                          className={cn("block py-1 text-[13px]", s._id === ctx.sub?._id ? "font-semibold text-ink" : "text-ink-soft hover:underline")}
                        >
                          {s.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </FilterGroup>

      <FilterGroup title="Offers & availability">
        <CheckRow checked={sale} onChange={() => setParam("sale", sale ? null : "1")} label={<span className="font-medium text-sale">On sale</span>} count={facets.saleCount} />
        <CheckRow checked={inStock} onChange={() => setParam("stock", inStock ? null : "1")} label="In stock only" />
        <CheckRow checked={trending} onChange={() => setParam("trending", trending ? null : "true")} label="Trending" />
      </FilterGroup>

      <FilterGroup title="Price">
        <div className="space-y-0.5">
          {PRICE_BANDS.map(([lo, hi]) => {
            const active = min === lo && (hi ? max === hi : !max);
            return (
              <CheckRow
                key={lo}
                checked={active}
                onChange={() => (active ? applyPrice("", "") : applyPrice(lo ? String(lo) : "", hi ? String(hi) : ""))}
                label={hi ? `${formatINR(lo)} – ${formatINR(hi)}` : `${formatINR(lo)} and above`}
              />
            );
          })}
        </div>
        <form
          className="mt-3 flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            applyPrice(minInput, maxInput);
          }}
        >
          <input inputMode="numeric" value={minInput} onChange={(e) => setMinInput(e.target.value.replace(/\D/g, ""))} placeholder="Min ₹" aria-label="Minimum price" className="field py-2" />
          <span className="text-muted">–</span>
          <input inputMode="numeric" value={maxInput} onChange={(e) => setMaxInput(e.target.value.replace(/\D/g, ""))} placeholder="Max ₹" aria-label="Maximum price" className="field py-2" />
          <button type="submit" className="rounded-md border border-ink px-3 py-2 text-xs font-semibold uppercase">Go</button>
        </form>
      </FilterGroup>

      {facets.sizes.length > 0 && (
        <FilterGroup title="Size" count={selSizes.length}>
          <div className="flex flex-wrap gap-2">
            {facets.sizes.map(([s]) => (
              <button
                key={s}
                onClick={() => toggleList("size", s)}
                aria-pressed={selSizes.includes(s)}
                className={cn(
                  "min-w-11 rounded-md border px-2.5 py-2 text-sm transition",
                  selSizes.includes(s) ? "border-ink bg-ink text-white" : "border-line hover:border-ink"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </FilterGroup>
      )}

      {facets.colors.length > 0 && (
        <FilterGroup title="Colour" count={selColors.length}>
          {facets.colors.slice(0, 12).map(([c, n]) => (
            <CheckRow key={c} checked={selColors.includes(c)} onChange={() => toggleList("color", c)} label={c} count={n} />
          ))}
        </FilterGroup>
      )}

      {facets.brands.length > 1 && (
        <FilterGroup title="Brand" count={selBrands.length} defaultOpen={false}>
          {facets.brands.map(([b, n]) => (
            <CheckRow key={b} checked={selBrands.includes(b)} onChange={() => toggleList("brand", b)} label={b} count={n} />
          ))}
        </FilterGroup>
      )}
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <NavBar />
      <main className="flex-1">
        {/* seller banner */}
        {sellerId && seller && (
          <div className="border-b border-line bg-canvas">
            <Container className="flex items-center gap-5 py-6">
              <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-md border border-line bg-white sm:h-24 sm:w-24">
                {seller.profileImage ? (
                  <img src={seller.profileImage} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="font-display text-3xl font-semibold uppercase">{sellerName.slice(0, 2)}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Official store</p>
                <h2 className="truncate font-display text-2xl font-semibold uppercase sm:text-3xl">{sellerName}</h2>
                {seller.city && <p className="text-sm text-muted">{seller.city}</p>}
              </div>
            </Container>
          </div>
        )}

        <Container className="pt-5 sm:pt-7">
          <Breadcrumbs items={crumbs} />
          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
            <h1 className="font-display text-3xl font-semibold uppercase leading-tight sm:text-4xl">{title}</h1>
            {!loading && (
              <p className="text-sm text-muted">
                {results.length} {results.length === 1 ? "product" : "products"}
                {results.length !== total && total > 0 && ` of ${total}`}
              </p>
            )}
          </div>

          {/* subcategory chips */}
          {subChips.length > 0 && (
            <div className="no-scrollbar -mx-4 mt-5 flex gap-4 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
              <Link
                to={`/shop/category/${ctx.category!._id}`}
                className="group w-20 shrink-0 text-center sm:w-24"
                aria-current={!ctx.sub ? "page" : undefined}
              >
                <div className={cn("grid aspect-square place-items-center overflow-hidden rounded-full border-2 bg-canvas", !ctx.sub ? "border-ink" : "border-transparent")}>
                  <span className="text-xs font-semibold uppercase">All</span>
                </div>
                <p className={cn("mt-2 truncate text-xs", !ctx.sub ? "font-semibold" : "")}>View all</p>
              </Link>
              {subChips.map((s) => (
                <Link key={s._id} to={`/shop/subcategory/${s._id}`} className="group w-20 shrink-0 text-center sm:w-24" aria-current={ctx.sub?._id === s._id ? "page" : undefined}>
                  <div className={cn("aspect-square overflow-hidden rounded-full border-2 bg-canvas", ctx.sub?._id === s._id ? "border-ink" : "border-transparent")}>
                    <img src={s.image || FALLBACK_IMAGE} alt="" loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
                  </div>
                  <p className={cn("mt-2 truncate text-xs", ctx.sub?._id === s._id ? "font-semibold" : "")}>{s.name}</p>
                </Link>
              ))}
            </div>
          )}

          {/* toolbar */}
          <div className="sticky top-[107px] z-30 -mx-4 mt-5 flex items-center gap-2 border-y border-line bg-white/95 px-4 py-2.5 backdrop-blur sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:border-x-0 lg:bg-transparent lg:px-0 lg:backdrop-blur-none">
            <button
              onClick={() => setDrawer(true)}
              className="flex items-center gap-2 rounded-md border border-ink px-4 py-2.5 text-sm font-semibold lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" /> Filter
              {chips.length > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[11px] text-white">{chips.length}</span>}
            </button>
            <div className="hidden flex-1 flex-wrap items-center gap-2 lg:flex">
              {chips.map((c) => (
                <button key={c.label} onClick={c.clear} className="flex items-center gap-1.5 rounded-full bg-canvas px-3 py-1.5 text-xs font-medium hover:bg-line">
                  {c.label} <X className="h-3 w-3" />
                </button>
              ))}
              {chips.length > 0 && (
                <button onClick={clearFilters} className="px-1 text-xs font-semibold underline underline-offset-4">
                  Clear all
                </button>
              )}
            </div>
            <label className="relative ml-auto flex items-center">
              <span className="sr-only">Sort by</span>
              <select
                value={sort}
                onChange={(e) => setParam("sort", e.target.value === "featured" ? null : e.target.value)}
                className="appearance-none rounded-md border border-line bg-white py-2.5 pl-3 pr-9 text-sm font-medium outline-none focus:border-ink"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    Sort: {s.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4" />
            </label>
            <div className="hidden items-center rounded-md border border-line md:flex">
              <button
                onClick={() => {
                  setDense(false);
                  try { localStorage.setItem("shop:dense", "0"); } catch { /* ignore */ }
                }}
                aria-label="Large tiles"
                aria-pressed={!dense}
                className={cn("grid h-10 w-10 place-items-center rounded-l-md", !dense ? "bg-ink text-white" : "text-muted")}
              >
                <Rows3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setDense(true);
                  try { localStorage.setItem("shop:dense", "1"); } catch { /* ignore */ }
                }}
                aria-label="More per row"
                aria-pressed={dense}
                className={cn("grid h-10 w-10 place-items-center rounded-r-md", dense ? "bg-ink text-white" : "text-muted")}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid gap-10 pb-16 pt-6 lg:grid-cols-[260px_1fr] xl:grid-cols-[280px_1fr]">
            <aside className="hidden lg:block">
              <div className="sticky top-[140px] max-h-[calc(100vh-160px)] overflow-y-auto pr-2">{filterPanel}</div>
            </aside>

            <section aria-live="polite" aria-busy={loading}>
              {error ? (
                <EmptyState
                  icon={<SearchX className="h-7 w-7" />}
                  title="We couldn't load products"
                  message="The store is taking a moment to respond. Please try again."
                  action={<button onClick={() => navigate(0)} className={btn.primary}>Try again</button>}
                />
              ) : !loading && results.length === 0 ? (
                <EmptyState
                  icon={<SearchX className="h-7 w-7" />}
                  title={q ? `No results for “${q}”` : "No products match"}
                  message={chips.length ? "Try removing a filter or two to see more." : "Check back soon — new styles arrive every week."}
                  action={
                    <div className="flex flex-wrap justify-center gap-3">
                      {chips.length > 0 && <button onClick={clearFilters} className={btn.primary}>Clear filters</button>}
                      <Link to="/shop" className={btn.secondary}>Browse everything</Link>
                    </div>
                  }
                />
              ) : (
                <>
                  <ProductGrid products={shown} loading={loading} columns={dense ? 4 : 3} skeletons={dense ? 8 : 6} />
                  {!loading && results.length > visible && (
                    <div className="mt-14 flex flex-col items-center gap-4">
                      <p className="text-sm text-muted">
                        You've viewed {shown.length} of {results.length} products
                      </p>
                      <div className="h-0.5 w-56 overflow-hidden rounded-full bg-line">
                        <div className="h-full bg-ink" style={{ width: `${(shown.length / results.length) * 100}%` }} />
                      </div>
                      <button onClick={() => setVisible((v) => v + PAGE)} className={btn.secondary}>
                        Load more
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        </Container>
      </main>

      {/* mobile filters */}
      <div className={cn("fixed inset-0 z-[90] lg:hidden", drawer ? "visible" : "pointer-events-none invisible")} aria-hidden={!drawer}>
        <div onClick={() => setDrawer(false)} className={cn("absolute inset-0 bg-black/40 transition-opacity", drawer ? "opacity-100" : "opacity-0")} />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Filters"
          className={cn(
            "absolute inset-y-0 left-0 flex w-full max-w-sm flex-col bg-white transition-transform duration-300",
            drawer ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-display text-lg font-semibold uppercase">Filter</h2>
            <button onClick={() => setDrawer(false)} aria-label="Close filters" className="-mr-2 grid h-10 w-10 place-items-center rounded-full hover:bg-canvas">
              <X className="h-5 w-5" />
            </button>
          </div>
          {chips.length > 0 && (
            <div className="flex flex-wrap gap-2 border-b border-line px-5 py-3">
              {chips.map((c) => (
                <button key={c.label} onClick={c.clear} className="flex items-center gap-1.5 rounded-full bg-canvas px-3 py-1.5 text-xs font-medium">
                  {c.label} <X className="h-3 w-3" />
                </button>
              ))}
            </div>
          )}
          <div className="flex-1 overflow-y-auto px-5">{filterPanel}</div>
          <div className="grid grid-cols-2 gap-3 border-t border-line p-4">
            <button onClick={clearFilters} className={btn.secondary}>Clear</button>
            <button onClick={() => setDrawer(false)} className={btn.primary}>
              Show {results.length}
            </button>
          </div>
        </aside>
      </div>

      <Footer />
    </div>
  );
}
