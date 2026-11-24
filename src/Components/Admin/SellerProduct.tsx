import { useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { AdminLayout } from './Sidebar';
import { useParams } from 'react-router-dom';

import api from '../../lib/api';
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
  trending: boolean;
}

const SellerProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [seller, setSeller] = useState("");

  const { id } = useParams();

  const getSeller = async () => {
    try {
      const response = await api.get(`/admin/get-seller/${id}`);
      setSeller(response.data.name);
    } catch (error) {
      console.error('Error fetching seller:', error);
    }
  };

  const getProducts = async () => {
    try {
      const response = await api.get(`/admin/get-products/${id}`);
      if (response.data && Array.isArray(response.data)) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
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
      return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    } else {
      return sortDirection === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
    }
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const SortIndicator = ({ field }: { field: string }) => {
    if (sortField !== field) return null;
    return <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  useEffect(() => {
    getProducts();
    getSeller();
  }, []);

  return (
    <AdminLayout title="Seller products">

        <div className="bg-white rounded-md  border border-line">
          <div className="p-6 flex flex-col md:flex-row justify-between items-center border-b border-line">
            <h2 className="text-xl font-semibold text-ink mb-4 md:mb-0">Products By {seller}</h2>

            <div className="relative flex-grow md:max-w-md">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-line rounded-lg focus:ring-2 focus:ring-ink focus:border-ink"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted" />
            </div>
          </div>

          <div className="overflow-x-auto p-6">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-line">
                  <th className="pb-4 px-4 text-ink-soft font-semibold cursor-pointer" onClick={() => handleSort('name')}>
                    Product Name <SortIndicator field="name" />
                  </th>
                  <th className="pb-4 px-4 text-ink-soft font-semibold cursor-pointer" onClick={() => handleSort('brand')}>
                    Brand <SortIndicator field="brand" />
                  </th>
                  <th className="pb-4 px-4 text-ink-soft font-semibold cursor-pointer" onClick={() => handleSort('category')}>
                    Category <SortIndicator field="category" />
                  </th>
                  <th className="pb-4 px-4 text-ink-soft font-semibold">Sub Category</th>
                  <th className="pb-4 px-4 text-ink-soft font-semibold cursor-pointer" onClick={() => handleSort('priceINR')}>
                    Price (INR) <SortIndicator field="priceINR" />
                  </th>
                  <th className="pb-4 px-4 text-ink-soft font-semibold cursor-pointer" onClick={() => handleSort('priceAED')}>
                    Price (AED) <SortIndicator field="priceAED" />
                  </th>
                  <th className="pb-4 px-4 text-ink-soft font-semibold">Images</th>
                  <th className="pb-4 px-4 text-ink-soft font-semibold">Trending</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((product) => (
                    <tr key={product._id} className="border-b border-gray-50 hover:bg-canvas transition-colors">
                      <td className="py-4 px-4 text-ink">{product.name}</td>
                      <td className="py-4 px-4 text-ink">{product.brand}</td>
                      <td className="py-4 px-4 text-ink">{product.categoryId.name}</td>
                      <td className="py-4 px-4 text-ink">{product.subCategoryId.name}</td>
                      <td className="py-4 px-4 text-ink">₹{product.priceINR}</td>
                      <td className="py-4 px-4 text-ink">AED {product.priceAED}</td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          {product.images && Object.values(product.images).length > 0 && (
                            <img
                              src={Object.values(product.images)[0]}
                              alt={`${product.name} 1`}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded ${product.trending ? 'bg-green-100 text-green-800' : 'bg-canvas text-ink'}`}>
                          {product.trending ? 'Yes' : 'No'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-4 px-4 text-center text-muted">No products found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {sortedProducts.length > 0 && totalPages > 1 && (
            <div className="flex flex-col md:flex-row justify-between items-center px-6 py-4 border-t border-line gap-4">
              <div className="text-sm text-ink-soft">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sortedProducts.length)} of {sortedProducts.length} entries
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-line hover:bg-canvas disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`w-10 h-10 rounded-lg ${currentPage === number
                      ? 'bg-ink text-white'
                      : 'border border-line hover:bg-canvas'
                      }`}
                  >
                    {number}
                  </button>
                ))}
                <button
                  onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-line hover:bg-canvas disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
  );
};

export default SellerProducts;