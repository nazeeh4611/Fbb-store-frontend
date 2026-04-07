// import React, { useState, useEffect, ChangeEvent } from 'react';
// import axios from 'axios';
// import { 
//   BarChart3, LineChart, PieChart, TrendingUp, TrendingDown,
//   DollarSign, ShoppingBag, Package, Users, Calendar,
//   Download, RefreshCw, ArrowUpRight, ArrowDownRight,
//   Menu, X, LogOut, Phone
// } from 'lucide-react';
// import { toast } from 'react-hot-toast';
// import { useNavigate } from 'react-router-dom';
// import { baseurl } from '../../Constant/Base';
// import { useGetToken } from '../../Token/getToken';
// import {
//   BarChart,
//   Bar,
//   LineChart as RechartsLineChart,
//   Line,
//   PieChart as RechartsPieChart,
//   Pie,
//   Cell,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer
// } from 'recharts';

// interface SalesDataPoint {
//   date: string;
//   sales: number;
//   orders: number;
// }

// interface CategoryDataPoint {
//   name: string;
//   value: number;
// }

// interface TopProduct {
//   name: string;
//   brand: string;
//   category: string;
//   image: string;
//   unitsSold: number;
//   revenue: number;
//   growth: number;
// }

// interface MonthlyTrendPoint {
//   month: string;
//   current: number;
//   previous: number;
// }

// interface SummaryData {
//   totalSales: number;
//   totalOrders: number;
//   totalProducts: number;
//   avgOrderValue: number;
//   growthRate: number;
// }

// interface ReportData {
//   summary: SummaryData;
//   salesData: SalesDataPoint[];
//   topProducts: TopProduct[];
//   categoryData: CategoryDataPoint[];
//   monthlyTrends: MonthlyTrendPoint[];
// }

// const SalesReportPage: React.FC = () => {
//   const [timeRange, setTimeRange] = useState<string>('month');
//   const [loading, setLoading] = useState<boolean>(true);
//   const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
//   const [reportData, setReportData] = useState<ReportData>({
//     summary: {
//       totalSales: 0,
//       totalOrders: 0,
//       totalProducts: 0,
//       avgOrderValue: 0,
//       growthRate: 0
//     },
//     salesData: [],
//     topProducts: [],
//     categoryData: [],
//     monthlyTrends: []
//   });

//   const navigate = useNavigate();
//   const api = axios.create({ baseURL: baseurl });
//   const token = useGetToken("sellerToken");

//   const fetchReportData = async (): Promise<void> => {
//     try {
//       setLoading(true);
//       const response = await api.get<ReportData>(`/seller/sales-report?range=${timeRange}`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setReportData(response.data);
//     } catch (error) {
//       console.error('Error fetching report:', error);
//       toast.error('Failed to load sales report');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (token) {
//       fetchReportData();
//     } else {
//       toast.error('Authentication required');
//       navigate('/seller/login');
//     }
//   }, [timeRange, token]);

//   const handleLogout = (): void => {
//     localStorage.removeItem('sellerToken');
//     navigate('/seller/login');
//   };

//   const toggleSidebar = (): void => setSidebarOpen(!sidebarOpen);

//   const handleTimeRangeChange = (e: ChangeEvent<HTMLSelectElement>): void => {
//     setTimeRange(e.target.value);
//   };

//   const COLORS: string[] = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

//   const StatCard = ({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) => (
//     <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
//       <div className="flex justify-between items-start">
//         <div>
//           <p className="text-sm text-gray-500 font-medium">{title}</p>
//           <h3 className="text-2xl font-bold text-gray-800 mt-2">
//             {title.includes('Sales') || title.includes('Order Value') 
//               ? `₹${value.toLocaleString()}` 
//               : value.toLocaleString()}
//           </h3>
//         </div>
//         <div className={`p-3 ${color} text-white rounded-lg`}>
//           {icon}
//         </div>
//       </div>
//     </div>
//   );

//   const Sidebar = () => (
//     <aside className="w-full bg-white h-full flex flex-col">
//       <div className="p-6 flex-1">
//         <div className="mb-8">
//           <h1 className="text-2xl font-bold text-gray-800">FBB STORE</h1>
//           <p className="text-sm text-gray-500 mt-1">Seller Dashboard</p>
//         </div>
        
