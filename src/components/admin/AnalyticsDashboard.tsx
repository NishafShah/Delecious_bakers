import React, { useState, useEffect } from 'react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Users,
  Calendar,
  BarChart3
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-toastify'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'

interface SalesData {
  date: string
  sales: number
  orders: number
}

interface ProductSales {
  name: string
  sales: number
  quantity: number
  revenue: number
}

interface OrderStatus {
  status: string
  count: number
  percentage: number
}

interface AnalyticsData {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  totalCustomers: number
  revenueGrowth: number
  ordersGrowth: number
  salesData: SalesData[]
  topProducts: ProductSales[]
  orderStatusData: OrderStatus[]
  monthlyRevenue: number
  weeklyRevenue: number
}

const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#f97316']

const MetricCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  format = 'number' 
}: {
  title: string
  value: number
  change?: number
  icon: React.ElementType
  format?: 'number' | 'currency' | 'percentage'
}) => {
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return `$${val.toFixed(2)}`
      case 'percentage':
        return `${val.toFixed(1)}%`
      default:
        return val.toLocaleString()
    }
  }

  const isPositive = change && change > 0
  const isNegative = change && change < 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(value)}</div>
        {change !== undefined && (
          <p className="text-xs text-muted-foreground flex items-center mt-1">
            {isPositive && <TrendingUp className="h-3 w-3 mr-1 text-green-600" />}
            {isNegative && <TrendingDown className="h-3 w-3 mr-1 text-red-600" />}
            <span className={isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : ''}>
              {change > 0 ? '+' : ''}{change.toFixed(1)}% from last month
            </span>
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    totalCustomers: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
    salesData: [],
    topProducts: [],
    orderStatusData: [],
    monthlyRevenue: 0,
    weeklyRevenue: 0
  })
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
      const startDate = startOfDay(subDays(new Date(), days))
      const endDate = endOfDay(new Date())

      // Fetch orders data
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            quantity,
            price,
            products (
              name
            )
          )
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())

      if (ordersError) throw ordersError

      // Fetch previous period for comparison
      const prevStartDate = startOfDay(subDays(startDate, days))
      const prevEndDate = endOfDay(subDays(endDate, days))

      const { data: prevOrders, error: prevOrdersError } = await supabase
        .from('orders')
        .select('total_amount')
        .gte('created_at', prevStartDate.toISOString())
        .lte('created_at', prevEndDate.toISOString())

      if (prevOrdersError) throw prevOrdersError

      // Calculate metrics
      const totalRevenue = orders?.reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0
      const totalOrders = orders?.length || 0
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

      const prevRevenue = prevOrders?.reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0
      const prevOrdersCount = prevOrders?.length || 0

      const revenueGrowth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0
      const ordersGrowth = prevOrdersCount > 0 ? ((totalOrders - prevOrdersCount) / prevOrdersCount) * 100 : 0

      // Get unique customers
      const uniqueCustomers = new Set(orders?.map(order => order.user_id)).size

      // Generate daily sales data
      const salesData: SalesData[] = []
      for (let i = days - 1; i >= 0; i--) {
        const date = subDays(new Date(), i)
        const dayStart = startOfDay(date)
        const dayEnd = endOfDay(date)
        
        const dayOrders = orders?.filter(order => {
          const orderDate = new Date(order.created_at)
          return orderDate >= dayStart && orderDate <= dayEnd
        }) || []

        const daySales = dayOrders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0)
        
        salesData.push({
          date: format(date, 'MMM dd'),
          sales: daySales,
          orders: dayOrders.length
        })
      }

      // Calculate top products
      const productSales: { [key: string]: ProductSales } = {}
      
      orders?.forEach(order => {
        order.order_items?.forEach(item => {
          const productName = item.products?.name || 'Unknown Product'
          if (!productSales[productName]) {
            productSales[productName] = {
              name: productName,
              sales: 0,
              quantity: 0,
              revenue: 0
            }
          }
          productSales[productName].quantity += item.quantity
          productSales[productName].revenue += item.price * item.quantity
          productSales[productName].sales += 1
        })
      })

      const topProducts = Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)

      // Calculate order status distribution
      const statusCounts: { [key: string]: number } = {}
      orders?.forEach(order => {
        statusCounts[order.status] = (statusCounts[order.status] || 0) + 1
      })

      const orderStatusData: OrderStatus[] = Object.entries(statusCounts).map(([status, count]) => ({
        status: status.charAt(0).toUpperCase() + status.slice(1),
        count,
        percentage: totalOrders > 0 ? (count / totalOrders) * 100 : 0
      }))

      // Calculate weekly and monthly revenue
      const weeklyRevenue = orders?.filter(order => {
        const orderDate = new Date(order.created_at)
        return orderDate >= subDays(new Date(), 7)
      }).reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0

      const monthlyRevenue = orders?.filter(order => {
        const orderDate = new Date(order.created_at)
        return orderDate >= subDays(new Date(), 30)
      }).reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0

      setAnalyticsData({
        totalRevenue,
        totalOrders,
        averageOrderValue,
        totalCustomers: uniqueCustomers,
        revenueGrowth,
        ordersGrowth,
        salesData,
        topProducts,
        orderStatusData,
        monthlyRevenue,
        weeklyRevenue
      })

    } catch (error) {
      console.error('Error fetching analytics data:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h2>
          <p className="text-slate-600">Track your bakery's performance and growth</p>
        </div>
        
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={analyticsData.totalRevenue}
          change={analyticsData.revenueGrowth}
          icon={DollarSign}
          format="currency"
        />
        <MetricCard
          title="Total Orders"
          value={analyticsData.totalOrders}
          change={analyticsData.ordersGrowth}
          icon={ShoppingCart}
        />
        <MetricCard
          title="Average Order Value"
          value={analyticsData.averageOrderValue}
          icon={BarChart3}
          format="currency"
        />
        <MetricCard
          title="Total Customers"
          value={analyticsData.totalCustomers}
          icon={Users}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Trend</CardTitle>
            <CardDescription>Daily sales and order volume</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData.salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'sales' ? `$${value}` : value,
                    name === 'sales' ? 'Sales' : 'Orders'
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#f59e0b" 
                  fill="#f59e0b" 
                  fillOpacity={0.3}
                />
                <Area 
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
            <CardDescription>Current order status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.orderStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, percentage }) => `${status} (${percentage.toFixed(1)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analyticsData.orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
          <CardDescription>Best performing products by revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.topProducts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'revenue' ? `$${value}` : value,
                  name === 'revenue' ? 'Revenue' : 'Quantity Sold'
                ]}
              />
              <Bar dataKey="revenue" fill="#f59e0b" />
              <Bar dataKey="quantity" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Weekly Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${analyticsData.weeklyRevenue.toFixed(2)}
            </div>
            <p className="text-sm text-slate-600">Revenue this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${analyticsData.monthlyRevenue.toFixed(2)}
            </div>
            <p className="text-sm text-slate-600">Revenue this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Growth Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${analyticsData.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {analyticsData.revenueGrowth >= 0 ? '+' : ''}{analyticsData.revenueGrowth.toFixed(1)}%
            </div>
            <p className="text-sm text-slate-600">Revenue growth</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}