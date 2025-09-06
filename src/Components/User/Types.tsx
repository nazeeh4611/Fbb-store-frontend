import axios from "axios";
import React, { useEffect, useState } from "react";
import { baseurl } from "../../Constant/Base";
import { useNavigate, useParams } from "react-router-dom";

interface Category {
  name: string;
  image: string;
  _id:string
}

interface BannerSlide {
  title: string;
  image: string;
  description: string;
  accent: string;
}



const bannerSlides: BannerSlide[] = [
  {
    title: "Exclusive Offers",
    image: "/images/banner1.jpg",
    description: "Get the best deals on your favorite products.",
    accent: "#FF5733",
  },
  {
    title: "New Arrivals",
    image: "/images/banner2.jpg",
    description: "Check out our latest collections.",
    accent: "#3498DB",
  },
];



const Types : React.FC = () => {
  const [currentBannerIndex] = useState(0);
  const [categories,setCategories] = useState<Category[]>([])
  const navigate = useNavigate()
  const api = axios.create({
    baseURL:baseurl
  })

  const {category} = useParams()


  const getCategory = async()=>{
    try {
        const id = category
        const response = await api.get(`/get-type/${id}`)
        console.log(response.data,"may here")
        setCategories(response.data)
    } catch (error) {
        
    }
  }


  const handlecategoryClick = (categoryId:string)=>{
    navigate(`/products/${categoryId}`)

  }

  useEffect(()=>{
    getCategory();
  })


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
      {/* Title */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900">Select Category</h2>
        <p className="mt-2 text-gray-600">Choose from our premium collection</p>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {categories.map((category, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-105"
          >
            <div className="relative h-96" onClick={()=>handlecategoryClick(category._id)}>
              <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/10 transition-opacity hover:opacity-0" />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
              <p className="text-sm text-gray-600">{category.name} Products</p>
            </div>
          </div>
        ))}
      </div>

      {/* View More Button */}
      <div className="flex justify-center mb-16">
        <button className="group relative overflow-hidden bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-all duration-300">
          <span className="relative z-10">View More Categories</span>
          <div className="absolute inset-0 bg-gray-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
        </button>
      </div>

      {/* Banner Section */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-12 lg:space-x-16 relative">
          {/* Banner Image */}
          <div className="w-full md:w-1/2 relative h-[600px]">
            <div className="overflow-hidden rounded-lg shadow-lg h-full">
              {bannerSlides.map((slide, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    currentBannerIndex === index ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Banner Content */}
          <div className="w-full md:w-1/2 mt-8 md:mt-0">
            <div className="transition-all duration-500 transform">
              <h2 className="text-3xl lg:text-4xl font-bold leading-tight mb-4">
                <span style={{ color: bannerSlides[currentBannerIndex].accent }}>
                  {bannerSlides[currentBannerIndex].title}
                </span>
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                {bannerSlides[currentBannerIndex].description}
              </p>
              <button
                className="inline-flex items-center border-b-2 border-black pb-1 font-medium transition-all hover:border-[#8B4513] hover:text-[#8B4513]"
                style={{ borderColor: bannerSlides[currentBannerIndex].accent }}
              >
                VIEW MORE
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Types;