//         <nav className="space-y-1">
//           <button 
//             onClick={() => navigate('/seller/dashboard')}
//             className="w-full text-left py-3 px-4 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all flex items-center space-x-3"
//           >
//             <BarChart3 size={20} />
//             <span>Dashboard</span>
//           </button>
//           <button 
//             onClick={() => navigate('/seller/products')}
//             className="w-full text-left py-3 px-4 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all flex items-center space-x-3"
//           >
//             <Package size={20} />
//             <span>Products</span>
//           </button>
//           <button 
//             onClick={() => navigate('/seller/orders')}
//             className="w-full text-left py-3 px-4 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all flex items-center space-x-3"
//           >
//             <ShoppingBag size={20} />
//             <span>Orders</span>
//           </button>
//           <button 
//             onClick={() => navigate('/seller/sales-report')}
//             className="w-full text-left py-3 px-4 rounded-lg bg-blue-50 text-blue-600 font-semibold hover:bg-blue-100 transition-all flex items-center space-x-3"
//           >
//             <TrendingUp size={20} />
//             <span>Sales Report</span>
//           </button>
//         </nav>
//       </div>
      
//       <div className="p-6 border-t border-gray-200 space-y-3">
//         <button
//           onClick={() => window.open(`https://wa.me/7012551507`, '_blank')}
//           className="w-full py-3 px-4 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 transition-all flex items-center justify-center space-x-2"
//         >
//           <Phone size={20} />
//           <span>Contact Admin</span>
//         </button>
        
//         <button
//           onClick={handleLogout}
//           className="w-full py-3 px-4 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-all flex items-center justify-center space-x-2"
//         >
//           <LogOut size={20} />
//           <span>Logout</span>
//         </button>
//       </div>
//     </aside>
//   );

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="flex">
//         <div className={`fixed lg:relative inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 lg:translate-x-0 ${
//           sidebarOpen ? 'translate-x-0' : '-translate-x-full'
//         }`}>
//           <div className="flex justify-between items-center p-4 lg:hidden">
//             <h2 className="text-xl font-bold text-gray-800">Menu</h2>
//             <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-gray-100">
//               <X size={24} />
//             </button>
//           </div>
//           <Sidebar />
//         </div>

//         <main className="flex-1 p-4 lg:p-8">
//           <div className="mb-6 flex items-center justify-between lg:justify-end">
//             <button onClick={toggleSidebar} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
//               <Menu size={24} />
//             </button>
//             <h1 className="text-2xl font-bold text-gray-800 lg:hidden">Sales Report</h1>
//           </div>

//           <div className="mb-8">
//             <h1 className="text-3xl font-bold text-gray-800 hidden lg:block">Sales Analytics</h1>
//             <p className="text-gray-600 mt-2 hidden lg:block">Track your sales performance and insights</p>
//           </div>

//           <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
//             <div></div>
//             <div className="flex items-center gap-4">
//               <select 
//                 value={timeRange} 
//                 onChange={handleTimeRangeChange} 
//                 className="px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 <option value="week">Last 7 Days</option>
//                 <option value="month">This Month</option>
//                 <option value="quarter">Last 3 Months</option>
//                 <option value="year">This Year</option>
//               </select>
//               <button onClick={fetchReportData} className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
//                 <RefreshCw size={20} />
//               </button>
//               <button 
//                 onClick={() => {
//                   toast.success('Export feature coming soon!');
//                 }}
//                 className="px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-all flex items-center gap-2"
//               >
//                 <Download size={20} />
//                 <span>Export Report</span>
//               </button>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//             <StatCard 
//               title="Total Sales" 
//               value={reportData.summary.totalSales} 
//               icon={<DollarSign size={24} />}
//               color="bg-blue-500"
//             />
//             <StatCard 
//               title="Total Orders" 
//               value={reportData.summary.totalOrders} 
//               icon={<ShoppingBag size={24} />}
//               color="bg-green-500"
//             />
//             <StatCard 
//               title="Products Sold" 
//               value={reportData.summary.totalProducts} 
//               icon={<Package size={24} />}
//               color="bg-purple-500"
//             />
//             <StatCard 
//               title="Avg Order Value" 
//               value={reportData.summary.avgOrderValue} 
//               icon={<Users size={24} />}
//               color="bg-orange-500"
//             />
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//             <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//               <div className="flex justify-between items-center mb-6">
//                 <h3 className="text-lg font-semibold text-gray-800">Sales Trend</h3>
//                 <LineChart className="text-blue-500" size={24} />
//               </div>
//               <div className="h-80">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <RechartsLineChart data={reportData.salesData}>
//                     <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//                     <XAxis dataKey="date" stroke="#666" />
//                     <YAxis stroke="#666" />
//                     <Tooltip 
                    
