import React, { Suspense, lazy } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import ScrollToTop from "../Components/Layouts/Scoll";
import PageLoader from "../Components/Layouts/PageLoader";
import ErrorBoundary from "../Components/Layouts/ErrorBoundary";

// Each area is its own bundle: shoppers never download admin / seller code.
const User = lazy(() => import("./User"));
const Admin = lazy(() => import("./Admin"));
const Seller = lazy(() => import("./Seller"));

const Approutes: React.FC = () => (
  <Router>
    <ScrollToTop />
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/admin/*" element={<Admin />} />
          <Route path="/seller/*" element={<Seller />} />
          <Route path="/*" element={<User />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  </Router>
);

export default Approutes;
