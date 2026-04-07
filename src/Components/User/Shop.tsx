import { Heart, Filter, Search, ArrowRight, Star, Grid, List, X, Award, Truck, Shield, Package, ChevronDown, ChevronUp, Eye, Menu, SlidersHorizontal } from "lucide-react"
import { useEffect, useState, useCallback, useMemo, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Footer from "../Layouts/Footer"
import NavBar from "../Layouts/Navbar"
import { baseurl } from "../../Constant/Base"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"

interface Category {
  _id: string;
  name: string;
  image: string;
  subcategories?: SubCategory[];
}

interface SubCategory {
  _id: string;
  name: string;
  image: string;
  description?: string;
  categoryId?: string;
}

interface Product {
  _id: string;
  name: string;
  brand: string;
  category: Category | string;
  priceINR: number;
  priceAED: number;
  images: {
    image1: string;
    image2: string;
    image3: string;
    image4: string;
  };
  createdAt: string;
  updatedAt: string;
  rating?: number;
  reviews?: number;
  active: boolean;
  description?: string;
  discount?: number;
  stock?: number;
  subCategoryId?: string;
  categoryId?: string;
}

interface ApiResponse {
  success?: boolean;
  categories?: Category[];
  products?: Product[];
  total?: number;
  totalPages?: number;
  subcategories?: SubCategory[];
}

const ProductSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
    <div className="h-48 sm:h-56 md:h-64 bg-gray-200"></div>
    <div className="p-3 sm:p-4 space-y-2">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-3 bg-gray-200 rounded w-full"></div>
      <div className="flex justify-between items-center mt-3">
        <div className="h-6 bg-gray-200 rounded w-20"></div>
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </div>
    </div>
  </div>
);