//                     />
//                     <Legend />
//                     <Line 
//                       type="monotone" 
//                       dataKey="sales" 
//                       stroke="#8884d8" 
//                       strokeWidth={2}
//                       dot={{ r: 4 }}
//                       activeDot={{ r: 6 }}
//                       name="Sales (₹)"
//                     />
//                   </RechartsLineChart>
//                 </ResponsiveContainer>
//               </div>
//             </div>

//             <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//               <div className="flex justify-between items-center mb-6">
//                 <h3 className="text-lg font-semibold text-gray-800">Category Distribution</h3>
//                 <PieChart className="text-green-500" size={24} />
//               </div>
//               <div className="h-80">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <RechartsPieChart>
//                     <Pie
//                       data={reportData.categoryData}
//                       cx="50%"
//                       cy="50%"
//                       labelLine={false}
//                       label={(entry) => entry.name}
//                       outerRadius={80}
//                       fill="#8884d8"
//                       dataKey="value"
//                     >
//                       {reportData.categoryData.map((entry, index) => (
//                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                       ))}
//                     </Pie>
//                     <Tooltip formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Value']} />
//                     <Legend />
//                   </RechartsPieChart>
//                 </ResponsiveContainer>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
//             <div className="flex justify-between items-center mb-6">
//               <h3 className="text-lg font-semibold text-gray-800">Top Selling Products</h3>
//               <BarChart3 className="text-purple-500" size={24} />
//             </div>
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead>
//                   <tr className="border-b border-gray-200">
//                     <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Product</th>
//                     <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
//                     <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Units Sold</th>
//                     <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Revenue</th>
//                     <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Growth</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {reportData.topProducts.length > 0 ? (
//                     reportData.topProducts.map((product, index) => (
//                       <tr key={index} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
//                         <td className="px-4 py-4">
//                           <div className="flex items-center gap-3">
//                             <img 
//                               src={product.image || 'https://via.placeholder.com/40?text=No+Image'} 
//                               alt={product.name} 
//                               className="w-10 h-10 rounded-lg object-cover bg-gray-100"
//                               onError={(e) => {
//                                 const target = e.target as HTMLImageElement;
//                                 target.src = 'https://via.placeholder.com/40?text=No+Image';
//                               }}
//                             />
//                             <div>
//                               <p className="font-medium text-gray-800">{product.name}</p>
//                               <p className="text-sm text-gray-500">{product.brand}</p>
//                             </div>
//                           </div>
//                         </td>
//                         <td className="px-4 py-4">
//                           <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
//                             {product.category}
//                           </span>
//                         </td>
//                         <td className="px-4 py-4">
//                           <div className="flex items-center gap-2">
//                             <span className="font-medium">{product.unitsSold}</span>
//                             <span className="text-sm text-gray-500">units</span>
//                           </div>
//                         </td>
//                         <td className="px-4 py-4">
//                           <span className="font-bold text-gray-800">₹{product.revenue.toLocaleString()}</span>
//                         </td>
//                         <td className="px-4 py-4">
//                           <div className={`flex items-center gap-1 ${product.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
//                             {product.growth >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
//                             <span className="font-medium">{Math.abs(product.growth)}%</span>
//                           </div>
//                         </td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
//                         No products data available
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//             <h3 className="text-lg font-semibold text-gray-800 mb-6">Monthly Performance</h3>
//             <div className="h-96">
//               <ResponsiveContainer width="100%" height="100%">
//                 <BarChart data={reportData.monthlyTrends}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//                   <XAxis dataKey="month" stroke="#666" />
//                   <YAxis stroke="#666" />
//                   <Tooltip 
//                     formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
//                   />
//                   <Legend />
//                   <Bar dataKey="current" fill="#8884d8" name="Current Month" radius={[4, 4, 0, 0]} />
//                   <Bar dataKey="previous" fill="#82ca9d" name="Previous Month" radius={[4, 4, 0, 0]} />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default SalesReportPage;



// import React, { useState, useEffect, ChangeEvent } from 'react';
// import axios from 'axios';
// import {
//   BarChart3,
//   TrendingUp,
//   TrendingDown,
//   DollarSign,
//   ShoppingBag,
//   Package,
//   Users,
//   Download,
//   RefreshCw,
//   Menu,
//   X,
//   LogOut,
//   Phone
// } from 'lucide-react';
// import { toast } from 'react-hot-toast';
// import { useNavigate } from 'react-router-dom';
// import { baseurl } from '../../Constant/Base';
// import { useGetToken } from '../../Token/getToken';
// import {
//   BarChart,
//   Bar,
//   LineChart as RechartsLineChart,
//   Line,
//   PieChart as RechartsPieChart,
//   Pie,
//   Cell,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer
// } from 'recharts';

// /* ===================== TYPES ===================== */

// interface SalesDataPoint {
//   date: string;
//   sales: number;
//   orders: number;
// }

// interface CategoryDataPoint {
//   name: string;
//   value: number;
//   [key: string]: string | number;

// }

// interface TopProduct {
//   name: string;
//   brand: string;
//   category: string;
//   image: string;
//   unitsSold: number;
//   revenue: number;
//   growth: number;
// }

// interface MonthlyTrendPoint {
//   month: string;
//   current: number;
//   previous: number;
// }

// interface SummaryData {
//   totalSales: number;
//   totalOrders: number;
//   totalProducts: number;
//   avgOrderValue: number;
//   growthRate: number;
// }

// interface ReportData {
//   summary: SummaryData;
//   salesData: SalesDataPoint[];
//   topProducts: TopProduct[];
//   categoryData: CategoryDataPoint[];
//   monthlyTrends: MonthlyTrendPoint[];
// }

// interface StatCardProps {
//   title: string;
//   value: number;
//   icon: React.ReactNode;
//   color: string;
// }

// /* ===================== COMPONENT ===================== */

// const SalesReportPage: React.FC = () => {
//   const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
//   const [loading, setLoading] = useState<boolean>(true);
//   const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

//   const [reportData, setReportData] = useState<ReportData>({
//     summary: {
//       totalSales: 0,
//       totalOrders: 0,
//       totalProducts: 0,
//       avgOrderValue: 0,
//       growthRate: 0
//     },
//     salesData: [],
//     topProducts: [],
//     categoryData: [],
//     monthlyTrends: []
//   });

//   const navigate = useNavigate();
//   const token = useGetToken('sellerToken');

//   const api = axios.create({
//     baseURL: baseurl
//   });

//   const fetchReportData = async (): Promise<void> => {
//     try {
//       setLoading(true);
//       const { data } = await api.get<ReportData>(
//         `/seller/sales-report?range=${timeRange}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setReportData(data);
//     } catch {
//       toast.error('Failed to load sales report');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (!token) {
//       toast.error('Authentication required');
//       navigate('/seller/login');
//       return;
//     }
//     fetchReportData();
//   }, [timeRange, token, navigate]);

//   const handleLogout = (): void => {
//     localStorage.removeItem('sellerToken');
//     navigate('/seller/login');
//   };

//   const handleTimeRangeChange = (e: ChangeEvent<HTMLSelectElement>): void => {
//     setTimeRange(e.target.value as typeof timeRange);
//   };

//   const COLORS: string[] = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

//   /* ===================== SUB COMPONENTS ===================== */

