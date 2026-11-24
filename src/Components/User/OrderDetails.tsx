import  { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, Truck, CheckCircle, Clock, MapPin, CreditCard, Download, Printer, ChevronLeft } from 'lucide-react';
import NavBar from '../Layouts/Navbar';
import Footer from '../Layouts/Footer';
import { toast } from 'react-hot-toast';

import api from '../../lib/api';
import { formatINR } from '../../lib/format';
interface OrderItem {
  product: {
    _id: string;
    name: string;
    brand: string;
    images: {
      image1: string;
    };
  };
  quantity: number;
  price: number;
  selectedColor?: string;
  selectedSize?: string;
}

interface Order {
  orderId: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
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
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
}

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await api.get(`/order/${orderId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (response.data.success) {
        setOrder(response.data.order);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-6 w-6 text-muted" />;
      case 'processing': return <Package className="h-6 w-6 text-muted" />;
      case 'shipped': return <Truck className="h-6 w-6 text-muted" />;
      case 'delivered': return <CheckCircle className="h-6 w-6 text-muted" />;
      default: return <Package className="h-6 w-6 text-muted" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Order Placed';
      case 'processing': return 'Processing';
      case 'shipped': return 'Shipped';
      case 'delivered': return 'Delivered';
      default: return status;
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'pending': return 'Your order has been received and is being processed.';
      case 'processing': return 'We are preparing your items for shipping.';
      case 'shipped': return 'Your order is on the way to you.';
      case 'delivered': return 'Your order has been delivered successfully.';
      default: return '';
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-ink">
        <NavBar />
        <div className="flex-grow flex items-center justify-center mt-[80px] pb-24">
          <div className="w-16 h-16 border-4 border-line border-t-white rounded-full animate-spin"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-canvas text-ink">
        <NavBar />
        <div className="flex-grow flex flex-col items-center justify-center mt-[80px] pb-24">
          <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
          <button
            onClick={() => navigate('/orders')}
            className="bg-ink text-white hover:bg-black px-6 py-2 rounded-lg"
          >
            Back to Orders
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      <NavBar />
      
      <main className="flex-grow pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate('/orders')}
              className="flex items-center gap-2 text-muted hover:text-ink transition-colors"
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

          <div className="bg-white rounded-md border border-line overflow-hidden mb-8">
            <div className="p-8 border-b border-line">
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    {getStatusIcon(order.status)}
                    <div>
                      <h1 className="font-display text-2xl font-semibold uppercase">{getStatusText(order.status)}</h1>
                      <p className="text-muted">{getStatusDescription(order.status)}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-muted">
                    <div>
                      <span className="font-medium">Order ID:</span> {order.orderId}
                    </div>
                    <div>
                      <span className="font-medium">Order Date:</span> 
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    {order.trackingNumber && (
                      <div>
                        <span className="font-medium">Tracking Number:</span> {order.trackingNumber}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-canvas p-6 rounded-lg lg:w-80">
                  <h3 className="font-bold mb-4">Order Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted">Subtotal</span>
                      <span>{formatINR(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Shipping</span>
                      <span>{order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Tax</span>
                      <span>{formatINR(order.tax)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-3 border-t border-line">
                      <span>Total</span>
                      <span>{formatINR(order.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Shipping Address
                  </h3>
                  <div className="bg-canvas p-6 rounded-lg">
                    <p className="font-medium mb-2">{order.shippingAddress.name}</p>
                    <p className="text-muted mt-1">{order.shippingAddress.street}</p>
                    <p className="text-muted">
                      {order.shippingAddress.city}, {order.shippingAddress.state}
                    </p>
                    <p className="text-muted">
                      {order.shippingAddress.country} - {order.shippingAddress.pincode}
                    </p>
                    <p className="text-muted mt-2">Phone: {order.shippingAddress.phone}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Information
                  </h3>
                  <div className="bg-canvas p-6 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-medium">Payment Method</span>
                      <span className="capitalize">
                        {order.paymentMethod === 'razorpay' ? 'Credit/Debit Card & UPI' : 'Cash on Delivery'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Payment Status</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        order.paymentStatus === 'completed' 
                          ? 'bg-canvas text-ink-soft' 
                          : 'bg-canvas text-ink-soft'
                      } capitalize`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-bold mb-6">Order Items</h3>
                <div className="bg-canvas rounded-lg overflow-hidden">
                  <div className="grid grid-cols-12 gap-4 p-4 border-b border-line font-medium">
                    <div className="col-span-6">Product</div>
                    <div className="col-span-2 text-center">Quantity</div>
                    <div className="col-span-2 text-center">Price</div>
                    <div className="col-span-2 text-right">Total</div>
                  </div>
                  
                  {order.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-4 p-4 border-b border-line last:border-0">
                      <div className="col-span-6">
                        <div className="flex gap-4">
                          <div className="w-16 h-16 flex-shrink-0">
                            <img
                              src={item.product.images.image1}
                              alt={item.product.name}
                              className="w-full h-full object-cover rounded"
                            />
                          </div>
                          <div>
                            <h4 className="font-medium">{item.product.name}</h4>
                            <p className="text-sm text-muted">{item.product.brand}</p>
                            {(item.selectedColor || item.selectedSize) && (
                              <div className="text-xs text-muted mt-1">
                                {item.selectedColor && <span>Color: {item.selectedColor} </span>}
                                {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="col-span-2 flex items-center justify-center">
                        {item.quantity}
                      </div>
                      <div className="col-span-2 flex items-center justify-center">
                        {formatINR(item.price)}
                      </div>
                      <div className="col-span-2 flex items-center justify-end font-medium">
                        {formatINR(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {order.notes && (
                <div className="mt-8 p-6 bg-canvas rounded-lg">
                  <h4 className="font-medium mb-2">Order Notes</h4>
                  <p className="text-muted">{order.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderDetails;