import { useState, useEffect, useRef } from "react";
import { useTypewriter, Cursor } from 'react-simple-typewriter';
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowRight, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { RiStarFill } from "react-icons/ri";
import Hero2 from "../Layouts/Img/Hero2.jpg";
import fbbslide from "../Layouts/Img/fbbslide.jpeg";
import banner1 from "../Layouts/Img/banner1.jpg";
import slider1 from "../Layouts/Img/slider1.jpg";
import slider12 from "../Layouts/Img/slider1 2.jpeg";
import TrendingCarousel from "./Carousel";
import axios from "axios";
import { baseurl } from "../../Constant/Base";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Clock, Shield, Truck, Award, Sparkles, Zap, Heart, Grid, Package, Store } from "lucide-react";

const PRIORITY_CATEGORY_NAMES = ["MEN", "WOMEN", "GADGETS", "HOME-KITCHEN", "KIDS"];

const Hero = ({ onShopNowClick = () => {} }) => {
  interface Category {
    _id: string;
    name: string;
    image: string;
  }

  interface Seller {
    _id: string;
    name: string;
    Image?: string;
    profileImage?: string;
    description?: string;
    companyName?: string;
    city?: string;
    categories?: string[];
  }

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<any[]>([]);
  const [isHovering, setIsHovering] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingSellers, setLoadingSellers] = useState(true);
  const [loadingTrending, setLoadingTrending] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showWelcome, setShowWelcome] = useState(() => !sessionStorage.getItem('hasShownWelcome'));
  const [scrolled, setScrolled] = useState(false);
  const [trendingIndex, setTrendingIndex] = useState(0);

  const trendingScrollRef = useRef<HTMLDivElement>(null);
  const testimonialsScrollRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const api = axios.create({ baseURL: baseurl, timeout: 5000 });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (showWelcome) {
      const timer = setTimeout(() => {
        setShowWelcome(false);
        sessionStorage.setItem('hasShownWelcome', 'true');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showWelcome]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const heroSlides = [
    { image: fbbslide, heading: "Style Redefined", subheading: "Experience premium fashion crafted for the modern individual" },
    { image: isMobile ? slider12 : slider1, heading: "Timeless Collections", subheading: "Where heritage meets contemporary design" },
    { image: Hero2, heading: "Exclusive Creations", subheading: "Curated pieces for the discerning individual" }
  ];

  const [text] = useTypewriter({
    words: ["Elevate Your Style", "Discover Premium Fashion", "Curated Collections", "Timeless Design"],
    loop: true,
    delaySpeed: 2000,
    typeSpeed: 70,
    deleteSpeed: 50
  });

  useEffect(() => {
    if (isHovering) return;
    const timer = setInterval(() => setCurrentSlideIndex((prev) => (prev + 1) % heroSlides.length), 5000);
    return () => clearInterval(timer);
  }, [isHovering, heroSlides.length]);

  useEffect(() => {
    if (!isMobile || trendingProducts.length === 0) return;
    const CARD_WIDTH = 112 + 12;
    const timer = setInterval(() => {
      setTrendingIndex((prev) => {
        const next = (prev + 1) % trendingProducts.length;
        if (trendingScrollRef.current) {
          trendingScrollRef.current.scrollTo({ left: next * CARD_WIDTH, behavior: 'smooth' });
        }
        return next;
      });
    }, 2500);
    return () => clearInterval(timer);
  }, [isMobile, trendingProducts.length]);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const cachedCategories = localStorage.getItem('cachedCategories');
      const cachedTimestamp = localStorage.getItem('cachedCategoriesTimestamp');
      const now = Date.now();
      if (cachedCategories && cachedTimestamp && (now - parseInt(cachedTimestamp)) < 300000) {
        const parsed = JSON.parse(cachedCategories);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCategories(parsed);
          setLoadingCategories(false);
          return;
        }
      }
      const response = await api.get("/all-categories");
      if (response.data?.success && response.data.categories) {
        const active = response.data.categories;
        setCategories(active);
        if (active.length > 0) {
          localStorage.setItem('cachedCategories', JSON.stringify(active));
          localStorage.setItem('cachedCategoriesTimestamp', now.toString());
        }
      }
    } catch {
      const cached = localStorage.getItem('cachedCategories');
      if (cached) {
        try { setCategories(JSON.parse(cached)); } catch { localStorage.removeItem('cachedCategories'); }
      }
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchSellers = async () => {
    setLoadingSellers(true);
    try {
      const cachedSellers = localStorage.getItem('cachedSellers');
      const cachedTimestamp = localStorage.getItem('cachedSellersTimestamp');
      const now = Date.now();
      if (cachedSellers && cachedTimestamp && (now - parseInt(cachedTimestamp)) < 300000) {
        const parsed = JSON.parse(cachedSellers);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSellers(parsed);
          setLoadingSellers(false);
          return;
        }
      }
      const response = await api.get("/sellers");
      if (response.data?.success && response.data.sellers) {
        const activeSellers = response.data.sellers;
        setSellers(activeSellers);
        if (activeSellers.length > 0) {
          localStorage.setItem('cachedSellers', JSON.stringify(activeSellers));
          localStorage.setItem('cachedSellersTimestamp', now.toString());
        }
      }
    } catch {
      const cached = localStorage.getItem('cachedSellers');
      if (cached) {
        try { setSellers(JSON.parse(cached)); } catch { localStorage.removeItem('cachedSellers'); }
      }
    } finally {
      setLoadingSellers(false);
    }
  };

  const fetchTrendingProducts = async () => {
    setLoadingTrending(true);
    try {
      const cachedTrending = localStorage.getItem('cachedTrending');
      const cachedTimestamp = localStorage.getItem('cachedTrendingTimestamp');
      const now = Date.now();
      if (cachedTrending && cachedTimestamp && (now - parseInt(cachedTimestamp)) < 300000) {
        setTrendingProducts(JSON.parse(cachedTrending));
        setLoadingTrending(false);
        return;
      }
      const response = await api.get("/products?trending=true&limit=8");
      if (response.data?.success) {
        setTrendingProducts(response.data.products);
        localStorage.setItem('cachedTrending', JSON.stringify(response.data.products));
        localStorage.setItem('cachedTrendingTimestamp', now.toString());
      }
    } catch {
      const cached = localStorage.getItem('cachedTrending');
      if (cached) setTrendingProducts(JSON.parse(cached) as any[]);
    } finally {
      setLoadingTrending(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchSellers();
    fetchTrendingProducts();
  }, []);

  const bannerSlides = [
    { image: banner1, title: "PREMIUM TIMEPIECES", description: "Discover our collection of premium watches from leading brands." },
    { image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&h=600&fit=crop", title: "DESIGNER EYEWEAR", description: "Protect your eyes in style with our selection of designer sunglasses." },
    { image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&h=600&fit=crop", title: "PREMIUM ACCESSORIES", description: "Complete your look with our premium accessories collection." }
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentBannerIndex((prev) => (prev + 1) % bannerSlides.length), 6000);
    return () => clearInterval(timer);
  }, [bannerSlides.length]);

  const nextSlide = () => setCurrentSlideIndex((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrentSlideIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  const nextBannerSlide = () => setCurrentBannerIndex((prev) => (prev + 1) % bannerSlides.length);
  const prevBannerSlide = () => setCurrentBannerIndex((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/shop/category/${categoryId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSellerClick = (sellerId: string) => {
    navigate(`/shop/seller/${sellerId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShopNow = () => {
    navigate('/Shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (onShopNowClick) onShopNowClick();
  };

  const handleViewAllTrending = () => {
    navigate('/shop?trending=true');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPriorityCategories = (cats: Category[]): Category[] => {
    const priority: Category[] = [];
    const rest: Category[] = [];
    for (const name of PRIORITY_CATEGORY_NAMES) {
      const found = cats.find(c => c.name.toUpperCase() === name);
      if (found) priority.push(found);
    }
    for (const cat of cats) {
      if (!priority.find(p => p._id === cat._id)) rest.push(cat);
    }
    return [...priority, ...rest];
  };

  const orderedCategories = getPriorityCategories(categories);
  const displayCategories = orderedCategories.slice(0, 6);
  const displaySellers = sellers.slice(0, 8);

  const features = [
    { icon: <Truck className="w-5 h-5" />, title: "Worldwide Shipping", description: "Free on orders above $500" },
    { icon: <Clock className="w-5 h-5" />, title: "24/7 Support", description: "Dedicated consultants" },
    { icon: <Shield className="w-5 h-5" />, title: "Authenticity", description: "100% genuine products" },
    { icon: <Award className="w-5 h-5" />, title: "Craftsmanship", description: "Fine materials" }
  ];

  const statistics = [
    { value: "150K+", label: "Happy Customers" },
    { value: "50+", label: "Premium Brands" },
    { value: "100+", label: "Countries" },
    { value: "12+", label: "Years" }
  ];

  const testimonials = [
    { name: "Sarah Johnson", role: "Fashion Influencer", content: "The quality and craftsmanship are exceptional.", rating: 5 },
    { name: "Michael Chen", role: "Style Collector", content: "FBB's commitment to quality is impressive.", rating: 5 },
    { name: "Emma Williams", role: "Style Editor", content: "FBB has redefined my shopping experience.", rating: 5 }
  ];

  return (
    <div className="relative overflow-hidden">
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 bg-black z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center px-4"
            >
              <h1 className="text-white text-2xl md:text-5xl font-light tracking-widest mb-2">
                WELCOME TO <span className="font-bold text-gold-400">FBB</span>
              </h1>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="relative w-full h-[420px] sm:h-[550px] md:h-[700px] lg:h-[800px] overflow-hidden group"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={currentSlideIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <img
              src={heroSlides[currentSlideIndex].image}
              alt={heroSlides[currentSlideIndex].heading}
              className="w-full h-full object-cover object-center"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          </motion.div>
        </AnimatePresence>

        <button className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 bg-black/40 backdrop-blur-sm text-white p-2 rounded-full z-10 hover:bg-black/60 transition-all" onClick={prevSlide}>
          <FiChevronLeft size={isMobile ? 16 : 20} />
        </button>
        <button className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 bg-black/40 backdrop-blur-sm text-white p-2 rounded-full z-10 hover:bg-black/60 transition-all" onClick={nextSlide}>
          <FiChevronRight size={isMobile ? 16 : 20} />
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlideIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${currentSlideIndex === index ? "w-6 bg-gold-400" : "w-1.5 bg-white/50"}`}
            />
          ))}
        </div>

        <div className="relative h-full flex items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-xl">
            <h1 className="text-white text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold mb-3 leading-tight">
              <span>{text}</span>
              <Cursor cursorColor='#D4AF37' />
            </h1>
            <p className="text-gray-200 text-sm md:text-base mb-6 max-w-lg hidden sm:block">
              Discover curated collections that blend timeless elegance with contemporary design.
            </p>
            <div className="flex flex-row gap-2 sm:gap-3">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleShopNow}
                className="bg-gold-400 text-black px-4 sm:px-6 py-2.5 md:py-3 rounded-sm text-sm md:text-base font-semibold hover:bg-gold-500 transition-colors flex items-center gap-2"
              >
                SHOP NOW <FiArrowRight size={14} />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/about')}
                className="bg-transparent border border-white text-white hover:bg-white hover:text-black px-4 sm:px-6 py-2.5 md:py-3 rounded-sm text-sm md:text-base font-semibold transition-all"
              >
                OUR STORY
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="bg-black py-5 md:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex md:grid md:grid-cols-4 gap-0 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
            {statistics.map((stat, index) => (
              <div key={index} className="text-center flex-shrink-0 w-[40vw] sm:w-auto snap-start px-3 md:px-0 border-r border-gray-700 last:border-r-0">
                <div className="text-xl md:text-3xl font-bold text-gold-400 mb-0.5">{stat.value}</div>
                <div className="text-gray-400 text-xs md:text-sm whitespace-nowrap">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {(sellers.length > 0 || loadingSellers) && (
        <div className="py-7 md:py-12 bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-5 md:mb-8">
              <div>
                <div className="flex items-center gap-2">
                  <Store className="w-5 h-5 md:w-6 md:h-6 text-gold-400" />
                  <h2 className="text-lg md:text-3xl font-bold text-gray-900">Our Sellers</h2>
                </div>
                <div className="w-10 h-0.5 bg-gold-400 mt-1.5" />
              </div>
              {sellers.length > 0 && (
                <button
                  onClick={() => { navigate('/seller-list'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="text-xs md:text-sm text-gold-400 font-medium hover:underline flex items-center gap-1"
                >
                  View All <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
                </button>
              )}
            </div>

            {loadingSellers ? (
              <div className="flex gap-6 md:gap-10 overflow-x-auto scrollbar-hide pb-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-200 animate-pulse" />
                    <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex gap-6 md:gap-10 overflow-x-auto scrollbar-hide pb-3 snap-x snap-mandatory -mx-4 px-4">
                {displaySellers.map((seller, index) => {
                  const sellerImage = seller.Image || seller.profileImage;
                  const initials = seller.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'S';
                  return (
                    <motion.div
                      key={seller._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.06 }}
                      className="flex-shrink-0 snap-start flex flex-col items-center gap-2.5 cursor-pointer group"
                      onClick={() => handleSellerClick(seller._id)}
                    >
                      <div className="relative">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-[3px] border-gray-100 group-hover:border-gold-400 transition-all duration-300 shadow-md bg-gold-400/10 flex items-center justify-center">
                          {sellerImage ? (
                            <img
                              src={sellerImage}
                              alt={seller.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              loading="lazy"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <span className="text-gold-400 font-bold text-2xl md:text-3xl">{initials}</span>
                          )}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 md:w-6 md:h-6 bg-green-400 rounded-full border-2 border-white" />
                      </div>
                      <p className="text-xs md:text-sm font-medium text-gray-800 text-center max-w-[96px] md:max-w-[128px] truncate group-hover:text-gold-400 transition-colors">
                        {seller.companyName || seller.name}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="py-10 md:py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8 md:mb-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Grid className="w-5 h-5 md:w-6 md:h-6 text-gold-400" />
                <h2 className="text-xl md:text-3xl font-bold text-gray-900">Shop by Category</h2>
              </div>
              <div className="w-12 h-0.5 bg-gold-400 mt-1.5" />
              <p className="text-gray-500 text-sm mt-2">Browse our curated selection of premium categories</p>
            </div>
            {categories.length > 0 && (
              <button onClick={handleShopNow} className="text-xs md:text-sm text-gold-400 font-medium hover:underline flex items-center gap-1 border border-gold-400/30 px-3 py-1.5 rounded-full hover:bg-gold-400/5 transition-all">
                View All <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
              </button>
            )}
          </div>

          {loadingCategories ? (
            <>
              <div className="flex gap-3 md:hidden overflow-x-auto scrollbar-hide pb-2">
                {[...Array(5)].map((_, i) => <div key={i} className="flex-shrink-0 w-36 h-48 bg-gray-200 rounded-2xl animate-pulse" />)}
              </div>
              <div className="hidden md:grid md:grid-cols-4 gap-5">
                {[...Array(4)].map((_, i) => <div key={i} className="bg-gray-200 rounded-2xl h-96 animate-pulse" />)}
              </div>
            </>
          ) : categories.length > 0 ? (
            <>
              <div className="flex gap-3 md:hidden overflow-x-auto scrollbar-hide pb-3 snap-x snap-mandatory -mx-4 px-4">
                {displayCategories.map((category, index) => (
                  <motion.div
                    key={category._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.06 }}
                    className="flex-shrink-0 w-36 snap-start cursor-pointer"
                    onClick={() => handleCategoryClick(category._id)}
                  >
                    <div className="relative rounded-2xl overflow-hidden h-48 shadow-md active:scale-95 transition-transform duration-150 border border-gray-100">
                      <img
                        src={category.image || "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=300&h=300&fit=crop"}
                        alt={category.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=300&h=300&fit=crop"; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                      <div className="absolute top-2 left-2">
                        <div className="bg-gold-400/90 backdrop-blur-sm px-2 py-0.5 rounded-full">
                          <span className="text-black text-[10px] font-bold uppercase tracking-wide">{category.name}</span>
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-white text-sm font-bold leading-tight">{category.name}</p>
                        <p className="text-gold-400 text-xs mt-0.5 flex items-center gap-0.5">
                          Shop <ArrowRight className="w-2.5 h-2.5" />
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
                {displayCategories.slice(0, 4).map((category, index) => (
                  <motion.div
                    key={category._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="group cursor-pointer"
                    onClick={() => handleCategoryClick(category._id)}
                  >
                    <div className="relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
                      <div className="relative h-80 lg:h-96 overflow-hidden">
                        <img
                          src={category.image || "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=600&h=500&fit=crop"}
                          alt={category.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=600&h=500&fit=crop"; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-70 group-hover:opacity-80 transition-opacity duration-300" />
                        <div className="absolute top-4 left-4">
                          <div className="bg-gold-400/90 backdrop-blur-sm px-3 py-1 rounded-full">
                            <span className="text-black text-xs font-semibold uppercase tracking-wide">{category.name}</span>
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-5 text-white transform transition-transform duration-300 group-hover:translate-y-[-4px]">
                          <h3 className="text-xl md:text-2xl font-bold mb-2">{category.name}</h3>
                          <div className="flex items-center text-gold-400 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <span>Shop Now</span>
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {displayCategories.length > 4 && (
                <div className="hidden md:grid md:grid-cols-2 gap-5 mt-5">
                  {displayCategories.slice(4, 6).map((category, index) => (
                    <motion.div
                      key={category._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="group cursor-pointer"
                      onClick={() => handleCategoryClick(category._id)}
                    >
                      <div className="relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 flex h-40">
                        <div className="w-48 flex-shrink-0 overflow-hidden">
                          <img
                            src={category.image || "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=300&h=200&fit=crop"}
                            alt={category.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                          />
                        </div>
                        <div className="flex-1 p-5 flex flex-col justify-between bg-white">
                          <div>
                            <div className="inline-block bg-gold-400/10 px-2 py-0.5 rounded-full mb-2">
                              <span className="text-gold-500 text-xs font-semibold uppercase tracking-wide">{category.name}</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">{category.name}</h3>
                          </div>
                          <div className="flex items-center text-gold-400 font-medium text-sm group-hover:gap-2 gap-1 transition-all">
                            <span>Shop Now</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-10">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No categories available</p>
            </div>
          )}
        </div>
      </div>

      {(trendingProducts.length > 0 || loadingTrending) && (
        <div className="py-10 md:py-14 bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-5 h-5 text-gold-400" />
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">Trending Now</h2>
                </div>
                <div className="w-12 h-0.5 bg-gold-400 mt-1" />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-gold-400 bg-gold-400/10 px-2 py-1 rounded-full">
                  <Zap className="w-3 h-3" />
                  <span className="text-xs font-medium">HOT</span>
                </div>
                <button onClick={handleViewAllTrending} className="text-xs md:text-sm text-gold-400 font-medium hover:underline flex items-center gap-1 border border-gold-400/30 px-3 py-1.5 rounded-full hover:bg-gold-400/5 transition-all">
                  View All <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
                </button>
              </div>
            </div>

            {loadingTrending ? (
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                {[...Array(5)].map((_, i) => <div key={i} className="flex-shrink-0 w-36 md:w-48 bg-gray-100 rounded-2xl h-44 md:h-60 animate-pulse" />)}
              </div>
            ) : (
              <>
                <div
                  ref={trendingScrollRef}
                  className="flex gap-3 md:hidden overflow-x-auto scrollbar-hide pb-3 snap-x snap-mandatory -mx-4 px-4"
                >
                  {trendingProducts.map((product: any, index) => {
                    const imgSrc = product.images?.[0] || product.image || "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=300&h=300&fit=crop";
                    return (
                      <motion.div
                        key={product._id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="flex-shrink-0 w-36 snap-start cursor-pointer"
                        onClick={() => handleProductClick(product._id)}
                      >
                        <div className="relative rounded-2xl overflow-hidden h-44 shadow-md active:scale-95 transition-transform duration-150 border border-gray-100">
                          <img
                            src={imgSrc}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=300&h=300&fit=crop"; }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                          <div className="absolute top-2 right-2">
                            <div className="bg-gold-400 rounded-full w-6 h-6 flex items-center justify-center">
                              <Zap className="w-3 h-3 text-black" />
                            </div>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <p className="text-white text-xs font-semibold leading-tight line-clamp-1">{product.name}</p>
                            {product.price && (
                              <p className="text-gold-400 text-sm font-bold mt-0.5">${product.price}</p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {isMobile && trendingProducts.length > 0 && (
                  <div className="flex justify-center gap-1 mt-2.5 md:hidden">
                    {trendingProducts.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 rounded-full transition-all duration-300 ${i === trendingIndex ? 'w-4 bg-gold-400' : 'w-1 bg-gray-300'}`}
                      />
                    ))}
                  </div>
                )}

                <div className="hidden md:block">
                  <TrendingCarousel products={trendingProducts} />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="py-10 md:py-14 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Why Choose FBB</h2>
            <div className="w-12 h-0.5 bg-gold-400 mx-auto mt-2 mb-1" />
            <p className="text-gray-500 text-sm">Premium experience, every step of the way</p>
          </div>
          <div className="flex md:grid md:grid-cols-4 gap-4 md:gap-6 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory -mx-4 md:mx-0 px-4 md:px-0">
            {features.map((feature, index) => (
              <div key={index} className="flex-shrink-0 w-48 md:w-auto snap-start text-center p-5 bg-white md:bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-gold-400/30 hover:shadow-md transition-all duration-300">
                <div className="w-12 h-12 rounded-2xl bg-gold-400/10 flex items-center justify-center text-gold-400 mx-auto mb-3">
                  {feature.icon}
                </div>
                <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-gray-500 text-xs md:text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="hidden md:block relative py-12 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="relative h-[320px] md:h-[380px] rounded-2xl overflow-hidden">
              <AnimatePresence initial={false}>
                <motion.div
                  key={currentBannerIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  <img src={bannerSlides[currentBannerIndex].image} alt={bannerSlides[currentBannerIndex].title} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
                </motion.div>
              </AnimatePresence>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                <button onClick={prevBannerSlide} className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all">
                  <ChevronLeft className="w-4 h-4 text-white" />
                </button>
                <button onClick={nextBannerSlide} className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all">
                  <ChevronRight className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={currentBannerIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.5 }}>
                <div className="w-12 h-0.5 bg-gold-400 mb-4" />
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">{bannerSlides[currentBannerIndex].title}</h3>
                <p className="text-gray-300 mb-6 text-sm md:text-base leading-relaxed">{bannerSlides[currentBannerIndex].description}</p>
                <button onClick={handleShopNow} className="text-gold-400 font-medium flex items-center gap-2 text-sm hover:gap-4 transition-all group">
                  Explore Collection <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="py-10 md:py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <Heart className="w-7 h-7 text-gold-400 mx-auto mb-2" />
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Customer Stories</h2>
            <div className="w-12 h-0.5 bg-gold-400 mx-auto mt-2" />
          </div>
          <div
            ref={testimonialsScrollRef}
            className="flex md:grid md:grid-cols-3 gap-4 md:gap-6 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory -mx-4 md:mx-0 px-4 md:px-0"
          >
            {testimonials.map((testimonial, index) => (
              <div key={index} className="flex-shrink-0 w-[75vw] sm:w-72 md:w-auto snap-start bg-gray-50 p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-gold-400/20 hover:shadow-md transition-all duration-300">
                <div className="flex mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => <RiStarFill key={i} className="text-gold-400 w-4 h-4" />)}
                </div>
                <p className="text-gray-600 italic text-sm md:text-base mb-4 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold-400/10 flex items-center justify-center text-gold-400 font-bold text-sm flex-shrink-0">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{testimonial.name}</h4>
                    <p className="text-gray-500 text-xs">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative py-12 md:py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
        <div className="relative z-10 max-w-xl mx-auto px-4 text-center">
          <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-gold-400 mx-auto mb-3" />
          <h2 className="text-xl md:text-3xl font-bold text-white mb-2">Join Our Community</h2>
          <div className="w-12 h-0.5 bg-gold-400 mx-auto mb-3" />
          <p className="text-gray-300 mb-6 text-sm md:text-base">Get exclusive previews and special offers</p>
          <div className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-grow px-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl text-white placeholder-gray-400 text-sm focus:outline-none focus:border-gold-400 transition-colors"
            />
            <button className="px-6 py-3 bg-gold-400 text-black font-bold rounded-xl text-sm hover:bg-gold-500 transition-colors whitespace-nowrap">
              SUBSCRIBE
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {scrolled && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-5 right-4 w-10 h-10 bg-black rounded-full flex items-center justify-center shadow-lg z-40 hover:bg-gray-800 transition-colors"
          >
            <RiStarFill className="text-gold-400 text-sm" />
          </motion.button>
        )}
      </AnimatePresence>

      <style>{`
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </div>
  );
};

export default Hero;