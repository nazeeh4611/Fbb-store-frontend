import React from "react";
import { useNavigate } from "react-router-dom";
import { FolderTree, LayoutDashboard, Layers, Package, ShoppingCart, Store } from "lucide-react";
import PanelLayout from "../Panel/PanelLayout";

const NAV = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
  { label: "Orders", to: "/admin/orders", icon: ShoppingCart },
  { label: "Products", to: "/admin/product", icon: Package },
  { label: "Categories", to: "/admin/category", icon: FolderTree },
  { label: "Subcategories", to: "/admin/sub-category", icon: Layers },
  { label: "Sellers", to: "/admin/sellers", icon: Store },
];

/** Admin panel shell. Every admin page renders inside this. */
export const AdminLayout: React.FC<{ title?: string; subtitle?: string; actions?: React.ReactNode; children: React.ReactNode }> = ({
  title,
  subtitle,
  actions,
  children,
}) => {
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login", { replace: true });
  };
  return (
    <PanelLayout area="Admin" nav={NAV} onLogout={logout} account={{ name: "Administrator" }} title={title} subtitle={subtitle} actions={actions}>
      {children}
    </PanelLayout>
  );
};

/** @deprecated kept so older imports still compile */
export const Sidebar = () => null;