//   const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
//     <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
//       <div className="flex justify-between items-start">
//         <div>
//           <p className="text-sm text-gray-500 font-medium">{title}</p>
//           <h3 className="text-2xl font-bold text-gray-800 mt-2">
//             {title.includes('Sales') || title.includes('Order Value')
//               ? `₹${value.toLocaleString()}`
//               : value.toLocaleString()}
//           </h3>
//         </div>
//         <div className={`p-3 ${color} text-white rounded-lg`}>{icon}</div>
//       </div>
//     </div>
//   );

//   const Sidebar: React.FC = () => (
//     <aside className="w-full bg-white h-full flex flex-col">
//       <div className="p-6 flex-1">
//         <h1 className="text-2xl font-bold text-gray-800">FBB STORE</h1>
//         <p className="text-sm text-gray-500 mb-8">Seller Dashboard</p>

//         <nav className="space-y-1">
//           <button onClick={() => navigate('/seller/dashboard')} className="nav-btn">
//             <BarChart3 size={20} /> <span>Dashboard</span>
//           </button>
//           <button onClick={() => navigate('/seller/products')} className="nav-btn">
//             <Package size={20} /> <span>Products</span>
//           </button>
//           <button onClick={() => navigate('/seller/orders')} className="nav-btn">
//             <ShoppingBag size={20} /> <span>Orders</span>
//           </button>
//           <button className="nav-btn bg-blue-50 text-blue-600 font-semibold">
//             <TrendingUp size={20} /> <span>Sales Report</span>
//           </button>
//         </nav>
//       </div>

//       <div className="p-6 border-t space-y-3">
//         <button
//           onClick={() => window.open('https://wa.me/7012551507', '_blank')}
//           className="btn-green"
//         >
//           <Phone size={20} /> Contact Admin
//         </button>

//         <button onClick={handleLogout} className="btn-red">
//           <LogOut size={20} /> Logout
//         </button>
//       </div>
//     </aside>
//   );

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
//       </div>
//     );
//   }

//   /* ===================== RENDER ===================== */

//   return (
//     <div className="min-h-screen bg-gray-50 flex">
//       <div
//         className={`fixed lg:relative w-64 inset-y-0 bg-white shadow-lg z-30 transform transition-transform ${
//           sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
//         }`}
//       >
//         <div className="lg:hidden flex justify-between p-4">
//           <h2 className="text-xl font-bold">Menu</h2>
//           <button onClick={() => setSidebarOpen(false)}>
//             <X size={24} />
//           </button>
//         </div>
//         <Sidebar />
//       </div>

//       <main className="flex-1 p-6 lg:p-8">
//         {/* Stats */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//           <StatCard title="Total Sales" value={reportData.summary.totalSales} icon={<DollarSign />} color="bg-blue-500" />
//           <StatCard title="Total Orders" value={reportData.summary.totalOrders} icon={<ShoppingBag />} color="bg-green-500" />
//           <StatCard title="Products Sold" value={reportData.summary.totalProducts} icon={<Package />} color="bg-purple-500" />
//           <StatCard title="Avg Order Value" value={reportData.summary.avgOrderValue} icon={<Users />} color="bg-orange-500" />
//         </div>

//         {/* Charts */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//           <div className="card">
//             <ResponsiveContainer width="100%" height={300}>
//               <RechartsLineChart data={reportData.salesData}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="date" />
//                 <YAxis />
//                 <Tooltip />
//                 <Legend />
//                 <Line type="monotone" dataKey="sales" stroke="#8884d8" />
//               </RechartsLineChart>
//             </ResponsiveContainer>
//           </div>

//           <div className="card">
//             <ResponsiveContainer width="100%" height={300}>
//               <RechartsPieChart>
//                 <Pie
//                   data={reportData.categoryData}
//                   dataKey="value"
//                   nameKey="name"
//                   outerRadius={80}
//                   label={({ name }) => name}
//                 >
//                   {reportData.categoryData.map((_, i) => (
//                     <Cell key={i} fill={COLORS[i % COLORS.length]} />
//                   ))}
//                 </Pie>
//                 <Tooltip />
//                 <Legend />
//               </RechartsPieChart>
//             </ResponsiveContainer>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default SalesReportPage;
