import React, { useEffect, useState } from 'react';
import { Mail, Phone, ChevronLeft, ChevronRight, Package, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { baseurl } from '../../Constant/Base';
import axios from "axios";

interface Seller {
  _id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  status: boolean;
  Image?: string;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing page <span className="font-medium">{currentPage}</span> of{' '}
            <span className="font-medium">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => onPageChange(index + 1)}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                  currentPage === index + 1
                    ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                    : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                }`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

const SellerPage = () => {
  const navigate = useNavigate();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const itemsPerPage = 10;

  const api = axios.create({
    baseURL: baseurl,
  });

  const getSellers = async () => {
    try {
        const response = await api.get("/admin/get-sellers");
        console.log("first")
      
      console.log(response.data,"lklklll")
      if (response.data && Array.isArray(response.data)) {
        setSellers(response.data);
      }
    } catch (error) {
      console.error('Error fetching sellers:', error);
    }
  };

  const toggleSellerStatus = async (sellerId: string, currentStatus: boolean) => {
    setLoadingStates(prev => ({ ...prev, [sellerId]: true }));
    
    try {
      const response = await api.put(`/admin/update-status/${sellerId}`, {
        status: !currentStatus
      });
      
      if (response.data.success) {
        await getSellers();
      }
    } catch (error) {
      console.error('Error updating seller status:', error);
      alert('Failed to update seller status. Please try again.');
    } finally {
      setLoadingStates(prev => ({ ...prev, [sellerId]: false }));
    }
  };

  const handleViewProducts = (sellerId: string) => {
    navigate(`/admin/sellers/${sellerId}`);
  };

  useEffect(() => {
    getSellers();
  }, []);

  const totalPages = Math.ceil(sellers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSellers = sellers.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <div className="md:hidden fixed top-0 left-0 right-0 z-10 bg-white p-4 shadow-md flex justify-between items-center">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
        <div className="w-10"></div>
      </div>

      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity md:hidden ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleSidebar}
      ></div>

      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center p-4 md:hidden">
          <h2 className="text-xl font-bold text-gray-800">Menu</h2>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <Sidebar />
      </div>
      
      <main className="flex-1 p-4 md:p-8 mt-16 md:mt-0">
        <header className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Welcome, <span className="text-blue-600">Admin</span>
          </h1>
          <p className="text-gray-600 mt-2">Manage your products</p>
        </header>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">Sellers</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-100">
                  <th className="pb-4 px-4 text-gray-600 font-semibold">Profile</th>
                  <th className="pb-4 px-4 text-gray-600 font-semibold">Seller Name</th>
                  <th className="pb-4 px-4 text-gray-600 font-semibold hidden md:table-cell">Email</th>
                  <th className="pb-4 px-4 text-gray-600 font-semibold">Phone</th>
                  <th className="pb-4 px-4 text-gray-600 font-semibold hidden md:table-cell">Created At</th>
                  <th className="pb-4 px-4 text-gray-600 font-semibold">Status</th>
                  <th className="pb-4 px-4 text-gray-600 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentSellers.map((seller) => (
                  <tr
                    key={seller._id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      {seller.Image ? (
                        <img 
                          src={seller.Image} 
                          alt={`${seller.name}'s profile`}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium">
                          {getInitials(seller.name)}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 text-gray-800">{seller.name}</td>
                    <td className="py-4 px-4 text-gray-600 hidden md:table-cell">
                      <div className="flex items-center space-x-2">
                        <Mail size={16} />
                        <span className="truncate max-w-[150px] lg:max-w-none">{seller.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Phone size={16} />
                        <span className="truncate max-w-[100px] sm:max-w-[150px] lg:max-w-none">{seller.phone}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600 hidden md:table-cell">
                      {new Date(seller.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => toggleSellerStatus(seller._id, seller.status)}
                        disabled={loadingStates[seller._id]}
                        className={`px-3 py-1 md:px-4 md:py-1.5 rounded-full text-xs md:text-sm font-medium transition-all duration-200 ${
                          seller.status
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        } ${loadingStates[seller._id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {loadingStates[seller._id] ? 'Updating...' : (seller.status ? 'Active' : 'Inactive')}
                      </button>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleViewProducts(seller._id)}
                        className="flex items-center space-x-1 md:space-x-2 px-2 py-1 md:px-4 md:py-1.5 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors text-xs md:text-sm"
                      >
                        <Package size={16} />
                        <span className="hidden sm:inline">View Products</span>
                        <span className="sm:hidden">Products</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SellerPage;