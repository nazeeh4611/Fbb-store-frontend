import React, { Suspense, lazy } from "react";
import { Navigate, Route, Routes, useParams } from "react-router-dom";
import Homepage from "../Components/User/HomePage";
import PageLoader from "../Components/Layouts/PageLoader";
import RequireUser from "../Components/Layouts/RequireUser";

// Home loads eagerly (first paint); everything else is split per page.
const Shop = lazy(() => import("../Components/User/Shop"));
const ProductPage = lazy(() => import("../Components/User/ProductDetail"));
const CategoryPages = lazy(() => import("../Components/User/Category"));
const FilterProduct = lazy(() => import("../Components/User/FilterProduct"));
const Subcategory = lazy(() => import("../Components/User/SubCategory"));
const Types = lazy(() => import("../Components/User/Types"));
const AboutPage = lazy(() => import("../Components/Layouts/About"));
const SellerPages = lazy(() => import("../Components/User/Sellers"));
const ContactPage = lazy(() => import("../Components/Layouts/Contact"));
const CartPage = lazy(() => import("../Components/User/Cart"));
const OrderSuccess = lazy(() => import("../Components/User/OrderSuccess"));
const CheckoutPage = lazy(() => import("../Components/User/ChekoutPage"));
const ProfilePage = lazy(() => import("../Components/User/ProfilePage"));
const OrdersPage = lazy(() => import("../Components/User/OrdersPage"));
const OrderDetails = lazy(() => import("../Components/User/OrderDetails"));
const NotFound = lazy(() => import("../Components/Layouts/NotFound"));

const CategoryRedirect: React.FC = () => {
  const { id } = useParams();
  return <Navigate to={`/shop/category/${id}`} replace />;
};

const User: React.FC = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/shop/category/:categoryId" element={<Shop />} />
      <Route path="/shop/subcategory/:subcategoryId" element={<Shop />} />
      <Route path="/shop/seller/:sellerId" element={<Shop />} />
      <Route path="/product" element={<Navigate to="/shop" replace />} />
      <Route path="/product/:id" element={<ProductPage />} />
      <Route path="/category" element={<CategoryPages />} />
      <Route path="/category/:id" element={<CategoryRedirect />} />
      <Route path="/seller-list" element={<SellerPages />} />
      <Route path="/seller-list/:id" element={<CategoryPages />} />
      <Route path="/seller-list/:seller/category/:category" element={<Subcategory />} />
      <Route path="/product-type/:category" element={<Types />} />
      <Route path="/products/:seller/:category/:id" element={<FilterProduct />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route
        path="/checkout"
        element={
          <RequireUser title="Sign in to checkout" message="Your cart is saved. Sign in or create an account to place your order.">
            <CheckoutPage />
          </RequireUser>
        }
      />
      <Route path="/order-success" element={<RequireUser><OrderSuccess /></RequireUser>} />
      <Route path="/profile" element={<RequireUser title="Your account" message="Sign in to see your profile, orders and saved addresses."><ProfilePage /></RequireUser>} />
      <Route path="/orders" element={<RequireUser title="Your orders" message="Sign in to view and track your orders."><OrdersPage /></RequireUser>} />
      <Route path="/order/:orderId" element={<RequireUser title="Order details" message="Sign in to view this order."><OrderDetails /></RequireUser>} />
      <Route path="/login" element={<Navigate to="/profile" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
);

export default User;
