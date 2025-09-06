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
    console.log(token,"token is getting")
  const location = useLocation();

  return (token? (
    <Component/>
  ):(
    <Navigate to="/seller/" state={{from:location}} />
  ))
};

export default SellerProtect;
