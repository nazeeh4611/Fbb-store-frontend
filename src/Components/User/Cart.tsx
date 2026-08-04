import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag, Trash2, Plus, Minus, ArrowLeft, Shield, Truck,
  Package, CheckCircle, CreditCard, Lock, Heart, ChevronRight
} from 'lucide-react';
import axios from 'axios';
import { baseurl } from '../../Constant/Base';
import NavBar from '../Layouts/Navbar';
import Footer from '../Layouts/Footer';
import { toast } from 'react-hot-toast';

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

const CartRowSkeleton = () => (
  <div className="flex gap-4 py-6 border-b border-gray-100 last:border-0 animate-pulse">
    <div className="w-24 h-24 flex-shrink-0 rounded-lg bg-gray-200" />
    <div className="flex-1 space-y-3">
      <div className="flex justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-3 bg-gray-200 rounded w-1/3" />
          <div className="h-3 bg-gray-200 rounded w-1/4" />
        </div>
        <div className="space-y-2 text-right">
          <div className="h-5 bg-gray-200 rounded w-16 ml-auto" />
          <div className="h-3 bg-gray-200 rounded w-12 ml-auto" />
        </div>
      </div>
      <div className="flex items-center justify-between mt-4">
        <div className="h-10 bg-gray-200 rounded-lg w-32" />
        <div className="h-5 bg-gray-200 rounded w-5" />
      </div>
    </div>
  </div>
);

const CartPageSkeleton = () => (
  <div className="flex flex-col lg:flex-row gap-8">
    <div className="lg:w-2/3">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center animate-pulse">
            <div className="h-7 bg-gray-200 rounded w-40" />
            <div className="h-4 bg-gray-200 rounded w-16" />
          </div>
        </div>
        <div className="p-6">
          <CartRowSkeleton />
          <CartRowSkeleton />
          <CartRowSkeleton />
        </div>
      </div>
    </div>
    <div className="lg:w-1/3">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
        </div>
        <div className="p-6 space-y-4 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-10 bg-gray-200 rounded-lg w-full mt-4" />
          <div className="h-12 bg-gray-200 rounded-lg w-full" />
        </div>
      </div>
    </div>
  </div>
);

const CartPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const [cartTotal, setCartTotal] = useState(0);
  const [shippingCost] = useState(0);
  const [tax] = useState(0);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const api = axios.create({
    baseURL: baseurl,
  });
  const fetchController = useRef<AbortController | null>(null);

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure Payment",
      description: "Your payment information is encrypted"
    },
    {
      icon: <Truck className="w-6 h-6" />,
      title: "Free Shipping",
      description: "Free delivery on orders above ₹5000"
    },
    {
      icon: <Package className="w-6 h-6" />,
      title: "Easy Returns",
      description: "30-day return policy"
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Authentic Products",
      description: "100% genuine with warranty"
    }
  ];

  useEffect(() => {
    fetchCartData(true);
  }, []);

  const computeTotal = (items: CartItem[]) =>
    items.reduce((total, item) => total + item.price * item.quantity, 0);

  const fetchCartData = async (showLoader: boolean = false) => {
    if (fetchController.current) {
      fetchController.current.abort();
    }
    fetchController.current = new AbortController();

    try {
      if (showLoader) setLoading(true);
      const response = await api.get('/cart', {
        headers: token ? {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        } : {},
        signal: fetchController.current.signal,
      });

      if (response.data.success) {
        const items = response.data.cart || [];
        setCartItems(items);
        setCartTotal(computeTotal(items));
      }
    } catch (error: any) {
      if (error.name !== 'CanceledError' && error.name !== 'AbortError') {
        console.error('Error fetching cart:', error);
        toast.error('Failed to load cart');
      }
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    const currentItem = cartItems.find(item => item._id === cartItemId);
    if (!currentItem) return;

    if (newQuantity > currentItem.product.stock) {
      toast.error(`Only ${currentItem.product.stock} items available in stock`);
      return;
    }

    setUpdatingId(cartItemId);

    const previousItems = cartItems;
    const updatedItems = cartItems.map(item =>
      item._id === cartItemId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedItems);
    setCartTotal(computeTotal(updatedItems));

    try {
      await api.put('/cart/update', {
        cartItemId,
        quantity: newQuantity
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      window.dispatchEvent(new CustomEvent('cart:updated'));
    } catch (error: any) {
      console.error('Error updating quantity:', error);
      setCartItems(previousItems);
      setCartTotal(computeTotal(previousItems));
      if (error.response?.data?.message === 'Insufficient stock available') {
        toast.error('Insufficient stock available');
      } else {
        toast.error('Failed to update quantity');
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const removeItem = async (cartItemId: string) => {
    setRemovingId(cartItemId);

    const previousItems = cartItems;
    const updatedItems = cartItems.filter(item => item._id !== cartItemId);

    try {
      await api.delete(`/cart/remove/${cartItemId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setCartItems(updatedItems);
      setCartTotal(computeTotal(updatedItems));
      window.dispatchEvent(new CustomEvent('cart:updated'));
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', error);
      setCartItems(previousItems);
      setCartTotal(computeTotal(previousItems));
      toast.error('Failed to remove item');
    } finally {
      setRemovingId(null);
    }
  };

  const moveToWishlist = async (item: CartItem) => {
    setRemovingId(item._id);

    const previousItems = cartItems;
    const updatedItems = cartItems.filter(i => i._id !== item._id);

    try {
      await api.post('/cart/wishlist/add', { productId: item.product._id }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      await api.delete(`/cart/remove/${item._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setCartItems(updatedItems);
      setCartTotal(computeTotal(updatedItems));
      window.dispatchEvent(new CustomEvent('cart:updated'));
      window.dispatchEvent(new CustomEvent('wishlist:updated'));
      toast.success('Moved to wishlist');
    } catch (error) {
      console.error('Error moving to wishlist:', error);
      setCartItems(previousItems);
      setCartTotal(computeTotal(previousItems));
      toast.error('Failed to move to wishlist');
    } finally {
      setRemovingId(null);
    }
  };

  const clearCart = async () => {
    setClearing(true);
    const previousItems = cartItems;

    try {
      await api.delete('/cart/clear', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setCartItems([]);
      setCartTotal(0);
      window.dispatchEvent(new CustomEvent('cart:updated'));
      toast.success('Cart cleared');
    } catch (error) {
      console.error('Error clearing cart:', error);
      setCartItems(previousItems);
      setCartTotal(computeTotal(previousItems));
      toast.error('Failed to clear cart');
    } finally {
      setClearing(false);
    }
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const grandTotal = cartTotal + shippingCost + tax;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <NavBar />
        <div className="h-[80px]"></div>
        <main className="flex-grow pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-4 bg-gray-200 rounded w-64 mb-8 mt-6 animate-pulse" />
            <CartPageSkeleton />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <div className="flex-grow flex flex-col items-center justify-center px-4 mt-[80px] pb-24">
          <div className="text-center max-w-md">
            <ShoppingBag className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added any products to your cart yet. Start shopping to add items.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => navigate('/shop')}
                className="w-full bg-black text-white hover:bg-gray-900 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Continue Shopping
              </button>
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Return to Home
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavBar />

      <div className="h-[80px]"></div>

      <main className="flex-grow pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center text-sm text-gray-500 mb-8 pt-6">
            <Link to="/" className="hover:text-black transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <Link to="/shop" className="hover:text-black transition-colors">Shop</Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-black font-medium">Shopping Cart</span>
          </nav>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-2/3">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
                    <div className="text-gray-600">
                      {totalItems} {totalItems === 1 ? 'item' : 'items'}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {cartItems.map((item) => {
                    const isUpdating = updatingId === item._id;
                    const isRemoving = removingId === item._id;
                    return (
                      <div
                        key={item._id}
                        className={`flex gap-4 py-6 border-b border-gray-100 last:border-0 transition-opacity duration-300 ${isRemoving ? 'opacity-40' : 'opacity-100'}`}
                      >
                        <div className="w-24 h-24 flex-shrink-0">
                          <img
                            src={item.product.images.image1 || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=200&h=200&fit=crop&auto=format&q=80"}
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>

                        <div className="flex-1">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="font-medium text-gray-900 mb-1">
                                <Link to={`/product/${item.product._id}`} className="hover:text-black">
                                  {item.product.name}
                                </Link>
                              </h3>
                              <p className="text-sm text-gray-600 mb-2">{item.product.brand}</p>

                              {(item.selectedColor || item.selectedSize) && (
                                <div className="flex gap-4 text-sm text-gray-500 mb-3">
                                  {item.selectedColor && (
                                    <span>Color: {item.selectedColor}</span>
                                  )}
                                  {item.selectedSize && (
                                    <span>Size: {item.selectedSize}</span>
                                  )}
                                </div>
                              )}

                              <div className={`text-sm font-medium ${
                                item.product.stock > 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {item.product.stock > 0
                                  ? `${item.product.stock} in stock`
                                  : 'Out of stock'}
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-900 mb-2">
                                ₹{item.price * item.quantity}
                              </div>
                              <div className="text-sm text-gray-600">
                                ₹{item.price} each
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center border border-gray-300 rounded-lg">
                                <button
                                  onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                  disabled={item.quantity <= 1 || isUpdating || isRemoving}
                                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50"
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                                {isUpdating ? (
                                  <span className="w-12 flex items-center justify-center">
                                    <span className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
                                  </span>
                                ) : (
                                  <span className="w-12 text-center font-medium">{item.quantity}</span>
                                )}
                                <button
                                  onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                  disabled={item.quantity >= item.product.stock || isUpdating || isRemoving}
                                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50"
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>

                              <button
                                onClick={() => moveToWishlist(item)}
                                disabled={isRemoving || isUpdating}
                                className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors text-sm disabled:opacity-50"
                              >
                                <Heart className="h-4 w-4" />
                                Move to Wishlist
                              </button>
                            </div>

                            <button
                              onClick={() => removeItem(item._id)}
                              disabled={isRemoving || isUpdating}
                              className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                            >
                              {isRemoving ? (
                                <span className="w-5 h-5 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin block" />
                              ) : (
                                <Trash2 className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div className="flex justify-end mt-6">
                    <button
                      onClick={clearCart}
                      disabled={clearing}
                      className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {clearing && (
                        <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
                      )}
                      Clear Cart
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-black">
                        {feature.icon}
                      </div>
                      <div className="font-medium text-gray-900">{feature.title}</div>
                    </div>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:w-1/3">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 sticky top-[100px]">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({totalItems} items)</span>
                    <span className="font-medium transition-all duration-300">₹{cartTotal}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="font-medium">
                      {shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}
                    </span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span className="font-medium">₹{tax}</span>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="transition-all duration-300">₹{grandTotal}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/checkout')}
                    className="w-full bg-black text-white hover:bg-gray-900 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <CreditCard className="h-5 w-5" />
                    Proceed to Checkout
                  </button>

                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <Lock className="h-4 w-4" />
                    Secure checkout
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <Link
                      to="/shop"
                      className="flex items-center justify-center gap-2 text-gray-600 hover:text-black transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Continue Shopping
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CartPage;