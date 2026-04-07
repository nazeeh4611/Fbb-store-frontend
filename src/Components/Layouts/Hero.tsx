import { useState, useEffect } from "react";
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
import {  useNavigate } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Clock, Shield, Truck, Award, Sparkles, Zap, Heart, Quote, Grid, Package } from "lucide-react";

const Hero = ({ onShopNowClick = () => {} }) => {
  interface Category {
    _id: string;
    name: string;
    image: string;
  }
  
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [isHovering, setIsHovering] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingTrending, setLoadingTrending] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showWelcome, setShowWelcome] = useState(() => {
    return !sessionStorage.getItem('hasShownWelcome');
  });
  const [scrolled, setScrolled] = useState(false);

  const navigate = useNavigate();
  
  const api = axios.create({
    baseURL: baseurl,
    timeout: 5000,
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
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
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const heroSlides = [
    {
      image: fbbslide,
      heading: "Style Redefined",
      subheading: "Experience premium fashion crafted for the modern individual"
    },
    {
      image: isMobile ? slider12 : slider1,
      heading: "Timeless Collections",
      subheading: "Where heritage meets contemporary design"
    },
    {
      image: Hero2,
      heading: "Exclusive Creations",
      subheading: "Curated pieces for the discerning individual"
    }
  ];

  const [text] = useTypewriter({
    words: ["Elevate Your Style", "Discover Premium Fashion", "Curated Collections", "Timeless Design", "Exclusive Creations", "Redefine Your Wardrobe"],
    loop: true,
    delaySpeed: 2000,
    typeSpeed: 70,
    deleteSpeed: 50
  });

  useEffect(() => {
    if (isHovering) return;
    
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [isHovering, heroSlides.length]);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const cachedCategories = localStorage.getItem('cachedCategories');
      const cachedTimestamp = localStorage.getItem('cachedCategoriesTimestamp');
      const now = Date.now();
      
      if (
        cachedCategories &&
        cachedTimestamp &&
        (now - parseInt(cachedTimestamp)) < 300000
      ) {
        const parsedCategories = JSON.parse(cachedCategories);
      
        if (Array.isArray(parsedCategories) && parsedCategories.length > 0) {
          setCategories(parsedCategories);
          setLoadingCategories(false);
          return;
        }
      }
      
      const response = await api.get("/all-categories");
      if(response.data && response.data.success && response.data.categories) {
        const activeCategories = response.data.categories;
        setCategories(activeCategories);
        if (activeCategories.length > 0) {
          localStorage.setItem('cachedCategories', JSON.stringify(activeCategories));
          localStorage.setItem('cachedCategoriesTimestamp', now.toString());
        }
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      const cachedCategories = localStorage.getItem('cachedCategories');
      if (cachedCategories) {
        try {
          const parsedCategories = JSON.parse(cachedCategories);
          setCategories(parsedCategories);
        } catch (e) {
          localStorage.removeItem('cachedCategories');
          localStorage.removeItem('cachedCategoriesTimestamp');
        }
      }
    } finally {
      setLoadingCategories(false);
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
      
      if(response.data && response.data.success) {
        setTrendingProducts(response.data.products);
        localStorage.setItem('cachedTrending', JSON.stringify(response.data.products));
        localStorage.setItem('cachedTrendingTimestamp', now.toString());
      }
    } catch (error) {
      console.error("Error fetching trending products:", error);
      const cachedTrending = localStorage.getItem('cachedTrending');
      if (cachedTrending) {
        setTrendingProducts(JSON.parse(cachedTrending));
      }
    } finally {
      setLoadingTrending(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchTrendingProducts();
  }, []);

  const bannerSlides = [
    {
      image: banner1,
      title: "PREMIUM TIMEPIECES",
      description: "Discover our collection of premium watches from leading brands.",
      accent: "#D4AF37"
    },
    {
      image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&h=600&fit=crop",
      title: "DESIGNER EYEWEAR",
      description: "Protect your eyes in style with our selection of designer sunglasses.",
      accent: "#2C3E50"
    },
    {
      image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&h=600&fit=crop",
      title: "PREMIUM ACCESSORIES",
      description: "Complete your look with our premium accessories collection.",
      accent: "#1a1a1a"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % bannerSlides.length);
    }, 6000);

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

  const handleShopNow = () => {
    navigate('/Shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (onShopNowClick) onShopNowClick();
  };

  const handleViewAllTrending = () => {
    navigate('/shop?trending=true');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const displayCategories = categories.slice(0, 4);

  const features = [
    {
      icon: <Truck className="w-5 h-5 md:w-6 md:h-6" />,
      title: "Worldwide Shipping",
      description: "Free shipping on orders above $500"
    },
    {
      icon: <Clock className="w-5 h-5 md:w-6 md:h-6" />,
      title: "24/7 Support",
      description: "Dedicated consultants"
    },
    {
      icon: <Shield className="w-5 h-5 md:w-6 md:h-6" />,
      title: "Authenticity",
      description: "100% genuine products"
    },
    {
      icon: <Award className="w-5 h-5 md:w-6 md:h-6" />,
      title: "Craftsmanship",
      description: "Fine materials"
    }
  ];

  const statistics = [
    { value: "150K+", label: "Happy Customers" },
    { value: "50+", label: "Premium Brands" },
    { value: "100+", label: "Countries" },
    { value: "12+", label: "Years" }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Fashion Influencer",
      content: "The quality and craftsmanship are exceptional.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Style Collector",
      content: "FBB's commitment to quality is impressive.",
      rating: 5
    },
    {
      name: "Emma Williams",
      role: "Style Editor",
      content: "FBB has redefined my shopping experience.",
      rating: 5
    }
  ];

  const styleQuotes = [
    {
      quote: "Style is a way to say who you are without having to speak.",
      author: "Rachel Zoe"
    },
    {
      quote: "Fashion is the armor to survive the reality of everyday life.",
      author: "Bill Cunningham"
    },
    {
      quote: "The joy of dressing is an art.",
      author: "John Galliano"
    }
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
        className="relative w-full h-[450px] sm:h-[550px] md:h-[700px] lg:h-[800px] overflow-hidden group"
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
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
          </motion.div>
        </AnimatePresence>

        <button 
          className="absolute left-3 md:left-6 top-1/2 transform -translate-y-1/2 bg-black/40 backdrop-blur-sm text-white p-2 rounded-full z-10 hover:bg-black/60 transition-all"
          onClick={prevSlide}
        >
          <FiChevronLeft size={isMobile ? 16 : 20} />
        </button>
        
        <button 
          className="absolute right-3 md:right-6 top-1/2 transform -translate-y-1/2 bg-black/40 backdrop-blur-sm text-white p-2 rounded-full z-10 hover:bg-black/60 transition-all"
          onClick={nextSlide}
        >
          <FiChevronRight size={isMobile ? 16 : 20} />
        </button>

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlideIndex(index)}
              className={`h-1.5 rounded-full transition-all ${
                currentSlideIndex === index ? "w-6 bg-gold-400" : "w-1.5 bg-white/50"
              }`}
            />
          ))}
        </div>

        <div className="relative h-full flex items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-xl"
          >
            <h1 className="text-white text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold mb-3 leading-tight">
              <span>{text}</span>
              <Cursor cursorColor='#D4AF37' />
            </h1>

            <p className="text-gray-200 text-sm md:text-base mb-6 max-w-lg">
              Discover curated collections that blend timeless elegance with contemporary design.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleShopNow}
                className="bg-gold-400 text-black px-5 md:px-6 py-2 md:py-3 rounded-sm text-sm md:text-base font-semibold hover:bg-gold-500 transition-colors"
              >
                <span className="flex items-center justify-center">
                  SHOP NOW
                  <FiArrowRight className="ml-2" size={isMobile ? 14 : 18} />
                </span>
              </motion.button>
              
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/about')}
                className="bg-transparent border border-white text-white hover:bg-white hover:text-black px-5 md:px-6 py-2 md:py-3 rounded-sm text-sm md:text-base font-semibold transition-all"
              >
                OUR STORY
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Trending Now Section */}
      {trendingProducts.length > 0 && (
        <div className="py-8 md:py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 md:w-6 md:h-6 text-gold-400" />
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">Trending Now</h2>
                </div>
                <div className="w-12 h-0.5 bg-gold-400 mt-1" />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-gold-400 bg-gold-400/10 px-2 md:px-3 py-1 rounded-full">
                  <Zap className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="text-xs font-medium">HOT</span>
                </div>
                <button
                  onClick={handleViewAllTrending}
                  className="text-xs md:text-sm text-gold-400 font-medium hover:underline flex items-center gap-1"
                >
                  View All <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
                </button>
              </div>
            </div>

            {loadingTrending ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="bg-gray-100 rounded-lg overflow-hidden h-48 md:h-64 animate-pulse">
                    <div className="h-3/4 bg-gray-200" />
                    <div className="h-1/4 p-2 md:p-3">
                      <div className="h-3 bg-gray-200 rounded mb-1" />
                      <div className="h-2 bg-gray-200 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <TrendingCarousel products={trendingProducts} />
            )}
          </div>
        </div>
      )}

      {/* Shop by Category Section */}
      <div className="py-8 md:py-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Grid className="w-5 h-5 md:w-6 md:h-6 text-gold-400" />
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">Shop by Category</h2>
              </div>
              <div className="w-12 h-0.5 bg-gold-400 mt-1" />
            </div>
            {categories.length > 0 && (
              <button
                onClick={handleShopNow}
                className="text-xs md:text-sm text-gold-400 font-medium hover:underline flex items-center gap-1"
              >
                View All <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
              </button>
            )}
          </div>

          {loadingCategories ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg overflow-hidden h-32 md:h-40 animate-pulse shadow-sm">
                  <div className="h-full w-full bg-gray-200" />
                </div>
              ))}
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
              {displayCategories.map((category, index) => (
                <motion.div
                  key={category._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => handleCategoryClick(category._id)}
                >
                  <div className="relative h-32 md:h-40">
                    <img
                      src={category.image || "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=400&h=300&fit=crop"}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        const img = e.currentTarget as HTMLImageElement;
                        img.src = "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=400&h=300&fit=crop";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-all" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <h3 className="text-white font-semibold text-sm md:text-base truncate">{category.name}</h3>
                      <p className="text-gray-200 text-xs group-hover:text-gold-400 transition-colors">Shop Now →</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No categories available</p>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200">
        <div className="bg-black py-8 md:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {statistics.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-xl md:text-3xl lg:text-4xl font-bold text-gold-400 mb-1">{stat.value}</div>
                  <div className="text-gray-300 text-xs md:text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="py-8 md:py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Why Choose FBB</h2>
              <div className="w-12 h-0.5 bg-gold-400 mx-auto mt-2" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {features.map((feature, index) => (
                <div key={index} className="text-center p-3 md:p-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gold-400/10 flex items-center justify-center text-gold-400 mx-auto mb-2 md:mb-3">
                    {feature.icon}
                  </div>
                  <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-gray-600 text-xs md:text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative py-8 md:py-12 bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div className="relative h-[250px] md:h-[350px] rounded-xl overflow-hidden">
                <AnimatePresence initial={false}>
                  <motion.div
                    key={currentBannerIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0"
                  >
                    <img
                      src={bannerSlides[currentBannerIndex].image}
                      alt={bannerSlides[currentBannerIndex].title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
                  </motion.div>
                </AnimatePresence>
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  <button onClick={prevBannerSlide} className="p-1.5 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all">
                    <ChevronLeft className="w-4 h-4 text-white" />
                  </button>
                  <button onClick={nextBannerSlide} className="p-1.5 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all">
                    <ChevronRight className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentBannerIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{bannerSlides[currentBannerIndex].title}</h3>
                  <p className="text-gray-300 mb-4 text-sm md:text-base">{bannerSlides[currentBannerIndex].description}</p>
                  <button 
                    onClick={handleShopNow}
                    className="text-gold-400 font-medium flex items-center gap-2 text-sm hover:gap-3 transition-all"
                  >
                    Explore Collection <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="py-8 md:py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6">
              <Quote className="w-8 h-8 text-gold-400 mx-auto mb-2" />
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Style & Inspiration</h2>
              <div className="w-12 h-0.5 bg-gold-400 mx-auto mt-2" />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {styleQuotes.map((item, index) => (
                <div key={index} className="bg-white p-4 rounded-lg text-center shadow-sm">
                  <p className="text-gray-700 italic text-sm md:text-base mb-2">"{item.quote}"</p>
                  <p className="text-gray-500 text-xs md:text-sm">— {item.author}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="py-8 md:py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6">
              <Heart className="w-8 h-8 text-gold-400 mx-auto mb-2" />
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Customer Stories</h2>
              <div className="w-12 h-0.5 bg-gold-400 mx-auto mt-2" />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg shadow-sm">
                  <div className="flex mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <RiStarFill key={i} className="text-gold-400 w-4 h-4" />
                    ))}
                  </div>
                  <p className="text-gray-600 italic text-sm mb-3">"{testimonial.content}"</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gold-400/10 flex items-center justify-center text-gold-400 font-bold text-sm">
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

        <div className="relative py-10 md:py-14 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
          <div className="relative z-10 max-w-2xl mx-auto px-4 text-center">
            <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-gold-400 mx-auto mb-3" />
            <h2 className="text-xl md:text-3xl font-bold text-white mb-2">Join Our Community</h2>
            <div className="w-12 h-0.5 bg-gold-400 mx-auto mb-4" />
            <p className="text-gray-300 mb-5 text-sm md:text-base">
              Get exclusive previews and special offers
            </p>
            <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-grow px-4 py-2.5 bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:border-gold-400"
              />
              <button className="px-5 py-2.5 bg-gold-400 text-black font-bold rounded-lg text-sm hover:bg-gold-500 transition-colors">
                SUBSCRIBE
              </button>
            </div>
          </div>
        </div>
      </div>

      {scrolled && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-4 right-4 w-10 h-10 bg-black rounded-full flex items-center justify-center shadow-lg z-40 hover:bg-gray-800 transition-colors"
        >
          <RiStarFill className="text-gold-400 text-sm" />
        </motion.button>
      )}
    </div>
  );
};

export default Hero;