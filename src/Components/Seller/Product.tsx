import React, { useEffect, useState } from 'react';
import { PlusCircle, X, Upload, Edit2, Search, ChevronLeft, ChevronRight, Trash2, Menu, LogOut, Film, Image, Package,BarChart3, ShoppingBag, TrendingUp, Phone, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { baseurl } from '../../Constant/Base';
import axios from "axios";
import ExtractToken from '../../Token/Extract';
import { useGetToken } from '../../Token/getToken';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

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
  stock: number;
  lowStockThreshold: number;
  sku: string;
  shortDescription: string;
  specifications: Map<string, string>;
  weight: { value: number; unit: string };
  dimensions: { length: number; width: number; height: number; unit: string };
  colors: string[];
  sizes: string[];
  material: string;
  warranty: { period: number; unit: string; description: string };
  tags: string[];
  images: string[];
  videos: string[];
  description: string;
  createdAt: string;
  updatedAt: string;
  trending: boolean;
  featured: boolean;
  discount: { percentage: number; amount: number; startDate: string; endDate: string };
  shippingInfo: { weightBased: boolean; freeShipping: boolean; shippingCost: number };
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
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
  sku: string;
  categoryId: string;
  subCategoryId: string;
  priceINR: string;
  priceAED: string;
  stock: string;
  lowStockThreshold: string;
  shortDescription: string;
  specifications: { key: string; value: string }[];
  weightValue: string;
  weightUnit: string;
  length: string;
  width: string;
  height: string;
  dimensionUnit: string;
  colors: string;
  sizes: string;
  material: string;
  warrantyPeriod: string;
  warrantyUnit: string;
  warrantyDescription: string;
  tags: string;
  mediaFiles: MediaFile[];
  existingImages: string[];
  existingVideos: string[];
  description: string;
  isTrending: boolean;
  isFeatured: boolean;
  discountPercentage: string;
  discountAmount: string;
  discountStartDate: string;
  discountEndDate: string;
  weightBasedShipping: boolean;
  freeShipping: boolean;
  shippingCost: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
}

interface FieldConfig {
  showColors: boolean;
  showSizes: boolean;
  showMaterial: boolean;
  showWeight: boolean;
  showDimensions: boolean;
  showWarranty: boolean;
  showSpecifications: boolean;
  showDiscount: boolean;
  showShipping: boolean;
  showSEO: boolean;
}

const getCategoryName = (name: string) => name.toLowerCase().trim();

const getFieldConfig = (categoryName: string, subCategoryName: string): FieldConfig => {
  const cat = getCategoryName(categoryName);
  const sub = getCategoryName(subCategoryName);

  const defaults: FieldConfig = {
    showColors: false,
    showSizes: false,
    showMaterial: false,
    showWeight: true,
    showDimensions: false,
    showWarranty: false,
    showSpecifications: false,
    showDiscount: true,
    showShipping: true,
    showSEO: true,
  };

  if (cat.includes('kids') || cat.includes('fashion') || cat.includes('clothing') || cat.includes('apparel')) {
    return { ...defaults, showColors: true, showSizes: true, showMaterial: true, showDimensions: false, showWarranty: false };
  }

  if (cat.includes('home') || cat.includes('kitchen')) {
    return { ...defaults, showColors: true, showSizes: false, showMaterial: true, showDimensions: true, showWarranty: true, showSpecifications: true };
  }

  if (cat.includes('gadget') || cat.includes('electronics') || cat.includes('tech')) {
    return { ...defaults, showColors: true, showSizes: false, showMaterial: false, showDimensions: true, showWarranty: true, showSpecifications: true };
  }

  if (cat.includes('game') || cat.includes('gift') || cat.includes('toy')) {
    return { ...defaults, showColors: true, showSizes: false, showMaterial: true, showDimensions: true, showWarranty: false, showSpecifications: false };
  }

  if (cat.includes('e-cig') || cat.includes('ecig') || cat.includes('vape')) {
    return { ...defaults, showColors: true, showSizes: false, showMaterial: false, showDimensions: false, showWarranty: false, showSpecifications: true };
  }

  if (sub.includes('footwear') || sub.includes('footware') || sub.includes('shoe')) {
    return { ...defaults, showColors: true, showSizes: true, showMaterial: true, showDimensions: false, showWarranty: false };
  }

  if (sub.includes('outfit') || sub.includes('shirt') || sub.includes('clothing') || sub.includes('apparel') || sub.includes('premium')) {
    return { ...defaults, showColors: true, showSizes: true, showMaterial: true, showDimensions: false, showWarranty: false };
  }

  if (sub.includes('cosmetic') || sub.includes('beauty') || sub.includes('skincare')) {
    return { ...defaults, showColors: false, showSizes: false, showMaterial: false, showDimensions: false, showWarranty: false, showSpecifications: true };
  }

  if (sub.includes('vape') || sub.includes('e-cig') || sub.includes('ecig')) {
    return { ...defaults, showColors: true, showSizes: false, showMaterial: false, showDimensions: false, showWarranty: false, showSpecifications: true };
  }

  return defaults;
};

