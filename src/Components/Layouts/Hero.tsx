import { useState, useEffect, useRef } from "react";
import { useTypewriter, Cursor } from 'react-simple-typewriter';
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowRight, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { RiStarFill } from "react-icons/ri";
import Hero2 from "../Layouts/Img/Hero2.jpg";
import fbbslide from "../Layouts/Img/fbbslide.jpeg"
import shoe from "../Layouts/Img/shoe.jpeg";
import glass from "../Layouts/Img/glass.jpeg";
import banner1 from "../Layouts/Img/banner1.jpg";
import slider1 from "../Layouts/Img/slider1.jpg";
import slider12 from "../Layouts/Img/slider1 2.jpeg";
import TrendingCarousel from "./Carousel";
import axios from "axios";
import { baseurl } from "../../Constant/Base";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

interface Seller {
  _id: string,
  name: string,
  Image: string,
  categories: string[],
  email: string,
  phone: string,
  status: boolean
}

const Hero = ({ onShopNowClick = () => {} }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [isHovering, setIsHovering] = useState(false);
  const [loadingSellers, setLoadingSellers] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);
  const [showWelcome, setShowWelcome] = useState(() => {
    const hasShownWelcome = sessionStorage.getItem('hasShownWelcome');
    return !hasShownWelcome;
  });

  const navigate = useNavigate();
  
  const api = axios.create({
    baseURL: baseurl
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
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
  
  const heroSlides = [
    {
      image: fbbslide,
      heading: "Premium Collection",
      subheading: "Luxury meets comfort"
    },
    {
      image: isMobile ? slider12 : slider1,
      heading: "Elevate Your Style",
      subheading: "Discover the latest fashion trends"
    },
    {
      image: Hero2,
      heading: "Exclusive Designs",
      subheading: "Stand out from the crowd"
    }
  ];

  const [text] = useTypewriter({
    words: ["Elevate Your Style", "Discover the latest fashion trends", "Premium Collection", "Luxury meets comfort", "Exclusive Designs", "Stand out from the crowd"],
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

  const handleSellerClick = (sellerId: string) => {
    navigate(`/seller-list/${sellerId}`);
  };

  const handleClick = () => {
    navigate("/seller-list");
  };
  
  const getSellers = async() => {
    setLoadingSellers(true);
    try {
      const response = await api.get("/get-sellers");
      if(response && response.data) {
        const activeSellers = response.data.filter((seller: Seller) => seller.status === true);
        setSellers(activeSellers);
      }
    } catch (error) {
      console.error("Error fetching sellers:", error);
    } finally {
      setLoadingSellers(false);
    }
  };
  
  useEffect(() => {
    getSellers();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (bannerRef.current) {
        const offset = window.scrollY;
        bannerRef.current.style.transform = `translateY(${offset * 0.1}px)`;
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const bannerSlides = [
    {
      image: banner1,
      title: "WATCHES FOR MEN & LADIES",
      description: "As an official stockist of all brands, we offer a wide selection of premium timepieces for both men and women.",
      accent: "#8B4513"
    },
    {
      image: glass,
      title: "DESIGNER SUNGLASSES",
      description: "Discover our exclusive collection of designer sunglasses featuring the latest trends and timeless classics.",
      accent: "#2C3E50"
    },
    {
      image: shoe,
      title: "PREMIUM FOOTWEAR",
      description: "Step into style with our curated selection of premium shoes for every occasion.",
      accent: "#34495E"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % bannerSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [bannerSlides.length]);

  const nextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const nextBannerSlide = () => {
    setCurrentBannerIndex((prev) => (prev + 1) % bannerSlides.length);
  };

  const prevBannerSlide = () => {
    setCurrentBannerIndex((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
  };

  const displaySellers = sellers.slice(0, 4);

  return (
    <div className="relative">
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
            >
              <h1 className="text-white text-3xl md:text-6xl font-light tracking-widest">
                WELCOME TO <span className="font-bold">LUXURY</span>
              </h1>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="hidden lg:block fixed top-0 bottom-0 left-8 w-px bg-gradient-to-b from-transparent via-[#D4AF37]/20 to-transparent z-10"></div>
      <div className="hidden lg:block fixed top-0 bottom-0 right-8 w-px bg-gradient-to-b from-transparent via-[#D4AF37]/20 to-transparent z-10"></div>

      <div 
        className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[800px] overflow-hidden group"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={currentSlideIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <img
              src={heroSlides[currentSlideIndex].image}
              alt={heroSlides[currentSlideIndex].heading}
              className="w-full h-full object-cover object-center transform scale-100 transition-transform duration-7000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40" />
            
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.1)_0%,_transparent_70%)]"></div>
          </motion.div>
        </AnimatePresence>

        <button 
          className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-2 md:p-3 rounded-full transition-all duration-300 hover:bg-white/30 z-10"
          onClick={prevSlide}
        >
          <FiChevronLeft size={20} />
        </button>
        
        <button 
          className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-2 md:p-3 rounded-full transition-all duration-300 hover:bg-white/30 z-10"
          onClick={nextSlide}
        >
          <FiChevronRight size={20} />
        </button>

        <div className="absolute bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlideIndex(index)}
              className={`h-1.5 md:h-2 rounded-full transition-all duration-300 ${
                currentSlideIndex === index ? "w-6 md:w-8 bg-[#D4AF37]" : "w-1.5 md:w-2 bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <div className="absolute top-4 md:top-8 left-4 md:left-8 w-12 md:w-16 h-12 md:h-16 border-l-2 border-t-2 border-[#D4AF37]/30"></div>
        <div className="absolute top-4 md:top-8 right-4 md:right-8 w-12 md:w-16 h-12 md:h-16 border-r-2 border-t-2 border-[#D4AF37]/30"></div>
        <div className="absolute bottom-4 md:bottom-8 left-4 md:left-8 w-12 md:w-16 h-12 md:h-16 border-l-2 border-b-2 border-[#D4AF37]/30"></div>
        <div className="absolute bottom-4 md:bottom-8 right-4 md:right-8 w-12 md:w-16 h-12 md:h-16 border-r-2 border-b-2 border-[#D4AF37]/30"></div>

        <div className="relative h-full flex items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-xl"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "60px" }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="h-px bg-[#D4AF37] mb-4 md:mb-6"
            ></motion.div>
            
            <h1 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-4 md:mb-6 min-h-[60px] md:min-h-[80px]">
              <span>{text}</span>
              <Cursor cursorColor='#D4AF37' />
            </h1>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onShopNowClick}
              className="bg-white/10 backdrop-blur-md text-white hover:bg-white hover:text-black px-6 md:px-8 py-2 md:py-3 rounded-full transition-all duration-300 text-base md:text-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4AF37] group border border-white/20 hover:border-[#D4AF37]"
            >
              <Link to="/category">
                <span className="flex items-center">
                  Shop Now
                  <FiArrowRight className="ml-2 transform transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </motion.button>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 md:mt-16 mb-12 md:mb-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-8 md:mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Our Featured Sellers</h2>
          <div className="w-16 md:w-24 h-1 bg-[#D4AF37] mx-auto mt-3 md:mt-4 mb-3 md:mb-4"></div>
          <p className="mt-2 text-sm md:text-base text-gray-600">Explore premium products from our trusted partners</p>
        </motion.div>

        {loadingSellers ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-gray-100 rounded-lg shadow-lg overflow-hidden h-64 md:h-96 animate-pulse">
                <div className="h-full w-full bg-gray-200"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            {displaySellers.map((seller, index) => (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-50px" }}
                key={index}
                className="bg-white rounded-lg shadow-lg overflow-hidden group"
              >
                <div 
                  className="relative h-64 md:h-96 cursor-pointer" 
                  onClick={() => handleSellerClick(seller._id)}
                >
                  <img
                    src={seller.Image || "https://via.placeholder.com/400x600?text=No+Image"}
                    alt={seller.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300" />
                  
                  <div className="absolute top-4 right-4 w-8 md:w-10 h-8 md:h-10 border-2 border-[#D4AF37]/40 rounded-full flex items-center justify-center">
                    <RiStarFill className="text-[#D4AF37]/70 text-xs md:text-sm" />
                  </div>
                  
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="bg-black/80 text-white px-4 md:px-6 py-2 rounded-sm font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 border-b border-[#D4AF37] text-sm md:text-base">
                      View Seller
                    </span>
                  </div>
                  
                  <div className="absolute bottom-4 md:bottom-6 left-0 right-0 text-center">
                    <h3 className="text-lg md:text-xl font-semibold text-white px-3 md:px-4 py-1.5 md:py-2 bg-black/50 backdrop-blur-sm inline-block">
                      {seller.name}
                    </h3>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="flex justify-center mb-8 md:mb-16">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative overflow-hidden bg-black text-white px-6 md:px-8 py-2 md:py-3 rounded-sm transition-all duration-300 border border-transparent hover:border-[#D4AF37] text-sm md:text-base"
            onClick={handleClick}
          >
            <span className="relative z-10 flex items-center">
              View All Sellers
              <FiArrowRight className="ml-2 transform transition-transform group-hover:translate-x-1" />
            </span>
            <div className="absolute inset-0 bg-[#D4AF37]/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
          </motion.button>
        </div>

        <section className="relative py-16 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-12 relative">
              <div className="w-full lg:w-1/2 h-[400px] lg:h-[600px] relative group">
                <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
                  <AnimatePresence initial={false}>
                    <motion.div
                      key={currentBannerIndex}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="relative w-full h-full"
                      ref={bannerRef}
                    >
                      <img
                        src={bannerSlides[currentBannerIndex].image}
                        alt={bannerSlides[currentBannerIndex].title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-transparent" />
                    </motion.div>
                  </AnimatePresence>

                  <div className="absolute top-6 left-6 w-16 h-16 border-l-2 border-t-2 border-white/30 rounded-tl-lg" />
                  <div className="absolute bottom-6 right-6 w-16 h-16 border-r-2 border-b-2 border-white/30 rounded-br-lg" />

                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-4 z-10">
                    <button
                      onClick={prevBannerSlide}
                      className="p-2 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-white hover:text-black transition-all duration-300"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextBannerSlide}
                      className="p-2 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-white hover:text-black transition-all duration-300"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="w-full lg:w-1/2 mt-8 lg:mt-0"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentBannerIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white p-8 lg:p-10 rounded-2xl shadow-xl relative"
                  >
                    <div 
                      className="absolute top-0 left-0 w-2 h-full rounded-l-2xl"
                      style={{ backgroundColor: bannerSlides[currentBannerIndex].accent }}
                    />
                    
                    <h2 className="text-4xl font-bold mb-6">
                      <span style={{ color: bannerSlides[currentBannerIndex].accent }}>
                        {bannerSlides[currentBannerIndex].title}
                      </span>
                    </h2>

                    <p className="text-gray-600 text-lg leading-relaxed mb-8">
                      {bannerSlides[currentBannerIndex].description}
                    </p>

                    <motion.button
                      whileHover={{ x: 5 }}
                      className="group inline-flex items-center space-x-2 text-lg font-semibold transition-colors duration-300"
                      style={{ color: bannerSlides[currentBannerIndex].accent }}
                    >
                      <span>Explore Now</span>
                      <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </motion.button>
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </section>
      </div>

      <div className="relative h-[400px] md:h-[600px] w-full overflow-hidden mb-8 md:mb-16 group">
        <motion.div 
          initial={{ scale: 1.1 }}
          whileInView={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          viewport={{ once: true }}
          className="absolute inset-0"
        >
          <img
            src={Hero2}
            alt="New Arrivals"
            className="w-full h-full object-cover transition-transform duration-10000 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40"></div>
        </motion.div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <motion.h2 
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl lg:text-7xl font-bold mb-6 md:mb-8 relative"
          >
            <span className="tracking-widest">NEW ARRIVALS</span>
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: '100%' }}
              transition={{ duration: 0.7, delay: 0.5 }}
              viewport={{ once: true }}
              className="absolute -bottom-3 md:-bottom-4 left-0 h-0.5 md:h-1 bg-[#D4AF37]"
            />
          </motion.h2>
          <motion.button
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onShopNowClick}
            className="bg-transparent text-white hover:bg-white hover:text-black px-6 md:px-8 py-2 md:py-3 border border-white hover:border-[#D4AF37] rounded-sm transition-all duration-300 text-sm md:text-lg font-medium group"
          >
            <Link to="/shop">
              <span className="flex items-center">
                SHOP NOW
                <FiArrowRight className="ml-2 transform transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </motion.button>
        </div>
        
        <div className="absolute top-4 md:top-8 left-4 md:left-16 w-12 md:w-20 h-12 md:h-20 border-l-2 border-t-2 border-[#D4AF37]/30"></div>
        <div className="absolute bottom-4 md:bottom-8 right-4 md:right-16 w-12 md:w-20 h-12 md:h-20 border-r-2 border-b-2 border-[#D4AF37]/30"></div>
      </div>
      
      <TrendingCarousel />
      
      <div
        className="fixed bottom-4 md:bottom-6 right-4 md:right-6 z-40 hidden md:flex items-center justify-center"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            duration: 0.5,
            delay: 3,
            scale: {
              type: "spring",
              stiffness: 100
            }
          }}
          whileHover={{ scale: 1.05 }}
          className="w-12 md:w-16 h-12 md:h-16 bg-white shadow-xl rounded-full flex items-center justify-center cursor-pointer"
        >
          <div className="w-10 md:w-14 h-10 md:h-14 rounded-full border-2 border-[#D4AF37] flex items-center justify-center group">
            <RiStarFill className="text-[#D4AF37] group-hover:scale-110 transition-transform text-sm md:text-base" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;