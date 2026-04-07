import React, { useState, useEffect, ChangeEvent } from 'react';
import axios from 'axios';
import { 
  DollarSign, ShoppingBag, Package, Users,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { baseurl } from '../../Constant/Base';
import { useGetToken } from '../../Token/getToken';
import { SellerLayout } from './SellerLayout';
import {
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface SalesDataPoint {
  date: string;
  sales: number;
  orders: number;
}

interface CategoryDataPoint {
  name: string;
  value: number;
  [key: string]: any;
}

interface MonthlyTrendPoint {
  month: string;
  current: number;
  previous: number;
}

interface SummaryData {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  avgOrderValue: number;
  growthRate: number;
}

interface ReportData {
  summary: SummaryData;
  salesData: SalesDataPoint[];
  categoryData: CategoryDataPoint[];
  monthlyTrends: MonthlyTrendPoint[];
}

const SalesReportPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<string>('month');
  const [loading, setLoading] = useState<boolean>(true);
  const [reportData, setReportData] = useState<ReportData>({
    summary: {
      totalSales: 0,
      totalOrders: 0,
      totalProducts: 0,
      avgOrderValue: 0,
      growthRate: 0
    },
    salesData: [],
    categoryData: [],
    monthlyTrends: []
  });

  const navigate = useNavigate();
  const api = axios.create({ baseURL: baseurl });
  const token = useGetToken("sellerToken");

  const fetchReportData = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await api.get(`/seller/sales-report?range=${timeRange}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReportData(response.data);
    } catch {
      toast.error('Failed to load sales report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchReportData();
    } else {
      toast.error('Authentication required');
      navigate('/seller/login');
    }
  }, [timeRange, token, navigate]);

  const handleTimeRangeChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    setTimeRange(e.target.value);
  };

  const COLORS: string[] = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const StatCard = ({ title, value }: { title: string; value: number }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className="text-2xl font-bold mt-2">
        {(title.includes('Sales') || title.includes('Order Value')) 
          ? `₹${value.toLocaleString()}` 
          : value.toLocaleString()}
      </h3>
    </div>
  );

  if (loading) {
    return (
      <SellerLayout title="Sales Report">
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
        </div>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout title="Sales Report" subtitle="Track your sales analytics">
      
      <div className="flex justify-end gap-4 mb-6">
        <select value={timeRange} onChange={handleTimeRangeChange} className="border px-3 py-2 rounded">
          <option value="week">Last 7 Days</option>
          <option value="month">This Month</option>
          <option value="quarter">Last 3 Months</option>
          <option value="year">This Year</option>
        </select>
        <button onClick={fetchReportData}>
          <RefreshCw />
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Sales" value={reportData.summary.totalSales} />
        <StatCard title="Total Orders" value={reportData.summary.totalOrders} />
        <StatCard title="Products Sold" value={reportData.summary.totalProducts} />
        <StatCard title="Avg Order Value" value={reportData.summary.avgOrderValue} />
      </div>

      <div className="bg-white p-6 rounded-xl mb-8">
        <h3 className="mb-4 font-semibold">Sales Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <RechartsLineChart data={reportData.salesData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line dataKey="sales" stroke="#8884d8" />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-6 rounded-xl">
        <h3 className="mb-4 font-semibold">Category Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <RechartsPieChart>
            <Pie data={reportData.categoryData} dataKey="value" nameKey="name">
              {reportData.categoryData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>

    </SellerLayout>
  );
};

export default SalesReportPage;