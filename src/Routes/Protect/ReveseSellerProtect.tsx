import { Navigate, useLocation } from "react-router-dom";
import React from "react";
import { useGetToken } from "../../Token/getToken";

interface ReverseProtectedRouteProps {
  component: React.ComponentType<any>;
}

const SellerReProtect: React.FC<ReverseProtectedRouteProps> = ({
  component: Component,
}) => {
  const token = useGetToken("sellerToken");
  const location = useLocation();

  // If NOT logged in, show the login/register page
  if (!token) {
    return <Component />;
  }
  
  // If already logged in, redirect to dashboard
  return <Navigate to="/seller/dashboard" state={{ from: location }} replace />;
};

export default SellerReProtect;