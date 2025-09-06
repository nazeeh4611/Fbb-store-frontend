import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { baseurl } from "../../Constant/Base";
import NavBar from "../Layouts/Navbar";
import Footer from "../Layouts/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Grid, Rows, ArrowRight } from "lucide-react";

interface Category {
  name: string;
  image: string;
  _id: string;
  description?: string;
  itemCount?: number;
}

const Subcategory: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewStyle, setViewStyle] = useState<"grid" | "rows">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const navigate = useNavigate();
  const { category } = useParams();
  const {seller} = useParams()


  const api = axios.create({
    baseURL: baseurl
  });

  const getCategory = async () => {
    if (!category) return;
    setIsLoading(true);
    try {
      const response = await api.get(`/get-subcategory/${seller}/${category}`,);
      const enhancedData = response.data.map((cat: Category) => ({
        ...cat,
        description: `Explore our curated selection of ${cat.name.toLowerCase()}`,
        itemCount: Math.floor(Math.random() * 50) + 20
      }));
      setCategories(enhancedData);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getCategory();
  }, [category]);

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    navigate(`/products/${seller}/${category}/${categoryId}`);
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <NavBar isTransparent={false} />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative h-64 overflow-hidden bg-black mt-16"
      >
        <motion.div 
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <img 
            src="/images/subcategory-banner.jpg" 
            alt="Category Banner"
            className="w-full h-full object-cover opacity-60"
          />
        </motion.div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
          <motion.h1 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-5xl font-light mb-4"
          >
            Refined Collections
          </motion.h1>
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-xl mt-6"
          >
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search collections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-14 py-4 rounded-full bg-white/90 backdrop-blur-sm text-black text-sm border-none focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <div className="absolute right-2 flex items-center gap-2">
                <button 
                  onClick={() => setViewStyle("grid")}
                  className={`p-1.5 rounded-lg transition-colors ${viewStyle === "grid" ? "bg-black text-white" : "bg-gray-200 text-gray-600"}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewStyle("rows")}
                  className={`p-1.5 rounded-lg transition-colors ${viewStyle === "rows" ? "bg-black text-white" : "bg-gray-200 text-gray-600"}`}
                >
                  <Rows className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence>
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center items-center min-h-[400px]"
            >
              <div className="w-16 h-16 relative">
                <div className="absolute inset-0 border-2 border-gray-200 rounded-full"></div>
                <div className="absolute inset-0 border-2 border-black rounded-full animate-spin border-t-transparent"></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!isLoading && (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={viewStyle === "grid" ? 
              "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16" : 
              "space-y-6 mb-16"
            }
          >
            {filteredCategories.map((category) => (
              <motion.div
                key={category._id}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                className={`bg-white rounded-xl overflow-hidden shadow-lg ${
                  selectedCategory === category._id ? 'scale-95 opacity-50' : ''
                }`}
                onClick={() => handleCategoryClick(category._id)}
              >
                <div className="relative group cursor-pointer">
                  <div className={`relative ${viewStyle === "grid" ? "h-64" : "h-48"}`}>
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="w-full h-full object-contain bg-gray-50"
                    />
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                  </div>
                  
                  {/* Mobile Details (Always Visible) */}
                  <div className="block md:hidden p-4 bg-white">
                    <h3 className="text-lg font-semibold mb-1">{category.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{category.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{category.itemCount} Items</span>
                      <ArrowRight className="w-4 h-4 text-black" />
                    </div>
                  </div>

                  {/* Desktop Details (Hover to Show) */}
                  <div className="hidden md:block absolute bottom-0 left-0 right-0 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-4 bg-white/95 backdrop-blur-sm">
                    <h3 className="text-lg font-semibold mb-1">{category.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{category.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{category.itemCount} Items</span>
                      <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {!isLoading && filteredCategories.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <p className="text-xl text-gray-600">No collections found matching your search.</p>
          </motion.div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Subcategory;