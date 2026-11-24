import React from "react";
import { Link } from "react-router-dom";
import { Search, Home, ShoppingBag } from "lucide-react";
import NavBar from "./Navbar";
import Footer from "./Footer";

const NotFound: React.FC = () => (
  <div className="min-h-screen flex flex-col bg-canvas">
    <NavBar />
    <main className="flex-grow flex items-center justify-center px-4 pt-28 pb-20">
      <div className="text-center max-w-lg">
        <p className="text-sm font-semibold tracking-[0.3em] text-ink mb-4">ERROR 404</p>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold uppercase text-ink mb-4">Page not found</h1>
        <p className="text-ink-soft mb-10">
          The page you're looking for may have moved or no longer exists. Let's get you back to shopping.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-ink text-white font-medium hover:bg-black transition-colors"
          >
            <Home className="h-4 w-4" /> Home
          </Link>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-line text-ink font-medium hover:bg-white transition-colors"
          >
            <ShoppingBag className="h-4 w-4" /> Browse the shop
          </Link>
        </div>
        <div className="mt-10 inline-flex items-center gap-2 text-sm text-muted">
          <Search className="h-4 w-4" /> Tip: use the search in the shop to find any product.
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default NotFound;
