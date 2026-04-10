import { Navigate, useLocation } from "react-router-dom";
import React from "react";
import { useGetToken } from "../../Token/getToken";

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
}

const SellerProtect: React.FC<ProtectedRouteProps> = ({
  component: Component,
}) => {
  const token = useGetToken("sellerToken");
  const location = useLocation();

  if (token) {
    return <Component />;
  }
  
  // Redirect to login and save the attempted location
  return <Navigate to="/seller/login" state={{ from: location }} replace />;
};

export default SellerProtect;