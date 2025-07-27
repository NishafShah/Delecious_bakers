import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  MessageSquare, 
  Settings, 
  LogOut, 
  DollarSign,
  TrendingUp,
  Menu,
  BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger
} from '@/components/ui/sidebar'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-toastify'
import { ProductsManagement } from '@/components/admin/ProductsManagement'
import { OrdersManagement } from '@/components/admin/OrdersManagement'
import { MessagesManagement } from '@/components/admin/MessagesManagement'
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard'

interface DashboardStats {
  totalOrders: number
  totalProducts: number
  totalMessages: number
  totalSales: number
}

const AdminSidebarContent = ({ activeSection, setActiveSection }: {
  activeSection: string
  setActiveSection: (section: string) => void
}) => {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/admin/login')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <Sidebar className="bg-slate-900 border-slate-700">
      <SidebarHeader>
        <div className="flex items-center space-x-2 px-4 py-2">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
            <Package className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white">Admin Panel</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem
              key={item.id}
              isActive={activeSection === item.id}
              onClick={() => setActiveSection(item.id)}
            >
              <item.icon className="w-4 h-4 mr-3 text-slate-400" />
              <span className="text-slate-200">{item.label}</span>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        
        <div className="mt-auto p-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-200 hover:bg-slate-800"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-3" />
            Sign Out
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}

const DashboardContent = ({ stats }: { stats: DashboardStats }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-600">Welcome back! Here's what's happening with your bakery.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Active inventory items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMessages}</div>
            <p className="text-xs text-muted-foreground">
              Customer inquiries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalSales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +8% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest customer orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium">Order #1234</p>
                  <p className="text-sm text-slate-600">2 items • $45.99</p>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Completed
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium">Order #1235</p>
                  <p className="text-sm text-slate-600">1 item • $12.50</p>
                </div>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                  Pending
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Popular Products</CardTitle>
            <CardDescription>Best selling items this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Chocolate Croissant</p>
                  <p className="text-sm text-slate-600">45 sold</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">$675.00</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Blueberry Muffin</p>
                  <p className="text-sm text-slate-600">32 sold</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">$384.00</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-20 flex flex-col items-center justify-center space-y-2">
              <Package className="w-6 h-6" />
              <span>Add New Product</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <ShoppingCart className="w-6 h-6" />
              <span>View Orders</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <BarChart3 className="w-6 h-6" />
              <span>View Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const SettingsManagement = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
        <p className="text-slate-600">Configure your bakery settings</p>
      </div>
      <Card>
        <CardContent className="p-8 text-center">
          <Settings className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Settings Coming Soon</h3>
          <p className="text-slate-600">Admin settings and configuration options will be available soon.</p>
        </CardContent>
      </Card>
    </div>
  )
}

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState('dashboard')
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalProducts: 0,
    totalMessages: 0,
    totalSales: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/admin/login')
      return
    }

    fetchDashboardStats()
  }, [user, navigate])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)

      // Fetch orders count and total sales
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('total_amount')

      if (ordersError) throw ordersError

      // Fetch products count
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id')

      if (productsError) throw productsError

      // Fetch messages count
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('id')

      if (messagesError) throw messagesError

      const totalSales = orders?.reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0

      setStats({
        totalOrders: orders?.length || 0,
        totalProducts: products?.length || 0,
        totalMessages: messages?.length || 0,
        totalSales
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardContent stats={stats} />
      case 'analytics':
        return <AnalyticsDashboard />
      case 'products':
        return <ProductsManagement />
      case 'orders':
        return <OrdersManagement />
      case 'messages':
        return <MessagesManagement />
      case 'settings':
        return <SettingsManagement />
      default:
        return <DashboardContent stats={stats} />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-slate-50">
        <AdminSidebarContent 
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white border-b border-slate-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <SidebarTrigger>
                  <Menu className="h-6 w-6" />
                </SidebarTrigger>
                <h2 className="text-xl font-semibold text-slate-900">
                  Delicious Bakes Admin
                </h2>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-sm text-slate-600">
                  Welcome, {user?.email}
                </span>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-6">
            {renderContent()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
