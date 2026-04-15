import React, { useState, useEffect, ChangeEvent } from 'react'
import axios from 'axios'
import { RefreshCw } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { baseurl } from '../../Constant/Base'
import { useGetToken } from '../../Token/getToken'
import { SellerLayout } from './SellerLayout'
import {
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts'

interface SalesDataPoint {
  date: string
  sales: number
  orders: number
}

interface CategoryDataPoint {
  name: string
  value: number
}

interface SummaryData {
  totalSales: number
  totalOrders: number
  totalProducts: number
  avgOrderValue: number
  growthRate: number
}

interface ReportData {
  summary: SummaryData
  salesData: SalesDataPoint[]
  categoryData: CategoryDataPoint[]
  monthlyTrends: Array<{ month: string; current: number; previous: number }>
}

const SalesReportPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<string>('month')
  const [loading, setLoading] = useState<boolean>(true)
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
  })

  const navigate = useNavigate()
  const token = useGetToken('sellerToken')

  const fetchReportData = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${baseurl}/seller/sales-report?range=${timeRange}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success && response.data.data) {
        const data = response.data.data
        setReportData({
          summary: {
            totalSales: data.summary?.totalSales || 0,
            totalOrders: data.summary?.totalOrders || 0,
            totalProducts: data.summary?.totalProducts || 0,
            avgOrderValue: data.summary?.avgOrderValue || 0,
            growthRate: data.summary?.growthRate || 0
          },
          salesData: data.salesData || [],
          categoryData: data.categoryData || [],
          monthlyTrends: data.monthlyTrends || []
        })
      } else {
        throw new Error(response.data.message || 'Invalid response format')
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to load sales report')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!token) {
      toast.error('Authentication required')
      navigate('/seller/login')
      return
    }
    fetchReportData()
  }, [timeRange, token, navigate])

  const handleTimeRangeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setTimeRange(e.target.value)
  }

  const COLORS: string[] = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

  const StatCard = ({ title, value }: { title: string; value: number }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className="text-2xl font-bold mt-2">
        {title.includes('Sales') || title.includes('Order Value')
          ? `₹${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : value.toLocaleString()}
      </h3>
    </div>
  )

  if (loading) {
    return (
      <SellerLayout title="Sales Report">
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      </SellerLayout>
    )
  }

  return (
    <SellerLayout title="Sales Report" subtitle="Track your sales analytics">
      <div className="flex justify-end gap-4 mb-6">
        <select
          value={timeRange}
          onChange={handleTimeRangeChange}
          className="border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="week">Last 7 Days</option>
          <option value="month">This Month</option>
          <option value="quarter">Last 3 Months</option>
          <option value="year">This Year</option>
        </select>
        <button
          onClick={fetchReportData}
          className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Sales" value={reportData.summary.totalSales} />
        <StatCard title="Total Orders" value={reportData.summary.totalOrders} />
        <StatCard title="Products Sold" value={reportData.summary.totalProducts} />
        <StatCard title="Avg Order Value" value={reportData.summary.avgOrderValue} />
      </div>

      {reportData.salesData.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Sales Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLineChart data={reportData.salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip
                formatter={(value: any, name: any) => {
                  if (name === 'sales') return [`₹${Number(value).toLocaleString()}`, 'Sales']
                  if (name === 'orders') return [value, 'Orders']
                  return [value, name]
                }}
              />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} name="sales" />
              <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#82ca9d" strokeWidth={2} name="orders" />
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>
      )}

      {reportData.categoryData.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Category Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
            <Pie
  data={reportData.categoryData as any}
  dataKey="value"
  nameKey="name"
  cx="50%"
  cy="50%"
  outerRadius={100}
  label={(props: any) =>
    `${props.name}: ${((props.percent || 0) * 100).toFixed(0)}%`
  }
>
                {reportData.categoryData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => `₹${Number(value).toLocaleString()}`} />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      )}

      {reportData.salesData.length === 0 && reportData.categoryData.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-400">No sales data available for the selected period</p>
        </div>
      )}
    </SellerLayout>
  )
}

export default SalesReportPage