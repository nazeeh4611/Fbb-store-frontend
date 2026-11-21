import React from "react";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import NavBar from "./Navbar";
import Footer from "./Footer";
import { openAuthModal, useIsLoggedIn } from "../../lib/auth";

interface Props {
  children: React.ReactNode;
  title?: string;
  message?: string;
}

/**
 * Shows a friendly sign-in prompt for account-only pages (profile, orders, checkout)
 * and renders the page as soon as the shopper signs in - no redirect loop.
 */
const RequireUser: React.FC<Props> = ({
  children,
  title = "Sign in to continue",
  message = "Please sign in to your account to view this page.",
}) => {
  const loggedIn = useIsLoggedIn();
  if (loggedIn) return <>{children}</>;

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <NavBar />
      <main className="flex-grow flex items-center justify-center px-4 pt-28 pb-20">
        <div className="w-full max-w-md bg-white rounded-2xl border border-stone-200 shadow-sm p-8 text-center">
          <div className="mx-auto mb-5 h-14 w-14 rounded-full bg-amber-50 flex items-center justify-center">
            <Lock className="h-6 w-6 text-amber-600" />
          </div>
          <h1 className="text-2xl font-semibold text-stone-900 mb-2">{title}</h1>
          <p className="text-stone-600 mb-8">{message}</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => openAuthModal("login")}
              className="w-full py-3 rounded-full bg-stone-900 text-white font-medium hover:bg-stone-800 transition-colors"
            >
              Sign in
            </button>
            <button
              onClick={() => openAuthModal("register")}
              className="w-full py-3 rounded-full border border-stone-300 text-stone-800 font-medium hover:bg-stone-50 transition-colors"
            >
              Create an account
            </button>
            <Link to="/shop" className="text-sm text-stone-500 hover:text-stone-800 mt-2">
              Continue shopping
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RequireUser;
