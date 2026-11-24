import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Store } from "lucide-react";
import Hero2 from "./Img/Hero2.jpg";
import slider1 from "./Img/slider1.jpg";
import sliderMobile from "./Img/slider1 2.jpeg";
import watchBanner from "./Img/banner1.jpg";
import api from "../../lib/api";
import { effectivePrice } from "../../lib/format";
import { FALLBACK_IMAGE, ProductSummary, sortForMenu, useCategoryTree } from "../../lib/shop";
import { Container, ProductGrid, ProductRail, Rail, SectionHeading, btn } from "../Store/Sections";
import { cn } from "../../lib/util";

interface Seller {
  _id: string;
  name: string;
  companyName?: string;
  profileImage?: string;
  Image?: string;
  city?: string;
}

const SLIDES = [
  {
    image: slider1,
    mobile: sliderMobile,
    eyebrow: "New season",
    title: "Effortless style, every day",
    text: "Fresh drops from verified sellers — clothing, footwear and accessories at prices you'll love.",
    primary: { label: "Shop new in", to: "/shop?sort=new" },
    secondary: { label: "Shop sale", to: "/shop?sale=1" },
    tone: "light" as const,
  },
  {
    image: Hero2,
    mobile: Hero2,
    eyebrow: "The edit",
    title: "Dress for the moment",
    text: "Statement pieces and timeless essentials, curated for the way you live.",
    primary: { label: "Shop all", to: "/shop" },
    secondary: { label: "Explore brands", to: "/seller-list" },
    tone: "dark" as const,
  },
];

const HeroCarousel: React.FC = () => {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((n) => (n + 1) % SLIDES.length), 6500);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <section
      className="relative overflow-hidden bg-canvas"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured collections"
    >
      <div className="relative h-[78vh] max-h-[760px] min-h-[480px] sm:h-[64vh] sm:min-h-[520px]">
        {SLIDES.map((s, idx) => (
          <div
            key={idx}
            className={cn("absolute inset-0 transition-opacity duration-700", idx === i ? "opacity-100" : "pointer-events-none opacity-0")}
            aria-hidden={idx !== i}
          >
            <picture className="absolute inset-0 block">
              <source media="(max-width: 640px)" srcSet={s.mobile} />
              <img
                src={s.image}
                alt=""
                className={cn("h-full w-full object-cover", s.tone === "light" ? "object-[70%_center]" : "object-center")}
                loading={idx === 0 ? "eager" : "lazy"}
              />
            </picture>
            <div
              className={cn(
                "absolute inset-0",
                s.tone === "light"
                  ? "bg-gradient-to-t from-white/90 via-white/20 to-transparent sm:bg-gradient-to-r sm:from-white/85 sm:via-white/30"
                  : "bg-gradient-to-t from-black/75 via-black/20 to-transparent sm:bg-gradient-to-r sm:from-black/70 sm:via-black/25"
              )}
            />
            <Container className="relative flex h-full items-end pb-16 sm:items-center sm:pb-0">
              <div className={cn("max-w-xl", s.tone === "dark" ? "text-white" : "text-ink")}>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] sm:text-sm">{s.eyebrow}</p>
                <h1 className="font-display text-[42px] font-semibold uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
                  {s.title}
                </h1>
                <p className={cn("mt-4 max-w-md text-[15px] leading-relaxed sm:text-base", s.tone === "dark" ? "text-white/85" : "text-ink-soft")}>
                  {s.text}
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    to={s.primary.to}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-md px-7 py-3.5 text-sm font-semibold uppercase tracking-wider transition",
                      s.tone === "dark" ? "bg-white text-ink hover:bg-white/90" : "bg-ink text-white hover:bg-black"
                    )}
                  >
                    {s.primary.label} <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to={s.secondary.to}
                    className={cn(
                      "inline-flex items-center rounded-md border px-7 py-3.5 text-sm font-semibold uppercase tracking-wider transition",
                      s.tone === "dark" ? "border-white text-white hover:bg-white hover:text-ink" : "border-ink text-ink hover:bg-ink hover:text-white"
                    )}
                  >
                    {s.secondary.label}
                  </Link>
                </div>
              </div>
            </Container>
          </div>
        ))}
      </div>

      <div className="absolute bottom-5 left-0 right-0">
        <Container className="flex items-center justify-between">
          <div className="flex gap-2">
            {SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setI(idx)}
                aria-label={`Show slide ${idx + 1}`}
                aria-current={idx === i}
                className={cn(
                  "h-1 rounded-full transition-all",
                  idx === i ? "w-10" : "w-5 opacity-40",
                  SLIDES[i].tone === "dark" ? "bg-white" : "bg-ink"
                )}
              />
            ))}
          </div>
          <div className="hidden gap-2 sm:flex">
            {[-1, 1].map((d) => (
              <button
                key={d}
                onClick={() => setI((n) => (n + d + SLIDES.length) % SLIDES.length)}
                aria-label={d < 0 ? "Previous slide" : "Next slide"}
                className="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-ink shadow hover:bg-white"
              >
                {d < 0 ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </button>
            ))}
          </div>
        </Container>
      </div>
    </section>
  );
};

