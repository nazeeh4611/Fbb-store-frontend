import { NavLink, useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
// import { baseurl } from '../../Constant/Base';
// import axios from 'axios';
// import { useGetToken } from '../../Token/getToken';
// import ExtractToken from '../../Token/Extract';
// import { useEffect, useState } from 'react';

export const Sidebar = () => {
  const navigate = useNavigate();
  const whatsappNumber = '7012551507';
//   const [seller,setSeller] = useState("")

//   const api = axios.create({
//     baseURL: baseurl,
//   });

//   const token = useGetToken("sellerToken")
//   console.log(typeof token,"may here")

//   const sellerId = ExtractToken(token)


//   const getSeller = async()=>{
//     try {
//         const response = await api.get(`/admin/get-seller/${sellerId.userId}`)
//         console.log(response)
//         setSeller(response.data.name)
//     } catch (error) {
        
//     }
// }

// useEffect(()=>{
//     getSeller()
// },[])
  const menuItems = [
    { name: 'Dashboard', path: '/seller/dashboard' },
    { name: 'Product', path: '/seller/product' },
    // { name: 'Sub-Category', path: '/admin/sub-category' },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/seller/');
  };

  const handleWhatsAppClick = () => {
    window.open(`https://wa.me/${whatsappNumber}`, '_blank');
  };

  return (
    <aside className="w-full md:w-64 bg-white shadow-lg h-screen flex flex-col">
      <div className="p-6 flex-1">
        <div className="flex items-center space-x-2 mb-8">
          <h1 className="text-gray-800 text-2xl font-bold">FBB</h1>
          <span className="text-blue-600 text-2xl font-bold">STORE</span>
        </div>
        
        <nav>
          <ul className="space-y-2">
            {menuItems.map(({ name, path }) => (
              <li key={name}>
                <NavLink
                  to={path}
                  className={({ isActive }) =>
                    `block py-3 px-4 rounded-lg transition-all ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  {name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      
      <div className="p-6 border-t space-y-3">
        <button
          onClick={handleWhatsAppClick}
          className="w-full py-3 px-4 rounded-lg text-green-600 hover:bg-green-50 transition-all font-medium flex items-center justify-center space-x-2"
        >
          <MessageCircle className="w-5 h-5" />
          <span>Contact Admin</span>
        </button>
        
        <button
          onClick={handleLogout}
          className="w-full py-3 px-4 rounded-lg text-red-600 hover:bg-red-50 transition-all font-medium flex items-center justify-center"
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;