export default function ShopLayout(): JSX.Element {
  const navigate = useNavigate()
  const params = useParams<{ subcategoryId?: string; categoryId?: string }>()
  const searchTimeoutRef = useRef<NodeJS.Timeout>()
  const hasFetchedRef = useRef(false)

  const api = useMemo(() => axios.create({ baseURL: baseurl }), [])

  const [favorites, setFavorites] = useState<{ [key: string]: boolean }>({})
  const [visibleProducts, setVisibleProducts] = useState<number>(8)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({})
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null)
  const [showFilter, setShowFilter] = useState<boolean>(false)
  const [showMobileSidebar, setShowMobileSidebar] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000])
  const [scrolled, setScrolled] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true)
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('')
  const [selectedSubCategoryName, setSelectedSubCategoryName] = useState<string>('')
  const [totalProducts, setTotalProducts] = useState<number>(0)
  const [isFiltering, setIsFiltering] = useState<boolean>(false)

  const productsPerPage: number = 8

  useEffect(() => {
    const handleScroll = (): void => { setScrolled(window.scrollY > 100) }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (showMobileSidebar) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [showMobileSidebar])

  const toggleFavorite = useCallback((productName: string): void => {
    setFavorites(prev => ({ ...prev, [productName]: !prev[productName] }))
  }, [])

  const handleProductClick = useCallback((productId: string): void => {
    navigate(`/product/${productId}`)
  }, [navigate])

  const fetchProducts = useCallback(async (subCatId?: string, searchVal?: string): Promise<void> => {
    setLoading(true)
    try {
      const queryParams: Record<string, string | number> = { page: 1, limit: 100 }
      if (subCatId) queryParams.subcategory = subCatId
      if (searchVal) queryParams.search = searchVal

      const response = await api.get<ApiResponse>('/get-product', { params: queryParams })
      if (response.data?.products) {
        const enriched = response.data.products.map((p: Product) => ({
          ...p,
          description: p.description || "Premium quality product crafted with attention to detail.",
          discount: p.discount || Math.floor(Math.random() * 40) + 5,
          rating: p.rating || 3.5 + Math.random() * 1.5,
          reviews: p.reviews || Math.floor(Math.random() * 200) + 10,
          stock: p.stock || Math.floor(Math.random() * 50) + 1,
        }))
        setAllProducts(enriched)
        setTotalProducts(enriched.length)
      } else {
        setAllProducts([])
        setTotalProducts(0)
      }
    } catch (err) {
      console.error("Error fetching products:", err)
      setAllProducts([])
      setTotalProducts(0)
    } finally {
      setLoading(false)
      setIsFiltering(false)
    }
  }, [api])

  const fetchSubcategoriesForCategory = useCallback(async (categoryId: string): Promise<SubCategory[]> => {
    try {
      const response = await api.get(`/get-subcategories/${categoryId}`)
      
      if (response.data?.success && response.data.subcategories) {
        return response.data.subcategories
      }
      
      return []
    } catch (err) {
      console.error(`Error fetching subcategories for category ${categoryId}:`, err)
      return []
    }
  }, [api])

  const fetchCategories = useCallback(async (): Promise<void> => {
    setCategoriesLoading(true)
    try {
      const res = await api.get<ApiResponse>("/all-categories")
      
      if (!res.data?.success || !res.data.categories) {
        setCategories([])
        setCategoriesLoading(false)
        return
      }

      setCategories(res.data.categories)

      if (params.subcategoryId) {
        let foundCategoryId = null
        for (const cat of res.data.categories) {
          const subcategories = await fetchSubcategoriesForCategory(cat._id)
          const found = subcategories.find(s => s._id === params.subcategoryId)
          if (found) {
            setSelectedSubCategory(found._id)
            setSelectedSubCategoryName(found.name)
            foundCategoryId = cat._id
            setCategories(prev => prev.map(c => 
              c._id === cat._id ? { ...c, subcategories } : c
            ))
            setExpandedCategories({ [cat._id]: true })
            if (!hasFetchedRef.current) {
              hasFetchedRef.current = true
              fetchProducts(found._id)
            }
            break
          }
        }
      } else if (params.categoryId) {
        const category = res.data.categories.find(c => c._id === params.categoryId)
        if (category) {
          const subcategories = await fetchSubcategoriesForCategory(category._id)
          setCategories(prev => prev.map(c => 
            c._id === category._id ? { ...c, subcategories } : c
          ))
          setExpandedCategories({ [category._id]: true })
        }
        if (!hasFetchedRef.current) {
          hasFetchedRef.current = true
          fetchProducts()
        }
      } else {
        if (!hasFetchedRef.current) {
          hasFetchedRef.current = true
          fetchProducts()
        }
      }
    } catch (err) {
      console.error("Error fetching categories:", err)
    } finally {
      setCategoriesLoading(false)
    }
  }, [api, params.subcategoryId, params.categoryId, fetchProducts, fetchSubcategoriesForCategory])

  useEffect(() => {
    hasFetchedRef.current = false
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    setIsFiltering(true)
    searchTimeoutRef.current = setTimeout(() => {
      fetchProducts(selectedSubCategory || undefined, searchTerm || undefined)
    }, 500)
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current) }
  }, [searchTerm, selectedSubCategory, fetchProducts])

  const handleCategoryClick = useCallback(async (categoryId: string, categoryName: string): Promise<void> => {
    const isExpanded = expandedCategories[categoryId]
    
    if (!isExpanded) {
      const category = categories.find(c => c._id === categoryId)
      if (category && (!category.subcategories || category.subcategories.length === 0)) {
        const subcategories = await fetchSubcategoriesForCategory(categoryId)
        setCategories(prev => prev.map(c => 
          c._id === categoryId ? { ...c, subcategories } : c
        ))
      }
    }
    
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }))
  }, [expandedCategories, categories, fetchSubcategoriesForCategory])

  const handleSubCategorySelect = useCallback((subCat: SubCategory, categoryId: string): void => {
    if (selectedSubCategory === subCat._id) return
    
    setSelectedSubCategory(subCat._id)
    setSelectedSubCategoryName(subCat.name)
    setVisibleProducts(8)
    fetchProducts(subCat._id)
    
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: true
    }))
    
    navigate(`/shop/subcategory/${subCat._id}`, { replace: true })
    setShowMobileSidebar(false)
  }, [selectedSubCategory, fetchProducts, navigate])

  const handleClearFilters = useCallback((): void => {
    setSelectedSubCategory('')
    setSelectedSubCategoryName('')
    setSearchTerm('')
    setPriceRange([0, 50000])
    setVisibleProducts(8)
    navigate('/Shop', { replace: true })
    fetchProducts()
    setShowMobileSidebar(false)
  }, [navigate, fetchProducts])

  const filteredProducts = useMemo((): Product[] =>
    allProducts.filter(p => p.priceINR >= priceRange[0] && p.priceINR <= priceRange[1]),
    [allProducts, priceRange])

  const products = useMemo((): Product[] =>
    filteredProducts.slice(0, visibleProducts),
    [filteredProducts, visibleProducts])

  const handleShowMore = useCallback((): void => {
    setVisibleProducts(prev => Math.min(prev + 8, filteredProducts.length))
  }, [filteredProducts.length])

  const renderRatingStars = useCallback((rating: number = 0): JSX.Element => (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className={`h-3 w-3 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`} />
      ))}
      <span className="ml-1 text-xs text-gray-500">({Math.floor(rating * 20) + 10})</span>
    </div>
  ), [])

  const currentTitle = useMemo((): string => {
    if (selectedSubCategoryName) return selectedSubCategoryName
    return 'PREMIUM SHOP'
  }, [selectedSubCategoryName])

  const currentDescription = useMemo((): string => {
    if (selectedSubCategoryName) return `Explore our ${selectedSubCategoryName} collection`
    return "Discover our curated collection of premium products"
  }, [selectedSubCategoryName])

  const showSkeleton = loading || isFiltering

  const CategorySidebar = () => (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Package className="w-5 h-5" /> Categories
        </h2>
        {(selectedSubCategory || searchTerm) && (
          <button onClick={handleClearFilters} className="text-xs text-amber-600 hover:text-amber-700 transition-colors">
            Clear all
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 pr-1">
        {categoriesLoading ? (
          <div className="space-y-2">
            {[1,2,3,4,5].map(i => <div key={i} className="animate-pulse h-10 bg-gray-200 rounded-lg" />)}
          </div>
        ) : categories.length > 0 ? (
          <>
            <button
              onClick={handleClearFilters}
              className={`w-full text-left px-3 sm:px-4 py-2.5 rounded-xl transition-all font-semibold text-sm ${
                !selectedSubCategory && !searchTerm
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              All Products
            </button>

            {categories.map((category) => {
              const isExpanded = expandedCategories[category._id]
              const hasSubcategories = category.subcategories && category.subcategories.length > 0
              
              return (
                <div key={category._id} className="border-b border-gray-50 last:border-0">
                  <button
                    onClick={() => handleCategoryClick(category._id, category.name)}
                    className="w-full flex items-center justify-between px-3 sm:px-4 py-3 rounded-xl transition-all text-left text-gray-800 hover:bg-gray-50 hover:text-amber-600"
                  >
                    <span className="font-medium text-sm sm:text-base">{category.name}</span>
                    {hasSubcategories && (
                      isExpanded ? 
                        <ChevronUp className="w-4 h-4 text-gray-400" /> : 
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </button>

                  <AnimatePresence initial={false}>
                    {isExpanded && hasSubcategories && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="ml-4 pl-3 border-l-2 border-amber-200 space-y-1 py-1 mb-2">
                          {category.subcategories!.map(subCat => (
                            <button
                              key={subCat._id}
                              onClick={() => handleSubCategorySelect(subCat, category._id)}
                              className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${
                                selectedSubCategory === subCat._id
                                  ? 'bg-amber-100 text-amber-700 font-semibold'
                                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                              }`}
                            >
                              {subCat.name}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </>
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm">No categories found</div>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <div className="relative h-[200px] sm:h-[280px] md:h-[350px] overflow-hidden bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative h-full flex items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-2xl">
            <div className="w-16 h-0.5 bg-amber-500 mb-4" />
            <h1 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 leading-tight">{currentTitle}</h1>
            <p className="text-gray-200 text-sm sm:text-base md:text-lg mb-6">{currentDescription}</p>
            <button onClick={() => window.scrollTo({ top: 500, behavior: 'smooth' })} className="bg-amber-500 hover:bg-amber-600 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-full transition-all text-sm sm:text-base font-semibold shadow-lg">
              SHOP NOW <ArrowRight className="inline ml-2 w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6">

          <div className="hidden lg:block lg:w-72 xl:w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
              <CategorySidebar />
            </div>
          </div>

          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products, brands..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowMobileSidebar(true)} 
                    className="lg:hidden flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    <Menu className="w-4 h-4" /> Categories
                  </button>
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                    <button onClick={() => setViewMode("grid")} className={`p-2 transition-colors ${viewMode === "grid" ? "bg-amber-500 text-white" : "bg-transparent text-gray-600 hover:bg-gray-100"}`}>
                      <Grid className="h-4 w-4" />
                    </button>
                    <button onClick={() => setViewMode("list")} className={`p-2 transition-colors ${viewMode === "list" ? "bg-amber-500 text-white" : "bg-transparent text-gray-600 hover:bg-gray-100"}`}>
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                  <button onClick={() => setShowFilter(!showFilter)} className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
                    <SlidersHorizontal className="w-4 h-4" /> Filter
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {showFilter && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">Price Range</h3>
                      <button onClick={() => setPriceRange([0, 50000])} className="text-xs text-amber-600">Reset</button>
                    </div>
                    <div className="px-2">
                      <input type="range" min={0} max={50000} step={500} value={priceRange[1]} onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value)])} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500" />
                      <div className="flex justify-between text-xs text-gray-600 mt-2">
                        <span>₹{priceRange[0].toLocaleString()}</span>
                        <span>₹{priceRange[1].toLocaleString()}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mb-5 flex justify-between items-center flex-wrap gap-2">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {selectedSubCategoryName || `${totalProducts} Premium Products`}
                </h2>
                <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Showing {products.length} of {filteredProducts.length} products</p>
              </div>
            </div>

            {showSkeleton ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {[...Array(6)].map((_, i) => <ProductSkeleton key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <X className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Products Found</h3>
                <p className="text-gray-500 mb-5 text-sm">Try adjusting your search or filter criteria</p>
                <button onClick={handleClearFilters} className="px-5 py-2.5 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition-colors text-sm">
                  View All Products
                </button>
              </div>
            ) : viewMode === "grid" ? (
              <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {products.map(product => (
                  <motion.div
                    key={product._id}
                    layoutId={product._id}
                    className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100"
                    onClick={() => handleProductClick(product._id)}
                    onMouseEnter={() => setHoveredProduct(product._id)}
                    onMouseLeave={() => setHoveredProduct(null)}
                  >
                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                      <img
                        src={hoveredProduct === product._id && product.images?.image2 ? product.images.image2 : product.images?.image1 || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=400&fit=crop"}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      {product.discount && product.discount > 0 && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-md">-{product.discount}%</div>
                      )}
                      <button 
                        onClick={e => { e.stopPropagation(); toggleFavorite(product.name) }} 
                        className="absolute top-2 right-2 w-7 h-7 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center z-10 hover:bg-white transition-colors"
                      >
                        <Heart className={`h-4 w-4 transition-colors ${favorites[product.name] ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
                      </button>
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
                      <p className="text-xs text-gray-500 mb-2">{product.brand}</p>
                      {renderRatingStars(product.rating || 4)}
                      <div className="flex items-center justify-between mt-2">
                        <div className="text-base font-bold text-gray-900">₹{product.priceINR.toLocaleString()}</div>
                        {product.stock && product.stock > 0 ? (
                          <span className="text-xs text-green-600">In stock</span>
                        ) : (
                          <span className="text-xs text-red-500">Out of stock</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                {products.map(product => (
                  <div
                    key={product._id}
                    className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col sm:flex-row"
                    onClick={() => handleProductClick(product._id)}
                  >
                    <div className="w-full sm:w-32 h-32 flex-shrink-0 relative bg-gray-100">
                      <img src={product.images?.image1 || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=200&h=200&fit=crop"} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                      {product.discount && product.discount > 0 && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-md">-{product.discount}%</div>
                      )}
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h3 className="text-base font-semibold text-gray-900 mb-1">{product.name}</h3>
                          <p className="text-xs text-gray-500 mb-2">{product.brand}</p>
                          <p className="text-sm text-gray-600 line-clamp-2 hidden sm:block">{product.description}</p>
                        </div>
                        <button onClick={e => { e.stopPropagation(); toggleFavorite(product.name) }}>
                          <Heart className={`h-5 w-5 transition-colors ${favorites[product.name] ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          <div className="text-lg font-bold text-gray-900">₹{product.priceINR.toLocaleString()}</div>
                          {renderRatingStars(product.rating || 4)}
                        </div>
                        <button className="px-4 py-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {!showSkeleton && visibleProducts < filteredProducts.length && (
              <div className="mt-10 flex justify-center">
                <button onClick={handleShowMore} className="px-6 py-2.5 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-all text-sm shadow-md">
                  Load More Products
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showMobileSidebar && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setShowMobileSidebar(false)} />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'tween', duration: 0.3 }} className="fixed top-0 left-0 bottom-0 w-80 bg-white z-50 shadow-2xl p-5 overflow-y-auto">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Categories</h2>
                <button onClick={() => setShowMobileSidebar(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <CategorySidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: scrolled ? 1 : 0, scale: scrolled ? 1 : 0.8 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-5 right-5 w-11 h-11 bg-gray-900 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-800 transition-all z-40"
      >
        <ChevronUp className="text-white h-5 w-5" />
      </motion.button>

      <div className="bg-gray-900 text-white py-10 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div><Award className="w-8 h-8 mx-auto mb-2 text-amber-400" /><p className="font-semibold text-sm">Premium Quality</p><p className="text-xs text-gray-400">Authentic products</p></div>
            <div><Truck className="w-8 h-8 mx-auto mb-2 text-amber-400" /><p className="font-semibold text-sm">Free Shipping</p><p className="text-xs text-gray-400">On orders ₹5000+</p></div>
            <div><Shield className="w-8 h-8 mx-auto mb-2 text-amber-400" /><p className="font-semibold text-sm">Secure Shopping</p><p className="text-xs text-gray-400">100% safe</p></div>
            <div><Package className="w-8 h-8 mx-auto mb-2 text-amber-400" /><p className="font-semibold text-sm">Easy Returns</p><p className="text-xs text-gray-400">30-day policy</p></div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}