const Hero: React.FC = () => {
  const { categories, ready: catsReady } = useCategoryTree();
  const [trending, setTrending] = useState<ProductSummary[]>([]);
  const [latest, setLatest] = useState<ProductSummary[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    Promise.allSettled([
      api.get("/products", { params: { trending: true, limit: 12 } }),
      api.get("/products", { params: { limit: 60 } }),
      api.get("/sellers"),
    ]).then(([t, l, s]) => {
      if (!alive) return;
      if (t.status === "fulfilled") setTrending(t.value.data?.products || []);
      if (l.status === "fulfilled") setLatest(l.value.data?.products || []);
      if (s.status === "fulfilled") setSellers(s.value.data?.sellers || []);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  const ordered = useMemo(() => sortForMenu(categories), [categories]);
  const onSale = useMemo(
    () => latest.filter((p) => effectivePrice(p).percentOff > 0).sort((a, b) => effectivePrice(b).percentOff - effectivePrice(a).percentOff),
    [latest]
  );
  const maxOff = onSale.length ? effectivePrice(onSale[0]).percentOff : 0;
  const subcats = useMemo(
    () => ordered.flatMap((c) => (c.subcategories || []).map((s) => ({ ...s, parent: c.name }))).slice(0, 12),
    [ordered]
  );
  const [feature1, feature2] = ordered;

  return (
    <div className="bg-white">
      <HeroCarousel />

      {/* shop by category */}
      <Container className="pt-12 sm:pt-16">
        {!catsReady ? (
          <>
            <div className="skeleton mb-6 h-8 w-64" />
            <div className="flex gap-4 overflow-hidden">
              {[0, 1, 2, 3].map((k) => (
                <div key={k} className="skeleton aspect-[3/4] w-[46%] shrink-0 rounded-md sm:w-[31%] lg:w-[23.5%]" />
              ))}
            </div>
          </>
        ) : ordered.length > 0 ? (
          <Rail title="Shop by category" action={{ label: "View all", to: "/category" }}>
            {ordered.map((c) => (
              <Link key={c._id} to={`/shop/category/${c._id}`} className="group block">
                <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-canvas">
                  <img
                    src={c.image || FALLBACK_IMAGE}
                    alt={c.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4 sm:p-5">
                    <h3 className="font-display text-xl font-semibold uppercase tracking-wide text-white sm:text-2xl">{c.name}</h3>
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-ink transition group-hover:translate-x-0.5">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </Rail>
        ) : null}
      </Container>

      {/* sale banner */}
      {onSale.length > 0 && (
        <Container className="pt-12 sm:pt-16">
          <Link
            to="/shop?sale=1"
            className="group flex flex-col items-start justify-between gap-6 overflow-hidden rounded-md bg-sale px-6 py-10 text-white sm:flex-row sm:items-center sm:px-12 sm:py-12"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/80">Limited time</p>
              <p className="mt-2 font-display text-4xl font-semibold uppercase leading-none sm:text-6xl">Up to {maxOff}% off</p>
              <p className="mt-3 text-sm text-white/85 sm:text-base">{onSale.length} styles reduced across the store.</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-md bg-white px-7 py-3.5 text-sm font-semibold uppercase tracking-wider text-sale transition group-hover:gap-3">
              Shop the sale <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </Container>
      )}

      {/* trending */}
      <Container className="pt-12 sm:pt-16">
        <ProductRail
          title="Trending now"
          eyebrow="Most wanted"
          action={{ label: "Shop all", to: "/shop?trending=true" }}
          products={trending}
          loading={loading}
        />
      </Container>

      {/* editorial duo */}
      {(feature1 || feature2) && (
        <Container className="pt-12 sm:pt-16">
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-5">
            {[
              feature1 && { title: feature1.name, text: "New arrivals and best sellers", to: `/shop/category/${feature1._id}`, img: feature1.image },
              { title: "Timepieces & accessories", text: "The finishing touch", to: "/shop?q=watch", img: watchBanner },
              ...(feature2 && !feature1 ? [{ title: feature2.name, text: "Discover the range", to: `/shop/category/${feature2._id}`, img: feature2.image }] : []),
            ]
              .filter(Boolean)
              .slice(0, 2)
              .map((f) => {
                const tile = f as { title: string; text: string; to: string; img?: string };
                return (
                  <Link key={tile.title} to={tile.to} className="group relative block aspect-[4/3] overflow-hidden rounded-md bg-canvas sm:aspect-[5/4]">
                    <img src={tile.img || FALLBACK_IMAGE} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/80">{tile.text}</p>
                      <h3 className="mt-2 font-display text-3xl font-semibold uppercase leading-none sm:text-4xl">{tile.title}</h3>
                      <span className="mt-4 inline-flex items-center gap-2 border-b border-white pb-0.5 text-sm font-semibold uppercase tracking-wider">
                        Shop now <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                );
              })}
          </div>
        </Container>
      )}

      {/* sale rail */}
      {onSale.length > 0 && (
        <Container className="pt-12 sm:pt-16">
          <ProductRail title="Price drops" eyebrow="Don't miss out" action={{ label: "Shop sale", to: "/shop?sale=1" }} products={onSale.slice(0, 12)} />
        </Container>
      )}

      {/* popular subcategories */}
      {subcats.length > 0 && (
        <Container className="pt-12 sm:pt-16">
          <SectionHeading title="Popular right now" />
          <div className="grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-4 lg:grid-cols-6 sm:gap-x-5">
            {subcats.map((s) => (
              <Link key={s._id} to={`/shop/subcategory/${s._id}`} className="group text-center">
                <div className="mx-auto aspect-square w-full overflow-hidden rounded-full bg-canvas">
                  <img src={s.image || FALLBACK_IMAGE} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                </div>
                <p className="mt-3 text-sm font-semibold group-hover:underline">{s.name}</p>
                <p className="text-xs text-muted">{s.parent}</p>
              </Link>
            ))}
          </div>
        </Container>
      )}

      {/* new in grid */}
      <Container className="pt-12 sm:pt-16">
        <SectionHeading title="New in" eyebrow="Just landed" action={{ label: "View all", to: "/shop?sort=new" }} />
        <ProductGrid products={latest.slice(0, 8)} loading={loading} />
        {!loading && latest.length === 0 && (
          <p className="py-10 text-center text-sm text-muted">New products are on their way — check back soon.</p>
        )}
      </Container>

      {/* sellers */}
      {sellers.length > 0 && (
        <Container className="pt-12 sm:pt-16">
          <Rail title="Shop by brand" action={{ label: "All brands", to: "/seller-list" }} itemClassName="w-[38%] sm:w-[24%] lg:w-[15.5%]">
            {sellers.map((s) => {
              const image = s.profileImage || s.Image;
              const name = s.companyName || s.name;
              return (
                <Link key={s._id} to={`/shop/seller/${s._id}`} className="group block text-center">
                  <div className="grid aspect-square place-items-center overflow-hidden rounded-md border border-line bg-white transition group-hover:border-ink">
                    {image ? (
                      <img src={image} alt={name} loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      <span className="font-display text-3xl font-semibold uppercase text-ink">{name.slice(0, 2)}</span>
                    )}
                  </div>
                  <p className="mt-3 truncate text-sm font-semibold">{name}</p>
                  {s.city && <p className="truncate text-xs text-muted">{s.city}</p>}
                </Link>
              );
            })}
          </Rail>
        </Container>
      )}

      {/* sell with us */}
      <Container className="py-12 sm:py-16">
        <div className="flex flex-col items-start gap-6 rounded-md bg-canvas px-6 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-12">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-ink text-white">
              <Store className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-2xl font-semibold uppercase">Sell on FBB Store</h2>
              <p className="mt-1 max-w-lg text-sm text-muted">
                Reach shoppers across India. List your products, manage orders and track sales from one dashboard.
              </p>
            </div>
          </div>
          <Link to="/seller/register" className={btn.primary}>
            Become a seller
          </Link>
        </div>
      </Container>
    </div>
  );
};

export default Hero;
