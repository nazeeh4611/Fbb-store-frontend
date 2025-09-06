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
  console.log(token,"is geting")
  const location = useLocation();

  return !token ? (
    <Component /> 
  ) : (
    <Navigate to="/seller/" state={{ from: location }} />
  );
};

export default SellerReProtect;
