import React, { useEffect, useState } from 'react';
import { PlusCircle, X, Upload, Edit2, Search, ChevronLeft, ChevronRight, Trash2, Menu, LogOut, Film, Image } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { baseurl } from '../../Constant/Base';
import axios from "axios";
import ExtractToken from '../../Token/Extract';
import { useGetToken } from '../../Token/getToken';
import { toast } from 'react-hot-toast'; 

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
  videos: string[];
  description: string;
  createdAt: string;
  updatedAt: string;
  trending: boolean;
}

interface Seller {
  name: string;
  status: boolean;
}

interface MediaFile {
  file: File | null;
  type: 'image' | 'video';
  preview: string;
}

interface ProductFormData {
  name: string;
  brand: string;
  categoryId: string;
  subCategoryId: string;
  priceINR: string;
  priceAED: string;
  mediaFiles: MediaFile[];
  existingImages: string[];
  existingVideos: string[];
  description: string;
  isTrending: boolean;
}

const SellerProductPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState<SubCategory[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>(['', '', '', '']);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    brand: '',
    categoryId: '',
    subCategoryId: '',
    priceINR: '',
    priceAED: '',
    mediaFiles: [
      { file: null, type: 'image', preview: '' },
      { file: null, type: 'image', preview: '' },
      { file: null, type: 'image', preview: '' },
      { file: null, type: 'image', preview: '' }
    ],
    existingImages: [],
    existingVideos: [],
    description: '',
    isTrending: false
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const api = axios.create({
    baseURL: baseurl,
  });
  const [seller, setSeller] = useState<Seller>({ name: "", status: false });

  const token = useGetToken("sellerToken");
  const sellerId = ExtractToken(token);

  const getSeller = async () => {
    try {
      const response = await api.get(`/admin/get-seller/${sellerId.userId}`);
      setSeller({
        name: response.data.name,
        status: response.data.status 
      });
    } catch (error) {
      console.error('Error fetching seller:', error);
      toast.error('Failed to fetch seller information');
    }
  };

  const handleDeleteClick = (productId: string) => {
    if (!seller.status) {
      toast.error('Your account is pending approval. Please contact admin for more information.');
      return;
    }
    setProductToDelete(productId);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
  
    try {
      await api.delete(`/seller/delete-product/${productToDelete}`);
      toast.success('Product deleted successfully');
      
      setProducts(prevProducts => prevProducts.filter(product => product._id !== productToDelete));
      
      setDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleAddNewClick = () => {
    if (!seller.status) {
      toast.error('Your account is pending approval. Please contact admin for more information.');
      return;
    }
    setIsModalOpen(true);
  };

  const getCategories = async () => {
    try {
      const response = await api.get("/admin/get-category");
      if (response.data && Array.isArray(response.data)) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const getSubCategories = async () => {
    try {
      const response = await api.get("/admin/get-subcategory");
      if (response.data && Array.isArray(response.data)) {
        setSubCategories(response.data);
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  };

  const getProducts = async () => {
    try {
      const response = await api.get(`/seller/get-products/${sellerId.userId}`);
      if (response.data.products && Array.isArray(response.data.products)) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = e.target.value;
    setFormData({
      ...formData,
      categoryId,
      subCategoryId: '',
    });
    
    const filtered = subCategories.filter(subCat => {
      if (typeof subCat.categoryId === 'object' && subCat.categoryId !== null) {
        return subCat.categoryId._id === categoryId;
      }
      return subCat.categoryId === categoryId;
    });
    
    setFilteredSubCategories(filtered);
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>, index: number, mediaType: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      
      const newMediaFiles = [...formData.mediaFiles];
      newMediaFiles[index] = {
        file,
        type: mediaType,
        preview: previewUrl
      };
      
      if (mediaType === 'image') {
        const newExistingImages = [...formData.existingImages];
        newExistingImages[index] = '';
        
        setFormData(prev => ({
          ...prev,
          mediaFiles: newMediaFiles,
          existingImages: newExistingImages
        }));
      } else {
        const newExistingVideos = [...formData.existingVideos];
        newExistingVideos[index - formData.existingImages.length] = '';
        
        setFormData(prev => ({
          ...prev,
          mediaFiles: newMediaFiles,
          existingVideos: newExistingVideos
        }));
      }
      
      const newPreviews = [...mediaPreviews];
      newPreviews[index] = previewUrl;
      setMediaPreviews(newPreviews);
    }
  };

  const removeMedia = (index: number) => {
    const newMediaFiles = [...formData.mediaFiles];
    newMediaFiles[index] = { file: null, type: 'image', preview: '' };

    const isImage = index < formData.existingImages.length;
    
    if (isImage) {
      const newExistingImages = [...formData.existingImages];
      newExistingImages[index] = '';
      
      setFormData(prev => ({
        ...prev,
        mediaFiles: newMediaFiles,
        existingImages: newExistingImages
      }));
    } else {
      const videoIndex = index - formData.existingImages.length;
      const newExistingVideos = [...formData.existingVideos];
      newExistingVideos[videoIndex] = '';
      
      setFormData(prev => ({
        ...prev,
        mediaFiles: newMediaFiles,
        existingVideos: newExistingVideos
      }));
    }
    
    const newPreviews = [...mediaPreviews];
    newPreviews[index] = '';
    setMediaPreviews(newPreviews);
  };

  const toggleMediaType = (index: number) => {
    const newMediaFiles = [...formData.mediaFiles];
    const currentType = newMediaFiles[index].type;
    newMediaFiles[index] = { 
      ...newMediaFiles[index], 
      type: currentType === 'image' ? 'video' : 'image'
    };
    
    setFormData(prev => ({
      ...prev,
      mediaFiles: newMediaFiles
    }));
  };

  const handleEdit = (product: Product) => {
    if (!seller.status) {
      toast.error('Your account is pending approval. Please contact admin for more information.');
      return;
    }
    
    setEditingProduct(product._id);
    
    const imageArray = Array.isArray(product.images) 
      ? product.images 
      : Object.values(product.images || {});
      
    const videoArray = Array.isArray(product.videos) 
      ? product.videos 
      : Object.values(product.videos || {});
    
    const initialMediaFiles: MediaFile[] = [
      { file: null, type: 'image', preview: '' },
      { file: null, type: 'image', preview: '' },
      { file: null, type: 'image', preview: '' },
      { file: null, type: 'image', preview: '' }
    ];
    
    const previews = Array(4).fill('');
    
    imageArray.forEach((url, index) => {
      if (index < 4) {
        initialMediaFiles[index].type = 'image'; // This is now explicitly typed as 'image'
        previews[index] = url;
      }
    });
    
    videoArray.forEach((url, index) => {
      const mediaIndex = imageArray.length + index;
      if (mediaIndex < 4) {
        initialMediaFiles[mediaIndex].type = 'video'; // This is now explicitly typed as 'video'
        previews[mediaIndex] = url;
      }
    });
    
    setMediaPreviews(previews);
  
    setFormData({
      name: product.name,
      brand: product.brand,
      categoryId: product.categoryId._id,
      subCategoryId: product.subCategoryId._id,
      priceINR: product.priceINR.toString(),
      priceAED: product.priceAED.toString(),
      mediaFiles: initialMediaFiles,
      existingImages: imageArray as string[],
      existingVideos: videoArray as string[],
      description: product.description || '',
      isTrending: product.trending
    });
  
    const filtered = subCategories.filter(subCat => {
      if (typeof subCat.categoryId === 'object' && subCat.categoryId !== null) {
        return subCat.categoryId._id === product.categoryId._id;
      }
      return subCat.categoryId === product.categoryId._id;
    });
    
    setFilteredSubCategories(filtered);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seller.status) {
      toast.error('Your account is pending approval. Please contact admin for more information.');
      return;
    }
    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('brand', formData.brand);
      formDataToSend.append('categoryId', formData.categoryId);
      formDataToSend.append('subCategoryId', formData.subCategoryId);
      formDataToSend.append('priceINR', formData.priceINR);
      formDataToSend.append('priceAED', formData.priceAED);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('isTrending', formData.isTrending.toString());
      formDataToSend.append("sellerId", sellerId.userId);
      
      const nonEmptyExistingImages = formData.existingImages.filter(url => url !== '');
      formDataToSend.append('existingImages', JSON.stringify(nonEmptyExistingImages));
      
      const nonEmptyExistingVideos = formData.existingVideos.filter(url => url !== '');
      formDataToSend.append('existingVideos', JSON.stringify(nonEmptyExistingVideos));
      
      let imageCount = 0;
      let videoCount = 0;
      
      formData.mediaFiles.forEach((media) => {
        if (media.file) {
          if (media.type === 'image') {
            formDataToSend.append(`image${imageCount + 1}`, media.file);
            imageCount++;
          } else {
            formDataToSend.append(`video${videoCount + 1}`, media.file);
            videoCount++;
          }
        }
      });

      console.log("this be consoling ")
      
      if (editingProduct) {
        await api.put(`/seller/edit-product/${editingProduct}`, formDataToSend);
      } else {
        const aws = await api.post("/seller/add-product", formDataToSend);
        console.log("this be consoling 2",aws)



      }
      
      await getProducts();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      brand: '',
      categoryId: '',
      subCategoryId: '',
      priceINR: '',
      priceAED: '',
      mediaFiles: [
        { file: null, type: 'image', preview: '' },
        { file: null, type: 'image', preview: '' },
        { file: null, type: 'image', preview: '' },
        { file: null, type: 'image', preview: '' }
      ],
      existingImages: [],
      existingVideos: [],
      description: '',
      isTrending: false
    });
    setMediaPreviews(['', '', '', '']);
    setFilteredSubCategories([]);
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

  const handleLogout = () => {
    localStorage.removeItem("sellerToken");
    window.location.href = "/login";
  };
  
  useEffect(() => {
    getSeller();
    getProducts();
    getCategories();
    getSubCategories();
  }, []);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
     <div className="md:hidden fixed top-0 left-0 right-0 z-10 bg-white p-4 shadow-md flex justify-between items-center">
        <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-gray-100">
          <Menu size={24} />
        </button>
        
        <h1 className="text-xl font-bold text-gray-800">Manage Products</h1>
        
        <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-gray-100 text-red-600">
          <LogOut size={24} />
        </button>
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
          
      <main className="flex-1 p-4 sm:p-8 mt-16 md:mt-0">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome, <span className="text-blue-600">{seller.name}</span>
        </h1>
        <p className="text-gray-600 mt-2">Manage your products</p>
        
        {!seller.status && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
            Your account is pending approval from admin. You can view your products but cannot add or edit them.
          </div>
        )}
       
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 flex flex-col md:flex-row justify-between items-center border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 md:mb-0">Products</h2>
            
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <div className="relative flex-grow md:max-w-md">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              
              <button 
                onClick={handleAddNewClick}
                className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors shadow-sm ${
                  seller.status 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!seller.status}
              >
                <PlusCircle size={20} />
                <span>Add Product</span>
              </button>
            </div>
          </div>
  
          <div className="overflow-x-auto p-6">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-100">
                  <th 
                    className="pb-4 px-4 text-gray-600 font-semibold cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    Product Name <SortIndicator field="name" />
                  </th>
                  <th 
                    className="pb-4 px-4 text-gray-600 font-semibold cursor-pointer"
                    onClick={() => handleSort('brand')}
                  >
                    Brand <SortIndicator field="brand" />
                  </th>
                  <th 
                    className="pb-4 px-4 text-gray-600 font-semibold cursor-pointer"
                    onClick={() => handleSort('category')}
                  >
                    Category <SortIndicator field="category" />
                  </th>
                  <th className="pb-4 px-4 text-gray-600 font-semibold">
                    Sub Category
                  </th>
                  <th 
                    className="pb-4 px-4 text-gray-600 font-semibold cursor-pointer"
                    onClick={() => handleSort('priceINR')}
                  >
                    Price (INR) <SortIndicator field="priceINR" />
                  </th>
                  <th 
                    className="pb-4 px-4 text-gray-600 font-semibold cursor-pointer"
                    onClick={() => handleSort('priceAED')}
                  >
                    Price (AED) <SortIndicator field="priceAED" />
                  </th>
                  <th className="pb-4 px-4 text-gray-600 font-semibold">Media</th>
                  <th className="pb-4 px-4 text-gray-600 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((product) => (
                    <tr
                      key={product._id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4 text-gray-800">{product.name}</td>
                      <td className="py-4 px-4 text-gray-800">{product.brand}</td>
                      <td className="py-4 px-4 text-gray-800">{product.categoryId.name}</td>
                      <td className="py-4 px-4 text-gray-800">{product.subCategoryId.name}</td>
                      <td className="py-4 px-4 text-gray-800">₹{product.priceINR}</td>
                      <td className="py-4 px-4 text-gray-800">AED {product.priceAED}</td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          {product.images && Object.values(product.images).length > 0 && (
                            <div className="relative">
                              <img 
                                src={Object.values(product.images)[0]} 
                                alt={`${product.name} 1`}
                                className="w-12 h-12 object-cover rounded"
                              />
                              <span className="absolute bottom-0 right-0 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {Object.values(product.images).length}
                              </span>
                            </div>
                          )}
                          {product.videos && Object.values(product.videos).length > 0 && (
                            <div className="relative">
                              <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                <Film size={20} className="text-gray-600" />
                              </div>
                              <span className="absolute bottom-0 right-0 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {Object.values(product.videos).length}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-3">
                          <button 
                            className="text-blue-600 hover:text-blue-800"
                            onClick={() => handleEdit(product)}
                          >
                            <Edit2 size={20} />
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-800"
                            onClick={() => handleDeleteClick(product._id)}
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-4 px-4 text-center text-gray-500">
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {deleteModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl max-w-md w-full p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Confirm Delete
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this product? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => {
                      setDeleteModalOpen(false);
                      setProductToDelete(null);
                    }}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {sortedProducts.length > 0 && totalPages > 1 && (
            <div className="flex flex-col md:flex-row justify-between items-center px-6 py-4 border-t border-gray-100 gap-4">
              <div className="text-sm text-gray-600">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sortedProducts.length)} of {sortedProducts.length} entries
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                {totalPages <= 5 ? (
                  Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`w-10 h-10 rounded-lg ${
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
                      className={`w-10 h-10 rounded-lg ${
                        currentPage === 1
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      1
                    </button>
                    
                    {/* Show ellipsis if current page is > 3 */}
                    {currentPage > 3 && (
                      <span className="w-10 h-10 flex items-center justify-center">...</span>
                    )}
                    
                    {/* Show current page and neighbors */}
                    {Array.from(
                      { length: 3 },
                      (_, i) => currentPage - 1 + i
                    )
                      .filter(num => num > 1 && num < totalPages)
                      .map(number => (
                        <button
                          key={number}
                          onClick={() => paginate(number)}
                          className={`w-10 h-10 rounded-lg ${
                            currentPage === number
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {number}
                        </button>
                      ))}
                    
                    {/* Show ellipsis if current page is < totalPages - 2 */}
                    {currentPage < totalPages - 2 && (
                      <span className="w-10 h-10 flex items-center justify-center">...</span>
                    )}
                    
                    {/* Always show last page */}
                    <button
                      onClick={() => paginate(totalPages)}
                      className={`w-10 h-10 rounded-lg ${
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
  
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h3 className="text-xl font-semibold text-gray-800">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
  
              <div className="overflow-y-auto flex-1">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Brand
                      </label>
                      <input
                        type="text"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
  
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        value={formData.categoryId}
                        onChange={handleCategoryChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
  
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sub Category
                      </label>
                      <select
                        value={formData.subCategoryId}
                        onChange={(e) => setFormData({ ...formData, subCategoryId: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                        disabled={!formData.categoryId}
                      >
                        <option value="">Select Sub Category</option>
                        {filteredSubCategories.map((subCategory) => (
                          <option key={subCategory._id} value={subCategory._id}>
                            {subCategory.name}
                          </option>
                        ))}
                      </select>
                    </div>
  
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price (INR)
                      </label>
                      <input
                        type="number"
                        value={formData.priceINR}
                        onChange={(e) => setFormData({ ...formData, priceINR: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
  
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price (AED)
                      </label>
                      <input
                        type="number"
                        value={formData.priceAED}
                        onChange={(e) => setFormData({ ...formData, priceAED: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  <div className="col-span-2 mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={5}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter product description..."
                    ></textarea>
                  </div>
  
                    <div className="col-span-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={formData.isTrending}
                          onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        <span className="ml-3 text-sm font-medium text-gray-700">Set as Trending</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Media
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {[0, 1, 2, 3].map((index) => (
                        <div key={index} className="mt-1 flex flex-col items-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                          {mediaPreviews[index] || 
                            (formData.mediaFiles[index].type === 'image' && formData.existingImages[index]) || 
                            (formData.mediaFiles[index].type === 'video' && formData.existingVideos[index - formData.existingImages.length]) ? (
                            <div className="relative w-full h-48">
                              {formData.mediaFiles[index].type === 'image' ? (
                                <img
                                  src={mediaPreviews[index] || formData.existingImages[index]}
                                  alt={`Preview ${index + 1}`}
                                  className="h-full w-full object-cover rounded-lg"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-lg">
                                  <Film size={48} className="text-gray-400" />
                                  <span className="ml-2 text-gray-600">Video</span>
                                </div>
                              )}
                              <div className="absolute top-2 right-2 flex space-x-2">
                                <button
                                  type="button"
                                  onClick={() => toggleMediaType(index)}
                                  className="bg-blue-500 text-white rounded-full p-1"
                                >
                                  {formData.mediaFiles[index].type === 'image' ? <Film size={16} /> : <Image size={16} />}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeMedia(index)}
                                  className="bg-red-500 text-white rounded-full p-1"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2 text-center">
                              <Upload className="mx-auto h-12 w-12 text-gray-400" />
                              <div className="flex text-sm text-gray-600">
                                <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                                  <span>Upload {formData.mediaFiles[index].type === 'image' ? 'Image' : 'Video'} {index + 1}</span>
                                  <input
                                    type="file"
                                    className="sr-only"
                                    accept={formData.mediaFiles[index].type === 'image' ? "image/*" : "video/*"}
                                    onChange={(e) => handleMediaChange(e, index, formData.mediaFiles[index].type)}
                                  />
                                </label>
                              </div>
                              <button
                                type="button"
                                onClick={() => toggleMediaType(index)}
                                className="mt-2 text-xs text-blue-600 hover:text-blue-500"
                              >
                                Switch to {formData.mediaFiles[index].type === 'image' ? 'Video' : 'Image'}
                              </button>
                              <p className="text-xs text-gray-500">
                                {formData.mediaFiles[index].type === 'image' ? 'PNG, JPG up to 10MB' : 'MP4, MOV up to 20MB'}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
  
                  <div className="sticky bottom-0 bg-white pt-4 pb-4 border-t border-gray-100">
                    <div className="flex justify-end space-x-4">
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        className="px-4 py-2 text-gray-700 hover:text-gray-900"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {isLoading ? (editingProduct ? 'Updating...' : 'Creating...') : (editingProduct ? 'Update Product' : 'Create Product')}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SellerProductPage;


