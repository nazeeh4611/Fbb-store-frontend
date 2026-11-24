import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import NavBar from "../Layouts/Navbar";
import Footer from "../Layouts/Footer";
import { FALLBACK_IMAGE, sortForMenu, useCategoryTree } from "../../lib/shop";
import { Breadcrumbs, Container, EmptyState } from "../Store/Sections";

/** All departments with their subcategories. */
const CategoryPage: React.FC = () => {
  const { categories, ready } = useCategoryTree();
  const list = sortForMenu(categories);

  useEffect(() => {
    document.title = "All categories · FBB Store";
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <NavBar />
      <main className="flex-1">
        <Container className="py-6 sm:py-10">
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "All categories" }]} />
          <h1 className="mt-3 font-display text-3xl font-semibold uppercase sm:text-4xl">All categories</h1>

          {!ready ? (
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="skeleton aspect-[4/5] rounded-md" />
              ))}
            </div>
          ) : list.length === 0 ? (
            <EmptyState title="No categories yet" message="Categories will appear here once the store is set up." />
          ) : (
            <div className="mt-8 space-y-14">
              {list.map((c) => (
                <section key={c._id} className="grid gap-5 md:grid-cols-12 md:gap-8">
                  <Link to={`/shop/category/${c._id}`} className="group relative block aspect-[4/3] overflow-hidden rounded-md bg-canvas md:col-span-5 md:aspect-[4/5]">
                    <img src={c.image || FALLBACK_IMAGE} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6">
                      <h2 className="font-display text-3xl font-semibold uppercase text-white sm:text-4xl">{c.name}</h2>
                      <span className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-wider">
                        Shop all <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                  <div className="md:col-span-7">
                    {c.subcategories?.length ? (
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        {c.subcategories.map((s) => (
                          <Link key={s._id} to={`/shop/subcategory/${s._id}`} className="group">
                            <div className="aspect-square overflow-hidden rounded-md bg-canvas">
                              <img src={s.image || FALLBACK_IMAGE} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                            </div>
                            <p className="mt-2 text-sm font-semibold group-hover:underline">{s.name}</p>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted">Browse the full {c.name.toLowerCase()} range.</p>
                    )}
                  </div>
                </section>
              ))}
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default CategoryPage;
