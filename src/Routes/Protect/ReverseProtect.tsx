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
  console.log(token,"is geting")
  const location = useLocation();

  return !token ? (
    <Component /> 
  ) : (
    <Navigate to="/admin/login" state={{ from: location }} />
  );
};

export default ReProtect;
