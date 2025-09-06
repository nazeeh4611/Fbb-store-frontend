import { Heart, Filter, ArrowUpDown, ChevronRight, Star, Loader2 } from "lucide-react"
import { useEffect, useState, useCallback } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import Footer from "../Layouts/Footer"
import NavBar from "../Layouts/Navbar"
import { Button } from "../Layouts/button"
import { baseurl } from "../../Constant/Base"
import axios from "axios"
import { motion } from "framer-motion"

interface CategoryId {
  _id: string;
  name: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

interface SubCategoryId {
  _id: string;
  name: string;
  categoryId: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  _id: string;
  name: string;
  image: string;
}

interface Product {
  _id: string;
  name: string;
  brand: string;
  categoryId: CategoryId;
  subCategoryId: SubCategoryId;
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
  status?: 'LISTED' | 'UNLISTED';
  rating?: number;
  reviews?: number;
  originalPrice?: number;
  active: boolean;
  __v: number;
  description?: string;
  sizes?: string[];
  colors?: string[];
  discount?: number;
}

interface FilterState {
  priceRange: [number, number];
  brands: string[];
  sortBy: string;
}

export default function FilterProduct() {
  const navigate = useNavigate()
  const api = axios.create({
    baseURL: baseurl,
  });

  const [favorites, setFavorites] = useState<{ [key: string]: boolean }>({})
  const [visibleProducts, setVisibleProducts] = useState(9)
  const [productsPerRow, setProductsPerRow] = useState(3)
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState<{ [key: string]: number }>({})
  const [currentCategory, setCurrentCategory] = useState<string>("")
  const [currentSubCategory, setCurrentSubCategory] = useState<string>("")
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 50000],
    brands: [],
    sortBy: 'newest'
  })
  const {category, id,seller} = useParams()

  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites')
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites))
  }, [favorites])

  useEffect(() => {
    if (filteredProducts.length > 0) {
      const product = filteredProducts[0]
      if (product.categoryId && typeof product.categoryId === 'object') {
        setCurrentCategory(product.categoryId.name)
      }
      if (product.subCategoryId && typeof product.subCategoryId === 'object') {
        setCurrentSubCategory(product.subCategoryId.name)
      }
    }
  }, [filteredProducts])

  const toggleFavorite = (productName: string, event: React.MouseEvent) => {
    event.stopPropagation()
    setFavorites((prev) => ({
      ...prev,
      [productName]: !prev[productName],
    }))
  }

  const handleShowMore = () => {
    setVisibleProducts((prev) => Math.min(prev + 9, filteredProducts.length))
  }

  const handleViewChange = (columns: number) => {
    setProductsPerRow(columns)
  }

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`)
  }

  const handleMouseEnter = (productId: string) => {
    setActiveImageIndex(prev => ({...prev, [productId]: 1}))
  }

  const handleMouseLeave = (productId: string) => {
    setActiveImageIndex(prev => ({...prev, [productId]: 0}))
  }

  const getCategories = async () => {
    try {
      const response = await api.get(`/get-category/${category}`)
      if (response.data && Array.isArray(response.data)) {
        setCategories(response.data)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const getProducts = async () => {
    setIsLoading(true)
    try {
      const response = await api.get(`/get-related/${seller}/${id}`)
      if (response.data && Array.isArray(response.data)) {
        const productsWithMockData = response.data.map((product: Product) => ({
          ...product,
          description: "Premium quality product, perfect for everyday use.",
          sizes: ["S", "M", "L", "XL"],
          colors: ["Black", "White", "Red", "Blue"],
          discount: Math.floor(Math.random() * 40)
        }))
        setAllProducts(productsWithMockData)
        setFilteredProducts(productsWithMockData)
        const initialActiveImages: { [key: string]: number } = {}
        productsWithMockData.forEach(product => {
          initialActiveImages[product._id] = 0
        })
        setActiveImageIndex(initialActiveImages)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = useCallback(() => {
    let filtered = [...allProducts]
    
    filtered = filtered.filter(product => 
      product.priceINR >= filters.priceRange[0] && 
      product.priceINR <= filters.priceRange[1]
    )
    
    if (filters.brands.length > 0) {
      filtered = filtered.filter(product => 
        filters.brands.includes(product.brand)
      )
    }
    
    switch (filters.sortBy) {
      case 'price-low-high':
        filtered.sort((a, b) => a.priceINR - b.priceINR)
        break
      case 'price-high-low':
        filtered.sort((a, b) => b.priceINR - a.priceINR)
        break
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      default:
        break
    }
    
    setFilteredProducts(filtered)
  }, [allProducts, filters])

  useEffect(() => {
    if (allProducts.length > 0) {
      applyFilters()
    }
  }, [allProducts, filters, applyFilters])

  useEffect(() => {
    getProducts()
    getCategories()
  }, [])

  const uniqueBrands = [...new Set(allProducts.map(p => p.brand))]
  const minPrice = Math.min(...allProducts.map(p => p.priceINR))
  const maxPrice = Math.max(...allProducts.map(p => p.priceINR))
  const products = filteredProducts.slice(0, visibleProducts)

  const handleFilterChange = (filterType: keyof FilterState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  const toggleFilterValue = (filterType: 'brands', value: string) => {
    setFilters(prev => {
      const currentValues = prev[filterType]
      return {
        ...prev,
        [filterType]: currentValues.includes(value)
          ? currentValues.filter(v => v !== value)
          : [...currentValues, value]
      }
    })
  }

  const renderRatingStars = (rating: number = 0) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < Math.floor(rating)
                ? "fill-yellow-400 text-yellow-400"
                : i < rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        ))}
      </div>
    )
  }

  const getGridClass = () => {
    switch (productsPerRow) {
      case 2:
        return 'grid-cols-2';
      case 3:
        return 'grid-cols-2 md:grid-cols-3';
      case 4:
        return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
      default:
        return 'grid-cols-2 md:grid-cols-3';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar isTransparent={false} />
      
      <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 py-24 text-center text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Discover Premium Collection
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-xl text-gray-300">
            Explore our carefully curated selection of high-quality products
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </div>
      
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            <li>
              <Link to="/" className="text-sm font-medium text-gray-500 hover:text-gray-700">
                Home
              </Link>
            </li>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <li>
              <Link to="/shop" className="text-sm font-medium text-gray-500 hover:text-gray-700">
                Shop
              </Link>
            </li>
            {currentCategory && (
              <>
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <li>
                  <Link 
                    to={`/category/${currentCategory.toLowerCase()}`} 
                    className="text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    {currentCategory}
                  </Link>
                </li>
              </>
            )}
            {currentSubCategory && (
              <>
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <li>
                  <span className="text-sm font-medium text-gray-900">
                    {currentSubCategory}
                  </span>
                </li>
              </>
            )}
          </ol>
        </nav>
      </div>
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-16">
          <h2 className="mb-8 text-center text-3xl font-bold tracking-tight text-gray-900">
            You Might Like
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {categories.map((category) => (
              <motion.div
                key={category._id}
                className="group cursor-pointer"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex flex-col items-center">
                  <div className="mb-4 h-20 w-20 overflow-hidden rounded-full bg-white shadow-md transition-all group-hover:shadow-lg sm:h-24 sm:w-24 md:h-28 md:w-28">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-110"
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-gray-900">{category.name}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="pb-24">
          <div className="mb-12">
            <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
              Explore
            </h2>
            <p className="mt-4 text-center text-gray-600">
              Discover products tailored to your preferences
            </p>
          </div>

          <div className="mb-8 flex flex-col border-b border-gray-200 pb-6 lg:flex-row lg:items-center lg:justify-between">
            <button
              className="mb-4 flex items-center gap-2 self-start rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 lg:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Sort by:</span>
                <select
                  className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  >
                    <option value="newest">Newest</option>
                    <option value="price-low-high">Price: Low to High</option>
                    <option value="price-high-low">Price: High to Low</option>
                    <option value="rating">Customer Rating</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">View:</span>
                  {[2, 3, 4].map((num) => (
                    <button 
                      key={num} 
                      className={`px-2 text-sm font-medium transition-colors ${
                        productsPerRow === num 
                          ? 'text-indigo-600 underline' 
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                      onClick={() => handleViewChange(num)}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                
                <button
                  className="hidden items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 lg:flex"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4" />
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
              </div>
            </div>
            
            <div className="flex flex-col lg:flex-row">
              {showFilters && (
                <div className="mb-8 w-full shrink-0 pr-0 lg:mb-0 lg:w-64 lg:pr-8">
                  <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">Filters</h3>
                    
                    <div className="mb-6">
                      <h4 className="mb-2 text-sm font-medium text-gray-700">Price Range</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">₹{filters.priceRange[0]}</span>
                        <span className="text-sm text-gray-600">₹{filters.priceRange[1]}</span>
                      </div>
                      <input
                        type="range"
                        min={minPrice || 0}
                        max={maxPrice || 50000}
                        value={filters.priceRange[1]}
                        onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], parseInt(e.target.value)])}
                        className="mt-2 w-full"
                      />
                    </div>
                    
                    {uniqueBrands.length > 0 && (
                      <div className="mb-6">
                        <h4 className="mb-2 text-sm font-medium text-gray-700">Brands</h4>
                        <div className="space-y-2">
                          {uniqueBrands.map((brand) => (
                            <label key={brand} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={filters.brands.includes(brand)}
                                onChange={() => toggleFilterValue('brands', brand)}
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <span className="ml-2 text-sm text-gray-600">{brand}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <button
                      onClick={() => setFilters({
                        priceRange: [minPrice || 0, maxPrice || 50000],
                        brands: [],
                        sortBy: 'newest'
                      })}
                      className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>
              )}
              
              <div className="flex-1">
                {isLoading ? (
                  <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                  </div>
                ) : products.length === 0 ? (
                  <div className="flex h-64 flex-col items-center justify-center text-center">
                    <p className="text-lg font-medium text-gray-900">No products found</p>
                    <p className="mt-2 text-sm text-gray-600">Try adjusting your filters or check back later</p>
                  </div>
                ) : (
                  <div className={`grid gap-x-6 gap-y-10 sm:gap-x-8 ${getGridClass()}`}>
                    {products.map((product) => (
                      <motion.div
                        key={product._id}
                        className="group relative flex flex-col"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div 
                          className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-gray-100 shadow-sm transition-all group-hover:shadow-md"
                          onMouseEnter={() => handleMouseEnter(product._id)}
                          onMouseLeave={() => handleMouseLeave(product._id)}
                          onClick={() => handleProductClick(product._id)}
                        >
                          <div className="relative h-full w-full cursor-pointer">
                            <img
                              src={product.images.image1}
                              alt={product.name}
                              className="h-full w-full object-cover transition-opacity duration-300"
                              style={{ opacity: activeImageIndex[product._id] ? 0 : 1 }}
                            />
                            
                            <img
                              src={product.images.image2}
                              alt={`${product.name} - alternate view`}
                              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
                              style={{ opacity: activeImageIndex[product._id] ? 1 : 0 }}
                            />
                          </div>
                          
                          <div className="absolute left-4 top-4 z-10 flex flex-col gap-2">
                            {product.brand && (
                              <span className="rounded-md bg-indigo-600 px-2 py-1 text-xs font-medium text-white">
                                {product.brand}
                              </span>
                            )}
                          </div>
                          
                          <button
                            onClick={(e) => toggleFavorite(product.name, e)}
                            className="absolute right-4 top-4 z-10 rounded-full bg-white p-2 shadow-md transition-transform hover:scale-110"
                            aria-label={favorites[product.name] ? "Remove from favorites" : "Add to favorites"}
                          >
                            <Heart
                              className={`h-5 w-5 ${favorites[product.name] ? "fill-red-500 text-red-500" : "text-gray-600"}`}
                            />
                          </button>
                        </div>
                        
                        <div className="mt-4 flex flex-col">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-500">
                              {product.categoryId ? product.categoryId.name : 'Unknown Category'}
                            </p>
                            {product.rating && (
                              <div className="flex items-center gap-1">
                                {renderRatingStars(product.rating)}
                                {product.reviews && (
                                  <span className="ml-1 text-xs text-gray-500">({product.reviews})</span>
                                )}
                              </div>
                            )}
                          </div>
                          <h3 className="mt-2 cursor-pointer text-base font-medium text-gray-900 group-hover:text-indigo-600" onClick={() => handleProductClick(product._id)}>
                            {product.name}
                          </h3>
                          <div className="mt-2 flex items-center gap-2">
                            <p className="text-lg font-bold text-gray-900">₹{product.priceINR}</p>
                            {product.originalPrice && (
                              <p className="text-sm text-gray-500 line-through">₹{product.originalPrice}</p>
                            )}
                            {(product.discount && product.discount > 0) && (
                              <p className="text-sm font-medium text-green-600">{product.discount}% off</p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
                
                {!isLoading && visibleProducts < filteredProducts.length && (
                  <div className="mt-12 flex justify-center">
                    <Button
                      onClick={handleShowMore}
                      className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-indigo-600 to-indigo-800 px-8 py-3 text-base font-semibold text-white transition-all duration-300 ease-out hover:from-indigo-700 hover:to-indigo-900"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-800 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
                      <span className="relative flex items-center gap-2">
                        Show More Products
                        <ArrowUpDown className="h-4 w-4" />
                      </span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
  
        <div className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-center text-3xl font-bold tracking-tight text-gray-900">
              RECENTLY VIEWED
            </h2>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {products.slice(0, 5).map((product) => (
                <div
                  key={`recent-${product._id}`}
                  className="group cursor-pointer"
                  onClick={() => handleProductClick(product._id)}
                >
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                    <img
                      src={product.images.image1}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 line-clamp-1">{product.name}</h3>
                  <p className="mt-1 text-sm font-medium text-gray-900">₹{product.priceINR}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
  
        <Footer />
      </div>
    )
  }