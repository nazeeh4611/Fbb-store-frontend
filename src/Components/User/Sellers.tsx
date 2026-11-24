import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Search, Store } from "lucide-react";
import NavBar from "../Layouts/Navbar";
import Footer from "../Layouts/Footer";
import api from "../../lib/api";
import { useCategoryTree } from "../../lib/shop";
import { Breadcrumbs, Container, EmptyState, btn } from "../Store/Sections";

interface Seller {
  _id: string;
  name: string;
  companyName?: string;
  profileImage?: string;
  Image?: string;
  city?: string;
  state?: string;
  categories?: string[];
}

/** Directory of approved sellers / brands. */
const SellersPage: React.FC = () => {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const { categories } = useCategoryTree();

  useEffect(() => {
    document.title = "Brands & sellers · FBB Store";
    api
      .get("/sellers")
      .then((r) => setSellers(r.data?.sellers || []))
      .catch(() => setSellers([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    const list = [...sellers].sort((a, b) => (a.companyName || a.name).localeCompare(b.companyName || b.name));
    return t ? list.filter((s) => `${s.companyName} ${s.name} ${s.city}`.toLowerCase().includes(t)) : list;
  }, [sellers, q]);

  const catName = (id: string) => categories.find((c) => c._id === id)?.name;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <NavBar />
      <main className="flex-1">
        <Container className="py-6 sm:py-10">
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Brands & sellers" }]} />
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-semibold uppercase sm:text-4xl">Brands & sellers</h1>
              <p className="mt-1 text-sm text-muted">Every store on FBB is reviewed and approved by our team.</p>
            </div>
            <label className="relative w-full sm:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search brands" aria-label="Search brands" className="field pl-9" />
            </label>
          </div>

          {loading ? (
            <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="skeleton aspect-[4/5] rounded-md" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<Store className="h-7 w-7" />}
              title={q ? "No brands match your search" : "No sellers yet"}
              action={<Link to="/seller/register" className={btn.primary}>Become a seller</Link>}
            />
          ) : (
            <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 xl:grid-cols-4">
              {filtered.map((s) => {
                const name = s.companyName || s.name;
                const image = s.profileImage || s.Image;
                const cats = (s.categories || []).map(catName).filter(Boolean).slice(0, 3);
                return (
                  <Link key={s._id} to={`/shop/seller/${s._id}`} className="group block">
                    <div className="grid aspect-[4/5] place-items-center overflow-hidden rounded-md bg-canvas">
                      {image ? (
                        <img src={image} alt={name} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                      ) : (
                        <span className="font-display text-5xl font-semibold uppercase">{name.slice(0, 2)}</span>
                      )}
                    </div>
                    <h2 className="mt-3 font-display text-lg font-semibold uppercase group-hover:underline">{name}</h2>
                    {(s.city || s.state) && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                        <MapPin className="h-3 w-3" /> {[s.city, s.state].filter(Boolean).join(", ")}
                      </p>
                    )}
                    {cats.length > 0 && <p className="mt-1 text-xs text-ink-soft">{cats.join(" · ")}</p>}
                  </Link>
                );
              })}
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default SellersPage;
