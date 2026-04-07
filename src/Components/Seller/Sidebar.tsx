// Sidebar.tsx - Updated with proper styling
import { NavLink, useNavigate } from 'react-router-dom';
import { MessageCircle, BarChart3, Package, ShoppingBag, TrendingUp } from 'lucide-react';

export const Sidebar = () => {
  const navigate = useNavigate();
  const whatsappNumber = '7012551507';

  const menuItems = [
    { name: 'Dashboard', path: '/seller/dashboard', icon: <BarChart3 size={20} /> },
    { name: 'Products', path: '/seller/product', icon: <Package size={20} /> },
    { name: 'Orders', path: '/seller/orders', icon: <ShoppingBag size={20} /> },
    { name: 'Sales Report', path: '/seller/sales-report', icon: <TrendingUp size={20} /> },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/seller/');
  };

  const handleWhatsAppClick = () => {
    window.open(`https://wa.me/${whatsappNumber}`, '_blank');
  };

  return (
    <aside className="h-full w-full bg-white flex flex-col overflow-hidden">
      <div className="p-6 flex-shrink-0">
        <div className="flex items-center space-x-2 mb-8">
          <h1 className="text-gray-800 text-2xl font-bold">FBB</h1>
          <span className="text-blue-600 text-2xl font-bold">STORE</span>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto px-4 space-y-1">
        {menuItems.map(({ name, path, icon }) => (
          <NavLink
            key={name}
            to={path}
            className={({ isActive }) =>
              `flex items-center space-x-3 py-3 px-4 rounded-lg transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            {icon}
            <span>{name}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="p-6 border-t border-gray-200 space-y-3 flex-shrink-0">
        <button
          onClick={handleWhatsAppClick}
          className="w-full py-3 px-4 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 transition-all flex items-center justify-center space-x-2"
        >
          <MessageCircle className="w-5 h-5" />
          <span>Contact Admin</span>
        </button>
        
        <button
          onClick={handleLogout}
          className="w-full py-3 px-4 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-all flex items-center justify-center space-x-2"
        >
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;