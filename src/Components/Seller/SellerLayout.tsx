import React, { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, Package, ShoppingBag, TrendingUp } from "lucide-react";
import PanelLayout from "../Panel/PanelLayout";
import ExtractToken from "../../Token/Extract";

const NAV = [
  { label: "Dashboard", to: "/seller/dashboard", icon: BarChart3 },
  { label: "Products", to: "/seller/product", icon: Package },
  { label: "Orders", to: "/seller/orders", icon: ShoppingBag },
  { label: "Sales report", to: "/seller/sales-report", icon: TrendingUp },
];

interface LayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

/** Seller panel shell, shared look with the admin panel. */
export const SellerLayout: React.FC<LayoutProps> = ({ children, title, subtitle, actions }) => {
  const navigate = useNavigate();
  const claims = ExtractToken(localStorage.getItem("sellerToken")) || {};
  const logout = () => {
    // only end the seller session; keep any shopper session/cart on this device
    localStorage.removeItem("sellerToken");
    navigate("/seller/login", { replace: true });
  };
  return (
    <PanelLayout
      area="Seller"
      nav={NAV}
      onLogout={logout}
      account={{ name: claims.name || claims.companyName || "Seller", email: claims.email }}
      title={title}
      subtitle={subtitle}
      actions={actions}
    >
      {children}
    </PanelLayout>
  );
};
