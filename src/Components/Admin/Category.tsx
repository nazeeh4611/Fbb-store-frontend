import React, { useEffect, useState } from 'react';
import { PlusCircle, X, Upload, Edit2, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
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
  status?: 'LISTED' | 'UNLISTED';
}

interface CategoryFormData {
  name: string;
  image: File | null;
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

const CategoryPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    image: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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

  const handleEditClick = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      image: null,
    });
    setImagePreview(category.image);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      if (isEditMode && selectedCategory) {
        formDataToSend.append('categoryId', selectedCategory._id);
        await api.put("/admin/edit-category", formDataToSend);
      } else {
        await api.post("/admin/add-category", formDataToSend);
      }

      await getCategory();
      handleCloseModal();
    } catch (error) {
      console.error('Error with category:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setSelectedCategory(null);
    setFormData({ name: '', image: null });
    setImagePreview(null);
  };

  const getCategory = async () => {
    try {
      const response = await api.get("/admin/get-category");
      if (response.data && Array.isArray(response.data)) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    getCategory();
  }, []);

  // Pagination calculations
  const totalPages = Math.ceil(categories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCategories = categories.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

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
            <div className="p-4 sm:p-6 flex flex-wrap gap-3 justify-between items-center border-b border-gray-100">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Categories</h2>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center space-x-1 sm:space-x-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm sm:text-base"
              >
                <PlusCircle size={18} />
                <span>Add Category</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              {/* Card View for Mobile */}
              <div className="block lg:hidden">
                {currentCategories.map((category) => (
                  <div 
                    key={category._id}
                    className="p-4 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-start gap-3">
                      <img 
                        src={category.image} 
                        alt={category.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800">{category.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Created: {new Date(category.createdAt).toLocaleDateString()}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              category.status === 'LISTED'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {category.status || 'UNLISTED'}
                          </span>
                          <button
                            onClick={() => handleEditClick(category)}
                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <Edit2 size={16} />
                            <span>Edit</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Table View for Desktop */}
              <table className="hidden lg:table w-full">
                <thead>
                  <tr className="text-left border-b border-gray-100">
                    <th className="pb-4 px-4 text-gray-600 font-semibold">Category Name</th>
                    <th className="pb-4 px-4 text-gray-600 font-semibold">Image</th>
                    <th className="pb-4 px-4 text-gray-600 font-semibold">Created At</th>
                    <th className="pb-4 px-4 text-gray-600 font-semibold">Status</th>
                    <th className="pb-4 px-4 text-gray-600 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCategories.map((category) => (
                    <tr
                      key={category._id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4 text-gray-800">{category.name}</td>
                      <td className="py-4 px-4">
                        <img 
                          src={category.image} 
                          alt={category.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {new Date(category.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                            category.status === 'LISTED'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {category.status || 'UNLISTED'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleEditClick(category)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Edit2 size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination Component */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
          </div>

          {/* Add/Edit Category Modal - Full screen on mobile */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-0 lg:p-4 z-50">
              <div className="bg-white rounded-none lg:rounded-xl w-full h-full lg:h-auto lg:max-w-md lg:max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 flex justify-between items-center p-4 lg:p-6 border-b border-gray-100 bg-white z-10">
                  <h3 className="text-lg lg:text-xl font-semibold text-gray-800">
                    {isEditMode ? 'Edit Category' : 'Add New Category'}
                  </h3>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 lg:p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category Name
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
                      Category Image
                    </label>
                    <div className="mt-1 flex justify-center px-4 lg:px-6 pt-4 lg:pt-5 pb-4 lg:pb-6 border-2 border-gray-300 border-dashed rounded-lg">
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
                            <div className="flex flex-wrap justify-center gap-1 text-sm text-gray-600">
                              <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                                <span>Upload a file</span>
                                <input
                                  type="file"
                                  className="sr-only"
                                  accept="image/*"
                                  onChange={handleImageChange}
                                />
                              </label>
                              <p className="">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, GIF up to 10MB
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-4 sticky bottom-0 bg-white border-t border-gray-100 mt-6">
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
                      {isLoading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Category' : 'Create Category')}
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

export default CategoryPage;