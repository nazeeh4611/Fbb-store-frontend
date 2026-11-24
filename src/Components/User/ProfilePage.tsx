import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, MapPin, ShoppingBag, Heart, Settings, LogOut, Package, Clock, Truck, CheckCircle, Edit, Mail, Phone, CreditCard, Trash2, Plus, Minus, Lock, Printer, Download, ChevronLeft, X, AlertCircle } from 'lucide-react';
import NavBar from '../Layouts/Navbar';
import Footer from '../Layouts/Footer';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

import api from '../../lib/api';
import { logoutUser } from '../../lib/auth';
interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: {
    shipping: {
      street: string;
      city: string;
      state: string;
      country: string;
      pincode: string;
      phone: string;
    };
    billing: {
      street: string;
      city: string;
      state: string;
      country: string;
      pincode: string;
      phone: string;
    };
  };
  cartCount: number;
  wishlistCount: number;
  ordersCount: number;
  joinDate: string;
}

interface OrderItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    brand: string;
    images: {
      image1: string;
    };
    priceINR: number;
    stock: number;
    colors?: string[];
    sizes?: string[];
  };
  quantity: number;
  price: number;
  selectedColor?: string;
  selectedSize?: string;
  itemStatus: string;
  sellerStatus: string;
  cancellationReason?: string;
  returnStatus?: string;
  returnReason?: string;
  canCancel?: boolean;
  canReturn?: boolean;
}

interface SellerOrder {
  seller: {
    _id: string;
    name: string;
    companyName: string;
    phone: string;
    email: string;
  };
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  sellerStatus: string;
}

interface Order {
  _id: string;
  orderId: string;
  items: OrderItem[];
  sellerOrders: SellerOrder[];
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  subtotal: number;
  shipping: number;
  tax: number;
  shippingAddress: {
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
  billingAddress: {
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
  trackingNumber?: string;
  notes?: string;
  cancellationReason?: string;
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

const ProfilePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState({
    overview: true,
    orders: true,
    cart: true,
    orderDetails: false
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingCart, setUpdatingCart] = useState<string | null>(null);
  const [cartTotal, setCartTotal] = useState(0);
  const [shippingCost] = useState(0);
  const [tax] = useState(0);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<OrderItem | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchProfileData();
      fetchRecentOrders();
    } else if (activeTab === 'orders') {
      fetchAllOrders();
    } else if (activeTab === 'cart') {
      fetchCartData();
    }
  }, [activeTab]);

