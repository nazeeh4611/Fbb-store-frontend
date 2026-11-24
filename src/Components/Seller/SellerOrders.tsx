import React, { useState, useEffect, ChangeEvent } from 'react';
import {
  Package, Truck, CheckCircle, XCircle, Clock,
  Search, Download, Eye, MapPin, Phone, Mail, User,
  CreditCard, Hash, PackageCheck
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useGetToken } from '../../Token/getToken';
import { SellerLayout } from './SellerLayout';

import api from '../../lib/api';
interface User {
  name?: string;
  email?: string;
  phone?: string;
  address?: {
    shipping?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      pincode?: string;
      phone?: string;
    };
    billing?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      pincode?: string;
      phone?: string;
    };
  };
}

interface Product {
  name?: string;
  brand?: string;
  images?: {
    image1: string;
  };
}

interface Address {
  name?: string;
  phone?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  email?: string;
}

interface SellerOrder {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  trackingNumber?: string;
  shippedAt?: string;
  sellerStatus?: string;
}

interface OrderItem {
  product?: Product;
  quantity: number;
  price: number;
  selectedColor?: string;
  selectedSize?: string;
  itemStatus?: string;
  sellerStatus?: string;
}

interface Order {
  orderId: string;
  user?: User;
  items: OrderItem[];
  total: number;
  status: string;
  sellerStatus?: string;
  orderDate: string;
  createdAt: string;
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress?: Address;
  billingAddress?: Address;
  sellerOrder?: SellerOrder;
  subtotal?: number;
  shipping?: number;
  tax?: number;
}

const SellerOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const navigate = useNavigate();
  const token = useGetToken("sellerToken");


  useEffect(() => {
    if (!token) {
      return;
    }
    fetchOrders();
  }, [token, statusFilter]);

  const fetchOrders = async (): Promise<void> => {
    if (!token) {
      toast.error('Authentication required');
      navigate('/seller/login');
      return;
    }

    try {
      setLoading(true);
      const response = await api.get('/seller/orders', {
        params: {
          status: statusFilter === 'all' ? undefined : statusFilter,
          search: searchQuery || undefined
        },
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data.orders || []);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/seller/login');
      } else {
        toast.error(error.response?.data?.message || 'Failed to load orders');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateItemStatus = async (
    orderId: string,
    itemId: string | null,
    status: string,
    trackingNumber: string = ''
  ): Promise<void> => {
    if (!token) return;
    try {
      setUpdatingStatus(true);
      
      const payload: any = {
        orderId,
        status,
        trackingNumber: trackingNumber || undefined
      };
      
      if (itemId) {
        payload.itemId = itemId;
      }
      
      await api.post('/seller/orders/update-status', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      toast.success(`Order ${status === 'accepted' ? 'accepted' : 
                         status === 'processing' ? 'moved to processing' :
                         status === 'shipped' ? 'marked as shipped' :
                         status === 'delivered' ? 'marked as delivered' :
                         status === 'cancelled' ? 'cancelled' : 'updated'} successfully`);
      fetchOrders();
      
      if (selectedOrder && selectedOrder.orderId === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status, sellerStatus: status } : null);
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to update status';
      toast.error(errorMessage);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending': return 'bg-canvas text-ink';
      case 'accepted': return 'bg-canvas text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-canvas text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-canvas text-ink';
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getTotalItems = (order: Order): number => {
    return order.items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleStatusFilterChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    setStatusFilter(e.target.value);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      fetchOrders();
    }
  };

  const handleMarkAsShipped = (orderId: string): void => {
    const trackingNumber = prompt('Enter tracking number:');
    if (trackingNumber && trackingNumber.trim()) {
      updateItemStatus(orderId, null, 'shipped', trackingNumber.trim());
    } else if (trackingNumber !== null && trackingNumber === '') {
      toast.error('Please enter a valid tracking number');
    }
  };

  const handleExportOrders = (): void => {
    toast.success('Export feature coming soon!');
  };

  if (loading) {
    return (
      <SellerLayout title="Orders">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-line border-t-black rounded-full animate-spin"></div>
        </div>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout title="Orders" subtitle="Manage your product orders and shipments">
      <div className="mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleSearch}
              className="pl-10 pr-4 py-2 border border-line rounded-lg focus:ring-2 focus:ring-ink focus:border-transparent w-full"
            />
          </div>

          <select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="px-4 py-2 border border-line rounded-lg focus:ring-2 focus:ring-ink focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button
            onClick={handleExportOrders}
            className="p-2 border border-line rounded-lg hover:bg-canvas transition-colors"
            title="Export Orders"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-md  border border-line overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="h-12 w-12 text-muted mx-auto mb-4" />
            <h3 className="text-lg font-medium text-ink mb-2">No orders found</h3>
            <p className="text-ink-soft">No orders match your current filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-canvas">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {orders.map((order) => (
                  <tr key={order.orderId} className="hover:bg-canvas transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-ink">{order.orderId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-ink">{order.user?.name || 'Guest'}</div>
                        <div className="text-sm text-muted">{order.user?.email || 'No email'}</div>
                        <div className="text-sm text-muted">{order.user?.phone || 'No phone'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted" />
                        <span>{getTotalItems(order)} items</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">₹{order.total?.toLocaleString() || order.sellerOrder?.total?.toLocaleString() || '0'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.sellerStatus || order.status)} capitalize`}>
                        {order.sellerStatus || order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
                      {formatDate(order.createdAt || order.orderDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1 text-muted hover:text-ink-soft transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {(order.sellerStatus || order.status) === 'pending' && (
                          <>
                            <button
                              onClick={() => updateItemStatus(order.orderId, null, 'accepted')}
                              disabled={updatingStatus}
                              className="p-1 text-green-600 hover:text-green-800 disabled:opacity-50 transition-colors"
                              title="Accept Order"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm('Are you sure you want to cancel this order?')) {
                                  updateItemStatus(order.orderId, null, 'cancelled');
                                }
                              }}
                              disabled={updatingStatus}
                              className="p-1 text-sale hover:text-red-800 disabled:opacity-50 transition-colors"
                              title="Reject/Cancel Order"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}

                        {(order.sellerStatus || order.status) === 'accepted' && (
                          <>
                            <button
                              onClick={() => updateItemStatus(order.orderId, null, 'processing')}
                              disabled={updatingStatus}
                              className="p-1 text-ink hover:text-blue-800 disabled:opacity-50 transition-colors"
                              title="Start Processing"
                            >
                              <Clock className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm('Are you sure you want to cancel this order?')) {
                                  updateItemStatus(order.orderId, null, 'cancelled');
                                }
                              }}
                              disabled={updatingStatus}
                              className="p-1 text-sale hover:text-red-800 disabled:opacity-50 transition-colors"
                              title="Cancel Order"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}

                        {(order.sellerStatus || order.status) === 'processing' && (
                          <>
                            <button
                              onClick={() => handleMarkAsShipped(order.orderId)}
                              disabled={updatingStatus}
                              className="p-1 text-ink hover:text-indigo-800 disabled:opacity-50 transition-colors"
                              title="Mark as Shipped"
                            >
                              <Truck className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm('Are you sure you want to cancel this order?')) {
                                  updateItemStatus(order.orderId, null, 'cancelled');
                                }
                              }}
                              disabled={updatingStatus}
                              className="p-1 text-sale hover:text-red-800 disabled:opacity-50 transition-colors"
                              title="Cancel Order"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}

                        {(order.sellerStatus || order.status) === 'shipped' && (
                          <>
                            <button
                              onClick={() => updateItemStatus(order.orderId, null, 'delivered')}
                              disabled={updatingStatus}
                              className="p-1 text-green-600 hover:text-green-800 disabled:opacity-50 transition-colors"
                              title="Mark as Delivered"
                            >
                              <PackageCheck className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm('Are you sure you want to cancel this shipped order?')) {
                                  updateItemStatus(order.orderId, null, 'cancelled');
                                }
                              }}
                              disabled={updatingStatus}
                              className="p-1 text-sale hover:text-red-800 disabled:opacity-50 transition-colors"
                              title="Cancel Order"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}

                        {(order.sellerStatus || order.status) === 'delivered' && (
                          <span className="text-xs text-green-600 font-medium px-2 py-1 bg-green-50 rounded-full">
                            Completed
                          </span>
                        )}

                        {(order.sellerStatus || order.status) === 'cancelled' && (
                          <span className="text-xs text-sale font-medium px-2 py-1 bg-sale-soft rounded-full">
                            Cancelled
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedOrder && (
        <div
          className="fixed inset-0 bg-black  flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedOrder(null);
          }}
        >
          <div className="bg-white rounded-md shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-ink">Order Details</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-muted hover:text-ink-soft text-2xl transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-r from-canvas to-canvas p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-ink mb-3 flex items-center gap-2">
                    <Hash className="h-5 w-5" />
                    Order Information
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-muted">Order ID</p>
                      <p className="font-medium text-sm">{selectedOrder.orderId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted">Order Date</p>
                      <p className="font-medium text-sm">{formatDate(selectedOrder.createdAt || selectedOrder.orderDate)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted">Payment Method</p>
                      <p className="font-medium text-sm capitalize">{selectedOrder.paymentMethod}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted">Payment Status</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${selectedOrder.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' : 'bg-canvas text-ink'}`}>
                        {selectedOrder.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-canvas p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-ink mb-3 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Customer Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-2">
                      <User className="h-4 w-4 text-muted mt-0.5" />
                      <div>
                        <p className="text-xs text-muted">Full Name</p>
                        <p className="font-medium">{selectedOrder.user?.name || 'Guest'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Mail className="h-4 w-4 text-muted mt-0.5" />
                      <div>
                        <p className="text-xs text-muted">Email Address</p>
                        <p className="font-medium">{selectedOrder.user?.email || 'No email provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Phone className="h-4 w-4 text-muted mt-0.5" />
                      <div>
                        <p className="text-xs text-muted">Phone Number</p>
                        <p className="font-medium">{selectedOrder.user?.phone || selectedOrder.shippingAddress?.phone || 'No phone provided'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-canvas p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-ink mb-3 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-ink" />
                    Shipping Address
                  </h3>
                  {selectedOrder.shippingAddress ? (
                    <div className="space-y-2">
                      <p className="font-medium">{selectedOrder.shippingAddress.name || selectedOrder.user?.name}</p>
                      <p className="text-ink-soft">{selectedOrder.shippingAddress.street || 'Street address not provided'}</p>
                      <p className="text-ink-soft">
                        {selectedOrder.shippingAddress.city && selectedOrder.shippingAddress.state 
                          ? `${selectedOrder.shippingAddress.city}, ${selectedOrder.shippingAddress.state}`
                          : 'City, State not provided'}
                      </p>
                      <p className="text-ink-soft">
                        {selectedOrder.shippingAddress.pincode 
                          ? `Pincode: ${selectedOrder.shippingAddress.pincode}`
                          : 'Pincode not provided'}
                      </p>
                      <p className="text-ink-soft">{selectedOrder.shippingAddress.country || 'Country not provided'}</p>
                      <p className="text-ink-soft flex items-center gap-2 mt-2">
                        <Phone className="h-4 w-4" />
                        {selectedOrder.shippingAddress.phone || selectedOrder.user?.phone || 'No phone provided'}
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted italic">No shipping address available</p>
                  )}
                </div>

                <div className="bg-canvas p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-ink mb-3 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-green-600" />
                    Billing Address
                  </h3>
                  {selectedOrder.billingAddress ? (
                    <div className="space-y-2">
                      <p className="font-medium">{selectedOrder.billingAddress.name || selectedOrder.user?.name}</p>
                      <p className="text-ink-soft">{selectedOrder.billingAddress.street || 'Street address not provided'}</p>
                      <p className="text-ink-soft">
                        {selectedOrder.billingAddress.city && selectedOrder.billingAddress.state 
                          ? `${selectedOrder.billingAddress.city}, ${selectedOrder.billingAddress.state}`
                          : 'City, State not provided'}
                      </p>
                      <p className="text-ink-soft">
                        {selectedOrder.billingAddress.pincode 
                          ? `Pincode: ${selectedOrder.billingAddress.pincode}`
                          : 'Pincode not provided'}
                      </p>
                      <p className="text-ink-soft">{selectedOrder.billingAddress.country || 'Country not provided'}</p>
                      <p className="text-ink-soft flex items-center gap-2 mt-2">
                        <Phone className="h-4 w-4" />
                        {selectedOrder.billingAddress.phone || selectedOrder.user?.phone || 'No phone provided'}
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted italic">Same as shipping address</p>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-ink mb-3">Items Ordered</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-canvas rounded-lg">
                        <img
                          src={item.product?.images?.image1 || 'https://via.placeholder.com/64'}
                          alt={item.product?.name || 'Product'}
                          className="w-16 h-16 object-cover rounded"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/64';
                          }}
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{item.product?.name || 'Unnamed Product'}</h4>
                          <p className="text-sm text-ink-soft">{item.product?.brand || 'No brand'}</p>
                          <div className="flex flex-wrap gap-4 text-sm text-muted mt-1">
                            <span>Quantity: {item.quantity}</span>
                            {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                            {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">₹{(item.price * item.quantity).toLocaleString()}</div>
                          <div className="text-xs text-muted">₹{item.price.toLocaleString()} each</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-ink mb-3">Order Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-ink-soft">Subtotal</span>
                      <span className="font-medium">₹{selectedOrder.sellerOrder?.subtotal?.toLocaleString() || selectedOrder.subtotal?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-soft">Shipping Charges</span>
                      <span className="font-medium">₹{selectedOrder.sellerOrder?.shipping?.toLocaleString() || selectedOrder.shipping?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-soft">Tax (GST)</span>
                      <span className="font-medium">₹{selectedOrder.sellerOrder?.tax?.toLocaleString() || selectedOrder.tax?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex justify-between border-t border-line pt-2 mt-2">
                      <span className="font-bold text-lg">Total Amount</span>
                      <span className="font-bold text-lg text-green-600">₹{selectedOrder.sellerOrder?.total?.toLocaleString() || selectedOrder.total?.toLocaleString() || '0'}</span>
                    </div>
                  </div>
                </div>

                {selectedOrder.sellerOrder?.trackingNumber && (
                  <div className="bg-canvas p-4 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-2">Shipping Information</h3>
                    <p className="text-blue-800">Tracking Number: {selectedOrder.sellerOrder.trackingNumber}</p>
                    {selectedOrder.sellerOrder.shippedAt && (
                      <p className="text-blue-800 text-sm mt-1">Shipped on: {formatDate(selectedOrder.sellerOrder.shippedAt)}</p>
                    )}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-line">
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="px-4 py-2 border border-line text-ink-soft rounded-lg hover:bg-canvas transition-colors"
                  >
                    Close
                  </button>
                  
                  {(selectedOrder.sellerStatus || selectedOrder.status) === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          updateItemStatus(selectedOrder.orderId, null, 'accepted');
                          setSelectedOrder(null);
                        }}
                        disabled={updatingStatus}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
                      >
                        {updatingStatus ? 'Processing...' : 'Accept Order'}
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to cancel this order?')) {
                            updateItemStatus(selectedOrder.orderId, null, 'cancelled');
                            setSelectedOrder(null);
                          }
                        }}
                        disabled={updatingStatus}
                        className="px-4 py-2 bg-sale text-white rounded-lg hover:bg-sale disabled:opacity-50 transition-colors"
                      >
                        {updatingStatus ? 'Processing...' : 'Cancel Order'}
                      </button>
                    </>
                  )}

                  {(selectedOrder.sellerStatus || selectedOrder.status) === 'accepted' && (
                    <>
                      <button
                        onClick={() => {
                          updateItemStatus(selectedOrder.orderId, null, 'processing');
                          setSelectedOrder(null);
                        }}
                        disabled={updatingStatus}
                        className="px-4 py-2 bg-ink text-white rounded-lg hover:bg-black disabled:opacity-50 transition-colors"
                      >
                        {updatingStatus ? 'Processing...' : 'Start Processing'}
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to cancel this order?')) {
                            updateItemStatus(selectedOrder.orderId, null, 'cancelled');
                            setSelectedOrder(null);
                          }
                        }}
                        disabled={updatingStatus}
                        className="px-4 py-2 bg-sale text-white rounded-lg hover:bg-sale disabled:opacity-50 transition-colors"
                      >
                        {updatingStatus ? 'Processing...' : 'Cancel Order'}
                      </button>
                    </>
                  )}

                  {(selectedOrder.sellerStatus || selectedOrder.status) === 'processing' && (
                    <>
                      <button
                        onClick={() => {
                          const trackingNumber = prompt('Enter tracking number:');
                          if (trackingNumber && trackingNumber.trim()) {
                            updateItemStatus(selectedOrder.orderId, null, 'shipped', trackingNumber.trim());
                            setSelectedOrder(null);
                          } else if (trackingNumber !== null && trackingNumber === '') {
                            toast.error('Please enter a valid tracking number');
                          }
                        }}
                        disabled={updatingStatus}
                        className="px-4 py-2 bg-ink text-white rounded-lg hover:bg-black disabled:opacity-50 transition-colors"
                      >
                        {updatingStatus ? 'Processing...' : 'Mark as Shipped'}
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to cancel this order?')) {
                            updateItemStatus(selectedOrder.orderId, null, 'cancelled');
                            setSelectedOrder(null);
                          }
                        }}
                        disabled={updatingStatus}
                        className="px-4 py-2 bg-sale text-white rounded-lg hover:bg-sale disabled:opacity-50 transition-colors"
                      >
                        {updatingStatus ? 'Processing...' : 'Cancel Order'}
                      </button>
                    </>
                  )}

                  {(selectedOrder.sellerStatus || selectedOrder.status) === 'shipped' && (
                    <>
                      <button
                        onClick={() => {
                          updateItemStatus(selectedOrder.orderId, null, 'delivered');
                          setSelectedOrder(null);
                        }}
                        disabled={updatingStatus}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
                      >
                        {updatingStatus ? 'Processing...' : 'Mark as Delivered'}
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to cancel this shipped order?')) {
                            updateItemStatus(selectedOrder.orderId, null, 'cancelled');
                            setSelectedOrder(null);
                          }
                        }}
                        disabled={updatingStatus}
                        className="px-4 py-2 bg-sale text-white rounded-lg hover:bg-sale disabled:opacity-50 transition-colors"
                      >
                        {updatingStatus ? 'Processing...' : 'Cancel Order'}
                      </button>
                    </>
                  )}

                  {(selectedOrder.sellerStatus || selectedOrder.status) === 'delivered' && (
                    <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium">
                      Order Completed
                    </span>
                  )}

                  {(selectedOrder.sellerStatus || selectedOrder.status) === 'cancelled' && (
                    <span className="px-4 py-2 bg-red-100 text-sale rounded-lg font-medium">
                      Order Cancelled
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </SellerLayout>
  );
};

export default SellerOrders;