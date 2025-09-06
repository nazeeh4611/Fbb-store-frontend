import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { baseurl } from "../../Constant/Base";
import NavBar from "../Layouts/Navbar";
import Footer from "../Layouts/Footer";
import { motion } from "framer-motion";
import { Search, ChevronRight, ArrowRight } from "lucide-react";

interface Category {
  name: string;
  image: string;
  _id: string;
  description?: string;
  itemCount?: number;
}

const CategoryPages: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const navigate = useNavigate();

  const api = axios.create({
    baseURL: baseurl
  });

  const {id} = useParams()
  console.log(id,"the id will be here")

  const getCategory = async () => {
    try {
      const response = await api.get(`/get-category/${id}`);
      const enhancedCategories = response.data.map((cat: Category) => ({
        ...cat,
        description: `Explore our exclusive ${cat.name.toLowerCase()} collection`,
        itemCount: Math.floor(Math.random() * 50) + 20
      }));
      setCategories(enhancedCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    getCategory();
  }, []);

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedCategories = showAll ? filteredCategories : filteredCategories.slice(0, 4);

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setTimeout(() => {
      navigate(`/seller-list/${id}/category/${categoryId}/`);
    }, 300);
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <NavBar />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-96 overflow-hidden"
      >
        <div className="absolute inset-0 bg-black">
          <img
            src="/images/luxury-banner.jpg"
            alt="Luxury Fashion"
            className="w-full h-full object-cover opacity-70"
          />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl font-light mb-4"
          >
            ELEVATE YOUR LIFESTYLE
          </motion.h1>
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl font-light max-w-2xl"
          >
            Discover a curated collection of fashion, home essentials, and kitchen accessories
          </motion.p>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-full shadow-xl p-4 mb-12 max-w-2xl mx-auto"
        >
          <div className="flex items-center">
            <Search className="w-5 h-5 text-gray-400 mr-3" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-none focus:outline-none text-gray-800 placeholder-gray-400"
            />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {displayedCategories.map((category, index) => (
            <motion.div
              key={category._id}
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className={`bg-white rounded-lg overflow-hidden shadow-lg transform transition-all duration-300 ${
                selectedCategory === category._id ? 'scale-95 opacity-50' : ''
              }`}
            >
              <div
                className="relative group cursor-pointer"
                onClick={() => handleCategoryClick(category._id)}
              >
                <div className="relative h-80">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                </div>

                {/* Mobile Details (Always Visible) */}
                <div className="md:hidden absolute bottom-0 left-0 right-0 p-6 text-white bg-gradient-to-t from-black/80 to-transparent">
                  <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                  <p className="text-sm opacity-90">{category.description}</p>
                  <div className="mt-4 flex items-center text-sm">
                    <span>{category.itemCount} Items</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </div>

                {/* Desktop Details (Hover to Show) */}
                <div className="hidden md:block absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/80 to-transparent">
                  <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                  <p className="text-sm opacity-90">{category.description}</p>
                  <div className="mt-4 flex items-center text-sm">
                    <span>{category.itemCount} Items</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {categories.length > 4 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex justify-center mb-20"
          >
            <button
              onClick={() => setShowAll(!showAll)}
              className="group relative overflow-hidden rounded-full px-8 py-3 bg-black text-white hover:bg-gray-900 transition-colors duration-300"
            >
              <span className="relative z-10 flex items-center">
                {showAll ? 'Show Less' : 'View More Collections'}
                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </button>
          </motion.div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CategoryPages;