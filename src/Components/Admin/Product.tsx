import { useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { baseurl } from '../../Constant/Base';
import axios from "axios";

interface Category {
  _id: string;
  name: string;
}

interface SubCategory extends Category {
  categoryId: Category;
}

interface Product {
  _id: string;
  name: string;
  brand: string;
  categoryId: Category;
  subCategoryId: SubCategory;
  priceINR: number;
  priceAED: number;
  images: string[];
  createdAt: string;
  updatedAt: string;
  trending: boolean;
  seller: seller
}

interface seller {
  name: string
}

const ProductPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const api = axios.create({
    baseURL: baseurl,
  });

  const getProducts = async () => {
    try {
      const response = await api.get("/admin/get-products");
      if (response.data && Array.isArray(response.data)) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleTrendingToggle = async (productId: string, currentValue: boolean) => {
    try {
      setProducts(prevProducts =>
        prevProducts.map(product =>
          product._id === productId
            ? { ...product, trending: !currentValue }
            : product
        )
      );
      const response = await api.put(`/admin/update-trending/${productId}`, {
        isTrending: !currentValue
      });
      if (!response.data) {
        setProducts(prevProducts =>
          prevProducts.map(product =>
            product._id === productId
              ? { ...product, trending: currentValue }
              : product
          )
        );
      }
    } catch (error) {
      console.error('Error updating trending status:', error);
      setProducts(prevProducts =>
        prevProducts.map(product =>
          product._id === productId
            ? { ...product, trending: currentValue }
            : product
        )
      );
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let aValue: any;
    let bValue: any;
    switch (sortField) {
      case 'name':
        aValue = a.name;
        bValue = b.name;
        break;
      case 'seller':
        aValue = a.seller.name;
        bValue = b.seller.name;
        break;
      case 'brand':
        aValue = a.brand;
        bValue = b.brand;
        break;
      case 'category':
        aValue = a.categoryId.name;
        bValue = b.categoryId.name;
        break;
      case 'priceINR':
        aValue = a.priceINR;
        bValue = b.priceINR;
        break;
      case 'priceAED':
        aValue = a.priceAED;
        bValue = b.priceAED;
        break;
      default:
        aValue = a.name;
        bValue = b.name;
    }
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    } else {
      return sortDirection === 'asc'
        ? (aValue > bValue ? 1 : -1)
        : (aValue < bValue ? 1 : -1);
    }
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const SortIndicator = ({ field }: { field: string }) => {
    if (sortField !== field) return null;
    return (
      <span className="ml-1">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    getProducts();
  }, []);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <div className={`md:hidden fixed top-0 left-0 right-0 z-10 bg-white p-4 shadow-md flex justify-between items-center`}>
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
          <div className="p-4 md:p-6 flex flex-col justify-between items-start border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Products</h2>
            <div className="flex flex-col w-full gap-4">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-100">
                  <th
                    className="pb-4 px-4 text-gray-600 font-semibold cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    Product <SortIndicator field="name" />
                  </th>
                  <th
                    className="pb-4 px-4 text-gray-600 font-semibold cursor-pointer hidden md:table-cell"
                    onClick={() => handleSort('seller')}
                  >
                    Seller <SortIndicator field="seller" />
                  </th>
                  <th
                    className="pb-4 px-4 text-gray-600 font-semibold cursor-pointer hidden md:table-cell"
                    onClick={() => handleSort('brand')}
                  >
                    Brand <SortIndicator field="brand" />
                  </th>
                  <th
                    className="pb-4 px-4 text-gray-600 font-semibold cursor-pointer hidden md:table-cell"
                    onClick={() => handleSort('category')}
                  >
                    Category <SortIndicator field="category" />
                  </th>
                  <th className="pb-4 px-4 text-gray-600 font-semibold hidden md:table-cell">
                    Sub Category
                  </th>
                  <th
                    className="pb-4 px-4 text-gray-600 font-semibold cursor-pointer"
                    onClick={() => handleSort('priceINR')}
                  >
                    ₹ <SortIndicator field="priceINR" />
                  </th>
                  <th
                    className="pb-4 px-4 text-gray-600 font-semibold cursor-pointer hidden md:table-cell"
                    onClick={() => handleSort('priceAED')}
                  >
                    AED <SortIndicator field="priceAED" />
                  </th>
                  <th className="pb-4 px-4 text-gray-600 font-semibold">Img</th>
                  <th className="pb-4 px-4 text-gray-600 font-semibold">Trend</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((product) => (
                    <tr
                      key={product._id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4 text-gray-800">
                        <div className="md:hidden font-semibold">{product.name}</div>
                        <div className="md:hidden text-sm text-gray-500">
                          {product.brand} • {product.categoryId.name}
                        </div>
                        <div className="hidden md:block">{product.name}</div>
                      </td>
                      <td className="py-4 px-4 text-gray-800 hidden md:table-cell">{product.seller.name}</td>
                      <td className="py-4 px-4 text-gray-800 hidden md:table-cell">{product.brand}</td>
                      <td className="py-4 px-4 text-gray-800 hidden md:table-cell">{product.categoryId.name}</td>
                      <td className="py-4 px-4 text-gray-800 hidden md:table-cell">{product.subCategoryId.name}</td>
                      <td className="py-4 px-4 text-gray-800">₹{product.priceINR}</td>
                      <td className="py-4 px-4 text-gray-800 hidden md:table-cell">AED {product.priceAED}</td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          {product.images && Object.values(product.images).length > 0 && (
                            <img
                              src={Object.values(product.images)[0]}
                              alt={`${product.name} 1`}
                              className="w-10 h-10 md:w-12 md:h-12 object-cover rounded"
                            />
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={product.trending}
                            onChange={() => handleTrendingToggle(product._id, product.trending)}
                          />
                          <div className="w-9 h-5 md:w-11 md:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 md:after:h-5 md:after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-4 px-4 text-center text-gray-500">
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {sortedProducts.length > 0 && totalPages > 1 && (
            <div className="flex flex-col md:flex-row justify-between items-center px-4 py-4 border-t border-gray-100 gap-4">
              <div className="text-xs md:text-sm text-gray-600 order-2 md:order-1">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sortedProducts.length)} of {sortedProducts.length} entries
              </div>
              <div className="flex space-x-1 md:space-x-2 order-1 md:order-2">
                <button
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                {totalPages <= 3 ? (
                  Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`w-8 h-8 md:w-10 md:h-10 rounded-lg ${
                        currentPage === number
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {number}
                    </button>
                  ))
                ) : (
                  <>
                    <button
                      onClick={() => paginate(1)}
                      className={`w-8 h-8 md:w-10 md:h-10 rounded-lg ${
                        currentPage === 1
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      1
                    </button>
                    {currentPage > 2 && (
                      <span className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center">...</span>
                    )}
                    {currentPage !== 1 && currentPage !== totalPages && (
                      <button
                        className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-blue-600 text-white"
                      >
                        {currentPage}
                      </button>
                    )}
                    {currentPage < totalPages - 1 && (
                      <span className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center">...</span>
                    )}
                    <button
                      onClick={() => paginate(totalPages)}
                      className={`w-8 h-8 md:w-10 md:h-10 rounded-lg ${
                        currentPage === totalPages
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
                <button
                  onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProductPage;