import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { baseurl } from "../../Constant/Base";
import NavBar from "../Layouts/Navbar";
import Footer from "../Layouts/Footer";
import { motion } from "framer-motion";
import { Search, ChevronRight, ArrowRight, Store, Phone, Mail, Tag } from "lucide-react";

interface Seller {
  _id: string;
  name: string;
  email: string;
  phone: string;
  Image: string;
  categories: string[];
  DXB?: string;
  INR?: string;
  status: boolean;
  createdAt: string;
}

const SellerPages: React.FC = () => {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeller, setSelectedSeller] = useState<string | null>(null);
  const [loadingSellers, setLoadingSellers] = useState(false);
  const navigate = useNavigate();

  const api = axios.create({
    baseURL: baseurl
  });

  const getSellers = async() => {
    setLoadingSellers(true);
    try {
      const response = await api.get("/get-sellers");
      if(response && response.data) {
        // Filter to only show verified sellers (status: true)
        const verifiedSellers = response.data.filter((seller: Seller) => seller.status === true);
        setSellers(verifiedSellers);
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

  const filteredSellers = sellers.filter(seller =>
    seller.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedSellers = showAll ? filteredSellers : filteredSellers.slice(0, 4);

  const handleSellerClick = (sellerId: string) => {
    setSelectedSeller(sellerId);
    setTimeout(() => {
      navigate(`/seller-list/${sellerId}`);
    }, 300);
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
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
            src="/images/marketplace-banner.jpg"
            alt="Premium Marketplace"
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
            MEET OUR VERIFIED SELLERS
          </motion.h1>
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl font-light max-w-2xl"
          >
            Discover trusted partners offering premium products and exceptional service
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
              placeholder="Search sellers by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-none focus:outline-none text-gray-800 placeholder-gray-400"
            />
          </div>
        </motion.div>

        {loadingSellers ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {displayedSellers.map((seller, index) => (
                <motion.div
                  key={seller._id}
                  initial="hidden"
                  animate="visible"
                  variants={fadeInUp}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className={`bg-white rounded-lg overflow-hidden shadow-lg transform transition-all duration-300 ${
                    selectedSeller === seller._id ? 'scale-95 opacity-50' : ''
                  }`}
                >
                  <div
                    className="relative group cursor-pointer"
                    onClick={() => handleSellerClick(seller._id)}
                  >
                    <div className="relative h-64">
                      <img
                        src={seller.Image || "/images/default-seller.jpg"}
                        alt={seller.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/images/default-seller.jpg";
                        }}
                      />
                      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                      
                      <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        Verified
                      </div>
                    </div>

                    <div className="p-6 bg-white">
                      <h3 className="text-xl font-semibold mb-2 text-gray-900">{seller.name}</h3>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-gray-600">
                          <Mail className="w-4 h-4 mr-2" />
                          <span className="text-sm truncate">{seller.email}</span>
                        </div>
                        
                        <div className="flex items-center text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          <span className="text-sm">{seller.phone}</span>
                        </div>
                        
                        <div className="flex items-center text-gray-600">
                          <Tag className="w-4 h-4 mr-2" />
                          <span className="text-sm">{seller.categories?.length || 0} Categories</span>
                        </div>
                        
                        <div className="flex items-center text-gray-500 text-xs">
                          <Store className="w-3 h-3 mr-1" />
                          <span>Since {formatDate(seller.createdAt)}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                        <span className="text-sm font-medium text-gray-900">View Profile</span>
                        <ArrowRight className="w-4 h-4 text-gray-900 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {sellers.length > 4 && (
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
                    {showAll ? 'Show Less' : 'View All Sellers'}
                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </button>
              </motion.div>
            )}
            
            {filteredSellers.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16">
                <Store className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-700 mb-2">No Sellers Found</h3>
                <p className="text-gray-500">Try adjusting your search criteria</p>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default SellerPages;