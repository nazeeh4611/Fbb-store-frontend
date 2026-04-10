import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import SellerRegistration from "../Components/Seller/Register";
import SellerLogin from "../Components/Seller/Login";
import SellerProductPage from "../Components/Seller/Product";
import SellerProtect from "./Protect/SellerProtect";
import SellerReProtect from "./Protect/ReveseSellerProtect";
import SalesReportPage from "../Components/Seller/SalesReportPage";
import DashboardPage from "../Components/Seller/Dashboard";
import SellerOrders from "../Components/Seller/SellerOrders";

const Seller: React.FC = () => {
    return (
      <>
        <Routes>
          {/* Public routes - only accessible when NOT logged in */}
          <Route path="/register" element={<SellerReProtect component={SellerRegistration} />} />
          <Route path="/login" element={<SellerReProtect component={SellerLogin} />} />   
          
          {/* Protected Routes - all require authentication */}
          <Route path="/product" element={<SellerProtect component={SellerProductPage} />} />   
          <Route path="/dashboard" element={<SellerProtect component={DashboardPage} />} />   
          <Route path="/sales-report" element={<SellerProtect component={SalesReportPage} />} />   
          <Route path="/orders" element={<SellerProtect component={SellerOrders} />} />   
          
          {/* Default redirect - if logged in go to dashboard, else go to login */}
          <Route path="/" element={<Navigate to="/seller/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/seller/login" replace />} />
        </Routes>
      </>
    );
  };
  
  export default Seller;