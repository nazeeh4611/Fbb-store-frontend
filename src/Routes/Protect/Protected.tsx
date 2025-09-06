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
    console.log(token,"token is getting")
  const location = useLocation();

  return (token? (
    <Component/>
  ):(
    <Navigate to="/admin/login" state={{from:location}} />
  ))
};

export default Protect;
