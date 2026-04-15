import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronDown, ShoppingCart, Heart, User, LogOut, Package } from 'lucide-react';
import fbb from "./Img/fbb.png";
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { baseurl } from '../../Constant/Base';
import AuthModal from './AuthModal';
import OtpModal from './OtpModal';
import ForgotPasswordModal from './ForgotPasswordModal';

interface NavItem {
  label: string;
  href: string;
  subItems?: { label: string; href: string }[];
}

interface NavBarProps {
  isTransparent?: boolean;
}

interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    brand: string;
    priceINR: number;
    priceAED: number;
    images: {
      image1: string;
      image2?: string;
      image3?: string;
      image4?: string;
    };
    stock: number;
    colors?: string[];
    sizes?: string[];
  };
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  price: number;
}

interface WishlistItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    brand: string;
    priceINR: number;
    priceAED: number;
    images: {
      image1: string;
      image2?: string;
      image3?: string;
      image4?: string;
    };
    stock: number;
  };
  addedAt: string;
}

interface UserData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
}

const NavBar: React.FC<NavBarProps> = ({ isTransparent = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [user, setUser] = useState<UserData | null>(null);
  const [isLogged, setIsLogged] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const cartRef = useRef<HTMLDivElement>(null);
  const wishlistRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  const api = axios.create({ baseURL: baseurl });

  const navItems: NavItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Sell With Us', href: '/seller/dashboard' },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    checkAuthStatus();
    fetchCartData();
    fetchWishlistData();
  }, []);

  useEffect(() => {
    if (cartOpen) fetchCartData();
  }, [cartOpen]);

  useEffect(() => {
    if (wishlistOpen) fetchWishlistData();
  }, [wishlistOpen]);

  useEffect(() => {
    if (cartOpen || wishlistOpen || isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [cartOpen, wishlistOpen, isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(e.target as Node)) {
        setCartOpen(false);
      }
      if (wishlistRef.current && !wishlistRef.current.contains(e.target as Node)) {
        setWishlistOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { setIsLogged(false); setUser(null); return; }
      const response = await api.get('/profile', { headers: { Authorization: `Bearer ${token}` } });
      if (response.data.success) {
        setIsLogged(true);
        setUser(response.data.user);
        localStorage.setItem('userData', JSON.stringify(response.data.user));
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        setIsLogged(false);
        setUser(null);
      }
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      setIsLogged(false);
      setUser(null);
    }
  };

  const fetchCartData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await api.get('/cart', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (response.data.success) {
        setCartItems(response.data.cart || []);
        setCartCount(response.data.cartCount || 0);
        setCartTotal(response.data.cartTotal || 0);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlistData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/cart/wishlist', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (response.data.success) {
        setWishlistItems(response.data.wishlist || []);
        setWishlistCount(response.data.wishlistCount || 0);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const handleNavClick = (href: string) => {
    navigate(href);
    setIsOpen(false);
    setActiveDropdown(null);
  };

  const toggleDropdown = (label: string) => {
    setActiveDropdown(activeDropdown === label ? null : label);
  };

  const handleCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCartOpen(prev => !prev);
    setWishlistOpen(false);
    setShowProfileDropdown(false);
    setIsOpen(false);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlistOpen(prev => !prev);
    setCartOpen(false);
    setShowProfileDropdown(false);
    setIsOpen(false);
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/cart/cart/remove/${cartItemId}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      fetchCartData();
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateCartQuantity = async (cartItemId: string, newQuantity: number) => {
    try {
      const token = localStorage.getItem('token');
      await api.put('/cart/cart/update', { cartItemId, quantity: newQuantity }, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      fetchCartData();
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/cart/wishlist/remove/${productId}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      fetchWishlistData();
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const moveToCart = async (productId: string) => {
    try {
      const token = localStorage.getItem('token');
      await api.post('/cart/wishlist/move-to-cart', { productId }, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      fetchCartData();
      fetchWishlistData();
    } catch (error) {
      console.error('Error moving to cart:', error);
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
    setCartOpen(false);
  };

  const handleRegisterSuccess = (email: string) => {
    setRegisteredEmail(email);
    setShowOtpModal(true);
  };

  const handleLoginSuccess = async (userData: UserData, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    setIsLogged(true);
    setUser(userData);
    setShowAuthModal(false);
    fetchCartData();
    fetchWishlistData();
  };

  const handleOtpVerifySuccess = async () => {
    await checkAuthStatus();
    setShowOtpModal(false);
    fetchCartData();
    fetchWishlistData();
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await axios.post(`${baseurl}/logout`, {}, { headers: { Authorization: `Bearer ${token}` } });
      }
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      setIsLogged(false);
      setUser(null);
      setCartItems([]);
      setWishlistItems([]);
      setCartCount(0);
      setWishlistCount(0);
      setShowProfileDropdown(false);
      setIsOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const CartPanel = () => (
    <div
      className="fixed inset-0 z-[999] flex justify-end"
      onClick={() => setCartOpen(false)}
    >
      <div
        className="absolute inset-0 bg-black/50"
      />
      <div
        ref={cartRef}
        className="relative z-10 w-full max-w-sm bg-white h-full flex flex-col shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white">
          <h3 className="text-lg font-semibold text-gray-900">Shopping Cart</h3>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{cartCount} items</span>
            <button onClick={() => setCartOpen(false)} className="text-gray-500 hover:text-gray-900">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Your cart is empty</p>
              <button
                onClick={() => { navigate('/shop'); setCartOpen(false); }}
                className="mt-4 text-amber-500 hover:text-amber-600 font-medium text-sm"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item._id} className="flex items-start gap-3 pb-4 border-b border-gray-100">
                  <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={item.product.images.image1 || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=200&h=200&fit=crop&auto=format&q=80'}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm line-clamp-2">{item.product.name}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{item.product.brand}</p>
                    {item.selectedColor && <p className="text-xs text-gray-400">Color: {item.selectedColor}</p>}
                    {item.selectedSize && <p className="text-xs text-gray-400">Size: {item.selectedSize}</p>}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateCartQuantity(item._id, Math.max(1, item.quantity - 1))}
                          className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 text-gray-700 font-medium"
                        >-</button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item._id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 text-gray-700 font-medium"
                        >+</button>
                      </div>
                      <span className="font-bold text-gray-900 text-sm">₹{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item._id)} className="text-gray-300 hover:text-red-500 transition-colors mt-1">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600 font-medium">Subtotal</span>
              <span className="text-xl font-bold text-gray-900">₹{cartTotal.toLocaleString()}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { setCartOpen(false); navigate('/cart'); }}
                className="px-4 py-3 border border-gray-300 text-gray-800 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                View Cart
              </button>
              <button
                onClick={handleCheckout}
                className="px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors text-sm font-medium"
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const WishlistPanel = () => (
    <div
      className="fixed inset-0 z-[999] flex justify-end"
      onClick={() => setWishlistOpen(false)}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div
        ref={wishlistRef}
        className="relative z-10 w-full max-w-sm bg-white h-full flex flex-col shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white">
          <h3 className="text-lg font-semibold text-gray-900">Wishlist</h3>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{wishlistCount} items</span>
            <button onClick={() => setWishlistOpen(false)} className="text-gray-500 hover:text-gray-900">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {wishlistItems.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Your wishlist is empty</p>
              <button
                onClick={() => { navigate('/shop'); setWishlistOpen(false); }}
                className="mt-4 text-amber-500 hover:text-amber-600 font-medium text-sm"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {wishlistItems.map((item) => (
                <div key={item._id} className="flex items-start gap-3 pb-4 border-b border-gray-100">
                  <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={item.product.images.image1 || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=200&h=200&fit=crop&auto=format&q=80'}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm line-clamp-2">{item.product.name}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{item.product.brand}</p>
                    <p className="font-bold text-gray-900 text-sm mt-1">₹{item.product.priceINR.toLocaleString()}</p>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => moveToCart(item.product._id)}
                        className="px-3 py-1.5 bg-black text-white text-xs rounded-lg hover:bg-gray-900 transition-colors font-medium"
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={() => removeFromWishlist(item.product._id)}
                        className="px-3 py-1.5 border border-gray-300 text-gray-600 text-xs rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const ProfileDropdown = () => (
    <div
      ref={profileRef}
      className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-2xl border border-gray-200 z-50"
    >
      <div className="p-4">
        <div className="mb-4 pb-4 border-b border-gray-100">
          <p className="font-semibold text-gray-900">{user?.name}</p>
          <p className="text-sm text-gray-600 truncate">{user?.email}</p>
        </div>
        <div className="space-y-1">
          <Link
            to="/profile"
            onClick={() => setShowProfileDropdown(false)}
            className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm"
          >
            <User className="h-4 w-4" />
            <span>Profile</span>
          </Link>
          <Link
            to="/profile"
            state={{ activeTab: 'orders' }}
            onClick={() => setShowProfileDropdown(false)}
            className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm"
          >
            <Package className="h-4 w-4" />
            <span>Orders</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full text-left text-sm"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 transition-all duration-500 h-20 bg-black border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">

            <div className="flex-shrink-0 flex items-center">
              <img
                src={fbb}
                alt="FBB Luxury"
                className="h-16 w-auto object-contain cursor-pointer hover:opacity-90 transition-opacity duration-300"
                onClick={() => navigate('/')}
              />
            </div>

            <div className="hidden lg:block">
              <div className="flex items-center space-x-8">
                {navItems.map((item) => (
                  <div key={item.label} className="relative group">
                    <button
                      onClick={() => item.subItems ? toggleDropdown(item.label) : handleNavClick(item.href)}
                      className="text-white hover:text-amber-400 transition-all duration-300 px-3 py-2 text-sm font-medium flex items-center gap-1"
                    >
                      {item.label}
                      {item.subItems && <ChevronDown className="w-4 h-4" />}
                    </button>
                    {item.subItems && (
                      <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                        <div className="bg-black/95 backdrop-blur-lg border border-gray-800 rounded-lg shadow-2xl py-3 min-w-[200px]">
                          {item.subItems.map((subItem) => (
                            <button
                              key={subItem.label}
                              onClick={() => handleNavClick(subItem.href)}
                              className="block w-full text-left px-6 py-3 text-white hover:text-amber-400 hover:bg-gray-900/50 transition-colors duration-200 text-sm"
                            >
                              {subItem.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden lg:flex items-center space-x-6">
              {isLogged ? (
                <>
                  <button onClick={handleWishlistClick} className="text-white hover:text-amber-400 transition-colors duration-300 relative">
                    <Heart className="h-6 w-6" />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                        {wishlistCount}
                      </span>
                    )}
                  </button>

                  <button onClick={handleCartClick} className="text-white hover:text-amber-400 transition-colors duration-300 relative">
                    <ShoppingCart className="h-6 w-6" />
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-amber-500 text-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                        {cartCount}
                      </span>
                    )}
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setShowProfileDropdown(prev => !prev)}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900 text-white text-sm hover:bg-gray-800 transition border border-gray-700"
                    >
                      <div className="w-7 h-7 rounded-full bg-amber-500 text-black text-xs font-bold flex items-center justify-center">
                        {user?.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="max-w-[100px] truncate">{user?.name}</span>
                    </button>
                    {showProfileDropdown && <ProfileDropdown />}
                  </div>
                </>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-6 py-2 rounded-full bg-amber-500 text-white text-sm font-semibold shadow-md hover:bg-amber-600 transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>

            <div className="lg:hidden flex items-center gap-4">
              {isLogged && (
                <>
                  <button onClick={handleWishlistClick} className="text-white hover:text-amber-400 transition-colors duration-300 relative p-1">
                    <Heart className="h-6 w-6" />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                        {wishlistCount}
                      </span>
                    )}
                  </button>
                  <button onClick={handleCartClick} className="text-white hover:text-amber-400 transition-colors duration-300 relative p-1">
                    <ShoppingCart className="h-6 w-6" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-amber-500 text-black text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                        {cartCount}
                      </span>
                    )}
                  </button>
                </>
              )}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-white hover:text-amber-400 focus:outline-none transition-colors duration-300 p-1"
                aria-label="Toggle menu"
              >
                {isOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
              </button>
            </div>
          </div>
        </div>

        {isOpen && (
          <div className="lg:hidden absolute w-full bg-black backdrop-blur-lg border-t border-gray-800 shadow-xl z-50 max-h-[calc(100vh-5rem)] overflow-y-auto">
            <div className="px-4 py-4 space-y-1">
              {navItems.map((item) => (
                <div key={item.label}>
                  <button
                    onClick={() => item.subItems ? toggleDropdown(item.label) : handleNavClick(item.href)}
                    className="text-white hover:text-amber-400 flex w-full text-left px-4 py-4 text-lg font-medium border-b border-gray-800 items-center justify-between"
                  >
                    {item.label}
                    {item.subItems && (
                      <ChevronDown className={`w-5 h-5 transition-transform ${activeDropdown === item.label ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                  {item.subItems && activeDropdown === item.label && (
                    <div className="pl-8 py-2 bg-gray-900/50">
                      {item.subItems.map((subItem) => (
                        <button
                          key={subItem.label}
                          onClick={() => handleNavClick(subItem.href)}
                          className="text-gray-300 hover:text-amber-400 block w-full text-left px-4 py-3 text-sm transition-colors duration-200"
                        >
                          {subItem.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="flex items-center justify-around px-4 pt-4 pb-2 border-t border-gray-800">
                {isLogged ? (
                  <>
                    <div className="text-center">
                      <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center mx-auto mb-1">
                        <span className="text-black font-bold text-sm">
                          {user?.name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-white text-xs truncate max-w-[80px]">{user?.name}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setIsOpen(false)}
                      className="flex flex-col items-center gap-1 text-white hover:text-amber-400"
                    >
                      <User className="h-5 w-5" />
                      <span className="text-xs">Profile</span>
                    </Link>
                    <Link
                      to="/profile"
                      state={{ activeTab: 'orders' }}
                      onClick={() => setIsOpen(false)}
                      className="flex flex-col items-center gap-1 text-white hover:text-amber-400"
                    >
                      <Package className="h-5 w-5" />
                      <span className="text-xs">Orders</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex flex-col items-center gap-1 text-white hover:text-red-400 transition-colors duration-300"
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="text-xs">Logout</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { setShowAuthModal(true); setIsOpen(false); }}
                    className="px-6 py-2.5 rounded-full bg-amber-500 text-white text-sm font-semibold shadow-md hover:bg-amber-600 transition-colors"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {cartOpen && <CartPanel />}
      {wishlistOpen && <WishlistPanel />}

      <div className="pt-20" />

      <AuthModal
        show={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onRegisterSuccess={handleRegisterSuccess}
        onLoginSuccess={handleLoginSuccess}
        onForgotPassword={() => { setShowAuthModal(false); setShowForgotPasswordModal(true); }}
      />

      <OtpModal
        show={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        email={registeredEmail}
        onVerifySuccess={handleOtpVerifySuccess}
        onLoginSuccess={handleLoginSuccess}
      />

      <ForgotPasswordModal
        show={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
      />
    </>
  );
};

export default NavBar;