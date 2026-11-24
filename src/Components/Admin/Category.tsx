import React, { useEffect, useState } from 'react';
import { PlusCircle, Upload, Edit2, ChevronLeft, ChevronRight , X } from 'lucide-react';
import { AdminLayout } from './Sidebar';

import api from '../../lib/api';
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
          className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-ink-soft bg-white border border-line rounded-md hover:bg-canvas disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-ink-soft bg-white border border-line rounded-md hover:bg-canvas disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-ink-soft">
            Showing page <span className="font-medium">{currentPage}</span> of{' '}
            <span className="font-medium">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md " aria-label="Pagination">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-muted ring-1 ring-inset ring-line hover:bg-canvas focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => onPageChange(index + 1)}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                  currentPage === index + 1
                    ? 'z-10 bg-ink text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                    : 'text-ink ring-1 ring-inset ring-line hover:bg-canvas focus:z-20 focus:outline-offset-0'
                }`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-muted ring-1 ring-inset ring-line hover:bg-canvas focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
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
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;


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

  return (
    <AdminLayout title="Categories" subtitle="Top-level departments shown in the store menu">

          <div className="bg-white rounded-md  border border-line">
            <div className="p-4 sm:p-6 flex flex-wrap gap-3 justify-between items-center border-b border-line">
              <h2 className="text-lg sm:text-xl font-semibold text-ink">Categories</h2>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center space-x-1 sm:space-x-2 bg-ink text-white px-3 py-2 rounded-lg hover:bg-black transition-colors  text-sm sm:text-base"
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
                    className="p-4 border-b border-line last:border-b-0"
                  >
                    <div className="flex items-start gap-3">
                      <img 
                        src={category.image} 
                        alt={category.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-ink">{category.name}</h3>
                        <p className="text-sm text-ink-soft mt-1">
                          Created: {new Date(category.createdAt).toLocaleDateString()}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              category.status === 'LISTED'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-sale'
                            }`}
                          >
                            {category.status || 'UNLISTED'}
                          </span>
                          <button
                            onClick={() => handleEditClick(category)}
                            className="flex items-center gap-1 text-sm text-ink hover:text-blue-800 transition-colors"
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
                  <tr className="text-left border-b border-line">
                    <th className="pb-4 px-4 text-ink-soft font-semibold">Category Name</th>
                    <th className="pb-4 px-4 text-ink-soft font-semibold">Image</th>
                    <th className="pb-4 px-4 text-ink-soft font-semibold">Created At</th>
                    <th className="pb-4 px-4 text-ink-soft font-semibold">Status</th>
                    <th className="pb-4 px-4 text-ink-soft font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCategories.map((category) => (
                    <tr
                      key={category._id}
                      className="border-b border-gray-50 hover:bg-canvas transition-colors"
                    >
                      <td className="py-4 px-4 text-ink">{category.name}</td>
                      <td className="py-4 px-4">
                        <img 
                          src={category.image} 
                          alt={category.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      </td>
                      <td className="py-4 px-4 text-ink-soft">
                        {new Date(category.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                            category.status === 'LISTED'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-sale'
                          }`}
                        >
                          {category.status || 'UNLISTED'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleEditClick(category)}
                          className="text-ink hover:text-blue-800 transition-colors"
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
            <div className="fixed inset-0 bg-black  flex items-center justify-center p-0 lg:p-4 z-50">
              <div className="bg-white rounded-none lg:rounded-md w-full h-full lg:h-auto lg:max-w-md lg:max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 flex justify-between items-center p-4 lg:p-6 border-b border-line bg-white z-10">
                  <h3 className="text-lg lg:text-xl font-semibold text-ink">
                    {isEditMode ? 'Edit Category' : 'Add New Category'}
                  </h3>
                  <button
                    onClick={handleCloseModal}
                    className="text-muted hover:text-ink-soft"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 lg:p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-ink-soft mb-2">
                      Category Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-line rounded-lg focus:ring-2 focus:ring-ink focus:border-ink"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink-soft mb-2">
                      Category Image
                    </label>
                    <div className="mt-1 flex justify-center px-4 lg:px-6 pt-4 lg:pt-5 pb-4 lg:pb-6 border-2 border-line border-dashed rounded-lg">
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
                              className="absolute top-0 right-0 -mt-2 -mr-2 bg-sale text-white rounded-full p-1"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload className="mx-auto h-12 w-12 text-muted" />
                            <div className="flex flex-wrap justify-center gap-1 text-sm text-ink-soft">
                              <label className="relative cursor-pointer rounded-md font-medium text-ink hover:text-ink">
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
                            <p className="text-xs text-muted">
                              PNG, JPG, GIF up to 10MB
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-4 sticky bottom-0 bg-white border-t border-line mt-6">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-4 py-2 text-ink-soft hover:text-ink"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2 bg-ink text-white rounded-lg hover:bg-black transition-colors disabled:opacity-50"
                    >
                      {isLoading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Category' : 'Create Category')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </AdminLayout>
  );
};

export default CategoryPage;