import { Heart, Search, ArrowRight, Star, Grid, List, X, Package, ChevronDown, ChevronUp, Eye, Menu, SlidersHorizontal, Store } from "lucide-react"
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

interface Seller {
  _id: string;
  name: string;
  Image?: string;
  profileImage?: string;
  companyName?: string;
  status?: boolean;
  city?: string;
  categories?: string[];
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
  seller?: string | { _id: string; name: string };
}

interface ApiResponse {
  success?: boolean;
  categories?: Category[];
  products?: Product[];
  total?: number;
  totalPages?: number;
  subcategories?: SubCategory[];
  sellers?: Seller[];
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
  const params = useParams<{ subcategoryId?: string; categoryId?: string; sellerId?: string }>()
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasFetchedRef = useRef(false)

  const api = useMemo(() => axios.create({ baseURL: baseurl }), [])

  const [favorites, setFavorites] = useState<{ [key: string]: boolean }>({})
  const [visibleProducts, setVisibleProducts] = useState<number>(8)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [sellers, setSellers] = useState<Seller[]>([])
  const [sellerCategories, setSellerCategories] = useState<Category[]>([])
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
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedSeller, setSelectedSeller] = useState<string>('')
  const [selectedSellerObj, setSelectedSellerObj] = useState<Seller | null>(null)
  const [selectedSellerName, setSelectedSellerName] = useState<string>('')
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('')
  const [selectedSubCategoryName, setSelectedSubCategoryName] = useState<string>('')
  const [totalProducts, setTotalProducts] = useState<number>(0)
  const [isFiltering, setIsFiltering] = useState<boolean>(false)
  const [sidebarTab, setSidebarTab] = useState<'categories' | 'sellers'>('categories')

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

  const fetchProducts = useCallback(async (subCatId?: string, catId?: string, searchVal?: string, sellerId?: string): Promise<void> => {
    setLoading(true)
    try {
      const queryParams: Record<string, string | number> = { page: 1, limit: 100 }
      if (subCatId) {
        queryParams.subcategory = subCatId
      } else if (catId) {
        queryParams.category = catId
      }
      if (searchVal) queryParams.search = searchVal
      if (sellerId) queryParams.seller = sellerId

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

  const fetchSellerCategories = useCallback(async (seller: Seller, allCats: Category[]): Promise<void> => {
    if (!seller.categories || seller.categories.length === 0) {
      setSellerCategories([])
      return
    }
    const filtered = allCats.filter(c => seller.categories!.includes(c._id))
    setSellerCategories(filtered)
  }, [])

  const fetchSellers = useCallback(async (): Promise<void> => {
    try {
      const response = await api.get<ApiResponse>("/sellers")
      if (response.data?.success && response.data.sellers) {
        const active = response.data.sellers.filter((s: Seller) => s.status !== false)
        setSellers(active)
      }
    } catch (err) {
      console.error("Error fetching sellers:", err)
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
        for (const cat of res.data.categories) {
          const subcategories = await fetchSubcategoriesForCategory(cat._id)
          const found = subcategories.find(s => s._id === params.subcategoryId)
          if (found) {
            setSelectedSubCategory(found._id)
            setSelectedSubCategoryName(found.name)
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
          setSelectedCategory(category._id)
          setSelectedCategoryName(category.name)
          const subcategories = await fetchSubcategoriesForCategory(category._id)
          setCategories(prev => prev.map(c =>
            c._id === category._id ? { ...c, subcategories } : c
          ))
          setExpandedCategories({ [category._id]: true })
          if (!hasFetchedRef.current) {
            hasFetchedRef.current = true
            fetchProducts(undefined, category._id)
          }
        }
      } else if (params.sellerId) {
        if (!hasFetchedRef.current) {
          hasFetchedRef.current = true
          fetchProducts(undefined, undefined, undefined, params.sellerId)
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
  }, [api, params.subcategoryId, params.categoryId, params.sellerId, fetchProducts, fetchSubcategoriesForCategory])

  useEffect(() => {
    hasFetchedRef.current = false

    if (params.sellerId) {
      const cachedSellers = localStorage.getItem('cachedSellers')
      if (cachedSellers) {
        try {
          const parsed: Seller[] = JSON.parse(cachedSellers)
          const found = parsed.find(s => s._id === params.sellerId && s.status !== false)
          if (found) {
            setSelectedSeller(found._id)
            setSelectedSellerObj(found)
            setSelectedSellerName(found.companyName || found.name)
          }
        } catch {}
      }
    } else {
      setSelectedSeller('')
      setSelectedSellerObj(null)
      setSelectedSellerName('')
      setSellerCategories([])
    }

    fetchCategories()
    fetchSellers()
  }, [fetchCategories, fetchSellers, params.sellerId])

  useEffect(() => {
    if (selectedSellerObj && categories.length > 0) {
      fetchSellerCategories(selectedSellerObj, categories)
    } else {
      setSellerCategories([])
    }
  }, [selectedSellerObj, categories, fetchSellerCategories])

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    setIsFiltering(true)
    searchTimeoutRef.current = setTimeout(() => {
      fetchProducts(
        selectedSubCategory || undefined,
        selectedCategory || undefined,
        searchTerm || undefined,
        selectedSeller || undefined
      )
    }, 500)
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current) }
  }, [searchTerm, selectedSubCategory, selectedCategory, selectedSeller, fetchProducts])

  const handleCategoryClick = useCallback(async (categoryId: string, _categoryName: string): Promise<void> => {
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

  const handleCategorySelect = useCallback((categoryId: string, categoryName: string): void => {
    setSelectedCategory(categoryId)
    setSelectedCategoryName(categoryName)
    setSelectedSubCategory('')
    setSelectedSubCategoryName('')
    setVisibleProducts(8)
    if (selectedSeller) {
      fetchProducts(undefined, categoryId, undefined, selectedSeller)
    } else {
      fetchProducts(undefined, categoryId)
      navigate(`/shop/category/${categoryId}`, { replace: true })
    }
    setShowMobileSidebar(false)
  }, [selectedSeller, fetchProducts, navigate])

  const handleSubCategorySelect = useCallback((subCat: SubCategory, categoryId: string): void => {
    if (selectedSubCategory === subCat._id && !selectedSeller) return
    setSelectedSubCategory(subCat._id)
    setSelectedSubCategoryName(subCat.name)
    setSelectedCategory('')
    setSelectedCategoryName('')
    setVisibleProducts(8)
    if (selectedSeller) {
      fetchProducts(subCat._id, undefined, undefined, selectedSeller)
    } else {
      fetchProducts(subCat._id)
      navigate(`/shop/subcategory/${subCat._id}`, { replace: true })
    }
    setExpandedCategories(prev => ({ ...prev, [categoryId]: true }))
    setShowMobileSidebar(false)
  }, [selectedSubCategory, selectedSeller, fetchProducts, navigate])

  const handleSellerSelect = useCallback((seller: Seller): void => {
    if (selectedSeller === seller._id) return
    setSelectedSeller(seller._id)
    setSelectedSellerObj(seller)
    setSelectedSellerName(seller.companyName || seller.name)
    setSelectedCategory('')
    setSelectedCategoryName('')
    setSelectedSubCategory('')
    setSelectedSubCategoryName('')
    setVisibleProducts(8)
    fetchProducts(undefined, undefined, undefined, seller._id)
    navigate(`/shop/seller/${seller._id}`, { replace: true })
    setShowMobileSidebar(false)
    setSidebarTab('categories')
  }, [selectedSeller, fetchProducts, navigate])

  const handleClearFilters = useCallback((): void => {
    setSelectedSubCategory('')
    setSelectedSubCategoryName('')
    setSelectedCategory('')
    setSelectedCategoryName('')
    setSelectedSeller('')
    setSelectedSellerObj(null)
    setSelectedSellerName('')
    setSellerCategories([])
    setSearchTerm('')
    setPriceRange([0, 50000])
    setVisibleProducts(8)
    navigate('/Shop', { replace: true })
    fetchProducts()
    setShowMobileSidebar(false)
  }, [navigate, fetchProducts])

  const handleClearSellerOnly = useCallback((): void => {
    setSelectedSeller('')
    setSelectedSellerObj(null)
    setSelectedSellerName('')
    setSellerCategories([])
    setSelectedCategory('')
    setSelectedCategoryName('')
    setSelectedSubCategory('')
    setSelectedSubCategoryName('')
    setVisibleProducts(8)
    navigate('/Shop', { replace: true })
    fetchProducts()
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
    if (selectedSellerName) return selectedSellerName
    if (selectedSubCategoryName) return selectedSubCategoryName
    if (selectedCategoryName) return selectedCategoryName
    return 'PREMIUM SHOP'
  }, [selectedSellerName, selectedSubCategoryName, selectedCategoryName])

  const currentDescription = useMemo((): string => {
    if (selectedSellerName) return `Browse all products from ${selectedSellerName}`
    if (selectedSubCategoryName) return `Explore our ${selectedSubCategoryName} collection`
    if (selectedCategoryName) return `Discover our ${selectedCategoryName} collection`
    return "Discover our curated collection of premium products"
  }, [selectedSellerName, selectedSubCategoryName, selectedCategoryName])

  const showSkeleton = loading || isFiltering

  const activeCategoriesToShow = selectedSeller && sellerCategories.length > 0 ? sellerCategories : categories

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setSidebarTab('categories')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${sidebarTab === 'categories' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {selectedSeller ? 'Store Categories' : 'Categories'}
          </button>
          <button
            onClick={() => setSidebarTab('sellers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${sidebarTab === 'sellers' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Sellers
          </button>
        </div>
        {(selectedSubCategory || selectedCategory || selectedSeller || searchTerm) && (
          <button onClick={handleClearFilters} className="text-xs text-amber-600 hover:text-amber-700 transition-colors font-medium">
            Clear all
          </button>
        )}
      </div>

      {selectedSeller && (
        <div className="mb-4 rounded-xl overflow-hidden border-2 border-amber-200 shadow-sm">
          {(() => {
            const sellerImage = selectedSellerObj?.Image || selectedSellerObj?.profileImage;
            const initials = selectedSellerObj?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'S';
            return (
              <div className="relative h-28">
                {sellerImage ? (
                  <img src={sellerImage} alt={selectedSellerName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center">
                    <span className="text-amber-400 font-bold text-4xl">{initials}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <button
                  onClick={handleClearSellerOnly}
                  className="absolute top-2 right-2 w-6 h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/40 transition-all"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className="flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-white text-sm font-bold truncate">{selectedSellerName}</span>
                  </div>
                  {sellerCategories.length > 0 && (
                    <p className="text-amber-300 text-xs mt-0.5">{sellerCategories.length} categories available</p>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-1 pr-0.5">
        {sidebarTab === 'categories' ? (
          categoriesLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => <div key={i} className="animate-pulse h-10 bg-gray-200 rounded-lg" />)}
            </div>
          ) : activeCategoriesToShow.length > 0 ? (
            <>
              <button
                onClick={() => {
                  setSelectedCategory('')
                  setSelectedCategoryName('')
                  setSelectedSubCategory('')
                  setSelectedSubCategoryName('')
                  setVisibleProducts(8)
                  if (selectedSeller) {
                    fetchProducts(undefined, undefined, undefined, selectedSeller)
                  } else {
                    fetchProducts()
                    navigate('/Shop', { replace: true })
                  }
                  setShowMobileSidebar(false)
                }}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all font-semibold text-sm ${
                  !selectedSubCategory && !selectedCategory
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-amber-600'
                }`}
              >
                {selectedSeller ? 'All Store Products' : 'All Products'}
              </button>

              {activeCategoriesToShow.map((category) => {
                const isExpanded = expandedCategories[category._id]
                const hasSubcategories = category.subcategories && category.subcategories.length > 0
                const isCategorySelected = selectedCategory === category._id

                return (
                  <div key={category._id} className="border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCategorySelect(category._id, category.name)}
                        className={`flex-1 text-left px-4 py-3 rounded-xl transition-all ${
                          isCategorySelected
                            ? 'bg-amber-100 text-amber-700 font-semibold'
                            : 'text-gray-800 hover:bg-gray-50 hover:text-amber-600'
                        }`}
                      >
                        <span className="font-medium text-sm">{category.name}</span>
                      </button>
                      <button
                        onClick={() => handleCategoryClick(category._id, category.name)}
                        className="p-2 mr-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all flex-shrink-0"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>

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
          ) : selectedSeller ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p>No specific categories for this seller</p>
              <button
                onClick={() => fetchProducts(undefined, undefined, undefined, selectedSeller)}
                className="mt-2 text-amber-500 text-xs hover:underline"
              >
                Show all products
              </button>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">No categories found</div>
          )
        ) : (
          sellers.length > 0 ? (
            <div className="space-y-2">
              <button
                onClick={handleClearFilters}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all font-semibold text-sm ${
                  !selectedSeller && !selectedSubCategory && !selectedCategory && !searchTerm
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-amber-600'
                }`}
              >
                All Sellers
              </button>
              {sellers.map((seller) => {
                const sellerImage = seller.Image || seller.profileImage
                const initials = seller.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'S'
                const isSelected = selectedSeller === seller._id
                return (
                  <button
                    key={seller._id}
                    onClick={() => handleSellerSelect(seller)}
                    className={`w-full text-left rounded-xl transition-all overflow-hidden border-2 ${
                      isSelected
                        ? 'border-amber-400 shadow-md'
                        : 'border-transparent hover:border-gray-200'
                    }`}
                  >
                    <div className="relative h-28 bg-gray-100">
                      {sellerImage ? (
                        <img src={sellerImage} alt={seller.name} className="w-full h-full object-cover" loading="lazy"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center">
                          <span className="text-amber-500 font-bold text-3xl">{initials}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-amber-400 rounded-full p-1">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-white text-sm font-bold truncate">{seller.companyName || seller.name}</p>
                        {seller.city && <p className="text-gray-300 text-xs truncate">{seller.city}</p>}
                        {isSelected && (
                          <p className="text-amber-400 text-xs mt-0.5 font-medium">✓ Currently viewing</p>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">No sellers found</div>
          )
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
            {selectedSellerName && (
              <div className="flex items-center gap-2 mb-2">
                <Store className="w-4 h-4 text-amber-400" />
                <span className="text-amber-400 text-sm font-medium">Seller Store</span>
                {selectedCategoryName && (
                  <>
                    <span className="text-gray-500 text-sm">·</span>
                    <span className="text-amber-300 text-sm">{selectedCategoryName}</span>
                  </>
                )}
              </div>
            )}
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
              <SidebarContent />
            </div>
          </div>

          <div className="flex-1 min-w-0">
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
                    <Menu className="w-4 h-4" /> Filter
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
                    <SlidersHorizontal className="w-4 h-4" /> Price
                  </button>
                </div>
              </div>

              {(selectedSellerName || selectedCategoryName || selectedSubCategoryName) && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedSellerName && (
                    <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1 rounded-full text-xs font-medium">
                      <Store className="w-3 h-3" />
                      {selectedSellerName}
                      <button onClick={handleClearSellerOnly} className="ml-1 hover:text-amber-900">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  {selectedCategoryName && (
                    <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1 rounded-full text-xs font-medium">
                      {selectedCategoryName}
                      <button onClick={() => {
                        setSelectedCategory('');
                        setSelectedCategoryName('');
                        if (selectedSeller) { fetchProducts(undefined, undefined, undefined, selectedSeller) } else { fetchProducts() }
                      }} className="ml-1 hover:text-amber-900">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  {selectedSubCategoryName && (
                    <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1 rounded-full text-xs font-medium">
                      {selectedSubCategoryName}
                      <button onClick={() => {
                        setSelectedSubCategory('');
                        setSelectedSubCategoryName('');
                        if (selectedSeller) { fetchProducts(undefined, undefined, undefined, selectedSeller) } else { fetchProducts() }
                      }} className="ml-1 hover:text-amber-900">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              )}

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
                  {selectedSellerName
                    ? selectedCategoryName
                      ? `${selectedSellerName} · ${selectedCategoryName}`
                      : selectedSubCategoryName
                      ? `${selectedSellerName} · ${selectedSubCategoryName}`
                      : `${selectedSellerName}'s Products`
                    : selectedSubCategoryName || selectedCategoryName || `${totalProducts} Premium Products`}
                </h2>
                <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Showing {products.length} of {filteredProducts.length} products</p>
              </div>
            </div>

            {showSkeleton ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {[...Array(6)].map((_, i) => <ProductSkeleton key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Products Found</h3>
                <p className="text-gray-500 mb-5 text-sm">
                  {selectedSellerName && selectedCategoryName
                    ? `No products from ${selectedSellerName} in ${selectedCategoryName}.`
                    : selectedSellerName
                    ? `No products available from ${selectedSellerName} yet.`
                    : selectedCategoryName
                    ? `No products available in ${selectedCategoryName} category yet.`
                    : selectedSubCategoryName
                    ? `No products available in ${selectedSubCategoryName} collection yet.`
                    : "Try adjusting your search or filter criteria"}
                </p>
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
                    className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col sm:flex-row border border-gray-100"
                    onClick={() => handleProductClick(product._id)}
                  >
                    <div className="w-full sm:w-36 h-36 flex-shrink-0 relative bg-gray-100">
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

            {!showSkeleton && visibleProducts < filteredProducts.length && filteredProducts.length > 0 && (
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
                <h2 className="text-xl font-bold text-gray-900">Filter</h2>
                <button onClick={() => setShowMobileSidebar(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <SidebarContent />
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

      <Footer />
    </div>
  )
}