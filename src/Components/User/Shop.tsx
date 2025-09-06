import { Heart, ShoppingBag, Filter, Search, ArrowRight } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import tshirt from "../Layouts/Img/tshirt.jpeg"
import Footer from "../Layouts/Footer"
import NavBar from "../Layouts/Navbar"
import { Button } from "../Layouts/button"
import { baseurl } from "../../Constant/Base"
import axios from "axios"

interface Category {
  _id: string;
  name: string;
  image: string;
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
  status?: 'LISTED' | 'UNLISTED';
  rating?: number;
  reviews?: number;
  originalPrice?: number;
  active: boolean;
  __v: number;
}

export default function ShopLayout() {
  const navigate = useNavigate()
  const api = axios.create({
    baseURL: baseurl,
  });

  const [favorites, setFavorites] = useState<{ [key: string]: boolean }>({})
  const [visibleProducts, setVisibleProducts] = useState(6)
  const [productsPerRow, setProductsPerRow] = useState(3)
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null)
  const [showFilter, setShowFilter] = useState(false)

  const toggleFavorite = (productName: string) => {
    setFavorites((prev) => ({
      ...prev,
      [productName]: !prev[productName],
    }))
  }

  const handleShowMore = () => {
    setVisibleProducts((prev) => Math.min(prev + 6, allProducts.length))
  }

  const handleViewChange = (columns: number) => {
    setProductsPerRow(columns)
  }

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`)
  }

  const getCategories = async () => {
    try {
      const response = await api.get("/get-category")
      if (response.data && Array.isArray(response.data)) {
        setCategories(response.data)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const getProducts = async () => {
    try {
      const response = await api.get("/get-product")
      if (response.data && Array.isArray(response.data)) {
        setAllProducts(response.data)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  useEffect(() => {
    getProducts()
    getCategories()
  }, [])

  const products = allProducts.slice(0, visibleProducts)

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar isTransparent={false} />
      
      <div className="relative bg-black py-6 md:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="text-white">
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Luxury Collection</h1>
              <p className="text-gray-300 mb-6">Discover the latest in premium fashion and accessories</p>
              <div className="flex flex-wrap gap-3">
                <Button className="bg-white text-black hover:bg-gray-200 px-6 py-3 rounded-none">
                  Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button className="border border-white text-white hover:bg-white/10 px-6 py-3 rounded-none">
                  New Arrivals
                </Button>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative h-64 w-full overflow-hidden">
                <div className="absolute -right-16 top-0 h-48 w-48 rounded-full bg-gradient-to-br from-gold-300 to-gold-600 blur-2xl opacity-60"></div>
                <div className="absolute -left-8 bottom-0 h-32 w-32 rounded-full bg-gradient-to-tr from-gray-800 to-gray-600 blur-xl opacity-70"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-12 md:py-24">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-gray-900 relative">
            <span className="relative z-10">YOU MIGHT LIKE</span>
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gray-900"></span>
          </h2>
          
          <div className="relative">
            <div className="flex justify-start md:justify-center gap-4 md:gap-8 overflow-x-auto pb-6 snap-x scrollbar-hide -mx-4 px-4">
              {categories.map((category) => (
                <div key={category._id} className="flex flex-col items-center flex-shrink-0 snap-start">
                  <div className="mb-4 h-16 w-16 md:h-24 md:w-24 overflow-hidden rounded-full shadow-md transition-transform hover:scale-105 border-2 border-gray-200 group">
                    <img
                      src={category.image || tshirt}
                      alt={category.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-110"
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-xs md:text-sm font-semibold text-gray-900">{category.name}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 bg-gradient-to-r from-gray-50 to-transparent w-12 h-16 md:hidden"></div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-gradient-to-l from-gray-50 to-transparent w-12 h-16 md:hidden"></div>
          </div>
        </div>

        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-200 pb-6 gap-4">
          <div className="flex items-center gap-2">
            <a href="#" className="text-sm font-medium text-gray-600 hover:text-gray-900">HOME</a>
            <span className="text-gray-400">/</span>
            <span className="text-sm font-medium text-gray-900">THE SHOP</span>
          </div>
          
          <div className="relative w-full md:w-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
              <div className="w-full md:w-auto">
                <select className="w-full rounded-none border border-gray-300 px-4 py-2 text-sm focus:border-gray-500 focus:outline-none appearance-none bg-no-repeat bg-right">
                  <option>DEFAULT SORTING</option>
                  <option>PRICE: LOW TO HIGH</option>
                  <option>PRICE: HIGH TO LOW</option>
                  <option>NEW ARRIVALS</option>
                </select>
              </div>
              
              <div className="hidden md:flex items-center gap-3">
                <span className="text-sm font-medium">VIEW</span>
                {[2, 3, 4].map((num) => (
                  <button 
                    key={num} 
                    className={`px-3 text-sm font-medium transition-colors ${
                      productsPerRow === num 
                        ? 'text-gray-900 underline' 
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                    onClick={() => handleViewChange(num)}
                  >
                    {num}
                  </button>
                ))}
              </div>
              
              <button 
                className="flex items-center gap-2 rounded-none border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 w-full md:w-auto justify-center md:justify-start"
                onClick={() => setShowFilter(!showFilter)}
              >
                <Filter className="h-4 w-4" />
                FILTER
              </button>
              
              <div className="hidden md:flex relative rounded-none border border-gray-300 overflow-hidden w-full md:w-auto">
                <input
                  type="text"
                  placeholder="Search products"
                  className="w-full px-4 py-2 text-sm focus:outline-none"
                />
                <button className="absolute right-0 top-0 h-full px-3 bg-gray-100 flex items-center">
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {showFilter && (
              <div className="absolute left-0 top-full z-20 mt-2 w-full md:w-64 bg-white shadow-lg p-4 border border-gray-200">
                <h3 className="font-medium text-lg mb-3">Filter By</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Price Range</h4>
                    <div className="flex gap-2 items-center">
                      <input type="range" className="w-full" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Categories</h4>
                    <div className="space-y-2">
                      {categories.slice(0, 3).map(cat => (
                        <label key={cat._id} className="flex items-center gap-2">
                          <input type="checkbox" className="rounded" />
                          <span>{cat.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full bg-black text-white hover:bg-gray-800 rounded-none">Apply Filters</Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div 
          className={`grid gap-x-4 md:gap-x-8 gap-y-8 md:gap-y-12 ${
            productsPerRow === 2 
              ? 'grid-cols-2 sm:grid-cols-2' 
              : productsPerRow === 3 
                ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
          }`}
        >
          {products.map((product) => (
            <div 
              key={product._id} 
              className="group relative flex flex-col"
              onMouseEnter={() => setHoveredProduct(product._id)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              <div 
                className="relative aspect-[3/4] w-full overflow-hidden bg-gray-100 cursor-pointer transition-all duration-300"
                onClick={() => handleProductClick(product._id)}
              >
                <img
                  src={hoveredProduct === product._id && product.images.image2 ? product.images.image2 : product.images.image1 || tshirt}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {product.brand && (
                  <div className="absolute left-0 top-0 z-10 bg-red-600 px-3 py-1 text-xs md:text-sm font-medium text-white">
                    {product.brand}
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 transition-opacity duration-300 group-hover:bg-opacity-10 pointer-events-none"></div>
                
                <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-90 py-3 px-4 transform translate-y-full transition-transform duration-300 group-hover:translate-y-0 flex justify-between items-center">
                  <span className="text-sm font-medium">Quick View</span>
                  <ShoppingBag className="h-5 w-5" />
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(product.name);
                  }}
                  className="absolute right-3 top-3 z-10 rounded-full bg-white p-2 shadow-md transition-transform hover:scale-110"
                  aria-label={favorites[product.name] ? "Remove from favorites" : "Add to favorites"}
                >
                  <Heart
                    className={`h-4 w-4 ${favorites[product.name] ? "fill-red-500 text-red-500" : "text-gray-600"}`}
                  />
                </button>
              </div>
              <div className="mt-4 flex flex-col">
                <p className="text-xs md:text-sm font-medium text-gray-500">
                  {typeof product.category === 'object' ? product.category.name : 'Unknown Category'}
                </p>
                <h3 className="mt-1 md:mt-2 text-sm md:text-base font-semibold text-gray-900 truncate">{product.name}</h3>
                <div className="mt-1 md:mt-2 flex items-center gap-2 md:gap-3">
                  <p className="text-base md:text-lg font-bold text-gray-900">₹{product.priceINR}</p>
                  {product.originalPrice && (
                    <p className="text-xs md:text-sm text-gray-500 line-through">AED {product.originalPrice}</p>
                  )}
                </div>
                {product.rating && (
                  <div className="mt-1 md:mt-2 flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span 
                        key={i} 
                        className={`text-xs md:text-sm ${i < Math.floor(product.rating || 0) ? 'text-amber-400' : 'text-gray-300'}`}
                      >
                        ★
                      </span>
                    ))}
                    {product.reviews && (
                      <span className="ml-1 text-xs text-gray-500">{product.reviews}+</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {visibleProducts < allProducts.length && (
          <div className="mt-16 flex justify-center pb-16">
            <Button
              onClick={handleShowMore}
              className="rounded-none bg-black px-8 py-3 md:py-6 text-sm md:text-base font-semibold text-white transition-colors hover:bg-gray-800 relative overflow-hidden group"
            >
              <span className="relative z-10">Show More Products</span>
              <span className="absolute inset-0 bg-gray-700 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
            </Button>
          </div>
        )}
      </div>

      <div className="bg-gray-100 py-12 mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Stay updated with our latest collections, exclusive offers, and fashion insights.</p>
          </div>
          <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="flex-grow px-4 py-3 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 rounded-none"
            />
            <Button className="bg-black text-white hover:bg-gray-800 px-6 py-3 rounded-none">
              Subscribe
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}