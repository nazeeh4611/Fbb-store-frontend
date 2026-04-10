import { Navigate, useLocation } from "react-router-dom";
import React from "react";
import { useGetToken } from "../../Token/getToken";

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
}

const Protect: React.FC<ProtectedRouteProps> = ({
  component: Component,
}) => {
  const token = useGetToken("adminToken");
  const location = useLocation();

  if (token) {
    return <Component />;
  }
  
  // Redirect to login and save the attempted location
  return <Navigate to="/admin/login" state={{ from: location }} replace />;
};

export default Protect;