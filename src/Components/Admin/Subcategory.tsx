import React, { useEffect, useState } from 'react';
import { PlusCircle, X, Upload, Edit2, Search, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { baseurl } from '../../Constant/Base';
import axios from "axios";

// Types
interface Category {
  _id: string;
  name: string;
  image: string;
  createdAt: string;
  updatedAt: string;
  // status?: 'LISTED' | 'UNLISTED';
}

interface SubCategory extends Category {
  categoryId: Category;
  parentCategory?: Category;
}

interface CategoryFormData {
  name: string;
  image: File | null;
  categoryId: string;
  currentImage?: string;
}

const SubCategory = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState<SubCategory[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    image: null,
    categoryId: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSubCategoryId, setCurrentSubCategoryId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Search and pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const api = axios.create({
    baseURL: baseurl,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('categoryId', formData.categoryId);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      if (isEditing && currentSubCategoryId) {
        formDataToSend.append('subCategoryId', currentSubCategoryId);
        await api.put(`/admin/edit-subcategory/${currentSubCategoryId}`, formDataToSend);
      } else {
        await api.post("/admin/add-subcategory", formDataToSend);
      }

      await getSubCategories(); // Refresh subcategories after adding or updating
      handleCloseModal();
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} subcategory:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (subCategory: SubCategory) => {
    setIsEditing(true);
    setCurrentSubCategoryId(subCategory._id);
    setFormData({
      name: subCategory.name,
      image: null,
      categoryId: subCategory.categoryId._id,
      currentImage: subCategory.image
    });
    setImagePreview(subCategory.image);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setCurrentSubCategoryId(null);
    setFormData({ name: '', image: null, categoryId: '' });
    setImagePreview(null);
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
        setFilteredSubCategories(response.data);
        updatePagination(response.data);
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  };

  // Handle search input change
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.trim() === '') {
      setFilteredSubCategories(subCategories);
    } else {
      const results = subCategories.filter(
        item => 
          item.name.toLowerCase().includes(term.toLowerCase()) ||
          (item.categoryId?.name?.toLowerCase().includes(term.toLowerCase()))
      );
      setFilteredSubCategories(results);
    }
    
    setCurrentPage(1); // Reset to first page on new search
    updatePagination(term.trim() === '' ? subCategories : filteredSubCategories);
  };

  // Update pagination based on filtered results
  const updatePagination = (items: SubCategory[]) => {
    setTotalPages(Math.ceil(items.length / itemsPerPage));
  };

  // Get current items for the current page
  const getCurrentItems = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredSubCategories.slice(indexOfFirstItem, indexOfLastItem);
  };

  // Pagination controls
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    getCategories();
    getSubCategories();
  }, []); // Only run once on component mount

  useEffect(() => {
    updatePagination(filteredSubCategories);
  }, [filteredSubCategories, itemsPerPage]);

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
          <div className="p-6 flex flex-col md:flex-row md:justify-between md:items-center border-b border-gray-100 gap-4">
            <h2 className="text-xl font-semibold text-gray-800">Sub-Categories</h2>
            
            {/* Search Box */}
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search subcategories..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <button 
              onClick={() => {
                setIsEditing(false);
                setCurrentSubCategoryId(null);
                setFormData({ name: '', image: null, categoryId: '' });
                setImagePreview(null);
                setIsModalOpen(true);
              }}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
            >
              <PlusCircle size={20} />
              <span>Add Sub-Category</span>
            </button>
          </div>

          <div className="overflow-x-auto p-6">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-100">
                  <th className="pb-4 px-4 text-gray-600 font-semibold">Sub-Category Name</th>
                  <th className="pb-4 px-4 text-gray-600 font-semibold">Parent Category</th>
                  <th className="pb-4 px-4 text-gray-600 font-semibold">Image</th>
                  <th className="pb-4 px-4 text-gray-600 font-semibold">Created At</th>
                  {/* <th className="pb-4 px-4 text-gray-600 font-semibold">Status</th> */}
                  <th className="pb-4 px-4 text-gray-600 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {getCurrentItems().map((subCategory) => (
                  <tr
                    key={subCategory._id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-4 text-gray-800">{subCategory.name}</td>
                    <td className="py-4 px-4 text-gray-800">
                      {subCategory.categoryId?.name || 'N/A'}
                    </td>
                    <td className="py-4 px-4">
                      <img 
                        src={subCategory.image} 
                        alt={subCategory.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {new Date(subCategory.createdAt).toLocaleDateString()}
                    </td>
                    {/* <td className="py-4 px-4">
                      <span
                        className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                          subCategory.status === 'LISTED'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {subCategory.status || 'UNLISTED'}
                      </span>
                    </td> */}
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleEdit(subCategory)}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Pagination Controls */}
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {filteredSubCategories.length > 0 
                  ? `${((currentPage - 1) * itemsPerPage) + 1} to ${Math.min(currentPage * itemsPerPage, filteredSubCategories.length)}` 
                  : '0'} of {filteredSubCategories.length} subcategories
              </p>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-md ${
                    currentPage === 1 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <ChevronLeft size={20} />
                </button>
                
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages || 1}
                </span>
                
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className={`p-2 rounded-md ${
                    currentPage === totalPages || totalPages === 0
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
            
            {/* No Results Message */}
            {filteredSubCategories.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No subcategories found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit SubCategory Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full">
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h3 className="text-xl font-semibold text-gray-800">
                  {isEditing ? 'Edit Sub-Category' : 'Add New Sub-Category'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parent Category
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sub-Category Name
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
                    Sub-Category Image
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                    <div className="space-y-2 text-center">
                      {imagePreview ? (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="mx-auto h-32 w-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview(null);
                              setFormData({ ...formData, image: null });
                            }}
                            className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                              <span>Upload a file</span>
                              <input
                                type="file"
                                className="sr-only"
                                accept="image/*"
                                onChange={handleImageChange}
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

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
                    {isLoading ? (isEditing ? 'Updating...' : 'Creating...') : 
                      (isEditing ? 'Update Sub-Category' : 'Create Sub-Category')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SubCategory;