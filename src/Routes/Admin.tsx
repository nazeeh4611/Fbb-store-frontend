import React, { Suspense, lazy } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Protect from "./Protect/Protected";
import ReProtect from "./Protect/ReverseProtect";
import PageLoader from "../Components/Layouts/PageLoader";

const AdminLogin = lazy(() => import("../Components/Admin/Login"));
const Dashboard = lazy(() => import("../Components/Admin/Dashboard"));
const Orders = lazy(() => import("../Components/Admin/Orders"));
const CategoryManager = lazy(() => import("../Components/Admin/Category"));
const SubCategory = lazy(() => import("../Components/Admin/Subcategory"));
const ProductPage = lazy(() => import("../Components/Admin/Product"));
const SellerPage = lazy(() => import("../Components/Admin/Sellers"));
const SellerProducts = lazy(() => import("../Components/Admin/SellerProduct"));

const Admin: React.FC = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route path="/" element={<Protect component={Dashboard} />} />
      <Route path="/orders" element={<Protect component={Orders} />} />
      <Route path="/product" element={<Protect component={ProductPage} />} />
      <Route path="/category" element={<Protect component={CategoryManager} />} />
      <Route path="/sub-category" element={<Protect component={SubCategory} />} />
      <Route path="/sellers" element={<Protect component={SellerPage} />} />
      <Route path="/sellers/:id" element={<Protect component={SellerProducts} />} />
      <Route path="/login" element={<ReProtect component={AdminLogin} />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  </Suspense>
);

export default Admin;