const defaultFormData: ProductFormData = {
  name: '',
  brand: '',
  sku: '',
  categoryId: '',
  subCategoryId: '',
  priceINR: '',
  priceAED: '',
  stock: '',
  lowStockThreshold: '10',
  shortDescription: '',
  specifications: [],
  weightValue: '',
  weightUnit: 'g',
  length: '',
  width: '',
  height: '',
  dimensionUnit: 'cm',
  colors: '',
  sizes: '',
  material: '',
  warrantyPeriod: '',
  warrantyUnit: 'months',
  warrantyDescription: '',
  tags: '',
  mediaFiles: [
    { file: null, type: 'image', preview: '' },
    { file: null, type: 'image', preview: '' },
    { file: null, type: 'image', preview: '' },
    { file: null, type: 'image', preview: '' },
  ],
  existingImages: [],
  existingVideos: [],
  description: '',
  isTrending: false,
  isFeatured: false,
  discountPercentage: '',
  discountAmount: '',
  discountStartDate: '',
  discountEndDate: '',
  weightBasedShipping: false,
  freeShipping: false,
  shippingCost: '',
  metaTitle: '',
  metaDescription: '',
  metaKeywords: '',
};

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
  const [activeTab, setActiveTab] = useState('basic');
  const [specifications, setSpecifications] = useState<{ key: string; value: string }[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fieldConfig, setFieldConfig] = useState<FieldConfig>({
    showColors: true,
    showSizes: true,
    showMaterial: true,
    showWeight: true,
    showDimensions: true,
    showWarranty: true,
    showSpecifications: true,
    showDiscount: true,
    showShipping: true,
    showSEO: true,
  });

  const api = axios.create({ baseURL: baseurl });
  const [seller, setSeller] = useState<Seller>({ name: '', status: false });
  const navigate = useNavigate();
  const token = useGetToken('sellerToken');
  const sellerId = ExtractToken(token);
  const [formData, setFormData] = useState<ProductFormData>(defaultFormData);

  const updateFieldConfig = (categoryId: string, subCategoryId: string) => {
    const selectedCategory = categories.find((c) => c._id === categoryId);
    const selectedSubCategory = subCategories.find((s) => s._id === subCategoryId);
    const catName = selectedCategory?.name || '';
    const subName = selectedSubCategory?.name || '';
    setFieldConfig(getFieldConfig(catName, subName));
  };

  const getSeller = async () => {
    try {
      const response = await api.get(`/seller/profile/${sellerId.userId}`);
      setSeller({ name: response.data.data.name, status: response.data.data.status });
    } catch (error) {
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
      setProducts((prev) => prev.filter((p) => p._id !== productToDelete));
      setDeleteModalOpen(false);
      setProductToDelete(null);
    } catch {
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
      const response = await api.get('/admin/get-category');
      if (response.data && Array.isArray(response.data)) setCategories(response.data);
    } catch {}
  };

  const getSubCategories = async () => {
    try {
      const response = await api.get('/admin/get-subcategory');
      if (response.data && Array.isArray(response.data)) setSubCategories(response.data);
    } catch {}
  };

  const getProducts = async () => {
    try {
      const response = await api.get(`/seller/get-products/${sellerId.userId}`);
      if (response.data.products && Array.isArray(response.data.products)) setProducts(response.data.products);
    } catch {}
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = e.target.value;
    const filtered = subCategories.filter((subCat) =>
      typeof subCat.categoryId === 'object' && subCat.categoryId !== null
        ? subCat.categoryId._id === categoryId
        : subCat.categoryId === categoryId
    );
    setFilteredSubCategories(filtered);
    setFormData((prev) => ({ ...prev, categoryId, subCategoryId: '' }));
    updateFieldConfig(categoryId, '');
  };

  const handleSubCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const subCategoryId = e.target.value;
    setFormData((prev) => ({ ...prev, subCategoryId }));
    updateFieldConfig(formData.categoryId, subCategoryId);
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>, index: number, mediaType: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    const newMediaFiles = [...formData.mediaFiles];
    newMediaFiles[index] = { file, type: mediaType, preview: previewUrl };
    if (mediaType === 'image') {
      const newExistingImages = [...formData.existingImages];
      newExistingImages[index] = '';
      setFormData((prev) => ({ ...prev, mediaFiles: newMediaFiles, existingImages: newExistingImages }));
    } else {
      const newExistingVideos = [...formData.existingVideos];
      newExistingVideos[index - formData.existingImages.length] = '';
      setFormData((prev) => ({ ...prev, mediaFiles: newMediaFiles, existingVideos: newExistingVideos }));
    }
    const newPreviews = [...mediaPreviews];
    newPreviews[index] = previewUrl;
    setMediaPreviews(newPreviews);
  };

  const removeMedia = (index: number) => {
    const newMediaFiles = [...formData.mediaFiles];
    newMediaFiles[index] = { file: null, type: 'image', preview: '' };
    const isImage = index < formData.existingImages.length;
    if (isImage) {
      const newExistingImages = [...formData.existingImages];
      newExistingImages[index] = '';
      setFormData((prev) => ({ ...prev, mediaFiles: newMediaFiles, existingImages: newExistingImages }));
    } else {
      const videoIndex = index - formData.existingImages.length;
      const newExistingVideos = [...formData.existingVideos];
      newExistingVideos[videoIndex] = '';
      setFormData((prev) => ({ ...prev, mediaFiles: newMediaFiles, existingVideos: newExistingVideos }));
    }
    const newPreviews = [...mediaPreviews];
    newPreviews[index] = '';
    setMediaPreviews(newPreviews);
  };

  const toggleMediaType = (index: number) => {
    const newMediaFiles = [...formData.mediaFiles];
    newMediaFiles[index] = { ...newMediaFiles[index], type: newMediaFiles[index].type === 'image' ? 'video' : 'image' };
    setFormData((prev) => ({ ...prev, mediaFiles: newMediaFiles }));
  };

  const addSpecification = () => setSpecifications([...specifications, { key: '', value: '' }]);

  const removeSpecification = (index: number) => {
    const newSpecs = [...specifications];
    newSpecs.splice(index, 1);
    setSpecifications(newSpecs);
  };

  const updateSpecification = (index: number, field: 'key' | 'value', value: string) => {
    const newSpecs = [...specifications];
    newSpecs[index][field] = value;
    setSpecifications(newSpecs);
  };

  const handleEdit = (product: Product) => {
    if (!seller.status) {
      toast.error('Your account is pending approval. Please contact admin for more information.');
      return;
    }
    setEditingProduct(product._id);
    const imageArray = Array.isArray(product.images) ? product.images : Object.values(product.images || {});
    const videoArray = Array.isArray(product.videos) ? product.videos : Object.values(product.videos || {});
    const initialMediaFiles: MediaFile[] = [
      { file: null, type: 'image', preview: '' },
      { file: null, type: 'image', preview: '' },
      { file: null, type: 'image', preview: '' },
      { file: null, type: 'image', preview: '' },
    ];
    const previews = Array(4).fill('');
    imageArray.forEach((url, index) => { if (index < 4) { initialMediaFiles[index].type = 'image'; previews[index] = url; } });
    videoArray.forEach((url, index) => { const i = imageArray.length + index; if (i < 4) { initialMediaFiles[i].type = 'video'; previews[i] = url; } });
    setMediaPreviews(previews);
    const specArray: { key: string; value: string }[] = [];
    if (product.specifications) {
      for (const [key, value] of Object.entries(product.specifications)) specArray.push({ key, value });
    }
    setSpecifications(specArray);
    setFormData({
      name: product.name,
      brand: product.brand,
      sku: product.sku || '',
      categoryId: product.categoryId._id,
      subCategoryId: product.subCategoryId._id,
      priceINR: product.priceINR.toString(),
      priceAED: product.priceAED.toString(),
      stock: product.stock.toString(),
      lowStockThreshold: product.lowStockThreshold?.toString() || '10',
      shortDescription: product.shortDescription || '',
      specifications: specArray,
      weightValue: product.weight?.value?.toString() || '',
      weightUnit: product.weight?.unit || 'g',
      length: product.dimensions?.length?.toString() || '',
      width: product.dimensions?.width?.toString() || '',
      height: product.dimensions?.height?.toString() || '',
      dimensionUnit: product.dimensions?.unit || 'cm',
      colors: product.colors?.join(', ') || '',
      sizes: product.sizes?.join(', ') || '',
      material: product.material || '',
      warrantyPeriod: product.warranty?.period?.toString() || '',
      warrantyUnit: product.warranty?.unit || 'months',
      warrantyDescription: product.warranty?.description || '',
      tags: product.tags?.join(', ') || '',
      mediaFiles: initialMediaFiles,
      existingImages: imageArray as string[],
      existingVideos: videoArray as string[],
      description: product.description || '',
      isTrending: product.trending || false,
      isFeatured: product.featured || false,
      discountPercentage: product.discount?.percentage?.toString() || '',
      discountAmount: product.discount?.amount?.toString() || '',
      discountStartDate: product.discount?.startDate || '',
      discountEndDate: product.discount?.endDate || '',
      weightBasedShipping: product.shippingInfo?.weightBased || false,
      freeShipping: product.shippingInfo?.freeShipping || false,
      shippingCost: product.shippingInfo?.shippingCost?.toString() || '',
      metaTitle: product.metaTitle || '',
      metaDescription: product.metaDescription || '',
      metaKeywords: product.metaKeywords?.join(', ') || '',
    });
    const filtered = subCategories.filter((subCat) =>
      typeof subCat.categoryId === 'object' && subCat.categoryId !== null
        ? subCat.categoryId._id === product.categoryId._id
        : subCat.categoryId === product.categoryId._id
    );
    setFilteredSubCategories(filtered);
    updateFieldConfig(product.categoryId._id, product.subCategoryId._id);
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
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('brand', formData.brand);
      fd.append('sku', formData.sku);
      fd.append('categoryId', formData.categoryId);
      fd.append('subCategoryId', formData.subCategoryId);
      fd.append('priceINR', formData.priceINR);
      fd.append('priceAED', formData.priceAED);
      fd.append('stock', formData.stock);
      fd.append('lowStockThreshold', formData.lowStockThreshold);
      fd.append('shortDescription', formData.shortDescription);
      fd.append('description', formData.description);
      fd.append('isTrending', formData.isTrending.toString());
      fd.append('isFeatured', formData.isFeatured.toString());
      fd.append('specifications', JSON.stringify(specifications));
      if (fieldConfig.showWeight) { fd.append('weightValue', formData.weightValue); fd.append('weightUnit', formData.weightUnit); }
      if (fieldConfig.showDimensions) { fd.append('length', formData.length); fd.append('width', formData.width); fd.append('height', formData.height); fd.append('dimensionUnit', formData.dimensionUnit); }
      if (fieldConfig.showColors) fd.append('colors', formData.colors);
      if (fieldConfig.showSizes) fd.append('sizes', formData.sizes);
      if (fieldConfig.showMaterial) fd.append('material', formData.material);
      if (fieldConfig.showWarranty) { fd.append('warrantyPeriod', formData.warrantyPeriod); fd.append('warrantyUnit', formData.warrantyUnit); fd.append('warrantyDescription', formData.warrantyDescription); }
      fd.append('tags', formData.tags);
      if (fieldConfig.showDiscount) { fd.append('discountPercentage', formData.discountPercentage); fd.append('discountAmount', formData.discountAmount); fd.append('discountStartDate', formData.discountStartDate); fd.append('discountEndDate', formData.discountEndDate); }
      fd.append('weightBasedShipping', formData.weightBasedShipping.toString());
      fd.append('freeShipping', formData.freeShipping.toString());
      fd.append('shippingCost', formData.shippingCost);
      if (fieldConfig.showSEO) { fd.append('metaTitle', formData.metaTitle); fd.append('metaDescription', formData.metaDescription); fd.append('metaKeywords', formData.metaKeywords); }
      fd.append('sellerId', sellerId.userId);
      fd.append('existingImages', JSON.stringify(formData.existingImages.filter((url) => url !== '')));
      fd.append('existingVideos', JSON.stringify(formData.existingVideos.filter((url) => url !== '')));
      let imageCount = 0;
      let videoCount = 0;
      formData.mediaFiles.forEach((media) => {
        if (media.file) {
          if (media.type === 'image') { fd.append(`image${imageCount + 1}`, media.file); imageCount++; }
          else { fd.append(`video${videoCount + 1}`, media.file); videoCount++; }
        }
      });
      if (editingProduct) await api.put(`/seller/edit-product/${editingProduct}`, fd);
      else await api.post('/seller/add-product', fd);
      await getProducts();
      handleCloseModal();
      toast.success(editingProduct ? 'Product updated successfully' : 'Product created successfully');
    } catch {
      toast.error('Failed to save product');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setActiveTab('basic');
    setSpecifications([]);
    setFormData(defaultFormData);
    setMediaPreviews(['', '', '', '']);
    setFilteredSubCategories([]);
    setFieldConfig({ showColors: true, showSizes: true, showMaterial: true, showWeight: true, showDimensions: true, showWarranty: true, showSpecifications: true, showDiscount: true, showShipping: true, showSEO: true });
  };

  const handleSort = (field: string) => {
    if (sortField === field) setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDirection('asc'); }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let aValue: any, bValue: any;
    switch (sortField) {
      case 'brand': aValue = a.brand; bValue = b.brand; break;
      case 'sku': aValue = a.sku; bValue = b.sku; break;
      case 'stock': aValue = a.stock; bValue = b.stock; break;
      case 'category': aValue = a.categoryId.name; bValue = b.categoryId.name; break;
      case 'priceINR': aValue = a.priceINR; bValue = b.priceINR; break;
      case 'priceAED': aValue = a.priceAED; bValue = b.priceAED; break;
      default: aValue = a.name; bValue = b.name;
    }
    if (typeof aValue === 'string' && typeof bValue === 'string')
      return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    return sortDirection === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  const SortIndicator = ({ field }: { field: string }) =>
    sortField !== field ? null : <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>;

  const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
      <span className="ml-3 text-sm font-medium text-gray-700">{label}</span>
    </label>
  );

  const hasSpecificationsTab = fieldConfig.showSpecifications || fieldConfig.showColors || fieldConfig.showSizes || fieldConfig.showMaterial || fieldConfig.showWeight || fieldConfig.showDimensions || fieldConfig.showWarranty;

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    ...(hasSpecificationsTab ? [{ id: 'specifications', label: 'Specifications' }] : []),
    { id: 'media', label: 'Media' },
    ...(fieldConfig.showDiscount || fieldConfig.showShipping || fieldConfig.showSEO ? [{ id: 'seo', label: 'SEO & Shipping' }] : []),
  ];

  const getNextTab = () => {
    const idx = tabs.findIndex((t) => t.id === activeTab);
    return idx < tabs.length - 1 ? tabs[idx + 1].id : null;
  };

  const getPrevTab = () => {
    const idx = tabs.findIndex((t) => t.id === activeTab);
    return idx > 0 ? tabs[idx - 1].id : null;
  };

  useEffect(() => {
    getSeller();
    getProducts();
    getCategories();
    getSubCategories();
  }, []);

  const Sidebar = () => (
    <aside className="w-full bg-white h-full flex flex-col">
      <div className="p-6 flex-1">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">FBB STORE</h1>
          <p className="text-sm text-gray-500 mt-1">Seller Dashboard</p>
        </div>
        <nav className="space-y-1">
          <button onClick={() => navigate('/seller/dashboard')} className="w-full text-left py-3 px-4 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all flex items-center space-x-3">
            <BarChart3 size={20} /><span>Dashboard</span>
          </button>
          <button onClick={() => navigate('/seller/products')} className="w-full text-left py-3 px-4 rounded-lg bg-blue-50 text-blue-600 font-semibold hover:bg-blue-100 transition-all flex items-center space-x-3">
            <Package size={20} /><span>Products</span>
          </button>
          <button onClick={() => navigate('/seller/orders')} className="w-full text-left py-3 px-4 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all flex items-center space-x-3">
            <ShoppingBag size={20} /><span>Orders</span>
          </button>
          <button onClick={() => navigate('/seller/sales-report')} className="w-full text-left py-3 px-4 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all flex items-center space-x-3">
            <TrendingUp size={20} /><span>Sales Report</span>
          </button>
        </nav>
      </div>
      <div className="p-6 border-t border-gray-200 space-y-3">
        <button onClick={() => window.open('https://wa.me/7012551507', '_blank')} className="w-full py-3 px-4 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 transition-all flex items-center justify-center space-x-2">
          <Phone size={20} /><span>Contact Admin</span>
        </button>
        <button onClick={() => { localStorage.removeItem('sellerToken'); navigate('/seller/login'); }} className="w-full py-3 px-4 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-all flex items-center justify-center space-x-2">
          <LogOut size={20} /><span>Logout</span>
        </button>
      </div>
    </aside>
  );

  const inputClass = 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-2';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <div className={`fixed lg:relative inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex justify-between items-center p-4 lg:hidden">
            <h2 className="text-xl font-bold text-gray-800">Menu</h2>
            <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-gray-100"><X size={24} /></button>
          </div>
          <Sidebar />
        </div>

        <main className="flex-1 p-4 lg:p-8">
          <div className="mb-6 flex items-center justify-between lg:justify-end">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100"><Menu size={24} /></button>
            <h1 className="text-2xl font-bold text-gray-800 lg:hidden">Products</h1>
          </div>

          <div className="mb-8 hidden lg:block">
            <h1 className="text-3xl font-bold text-gray-800">Manage Products</h1>
            <p className="text-gray-600 mt-2">Welcome, <span className="text-blue-600 font-medium">{seller.name}</span></p>
          </div>

          {!seller.status && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 flex items-start gap-3">
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Account Pending Approval</p>
                <p className="text-sm text-amber-700 mt-1">Your account is pending approval from admin. You can view your products but cannot add or edit them.</p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800">Products</h2>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative flex-grow sm:max-w-md">
                  <input 
                    type="text" 
                    placeholder="Search products..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" 
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
                <button 
                  onClick={handleAddNewClick} 
                  disabled={!seller.status} 
                  className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${seller.status ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                >
                  <PlusCircle size={18} />
                  <span>Add Product</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="text-left border-b border-gray-100 bg-gray-50">
                    {[
                      ['name', 'Product'],
                      ['brand', 'Brand'],
                      ['priceINR', 'Price'],
                      ['stock', 'Stock'],
                      ['sku', 'SKU']
                    ].map(([field, label]) => (
                      <th key={field} className="py-3 px-4 text-gray-600 font-semibold text-sm cursor-pointer hover:text-gray-800" onClick={() => handleSort(field)}>
                        <div className="flex items-center gap-1">
                          {label} <SortIndicator field={field} />
                        </div>
                      </th>
                    ))}
                    <th className="py-3 px-4 text-gray-600 font-semibold text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length > 0 ? currentItems.map((product) => (
                    <tr key={product._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-800">{product.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{product.categoryId.name}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm">{product.brand}</td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm font-medium text-gray-800">₹{product.priceINR}</p>
                          <p className="text-xs text-gray-500">AED {product.priceAED}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          product.stock <= 0 ? 'bg-red-100 text-red-700' : 
                          product.stock <= product.lowStockThreshold ? 'bg-amber-100 text-amber-700' : 
                          'bg-green-100 text-green-700'
                        }`}>
                          {product.stock <= 0 ? (
                            <><AlertCircle size={10} className="mr-1" /> Out of Stock</>
                          ) : product.stock <= product.lowStockThreshold ? (
                            <><Clock size={10} className="mr-1" /> Low Stock ({product.stock})</>
                          ) : (
                            <><CheckCircle size={10} className="mr-1" /> {product.stock} units</>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-xs font-mono">{product.sku}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button 
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                            onClick={() => handleEdit(product)}
                            disabled={!seller.status}
                          >
                            <Edit2 size="16" />
                          </button>
                          <button 
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                            onClick={() => handleDeleteClick(product._id)}
                            disabled={!seller.status}
                          >
                            <Trash2 size="16" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="py-12 px-4 text-center text-gray-400">
                        <Package size={40} className="mx-auto mb-3 opacity-50" />
                        <p>No products found</p>
                        <button onClick={handleAddNewClick} className="mt-3 text-blue-500 text-sm font-medium">Add your first product →</button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {deleteModalOpen && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Confirm Delete</h3>
                  <p className="text-gray-500 mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
                  <div className="flex justify-end gap-3">
                    <button 
                      onClick={() => { setDeleteModalOpen(false); setProductToDelete(null); }} 
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleDelete} 
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Delete Product
                    </button>
                  </div>
                </div>
              </div>
            )}

            {sortedProducts.length > 0 && totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center px-4 py-3 border-t border-gray-100 gap-3">
                <div className="text-sm text-gray-500">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sortedProducts.length)} of {sortedProducts.length}
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} 
                    disabled={currentPage === 1} 
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size="16" />
                  </button>
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((n) => (
                      <button 
                        key={n} 
                        onClick={() => setCurrentPage(n)} 
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === n 
                            ? 'bg-blue-500 text-white' 
                            : 'border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} 
                    disabled={currentPage === totalPages} 
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size="16" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {isModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-xl">
                <div className="flex justify-between items-center p-5 border-b border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-800">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                  <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 transition-colors"><X size="22" /></button>
                </div>

                <div className="flex border-b border-gray-100 overflow-x-auto px-2">
                  {tabs.map((tab) => (
                    <button 
                      key={tab.id} 
                      className={`px-5 py-3 font-medium text-sm whitespace-nowrap transition-colors ${
                        activeTab === tab.id 
                          ? 'text-blue-600 border-b-2 border-blue-600' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`} 
                      onClick={() => setActiveTab(tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {formData.categoryId && fieldConfig && (
                  <div className="px-6 pt-3">
                    <div className="flex flex-wrap gap-2">
                      {fieldConfig.showColors && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">Colors</span>}
                      {fieldConfig.showSizes && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">Sizes</span>}
                      {fieldConfig.showMaterial && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">Material</span>}
                      {fieldConfig.showWeight && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">Weight</span>}
                      {fieldConfig.showDimensions && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">Dimensions</span>}
                      {fieldConfig.showWarranty && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">Warranty</span>}
                      {fieldConfig.showSpecifications && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">Specifications</span>}
                    </div>
                  </div>
                )}

                <div className="overflow-y-auto flex-1">
                  <form onSubmit={handleSubmit} className="p-6">

                    {activeTab === 'basic' && (
                      <div className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className={labelClass}>Product Name</label>
                            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} required />
                          </div>
                          <div>
                            <label className={labelClass}>Brand</label>
                            <input type="text" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} className={inputClass} required />
                          </div>
                          <div>
                            <label className={labelClass}>SKU</label>
                            <input type="text" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} className={inputClass} required />
                          </div>
                          <div>
                            <label className={labelClass}>Stock Quantity</label>
                            <input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} className={inputClass} required min="0" />
                          </div>
                          <div>
                            <label className={labelClass}>Low Stock Alert</label>
                            <input type="number" value={formData.lowStockThreshold} onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })} className={inputClass} min="0" />
                          </div>
                          <div>
                            <label className={labelClass}>Category</label>
                            <select value={formData.categoryId} onChange={handleCategoryChange} className={inputClass} required>
                              <option value="">Select Category</option>
                              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className={labelClass}>Sub Category</label>
                            <select value={formData.subCategoryId} onChange={handleSubCategoryChange} className={inputClass} required disabled={!formData.categoryId}>
                              <option value="">Select Sub Category</option>
                              {filteredSubCategories.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className={labelClass}>Price (INR)</label>
                            <input type="number" value={formData.priceINR} onChange={(e) => setFormData({ ...formData, priceINR: e.target.value })} className={inputClass} required min="0" />
                          </div>
                          <div>
                            <label className={labelClass}>Price (AED)</label>
                            <input type="number" value={formData.priceAED} onChange={(e) => setFormData({ ...formData, priceAED: e.target.value })} className={inputClass} required min="0" />
                          </div>
                        </div>
                        <div>
                          <label className={labelClass}>Short Description</label>
                          <textarea value={formData.shortDescription} onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })} rows={2} className={inputClass} placeholder="Brief description (max 200 characters)" maxLength={200} />
                        </div>
                        <div>
                          <label className={labelClass}>Full Description</label>
                          <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} className={inputClass} placeholder="Detailed product description..." />
                        </div>
                        <div className="flex flex-wrap gap-6">
                          <Toggle checked={formData.isTrending} onChange={(v) => setFormData({ ...formData, isTrending: v })} label="Trending" />
                          <Toggle checked={formData.isFeatured} onChange={(v) => setFormData({ ...formData, isFeatured: v })} label="Featured" />
                          <Toggle checked={formData.freeShipping} onChange={(v) => setFormData({ ...formData, freeShipping: v })} label="Free Shipping" />
                        </div>
                      </div>
                    )}

                    {activeTab === 'specifications' && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {fieldConfig.showMaterial && (
                            <div>
                              <label className={labelClass}>Material</label>
                              <input type="text" value={formData.material} onChange={(e) => setFormData({ ...formData, material: e.target.value })} className={inputClass} />
                            </div>
                          )}
                          {fieldConfig.showColors && (
                            <div>
                              <label className={labelClass}>Colors</label>
                              <input type="text" value={formData.colors} onChange={(e) => setFormData({ ...formData, colors: e.target.value })} className={inputClass} placeholder="Red, Blue, Green (comma separated)" />
                            </div>
                          )}
                          {fieldConfig.showSizes && (
                            <div>
                              <label className={labelClass}>Sizes</label>
                              <input type="text" value={formData.sizes} onChange={(e) => setFormData({ ...formData, sizes: e.target.value })} className={inputClass} placeholder="S, M, L, XL (comma separated)" />
                            </div>
                          )}
                          <div>
                            <label className={labelClass}>Tags</label>
                            <input type="text" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} className={inputClass} placeholder="tag1, tag2, tag3 (comma separated)" />
                          </div>
                        </div>

                        {fieldConfig.showSpecifications && (
                          <div className="border-t pt-5">
                            <div className="flex justify-between items-center mb-4">
                              <h4 className="text-lg font-medium text-gray-800">Specifications</h4>
                              <button type="button" onClick={addSpecification} className="text-blue-600 hover:text-blue-800 text-sm font-medium">+ Add Specification</button>
                            </div>
                            <div className="space-y-3">
                              {specifications.map((spec, index) => (
                                <div key={index} className="flex flex-col sm:flex-row gap-2">
                                  <input type="text" value={spec.key} onChange={(e) => updateSpecification(index, 'key', e.target.value)} placeholder="Key (e.g., Processor)" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                                  <input type="text" value={spec.value} onChange={(e) => updateSpecification(index, 'value', e.target.value)} placeholder="Value (e.g., Intel i7)" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                                  <button type="button" onClick={() => removeSpecification(index)} className="px-3 py-2 text-red-600 hover:text-red-800"><X size="18" /></button>
                                </div>
                              ))}
                              {specifications.length === 0 && (
                                <p className="text-sm text-gray-400 text-center py-4">No specifications added. Click the button above to add.</p>
                              )}
                            </div>
                          </div>
                        )}

                        {(fieldConfig.showWeight || fieldConfig.showDimensions) && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {fieldConfig.showWeight && (
                              <div className="space-y-3">
                                <h4 className="font-medium text-gray-800">Weight</h4>
                                <div className="flex gap-2">
                                  <input type="number" value={formData.weightValue} onChange={(e) => setFormData({ ...formData, weightValue: e.target.value })} placeholder="Weight" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                                  <select value={formData.weightUnit} onChange={(e) => setFormData({ ...formData, weightUnit: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                                    <option value="g">g</option>
                                    <option value="kg">kg</option>
                                    <option value="lb">lb</option>
                                    <option value="oz">oz</option>
                                  </select>
                                </div>
                              </div>
                            )}
                            {fieldConfig.showDimensions && (
                              <div className="space-y-3">
                                <h4 className="font-medium text-gray-800">Dimensions</h4>
                                <div className="grid grid-cols-3 gap-2">
                                  <input type="number" value={formData.length} onChange={(e) => setFormData({ ...formData, length: e.target.value })} placeholder="L" className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                                  <input type="number" value={formData.width} onChange={(e) => setFormData({ ...formData, width: e.target.value })} placeholder="W" className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                                  <input type="number" value={formData.height} onChange={(e) => setFormData({ ...formData, height: e.target.value })} placeholder="H" className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                                </div>
                                <select value={formData.dimensionUnit} onChange={(e) => setFormData({ ...formData, dimensionUnit: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                                  <option value="cm">cm</option>
                                  <option value="inch">inch</option>
                                  <option value="mm">mm</option>
                                </select>
                              </div>
                            )}
                          </div>
                        )}

                        {fieldConfig.showWarranty && (
                          <div className="border-t pt-5">
                            <h4 className="font-medium text-gray-800 mb-3">Warranty</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <input type="number" value={formData.warrantyPeriod} onChange={(e) => setFormData({ ...formData, warrantyPeriod: e.target.value })} placeholder="Period" className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                              <select value={formData.warrantyUnit} onChange={(e) => setFormData({ ...formData, warrantyUnit: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                                <option value="days">Days</option>
                                <option value="months">Months</option>
                                <option value="years">Years</option>
                              </select>
                              <input type="text" value={formData.warrantyDescription} onChange={(e) => setFormData({ ...formData, warrantyDescription: e.target.value })} placeholder="Warranty Details" className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'media' && (
                      <div className="space-y-5">
                        <label className={labelClass}>Product Media</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {[0, 1, 2, 3].map((index) => (
                            <div key={index} className="relative group">
                              {mediaPreviews[index] || (formData.mediaFiles[index].type === 'image' && formData.existingImages[index]) || (formData.mediaFiles[index].type === 'video' && formData.existingVideos[index - formData.existingImages.length]) ? (
                                <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200">
                                  {formData.mediaFiles[index].type === 'image' ? (
                                    <img src={mediaPreviews[index] || formData.existingImages[index]} alt={`Preview ${index + 1}`} className="h-full w-full object-cover" />
                                  ) : (
                                    <div className="h-full w-full flex flex-col items-center justify-center bg-gray-100">
                                      <Film size="32" className="text-gray-400" />
                                      <span className="text-xs text-gray-500 mt-2">Video File</span>
                                    </div>
                                  )}
                                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button type="button" onClick={() => toggleMediaType(index)} className="bg-white rounded-full p-1.5 shadow-sm hover:bg-gray-100">
                                      {formData.mediaFiles[index].type === 'image' ? <Film size="14" /> : <Image size="14" />}
                                    </button>
                                    <button type="button" onClick={() => removeMedia(index)} className="bg-white rounded-full p-1.5 shadow-sm hover:bg-red-50 hover:text-red-600">
                                      <X size="14" />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="border-2 border-gray-200 border-dashed rounded-lg p-6 text-center hover:border-blue-300 transition-colors">
                                  <Upload className="mx-auto h-8 w-8 text-gray-400" />
                                  <div className="mt-2">
                                    <label className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-500">
                                      <span>Upload {formData.mediaFiles[index].type === 'image' ? 'Image' : 'Video'} {index + 1}</span>
                                      <input type="file" className="sr-only" accept={formData.mediaFiles[index].type === 'image' ? 'image/*' : 'video/*'} onChange={(e) => handleMediaChange(e, index, formData.mediaFiles[index].type)} />
                                    </label>
                                  </div>
                                  <button type="button" onClick={() => toggleMediaType(index)} className="mt-2 text-xs text-blue-600 hover:text-blue-500">
                                    Switch to {formData.mediaFiles[index].type === 'image' ? 'Video' : 'Image'}
                                  </button>
                                  <p className="text-xs text-gray-400 mt-1">{formData.mediaFiles[index].type === 'image' ? 'PNG, JPG up to 10MB' : 'MP4, MOV up to 20MB'}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === 'seo' && (
                      <div className="space-y-6">
                        {fieldConfig.showDiscount && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className={labelClass}>Discount Percentage</label>
                              <input type="number" value={formData.discountPercentage} onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })} className={inputClass} min="0" max="100" />
                            </div>
                            <div>
                              <label className={labelClass}>Discount Amount</label>
                              <input type="number" value={formData.discountAmount} onChange={(e) => setFormData({ ...formData, discountAmount: e.target.value })} className={inputClass} min="0" />
                            </div>
                            <div>
                              <label className={labelClass}>Discount Start Date</label>
                              <input type="date" value={formData.discountStartDate} onChange={(e) => setFormData({ ...formData, discountStartDate: e.target.value })} className={inputClass} />
                            </div>
                            <div>
                              <label className={labelClass}>Discount End Date</label>
                              <input type="date" value={formData.discountEndDate} onChange={(e) => setFormData({ ...formData, discountEndDate: e.target.value })} className={inputClass} />
                            </div>
                          </div>
                        )}

                        {fieldConfig.showShipping && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center">
                              <Toggle checked={formData.weightBasedShipping} onChange={(v) => setFormData({ ...formData, weightBasedShipping: v })} label="Weight Based Shipping" />
                            </div>
                            <div>
                              <label className={labelClass}>Shipping Cost</label>
                              <input type="number" value={formData.shippingCost} onChange={(e) => setFormData({ ...formData, shippingCost: e.target.value })} className={inputClass} min="0" disabled={formData.freeShipping} />
                            </div>
                          </div>
                        )}

                        {fieldConfig.showSEO && (
                          <div className="space-y-4">
                            <h4 className="font-medium text-gray-800">SEO Information</h4>
                            <div>
                              <label className={labelClass}>Meta Title</label>
                              <input type="text" value={formData.metaTitle} onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })} className={inputClass} />
                            </div>
                            <div>
                              <label className={labelClass}>Meta Description</label>
                              <textarea value={formData.metaDescription} onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })} rows={2} className={inputClass} />
                            </div>
                            <div>
                              <label className={labelClass}>Meta Keywords</label>
                              <input type="text" value={formData.metaKeywords} onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })} className={inputClass} placeholder="keyword1, keyword2, keyword3" />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="sticky bottom-0 bg-white pt-5 pb-2 border-t border-gray-100 mt-6">
                      <div className="flex justify-between items-center">
                        <button type="button" onClick={() => { const prev = getPrevTab(); if (prev) setActiveTab(prev); else handleCloseModal(); }} className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium">
                          {getPrevTab() ? 'Back' : 'Cancel'}
                        </button>
                        <div className="flex gap-3">
                          {getNextTab() ? (
                            <button type="button" onClick={() => setActiveTab(getNextTab()!)} className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
                              Next
                            </button>
                          ) : (
                            <button type="submit" disabled={isLoading} className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-60 font-medium">
                              {isLoading ? (editingProduct ? 'Updating...' : 'Creating...') : (editingProduct ? 'Update Product' : 'Create Product')}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SellerProductPage;