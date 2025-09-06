import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import fbb from "./Img/fbb.png";
// import axios from 'axios';
// import { baseurl } from '../../Constant/Base';
import { useNavigate } from 'react-router-dom';

interface NavItem {
  label: string;
  href: string;
  id?: string;
}

// interface Category {
//   name: string;
//   image: string;
//   _id: string;
// }

interface NavBarProps {
  isTransparent?: boolean;
}

const NavBar: React.FC<NavBarProps> = ({ isTransparent = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  // const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();
  
  // const api = axios.create({
  //   baseURL: baseurl
  // });

  // const getCategory = async () => {
  //   try {
  //     const response = await api.get("/get-category");
  //     // setCategories(response.data);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  useEffect(() => {
    // getCategory();
  }, []);

  // Combine fixed nav items with first 4 dynamic categories
  const navItems: NavItem[] = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Sell Product', href: '/seller/dashboard' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getBgColor = () => {
    if (!isTransparent) return 'bg-black';
    return isScrolled ? 'bg-black' : 'bg-transparent';
  };

  const handleNavClick = (href: string, id?: string) => {
    if (id) {
      navigate(href);
    } else {
      navigate(href);
    }
    setIsOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 h-20 ${getBgColor()}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <img 
              src={fbb} 
              alt="Logo" 
              className="h-16 w-auto object-contain cursor-pointer"
              onClick={() => navigate('/')}
            />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item.href, item.id)}
                  className="text-white hover:text-gray-300 transition-colors duration-300 px-3 py-2 rounded-md text-sm font-medium"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-gray-300 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden absolute w-full">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-black shadow-lg">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.href, item.id)}
                className="text-white hover:text-gray-300 block w-full text-left px-3 py-2 rounded-md text-base font-medium"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;