  const fetchProfileData = async () => {
    try {
      const response = await api.get('/profile', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (response.data.success) {
        setProfile(response.data.user);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    }
  };

  const fetchRecentOrders = async () => {
    try {
      setLoading(prev => ({ ...prev, overview: true }));
      const response = await api.get('/orders', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (response.data.success) {
        setOrders(response.data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(prev => ({ ...prev, overview: false }));
    }
  };

  const fetchAllOrders = async () => {
    try {
      setLoading(prev => ({ ...prev, orders: true }));
      const response = await api.get('/orders', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (response.data.success) {
        setOrders(response.data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(prev => ({ ...prev, orders: false }));
    }
  };

  const fetchCartData = async () => {
    try {
      setLoading(prev => ({ ...prev, cart: true }));
      const response = await api.get('/cart',{
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (response.data.success) {
        setCartItems(response.data.cart || []);
        setCartTotal(response.data.cartTotal || 0);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to load cart');
      setCartItems([]);
    } finally {
      setLoading(prev => ({ ...prev, cart: false }));
    }
  };

  const updateQuantity = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      setUpdatingCart(cartItemId);
      await api.put('/cart/update', {
        cartItemId,
        quantity: newQuantity
      });
      await fetchCartData();
    } catch (error: any) {
      console.error('Error updating quantity:', error);
      if (error.response?.data?.message === 'Insufficient stock available') {
        toast.error('Insufficient stock available');
      } else {
        toast.error('Failed to update quantity');
      }
    } finally {
      setUpdatingCart(null);
    }
  };

  const removeItem = async (cartItemId: string) => {
    try {
      await api.delete(`/cart/remove/${cartItemId}`);
      toast.success('Item removed from cart');
      await fetchCartData();
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart/clear');
      toast.success('Cart cleared');
      await fetchCartData();
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    }
  };

  const handleCancelItem = (item: OrderItem) => {
    setSelectedItem(item);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const handleReturnItem = (item: OrderItem) => {
    setSelectedItem(item);
    setReturnReason('');
    setShowReturnModal(true);
  };

  const confirmCancelItem = async () => {
    if (!selectedItem || !cancelReason.trim()) {
      toast.error('Please provide a cancellation reason');
      return;
    }

    try {
      setProcessingAction(true);
      const response = await api.post(`/order/${selectedOrder?.orderId}/cancel-item`, {
        itemId: selectedItem._id,
        reason: cancelReason
      });

      if (response.data.success) {
        toast.success('Item cancelled successfully');
        setShowCancelModal(false);
        setSelectedItem(null);
        setCancelReason('');
        
        if (selectedOrder) {
          const updatedOrder = response.data.order;
          setSelectedOrder(updatedOrder);
          
          const updatedOrders = orders.map(order => 
            order.orderId === updatedOrder.orderId ? updatedOrder : order
          );
          setOrders(updatedOrders);
        }
      }
    } catch (error: any) {
      console.error('Error cancelling item:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel item');
    } finally {
      setProcessingAction(false);
    }
  };

  const confirmReturnItem = async () => {
    if (!selectedItem || !returnReason.trim()) {
      toast.error('Please provide a return reason');
      return;
    }

    try {
      setProcessingAction(true);
      const response = await api.post(`/order/${selectedOrder?.orderId}/return`, {
        itemId: selectedItem._id,
        reason: returnReason
      });

      if (response.data.success) {
        toast.success('Return requested successfully');
        setShowReturnModal(false);
        setSelectedItem(null);
        setReturnReason('');
        
        if (selectedOrder) {
          const updatedOrder = response.data.order;
          setSelectedOrder(updatedOrder);
          
          const updatedOrders = orders.map(order => 
            order.orderId === updatedOrder.orderId ? updatedOrder : order
          );
          setOrders(updatedOrders);
        }
      }
    } catch (error: any) {
      console.error('Error requesting return:', error);
      toast.error(error.response?.data?.message || 'Failed to request return');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate('/');
    toast.success('Logged out successfully');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-ink" />;
      case 'processing': return <Package className="h-4 w-4 text-blue-500" />;
      case 'shipped': return <Truck className="h-4 w-4 text-purple-500" />;
      case 'delivered': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled': return <X className="h-4 w-4 text-sale" />;
      default: return <Package className="h-4 w-4 text-muted" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'processing': return 'Processing';
      case 'shipped': return 'Shipped';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      case 'returned': return 'Returned';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-canvas text-ink';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'returned': return 'bg-orange-100 text-orange-800';
      default: return 'bg-canvas text-ink';
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'pending': return 'Your order has been received and is being processed.';
      case 'processing': return 'We are preparing your items for shipping.';
      case 'shipped': return 'Your order is on the way to you.';
      case 'delivered': return 'Your order has been delivered successfully.';
      case 'cancelled': return 'This order has been cancelled.';
      case 'returned': return 'Return has been requested for this order.';
      default: return '';
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const grandTotal = cartTotal + shippingCost + tax;

  if (loading.overview && activeTab === 'overview') {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <NavBar />
        <div className="flex-grow flex items-center justify-center py-32">
          <div className="w-16 h-16 border-4 border-ink border-t-transparent rounded-full animate-spin"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavBar />
      
      <main className="flex-grow">
        <div className="border-b border-line bg-canvas">
          <div className="mx-auto flex max-w-[1440px] items-center gap-5 px-4 py-8 sm:px-6 lg:px-10">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-ink font-display text-2xl font-semibold uppercase text-white sm:h-20 sm:w-20">
              {(profile?.name || 'U').charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">My account</p>
              <h1 className="truncate font-display text-2xl font-semibold uppercase sm:text-3xl">Hi, {profile?.name?.split(' ')[0] || 'there'}</h1>
              {profile?.joinDate && <p className="text-sm text-muted">Member since {profile.joinDate}</p>}
            </div>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-md border border-line p-6 lg:sticky lg:top-[140px]"
              >
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      activeTab === 'overview' 
                        ? 'bg-ink text-white' 
                        : 'hover:bg-canvas text-ink-soft'
                    }`}
                  >
                    <User className="h-5 w-5" />
                    Overview
                  </button>

                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      activeTab === 'orders' 
                        ? 'bg-ink text-white' 
                        : 'hover:bg-canvas text-ink-soft'
                    }`}
                  >
                    <ShoppingBag className="h-5 w-5" />
                    My Orders
                  </button>

                  <button
                    onClick={() => setActiveTab('cart')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      activeTab === 'cart' 
                        ? 'bg-ink text-white' 
                        : 'hover:bg-canvas text-ink-soft'
                    }`}
                  >
                    <ShoppingBag className="h-5 w-5" />
                    My Cart
                  </button>

                  <button
                    onClick={() => setActiveTab('wishlist')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      activeTab === 'wishlist' 
                        ? 'bg-ink text-white' 
                        : 'hover:bg-canvas text-ink-soft'
                    }`}
                  >
                    <Heart className="h-5 w-5" />
                    Wishlist
                  </button>

                  <button
                    onClick={() => setActiveTab('addresses')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      activeTab === 'addresses' 
                        ? 'bg-ink text-white' 
                        : 'hover:bg-canvas text-ink-soft'
                    }`}
                  >
                    <MapPin className="h-5 w-5" />
                    Addresses
                  </button>

                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      activeTab === 'settings' 
                        ? 'bg-ink text-white' 
                        : 'hover:bg-canvas text-ink-soft'
                    }`}
                  >
                    <Settings className="h-5 w-5" />
                    Settings
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-sale-soft text-sale transition-colors mt-4"
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </button>
                </div>

                <div className="mt-8 pt-8 border-t border-line">
                  <h3 className="text-lg font-semibold text-ink mb-4">Your Stats</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-ink-soft">Total Spent</span>
                      <span className="font-bold text-ink">
                        ₹{(orders || []).reduce((sum, order) => sum + (order?.total || 0), 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-ink-soft">Completed Orders</span>
                      <span className="font-bold text-ink">
                        {(orders || []).filter(o => o?.status === 'delivered').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-ink-soft">Member Since</span>
                      <span className="font-bold text-ink">{profile?.joinDate || '—'}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="lg:col-span-3">
              {activeTab === 'overview' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-8"
                >
                  <div className="bg-white rounded-md border border-line p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="font-display text-2xl font-semibold uppercase text-ink">Recent Orders</h2>
                        <p className="text-ink-soft">Your latest purchases</p>
                      </div>
                      <button
                        onClick={() => setActiveTab('orders')}
                        className="text-ink hover:text-ink font-medium flex items-center gap-2"
                      >
                        View All
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>

                    {loading.overview ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="w-8 h-8 border-2 border-ink border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : (orders?.length || 0) === 0 ? (
                      <div className="text-center py-8">
                        <ShoppingBag className="h-16 w-16 text-muted mx-auto mb-4" />
                        <p className="text-ink-soft mb-2">No orders yet</p>
                        <p className="text-muted text-sm mb-4">Start shopping to see your orders here</p>
                        <button
                          onClick={() => navigate('/shop')}
                          className="bg-ink text-white hover:bg-black px-6 py-2 rounded-lg font-medium transition-colors"
                        >
                          Start Shopping
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                      {(orders || []).slice(0, 3).map((order) => (
                        <motion.div
                          key={order._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="bg-canvas rounded-lg p-4 hover:bg-canvas transition-colors border border-line"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                {getStatusIcon(order.status)}
                                <span className="font-medium text-ink">Order #{order.orderId}</span>
                                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                                  {getStatusText(order.status)}
                                </span>
                              </div>
                              <div className="text-sm text-ink-soft">
                                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })} • {(order.items || []).length} items
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-ink">₹{order.total}</div>
                              <button
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setActiveTab('order-details');
                                }}
                                className="text-sm text-ink hover:text-ink mt-2"
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    )}
                  </div>

                  <div className="bg-white rounded-md border border-line p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="font-display text-2xl font-semibold uppercase text-ink">Personal Information</h2>
                        <p className="text-ink-soft">Manage your personal details</p>
                      </div>
                      <button className="flex items-center gap-2 text-ink hover:text-ink">
                        <Edit className="h-4 w-4" />
                        Edit
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-ink-soft mb-2">Full Name</label>
                          <div className="flex items-center gap-3 bg-canvas rounded-lg p-3">
                            <User className="h-5 w-5 text-muted" />
                            <span className="font-medium">{profile?.name}</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm text-ink-soft mb-2">Email Address</label>
                          <div className="flex items-center gap-3 bg-canvas rounded-lg p-3">
                            <Mail className="h-5 w-5 text-muted" />
                            <span>{profile?.email}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-ink-soft mb-2">Phone Number</label>
                          <div className="flex items-center gap-3 bg-canvas rounded-lg p-3">
                            <Phone className="h-5 w-5 text-muted" />
                            <span>{profile?.phone}</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm text-ink-soft mb-2">Account Status</label>
                          <div className="flex items-center gap-3 bg-green-50 rounded-lg p-3 border border-green-200">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="font-medium text-green-700">Active</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'orders' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold text-ink">My Orders</h1>
                      <p className="text-ink-soft">Track and manage your orders</p>
                    </div>
                  </div>

                  {loading.orders ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="w-12 h-12 border-4 border-ink border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (orders?.length || 0) === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingBag className="h-24 w-24 text-muted mx-auto mb-6" />
                      <h2 className="text-2xl font-bold mb-4">No Orders Yet</h2>
                      <p className="text-ink-soft mb-8">You haven't placed any orders yet.</p>
                      <button
                        onClick={() => navigate('/shop')}
                        className="bg-ink text-white hover:bg-black px-6 py-3 rounded-lg font-medium transition-colors"
                      >
                        Start Shopping
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {(orders || []).map((order) => (
                        <div key={order._id} className="bg-white rounded-md border border-line overflow-hidden">
                          <div className="p-6 border-b border-line">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-3 mb-2">
                                  {getStatusIcon(order.status)}
                                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                    {getStatusText(order.status)}
                                  </span>
                                </div>
                                <div className="text-sm text-ink-soft">
                                  Order #{order.orderId} • 
                                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                  })}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xl font-bold text-ink">₹{order.total}</div>
                                <div className="text-sm text-ink-soft capitalize">
                                  {order.paymentMethod === 'razorpay' ? 'Paid Online' : 'Cash on Delivery'}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="p-6">
                            <div className="space-y-4">
                              {(order.items || []).slice(0, 2).map((item, index) => (
                                <div key={index} className="flex gap-4">
                                  <div className="w-20 h-20 flex-shrink-0">
                                    <img
                                      src={item.product?.images?.image1 || ''}
                                      alt={item.product?.name || 'Product'}
                                      className="w-full h-full object-cover rounded-lg"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-medium text-ink">{item.product?.name || 'Product'}</h4>
                                    <p className="text-sm text-ink-soft">{item.product?.brand || ''}</p>
                                    <div className="flex justify-between items-center mt-2">
                                      <span className="text-sm text-ink-soft">Qty: {item.quantity}</span>
                                      <span className="font-medium text-ink">₹{item.price * item.quantity}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="mt-6 pt-6 border-t border-line flex flex-col sm:flex-row justify-between gap-4">
                              <div className="text-sm text-ink-soft">
                                {(order.items || []).length} item{(order.items || []).length !== 1 ? 's' : ''}
                              </div>
                              <div className="flex gap-4">
                                <button
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setActiveTab('order-details');
                                  }}
                                  className="px-4 py-2 border border-line text-ink-soft hover:bg-canvas rounded-lg transition-colors"
                                >
                                  View Details
                                </button>
                                {order.status === 'delivered' && (
                                  <button className="px-4 py-2 bg-ink text-white hover:bg-black rounded-lg transition-colors">
                                    Buy Again
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'cart' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-8"
                >
                  {loading.cart ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="w-16 h-16 border-4 border-ink border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (cartItems?.length || 0) === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingBag className="h-24 w-24 text-muted mx-auto mb-6" />
                      <h2 className="font-display text-2xl font-semibold uppercase text-ink mb-4">Your Cart is Empty</h2>
                      <p className="text-ink-soft mb-8">
                        Looks like you haven't added any products to your cart yet.
                      </p>
                      <button
                        onClick={() => navigate('/shop')}
                        className="bg-ink text-white hover:bg-black px-6 py-3 rounded-lg font-medium transition-colors"
                      >
                        Start Shopping
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="bg-white rounded-md border border-line">
                        <div className="p-6 border-b border-line">
                          <div className="flex justify-between items-center">
                            <h1 className="font-display text-2xl font-semibold uppercase text-ink">Shopping Cart</h1>
                            <div className="text-ink-soft">
                              {totalCartItems} {totalCartItems === 1 ? 'item' : 'items'}
                            </div>
                          </div>
                        </div>

                        <div className="p-6">
                          {(cartItems || []).map((item) => (
                            <div key={item._id} className="flex gap-4 py-6 border-b border-line last:border-0">
                              <div className="w-24 h-24 flex-shrink-0">
                                <img
                                  src={item.product.images.image1}
                                  alt={item.product.name}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              </div>

                              <div className="flex-1">
                                <div className="flex justify-between">
                                  <div>
                                    <h3 className="font-medium text-ink mb-1">
                                      {item.product.name}
                                    </h3>
                                    <p className="text-sm text-ink-soft mb-2">{item.product.brand}</p>
                                    
                                    {(item.selectedColor || item.selectedSize) && (
                                      <div className="flex gap-4 text-sm text-ink-soft mb-3">
                                        {item.selectedColor && (
                                          <span>Color: {item.selectedColor}</span>
                                        )}
                                        {item.selectedSize && (
                                          <span>Size: {item.selectedSize}</span>
                                        )}
                                      </div>
                                    )}

                                    <div className={`text-sm font-medium ${
                                      item.product.stock > 0 ? 'text-green-600' : 'text-sale'
                                    }`}>
                                      {item.product.stock > 0 
                                        ? `${item.product.stock} in stock` 
                                        : 'Out of stock'}
                                    </div>
                                  </div>

                                  <div className="text-right">
                                    <div className="text-lg font-bold text-ink mb-2">
                                      ₹{item.price * item.quantity}
                                    </div>
                                    <div className="text-sm text-ink-soft">
                                      ₹{item.price} each
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between mt-4">
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center border border-line rounded-lg">
                                      <button
                                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                        disabled={item.quantity <= 1 || updatingCart === item._id}
                                        className="w-10 h-10 flex items-center justify-center hover:bg-canvas transition-colors disabled:opacity-50"
                                      >
                                        <Minus className="h-4 w-4" />
                                      </button>
                                      <span className="w-12 text-center font-medium">
                                        {updatingCart === item._id ? '...' : item.quantity}
                                      </span>
                                      <button
                                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                        disabled={item.quantity >= item.product.stock || updatingCart === item._id}
                                        className="w-10 h-10 flex items-center justify-center hover:bg-canvas transition-colors disabled:opacity-50"
                                      >
                                        <Plus className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>

                                  <button
                                    onClick={() => removeItem(item._id)}
                                    className="text-muted hover:text-sale transition-colors"
                                  >
                                    <Trash2 className="h-5 w-5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}

                          <div className="flex justify-end mt-6">
                            <button
                              onClick={clearCart}
                              className="px-4 py-2 border border-line text-ink-soft hover:bg-canvas rounded-lg transition-colors"
                            >
                              Clear Cart
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-md border border-line p-6">
                        <h2 className="text-xl font-bold text-ink mb-6">Order Summary</h2>
                        <div className="space-y-4">
                          <div className="flex justify-between text-ink-soft">
                            <span>Subtotal ({totalCartItems} items)</span>
                            <span className="font-medium">₹{cartTotal}</span>
                          </div>
                          
                          <div className="flex justify-between text-ink-soft">
                            <span>Shipping</span>
                            <span className="font-medium">
                              {shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}
                            </span>
                          </div>
                          
                          <div className="flex justify-between text-ink-soft">
                            <span>Tax</span>
                            <span className="font-medium">₹{tax}</span>
                          </div>

                          <div className="border-t border-line pt-4">
                            <div className="flex justify-between text-lg font-bold">
                              <span>Total</span>
                              <span>₹{grandTotal}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => navigate('/checkout')}
                            className="w-full bg-ink text-white hover:bg-black py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                          >
                            <CreditCard className="h-5 w-5" />
                            Proceed to Checkout
                          </button>

                          <div className="flex items-center justify-center gap-2 text-sm text-muted">
                            <Lock className="h-4 w-4" />
                            Secure checkout
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {activeTab === 'order-details' && selectedOrder && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-8"
                >
                  <div className="flex items-center justify-between mb-6">
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="flex items-center gap-2 text-ink-soft hover:text-ink transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Back to Orders
                    </button>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={handlePrintInvoice}
                        className="flex items-center gap-2 px-4 py-2 border border-line text-ink-soft hover:bg-canvas rounded-lg transition-colors"
                      >
                        <Printer className="h-4 w-4" />
                        Print Invoice
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 border border-line text-ink-soft hover:bg-canvas rounded-lg transition-colors">
                        <Download className="h-4 w-4" />
                        Download
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-md border border-line overflow-hidden">
                    <div className="p-8 border-b border-line">
                      <div className="flex flex-col lg:flex-row justify-between gap-6">
                        <div>
                          <div className="flex items-center gap-4 mb-4">
                            {getStatusIcon(selectedOrder.status)}
                            <div>
                              <h1 className="font-display text-2xl font-semibold uppercase text-ink">{getStatusText(selectedOrder.status)}</h1>
                              <p className="text-ink-soft">{getStatusDescription(selectedOrder.status)}</p>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm text-ink-soft">
                            <div>
                              <span className="font-medium">Order ID:</span> {selectedOrder.orderId}
                            </div>
                            <div>
                              <span className="font-medium">Order Date:</span> 
                              {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                            {selectedOrder.trackingNumber && (
                              <div>
                                <span className="font-medium">Tracking Number:</span> {selectedOrder.trackingNumber}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="bg-canvas p-6 rounded-lg lg:w-80 border border-line">
                          <h3 className="font-bold text-ink mb-4">Order Summary</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-ink-soft">Subtotal</span>
                              <span className="text-ink">₹{selectedOrder.subtotal}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-ink-soft">Shipping</span>
                              <span className="text-ink">{selectedOrder.shipping === 0 ? 'FREE' : `₹${selectedOrder.shipping}`}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-ink-soft">Tax</span>
                              <span className="text-ink">₹{selectedOrder.tax}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold pt-3 border-t border-line">
                              <span className="text-ink">Total</span>
                              <span className="text-ink">₹{selectedOrder.total}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-8">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                          <h3 className="text-lg font-bold text-ink mb-6 flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Shipping Address
                          </h3>
                          <div className="bg-canvas p-6 rounded-lg border border-line">
                            <p className="font-medium text-ink mb-2">{selectedOrder.shippingAddress.name}</p>
                            <p className="text-ink-soft mt-1">{selectedOrder.shippingAddress.street}</p>
                            <p className="text-ink-soft">
                              {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}
                            </p>
                            <p className="text-ink-soft">
                              {selectedOrder.shippingAddress.country} - {selectedOrder.shippingAddress.pincode}
                            </p>
                            <p className="text-ink-soft mt-2">Phone: {selectedOrder.shippingAddress.phone}</p>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-bold text-ink mb-6 flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Payment Information
                          </h3>
                          <div className="bg-canvas p-6 rounded-lg border border-line">
                            <div className="flex justify-between items-center mb-4">
                              <span className="font-medium text-ink">Payment Method</span>
                              <span className="capitalize text-ink-soft">
                                {selectedOrder.paymentMethod === 'razorpay' ? 'Credit/Debit Card & UPI' : 'Cash on Delivery'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-ink">Payment Status</span>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                selectedOrder.paymentStatus === 'completed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-canvas text-ink'
                              } capitalize`}>
                                {selectedOrder.paymentStatus}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8">
                        <h3 className="text-lg font-bold text-ink mb-6">Order Items</h3>
                        <div className="bg-canvas rounded-lg overflow-hidden border border-line">
                          <div className="grid grid-cols-12 gap-4 p-4 border-b border-line font-medium text-ink">
                            <div className="col-span-5">Product</div>
                            <div className="col-span-2 text-center">Quantity</div>
                            <div className="col-span-2 text-center">Price</div>
                            <div className="col-span-3 text-right">Actions</div>
                          </div>
                          
                          {selectedOrder.items.map((item, index) => (
                            <div key={index} className="grid grid-cols-12 gap-4 p-4 border-b border-line last:border-0">
                              <div className="col-span-5">
                                <div className="flex gap-4">
                                  <div className="w-16 h-16 flex-shrink-0">
                                    <img
                                      src={item.product?.images?.image1 || ''}
                                      alt={item.product?.name || 'Product'}
                                      className="w-full h-full object-cover rounded"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-medium text-ink">{item.product?.name || 'Product'}</h4>
                                    <p className="text-sm text-ink-soft">{item.product?.brand || ''}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(item.itemStatus)}`}>
                                        {getStatusText(item.itemStatus)}
                                      </span>
                                      {item.cancellationReason && (
                                        <span className="text-xs text-sale">(Cancelled: {item.cancellationReason})</span>
                                      )}
                                      {item.returnReason && (
                                        <span className="text-xs text-orange-600">(Return: {item.returnReason})</span>
                                      )}
                                    </div>
                                    {(item.selectedColor || item.selectedSize) && (
                                      <div className="text-xs text-muted mt-1">
                                        {item.selectedColor && <span>Color: {item.selectedColor} </span>}
                                        {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="col-span-2 flex items-center justify-center text-ink">
                                {item.quantity}
                              </div>
                              <div className="col-span-2 flex items-center justify-center text-ink">
                                ₹{item.price}
                              </div>
                              <div className="col-span-3 flex items-center justify-end gap-2">
                                {item.canCancel && (
                                  <button
                                    onClick={() => handleCancelItem(item)}
                                    className="px-3 py-1.5 text-sm bg-red-100 text-sale hover:bg-red-200 rounded-lg transition-colors"
                                  >
                                    Cancel Item
                                  </button>
                                )}
                                {item.canReturn && (
                                  <button
                                    onClick={() => handleReturnItem(item)}
                                    className="px-3 py-1.5 text-sm bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-lg transition-colors"
                                  >
                                    Return Item
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {selectedOrder.notes && (
                        <div className="mt-8 p-6 bg-canvas rounded-lg border border-line">
                          <h4 className="font-medium text-ink mb-2">Order Notes</h4>
                          <p className="text-ink-soft">{selectedOrder.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'addresses' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-8"
                >
                  <div className="bg-white rounded-md border border-line p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="font-display text-2xl font-semibold uppercase text-ink">Shipping Address</h2>
                        <p className="text-ink-soft">Your primary delivery address</p>
                      </div>
                      <button className="flex items-center gap-2 text-ink hover:text-ink">
                        <Edit className="h-4 w-4" />
                        Edit Address
                      </button>
                    </div>
                    <div className="bg-canvas rounded-lg p-6 border border-line">
                      {profile?.address.shipping ? (
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-ink mt-1" />
                            <div>
                              <p className="font-medium text-ink mb-1">{profile.address.shipping.street}</p>
                              <p className="text-ink-soft">
                                {profile.address.shipping.city}, {profile.address.shipping.state}
                              </p>
                              <p className="text-ink-soft">
                                {profile.address.shipping.country} - {profile.address.shipping.pincode}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-muted" />
                            <span className="text-ink-soft">{profile.address.shipping.phone}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <MapPin className="h-12 w-12 text-muted mx-auto mb-3" />
                          <p className="text-ink-soft mb-2">No shipping address saved</p>
                          <button className="text-ink hover:text-ink font-medium">
                            Add Shipping Address
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-md border border-line p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="font-display text-2xl font-semibold uppercase text-ink">Billing Address</h2>
                        <p className="text-ink-soft">Address for invoices and receipts</p>
                      </div>
                      <button className="flex items-center gap-2 text-ink hover:text-ink">
                        <Edit className="h-4 w-4" />
                        Edit Address
                      </button>
                    </div>
                    <div className="bg-canvas rounded-lg p-6 border border-line">
                      {profile?.address.billing ? (
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <CreditCard className="h-5 w-5 text-muted mt-1" />
                            <div>
                              <p className="font-medium text-ink mb-1">{profile.address.billing.street}</p>
                              <p className="text-ink-soft">
                                {profile.address.billing.city}, {profile.address.billing.state}
                              </p>
                              <p className="text-ink-soft">
                                {profile.address.billing.country} - {profile.address.billing.pincode}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-muted" />
                            <span className="text-ink-soft">{profile.address.billing.phone}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <CreditCard className="h-12 w-12 text-muted mx-auto mb-3" />
                          <p className="text-ink-soft mb-2">No billing address saved</p>
                          <button className="text-ink hover:text-ink font-medium">
                            Add Billing Address
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white rounded-md border border-line p-6"
                >
                  <h2 className="font-display text-2xl font-semibold uppercase text-ink mb-6">Account Settings</h2>
                  
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-semibold text-ink mb-4">Notification Preferences</h3>
                      <div className="space-y-4">
                        <label className="flex items-center justify-between p-4 bg-canvas rounded-lg border border-line">
                          <div>
                            <span className="font-medium text-ink">Email Notifications</span>
                            <p className="text-sm text-ink-soft">Receive updates about your orders</p>
                          </div>
                          <input type="checkbox" className="toggle toggle-amber" defaultChecked />
                        </label>
                        <label className="flex items-center justify-between p-4 bg-canvas rounded-lg border border-line">
                          <div>
                            <span className="font-medium text-ink">Promotional Offers</span>
                            <p className="text-sm text-ink-soft">Get notified about sales and new arrivals</p>
                          </div>
                          <input type="checkbox" className="toggle toggle-amber" defaultChecked />
                        </label>
                        <label className="flex items-center justify-between p-4 bg-canvas rounded-lg border border-line">
                          <div>
                            <span className="font-medium text-ink">Order Updates</span>
                            <p className="text-sm text-ink-soft">Get real-time updates on your orders</p>
                          </div>
                          <input type="checkbox" className="toggle toggle-amber" />
                        </label>
                      </div>
                    </div>

                    <div className="pt-8 border-t border-line">
                      <h3 className="text-lg font-semibold text-ink mb-4">Change Password</h3>
                      <div className="space-y-4 max-w-md">
                        <div>
                          <label className="block text-sm font-medium text-ink-soft mb-2">Current Password</label>
                            <input
                              type="password"
                              placeholder="Enter current password"
                              className="w-full px-4 py-3 border border-line rounded-lg focus:ring-2 focus:ring-ink focus:border-transparent"
                            />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-ink-soft mb-2">New Password</label>
                            <input
                              type="password"
                              placeholder="Enter new password"
                              className="w-full px-4 py-3 border border-line rounded-lg focus:ring-2 focus:ring-ink focus:border-transparent"
                            />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-ink-soft mb-2">Confirm New Password</label>
                            <input
                              type="password"
                              placeholder="Confirm new password"
                              className="w-full px-4 py-3 border border-line rounded-lg focus:ring-2 focus:ring-ink focus:border-transparent"
                            />
                        </div>
                        <button className="bg-ink text-white hover:bg-black px-6 py-3 rounded-lg font-medium transition-colors">
                          Update Password
                        </button>
                      </div>
                    </div>

                    <div className="pt-8 border-t border-line">
                      <h3 className="text-lg font-semibold text-sale mb-4">Danger Zone</h3>
                      <div className="bg-sale-soft border border-red-200 rounded-lg p-4">
                        <p className="text-red-800 mb-3">Permanently delete your account and all associated data.</p>
                        <button className="bg-sale text-white hover:bg-red-700 px-6 py-2 rounded-lg font-medium transition-colors">
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'wishlist' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white rounded-md border border-line p-6"
                >
                  <h2 className="font-display text-2xl font-semibold uppercase text-ink mb-6">My Wishlist</h2>
                  <div className="text-center py-12">
                    <Heart className="h-24 w-24 text-muted mx-auto mb-6" />
                    <h3 className="text-xl font-bold text-ink mb-4">Your wishlist is empty</h3>
                    <p className="text-ink-soft mb-8">
                      Save your favorite items here to purchase them later.
                    </p>
                    <button
                      onClick={() => navigate('/shop')}
                      className="bg-ink text-white hover:bg-black px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      Browse Products
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>

      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-md p-6 max-w-md w-full"
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-6 w-6 text-sale" />
              <h3 className="text-lg font-bold text-ink">Cancel Item</h3>
            </div>
            
            <p className="text-ink-soft mb-4">
              Are you sure you want to cancel this item? This action cannot be undone.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-ink-soft mb-2">
                Cancellation Reason *
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason for cancellation"
                className="w-full px-4 py-3 border border-line rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 border border-line text-ink-soft hover:bg-canvas rounded-lg transition-colors"
                disabled={processingAction}
              >
                Cancel
              </button>
              <button
                onClick={confirmCancelItem}
                className="px-4 py-2 bg-sale text-white hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                disabled={processingAction || !cancelReason.trim()}
              >
                {processingAction ? 'Processing...' : 'Confirm Cancellation'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showReturnModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-md p-6 max-w-md w-full"
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-6 w-6 text-orange-500" />
              <h3 className="text-lg font-bold text-ink">Request Return</h3>
            </div>
            
            <p className="text-ink-soft mb-4">
              Please provide a reason for returning this item. Returns are accepted within 30 days of delivery.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-ink-soft mb-2">
                Return Reason *
              </label>
              <textarea
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                placeholder="Please provide a reason for return"
                className="w-full px-4 py-3 border border-line rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowReturnModal(false)}
                className="px-4 py-2 border border-line text-ink-soft hover:bg-canvas rounded-lg transition-colors"
                disabled={processingAction}
              >
                Cancel
              </button>
              <button
                onClick={confirmReturnItem}
                className="px-4 py-2 bg-orange-600 text-white hover:bg-orange-700 rounded-lg transition-colors disabled:opacity-50"
                disabled={processingAction || !returnReason.trim()}
              >
                {processingAction ? 'Processing...' : 'Request Return'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ProfilePage;