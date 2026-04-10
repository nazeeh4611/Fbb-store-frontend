import { Navigate, useLocation } from "react-router-dom";
import React from "react";
import { useGetToken } from "../../Token/getToken";

interface ReverseProtectedRouteProps {
  component: React.ComponentType<any>;
}

const ReProtect: React.FC<ReverseProtectedRouteProps> = ({
  component: Component,
}) => {
  const token = useGetToken("adminToken");
  const location = useLocation();

  // If NOT logged in, show the login/register page
  if (!token) {
    return <Component />;
  }
  
  // If already logged in, redirect to products page
  return <Navigate to="/admin/product" state={{ from: location }} replace />;
};

export default ReProtect;